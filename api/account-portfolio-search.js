const cronManager = require('./cron');

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 25;
const CREDENTIAL_RE = /^0x[a-f0-9]{64}$/i;
const PUBKEY_RE = /^0x[a-f0-9]{96}$/i;
const DIGITS_RE = /^\d+$/;
const ADDRESS_PREFIX_RE = /^0x[a-f0-9]{1,40}$/i;
const FULL_ADDRESS_RE = /^0x[a-f0-9]{40}$/i;

const escapeSqlString = (value) => String(value).replace(/\\/g, '\\\\').replace(/'/g, "''");

const clampLimit = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return DEFAULT_LIMIT;
  return Math.min(Math.max(parsed, 1), MAX_LIMIT);
};

const splitBadges = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value || '')
    .split(',')
    .map((badge) => badge.trim())
    .filter(Boolean);
};

const normalizeRow = (row = {}) => ({
  resultType: row.result_type || row.resultType || 'address',
  address: row.address || '',
  displayLabel: row.display_label || row.displayLabel || row.address || '',
  subtitle: row.subtitle || '',
  badges: splitBadges(row.badges),
  validatorIndex: row.validator_index || null,
  withdrawalCredentials: row.withdrawal_credentials || null,
  score: Number.parseInt(row.score, 10) || 0
});

const mergeRows = (rows = [], limit = DEFAULT_LIMIT) => {
  const seen = new Map();

  for (const row of rows.map(normalizeRow)) {
    const resultType = String(row.resultType || '');
    const address = String(row.address || '').toLowerCase();
    const credential = String(row.withdrawalCredentials || '').toLowerCase();
    const isValidator = resultType.startsWith('validator') || resultType === 'credential';
    const validatorIndex = String(row.validatorIndex || '');
    const key = !isValidator && address
      ? `address:${address}`
      : (resultType === 'validator_credential' || resultType === 'credential'
        ? (credential ? `validator-credential:${credential}` : `validator:${validatorIndex}`)
        : (validatorIndex ? `validator:${validatorIndex}` : (credential ? `validator-credential:${credential}` : 'validator:')));

    const previous = seen.get(key);
    const badges = Array.from(new Set([...(previous?.badges || []), ...(row.badges || [])].filter(Boolean)));

    if (!previous || Number(row.score || 0) > Number(previous.score || 0)) {
      seen.set(key, {
        ...row,
        badges,
        address: address || row.address,
        withdrawalCredentials: credential || row.withdrawalCredentials
      });
    } else {
      previous.badges = badges;
    }
  }

  return Array.from(seen.values())
    .sort((a, b) => Number(b.score || 0) - Number(a.score || 0) ||
      String(a.displayLabel || '').localeCompare(String(b.displayLabel || '')))
    .slice(0, limit);
};

const queryClickHouse = async (sql) => {
  const rows = await cronManager.executeClickHouseQuery(sql);
  return Array.isArray(rows) ? rows : [];
};

const runValidatorExplorerSearch = async (normalizedQuery, queryEscaped, limit) => {
  const sql = `
    WITH
      '${queryEscaped}' AS q,
      credential_groups AS (
        SELECT
          withdrawal_credentials,
          min(validator_index) AS first_validator_index,
          count() AS validator_count,
          anyLast(withdrawal_address) AS withdrawal_address
        FROM dbt.api_consensus_validators_explorer_members_table
        GROUP BY withdrawal_credentials
      )
    SELECT
      result_type,
      address,
      display_label,
      subtitle,
      badges,
      validator_index,
      withdrawal_credentials,
      score
    FROM (
      SELECT
        'validator' AS result_type,
        lower(coalesce(m.withdrawal_address, groups.withdrawal_address, '')) AS address,
        concat('Validator ', toString(m.validator_index)) AS display_label,
        concat('Withdrawal address · ', lower(coalesce(m.withdrawal_address, groups.withdrawal_address, ''))) AS subtitle,
        'Validator' AS badges,
        toString(m.validator_index) AS validator_index,
        m.withdrawal_credentials AS withdrawal_credentials,
        multiIf(
          toString(m.validator_index) = q, 12000,
          lower(m.pubkey) = q, 11800,
          lower(coalesce(m.withdrawal_address, groups.withdrawal_address, '')) = q, 11600,
          lower(m.withdrawal_credentials) = q, 9800,
          0
        ) AS score
      FROM dbt.api_consensus_validators_explorer_members_table AS m
      LEFT JOIN credential_groups AS groups
        ON groups.withdrawal_credentials = m.withdrawal_credentials
      WHERE ${DIGITS_RE.test(normalizedQuery)
        ? 'toString(m.validator_index) = q'
        : (PUBKEY_RE.test(normalizedQuery)
          ? 'lower(m.pubkey) = q'
          : '(lower(m.withdrawal_credentials) = q OR lower(coalesce(m.withdrawal_address, groups.withdrawal_address, \'\')) = q)')}

      UNION ALL

      SELECT
        'validator_credential' AS result_type,
        lower(coalesce(withdrawal_address, '')) AS address,
        concat('Withdrawal credential · ', toString(validator_count), ' validators') AS display_label,
        concat(substring(withdrawal_credentials, 1, 10), '...', substring(withdrawal_credentials, length(withdrawal_credentials) - 5, 6)) AS subtitle,
        'Validators' AS badges,
        toString(first_validator_index) AS validator_index,
        withdrawal_credentials,
        multiIf(
          lower(withdrawal_credentials) = q, 12200,
          lower(coalesce(withdrawal_address, '')) = q, 10400,
          0
        ) AS score
      FROM credential_groups
      WHERE ${CREDENTIAL_RE.test(normalizedQuery)
        ? 'lower(withdrawal_credentials) = q'
        : (FULL_ADDRESS_RE.test(normalizedQuery) ? "lower(coalesce(withdrawal_address, '')) = q" : '0')}
    )
    WHERE score > 0
    ORDER BY score DESC, result_type ASC, validator_index ASC
    LIMIT ${limit * 4}
  `;

  return queryClickHouse(sql);
};

const nextPrefixBound = (value) => {
  const normalized = String(value || '');
  if (!normalized) return null;

  for (let index = normalized.length - 1; index >= 0; index -= 1) {
    const code = normalized.charCodeAt(index);
    if (code < 0xffff) {
      return `${normalized.slice(0, index)}${String.fromCharCode(code + 1)}`;
    }
  }

  return null;
};

const runIndexedSearch = async (normalizedQuery, queryEscaped, limit, options = {}) => {
  const upperBound = nextPrefixBound(normalizedQuery);
  const upperEscaped = upperBound ? escapeSqlString(upperBound) : '';
  const readLimit = Math.min(Math.max(limit * 12, 80), 240);
  const excludeValidators = Boolean(options.excludeValidators);
  const resultTypeFilter = excludeValidators
    ? "AND NOT startsWith(result_type, 'validator') AND result_type != 'credential'"
    : '';
  const rangeCondition = upperBound
    ? `search_key >= q AND search_key < '${upperEscaped}'`
    : `startsWith(search_key, q)`;

  const sql = `
    WITH '${queryEscaped}' AS q
    SELECT
      result_type,
      address,
      display_label,
      subtitle,
      badges,
      validator_index,
      withdrawal_credentials,
      score
    FROM (
      SELECT
        result_type,
        address,
        display_label,
        subtitle,
        badges,
        validator_index,
        withdrawal_credentials,
        multiIf(
          search_key = q, 10000 + score_base,
          startsWith(search_key, q), 7000 + score_base,
          0
        ) AS score
      FROM dbt.api_execution_account_search_index
      WHERE ${rangeCondition}
        ${resultTypeFilter}
      LIMIT ${readLimit}
    )
    WHERE score > 0
    ORDER BY score DESC, result_type ASC, display_label ASC
    LIMIT ${limit * 4}
  `;

  return queryClickHouse(sql);
};

const runFallbackSearch = async (
  normalizedQuery,
  queryEscaped,
  limit,
  includeValidatorRows = true,
  includeAccountRows = true
) => {
  const includeValidators = includeValidatorRows && (DIGITS_RE.test(normalizedQuery) ||
    CREDENTIAL_RE.test(normalizedQuery) ||
    PUBKEY_RE.test(normalizedQuery));
  const chunks = includeAccountRows ? [
    `
      SELECT *
      FROM (
      SELECT
        'circles' AS result_type,
        lower(avatar) AS address,
        display_name AS display_label,
        lower(avatar) AS subtitle,
        'Circles' AS badges,
        CAST(NULL, 'Nullable(String)') AS validator_index,
        CAST(NULL, 'Nullable(String)') AS withdrawal_credentials,
        multiIf(
          lower(avatar) = q, 9400,
          lower(display_name) = q, 9100,
          startsWith(lower(avatar), q), 7800,
          startsWith(lower(display_name), q), 7500,
          positionCaseInsensitiveUTF8(avatar, q) > 0, 5100,
          positionCaseInsensitiveUTF8(display_name, q) > 0, 5000,
          0
        ) AS score
      FROM dbt.api_execution_circles_v2_avatar_search
      )
      WHERE score > 0
    `
  ] : [];

  if (includeAccountRows && FULL_ADDRESS_RE.test(normalizedQuery)) {
    chunks.unshift(`
      SELECT
        'address' AS result_type,
        q AS address,
        q AS display_label,
        q AS subtitle,
        'Address' AS badges,
        CAST(NULL, 'Nullable(String)') AS validator_index,
        CAST(NULL, 'Nullable(String)') AS withdrawal_credentials,
        9400 AS score
    `);
  }

  if (includeValidators) {
    chunks.push(`
      SELECT *
      FROM (
      SELECT
        'validator_credential' AS result_type,
        lower(withdrawal_address) AS address,
        display_name AS display_label,
        concat(toString(validator_count), ' validators · ', withdrawal_credentials) AS subtitle,
        'Validators' AS badges,
        toString(first_validator_index) AS validator_index,
        withdrawal_credentials,
        multiIf(
          lower(withdrawal_credentials) = q, 9800,
          toString(first_validator_index) = q, 9600,
          lower(withdrawal_address) = q, 9400,
          startsWith(lower(withdrawal_credentials), q), 7600,
          startsWith(lower(withdrawal_address), q), 7400,
          positionCaseInsensitiveUTF8(display_name, q) > 0, 6200,
          positionCaseInsensitiveUTF8(withdrawal_credentials, q) > 0, 5600,
          0
        ) AS score
      FROM dbt.api_consensus_validators_search
      )
      WHERE score > 0
    `);
  }

  if (chunks.length === 0) return [];

  const sql = `
    WITH '${queryEscaped}' AS q
    SELECT *
    FROM (
      ${chunks.join('\n      UNION ALL\n')}
    )
    ORDER BY score DESC, result_type ASC, display_label ASC
    LIMIT ${limit * 4}
  `;

  return queryClickHouse(sql);
};

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing API key'
    });
  }

  try {
    const rawQuery = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const limit = clampLimit(req.query.limit);

    if (!rawQuery) {
      return res.status(200).json({ results: [] });
    }

    const normalizedQuery = rawQuery.toLowerCase();
    const queryEscaped = escapeSqlString(normalizedQuery);
    const validatorIntent = DIGITS_RE.test(normalizedQuery) ||
      CREDENTIAL_RE.test(normalizedQuery) ||
      PUBKEY_RE.test(normalizedQuery);
    const addressPrefixIntent = ADDRESS_PREFIX_RE.test(normalizedQuery);
    const indexedOptions = {
      excludeValidators: addressPrefixIntent && !CREDENTIAL_RE.test(normalizedQuery) && !PUBKEY_RE.test(normalizedQuery)
    };

    let rows = [];
    try {
      rows = validatorIntent
        ? await runValidatorExplorerSearch(normalizedQuery, queryEscaped, limit)
        : await runIndexedSearch(normalizedQuery, queryEscaped, limit, indexedOptions);
      if (!validatorIntent && rows.length === 0 && !addressPrefixIntent) {
        rows = await runFallbackSearch(normalizedQuery, queryEscaped, limit);
      }
    } catch (error) {
      const message = error?.response?.data?.exception || error?.message || '';
      if (!/UNKNOWN_TABLE|Unknown table|doesn't exist|does not exist|MEMORY_LIMIT_EXCEEDED/i.test(message)) {
        console.warn('Account portfolio indexed search failed; using fallback search:', message);
      }
      try {
        rows = addressPrefixIntent && !validatorIntent
          ? []
          : (validatorIntent
            ? await runValidatorExplorerSearch(normalizedQuery, queryEscaped, limit)
            : await runFallbackSearch(normalizedQuery, queryEscaped, limit, true, !validatorIntent));
      } catch (fallbackError) {
        if (!validatorIntent) throw fallbackError;
        console.warn('Account portfolio validator fallback failed; retrying account-only search:', fallbackError?.message || fallbackError);
        rows = await runFallbackSearch(normalizedQuery, queryEscaped, limit, false);
      }
    }

    return res.status(200).json({
      results: mergeRows(rows, limit)
    });
  } catch (error) {
    console.error('Account portfolio search error:', error?.message || error);
    return res.status(500).json({
      error: 'ServerError',
      message: error?.message || 'Failed to search Account Portfolio'
    });
  }
};

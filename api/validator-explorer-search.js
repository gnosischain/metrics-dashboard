const cronManager = require('./cron');

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 20;

const escapeSqlString = (value) => String(value).replace(/\\/g, '\\\\').replace(/'/g, "''");

const clampLimit = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_LIMIT;
  }

  return Math.min(Math.max(parsed, 1), MAX_LIMIT);
};

const buildValidatorDisplayLabel = (row) => {
  const validatorIndex = row?.validator_index ? `Validator ${row.validator_index}` : 'Validator';
  const displayName = typeof row?.display_name === 'string' ? row.display_name.trim() : '';
  const groupSize = Number.parseInt(row?.group_size, 10);

  if (displayName && Number.isFinite(groupSize) && groupSize > 1) {
    return `${validatorIndex} · ${displayName}`;
  }

  if (displayName) {
    return `${validatorIndex} · ${displayName}`;
  }

  return validatorIndex;
};

const buildCredentialDisplayLabel = (row) => {
  const displayName = typeof row?.display_name === 'string' ? row.display_name.trim() : '';
  if (displayName) {
    return displayName;
  }

  const withdrawalCredentials = typeof row?.withdrawal_credentials === 'string'
    ? row.withdrawal_credentials
    : '';

  if (!withdrawalCredentials) {
    return 'Withdrawal credential';
  }

  return `${withdrawalCredentials.slice(0, 10)}...${withdrawalCredentials.slice(-6)}`;
};

const normalizeRow = (row = {}) => {
  const resultType = row.result_type === 'credential' ? 'credential' : 'validator';

  return {
    resultType,
    validator_index: row.validator_index || null,
    withdrawal_credentials: row.withdrawal_credentials || null,
    withdrawal_address: row.withdrawal_address || null,
    pubkey: row.pubkey || null,
    display_name: row.display_name || null,
    group_size: Number.parseInt(row.group_size, 10) || 0,
    first_validator_index: row.first_validator_index || null,
    displayLabel: resultType === 'credential'
      ? buildCredentialDisplayLabel(row)
      : buildValidatorDisplayLabel(row)
  };
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

    const searchQuery = `
      WITH
        '${queryEscaped}' AS q,
        credential_groups AS (
          SELECT
            withdrawal_credentials,
            min(validator_index) AS first_validator_index,
            count() AS group_size,
            anyLast(withdrawal_address) AS withdrawal_address
          FROM dbt.api_consensus_validators_explorer_members_table
          GROUP BY withdrawal_credentials
        )
      SELECT
        result_type,
        validator_index,
        withdrawal_credentials,
        withdrawal_address,
        pubkey,
        display_name,
        group_size,
        first_validator_index,
        score
      FROM (
        SELECT
          'validator' AS result_type,
          toString(m.validator_index) AS validator_index,
          m.withdrawal_credentials AS withdrawal_credentials,
          coalesce(m.withdrawal_address, groups.withdrawal_address, '') AS withdrawal_address,
          m.pubkey AS pubkey,
          '' AS display_name,
          coalesce(groups.group_size, 1) AS group_size,
          toString(coalesce(groups.first_validator_index, m.validator_index)) AS first_validator_index,
          multiIf(
            toString(m.validator_index) = q, 1200,
            lower(m.pubkey) = q, 1180,
            lower(coalesce(m.withdrawal_address, groups.withdrawal_address, '')) = q, 1160,
            -- An exact-match on withdrawal_credentials must NOT outrank the credential-grain
            -- row below (score 1100). Otherwise a user pasting a 32-byte credential gets 12
            -- per-validator matches and never sees the credential entry — the custom view
            -- then auto-selects the first validator and misroutes to "Validator mode".
            lower(m.withdrawal_credentials) = q, 980,
            positionCaseInsensitiveUTF8(toString(m.validator_index), q) > 0, 920,
            positionCaseInsensitiveUTF8(m.pubkey, q) > 0, 900,
            positionCaseInsensitiveUTF8(coalesce(m.withdrawal_address, groups.withdrawal_address, ''), q) > 0, 860,
            positionCaseInsensitiveUTF8(m.withdrawal_credentials, q) > 0, 700,
            0
          ) AS score
        FROM dbt.api_consensus_validators_explorer_members_table AS m
        LEFT JOIN credential_groups AS groups
          ON groups.withdrawal_credentials = m.withdrawal_credentials

        UNION ALL

        SELECT
          'credential' AS result_type,
          '' AS validator_index,
          groups.withdrawal_credentials AS withdrawal_credentials,
          coalesce(groups.withdrawal_address, '') AS withdrawal_address,
          '' AS pubkey,
          '' AS display_name,
          groups.group_size AS group_size,
          toString(groups.first_validator_index) AS first_validator_index,
          multiIf(
            lower(groups.withdrawal_credentials) = q, 1100,
            lower(coalesce(groups.withdrawal_address, '')) = q, 1040,
            positionCaseInsensitiveUTF8(groups.withdrawal_credentials, q) > 0, 820,
            positionCaseInsensitiveUTF8(coalesce(groups.withdrawal_address, ''), q) > 0, 780,
            0
          ) AS score
        FROM credential_groups AS groups
      )
      WHERE score > 0
      ORDER BY score DESC, if(result_type = 'validator', 0, 1) ASC, group_size DESC, validator_index ASC
      LIMIT ${limit}
    `;

    const rows = await cronManager.executeClickHouseQuery(searchQuery);

    return res.status(200).json({
      results: Array.isArray(rows) ? rows.map(normalizeRow) : []
    });
  } catch (error) {
    console.error('Validator explorer search error:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: error?.message || 'Failed to search validator explorer'
    });
  }
};

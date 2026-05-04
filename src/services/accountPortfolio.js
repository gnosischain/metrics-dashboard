import api from './api';
import metricsService from './metrics';
import {
  isEth1WithdrawalCredential,
  withdrawalAddressFromCredential,
} from '../components/AccountPortfolio.helpers';

const SEARCH_LIMIT = 12;
const SEARCH_RESOLVE_LIMIT = 20;
const SUBSTR_MIN = 2;

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const CREDENTIAL_RE = /^0x[a-fA-F0-9]{64}$/;
const PUBKEY_RE = /^0x[a-fA-F0-9]{96}$/;
const DIGITS_RE = /^\d+$/;
const ADDRESS_PREFIX_RE = /^0x[a-fA-F0-9]{1,40}$/;
const MIN_PORTFOLIO_DATE = '2020-01-01';

const normalizeAddress = (value) => {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return ADDRESS_RE.test(trimmed) ? trimmed.toLowerCase() : '';
};

const isPortfolioDate = (value) => {
  const date = String(value || '').slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= MIN_PORTFOLIO_DATE;
};

const toSearchResult = (row = {}) => ({
  resultType: row.resultType || row.result_type || 'address',
  address: row.address || '',
  displayLabel: row.displayLabel || row.display_label || row.address || row.search_key || '',
  subtitle: row.subtitle || '',
  badges: Array.isArray(row.badges)
    ? row.badges
    : String(row.badges || '').split(',').map((badge) => badge.trim()).filter(Boolean),
  validatorIndex: row.validatorIndex || row.validator_index || null,
  withdrawalCredentials: row.withdrawalCredentials || row.withdrawal_credentials || null,
  score: Number(row.score || row.score_base || 0)
});

export const normalizeAccountSelection = (result) => {
  if (!result) return null;

  const resultType = result.resultType || result.result_type || 'address';
  const isValidatorContext = String(resultType).startsWith('validator') || resultType === 'credential';
  const rawAddress = normalizeAddress(result.address || '');
  const withdrawalCredentials = result.withdrawalCredentials || result.withdrawal_credentials || null;
  const credentialWithdrawalAddress = isEth1WithdrawalCredential(withdrawalCredentials)
    ? withdrawalAddressFromCredential(withdrawalCredentials)
    : '';
  const explicitWithdrawalAddress = normalizeAddress(result.withdrawal_address || '');
  const withdrawalAddress = isValidatorContext
    ? (explicitWithdrawalAddress || credentialWithdrawalAddress || rawAddress)
    : (explicitWithdrawalAddress || credentialWithdrawalAddress);
  const address = isValidatorContext ? '' : rawAddress;

  return {
    address,
    sourceType: resultType,
    displayLabel: result.displayLabel || result.display_label || address || withdrawalAddress,
    validatorIndex: result.validatorIndex || result.validator_index || null,
    withdrawalCredentials,
    withdrawalAddress,
    preferredTab: resultType.startsWith('validator') || resultType === 'credential' ? 'validators' :
      resultType === 'circles' ? 'circles' :
      'overview',
    raw: result
  };
};

export const selectionFromRawInput = (value) => {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (!trimmed) return null;

  if (ADDRESS_RE.test(trimmed)) {
    return normalizeAccountSelection({
      resultType: 'address',
      address: trimmed.toLowerCase(),
      displayLabel: trimmed.toLowerCase(),
      badges: ['Address']
    });
  }

  if (CREDENTIAL_RE.test(trimmed)) {
    const withdrawalAddress = withdrawalAddressFromCredential(trimmed);
    return normalizeAccountSelection({
      resultType: 'validator_credential',
      address: '',
      withdrawalCredentials: trimmed.toLowerCase(),
      withdrawal_address: withdrawalAddress,
      displayLabel: 'Withdrawal credential',
      badges: ['Validator']
    });
  }

  if (DIGITS_RE.test(trimmed)) {
    return normalizeAccountSelection({
      resultType: 'validator',
      address: '',
      validatorIndex: trimmed,
      displayLabel: `Validator ${trimmed}`,
      badges: ['Validator']
    });
  }

  return null;
};

const looksLikeSearchIndexRow = (row = {}) =>
  row.search_key || row.result_type || row.display_label || row.withdrawal_credentials || row.validator_index;

const looksLikeProfileRow = (row = {}) =>
  row.address ||
  row.display_name ||
  row.total_balance_usd !== undefined ||
  row.tokens_held !== undefined ||
  row.is_safe !== undefined ||
  row.is_circles_avatar !== undefined;

const looksLikeLinkedEntityRow = (row = {}) =>
  row.root_address || row.entity_id || row.entity_address || row.relation || row.entity_type;

const rankSearchIndexRows = (query, rows = [], limit = SEARCH_LIMIT) => {
  const normalizedQuery = String(query || '').trim().toLowerCase();
  if (!normalizedQuery) return [];

  return rows
    .filter(looksLikeSearchIndexRow)
    .map((row) => {
      const searchKey = String(row.search_key || '').toLowerCase();
      const address = String(row.address || '').toLowerCase();
      const label = String(row.display_label || '').toLowerCase();
      const subtitle = String(row.subtitle || '').toLowerCase();
      const scoreBase = Number(row.score_base || 0);
      const score =
        searchKey === normalizedQuery ? 10000 + scoreBase :
        address === normalizedQuery ? 9500 + scoreBase :
        label === normalizedQuery ? 9000 + scoreBase :
        address.startsWith(normalizedQuery) ? 7600 + scoreBase :
        searchKey.startsWith(normalizedQuery) ? 7000 + scoreBase :
        label.startsWith(normalizedQuery) ? 6500 + scoreBase :
        address.includes(normalizedQuery) ? 5200 + scoreBase :
        searchKey.includes(normalizedQuery) ? 5000 + scoreBase :
        label.includes(normalizedQuery) ? 4500 + scoreBase :
        subtitle.includes(normalizedQuery) ? 3500 + scoreBase :
        0;

      return { ...toSearchResult(row), score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || String(a.displayLabel).localeCompare(String(b.displayLabel)))
    .slice(0, limit);
};

// Client-side substring scoring against the (address, display_name) index.
const filterAddressSearchRows = (rows, needle, limit) => {
  const n = String(needle || '').trim().toLowerCase();
  if (!n) return [];
  const out = [];
  for (const row of rows) {
    const addr = String(row.address || '').toLowerCase();
    const name = String(row.display_name || '').toLowerCase();
    if (!addr && !name) continue;
    const hitAddr = addr.includes(n);
    const hitName = name.includes(n);
    if (!hitAddr && !hitName) continue;
    const score =
      addr === n ? 9500 :
      name === n ? 9000 :
      addr.startsWith(n) ? 8000 :
      name.startsWith(n) ? 7000 :
      hitName ? 4500 :
      hitAddr ? 4000 :
      0;
    out.push({
      resultType: 'address',
      address: addr,
      displayLabel: row.display_name || row.address,
      subtitle: addr,
      badges: [],
      score,
    });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit);
};

const filterCirclesSearchRows = (rows, needle, limit) => {
  const n = String(needle || '').trim().toLowerCase();
  if (!n) return [];
  const out = [];
  for (const row of rows) {
    const avatar = String(row.avatar || '').toLowerCase();
    const name = String(row.display_name || '').toLowerCase();
    if (!avatar && !name) continue;
    const hitAvatar = avatar.includes(n);
    const hitName = name.includes(n);
    if (!hitAvatar && !hitName) continue;
    const score =
      avatar === n ? 9400 :
      name === n ? 9100 :
      avatar.startsWith(n) ? 7800 :
      name.startsWith(n) ? 7500 :
      hitName ? 5000 :
      hitAvatar ? 3800 :
      0;
    out.push({
      resultType: 'circles',
      address: avatar,
      displayLabel: row.display_name || `Circles ${avatar.slice(0, 10)}`,
      subtitle: avatar,
      badges: ['Circles'],
      score,
    });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit);
};

const validatorRowsToResults = (rows = []) => rows.map((r) => {
  const rawResultType = r.resultType || r.result_type;
  const resultType = rawResultType === 'credential' || rawResultType === 'validator_credential'
    ? 'validator_credential'
    : 'validator';
  const validatorIndex = r.validator_index ? String(r.validator_index) : null;
  const displayLabel = r.displayLabel ||
    (resultType === 'validator_credential' ? `Validator group · ${(r.withdrawal_credentials || '').slice(0, 10)}…` :
      `Validator #${validatorIndex || ''}`);
  return {
    resultType,
    address: r.withdrawal_address || '',
    displayLabel,
    subtitle: resultType === 'validator_credential'
      ? `${r.group_size || 1} validator${(r.group_size || 1) > 1 ? 's' : ''} · ${r.withdrawal_credentials || ''}`
      : `#${validatorIndex || ''} · ${r.withdrawal_address || r.withdrawal_credentials || ''}`,
    badges: resultType === 'validator_credential' ? ['Validator group'] : ['Validator'],
    validatorIndex,
    withdrawalCredentials: r.withdrawal_credentials || null,
    score: 9200,
  };
});

const resolverToSearchResult = (row, address) => {
  const badges = [];
  if (row.is_safe) badges.push('Safe');
  if (row.is_safe_owner) badges.push('Safe owner');
  if (row.is_circles_avatar) badges.push('Circles');
  if (row.is_gpay_wallet) badges.push('GPay');
  if (row.is_validator_withdrawal_address) badges.push('Validator');
  if (badges.length === 0) badges.push('Address');
  return {
    resultType: 'address',
    address: address.toLowerCase(),
    displayLabel: row.display_name || row.circles_name || address,
    subtitle: address,
    badges,
    score: 10500,
  };
};

class AccountPortfolioService {
  async getRows(metricId, params = {}) {
    const response = await metricsService.getMetricData(metricId, params);
    return Array.isArray(response?.data) ? response.data : [];
  }

  async getResolver(address) {
    if (!address) return null;
    const response = await metricsService.getMetricData('api_execution_address_resolver', {
      filterField: 'address',
      filterValue: address,
    });
    const rows = Array.isArray(response?.data) ? response.data : [];
    return rows.find(looksLikeProfileRow) || null;
  }

  async getProfile(address) {
    const normalized = normalizeAddress(address);
    if (!normalized) return null;

    try {
      const rows = await this.getRows('api_execution_account_profile_latest', {
        filterField: 'address',
        filterValue: normalized
      });

      const profileRow = rows.find(looksLikeProfileRow);
      if (profileRow) return profileRow;
    } catch (err) {
      // Missing dbt view — fall through to resolver.
    }

    return this.getResolver(normalized);
  }

  async getLinkedEntities(address) {
    const normalized = normalizeAddress(address);
    if (!normalized) return [];

    try {
      const rows = await this.getRows('api_execution_account_linked_entities_latest', {
        filterField: 'root_address',
        filterValue: normalized
      });
      return rows.filter(looksLikeLinkedEntityRow);
    } catch (err) {
      return [];
    }
  }

  async searchValidators(trimmed) {
    try {
      const response = await api.get('/validator-explorer-search', {
        q: trimmed,
        limit: 8,
      });
      const results = Array.isArray(response?.results) ? response.results : [];
      return validatorRowsToResults(results);
    } catch (err) {
      return [];
    }
  }

  async searchAddressIndex(trimmed, limit) {
    try {
      const rows = await this.getRows('api_execution_address_search');
      return filterAddressSearchRows(rows, trimmed, limit);
    } catch (err) {
      return [];
    }
  }

  async searchCirclesIndex(trimmed, limit) {
    try {
      const rows = await this.getRows('api_execution_circles_v2_avatar_search');
      return filterCirclesSearchRows(rows, trimmed, limit);
    } catch (err) {
      return [];
    }
  }

  async searchPortfolioIndex(trimmed, limit) {
    // Server-ranked index. Optional — returns [] when the dbt view or
    // serverless route is unavailable. Keep this server-side: the raw
    // address/search-index views are too large to fetch into the browser.
    try {
      const response = await api.get('/account-portfolio-search', {
        q: trimmed,
        limit,
      });
      const rows = Array.isArray(response?.results) ? response.results : [];
      return rows.map(toSearchResult);
    } catch (err) {
      return [];
    }
  }

  async searchResolverExact(trimmed) {
    if (!ADDRESS_RE.test(trimmed)) return [];
    const resolverRow = await this.getResolver(trimmed.toLowerCase()).catch(() => null);
    if (!resolverRow) return [];
    return [resolverToSearchResult(resolverRow, trimmed)];
  }

  async search(query, limit = SEARCH_LIMIT) {
    const trimmed = typeof query === 'string' ? query.trim() : '';
    if (!trimmed) return [];

    const isHex40 = ADDRESS_RE.test(trimmed);
    const isHex64 = CREDENTIAL_RE.test(trimmed);
    const isHex96 = PUBKEY_RE.test(trimmed);
    const isAddressPrefix = ADDRESS_PREFIX_RE.test(trimmed);
    const isDigits = DIGITS_RE.test(trimmed);
    const longEnough = trimmed.length >= SUBSTR_MIN;
    const shouldSearchValidators = isDigits || isHex64 || isHex96;
    const shouldSearchAccountIndexes = longEnough && !shouldSearchValidators;

    const tasks = [];

    if (shouldSearchAccountIndexes) {
      tasks.push(this.searchPortfolioIndex(trimmed, limit));
    }

    // Validator search is intent-aware: a generic 0x address prefix should
    // resolve wallets/Safes/Circles first, not unrelated validator pubkeys.
    if (shouldSearchValidators && !isAddressPrefix) {
      tasks.push(this.searchValidators(trimmed));
    }

    if (isHex40) {
      tasks.push(this.searchResolverExact(trimmed));
    }

    const settled = await Promise.allSettled(tasks);
    const merged = [];
    for (const entry of settled) {
      if (entry.status === 'fulfilled' && Array.isArray(entry.value)) {
        merged.push(...entry.value);
      }
    }

    // De-dupe by the strongest identifier we have:
    //  - validator index rows by validatorIndex; credential rows by withdrawalCredentials
    //  - everyone else: address (so the same wallet appearing from both the
    //    address index AND the resolver/Circles lookup collapses into one row
    //    with merged badges).
    const seen = new Map();
    for (const row of merged) {
      const resultType = row.resultType || row.result_type || '';
      const isValidatorRow = resultType === 'validator' || resultType === 'validator_credential' || resultType === 'credential';
      const addressKey = String(row.address || '').toLowerCase();
      const credentialKey = String(row.withdrawalCredentials || '').toLowerCase();
      const validatorIndexKey = String(row.validatorIndex || row.validator_index || '');
      const key = isValidatorRow
        ? (resultType === 'validator_credential' || resultType === 'credential'
          ? (credentialKey ? `vc|${credentialKey}` : `v|${validatorIndexKey}`)
          : (validatorIndexKey ? `v|${validatorIndexKey}` : (credentialKey ? `vc|${credentialKey}` : 'v|')))
        : (addressKey ? `a|${addressKey}` : `o|${resultType}|${String(row.displayLabel || '').toLowerCase()}`);
      const prev = seen.get(key);
      if (!prev || Number(prev.score || 0) < Number(row.score || 0)) {
        const badges = Array.from(new Set([...(prev?.badges || []), ...(row.badges || [])]));
        seen.set(key, { ...row, badges });
      } else if (prev) {
        prev.badges = Array.from(new Set([...(prev.badges || []), ...(row.badges || [])]));
      }
    }

    return Array.from(seen.values())
      .sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
      .slice(0, limit);
  }

  chooseBestMatch(query, results = []) {
    const normalizedQuery = typeof query === 'string' ? query.trim().toLowerCase() : '';
    if (!normalizedQuery || !Array.isArray(results) || results.length === 0) {
      return selectionFromRawInput(query);
    }

    if (ADDRESS_RE.test(normalizedQuery)) {
      return results.find((result) => String(result.address || '').toLowerCase() === normalizedQuery) ||
        selectionFromRawInput(normalizedQuery) ||
        results[0];
    }

    if (CREDENTIAL_RE.test(normalizedQuery)) {
      return results.find((result) =>
        String(result.withdrawalCredentials || result.withdrawal_credentials || '').toLowerCase() === normalizedQuery
      ) || results[0];
    }

    return results[0];
  }

  async resolveSearch(query) {
    const results = await this.search(query, SEARCH_RESOLVE_LIMIT);
    return this.chooseBestMatch(query, results);
  }

  async getActivitySummary(address) {
    const normalized = normalizeAddress(address);
    if (!normalized) return null;
    try {
      const rows = await this.getRows('api_execution_account_transaction_summary_latest', {
        filterField: 'address',
        filterValue: normalized
      });
      return rows.find((row) => row && (
        row.token_transfer_count !== undefined ||
        row.active_days !== undefined ||
        row.counterparty_count !== undefined
      )) || null;
    } catch (err) {
      return null;
    }
  }

  async getLatestTokenBalances(address) {
    const normalized = normalizeAddress(address);
    if (!normalized) return [];
    try {
      const rows = await this.getRows('api_execution_account_token_balances_latest', {
        filterField: 'address',
        filterValue: normalized
      });
      return rows.filter((row) => row && (
        row.token_address !== undefined ||
        row.symbol !== undefined ||
        row.balance_usd !== undefined
      ));
    } catch (err) {
      return [];
    }
  }

  async getBalanceHistory(address) {
    const normalized = normalizeAddress(address);
    if (!normalized) return [];
    // Try the (usually-broken) dbt view first so we keep prod-grade data when available.
    try {
      const rows = await this.getRows('api_execution_account_balance_history_daily', {
        filterField: 'address',
        filterValue: normalized
      });
      const usable = rows.filter((row) => row && row.total_balance_usd !== undefined && isPortfolioDate(row.date));
      if (usable.length > 0) return usable;
    } catch (err) {
      // fall through to the account holdings view.
    }
    try {
      const rows = await this.getRows('api_execution_account_balance_history_composed', {
        filterField: 'address',
        filterValue: normalized,
      });
      // Aggregate token-level rows client-side into daily totals.
      const byDate = new Map();
      for (const row of rows) {
        if (!row || !isPortfolioDate(row.date)) continue;
        const key = String(row.date);
        const bucket = byDate.get(key) || { date: row.date, address: normalized, total_balance_usd: 0, tokens_held: 0, _tokens: new Set() };
        const usd = Number(row.balance_usd);
        if (!Number.isNaN(usd)) bucket.total_balance_usd += usd;
        if (row.token_address) bucket._tokens.add(row.token_address);
        byDate.set(key, bucket);
      }
      return Array.from(byDate.values())
        .map((b) => ({ date: b.date, address: b.address, total_balance_usd: b.total_balance_usd, tokens_held: b._tokens.size }))
        .sort((a, b) => String(a.date).localeCompare(String(b.date)));
    } catch (err) {
      return [];
    }
  }

  async getRoleFlags(address) {
    const normalized = normalizeAddress(address);
    if (!normalized) return null;
    try {
      const rows = await this.getRows('api_execution_account_role_flags_current', {
        filterField: 'address',
        filterValue: normalized,
      });
      return rows[0] || null;
    } catch (err) {
      return null;
    }
  }

  async getCirclesAvatarMetadata(address) {
    const normalized = normalizeAddress(address);
    if (!normalized) return null;
    try {
      const rows = await this.getRows('api_execution_circles_v2_avatar_metadata', {
        filterField: 'avatar',
        filterValue: normalized,
      });
      return rows[0] || null;
    } catch (err) {
      return null;
    }
  }

  async getHoldings(address) {
    const normalized = normalizeAddress(address);
    if (!normalized) return [];
    // Prefer the curated view when it exists.
    try {
      const primary = await this.getRows('api_execution_account_token_balances_latest', {
        filterField: 'address',
        filterValue: normalized,
      });
      const priced = primary.filter((row) => row && (row.symbol || row.token_address));
      if (priced.length > 0) return priced;
    } catch (err) {
      // fall through to composed source
    }
    try {
      const rows = await this.getRows('api_execution_account_holdings_latest', {
        filterField: 'address',
        filterValue: normalized,
      });
      const filtered = rows.filter((row) => row && (row.symbol || row.token_address));
      if (filtered.length > 0) return filtered;
    } catch (err) {
      return [];
    }
    return [];
  }

  async getMovements(address, { days = 90, includeGPay = true } = {}) {
    const normalized = normalizeAddress(address);
    if (!normalized) return [];
    const cutoffDate = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    const toDate = new Date().toISOString().slice(0, 10);

    const [tokenDiffs, gpayRows] = await Promise.all([
      this.getRows('api_execution_account_movements_composed', {
        from: cutoffDate,
        to: toDate,
        filterField: 'address',
        filterValue: normalized,
      }).catch(() => []),
      includeGPay
        ? this.getRows('api_execution_gpay_user_activity', {
            filterField: 'wallet_address',
            filterValue: normalized,
          }).catch(() => [])
        : Promise.resolve([]),
    ]);

    const tokenRows = (tokenDiffs || [])
      .filter((row) => row && row.date && row.symbol && (row.date >= cutoffDate || !cutoffDate))
      .map((row) => ({
        date: row.date,
        direction: Number(row.net_delta) >= 0 ? 'inflow' : 'outflow',
        source: 'transfer',
        symbol: row.symbol,
        amount: Math.abs(Number(row.net_delta) || 0),
        amount_usd: null,
        counterparty: null,
        token_class: row.token_class || null,
      }));

    const gpayMapped = (gpayRows || [])
      .filter((row) => row && row.date && row.date >= cutoffDate)
      .map((row) => ({
        date: row.date,
        direction: (row.action || row.direction || '').toString().toLowerCase() || row.direction || 'payment',
        source: 'gpay',
        symbol: row.symbol || 'EURe',
        amount: Math.abs(Number(row.amount) || 0),
        amount_usd: row.amount_usd != null ? Number(row.amount_usd) : null,
        counterparty: row.counterparty || null,
        action: row.action || null,
      }));

    return [...tokenRows, ...gpayMapped]
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .slice(0, 500);
  }

  async getSafes(address) {
    const normalized = normalizeAddress(address);
    if (!normalized) return [];
    try {
      const rows = await this.getRows('api_execution_account_safes_latest', {
        filterField: 'owner_address',
        filterValue: normalized,
      });
      return rows.filter((row) => row && row.safe_address);
    } catch (err) {
      return [];
    }
  }

  async getSafeOwners(address) {
    const normalized = normalizeAddress(address);
    if (!normalized) return [];
    try {
      const rows = await this.getRows('api_execution_safes_current_owners', {
        filterField: 'safe_address',
        filterValue: normalized,
      });
      return rows.filter((row) => row && row.owner_address);
    } catch (err) {
      return [];
    }
  }

  async getYields(address) {
    const normalized = normalizeAddress(address);
    if (!normalized) return { lp: [], lending: [], activity: [] };
    const [lp, lending, activity] = await Promise.all([
      this.getRows('api_execution_yields_user_lp_positions', {
        filterField: 'provider',
        filterValue: normalized,
      }).catch(() => []),
      this.getRows('api_execution_yields_user_lending_positions', {
        filterField: 'user_address',
        filterValue: normalized,
      }).catch(() => []),
      this.getRows('api_execution_yields_user_activity', {
        filterField: 'wallet_address',
        filterValue: normalized,
      }).catch(() => []),
    ]);
    return {
      lp: Array.isArray(lp) ? lp : [],
      lending: Array.isArray(lending) ? lending : [],
      activity: Array.isArray(activity) ? activity : [],
    };
  }

  async getGPayActivity(address, limit = 200) {
    const normalized = normalizeAddress(address);
    if (!normalized) return [];
    try {
      const rows = await this.getRows('api_execution_gpay_user_activity', {
        filterField: 'wallet_address',
        filterValue: normalized,
      });
      return rows.slice(0, limit);
    } catch (err) {
      return [];
    }
  }
}

const accountPortfolioService = new AccountPortfolioService();
export default accountPortfolioService;

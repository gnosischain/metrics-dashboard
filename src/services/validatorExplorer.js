import api from './api';
import metricsService from './metrics';

const SEARCH_LIMIT = 8;
const SEARCH_RESOLVE_LIMIT = 12;
const TIME_RANGE_TO_DAYS = {
  '7D': 7,
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365,
  '2Y': 730,
  ALL: null
};
const MIN_VALIDATOR_DATE = '2020-01-01';

const toIsoDateString = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().split('T')[0];
};

const normalizeDateValue = (value) => {
  if (typeof value === 'number' || (/^\d+$/.test(String(value || '').trim()) && String(value || '').trim().length >= 5)) {
    const daysSinceEpoch = Number(value);
    if (!Number.isFinite(daysSinceEpoch) || daysSinceEpoch <= 0) {
      return null;
    }

    const parsed = new Date(Date.UTC(1970, 0, 1));
    parsed.setUTCDate(parsed.getUTCDate() + daysSinceEpoch);
    return toIsoDateString(parsed);
  }

  return String(value || '').slice(0, 10);
};

const parseDate = (value) => {
  if (!value) {
    return null;
  }

  const normalized = normalizeDateValue(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized) || normalized < MIN_VALIDATOR_DATE) {
    return null;
  }

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toCommaSeparated = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(',');
  }

  return typeof value === 'string' ? value : '';
};

const isExactValidatorMatch = (result, normalizedQuery) => {
  if (!result || result.resultType !== 'validator') {
    return false;
  }

  return result.validator_index === normalizedQuery ||
    String(result.pubkey || '').toLowerCase() === normalizedQuery ||
    String(result.withdrawal_address || '').toLowerCase() === normalizedQuery;
};

const isExactCredentialMatch = (result, normalizedQuery) => {
  if (!result || result.resultType !== 'credential') {
    return false;
  }

  return String(result.withdrawal_credentials || '').toLowerCase() === normalizedQuery;
};

export const buildExplorerDateRange = (timeRange = 'ALL', historyStartDate = null, latestHistoryDate = null) => {
  const historyStart = parseDate(historyStartDate);
  const latestHistory = parseDate(latestHistoryDate) || new Date();
  const resolvedTo = toIsoDateString(latestHistory) || toIsoDateString(new Date());

  const days = TIME_RANGE_TO_DAYS[timeRange] ?? null;
  if (days === null) {
    const fallbackFrom = new Date(latestHistory);
    fallbackFrom.setDate(fallbackFrom.getDate() - 364);

    return {
      from: toIsoDateString(historyStart || fallbackFrom) || resolvedTo,
      to: resolvedTo
    };
  }

  const computedFrom = new Date(latestHistory);
  computedFrom.setDate(computedFrom.getDate() - (days - 1));

  const effectiveFrom = historyStart && historyStart > computedFrom
    ? historyStart
    : computedFrom;

  return {
    from: toIsoDateString(effectiveFrom) || resolvedTo,
    to: resolvedTo
  };
};

export const mergeTimeSeriesRows = ({
  aggregateRows = [],
  compareRows = [],
  valueField,
  aggregateLabel = 'All validators',
  compareLabel = (row) => `Validator ${row.validator_index}`,
  seriesField = 'series',
  dateField = 'date'
}) => {
  const output = [];

  aggregateRows.forEach((row) => {
    output.push({
      [dateField]: row[dateField],
      value: row[valueField] ?? 0,
      [seriesField]: aggregateLabel
    });
  });

  compareRows.forEach((row) => {
    output.push({
      [dateField]: row[dateField],
      value: row[valueField] ?? 0,
      [seriesField]: compareLabel(row)
    });
  });

  return output;
};

export const toExplorerStateFromSearchResult = (result) => {
  if (!result) {
    return null;
  }

  if (result.resultType === 'credential') {
    return {
      explorerMode: 'credential',
      withdrawalCredentials: result.withdrawal_credentials,
      compare: []
    };
  }

  return {
    explorerMode: 'validator',
    validatorIndex: result.validator_index,
    compare: []
  };
};

class ValidatorExplorerService {
  async getRows(metricId, params = {}) {
    const response = await metricsService.getMetricData(metricId, params);
    return Array.isArray(response?.data) ? response.data : [];
  }

  async search(query, limit = SEARCH_LIMIT) {
    const trimmedQuery = typeof query === 'string' ? query.trim() : '';
    if (!trimmedQuery) {
      return [];
    }

    const response = await api.get('/validator-explorer-search', {
      q: trimmedQuery,
      limit
    });

    return Array.isArray(response?.results) ? response.results : [];
  }

  chooseBestMatch(query, results = []) {
    const normalizedQuery = typeof query === 'string' ? query.trim().toLowerCase() : '';
    if (!normalizedQuery || !Array.isArray(results) || results.length === 0) {
      return null;
    }

    // A 32-byte withdrawal credential is a 66-char hex string (0x + 64 hex chars).
    // When the user pastes one, we must route to Credential mode — even if the backend
    // ranking drifts or a per-validator row scores higher by accident. Without this
    // guard, the view auto-selects the first validator in the credential's member list
    // and the whole group experience collapses to a single exited validator's blank profile.
    const isCredentialHex = /^0x[0-9a-f]{64}$/.test(normalizedQuery);
    if (isCredentialHex) {
      const exactCredential = results.find((result) => isExactCredentialMatch(result, normalizedQuery));
      if (exactCredential) {
        return exactCredential;
      }
      // Fall through if the backend didn't return a credential-grain row (shouldn't
      // happen with the search-ranking fix, but degrade gracefully).
    }

    const exactValidator = results.find((result) => isExactValidatorMatch(result, normalizedQuery));
    if (exactValidator) {
      return exactValidator;
    }

    const exactCredential = results.find((result) => isExactCredentialMatch(result, normalizedQuery));
    if (exactCredential) {
      return exactCredential;
    }

    return results[0] || null;
  }

  async resolveSearch(query) {
    const results = await this.search(query, SEARCH_RESOLVE_LIMIT);
    return this.chooseBestMatch(query, results);
  }

  async getGroupSummary(withdrawalCredentials) {
    const rows = await this.getRows('api_consensus_validator_group_summary', {
      filterField: 'withdrawal_credentials',
      filterValue: withdrawalCredentials
    });

    return rows[0] || null;
  }

  async getGroupMembers(withdrawalCredentials) {
    const response = await this.getGroupMembersPage(withdrawalCredentials);
    return Array.isArray(response?.data) ? response.data : [];
  }

  async getGroupMembersPage(withdrawalCredentials, {
    page = 1,
    pageSize = 25,
    sortField = 'balance_gno',
    sortDir = 'desc',
    search = ''
  } = {}) {
    return metricsService.getMetricData('api_consensus_validators_explorer_members_table', {
      filterField: 'withdrawal_credentials',
      filterValue: withdrawalCredentials,
      page,
      pageSize,
      sortField,
      sortDir,
      search,
      includeTotal: 'true'
    });
  }

  async getGroupHistory(metricId, withdrawalCredentials, dateRange) {
    return this.getRows(metricId, {
      from: dateRange?.from,
      to: dateRange?.to,
      filterField: 'withdrawal_credentials',
      filterValue: withdrawalCredentials
    });
  }

  async getCompareHistory(metricId, compare = [], dateRange) {
    const compareValue = toCommaSeparated(compare);
    if (!compareValue) {
      return [];
    }

    return this.getRows(metricId, {
      from: dateRange?.from,
      to: dateRange?.to,
      filterField: 'validator_index',
      filterValue: compareValue
    });
  }

  async getValidatorSummary(validatorIndex) {
    const rows = await this.getRows('api_consensus_validator_profile_summary', {
      filterField: 'validator_index',
      filterValue: validatorIndex
    });

    return rows[0] || null;
  }

  async getValidatorHistory(metricId, validatorIndex, dateRange) {
    return this.getRows(metricId, {
      from: dateRange?.from,
      to: dateRange?.to,
      filterField: 'validator_index',
      filterValue: validatorIndex
    });
  }
}

const validatorExplorerService = new ValidatorExplorerService();

export default validatorExplorerService;

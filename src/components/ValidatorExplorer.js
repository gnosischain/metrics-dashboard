import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Card from './Card';
import DashboardHeader from './DashboardHeader';
import TableWidget from './TableWidget';
import EChartsContainer from './charts/ChartTypes/EChartsContainer';
import validatorExplorerService, {
  buildExplorerDateRange,
  mergeTimeSeriesRows,
  toExplorerStateFromSearchResult
} from '../services/validatorExplorer';
import {
  EMPTY_VALIDATOR_EXPLORER_STATE,
  normalizeValidatorExplorerState
} from '../utils/validatorExplorerState';
import {
  formatPercentage,
  formatTruncateHex
} from '../utils/formatters';

// The custom Validator Explorer no longer exposes the per-tab time-range strip.
// An operator's history window is bounded by the data itself (first activation
// date -> last exit date); `buildExplorerDateRange('ALL', ...)` auto-scopes
// charts to that window. Per-user 1M/3M/6M buttons just re-slice the window
// into empty tails when the operator has exited - confusing UX. The strip is
// kept on the `Validator Explorer (grid)` tab where time ranges are still
// useful for live operators.
const AGGREGATE_LABEL = 'All validators';
const SERIES_COLORS = ['#0f766e', '#2563eb', '#ea580c', '#dc2626', '#7c3aed', '#0891b2'];
const MIN_VALIDATOR_DATE = '2020-01-01';
const DEFAULT_MEMBERS_PAGE_SIZE = 25;

const shortHex = (value, start = 10, end = 6) => {
  if (!value) return '-';
  const normalized = String(value);
  if (normalized.length <= start + end + 3) {
    return normalized;
  }

  return `${normalized.slice(0, start)}...${normalized.slice(-end)}`;
};

const normalizeDateValue = (value) => {
  if (typeof value === 'number' || (/^\d+$/.test(String(value || '').trim()) && String(value || '').trim().length >= 5)) {
    const daysSinceEpoch = Number(value);
    if (!Number.isFinite(daysSinceEpoch) || daysSinceEpoch <= 0) {
      return null;
    }

    const parsed = new Date(Date.UTC(1970, 0, 1));
    parsed.setUTCDate(parsed.getUTCDate() + daysSinceEpoch);
    return parsed.toISOString().split('T')[0];
  }

  return String(value || '').slice(0, 10);
};

const normalizeExplorerDate = (value) => {
  const date = normalizeDateValue(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= MIN_VALIDATOR_DATE ? date : null;
};

const firstValidExplorerDate = (...values) =>
  values.map(normalizeExplorerDate).find(Boolean) || null;

const getValidatorHistoryStartDate = (summary) =>
  firstValidExplorerDate(
    summary?.history_start_date,
    summary?.activation_date,
    summary?.first_activation_date
  );

const getGroupHistoryStartDate = (summary) =>
  firstValidExplorerDate(
    summary?.history_start_date,
    summary?.first_activation_date,
    summary?.last_activation_date
  );

const toDisplayDate = (value) => {
  const normalized = normalizeExplorerDate(value);
  if (!normalized) return '-';
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatSignedGno = (value) => {
  const numericValue = Number(value || 0);
  const prefix = numericValue > 0 ? '+' : '';
  return `${prefix}${formatGno(value)}`;
};

const formatGno = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '0 GNO';
  }

  return `${Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3
  })} GNO`;
};

const formatCount = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '0';
  }

  return Number(value).toLocaleString('en-US');
};

const getStatusTone = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized.includes('active')) return 'positive';
  if (normalized.includes('exit') || normalized.includes('withdraw')) return 'warning';
  if (normalized.includes('slash')) return 'negative';
  return 'neutral';
};

const formatStatus = (status) => {
  const normalized = String(status || '').trim();
  if (!normalized) return 'Unknown';
  return normalized.replace(/_/g, ' ');
};

const computeAgeLabel = (value) => {
  const normalized = normalizeExplorerDate(value);
  if (!normalized) return '-';
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return '-';

  const now = new Date();
  const diffMs = now.getTime() - parsed.getTime();
  const diffDays = Math.max(Math.floor(diffMs / (1000 * 60 * 60 * 24)), 0);

  if (diffDays < 30) {
    return `${diffDays}d`;
  }

  if (diffDays < 365) {
    return `${Math.floor(diffDays / 30)}m`;
  }

  return `${(diffDays / 365).toFixed(1)}y`;
};

const createSeriesColors = (labels = []) => {
  return labels.reduce((acc, label, index) => {
    acc[label] = SERIES_COLORS[index % SERIES_COLORS.length];
    return acc;
  }, {});
};

const getChartDateRangeLabel = (dateRange) => {
  if (!dateRange?.from || !dateRange?.to) return '';
  return `${dateRange.from} to ${dateRange.to}`;
};

const getSummarySearchValue = (state) => {
  if (!state?.explorerMode) return '';
  if (state.explorerMode === 'validator') {
    return state.validatorIndex || '';
  }
  return state.withdrawalCredentials || '';
};

const isCompareCellClick = (event) => {
  return Boolean(event?.target?.closest('.tabulator-cell[tabulator-field="_compare"]'));
};

const buildCompareLabel = (row) => `Validator ${row.validator_index}`;

const buildMetricCards = (items) => {
  return items.filter((item) => item && item.label);
};

const ExplorerMetricCard = ({ label, value, helper = '' }) => {
  return (
    <article className="validator-explorer-metric-card">
      <span className="validator-explorer-metric-label">{label}</span>
      <strong className="validator-explorer-metric-value">{value}</strong>
      {helper ? <span className="validator-explorer-metric-helper">{helper}</span> : null}
    </article>
  );
};

const EmptyState = ({ title, description, detail = '' }) => {
  return (
    <div className="validator-explorer-empty">
      <div className="validator-explorer-empty-card">
        <p className="validator-explorer-empty-eyebrow">Validator Explorer</p>
        <h2 className="validator-explorer-empty-title">{title}</h2>
        <p className="validator-explorer-empty-description">{description}</p>
        {detail ? <p className="validator-explorer-empty-detail">{detail}</p> : null}
      </div>
    </div>
  );
};

// Rotating-wheel spinner matching every other loading indicator in the
// dashboard (the `.loading-spinner` CSS class defined in
// `src/styles/features/_loading.css`). Used for the "we're fetching the
// credential's data" state - not for the empty "no search yet" state,
// which keeps the helpful EmptyState copy above.
const LoadingSpinner = () => (
  <div className="validator-explorer-empty">
    <div className="loading-indicator" role="status" aria-live="polite">
      <div className="loading-spinner" />
    </div>
  </div>
);

const ValidatorMemberDetail = ({
  member,
  isCompared = false,
  compareDisabled = false,
  onOpenValidator,
  onToggleCompare
}) => {
  if (!member) {
    return null;
  }

  const validatorIndex = String(member.validator_index || '');
  const details = [
    ['Status', formatStatus(member.status)],
    ['Current balance', formatGno(member.balance_gno)],
    ['Effective balance', formatGno(member.effective_balance_gno)],
    ['APR 30d', formatPercentage(Number(member.apy_30d || 0))],
    ['Income 30d', formatSignedGno(member.consensus_income_amount_30d_gno)],
    ['Proposer 30d', formatGno(member.proposer_reward_total_30d_gno)],
    ['Lifetime income', formatGno(member.total_income_estimated_gno)],
    ['Lifetime proposer rewards', formatGno(member.proposer_reward_total_lifetime_gno)],
    ['Proposed blocks', formatCount(member.proposed_blocks_count_lifetime)],
    ['Activated', toDisplayDate(member.activation_date)],
    ['Exited', toDisplayDate(member.exit_date)],
    ['Withdrawable', toDisplayDate(member.withdrawable_date)],
    ['Latest balance date', toDisplayDate(member.latest_date)]
  ];

  return (
    <aside className="validator-member-detail-card">
      <div className="validator-member-detail-header">
        <div>
          <span className="validator-explorer-eyebrow">Selected validator</span>
          <h4 className="validator-member-detail-title">Validator {validatorIndex || '-'}</h4>
        </div>
        <span className={`validator-explorer-status-pill validator-explorer-status-pill--${getStatusTone(member.status)}`}>
          {formatStatus(member.status)}
        </span>
      </div>

      <div className="validator-member-detail-identity">
        <div>
          <span className="validator-explorer-meta-label">Pubkey</span>
          <span className="validator-member-detail-value ap-mono" title={member.pubkey || ''}>
            {shortHex(member.pubkey, 16, 10)}
          </span>
        </div>
        <div>
          <span className="validator-explorer-meta-label">Withdrawal address</span>
          <span className="validator-member-detail-value ap-mono" title={member.withdrawal_address || ''}>
            {shortHex(member.withdrawal_address, 14, 8)}
          </span>
        </div>
        <div>
          <span className="validator-explorer-meta-label">Slashed</span>
          <span className="validator-member-detail-value">{Number(member.slashed) ? 'Yes' : 'No'}</span>
        </div>
      </div>

      <dl className="validator-member-detail-grid">
        {details.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <div className="validator-member-detail-actions">
        <button
          type="button"
          className="validator-explorer-action"
          onClick={() => onOpenValidator?.(validatorIndex)}
        >
          Open profile
        </button>
        <button
          type="button"
          className="validator-explorer-action validator-explorer-action--ghost"
          disabled={compareDisabled && !isCompared}
          onClick={() => onToggleCompare?.(member)}
        >
          {isCompared ? 'Remove compare' : 'Add compare'}
        </button>
      </div>
    </aside>
  );
};

const renderChartCard = ({
  title,
  subtitle,
  chartType,
  data,
  config,
  isDarkMode,
  height = '360px'
}) => {
  return (
    <Card title={title} subtitle={subtitle} chartType={chartType} isDarkMode={isDarkMode}>
      <EChartsContainer
        data={data}
        chartType={chartType}
        config={config}
        isDarkMode={isDarkMode}
        height={height}
      />
    </Card>
  );
};

const ValidatorExplorer = ({
  isDarkMode = false,
  tabConfig = null,
  dashboard = null,
  explorerState = EMPTY_VALIDATOR_EXPLORER_STATE,
  onExplorerStateChange,
  hideHeader = false
}) => {
  const normalizedState = useMemo(
    () => normalizeValidatorExplorerState(explorerState || EMPTY_VALIDATOR_EXPLORER_STATE),
    [explorerState]
  );
  // Time range is pinned to 'ALL' - the custom view no longer exposes a range
  // selector (see file header). `buildExplorerDateRange('ALL', history_start,
  // latest_history)` will auto-scope each chart to the validator/credential's
  // actual active window.
  const selectedTimeRange = 'ALL';
  const [searchValue, setSearchValue] = useState(getSummarySearchValue(normalizedState));
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [viewModel, setViewModel] = useState({
    summary: null,
    members: [],
    membersTotal: 0,
    charts: {},
    dateRange: null,
    historyFallback: null
  });
  const [selectedMemberIndex, setSelectedMemberIndex] = useState('');
  const [membersPager, setMembersPager] = useState({
    page: 1,
    pageSize: DEFAULT_MEMBERS_PAGE_SIZE,
    search: '',
    loading: false,
    error: ''
  });
  const [membersSearchInput, setMembersSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const searchContainerRef = useRef(null);

  useEffect(() => {
    setSearchValue(getSummarySearchValue(normalizedState));
    setSearchResults([]);
    setSearchError('');
  }, [normalizedState.explorerMode, normalizedState.validatorIndex, normalizedState.withdrawalCredentials]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!searchContainerRef.current?.contains(event.target)) {
        setSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    const trimmedQuery = searchValue.trim();
    if (!trimmedQuery || !searchFocused) {
      setSearchResults([]);
      setSearchLoading(false);
      return undefined;
    }

    let cancelled = false;
    const timerId = window.setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await validatorExplorerService.search(trimmedQuery);
        if (!cancelled) {
          setSearchResults(results);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Validator explorer search failed:', error);
          setSearchResults([]);
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [searchFocused, searchValue]);

  useEffect(() => {
    let cancelled = false;

    const loadExplorerData = async () => {
      if (!normalizedState.explorerMode) {
        setViewModel({
          summary: null,
          members: [],
          membersTotal: 0,
          charts: {},
          dateRange: null,
          historyFallback: null
        });
        setMembersPager({
          page: 1,
          pageSize: DEFAULT_MEMBERS_PAGE_SIZE,
          search: '',
          loading: false,
          error: ''
        });
        setMembersSearchInput('');
        setLoadError('');
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError('');

      try {
        if (normalizedState.explorerMode === 'validator') {
          const summary = await validatorExplorerService.getValidatorSummary(normalizedState.validatorIndex);
          if (!summary) {
            throw new Error('No validator data was found for that selection.');
          }

          const dateRange = buildExplorerDateRange(
            selectedTimeRange,
            getValidatorHistoryStartDate(summary),
            summary.latest_history_date || summary.latest_date
          );

          const [balanceRows, incomeRows, apyRows, proposerRows, flowRows] = await Promise.all([
            validatorExplorerService.getValidatorHistory(
              'api_consensus_validator_compare_balance_daily',
              normalizedState.validatorIndex,
              dateRange
            ),
            validatorExplorerService.getValidatorHistory(
              'api_consensus_validator_compare_income_daily',
              normalizedState.validatorIndex,
              dateRange
            ),
            validatorExplorerService.getValidatorHistory(
              'api_consensus_validator_compare_apy_daily',
              normalizedState.validatorIndex,
              dateRange
            ),
            validatorExplorerService.getValidatorHistory(
              'api_consensus_validator_compare_proposer_rewards_daily',
              normalizedState.validatorIndex,
              dateRange
            ),
            validatorExplorerService.getValidatorHistory(
              'api_consensus_validator_history_flows_daily',
              normalizedState.validatorIndex,
              dateRange
            )
          ]);

          let chartDateRange = dateRange;
          let chartBalanceRows = balanceRows;
          let chartIncomeRows = incomeRows;
          let chartApyRows = apyRows;
          let chartProposerRows = proposerRows;
          let chartFlowRows = flowRows;
          let historyFallback = null;
          const hasPrimaryDailyRows = [balanceRows, incomeRows, apyRows].some((rows) =>
            Array.isArray(rows) && rows.length > 0
          );

          if (!hasPrimaryDailyRows && summary.withdrawal_credentials) {
            const groupSummary = await validatorExplorerService.getGroupSummary(summary.withdrawal_credentials);
            if (groupSummary) {
              const groupDateRange = buildExplorerDateRange(
                selectedTimeRange,
                getGroupHistoryStartDate(groupSummary),
                groupSummary.latest_history_date
              );
              const [
                groupBalanceRows,
                groupIncomeRows,
                groupApyRows,
                groupProposerRows,
                groupFlowRows
              ] = await Promise.all([
                validatorExplorerService.getGroupHistory(
                  'api_consensus_validator_group_history_balance_daily',
                  summary.withdrawal_credentials,
                  groupDateRange
                ),
                validatorExplorerService.getGroupHistory(
                  'api_consensus_validator_group_history_income_daily',
                  summary.withdrawal_credentials,
                  groupDateRange
                ),
                validatorExplorerService.getGroupHistory(
                  'api_consensus_validator_group_history_apy_daily',
                  summary.withdrawal_credentials,
                  groupDateRange
                ),
                validatorExplorerService.getGroupHistory(
                  'api_consensus_validator_group_history_proposer_rewards_daily',
                  summary.withdrawal_credentials,
                  groupDateRange
                ),
                validatorExplorerService.getGroupHistory(
                  'api_consensus_validator_group_history_flows_daily',
                  summary.withdrawal_credentials,
                  groupDateRange
                )
              ]);

              const hasGroupDailyRows = [groupBalanceRows, groupIncomeRows, groupApyRows].some((rows) =>
                Array.isArray(rows) && rows.length > 0
              );
              if (hasGroupDailyRows) {
                chartDateRange = groupDateRange;
                chartBalanceRows = groupBalanceRows;
                chartIncomeRows = groupIncomeRows;
                chartApyRows = groupApyRows;
                chartProposerRows = groupProposerRows;
                chartFlowRows = groupFlowRows;
                historyFallback = {
                  type: 'credential_group',
                  validatorIndex: summary.validator_index,
                  withdrawalCredentials: summary.withdrawal_credentials,
                  groupSize: groupSummary.validator_count || groupSummary.connected_validator_count || summary.connected_validator_count
                };
              }
            }
          }

          const chartLabel = historyFallback
            ? 'Withdrawal credential group'
            : `Validator ${summary.validator_index}`;

          if (!cancelled) {
            setViewModel({
              summary,
              members: [],
              membersTotal: 0,
              charts: {
                balance: mergeTimeSeriesRows({
                  aggregateRows: chartBalanceRows,
                  valueField: 'balance_gno',
                  aggregateLabel: chartLabel
                }),
                income: mergeTimeSeriesRows({
                  aggregateRows: chartIncomeRows,
                  valueField: 'consensus_income_amount_gno',
                  aggregateLabel: chartLabel
                }),
                apy: mergeTimeSeriesRows({
                  aggregateRows: chartApyRows,
                  valueField: 'apy',
                  aggregateLabel: chartLabel
                }),
                proposer: mergeTimeSeriesRows({
                  aggregateRows: chartProposerRows,
                  valueField: 'proposer_reward_total_gno',
                  aggregateLabel: chartLabel
                }),
                flows: chartFlowRows
              },
              dateRange: chartDateRange,
              historyFallback
            });
          }

          return;
        }

        const [summary, membersResponse] = await Promise.all([
          validatorExplorerService.getGroupSummary(normalizedState.withdrawalCredentials),
          validatorExplorerService.getGroupMembersPage(normalizedState.withdrawalCredentials, {
            page: 1,
            pageSize: DEFAULT_MEMBERS_PAGE_SIZE,
            sortField: 'balance_gno',
            sortDir: 'desc'
          })
        ]);

        if (!summary) {
          throw new Error('No validators were found for that withdrawal credential.');
        }
        const members = Array.isArray(membersResponse?.data) ? membersResponse.data : [];
        const membersTotal = Number(membersResponse?.total || summary.validator_count || summary.connected_validator_count || members.length || 0);

        const dateRange = buildExplorerDateRange(
          selectedTimeRange,
          getGroupHistoryStartDate(summary),
          summary.latest_history_date
        );
        const allowedCompare = normalizedState.compare
          .map((value) => String(value || ''))
          .filter(Boolean)
          .slice(0, 5);

        const [
          balanceRows,
          incomeRows,
          apyRows,
          proposerRows,
          flowRows,
          compareBalanceRows,
          compareIncomeRows,
          compareApyRows,
          compareProposerRows
        ] = await Promise.all([
          validatorExplorerService.getGroupHistory(
            'api_consensus_validator_group_history_balance_daily',
            normalizedState.withdrawalCredentials,
            dateRange
          ),
          validatorExplorerService.getGroupHistory(
            'api_consensus_validator_group_history_income_daily',
            normalizedState.withdrawalCredentials,
            dateRange
          ),
          validatorExplorerService.getGroupHistory(
            'api_consensus_validator_group_history_apy_daily',
            normalizedState.withdrawalCredentials,
            dateRange
          ),
          validatorExplorerService.getGroupHistory(
            'api_consensus_validator_group_history_proposer_rewards_daily',
            normalizedState.withdrawalCredentials,
            dateRange
          ),
          validatorExplorerService.getGroupHistory(
            'api_consensus_validator_group_history_flows_daily',
            normalizedState.withdrawalCredentials,
            dateRange
          ),
          validatorExplorerService.getCompareHistory(
            'api_consensus_validator_compare_balance_daily',
            allowedCompare,
            dateRange
          ),
          validatorExplorerService.getCompareHistory(
            'api_consensus_validator_compare_income_daily',
            allowedCompare,
            dateRange
          ),
          validatorExplorerService.getCompareHistory(
            'api_consensus_validator_compare_apy_daily',
            allowedCompare,
            dateRange
          ),
          validatorExplorerService.getCompareHistory(
            'api_consensus_validator_compare_proposer_rewards_daily',
            allowedCompare,
            dateRange
          )
        ]);

        if (!cancelled) {
	          setViewModel({
	            summary,
	            members,
	            membersTotal,
            charts: {
              balance: mergeTimeSeriesRows({
                aggregateRows: balanceRows,
                compareRows: compareBalanceRows,
                valueField: 'balance_gno',
                aggregateLabel: AGGREGATE_LABEL,
                compareLabel: buildCompareLabel
              }),
              income: mergeTimeSeriesRows({
                aggregateRows: incomeRows,
                compareRows: compareIncomeRows,
                valueField: 'consensus_income_amount_gno',
                aggregateLabel: AGGREGATE_LABEL,
                compareLabel: buildCompareLabel
              }),
              apy: mergeTimeSeriesRows({
                aggregateRows: apyRows,
                compareRows: compareApyRows,
                valueField: 'apy',
                aggregateLabel: AGGREGATE_LABEL,
                compareLabel: buildCompareLabel
              }),
              proposer: mergeTimeSeriesRows({
                aggregateRows: proposerRows,
                compareRows: compareProposerRows,
                valueField: 'proposer_reward_total_gno',
                aggregateLabel: AGGREGATE_LABEL,
                compareLabel: buildCompareLabel
              }),
              flows: flowRows
            },
	            dateRange,
	            historyFallback: null
	          });
	          setMembersPager({
	            page: 1,
	            pageSize: DEFAULT_MEMBERS_PAGE_SIZE,
	            search: '',
	            loading: false,
	            error: ''
	          });
	          setMembersSearchInput('');
	        }
	      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load validator explorer data:', error);
          setLoadError(error?.message || 'Failed to load validator explorer data.');
	          setViewModel({
	            summary: null,
	            members: [],
	            membersTotal: 0,
	            charts: {},
	            dateRange: null,
	            historyFallback: null
	          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadExplorerData();

    return () => {
      cancelled = true;
    };
  }, [
    normalizedState.compare.join(','),
    normalizedState.explorerMode,
    normalizedState.validatorIndex,
    normalizedState.withdrawalCredentials,
    selectedTimeRange
  ]);

  useEffect(() => {
    if (normalizedState.explorerMode !== 'credential') {
      setSelectedMemberIndex('');
      return;
    }

    const memberIndexes = (viewModel.members || [])
      .map((row) => String(row?.validator_index || ''))
      .filter(Boolean);

    setSelectedMemberIndex((previous) => {
      if (previous && memberIndexes.includes(previous)) {
        return previous;
      }
      return memberIndexes[0] || '';
    });
  }, [normalizedState.explorerMode, viewModel.members]);

  const handleSearchSubmit = useCallback(async (event) => {
    event.preventDefault();
    const trimmedQuery = searchValue.trim();
    if (!trimmedQuery) {
      setSearchError('');
      return;
    }

    setSearchLoading(true);
    setSearchError('');

    try {
      const result = await validatorExplorerService.resolveSearch(trimmedQuery);
      if (!result) {
        setSearchError('No validator or withdrawal credential matched that search.');
        return;
      }

      const nextState = toExplorerStateFromSearchResult(result);
      if (nextState && typeof onExplorerStateChange === 'function') {
        onExplorerStateChange(nextState);
      }
      setSearchFocused(false);
      setSearchResults([]);
    } catch (error) {
      console.error('Failed to resolve validator explorer search:', error);
      setSearchError('Search failed. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  }, [onExplorerStateChange, searchValue]);

  const handleSuggestionSelect = useCallback((result) => {
    const nextState = toExplorerStateFromSearchResult(result);
    if (nextState && typeof onExplorerStateChange === 'function') {
      onExplorerStateChange(nextState);
    }
    setSearchValue(result?.displayLabel || '');
    setSearchFocused(false);
    setSearchResults([]);
    setSearchError('');
  }, [onExplorerStateChange]);

  const handleOpenCredential = useCallback((withdrawalCredentials) => {
    if (!withdrawalCredentials || typeof onExplorerStateChange !== 'function') {
      return;
    }

    onExplorerStateChange({
      explorerMode: 'credential',
      withdrawalCredentials,
      compare: []
    });
  }, [onExplorerStateChange]);

  const handleOpenValidator = useCallback((validatorIndex) => {
    if (!validatorIndex || typeof onExplorerStateChange !== 'function') {
      return;
    }

    onExplorerStateChange({
      explorerMode: 'validator',
      validatorIndex: String(validatorIndex),
      compare: []
    });
  }, [onExplorerStateChange]);

  const handleInspectMember = useCallback((rowData) => {
    const validatorIndex = String(rowData?.validator_index || '');
    if (validatorIndex) {
      setSelectedMemberIndex(validatorIndex);
    }
  }, []);

  const handleMemberCellClick = useCallback((_event, cell) => {
    handleInspectMember(cell?.getRow?.().getData?.());
  }, [handleInspectMember]);

  const handleCompareSelectionChange = useCallback((rows = []) => {
    if (normalizedState.explorerMode !== 'credential' || typeof onExplorerStateChange !== 'function') {
      return;
    }

    onExplorerStateChange({
      explorerMode: 'credential',
      withdrawalCredentials: normalizedState.withdrawalCredentials,
      compare: rows
        .map((row) => String(row?.validator_index || ''))
        .filter(Boolean)
    });
  }, [
    normalizedState.explorerMode,
    normalizedState.withdrawalCredentials,
    onExplorerStateChange
  ]);

  const handleClearCompare = useCallback(() => {
    if (normalizedState.explorerMode !== 'credential' || typeof onExplorerStateChange !== 'function') {
      return;
    }

    onExplorerStateChange({
      explorerMode: 'credential',
      withdrawalCredentials: normalizedState.withdrawalCredentials,
      compare: []
    });
  }, [
    normalizedState.explorerMode,
    normalizedState.withdrawalCredentials,
    onExplorerStateChange
  ]);

  const selectedCompareIds = useMemo(() => {
    return normalizedState.compare
      .map((value) => String(value || ''))
      .filter(Boolean)
      .slice(0, 5);
  }, [normalizedState.compare]);

  const selectedMember = useMemo(() => {
    if (!selectedMemberIndex || !Array.isArray(viewModel.members)) {
      return null;
    }

    return viewModel.members.find((row) => String(row?.validator_index || '') === selectedMemberIndex) || null;
  }, [selectedMemberIndex, viewModel.members]);

  const selectedCompareRows = useMemo(() => {
    if (!Array.isArray(viewModel.members) || viewModel.members.length === 0) {
      return [];
    }

    const selectedValues = new Set(selectedCompareIds);
    return selectedCompareIds.map((validatorIndex) =>
      viewModel.members.find((row) => String(row.validator_index) === validatorIndex) ||
      { validator_index: validatorIndex }
    ).filter((row) => selectedValues.has(String(row.validator_index)));
  }, [selectedCompareIds, viewModel.members]);

  const handleToggleMemberCompare = useCallback((member) => {
    const validatorIndex = String(member?.validator_index || '');
    if (!validatorIndex ||
      normalizedState.explorerMode !== 'credential' ||
      typeof onExplorerStateChange !== 'function'
    ) {
      return;
    }

    const selectedValues = new Set(selectedCompareIds);
    if (selectedValues.has(validatorIndex)) {
      selectedValues.delete(validatorIndex);
    } else if (selectedValues.size < 5) {
      selectedValues.add(validatorIndex);
    }

    onExplorerStateChange({
      explorerMode: 'credential',
      withdrawalCredentials: normalizedState.withdrawalCredentials,
      compare: Array.from(selectedValues)
    });
  }, [
    normalizedState.explorerMode,
    normalizedState.withdrawalCredentials,
    onExplorerStateChange,
    selectedCompareIds
  ]);

  const compareSeriesLabels = useMemo(() => {
    return [AGGREGATE_LABEL, ...selectedCompareRows.map(buildCompareLabel)];
  }, [selectedCompareRows]);

  const lineSeriesColors = useMemo(() => createSeriesColors(compareSeriesLabels), [compareSeriesLabels]);
  const barSeriesColors = useMemo(() => createSeriesColors(compareSeriesLabels), [compareSeriesLabels]);

  const loadMembersPage = useCallback(async ({
    page = membersPager.page,
    pageSize = membersPager.pageSize,
    search = membersPager.search
  } = {}) => {
    if (!normalizedState.withdrawalCredentials) {
      return;
    }

    const requestedPage = Math.max(1, Number(page) || 1);
    const requestedPageSize = Math.max(1, Number(pageSize) || DEFAULT_MEMBERS_PAGE_SIZE);
    const nextSearch = String(search || '').trim();

    setMembersPager((previous) => ({
      ...previous,
      loading: true,
      error: ''
    }));

    try {
      const result = await validatorExplorerService.getGroupMembersPage(normalizedState.withdrawalCredentials, {
        page: requestedPage,
        pageSize: requestedPageSize,
        sortField: 'balance_gno',
        sortDir: 'desc',
        search: nextSearch
      });
      const rows = Array.isArray(result?.data) ? result.data : [];
      const total = Number(result?.total || rows.length || 0);
      const lastPage = Number(result?.lastPage || Math.max(1, Math.ceil(total / requestedPageSize)));

      setViewModel((previous) => ({
        ...previous,
        members: rows,
        membersTotal: total || rows.length,
      }));
      setSelectedMemberIndex((previous) => {
        if (previous && rows.some((row) => String(row?.validator_index || '') === previous)) {
          return previous;
        }
        return rows[0]?.validator_index ? String(rows[0].validator_index) : '';
      });
      setMembersPager({
        page: Math.min(requestedPage, lastPage),
        pageSize: requestedPageSize,
        search: nextSearch,
        loading: false,
        error: ''
      });
    } catch (error) {
      console.error('Failed to load validator members page:', error);
      setMembersPager((previous) => ({
        ...previous,
        loading: false,
        error: error?.message || 'Failed to load validators page.'
      }));
    }
  }, [
    membersPager.page,
    membersPager.pageSize,
    membersPager.search,
    normalizedState.withdrawalCredentials
  ]);

  const handleMembersSearchSubmit = useCallback((event) => {
    event.preventDefault();
    loadMembersPage({ page: 1, search: membersSearchInput });
  }, [loadMembersPage, membersSearchInput]);

  const handleClearMembersSearch = useCallback(() => {
    setMembersSearchInput('');
    loadMembersPage({ page: 1, search: '' });
  }, [loadMembersPage]);

  const membersLastPage = useMemo(() => (
    Math.max(1, Math.ceil((viewModel.membersTotal || 0) / (membersPager.pageSize || DEFAULT_MEMBERS_PAGE_SIZE)))
  ), [membersPager.pageSize, viewModel.membersTotal]);

  const membersRangeStart = viewModel.members.length > 0
    ? ((membersPager.page - 1) * membersPager.pageSize) + 1
    : 0;
  const membersRangeEnd = viewModel.members.length > 0
    ? membersRangeStart + viewModel.members.length - 1
    : 0;

  const handleMembersPageSizeChange = useCallback((event) => {
    loadMembersPage({
      page: 1,
      pageSize: Number(event.target.value) || DEFAULT_MEMBERS_PAGE_SIZE
    });
  }, [loadMembersPage]);

  const handleMembersPageChange = useCallback((nextPage) => {
    loadMembersPage({
      page: Math.max(1, Math.min(membersLastPage, nextPage))
    });
  }, [loadMembersPage, membersLastPage]);

  const canPageMembersBackward = membersPager.page > 1 && !membersPager.loading;
  const canPageMembersForward = membersPager.page < membersLastPage && !membersPager.loading;

  const groupMetricCards = useMemo(() => buildMetricCards([
    {
      label: 'Validators',
      value: formatCount(viewModel.summary?.validator_count),
      helper: `${formatCount(viewModel.summary?.active_count)} active`
    },
    {
      label: 'Exited / Slashed',
      value: `${formatCount(viewModel.summary?.exited_count)} / ${formatCount(viewModel.summary?.slashed_count)}`,
      helper: `${formatCount(viewModel.summary?.pending_count)} pending`
    },
    {
      label: 'Total Balance',
      value: formatGno(viewModel.summary?.balance_gno),
      helper: `Effective ${formatGno(viewModel.summary?.effective_balance_gno)}`
    },
    {
      label: 'Lifetime Income',
      value: formatGno(viewModel.summary?.total_income_estimated_gno),
      helper: `30d ${formatSignedGno(viewModel.summary?.consensus_income_amount_30d_gno)}`
    },
    {
      label: 'APR 30d',
      value: formatPercentage(Number(viewModel.summary?.apy_30d || 0)),
      helper: `Proposer 30d ${formatGno(viewModel.summary?.proposer_reward_total_30d_gno)}`
    },
    {
      label: 'Proposed Blocks',
      value: formatCount(viewModel.summary?.proposed_blocks_count_lifetime),
      helper: `Rewards ${formatGno(viewModel.summary?.proposer_reward_total_lifetime_gno)}`
    },
    {
      label: 'History Start',
      value: toDisplayDate(getGroupHistoryStartDate(viewModel.summary)),
      helper: `First activation ${toDisplayDate(viewModel.summary?.first_activation_date)}`
    }
  ]), [viewModel.summary]);

  const validatorMetricCards = useMemo(() => buildMetricCards([
    {
      label: 'Current Balance',
      value: formatGno(viewModel.summary?.balance_gno),
      helper: `Effective ${formatGno(viewModel.summary?.effective_balance_gno)}`
    },
    {
      label: 'Lifetime Income',
      value: formatGno(viewModel.summary?.total_income_estimated_gno),
      helper: `Age ${computeAgeLabel(firstValidExplorerDate(
        viewModel.summary?.activation_date,
        viewModel.summary?.history_start_date
      ))}`
    },
    {
      label: 'Income Today',
      value: formatSignedGno(viewModel.summary?.income_today_gno),
      helper: `1d ${formatSignedGno(viewModel.summary?.income_1d_gno)}`
    },
    {
      label: 'Income 7d / 30d',
      value: `${formatSignedGno(viewModel.summary?.income_7d_gno)} / ${formatSignedGno(viewModel.summary?.income_30d_gno)}`,
      helper: 'Consensus income'
    },
    {
      label: 'APR 7d / 30d',
      value: `${formatPercentage(Number(viewModel.summary?.apy_7d || 0))} / ${formatPercentage(Number(viewModel.summary?.apy_30d_window || 0))}`,
      helper: `365d ${formatPercentage(Number(viewModel.summary?.apy_365d || 0))}`
    },
    {
      label: 'Proposed Blocks',
      value: formatCount(viewModel.summary?.proposed_blocks_count_lifetime),
      helper: `Rewards ${formatGno(viewModel.summary?.proposer_reward_total_lifetime_gno)}`
    },
    {
      label: 'History Start',
      value: toDisplayDate(getValidatorHistoryStartDate(viewModel.summary)),
      helper: `Activated ${toDisplayDate(viewModel.summary?.activation_date)}`
    }
  ]), [viewModel.summary]);

	  const membersTableConfig = useMemo(() => ({
	    indexField: 'validator_index',
	    layout: 'fitColumns',
	    pagination: false,
	    selectableRows: 5,
	    selectedRowField: 'validator_index',
	    selectedRowValues: selectedCompareIds,
    onRowSelectionChange: handleCompareSelectionChange,
    onRowClick: (rowData, _row, event) => {
      if (isCompareCellClick(event)) {
        return;
      }
      handleInspectMember(rowData);
    },
	    searchFields: [],
    tabulatorConfig: {
      responsiveLayoutCollapseStartOpen: false,
      responsiveLayoutCollapseFormatter: (data) => {
        const list = document.createElement('div');
        list.className = 'validator-explorer-responsive-details';

        data.forEach((item) => {
          const row = document.createElement('div');
          row.className = 'validator-explorer-responsive-detail-row';

          const label = document.createElement('span');
          label.className = 'validator-explorer-responsive-detail-label';
          label.textContent = item.title;

          const value = document.createElement('span');
          value.className = 'validator-explorer-responsive-detail-value';
          if (typeof Node !== 'undefined' && item.value instanceof Node) {
            value.appendChild(item.value);
          } else {
            value.innerHTML = item.value;
          }

          row.appendChild(label);
          row.appendChild(value);
          list.appendChild(row);
        });

        return list.childElementCount ? list : '';
      },
      rowFormatter: (row) => {
        const rowData = row.getData();
        row.getElement().classList.toggle(
          'validator-member-row--active',
          String(rowData?.validator_index || '') === selectedMemberIndex
        );
      }
    },
    columns: [
      {
        field: '_details',
        title: '',
        width: 44,
        minWidth: 44,
        headerSort: false,
        resizable: false,
        hozAlign: 'center',
        formatter: 'responsiveCollapse',
        responsive: 0
      },
      {
        field: '_compare',
        title: '',
        width: 56,
        minWidth: 56,
        headerSort: false,
        hozAlign: 'center',
        formatter: 'rowSelection',
        responsive: 0,
        cellClick: (event, cell) => {
          event.stopPropagation();
          cell.getRow().toggleSelect();
        }
      },
      {
        field: 'validator_index',
        title: 'Index',
        sorter: 'number',
        width: 86,
        minWidth: 78,
        responsive: 0,
        cellClick: handleMemberCellClick
      },
      {
        field: 'status',
        title: 'Status',
        sorter: 'string',
        width: 120,
        minWidth: 112,
        responsive: 0,
        cellClick: handleMemberCellClick,
        formatter: (cell) => {
          const value = cell.getValue();
          return `<span class="validator-explorer-status-pill validator-explorer-status-pill--${getStatusTone(value)}">${formatStatus(value)}</span>`;
        }
      },
      {
        field: 'slashed',
        title: 'Slashed',
        sorter: 'number',
        width: 88,
        minWidth: 82,
        responsive: 8,
        cellClick: handleMemberCellClick,
        formatter: (cell) => (Number(cell.getValue()) ? 'Yes' : 'No')
      },
      {
        field: 'balance_gno',
        title: 'Balance',
        sorter: 'number',
        width: 116,
        minWidth: 106,
        responsive: 0,
        cellClick: handleMemberCellClick,
        formatter: (cell) => formatGno(cell.getValue())
      },
      {
        field: 'effective_balance_gno',
        title: 'Effective',
        sorter: 'number',
        width: 116,
        minWidth: 104,
        responsive: 4,
        cellClick: handleMemberCellClick,
        formatter: (cell) => formatGno(cell.getValue())
      },
      {
        field: 'apy_30d',
        title: 'APR 30d',
        sorter: 'number',
        width: 104,
        minWidth: 96,
        responsive: 2,
        cellClick: handleMemberCellClick,
        formatter: (cell) => formatPercentage(Number(cell.getValue() || 0))
      },
      {
        field: 'consensus_income_amount_30d_gno',
        title: 'Income 30d',
        sorter: 'number',
        width: 126,
        minWidth: 114,
        responsive: 3,
        cellClick: handleMemberCellClick,
        formatter: (cell) => formatSignedGno(cell.getValue())
      },
      {
        field: 'proposed_blocks_count_lifetime',
        title: 'Blocks',
        sorter: 'number',
        width: 96,
        minWidth: 86,
        responsive: 5,
        cellClick: handleMemberCellClick,
        formatter: (cell) => formatCount(cell.getValue())
      },
      {
        field: 'proposer_reward_total_lifetime_gno',
        title: 'Proposer Rewards',
        sorter: 'number',
        width: 148,
        minWidth: 132,
        responsive: 6,
        cellClick: handleMemberCellClick,
        formatter: (cell) => formatGno(cell.getValue())
      },
      {
        field: 'total_income_estimated_gno',
        title: 'Lifetime Income',
        sorter: 'number',
        width: 144,
        minWidth: 126,
        responsive: 7,
        cellClick: handleMemberCellClick,
        formatter: (cell) => formatGno(cell.getValue())
      },
      {
        field: 'activation_date',
        title: 'Activated',
        sorter: 'string',
        width: 120,
        minWidth: 108,
        responsive: 4,
        cellClick: handleMemberCellClick,
        formatter: (cell) => toDisplayDate(cell.getValue())
      },
      {
        field: 'exit_date',
        title: 'Exited',
        sorter: 'string',
        width: 116,
        minWidth: 104,
        responsive: 8,
        cellClick: handleMemberCellClick,
        formatter: (cell) => toDisplayDate(cell.getValue())
      },
      {
        field: 'withdrawal_address',
        title: 'Withdrawal Address',
        sorter: 'string',
        width: 160,
        minWidth: 140,
        responsive: 9,
        cellClick: handleMemberCellClick,
        formatter: (cell) => formatTruncateHex(cell.getValue())
      },
      {
        field: 'pubkey',
        title: 'Pubkey',
        sorter: 'string',
        width: 160,
        minWidth: 140,
        responsive: 10,
        cellClick: handleMemberCellClick,
        formatter: (cell) => formatTruncateHex(cell.getValue())
      }
    ]
  }), [
	    handleCompareSelectionChange,
	    handleInspectMember,
	    handleMemberCellClick,
	    selectedMemberIndex,
	    selectedCompareIds
	  ]);

  const searchPlaceholder = tabConfig?.searchPlaceholder || 'Search by validator index, pubkey, credential, or withdrawal address';
  const chartDateRangeLabel = getChartDateRangeLabel(viewModel.dateRange);
  const hasValidatorBalanceIncomeApyData = normalizedState.explorerMode === 'validator' && [
    viewModel.charts.balance,
    viewModel.charts.income,
    viewModel.charts.apy
  ].some((rows) => Array.isArray(rows) && rows.length > 0);
  const shouldShowValidatorHistoryNotice =
    normalizedState.explorerMode === 'validator' &&
    viewModel.summary &&
    viewModel.summary.withdrawal_credentials &&
    (viewModel.historyFallback || !hasValidatorBalanceIncomeApyData);
  const validatorHistoryNotice = viewModel.historyFallback
    ? `Validator ${viewModel.summary?.validator_index} has no rows in the per-validator daily balance/income/APY fact table. The charts below are the withdrawal-credential aggregate for ${shortHex(viewModel.historyFallback.withdrawalCredentials, 12, 8)} (${formatCount(viewModel.historyFallback.groupSize)} validators), which is why the credential view has plots while this validator index did not.`
    : `Validator ${viewModel.summary?.validator_index} returned no per-validator daily balance/income/APY rows for the selected history window.`;

  const validatorHero = viewModel.summary ? (
    <section className="validator-explorer-hero">
      <div className="validator-explorer-hero-main">
        <p className="validator-explorer-eyebrow">Validator mode</p>
        <h2 className="validator-explorer-hero-title">
          Validator {viewModel.summary.validator_index}
        </h2>
        <div className="validator-explorer-pill-row">
          <span className={`validator-explorer-status-pill validator-explorer-status-pill--${getStatusTone(viewModel.summary.status)}`}>
            {formatStatus(viewModel.summary.status)}
          </span>
          {Number(viewModel.summary.slashed) ? (
            <span className="validator-explorer-status-pill validator-explorer-status-pill--negative">Slashed</span>
          ) : null}
          <span className="validator-explorer-status-pill validator-explorer-status-pill--neutral">
            {computeAgeLabel(firstValidExplorerDate(
              viewModel.summary.activation_date,
              viewModel.summary.history_start_date
            ))} old
          </span>
        </div>
        <div className="validator-explorer-meta-grid">
          <div>
            <span className="validator-explorer-meta-label">Pubkey</span>
            <span className="validator-explorer-meta-value" title={viewModel.summary.pubkey || ''}>
              {shortHex(viewModel.summary.pubkey, 14, 8)}
            </span>
          </div>
          <div>
            <span className="validator-explorer-meta-label">Withdrawal address</span>
            <span className="validator-explorer-meta-value" title={viewModel.summary.withdrawal_address || ''}>
              {shortHex(viewModel.summary.withdrawal_address)}
            </span>
          </div>
          <div>
            <span className="validator-explorer-meta-label">Withdrawal credential</span>
            <span className="validator-explorer-meta-value" title={viewModel.summary.withdrawal_credentials || ''}>
              {shortHex(viewModel.summary.withdrawal_credentials, 14, 8)}
            </span>
          </div>
          <div>
            <span className="validator-explorer-meta-label">Activated</span>
            <span className="validator-explorer-meta-value">{toDisplayDate(viewModel.summary.activation_date)}</span>
          </div>
          <div>
            <span className="validator-explorer-meta-label">Exited</span>
            <span className="validator-explorer-meta-value">{toDisplayDate(viewModel.summary.exit_date)}</span>
          </div>
          <div>
            <span className="validator-explorer-meta-label">Withdrawable</span>
            <span className="validator-explorer-meta-value">{toDisplayDate(viewModel.summary.withdrawable_date)}</span>
          </div>
        </div>
      </div>
      <aside className="validator-explorer-related-card">
        <span className="validator-explorer-related-label">Related withdrawal group</span>
        <strong className="validator-explorer-related-value">
          {viewModel.summary.display_name || shortHex(viewModel.summary.withdrawal_credentials, 12, 8)}
        </strong>
        <span className="validator-explorer-related-helper">
          {formatCount(viewModel.summary.connected_validator_count)} connected validators
        </span>
        <button
          type="button"
          className="validator-explorer-action"
          onClick={() => handleOpenCredential(viewModel.summary.withdrawal_credentials)}
        >
          Open grouped view
        </button>
      </aside>
    </section>
  ) : null;

  const groupHero = viewModel.summary ? (
    <section className="validator-explorer-hero">
      <div className="validator-explorer-hero-main">
        <p className="validator-explorer-eyebrow">Withdrawal credential group</p>
        <h2 className="validator-explorer-hero-title">
          {viewModel.summary.display_name || shortHex(viewModel.summary.withdrawal_credentials, 14, 8)}
        </h2>
        <div className="validator-explorer-pill-row">
          <span className="validator-explorer-status-pill validator-explorer-status-pill--neutral">
            {formatCount(viewModel.summary.validator_count)} validators
          </span>
          <span className="validator-explorer-status-pill validator-explorer-status-pill--positive">
            {formatCount(viewModel.summary.active_count)} active
          </span>
          <span className="validator-explorer-status-pill validator-explorer-status-pill--warning">
            {formatCount(viewModel.summary.exited_count)} exited
          </span>
          {Number(viewModel.summary.slashed_count) ? (
            <span className="validator-explorer-status-pill validator-explorer-status-pill--negative">
              {formatCount(viewModel.summary.slashed_count)} slashed
            </span>
          ) : null}
        </div>
        <div className="validator-explorer-meta-grid">
          <div>
            <span className="validator-explorer-meta-label">Withdrawal credential</span>
            <span className="validator-explorer-meta-value" title={viewModel.summary.withdrawal_credentials || ''}>
              {shortHex(viewModel.summary.withdrawal_credentials, 18, 10)}
            </span>
          </div>
          <div>
            <span className="validator-explorer-meta-label">Withdrawal address</span>
            <span className="validator-explorer-meta-value" title={viewModel.summary.withdrawal_address || ''}>
              {shortHex(viewModel.summary.withdrawal_address)}
            </span>
          </div>
          <div>
            <span className="validator-explorer-meta-label">First validator</span>
            <span className="validator-explorer-meta-value">#{viewModel.summary.first_validator_index || '-'}</span>
          </div>
          <div>
            <span className="validator-explorer-meta-label">History start</span>
            <span className="validator-explorer-meta-value">{toDisplayDate(getGroupHistoryStartDate(viewModel.summary))}</span>
          </div>
          <div>
            <span className="validator-explorer-meta-label">First activation</span>
            <span className="validator-explorer-meta-value">{toDisplayDate(viewModel.summary.first_activation_date)}</span>
          </div>
          <div>
            <span className="validator-explorer-meta-label">Last activation</span>
            <span className="validator-explorer-meta-value">{toDisplayDate(viewModel.summary.last_activation_date)}</span>
          </div>
          <div>
            <span className="validator-explorer-meta-label">Last exit</span>
            <span className="validator-explorer-meta-value">{toDisplayDate(viewModel.summary.last_exit_date)}</span>
          </div>
        </div>
      </div>
    </section>
  ) : null;

  const emptyStateCopy = tabConfig?.emptyState || {};

  const chartSubtitle = chartDateRangeLabel
    ? `Loaded for ${chartDateRangeLabel}`
    : 'Lifetime-aware chart window';

  return (
    <div className="validator-explorer">
      {!hideHeader ? (
      <DashboardHeader dashboard={dashboard} tabConfig={tabConfig}>
        <div className="validator-explorer-toolbar">
          <form
            className="validator-explorer-search"
            onSubmit={handleSearchSubmit}
            ref={searchContainerRef}
          >
            <input
              type="search"
              value={searchValue}
              onChange={(event) => {
                setSearchValue(event.target.value);
                setSearchError('');
                setSearchFocused(true);
              }}
              onFocus={() => setSearchFocused(true)}
              className="validator-explorer-search-input"
              placeholder={searchPlaceholder}
              aria-label="Search validator explorer"
            />
            <button
              type="submit"
              className="validator-explorer-search-button"
              disabled={searchLoading}
            >
              {searchLoading ? 'Searching...' : 'Search'}
            </button>
            {searchFocused && (searchResults.length > 0 || searchLoading) ? (
              <div className="validator-explorer-search-results">
                {searchLoading && searchResults.length === 0 ? (
                  <div className="validator-explorer-search-result validator-explorer-search-result--muted">
                    Looking up validators...
                  </div>
                ) : null}
                {searchResults.map((result) => (
                  <button
                    type="button"
                    key={`${result.resultType}:${result.validator_index || result.withdrawal_credentials}`}
                    className="validator-explorer-search-result"
                    onClick={() => handleSuggestionSelect(result)}
                  >
                    <span className="validator-explorer-search-result-title">{result.displayLabel}</span>
                    <span className="validator-explorer-search-result-meta">
                      {result.resultType === 'credential'
                        ? `${shortHex(result.withdrawal_credentials, 12, 8)} - ${formatCount(result.group_size)} validators`
                        : `${result.withdrawal_address ? shortHex(result.withdrawal_address) : shortHex(result.pubkey, 12, 8)} - ${shortHex(result.withdrawal_credentials, 10, 6)}`}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </form>
        </div>
      </DashboardHeader>
      ) : null}

      {searchError ? (
        <div className="validator-explorer-inline-alert" role="status">
          {searchError}
        </div>
      ) : null}

      {!normalizedState.explorerMode ? (
        <EmptyState
          title={emptyStateCopy.title || 'Explore a validator or operator'}
          description={emptyStateCopy.description || 'Search by validator index, pubkey, withdrawal credential, or withdrawal address to load lifetime metrics and connected validators.'}
          detail="Group mode lets you compare up to five validators on top of the aggregate credential series."
        />
      ) : loading ? (
        <LoadingSpinner />
      ) : loadError ? (
        <EmptyState
          title={emptyStateCopy.emptyResultsTitle || 'No validator data found'}
          description={emptyStateCopy.emptyResultsDescription || 'Check the search input and try again.'}
          detail={loadError}
        />
      ) : normalizedState.explorerMode === 'validator' ? (
        <div className="validator-explorer-body">
          {validatorHero}

          <section className="validator-explorer-metric-grid">
            {validatorMetricCards.map((item) => (
              <ExplorerMetricCard
                key={item.label}
                label={item.label}
                value={item.value}
                helper={item.helper}
              />
            ))}
          </section>

          {shouldShowValidatorHistoryNotice ? (
            <div className="validator-explorer-inline-alert validator-explorer-inline-alert--info" role="status">
              {validatorHistoryNotice}
            </div>
          ) : null}

          <section className="validator-explorer-chart-grid">
            {renderChartCard({
              title: 'Balance history',
              subtitle: chartSubtitle,
              chartType: 'line',
              data: viewModel.charts.balance || [],
              config: {
                xField: 'date',
                yField: 'value',
                seriesField: 'series',
                isTimeSeries: true,
                smooth: true,
                lineWidth: 2,
                format: 'formatNumberWithGNO',
                enableZoom: true
              },
              isDarkMode
            })}
            {renderChartCard({
              title: 'Consensus income',
              subtitle: chartSubtitle,
              chartType: 'bar',
              data: viewModel.charts.income || [],
              config: {
                xField: 'date',
                yField: 'value',
                seriesField: 'series',
                isTimeSeries: true,
                format: 'formatNumberWithGNO',
                stacked: false,
                enableZoom: true
              },
              isDarkMode
            })}
            {renderChartCard({
              title: 'APR history',
              subtitle: chartSubtitle,
              chartType: 'line',
              data: viewModel.charts.apy || [],
              config: {
                xField: 'date',
                yField: 'value',
                seriesField: 'series',
                isTimeSeries: true,
                smooth: true,
                format: 'formatPercentage',
                enableZoom: true
              },
              isDarkMode
            })}
            {renderChartCard({
              title: 'Proposer rewards',
              subtitle: chartSubtitle,
              chartType: 'bar',
              data: viewModel.charts.proposer || [],
              config: {
                xField: 'date',
                yField: 'value',
                seriesField: 'series',
                isTimeSeries: true,
                format: 'formatNumberWithGNO',
                stacked: false,
                enableZoom: true
              },
              isDarkMode
            })}
          </section>

          <section className="validator-explorer-chart-grid validator-explorer-chart-grid--full">
            {renderChartCard({
              title: 'Deposits, withdrawals, and consolidations',
              subtitle: chartSubtitle,
              chartType: 'bar',
              data: viewModel.charts.flows || [],
              config: {
                xField: 'date',
                yField: 'amount_gno',
                seriesField: 'label',
                isTimeSeries: true,
                format: 'formatNumberWithGNO',
                stacked: true,
                enableZoom: true
              },
              isDarkMode,
              height: '340px'
            })}
          </section>
        </div>
      ) : (
        <div className="validator-explorer-body">
          {groupHero}

          <section className="validator-explorer-metric-grid">
            {groupMetricCards.map((item) => (
              <ExplorerMetricCard
                key={item.label}
                label={item.label}
                value={item.value}
                helper={item.helper}
              />
            ))}
          </section>

          {selectedCompareRows.length > 0 ? (
            <section className="validator-explorer-compare-bar">
              <div className="validator-explorer-compare-copy">
                <span className="validator-explorer-compare-label">Compare overlays</span>
                <div className="validator-explorer-compare-chips">
                  {selectedCompareRows.map((row) => (
                    <span key={row.validator_index} className="validator-explorer-compare-chip">
                      Validator {row.validator_index}
                    </span>
                  ))}
                </div>
              </div>
              <button type="button" className="validator-explorer-action validator-explorer-action--ghost" onClick={handleClearCompare}>
                Clear compare
              </button>
            </section>
          ) : null}

          <section className="validator-explorer-chart-grid">
            {renderChartCard({
              title: 'Aggregate balance history',
              subtitle: chartSubtitle,
              chartType: 'line',
              data: viewModel.charts.balance || [],
              config: {
                xField: 'date',
                yField: 'value',
                seriesField: 'series',
                isTimeSeries: true,
                smooth: true,
                lineWidth: 2,
                format: 'formatNumberWithGNO',
                enableZoom: true,
                seriesColorsByName: lineSeriesColors
              },
              isDarkMode
            })}
            {renderChartCard({
              title: 'Consensus income',
              subtitle: chartSubtitle,
              chartType: 'bar',
              data: viewModel.charts.income || [],
              config: {
                xField: 'date',
                yField: 'value',
                seriesField: 'series',
                isTimeSeries: true,
                format: 'formatNumberWithGNO',
                stacked: false,
                enableZoom: true,
                seriesColorsByName: barSeriesColors
              },
              isDarkMode
            })}
            {renderChartCard({
              title: 'APR history',
              subtitle: chartSubtitle,
              chartType: 'line',
              data: viewModel.charts.apy || [],
              config: {
                xField: 'date',
                yField: 'value',
                seriesField: 'series',
                isTimeSeries: true,
                smooth: true,
                format: 'formatPercentage',
                enableZoom: true,
                seriesColorsByName: lineSeriesColors
              },
              isDarkMode
            })}
            {renderChartCard({
              title: 'Proposer rewards',
              subtitle: chartSubtitle,
              chartType: 'bar',
              data: viewModel.charts.proposer || [],
              config: {
                xField: 'date',
                yField: 'value',
                seriesField: 'series',
                isTimeSeries: true,
                format: 'formatNumberWithGNO',
                stacked: false,
                enableZoom: true,
                seriesColorsByName: barSeriesColors
              },
              isDarkMode
            })}
          </section>

          <section className="validator-explorer-chart-grid validator-explorer-chart-grid--full">
            {renderChartCard({
              title: 'Deposits, withdrawals, and consolidations',
              subtitle: chartSubtitle,
              chartType: 'bar',
              data: viewModel.charts.flows || [],
              config: {
                xField: 'date',
                yField: 'amount_gno',
                seriesField: 'label',
                isTimeSeries: true,
                format: 'formatNumberWithGNO',
                stacked: true,
                enableZoom: true
              },
              isDarkMode,
              height: '340px'
            })}
          </section>

	          <section className="validator-explorer-table-section">
	            <div className="validator-explorer-section-header">
	              <div>
	                <h3 className="validator-explorer-section-title">Connected validators</h3>
	                <p className="validator-explorer-section-description">
	                  Select up to five validators to overlay their balance, income, APR, and proposer-reward series on the group charts.
	                </p>
	              </div>
	              <div className="validator-explorer-section-meta">
	                <span>{formatCount(viewModel.membersTotal || viewModel.members.length)} validators</span>
	                <span>Compare up to 5</span>
	              </div>
	            </div>
	            <div className="validator-explorer-members-controls">
	              <form className="validator-explorer-members-search" onSubmit={handleMembersSearchSubmit}>
	                <input
	                  type="search"
	                  value={membersSearchInput}
	                  onChange={(event) => setMembersSearchInput(event.target.value)}
	                  placeholder="Search validator index, status, pubkey, or withdrawal address"
	                  aria-label="Search connected validators"
	                  disabled={membersPager.loading}
	                />
	                <button type="submit" className="validator-explorer-action validator-explorer-action--compact" disabled={membersPager.loading}>
	                  Search
	                </button>
	                {membersPager.search ? (
	                  <button
	                    type="button"
	                    className="validator-explorer-action validator-explorer-action--compact validator-explorer-action--ghost"
	                    onClick={handleClearMembersSearch}
	                    disabled={membersPager.loading}
	                  >
	                    Clear
	                  </button>
	                ) : null}
	              </form>
	              <div className="validator-explorer-members-pager" aria-label="Connected validators pagination">
	                <span>
	                  {membersRangeStart > 0
	                    ? `${formatCount(membersRangeStart)}-${formatCount(membersRangeEnd)} of ${formatCount(viewModel.membersTotal)}`
	                    : `0 of ${formatCount(viewModel.membersTotal)}`}
	                </span>
	                <label>
	                  Page size
	                  <select value={membersPager.pageSize} onChange={handleMembersPageSizeChange} disabled={membersPager.loading}>
	                    <option value="10">10</option>
	                    <option value="25">25</option>
	                    <option value="50">50</option>
	                  </select>
	                </label>
	                <button type="button" onClick={() => handleMembersPageChange(1)} disabled={!canPageMembersBackward}>
	                  First
	                </button>
	                <button type="button" onClick={() => handleMembersPageChange(membersPager.page - 1)} disabled={!canPageMembersBackward}>
	                  Prev
	                </button>
	                <span>Page {formatCount(membersPager.page)} of {formatCount(membersLastPage)}</span>
	                <button type="button" onClick={() => handleMembersPageChange(membersPager.page + 1)} disabled={!canPageMembersForward}>
	                  Next
	                </button>
	                <button type="button" onClick={() => handleMembersPageChange(membersLastPage)} disabled={!canPageMembersForward}>
	                  Last
	                </button>
	              </div>
	            </div>
	            {membersPager.error ? (
	              <div className="validator-explorer-inline-alert" role="status">
	                {membersPager.error}
	              </div>
	            ) : null}
	            {membersPager.loading ? (
	              <div className="validator-explorer-members-loading" role="status">
	                Loading validators...
	              </div>
	            ) : null}
	            <div className="validator-explorer-members-workbench">
	              <div className="validator-explorer-table-frame">
	                <TableWidget
                  data={viewModel.members}
                  config={membersTableConfig}
                  isDarkMode={isDarkMode}
                  height="auto"
                  title="Connected validators"
                />
              </div>
              <ValidatorMemberDetail
                member={selectedMember}
                isCompared={selectedMember ? selectedCompareIds.includes(String(selectedMember.validator_index)) : false}
                compareDisabled={selectedCompareIds.length >= 5}
                onOpenValidator={handleOpenValidator}
                onToggleCompare={handleToggleMemberCompare}
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default ValidatorExplorer;

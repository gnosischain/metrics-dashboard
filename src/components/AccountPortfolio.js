import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import DashboardHeader from './DashboardHeader';
import MetricWidget from './MetricWidget';
import MetricWidgetSkeleton from './MetricWidgetSkeleton';
import ValidatorExplorer from './ValidatorExplorer';
import accountPortfolioService, {
  normalizeAccountSelection,
  selectionFromRawInput,
} from '../services/accountPortfolio';
import {
  formatCurrencyCompact,
  formatNumberCompact,
} from '../utils/formatters';
import {
  formatTokenSymbol,
  getTokenIconUrl,
} from '../utils/tokenIcons.js';
import {
  accountPortfolioStateFromSelection,
  normalizeAccountPortfolioState,
} from '../utils/accountPortfolioState';
import { normalizeValidatorExplorerState } from '../utils/validatorExplorerState';
import {
  ADDRESS_PRIORITY,
  isAddress,
  isEth1WithdrawalCredential,
  pickAddress,
  withdrawalAddressFromCredential,
  withdrawalCredentialFromAddress,
} from './AccountPortfolio.helpers';

export { ADDRESS_PRIORITY, pickAddress } from './AccountPortfolio.helpers';

class SectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }

  static getDerivedStateFromError(err) {
    return { err };
  }

  componentDidCatch(err, info) {
    console.error('AccountPortfolio section crashed:', err?.message || err, info?.componentStack);
  }

  render() {
    if (this.state.err) {
      return (
        <div className="account-portfolio-inline-error">
          <strong>Could not render {this.props.label || 'section'}:</strong>{' '}
          <code>{String(this.state.err?.message || this.state.err)}</code>
        </div>
      );
    }

    return this.props.children;
  }
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const selectionFromPortfolioState = (state, fallbackValue = '') => {
  const normalized = normalizeAccountPortfolioState(state || {});

  if (normalized.validatorIndex) {
    return normalizeAccountSelection({
      resultType: 'validator',
      validatorIndex: normalized.validatorIndex,
      displayLabel: `Validator ${normalized.validatorIndex}`,
      badges: ['Validator'],
    });
  }

  if (normalized.withdrawalCredentials) {
    return normalizeAccountSelection({
      resultType: 'validator_credential',
      withdrawalCredentials: normalized.withdrawalCredentials,
      withdrawal_address: withdrawalAddressFromCredential(normalized.withdrawalCredentials),
      displayLabel: 'Withdrawal credential',
      badges: ['Validator'],
    });
  }

  if (normalized.address) {
    return selectionFromRawInput(normalized.address);
  }

  return selectionFromRawInput(fallbackValue || '');
};

const isValidatorSelection = (selection) => {
  const sourceType = String(selection?.sourceType || '').toLowerCase();
  return sourceType === 'validator' ||
    sourceType === 'validator_credential' ||
    sourceType === 'credential' ||
    Boolean(selection?.validatorIndex) ||
    Boolean(selection?.withdrawalCredentials);
};

const validatorExplorerStateFromSelection = (selection) => {
  if (!selection) return normalizeValidatorExplorerState({});
  if (selection.validatorIndex) {
    return normalizeValidatorExplorerState({
      explorerMode: 'validator',
      validatorIndex: selection.validatorIndex,
    });
  }
  if (selection.withdrawalCredentials) {
    return normalizeValidatorExplorerState({
      explorerMode: 'credential',
      withdrawalCredentials: selection.withdrawalCredentials,
      compare: [],
    });
  }
  return normalizeValidatorExplorerState({});
};

const accountSelectionFromValidatorExplorerState = (state) => {
  const normalized = normalizeValidatorExplorerState(state || {});
  if (normalized.explorerMode === 'validator') {
    return normalizeAccountSelection({
      resultType: 'validator',
      validatorIndex: normalized.validatorIndex,
      displayLabel: `Validator ${normalized.validatorIndex}`,
      badges: ['Validator'],
    });
  }
  if (normalized.explorerMode === 'credential') {
    return normalizeAccountSelection({
      resultType: 'validator_credential',
      withdrawalCredentials: normalized.withdrawalCredentials,
      displayLabel: 'Withdrawal credential',
      badges: ['Validator group'],
    });
  }
  return null;
};

const CIRCLES_METRICS = [
  { metricId: 'api_execution_circles_v2_avatar_personal_token_supply_latest', filterField: 'avatar', gridColumn: '1 / span 3', minHeight: 104, band: 'kpi' },
  { metricId: 'api_execution_circles_v2_avatar_personal_token_wrapped_latest', filterField: 'avatar', gridColumn: '4 / span 3', minHeight: 104, band: 'kpi' },
  { metricId: 'api_execution_circles_v2_avatar_total_balance_latest', filterField: 'avatar', gridColumn: '7 / span 3', minHeight: 104, band: 'kpi' },
  { metricId: 'api_execution_circles_v2_avatar_tokens_held_count', filterField: 'avatar', gridColumn: '10 / span 3', minHeight: 104, band: 'kpi' },
  { metricId: 'api_execution_circles_v2_avatar_trusts_given_latest', filterField: 'avatar', gridColumn: '1 / span 3', minHeight: 104, band: 'kpi' },
  { metricId: 'api_execution_circles_v2_avatar_trusts_received_latest', filterField: 'avatar', gridColumn: '4 / span 3', minHeight: 104, band: 'kpi' },
  { metricId: 'api_execution_circles_v2_avatar_balances_daily', filterField: 'avatar', gridColumn: '1 / span 12', minHeight: 450 },
  { metricId: 'api_execution_circles_v2_avatar_holdings_by_token', filterField: 'avatar', gridColumn: '1 / span 6', minHeight: 380 },
  { metricId: 'api_execution_circles_v2_avatar_token_distribution', filterField: 'avatar', gridColumn: '7 / span 6', minHeight: 380 },
  { metricId: 'api_execution_circles_v2_avatar_trusts_daily', filterField: 'avatar', gridColumn: '1 / span 6', minHeight: 450 },
  { metricId: 'api_execution_circles_v2_avatar_mint_activity_daily', filterField: 'avatar', gridColumn: '7 / span 6', minHeight: 450 },
  { metricId: 'api_execution_circles_v2_avatar_trust_network', filterField: 'avatar', gridColumn: '1 / span 6', minHeight: 560 },
  { metricId: 'api_execution_circles_v2_avatar_trust_relations', filterField: 'avatar', gridColumn: '7 / span 6', minHeight: 560 },
  { metricId: 'api_execution_circles_v2_avatar_metadata_history', filterField: 'avatar', gridColumn: '1 / span 12', minHeight: 360 },
];

const GNOSIS_APP_METRICS = [
  { metricId: 'api_execution_gnosis_app_user_profile_latest', filterField: 'address', gridColumn: '1 / span 12', minHeight: 260 },
  { metricId: 'api_execution_gnosis_app_user_activity_daily', filterField: 'address', gridColumn: '1 / span 12', minHeight: 520 },
];

const VALIDATOR_METRICS = [
  { metricId: 'api_consensus_validators_explorer_members_table', filterField: 'withdrawal_address', gridColumn: '1 / span 12', minHeight: 620 },
];

const ACCOUNT_PORTFOLIO_SECTIONS = [
  { id: 'overview', title: 'Overview', always: true },
  { id: 'balances', title: 'Balances', always: true },
  { id: 'activity', title: 'Activity', always: true },
  { id: 'safes', title: 'Safes', flag: 'hasSafe' },
  { id: 'yields', title: 'Yields', flag: 'hasYields' },
  { id: 'circles', title: 'Circles', flag: 'hasCircles' },
  { id: 'gpay', title: 'Gnosis Pay', flag: 'hasGpay' },
  { id: 'gnosis-app', title: 'Gnosis App', flag: 'hasGnosisApp' },
  { id: 'validators', title: 'Validators', flag: 'hasValidators' },
];

const STAGGER_INITIAL_COUNT = 2;
const STAGGER_BATCH_SIZE = 1;
const STAGGER_INTERVAL_MS = 1200;

// IntersectionObserver's default root is the viewport, but the dashboard
// renders inside a scrollable .dashboard-content container — so a default
// observer never sees scroll events and lazy widgets stay stuck on their
// skeleton forever. Walk ancestors to find the actual scrolling element.
const findScrollableAncestor = (node) => {
  if (!node || typeof window === 'undefined') return null;
  let current = node.parentElement;
  while (current && current !== document.body) {
    const style = window.getComputedStyle(current);
    const overflowY = style.overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && current.scrollHeight > current.clientHeight) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
};

const useStaggeredCount = (
  itemCount,
  resetKey,
  {
    enabled = false,
    initialCount = STAGGER_INITIAL_COUNT,
    batchSize = STAGGER_BATCH_SIZE,
    intervalMs = STAGGER_INTERVAL_MS,
  } = {}
) => {
  const safeCount = Math.max(0, Number(itemCount) || 0);
  const firstCount = Math.min(Math.max(1, initialCount), safeCount || 1);
  const [visibleCount, setVisibleCount] = useState(() => (enabled ? firstCount : safeCount));

  useEffect(() => {
    if (!enabled || safeCount <= firstCount) {
      setVisibleCount(safeCount);
      return undefined;
    }

    let nextCount = firstCount;
    setVisibleCount(nextCount);
    const timer = window.setInterval(() => {
      nextCount = Math.min(nextCount + batchSize, safeCount);
      setVisibleCount(nextCount);
      if (nextCount >= safeCount) {
        window.clearInterval(timer);
      }
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [enabled, safeCount, firstCount, batchSize, intervalMs, resetKey]);

  return visibleCount;
};

const getGridSpan = (item) => {
  const match = String(item?.gridColumn || '').match(/span\s+(\d+)/i);
  return match ? Math.max(1, Math.min(12, Number(match[1]) || 12)) : 12;
};

const getMetricClassName = (item, extra = '') => {
  const span = getGridSpan(item);
  return [
    'account-portfolio-metric',
    `account-portfolio-metric--span-${span}`,
    span >= 6 ? 'account-portfolio-metric--wide' : '',
    extra,
  ].filter(Boolean).join(' ');
};

const getSkeletonVariant = (item) => {
  if (item?.band === 'kpi' || Number(item?.minHeight || 0) <= 180) return 'number';
  if (/table|relations|history|positions|activity|metadata/i.test(String(item?.metricId || ''))) return 'table';
  return 'chart';
};

const PortfolioMetricPlaceholder = ({ item }) => (
  <div
    className={getMetricClassName(item, 'account-portfolio-metric--pending')}
    data-metric-id={item.metricId}
    style={{
      gridColumn: item.gridColumn,
      minHeight: item.minHeight ? `${item.minHeight}px` : undefined,
    }}
    aria-hidden="true"
  >
    <div className="metric-card account-portfolio-pending-card">
      <MetricWidgetSkeleton variant={getSkeletonVariant(item)} />
    </div>
  </div>
);

const shortIdentifier = (value) => {
  if (!value) return '';
  const str = String(value);
  if (str.length <= 16) return str;
  return `${str.slice(0, 10)}...${str.slice(-6)}`;
};

const hashColor = (seed) => {
  const str = String(seed || '');
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 52%)`;
};

const initialOf = (result) => {
  const label = String(result?.displayLabel || result?.address || '').trim();
  if (!label) return '?';
  const cleaned = label.replace(/^0x/i, '').replace(/^[^a-z0-9]+/i, '') || label;
  return cleaned.charAt(0).toUpperCase();
};

const subtitleFor = (result) => {
  if (!result) return '';
  if (result.resultType === 'validator_credential' || result.resultType === 'credential') {
    return shortIdentifier(result.withdrawalCredentials || result.subtitle || '');
  }
  if (result.resultType === 'validator') {
    const idx = result.validatorIndex ? `#${result.validatorIndex}` : 'Validator';
    return `${idx} · ${shortIdentifier(result.address || result.withdrawalCredentials)}`;
  }
  return shortIdentifier(result.address) || result.subtitle || '';
};

const toAddressList = (address, linkedEntities = [], profile = null) => {
  const values = new Set();
  if (isAddress(address) && address !== ZERO_ADDRESS) values.add(address.toLowerCase());
  if (isAddress(profile?.controlled_gpay_wallet)) values.add(profile.controlled_gpay_wallet.toLowerCase());

  linkedEntities.forEach((entity) => {
    const candidate = entity?.entity_address || entity?.entity_id;
    if (isAddress(candidate) && candidate.toLowerCase() !== ZERO_ADDRESS) {
      values.add(candidate.toLowerCase());
    }
  });

  return Array.from(values);
};

const buildHoldingsFromHistory = (balanceHistory = []) => {
  const tokenRows = (balanceHistory || []).filter((row) =>
    row && (row.token_address || row.symbol) && row.date &&
    Number(row.balance || row.total_balance_usd || row.balance_usd || 0) > 0
  );
  if (tokenRows.length === 0) return [];

  const latestDate = [...tokenRows]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))[0]?.date;

  return tokenRows
    .filter((row) => row.date === latestDate)
    .map((row) => ({
      ...row,
      balance_usd: row.balance_usd ?? row.total_balance_usd,
      token_class: row.token_class || 'token',
    }))
    .sort((a, b) => Number(b.balance_usd || 0) - Number(a.balance_usd || 0));
};

const buildEffectiveHoldings = (tokenBalances = [], balanceHistory = []) => {
  const realRows = (tokenBalances || []).filter((row) => row && (row.token_address || row.symbol));
  if (realRows.length === 0) return buildHoldingsFromHistory(balanceHistory);
  // Defensive guard: the upstream `int_execution_tokens_balances_daily` model
  // never writes balance=0 rows — when a token is fully transferred out, its
  // rows simply stop. A 90-day argMax-style query therefore reports stale
  // balances for tokens the wallet no longer holds. Keep only rows whose `date`
  // matches the most recent date the metric returned for this wallet.
  let mostRecent = '';
  for (const row of realRows) {
    const d = String(row.date || '');
    if (d > mostRecent) mostRecent = d;
  }
  if (!mostRecent) return realRows;
  return realRows.filter((row) => String(row.date || '') === mostRecent);
};

// Merge regular tokens, lending positions, and the aggregated Circles
// balance into a single rowset for the unified Balances tab. BalancesTab
// already sorts by balance_usd desc internally.
const buildUnifiedHoldings = (tokenRows = [], lendingRows = [], circlesBalance = null) => {
  const out = [...(tokenRows || [])];

  (lendingRows || []).forEach((row) => {
    if (!row) return;
    const balance = Number(row.balance ?? row.atoken_balance ?? row.deposit_amount ?? 0);
    const usd = Number(row.balance_usd ?? row.atoken_balance_usd ?? row.deposit_amount_usd ?? 0);
    if (!balance && !usd) return;
    const baseSymbol = row.symbol || row.underlying_symbol || '';
    const symbol = row.atoken_symbol || (baseSymbol ? `a${baseSymbol}` : 'aToken');
    const platform = row.platform || row.protocol || 'Lending';
    out.push({
      symbol,
      token_class: `Lending · ${platform}`,
      token_address: row.atoken_address || row.token_address || '',
      balance,
      balance_usd: Number.isFinite(usd) && usd > 0 ? usd : null,
      date: row.date || row.snapshot_date || null,
    });
  });

  if (circlesBalance) {
    const totalBalance = Number(circlesBalance.total_balance);
    const totalUsd = Number(circlesBalance.total_balance_usd);
    if ((Number.isFinite(totalBalance) && totalBalance > 0)
        || (Number.isFinite(totalUsd) && totalUsd > 0)) {
      out.push({
        symbol: 'CRC',
        token_class: 'Circles',
        token_address: circlesBalance.avatar || '',
        balance: Number.isFinite(totalBalance) ? totalBalance : null,
        balance_usd: Number.isFinite(totalUsd) && totalUsd > 0 ? totalUsd : null,
        date: circlesBalance.date || null,
      });
    }
  }

  return out;
};

const buildMovementActivitySummary = (movements = []) => {
  const rows = (movements || []).filter((row) => row && row.date);
  if (rows.length === 0) return {};

  const dates = rows.map((row) => String(row.date)).filter(Boolean).sort();
  const counterpartySet = new Set(rows
    .map((row) => String(row.counterparty || '').toLowerCase())
    .filter((value) => value && value !== 'null' && value !== 'undefined'));
  const tokenSet = new Set(rows
    .map((row) => String(row.token_address || row.symbol || '').toLowerCase())
    .filter(Boolean));

  return {
    first_activity_date: dates[0],
    last_activity_date: dates[dates.length - 1],
    active_days: new Set(dates).size,
    token_transfer_count: rows.reduce((sum, row) => sum + Number(row.transfer_count || 1), 0),
    inbound_transfer_count: rows.filter((row) => /in/.test(String(row.direction || '').toLowerCase())).length,
    outbound_transfer_count: rows.filter((row) => /out/.test(String(row.direction || '').toLowerCase())).length,
    counterparty_count: counterpartySet.size,
    token_count_moved: tokenSet.size,
  };
};

const buildSyntheticSafeLinks = (address, safesOwned = [], safeOwners = [], profile = null, roleFlags = null) => {
  const root = String(address || '').toLowerCase();
  const rows = [];

  const gpayWallet = String(
    profile?.controlled_gpay_wallet || roleFlags?.controls_gpay_wallet || ''
  ).toLowerCase();
  if (isAddress(gpayWallet) && gpayWallet !== root) {
    rows.push({
      root_address: root,
      entity_type: 'gpay_wallet',
      entity_id: gpayWallet,
      entity_address: gpayWallet,
      relation: 'controls_gpay_wallet',
      display_label: `Gnosis Pay ${shortIdentifier(gpayWallet)}`,
      value_count: 1,
      last_seen_at: profile?.last_active_date || null,
    });
  }

  // Inverse: when this account IS the GPay wallet, surface the controlling EOA owner.
  const gpayOwner = String(profile?.gpay_wallet_owner || roleFlags?.gpay_wallet_owner || '').toLowerCase();
  if (isAddress(gpayOwner) && gpayOwner !== root) {
    rows.push({
      root_address: root,
      entity_type: 'gpay_wallet_owner',
      entity_id: gpayOwner,
      entity_address: gpayOwner,
      relation: 'gpay_wallet_controlled_by',
      display_label: `Gnosis App owner ${shortIdentifier(gpayOwner)}`,
      value_count: 1,
      last_seen_at: profile?.last_active_date || null,
    });
  }

  (safesOwned || []).forEach((safe) => {
    const safeAddress = String(safe.safe_address || '').toLowerCase();
    if (!isAddress(safeAddress) || safeAddress === root) return;
    rows.push({
      root_address: root,
      entity_type: 'safe',
      entity_id: safeAddress,
      entity_address: safeAddress,
      relation: 'safe_owner_of',
      display_label: `Safe ${shortIdentifier(safeAddress)}`,
      value_count: 1,
      last_seen_at: safe.became_owner_at || safe.deployment_date || null,
      current_threshold: safe.current_threshold,
      current_owner_count: safe.current_owner_count,
    });
  });

  (safeOwners || []).forEach((owner) => {
    const ownerAddress = String(owner.owner_address || '').toLowerCase();
    if (!isAddress(ownerAddress) || ownerAddress === root) return;
    rows.push({
      root_address: root,
      entity_type: 'safe_owner',
      entity_id: ownerAddress,
      entity_address: ownerAddress,
      relation: 'safe_owned_by',
      display_label: `Owner ${shortIdentifier(ownerAddress)}`,
      value_count: 1,
      last_seen_at: owner.became_owner_at || null,
      current_threshold: owner.current_threshold,
    });
  });

  return rows;
};

const mergeLinkedRows = (primary = [], fallback = []) => {
  const seen = new Map();
  [...primary, ...fallback].forEach((row) => {
    const key = [
      String(row.relation || row.entity_type || 'linked'),
      String(row.entity_address || row.entity_id || '').toLowerCase(),
    ].join('|');
    if (!seen.has(key)) seen.set(key, row);
  });
  return Array.from(seen.values());
};

const MIN_ACCOUNT_DATE = '2020-01-01';

const normalizeDisplayDate = (dateValue) => {
  const date = String(dateValue || '').slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= MIN_ACCOUNT_DATE ? date : null;
};

const getAgeText = (dateValue) => {
  const displayDate = normalizeDisplayDate(dateValue);
  if (!displayDate) return '-';
  const date = new Date(displayDate);
  if (Number.isNaN(date.getTime())) return '-';
  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000));
  if (days >= 365) return `${Math.floor(days / 365)}y ${Math.floor((days % 365) / 30)}m`;
  if (days >= 30) return `${Math.floor(days / 30)}m ${days % 30}d`;
  return `${days}d`;
};

const buildProfileBadges = (profile = {}, selection = {}) => {
  const badges = [];
  if (profile.is_circles_avatar) badges.push(profile.circles_name || 'Circles');
  if (profile.is_safe) badges.push('Safe');
  if (profile.is_safe_owner) badges.push('Safe owner');
  if (profile.is_gpay_wallet) badges.push('Gnosis Pay');
  if (profile.is_gnosis_app_user) badges.push('Gnosis App');
  if (profile.is_lp_provider || profile.is_lending_user || profile.has_yield_activity) badges.push('Yields');
  if (
    selection.validatorIndex ||
    selection.withdrawalCredentials ||
    Number(profile.linked_validator_count || profile.connected_validator_count || 0) > 0
  ) {
    badges.push('Validators');
  }
  if (selection.sourceType && !badges.includes(selection.sourceType)) badges.push(selection.sourceType.replace(/_/g, ' '));
  return badges;
};

const hasCirclesIdentity = (profile = {}, roleFlags = {}, selection = {}) =>
  Boolean(profile?.is_circles_avatar) ||
  Boolean(roleFlags?.is_circles_avatar) ||
  selection?.sourceType === 'circles';

const getCirclesLabel = (profile = {}, roleFlags = {}, selection = {}) => {
  if (profile?.circles_name) return profile.circles_name;
  if (roleFlags?.circles_name) return roleFlags.circles_name;
  return hasCirclesIdentity(profile, roleFlags, selection) ? 'Avatar' : '-';
};

const getCirclesAvatarIdentity = (profile = {}, roleFlags = {}, selection = {}, metadata = null, address = '') => {
  if (!hasCirclesIdentity(profile, roleFlags, selection) && !metadata?.avatar) return null;
  const avatarAddress = metadata?.avatar || address || selection?.address || '';
  const name = metadata?.metadata_name || metadata?.name || profile?.circles_name || roleFlags?.circles_name || 'Circles avatar';
  return {
    address: avatarAddress,
    name,
    type: metadata?.avatar_type || 'Avatar',
    imageUrl: metadata?.metadata_preview_image_url || metadata?.metadata_image_url || '',
  };
};

const hasGPayIdentity = (profile = {}, roleFlags = {}) =>
  Boolean(profile?.is_gpay_wallet) ||
  Boolean(profile?.controlled_gpay_wallet) ||
  Boolean(roleFlags?.is_gpay_wallet) ||
  Boolean(roleFlags?.controls_gpay_wallet);

const hasValidatorIdentity = (profile = {}, roleFlags = {}, selection = {}) =>
  Boolean(profile?.is_validator_withdrawal_address) ||
  Boolean(roleFlags?.is_validator_withdrawal_address) ||
  selection?.sourceType === 'validator' ||
  selection?.sourceType === 'validator_credential' ||
  Boolean(selection?.validatorIndex) ||
  Boolean(selection?.withdrawalCredentials) ||
  Number(profile?.linked_validator_count || profile?.connected_validator_count || 0) > 0 ||
  Boolean(roleFlags?.is_validator_depositor);

const hasValidatorLinkedEntity = (linkedEntities = []) =>
  linkedEntities.some((row) =>
    String(row?.entity_type || '').toLowerCase().includes('validator') ||
    String(row?.relation || '').toLowerCase().includes('validator') ||
    String(row?.entity_id || '').toLowerCase().startsWith('validator_')
  );

const ScopeBadge = ({ label, value, detail = null }) => (
  <div className="account-portfolio-filter-badge">
    <strong>{label}</strong>
    {value ? <span className="ap-mono">{shortIdentifier(value)}</span> : null}
    {detail ? <span>{detail}</span> : null}
  </div>
);

const searchResultFromSelection = (selection) => {
  if (!selection) return null;
  const isCredential = selection.sourceType === 'validator_credential';
  const isValidator = selection.sourceType === 'validator';
  const isValidatorContext = isCredential || isValidator;
  return {
    resultType: selection.sourceType || (isCredential ? 'validator_credential' : 'address'),
    address: selection.address || '',
    displayLabel: selection.displayLabel || selection.address || selection.withdrawalCredentials ||
      (selection.validatorIndex ? `Validator ${selection.validatorIndex}` : ''),
    subtitle: isCredential
      ? 'Exact withdrawal credential'
      : (isValidator ? 'Exact validator index' : 'Exact address'),
    badges: (isCredential || isValidator) ? ['Validators'] : ['Address'],
    validatorIndex: selection.validatorIndex || null,
    withdrawalCredentials: selection.withdrawalCredentials || null,
    score: isValidatorContext ? 1000 : 100000,
  };
};

const mergeSearchResults = (directResult, remoteResults = []) => {
  const seen = new Map();

  [directResult, ...remoteResults].filter(Boolean).forEach((result) => {
    const resultType = result.resultType || result.result_type || 'address';
    const addressKey = String(result.address || '').toLowerCase();
    const credentialKey = String(result.withdrawalCredentials || result.withdrawal_credentials || '').toLowerCase();
    const validatorIndex = String(result.validatorIndex || result.validator_index || '');
    const isValidator = resultType.startsWith('validator') || resultType === 'credential';
    const key = !isValidator && addressKey
      ? `address:${addressKey}`
      : (resultType === 'validator_credential' || resultType === 'credential'
        ? (credentialKey ? `validator-credential:${credentialKey}` : `validator:${validatorIndex}`)
        : (validatorIndex ? `validator:${validatorIndex}` : (credentialKey ? `validator-credential:${credentialKey}` : 'validator:')));
    const previous = seen.get(key);
    const badges = Array.from(new Set([...(previous?.badges || []), ...(result.badges || [])].filter(Boolean)));

    if (!previous || Number(result.score || 0) > Number(previous.score || 0)) {
      seen.set(key, { ...result, badges });
    } else {
      previous.badges = badges;
    }
  });

  return Array.from(seen.values());
};

const AccountSearch = ({ value, onSelect }) => {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const requestIdRef = useRef(0);
  const userOpenedRef = useRef(false);

  useEffect(() => {
    userOpenedRef.current = false;
    setOpen(false);
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const trimmed = query.trim();
    setError('');
    // Skip remote searches when the query mirrors the committed selection —
    // prevents re-firing search for "Safe owner · 3 safes" after a click.
    if (!userOpenedRef.current && value && trimmed === String(value).trim()) {
      return undefined;
    }
    const directResult = searchResultFromSelection(selectionFromRawInput(trimmed));

    if (directResult) {
      setResults([directResult]);
      if (userOpenedRef.current) setOpen(true);
    }

    const shouldRemoteSearch = trimmed.length >= 2 || /^\d+$/.test(trimmed);
    if (!shouldRemoteSearch) {
      if (!directResult) setResults([]);
      setLoading(false);
      return undefined;
    }

    const requestId = ++requestIdRef.current;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const rows = await accountPortfolioService.search(trimmed);
        if (requestIdRef.current !== requestId) return;
        setResults(mergeSearchResults(directResult, rows));
        if (userOpenedRef.current) setOpen(true);
      } catch (err) {
        if (requestIdRef.current !== requestId) return;
        const fallbackRows = directResult ? [directResult] : [];
        setResults(fallbackRows);
        setError(fallbackRows.length > 0 ? '' : (err?.message || 'Search failed'));
      } finally {
        if (requestIdRef.current === requestId) setLoading(false);
      }
    }, 180);

    return () => window.clearTimeout(timer);
  }, [query]);

  const chooseResult = useCallback((result) => {
    const selection = normalizeAccountSelection(result);
    if (selection) {
      setQuery(selection.displayLabel || selection.address || selection.withdrawalCredentials || '');
      userOpenedRef.current = false;
      setOpen(false);
      // Warm the overview bundle cache before the route mounts. The mount-
      // time fetch will attach to the same in-flight promise.
      if (selection.address) {
        accountPortfolioService.prefetchOverview(selection.address);
      }
      onSelect(selection);
    }
  }, [onSelect]);

  const prefetchResult = useCallback((result) => {
    if (result?.address) {
      accountPortfolioService.prefetchOverview(result.address);
    }
  }, []);

  const submit = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const direct = selectionFromRawInput(trimmed);
    if (direct) {
      userOpenedRef.current = false;
      setOpen(false);
      onSelect(direct);
      return;
    }

    const best = results[0] || await accountPortfolioService.resolveSearch(trimmed);
    const selection = normalizeAccountSelection(best);
    if (selection) {
      userOpenedRef.current = false;
      setOpen(false);
      onSelect(selection);
    }
  }, [onSelect, query, results]);

  return (
    <div className="account-portfolio-search validator-explorer-search">
      <input
        type="search"
        className="validator-explorer-search-input"
        value={query}
        aria-label="Search account portfolio"
        placeholder="Search address, ENS/label, Circles name, Safe, validator index or pubkey"
        onChange={(event) => {
          userOpenedRef.current = true;
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          userOpenedRef.current = true;
          if (results.length > 0 || loading || error) setOpen(true);
        }}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 120);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            submit();
          }
          if (event.key === 'Escape') setOpen(false);
        }}
      />

      {open && (results.length > 0 || loading || error) ? (
        <div className="validator-explorer-search-results account-portfolio-search-results">
          {loading && results.length === 0 ? (
            <div className="validator-explorer-search-result validator-explorer-search-result--muted">Searching…</div>
          ) : null}
          {error && results.length === 0 ? (
            <div className="validator-explorer-search-result validator-explorer-search-result--muted">{error}</div>
          ) : null}
          {results.map((result, index) => {
            const avatarSeed = (result.address || result.withdrawalCredentials || result.displayLabel || '').toString();
            const title = result.displayLabel || shortIdentifier(result.address) || 'Account';
            const sub = subtitleFor(result);
            return (
              <button
                key={`${result.resultType}-${result.address}-${result.validatorIndex || result.withdrawalCredentials || index}`}
                type="button"
                className="validator-explorer-search-result account-portfolio-search-result"
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => prefetchResult(result)}
                onFocus={() => prefetchResult(result)}
                onClick={() => chooseResult(result)}
              >
                <span
                  className="account-portfolio-search-avatar"
                  style={{ background: hashColor(avatarSeed) }}
                  aria-hidden="true"
                >
                  {initialOf(result)}
                </span>
                <span className="account-portfolio-search-body">
                  <span className="validator-explorer-search-result-title">{title}</span>
                  {sub ? (
                    <span className="validator-explorer-search-result-meta account-portfolio-search-sub">{sub}</span>
                  ) : null}
                </span>
                {Array.isArray(result.badges) && result.badges.length > 0 ? (
                  <span className="account-portfolio-search-result-badges">
                    {result.badges.slice(0, 3).map((badge) => (
                      <span key={badge} className="validator-explorer-status-pill validator-explorer-status-pill--neutral">
                        {badge}
                      </span>
                    ))}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

const MetricTile = ({ label, value }) => (
  <div className="account-portfolio-tile">
    <span className="account-portfolio-tile-label">{label}</span>
    <strong className="account-portfolio-tile-value">{value}</strong>
  </div>
);

const AccountSummaryCard = ({
  address,
  profile,
  selection,
  scope,
  onScopeChange,
  linkedCount,
  linkedEntities = [],
  activitySummary = null,
  tokenBalances = [],
  balanceHistory = [],
  roleFlags = null,
  circlesAvatar = null,
  safesOwned = [],
  movements = [],
  lendingPositions = [],
  circlesTotalBalance = null,
  activityTotals = null,
  activityWindowDays = 90,
}) => {
  const displayName = profile?.display_name || selection?.displayLabel || address || selection?.withdrawalCredentials || 'Account';
  const selectedEth1Credential = isEth1WithdrawalCredential(selection?.withdrawalCredentials)
    ? selection.withdrawalCredentials
    : '';
  const latestBalance = [...balanceHistory]
    .filter((row) => normalizeDisplayDate(row?.date))
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))[0] || null;
  const summary = activitySummary || {};
  const linkedSafeCount = linkedEntities.filter((row) =>
    String(row.entity_type || '').toLowerCase().includes('safe') ||
    String(row.relation || '').toLowerCase().includes('safe')
  ).length;
  const linkedValidatorCount = linkedEntities.filter((row) =>
    String(row.entity_type || '').toLowerCase().includes('validator') ||
    String(row.relation || '').toLowerCase().includes('validator')
  ).length;
  const tokenBalanceUsd = tokenBalances.reduce((acc, row) => acc + Number(row?.balance_usd || 0), 0);
  const lendingBalanceUsd = (lendingPositions || []).reduce((acc, row) => acc + Number(row?.balance_usd ?? row?.atoken_balance_usd ?? 0), 0);
  const circlesBalanceUsd = Number(circlesTotalBalance?.total_balance_usd ?? 0);
  const computedBalance = tokenBalanceUsd + lendingBalanceUsd + (Number.isFinite(circlesBalanceUsd) ? circlesBalanceUsd : 0);
  // Include lending + circles in the total when we have those streams. Falls back to
  // profile/history when token-balance stream is empty (e.g. validator-only accounts).
  const totalBalance = (tokenBalances.length || lendingPositions.length || circlesBalanceUsd > 0)
    ? computedBalance
    : (profile?.total_balance_usd ?? latestBalance?.total_balance_usd ?? 0);
  const tokenSlotsHeld = (tokenBalances?.length || 0)
    + ((lendingPositions || []).length)
    + (circlesTotalBalance && (Number(circlesTotalBalance.total_balance) > 0
        || Number(circlesTotalBalance.total_balance_usd) > 0) ? 1 : 0);
  // Prefer the live count when any holdings stream returned rows; only fall back
  // to profile/history when nothing has loaded yet.
  const tokensHeld = tokenSlotsHeld > 0
    ? tokenSlotsHeld
    : (profile?.tokens_held ?? latestBalance?.tokens_held ?? 0);
  const firstMovementDate = movements.length
    ? [...movements].map((m) => String(m.date || '')).filter(Boolean).sort()[0]
    : null;
  const lastMovementDate = movements.length
    ? [...movements].map((m) => String(m.date || '')).filter(Boolean).sort().slice(-1)[0]
    : null;
  const safesCount = (safesOwned && safesOwned.length) ||
    profile?.linked_safe_count ||
    profile?.connected_safe_count ||
    roleFlags?.connected_safe_count ||
    linkedSafeCount ||
    0;
  const validatorsCount = profile?.linked_validator_count ||
    profile?.connected_validator_count ||
    roleFlags?.connected_validator_count ||
    linkedValidatorCount ||
    0;
  const badges = buildProfileBadges({
    ...(profile || {}),
    ...(roleFlags || {}),
    linked_validator_count: validatorsCount,
  }, selection);
  const hasConfirmedValidatorWithdrawal = Boolean(
    Number(validatorsCount || 0) > 0 ||
    selectedEth1Credential ||
    selection?.validatorIndex
  );
  const validatorWithdrawalAddress = hasConfirmedValidatorWithdrawal
    ? (selection?.withdrawalAddress || withdrawalAddressFromCredential(selectedEth1Credential) || address || '')
    : '';
  const validatorCredentialEquivalent = validatorWithdrawalAddress
    ? (selectedEth1Credential || withdrawalCredentialFromAddress(validatorWithdrawalAddress))
    : '';
  const totalsTransferCount = Number(activityTotals?.total_transfers) || 0;
  const totalsCounterpartyCount = Number(activityTotals?.counterparty_count) || 0;
  const counterpartySet = new Set(
    movements
      .map((m) => String(m.counterparty || '').toLowerCase())
      .filter((v) => v && v !== 'null' && v !== 'undefined')
  );
  const movementCount = totalsTransferCount || summary.token_transfer_count || movements.length || 0;
  const counterpartiesCount = totalsCounterpartyCount || summary.counterparty_count || counterpartySet.size || 0;
  const windowLabel = ACTIVITY_WINDOW_OPTIONS.find((o) => o.value === activityWindowDays)?.label || `${activityWindowDays}d`;
  const firstActive = normalizeDisplayDate(firstMovementDate || summary.first_activity_date || profile?.first_seen_date);
  const lastActive = normalizeDisplayDate(lastMovementDate || summary.last_activity_date || profile?.last_active_date);
  const circlesIdentity = getCirclesAvatarIdentity(profile, roleFlags, selection, circlesAvatar, address);
  const circlesInitial = circlesIdentity?.name?.trim()?.slice(0, 1)?.toUpperCase() || 'C';
  const displayBadges = circlesIdentity && !badges.some((badge) => String(badge).toLowerCase().includes('circle'))
    ? [...badges, 'Circles']
    : badges;

  return (
    <section className="validator-explorer-hero account-portfolio-hero">
      <div className="validator-explorer-hero-main">
        <div className="account-portfolio-hero-top">
          <div>
            <p className="validator-explorer-eyebrow">Account Portfolio</p>
            <h2 className="validator-explorer-hero-title">{displayName}</h2>
          </div>
          <div className="account-portfolio-scope-toggle" role="group" aria-label="Portfolio scope">
            <button
              type="button"
              className={`resolution-btn ${scope === 'selected' ? 'active' : ''}`}
              onClick={() => onScopeChange('selected')}
            >
              Selected
            </button>
            <button
              type="button"
              className={`resolution-btn ${scope === 'linked' ? 'active' : ''}`}
              onClick={() => onScopeChange('linked')}
            >
              Linked group
            </button>
          </div>
        </div>

        <div className="validator-explorer-pill-row">
          {displayBadges.map((badge) => (
            <span key={badge} className="validator-explorer-status-pill validator-explorer-status-pill--info">
              {badge}
            </span>
          ))}
        </div>

        <div className="validator-explorer-meta-grid account-portfolio-meta-grid">
          <div>
            <span className="validator-explorer-meta-label">Address</span>
            <span className="validator-explorer-meta-value" title={address}>
              {address ? shortIdentifier(address) : shortIdentifier(selection?.withdrawalCredentials)}
            </span>
          </div>
          <div>
            <span className="validator-explorer-meta-label">Circles avatar</span>
            {circlesIdentity ? (
              <span className="account-portfolio-avatar-entity">
                <span className="account-portfolio-avatar-entity-media" aria-hidden="true">
                  {circlesIdentity.imageUrl ? (
                    <img src={circlesIdentity.imageUrl} alt="" loading="lazy" decoding="async" />
                  ) : (
                    <span>{circlesInitial}</span>
                  )}
                </span>
                <span className="account-portfolio-avatar-entity-text">
                  <strong>{circlesIdentity.name}</strong>
                  <small>{circlesIdentity.type} · {shortIdentifier(circlesIdentity.address)}</small>
                </span>
              </span>
            ) : (
              <span className="validator-explorer-meta-value">-</span>
            )}
          </div>
          <div>
            <span className="validator-explorer-meta-label">Controlled GPay wallet</span>
            <span className="validator-explorer-meta-value">{(profile?.controlled_gpay_wallet || roleFlags?.controls_gpay_wallet) ? shortIdentifier(profile?.controlled_gpay_wallet || roleFlags?.controls_gpay_wallet) : '-'}</span>
          </div>
          <div>
            <span className="validator-explorer-meta-label">Validator withdrawal</span>
            <span className="validator-explorer-meta-value" title={validatorCredentialEquivalent || validatorWithdrawalAddress || ''}>
              {validatorWithdrawalAddress
                ? `${shortIdentifier(validatorWithdrawalAddress)} via ${shortIdentifier(validatorCredentialEquivalent)}`
                : '-'}
            </span>
          </div>
        </div>
      </div>

      <div className="account-portfolio-summary-grid">
        <MetricTile label="Token balance" value={formatCurrencyCompact(totalBalance || 0)} />
        <MetricTile label="Tokens held" value={formatNumberCompact(tokensHeld || 0)} />
        <MetricTile label="Account age" value={getAgeText(firstActive)} />
        <MetricTile label="Last active" value={lastActive || '-'} />
        <MetricTile label={`Counterparties · ${windowLabel}`} value={formatNumberCompact(counterpartiesCount)} />
        <MetricTile label={`Token transfers · ${windowLabel}`} value={formatNumberCompact(movementCount)} />
        <MetricTile label="Safes" value={formatNumberCompact(safesCount)} />
        <MetricTile label="Validators" value={formatNumberCompact(validatorsCount)} />
      </div>
    </section>
  );
};

const AccountDetailDrawer = ({ item, onClose, onSelectAddress }) => {
  if (!item) return null;
  const row = item.row || {};
  const addressValue = pickAddress(row);

  // Render via portal so the drawer escapes the .dashboard-content stacking
  // context (which sets z-index: 80 and would otherwise place the drawer
  // beneath the page header at z-index: 100, hiding the Close button).
  const content = (
    <aside className="account-portfolio-drawer" aria-label="Row details">
      <div className="account-portfolio-drawer-header">
        <div>
          <span className="validator-explorer-eyebrow">{item.metricId}</span>
          <h3>Row details</h3>
        </div>
        <button type="button" className="resolution-btn" onClick={onClose}>Close</button>
      </div>
      <dl className="account-portfolio-drawer-grid">
        {Object.entries(row).map(([key, value]) => (
          <React.Fragment key={key}>
            <dt>{key}</dt>
            <dd title={String(value ?? '')}>{isAddress(value) ? shortIdentifier(value) : String(value ?? '-')}</dd>
          </React.Fragment>
        ))}
      </dl>
      {addressValue ? (
        <button
          type="button"
          className="validator-explorer-search-button"
          onClick={() => onSelectAddress(addressValue)}
        >
          Open Address
        </button>
      ) : null}
    </aside>
  );

  if (typeof document === 'undefined') return content;
  return createPortal(content, document.body);
};

const OverviewField = ({ label, value, title = null }) => (
  <div className="account-portfolio-overview-field">
    <span>{label}</span>
    <strong title={title || String(value ?? '')}>{value ?? '-'}</strong>
  </div>
);

const EmptyOverviewRows = ({ children = 'No production rows for this account yet.' }) => (
  <div className="account-portfolio-empty-note">{children}</div>
);

const OverviewTable = ({ columns, rows, onRowClick }) => (
  <div className="account-portfolio-overview-table" role="table">
    <div className="account-portfolio-overview-table-row account-portfolio-overview-table-head" role="row">
      {columns.map((column) => (
        <span key={column.key} role="columnheader">{column.label}</span>
      ))}
    </div>
    {rows.map((row, rowIndex) => (
      <button
        key={`${rowIndex}-${columns.map((column) => row[column.key]).join('-')}`}
        type="button"
        className="account-portfolio-overview-table-row"
        role="row"
        onClick={() => onRowClick({ metricId: 'account-overview', row })}
      >
        {columns.map((column) => (
          <span key={column.key} role="cell" title={String(row[column.key] ?? '')}>
            {column.format ? column.format(row[column.key], row) : (row[column.key] ?? '-')}
          </span>
        ))}
      </button>
    ))}
  </div>
);

const AccountOverview = ({
  address,
  profile,
  roleFlags = null,
  selection,
  linkedEntities,
  activitySummary,
  tokenBalances,
  balanceHistory,
  movements = [],
  onRowClick,
  holdings = null,
  activityTotals = null,
  activityWindowDays = 90,
}) => {
  // Prefer the unified holdings (tokens + aTokens + Circles aggregate) when
  // available so the Overview's "Top tokens" preview reflects the full
  // portfolio, not just plain ERC-20 holdings.
  const overviewSource = (holdings && holdings.length) ? holdings : tokenBalances;
  const topTokenBalances = useMemo(
    () => [...overviewSource]
      .sort((a, b) => Number(b.balance_usd || 0) - Number(a.balance_usd || 0))
      .slice(0, 8),
    [overviewSource]
  );

  const latestBalance = useMemo(
    () => [...balanceHistory]
      .filter((row) => normalizeDisplayDate(row?.date))
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))[0] || null,
    [balanceHistory]
  );

  const relationCounts = useMemo(() => {
    const counts = new Map();
    linkedEntities.forEach((row) => {
      const key = row.relation || row.entity_type || 'linked';
      counts.set(key, (counts.get(key) || 0) + Number(row.value_count || 1));
    });
    return Array.from(counts.entries())
      .map(([relation, count]) => ({ relation, count }))
      .sort((a, b) => b.count - a.count);
  }, [linkedEntities]);

  const displayName = profile?.display_name || selection?.displayLabel || address || selection?.withdrawalCredentials;
  const computedHoldingsUsd = (overviewSource || []).reduce((acc, row) => acc + Number(row?.balance_usd || 0), 0);
  const totalBalance = computedHoldingsUsd > 0
    ? computedHoldingsUsd
    : (profile?.total_balance_usd ?? latestBalance?.total_balance_usd ?? 0);
  const tokensHeld = (overviewSource && overviewSource.length > 0)
    ? overviewSource.length
    : (profile?.tokens_held ?? latestBalance?.tokens_held ?? 0);
  const movementSummary = useMemo(() => buildMovementActivitySummary(movements), [movements]);
  const summary = activitySummary || {};
  const firstActive = normalizeDisplayDate(summary.first_activity_date || movementSummary.first_activity_date || profile?.first_seen_date) || '-';
  const lastActive = normalizeDisplayDate(summary.last_activity_date || movementSummary.last_activity_date || profile?.last_active_date) || '-';
  const activeDays = Number(summary.active_days || 0) || movementSummary.active_days || 0;
  const totalsTransferCount = Number(activityTotals?.total_transfers) || 0;
  const totalsCounterpartyCount = Number(activityTotals?.counterparty_count) || 0;
  const transferCount = totalsTransferCount || Number(summary.token_transfer_count || 0) || movementSummary.token_transfer_count || 0;
  const inboundCount = Number(summary.inbound_transfer_count || 0) || movementSummary.inbound_transfer_count || 0;
  const outboundCount = Number(summary.outbound_transfer_count || 0) || movementSummary.outbound_transfer_count || 0;
  const counterpartyCount = totalsCounterpartyCount || Number(summary.counterparty_count || 0) || movementSummary.counterparty_count || 0;
  const tokenCountMoved = Number(summary.token_count_moved || 0) || movementSummary.token_count_moved || 0;

  return (
    <section className="account-portfolio-overview">
      <div className="account-portfolio-overview-card account-portfolio-overview-card--wide">
        <div className="account-portfolio-overview-card-header">
          <div>
            <span className="validator-explorer-eyebrow">Identity</span>
            <h3>Account Signals</h3>
          </div>
        </div>
        <div className="account-portfolio-overview-field-grid">
          <OverviewField label="Display" value={displayName || '-'} title={displayName} />
          <OverviewField label="Address" value={address ? shortIdentifier(address) : '-'} title={address} />
          <OverviewField label="Circles" value={getCirclesLabel(profile, roleFlags, selection)} />
          <OverviewField label="Gnosis Pay" value={profile?.is_gpay_wallet ? 'Wallet' : (profile?.controlled_gpay_wallet ? shortIdentifier(profile.controlled_gpay_wallet) : '-')} title={profile?.controlled_gpay_wallet} />
          <OverviewField label="Gnosis App" value={profile?.is_gnosis_app_user ? 'User' : '-'} />
          <OverviewField label="Safe Role" value={profile?.is_safe ? 'Safe' : (profile?.is_safe_owner ? 'Owner' : '-')} />
          <OverviewField label="Yield Activity" value={profile?.has_yield_activity || profile?.is_lp_provider || profile?.is_lending_user ? 'Yes' : '-'} />
          <OverviewField label="Validators" value={formatNumberCompact(profile?.linked_validator_count || profile?.connected_validator_count || 0)} />
        </div>
        <div className="account-portfolio-relation-pills">
          {address ? (
            <span className="validator-explorer-status-pill validator-explorer-status-pill--neutral">
              Selected: {shortIdentifier(address)}
            </span>
          ) : null}
          {profile?.controlled_gpay_wallet || roleFlags?.controls_gpay_wallet ? (
            <span className="validator-explorer-status-pill validator-explorer-status-pill--info">
              GPay: {shortIdentifier(profile?.controlled_gpay_wallet || roleFlags?.controls_gpay_wallet)}
            </span>
          ) : null}
          {hasCirclesIdentity(profile, roleFlags, selection) ? (
            <span className="validator-explorer-status-pill validator-explorer-status-pill--info">
              Circles: {getCirclesLabel(profile, roleFlags, selection)}
            </span>
          ) : null}
          {hasValidatorIdentity(profile, roleFlags, selection) ? (
            <span className="validator-explorer-status-pill validator-explorer-status-pill--info">
              Validators: {formatNumberCompact(profile?.linked_validator_count || profile?.connected_validator_count || roleFlags?.connected_validator_count || 0)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="account-portfolio-overview-card">
        <div className="account-portfolio-overview-card-header">
          <div>
            <span className="validator-explorer-eyebrow">Holdings</span>
            <h3>Balances</h3>
          </div>
          <strong>{formatCurrencyCompact(totalBalance || 0)}</strong>
        </div>
        <div className="account-portfolio-overview-stats">
          <MetricTile label="Tokens held" value={formatNumberCompact(tokensHeld || 0)} />
          {(() => {
            const rawBalanceDate = String(latestBalance?.date || profile?.balance_date || '').slice(0, 10);
            // dbt's profile model uses 1970-01-01 as a sentinel for "never had a balance".
            // Don't render the tile in that case — there's no meaningful date to show.
            const isRealDate = /^\d{4}-\d{2}-\d{2}$/.test(rawBalanceDate) && rawBalanceDate >= '2020-01-01';
            return isRealDate ? <MetricTile label="Latest balance date" value={rawBalanceDate} /> : null;
          })()}
        </div>
        {topTokenBalances.length > 0 ? (
          <OverviewTable
            columns={[
              { key: 'symbol', label: 'Token' },
              { key: 'balance', label: 'Balance', format: (value) => formatNumberCompact(value || 0) },
              { key: 'balance_usd', label: 'USD', format: (value) => formatCurrencyCompact(value || 0) },
            ]}
            rows={topTokenBalances}
            onRowClick={onRowClick}
          />
        ) : (
          <EmptyOverviewRows>No token balances found in production data.</EmptyOverviewRows>
        )}
      </div>

      <div className="account-portfolio-overview-card">
        <div className="account-portfolio-overview-card-header">
          <div>
            <span className="validator-explorer-eyebrow">Activity</span>
            <h3>Transfers</h3>
          </div>
        </div>
        {(transferCount === 0 && activeDays === 0 && counterpartyCount === 0 && firstActive === '-') ? (
          <EmptyOverviewRows>No activity in the last 90 days.</EmptyOverviewRows>
        ) : (
          <div className="account-portfolio-overview-field-grid account-portfolio-overview-field-grid--compact">
            <OverviewField label="First active" value={firstActive} />
            <OverviewField label="Last active" value={lastActive} />
            <OverviewField label="Active days" value={formatNumberCompact(activeDays)} />
            <OverviewField label="Transfers" value={formatNumberCompact(transferCount)} />
            <OverviewField label="Inbound" value={formatNumberCompact(inboundCount)} />
            <OverviewField label="Outbound" value={formatNumberCompact(outboundCount)} />
            <OverviewField label="Counterparties" value={formatNumberCompact(counterpartyCount)} />
            <OverviewField label="Tokens moved" value={formatNumberCompact(tokenCountMoved)} />
          </div>
        )}
      </div>

      <div className="account-portfolio-overview-card account-portfolio-overview-card--wide">
        <div className="account-portfolio-overview-card-header">
          <div>
            <span className="validator-explorer-eyebrow">Linked Scope</span>
            <h3>Related Accounts</h3>
          </div>
          <strong>{formatNumberCompact(linkedEntities.length)}</strong>
        </div>
        {relationCounts.length > 0 ? (
          <div className="account-portfolio-relation-pills">
            {relationCounts.slice(0, 10).map((row) => (
              <span key={row.relation} className="validator-explorer-status-pill validator-explorer-status-pill--neutral">
                {row.relation}: {formatNumberCompact(row.count)}
              </span>
            ))}
          </div>
        ) : null}
        {linkedEntities.length > 0 ? (
          <OverviewTable
            columns={[
              { key: 'relation', label: 'Relation' },
              { key: 'entity_type', label: 'Type' },
              { key: 'entity_address', label: 'Entity', format: (value, row) => shortIdentifier(value || row.entity_id) },
              { key: 'display_label', label: 'Label', format: (value, row) => value || shortIdentifier(row.entity_id) },
              { key: 'last_seen_at', label: 'Last seen' },
            ]}
            rows={linkedEntities.slice(0, 12)}
            onRowClick={onRowClick}
          />
        ) : (
          <EmptyOverviewRows>No linked Safes, owners, GPay wallets, Circles, or validator credentials found yet.</EmptyOverviewRows>
        )}
      </div>
    </section>
  );
};

const ActionPill = ({ action, direction }) => {
  const key = `${action || ''} ${direction || ''}`.toLowerCase();
  const label = action || direction || '-';
  let cls = 'ap-pill';
  if (/inflow|deposit|topup|top.?up|supply|repay|add liquidity|collect fees/.test(key)) cls += ' ap-pill--inflow';
  else if (/outflow|withdraw|borrow|remove liquidity/.test(key)) cls += ' ap-pill--outflow';
  else if (/payment/.test(key)) cls += ' ap-pill--payment';
  else if (/cashback/.test(key)) cls += ' ap-pill--cashback';
  else cls += ' ap-pill--muted';
  return <span className={cls}>{label}</span>;
};

const SourcePill = ({ source }) => {
  const key = String(source || '').toLowerCase();
  if (key === 'gpay') return <span className="ap-pill ap-pill--gpay">Gnosis Pay</span>;
  if (key === 'lp') return <span className="ap-pill ap-pill--lp">LP</span>;
  if (key === 'lending') return <span className="ap-pill ap-pill--lending">Lending</span>;
  return <span className="ap-pill ap-pill--transfer">Transfer</span>;
};

const TokenSymbolCell = ({ symbol }) => {
  const label = formatTokenSymbol(symbol || '') || '-';
  const iconUrl = getTokenIconUrl(symbol);
  return (
    <span className="ap-token-cell">
      {iconUrl ? <img className="ap-token-icon" src={iconUrl} alt="" aria-hidden="true" /> : null}
      <span>{label}</span>
    </span>
  );
};

const formatActivityTimestamp = (value) => {
  if (!value) return '-';
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return String(value).slice(0, 16);
  return parsedDate.toISOString().replace('T', ' ').slice(0, 16);
};

const formatActivityAmount = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return String(value);
  return numeric.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
};

const getActivityAmountClass = (action) => {
  const key = String(action || '').toLowerCase();
  if (/remove|withdraw|borrow/.test(key)) return 'ap-amount ap-amount--outflow';
  if (/add|collect|supply|repay/.test(key)) return 'ap-amount ap-amount--inflow';
  return 'ap-amount';
};

const ActivityHistoryTable = ({ rows = [], onRowClick }) => {
  if (!rows.length) return null;

  return (
    <div className="ap-card">
      <div className="ap-card-header">
        <h3>Activity History</h3>
        <span className="ap-card-subtitle">{rows.length} actions · newest first</span>
      </div>
      <PaginatedTable
        rows={rows}
        rowLabel="actions"
        tableClassName="ap-table ap-table--portfolio"
        renderHeader={() => (
            <tr>
              <th>Timestamp</th>
              <th>Source</th>
              <th>Action</th>
              <th>Protocol</th>
              <th>Token</th>
              <th className="num">Amount</th>
              <th className="num">USD Value</th>
            </tr>
        )}
        renderRow={(row, idx) => {
          const txHash = String(row.transaction_hash || '').trim();
          const timestamp = formatActivityTimestamp(row.block_timestamp || row.date);
          return (
            <tr
              key={`${row.block_timestamp || row.date || 'activity'}-${txHash || idx}`}
              onClick={() => onRowClick?.({ metricId: 'yields_activity', row })}
              className="ap-row-clickable"
            >
              <td>
                {txHash ? (
                  <a
                    className="table-link"
                    href={`https://gnosis.blockscout.com/tx/${encodeURIComponent(txHash)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {timestamp}
                  </a>
                ) : timestamp}
              </td>
              <td><SourcePill source={row.source} /></td>
              <td><ActionPill action={row.action} /></td>
              <td>{row.protocol || '-'}</td>
              <td><TokenSymbolCell symbol={row.token_symbol} /></td>
              <td className="num">
                <span className={getActivityAmountClass(row.action)}>
                  {formatActivityAmount(row.amount)}
                </span>
              </td>
              <td className="num">{formatUsd(row.amount_usd)}</td>
            </tr>
          );
        }}
      />
    </div>
  );
};

const renderEmpty = (message) => (
  <div className="ap-empty">{message}</div>
);

const TABLE_PAGE_SIZE_OPTIONS = [10, 25, 50];

const PaginatedTable = ({
  rows = [],
  rowLabel = 'rows',
  tableClassName = 'ap-table',
  initialPageSize = 10,
  pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS,
  getRowKey,
  renderHeader,
  renderRow,
}) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = totalRows === 0 ? 0 : (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRows);
  const visibleRows = rows.slice(startIndex, endIndex);

  useEffect(() => {
    setPage(1);
  }, [totalRows, pageSize]);

  return (
    <>
      <div className="ap-table-wrapper">
        <table className={tableClassName}>
          <thead>{renderHeader()}</thead>
          <tbody>
            {visibleRows.map((row, index) => renderRow(row, startIndex + index, getRowKey?.(row, startIndex + index)))}
          </tbody>
        </table>
      </div>
      {totalRows > pageSizeOptions[0] ? (
        <div className="ap-table-pagination">
          <span>
            Showing {startIndex + 1}-{endIndex} of {totalRows} {rowLabel}
          </span>
          <div className="ap-table-pagination-controls">
            <label className="ap-table-page-size">
              Rows
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
                aria-label="Rows per page"
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="ap-table-page-btn"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={currentPage <= 1}
            >
              Previous
            </button>
            <span>Page {currentPage} / {totalPages}</span>
            <button
              type="button"
              className="ap-table-page-btn"
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
};

// Stacked-line history of every token the address has ever held, plus aTokens.
// One series per (symbol, class) pair; ECharts renders the multi-line plot.
const BalancesHistoryChart = ({ tokenRows = [], lendingRows = [], isDarkMode = false }) => {
  const containerRef = useRef(null);
  const instanceRef = useRef(null);

  const { categories, series, totalSeries } = useMemo(() => {
    const merged = [];
    (tokenRows || []).forEach((row) => {
      if (!row?.date || !row?.symbol) return;
      const usd = Number(row.balance_usd ?? 0);
      if (!Number.isFinite(usd) || usd <= 0) return;
      merged.push({ date: String(row.date), key: row.symbol, label: row.symbol, usd });
    });
    (lendingRows || []).forEach((row) => {
      if (!row?.date || !row?.symbol) return;
      const usd = Number(row.balance_usd ?? 0);
      if (!Number.isFinite(usd) || usd <= 0) return;
      merged.push({ date: String(row.date), key: `a${row.symbol}`, label: `a${row.symbol}`, usd });
    });
    if (merged.length === 0) return { categories: [], series: [], totalSeries: [] };
    const dates = Array.from(new Set(merged.map((r) => r.date))).sort();
    const byKey = new Map();
    merged.forEach((r) => {
      const m = byKey.get(r.key) || { label: r.label, byDate: new Map() };
      m.byDate.set(r.date, r.usd);
      byKey.set(r.key, m);
    });
    const seriesArr = Array.from(byKey.entries()).map(([key, { label, byDate }]) => {
      // Build the raw per-date values, then patch up two artefacts of the
      // upstream model:
      //   1. Gaps between rows on consecutive days are NOT real "balance went
      //      to null" events — the model writes a row per day per held token.
      //      So forward-fill gaps with the last known balance.
      //   2. The model never writes a zero-balance row; rows simply stop when
      //      a token is transferred out. So append a single 0 point right
      //      after the last known row to make the line drop to zero visually.
      const raw = dates.map((d) => (byDate.has(d) ? byDate.get(d) : null));
      const filled = raw.slice();
      let lastVal = null;
      let lastIdx = -1;
      for (let i = 0; i < filled.length; i += 1) {
        if (filled[i] != null) {
          if (lastIdx >= 0 && i - lastIdx > 1) {
            for (let j = lastIdx + 1; j < i; j += 1) filled[j] = lastVal;
          }
          lastVal = filled[i];
          lastIdx = i;
        }
      }
      if (lastIdx >= 0 && lastIdx < filled.length - 1) {
        filled[lastIdx + 1] = 0;
      }
      const peak = filled.reduce((acc, v) => (v != null && v > acc ? v : acc), 0);
      return { key, label, peak, data: filled };
    });
    seriesArr.sort((a, b) => b.peak - a.peak);
    // Aggregate total per date FROM THE FORWARD-FILLED SERIES so it tracks what
    // the user actually sees on each line — not just rows that happened to have
    // an explicit transfer that day.
    const total = dates.map((_, idx) => {
      const sum = seriesArr.reduce((acc, s) => acc + (Number(s.data[idx]) || 0), 0);
      return Number(sum.toFixed(2));
    });
    return { categories: dates, series: seriesArr, totalSeries: total };
  }, [tokenRows, lendingRows]);

  useEffect(() => {
    let cancelled = false;
    let echarts;
    (async () => {
      const mod = await import('echarts');
      if (cancelled || !containerRef.current) return;
      echarts = mod;
      if (!instanceRef.current) {
        instanceRef.current = mod.init(containerRef.current, isDarkMode ? 'dark' : null);
      }
      const textColor = isDarkMode ? '#cbd5e1' : '#334155';
      const gridLine = isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.3)';
      const option = {
        backgroundColor: 'transparent',
        animation: false,
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross' },
          // Skip series with null / zero values on the hovered date so the
          // tooltip only lists tokens the wallet actually held that day.
          formatter: (params) => {
            if (!Array.isArray(params) || params.length === 0) return '';
            const date = params[0]?.axisValueLabel ?? params[0]?.axisValue ?? '';
            const fmtUsd = (v) => {
              const abs = Math.abs(v);
              if (abs >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
              if (abs >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
              if (abs >= 1e3) return `$${(v / 1e3).toFixed(2)}K`;
              if (abs >= 1) return `$${v.toFixed(2)}`;
              return `$${v.toFixed(4)}`;
            };
            const visible = params.filter((p) => {
              const v = Number(p?.value);
              return Number.isFinite(v) && v > 0;
            });
            if (visible.length === 0) return '';
            // Total goes last; everything else sorted by USD desc.
            visible.sort((a, b) => {
              const aTotal = a.seriesName === 'Total (USD)';
              const bTotal = b.seriesName === 'Total (USD)';
              if (aTotal !== bTotal) return aTotal ? 1 : -1;
              return Number(b.value) - Number(a.value);
            });
            const lines = visible.map((p) =>
              `${p.marker}<span style="margin-right:8px">${p.seriesName}</span><strong style="float:right">${fmtUsd(Number(p.value))}</strong>`
            );
            return `<div style="font-weight:600;margin-bottom:4px">${date}</div>${lines.join('<br/>')}`;
          },
        },
        legend: {
          type: 'scroll',
          top: 0,
          textStyle: { color: textColor, fontSize: 11 },
        },
        grid: { left: 56, right: 24, top: 36, bottom: 36 },
        xAxis: {
          type: 'category',
          data: categories,
          axisLine: { lineStyle: { color: gridLine } },
          axisLabel: { color: textColor, fontSize: 10 },
        },
        yAxis: {
          type: 'value',
          axisLine: { show: false },
          splitLine: { lineStyle: { color: gridLine } },
          axisLabel: {
            color: textColor,
            fontSize: 10,
            formatter: (value) => {
              const abs = Math.abs(value);
              if (abs >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
              if (abs >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
              if (abs >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
              return `$${value.toFixed(0)}`;
            },
          },
        },
        series: [
          ...series.map((s) => ({
            name: s.label,
            type: 'line',
            data: s.data,
            connectNulls: false,
            showSymbol: false,
            sampling: 'lttb',
            smooth: true,
            lineStyle: { width: 1.6 },
            emphasis: { focus: 'series' },
          })),
          {
            name: 'Total (USD)',
            type: 'line',
            data: totalSeries,
            showSymbol: false,
            sampling: 'lttb',
            smooth: true,
            lineStyle: { width: 2.2, type: 'dashed' },
            color: isDarkMode ? '#94a3b8' : '#475569',
            emphasis: { focus: 'series' },
          },
        ],
      };
      instanceRef.current.setOption(option, true);
    })();
    return () => { cancelled = true; };
  }, [categories, series, totalSeries, isDarkMode]);

  useEffect(() => {
    const handle = () => instanceRef.current?.resize();
    window.addEventListener('resize', handle);
    return () => {
      window.removeEventListener('resize', handle);
      if (instanceRef.current) {
        instanceRef.current.dispose();
        instanceRef.current = null;
      }
    };
  }, []);

  if (categories.length === 0) {
    return renderEmpty('No historical balance data available for this address yet.');
  }
  return <div ref={containerRef} style={{ width: '100%', height: 420 }} />;
};

const BalancesTab = ({ holdings, balanceHistory, tokenBalancesDaily = [], lendingBalancesDaily = [], isDarkMode = false }) => {
  const sorted = useMemo(
    () => [...(holdings || [])].sort((a, b) => Number(b.balance_usd || 0) - Number(a.balance_usd || 0)),
    [holdings]
  );
  const total = useMemo(
    () => sorted.reduce((acc, row) => acc + (Number(row.balance_usd) || 0), 0),
    [sorted]
  );
  const latest = useMemo(
    () => [...(balanceHistory || [])].sort((a, b) => String(b.date).localeCompare(String(a.date)))[0] || null,
    [balanceHistory]
  );

  return (
    <section className="ap-tab">
      <div className="ap-balance-hero">
        <span className="ap-balance-hero-label">Total holdings (USD)</span>
        <span className="ap-balance-hero-total">{formatCurrencyCompact(total || latest?.total_balance_usd || 0)}</span>
        <span className="ap-stat-sub">
          {sorted.length} token{sorted.length === 1 ? '' : 's'} · as of {sorted[0]?.date || latest?.date || '-'}
        </span>
      </div>

      <div className="ap-card">
        <div className="ap-card-header">
          <h3>Historical balances</h3>
          <span className="ap-header-sub">USD value per token over time · aTokens prefixed with `a`</span>
        </div>
        <BalancesHistoryChart
          tokenRows={tokenBalancesDaily}
          lendingRows={lendingBalancesDaily}
          isDarkMode={isDarkMode}
        />
      </div>
    </section>
  );
};

// Calendar-style transaction heatmap (weeks × weekday). Renders inline ECharts.
// `rows` is `[{ date, transfers }]`.
const HEATMAP_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TransactionHeatmap = ({ rows = [], windowDays = 90, isDarkMode = false }) => {
  const containerRef = useRef(null);
  const instanceRef = useRef(null);
  const [paintTick, setPaintTick] = useState(0);

  const { matrix, weekIds, weekMonthLabels, total, peak } = useMemo(() => {
    if (!rows || rows.length === 0) {
      return { matrix: [], weekIds: [], weekMonthLabels: [], total: 0, peak: 0 };
    }
    const byDate = new Map();
    let sum = 0;
    let max = 0;
    rows.forEach((r) => {
      const v = Number(r.transfers || 0);
      if (!r?.date) return;
      byDate.set(String(r.date), v);
      sum += v;
      if (v > max) max = v;
    });
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setDate(end.getDate() - (windowDays - 1));

    // Each month is its own block. Within a month, week-within-month is
    // computed from the 1st-of-month's weekday so partial first/last weeks
    // are honored. A blank "gap" column separates adjacent months.
    const isoLocal = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dd}`;
    };
    const cells = [];
    const ids = [];
    const monthLabels = [];
    let lastMonthKey = null;
    const cur = new Date(start);
    while (cur <= end) {
      const iso = isoLocal(cur);
      const v = byDate.get(iso) || 0;
      const day = cur.getDay();
      const monthKey = `${cur.getFullYear()}-${String(cur.getMonth()).padStart(2, '0')}`;
      // Day-of-week of the 1st of this month.
      const firstDow = new Date(cur.getFullYear(), cur.getMonth(), 1).getDay();
      const weekInMonth = Math.floor((cur.getDate() - 1 + firstDow) / 7);
      const colId = `${monthKey}:${weekInMonth}`;
      cells.push({ value: [colId, HEATMAP_WEEKDAYS[day], v], name: iso });

      if (monthKey !== lastMonthKey) {
        if (lastMonthKey !== null) {
          // Insert gap column between months for visual separation.
          ids.push(`gap-${ids.length}`);
          monthLabels.push('');
        }
        lastMonthKey = monthKey;
      }
      // Track every distinct (month, weekInMonth) we've encountered, in order.
      if (ids[ids.length - 1] !== colId) {
        ids.push(colId);
        // Label only the first column of each month.
        const isFirstColOfMonth = !ids
          .slice(0, -1)
          .some((id) => typeof id === 'string' && id.startsWith(`${monthKey}:`));
        monthLabels.push(
          isFirstColOfMonth ? cur.toLocaleString('default', { month: 'short' }) : ''
        );
      }
      cur.setDate(cur.getDate() + 1);
    }
    return { matrix: cells, weekIds: ids, weekMonthLabels: monthLabels, total: sum, peak: max };
  }, [rows, windowDays]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const echarts = await import('echarts');
      if (cancelled || !containerRef.current) return;
      if (!instanceRef.current) {
        if (!containerRef.current.clientWidth || !containerRef.current.clientHeight) return;
        instanceRef.current = echarts.init(containerRef.current);
      }
      const textColor = isDarkMode ? '#cbd5e1' : '#334155';
      const emptyColor = isDarkMode ? '#1e293b' : '#e2e8f0';
      const surfaceColor = isDarkMode ? '#0f172a' : '#ffffff';
      const monthByWeekId = {};
      weekIds.forEach((id, i) => { monthByWeekId[id] = weekMonthLabels[i] || ''; });
      const option = {
        backgroundColor: 'transparent',
        animation: false,
        tooltip: {
          formatter: (p) => {
            const val = Array.isArray(p.value) ? p.value[2] : p.data?.value?.[2];
            const iso = p.name || p.data?.name || '';
            return `<b>${iso}</b><br/>${val} transfer${val === 1 ? '' : 's'}`;
          },
        },
        grid: { top: 8, left: 36, right: 8, bottom: 28 },
        xAxis: {
          type: 'category',
          data: weekIds,
          position: 'bottom',
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: textColor,
            fontSize: 10,
            interval: 0,
            align: 'left',
            formatter: (v) => monthByWeekId[v] || '',
          },
          splitLine: { show: false },
        },
        yAxis: {
          type: 'category',
          data: HEATMAP_WEEKDAYS,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: textColor, fontSize: 10, interval: 1 },
          splitLine: { show: false },
          inverse: true,
        },
        visualMap: {
          show: false,
          type: 'piecewise',
          seriesIndex: 0,
          dimension: 2,
          pieces: [
            { value: 0, color: emptyColor },
            { gt: 0, lte: 1, color: '#bfdbfe' },
            { gt: 1, lte: 4, color: '#93c5fd' },
            { gt: 4, lte: 10, color: '#60a5fa' },
            { gt: 10, lte: 25, color: '#1d4ed8' },
            { gt: 25, color: '#7c3aed' },
          ],
        },
        series: [{
          type: 'heatmap',
          data: matrix,
          itemStyle: {
            borderRadius: 3,
            borderColor: surfaceColor,
            borderWidth: 3,
          },
          progressive: 0,
          emphasis: { itemStyle: { borderColor: textColor, borderWidth: 1 } },
        }],
      };
      instanceRef.current.setOption(option, true);
    })();
    return () => { cancelled = true; };
  }, [matrix, weekIds, weekMonthLabels, peak, isDarkMode, paintTick]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const handle = () => {
      if (instanceRef.current) {
        instanceRef.current.resize();
      } else if (el.clientWidth > 0 && el.clientHeight > 0) {
        // Container went from 0×0 to sized — bump paintTick so the option
        // effect re-runs and gets to call echarts.init.
        setPaintTick((n) => n + 1);
      }
    };
    const ro = new ResizeObserver(handle);
    ro.observe(el);
    window.addEventListener('resize', handle);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', handle);
      if (instanceRef.current) {
        instanceRef.current.dispose();
        instanceRef.current = null;
      }
    };
  }, []);

  if (matrix.length === 0) {
    return renderEmpty('No activity in the selected window.');
  }
  return (
    <div>
      <div className="ap-heatmap-meta">
        {total} transfer{total === 1 ? '' : 's'} · peak {peak}/day
      </div>
      <div ref={containerRef} className="ap-heatmap" style={{ width: '100%', height: 180 }} />
    </div>
  );
};

// Top-counterparty list and transaction heatmap, shown above the activity
// table. Both honour the active window selector (90d / 1y / 2y / All).
const ActivityAnalytics = ({ counterparties = [], heatmap = [], windowDays = 90, onOpenAddress, isDarkMode = false }) => {
  const list = (counterparties || []).slice(0, 20);
  return (
    <section className="ap-analytics">
      <div className="ap-card">
        <div className="ap-card-header">
          <h3>Transaction heatmap</h3>
          <span className="ap-header-sub">Daily transfer count · inbound + outbound</span>
        </div>
        <TransactionHeatmap rows={heatmap} windowDays={windowDays} isDarkMode={isDarkMode} />
      </div>
      <div className="ap-card">
        <div className="ap-card-header">
          <h3>Top counterparties</h3>
          <span className="ap-header-sub">{list.length} of {counterparties.length || 0} · grouped by transfer count</span>
        </div>
        {list.length === 0 ? renderEmpty('No counterparty data for this window yet.') : (
          <table className="ap-table ap-cp-list">
            <thead>
              <tr>
                <th>Counterparty</th>
                <th>Project</th>
                <th>Sector</th>
                <th style={{ textAlign: 'right' }}>Transfers</th>
                <th style={{ textAlign: 'right' }}>Active days</th>
                <th>Last seen</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row) => {
                const cp = String(row.counterparty || '').toLowerCase();
                const canOpen = isAddress(cp);
                return (
                  <tr key={cp}>
                    <td>
                      {canOpen ? (
                        <button
                          type="button"
                          className="table-link ap-mono"
                          onClick={() => onOpenAddress && onOpenAddress(cp)}
                          title={cp}
                        >
                          {shortIdentifier(cp)}
                        </button>
                      ) : (
                        <span className="ap-mono" title={cp}>{shortIdentifier(cp) || '-'}</span>
                      )}
                    </td>
                    <td>{row.project || '-'}</td>
                    <td>
                      {row.sector ? (
                        <span className="validator-explorer-status-pill validator-explorer-status-pill--neutral">{row.sector}</span>
                      ) : '-'}
                    </td>
                    <td style={{ textAlign: 'right' }}>{formatNumberCompact(row.transfers || 0)}</td>
                    <td style={{ textAlign: 'right' }}>{formatNumberCompact(row.active_days || 0)}</td>
                    <td>{row.last_seen || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

const ACTIVITY_WINDOW_OPTIONS = [
  { label: '90d', value: 90 },
  { label: '1y', value: 365 },
  { label: '2y', value: 730 },
  { label: 'All', value: 3650 },
];

const ActivityWindowSelector = ({ value, onChange }) => (
  <div className="ap-window-selector" role="tablist" aria-label="Activity time window">
    {ACTIVITY_WINDOW_OPTIONS.map((opt) => (
      <button
        key={opt.value}
        type="button"
        role="tab"
        aria-selected={value === opt.value}
        className={value === opt.value ? 'active' : ''}
        onClick={() => onChange(opt.value)}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const MovementsTab = ({
  movements,
  address,
  counterpartyFilter,
  onClearCounterpartyFilter,
  safesOwned = [],
  title = 'Token movements & Gnosis Pay activity',
  emptyMessage = 'No movements in the last 90 days.',
  windowDays = 90,
  onWindowChange,
  counterparties = [],
  heatmap = [],
  onOpenAddress,
  isDarkMode = false,
}) => {
  const filtered = useMemo(() => {
    if (!counterpartyFilter) return movements || [];
    const cp = String(counterpartyFilter).toLowerCase();
    return (movements || []).filter((row) => String(row.counterparty || '').toLowerCase() === cp);
  }, [movements, counterpartyFilter]);
  const windowLabel = ACTIVITY_WINDOW_OPTIONS.find((o) => o.value === windowDays)?.label || `${windowDays}d`;
  const noMovements = !movements || movements.length === 0;
  if (noMovements) {
    const safeCount = Array.isArray(safesOwned) ? safesOwned.length : 0;
    const message = safeCount > 0
      ? `No direct token movements for this address in the selected window. This address controls ${safeCount} Safe${safeCount === 1 ? '' : 's'} — see the Safes tab for activity routed through them.`
      : emptyMessage;
    return (
      <section className="ap-tab">
        <div className="ap-card">
          <div className="ap-card-header">
            <h3>{title}</h3>
            <ActivityWindowSelector value={windowDays} onChange={onWindowChange} />
          </div>
          {renderEmpty(message)}
        </div>
        <ActivityAnalytics
          counterparties={counterparties}
          heatmap={heatmap}
          windowDays={windowDays}
          onOpenAddress={onOpenAddress}
          isDarkMode={isDarkMode}
        />
      </section>
    );
  }

  return (
    <section className="ap-tab">
      <ActivityAnalytics
        counterparties={counterparties}
        heatmap={heatmap}
        windowDays={windowDays}
        onOpenAddress={onOpenAddress}
        isDarkMode={isDarkMode}
      />
      <div className="ap-card">
        <div className="ap-card-header">
          <div>
            <h3>{title}</h3>
            <span className="ap-header-sub">
              {filtered.length} of {movements.length} rows · {windowLabel}
              {counterpartyFilter ? (
              <>
                {' · filtered by '}
                <span className="ap-mono">{shortIdentifier(counterpartyFilter)}</span>
                {' '}
                <button
                  type="button"
                  className="resolution-btn"
                  onClick={onClearCounterpartyFilter}
                  style={{ marginLeft: 4, padding: '2px 8px', fontSize: 'var(--font-size-xs)' }}
                >
                  Clear
                </button>
              </>
            ) : null}
            </span>
          </div>
          <ActivityWindowSelector value={windowDays} onChange={onWindowChange} />
        </div>
        <PaginatedTable
          rows={filtered}
          rowLabel="rows"
          tableClassName="ap-table"
          renderHeader={() => (
              <tr>
                <th>Date</th>
                <th>Source</th>
                <th>Direction</th>
                <th>Token</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'right' }}>USD</th>
                <th>Counterparty</th>
              </tr>
          )}
          renderRow={(row, idx) => {
            const amountCls = row.direction === 'outflow' ? 'ap-movement-amount--outflow'
              : row.direction === 'inflow' ? 'ap-movement-amount--inflow' : '';
            return (
              <tr key={`${row.date}-${row.symbol}-${idx}`}>
                <td>{row.date}</td>
                <td><SourcePill source={row.source} /></td>
                <td><ActionPill action={row.action || row.direction} direction={row.direction} /></td>
                <td>{row.symbol}</td>
                <td style={{ textAlign: 'right' }} className={amountCls}>
                  {row.direction === 'outflow' ? '-' : ''}
                  {formatNumberCompact(row.amount || 0)}
                </td>
                <td style={{ textAlign: 'right' }}>{row.amount_usd != null ? formatCurrencyCompact(row.amount_usd) : '-'}</td>
                <td className="ap-mono" title={row.counterparty || ''}>
                  {row.counterparty ? shortIdentifier(row.counterparty) : '-'}
                </td>
              </tr>
            );
          }}
        />
      </div>
    </section>
  );
};

const SafesTab = ({ safes = [], safeOwners = [], address, onOpenAddress }) => {
  if (safes.length === 0 && safeOwners.length === 0) {
    return (
      <section className="ap-tab">
        <div className="ap-card">{renderEmpty('No Safe ownership rows found for this address.')}</div>
      </section>
    );
  }
  return (
    <section className="ap-tab">
      <div className="ap-grid-4">
        <div className="ap-stat">
          <span className="ap-stat-label">Safes owned</span>
          <span className="ap-stat-value">{formatNumberCompact(safes.length)}</span>
        </div>
        <div className="ap-stat">
          <span className="ap-stat-label">Owners of selected Safe</span>
          <span className="ap-stat-value">{formatNumberCompact(safeOwners.length)}</span>
        </div>
        <div className="ap-stat">
          <span className="ap-stat-label">Earliest owner since</span>
          <span className="ap-stat-value">
            {[...safes, ...safeOwners].map((s) => s.became_owner_at).filter(Boolean).sort()[0]?.slice(0, 10) || '-'}
          </span>
        </div>
        <div className="ap-stat">
          <span className="ap-stat-label">Avg. signer count</span>
          <span className="ap-stat-value">
            {safes.length > 0
              ? (safes.reduce((acc, s) => acc + Number(s.current_owner_count || 0), 0) / safes.length).toFixed(1)
              : '-'}
          </span>
        </div>
      </div>

      {safes.length > 0 ? (
      <div className="ap-card">
        <div className="ap-card-header">
          <h3>Safes owned by this address</h3>
          <span className="ap-header-sub">{safes.length} rows</span>
        </div>
        <PaginatedTable
          rows={safes}
          rowLabel="rows"
          tableClassName="ap-table"
          renderHeader={() => (
            <tr>
              <th>Safe</th>
              <th>Threshold</th>
              <th>Owners</th>
              <th>Became owner</th>
              <th>Deployed</th>
              <th>Version</th>
            </tr>
          )}
          renderRow={(row, idx) => (
            <tr key={`${row.safe_address}-${idx}`}>
              <td>
                <button
                  type="button"
                  className="ap-mono"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', textDecoration: 'underline' }}
                  onClick={() => onOpenAddress && onOpenAddress(String(row.safe_address).toLowerCase())}
                  title={row.safe_address}
                >
                  {shortIdentifier(row.safe_address)}
                </button>
              </td>
              <td>{row.current_threshold ?? '-'} / {row.current_owner_count ?? '-'}</td>
              <td>{row.current_owner_count ?? '-'}</td>
              <td>{row.became_owner_at ? String(row.became_owner_at).slice(0, 10) : '-'}</td>
              <td>{row.deployment_date ? String(row.deployment_date).slice(0, 10) : '-'}</td>
              <td>{row.creation_version || '-'}</td>
            </tr>
          )}
        />
      </div>
      ) : (
        <div className="ap-card">{renderEmpty('This address does not own any tracked Safes.')}</div>
      )}

      {safeOwners.length > 0 ? (
        <div className="ap-card">
          <div className="ap-card-header">
            <h3>Owners of this Safe</h3>
            <span className="ap-header-sub">{safeOwners.length} rows</span>
          </div>
          <PaginatedTable
            rows={safeOwners}
            rowLabel="rows"
            tableClassName="ap-table"
            renderHeader={() => (
              <tr>
                <th>Owner</th>
                <th>Threshold</th>
                <th>Became owner</th>
                <th>Safe</th>
              </tr>
            )}
            renderRow={(row, idx) => (
              <tr key={`${row.owner_address}-${idx}`}>
                <td>
                  <button
                    type="button"
                    className="ap-mono"
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', textDecoration: 'underline' }}
                    onClick={() => onOpenAddress && onOpenAddress(String(row.owner_address).toLowerCase())}
                    title={row.owner_address}
                  >
                    {shortIdentifier(row.owner_address)}
                  </button>
                </td>
                <td>{row.current_threshold ?? '-'}</td>
                <td>{row.became_owner_at ? String(row.became_owner_at).slice(0, 10) : '-'}</td>
                <td className="ap-mono" title={row.safe_address || address}>{shortIdentifier(row.safe_address || address)}</td>
              </tr>
            )}
          />
        </div>
      ) : (
        <div className="ap-card">{renderEmpty('This selected address is not currently recognized as a Safe with tracked owners.')}</div>
      )}
    </section>
  );
};


const formatUsd = (n) => {
  const v = Number(n || 0);
  if (Math.abs(v) >= 1000) return formatCurrencyCompact(v);
  return `$${v.toFixed(2)}`;
};

const YIELDS_PORTFOLIO_METRICS = [
  { metricId: 'api_execution_yields_user_kpi_total_lp_fees', filterField: 'wallet_address', gridColumn: '1 / span 3', minHeight: 84, band: 'kpi' },
  { metricId: 'api_execution_yields_user_kpi_lending_balance', filterField: 'wallet_address', gridColumn: '4 / span 3', minHeight: 84, band: 'kpi' },
  { metricId: 'api_execution_yields_user_kpi_active_lp_positions', filterField: 'wallet_address', gridColumn: '7 / span 3', minHeight: 84, band: 'kpi' },
  { metricId: 'api_execution_yields_user_kpi_active_lending_positions', filterField: 'wallet_address', gridColumn: '10 / span 3', minHeight: 84, band: 'kpi' },
  { metricId: 'api_execution_yields_user_fee_collections_daily', filterField: 'provider', gridColumn: '1 / span 6', minHeight: 450 },
  { metricId: 'api_execution_yields_user_lending_balances_daily', filterField: 'user_address', gridColumn: '7 / span 6', minHeight: 450 },
];

const YIELDS_KPI_METRICS = YIELDS_PORTFOLIO_METRICS.filter((item) => item.band === 'kpi');
const YIELDS_CHART_METRICS = YIELDS_PORTFOLIO_METRICS.filter((item) => item.band !== 'kpi');

// Yields data is now hoisted to AccountPortfolio so the unified Balances tab
// can read the same lending positions without a duplicate fetch. YieldsTab
// receives lp/lending/activity arrays as props; absence of all three is
// treated as the (typically very brief) loading state.
const YieldsTab = ({ address, isDarkMode, onRowClick, lp = [], lending = [], activity = [] }) => {
  const visibleMetricCount = useStaggeredCount(YIELDS_PORTFOLIO_METRICS.length, address, {
    enabled: Boolean(address),
    initialCount: 4,
    batchSize: 2,
    intervalMs: 700,
  });

  const error = null;
  const loading = false;
  const activityRows = useMemo(
    () => [...(activity || [])].sort((a, b) => {
      const bTime = new Date(b?.block_timestamp || b?.date || 0).getTime() || 0;
      const aTime = new Date(a?.block_timestamp || a?.date || 0).getTime() || 0;
      return bTime - aTime;
    }),
    [activity]
  );
  const activeLp = lp.filter((r) => r && (r.is_active === 1 || r.is_active === true || r.is_active === null));
  const activeLending = lending.filter((r) => r && Number(r.balance_usd || 0) > 0);
  const totalFees = lp.reduce((s, r) => s + Number(r?.fees_collected_usd || 0), 0);
  const totalLpIn = lp.reduce((s, r) => s + Number(r?.capital_in_usd || 0), 0);
  const totalLpOut = lp.reduce((s, r) => s + Number(r?.capital_out_usd || 0), 0);
  const activeLpTvl = activeLp.reduce((s, r) => s + Math.max(Number(r?.capital_in_usd || 0) - Number(r?.capital_out_usd || 0), 0), 0);
  const lendingBalance = activeLending.reduce((s, r) => s + Number(r?.balance_usd || 0), 0);
  const visibleKpiCount = Math.min(visibleMetricCount, YIELDS_KPI_METRICS.length);
  const visibleChartCount = Math.max(0, visibleMetricCount - YIELDS_KPI_METRICS.length);
  const weightedLendingApy = activeLending.length
    ? activeLending.reduce((s, r) => s + Number(r?.supply_apy || 0) * Number(r?.balance_usd || 0), 0) / Math.max(lendingBalance, 1)
    : 0;

  if (loading) {
    return (
      <section className="ap-tab">
        <div className="ap-card"><div className="loading-indicator"><div className="loading-spinner" /></div></div>
      </section>
    );
  }

  if (error) {
    return <section className="ap-tab"><div className="ap-card ap-card--error">{error}</div></section>;
  }

	  return (
	    <section className="account-portfolio-section account-portfolio-section--yields ap-yields" data-section-key="yields">
	      <div className="account-portfolio-section-header">
	        <h3>Yields</h3>
	      </div>
	      <div className="account-portfolio-kpi-band account-portfolio-yields-kpi-band ap-workbench-card">
        {YIELDS_KPI_METRICS.map((item, index) => (
          index < visibleKpiCount ? (
            <PortfolioMetric
              key={item.metricId}
              item={item}
              filterValue={address}
              isDarkMode={isDarkMode}
              onRowClick={onRowClick}
            />
          ) : (
            <PortfolioMetricPlaceholder key={item.metricId} item={item} />
          )
        ))}
      </div>
      <div className="account-portfolio-section-grid ap-workbench-card">
        {YIELDS_CHART_METRICS.map((item, index) => (
          index < visibleChartCount ? (
            <PortfolioMetric
              key={item.metricId}
              item={item}
              filterValue={address}
              isDarkMode={isDarkMode}
              onRowClick={onRowClick}
            />
          ) : (
            <PortfolioMetricPlaceholder key={item.metricId} item={item} />
          )
        ))}
      </div>

      {lp.length === 0 && lending.length === 0 ? (
        <div className="ap-card">{renderEmpty('No LP or lending positions for this wallet.')}</div>
      ) : null}

      <ActivityHistoryTable rows={activityRows} onRowClick={onRowClick} />

      <div className="ap-yields-summary">
        <div className="ap-yields-stat"><span>Active LP positions</span><strong>{formatNumberCompact(activeLp.length)}</strong></div>
        <div className="ap-yields-stat"><span>Active lending positions</span><strong>{formatNumberCompact(activeLending.length)}</strong></div>
        <div className="ap-yields-stat"><span>LP TVL (net)</span><strong>{formatUsd(activeLpTvl)}</strong></div>
        <div className="ap-yields-stat"><span>Lending balance</span><strong>{formatUsd(lendingBalance)}</strong></div>
        <div className="ap-yields-stat"><span>Lifetime LP fees</span><strong>{formatUsd(totalFees)}</strong></div>
        <div className="ap-yields-stat"><span>Avg lending APY</span><strong>{(weightedLendingApy).toFixed(2)}%</strong></div>
      </div>

      {lp.length > 0 ? (
        <div className="ap-card">
          <div className="ap-card-header">
            <h3>LP positions</h3>
            <span className="ap-card-subtitle">{activeLp.length} active · {lp.length} total · ${formatNumberCompact(totalLpIn)} in / ${formatNumberCompact(totalLpOut)} out</span>
          </div>
          <PaginatedTable
            rows={lp}
            rowLabel="positions"
            tableClassName="ap-table ap-table--portfolio"
            renderHeader={() => (
                <tr>
                  <th>Protocol</th>
                  <th>Pool</th>
                  <th className="num">Capital in</th>
                  <th className="num">Capital out</th>
                  <th className="num">Fees</th>
                  <th>Range</th>
                  <th>Status</th>
                  <th>Last action</th>
                </tr>
            )}
            renderRow={(r, i) => (
              <tr key={`${r.pool_address}-${i}`} onClick={() => onRowClick?.({ metricId: 'yields_lp', row: r })} className="ap-row-clickable">
                <td>{r.protocol || '—'}</td>
                <td title={r.pool_address}>{shortIdentifier(r.pool_address)}</td>
                <td className="num">{formatUsd(r.capital_in_usd)}</td>
                <td className="num">{formatUsd(r.capital_out_usd)}</td>
                <td className="num">{formatUsd(r.fees_collected_usd)}</td>
                <td>{r.tick_lower != null && r.tick_upper != null ? `${r.tick_lower} → ${r.tick_upper}` : '—'}</td>
                <td>
                  {r.is_active ? (
                    <span className={`ap-pill ${r.is_in_range ? 'ap-pill--good' : 'ap-pill--warn'}`}>
                      {r.is_in_range ? 'In range' : 'Out of range'}
                    </span>
                  ) : (
                    <span className="ap-pill ap-pill--muted">Closed</span>
                  )}
                </td>
                <td>{r.last_action_date ? String(r.last_action_date).slice(0, 10) : '—'}</td>
              </tr>
            )}
          />
        </div>
      ) : null}

      {lending.length > 0 ? (
        <div className="ap-card">
          <div className="ap-card-header">
            <h3>Lending positions</h3>
            <span className="ap-card-subtitle">{activeLending.length} active · ${formatNumberCompact(lendingBalance)} supplied</span>
          </div>
          <PaginatedTable
            rows={lending}
            rowLabel="positions"
            tableClassName="ap-table ap-table--portfolio"
            renderHeader={() => (
                <tr>
                  <th>Protocol</th>
                  <th>Asset</th>
                  <th className="num">Balance</th>
                  <th className="num">Balance USD</th>
                  <th className="num">Supply APY</th>
                  <th>Reserve</th>
                </tr>
            )}
            renderRow={(r, i) => (
              <tr key={`${r.reserve_address}-${i}`} onClick={() => onRowClick?.({ metricId: 'yields_lending', row: r })} className="ap-row-clickable">
                <td>{r.protocol || '—'}</td>
                <td>{r.symbol || '—'}</td>
                <td className="num">{formatNumberCompact(r.balance)}</td>
                <td className="num">{formatUsd(r.balance_usd)}</td>
                <td className="num">{Number(r.supply_apy || 0).toFixed(2)}%</td>
                <td title={r.reserve_address}>{shortIdentifier(r.reserve_address)}</td>
              </tr>
            )}
          />
        </div>
      ) : null}
    </section>
  );
};

const GPAY_KEPT_METRICS = [
  { metricId: 'api_execution_gpay_user_lifetime_tenure_days', filterField: 'wallet_address', gridColumn: '1 / span 4', minHeight: 120 },
  { metricId: 'api_execution_gpay_user_lifetime_inactivity_days', filterField: 'wallet_address', gridColumn: '5 / span 4', minHeight: 120 },
  { metricId: 'api_execution_gpay_user_lifetime_avg_monthly_payment_volume_usd', filterField: 'wallet_address', gridColumn: '1 / span 4', minHeight: 120 },
  { metricId: 'api_execution_gpay_user_lifetime_total_deposit_volume_usd', filterField: 'wallet_address', gridColumn: '1 / span 3', minHeight: 120 },
  { metricId: 'api_execution_gpay_user_lifetime_total_withdrawal_volume_usd', filterField: 'wallet_address', gridColumn: '4 / span 3', minHeight: 120 },
  { metricId: 'api_execution_gpay_user_total_volume', filterField: 'wallet_address', gridColumn: '7 / span 3', minHeight: 120 },
  { metricId: 'api_execution_gpay_user_lifetime_total_cashback_usd', filterField: 'wallet_address', gridColumn: '10 / span 3', minHeight: 120 },
  { metricId: 'api_execution_gpay_user_actions_radar', filterField: 'wallet_address', gridColumn: '1 / span 4', minHeight: 354 },
  { metricId: 'api_execution_gpay_user_balances_latest', filterField: 'wallet_address', gridColumn: '5 / span 4', minHeight: 450 },
  { metricId: 'api_execution_gpay_user_total_cashback', filterField: 'wallet_address', gridColumn: '9 / span 4', minHeight: 450 },
  { metricId: 'api_execution_gpay_user_activity', filterField: 'wallet_address', gridColumn: '1 / span 12', minHeight: 450 },
  { metricId: 'api_execution_gpay_user_balances_daily', filterField: 'wallet_address', gridColumn: '1 / span 12', minHeight: 450 },
  { metricId: 'api_execution_gpay_user_payments_daily', filterField: 'wallet_address', gridColumn: '1 / span 6', minHeight: 450 },
  { metricId: 'api_execution_gpay_user_cashback_daily', filterField: 'wallet_address', gridColumn: '7 / span 6', minHeight: 450 },
];

const GPayTab = ({ address, profile, roleFlags, isDarkMode, onRowClick }) => {
  // GPay-specific queries filter by wallet_address. If the selected account
  // controls a GPay Safe, pass that; otherwise use the selected address.
  const walletAddress = profile?.controlled_gpay_wallet
    || roleFlags?.controls_gpay_wallet
    || address;
  const isConfirmedGPay = hasGPayIdentity(profile, roleFlags);
  const visibleMetricCount = useStaggeredCount(GPAY_KEPT_METRICS.length, walletAddress, {
    enabled: Boolean(walletAddress && isConfirmedGPay),
    initialCount: 4,
    batchSize: 3,
    intervalMs: 700,
  });

	  if (!walletAddress || !isConfirmedGPay) {
	    return null;
	  }

	  return (
	    <section className="account-portfolio-section account-portfolio-section--gpay" data-section-key="gpay">
	      <div className="account-portfolio-section-header">
	        <h3>Gnosis Pay</h3>
	      </div>
	      <ScopeBadge
	        label={walletAddress === address ? 'Gnosis Pay wallet' : 'Controlled Gnosis Pay wallet'}
	        value={walletAddress}
	      />
	      <div className="account-portfolio-section-grid ap-workbench-card">
        {GPAY_KEPT_METRICS.map((item, index) => (
          <div
            key={item.metricId}
            className={getMetricClassName(item, index >= visibleMetricCount ? 'account-portfolio-metric--pending' : '')}
            style={{
              gridColumn: item.gridColumn,
              minHeight: item.minHeight ? `${item.minHeight}px` : undefined,
            }}
            data-metric-id={item.metricId}
            aria-hidden={index >= visibleMetricCount ? 'true' : undefined}
          >
            {index < visibleMetricCount ? (
              <SectionErrorBoundary label={item.metricId}>
                <MetricWidget
                  metricId={item.metricId}
                  isDarkMode={isDarkMode}
                  globalFilterField={item.filterField}
                  globalFilterValue={walletAddress}
                  hasGlobalFilter
                  onTableRowClick={onRowClick}
                  tableConfigOverrides={item.tableConfigOverrides}
                  tableHeight={item.tableHeight}
                />
              </SectionErrorBoundary>
            ) : (
              <div className="metric-card account-portfolio-pending-card">
                <MetricWidgetSkeleton variant={getSkeletonVariant(item)} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

const PortfolioMetric = ({ item, filterValue, isDarkMode, onRowClick, lazy = false }) => {
  const metricRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(!lazy);

  useEffect(() => {
    if (!lazy) {
      setShouldLoad(true);
      return undefined;
    }

    setShouldLoad(false);
    const node = metricRef.current;
    if (!node || typeof window === 'undefined' || typeof window.IntersectionObserver !== 'function') {
      setShouldLoad(true);
      return undefined;
    }

    const root = findScrollableAncestor(node);
    const observer = new window.IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setShouldLoad(true);
        observer.disconnect();
      }
    }, { root, rootMargin: '420px 0px' });

    observer.observe(node);
    return () => observer.disconnect();
  }, [filterValue, item.metricId, lazy]);

  return (
    <div
      ref={metricRef}
      className={getMetricClassName(item)}
      data-metric-id={item.metricId}
      style={{
        gridColumn: item.gridColumn,
        minHeight: item.minHeight ? `${item.minHeight}px` : undefined,
      }}
    >
      {shouldLoad ? (
        <SectionErrorBoundary label={item.metricId}>
          <MetricWidget
            metricId={item.metricId}
            isDarkMode={isDarkMode}
            globalFilterField={item.filterField}
            globalFilterValue={filterValue}
            hasGlobalFilter={Boolean(item.filterField && filterValue)}
            onTableRowClick={onRowClick}
            tableConfigOverrides={item.tableConfigOverrides}
            tableHeight={item.tableHeight}
          />
        </SectionErrorBoundary>
      ) : (
        <div className="metric-card account-portfolio-pending-card">
          <MetricWidgetSkeleton variant={getSkeletonVariant(item)} />
        </div>
      )}
    </div>
  );
};

const PortfolioMetricSection = ({
  sectionKey,
  title,
  items = [],
  getItemFilterValue,
  mapItem = null,
  isDarkMode,
  onRowClick,
  resetKey = '',
  stagger = false,
  lazyCharts = false,
  beforeGrid = null,
}) => {
  const kpiItems = useMemo(
    () => items.filter((item) => item.band === 'kpi'),
    [items]
  );
  const chartItems = useMemo(
    () => items.filter((item) => item.band !== 'kpi'),
    [items]
  );
  const visibleKpiCount = useStaggeredCount(kpiItems.length, `${sectionKey}:${resetKey}:kpi`, {
    enabled: stagger && kpiItems.length > 4,
    initialCount: 4,
    batchSize: 2,
    intervalMs: 700,
  });
  const visibleChartCount = useStaggeredCount(chartItems.length, `${sectionKey}:${resetKey}:charts`, {
    enabled: stagger && chartItems.length > STAGGER_BATCH_SIZE,
  });

  const renderItem = useCallback((item, isVisible = true) => {
    const effectiveItem = mapItem ? mapItem(item) : item;
    const filterValue = getItemFilterValue(effectiveItem);
    const key = `${sectionKey}-${item.metricId}-${effectiveItem.filterField || ''}`;

    if (!isVisible) {
      return (
        <PortfolioMetricPlaceholder
          key={key}
          item={effectiveItem}
        />
      );
    }

    return (
      <PortfolioMetric
        key={key}
        item={effectiveItem}
        filterValue={filterValue}
        isDarkMode={isDarkMode}
        onRowClick={onRowClick}
        lazy={lazyCharts && effectiveItem.band !== 'kpi'}
      />
    );
  }, [getItemFilterValue, isDarkMode, lazyCharts, mapItem, onRowClick, sectionKey]);

  if (items.length === 0) return null;

  return (
    <section className={`account-portfolio-section account-portfolio-section--${sectionKey}`} data-section-key={sectionKey}>
      <div className="account-portfolio-section-header">
        <h3>{title}</h3>
      </div>
      {beforeGrid}
      {kpiItems.length > 0 ? (
        <div className="account-portfolio-kpi-band ap-workbench-card">
          {kpiItems.map((item, index) => renderItem(item, index < visibleKpiCount))}
        </div>
      ) : null}
      {chartItems.length > 0 ? (
        <div className="account-portfolio-section-grid ap-workbench-card">
          {chartItems.map((item, index) => renderItem(item, index < visibleChartCount))}
        </div>
      ) : null}
    </section>
  );
};

const AccountPortfolio = ({
  isDarkMode = false,
  tabConfig = null,
  dashboard = null,
  globalFilterValue = null,
  onGlobalFilterChange,
  portfolioState = null,
  onPortfolioStateChange,
}) => {
	  const normalizedPortfolioState = useMemo(
	    () => normalizeAccountPortfolioState(portfolioState || {}),
	    [
	      portfolioState?.address,
	      portfolioState?.validatorIndex,
	      portfolioState?.withdrawalCredentials,
	    ]
	  );
  const initialSelection = useMemo(
    () => selectionFromPortfolioState(normalizedPortfolioState, globalFilterValue || ''),
    [
      normalizedPortfolioState.address,
      normalizedPortfolioState.validatorIndex,
      normalizedPortfolioState.withdrawalCredentials,
      globalFilterValue,
    ]
  );

  const [selectedAccount, setSelectedAccount] = useState(initialSelection);
  const [profile, setProfile] = useState(null);
  const [linkedEntities, setLinkedEntities] = useState([]);
  const [activitySummary, setActivitySummary] = useState(null);
  const [tokenBalances, setTokenBalances] = useState([]);
  const [balanceHistory, setBalanceHistory] = useState([]);
  const [roleFlags, setRoleFlags] = useState(null);
  const [circlesAvatar, setCirclesAvatar] = useState(null);
  const [safesOwned, setSafesOwned] = useState([]);
  const [safeOwners, setSafeOwners] = useState([]);
	  const [movements, setMovements] = useState([]);
  const [lpPositions, setLpPositions] = useState([]);
  const [lendingPositions, setLendingPositions] = useState([]);
  const [yieldsActivity, setYieldsActivity] = useState([]);
  const [circlesTotalBalance, setCirclesTotalBalance] = useState(null);
  const [tokenBalancesDaily, setTokenBalancesDaily] = useState([]);
  const [activityWindowDays, setActivityWindowDays] = useState(90);
  const [counterparties, setCounterparties] = useState([]);
  const [activityHeatmap, setActivityHeatmap] = useState([]);
  const [activityTotals, setActivityTotals] = useState(null);
  const [lendingBalancesDaily, setLendingBalancesDaily] = useState([]);
	  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [scope, setScope] = useState('selected');
  const [activeSection, setActiveSection] = useState(initialSelection?.preferredTab || 'overview');
  const [drawer, setDrawer] = useState(null);
  const [counterpartyFilter, setCounterpartyFilter] = useState(null);
  const [embeddedValidatorState, setEmbeddedValidatorState] = useState(null);

  const handleFilterCounterparty = useCallback((cp) => {
    setCounterpartyFilter(cp || null);
    setActiveSection('activity');
  }, []);
  const clearCounterpartyFilter = useCallback(() => setCounterpartyFilter(null), []);

  useEffect(() => {
    const selection = selectionFromPortfolioState(normalizedPortfolioState, globalFilterValue || '');
    setSelectedAccount((previous) => {
      const changed = selection
        ? (
            selection.address !== previous?.address ||
            selection.withdrawalCredentials !== previous?.withdrawalCredentials ||
            selection.validatorIndex !== previous?.validatorIndex
          )
        : Boolean(previous);
      return changed ? selection : previous;
    });

	  }, [
	    globalFilterValue,
	    normalizedPortfolioState.address,
	    normalizedPortfolioState.validatorIndex,
	    normalizedPortfolioState.withdrawalCredentials,
	  ]);

  const address = selectedAccount?.address || '';
  const validatorOnlySelection = Boolean(selectedAccount && !address && isValidatorSelection(selectedAccount));
  const baseValidatorExplorerState = useMemo(
    () => validatorExplorerStateFromSelection(selectedAccount),
    [
      selectedAccount?.sourceType,
      selectedAccount?.validatorIndex,
      selectedAccount?.withdrawalCredentials,
    ]
  );
  const activeValidatorExplorerState = useMemo(() => {
    const localState = normalizeValidatorExplorerState(embeddedValidatorState || {});
    const hasSameValidator = localState.explorerMode === 'validator' &&
      localState.validatorIndex === baseValidatorExplorerState.validatorIndex;
    const hasSameCredential = localState.explorerMode === 'credential' &&
      localState.withdrawalCredentials === baseValidatorExplorerState.withdrawalCredentials;
    return hasSameValidator || hasSameCredential ? localState : baseValidatorExplorerState;
  }, [baseValidatorExplorerState, embeddedValidatorState]);

  useEffect(() => {
    setEmbeddedValidatorState(null);
  }, [selectedAccount?.validatorIndex, selectedAccount?.withdrawalCredentials]);

  const syntheticSafeLinks = useMemo(
    () => buildSyntheticSafeLinks(address, safesOwned, safeOwners, profile, roleFlags),
    [address, safesOwned, safeOwners, profile, roleFlags]
  );
  const effectiveLinkedEntities = useMemo(
    () => mergeLinkedRows(linkedEntities, syntheticSafeLinks),
    [linkedEntities, syntheticSafeLinks]
  );

  const groupAddresses = useMemo(
    () => toAddressList(address, effectiveLinkedEntities, profile),
    [address, effectiveLinkedEntities, profile]
  );

  const selectedFilterValue = address || '';
  const linkedFilterValue = groupAddresses.join(',');
  const activeAddressFilterValue = scope === 'linked' && linkedFilterValue ? linkedFilterValue : selectedFilterValue;
  const effectiveTokenBalances = useMemo(
    () => buildEffectiveHoldings(tokenBalances, balanceHistory),
    [tokenBalances, balanceHistory]
  );

  const unifiedHoldings = useMemo(
    () => buildUnifiedHoldings(effectiveTokenBalances, lendingPositions, circlesTotalBalance),
    [effectiveTokenBalances, lendingPositions, circlesTotalBalance]
  );

  // Merge ERC-20 movements with lending Supply/Withdraw/Repay/Borrow events so the
  // Activity tab shows the full chronological story for accounts that hold aTokens.
  // yieldsActivity rows already carry block_timestamp + transaction_hash; we just
  // need to map them onto the MovementsTab row shape (direction + counterparty).
  const unifiedMovements = useMemo(() => {
    const lendingDirectionFor = (action) => {
      const a = String(action || '').toLowerCase();
      if (a === 'supply' || a === 'repay' || a === 'deposit') return 'outflow';
      if (a === 'withdraw' || a === 'borrow' || a === 'redeem') return 'inflow';
      return null;
    };
    const lendingRows = (yieldsActivity || []).map((row) => ({
      date: row.date || (row.block_timestamp ? String(row.block_timestamp).slice(0, 10) : null),
      block_timestamp: row.block_timestamp || null,
      transaction_hash: row.transaction_hash || null,
      source: row.source || 'lending',
      action: row.action || '',
      direction: lendingDirectionFor(row.action),
      symbol: row.token_symbol || '',
      token_address: row.token_address || '',
      amount: row.amount,
      amount_usd: row.amount_usd,
      counterparty: row.protocol || row.position_address || '',
    }));
    const combined = [...(movements || []), ...lendingRows];
    return combined.sort((a, b) => {
      const ad = String(a?.block_timestamp || a?.date || '');
      const bd = String(b?.block_timestamp || b?.date || '');
      return bd.localeCompare(ad);
    });
  }, [movements, yieldsActivity]);

  useEffect(() => {
    if (!address) {
      setProfile(null);
      setLinkedEntities([]);
      setActivitySummary(null);
      setTokenBalances([]);
      setBalanceHistory([]);
      setRoleFlags(null);
      setCirclesAvatar(null);
      setSafesOwned([]);
      setSafeOwners([]);
      setMovements([]);
      setLpPositions([]);
      setLendingPositions([]);
      setYieldsActivity([]);
      setCirclesTotalBalance(null);
      setTokenBalancesDaily([]);
      setLendingBalancesDaily([]);
      setCounterparties([]);
      setActivityHeatmap([]);
      setActivityTotals(null);
      setProfileError('');
      setProfileLoading(false);
      return undefined;
    }

	    let cancelled = false;
	    setProfileLoading(true);
	    setProfileError('');
	    setLinkedEntities([]);
	    setActivitySummary(null);
	    setTokenBalances([]);
	    setBalanceHistory([]);
	    setSafesOwned([]);
	    setSafeOwners([]);
	    setMovements([]);
    setLpPositions([]);
    setLendingPositions([]);
    setYieldsActivity([]);
    setCirclesTotalBalance(null);
    setTokenBalancesDaily([]);
    setLendingBalancesDaily([]);

    // Fire each data stream independently so the hero card renders as soon
    // as the cheap resolver + role-flags + safes queries return.
    const fire = (promise, setter, fallback) => promise
      .then((value) => { if (!cancelled) setter(value ?? fallback); })
      .catch(() => { if (!cancelled) setter(fallback); });
    const timers = [];

    // One coalesced request returns profile + linkedEntities + activitySummary
    // + roleFlags + circlesAvatar. Falls back to per-section getters if the
    // batch endpoint is unavailable (older deployments or local dev).
    const overviewPromise = accountPortfolioService.getOverview(address);
    const profilePromise = overviewPromise.then((bundle) => {
      if (bundle && bundle.profile) return bundle.profile;
      return accountPortfolioService.getProfile(address);
    });

    fire(profilePromise, (v) => setProfile(v || { address, display_name: address }), { address, display_name: address });

    fire(
      overviewPromise.then((bundle) => bundle?.roleFlags ?? accountPortfolioService.getRoleFlags(address)),
      setRoleFlags,
      null
    );
    fire(
      overviewPromise.then((bundle) => bundle?.circlesAvatar ?? accountPortfolioService.getCirclesAvatarMetadata(address)),
      setCirclesAvatar,
      null
    );

    timers.push(window.setTimeout(() => {
      fire(accountPortfolioService.getSafes(address), (v) => setSafesOwned(Array.isArray(v) ? v : []), []);
      fire(accountPortfolioService.getSafeOwners(address), (v) => setSafeOwners(Array.isArray(v) ? v : []), []);
      fire(
        overviewPromise.then((bundle) => {
          if (bundle && Array.isArray(bundle.linkedEntities) && bundle.linkedEntities.length > 0) return bundle.linkedEntities;
          return accountPortfolioService.getLinkedEntities(address);
        }),
        (v) => setLinkedEntities(Array.isArray(v) ? v : []),
        []
      );
    }, 250));

	    timers.push(window.setTimeout(() => {
	      fire(
	        overviewPromise.then((bundle) => bundle?.activitySummary ?? accountPortfolioService.getActivitySummary(address)),
	        setActivitySummary,
	        null
	      );
	      fire(accountPortfolioService.getHoldings(address), (v) => setTokenBalances(Array.isArray(v) ? v : []), []);
	    }, 650));

	    timers.push(window.setTimeout(() => {
	      fire(accountPortfolioService.getBalanceHistory(address), (v) => setBalanceHistory(Array.isArray(v) ? v : []), []);
	    }, 900));

    // (Movements + counterparties + activity heatmap are loaded by the
    // activity-window effect below — they re-fetch when the user changes the
    // 90d / 1y / 2y / All selector inside the Activity tab.)

    // Yields (LP + lending) — hoisted so the unified Balances tab can show
    // aTokens alongside ERC-20 holdings without each tab fetching separately.
    timers.push(window.setTimeout(() => {
      fire(
        accountPortfolioService.getYields(address),
        (v) => {
          setLpPositions(Array.isArray(v?.lp) ? v.lp : []);
          setLendingPositions(Array.isArray(v?.lending) ? v.lending : []);
          setYieldsActivity(Array.isArray(v?.activity) ? v.activity : []);
        },
        { lp: [], lending: [], activity: [] }
      );
    }, 900));

    // Per-token historical balances — feeds the multi-line chart on the
    // Balances tab. Light-weight view; loaded on the same tier as movements.
    timers.push(window.setTimeout(() => {
      fire(accountPortfolioService.getTokenBalancesDaily(address), (v) => setTokenBalancesDaily(Array.isArray(v) ? v : []), []);
      fire(accountPortfolioService.getLendingBalancesDaily(address), (v) => setLendingBalancesDaily(Array.isArray(v) ? v : []), []);
    }, 1100));

	    // Unblock the loading gate as soon as the resolver lands (< 500 ms) so
	    // the hero and sections paint while heavier streams load later.
	    profilePromise
	      .then(() => { if (!cancelled) setProfileLoading(false); })
      .catch(() => { if (!cancelled) setProfileLoading(false); });

    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
	    };
	  }, [address]);

  // Circles aggregated balance — fires once we know the avatar address. Gated
  // on circles identity so we don't ping the metric for every wallet.
  useEffect(() => {
    let cancelled = false;
    const avatarAddress = circlesAvatar?.avatar
      || (hasCirclesIdentity(profile, roleFlags, selectedAccount) ? address : null);
    if (!avatarAddress) {
      setCirclesTotalBalance(null);
      return undefined;
    }
    accountPortfolioService.getCirclesTotalBalance(avatarAddress)
      .then((v) => { if (!cancelled) setCirclesTotalBalance(v || null); })
      .catch(() => { if (!cancelled) setCirclesTotalBalance(null); });
    return () => { cancelled = true; };
  }, [circlesAvatar?.avatar, profile, roleFlags, selectedAccount, address]);

  // Activity-window-bound fetches: movements (table), counterparties, and the
  // transaction heatmap. Re-runs whenever the address or the user's selected
  // window (90d / 1y / 2y / All) changes.
  useEffect(() => {
    if (!address) {
      setMovements([]);
      setCounterparties([]);
      setActivityHeatmap([]);
      setActivityTotals(null);
      return undefined;
    }
    let cancelled = false;
    const days = activityWindowDays;
    accountPortfolioService.getMovements(address, { days, includeGPay: true })
      .then((v) => { if (!cancelled) setMovements(Array.isArray(v) ? v : []); })
      .catch(() => { if (!cancelled) setMovements([]); });
    accountPortfolioService.getCounterparties(address, { days })
      .then((v) => { if (!cancelled) setCounterparties(Array.isArray(v) ? v : []); })
      .catch(() => { if (!cancelled) setCounterparties([]); });
    accountPortfolioService.getActivityHeatmap(address, { days })
      .then((v) => { if (!cancelled) setActivityHeatmap(Array.isArray(v) ? v : []); })
      .catch(() => { if (!cancelled) setActivityHeatmap([]); });
    accountPortfolioService.getActivityTotals(address, { days })
      .then((v) => { if (!cancelled) setActivityTotals(v || null); })
      .catch(() => { if (!cancelled) setActivityTotals(null); });
    return () => { cancelled = true; };
  }, [address, activityWindowDays]);

	  const handleSelect = useCallback((selection) => {
	    setSelectedAccount(selection);
	    setProfile(null);
    setLinkedEntities([]);
    setActivitySummary(null);
    setTokenBalances([]);
    setBalanceHistory([]);
    setRoleFlags(null);
    setCirclesAvatar(null);
    setSafesOwned([]);
    setSafeOwners([]);
    setMovements([]);
    setLpPositions([]);
    setLendingPositions([]);
    setYieldsActivity([]);
    setCirclesTotalBalance(null);
    setTokenBalancesDaily([]);
    setLendingBalancesDaily([]);
    setActivityWindowDays(90);
    setCounterparties([]);
    setActivityHeatmap([]);
    setActivityTotals(null);
    setDrawer(null);
    setCounterpartyFilter(null);
    setEmbeddedValidatorState(null);
    setActiveSection(selection?.preferredTab || 'overview');
    if (typeof onPortfolioStateChange === 'function') {
      onPortfolioStateChange(accountPortfolioStateFromSelection(selection));
	    } else if (typeof onGlobalFilterChange === 'function') {
	      onGlobalFilterChange(selection?.address || selection?.withdrawalCredentials || selection?.validatorIndex || '');
	    }
  }, [onGlobalFilterChange, onPortfolioStateChange]);

  const handleEmbeddedValidatorStateChange = useCallback((nextStateOrUpdater) => {
    const previousState = activeValidatorExplorerState;
    const nextState = normalizeValidatorExplorerState(
      typeof nextStateOrUpdater === 'function'
        ? nextStateOrUpdater(previousState)
        : nextStateOrUpdater
    );
    setEmbeddedValidatorState(nextState);

    const nextSelection = accountSelectionFromValidatorExplorerState(nextState);
    if (!nextSelection) return;

    setSelectedAccount(nextSelection);
    setDrawer(null);
    setCounterpartyFilter(null);
    setActiveSection('validators');
    if (typeof onPortfolioStateChange === 'function') {
      onPortfolioStateChange(accountPortfolioStateFromSelection(nextSelection));
	    }
	  }, [activeValidatorExplorerState, onPortfolioStateChange]);

	  const handleOpenAddress = useCallback((nextAddress) => {
    const selection = normalizeAccountSelection({
      resultType: 'address',
      address: nextAddress,
      displayLabel: nextAddress,
    });
    handleSelect(selection);
  }, [handleSelect]);

  const getItemFilterValue = useCallback((item) => {
    if (!item?.filterField) return '';
    if (item.scope === 'selected') return selectedFilterValue;

    if (item.filterField === 'wallet_address') {
      const gpayWallet = profile?.controlled_gpay_wallet || selectedFilterValue;
      if (scope === 'linked') {
        return Array.from(new Set([gpayWallet, ...groupAddresses].filter(Boolean))).join(',');
      }
      return gpayWallet;
    }

    if (item.filterField === 'withdrawal_credentials') {
      return selectedAccount?.withdrawalCredentials || '';
    }

    if (item.metricId === 'api_consensus_validators_explorer_members_table') {
      if (selectedAccount?.validatorIndex) return selectedAccount.validatorIndex;
      if (selectedAccount?.withdrawalCredentials) return selectedAccount.withdrawalCredentials;
      return activeAddressFilterValue;
    }

    return activeAddressFilterValue;
  }, [activeAddressFilterValue, groupAddresses, profile?.controlled_gpay_wallet, scope, selectedAccount?.validatorIndex, selectedAccount?.withdrawalCredentials, selectedFilterValue]);

	  const sectionFlags = useMemo(() => {
	    const p = profile || {};
	    const r = roleFlags || {};
	    return {
	      hasValidators: hasValidatorIdentity(p, r, selectedAccount) || hasValidatorLinkedEntity(effectiveLinkedEntities),
	      hasCircles: hasCirclesIdentity(p, r, selectedAccount) || Boolean(circlesAvatar?.avatar),
	      hasGpay: hasGPayIdentity(p, r),
	      hasGnosisApp: Boolean(p.is_gnosis_app_user) || Boolean(r.is_ga_user),
	      hasYields: Boolean(p.is_lp_provider || p.is_lending_user || p.has_yield_activity) ||
	        Boolean(r.is_lp_provider || r.is_lending_user) ||
	        (lpPositions?.length > 0) ||
	        (lendingPositions?.length > 0),
	      hasSafe: Boolean(p.is_safe || p.is_safe_owner) ||
	        Number(p.linked_safe_count || p.connected_safe_count || 0) > 0 ||
	        Boolean(r.is_safe || r.is_safe_owner) ||
	        (safesOwned && safesOwned.length > 0) ||
	        (safeOwners && safeOwners.length > 0),
	    };
	  }, [
	    profile,
	    roleFlags,
	    circlesAvatar,
	    safesOwned,
	    safeOwners,
	    lpPositions,
	    lendingPositions,
	    selectedAccount?.sourceType,
	    selectedAccount?.validatorIndex,
	    selectedAccount?.withdrawalCredentials,
	    effectiveLinkedEntities,
	  ]);
	  const metricSectionResetKey = `${activeAddressFilterValue}:${selectedAccount?.validatorIndex || ''}:${selectedAccount?.withdrawalCredentials || ''}`;
  const validatorFilterBadge = useMemo(() => {
    if (!sectionFlags.hasValidators) return null;
	    if (selectedAccount?.validatorIndex) {
	      return (
	        <div className="account-portfolio-filter-badge">
	          Filtered by <strong>validator index</strong> <span className="ap-mono">#{selectedAccount.validatorIndex}</span>
	        </div>
	      );
	    }
	    if (selectedAccount?.withdrawalCredentials) {
	      const withdrawalAddress = withdrawalAddressFromCredential(selectedAccount.withdrawalCredentials);
	      return (
	        <div className="account-portfolio-filter-badge">
	          Filtered by <strong>withdrawal credentials</strong> <span className="ap-mono">{shortIdentifier(selectedAccount.withdrawalCredentials)}</span>
	          {withdrawalAddress ? <span> withdrawal address <span className="ap-mono">{shortIdentifier(withdrawalAddress)}</span></span> : null}
	        </div>
	      );
	    }
	    if (address) {
	      return (
	        <div className="account-portfolio-filter-badge">
	          Filtered by <strong>withdrawal address</strong> <span className="ap-mono">{shortIdentifier(address)}</span>
	          <span> credential <span className="ap-mono">{shortIdentifier(withdrawalCredentialFromAddress(address))}</span></span>
	        </div>
	      );
	    }
    return null;
  }, [address, sectionFlags.hasValidators, selectedAccount?.validatorIndex, selectedAccount?.withdrawalCredentials]);
  const visibleSections = useMemo(
    () => ACCOUNT_PORTFOLIO_SECTIONS.filter((section) => section.always || sectionFlags[section.flag]),
    [sectionFlags]
  );

  useEffect(() => {
    if (!visibleSections.some((section) => section.id === activeSection)) {
      setActiveSection('overview');
    }
  }, [activeSection, visibleSections]);

  const emptyCopy = tabConfig?.emptyState || {};

  // Stage 2: derive empty-state for the search/idle/validating/empty-results card.
  // Only mark 'empty-results' once we are certain every dependent loader has settled
  // (profileLoading=false AND roleFlags has been populated). Without that guard,
  // setProfile() can land in React's render cycle a beat before setRoleFlags()/
  // setSafesOwned(), causing a flash of "no results" between the two state writes.
  const apEmptyState = (() => {
    if (!selectedAccount) return 'idle';
    if (validatorOnlySelection) return 'validator-only';
    if (profileLoading && !profile) return 'validating';
    if (
      !profileLoading
      && profile
      && roleFlags !== null
      && !Object.values(sectionFlags).some(Boolean)
    ) {
      return 'empty-results';
    }
    return 'loaded';
  })();

  return (
    <div className="account-portfolio">
      <DashboardHeader dashboard={dashboard} tabConfig={tabConfig}>
        <div className="account-portfolio-header-toolbar">
          <AccountSearch
            value={selectedAccount?.displayLabel || selectedAccount?.address ||
              selectedAccount?.withdrawalCredentials || selectedAccount?.validatorIndex ||
              globalFilterValue || ''}
            onSelect={handleSelect}
          />
        </div>
      </DashboardHeader>

      {apEmptyState === 'idle' ? (
        <div className="validator-explorer-empty">
          <div className="validator-explorer-empty-card ap-empty-card ap-empty-card--idle">
            <p className="validator-explorer-empty-eyebrow">Account Portfolio</p>
            <h2 className="validator-explorer-empty-title">{emptyCopy.title || 'Explore an account'}</h2>
            <p className="validator-explorer-empty-description">
              {emptyCopy.description || 'Search any wallet, Safe, Circles name, validator, or withdrawal credential.'}
            </p>
          </div>
        </div>
      ) : apEmptyState === 'validating' ? (
        <div className="validator-explorer-empty">
          <div className="validator-explorer-empty-card ap-empty-card ap-empty-card--validating">
            <p className="validator-explorer-empty-eyebrow">Account Portfolio · validating</p>
            <h2 className="validator-explorer-empty-title">
              {emptyCopy.validatingTitle || 'Checking address…'}
            </h2>
            <p className="validator-explorer-empty-description">
              {emptyCopy.validatingDescription || 'Looking up production data for this selection.'}
            </p>
            <div className="loading-indicator ap-empty-card__spinner" role="status" aria-live="polite">
              <div className="loading-spinner" />
            </div>
          </div>
        </div>
      ) : apEmptyState === 'empty-results' ? (
        <div className="validator-explorer-empty">
          <div className="validator-explorer-empty-card ap-empty-card ap-empty-card--not-found">
            <p className="validator-explorer-empty-eyebrow">Account Portfolio · no results</p>
            <h2 className="validator-explorer-empty-title">
              {emptyCopy.emptyResultsTitle || 'No production data for this address'}
            </h2>
            <p className="validator-explorer-empty-description">
              {emptyCopy.emptyResultsDescription || 'Try another address.'}
            </p>
            <div className="ap-empty-card__actions">
              <button type="button" className="button secondary" onClick={() => handleSelect(null)}>
                Clear search
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="account-portfolio-body">
          {validatorOnlySelection ? (
            <ValidatorExplorer
              isDarkMode={isDarkMode}
              tabConfig={{
                ...tabConfig,
                emptyState: {
                  title: 'Explore a validator or operator',
                  description: 'Validator selections use Validator Explorer metrics inside Account Portfolio.',
                },
              }}
              dashboard={dashboard}
              explorerState={activeValidatorExplorerState}
              onExplorerStateChange={handleEmbeddedValidatorStateChange}
              hideHeader
            />
          ) : profileLoading && !profile ? (
            <div className="validator-explorer-empty">
              <div className="loading-indicator" role="status" aria-live="polite">
                <div className="loading-spinner" />
              </div>
            </div>
          ) : (
            <>
              {profileError ? (
                <div className="account-portfolio-inline-error">{profileError}</div>
              ) : null}

              <AccountSummaryCard
                address={address}
                profile={profile || {}}
                selection={selectedAccount}
                scope={scope}
                onScopeChange={setScope}
                linkedCount={effectiveLinkedEntities.length}
                linkedEntities={effectiveLinkedEntities}
                activitySummary={activitySummary}
                tokenBalances={effectiveTokenBalances}
                balanceHistory={balanceHistory}
                roleFlags={roleFlags}
                circlesAvatar={circlesAvatar}
                safesOwned={safesOwned}
                movements={unifiedMovements}
                lendingPositions={lendingPositions}
                circlesTotalBalance={circlesTotalBalance}
                activityTotals={activityTotals}
                activityWindowDays={activityWindowDays}
              />

	              <nav className="account-portfolio-section-tabs" role="tablist" aria-label="Account portfolio sections">
	                {visibleSections.map((section) => (
	                  <button
	                    key={section.id}
	                    type="button"
	                    role="tab"
	                    aria-selected={activeSection === section.id}
	                    className={`account-portfolio-section-tab ${activeSection === section.id ? 'active' : ''}`}
	                    onClick={() => setActiveSection(section.id)}
	                  >
	                    {section.title}
	                  </button>
	                ))}
	              </nav>

	              <div className="account-portfolio-section-panel" role="tabpanel">
	                {activeSection === 'overview' ? (
	                  <AccountOverview
	                    address={address}
	                    profile={profile || {}}
	                    roleFlags={roleFlags}
	                    selection={selectedAccount}
	                    linkedEntities={effectiveLinkedEntities}
	                    activitySummary={activitySummary}
	                    tokenBalances={effectiveTokenBalances}
	                    holdings={unifiedHoldings}
	                    balanceHistory={balanceHistory}
	                    movements={unifiedMovements}
	                    onRowClick={setDrawer}
	                    activityTotals={activityTotals}
	                    activityWindowDays={activityWindowDays}
	                  />
	                ) : activeSection === 'balances' ? (
	                  <BalancesTab
	                    holdings={unifiedHoldings}
	                    balanceHistory={balanceHistory}
	                    tokenBalancesDaily={tokenBalancesDaily}
	                    lendingBalancesDaily={lendingBalancesDaily}
	                    isDarkMode={isDarkMode}
	                  />
	                ) : activeSection === 'activity' ? (
	                  <MovementsTab
	                    movements={unifiedMovements}
	                    address={address}
	                    safesOwned={safesOwned}
	                    isDarkMode={isDarkMode}
	                    onRowClick={setDrawer}
	                    counterpartyFilter={counterpartyFilter}
	                    onClearCounterpartyFilter={clearCounterpartyFilter}
	                    title="Recent account activity"
	                    emptyMessage="No recent account activity for this address."
	                    windowDays={activityWindowDays}
	                    onWindowChange={setActivityWindowDays}
	                    counterparties={counterparties}
	                    heatmap={activityHeatmap}
	                    onOpenAddress={handleOpenAddress}
	                  />
	                ) : activeSection === 'safes' && sectionFlags.hasSafe ? (
	                  <SafesTab
	                    address={address}
	                    safes={safesOwned}
	                    safeOwners={safeOwners}
	                    onOpenAddress={handleOpenAddress}
	                  />
	                ) : activeSection === 'yields' && sectionFlags.hasYields ? (
	                  <YieldsTab
	                    address={profile?.controlled_gpay_wallet || roleFlags?.controls_gpay_wallet || address}
	                    isDarkMode={isDarkMode}
	                    onRowClick={setDrawer}
	                    lp={lpPositions}
	                    lending={lendingPositions}
	                    activity={yieldsActivity}
	                  />
	                ) : activeSection === 'circles' && sectionFlags.hasCircles ? (
	                  <PortfolioMetricSection
	                    sectionKey="circles"
	                    title="Circles"
	                    items={CIRCLES_METRICS}
	                    getItemFilterValue={getItemFilterValue}
	                    isDarkMode={isDarkMode}
	                    onRowClick={setDrawer}
	                    resetKey={metricSectionResetKey}
	                    stagger
	                    lazyCharts
	                  />
	                ) : activeSection === 'gpay' && sectionFlags.hasGpay ? (
	                  <GPayTab
	                    address={address}
	                    profile={profile}
	                    roleFlags={roleFlags}
	                    isDarkMode={isDarkMode}
	                    onRowClick={setDrawer}
	                  />
	                ) : activeSection === 'gnosis-app' && sectionFlags.hasGnosisApp ? (
	                  <PortfolioMetricSection
	                    sectionKey="gnosis-app"
	                    title="Gnosis App"
	                    items={GNOSIS_APP_METRICS}
	                    getItemFilterValue={getItemFilterValue}
	                    isDarkMode={isDarkMode}
	                    onRowClick={setDrawer}
	                    resetKey={metricSectionResetKey}
	                    lazyCharts
	                  />
	                ) : activeSection === 'validators' && sectionFlags.hasValidators ? (
	                  <PortfolioMetricSection
	                    sectionKey="validators"
	                    title="Validators"
	                    items={VALIDATOR_METRICS}
	                    getItemFilterValue={getItemFilterValue}
	                    mapItem={(item) => item.metricId === 'api_consensus_validators_explorer_members_table'
	                      ? {
	                          ...item,
	                          filterField: selectedAccount?.validatorIndex
	                            ? 'validator_index'
	                            : selectedAccount?.withdrawalCredentials
	                              ? 'withdrawal_credentials'
	                              : 'withdrawal_address',
	                        }
	                      : item}
	                    isDarkMode={isDarkMode}
	                    onRowClick={setDrawer}
	                    resetKey={metricSectionResetKey}
	                    stagger
	                    lazyCharts
	                    beforeGrid={validatorFilterBadge}
	                  />
	                ) : null}
	              </div>
	            </>
	          )}
        </div>
      )}

      <AccountDetailDrawer
        item={drawer}
        onClose={() => setDrawer(null)}
        onSelectAddress={handleOpenAddress}
      />
    </div>
  );
};

export default AccountPortfolio;

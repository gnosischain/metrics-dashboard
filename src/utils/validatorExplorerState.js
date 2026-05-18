const VALID_MODES = new Set(['validator', 'credential']);
const MAX_COMPARE = 5;

const normalizeString = (value) => {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
};

const normalizeValidatorIndex = (value) => {
  const normalized = normalizeString(value);
  if (!normalized || !/^\d+$/.test(normalized)) {
    return null;
  }
  return normalized;
};

const normalizeWithdrawalCredentials = (value) => {
  const normalized = normalizeString(value);
  if (!normalized) return null;
  return normalized.toLowerCase();
};

const normalizeCompare = (value) => {
  const rawValues = Array.isArray(value)
    ? value
    : String(value || '').split(',');

  const seen = new Set();
  const normalized = [];

  rawValues.forEach((entry) => {
    const candidate = normalizeValidatorIndex(entry);
    if (!candidate || seen.has(candidate)) return;
    seen.add(candidate);
    normalized.push(candidate);
  });

  return normalized.slice(0, MAX_COMPARE);
};

export const EMPTY_VALIDATOR_EXPLORER_STATE = Object.freeze({
  explorerMode: null,
  validatorIndex: null,
  withdrawalCredentials: null,
  compare: []
});

export const normalizeValidatorExplorerState = (input = {}) => {
  const modeInput = normalizeString(input.explorerMode);
  let explorerMode = VALID_MODES.has(modeInput) ? modeInput : null;
  let validatorIndex = normalizeValidatorIndex(input.validatorIndex);
  let withdrawalCredentials = normalizeWithdrawalCredentials(input.withdrawalCredentials);
  let compare = normalizeCompare(input.compare);

  if (!explorerMode) {
    explorerMode = validatorIndex
      ? 'validator'
      : (withdrawalCredentials ? 'credential' : null);
  }

  if (explorerMode === 'validator') {
    withdrawalCredentials = null;
    compare = [];
    if (!validatorIndex) {
      explorerMode = null;
    }
  }

  if (explorerMode === 'credential') {
    validatorIndex = null;
    if (!withdrawalCredentials) {
      explorerMode = null;
      compare = [];
    }
  }

  if (!explorerMode) {
    return { ...EMPTY_VALIDATOR_EXPLORER_STATE };
  }

  return {
    explorerMode,
    validatorIndex,
    withdrawalCredentials,
    compare
  };
};

export const parseValidatorExplorerState = (params) => {
  if (!params || typeof params.get !== 'function') {
    return { ...EMPTY_VALIDATOR_EXPLORER_STATE };
  }

  return normalizeValidatorExplorerState({
    explorerMode: params.get('explorerMode'),
    validatorIndex: params.get('validator_index'),
    withdrawalCredentials: params.get('withdrawal_credentials'),
    compare: params.get('compare')
  });
};

export const applyValidatorExplorerStateToParams = (params, state) => {
  if (!params || typeof params.set !== 'function' || typeof params.delete !== 'function') {
    return;
  }

  const normalized = normalizeValidatorExplorerState(state);

  params.delete('explorerMode');
  params.delete('validator_index');
  params.delete('withdrawal_credentials');
  params.delete('compare');

  if (!normalized.explorerMode) {
    return;
  }

  params.set('explorerMode', normalized.explorerMode);

  if (normalized.explorerMode === 'validator' && normalized.validatorIndex) {
    params.set('validator_index', normalized.validatorIndex);
  }

  if (normalized.explorerMode === 'credential' && normalized.withdrawalCredentials) {
    params.set('withdrawal_credentials', normalized.withdrawalCredentials);
    if (normalized.compare.length > 0) {
      params.set('compare', normalized.compare.join(','));
    }
  }
};

export const validatorExplorerStatesEqual = (left, right) => {
  const normalizedLeft = normalizeValidatorExplorerState(left);
  const normalizedRight = normalizeValidatorExplorerState(right);

  return normalizedLeft.explorerMode === normalizedRight.explorerMode &&
    normalizedLeft.validatorIndex === normalizedRight.validatorIndex &&
    normalizedLeft.withdrawalCredentials === normalizedRight.withdrawalCredentials &&
    normalizedLeft.compare.join(',') === normalizedRight.compare.join(',');
};

export default {
  EMPTY_VALIDATOR_EXPLORER_STATE,
  normalizeValidatorExplorerState,
  parseValidatorExplorerState,
  applyValidatorExplorerStateToParams,
  validatorExplorerStatesEqual
};

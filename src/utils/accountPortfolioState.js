const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const CREDENTIAL_RE = /^0x[a-fA-F0-9]{64}$/;
const DIGITS_RE = /^\d+$/;

const normalizeString = (value) => {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
};

const normalizeAddress = (value) => {
  const normalized = normalizeString(value);
  return normalized && ADDRESS_RE.test(normalized) ? normalized.toLowerCase() : null;
};

const normalizeCredential = (value) => {
  const normalized = normalizeString(value);
  return normalized && CREDENTIAL_RE.test(normalized) ? normalized.toLowerCase() : null;
};

const normalizeValidatorIndex = (value) => {
  const normalized = normalizeString(value);
  return normalized && DIGITS_RE.test(normalized) ? normalized : null;
};

export const EMPTY_ACCOUNT_PORTFOLIO_STATE = Object.freeze({
  address: null,
  validatorIndex: null,
  withdrawalCredentials: null,
  portfolioTab: null,
});

export const normalizeAccountPortfolioState = (input = {}) => {
  const legacyAddressValue = normalizeString(input.address);
  let address = normalizeAddress(legacyAddressValue);
  let validatorIndex = normalizeValidatorIndex(input.validatorIndex);
  let withdrawalCredentials = normalizeCredential(input.withdrawalCredentials);

  if (!withdrawalCredentials) {
    withdrawalCredentials = normalizeCredential(legacyAddressValue);
  }

  if (validatorIndex) {
    address = null;
    withdrawalCredentials = null;
  } else if (withdrawalCredentials) {
    address = null;
  }

  return {
    address,
    validatorIndex,
    withdrawalCredentials,
    portfolioTab: null,
  };
};

export const parseAccountPortfolioState = (params) => {
  if (!params || typeof params.get !== 'function') {
    return { ...EMPTY_ACCOUNT_PORTFOLIO_STATE };
  }

  return normalizeAccountPortfolioState({
    address: params.get('address'),
    validatorIndex: params.get('validator_index'),
    withdrawalCredentials: params.get('withdrawal_credentials'),
  });
};

export const accountPortfolioStateFromSelection = (selection) => {
  if (!selection) return { ...EMPTY_ACCOUNT_PORTFOLIO_STATE };

  return normalizeAccountPortfolioState({
    address: selection.address,
    validatorIndex: selection.validatorIndex,
    withdrawalCredentials: selection.withdrawalCredentials,
  });
};

export const applyAccountPortfolioStateToParams = (params, state) => {
  if (!params || typeof params.set !== 'function' || typeof params.delete !== 'function') {
    return;
  }

  const normalized = normalizeAccountPortfolioState(state);

  params.delete('address');
  params.delete('validator_index');
  params.delete('withdrawal_credentials');
  params.delete('portfolio_tab');

  if (normalized.validatorIndex) {
    params.set('validator_index', normalized.validatorIndex);
  } else if (normalized.withdrawalCredentials) {
    params.set('withdrawal_credentials', normalized.withdrawalCredentials);
  } else if (normalized.address) {
    params.set('address', normalized.address);
  }

};

export const accountPortfolioStatesEqual = (left, right) => {
  const normalizedLeft = normalizeAccountPortfolioState(left);
  const normalizedRight = normalizeAccountPortfolioState(right);

  return normalizedLeft.address === normalizedRight.address &&
    normalizedLeft.validatorIndex === normalizedRight.validatorIndex &&
    normalizedLeft.withdrawalCredentials === normalizedRight.withdrawalCredentials;
};

export default {
  EMPTY_ACCOUNT_PORTFOLIO_STATE,
  normalizeAccountPortfolioState,
  parseAccountPortfolioState,
  accountPortfolioStateFromSelection,
  applyAccountPortfolioStateToParams,
  accountPortfolioStatesEqual,
};

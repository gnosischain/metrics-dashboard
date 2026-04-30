const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const CREDENTIAL_RE = /^0x[a-fA-F0-9]{64}$/;
const ETH1_WITHDRAWAL_CREDENTIAL_PREFIX = '0x010000000000000000000000';

export const isAddress = (value) => ADDRESS_RE.test(String(value || ''));

export const isEth1WithdrawalCredential = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  return CREDENTIAL_RE.test(normalized) && normalized.startsWith(ETH1_WITHDRAWAL_CREDENTIAL_PREFIX);
};

export const withdrawalAddressFromCredential = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  return isEth1WithdrawalCredential(normalized)
    ? `0x${normalized.slice(-40)}`
    : '';
};

export const withdrawalCredentialFromAddress = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  return isAddress(normalized)
    ? `${ETH1_WITHDRAWAL_CREDENTIAL_PREFIX}${normalized.slice(2)}`
    : '';
};

export const ADDRESS_PRIORITY = [
  'entity_address',
  'safe_address',
  'owner_address',
  'counterparty',
  'address',
];

export const pickAddress = (row) => {
  if (!row || typeof row !== 'object') return '';
  for (const key of ADDRESS_PRIORITY) {
    if (isAddress(row[key])) return String(row[key]).toLowerCase();
  }
  for (const value of Object.values(row)) {
    if (isAddress(value)) return String(value).toLowerCase();
  }
  return '';
};

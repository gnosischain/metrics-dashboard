const ADDRESS_LIKE_VALUE_PATTERN = /^0x[0-9a-f]+$/i;

export const normalizeFilterValue = (fieldName, value) => {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return '';
  }

  if (fieldName === 'wallet_address') {
    return trimmedValue.toLowerCase();
  }

  if ((fieldName === 'avatar' || fieldName === 'group_address' || fieldName === 'pool_address')
      && ADDRESS_LIKE_VALUE_PATTERN.test(trimmedValue)) {
    return trimmedValue.toLowerCase();
  }

  return trimmedValue;
};

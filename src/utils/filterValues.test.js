import { describe, expect, it } from 'vitest';
import { normalizeFilterValue } from './filterValues';

describe('normalizeFilterValue', () => {
  it('lowercases wallet addresses', () => {
    expect(
      normalizeFilterValue('wallet_address', '0xb7c85EDf3500806C0F7BACb9E1C88f0Ff3B7FDb8')
    ).toBe('0xb7c85edf3500806c0f7bacb9e1c88f0ff3b7fdb8');
  });

  it('lowercases Circles avatar addresses', () => {
    expect(
      normalizeFilterValue('avatar', '0xAAbbCCdDeEfF0011223344556677889900AAbBcC')
    ).toBe('0xaabbccddeeff0011223344556677889900aabbcc');
  });

  it('preserves Circles name searches', () => {
    expect(normalizeFilterValue('avatar', 'Alice Example')).toBe('Alice Example');
  });
});

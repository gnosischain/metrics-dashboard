import { describe, expect, it } from 'vitest';
import { ADDRESS_PRIORITY, pickAddress } from './AccountPortfolio.helpers';

const ADDR = (n) => `0x${'a'.repeat(39)}${n}`;

describe('pickAddress', () => {
  it('exports the documented priority order', () => {
    expect(ADDRESS_PRIORITY).toEqual([
      'entity_address',
      'safe_address',
      'owner_address',
      'counterparty',
      'address',
    ]);
  });

  it('prefers entity_address over root address', () => {
    const row = { address: ADDR(1), entity_address: ADDR(2) };
    expect(pickAddress(row)).toBe(ADDR(2));
  });

  it('prefers safe_address over owner_address', () => {
    const row = { owner_address: ADDR(1), safe_address: ADDR(2) };
    expect(pickAddress(row)).toBe(ADDR(2));
  });

  it('falls back to counterparty when entity/safe/owner missing', () => {
    const row = { counterparty: ADDR(3), address: ADDR(4) };
    expect(pickAddress(row)).toBe(ADDR(3));
  });

  it('uses any value-like address when no priority key matches', () => {
    expect(pickAddress({ source: ADDR(5) })).toBe(ADDR(5));
  });

  it('returns empty string when no address-shaped value present', () => {
    expect(pickAddress({ symbol: 'USDC', balance: 100 })).toBe('');
    expect(pickAddress({})).toBe('');
    expect(pickAddress(null)).toBe('');
  });

  it('lowercases the picked address', () => {
    const upper = '0xABCDEF0123456789ABCDEF0123456789ABCDEF01';
    expect(pickAddress({ entity_address: upper })).toBe(upper.toLowerCase());
  });
});

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

  it('lowercases checksummed Circles group_address', () => {
    expect(
      normalizeFilterValue('group_address', '0x93ED5A96347927fF6Ff6b790f8Cf5258240C321F')
    ).toBe('0x93ed5a96347927ff6ff6b790f8cf5258240c321f');
  });

  it('preserves Circles group name searches', () => {
    expect(normalizeFilterValue('group_address', 'CircleUp DAO')).toBe('CircleUp DAO');
  });

  it('lowercases checksummed Circles pool_address', () => {
    expect(
      normalizeFilterValue('pool_address', '0x3DBB19b51a33C99be96B1AC8617C4949148F0159')
    ).toBe('0x3dbb19b51a33c99be96b1ac8617c4949148f0159');
  });

  it('preserves Circles pool name searches', () => {
    expect(normalizeFilterValue('pool_address', 's-gCRC / sDAI')).toBe('s-gCRC / sDAI');
  });
});

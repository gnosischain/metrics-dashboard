import { describe, expect, it } from 'vitest';
import {
  applyAccountPortfolioStateToParams,
  parseAccountPortfolioState,
} from './accountPortfolioState';
import {
  withdrawalAddressFromCredential,
  withdrawalCredentialFromAddress,
} from '../components/AccountPortfolio.helpers';

describe('accountPortfolioState', () => {
  it('parses plain addresses from the address URL param and ignores legacy portfolio_tab', () => {
    const params = new URLSearchParams({
      address: '0xA6247834B41771022498F63CAE8820FFEE208265',
      portfolio_tab: 'safes',
    });

    expect(parseAccountPortfolioState(params)).toEqual({
      address: '0xa6247834b41771022498f63cae8820ffee208265',
      validatorIndex: null,
      withdrawalCredentials: null,
      portfolioTab: null,
    });
  });

  it('normalizes legacy credentials accidentally stored in address', () => {
    const credential = `0x${'a'.repeat(64)}`;
    const params = new URLSearchParams({ address: credential });

    expect(parseAccountPortfolioState(params)).toEqual(expect.objectContaining({
      address: null,
      withdrawalCredentials: credential,
    }));
  });

  it('maps Eth1 withdrawal credentials to their embedded execution address', () => {
    const address = '0x0d369bb49efa5100fd3b86a9f828c55da04d2d50';
    const credential = '0x0100000000000000000000000d369bb49efa5100fd3b86a9f828c55da04d2d50';

    expect(withdrawalAddressFromCredential(credential)).toBe(address);
    expect(withdrawalCredentialFromAddress(address)).toBe(credential);
  });

  it('serializes validator index without an address param', () => {
    const params = new URLSearchParams({
      dashboard: 'accounts',
      tab: 'account-portfolio',
      address: '0x0000000000000000000000000000000000000001',
    });

    applyAccountPortfolioStateToParams(params, {
      validatorIndex: '312996',
      portfolioTab: 'validators',
    });

    expect(params.get('address')).toBe(null);
    expect(params.get('validator_index')).toBe('312996');
    expect(params.get('portfolio_tab')).toBe(null);
  });
});

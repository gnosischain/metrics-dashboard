import { describe, expect, it, vi } from 'vitest';
import accountPortfolioService from './accountPortfolio';
import {
  normalizeAccountSelection,
  selectionFromRawInput,
} from './accountPortfolio';

describe('accountPortfolio service helpers', () => {
  it('normalizes search result selections for address-backed account views', () => {
    expect(normalizeAccountSelection({
      resultType: 'circles',
      address: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      displayLabel: 'alice',
    })).toEqual(expect.objectContaining({
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      sourceType: 'circles',
      displayLabel: 'alice',
      preferredTab: 'circles',
    }));
  });

  it('routes validator search results to the validators tab', () => {
    expect(normalizeAccountSelection({
      resultType: 'validator',
      address: '0x0000000000000000000000000000000000000001',
      validatorIndex: '123',
      withdrawalCredentials: '0xabc',
    })).toEqual(expect.objectContaining({
      address: '',
      sourceType: 'validator',
      validatorIndex: '123',
      withdrawalCredentials: '0xabc',
      withdrawalAddress: '0x0000000000000000000000000000000000000001',
      preferredTab: 'validators',
    }));
  });

  it('accepts direct pasted addresses without a search round-trip', () => {
    expect(selectionFromRawInput('0x000000000000000000000000000000000000000A')).toEqual(expect.objectContaining({
      address: '0x000000000000000000000000000000000000000a',
      sourceType: 'address',
      withdrawalAddress: '',
      preferredTab: 'overview',
    }));
  });

  it('accepts direct pasted withdrawal credentials as validator context', () => {
    const withdrawalAddress = '0x0d369bb49efa5100fd3b86a9f828c55da04d2d50';
    const credential = `0x010000000000000000000000${withdrawalAddress.slice(2)}`;

    expect(selectionFromRawInput(credential)).toEqual(expect.objectContaining({
      address: '',
      sourceType: 'validator_credential',
      withdrawalCredentials: credential,
      withdrawalAddress,
      preferredTab: 'validators',
    }));
  });

  it('accepts direct validator indexes as validator context', () => {
    expect(selectionFromRawInput('312996')).toEqual(expect.objectContaining({
      address: '',
      sourceType: 'validator',
      validatorIndex: '312996',
      preferredTab: 'validators',
    }));
  });

  it('searches address prefixes through the server portfolio endpoint without validator or full-view fallbacks', async () => {
    const originalPortfolio = accountPortfolioService.searchPortfolioIndex;
    const originalValidators = accountPortfolioService.searchValidators;
    const originalAddress = accountPortfolioService.searchAddressIndex;
    const originalCircles = accountPortfolioService.searchCirclesIndex;

    accountPortfolioService.searchPortfolioIndex = vi.fn().mockResolvedValue([
      {
        resultType: 'address',
        address: '0x2902000000000000000000000000000000000000',
        displayLabel: '0x2902…0000',
        score: 7000,
      },
    ]);
    accountPortfolioService.searchValidators = vi.fn().mockResolvedValue([]);
    accountPortfolioService.searchAddressIndex = vi.fn().mockResolvedValue([]);
    accountPortfolioService.searchCirclesIndex = vi.fn().mockResolvedValue([]);

    try {
      const results = await accountPortfolioService.search('0x2902');

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(expect.objectContaining({
        resultType: 'address',
        address: '0x2902000000000000000000000000000000000000',
      }));
      expect(accountPortfolioService.searchPortfolioIndex).toHaveBeenCalledWith('0x2902', expect.any(Number));
      expect(accountPortfolioService.searchValidators).not.toHaveBeenCalled();
      expect(accountPortfolioService.searchAddressIndex).not.toHaveBeenCalled();
      expect(accountPortfolioService.searchCirclesIndex).not.toHaveBeenCalled();
    } finally {
      accountPortfolioService.searchPortfolioIndex = originalPortfolio;
      accountPortfolioService.searchValidators = originalValidators;
      accountPortfolioService.searchAddressIndex = originalAddress;
      accountPortfolioService.searchCirclesIndex = originalCircles;
    }
  });

  it('still treats numeric searches as validator intent', async () => {
    const originalPortfolio = accountPortfolioService.searchPortfolioIndex;
    const originalValidators = accountPortfolioService.searchValidators;

    accountPortfolioService.searchPortfolioIndex = vi.fn().mockResolvedValue([]);
    accountPortfolioService.searchValidators = vi.fn().mockResolvedValue([
      {
        resultType: 'validator',
        validatorIndex: '312875',
        displayLabel: 'Validator #312875',
        score: 9200,
      },
    ]);

    try {
      const results = await accountPortfolioService.search('312875');

      expect(results[0]).toEqual(expect.objectContaining({
        resultType: 'validator',
        validatorIndex: '312875',
      }));
      expect(accountPortfolioService.searchPortfolioIndex).not.toHaveBeenCalled();
      expect(accountPortfolioService.searchValidators).toHaveBeenCalledWith('312875');
    } finally {
      accountPortfolioService.searchPortfolioIndex = originalPortfolio;
      accountPortfolioService.searchValidators = originalValidators;
    }
  });

  it('uses composed account movements as the canonical movement source', async () => {
    const originalGetRows = accountPortfolioService.getRows;
    accountPortfolioService.getRows = vi.fn((metricId) => {
      if (metricId === 'api_execution_account_movements_composed') {
        return Promise.resolve([
          {
            date: '2026-03-02',
            symbol: 'GNO',
            token_class: 'governance',
            net_delta: -1.5,
          },
          {
            date: '2026-03-03',
            symbol: 'USDC.e',
            token_class: 'stablecoin',
            net_delta: 2,
          },
        ]);
      }
      if (metricId === 'api_execution_gpay_user_activity') {
        return Promise.resolve([]);
      }
      return Promise.resolve([]);
    });

    try {
      const rows = await accountPortfolioService.getMovements('0x4b4406ed8659d03423490d8b62a1639206da0a7a');

      expect(rows).toHaveLength(2);
      expect(rows[0]).toEqual(expect.objectContaining({
        date: '2026-03-03',
        direction: 'inflow',
        source: 'transfer',
        symbol: 'USDC.e',
        amount: 2,
      }));
      expect(rows[1]).toEqual(expect.objectContaining({
        date: '2026-03-02',
        direction: 'outflow',
        source: 'transfer',
        symbol: 'GNO',
        amount: 1.5,
      }));
      expect(accountPortfolioService.getRows).toHaveBeenCalledWith(
        'api_execution_account_movements_composed',
        expect.objectContaining({
          filterField: 'address',
          filterValue: '0x4b4406ed8659d03423490d8b62a1639206da0a7a',
          from: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          to: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        })
      );
      expect(accountPortfolioService.getRows).not.toHaveBeenCalledWith(
        'api_execution_account_recent_transactions',
        expect.anything()
      );
      expect(accountPortfolioService.getRows).not.toHaveBeenCalledWith(
        'api_execution_account_token_movements_daily',
        expect.anything()
      );
    } finally {
      accountPortfolioService.getRows = originalGetRows;
    }
  });
});

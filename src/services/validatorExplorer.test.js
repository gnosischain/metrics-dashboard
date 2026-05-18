import { describe, expect, it } from 'vitest';
import {
  buildExplorerDateRange,
  mergeTimeSeriesRows,
  toExplorerStateFromSearchResult
} from './validatorExplorer';

describe('validatorExplorer service helpers', () => {
  it('builds ALL ranges from entity history start instead of the default 365-day fallback', () => {
    expect(buildExplorerDateRange('ALL', '2024-01-15', '2026-04-20')).toEqual({
      from: '2024-01-15',
      to: '2026-04-20'
    });
  });

  it('normalizes ClickHouse Date values when they arrive as epoch-day numbers', () => {
    expect(buildExplorerDateRange('ALL', 19935, 20563)).toEqual({
      from: '2024-07-31',
      to: '2026-04-20'
    });
  });

  it('merges aggregate and compare series into chart rows', () => {
    expect(mergeTimeSeriesRows({
      aggregateRows: [{ date: '2026-04-20', balance_gno: 100 }],
      compareRows: [{ date: '2026-04-20', validator_index: 5, balance_gno: 32 }],
      valueField: 'balance_gno',
      compareLabel: (row) => `Validator ${row.validator_index}`
    })).toEqual([
      { date: '2026-04-20', value: 100, series: 'All validators' },
      { date: '2026-04-20', value: 32, series: 'Validator 5' }
    ]);
  });

  it('maps search results into explorer state transitions', () => {
    expect(toExplorerStateFromSearchResult({
      resultType: 'credential',
      withdrawal_credentials: '0xabc'
    })).toEqual({
      explorerMode: 'credential',
      withdrawalCredentials: '0xabc',
      compare: []
    });

    expect(toExplorerStateFromSearchResult({
      resultType: 'validator',
      validator_index: '12'
    })).toEqual({
      explorerMode: 'validator',
      validatorIndex: '12',
      compare: []
    });
  });
});

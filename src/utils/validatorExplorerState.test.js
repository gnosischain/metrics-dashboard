import { describe, expect, it } from 'vitest';
import {
  EMPTY_VALIDATOR_EXPLORER_STATE,
  applyValidatorExplorerStateToParams,
  normalizeValidatorExplorerState,
  parseValidatorExplorerState,
  validatorExplorerStatesEqual
} from './validatorExplorerState';

describe('validatorExplorerState', () => {
  it('parses validator mode from URL params', () => {
    const params = new URLSearchParams({
      explorerMode: 'validator',
      validator_index: '42'
    });

    expect(parseValidatorExplorerState(params)).toEqual({
      explorerMode: 'validator',
      validatorIndex: '42',
      withdrawalCredentials: null,
      compare: []
    });
  });

  it('parses credential mode from URL params and caps compare at five validators', () => {
    const params = new URLSearchParams({
      explorerMode: 'credential',
      withdrawal_credentials: '0xABC',
      compare: '1,2,3,4,5,6,5'
    });

    expect(parseValidatorExplorerState(params)).toEqual({
      explorerMode: 'credential',
      validatorIndex: null,
      withdrawalCredentials: '0xabc',
      compare: ['1', '2', '3', '4', '5']
    });
  });

  it('serializes explorer state into URL params', () => {
    const params = new URLSearchParams({
      dashboard: 'consensus',
      tab: 'validator-explorer'
    });

    applyValidatorExplorerStateToParams(params, {
      explorerMode: 'credential',
      withdrawalCredentials: '0xdef',
      compare: ['7', '8']
    });

    expect(params.get('explorerMode')).toBe('credential');
    expect(params.get('withdrawal_credentials')).toBe('0xdef');
    expect(params.get('compare')).toBe('7,8');
  });

  it('clears credential and compare when normalizing validator mode', () => {
    expect(normalizeValidatorExplorerState({
      explorerMode: 'validator',
      validatorIndex: '9',
      withdrawalCredentials: '0xdeadbeef',
      compare: ['1', '2']
    })).toEqual({
      explorerMode: 'validator',
      validatorIndex: '9',
      withdrawalCredentials: null,
      compare: []
    });
  });

  it('treats empty selections as the empty explorer state', () => {
    expect(normalizeValidatorExplorerState({})).toEqual(EMPTY_VALIDATOR_EXPLORER_STATE);
    expect(validatorExplorerStatesEqual(
      {},
      EMPTY_VALIDATOR_EXPLORER_STATE
    )).toBe(true);
  });
});

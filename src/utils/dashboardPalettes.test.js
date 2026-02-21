import { describe, expect, it } from 'vitest';
import {
  GNOSIS_PAY_PALETTE,
  STANDARD_PALETTE,
  resolveDashboardPalette
} from './dashboardPalettes';

describe('resolveDashboardPalette', () => {
  it('returns standard palette when config is missing', () => {
    const resolved = resolveDashboardPalette();

    expect(resolved).toEqual(STANDARD_PALETTE);
    expect(resolved).not.toBe(STANDARD_PALETTE);
    expect(resolved.seriesLight).not.toBe(STANDARD_PALETTE.seriesLight);
  });

  it('resolves named gnosis pay palette', () => {
    const resolved = resolveDashboardPalette('gnosis-pay');

    expect(resolved).toEqual(GNOSIS_PAY_PALETTE);
    expect(resolved).not.toBe(GNOSIS_PAY_PALETTE);
  });

  it('falls back to standard for unknown named palette', () => {
    const resolved = resolveDashboardPalette('unknown-palette');

    expect(resolved).toEqual(STANDARD_PALETTE);
  });

  it('supports named aliases for gnosis pay palette', () => {
    const resolvedAlias1 = resolveDashboardPalette('gnosis_pay');
    const resolvedAlias2 = resolveDashboardPalette('gnosispay');

    expect(resolvedAlias1).toEqual(GNOSIS_PAY_PALETTE);
    expect(resolvedAlias2).toEqual(GNOSIS_PAY_PALETTE);
  });

  it('falls back to standard when palette config is object (preset-only mode)', () => {
    const resolved = resolveDashboardPalette({
      extends: 'gnosis-pay'
    });

    expect(resolved).toEqual(STANDARD_PALETTE);
  });

  it('falls back to standard when config type is invalid', () => {
    const resolved = resolveDashboardPalette(['invalid']);

    expect(resolved).toEqual(STANDARD_PALETTE);
  });
});

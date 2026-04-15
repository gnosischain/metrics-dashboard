import { afterEach, describe, expect, it, vi } from 'vitest';
import metric, {
  buildOpportunityHref,
  buildSparklineSvg,
  cleanOpportunityName,
  navigateOpportunityInApp
} from '../api_execution_yields_opportunities_latest';

describe('api_execution_yields_opportunities_latest helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState({}, '', '/');
  });

  it('strips address suffixes from LP opportunity names', () => {
    expect(cleanOpportunityName('wXDAI / GNO • a17f43')).toBe('wXDAI / GNO');
    expect(cleanOpportunityName('USDC')).toBe('USDC');
  });

  it('builds an in-app pool deep link for LP rows', () => {
    const href = buildOpportunityHref({
      type: 'LP',
      token: 'GNO',
      name: 'wXDAI / GNO • a17f43',
      pool_key: 'wXDAI / GNO'
    });

    const params = new URLSearchParams(href.slice(1));
    expect(params.get('dashboard')).toBe('yields');
    expect(params.get('tab')).toBe('pools');
    expect(params.get('token')).toBe('GNO');
    expect(params.get('pool')).toBe('wXDAI / GNO');
  });

  it('builds an in-app lending deep link for lending rows', () => {
    const href = buildOpportunityHref({
      type: 'Lending',
      token: 'sDAI',
      name: 'sDAI'
    });

    const params = new URLSearchParams(href.slice(1));
    expect(params.get('dashboard')).toBe('yields');
    expect(params.get('tab')).toBe('lending');
    expect(params.get('token')).toBe('sDAI');
    expect(params.get('pool')).toBeNull();
  });

  it('returns a dash when the sparkline does not have enough points', () => {
    expect(buildSparklineSvg([])).toBe('-');
    expect(buildSparklineSvg([12.3])).toBe('-');
  });

  it('renders an inline sparkline svg for a valid trend', () => {
    const sparkline = buildSparklineSvg([10, 12.5, 11.2, 14.1]);

    expect(sparkline).toContain('<svg');
    expect(sparkline).toContain('<polyline');
    expect(sparkline).toContain('14.10%');
  });

  it('renders an inline sparkline svg for stringified array payloads', () => {
    const sparkline = buildSparklineSvg('[10,12.5,11.2,14.1]');

    expect(sparkline).toContain('<svg');
    expect(sparkline).toContain('<polyline');
  });

  it('uses SPA navigation for a normal LP click', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
    const preventDefault = vi.fn();

    const didNavigate = navigateOpportunityInApp(
      '?dashboard=yields&tab=pools&token=GNO&pool=Pool%20Alpha',
      { button: 0, preventDefault }
    );

    expect(didNavigate).toBe(true);
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(pushStateSpy).toHaveBeenCalledWith({}, '', '?dashboard=yields&tab=pools&token=GNO&pool=Pool%20Alpha');
    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(PopStateEvent));
    expect(navigateOpportunityInApp.toString()).not.toContain('location.assign');
  });

  it('uses SPA navigation for a normal lending click', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
    const preventDefault = vi.fn();

    const didNavigate = navigateOpportunityInApp(
      '?dashboard=yields&tab=lending&token=sDAI',
      { button: 0, preventDefault }
    );

    expect(didNavigate).toBe(true);
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(pushStateSpy).toHaveBeenCalledWith({}, '', '?dashboard=yields&tab=lending&token=sDAI');
    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(PopStateEvent));
  });

  it('does not intercept cmd or ctrl clicks on the link', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
    const preventDefault = vi.fn();

    expect(navigateOpportunityInApp('?dashboard=yields&tab=pools&token=GNO&pool=Pool%20Alpha', {
      button: 0,
      metaKey: true,
      preventDefault
    })).toBe(false);

    expect(navigateOpportunityInApp('?dashboard=yields&tab=pools&token=GNO&pool=Pool%20Alpha', {
      button: 0,
      ctrlKey: true,
      preventDefault
    })).toBe(false);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(pushStateSpy).not.toHaveBeenCalled();
    expect(dispatchEventSpy).not.toHaveBeenCalled();
  });

  it('does not intercept middle clicks', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
    const preventDefault = vi.fn();

    const didNavigate = navigateOpportunityInApp(
      '?dashboard=yields&tab=pools&token=GNO&pool=Pool%20Alpha',
      { button: 1, preventDefault }
    );

    expect(didNavigate).toBe(false);
    expect(preventDefault).not.toHaveBeenCalled();
    expect(pushStateSpy).not.toHaveBeenCalled();
    expect(dispatchEventSpy).not.toHaveBeenCalled();
  });

  it('does nothing when there is no valid href', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
    const preventDefault = vi.fn();

    const didNavigate = navigateOpportunityInApp(null, { button: 0, preventDefault });

    expect(didNavigate).toBe(false);
    expect(preventDefault).not.toHaveBeenCalled();
    expect(pushStateSpy).not.toHaveBeenCalled();
    expect(dispatchEventSpy).not.toHaveBeenCalled();
  });

  it('query reads the thin API model and requests 14 day trend arrays', () => {
    expect(metric.tableConfig.columns.some(column => column.title === 'APR 14D' && column.field === 'rate_trend_14d')).toBe(true);
    expect(metric.query).toContain('pool_key');
    expect(metric.query).toContain('rate_trend_14d');
    expect(metric.query).toContain('FROM dbt.api_execution_yields_opportunities_latest');
  });
});

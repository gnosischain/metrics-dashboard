import { describe, expect, it } from 'vitest';
import dashboardsService from './dashboards';
import { GNOSIS_PAY_PALETTE, STANDARD_PALETTE } from '../utils/dashboardPalettes';

describe('DashboardService palette resolution', () => {
  it('attaches named dashboard palette and defaults missing palette to standard', () => {
    const yaml = `
GnosisPay:
  name: Gnosis Pay
  order: 1
  palette: gnosis-pay
  metrics:
    - id: overview_transactions
DefaultDashboard:
  name: Default Dashboard
  order: 2
  metrics:
    - id: overview_validators
`;

    const loaded = dashboardsService.loadFromYaml(yaml);
    expect(loaded).toBe(true);

    const gnosisPay = dashboardsService.getDashboard('gnosispay');
    const defaultDashboard = dashboardsService.getDashboard('defaultdashboard');

    expect(gnosisPay.palette).toEqual(GNOSIS_PAY_PALETTE);
    expect(defaultDashboard.palette).toEqual(STANDARD_PALETTE);
  });

  it('supports named palette aliases from YAML', () => {
    const yaml = `
Custom:
  name: Custom
  order: 1
  palette: gnosis_pay
  metrics:
    - id: overview_transactions
`;

    const loaded = dashboardsService.loadFromYaml(yaml);
    expect(loaded).toBe(true);

    const custom = dashboardsService.getDashboard('custom');

    expect(custom.palette).toEqual(GNOSIS_PAY_PALETTE);
  });
});

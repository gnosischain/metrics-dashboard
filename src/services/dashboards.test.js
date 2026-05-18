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

  it('preserves combined tab filter metadata when YAML mixes old and new dashboard fields', () => {
    const yaml = `
Merged:
  name: Merged
  order: 1
  tabs:
    - name: Circles User
      order: 1
      globalFilterField: avatar
      globalFilterLabel: Avatar
      globalControlsPlacement: top
      secondaryGlobalFilterField: pool
      globalFilterDisplayField: display_name
      globalFilterSourceMetric: api_execution_circles_v2_avatar_search
      requireExplicitFilter: true
      explicitFilterValidationMetric: api_execution_circles_v2_avatar_metadata
      emptyState:
        title: Explore a Circles user
        description: Search by name or paste an avatar address to load user cards.
        emptyResultsTitle: No Circles user found
        emptyResultsDescription: Try another name or avatar address.
        validatingTitle: Checking user...
        validatingDescription: Looking up Circles data for this selection.
        iconClass: user
      metrics:
        - id: overview_transactions
    - name: Gnosis Pay User Portfolio
      order: 2
      globalFilterField: wallet_address
      globalFilterLabel: Wallet
      searchable: true
      requireExplicitFilter: true
      explicitFilterValidationMetric: api_execution_gpay_user_lifetime_tenure_days
      emptyState:
        title: Explore your Gnosis Pay portfolio
        description: Paste a wallet address to load balances and activity cards.
        emptyResultsTitle: This wallet is not a Gnosis Pay wallet
        emptyResultsDescription: Try another wallet address.
        validatingTitle: Checking wallet...
        validatingDescription: Looking up Gnosis Pay activity for this wallet.
        iconClass: user
      metrics:
        - id: overview_transactions
`;

    const loaded = dashboardsService.loadFromYaml(yaml);
    expect(loaded).toBe(true);

    const circlesTab = dashboardsService.getTab('merged', 'circles-user');
    const gnosisPayTab = dashboardsService.getTab('merged', 'gnosis-pay-user-portfolio');

    expect(circlesTab).toMatchObject({
      globalFilterField: 'avatar',
      globalFilterLabel: 'Avatar',
      globalControlsPlacement: 'top',
      secondaryGlobalFilterField: 'pool',
      globalFilterDisplayField: 'display_name',
      globalFilterSourceMetric: 'api_execution_circles_v2_avatar_search',
      requireExplicitFilter: true,
      explicitFilterValidationMetric: 'api_execution_circles_v2_avatar_metadata',
      emptyState: {
        title: 'Explore a Circles user',
        description: 'Search by name or paste an avatar address to load user cards.',
        emptyResultsTitle: 'No Circles user found',
        emptyResultsDescription: 'Try another name or avatar address.',
        validatingTitle: 'Checking user...',
        validatingDescription: 'Looking up Circles data for this selection.',
        iconClass: 'user'
      }
    });

    expect(gnosisPayTab).toMatchObject({
      globalFilterField: 'wallet_address',
      globalFilterLabel: 'Wallet',
      searchable: true,
      requireExplicitFilter: true,
      explicitFilterValidationMetric: 'api_execution_gpay_user_lifetime_tenure_days',
      globalControlsPlacement: null,
      emptyState: {
        title: 'Explore your Gnosis Pay portfolio',
        description: 'Paste a wallet address to load balances and activity cards.',
        emptyResultsTitle: 'This wallet is not a Gnosis Pay wallet',
        emptyResultsDescription: 'Try another wallet address.',
        validatingTitle: 'Checking wallet...',
        validatingDescription: 'Looking up Gnosis Pay activity for this wallet.',
        iconClass: 'user'
      }
    });
  });

  it('preserves customView tab metadata when loading dashboards from YAML', () => {
    const yaml = `
Explorer:
  name: Explorer
  order: 1
  tabs:
    - name: Validator Explorer
      order: 1
      customView: validatorExplorer
      timeRanges: true
      metrics: []
`;

    const loaded = dashboardsService.loadFromYaml(yaml);
    expect(loaded).toBe(true);

    const explorerTab = dashboardsService.getTab('explorer', 'validator-explorer');
    expect(explorerTab).toMatchObject({
      customView: 'validatorExplorer',
      timeRanges: true,
      metrics: []
    });
  });

  it('supports explicit single-tab dashboards without sidebar subtabs', () => {
    const yaml = `
Account Portfolio:
  name: Account Portfolio
  order: 1
  hasDefaultTab: true
  tabs:
    - name: Account Portfolio
      order: 1
      customView: accountPortfolio
      metrics: []
`;

    const loaded = dashboardsService.loadFromYaml(yaml);
    expect(loaded).toBe(true);

    const accountPortfolio = dashboardsService.getDashboard('account-portfolio');
    const accountPortfolioTab = dashboardsService.getTab('account-portfolio', 'account-portfolio');

    expect(accountPortfolio).toMatchObject({
      id: 'account-portfolio',
      name: 'Account Portfolio',
      hasDefaultTab: true
    });
    expect(accountPortfolioTab).toMatchObject({
      customView: 'accountPortfolio',
      metrics: []
    });
  });
});

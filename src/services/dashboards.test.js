import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
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

  it('parses multi-chain dashboards with chain-prefixed ids for non-default-chain tabs', () => {
    const yaml = `
GnosisPay:
  name: Gnosis Pay
  order: 1
  chains:
    - id: gnosis
      label: Gnosis Chain
      color: "#3E6957"
    - id: celo
      label: Celo
  tabs:
    - name: Overview
      chain: gnosis
      order: 1
      metrics:
        - id: api_execution_gpay_total_volume
    - name: Cashback
      chain: gnosis
      order: 2
      metrics:
        - id: api_execution_gpay_cashback_total
    - name: Overview
      chain: celo
      order: 11
      metrics:
        - id: api_celo_gpay_total_volume
`;

    const loaded = dashboardsService.loadFromYaml(yaml);
    expect(loaded).toBe(true);

    const dashboard = dashboardsService.getDashboard('gnosispay');
    expect(dashboard.chains).toEqual([
      { id: 'gnosis', label: 'Gnosis Chain', color: '#3E6957' },
      { id: 'celo', label: 'Celo', color: null }
    ]);
    expect(dashboard.defaultChain).toBe('gnosis');

    // Default-chain tab keeps its plain slug id (existing links keep working);
    // the Celo variant gets a chain-prefixed id so both stay addressable.
    const gnosisOverview = dashboardsService.getTab('gnosispay', 'overview');
    const celoOverview = dashboardsService.getTab('gnosispay', 'celo-overview');

    expect(gnosisOverview).toMatchObject({ chain: 'gnosis', baseId: 'overview' });
    expect(gnosisOverview.metrics[0].id).toBe('api_execution_gpay_total_volume');
    expect(celoOverview).toMatchObject({ chain: 'celo', baseId: 'overview', chainLabel: 'Celo' });
    expect(celoOverview.metrics[0].id).toBe('api_celo_gpay_total_volume');
  });

  it('preserves per-tab chains and per-card celoId on merged multi-chain tabs', () => {
    const yaml = `
GnosisPay:
  name: Gnosis Pay
  order: 1
  chains:
    - id: gnosis
      label: Gnosis Chain
      color: "#3E6957"
    - id: celo
      label: Celo
  tabs:
    - name: Balances
      chains: [gnosis, celo]
      order: 1
      metrics:
        - id: api_execution_gpay_total_balance
          celoId: api_celo_gpay_total_balance
          celoGridColumn: 1 / span 6
          gridColumn: 1 / span 3
        - id: api_execution_gpay_gno_total_balance
          gridColumn: 4 / span 3
    - name: Cashback
      order: 2
      metrics:
        - id: api_execution_gpay_cashback_total
`;

    const loaded = dashboardsService.loadFromYaml(yaml);
    expect(loaded).toBe(true);

    // Merged tab keeps a single, plain-slug id in the menu (no chain prefix) and
    // carries the chain list; each card exposes its celo variant + optional override.
    const balances = dashboardsService.getTab('gnosispay', 'balances');
    expect(balances.chains).toEqual(['gnosis', 'celo']);
    expect(balances.metrics[0]).toMatchObject({
      id: 'api_execution_gpay_total_balance',
      celoId: 'api_celo_gpay_total_balance',
      celoGridColumn: '1 / span 6',
    });
    // A card with no celo variant is null (hidden when Celo is selected).
    expect(balances.metrics[1].celoId).toBeNull();

    // Gnosis-only tabs carry no chains and no toggle.
    const cashback = dashboardsService.getTab('gnosispay', 'cashback');
    expect(cashback.chains).toBeNull();
  });

  it('leaves single-chain dashboards untouched by chain parsing', () => {
    const yaml = `
Plain:
  name: Plain
  order: 1
  tabs:
    - name: Overview
      order: 1
      metrics:
        - id: some_metric
`;

    const loaded = dashboardsService.loadFromYaml(yaml);
    expect(loaded).toBe(true);

    const dashboard = dashboardsService.getDashboard('plain');
    expect(dashboard.chains).toBeNull();
    expect(dashboard.defaultChain).toBeNull();

    const tab = dashboardsService.getTab('plain', 'overview');
    expect(tab).toMatchObject({ id: 'overview', baseId: 'overview', chain: null, chainLabel: null });
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

describe('dashboard config integrity', () => {
  const ROOT = path.resolve(__dirname, '../..');
  const QDIR = path.join(ROOT, 'src/queries');
  const ADIR = path.join(ROOT, 'api/queries');
  const DASH = path.join(ROOT, 'public/dashboards');
  const OWNED = new Set(['circles.yml', 'gnosis-app.yml']); // sectors this plan owns

  const readSrc = (id) => {
    const f = path.join(QDIR, `${id}.js`);
    return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
  };
  const isKpi = (src) => /chartType:\s*['"]numberDisplay['"]/.test(src || '');
  const isOverview = (tab) => /overview/i.test(tab);
  const placed = () => {
    const rows = [];
    for (const file of fs.readdirSync(DASH).filter((f) => f.endsWith('.yml'))) {
      const doc = yaml.load(fs.readFileSync(path.join(DASH, file), 'utf8')) || {};
      for (const tab of doc.tabs || []) {
        if (tab.enabled === false) continue;
        for (const m of tab.metrics || []) {
          if (m && m.id && m.id !== 'global_filter') rows.push({ file, tab: tab.name || '', id: m.id });
          // Multi-chain cards carry a `celoId` variant that must also resolve.
          if (m && m.celoId) rows.push({ file, tab: tab.name || '', id: m.celoId });
        }
      }
    }
    return rows;
  };
  const cards = placed();

  it('every placed card has a query file (repo-wide)', () => {
    const missing = cards.filter((c) => readSrc(c.id) === null);
    expect(missing, JSON.stringify(missing, null, 2)).toHaveLength(0);
  });

  it('no two cards overlap the same grid cell on a tab (all dashboards)', () => {
    const span = (v) => {
      const s = String(v || '').trim();
      const m = s.match(/^(\d+)\s*\/\s*span\s*(\d+)$/);
      if (m) return { start: +m[1], span: +m[2] };
      const n = s.match(/^(\d+)$/);
      return n ? { start: +n[1], span: 1 } : { start: 1, span: 1 };
    };
    const bad = [];
    for (const file of fs.readdirSync(DASH).filter((f) => f.endsWith('.yml'))) {
      const doc = yaml.load(fs.readFileSync(path.join(DASH, file), 'utf8')) || {};
      const tabs = Array.isArray(doc.tabs) ? doc.tabs : [{ name: 'main', metrics: doc.metrics }];
      for (const tab of tabs) {
        if (tab.enabled === false) continue;
        const cells = new Map();
        for (const m of tab.metrics || []) {
          if (!m || !m.id) continue;
          const c = span(m.gridColumn);
          const r = span(m.gridRow);
          for (let rr = r.start; rr < r.start + r.span; rr += 1) {
            for (let cc = c.start; cc < c.start + c.span; cc += 1) {
              const k = `${rr}:${cc}`;
              if (cells.has(k)) bad.push({ file, tab: tab.name, cell: k, a: cells.get(k), b: m.id });
              else cells.set(k, m.id);
            }
          }
        }
      }
    }
    expect(bad, JSON.stringify(bad, null, 2)).toHaveLength(0);
  });

  it('no stale api/queries JSON (repo-wide)', () => {
    // A JSON is live if a source .js exists for it — by filename (id === filename by convention)
    // or by parsed id. Some cards use JSON-style keys the exporter can't parse but do have a .js.
    const liveIds = new Set();
    for (const f of fs.readdirSync(QDIR).filter((x) => x.endsWith('.js') && x !== 'index.js')) {
      liveIds.add(f.replace(/\.js$/, ''));
      const m = fs.readFileSync(path.join(QDIR, f), 'utf8').match(/id:\s*['"]([^'"]+)['"]/);
      if (m) liveIds.add(m[1]);
    }
    const stale = fs.readdirSync(ADIR).filter((f) => f.endsWith('.json'))
      .map((f) => f.replace(/\.json$/, '')).filter((id) => !liveIds.has(id));
    expect(stale, JSON.stringify(stale, null, 2)).toHaveLength(0);
  });

  it('every owned-sector card (KPIs included) has a metricDescription', () => {
    const bad = cards.filter((c) => OWNED.has(c.file))
      .filter((c) => !(readSrc(c.id) || '').includes('metricDescription'));
    expect(bad, JSON.stringify(bad, null, 2)).toHaveLength(0);
  });

  it('owned-sector placement: every card appears on exactly one tab (no cross-tab repeats)', () => {
    const byId = new Map();
    for (const c of cards.filter((c) => OWNED.has(c.file))) {
      if (!byId.has(c.id)) byId.set(c.id, []);
      byId.get(c.id).push(c.tab);
    }
    const bad = [];
    for (const [id, tabs] of byId) {
      if (tabs.length > 1) bad.push({ id, tabs });
    }
    expect(bad, JSON.stringify(bad, null, 2)).toHaveLength(0);
  });
});

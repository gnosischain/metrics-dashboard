import React, { useMemo } from 'react';
import MetricGrid from './MetricGrid';
import IconComponent from './IconComponent';
import dashboardsService from '../services/dashboards';

const LANDING_RESOURCE_GROUPS = [
  {
    id: 'internal',
    label: 'Internal tools',
    description: 'Build on the same stack — direct access to the API, models, and docs.',
    links: [
      { id: 'docs', label: 'Analytics Docs', href: 'https://docs.analytics.gnosis.io/' },
      { id: 'api-reference', label: 'API Reference', href: 'https://api.analytics.gnosis.io/docs#/' },
      { id: 'dbt-docs', label: 'dbt Models Docs', href: 'https://gnosischain.github.io/dbt-cerebro/#!/overview' },
      { id: 'github-dbt', label: 'GitHub: dbt Models', href: 'https://github.com/gnosischain/dbt-cerebro' },
      { id: 'github-EL', label: 'GitHub: EL Indexer', href: 'https://github.com/gnosischain/cryo-indexer' },
      { id: 'github-CL', label: 'GitHub: CL Indexer', href: 'https://github.com/gnosischain/beacon-indexer' }
    ]
  },
  {
    id: 'external',
    label: 'External dashboards',
    description: 'External data dashboards on Dune and ProbeLab.',
    links: [
      { id: 'dune-gnosis-app', label: 'Dune · Gnosis App', href: 'https://dune.com/gnosischain_team/gnosis-app-overview' },
      { id: 'dune-gnosis-pay', label: 'Dune · Gnosis Pay', href: 'https://dune.com/gnosischain_team/pay-analytics' },
      { id: 'dune-circles', label: 'Dune · Circles', href: 'https://dune.com/gnosischain_team/about-circles' },
      { id: 'dune-gnosis-chain', label: 'Dune · Gnosis Chain', href: 'https://dune.com/gnosischain_team/gnosis-chain-analytics' },
      { id: 'dune-gnosis-bridges', label: 'Dune · Gnosis Bridges', href: 'https://dune.com/gnosischain_team/gnosis-bridges' },
      { id: 'dune-gnosis-labs', label: 'Dune · Gnosis Labs', href: 'https://dune.com/gnosischain_team/gnosis-labs' },
      { id: 'probelab-gnosis', label: 'ProbeLab · Gnosis', href: 'https://probelab.io/gnosis/' }
    ]
  }
];

const LANDING_OVERVIEW_METRIC_IDS = [
  'overview_kpi_transactions',
  'overview_kpi_active_accounts',
  'overview_kpi_staked_gno',
  'overview_kpi_validators',
  'overview_kpi_stablecoin_supply',
  'overview_kpi_gpay_volume'
];

const STRIP_METRIC_IDS = [
  'overview_kpi_transactions',
  'overview_kpi_active_accounts',
  'overview_kpi_validators',
  'overview_kpi_stablecoin_supply'
];

const Landing = ({ dashboards = [], onNavigate, isDarkMode, isBootLoading = false }) => {
  const sectorCards = useMemo(
    () => (isBootLoading ? [] : dashboards.filter((d) => d.id !== 'overview')),
    [dashboards, isBootLoading]
  );

  const overviewMetrics = useMemo(() => {
    if (isBootLoading) {
      return [];
    }
    const all = dashboardsService.getTabMetrics('overview', 'main') || [];
    const included = new Set(LANDING_OVERVIEW_METRIC_IDS);
    return all.filter((m) => included.has(m.id));
  }, [dashboards, isBootLoading]);

  const overviewTabConfig = useMemo(
    () => (isBootLoading ? null : dashboardsService.getTab('overview', 'main') || null),
    [dashboards, isBootLoading]
  );

  const stripMetrics = useMemo(() => {
    if (isBootLoading) {
      return [];
    }
    const all = dashboardsService.getTabMetrics('overview', 'main') || [];
    const map = new Map(all.map((m) => [m.id, m]));
    return STRIP_METRIC_IDS.map((id, idx) => {
      const base = map.get(id);
      if (!base) return null;
      return {
        ...base,
        gridRow: 1,
        gridColumn: `${idx * 3 + 1} / span 3`,
        minHeight: '110px'
      };
    }).filter(Boolean);
  }, [dashboards, isBootLoading]);

  const handleSectorClick = (dashboardId) => {
    if (!isBootLoading && typeof onNavigate === 'function') {
      onNavigate(dashboardId, null);
    }
  };

  const handleExploreOverview = () => {
    if (!isBootLoading && typeof onNavigate === 'function') {
      onNavigate('overview', null);
    }
  };

  const scrollToSectors = () => {
    if (isBootLoading) {
      return;
    }
    const el = document.getElementById('landing-sectors');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="landing">
      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-eyebrow">Gnosis Chain Analytics</div>
          <h1 className="landing-headline">
            <span>OPEN</span>
            <span>METRICS</span>
            <span>FOR GNOSIS.</span>
          </h1>
          <p className="landing-sub">
            Historical & Live, open-source analytics across the Gnosis ecosystem —
            from validators and bridges to Gnosis Pay and Circles.
          </p>
          <div className="landing-cta-row">
            <button
              type="button"
              className="landing-cta landing-cta-primary"
              onClick={handleExploreOverview}
              disabled={isBootLoading}
            >
              Explore Overview
              <IconComponent name="chevron-right" size="sm" />
            </button>
            <a
              className="landing-cta landing-cta-ghost"
              href="https://api.analytics.gnosis.io/docs#/"
              target="_blank"
              rel="noopener noreferrer"
            >
              API Reference
            </a>
            <button
              type="button"
              className="landing-cta landing-cta-link"
              onClick={scrollToSectors}
              disabled={isBootLoading}
            >
              Browse sectors ↓
            </button>
          </div>
        </div>
        <div className="landing-hero-accent" aria-hidden="true" />
      </section>

      {/* Live metric strip */}
      {stripMetrics.length > 0 && (
        <section className="landing-strip">
          <div className="landing-strip-inner">
            <MetricGrid
              metrics={stripMetrics}
              isDarkMode={isDarkMode}
              tabConfig={overviewTabConfig}
            />
          </div>
        </section>
      )}

      {/* Sector grid */}
      {!isBootLoading && (
        <section id="landing-sectors" className="landing-section">
          <div className="landing-section-head">
            <div className="landing-section-eyebrow">Sectors</div>
            <h2 className="landing-section-title">Explore by topic</h2>
            <p className="landing-section-sub">
              Every corner of the Gnosis ecosystem, one click away.
            </p>
          </div>
          <div className="landing-sector-grid">
            {sectorCards.map((d) => (
              <button
                type="button"
                key={d.id}
                className="landing-sector-card"
                onClick={() => handleSectorClick(d.id)}
              >
                <div className="landing-sector-icon" aria-hidden="true">
                  {d.iconClass
                    ? <IconComponent name={d.iconClass} size="lg" />
                    : (d.icon || <IconComponent name="chart-line" size="lg" />)}
                </div>
                <div className="landing-sector-body">
                  <div className="landing-sector-name">{d.name}</div>
                  <div className="landing-sector-tagline">
                    {d.tagline || 'Dive into metrics for this sector.'}
                  </div>
                </div>
                <div className="landing-sector-arrow" aria-hidden="true">
                  <IconComponent name="chevron-right" size="sm" />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Overview trends */}
      {overviewMetrics.length > 0 && (
        <section className="landing-section landing-section-overview">
          <div className="landing-section-head">
            <div className="landing-section-eyebrow">At a glance</div>
            <h2 className="landing-section-title">Ecosystem overview</h2>
            <p className="landing-section-sub">
              Headline KPIs and trends, refreshed from the source.
            </p>
          </div>
          <div className="landing-overview-grid">
            <MetricGrid
              metrics={overviewMetrics}
              isDarkMode={isDarkMode}
              tabConfig={overviewTabConfig}
            />
          </div>
          <div className="landing-overview-cta">
            <button
              type="button"
              className="landing-cta landing-cta-ghost"
              onClick={handleExploreOverview}
              disabled={isBootLoading}
            >
              See full Overview dashboard →
            </button>
          </div>
        </section>
      )}

      {/* Resources */}
      <section className="landing-section landing-section-resources">
        <div className="landing-section-head">
          <div className="landing-section-eyebrow">Resources</div>
          <h2 className="landing-section-title">Docs, API & external dashboards</h2>
        </div>
        <div className="landing-resources-grid landing-resources-grid--split">
          {LANDING_RESOURCE_GROUPS.map((group) => (
            <div key={group.id} className="landing-resource-card">
              <div className="landing-resource-header">
                <div className="landing-resource-title">{group.label}</div>
                {group.description && (
                  <div className="landing-resource-description">{group.description}</div>
                )}
              </div>
              <ul className="landing-resource-list">
                {group.links.map((link) => (
                  <li key={link.id}>
                    <a
                      className="landing-resource-link"
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>{link.label}</span>
                      <IconComponent name="chevron-right" size="xs" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">Gnosis Chain Analytics</div>
          <div className="landing-footer-links">
            <a
              href="https://github.com/gnosischain"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://api.analytics.gnosis.io/docs#/"
              target="_blank"
              rel="noopener noreferrer"
            >
              API
            </a>
            <a
              href="https://gnosischain.github.io/dbt-cerebro/#!/overview"
              target="_blank"
              rel="noopener noreferrer"
            >
              dbt Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

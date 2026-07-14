import React from 'react';
import IconComponent from './IconComponent';
import alertsService from '../services/alerts';

const DashboardHeader = ({ dashboard, tabConfig, children = null }) => {
  if (!dashboard && !tabConfig) return null;

  const primary = dashboard?.name || tabConfig?.name || '';
  const secondary =
    tabConfig?.name && tabConfig.name !== dashboard?.name ? tabConfig.name : '';
  const description = tabConfig?.description || tabConfig?.tagline || '';
  const iconName = tabConfig?.iconClass || dashboard?.iconClass;
  const iconFallback =
    tabConfig?.icon ||
    dashboard?.icon ||
    (primary ? primary.charAt(0) : '•');

  const alerts = alertsService.getAlertsForTab(dashboard?.id, tabConfig?.id);

  return (
    <header className="dashboard-view-header">
      <div className="dashboard-view-header-main">
        <div className="dashboard-view-header-titles">
          <div className="dashboard-view-header-title-row">
            {iconName && (
              <span className="dashboard-view-header-icon" aria-hidden="true">
                <IconComponent name={iconName} fallback={iconFallback} size="md" />
              </span>
            )}
            {(primary || secondary) && (
              <div className="dashboard-view-header-title-text">
                {primary && <h1 className="dashboard-view-header-title">{primary}</h1>}
                {secondary && (
                  <span className="dashboard-view-header-subtitle">{secondary}</span>
                )}
              </div>
            )}
          </div>
          {description && (
            <p className="dashboard-view-header-description">{description}</p>
          )}
        </div>
        {children && <div className="dashboard-view-header-controls">{children}</div>}
      </div>
      {alerts.length > 0 && (
        <div className="dashboard-view-alerts">
          {alerts.map((alert, idx) => (
            <div
              key={`${alert.scope}-${idx}`}
              className={`dashboard-view-alert dashboard-view-alert--${alert.level}`}
              role="status"
            >
              <div className="dashboard-view-alert-body">
                {alert.title && (
                  <strong className="dashboard-view-alert-title">{alert.title}</strong>
                )}
                <span className="dashboard-view-alert-message">{alert.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  );
};

export default DashboardHeader;

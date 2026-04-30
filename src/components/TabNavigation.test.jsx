import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TabNavigation from './TabNavigation';

vi.mock('./IconComponent', () => ({
  default: () => <span aria-hidden="true">icon</span>
}));

describe('TabNavigation', () => {
  it('renders default-tab dashboards as a single sidebar section without child subtabs', () => {
    const onNavigation = vi.fn();

    render(
      <TabNavigation
        dashboards={[
          {
            id: 'overview',
            name: 'Overview',
            hasDefaultTab: true,
            tabs: [{ id: 'main', name: 'Overview' }]
          },
          {
            id: 'account-portfolio',
            name: 'Account Portfolio',
            hasDefaultTab: true,
            tabs: [{ id: 'account-portfolio', name: 'Account Portfolio' }]
          },
          {
            id: 'gnosispay',
            name: 'Gnosis Pay',
            hasDefaultTab: false,
            tabs: [{ id: 'activity', name: 'Activity' }]
          }
        ]}
        activeDashboard="overview"
        activeTab="main"
        onNavigation={onNavigation}
        isCollapsed={false}
      />
    );

    expect(screen.getAllByText('Account Portfolio')).toHaveLength(1);
    expect(screen.getByText('Activity')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Account Portfolio'));

    expect(onNavigation).toHaveBeenCalledWith('account-portfolio', 'account-portfolio');
  });
});

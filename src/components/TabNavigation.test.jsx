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
        activeDashboard="gnosispay"
        activeTab="activity"
        onNavigation={onNavigation}
        isCollapsed={false}
      />
    );

    expect(screen.getAllByText('Account Portfolio')).toHaveLength(1);
    expect(screen.getByText('Activity')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Account Portfolio'));

    expect(onNavigation).toHaveBeenCalledWith('account-portfolio', 'account-portfolio');
  });

  describe('accordion behavior', () => {
    const ACCORDION_DASHBOARDS = [
      {
        id: 'tokens',
        name: 'Tokens',
        tabs: [
          { id: 'overview', name: 'Tokens Overview' },
          { id: 'per-token', name: 'Per-token breakdown' }
        ]
      },
      {
        id: 'bridges',
        name: 'Bridges',
        tabs: [
          { id: 'overview', name: 'Bridges Overview' },
          { id: 'flows', name: 'Flows' }
        ]
      }
    ];

    it('only renders the active dashboard tab list by default', () => {
      render(
        <TabNavigation
          dashboards={ACCORDION_DASHBOARDS}
          activeDashboard="tokens"
          activeTab="overview"
          onNavigation={vi.fn()}
          isCollapsed={false}
        />
      );

      expect(screen.getByText('Per-token breakdown')).toBeInTheDocument();
      expect(screen.queryByText('Flows')).not.toBeInTheDocument();
    });

    it('navigates to the first tab when clicking an inactive dashboard header', () => {
      const onNavigation = vi.fn();
      render(
        <TabNavigation
          dashboards={ACCORDION_DASHBOARDS}
          activeDashboard="tokens"
          activeTab="overview"
          onNavigation={onNavigation}
          isCollapsed={false}
        />
      );

      fireEvent.click(screen.getByText('Bridges'));

      expect(onNavigation).toHaveBeenCalledWith('bridges', 'overview');
    });

    it('expands an inactive dashboard via the chevron without navigating', () => {
      const onNavigation = vi.fn();
      render(
        <TabNavigation
          dashboards={ACCORDION_DASHBOARDS}
          activeDashboard="tokens"
          activeTab="overview"
          onNavigation={onNavigation}
          isCollapsed={false}
        />
      );

      fireEvent.click(screen.getByTitle('Show tabs'));

      expect(onNavigation).not.toHaveBeenCalled();
      expect(screen.getByText('Flows')).toBeInTheDocument();
    });

    it('toggles the active dashboard tab list when clicking its header', () => {
      const onNavigation = vi.fn();
      render(
        <TabNavigation
          dashboards={ACCORDION_DASHBOARDS}
          activeDashboard="tokens"
          activeTab="overview"
          onNavigation={onNavigation}
          isCollapsed={false}
        />
      );

      fireEvent.click(screen.getByText('Tokens'));
      expect(onNavigation).not.toHaveBeenCalled();
      expect(screen.queryByText('Per-token breakdown')).not.toBeInTheDocument();

      fireEvent.click(screen.getByText('Tokens'));
      expect(screen.getByText('Per-token breakdown')).toBeInTheDocument();
    });

    it('resets manual expansion overrides when the active dashboard changes', () => {
      const { rerender } = render(
        <TabNavigation
          dashboards={ACCORDION_DASHBOARDS}
          activeDashboard="tokens"
          activeTab="overview"
          onNavigation={vi.fn()}
          isCollapsed={false}
        />
      );

      // Peek at Bridges, then navigate to it: override state is cleared and
      // the accordion default (only active expanded) takes over.
      fireEvent.click(screen.getByTitle('Show tabs'));
      expect(screen.getByText('Flows')).toBeInTheDocument();

      rerender(
        <TabNavigation
          dashboards={ACCORDION_DASHBOARDS}
          activeDashboard="bridges"
          activeTab="overview"
          onNavigation={vi.fn()}
          isCollapsed={false}
        />
      );

      expect(screen.getByText('Flows')).toBeInTheDocument();
      expect(screen.queryByText('Per-token breakdown')).not.toBeInTheDocument();
    });
  });

  const GROUPED_DASHBOARDS = [
    {
      id: 'overview',
      name: 'Overview',
      hasDefaultTab: true,
      tabs: [{ id: 'main', name: 'Overview' }]
    },
    {
      id: 'tokens',
      name: 'Tokens',
      group: 'Ecosystem',
      tabs: [{ id: 'overview', name: 'Overview' }]
    },
    {
      id: 'bridges',
      name: 'Bridges',
      group: 'Ecosystem',
      tabs: [{ id: 'overview', name: 'Overview' }]
    },
    {
      id: 'gnosispay',
      name: 'Gnosis Pay',
      group: 'Products',
      tabs: [{ id: 'activity', name: 'Activity' }]
    },
    {
      id: 'account-portfolio',
      name: 'Account Portfolio',
      hasDefaultTab: true,
      tabs: [{ id: 'account-portfolio', name: 'Account Portfolio' }]
    }
  ];

  it('renders one section label per consecutive group in the expanded sidebar', () => {
    const { container } = render(
      <TabNavigation
        dashboards={GROUPED_DASHBOARDS}
        activeDashboard="overview"
        activeTab="main"
        onNavigation={vi.fn()}
        isCollapsed={false}
      />
    );

    const labels = Array.from(container.querySelectorAll('.nav-group-label')).map(
      (el) => el.textContent
    );
    expect(labels).toEqual(['Ecosystem', 'Products']);

    // Ungrouped dashboard after a group is separated by a divider, and the
    // leading ungrouped dashboard (Overview) gets no label or divider above it.
    expect(container.querySelectorAll('.nav-group-divider')).toHaveLength(1);
    expect(container.querySelector('.dashboard-list').firstElementChild.className).toContain(
      'dashboard-item'
    );
  });

  it('renders dividers instead of labels in the collapsed sidebar', () => {
    const { container } = render(
      <TabNavigation
        dashboards={GROUPED_DASHBOARDS}
        activeDashboard="overview"
        activeTab="main"
        onNavigation={vi.fn()}
        isCollapsed={true}
      />
    );

    expect(container.querySelectorAll('.nav-group-label')).toHaveLength(0);
    // Boundaries: none→Ecosystem, Ecosystem→Products, Products→none.
    expect(container.querySelectorAll('.nav-group-divider')).toHaveLength(3);
  });

  it('renders no labels or dividers when no dashboard declares a group', () => {
    const ungrouped = GROUPED_DASHBOARDS.map(({ group, ...rest }) => rest);
    const { container } = render(
      <TabNavigation
        dashboards={ungrouped}
        activeDashboard="overview"
        activeTab="main"
        onNavigation={vi.fn()}
        isCollapsed={false}
      />
    );

    expect(container.querySelectorAll('.nav-group-label')).toHaveLength(0);
    expect(container.querySelectorAll('.nav-group-divider')).toHaveLength(0);
  });
});

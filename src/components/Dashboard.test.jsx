import React, { useEffect } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Dashboard from './Dashboard';

const metricGridLifecycle = {
  mounts: 0,
  unmounts: 0
};

vi.mock('./Header', () => ({
  default: ({ onSearchSelect }) => (
    <div data-testid="header">
      header
      {typeof onSearchSelect === 'function' && (
        <button type="button" onClick={() => onSearchSelect({ dashboardId: 'dashboard-a', tabId: 'tab-2' })}>
          Search Jump
        </button>
      )}
    </div>
  )
}));

vi.mock('./IconComponent', () => ({
  default: () => <span>icon</span>
}));

vi.mock('./MetricGrid', () => ({
  default: ({ metrics = [] }) => {
    useEffect(() => {
      metricGridLifecycle.mounts += 1;
      return () => {
        metricGridLifecycle.unmounts += 1;
      };
    }, []);

    return <div data-testid="metric-grid">metrics:{metrics.length}</div>;
  }
}));

vi.mock('./TabNavigation', () => ({
  default: ({ activeDashboard, onNavigation }) => (
    <div>
      <button type="button" onClick={() => onNavigation(activeDashboard, 'tab-2')}>
        Go Tab 2
      </button>
    </div>
  )
}));

vi.mock('../utils/dashboardConfig', () => ({
  default: {
    loadConfig: vi.fn().mockResolvedValue(true)
  }
}));

vi.mock('../services/dashboards', () => ({
  default: {
    getAllDashboards: vi.fn(() => [
      {
        id: 'dashboard-a',
        name: 'Dashboard A',
        hasDefaultTab: false
      }
    ]),
    getDashboardTabs: vi.fn(() => [
      { id: 'tab-1', name: 'Tab 1', order: 1 },
      { id: 'tab-2', name: 'Tab 2', order: 2 }
    ]),
    getDashboard: vi.fn(() => ({
      id: 'dashboard-a',
      name: 'Dashboard A',
      hasDefaultTab: false
    })),
    getTabMetrics: vi.fn((_dashboardId, tabId) =>
      tabId === 'tab-2'
        ? [{ id: 'metric-2' }, { id: 'metric-3' }]
        : [{ id: 'metric-1' }]
    ),
    getTab: vi.fn((_dashboardId, tabId) => ({
      id: tabId,
      globalFilterField: null
    }))
  }
}));

describe('Dashboard rendering behavior', () => {
  beforeEach(() => {
    metricGridLifecycle.mounts = 0;
    metricGridLifecycle.unmounts = 0;

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn()
      }))
    });
  });

  it('does not remount MetricGrid component when changing tabs', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('metric-grid')).toHaveTextContent('metrics:1');
    });

    expect(metricGridLifecycle.mounts).toBe(1);
    expect(metricGridLifecycle.unmounts).toBe(0);

    fireEvent.click(screen.getByRole('button', { name: 'Go Tab 2' }));

    await waitFor(() => {
      expect(screen.getByTestId('metric-grid')).toHaveTextContent('metrics:2');
    });

    expect(metricGridLifecycle.mounts).toBe(1);
    expect(metricGridLifecycle.unmounts).toBe(0);
  });

  it('navigates to dashboard tab when selecting a search result', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('metric-grid')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Search Jump' }));

    await waitFor(() => {
      expect(screen.getByTestId('metric-grid')).toHaveTextContent('metrics:2');
    });
  });
});

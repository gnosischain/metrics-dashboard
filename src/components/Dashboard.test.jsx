import React, { useEffect } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Dashboard from './Dashboard';
import dashboardConfig from '../utils/dashboardConfig';

const metricGridLifecycle = {
  mounts: 0,
  unmounts: 0
};

vi.mock('./Header', () => ({
  default: ({ onSearchSelect, variant = 'default' }) => (
    <div data-testid="header" data-variant={variant}>
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
  default: () => <span aria-hidden="true">icon</span>
}));

vi.mock('./MetricGrid', () => ({
  default: ({
    metrics = [],
    tabConfig,
    globalFilterValue,
    onGlobalFilterChange,
    secondaryGlobalFilterValue,
    onSecondaryGlobalFilterChange
  }) => {
    useEffect(() => {
      metricGridLifecycle.mounts += 1;
      return () => {
        metricGridLifecycle.unmounts += 1;
      };
    }, []);

    return (
      <div
        data-testid="metric-grid"
        data-tab-id={tabConfig?.id || ''}
        data-global-filter={globalFilterValue || ''}
        data-secondary-filter={secondaryGlobalFilterValue || ''}
      >
        metrics:{metrics.length}
        {typeof onGlobalFilterChange === 'function' && (
          <button type="button" onClick={() => onGlobalFilterChange('WETH')}>
            Set Global Filter
          </button>
        )}
        {typeof onSecondaryGlobalFilterChange === 'function' && (
          <button type="button" onClick={() => onSecondaryGlobalFilterChange('Pool Beta')}>
            Set Secondary Filter
          </button>
        )}
      </div>
    );
  }
}));

vi.mock('./TabNavigation', () => ({
  default: ({ activeDashboard, onNavigation }) => (
    <div>
      <button type="button" onClick={() => onNavigation(activeDashboard, 'tab-1')}>
        Go Tab 1
      </button>
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
      { id: 'tab-wallet', name: 'Tab Wallet', order: 2 },
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
        : tabId === 'tab-wallet'
          ? [{ id: 'metric-wallet' }]
        : [{ id: 'metric-1' }]
    ),
    getTab: vi.fn((_dashboardId, tabId) => (
      tabId === 'tab-1'
        ? {
          id: 'tab-1',
          globalFilterField: 'token',
          secondaryGlobalFilterField: 'pool'
        }
        : tabId === 'tab-wallet'
          ? {
            id: 'tab-wallet',
            globalFilterField: 'wallet_address',
            secondaryGlobalFilterField: null
          }
        : {
          id: 'tab-2',
          globalFilterField: null,
          secondaryGlobalFilterField: null
        }
    ))
  }
}));

const createDeferred = () => {
  let resolve;
  let reject;

  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
};

describe('Dashboard rendering behavior', () => {
  beforeEach(() => {
    metricGridLifecycle.mounts = 0;
    metricGridLifecycle.unmounts = 0;
    vi.clearAllMocks();
    vi.mocked(dashboardConfig.loadConfig).mockResolvedValue(true);

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

    window.history.replaceState({}, '', '/');
  });

  it('renders the landing shell immediately while config is still loading on the root URL', async () => {
    const deferred = createDeferred();
    vi.mocked(dashboardConfig.loadConfig).mockReturnValue(deferred.promise);

    render(<Dashboard />);

    expect(screen.getByTestId('header')).toHaveAttribute('data-variant', 'landing');
    expect(screen.getByRole('heading', { level: 1, name: /open metrics for gnosis/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Explore Overview' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Browse sectors ↓' })).toBeDisabled();
    expect(screen.queryByText('Initializing dashboard...')).not.toBeInTheDocument();
    expect(screen.queryByText('Explore by topic')).not.toBeInTheDocument();

    await act(async () => {
      deferred.resolve(true);
      await deferred.promise;
    });

    await waitFor(() => {
      expect(screen.getByTestId('header')).toHaveAttribute('data-variant', 'landing');
      expect(screen.getByText('Explore by topic')).toBeInTheDocument();
    });
  });

  it('keeps the dashboard loading shell for deep links until config resolves', async () => {
    const deferred = createDeferred();
    vi.mocked(dashboardConfig.loadConfig).mockReturnValue(deferred.promise);
    window.history.replaceState({}, '', '/?dashboard=dashboard-a&tab=tab-1');

    render(<Dashboard />);

    expect(screen.getByTestId('header')).toHaveAttribute('data-variant', 'default');
    expect(screen.getByText('Initializing dashboard...')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1, name: /open metrics for gnosis/i })).not.toBeInTheDocument();

    await act(async () => {
      deferred.resolve(true);
      await deferred.promise;
    });

    await waitFor(() => {
      expect(screen.getByTestId('metric-grid')).toHaveAttribute('data-tab-id', 'tab-1');
    });
  });

  it('does not remount MetricGrid component when changing tabs', async () => {
    window.history.replaceState({}, '', '/?dashboard=dashboard-a&tab=tab-1');

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('metric-grid')).toHaveTextContent('metrics:1');
    });

    await waitFor(() => {
      expect(metricGridLifecycle.mounts).toBe(1);
      expect(metricGridLifecycle.unmounts).toBe(0);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Go Tab 2' }));

    await waitFor(() => {
      expect(screen.getByTestId('metric-grid')).toHaveTextContent('metrics:2');
    });

    await waitFor(() => {
      expect(metricGridLifecycle.mounts).toBe(1);
      expect(metricGridLifecycle.unmounts).toBe(0);
    });
  });

  it('navigates to dashboard tab when selecting a search result', async () => {
    window.history.replaceState({}, '', '/?dashboard=dashboard-a&tab=tab-1');

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('metric-grid')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Search Jump' }));

    await waitFor(() => {
      expect(screen.getByTestId('metric-grid')).toHaveTextContent('metrics:2');
    });
  });

  it('initializes dashboard, tab, and filters from the URL', async () => {
    window.history.replaceState({}, '', '/?dashboard=dashboard-a&tab=tab-1&token=GNO&pool=Pool%20Alpha');

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('metric-grid')).toHaveAttribute('data-tab-id', 'tab-1');
      expect(screen.getByTestId('metric-grid')).toHaveAttribute('data-global-filter', 'GNO');
      expect(screen.getByTestId('metric-grid')).toHaveAttribute('data-secondary-filter', 'Pool Alpha');
    });
  });

  it('normalizes wallet filters from the URL to lowercase', async () => {
    window.history.replaceState({}, '', '/?dashboard=dashboard-a&tab=tab-wallet&wallet_address=0xb7c85EDf3500806C0F7BACb9E1C88f0Ff3B7FDb8');

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('metric-grid')).toHaveAttribute('data-tab-id', 'tab-wallet');
      expect(screen.getByTestId('metric-grid')).toHaveAttribute(
        'data-global-filter',
        '0xb7c85edf3500806c0f7bacb9e1c88f0ff3b7fdb8'
      );
      expect(window.location.search).toContain('wallet_address=0xb7c85edf3500806c0f7bacb9e1c88f0ff3b7fdb8');
    });
  });

  it('syncs filter params into the URL, clears stale params on tab changes, and restores popstate state', async () => {
    window.history.replaceState({}, '', '/?dashboard=dashboard-a&tab=tab-1&token=GNO&pool=Pool%20Alpha');

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('metric-grid')).toHaveAttribute('data-global-filter', 'GNO');
      expect(window.location.search).toContain('token=GNO');
      expect(window.location.search).toContain('pool=Pool+Alpha');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Set Global Filter' }));
    fireEvent.click(screen.getByRole('button', { name: 'Set Secondary Filter' }));

    await waitFor(() => {
      expect(window.location.search).toContain('token=WETH');
      expect(window.location.search).toContain('pool=Pool+Beta');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Go Tab 2' }));

    await waitFor(() => {
      expect(screen.getByTestId('metric-grid')).toHaveAttribute('data-tab-id', 'tab-2');
      expect(window.location.search).toContain('dashboard=dashboard-a');
      expect(window.location.search).toContain('tab=tab-2');
      expect(window.location.search).not.toContain('token=');
      expect(window.location.search).not.toContain('pool=');
    });

    await act(async () => {
      window.history.pushState({}, '', '/?dashboard=dashboard-a&tab=tab-1&token=USDC&pool=Pool%20Gamma');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('metric-grid')).toHaveAttribute('data-tab-id', 'tab-1');
      expect(screen.getByTestId('metric-grid')).toHaveAttribute('data-global-filter', 'USDC');
      expect(screen.getByTestId('metric-grid')).toHaveAttribute('data-secondary-filter', 'Pool Gamma');
    });
  });
});

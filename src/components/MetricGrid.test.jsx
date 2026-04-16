import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import MetricGrid from './MetricGrid';
import metricsService from '../services/metrics';

vi.mock('../services/metrics', () => ({
  default: {
    getMetricData: vi.fn()
  }
}));

vi.mock('../utils', () => ({
  getDateRange: vi.fn(() => ({ from: '2025-01-01', to: '2025-03-31' }))
}));

vi.mock('./MetricWidget', () => ({
  default: ({ metricId, headerActions }) => (
    <div data-testid="metric-widget" data-metric-id={metricId}>
      <span>{metricId}</span>
      {headerActions}
    </div>
  )
}));

vi.mock('./GlobalFilterWidget', () => ({
  default: ({ globalFilterOptions = [], globalFilterValue = '', loadingGlobalFilter, placement = 'grid' }) => {
    const serializedOptions = globalFilterOptions
      .map(option => (option && typeof option === 'object') ? option.value : option)
      .join(',');

    return (
      <div
        data-testid="global-filter-widget"
        data-options={serializedOptions}
        data-selected-value={globalFilterValue || ''}
        data-loading={loadingGlobalFilter ? 'true' : 'false'}
        data-placement={placement}
      ></div>
    );
  }
}));

const createDeferred = () => {
  let resolve;
  const promise = new Promise((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

describe('MetricGrid global filter behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resets stale filter values when current options do not include them', async () => {
    metricsService.getMetricData.mockResolvedValueOnce({
      data: [{ token: 'WETH' }, { token: 'GNO' }, { token: 'WETH' }]
    });

    const onGlobalFilterChange = vi.fn();

    render(
      <MetricGrid
        metrics={[
          { id: 'global_filter', gridRow: '1', gridColumn: '1' },
          { id: 'token_metric', enableFiltering: true, labelField: 'token', gridRow: '2', gridColumn: '1' }
        ]}
        tabConfig={{ globalFilterField: 'token', globalFilterLabel: 'Token' }}
        globalFilterValue="STALE_TOKEN"
        onGlobalFilterChange={onGlobalFilterChange}
      />
    );

    await waitFor(() => {
      expect(onGlobalFilterChange).toHaveBeenCalledWith('GNO');
    });

    expect(screen.getByTestId('global-filter-widget')).toHaveAttribute('data-placement', 'grid');
  });

  it('ignores stale async option responses from previous tab context', async () => {
    const slowRequest = createDeferred();
    const fastRequest = createDeferred();

    metricsService.getMetricData
      .mockImplementationOnce(() => slowRequest.promise)
      .mockImplementationOnce(() => fastRequest.promise);

    const onGlobalFilterChange = vi.fn();

    const { rerender } = render(
      <MetricGrid
        metrics={[
          { id: 'global_filter', gridRow: '1', gridColumn: '1' },
          { id: 'token_metric', enableFiltering: true, labelField: 'token', gridRow: '2', gridColumn: '1' }
        ]}
        tabConfig={{ globalFilterField: 'token' }}
        globalFilterValue={null}
        onGlobalFilterChange={onGlobalFilterChange}
      />
    );

    rerender(
      <MetricGrid
        metrics={[
          { id: 'global_filter', gridRow: '1', gridColumn: '1' },
          { id: 'class_metric', enableFiltering: true, labelField: 'token_class', gridRow: '2', gridColumn: '1' }
        ]}
        tabConfig={{ globalFilterField: 'token_class' }}
        globalFilterValue={null}
        onGlobalFilterChange={onGlobalFilterChange}
      />
    );

    fastRequest.resolve({
      data: [{ token_class: 'Stablecoin' }]
    });

    await waitFor(() => {
      expect(screen.getByTestId('global-filter-widget')).toHaveAttribute('data-options', 'Stablecoin');
    });

    slowRequest.resolve({
      data: [{ token: 'OldToken' }]
    });

    await waitFor(() => {
      expect(screen.getByTestId('global-filter-widget')).toHaveAttribute('data-options', 'Stablecoin');
    });

    expect(onGlobalFilterChange).not.toHaveBeenCalledWith('OldToken');
  });

  it('renders top-level global controls in the toolbar when placement is top', async () => {
    metricsService.getMetricData.mockResolvedValueOnce({
      data: [{ token: 'BRLA' }, { token: 'GNO' }]
    });

    const onGlobalFilterChange = vi.fn();

    render(
      <MetricGrid
        metrics={[
          { id: 'global_filter', gridRow: '1', gridColumn: '1' },
          { id: 'token_metric', enableFiltering: true, labelField: 'token', gridRow: '2', gridColumn: '1' }
        ]}
        tabConfig={{
          id: 'per-token-breakdown',
          globalFilterField: 'token',
          globalControlsPlacement: 'top',
          unitToggle: true,
          timeRanges: true
        }}
        globalFilterValue={null}
        onGlobalFilterChange={onGlobalFilterChange}
      />
    );

    await waitFor(() => {
      expect(onGlobalFilterChange).toHaveBeenCalledWith('BRLA');
    });

    expect(screen.getByText('Date range')).toBeInTheDocument();
    expect(screen.getAllByTestId('global-filter-widget')).toHaveLength(1);
    expect(screen.getByTestId('global-filter-widget')).toHaveAttribute('data-placement', 'top');
  });

  it('renders top-level global controls without a date-range group when time ranges are disabled', async () => {
    metricsService.getMetricData.mockResolvedValueOnce({
      data: [{ token: 'BRLA' }]
    });

    render(
      <MetricGrid
        metrics={[
          { id: 'global_filter', gridRow: '1', gridColumn: '1' },
          { id: 'token_metric', enableFiltering: true, labelField: 'token', gridRow: '2', gridColumn: '1' }
        ]}
        tabConfig={{
          id: 'top-only-filter',
          globalFilterField: 'token',
          globalControlsPlacement: 'top'
        }}
        globalFilterValue={null}
        onGlobalFilterChange={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('global-filter-widget')).toHaveAttribute('data-placement', 'top');
    });

    expect(screen.queryByText('Date range')).not.toBeInTheDocument();
  });

  it('renders one card per tab group and switches the active grouped metric from header controls', async () => {
    render(
      <MetricGrid
        metrics={[
          { id: 'positions_open', name: 'Open positions', tabGroup: 'positions', tabLabel: 'Open', gridRow: '1', gridColumn: '1 / span 6' },
          { id: 'positions_closed', name: 'Closed positions', tabGroup: 'positions', tabLabel: 'Closed', gridRow: '1', gridColumn: '1 / span 6' },
          { id: 'totals_metric', name: 'Totals', gridRow: '2', gridColumn: '1 / span 6' }
        ]}
        tabConfig={{ id: 'pools' }}
      />
    );

    expect(screen.getAllByTestId('metric-widget')).toHaveLength(2);
    expect(screen.getByText('positions_open')).toBeInTheDocument();
    expect(screen.queryByText('positions_closed')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Closed' }));

    expect(screen.getAllByTestId('metric-widget')).toHaveLength(2);
    expect(screen.getByText('positions_closed')).toBeInTheDocument();
    expect(screen.queryByText('positions_open')).not.toBeInTheDocument();
  });

  it('shows the initial explicit-filter empty state and keeps cards hidden until a wallet is entered', () => {
    render(
      <MetricGrid
        metrics={[
          { id: 'portfolio_metric', name: 'Portfolio', gridRow: '1', gridColumn: '1 / span 12' }
        ]}
        tabConfig={{
          id: 'user-portfolio',
          globalFilterField: 'wallet_address',
          requireExplicitFilter: true,
          explicitFilterValidationMetric: 'portfolio_validation_metric',
          globalControlsPlacement: 'top',
          emptyState: {
            title: 'Explore your portfolio',
            description: 'Paste a wallet address to load LP, lending, and activity cards.'
          }
        }}
        globalFilterValue={null}
        onGlobalFilterChange={vi.fn()}
      />
    );

    expect(screen.getByTestId('global-filter-widget')).toHaveAttribute('data-placement', 'top');
    expect(screen.getByTestId('metric-grid-empty-state')).toHaveAttribute('data-state', 'idle');
    expect(screen.getByText('Explore your portfolio')).toBeInTheDocument();
    expect(screen.queryAllByTestId('metric-widget')).toHaveLength(0);
    expect(metricsService.getMetricData).not.toHaveBeenCalled();
  });

  it('defaults future explicit-filter tabs to the top toolbar and hides date range until validation succeeds', async () => {
    const validationRequest = createDeferred();

    metricsService.getMetricData.mockImplementationOnce(() => validationRequest.promise);

    render(
      <MetricGrid
        metrics={[
          { id: 'portfolio_metric', name: 'Portfolio', gridRow: '1', gridColumn: '1 / span 12' }
        ]}
        tabConfig={{
          id: 'future-user-tab',
          globalFilterField: 'wallet_address',
          requireExplicitFilter: true,
          explicitFilterValidationMetric: 'portfolio_validation_metric',
          timeRanges: true,
          emptyState: {
            validatingTitle: 'Checking selection...',
            validatingDescription: 'Looking up data for this selection.'
          }
        }}
        globalFilterValue="0xabc"
        onGlobalFilterChange={vi.fn()}
      />
    );

    expect(screen.getByTestId('global-filter-widget')).toHaveAttribute('data-placement', 'top');

    await waitFor(() => {
      expect(screen.getByTestId('metric-grid-empty-state')).toHaveAttribute('data-state', 'validating');
    });

    expect(screen.getByText('Checking selection...')).toBeInTheDocument();
    expect(screen.queryByText('Date range')).not.toBeInTheDocument();

    validationRequest.resolve({
      data: [{ wallet_address: '0xabc', value: 1 }]
    });

    await waitFor(() => {
      expect(screen.queryByTestId('metric-grid-empty-state')).not.toBeInTheDocument();
      expect(screen.getByTestId('metric-widget')).toHaveAttribute('data-metric-id', 'portfolio_metric');
    });

    expect(screen.getByText('Date range')).toBeInTheDocument();
  });

  it('validates an explicit-filter wallet and renders cards after the wallet is confirmed', async () => {
    metricsService.getMetricData.mockResolvedValueOnce({
      data: [{ wallet_address: '0xabc', value: 0 }]
    });

    render(
      <MetricGrid
        metrics={[
          { id: 'portfolio_metric', name: 'Portfolio', gridRow: '1', gridColumn: '1 / span 12' }
        ]}
        tabConfig={{
          id: 'user-portfolio',
          globalFilterField: 'wallet_address',
          requireExplicitFilter: true,
          explicitFilterValidationMetric: 'portfolio_validation_metric',
          globalControlsPlacement: 'top'
        }}
        globalFilterValue="0xabc"
        onGlobalFilterChange={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(metricsService.getMetricData).toHaveBeenCalledWith('portfolio_validation_metric', {
        filterField: 'wallet_address',
        filterValue: '0xabc'
      });
    });

    await waitFor(() => {
      expect(screen.queryByTestId('metric-grid-empty-state')).not.toBeInTheDocument();
      expect(screen.getByTestId('metric-widget')).toHaveAttribute('data-metric-id', 'portfolio_metric');
    });
  });

  it('shows the no-results empty state when the explicit-filter wallet has no portfolio data', async () => {
    metricsService.getMetricData.mockResolvedValueOnce({
      data: []
    });

    render(
      <MetricGrid
        metrics={[
          { id: 'portfolio_metric', name: 'Portfolio', gridRow: '1', gridColumn: '1 / span 12' }
        ]}
        tabConfig={{
          id: 'user-portfolio',
          globalFilterField: 'wallet_address',
          requireExplicitFilter: true,
          explicitFilterValidationMetric: 'portfolio_validation_metric',
          globalControlsPlacement: 'top',
          emptyState: {
            emptyResultsTitle: 'No portfolio found for this wallet',
            emptyResultsDescription: 'Try another wallet address.'
          }
        }}
        globalFilterValue="0xmissing"
        onGlobalFilterChange={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('metric-grid-empty-state')).toHaveAttribute('data-state', 'invalid');
    });

    expect(screen.getByText('No portfolio found for this wallet')).toBeInTheDocument();
    expect(screen.getByText('Try another wallet address.')).toBeInTheDocument();
    expect(screen.queryAllByTestId('metric-widget')).toHaveLength(0);
  });

  it('uses the same validation flow for an initial wallet value', async () => {
    metricsService.getMetricData.mockResolvedValueOnce({
      data: [{ wallet_address: '0xfromurl', value: 12 }]
    });

    render(
      <MetricGrid
        metrics={[
          { id: 'portfolio_metric', name: 'Portfolio', gridRow: '1', gridColumn: '1 / span 12' }
        ]}
        tabConfig={{
          id: 'user-portfolio',
          globalFilterField: 'wallet_address',
          requireExplicitFilter: true,
          explicitFilterValidationMetric: 'portfolio_validation_metric',
          globalControlsPlacement: 'top'
        }}
        globalFilterValue="0xfromurl"
        onGlobalFilterChange={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(metricsService.getMetricData).toHaveBeenCalledWith('portfolio_validation_metric', {
        filterField: 'wallet_address',
        filterValue: '0xfromurl'
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('metric-widget')).toHaveAttribute('data-metric-id', 'portfolio_metric');
    });
  });

  it('keeps Circles user cards hidden until an avatar is chosen while still loading search options', async () => {
    metricsService.getMetricData.mockResolvedValueOnce({
      data: [{ avatar: '0xabc', display_name: 'Alice Example' }]
    });

    render(
      <MetricGrid
        metrics={[
          { id: 'api_execution_circles_v2_avatar_metadata', name: 'Avatar metadata', gridRow: '1', gridColumn: '1 / span 9' },
          { id: 'global_filter', gridRow: '1', gridColumn: '10 / span 3' }
        ]}
        tabConfig={{
          id: 'circles-user',
          globalFilterField: 'avatar',
          globalFilterLabel: 'Avatar',
          globalFilterDisplayField: 'display_name',
          globalFilterSourceMetric: 'api_execution_circles_v2_avatar_search',
          searchable: true,
          requireExplicitFilter: true,
          explicitFilterValidationMetric: 'api_execution_circles_v2_avatar_metadata',
          globalControlsPlacement: 'top',
          timeRanges: true,
          emptyState: {
            title: 'Explore a Circles user',
            description: 'Search by name or paste an avatar address to load user cards.'
          }
        }}
        globalFilterValue={null}
        onGlobalFilterChange={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(metricsService.getMetricData).toHaveBeenCalledWith('api_execution_circles_v2_avatar_search', {
        from: '2025-01-01',
        to: '2025-03-31'
      });
    });

    expect(screen.getByTestId('global-filter-widget')).toHaveAttribute('data-placement', 'top');
    expect(screen.getByTestId('metric-grid-empty-state')).toHaveAttribute('data-state', 'idle');
    expect(screen.getByText('Explore a Circles user')).toBeInTheDocument();
    expect(screen.queryByText('Date range')).not.toBeInTheDocument();
    expect(screen.queryAllByTestId('metric-widget')).toHaveLength(0);
  });

  it('validates a selected Circles avatar address before rendering user cards', async () => {
    metricsService.getMetricData.mockImplementation((metricId) => {
      if (metricId === 'api_execution_circles_v2_avatar_search') {
        return Promise.resolve({
          data: [{ avatar: '0xabc', display_name: 'Alice Example' }]
        });
      }

      if (metricId === 'api_execution_circles_v2_avatar_metadata') {
        return Promise.resolve({
          data: [{ avatar: '0xabc', metadata_name: 'Alice Example' }]
        });
      }

      return Promise.resolve({ data: [] });
    });

    render(
      <MetricGrid
        metrics={[
          { id: 'api_execution_circles_v2_avatar_metadata', name: 'Avatar metadata', gridRow: '1', gridColumn: '1 / span 9' },
          { id: 'global_filter', gridRow: '1', gridColumn: '10 / span 3' }
        ]}
        tabConfig={{
          id: 'circles-user',
          globalFilterField: 'avatar',
          globalFilterLabel: 'Avatar',
          globalFilterDisplayField: 'display_name',
          globalFilterSourceMetric: 'api_execution_circles_v2_avatar_search',
          searchable: true,
          requireExplicitFilter: true,
          explicitFilterValidationMetric: 'api_execution_circles_v2_avatar_metadata',
          globalControlsPlacement: 'top',
          timeRanges: true
        }}
        globalFilterValue="0xAbC"
        onGlobalFilterChange={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(metricsService.getMetricData).toHaveBeenCalledWith('api_execution_circles_v2_avatar_metadata', {
        filterField: 'avatar',
        filterValue: '0xabc'
      });
    });

    await waitFor(() => {
      expect(screen.queryByTestId('metric-grid-empty-state')).not.toBeInTheDocument();
      expect(screen.getByTestId('metric-widget')).toHaveAttribute('data-metric-id', 'api_execution_circles_v2_avatar_metadata');
    });

    expect(screen.getByText('Date range')).toBeInTheDocument();
  });

  it('shows the no-results state for an invalid Circles name search', async () => {
    metricsService.getMetricData.mockImplementation((metricId) => {
      if (metricId === 'api_execution_circles_v2_avatar_search') {
        return Promise.resolve({
          data: [{ avatar: '0xabc', display_name: 'Alice Example' }]
        });
      }

      if (metricId === 'api_execution_circles_v2_avatar_metadata') {
        return Promise.resolve({ data: [] });
      }

      return Promise.resolve({ data: [] });
    });

    render(
      <MetricGrid
        metrics={[
          { id: 'api_execution_circles_v2_avatar_metadata', name: 'Avatar metadata', gridRow: '1', gridColumn: '1 / span 9' },
          { id: 'global_filter', gridRow: '1', gridColumn: '10 / span 3' }
        ]}
        tabConfig={{
          id: 'circles-user',
          globalFilterField: 'avatar',
          globalFilterLabel: 'Avatar',
          globalFilterDisplayField: 'display_name',
          globalFilterSourceMetric: 'api_execution_circles_v2_avatar_search',
          searchable: true,
          requireExplicitFilter: true,
          explicitFilterValidationMetric: 'api_execution_circles_v2_avatar_metadata',
          globalControlsPlacement: 'top',
          timeRanges: true,
          emptyState: {
            emptyResultsTitle: 'No Circles user found',
            emptyResultsDescription: 'Try another name or avatar address.'
          }
        }}
        globalFilterValue="Unknown User"
        onGlobalFilterChange={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(metricsService.getMetricData).toHaveBeenCalledWith('api_execution_circles_v2_avatar_metadata', {
        filterField: 'avatar',
        filterValue: 'Unknown User'
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('metric-grid-empty-state')).toHaveAttribute('data-state', 'invalid');
    });

    expect(screen.getByText('No Circles user found')).toBeInTheDocument();
    expect(screen.getByText('Try another name or avatar address.')).toBeInTheDocument();
    expect(screen.queryByText('Date range')).not.toBeInTheDocument();
    expect(screen.queryAllByTestId('metric-widget')).toHaveLength(0);
  });

  it('shows a branded no-results state for non-Gnosis Pay wallets', async () => {
    metricsService.getMetricData.mockResolvedValueOnce({
      data: []
    });

    render(
      <MetricGrid
        metrics={[
          { id: 'api_execution_gpay_user_lifetime_tenure_days', name: 'Tenure', gridRow: '1', gridColumn: '1 / span 4' },
          { id: 'global_filter', gridRow: '1', gridColumn: '9 / span 4' }
        ]}
        tabConfig={{
          id: 'gnosis-pay-user-portfolio',
          globalFilterField: 'wallet_address',
          globalFilterLabel: 'Wallet',
          searchable: true,
          requireExplicitFilter: true,
          explicitFilterValidationMetric: 'api_execution_gpay_user_lifetime_tenure_days',
          globalControlsPlacement: 'top',
          emptyState: {
            title: 'Explore your Gnosis Pay portfolio',
            description: 'Paste a wallet address to load balances and activity cards.',
            emptyResultsTitle: 'This wallet is not a Gnosis Pay wallet',
            emptyResultsDescription: 'Try another wallet address.'
          }
        }}
        globalFilterValue="0xb7c85EDf3500806C0F7BACb9E1C88f0Ff3B7FDb8"
        onGlobalFilterChange={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(metricsService.getMetricData).toHaveBeenCalledWith('api_execution_gpay_user_lifetime_tenure_days', {
        filterField: 'wallet_address',
        filterValue: '0xb7c85edf3500806c0f7bacb9e1c88f0ff3b7fdb8'
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('metric-grid-empty-state')).toHaveAttribute('data-state', 'invalid');
    });

    expect(screen.getByTestId('global-filter-widget')).toHaveAttribute('data-placement', 'top');
    expect(screen.getByText('This wallet is not a Gnosis Pay wallet')).toBeInTheDocument();
    expect(screen.getByText('Try another wallet address.')).toBeInTheDocument();
    expect(screen.queryAllByTestId('metric-widget')).toHaveLength(0);
  });

  it('keeps Gnosis Pay portfolio cards hidden until a wallet is entered', () => {
    render(
      <MetricGrid
        metrics={[
          { id: 'api_execution_gpay_user_lifetime_tenure_days', name: 'Tenure', gridRow: '1', gridColumn: '1 / span 4' },
          { id: 'global_filter', gridRow: '1', gridColumn: '9 / span 4' }
        ]}
        tabConfig={{
          id: 'gnosis-pay-user-portfolio',
          globalFilterField: 'wallet_address',
          globalFilterLabel: 'Wallet',
          searchable: true,
          requireExplicitFilter: true,
          explicitFilterValidationMetric: 'api_execution_gpay_user_lifetime_tenure_days',
          globalControlsPlacement: 'top',
          emptyState: {
            title: 'Explore your Gnosis Pay portfolio',
            description: 'Paste a wallet address to load balances and activity cards.'
          }
        }}
        globalFilterValue={null}
        onGlobalFilterChange={vi.fn()}
      />
    );

    expect(screen.getByTestId('global-filter-widget')).toHaveAttribute('data-placement', 'top');
    expect(screen.getByTestId('metric-grid-empty-state')).toHaveAttribute('data-state', 'idle');
    expect(screen.getByText('Explore your Gnosis Pay portfolio')).toBeInTheDocument();
    expect(screen.queryAllByTestId('metric-widget')).toHaveLength(0);
    expect(metricsService.getMetricData).not.toHaveBeenCalled();
  });
});

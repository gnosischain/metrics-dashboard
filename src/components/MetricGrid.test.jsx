import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
  default: ({ metricId }) => <div data-testid="metric-widget" data-metric-id={metricId}></div>
}));

vi.mock('./GlobalFilterWidget', () => ({
  default: ({ globalFilterOptions = [], loadingGlobalFilter, placement = 'grid' }) => (
    <div
      data-testid="global-filter-widget"
      data-options={globalFilterOptions.join(',')}
      data-loading={loadingGlobalFilter ? 'true' : 'false'}
      data-placement={placement}
    ></div>
  )
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
});

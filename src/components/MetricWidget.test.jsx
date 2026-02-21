import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import MetricWidget from './MetricWidget';
import metricsService from '../services/metrics';
import * as echarts from 'echarts';
import { downloadEChartInstanceAsPng } from '../utils/echarts/exportImage';

vi.mock('../services/metrics', () => ({
  default: {
    getMetricConfig: vi.fn(),
    getMetricData: vi.fn()
  }
}));

vi.mock('echarts', () => ({
  getInstanceByDom: vi.fn()
}));

vi.mock('../utils/echarts/exportImage', () => ({
  downloadEChartInstanceAsPng: vi.fn()
}));

vi.mock('./index', () => ({
  Card: ({ children, title, subtitle, headerControls }) => (
    <div data-testid="card" className="metric-card">
      <h3>{title}</h3>
      {subtitle ? <p>{subtitle}</p> : null}
      {headerControls ? <div data-testid="card-controls">{headerControls}</div> : null}
      {children}
    </div>
  ),
  NumberWidget: ({ value }) => <div data-testid="number-widget">{String(value)}</div>,
  TextWidget: ({ content }) => <div data-testid="text-widget">{content}</div>,
  TableWidget: ({ data }) => <div data-testid="table-widget">{Array.isArray(data) ? data.length : 0}</div>
}));

vi.mock('./LabelSelector', () => ({
  default: () => <div data-testid="label-selector"></div>
}));

vi.mock('./InfoPopover', () => ({
  default: () => <div data-testid="info-popover"></div>
}));

vi.mock('./charts/ChartTypes/EChartsContainer', () => ({
  default: ({ data }) => <div data-testid="chart-widget" className="echarts-container">chart-{Array.isArray(data) ? data.length : 0}</div>
}));

const createDeferred = () => {
  let resolve;
  const promise = new Promise((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

describe('MetricWidget loading behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    metricsService.getMetricConfig.mockReturnValue({
      id: 'metric_test',
      chartType: 'line',
      name: 'Test Chart',
      description: 'Chart description',
      enableFiltering: false
    });
  });

  it('renders a skeleton during initial loading', async () => {
    const firstRequest = createDeferred();
    metricsService.getMetricData.mockImplementationOnce(() => firstRequest.promise);

    const { container } = render(<MetricWidget metricId="metric_test" />);

    expect(container.querySelector('.metric-skeleton')).toBeInTheDocument();

    firstRequest.resolve({
      data: [{ date: '2025-01-01', value: 10 }]
    });

    await waitFor(() => {
      expect(screen.getByTestId('chart-widget')).toHaveTextContent('chart-1');
    });
  });

  it('keeps previous content visible during refetch and shows subtle overlay', async () => {
    const secondRequest = createDeferred();

    metricsService.getMetricData
      .mockResolvedValueOnce({
        data: [{ date: '2025-01-01', token: 'AAA', value: 10 }]
      })
      .mockImplementationOnce(() => secondRequest.promise);

    const { rerender, container } = render(
      <MetricWidget
        metricId="metric_test"
        hasGlobalFilter={true}
        globalFilterField="token"
        globalFilterValue="AAA"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('chart-widget')).toHaveTextContent('chart-1');
    });

    rerender(
      <MetricWidget
        metricId="metric_test"
        hasGlobalFilter={true}
        globalFilterField="token"
        globalFilterValue="BBB"
      />
    );

    expect(screen.getByTestId('chart-widget')).toHaveTextContent('chart-1');
    expect(container.querySelector('.loading-overlay-subtle')).toBeInTheDocument();

    secondRequest.resolve({
      data: [
        { date: '2025-01-01', token: 'BBB', value: 14 },
        { date: '2025-01-02', token: 'BBB', value: 16 }
      ]
    });

    await waitFor(() => {
      expect(screen.getByTestId('chart-widget')).toHaveTextContent('chart-2');
    });
  });

  it('ignores stale responses from older requests', async () => {
    const slowRequest = createDeferred();
    const fastRequest = createDeferred();

    metricsService.getMetricData
      .mockImplementationOnce(() => slowRequest.promise)
      .mockImplementationOnce(() => fastRequest.promise);

    const { rerender } = render(
      <MetricWidget
        metricId="metric_test"
        hasGlobalFilter={true}
        globalFilterField="token"
        globalFilterValue="AAA"
      />
    );

    rerender(
      <MetricWidget
        metricId="metric_test"
        hasGlobalFilter={true}
        globalFilterField="token"
        globalFilterValue="BBB"
      />
    );

    fastRequest.resolve({
      data: [
        { date: '2025-01-01', token: 'BBB', value: 20 },
        { date: '2025-01-02', token: 'BBB', value: 22 }
      ]
    });

    await waitFor(() => {
      expect(screen.getByTestId('chart-widget')).toHaveTextContent('chart-2');
    });

    slowRequest.resolve({
      data: [{ date: '2025-01-01', token: 'AAA', value: 11 }]
    });

    await waitFor(() => {
      expect(screen.getByTestId('chart-widget')).toHaveTextContent('chart-2');
    });
  });
});

describe('MetricWidget download control', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a download button for chart widgets', async () => {
    metricsService.getMetricConfig.mockReturnValue({
      id: 'metric_chart',
      chartType: 'line',
      name: 'Test Chart',
      enableFiltering: false
    });
    metricsService.getMetricData.mockResolvedValueOnce({
      data: [{ date: '2025-01-01', value: 1 }]
    });

    render(<MetricWidget metricId="metric_chart" />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-widget')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /download test chart as png/i })).toBeInTheDocument();
  });

  it('does not render a download button for non-chart widgets', async () => {
    metricsService.getMetricConfig.mockReturnValue({
      id: 'metric_number',
      chartType: 'number',
      name: 'Number Metric',
      valueField: 'value'
    });
    metricsService.getMetricData.mockResolvedValueOnce({
      data: [{ value: 7 }]
    });

    render(<MetricWidget metricId="metric_number" />);

    await waitFor(() => {
      expect(screen.getByTestId('number-widget')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /download/i })).not.toBeInTheDocument();
  });

  it('downloads from the nearest chart instance when clicked', async () => {
    const mockChartInstance = { getDataURL: vi.fn(() => 'data:image/png;base64,abc') };

    metricsService.getMetricConfig.mockReturnValue({
      id: 'metric_chart_download',
      chartType: 'line',
      name: 'Downloadable Chart',
      enableFiltering: false
    });
    metricsService.getMetricData.mockResolvedValueOnce({
      data: [{ date: '2025-01-01', value: 10 }]
    });
    echarts.getInstanceByDom.mockReturnValue(mockChartInstance);

    render(<MetricWidget metricId="metric_chart_download" />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-widget')).toBeInTheDocument();
    });

    const downloadButton = screen.getByRole('button', { name: /download downloadable chart as png/i });
    fireEvent.click(downloadButton);

    expect(echarts.getInstanceByDom).toHaveBeenCalledTimes(1);
    const chartDomNode = echarts.getInstanceByDom.mock.calls[0][0];
    expect(chartDomNode).toHaveClass('echarts-container');

    expect(downloadEChartInstanceAsPng).toHaveBeenCalledWith(
      mockChartInstance,
      expect.objectContaining({
        title: 'Downloadable Chart',
        isDarkMode: false
      })
    );
  });
});

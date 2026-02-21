import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import MetricSearchBar from './MetricSearchBar';

const SEARCH_INDEX = [
  {
    key: 'network::overview::api_p2p_topology_latest',
    dashboardId: 'network',
    dashboardName: 'Network',
    tabId: 'overview',
    tabName: 'Overview',
    metricId: 'api_p2p_topology_latest',
    metricName: 'P2P Geographic Network Topology',
    description: 'Geographic network visualization',
    metricDescription: ''
  },
  {
    key: 'consensus::validators::api_consensus_withdrawals_daily',
    dashboardId: 'consensus',
    dashboardName: 'Consensus',
    tabId: 'validators',
    tabName: 'Validators',
    metricId: 'api_consensus_withdrawals_daily',
    metricName: 'Validator Withdrawals',
    description: 'Daily withdrawal amount',
    metricDescription: ''
  },
  {
    key: 'gnosis_pay::overview::api_execution_gpay_payments_7d',
    dashboardId: 'gnosis_pay',
    dashboardName: 'Gnosis Pay',
    tabId: 'overview',
    tabName: 'Overview',
    metricId: 'api_execution_gpay_payments_7d',
    metricName: 'Payments',
    description: 'Last 7 days',
    metricDescription: ''
  },
  {
    key: 'gnosis_pay::overview::api_execution_gpay_payments_by_token_weekly',
    dashboardId: 'gnosis_pay',
    dashboardName: 'Gnosis Pay',
    tabId: 'overview',
    tabName: 'Overview',
    metricId: 'api_execution_gpay_payments_by_token_weekly',
    metricName: 'Payments',
    description: 'Weekly payment count',
    metricDescription: ''
  }
];

describe('MetricSearchBar', () => {
  it('renders suggestions and selects an item via click', () => {
    const onSelect = vi.fn();

    render(
      <MetricSearchBar
        searchIndex={SEARCH_INDEX}
        onSelect={onSelect}
        searchEnabled={true}
      />
    );

    const input = screen.getByRole('searchbox', { name: /search metrics/i });
    fireEvent.change(input, { target: { value: 'topology' } });

    expect(screen.getByText('P2P Geographic Network Topology')).toBeInTheDocument();
    fireEvent.click(screen.getByText('P2P Geographic Network Topology'));

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({
      metricId: 'api_p2p_topology_latest',
      dashboardId: 'network',
      tabId: 'overview'
    }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('supports keyboard navigation and enter to select', () => {
    const onSelect = vi.fn();

    render(
      <MetricSearchBar
        searchIndex={SEARCH_INDEX}
        onSelect={onSelect}
        searchEnabled={true}
      />
    );

    const input = screen.getByRole('searchbox', { name: /search metrics/i });
    fireEvent.change(input, { target: { value: 'validator' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({
      metricId: 'api_consensus_withdrawals_daily',
      dashboardId: 'consensus',
      tabId: 'validators'
    }));
  });

  it('closes menu on escape and outside click', () => {
    const onSelect = vi.fn();

    render(
      <div>
        <MetricSearchBar
          searchIndex={SEARCH_INDEX}
          onSelect={onSelect}
          searchEnabled={true}
        />
        <button type="button">Outside</button>
      </div>
    );

    const input = screen.getByRole('searchbox', { name: /search metrics/i });
    fireEvent.change(input, { target: { value: 'topology' } });
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    fireEvent.focus(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole('button', { name: 'Outside' }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('disambiguates duplicate title/path results with a qualifier', () => {
    render(
      <MetricSearchBar
        searchIndex={SEARCH_INDEX}
        onSelect={vi.fn()}
        searchEnabled={true}
      />
    );

    const input = screen.getByRole('searchbox', { name: /search metrics/i });
    fireEvent.change(input, { target: { value: 'payments' } });

    expect(screen.getByText('Payments (Last 7 days)')).toBeInTheDocument();
    expect(screen.getByText('Payments (Weekly payment count)')).toBeInTheDocument();
  });
});

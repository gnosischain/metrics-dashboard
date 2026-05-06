import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AccountPortfolio from './AccountPortfolio';
import accountPortfolioService from '../services/accountPortfolio';

const ADDRESS = '0xa6247834b41771022498f63cae8820ffee208265';

const serviceMock = vi.hoisted(() => ({
  search: vi.fn(),
  resolveSearch: vi.fn(),
  getOverview: vi.fn(),
  prefetchOverview: vi.fn(),
  getProfile: vi.fn(),
  getRoleFlags: vi.fn(),
  getCirclesAvatarMetadata: vi.fn(),
  getSafes: vi.fn(),
  getSafeOwners: vi.fn(),
  getLinkedEntities: vi.fn(),
  getActivitySummary: vi.fn(),
  getHoldings: vi.fn(),
  getBalanceHistory: vi.fn(),
  getMovements: vi.fn(),
  getYields: vi.fn(),
}));

vi.mock('../services/accountPortfolio', () => {
  const normalizeAccountSelection = (result) => {
    if (!result) return null;
    const resultType = result.resultType || result.result_type || 'address';
    const address = result.address ? String(result.address).toLowerCase() : '';
    return {
      address: resultType.startsWith('validator') ? '' : address,
      sourceType: resultType,
      displayLabel: result.displayLabel || result.display_label || address,
      validatorIndex: result.validatorIndex || result.validator_index || null,
      withdrawalCredentials: result.withdrawalCredentials || result.withdrawal_credentials || null,
      withdrawalAddress: result.withdrawalAddress || result.withdrawal_address || '',
      preferredTab: resultType === 'circles' ? 'circles' : 'overview',
      raw: result,
    };
  };

  const selectionFromRawInput = (value) => {
    const trimmed = String(value || '').trim();
    if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      return normalizeAccountSelection({
        resultType: 'address',
        address: trimmed,
        displayLabel: trimmed.toLowerCase(),
      });
    }
    return null;
  };

  return {
    default: serviceMock,
    normalizeAccountSelection,
    selectionFromRawInput,
  };
});

vi.mock('./DashboardHeader', () => ({
  default: ({ children }) => <div data-testid="dashboard-header">{children}</div>,
}));

vi.mock('./MetricWidget', () => ({
  default: ({ metricId, globalFilterField, globalFilterValue, tableConfigOverrides, tableHeight }) => (
    <div
      data-testid="portfolio-metric"
      data-metric-id={metricId}
      data-filter-field={globalFilterField || ''}
      data-filter-value={globalFilterValue || ''}
      data-table-height={tableHeight || ''}
      data-pagination-size={String(tableConfigOverrides?.paginationSize || '')}
      data-pagination-selector={Array.isArray(tableConfigOverrides?.paginationSizeSelector) ? tableConfigOverrides.paginationSizeSelector.join('|') : ''}
      data-responsive-layout={String(tableConfigOverrides?.responsiveLayout)}
      data-row-height={String(tableConfigOverrides?.rowHeight || '')}
    >
      {metricId}
    </div>
  ),
}));

vi.mock('./MetricWidgetSkeleton', () => ({
  default: () => <div data-testid="metric-skeleton" />,
}));

vi.mock('./ValidatorExplorer', () => ({
  default: () => <div data-testid="validator-explorer">validator explorer</div>,
}));

describe('AccountPortfolio section tabs', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    accountPortfolioService.search.mockResolvedValue([]);
    accountPortfolioService.resolveSearch.mockResolvedValue(null);
    // Default the batch overview fetch to null so the component falls back
    // to the per-section getters that the tests already configure below.
    accountPortfolioService.getOverview.mockResolvedValue(null);
    accountPortfolioService.prefetchOverview.mockReturnValue(undefined);
    accountPortfolioService.getProfile.mockResolvedValue({
      address: ADDRESS,
      display_name: 'Alice Account',
      is_circles_avatar: true,
      circles_name: 'Alice CRC',
      total_balance_usd: 1240,
      tokens_held: 2,
      first_seen_date: '2025-01-01',
      last_active_date: '2026-04-01',
    });
    accountPortfolioService.getRoleFlags.mockResolvedValue({
      is_circles_avatar: true,
      circles_name: 'Alice CRC',
    });
    accountPortfolioService.getCirclesAvatarMetadata.mockResolvedValue({
      avatar: ADDRESS,
      avatar_type: 'Human',
      metadata_name: 'Alice CRC',
      metadata_preview_image_url: '',
    });
    accountPortfolioService.getSafes.mockResolvedValue([]);
    accountPortfolioService.getSafeOwners.mockResolvedValue([]);
    accountPortfolioService.getLinkedEntities.mockResolvedValue([]);
    accountPortfolioService.getActivitySummary.mockResolvedValue({
      first_activity_date: '2026-03-01',
      last_activity_date: '2026-04-01',
      active_days: 4,
      token_transfer_count: 3,
      counterparty_count: 1,
      token_count_moved: 2,
    });
    accountPortfolioService.getHoldings.mockResolvedValue([
      {
        token_address: '0x0000000000000000000000000000000000000001',
        symbol: 'GNO',
        balance: 10,
        balance_usd: 1000,
        token_class: 'governance',
        date: '2026-04-01',
      },
    ]);
    accountPortfolioService.getBalanceHistory.mockResolvedValue([
      {
        date: '2026-04-01',
        total_balance_usd: 1240,
        tokens_held: 2,
      },
    ]);
    accountPortfolioService.getMovements.mockResolvedValue([
      {
        date: '2026-04-01',
        source: 'transfer',
        action: 'transfer',
        direction: 'inflow',
        symbol: 'GNO',
        amount: 1,
        amount_usd: 100,
        counterparty: '0x0000000000000000000000000000000000000002',
      },
    ]);
    accountPortfolioService.getYields.mockResolvedValue({ lp: [], lending: [] });
  });

  it('isolates account sections in in-page tabs without repeating the Circles profile metric', async () => {
    const { container } = render(
      <AccountPortfolio
        tabConfig={{ emptyState: {} }}
        dashboard={{ id: 'accounts', name: 'Accounts' }}
        portfolioState={{ address: ADDRESS }}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Alice Account' })).toBeInTheDocument();
      expect(screen.getAllByText('Alice CRC').length).toBeGreaterThan(0);
    });

    expect(screen.getByRole('tablist', { name: 'Account portfolio sections' })).toBeInTheDocument();
    expect(screen.getByText('Account Signals')).toBeInTheDocument();
    expect(screen.queryByText('Token balances')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Circles' })).toBeInTheDocument();
    }, { timeout: 2500 });

    fireEvent.click(screen.getByRole('tab', { name: 'Circles' }));

    const circlesSection = container.querySelector('[data-section-key="circles"]');
    expect(circlesSection).toBeInTheDocument();
    expect(circlesSection).toHaveClass('account-portfolio-section');
    expect(circlesSection).not.toHaveClass('ap-workbench-card');
    expect(Array.from(circlesSection.children).some((child) => child.classList.contains('ap-card'))).toBe(false);

    expect(container.querySelector('[data-metric-id="api_execution_circles_v2_avatar_metadata"]')).toBeNull();
    expect(container.querySelector('[data-metric-id="api_execution_circles_v2_avatar_metadata_history"]')).toBeInTheDocument();
  });

  it('uses colored source and direction labels in the Activity table', async () => {
    const { container } = render(
      <AccountPortfolio
        tabConfig={{ emptyState: {} }}
        dashboard={{ id: 'accounts', name: 'Accounts' }}
        portfolioState={{ address: ADDRESS }}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Activity' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('tab', { name: 'Activity' }));

    await waitFor(() => {
      expect(container.querySelector('.ap-pill--transfer')).toHaveTextContent('Transfer');
      expect(container.querySelector('.ap-pill--inflow')).toHaveTextContent('transfer');
    }, { timeout: 2500 });
  });

  it('renders compact Yields activity and wraps position tables', async () => {
    accountPortfolioService.getProfile.mockResolvedValue({
      address: ADDRESS,
      display_name: 'Alice Account',
      is_lp_provider: true,
      has_yield_activity: true,
    });
    accountPortfolioService.getRoleFlags.mockResolvedValue({
      is_lp_provider: true,
    });
    accountPortfolioService.getYields.mockResolvedValue({
      lp: [{
        protocol: 'Balancer V2',
        pool_address: '0x0000000000000000000000000000000000000001',
        capital_in_usd: 100,
        capital_out_usd: 0,
        fees_collected_usd: 2,
        is_active: true,
        is_in_range: true,
        last_action_date: '2026-04-01',
      }],
      lending: [{
        protocol: 'Aave V3',
        symbol: 'EURe',
        balance: 10,
        balance_usd: 11,
        supply_apy: 3.2,
        reserve_address: '0x0000000000000000000000000000000000000002',
      }],
      activity: [{
        block_timestamp: '2026-04-02T12:34:00Z',
        transaction_hash: '0xabc123',
        source: 'lending',
        action: 'Supply',
        protocol: 'Aave V3',
        token_symbol: 'EURe',
        amount: 10,
        amount_usd: 11,
      }],
    });

    const { container } = render(
      <AccountPortfolio
        tabConfig={{ emptyState: {} }}
        dashboard={{ id: 'accounts', name: 'Accounts' }}
        portfolioState={{ address: ADDRESS }}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Yields' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('tab', { name: 'Yields' }));

    await waitFor(() => {
      expect(screen.getByText('Activity History')).toBeInTheDocument();
    }, { timeout: 3000 });

    const activityCard = [...container.querySelectorAll('.ap-card')]
      .find((element) => element.textContent.includes('Activity History'));
    expect(activityCard).toBeTruthy();
    expect(activityCard.querySelector('.ap-pill--lending')).toHaveTextContent('Lending');
    expect(activityCard.querySelector('.ap-pill--inflow')).toHaveTextContent('Supply');
    expect(activityCard.querySelector('.ap-token-cell')).toHaveTextContent('EURe');
    expect(activityCard.querySelector('.ap-amount--inflow')).toHaveTextContent('10.00');
    expect(container.querySelectorAll('.ap-table-wrapper .ap-table--portfolio')).toHaveLength(3);
  });
});

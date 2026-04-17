import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import GlobalFilterWidget from './GlobalFilterWidget';

describe('GlobalFilterWidget explicit filter behavior', () => {
  it('shows the placeholder instead of auto-selecting the first option', () => {
    render(
      <GlobalFilterWidget
        tabConfig={{
          globalFilterField: 'wallet_address',
          globalFilterLabel: 'Wallet',
          searchable: true,
          requireExplicitFilter: true,
          searchPlaceholder: 'Paste wallet address and press Enter...'
        }}
        globalFilterOptions={['0x00000000091b2041a94d32b05556c52028161b28']}
        globalFilterValue={null}
        onGlobalFilterChange={vi.fn()}
        loadingGlobalFilter={false}
        hasUnitToggle={false}
      />
    );

    expect(screen.getByRole('button')).toHaveTextContent('Paste wallet address and press Enter...');
    expect(screen.getByRole('button')).not.toHaveTextContent('0x00000000091b2041a94d32b05556c52028161b28');
  });

  it('lowercases pasted wallet addresses before selection', () => {
    const onGlobalFilterChange = vi.fn();

    render(
      <GlobalFilterWidget
        tabConfig={{
          globalFilterField: 'wallet_address',
          globalFilterLabel: 'Wallet',
          searchable: true,
          requireExplicitFilter: true,
          searchPlaceholder: 'Paste wallet address and press Enter...'
        }}
        globalFilterOptions={[]}
        globalFilterValue={null}
        onGlobalFilterChange={onGlobalFilterChange}
        loadingGlobalFilter={false}
        hasUnitToggle={false}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    fireEvent.change(screen.getByPlaceholderText('Paste wallet address and press Enter...'), {
      target: {
        value: '0xb7c85EDf3500806C0F7BACb9E1C88f0Ff3B7FDb8'
      }
    });
    fireEvent.keyDown(screen.getByPlaceholderText('Paste wallet address and press Enter...'), {
      key: 'Enter'
    });

    expect(onGlobalFilterChange).toHaveBeenCalledWith('0xb7c85edf3500806c0f7bacb9e1c88f0ff3b7fdb8');
  });
});

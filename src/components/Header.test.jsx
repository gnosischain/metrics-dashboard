import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Header from './Header';

describe('Header', () => {
  it('renders resources trigger in header actions', () => {
    render(
      <Header
        dashboardName="Overview"
        isDarkMode={false}
        toggleTheme={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /resources/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
  });

  it('supports custom resourceLinks prop', () => {
    const customLinks = [
      {
        id: 'docs',
        label: 'Docs',
        links: [{ id: 'overview', label: 'Overview Docs', href: 'https://example.com/docs' }]
      }
    ];

    render(
      <Header
        dashboardName="Overview"
        isDarkMode={false}
        toggleTheme={vi.fn()}
        resourceLinks={customLinks}
      />
    );

    expect(screen.getByRole('button', { name: /resources/i })).toBeInTheDocument();
  });
});

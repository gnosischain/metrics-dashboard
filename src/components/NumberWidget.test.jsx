import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import NumberWidget from './NumberWidget';

describe('NumberWidget dashboard palette fallback', () => {
  it('uses dashboard light accent when color is omitted', () => {
    render(
      <NumberWidget
        value={123}
        dashboardPalette={{ numberAccentLight: '#3F2ACD', numberAccentDark: '#CBFB6C' }}
        isDarkMode={false}
      />
    );

    expect(screen.getByText('123')).toHaveStyle({ color: '#3F2ACD' });
  });

  it('uses dashboard dark accent when color is default and dark mode is active', () => {
    render(
      <NumberWidget
        value={123}
        color="#4F46E5"
        dashboardPalette={{ numberAccentLight: '#3F2ACD', numberAccentDark: '#CBFB6C' }}
        isDarkMode={true}
      />
    );

    expect(screen.getByText('123')).toHaveStyle({ color: '#CBFB6C' });
  });

  it('preserves explicit non-default metric color', () => {
    render(
      <NumberWidget
        value={123}
        color="#ff0000"
        dashboardPalette={{ numberAccentLight: '#3F2ACD', numberAccentDark: '#CBFB6C' }}
        isDarkMode={false}
      />
    );

    expect(screen.getByText('123')).toHaveStyle({ color: '#ff0000' });
  });
});

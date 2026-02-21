import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import InfoPopover from './InfoPopover';

describe('InfoPopover', () => {
  it('renders markdown content with linked accessibility attributes', () => {
    render(<InfoPopover text={'# Overview\n\n- First\n- Second'} />);

    const toggleButton = screen.getByRole('button', { name: 'Metric information' });
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggleButton);

    const popover = screen.getByRole('dialog');
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    expect(toggleButton).toHaveAttribute('aria-controls', popover.id);
    expect(screen.getByRole('heading', { name: 'Overview', level: 1 })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(popover.querySelector('.metric-info-popover-content')).toBeInTheDocument();
  });

  it('closes on outside click and Escape key', () => {
    render(
      <div>
        <InfoPopover text={'Simple content'} />
        <button type="button">Outside target</button>
      </div>
    );

    const toggleButton = screen.getByRole('button', { name: 'Metric information' });
    fireEvent.click(toggleButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole('button', { name: 'Outside target' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

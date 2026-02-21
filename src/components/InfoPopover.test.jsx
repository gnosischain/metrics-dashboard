import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import InfoPopover from './InfoPopover';

const setViewport = (width, height) => {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width
  });
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    writable: true,
    value: height
  });
};

const mockRect = (element, rect) => {
  const normalized = {
    x: rect.left ?? 0,
    y: rect.top ?? 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    toJSON: () => ({}),
    ...rect
  };

  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () => normalized
  });
};

const mockRectFromWidthStyle = (element, { height = 200 } = {}) => {
  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () => {
      const width = Number.parseFloat(element.style.width) || 360;
      return {
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: width,
        bottom: height,
        width,
        height,
        toJSON: () => ({})
      };
    }
  });
};

describe('InfoPopover', () => {
  it('renders markdown content with linked accessibility attributes', async () => {
    setViewport(1280, 800);
    render(<InfoPopover text={'# Overview\n\n- First\n- Second'} />);

    const toggleButton = screen.getByRole('button', { name: 'Metric information' });
    mockRect(toggleButton, {
      top: 100,
      left: 700,
      right: 720,
      bottom: 120,
      width: 20,
      height: 20
    });
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggleButton);

    const popover = screen.getByRole('dialog', { hidden: true });
    mockRect(popover, {
      top: 0,
      left: 0,
      right: 360,
      bottom: 220,
      width: 360,
      height: 220
    });
    fireEvent(window, new Event('resize'));

    await waitFor(() => {
      expect(popover.style.visibility).toBe('visible');
    });

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
    expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole('button', { name: 'Outside target' }));
    expect(screen.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument();
  });

  it('positions the portal popover with numeric top and left values', async () => {
    setViewport(1280, 800);
    render(<InfoPopover text={'Simple content'} />);

    const toggleButton = screen.getByRole('button', { name: 'Metric information' });
    mockRect(toggleButton, {
      top: 110,
      left: 750,
      right: 770,
      bottom: 130,
      width: 20,
      height: 20
    });

    fireEvent.click(toggleButton);
    const popover = screen.getByRole('dialog', { hidden: true });
    mockRect(popover, {
      top: 0,
      left: 0,
      right: 360,
      bottom: 240,
      width: 360,
      height: 240
    });
    fireEvent(window, new Event('resize'));

    await waitFor(() => {
      expect(popover.style.top).toMatch(/px$/);
      expect(popover.style.left).toMatch(/px$/);
      expect(popover.style.visibility).toBe('visible');
    });

    expect(popover.dataset.placement).toBe('bottom');
  });

  it('flips to top when there is not enough space below the trigger', async () => {
    setViewport(900, 500);
    render(<InfoPopover text={'Simple content'} />);

    const toggleButton = screen.getByRole('button', { name: 'Metric information' });
    mockRect(toggleButton, {
      top: 460,
      left: 780,
      right: 800,
      bottom: 480,
      width: 20,
      height: 20
    });

    fireEvent.click(toggleButton);
    const popover = screen.getByRole('dialog', { hidden: true });
    mockRect(popover, {
      top: 0,
      left: 0,
      right: 320,
      bottom: 220,
      width: 320,
      height: 220
    });
    fireEvent(window, new Event('resize'));

    await waitFor(() => {
      expect(popover.dataset.placement).toBe('top');
      expect(parseFloat(popover.style.top)).toBeGreaterThanOrEqual(12);
    });
  });

  it('clamps horizontal position to viewport margins', async () => {
    setViewport(420, 620);
    render(<InfoPopover text={'Simple content'} />);

    const toggleButton = screen.getByRole('button', { name: 'Metric information' });
    mockRect(toggleButton, {
      top: 120,
      left: 390,
      right: 410,
      bottom: 140,
      width: 20,
      height: 20
    });

    fireEvent.click(toggleButton);
    const popover = screen.getByRole('dialog', { hidden: true });
    mockRect(popover, {
      top: 0,
      left: 0,
      right: 700,
      bottom: 200,
      width: 700,
      height: 200
    });
    fireEvent(window, new Event('resize'));

    await waitFor(() => {
      expect(parseFloat(popover.style.left)).toBe(12);
      expect(parseFloat(popover.style.top)).toBeGreaterThanOrEqual(12);
      expect(parseFloat(popover.style.top)).toBeLessThanOrEqual(620 - 12 - 200);
    });
  });

  it('shrinks width to fit within the owning card container', async () => {
    setViewport(1200, 800);
    const { container } = render(
      <div className="metric-card">
        <InfoPopover text={'Simple content'} />
      </div>
    );

    const card = container.querySelector('.metric-card');
    mockRect(card, {
      top: 80,
      left: 600,
      right: 860,
      bottom: 540,
      width: 260,
      height: 460
    });

    const toggleButton = screen.getByRole('button', { name: 'Metric information' });
    mockRect(toggleButton, {
      top: 120,
      left: 830,
      right: 850,
      bottom: 140,
      width: 20,
      height: 20
    });

    fireEvent.click(toggleButton);
    const popover = screen.getByRole('dialog', { hidden: true });
    mockRectFromWidthStyle(popover, { height: 180 });
    fireEvent(window, new Event('resize'));

    await waitFor(() => {
      const width = parseFloat(popover.style.width);
      const left = parseFloat(popover.style.left);
      expect(width).toBeLessThanOrEqual(236);
      expect(left).toBeGreaterThanOrEqual(612);
      expect(left + width).toBeLessThanOrEqual(848);
      expect(popover.style.visibility).toBe('visible');
    });
  });
});

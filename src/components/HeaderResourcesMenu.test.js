import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HeaderResourcesMenu from './HeaderResourcesMenu';

const RESOURCE_LINKS = [
  {
    id: 'api',
    label: 'API',
    links: [
      { id: 'api-reference', label: 'API Reference', href: 'https://example.com/api' }
    ]
  },
  {
    id: 'dbt',
    label: 'dbt Models',
    links: [
      { id: 'dbt-docs', label: 'dbt Docs', href: 'https://example.com/dbt' }
    ]
  },
  {
    id: 'dashboards',
    label: 'Other Dashboards',
    links: [
      { id: 'dashboard-hub', label: 'Dashboard Hub', href: 'https://example.com/dashboards' }
    ]
  }
];

describe('HeaderResourcesMenu', () => {
  it('renders the resources menu trigger', () => {
    render(<HeaderResourcesMenu resourceLinks={RESOURCE_LINKS} />);
    expect(screen.getByRole('button', { name: /resources/i })).toBeInTheDocument();
  });

  it('opens and closes the menu when trigger is clicked', () => {
    render(<HeaderResourcesMenu resourceLinks={RESOURCE_LINKS} />);

    const trigger = screen.getByRole('button', { name: /resources/i });
    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes the menu on Escape key', () => {
    render(<HeaderResourcesMenu resourceLinks={RESOURCE_LINKS} />);

    fireEvent.click(screen.getByRole('button', { name: /resources/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes the menu when clicking outside', () => {
    render(<HeaderResourcesMenu resourceLinks={RESOURCE_LINKS} />);

    fireEvent.click(screen.getByRole('button', { name: /resources/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('renders grouped sections in configured order', () => {
    render(<HeaderResourcesMenu resourceLinks={RESOURCE_LINKS} />);
    fireEvent.click(screen.getByRole('button', { name: /resources/i }));

    const groupLabels = screen
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent);

    expect(groupLabels).toEqual(['API', 'dbt Models', 'Other Dashboards']);
  });

  it('renders links with target and rel security attributes', () => {
    render(<HeaderResourcesMenu resourceLinks={RESOURCE_LINKS} />);
    fireEvent.click(screen.getByRole('button', { name: /resources/i }));

    const links = screen.getAllByRole('menuitem');
    expect(links).toHaveLength(3);

    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
      expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
    });
  });

  it('filters invalid config entries and remains stable', () => {
    const mixedResourceLinks = [
      {
        id: 'api',
        label: 'API',
        links: [
          { id: 'ok', label: 'API Reference', href: 'https://example.com/api' },
          { id: 'missing-label', href: 'https://example.com/invalid' },
          { id: 'missing-href', label: 'Broken Link' }
        ]
      },
      {
        id: 'broken-group',
        links: [{ id: 'x', label: 'No Group Label', href: 'https://example.com/x' }]
      }
    ];

    render(<HeaderResourcesMenu resourceLinks={mixedResourceLinks} />);
    fireEvent.click(screen.getByRole('button', { name: /resources/i }));

    expect(screen.getByRole('menuitem', { name: 'API Reference' })).toBeInTheDocument();
    expect(screen.queryByText('Broken Link')).not.toBeInTheDocument();
    expect(screen.queryByText('No Group Label')).not.toBeInTheDocument();
  });

  it('returns null when there are no valid links', () => {
    render(<HeaderResourcesMenu resourceLinks={[]} />);
    expect(screen.queryByRole('button', { name: /resources/i })).not.toBeInTheDocument();
  });

  it('closes the menu when a link is clicked', () => {
    render(<HeaderResourcesMenu resourceLinks={RESOURCE_LINKS} />);
    fireEvent.click(screen.getByRole('button', { name: /resources/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'API Reference' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import { formatTruncateHex } from '../utils/formatters';

const tabulatorInstances = [];
const resizeObservers = [];

const buildCell = (table, rowData, column) => ({
  getValue: () => rowData[column.field],
  getRow: () => ({
    getData: () => rowData
  }),
  getTable: () => table,
  getColumn: () => ({
    getDefinition: () => column
  })
});

const formatCell = (table, rowData, column) => {
  const value = rowData[column.field];

  if (typeof column.formatter === 'function') {
    return column.formatter(buildCell(table, rowData, column));
  }

  if (column.formatter === 'plaintext' || column.formatter === 'textarea' || !column.formatter) {
    return value === null || value === undefined ? '' : String(value);
  }

  return value === null || value === undefined ? '' : String(value);
};

class MockTabulator {
  constructor(element, config) {
    this.element = element;
    this.config = config;
    this.handlers = {};
    this.data = Array.isArray(config.data) ? config.data : [];
    this.redrawCount = 0;
    this.setDataCount = 0;

    tabulatorInstances.push(this);
    this.render();

    Promise.resolve().then(() => {
      if (typeof this.config.tableBuilt === 'function') {
        this.config.tableBuilt.call(this);
      }
      this.emit('tableBuilt');
      if (typeof this.config.renderComplete === 'function') {
        this.config.renderComplete.call(this);
      }
    });
  }

  on(event, handler) {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(handler);
  }

  emit(event) {
    (this.handlers[event] || []).forEach((handler) => handler());
  }

  getDataCount() {
    return this.data.length;
  }

  getPageSize() {
    return this.config.paginationSize || this.data.length || 1;
  }

  getPageMax() {
    if (!this.config.pagination) return 1;
    return Math.max(1, Math.ceil(this.data.length / this.getPageSize()));
  }

  getPage() {
    return 1;
  }

  redraw() {
    this.redrawCount += 1;
    this.render();
    if (typeof this.config.renderComplete === 'function') {
      this.config.renderComplete.call(this);
    }
  }

  setData(nextData) {
    this.setDataCount += 1;
    this.data = Array.isArray(nextData) ? nextData : [];
    this.render();
    return Promise.resolve(this.data);
  }

  destroy() {
    this.destroyed = true;
  }

  render() {
    const visibleColumns = (this.config.columns || []).filter((column) => column.visible !== false);
    const headers = visibleColumns
      .map((column) => `<div class="tabulator-col"><div class="tabulator-col-content">${column.title || ''}</div></div>`)
      .join('');
    const rows = this.data
      .map((rowData) => {
        const cells = visibleColumns
          .map((column) => `<div class="tabulator-cell" data-field="${column.field || ''}">${formatCell(this, rowData, column)}</div>`)
          .join('');
        return `<div class="tabulator-row">${cells}</div>`;
      })
      .join('');
    const footer = this.config.pagination
      ? '<div class="tabulator-footer"><div class="tabulator-footer-contents"></div></div>'
      : '';

    this.element.innerHTML = `
      <div class="tabulator">
        <div class="tabulator-header">${headers}</div>
        <div class="tabulator-tableHolder">
          <div class="tabulator-table">${rows}</div>
        </div>
        ${footer}
      </div>
    `;
  }
}

vi.mock('tabulator-tables', () => ({
  TabulatorFull: MockTabulator
}));

describe('TableWidget regressions', () => {
  let originalResizeObserver;
  let TableWidget;
  let gpayMetric;
  let metadataHistoryMetric;

  beforeEach(async () => {
    cleanup();
    vi.clearAllMocks();
    tabulatorInstances.length = 0;
    resizeObservers.length = 0;

    originalResizeObserver = global.ResizeObserver;
    global.ResizeObserver = class MockResizeObserver {
      constructor(callback) {
        this.callback = callback;
        resizeObservers.push(this);
      }

      observe(target) {
        this.target = target;
      }

      disconnect() {}
    };

    TableWidget = (await import('./TableWidget')).default;
    gpayMetric = (await import('../queries/api_execution_gpay_user_activity')).default;
    metadataHistoryMetric = (await import('../queries/api_execution_circles_v2_avatar_metadata_history')).default;
  });

  afterEach(() => {
    cleanup();
    global.ResizeObserver = originalResizeObserver;
  });

  it('renders paginated transaction history rows and redraws after container resize', async () => {
    render(
      <TableWidget
        data={[{
          wallet_address: '0xwallet',
          timestamp: '2026-04-01T12:34:56.000Z',
          action: 'Payment',
          symbol: 'GNO',
          amount: 12.3456,
          amount_usd: 33.21,
          transaction_hash: '0xabc123'
        }]}
        config={gpayMetric.tableConfig}
        isDarkMode={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Payment')).toBeInTheDocument();
      expect(screen.getByText('GNO')).toBeInTheDocument();
    });

    const instance = tabulatorInstances.at(-1);
    expect(instance.config.responsiveLayout).toBe(false);
    expect(instance.config.rowHeight).toBe(40);

    const redrawCountBeforeResize = instance.redrawCount;
    resizeObservers[0].callback([{ contentRect: { width: 980, height: 420 } }]);

    await waitFor(() => {
      expect(instance.redrawCount).toBeGreaterThan(redrawCountBeforeResize);
    });
  });

  it('renders non-paginated metadata history rows with stable layout', async () => {
    render(
      <TableWidget
        data={[{
          avatar: '0xavatar',
          metadata_digest: 'digest-1',
          ipfs_cid_v0: 'QmYwAPJzv5CZsnAzt8auVTL1L8fExample',
          metadata_name: 'Alice',
          metadata_description: 'Profile update',
          metadata_image_url: '',
          metadata_preview_image_url: '',
          valid_from: '2026-03-01T00:00:00.000Z',
          valid_to: null,
          is_current: 1,
          transaction_hash: 'abc123',
          log_index: 1
        }]}
        config={metadataHistoryMetric.tableConfig}
        isDarkMode={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Profile update')).toBeInTheDocument();
    });

    const instance = tabulatorInstances.at(-1);
    expect(instance.config.pagination).toBe(false);
    expect(instance.config.responsiveLayout).toBe(false);
    expect(instance.config.rowHeight).toBe(56);
  });

  it('copies hex formatter values through delegated table clicks', async () => {
    const originalClipboard = navigator.clipboard;
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText }
    });

    const value = '0xabc"\'&<>\\def123456789';
    const displayValue = `${value.slice(0, 6)}…${value.slice(-4)}`;

    try {
      render(
        <TableWidget
          data={[{ address: value }]}
          config={{
            columns: [
              {
                field: 'address',
                title: 'Address',
                formatter: (cell) => formatTruncateHex(cell.getValue())
              }
            ]
          }}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(displayValue)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(displayValue));

      expect(writeText).toHaveBeenCalledWith(value);
    } finally {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: originalClipboard
      });
    }
  });
});

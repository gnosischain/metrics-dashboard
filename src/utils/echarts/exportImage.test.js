import {
  createChartExportFileName,
  downloadEChartInstanceAsPng,
  resolveExportBackgroundColor
} from './exportImage';

describe('exportImage utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-21T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('creates a sanitized deterministic filename', () => {
    expect(createChartExportFileName('P2P Geographic Network Topology')).toBe('p2p-geographic-network-topology-2026-02-21.png');
  });

  it('resolves background color from CSS variable when available', () => {
    const node = document.createElement('div');
    node.style.setProperty('--color-surface', '#123456');
    document.body.appendChild(node);

    expect(resolveExportBackgroundColor(node, false)).toBe('#123456');
  });

  it('exports PNG and triggers browser download', () => {
    const chartInstance = {
      getDataURL: vi.fn(() => 'data:image/png;base64,abc')
    };

    const anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    const removeSpy = vi.spyOn(document.body, 'removeChild');

    const container = document.createElement('div');
    container.style.setProperty('--color-surface', '#0f172a');
    document.body.appendChild(container);

    const didExport = downloadEChartInstanceAsPng(chartInstance, {
      title: 'Network Overview',
      isDarkMode: true,
      anchorElement: container
    });

    expect(didExport).toBe(true);
    expect(chartInstance.getDataURL).toHaveBeenCalledWith({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#0f172a'
    });
    expect(anchorClickSpy).toHaveBeenCalledTimes(1);

    const downloadLink = appendSpy.mock.calls.find(([node]) => node.tagName === 'A')?.[0];
    expect(downloadLink).toBeDefined();
    expect(downloadLink.download).toBe('network-overview-2026-02-21.png');
    expect(removeSpy).toHaveBeenCalledWith(downloadLink);
  });

  it('returns false when chart instance is unavailable', () => {
    expect(downloadEChartInstanceAsPng(null)).toBe(false);
  });
});

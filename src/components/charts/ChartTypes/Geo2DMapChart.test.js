import { Geo2DMapChart } from './Geo2DMapChart';

const BASE_CONFIG = {
  peerLatField: 'peer_lat',
  peerLonField: 'peer_lon',
  neighborLatField: 'neighbor_lat',
  neighborLonField: 'neighbor_lon',
  valueField: 'cnt',
  labelField: 'protocol',
  categoryField: 'peer_client',
  enableAnimation: false
};

const SAMPLE_DATA = [
  {
    peer_lat: 10.1,
    peer_lon: 20.2,
    neighbor_lat: 11.3,
    neighbor_lon: 21.4,
    cnt: 3,
    protocol: 'DiscV5',
    peer_client: 'zeta'
  },
  {
    peer_lat: 12.1,
    peer_lon: 22.2,
    neighbor_lat: 13.3,
    neighbor_lon: 23.4,
    cnt: 5,
    protocol: 'DiscV5',
    peer_client: 'alpha'
  },
  {
    peer_lat: 14.1,
    peer_lon: 24.2,
    neighbor_lat: 15.3,
    neighbor_lon: 25.4,
    cnt: 1,
    protocol: 'DiscV5',
    peer_client: null
  }
];

describe('Geo2DMapChart topology visual overrides', () => {
  it('uses config.colors with deterministic category ordering', () => {
    const options = Geo2DMapChart.getOptions(
      SAMPLE_DATA,
      {
        ...BASE_CONFIG,
        colors: ['#111111', '#222222']
      },
      false
    );

    const legendNames = options.legend.data.map(item => item.name);
    expect(legendNames).toEqual(['alpha', 'zeta', 'Unknown']);

    const alphaSeries = options.series.find(series => series.type === 'scatter' && series.name === 'alpha');
    const zetaSeries = options.series.find(series => series.type === 'scatter' && series.name === 'zeta');

    expect(alphaSeries.itemStyle.color).toBe('#111111');
    expect(zetaSeries.itemStyle.color).toBe('#222222');
  });

  it('uses dashboard palette colors when metric colors are not provided', () => {
    const options = Geo2DMapChart.getOptions(
      SAMPLE_DATA,
      {
        ...BASE_CONFIG,
        dashboardPalette: {
          seriesLight: ['#101010', '#202020', '#303030'],
          seriesDark: ['#f1f1f1', '#f2f2f2', '#f3f3f3']
        }
      },
      false
    );

    const alphaSeries = options.series.find(series => series.type === 'scatter' && series.name === 'alpha');
    const zetaSeries = options.series.find(series => series.type === 'scatter' && series.name === 'zeta');
    expect(alphaSeries.itemStyle.color).toBe('#101010');
    expect(zetaSeries.itemStyle.color).toBe('#202020');
  });

  it('applies dark map color overrides', () => {
    const options = Geo2DMapChart.getOptions(
      SAMPLE_DATA,
      {
        ...BASE_CONFIG,
        mapBackgroundColorDark: '#0B1220',
        mapAreaColorDark: '#1F2A3D',
        mapBorderColorDark: '#5B6B84',
        mapEmphasisColorDark: '#2B3D59'
      },
      true
    );

    expect(options.backgroundColor).toBe('#0B1220');
    expect(options.geo.itemStyle.normal.areaColor).toBe('#1F2A3D');
    expect(options.geo.itemStyle.normal.borderColor).toBe('#5B6B84');
    expect(options.geo.itemStyle.emphasis.areaColor).toBe('#2B3D59');
  });

  it('applies compact legend settings', () => {
    const options = Geo2DMapChart.getOptions(
      SAMPLE_DATA,
      {
        ...BASE_CONFIG,
        legendType: 'scroll',
        legendOrient: 'vertical',
        legendLeft: 12,
        legendTop: 12,
        legendWidth: 132,
        legendHeight: '58%',
        legendItemWidth: 9,
        legendItemHeight: 9,
        legendItemGap: 8,
        legendFontSize: 11,
        legendPadding: [8, 8, 8, 8],
        legendBackgroundColor: 'transparent',
        legendBorderColor: 'transparent',
        legendBorderWidth: 0
      },
      false
    );

    expect(options.legend.type).toBe('scroll');
    expect(options.legend.left).toBe(12);
    expect(options.legend.top).toBe(12);
    expect(options.legend.width).toBe(132);
    expect(options.legend.height).toBe('58%');
    expect(options.legend.itemWidth).toBe(9);
    expect(options.legend.itemHeight).toBe(9);
    expect(options.legend.itemGap).toBe(8);
    expect(options.legend.textStyle.fontSize).toBe(11);
    expect(options.legend.padding).toEqual([8, 8, 8, 8]);
    expect(options.legend.backgroundColor).toBe('transparent');
    expect(options.legend.borderColor).toBe('transparent');
    expect(options.legend.borderWidth).toBe(0);
  });

  it('applies map layout center and size overrides', () => {
    const options = Geo2DMapChart.getOptions(
      SAMPLE_DATA,
      {
        ...BASE_CONFIG,
        mapLayoutCenter: ['56%', '52%'],
        mapLayoutSize: '114%'
      },
      false
    );

    expect(options.geo.layoutCenter).toEqual(['56%', '52%']);
    expect(options.geo.layoutSize).toBe('114%');
  });

  it('supports disabling map roam (zoom/pan)', () => {
    const options = Geo2DMapChart.getOptions(
      SAMPLE_DATA,
      {
        ...BASE_CONFIG,
        mapRoam: false
      },
      false
    );

    expect(options.geo.roam).toBe(false);
  });

  it('uses neutral Unknown fallback color when custom palette does not define it', () => {
    const options = Geo2DMapChart.getOptions(
      SAMPLE_DATA,
      {
        ...BASE_CONFIG,
        colors: ['#111111', '#222222']
      },
      false
    );

    const unknownSeries = options.series.find(series => series.type === 'scatter' && series.name === 'Unknown');
    expect(unknownSeries.itemStyle.color).toBe('#94A3B8');
  });

  it('keeps explicit config.colors priority over dashboard palette', () => {
    const options = Geo2DMapChart.getOptions(
      SAMPLE_DATA,
      {
        ...BASE_CONFIG,
        colors: ['#abcdef', '#123456'],
        dashboardPalette: {
          seriesLight: ['#101010', '#202020'],
          seriesDark: ['#f1f1f1', '#f2f2f2']
        }
      },
      false
    );

    const alphaSeries = options.series.find(series => series.type === 'scatter' && series.name === 'alpha');
    const zetaSeries = options.series.find(series => series.type === 'scatter' && series.name === 'zeta');
    expect(alphaSeries.itemStyle.color).toBe('#abcdef');
    expect(zetaSeries.itemStyle.color).toBe('#123456');
  });

  it('keeps default legend placement when container width is above responsive breakpoint', () => {
    const options = Geo2DMapChart.getOptions(
      SAMPLE_DATA,
      {
        ...BASE_CONFIG,
        containerWidth: 1320,
        legendType: 'scroll',
        legendOrient: 'vertical',
        legendLeft: 12,
        legendTop: 12,
        legendWidth: 132,
        mapLayoutCenter: ['50%', '52%'],
        mapLayoutSize: '114%',
        responsiveNarrow: {
          breakpoint: 1180,
          legend: {
            orient: 'horizontal',
            left: 'center',
            top: 'bottom',
            width: '88%'
          },
          geo: {
            layoutCenter: ['50%', '46%'],
            layoutSize: '102%'
          }
        }
      },
      false
    );

    expect(options.legend.orient).toBe('vertical');
    expect(options.legend.left).toBe(12);
    expect(options.legend.top).toBe(12);
    expect(options.legend.width).toBe(132);
    expect(options.geo.layoutCenter).toEqual(['50%', '52%']);
    expect(options.geo.layoutSize).toBe('114%');
  });

  it('applies responsive narrow legend overrides when container width is below breakpoint', () => {
    const options = Geo2DMapChart.getOptions(
      SAMPLE_DATA,
      {
        ...BASE_CONFIG,
        containerWidth: 1024,
        legendType: 'scroll',
        legendOrient: 'vertical',
        legendLeft: 12,
        legendTop: 12,
        responsiveNarrow: {
          breakpoint: 1180,
          legend: {
            type: 'scroll',
            orient: 'horizontal',
            left: 'center',
            top: 'bottom',
            width: '88%',
            height: 42,
            itemGap: 10,
            padding: [6, 10, 6, 10]
          }
        }
      },
      false
    );

    expect(options.legend.type).toBe('scroll');
    expect(options.legend.orient).toBe('horizontal');
    expect(options.legend.left).toBe('center');
    expect(options.legend.top).toBe('bottom');
    expect(options.legend.width).toBe('88%');
    expect(options.legend.height).toBe(42);
    expect(options.legend.itemGap).toBe(10);
    expect(options.legend.padding).toEqual([6, 10, 6, 10]);
  });

  it('applies responsive narrow geo layout overrides when container width is below breakpoint', () => {
    const options = Geo2DMapChart.getOptions(
      SAMPLE_DATA,
      {
        ...BASE_CONFIG,
        containerWidth: 960,
        mapLayoutCenter: ['50%', '52%'],
        mapLayoutSize: '114%',
        responsiveNarrow: {
          breakpoint: 1180,
          geo: {
            layoutCenter: ['50%', '46%'],
            layoutSize: '102%'
          }
        }
      },
      false
    );

    expect(options.geo.layoutCenter).toEqual(['50%', '46%']);
    expect(options.geo.layoutSize).toBe('102%');
  });

  it('keeps behavior unchanged when responsiveNarrow is not configured', () => {
    const options = Geo2DMapChart.getOptions(
      SAMPLE_DATA,
      {
        ...BASE_CONFIG,
        containerWidth: 900,
        legendOrient: 'vertical',
        legendLeft: 12,
        legendTop: 12,
        mapLayoutCenter: ['50%', '52%'],
        mapLayoutSize: '114%'
      },
      false
    );

    expect(options.legend.orient).toBe('vertical');
    expect(options.legend.left).toBe(12);
    expect(options.legend.top).toBe(12);
    expect(options.geo.layoutCenter).toEqual(['50%', '52%']);
    expect(options.geo.layoutSize).toBe('114%');
  });

  it('can use viewport width for responsive decision to avoid container resize flicker', () => {
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1366
    });
    try {
      const options = Geo2DMapChart.getOptions(
        SAMPLE_DATA,
        {
          ...BASE_CONFIG,
          containerWidth: 960,
          legendOrient: 'vertical',
          legendLeft: 12,
          legendTop: 12,
          responsiveNarrow: {
            breakpoint: 1180,
            useWindowWidth: true,
            legend: {
              orient: 'horizontal',
              left: 'center',
              top: 'bottom'
            }
          }
        },
        false
      );

      expect(options.legend.orient).toBe('vertical');
      expect(options.legend.left).toBe(12);
      expect(options.legend.top).toBe(12);
    } finally {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        writable: true,
        value: originalInnerWidth
      });
    }
  });
});

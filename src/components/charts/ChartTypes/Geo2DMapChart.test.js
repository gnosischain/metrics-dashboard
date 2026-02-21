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
});

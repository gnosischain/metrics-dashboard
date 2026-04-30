const metric = {
  id: 'api_execution_circles_v2_avatar_balances_daily',
  name: 'Balance History by Token',
  description: 'Daily CRC balance held per token',
  metricDescription: 'Daily CRC balance for the selected avatar, broken down by Circles token. Toggle between static and demurrage-adjusted values.',
  chartType: 'area',
  globalFilterField: 'avatar',
  isTimeSeries: true,
  enableZoom: true,
  stacked: true,
  showTotal: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'balance',
  seriesField: 'token_label',
  legend: { top: 'top', type: 'scroll' },
  tooltipOrder: 'valueDesc',

  unitFields: {
    static:     { field: 'balance',            format: 'formatNumber', label: 'Static' },
    demurraged: { field: 'balance_demurraged', format: 'formatNumber', label: 'Demurraged' },
  },

  query: `
    WITH filtered AS (
      SELECT avatar, date, token_address, balance, balance_demurraged
      FROM dbt.api_execution_circles_v2_avatar_balances_daily
      WHERE 1 = 1
        /*__FILTER_CONDITIONS__*/
    )
    SELECT
      filtered.avatar,
      filtered.date,
      filtered.token_address,
      coalesce(nullIf(metadata.metadata_symbol, ''), nullIf(metadata.metadata_name, ''), if(
        lower(coalesce(filtered.token_address, '')) = lower(coalesce(filtered.avatar, '')),
        'Own CRC',
        concat('CRC ', substring(coalesce(filtered.token_address, ''), 3, 6))
      )) AS token_symbol,
      concat(
        coalesce(nullIf(metadata.metadata_symbol, ''), nullIf(metadata.metadata_name, ''), if(
          lower(coalesce(filtered.token_address, '')) = lower(coalesce(filtered.avatar, '')),
          'Own CRC',
          concat('CRC ', substring(coalesce(filtered.token_address, ''), 3, 6))
        )),
        ' - ',
        substring(coalesce(filtered.token_address, ''), 3, 6)
      ) AS token_label,
      filtered.balance,
      filtered.balance_demurraged
    FROM filtered
    LEFT JOIN (
      SELECT avatar, metadata_symbol, metadata_name
      FROM dbt.api_execution_circles_v2_avatar_metadata
    ) AS metadata
      ON lower(coalesce(metadata.avatar, '')) = lower(coalesce(filtered.token_address, ''))
  `,
};

export default metric;

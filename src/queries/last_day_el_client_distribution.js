const metric = {
  id: 'last_day_el_client_distribution',
  name: 'EL Client Distribution',
  description: 'Last day % distribution',
  format: 'formatNumber',
  chartType: 'pie',

  nameField: 'category',
  valueField: 'value',

  query: `
    SELECT 
      client AS category
      ,pct * 100 AS value 
    FROM 
        dbt.execution_blocks_clients_pct_daily
    WHERE 
        date = (SELECT MAX(date) FROM dbt.execution_blocks_clients_pct_daily)
  `,
};

export default metric;
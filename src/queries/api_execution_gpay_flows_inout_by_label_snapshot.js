const metric = {
  id: 'api_execution_gpay_flows_inout_by_label_snapshot',
  name: 'Inflow/Outflow',
  description: 'From pay wallets',
  metricDescription: 'Signed inflow/outflow by counterparty label for the selected window and symbol. Inflow is positive and outflow is negative.',
  chartType: 'bar',
  horizontal: true,
  xField: 'label',
  yField: 'amount_usd',
  valueField: 'amount_usd',
  seriesField: 'flow',
  format: 'formatCurrency',
  enableFiltering: true,
  labelField: 'window',
  localFilterFields: ['window', 'symbol'],
  categorySort: 'absNetDesc',
  query: `
    SELECT
      window,
      symbol,
      if(from_label = 'gpay', to_label, from_label) AS label,
      if(from_label = 'gpay', 'Outflow', 'Inflow') AS flow,
      if(from_label = 'gpay', -amount_usd, amount_usd) AS amount_usd
    FROM dbt.api_execution_gpay_flows_snapshot
    WHERE (from_label != 'gpay' OR to_label != 'gpay') AND abs(amount_usd) > 0.01
  `
};

export default metric;

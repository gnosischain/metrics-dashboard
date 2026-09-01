const metric = {
  id: 'api_hopr_node_locations',
  name: 'Node Locations',
  description: 'Latest, dufour + jura',
  metricDescription: 'Latest node locations for dufour and jura (rotsee excluded as testnet). Geo coverage is partial — only resolved nodes appear (dufour ~13%); the by-country chart states the UNKNOWN residual.',
  chartType: 'table',
  minimal: true,
  tableConfig: {
    layout: 'fitColumns',
    pagination: true,
    responsiveLayout: 'collapse',
    height: 400,
    selectableRows: false,
    paginationSizeSelector: [10, 25, 50],
    columns: [
      { title: 'Network', field: 'network', width: 100, sorter: 'string' },
      { title: 'Country', field: 'country_code', width: 100, sorter: 'string' },
      { title: 'City', field: 'city', minWidth: 160, sorter: 'string', formatter: 'plaintext' },
      { title: 'Nodes', field: 'nodes', width: 90, sorter: 'number', hozAlign: 'right' },
      { title: 'Live', field: 'live_nodes', width: 80, sorter: 'number', hozAlign: 'right' },
      { title: 'VPN Exits', field: 'gnosisvpn_exit_nodes', width: 100, sorter: 'number', hozAlign: 'right' },
      { title: 'Operators', field: 'distinct_operators', width: 100, sorter: 'number', hozAlign: 'right' },
      { title: 'Top Hosting', field: 'top_hosting_provider', minWidth: 160, sorter: 'string', formatter: 'plaintext' },
    ],
  },
  query: `
    SELECT network, country_code, city, nodes, live_nodes, gnosisvpn_exit_nodes, distinct_operators, top_hosting_provider
    FROM dbt.api_hopr_node_locations_latest
    WHERE network IN ('dufour', 'jura')
    ORDER BY nodes DESC
  `,
};
export default metric;

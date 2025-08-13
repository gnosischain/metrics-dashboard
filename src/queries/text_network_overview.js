const metric = {
  id: 'text_network_overview',
  name: 'Crawl Details',
  description: 'All crawl data is filtered for Gnosis Network',
  chartType: 'text',
  content: `

#### Legend

- **Node** - a peer (identified by its node ID / ENR).
- **Link** - “seen-as-neighbors” during a crawl
- **Thickness** - persistence/frequency across crawls: thicker means those two IDs are often adjacent in the routing tables.

#### Reading the links correctly

- **Geo-IP is fuzzy** (NAT, VPNs, clouds; city-level can be off). Don’t over-interpret exact cities or countries.
- **Crawler bias**: seed lists, query schedule, and crawler location influence which buckets one hit most.
  `
};

export default metric;
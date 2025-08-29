const metric = {
  id: 'text_gnosis_chain_history',
  name: 'Gnosis Chain — Fork Types & Consensus Fork Details',
  description: 'Definitions, Naming Conventions, and Fork Version History',
  chartType: 'text',
  content: `
**Forks** are backward‑incompatible changes to the network rules. Clients and validators must update; otherwise they keep following the old rules. Forks are how upgrades are deployed on a decentralized network. 
An **upgrade** is the bundle of changes (EIPs) included at a fork. After The Merge, execution‑layer and consensus‑layer changes generally ship together.

Gnosis tracks Ethereum's naming: 
  - **execution‑layer** cities (Berlin, London, Shanghai, Cancun, Prague, …) 
  - **consensus‑layer** stars (Altair, Bellatrix, Capella, Deneb, Electra, …)
  - **Combined nicknames** used for simultaneous releases


| Fork Name | Fork Version | Fork Digest | Fork Epoch |
|-----------|--------------|-------------|------------|
| Phase0 | \`0x00000064\` | \`0xbc9a6864\` | 0 |
| Altair | \`0x01000064\` | \`0x56fdb5e0\` | 512 |
| Bellatrix | \`0x02000064\` | \`0x824be431\` | 385536 |
| Capella | \`0x03000064\` | \`0x21a6f836\` | 648704 |
| Deneb | \`0x04000064\` | \`0x3ebfd484\` | 889856 |
| Electra | \`0x05000064\` | \`0x7d5aab40\` | 1337856 |
| Fulu | \`0x06000064\` | \`0xf9ab5f85\` | TBA |`
};

export default metric;
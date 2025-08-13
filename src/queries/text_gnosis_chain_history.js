const metric = {
  id: 'text_gnosis_chain_history',
  name: '',
  description: '',
  chartType: 'text',
  content: `
## What are forks?

**Forks** are backward‑incompatible changes to the network rules. Clients and validators must update; otherwise they keep following the old rules. Forks are how upgrades are deployed on a decentralized network. 
An **upgrade** is the bundle of changes (EIPs) included at a fork. After The Merge, execution‑layer and consensus‑layer changes generally ship together.

## Naming

Gnosis tracks Ethereum's naming: 
  - **execution‑layer** cities (Berlin, London, Shanghai, Cancun, Prague, …) 
  - **consensus‑layer** stars (Altair, Bellatrix, Capella, Deneb, Electra, …)
  - **Combined nicknames** used for simultaneous releases
  `
};

export default metric;
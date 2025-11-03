// metrics-dashboard/src/queries/text_onchain_projects_sectors_overview.js
const metric = {
  id: 'text_onchain_projects_sectors_overview',
  name: 'Projects & Sectors — Overview',
  description: 'How we define projects and sectors across On-chain Activity',
  chartType: 'text',
  content: `
### What is a **Project**?
A **project** is derived from the **destination contract** (\`to_address\`) of a transaction because it identifies the protocol actually being used and receiving the call (and fees).  
The destination tells us **where users interacted**—i.e., which protocol or contract **received** the call. This is the cleanest way to attribute **activity and fees** to the product being used.

### What can be a **Project**?
Projects are canonical groupings of on-chain addresses that represent a product or protocol, for example:
- **Protocol contracts** (routers, vaults, managers, pools, factories, proxies)
- **ERC-20 token contracts** (e.g., xDAI, sDAI, USDC)
- **System contracts / infra endpoints** (e.g., ERC-4337 EntryPoint)
- **Known app-specific contracts** (e.g., Safe, Uniswap, Aave)
> Note: When users interact via meta-protocols (e.g., 4337 EntryPoint), attribution is to the destination of the outer call unless deeper trace-based attribution is used.

### What is a **Sector**?
Sectors are rule-based buckets that group projects with similar functionality (DEX, Lending & Yield, Bridges, etc.).  
They come from regex/matcher rules in dbt that map cleaned project names to a sector.

### What is an **Active Account**?
**Active accounts** are the distinct **senders** (\`from_address\`) that made **successful** transactions in a period.  
We count unique senders to show **how many wallets actually used the network/project**, not how many calls a single wallet made.

---

### Sector Glossary (with Project examples)

| Sector | Project examples (non-exhaustive) |
|-------|------------------------------------|
| **DEX** | Uniswap, Sushi, Balancer, Curve, Swapr, 1inch, ParaSwap, CowSwap |
| **Lending & Yield** | Aave (v2/v3), Spark, Agave, Beefy, Jarvis, Gyroscope, StakeWise, Aura |
| **Bridges** | AMB (xDai/Eth), Hop, Across, Connext, Celer, Stargate, Li.Fi, Symbiosis, Socket |
| **Messaging / Interop** | LayerZero, Hyperlane, Polyhedra/zkBridge, Telepathy, Everclear |
| **Wallets & AA** | Safe, Ambire, ERC-4337 EntryPoint, Biconomy, Rhinestone |
| **Payments & Stablecoins** | Monerium (USDe/ISKE), Gnosis Pay, Request Network, USDC/sDAI/xDAI, Sablier |
| **Oracles & Data** | Chainlink, Tellor, Pyth, OriginTrail, analytics/indexing helpers |
| **NFTs & Marketplaces** | OpenSea, Seaport, POAP, Unlock Protocol, ERC-721/1155 contracts |
| **Gaming** | Dark Forest, Conquest.eth, other game contracts |
| **DAOs & Governance** | DAOhaus, Kleros, Snapshot, Reality.eth, Vocdoni, Omen |
| **Privacy** | Tornado Cash (Nova), Umbra, mixers |
| **AI & Agents** | Autonolas, Gnosis AI, autonomous/agent frameworks |
| **RWA & Tokenization** | REALTOKEN/RealT, Backed, RMM |
| **Infrastructure & DevTools** | Gelato, GSN, Obol, Ankr, Shutter, factories/routers/vaults/proxies |
| **ERC20 Tokens** | Generic ERC-20 token contracts (labeled ERC20) |
| **EOAs** | Externally-Owned Accounts (no contract code) |
| **Unknown** | Unclassified or ambiguous labels |

**Notes**
- Sector mapping is heuristic and improves as labels evolve.
- Some projects can appear in multiple contexts; we assign them to the most representative sector for on-chain activity on Gnosis.
`
};

export default metric;
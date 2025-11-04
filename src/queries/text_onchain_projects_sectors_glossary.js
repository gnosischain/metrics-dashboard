const metric = {
  id: 'text_onchain_projects_sectors_glossary',
  name: 'Sector Glossary',
  description: 'Representative project examples by sector',
  chartType: 'text',
  content: `

| Sector | Project examples (non-exhaustive) |
|-------|------------------------------------|
| **DEX** | Uniswap, Sushi, Balancer, Curve, Swapr, 1inch, ParaSwap, CowSwap |
| **Lending & Yield** | Aave (v2/v3), Spark, Agave, Beefy, Jarvis, Gyroscope, StakeWise, Aura |
| **Bridges** | AMB (xDai/Eth), Hop, Across, Connext, Celer, Stargate, Li.Fi, Symbiosis, Socket |
| **Messaging / Interop** | LayerZero, Hyperlane, Polyhedra/zkBridge, Telepathy, Everclear |
| **Wallets & AA** | Safe, Ambire, ERC-4337 EntryPoint, Biconomy, Rhinestone |
| **Stablecoins & Fiat Ramps** | Monerium (USDe/ISKE/blacklist), USDC, sDAI, xDAI, Angle/agEUR, Transmuter |
| **Payments** | Gnosis Pay (GPay), Request Network (Smart Invoice), Superfluid, Sablier |
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
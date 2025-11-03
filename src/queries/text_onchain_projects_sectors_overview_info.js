const metric = {
  id: 'text_onchain_projects_sectors_overview_info',
  name: 'Projects & Sectors — Overview',
  description: 'Definitions used in Cerebro metrics',
  chartType: 'text',
  content: `
### Project
Defined by the **destination contract** (\`to_address\`).  
We attribute activity/fees to the contract **receiving** the call (the product actually used).

**Examples:** protocol contracts (routers, vaults, pools, factories, proxies), token contracts (xDAI, sDAI, USDC), system/infra (e.g., 4337 EntryPoint), app-specific (Safe, Uniswap, Aave).  
> If calls go via meta-protocols (e.g., 4337), attribution stays with the outer call’s destination unless trace-based attribution is applied.

### Sector
Rule-based bucket that groups projects by function (DEX, Lending/Yield, Bridges, etc.).  
Derived via regex/matcher rules in dbt on cleaned project names.

### Active Account
Distinct **senders** (\`from_address\`) with **successful** transactions in a period.  
Counts unique wallets using a project/network, not number of calls.
`
};

export default metric;
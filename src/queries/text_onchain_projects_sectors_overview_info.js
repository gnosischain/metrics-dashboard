const metric = {
  id: 'text_onchain_projects_sectors_overview_info',
  name: 'Terms & Definitions',
  description: 'Definitions used in metrics',
  chartType: 'text',
  content: `

### Project & Sector

  - **Project** - Defined by the **destination contract** (\`to_address\`). We attribute activity/fees to the contract **receiving** the call.
    - *Examples:* protocol contracts (routers, vaults, pools, factories, proxies), token contracts (xDAI, sDAI, USDC), system/infra (e.g., 4337 EntryPoint), etc.
  - **Sector** - Rule-based bucket that groups projects by function (DEX, Lending/Yield, Bridges, etc.).  

### Active Account

> Distinct **senders** (\`from_address\`) with **successful** transactions within a time period.  
Counts unique wallets using a project/network, not number of calls.
`
};

export default metric;
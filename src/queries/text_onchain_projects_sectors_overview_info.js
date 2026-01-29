const metric = {
  id: 'text_onchain_projects_sectors_overview_info',
  name: 'Terms & Definitions',
  description: 'Definitions used in metrics',
  chartType: 'text',
  content: `
  
### Project & Sector

  - **Project** - Defined by the **destination contract** (\`to_address\`). We attribute activity/fees to the contract **receiving** the call.
    - *Examples:* protocol contracts (pools, factories, proxies), token contracts, system/infra (e.g., 4337 EntryPoint), etc.
  - **Sector** - Rule-based bucket that groups projects by function (DEX, Lending/Yield, Bridges, etc.).  

### Initiator Account

> **Distinct senders** (\`from_address\`) with **successful** transactions in the period (EOAs and contracts). In setups like Safe or Gnosis Pay, many end-users can share one contract, so this metric captures **active initiator addresses**, not unique end-users.
`
};

export default metric;
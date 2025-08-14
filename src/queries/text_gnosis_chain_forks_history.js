const metric = {
  id: 'text_gnosis_chain_forks_history',
  name: 'Gnosis Chain — History & Upgrades',
  description: 'A timeline of major milestones, forks, and protocol upgrades on Gnosis Chain',
  chartType: 'text',
  content: `
| Date | Fork Name | Type | Block/Epoch | Description | Key EIPs |
|------|-----------|------|-------------|-------------|----------|
| **2025/04/30** | **Prague/Electra (Pectra)** | *Combined* | Epoch 1,337,856 | Smart-account powers for EOAs, higher validator balance, execution-layer exits | EIP-7702, EIP-7251, EIP-7002 |
| **2024/03/11** | **Cancun/Deneb (Dencun)** | *Combined* | Epoch 889,856 | Blob transactions for cheaper L2 data. Gnosis tuned parameters (1 gwei min blob price) | EIP-4844, EIP-7514, EIP-1153, EIP-4788 |
| **2023/08/01** | **Shanghai/Capella (Shapella)** | *Combined* | Epoch 648,704 | Enables validator withdrawals. Rewards/principal paid in GNO | EIP-3651, EIP-3855, EIP-3860, EIP-6049 |
| **2022/12/08** | **The Merge** | *Protocol* | Beacon block 6,306,357 | Execution layer fused with Beacon Chain, transition to PoS | — |
| **2022/04/20** | **GIP-31 Hard Fork** | *Execution* | Block 21,735,000 | Hardened old permittable bridged tokens against re-entrancy | — |
| **2021/12/08** | **Beacon Chain Genesis** | *Consensus* | Epoch 0 | PoS consensus layer launch (later merged with execution) | — |
| **2021/11/12** | **London** | *Execution* | Block 19,040,000 | Basefee + burn (EIP-1559), block size to 34M | EIP-1559, EIP-3198, EIP-3529, EIP-3541 |
| **2021/05/17** | **Berlin** | *Execution* | Block 16,101,500 | Gas-cost optimizations, typed-transaction groundwork | EIP-2565, EIP-2929, EIP-2718, EIP-2930 |
| **2020/04/01** | **POSDAO Activation** | *Protocol* | Block 9,186,425 | Activated POSDAO contracts and validator-set logic on xDai | — |
| **2019/12/12** | **Istanbul** | *Execution* | Block 7,298,030 | DoS resilience improvements, L2 proof systems | EIP-1344, EIP-1884, EIP-2028 |
| **2019/03/06** | **EIP-1283 Disable** | *Execution* | Block 2,508,800 | Disabled EIP-1283 SSTORE gas metering (security fix) | EIP-1283 |
| **2019/01/11** | **Constantinople** | *Execution* | Block 1,604,400 | Activated Constantinople EIPs on xDai | EIP-145, EIP-1014, EIP-1052, EIP-1283 |
`
};

export default metric;
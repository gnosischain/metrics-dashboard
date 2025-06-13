const metric = {
  id: 'clients_intro',
  name: 'Why Client Diversity Matters',
  description: '',
  chartType: 'text',
  content: `

Client diversity isn’t just a best practice — it’s critical for network resilience. If any single client is used by more than 66% of validators, a bug in that client could cause a chain fork that finalizes independently. Validators on that fork would be unable to return without facing full slashing penalties — losing their entire GNO.

Even with >33% market share, a faulty client can prevent the entire chain from finalizing, putting the network at risk. That’s why keeping all clients below 33% usage is essential.

This applies to both consensus and execution clients. No client is immune.
  `
};

export default metric;
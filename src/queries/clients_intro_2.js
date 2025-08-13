const metric = {
  id: 'clients_intro_2',
  name: 'Why Client Diversity Matters',
  description: '',
  chartType: 'text',
  content: `

### The 33% Threshold: Network Stability

Even with **>33% market share**, a faulty client can:

- Prevent the entire chain from finalizing
- Put the network at risk of stalling
- Impact all validators, not just those using the faulty client

### Best Practices

- **Keep all clients below 33% usage** — This is essential for network health
- **Monitor client distribution regularly** — Stay informed about network diversity
- **Consider switching** if your client approaches these thresholds

---

> **Remember:** This applies to both **consensus** and **execution** clients. No client is immune to bugs.

  `
};

export default metric;
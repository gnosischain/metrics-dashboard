const metric = {
  id: 'clients_intro_1',
  name: 'Why Client Diversity Matters',
  description: '',
  chartType: 'text',
  content: `

Client diversity isn't just a **best practice** — it's **critical for network resilience**.

### The 66% Threshold: Critical Risk

If any single client is used by **more than 66%** of validators, a bug in that client could cause:

- **Chain fork** that finalizes independently
- **Full slashing penalties** for validators on that fork
- **Complete loss** of their entire GNO stake

> **Key Point:** Validators on a faulty fork would be unable to return without facing catastrophic losses.

  `
};

export default metric;
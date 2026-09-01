const metric = {
  id: 'text_hopr_methodology',
  name: 'Methodology & Coverage Rules',
  description: 'How these metrics stay honest',
  metricDescription: 'The coverage asymmetries, filters, and definitions that every HOPR/GnosisVPN metric on this dashboard applies.',
  chartType: 'text',
  content: `
**Two networks, two feeds, no overlap.** The prober (liveness, latency, availability) covers **dufour only** — it was never ported to v4, so jura carries registration counts and nothing else. Blokli (registrations, protocol parameters) serves jura. A jura panel without an "online" number is correct, not incomplete.

**Registry ≠ network size.** On-chain registration is cumulative and never expires: dufour's registry runs roughly **4x** its online count. Both numbers are shown side by side; neither alone is "the network size". Cross-anchor: network.hoprnet.org's online headline matches our dufour figure exactly.

**Cover traffic is not usage.** On dufour, nearly all channel activity comes from HOPR's own cover-traffic nodes — a staking-rewards schedule, not user demand. Every activity chart splits or excludes it, and the cover-traffic series must never be summed into usage.

**Testnet excluded.** rotsee (the v4 testnet) is excluded from every metric. This is the main reason HOPR's own Dune dashboard reads higher on VPN users: it counts both jura and rotsee. Replicating their SQL on our data reproduces their totals exactly — the difference is scope, not disagreement.

**Ticket economics.** Raw ticket price is meaningless across networks; the meaningful figure is **price ÷ win probability** (the effective value of a winning ticket), which cross-checks the protocol's own payout parameter.

**Geo coverage is a sample.** Only ~13% of dufour nodes geo-resolve today (the HOPR ip-crawler source is not yet built), and hosting classification is dominated by UNRESOLVED/NO_IPV4 sentinels. Location charts are labeled as resolved-subset reads.

**Forward-only feeds.** Blokli history starts at first ingest (protocol parameters: 2026-08-18; jura health: 2026-01). Gaps are gaps forever; charts do not imply deeper history exists.
`,
};
export default metric;

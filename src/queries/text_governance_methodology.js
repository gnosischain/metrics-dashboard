const metric = {
  id: 'text_governance_methodology',
  name: 'Methodology & Read Rules',
  description: 'How these metrics stay honest',
  metricDescription: 'The filtering rules, floors, and vocabulary conventions that every metric on this dashboard applies.',
  chartType: 'text',
  content: `
**GIP-only filtering.** Every aggregate on this dashboard counts GIP-numbered proposals only. Roughly half of all raw Snapshot rows in the GnosisDAO space are spam or phishing ballots at negligible turnout — including them would halve averages and distort rates.

**Floors before ranking.** Divergence metrics (Crowd vs Capital) require at least **30 voters** per ballot — the median GIP has ~68, and small-sample divergence is noise. Poll-vs-vote comparisons require at least **10 decisive poll votes** and a genuine **pre-vote temperature check**.

**Outcome vocabulary.** \`passed\` / \`rejected\` / \`no_consensus\` / \`decided\` / \`below_quorum\` / \`open\`. Two distinctions matter: \`below_quorum\` is **not** the same as \`rejected\` (capital absent vs capital opposed), and \`decided\` is a real winner that keyword classification could not label — not a failure.

**Quorum status.** \`met\` / \`missed\` / \`unspecified\` — older proposals simply had no quorum field; \`unspecified\` is legitimate and is never folded into \`missed\`.

**Turnout denominator.** Turnout divides voting power cast by a **per-proposal, strategy-aware eligible supply**: ETH + GNO circulating supply, plus staked GNO only when that proposal's voting strategy counted it.

**Privacy.** All data is drawn from de-identified marts: no usernames, user ids, or real names. Forum contributors appear only as stable pseudonym keys; delegate addresses are wallets already public on-chain.
`,
};
export default metric;

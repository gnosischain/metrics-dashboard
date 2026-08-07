const metric = {
  id: 'text_governance_methodology',
  name: 'How to read this section',
  description: 'What these numbers measure, and what they cannot',
  chartType: 'text',
  content: `

This section covers **GnosisDAO governance signaling**: Snapshot votes on \`gnosis.eth\`,
Discourse forum deliberation, and on-chain GNO delegation (DelegateRegistry on Ethereum).
It does **not** cover on-chain execution of passed proposals, treasury spend attribution, or
binding Safe transactions.

## Snapshot is not execution

A passed Snapshot ballot is a social signal. Nothing here proves funds moved or contracts
changed. For holdings, see **DAO Treasury** (sibling sector under Capital & Economics).

## GIPs vs everything else

Roughly half of Snapshot proposals are not GIPs. Aggregates on Outcomes, Turnout, Whales,
Electorate, and Contestation filter to GIPs (\`is_gip = 1\`) so spam and below-quorum noise
do not dominate the story. Lifetime KPIs that say "unique voters" still count every vote.

## People vs capital

Raw vote counts fell sharply after 2022. That alone is a misleading chart: 2022 was an
airdrop-farming bubble. The Electorate tab shows **median voters per GIP** next to
**median voting power per GIP** — those two lines are the honest participation story.

## Concentration is normal here

On a typical GIP, the top 10 voters by voting power cast almost all of the weight. Turnout
against eligible GNO supply is usually a few percent. Neither fact is hidden; both are
first-class charts under Participation.

## Forum polls ≠ Snapshot ballots

Forum temperature checks are one-person-one-vote among people who showed up on Discourse.
Snapshot is token-weighted. When they disagree, that is the finding — not a data error.
Only pre-vote temperature checks are used in the Contestation tables.

## Freshness

Figures refresh when click-runner ingests Snapshot/Discourse and dbt rebuilds the
\`api_governance_*\` marts. Delegation edges come from the on-chain DelegateRegistry indexer,
not from Snapshot's off-chain delegation UI alone.
`
};

export default metric;

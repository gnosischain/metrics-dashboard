const metric = {
  id: 'text_hopr_methodology',
  name: 'How to read this section',
  description: 'What these numbers measure, and what they cannot',
  chartType: 'text',
  content: `

GnosisVPN is a privacy VPN built on **HOPR**, an incentivised mixnet running on Gnosis Chain.
Node runners relay traffic and are paid per relay through on-chain payment channels. Everything
in this section is derived from those on-chain events plus HOPR's own public node feeds.

## The one thing to get right

**"Nodes registered" and "nodes online" are different numbers, and the gap is large.**

On-chain registration is cumulative and never expires. A machine that ran once in 2023 and
vanished still counts today, so the registered figure only ever rises. The online figure comes
from HOPR's network prober and reflects nodes that actually responded. The two have diverged
every year the network has existed.

Either one can be quoted honestly. Quoting the registered figure as "the size of the network"
cannot. Both are drawn side by side for that reason.

## Cover traffic is not demand

HOPR runs its own traffic across the network and pays node runners in proportion to their stake.
This is called cover traffic — it is a rewards programme, and it also serves a privacy purpose by
keeping the mixnet busy so real traffic is harder to single out.

On the older **dufour** network it accounts for almost all channel activity. Every activity chart
here therefore splits it out. A combined total would report a rewards distribution schedule as if
it were user traffic.

## Two networks, two blind spots

| | dufour | jura |
|---|---|---|
| Role | legacy network (HOPR v2/v3) | v4 — what the GnosisVPN client uses |
| Node liveness / latency | yes | **no prober exists** |
| Protocol params, staked balances | no | yes (via blokli) |
| Cover traffic | almost all activity | none |

Neither feed covers both networks, and that is upstream reality rather than a gap we can close.
Where a chart shows nothing for jura liveness, it is unmeasured — not zero.

## What we deliberately do not show

**Actual VPN usage — sessions, bytes, or users — is not here and never will be.**

That is the product working as designed. A mixnet exists to make traffic unlinkable; if we could
count sessions per user from the outside, the privacy guarantee would be broken. What can be
measured is the network carrying the traffic: how many nodes, where they are, who hosts them,
and what they are paid.

Node counts also are not user counts. One operator can run many nodes, which is why the
operator count — distinct staking Safes — is tracked alongside them.

## Coverage caveats worth knowing

- **Geography is IP-derived and partial.** Nodes that never announced an IPv4 address, or whose
  address has not been enriched, appear in an explicit \`UNKNOWN\` bucket rather than being
  dropped. Map points are city centroids, not machine locations.
- **Hosting \`Unknown\` means undetermined**, not residential. The classifier refuses to guess
  when a provider name matches no known pattern.
- **The online history has holes.** HOPR's hourly feed is missing a meaningful share of its
  hours, so a daily average can rest on anything from one observation to twenty-four.
- **Balance and protocol series are forward-only.** They begin when our ingestion started; no
  earlier day can be recovered.
`
};

export default metric;

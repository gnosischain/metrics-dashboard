const metric = {
  id: 'text_network_methodology_1',
  name: 'Measurement Methodology',
  description: 'How we measure and analyze network health metrics',
  chartType: 'text',
  content: `

This methodology explains how we process raw network data to generate reliable client distribution metrics for both **discv4** and **discv5** protocols.

---

## 1. Define the Universe per Protocol

What visits "count" for each protocol:

- **discv4**: Keep only visits that declare the Gnosis execution network (\`network_id = 100\`)
- **discv5**: Keep only visits that clearly belong to the Gnosis consensus network, detected via the fork digest/version (Phase0…Fulu, or a \`...0064\` fork version)

*This step prevents "foreign" networks from leaking into your counts.*

## 2. Clean Client Label Extraction

Parse the raw \`agent_version\` into a normalized client label:

Extract from the slash-delimited \`agent_version\` string:
- **Client name** (e.g., geth, erigon, reth, nethermind)
- **Optional variant** (if present between name and version)
- **Version token** (semantic-version-looking piece)
- **Platform/runtime tokens** (trailing information)

Protocol differences:
- **discv5** uses a stricter "find the first semver-looking token" rule for resilience
- If parsing fails or the field is missing → label falls back to \`Unknown\`

*This yields a normalized "client label" per observation (visit).*

## 3. Success Criteria

**Determine whether a visit is a successful observation:**

For daily rollups, the success predicate is:
\`\`\`
success = (dial_errors is empty) OR (crawl_error is NULL)
\`\`\`

*Only peers with at least one successful observation are eligible to be counted that day.*

## 4. Daily Timeline Bucketing

**Put observations on a daily timeline:**

The day is calculated as \`toStartOfDay(visit_ended_at)\` — bucketing by the calendar day when the visit ended.

## 5. Avoid Double-Counting

**Prevent inflation from multiple crawls hitting the same peer:**

- Multiple crawls can hit the same peer in the same day
- Count a peer **at most once per day per client** using distinct peer IDs
- **Peer ID** (not IP) is the identity key in the source data
- If a peer is seen multiple times that day → contributes **1** to its client's daily total

### Tie-Breaking Rules

**When a peer shows different labels the same day:**

- Take the **latest successful observation** that day for that peer
- If none parse successfully → peer lands in \`Unknown\`
- This keeps counts stable while respecting the most recent information

## 6. Daily Aggregation Process

**For each protocol separately:**

1. **Filter** to the correct network (Step 1)
2. **Keep** only successful observations (Step 3)  
3. **Extract** the client label (Step 2)
4. **Group** by day × client, count distinct peer IDs
5. **Emit** records: \`date, metric='Clients', label=<client>, value=<distinct_peers>\`

*These "date / client / count" rows are what power the daily distribution charts.*

## 7. Latest Snapshots & Changes

**For "current" totals and week-over-week changes:**

- Take the most recent completed day's totals per protocol
- Compare to exactly **7 days earlier**
- Percent change is computed from those two dates

---

## Why This Methodology Works

| Benefit | Explanation |
|---------|-------------|
| **Comparable across days** | Distinct-peer counting removes crawl-frequency bias |
| **Robust to noise** | Success predicate filters out transport/crawl failures |
| **Accurate attribution** | Parsing rules handle messy real-world \`agent_version\` strings |

## Important Caveats

⚠️ **Limitations to keep in mind:**

- **Agent strings can lie or be incomplete** → some clients marked as "Unknown"
- **Peer IDs can churn** (key rotation) → appears as new peers
- **Day boundary effects**: Peers active across midnight can appear on two days (one count each day) — this is intentional behavior

---

*This methodology ensures consistent, reliable metrics while accounting for the messy realities of decentralized network measurement.*`
};

export default metric;
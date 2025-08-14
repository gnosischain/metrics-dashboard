const metric = {
  id: 'text_network_methodology_2',
  name: 'Network Measurement Methodology',
  description: 'How we measure and analyze network health metrics',
  chartType: 'text',
  content: `

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
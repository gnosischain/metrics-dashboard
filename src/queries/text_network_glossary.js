const metric = {
  id: 'text_network_glossary',
  name: 'Network — Metrics Glossary',
  description: 'Definitions of key concepts, protocols, and terminology used across the Network dashboard',
  chartType: 'text',
  content: `

## Discovery Protocols

| Protocol | Definition |
|----------|-----------|
| **DiscV4** | Node Discovery Protocol v4. UDP-based peer discovery used primarily by execution-layer clients. Uses Kademlia DHT with basic node records (IP, port, public key). |
| **DiscV5** | Node Discovery Protocol v5. UDP-based peer discovery used primarily by consensus-layer clients. Uses ENR (Ethereum Node Records), supports topic advertisement, and carries fork digest information. |
| **ENR (Ethereum Node Record)** | A self-certified, versioned record that a node publishes about itself — containing its IP, port, public key, and protocol-specific metadata such as fork digest. |

---

## Crawl Terminology

| Concept | Definition |
|---------|-----------|
| **Crawl** | A single pass of the crawler through the network's DHT, discovering peers by walking routing tables. |
| **Visit** | A connection attempt to a specific peer during a crawl. A visit is "successful" if no dial errors or crawl errors occurred. |
| **Peer** | A node identified by its discovery ID (DiscV4) or ENR (DiscV5) that participates in the network. |
| **Neighbor** | A peer found in another peer's routing table during a crawl. Links between peers and neighbors form the network topology. |
| **Dial Error** | A failed connection attempt to a peer (e.g., timeout, refused, unreachable). |
| **Crawl Error** | An error encountered while querying a peer's routing table after a successful dial. |

---

## Consensus Fork Versions

Fork versions on Gnosis Chain's consensus layer, in chronological order:

| Fork | Description |
|------|-----------|
| **Phase0** | Initial Beacon Chain launch. |
| **Altair** | Light client support and sync committee introduction. |
| **Bellatrix** | Preparation for the Merge (execution-consensus coupling). |
| **Capella** | Enabled validator withdrawals. |
| **Deneb** | Introduced blob transactions (EIP-4844 / proto-danksharding). |
| **Electra** | Latest active fork with validator and attestation improvements. |

Peers advertise both their __current fork__ (what they are running) and __next fork__ (what they plan to transition to).

---

## Client Diversity

| Concept | Definition |
|---------|-----------|
| **Client** | A software implementation of the Ethereum/Gnosis protocol. Different clients (e.g., Nethermind, Lighthouse, Teku) are built by independent teams. |
| **Execution-Layer Client** | Processes transactions and maintains state (e.g., Nethermind, Erigon). Discovered via DiscV4. |
| **Consensus-Layer Client** | Runs the proof-of-stake consensus (e.g., Lighthouse, Teku, Lodestar, Nimbus). Discovered via DiscV5. |
| **Client Diversity Goal** | No single client should exceed 33% of the network. A supermajority bug (66%+) could cause incorrect finalization. |

---

## Infrastructure & Geography

| Concept | Definition |
|---------|-----------|
| **Provider** | The hosting environment where a node runs. Classified as cloud providers (AWS, Hetzner, OVH, etc.) or __Home/Office__ (residential ISP connections). |
| **Geographic Distribution** | Country-level location of peers, inferred from IP geolocation. Subject to inaccuracy from VPNs, NAT, and cloud regions. |
| **Concentration Risk** | When a large share of nodes depend on a single provider, country, or client — creating a single point of failure. |

---

## Data Sources

| Source | Description |
|--------|-----------|
| **Internal Crawler** | Gnosis-operated DiscV4 and DiscV5 crawlers that walk the DHT daily. Powers the Overview, Clients, Forks, and Topology tabs. |
| **ProbeLab (Nebula)** | Independent research initiative by Protocol Labs. Runs its own Nebula DHT crawler and publishes weekly network health reports. Powers the Probelab tab. |
| **IP Geolocation** | IP metadata (country, city, organization, hosting provider) sourced from ipinfo.io and enriched with provider classification logic. |

`
};

export default metric;

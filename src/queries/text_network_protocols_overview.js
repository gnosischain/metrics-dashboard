const metric = {
  id: 'text_network_protocols_overview',
  name: 'Network Protocol Overview',
  description: 'Understanding discv4 and discv5 protocols',
  chartType: 'text',
  content: `## Quick mental model of the protocols

Both use a **Kademlia-like DHT** over UDP: your node maintains k-buckets of peers at increasing XOR distances from your ID. Discovery does iterative lookups toward target IDs.

**discv4** keeps it simple: ping/pong to bond; FINDNODE → NEIGHBORS to learn peers. Good for bootstrapping devp2p; minimal metadata.

**discv5** upgrades the wire (challenge-response + session keys), standardizes identity with ENR, lets nodes advertise/seek topics, and returns nodes by distance—which is great for service-specific overlays (beacon attnets, Portal subnets).

## discv4 vs discv5 (at a glance)

| Aspect | discv4 | discv5 |
|--------|--------|--------|
| **Transport** | UDP | UDP |
| **Crypto/wire** | Lightweight auth; no session encryption by default | Authenticated & encrypted sessions with challenge ("WHOAREYOU"); better DoS resistance |
| **Address record** | Basic node record (IP/ports + pubkey) | ENR (Ethereum Node Record): signed, versioned key–value record (IP/ports, TCP/UDP, fork info, attnets, etc.) |
| **Discovery primitive** | Kademlia-style FINDNODE/NEIGHBORS for "closest to target ID" | FINDNODE/NODES by distance; richer request types |
| **Topic / service discovery** | None | Topic advertising & lookup (e.g., Eth2 attnets, Portal subnets) so you can discover services, not just nodes |
| **Routing table** | K-buckets over XOR space (k≈16), LRU eviction | Same idea, but cleaner semantics around distances & queries |
| **Used most by** | Execution-layer devp2p networks (Geth/Erigon/Nethermind/Reth, etc.) | Consensus layer (beacon nodes/validators), Portal Network; increasingly supported elsewhere |
| **NAT/IPv6, metadata** | Limited | Better multi-address support; ENR lets you publish richer metadata |`
};

export default metric;
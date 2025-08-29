const metric = {
  id: 'text_network_methodology',
  name: 'Measurement Methodology',
  description: 'How we measure and analyze network health metrics',
  chartType: 'text',
  content: `

This section explains how we identify and count unique validator nodes in the Gnosis network, ensuring accurate and reliable metrics across both discovery protocols.

## Data Collection Pipeline

\`\`\`mermaid
flowchart LR
    subgraph "1. Network Crawling"
        C1[Crawler 1]
        C2[Crawler 2]
    end
    
    subgraph "2. Raw Data"
        V4[DiscV4 Visits]
        V5[DiscV5 Visits]
    end
    
    subgraph "3. Processing"
        F1[Network<br/>Filtering]
        F2[Success<br/>Validation]
        F3[Client<br/>Parsing]
    end
    
    subgraph "4. Aggregation"
        D[Daily<br/>Deduplication]
        G[Group by<br/>Client/Country]
    end
    
    subgraph "5. Output"
        M[Daily Metrics]
    end
    
    C1 --> V4
    C2 --> V5
    
    V4 --> F1
    V5 --> F1
    F1 --> F2
    F2 --> F3
    F3 --> D
    D --> G
    G --> M
\`\`\`


### Step 1: Network Crawling

Multiple Nebula crawler instances continuously traverse the P2P network, attempting to discover and connect to all peers. Each crawler operates independently, collecting data from different network segments to maximize coverage.

\`\`\`mermaid
sequenceDiagram
    participant Crawler
    participant Peer
    participant Database
    
    loop Every few minutes
        Crawler->>Peer: Connection attempt
        alt Success
            Peer-->>Crawler: agent_version, peer_id, properties
            Crawler->>Database: Store successful visit
        else Failure
            Peer--xCrawler: Connection refused/timeout
            Crawler->>Database: Store failed visit with error
        end
    end
\`\`\`

Each visit captures essential metadata including the unique peer identifier, timestamp, client software version, connection address, and protocol-specific properties. Failed connections are also recorded to understand network reachability patterns.

### Step 2: Network Filtering

We ensure only Gnosis network peers are counted by applying strict protocol-specific filters:

**DiscV4 (Execution Layer):** We identify Gnosis execution nodes by filtering for network_id = 100, which is unique to the Gnosis chain. This excludes Ethereum mainnet and other EVM chains from our counts.

**DiscV5 (Consensus Layer):** We identify Gnosis consensus nodes through their fork digests (Phase0, Altair, Bellatrix, Capella, Deneb, Electra, Fulu) or fork versions ending in '064'. This pattern is specific to Gnosis and filters out beacon nodes from other chains.

### Step 3: Success Validation

To ensure data quality, we only count peers with verified successful connections:

\`\`\`mermaid
flowchart LR
    V[Visit Record]
    C1{dial_errors<br/>empty?}
    C2{crawl_error<br/>is NULL?}
    
    V --> C1
    C1 -->|Yes| C2
    C1 -->|No| Exclude[❌ Exclude]
    C2 -->|Yes| Include[✅ Count Peer]
    C2 -->|No| Exclude
\`\`\`

A connection is considered successful when there are no dial errors and no crawl-level errors. This filtering removes unreachable nodes behind NAT/firewalls, misconfigured peers, temporary network failures, and non-validator nodes that may appear in discovery but aren't actively participating.

### Step 4: Client Identification

We parse the agent_version string to identify which client software each peer is running. The string follows a predictable pattern with the client name as the first component, followed by version, platform, and runtime information. For example:

- **Execution clients:** Nethermind, Erigon, Geth, Besu
- **Consensus clients:** Lighthouse, Teku, Nimbus, Prysm, Lodestar

When the agent string cannot be parsed or is missing, we categorize the peer as "Unknown" to maintain data completeness.

### Step 5: Daily Deduplication

Since multiple crawlers observe the same peer throughout the day, we implement deduplication to ensure each peer is counted exactly once:

\`\`\`mermaid
flowchart TD
    subgraph "Raw Observations (Same Day)"
        O1[Peer ABC<br/>10:00 AM<br/>Crawl 1]
        O2[Peer ABC<br/>2:00 PM<br/>Crawl 2]
        O3[Peer ABC<br/>6:00 PM<br/>Crawl 3]
        O4[Peer XYZ<br/>11:00 AM<br/>Crawl 1]
    end
    
    subgraph "Deduplication by peer_id"
        D1[Peer ABC<br/>Latest: 6:00 PM<br/>Count: 1]
        D2[Peer XYZ<br/>Latest: 11:00 AM<br/>Count: 1]
    end
    
    subgraph "Daily Total"
        T[Unique Peers: 2]
    end
    
    O1 --> D1
    O2 --> D1
    O3 --> D1
    O4 --> D2
    
    D1 --> T
    D2 --> T
\`\`\`

We group observations by calendar day and peer_id, taking the most recent observation for each peer. This approach ensures consistent daily counts regardless of crawl frequency while capturing the latest state of each node.

### Step 6: Final Aggregation

After deduplication, we aggregate the unique peers across multiple dimensions to provide comprehensive network insights. The data is grouped by client type to understand software diversity, by country to assess geographic distribution, and by hosting provider to evaluate infrastructure decentralization. This produces metrics showing, for example, that Lighthouse might represent 45% of consensus clients, nodes are distributed across 50-60 countries, and there's roughly a 60/40 split between cloud-hosted and residential nodes.


### What We Measure Accurately

| Metric | Description |
|--------|-------------|
| **Unique peer identifiers** | Cryptographically secure public keys that cannot be spoofed |
| **Successful connections** | Only actively reachable and responsive nodes |
| **Client distribution** | Self-reported software versions from agent strings |
| **Geographic location** | IP-based geolocation accurate to country/city level |
| **Daily trends** | Consistent methodology enables reliable time-series analysis |

### Known Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **NAT/Firewall Hidden Nodes** | ~20-30% of nodes unreachable | Tracked separately in failed connections |
| **Agent String Spoofing** | Possible incorrect client labels | Cross-validate with behavior patterns |
| **Peer ID Rotation** | Same node counted as new | Generally rare, acceptable noise |
| **IP Geolocation** | VPNs may show wrong country | Flag known VPN/proxy IPs |
| **Time Zone Effects** | Peers at day boundary | Count once per calendar day (intended) |

## Implementation Architecture

\`\`\`mermaid
graph TD
    subgraph "Source Data"
        S1[nebula_discv4.visits]
        S2[nebula_discv5.visits]
    end
    
    subgraph "Staging"
        ST1[stg_nebula_discv4__visits]
        ST2[stg_nebula_discv5__visits]
    end
    
    subgraph "Intermediate"
        I1[int_p2p_discv4_peers]
        I2[int_p2p_discv5_peers]
        I3[int_p2p_discv4_clients_daily]
        I4[int_p2p_discv5_clients_daily]
    end
    
    subgraph "Marts"
        M1[api_p2p_clients_latest]
        M2[api_p2p_clients_daily]
    end
    
    S1 --> ST1 --> I1 --> I3 --> M1
    S2 --> ST2 --> I2 --> I4 --> M1
    I3 --> M2
    I4 --> M2
\`\`\`

The data flows through a structured pipeline from raw crawler visits through staging, intermediate processing, and finally to API-ready marts that power the dashboard visualizations.
For more information visit [docs](https://gnosischain.github.io/dbt-cerebro/#!/overview/gnosis_dbt).
`
};

export default metric;
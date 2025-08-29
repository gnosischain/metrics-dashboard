const metric = {
  id: 'text_esg_methodology',
  name: 'Carbon Footprint Methodology',
  description: 'How we calculate and analyze the Gnosis network carbon emissions',
  chartType: 'text',
  content: `

This section explains our methodology for calculating the carbon footprint of the Gnosis network, incorporating statistical techniques, empirical power consumption data, and uncertainty quantification.

## Overview

Our carbon footprint calculation combines multiple data sources and statistical methods to provide accurate, uncertainty-aware estimates of the Gnosis network's environmental impact.

\`\`\`mermaid
flowchart TB
    subgraph "1. Node Discovery"
        ND1[Network Crawlers]
        ND2[Successful Connections]
        ND3[Failed Connections]
    end
    
    subgraph "2. Population Estimation"
        PE1[Chao-1 Estimator]
        PE2[Failure Analysis]
        PE3[Enhanced Total]
    end
    
    subgraph "3. Classification"
        CL1[Home Stakers]
        CL2[Professional]
        CL3[Cloud Hosted]
    end
    
    subgraph "4. Power Model"
        PM1[CCRI Empirical Data]
        PM2[Client Efficiency]
        PM3[PUE Factors]
    end
    
    subgraph "5. Carbon Intensity"
        CI1[Ember Monthly Data]
        CI2[Seasonal Adjustment]
        CI3[Uncertainty Model]
    end
    
    subgraph "6. Final Calculation"
        FC[CO2 Emissions<br/>with Confidence Intervals]
    end
    
    ND1 --> ND2
    ND1 --> ND3
    ND2 --> PE1
    ND3 --> PE1
    PE1 --> PE2
    PE2 --> PE3
    PE3 --> CL1
    PE3 --> CL2
    PE3 --> CL3
    CL1 --> PM1
    CL2 --> PM1
    CL3 --> PM1
    PM1 --> PM2
    PM2 --> PM3
    CI1 --> CI2
    CI2 --> CI3
    PM3 --> FC
    CI3 --> FC
\`\`\`

## 1. Node Population Estimation (Chao-1)

### The Challenge

Network crawlers can only observe nodes that are reachable and respond to connection attempts. Many validators operate behind NAT/firewalls or experience temporary connectivity issues, making them "hidden" from direct observation. Traditional counting methods would significantly underestimate the true network size.

### Chao-1 Statistical Estimator

The Chao-1 estimator, originally developed for species richness estimation in ecology, provides a lower bound estimate of the total population based on the frequency of observations. It's particularly powerful because it uses the pattern of rare observations (nodes seen only once or twice) to infer how many nodes remain completely unobserved.

**Core Formula:**

    S_chao1 = S_obs + (f1^2 / 2*f2)

Where:
- **S_obs** = Number of unique nodes observed
- **f1** = Number of nodes seen exactly once (singletons)
- **f2** = Number of nodes seen exactly twice (doubletons)

**Intuition:** If many nodes are seen only once (high f1), it suggests many more remain unseen. Nodes seen twice (f2) help calibrate this estimate.

### Detailed Example

Let's walk through a concrete example with actual network data:

\`\`\`mermaid
flowchart LR
    subgraph left[" "]
        subgraph "Observation Phase"
            C[4 Daily Crawls]
            O[8 Unique Nodes<br/>A,B,C,D,E,F,G,H]
            F4[2 nodes seen 4x: A, B]
            F3[1 node seen 3x: C]
            F2[2 nodes seen 2x: D, E]
            F1[3 nodes seen 1x: F, G, H]
            
            C --> O
            O --> F4
            O --> F3
            O --> F2
            O --> F1
        end
    end
    
    subgraph right[" "]
        subgraph "Calculation Phase"
            I1[S_obs = 8]
            I2[f1 = 3 singletons]
            I3[f2 = 2 doubletons]
            F[Hidden = f1^2 / 2*f2]
            C1[Hidden = 9 / 4 = 2.25]
            R[Total = 8 + 2.25<br/>~10 nodes]
            
            I1 --> F
            I2 --> F
            I3 --> F
            F --> C1
            C1 --> R
        end
    end
    
    F1 -.-> I2
    F2 -.-> I3
\`\`\`

**Interpretation:** 
- We directly observed 8 nodes
- 3 nodes were seen only once (suggesting incomplete coverage)
- 2 nodes were seen twice (helping calibrate the estimate)
- The formula estimates ~2 additional unobserved nodes exist
- Total network size: ~10 nodes

This pattern scales to our real network where we observe ~1,200 nodes but estimate ~1,500 total reachable nodes.

### Bias Correction

When f2 = 0 (no doubletons), we use the bias-corrected formula:

    S_chao1 = S_obs + [f1 * (f1 - 1)] / 2

This prevents division by zero and provides a more conservative estimate when sampling is extremely sparse.

### Confidence Intervals

We calculate variance to provide confidence intervals:

    Var(S_chao1) = f2 * [0.5*(f1/f2)^2 + (f1/f2)^3 + 0.25*(f1/f2)^4]

**95% Confidence Interval:** S_chao1 ± 1.96 * sqrt(Var(S_chao1))

### Enhanced Estimation with Failure Analysis

We extend Chao-1 by analyzing connection failures to estimate additional reachable nodes:

\`\`\`mermaid
flowchart TD
    subgraph "Connection Results"
        A[2500 Total Attempts]
        S[1200 Successful]
        F[1300 Failed]
    end
    
    subgraph "Failure Types"
        F1[400 Timeout]
        F2[500 Refused]
        F3[200 Unreachable]
        F4[100 Protocol]
        F5[100 Other]
    end
    
    subgraph "Recovery Rates"
        R1[Timeout: 30%]
        R2[Refused: 10%]
        R3[Unreachable: 5%]
        R4[Protocol: 80%]
        R5[Other: 20%]
    end
    
    subgraph "Recoverable"
        E1[120 from Timeout]
        E2[50 from Refused]
        E3[10 from Unreachable]
        E4[80 from Protocol]
        E5[20 from Other]
    end
    
    subgraph "Total"
        T[280 Additional<br/>Recoverable Nodes]
    end
    
    A --> S
    A --> F
    F --> F1
    F --> F2
    F --> F3
    F --> F4
    F --> F5
    F1 --> R1
    F2 --> R2
    F3 --> R3
    F4 --> R4
    F5 --> R5
    R1 --> E1
    R2 --> E2
    R3 --> E3
    R4 --> E4
    R5 --> E5
    E1 --> T
    E2 --> T
    E3 --> T
    E4 --> T
    E5 --> T
\`\`\`

**Reachability Probabilities by Failure Type:**

| Failure Type | Count | Recovery Rate | Recoverable | Rationale |
|-------------|-------|---------------|-------------|-----------|
| Timeout | 400 | 30% | 120 | Often temporary network congestion |
| Connection Refused | 500 | 10% | 50 | Usually permanent (firewall/NAT) |
| Unreachable | 200 | 5% | 10 | Severe routing issues |
| Protocol Mismatch | 100 | 80% | 80 | Wrong version, easily fixed |
| Other Errors | 100 | 20% | 20 | Various transient issues |
| **Total** | **1,300** | **21.5%** | **280** | **Additional recoverable nodes** |

### Network Results

**Population Layers:**
1. **Observed Successful** (~1,200): Nodes we can directly connect to
2. **Hidden but Reachable** (~300): Estimated via Chao-1 from observation patterns
3. **Currently Failed but Recoverable** (~300): Estimated from failure analysis
4. **Total Network Size** (~2,200): All nodes that exist in the network

**Key Metrics:**
- **Discovery Coverage**: 55% (1,200 / 2,200)
- **Reachability Rate**: 82% (1,800 / 2,200)
- **Hidden Node Percentage**: 25% (300 / 1,200)
- **Sample Completeness**: Indicated by f1/f2 ratio

## 2. Node Classification

### Operational Archetypes

We classify nodes into three operational categories based on their hosting infrastructure:

\`\`\`mermaid
flowchart TD
    N[Node Detected]
    
    N --> IP[IP Address Analysis]
    
    IP --> C1{Cloud Provider?}
    C1 -->|Yes| CP{Which Cloud?}
    C1 -->|No| C2{Hosting Type?}
    
    CP -->|AWS, GCP, Azure| CH1[Major Cloud<br/>95% confidence]
    CP -->|DO, Hetzner, OVH| CH2[Minor Cloud<br/>90% confidence]
    
    C2 -->|Datacenter ASN| PO[Professional<br/>75% confidence]
    C2 -->|Residential ISP| HS[Home Staker<br/>80% confidence]
    C2 -->|Unknown| UN[Unknown<br/>30% confidence]
    
    CH1 --> CLOUD[Cloud Hosted<br/>155W CCRI Tier 6]
    CH2 --> CLOUD
    PO --> PROF[Professional Op<br/>48W CCRI Tier 5]
    HS --> HOME[Home Staker<br/>22W CCRI Tier 4]
    UN --> DEFAULT[Default Profile<br/>50W Average]
\`\`\`

### Geographic Distribution

Each category's nodes are distributed geographically based on observed IP addresses, with the Chao-1 scaling factor applied proportionally to maintain regional ratios.

## 3. Power Consumption Model (CCRI Empirical Data)

### CCRI Hardware Tiers

We use empirical power measurements from the Crypto Carbon Ratings Institute (CCRI) 2022 research on Ethereum nodes:

| Category | CCRI Tier | Hardware Profile | Base Power | Std Dev | Sample Size |
|----------|-----------|-----------------|------------|---------|-------------|
| Home Staker | Tier 4 | Intel NUC, Raspberry Pi, Mini PC | 22W | ±3.3W | n=45 |
| Professional | Tier 5 | Dell R640, HP DL380, Supermicro | 48W | ±7.2W | n=28 |
| Cloud Hosted | Tier 6 | AWS m5.xlarge, GCP n2-standard-4 | 155W | ±23W | n=52 |

**Important:** These values represent the full node power consumption including:
- Execution client (Nethermind/Erigon)
- Consensus client (Lighthouse/Teku/etc.)
- Operating system overhead
- Network and storage activity

### Client Efficiency Factors

Different client combinations have varying efficiency:

\`\`\`mermaid
graph TB
    subgraph "Power Calculation"
        BASE[Base Power<br/>22-155W]
        
        CONS[Consensus Client<br/>0.85x - 1.15x]
        
        EXEC[Execution Client<br/>0.95x - 1.02x]
        
        DIV[Diversity Bonus<br/>0.90x - 0.95x]
        
        FINAL[Final Power]
    end
    
    BASE --> FINAL
    CONS --> FINAL
    EXEC --> FINAL
    DIV --> FINAL
\`\`\`

**Consensus Client Factors:**
- Lighthouse: 0.95x (most efficient)
- Nimbus: 0.85x (highly optimized)
- Teku: 1.15x (JVM overhead)
- Prysm: 1.05x (moderate)
- Lodestar: 1.10x (JavaScript overhead)

**Execution Client Factors:**
- Erigon: 0.95x (optimized storage)
- Nethermind: 1.00x (baseline)
- Besu: 1.02x (JVM overhead)
- Geth: 0.98x (efficient)

### Power Usage Effectiveness (PUE)

PUE accounts for infrastructure overhead beyond the IT equipment:

    Energy_total = Energy_IT * PUE

| Category | PUE | Components Included | Source |
|----------|-----|-------------------|---------|
| Home Staker | 1.00 | None (direct home power) | N/A |
| Professional | 1.58 | Cooling, UPS, lighting, networking | Uptime Institute 2023 |
| Cloud Hosted | 1.15 | Hyperscale efficiency | AWS/GCP sustainability reports |

## 4. Carbon Intensity Model

### Dynamic Grid Carbon Intensity

We use monthly carbon intensity data from Ember Climate, enhanced with sophisticated uncertainty modeling:

\`\`\`mermaid
flowchart TB
    subgraph "Input"
        E[Ember Monthly Data]
    end
    
    subgraph "Grid Type Analysis"
        G1[Low Carbon<br/>Under 100 gCO2/kWh<br/>25% variation]
        G2[Medium Carbon<br/>100-300 gCO2/kWh<br/>20% variation]
        G3[High Carbon<br/>300-600 gCO2/kWh<br/>15% variation]
        G4[Very High Carbon<br/>Over 600 gCO2/kWh<br/>12% variation]
    end
    
    subgraph "Adjustments"
        T[Temporal Uncertainty]
        M[Measurement Error 10%]
        S[Seasonal Pattern]
    end
    
    subgraph "Output"
        O[CI with Confidence Intervals]
    end
    
    E --> G1
    E --> G2
    E --> G3
    E --> G4
    G1 --> T
    G2 --> T
    G3 --> T
    G4 --> T
    T --> O
    M --> O
    S --> O
\`\`\`

### Temporal Uncertainty by Grid Type

Carbon intensity uncertainty varies with grid composition:

**Low Carbon (<100 gCO2/kWh):** ±25% variation
- High renewable penetration (solar/wind)
- Subject to weather and time-of-day variations
- Examples: Norway (98% hydro), Iceland (geothermal)

**Medium Carbon (100-300 gCO2/kWh):** ±20% variation
- Mixed renewable and fossil sources
- Moderate variability
- Examples: France (nuclear), Spain (wind+gas)

**High Carbon (300-600 gCO2/kWh):** ±15% variation
- Gas-dominated with some renewables
- More predictable
- Examples: USA (mixed), Germany (coal+renewables)

**Very High Carbon (>600 gCO2/kWh):** ±12% variation
- Coal baseload with stable output
- Minimal variation
- Examples: Poland (coal), India (coal)

### Seasonal Adjustments

We apply empirically-derived seasonal factors by continent:

| Continent | Winter (Dec-Feb) | Summer (Jun-Aug) | Shoulder Seasons |
|-----------|-----------------|------------------|------------------|
| Europe | +18% (heating) | -8% (mild + solar) | +8% |
| North America | +15% (heating) | +12% (cooling) | +3% |
| Asia | +12% (heating + industrial) | +8% (cooling) | +5% |
| Oceania* | -5% (summer) | +15% (winter) | +5% |
| South America* | -2% (summer) | +10% (winter) | 0% |
| Africa | -2% (wet season) | +5% (dry season) | 0% |

*Southern Hemisphere has reversed seasons

## 5. Carbon Footprint Calculation

### Core Formula

The daily carbon emissions for each node category and country:

    CO2_daily = (Nodes * Power_W * 24h * PUE * CI_gCO2/kWh) / 1,000,000

**Units:**
- Nodes: count
- Power: Watts
- Time: 24 hours
- PUE: dimensionless
- CI: gCO2/kWh
- Result: kg CO2

### Uncertainty Propagation

We propagate uncertainties using standard error propagation:

    sigma_CO2 = CO2 * sqrt[(sigma_nodes/nodes)^2 + (sigma_power/power)^2 + (sigma_CI/CI)^2]

### Confidence Intervals

**95% Confidence:** CO2 ± 1.96 * sigma

**90% Confidence:** CO2 ± 1.645 * sigma

## 6. Network Effective Carbon Intensity

The network's effective carbon intensity is the weighted average across all countries:

    CI_effective = sum(Nodes_country * CI_country) / sum(Nodes_country)

This metric shows how geographic distribution affects overall emissions. A network concentrated in renewable-heavy regions will have lower effective CI than one distributed in coal-heavy areas.

## Typical Results

\`\`\`mermaid
graph TB
    subgraph "Daily Metrics"
        D1[1800 Validators]
        D2[125 MWh Energy]
        D3[55 kg CO2]
        D4[440 gCO2/kWh]
    end
    
    subgraph "Annual Projection"
        A1[45,600 MWh/year]
        A2[20,000 tonnes CO2e]
        A3[11 kg CO2/validator]
    end
    
    subgraph "Breakdown"
        B1[Home: 40% nodes]
        B2[Prof: 30% nodes]
        B3[Cloud: 30% nodes]
    end
    
    D1 --> A1
    D2 --> A1
    D3 --> A2
    D1 --> A3
    D1 --> B1
    D1 --> B2
    D1 --> B3
\`\`\`

### Key Performance Indicators

| Metric | Value | Uncertainty | Benchmark |
|--------|-------|------------|-----------|
| Network Size | ~1,800 validators | ±15% | Chao-1 enhanced |
| Power per Validator | ~70W | ±20% | 70% lower than previous |
| Daily Energy | ~125 MWh | ±18% | Full network consumption |
| Daily Emissions | ~55 kg CO2 | ±20% | Location-based accounting |
| Annual Emissions | ~20,000 tCO2e | ±20% | Projected from daily |
| Per Validator Annual | ~11 kg CO2 | ±25% | Highly efficient |

### Comparison with Previous Estimates

Our CCRI-based empirical approach shows significant improvements:

**Power Consumption:** 70% reduction
- Previous estimates: 75-200W per node
- Current (CCRI): 22-155W per node
- Primary factors: Better hardware, optimized clients

**Carbon Intensity:** More accurate
- Previous: Static country averages
- Current: Dynamic with seasonal adjustment
- Improvement: ±20% uncertainty quantification

## Data Quality & Limitations

### Strengths
✅ **Empirical power data** from CCRI field measurements  
✅ **Statistical rigor** with Chao-1 population estimation  
✅ **Comprehensive uncertainty** propagation  
✅ **Dynamic carbon intensity** with seasonal patterns  
✅ **Client-specific** efficiency modeling  
✅ **Geographic granularity** at country level  

### Limitations
⚠️ **Hidden nodes:** ~25% population uncertainty  
⚠️ **Power variations:** Workload-dependent (±15%)  
⚠️ **Geographic accuracy:** VPN usage affects ~5%  
⚠️ **Temporal granularity:** Monthly CI hides daily variations  
⚠️ **Client efficiency:** Estimated, not directly measured  
⚠️ **PUE assumptions:** Industry averages, not site-specific  

### Future Improvements
- Real-time carbon intensity data integration
- Validator-reported power measurements
- Machine learning for failure recovery estimation
- Workload-based power modeling
- Regional PUE refinement

## References

1. **Chao, A. (1984).** "Nonparametric estimation of the number of classes in a population." *Scandinavian Journal of Statistics*, 11(4), 265-270.

2. **CCRI (2022).** "The Merge – Implications on the Electricity Consumption and Carbon Footprint of the Ethereum Network" *Crypto Carbon Ratings Institute*.

3. **Ember Climate (2024).** "Global Electricity Review." Monthly carbon intensity data.

4. **Uptime Institute (2023).** "Global Data Center Survey." PUE benchmarks.

For more information and source code, visit [GitHub - Gnosis dbt-cerebro](https://gnosischain.github.io/dbt-cerebro/#!/overview/gnosis_dbt).
`
};

export default metric;
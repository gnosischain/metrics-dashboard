const metric = {
    id: 'esg_methodology',
    name: 'ESG Methodology',
    description: 'Methodology for Gnosis Chain Carbon Footprint Estimation',
    chartType: 'text',
    query: `
  # Methodology Report: Gnosis Chain Operational Carbon Footprint Estimation
  
<a id="toc"></a>
**Table of Contents**

<details>
  <summary><a href="#1-executive-summary"><strong>1. Executive Summary</strong></a></summary>
  </details>
<details>
  <summary><a href="#2-introduction"><strong>2. Introduction</strong></a></summary>
  <ul>
    <li><a href="#21-context-blockchain-sustainability-and-esg-imperatives">2.1. Context</a></li>
    <li><a href="#22-objective-quantifying-gnosis-chains-operational-footprint">2.2. Objective</a></li>
    <li><a href="#23-foundational-framework-the-ccri-bottom-up-approach">2.3. Foundational Framework</a></li>
    <li><a href="#24-guiding-principles-for-methodological-rigor">2.4. Guiding Principles</a></li>
  </ul>
</details>
<details>
  <summary><a href="#3-estimating-single-node-power-consumption-the-best-guess-node"><strong>3. Estimating Single Node Power</strong></a></summary>
   <ul>
    <li><a href="#31-hardware-profile-characterization-and-idle-power-baseline">3.1. Hardware Profile & Idle Power</a></li>
    <li><a href="#32-client-software-power-dynamics-marginal-consumption">3.2. Client Software Power Dynamics</a></li>
    <li><a href="#33-synthesizing-the-average-node-profile-weighted-power-estimation">3.3. Synthesizing Average Node</a></li>
  </ul>
</details>
 <details>
  <summary><a href="#4-scaling-to-network-level-impact-from-single-node-to-global-footprint"><strong>4. Scaling to Network-Level Impact</strong></a></summary>
   <ul>
     <li><a href="#41-quantifying-the-node-population-and-geographic-distribution">4.1. Node Population & Geolocation</a></li>
     <li><a href="#42-calculating-total-network-energy-consumption">4.2. Calculating Network Energy</a></li>
   </ul>
 </details>
 <details>
   <summary><a href="#5-translating-energy-use-to-carbon-emissions-geographic-carbon-intensity"><strong>5. Translating Energy to Emissions</strong></a></summary>
   <ul>
     <li><a href="#51-application-of-geographic-carbon-intensity-factors-cifs">5.1. Applying Carbon Intensity Factors (CIFs)</a></li>
   </ul>
 </details>
 <details>
   <summary><a href="#6-data-dependencies-acquisition-and-model-implementation"><strong>6. Data & Implementation</strong></a></summary>
   <ul>
     <li><a href="#61-critical-data-inputs-and-sourcing-challenges">6.1. Critical Data Inputs</a></li>
     <li><a href="#62-overview-of-dbt-model-operationalization">6.2. dbt Model Overview</a></li>
   </ul>
 </details>
 <details>
   <summary><a href="#7-underlying-assumptions-and-model-boundaries"><strong>7. Assumptions & Boundaries</strong></a></summary>
   <ul>
    <li><a href="#71-discussion-of-key-methodological-assumptions">7.1. Key Assumptions</a></li>
     <li><a href="#72-defined-scope-and-limitations">7.2. Scope & Limitations</a></li>
   </ul>
 </details>
<details>
  <summary><a href="#8-considerations-for-emission-allocation-brief-overview"><strong>8. Considerations for Emission Allocation</strong></a></summary>
  </details>
<details>
  <summary><a href="#9-pathways-for-enhancement-and-future-research"><strong>9. Pathways for Enhancement & Future Research</strong></a></summary>
  </details>
<details>
  <summary><a href="#10-concluding-remarks"><strong>10. Concluding Remarks</strong></a></summary>
  </details>

---
  
  # 1. Executive Summary
  
  **Purpose:** This report details the methodology developed for estimating the operational electricity consumption and the associated carbon footprint (Scope 2 & 3) attributable to the Gnosis Chain network's node infrastructure.
  
  **Approach:** The core methodology represents an adaptation of the bottom-up framework pioneered by the Crypto Carbon Ratings Institute (*CCRI*) for Proof-of-Stake (*PoS*) blockchains. This approach involves profiling representative hardware used by node operators, quantifying the idle and marginal power consumption of Gnosis-compatible client software (consensus and execution layers) running on this hardware, estimating an average power consumption per node based on assumed hardware and client software distributions within the network, scaling this average across the entire network using node count and geographic location data, and finally, calculating the carbon footprint using country-specific electricity grid carbon intensity factors. Given the architectural similarities between Gnosis Chain and Ethereum post-Merge (both *PoS*), data from *CCRI*'s Ethereum analysis serves as an initial proxy for hardware and software power profiles.
  
  **Implementation:** This methodology is operationalized through a series of interconnected *dbt* (data build tool) models, including *esg_idle_electric_power*, *esg_consensus_power*, *esg_execution_power*, *esg_node_distribution*, *esg_country_power_consumption*, and *esg_carbon_emissions*. These models systematically process the required data inputs, enabling the calculation and reporting of daily estimates suitable for ongoing monitoring and dashboard integration.
  
  **Key Findings/Outputs:** The application of this methodology yields daily estimates of the Gnosis Chain network's total operational power demand (in Watts), cumulative energy consumption (in *kWh* or *MWh*), and resultant carbon dioxide equivalent (*CO2e*) emissions (in tonnes), with a breakdown by country based on node distribution.
  
  **Core Assumptions & Limitations:** The accuracy of the estimates is contingent upon several key assumptions, notably the use of proxy data derived from Ethereum studies for hardware configurations and client software power consumption. Furthermore, the estimates are highly sensitive to the accuracy of Gnosis-specific inputs, particularly the distribution of different hardware types, the market share of various consensus/execution client combinations, and the reliability of node count and geolocation data. The scope is explicitly limited to operational energy consumption, excluding embodied carbon associated with hardware manufacturing and disposal.
  
  **Overall Significance:** This documented methodology provides a transparent and structured framework for assessing the environmental impact of Gnosis Chain operations, serving as a valuable tool for Environmental, Social, and Governance (*ESG*) reporting. However, continuous refinement, particularly through the acquisition of Gnosis-specific empirical data, is essential to improve the accuracy and robustness of the estimates over time.
  
  [Back to Table of Contents](#toc)
  
  ---
  
  # 2. Introduction
  
  ## 2.1. Context: Blockchain Sustainability and ESG Imperatives
  
  The increasing integration of blockchain technology across diverse economic and social sectors necessitates a thorough understanding of its environmental implications. Driven by heightened Environmental, Social, and Governance (*ESG*) considerations among stakeholders, investors, and the public, the energy consumption and associated carbon footprint of blockchain networks have become critical areas of scrutiny. Establishing robust, transparent, and scientifically grounded methodologies for quantifying this footprint is essential to move beyond simplistic or often misleading estimations and enable credible environmental accountability. Gnosis Chain operates using a Proof-of-Stake (*PoS*) consensus mechanism, which is widely recognized for offering substantial energy efficiency improvements compared to traditional Proof-of-Work (*PoW*) systems. Nevertheless, even *PoS* networks consume energy through their distributed node infrastructure, and quantifying this consumption accurately remains crucial for comprehensive sustainability assessments.
  
  ## 2.2. Objective: Quantifying Gnosis Chain's Operational Footprint
  
  The primary objective of this work is to establish and meticulously document a detailed, replicable, and transparent methodology for estimating the daily electricity consumption and the resultant carbon dioxide equivalent (*CO2e*) emissions originating specifically from the ongoing operation of Gnosis Chain network nodes. This encompasses the energy demands of both the consensus layer (*CL*) (responsible for network agreement) and execution layer (*EL*) (responsible for transaction processing and state management) client software running on the hardware infrastructure maintained by node operators globally.
  
  ## 2.3. Foundational Framework: The CCRI Bottom-Up Approach
  
  This methodology leverages the foundational work of the Crypto Carbon Ratings Institute (*CCRI*), a notable contributor to the field of blockchain energy consumption analysis. Specifically, it adopts the *CCRI*'s bottom-up approach, which is particularly well-suited for *PoS* networks like Gnosis Chain. Unlike top-down methods that might estimate total network energy use based on aggregate economic factors (often applied to *PoW* networks), the bottom-up approach focuses on estimating the energy consumption of individual network components – in this case, the nodes – based on their specific hardware and software characteristics. This granular approach allows for a more nuanced understanding of energy drivers within the network. The specific relevance of *CCRI*'s detailed analysis of Ethereum after its transition to *PoS* ("The Merge") provides a strong justification for utilizing their published hardware and software power consumption data as initial proxies, given the architectural parallels between the two networks.
  
  ## 2.4. Guiding Principles for Methodological Rigor
  
  To ensure the credibility and utility of the estimates, the methodology adheres to key principles adapted from *CCRI*'s framework:
  
  * **Consistency:** The methodology strives to apply a uniform calculation framework across the potentially wide array of hardware configurations and client software combinations used by Gnosis node operators. This ensures that comparisons across different potential network compositions or over time are based on equivalent assessment criteria, even when dealing with heterogeneous components.
  * **Continuity:** The framework is designed with adaptability in mind, allowing it to remain relevant and applicable as the Gnosis network evolves. It should be capable of incorporating updated data inputs – such as new hardware benchmarks, revised client software power profiles, shifts in client popularity, changes in node counts, or updated carbon intensity factors – without requiring a fundamental redesign of the core calculation logic.
  * **Completeness:** The methodology aims to account for all significant sources of operational energy consumption within the Gnosis node infrastructure. While acknowledging the practical impossibility of measuring every single node individually, the approach seeks comprehensive coverage by modeling representative hardware and software setups and scaling based on network-wide data. It is crucial, however, to reiterate the defined scope boundary: this methodology focuses strictly on operational energy use and explicitly excludes factors like the embodied energy associated with hardware manufacturing, transportation, and end-of-life disposal.
  
  [Back to Table of Contents](#toc)
  
  ---
  
  # 3. Estimating Single Node Power Consumption: The "Best Guess" Node
  
  The foundation of the network-wide estimate lies in determining the power consumption of a single, representative Gnosis node. This involves characterizing the hardware, quantifying the power draw of the software, and combining these elements based on assumed network distributions.
  
  ## 3.1. Hardware Profile Characterization and Idle Power Baseline
  
  **Rationale:** The energy consumption of any computing device begins with its baseline power draw when idle. For a blockchain node, this represents the power consumed by the hardware components (*CPU*, *RAM*, storage, motherboard, etc.) simply being powered on, before accounting for the load imposed by the node software. As node operators utilize a diverse range of hardware, from low-power mini-PCs to high-performance servers, modeling this diversity using representative configurations is essential for estimating an average idle power consumption.
  
  **Implementation:** Due to the lack of readily available, comprehensive data on the specific hardware used by Gnosis node operators, this methodology initially leverages hardware configurations identified and measured by *CCRI* in their analysis of Ethereum *PoS* validators. These configurations are deemed suitable proxies because the operational requirements for running a Gnosis node are broadly similar to those for an Ethereum node. The selected configurations represent mid-to-high-tier consumer or "prosumer" setups commonly used for validation tasks:
  
  * Config 4 (Mid-Tier): Example based on Intel NUC platform with Core i5-1135G7 *CPU*, 16GB *RAM*, and a 2TB *SSD*.
  * Config 5 (High-Tier): Example based on a desktop system with Intel Core i5-10400 *CPU*, 64GB *RAM*, and a 2TB *SSD*.
  * Config 6 (Very High-Tier): Example based on a high-performance workstation with AMD Threadripper 3970X *CPU*, 256GB *RAM*, and a 2TB *SSD*.
  
  **Idle Power Data:** The idle power consumption (measured in Watts) for each of these configurations – representing the power draw when the system is powered on but the consensus and execution client software are not actively running – is sourced directly from *CCRI*'s published measurements. This baseline power data is stored and utilized within the *dbt* models *esg_hardware_config.sql* and *esg_idle_electric_power.sql*.
  
  A critical consideration arises from this reliance on proxy hardware. The actual hardware landscape within the Gnosis network might differ from that of Ethereum, perhaps influenced by different staking economics, community recommendations, or hardware availability. For instance, if Gnosis operators tend to use less powerful (and potentially lower-power) hardware than the assumed mid-to-high tier Ethereum profiles, using these proxies would lead to an overestimation of the network's idle power baseline. Conversely, if more powerful hardware is prevalent, the idle power might be underestimated. This sensitivity underscores the importance of validating or refining these hardware profile assumptions with Gnosis-specific data as a priority for future methodological improvements.
  
  **Table 1: Representative Hardware Configurations and Idle Power (Based on CCRI Ethereum Data)**
  
  <table>
    <thead>
      <tr>
        <th>Configuration Name</th>
        <th>Key Specifications</th>
        <th>Sourced Idle Power (Watts)</th>
        <th>Source Citation</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Config 4 - Mid-Tier</td>
        <td>Intel NUC i5-1135G7, 16GB <em>RAM</em>, 2TB <em>SSD</em></td>
        <td>Value from</td>
        <td>Specs:</td>
      </tr>
      <tr>
        <td>Config 5 - High-Tier</td>
        <td>Intel i5-10400, 64GB <em>RAM</em>, 2TB <em>SSD</em></td>
        <td>Value from</td>
        <td>Specs:</td>
      </tr>
      <tr>
        <td>Config 6 - Very High-Tier</td>
        <td>AMD Threadripper 3970X, 256GB <em>RAM</em>, 2TB <em>SSD</em></td>
        <td>Value from</td>
        <td>Specs:</td>
      </tr>
    </tbody>
  </table>
  <p><em>Note: Actual Watt values need to be populated from the cited source. Table provides structure and transparency.</em></p>
  
  
  ## 3.2. Client Software Power Dynamics: Marginal Consumption
  
  **Rationale:** Running the necessary blockchain client software – specifically, both a consensus layer (*CL*) client and an execution layer (*EL*) client – imposes a computational load on the hardware, causing it to consume additional power beyond its idle state. Quantifying this marginal power consumption (the difference between total power under load and idle power) is the next crucial step.
  
  **Implementation:** A typical Gnosis node runs two main software components: a *CL* client (e.g., *Lighthouse*, *Teku*, *Nimbus*, *Prysm*, *Lodestar*) responsible for participating in the *PoS* consensus process, and an *EL* client (e.g., *Nethermind*, *Erigon*, *Geth*) responsible for executing transactions, managing state, and serving *JSON-RPC* requests. It is essential to verify which specific client software versions are compatible with and commonly used on the Gnosis Chain, as the ecosystem may differ from Ethereum's.
  
  **Marginal Power Data:** Similar to the hardware profiles, direct measurements of marginal power consumption for various client combinations running under typical Gnosis network load are not currently available. Therefore, the methodology initially relies on marginal power consumption data published by *CCRI*, derived from their measurements of Ethereum *CL* and *EL* clients running on the representative hardware configurations (Configs 4, 5, 6) described above. These values represent the additional Watts consumed by each client software component when running, compared to the hardware's idle state. This proxy data populates the *dbt* models *esg_consensus_power.sql* and *esg_execution_power.sql*.
  
  This reliance introduces a second layer of approximation. The power consumption figures are based not only on potentially different hardware (as discussed in 3.1) but also on the operational load experienced on the Ethereum network during the measurement period. Gnosis Chain's specific transaction volume, block size, peer-to-peer messaging patterns, and state growth characteristics might differ significantly from Ethereum's. Consequently, the actual marginal power draw of clients running on Gnosis could vary from these Ethereum-based proxies. This "double proxy" issue – using ETH hardware profiles and ETH load conditions – highlights a significant source of uncertainty. Direct measurement of power consumption for Gnosis-compatible clients, operating on representative hardware, and subjected to realistic Gnosis network load conditions, is paramount for enhancing the accuracy of the estimates.
  
  **Table 2: Client Software Marginal Power Consumption (Proxy Data Based on CCRI Ethereum Measurements)**
  
  <table>
    <thead>
      <tr>
        <th>Client Software</th>
        <th>Hardware Configuration</th>
        <th>Sourced Marginal Power (Watts)</th>
        <th>Source Citation</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><em>Lighthouse</em> (<em>CL</em>)</td>
        <td>Config 4 - Mid</td>
        <td>Value from</td>
        <td></td>
        <td>Proxy data based on Ethereum measurements</td>
      </tr>
      <tr>
        <td><em>Lighthouse</em> (<em>CL</em>)</td>
        <td>Config 5 - High</td>
        <td>Value from</td>
        <td></td>
        <td>Proxy data based on Ethereum measurements</td>
      </tr>
      <tr>
        <td><em>Lighthouse</em> (<em>CL</em>)</td>
        <td>Config 6 - Very High</td>
        <td>Value from</td>
        <td></td>
        <td>Proxy data based on Ethereum measurements</td>
      </tr>
      <tr>
        <td><em>Nethermind</em> (<em>EL</em>)</td>
        <td>Config 4 - Mid</td>
        <td>Value from</td>
        <td></td>
        <td>Proxy data based on Ethereum measurements</td>
      </tr>
      <tr>
        <td><em>Nethermind</em> (<em>EL</em>)</td>
        <td>Config 5 - High</td>
        <td>Value from</td>
        <td></td>
        <td>Proxy data based on Ethereum measurements</td>
      </tr>
      <tr>
        <td><em>Nethermind</em> (<em>EL</em>)</td>
        <td>Config 6 - Very High</td>
        <td>Value from</td>
        <td></td>
        <td>Proxy data based on Ethereum measurements</td>
      </tr>
      <tr>
        <td>(Other relevant <em>CL</em>/<em>EL</em> clients)</td>
        <td>(Config 4, 5, 6)</td>
        <td>Values from</td>
        <td></td>
        <td>Proxy data based on Ethereum measurements</td>
      </tr>
    </tbody>
  </table>
  <p><em>Note: Actual Watt values need to be populated from the cited sources. Table illustrates the structure and dependency on proxy data.</em></p>
  
  ## 3.3. Synthesizing the "Average" Node Profile: Weighted Power Estimation
  
  **Rationale:** To move from the power consumption of specific hardware/software combinations to an estimate for a single, typical Gnosis node, the methodology combines the idle and marginal power data with assumptions about the distribution of hardware types and client software usage across the entire network. This results in a weighted average power consumption figure, termed the "best guess" node power.
  
  **Implementation Steps** (logic primarily within *esg_country_power_consumption.sql*):
  
  * **Power per Specific Configuration:** For each possible combination of a representative hardware configuration (e.g., Config 4, 5, or 6) and a pair of *CL*/*EL* clients (e.g., *Lighthouse* + *Nethermind*), the total estimated power draw is calculated using the formula:
      $TotalPower_{hw,cl,el} = IdlePower_{hw} + MarginalPower_{cl,hw} + MarginalPower_{el,hw}$
      This calculation is performed within the *node_config_power* Common Table Expression (*CTE*) in the *dbt* model.
  * **Hardware Distribution Assumption:** An assumption is made about the proportion of Gnosis nodes running on each hardware tier. Lacking specific data for Gnosis, the initial model adopts the binomial distribution assumption used in the *CCRI* Ethereum report: 25% of nodes run on Config 4 (Mid-Tier), 50% on Config 5 (High-Tier), and 25% on Config 6 (Very High-Tier). This distribution is defined as parameters or data within the *esg_node_distribution.sql* model. It is crucial to recognize this as a placeholder assumption that should be revisited and updated if Gnosis-specific hardware survey data or other reliable indicators become available.
  * **Weighted Power per Client Combination:** For each specific client software combination (e.g., *Lighthouse* + *Nethermind*), an average power consumption is calculated. This is done by taking a weighted average of the Total Power values (from Step 1) across the different hardware configurations (Configs 4, 5, 6), using the hardware distribution percentages (from Step 2) as weights. This logic resides within the *best_guess_per_client* *CTE*.
  * **Gnosis-Specific Client Software Distribution:** This step requires estimating the market share of each consensus/execution client combination within the active Gnosis node population. This is a critical input that must be specific to the Gnosis network. Unlike the hardware and marginal power data, which are initially proxied from Ethereum studies, this distribution assumption directly reflects the Gnosis ecosystem's software preferences. Obtaining accurate data for this (e.g., through network analysis tools like client diversity explorers, node scanning, or community surveys) is challenging but vital for the estimate's accuracy. The *dbt* model architecture anticipates this input, likely defined within a *CTE* named *configuration_distribution* or similar.
  * **Overall Average Node Power ("Best Guess"):** The final step calculates the overall weighted average power consumption for a single, typical Gnosis node. This is achieved by averaging the power consumption figures for all client combinations (calculated in Step 3), weighted by their respective Gnosis network market shares (determined in Step 4). This final average represents the "best guess" power consumption per node and is calculated within the *power_best_guess* *CTE*.
  
  The process of arriving at this "Best Guess" node power inherently involves compounding uncertainties. Errors or inaccuracies introduced by the hardware profile proxies (Section 3.1) and the client marginal power proxies (Section 3.2) propagate through the calculation. The assumed hardware distribution adds another layer of potential deviation if it doesn't accurately reflect the Gnosis reality. Furthermore, the accuracy of the Gnosis-specific client distribution (Step 4) is paramount; different client software can exhibit notably different power consumptions, meaning the popularity of lightweight versus resource-intensive clients significantly influences the overall average. If, for instance, Gnosis operators favor clients known for lower resource usage compared to the assumed distribution or the Ethereum averages, the resulting power estimate could be inflated, and vice-versa. Consequently, the final "Best Guess" power figure should be interpreted as an estimate whose precision is highly dependent on the validity of all these underlying assumptions. Performing sensitivity analysis – examining how changes in the distribution assumptions impact the final power figure – is crucial for understanding the range of potential outcomes and identifying which assumptions have the most leverage on the result. The modular nature of the *dbt* implementation facilitates such analyses. Obtaining reliable data on the actual client software landscape on Gnosis stands out as a particularly high-impact area for improving the estimate's fidelity.
  
  [Back to Table of Contents](#toc)
  
  ---
  
  # 4. Scaling to Network-Level Impact: From Single Node to Global Footprint
  
  Once the average power consumption of a single node is estimated, the methodology scales this figure to the entire network to determine the total operational energy consumption and subsequent carbon footprint.
  
  ## 4.1. Quantifying the Node Population and Geographic Distribution
  
  **Rationale:** The total energy consumption of the Gnosis network is the product of the average power per node and the total number of active nodes operating globally. Furthermore, calculating the carbon footprint requires knowing where these nodes are located, as electricity grid carbon intensity varies significantly by country.
  
  **Implementation:** This step necessitates access to reliable, preferably daily, data on:
  
  * The total number of active Gnosis nodes participating in the network.
  * The geographic distribution of these nodes, ideally at the country level.
  
  **Data Source:** The current implementation assumes this data is provided by a source table named *p2p_peers_geo_daily*. The methodology relies on the accuracy and granularity of this data feed.
  
  Several challenges are associated with this data source. Firstly, peer-to-peer network crawlers, often used to generate such datasets, may detect various types of peers, including active validators, non-validating full nodes (e.g., archive nodes, RPC endpoints), or even transient light clients. The methodology for estimating single-node power (Section 3) is based on the assumption of nodes running both *CL* and *EL* clients, typically validators. It's critical to ensure that the *p2p_peers_geo_daily* count accurately reflects the number of such relevant nodes, or to adjust the methodology accordingly if the count includes other peer types with different power profiles. Secondly, *IP* address geolocation is inherently imprecise. While often accurate at the country level, errors can occur due to *VPN* usage, outdated geolocation databases, or nodes hosted behind shared *IP* addresses. Furthermore, country-level data provides no insight into sub-national variations in grid intensity. Thirdly, the definition of an "active node" and the frequency of updates in the source data impact the temporal accuracy of the estimate. Inaccuracies in identifying the correct type and number of nodes, or their true geographic locations, will directly propagate errors when scaling the single-node power estimate, affecting both the total energy consumption figure and its geographic attribution for carbon calculations. The quality and interpretation of the *p2p_peers_geo_daily* data are therefore critical dependencies.
  
  ## 4.2. Calculating Total Network Energy Consumption
  
  * **Step 1: Total Power per Country:** Using the "best guess" average node power calculated in Section 3.3 (Step 5) and the daily node count per country from the *p2p_peers_geo_daily* source, the total instantaneous power demand for Gnosis nodes within each country is calculated:
      $Power_{country}(W) = AverageNodePower(W/node) \times NodeCount_{country}(nodes)$
      This calculation represents the final output stage of the *esg_country_power_consumption.sql* *dbt* model.
  
  * **Step 2: Total Network Power:** The total instantaneous power demand of the entire Gnosis network is obtained by summing the power consumption across all countries where nodes are identified:
      $TotalNetworkPower(W) = \sum_{country} Power_{country}(W)$
  
  * **Step 3: Total Network Energy:** To estimate the total energy consumed over a day, the total network power (assumed constant throughout the day in this model) is multiplied by the number of hours in a day and converted to appropriate units (typically kilowatt-hours (*kWh*) or megawatt-hours (*MWh*)):
      $Energy_{total}(kWh/day) = TotalNetworkPower(W) \times 24(h/day) / 1000(W/kW)$
      This temporal aggregation, multiplying a daily average node count and an average (potentially static) node power by 24 hours, provides a reasonable estimate of daily energy consumption. However, it implicitly assumes that both the number of active nodes and the power consumption per node remain constant throughout the day. In reality, network load (e.g., transaction volume, consensus activity) can fluctuate, potentially affecting the marginal power consumption of nodes. Node counts might also vary slightly intra-day. This daily averaging approach effectively smooths out any potential peaks or troughs in energy demand driven by these dynamics. Achieving higher temporal resolution (e.g., hourly energy estimates) would require more granular input data (hourly node counts/locations) and potentially more sophisticated power modeling that accounts for load variations (as discussed in Section 9), significantly increasing complexity.
  
  [Back to Table of Contents](#toc)
  
  ---
  
  # 5. Translating Energy Use to Carbon Emissions: Geographic Carbon Intensity
  
  The final step in the methodology translates the estimated electricity consumption into greenhouse gas emissions, measured in tonnes of carbon dioxide equivalent (*tCO2e*).
  
  ## 5.1. Application of Geographic Carbon Intensity Factors (CIFs)
  
  **Rationale:** The environmental impact of electricity consumption is directly tied to the method of electricity generation. One kilowatt-hour of electricity generated primarily from coal has a much higher carbon footprint than one generated from renewable sources like wind or solar. Because the mix of generation sources varies significantly between countries (and even regions within countries), applying location-specific carbon intensity factors (*CIFs*) is essential for accurately estimating the carbon footprint associated with the geographically distributed Gnosis nodes.
  
  **Implementation Steps** (logic primarily within *esg_carbon_emissions.sql*):
  
  * **Energy per Country:** The daily energy consumption calculated for each country (derived from Section 4.2, Step 1) serves as the starting point:
      $Energy_{country}(kWh/day) = Power_{country}(W) \times 24(h/day) / 1000(W/kW)$
  * **Carbon Intensity Data:** Country-specific electricity grid *CIFs* are required, typically expressed in grams or kilograms of *CO2e* per kilowatt-hour (*gCO2e/kWh* or *kgCO2e/kWh*). The *dbt* model is configured to source this data from a table like *ember_electricity_data*, joined using standardized country codes (e.g., via a *country_codes* table). It is important to ensure this *CIF* data is reasonably current, as grid mixes change over time. The model incorporates fallback logic, such as using the last known value for a country (*lagInFrame*) if the current day's data is missing. For nodes whose location cannot be determined or for countries where specific *CIF* data is unavailable, a global average intensity factor (e.g., sourced from the International Energy Agency - *IEA*) should be used as a fallback estimate.
  * **Emissions Calculation per Country:** The daily carbon emissions for each country are calculated by multiplying the energy consumed in that country by its corresponding *CIF*, ensuring unit consistency (e.g., converting *kgCO2e* to tonnes):
      $Emissions_{country}(tCO2e/day) = Energy_{country}(kWh/day) \times CIF_{country}(kgCO2e/kWh) / 1000(kg/t)$
  * **Total Network Emissions:** The total estimated daily operational carbon footprint of the Gnosis Chain network is the sum of the emissions calculated for all countries:
      $TotalEmissions(tCO2e/day) = \sum_{country} Emissions_{country}(tCO2e/day)$
  
  The use of national average *CIFs* introduces a significant limitation. Within many countries, the carbon intensity of the electricity grid can vary substantially between different regions or states, depending on local generation infrastructure. Furthermore, the carbon intensity of most grids fluctuates temporally (hourly, daily, seasonally) based on the real-time mix of generation sources meeting demand (e.g., higher solar contribution during the day, potentially more fossil fuels at night). Using a single, static national average *CIF* ignores these important spatial and temporal dynamics. Additionally, this approach cannot account for proactive measures taken by individual node operators, such as sourcing electricity through specific Renewable Energy Certificates (*RECs*) or Power Purchase Agreements (*PPAs*), which allow them to claim consumption of electricity cleaner than the average grid mix. Consequently, the calculated carbon footprint represents an estimate based on grid averages. It may overestimate emissions for operators demonstrably using low-carbon power and could misrepresent the true footprint if nodes are disproportionately concentrated in regions with grid intensities significantly different from the national average. While obtaining more granular *CIF* data (sub-national, hourly) would improve accuracy, it presents substantial data acquisition challenges. The current model provides a valuable estimate but acknowledging the limitations imposed by national average *CIFs* and the exclusion of voluntary renewable energy procurement is crucial for proper interpretation.
  
  **Table 3: Sample Country Carbon Intensity Factors (Illustrative)**
  
  <table>
    <thead>
      <tr>
        <th>Country</th>
        <th>CIF Value (<em>kgCO2e/kWh</em>)</th>
        <th>Data Year/Source</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Germany</td>
        <td>Value from</td>
        <td>Year, Ember</td>
        <td>National Average</td>
      </tr>
      <tr>
        <td>United States</td>
        <td>Value from</td>
        <td>Year, Ember</td>
        <td>National Average (Significant regional variation)</td>
      </tr>
      <tr>
        <td>France</td>
        <td>Value from</td>
        <td>Year, Ember</td>
        <td>National Average (High nuclear share)</td>
      </tr>
      <tr>
        <td>China</td>
        <td>Value from</td>
        <td>Year, Ember</td>
        <td>National Average</td>
      </tr>
      <tr>
        <td>Unknown/Global</td>
        <td>Value from</td>
        <td>Year, <em>IEA</em></td>
        <td>Global Average used as fallback</td>
      </tr>
    </tbody>
  </table>
  <p><em>Note: Actual CIF values need to be populated from the cited sources. Table highlights the variability and data sourcing.</em></p>
  
  [Back to Table of Contents](#toc)
  
  ---
  
  # 6. Data Dependencies, Acquisition, and Model Implementation
  
  The reliability and accuracy of the Gnosis Chain carbon footprint estimates produced by this methodology are fundamentally dependent on the quality, granularity, and timeliness of several critical data inputs.
  
  ## 6.1. Critical Data Inputs and Sourcing Challenges
  
  A summary of the essential data requirements and associated challenges includes:
  
  * **Hardware Specifications & Idle Power:** Requires detailed specifications (*CPU*, *RAM*, Storage) and measured idle power consumption (Watts) for representative hardware configurations.
      * **Source:** Initially sourced from *CCRI*'s Ethereum report measurements for Configs 4, 5, 6.
      * **Challenge:** Validating the direct applicability of these Ethereum-derived profiles to the actual hardware used within the Gnosis ecosystem remains a key uncertainty.
  * **Client Marginal Power:** Needs marginal power consumption data (Watts) for each relevant consensus and execution client, ideally measured on each representative hardware configuration.
      * **Source:** Initially sourced from *CCRI*'s Ethereum client measurements.
      * **Challenge:** Assumes power draw is sufficiently similar between Ethereum and Gnosis clients and that the measurement load conditions are representative of Gnosis network activity. Lack of Gnosis-specific empirical measurements is a significant limitation.
  * **Gnosis Node Count & Location:** Requires a reliable daily feed of active node counts, accurately geolocated to the country level.
      * **Source:** Assumed to be provided by the *p2p_peers_geo_daily* table.
      * **Challenge:** Potential inaccuracies in *IP* geolocation, difficulties in distinguishing relevant node types (validators vs. other peers), ensuring completeness of network coverage, and defining "active" nodes consistently.
  * **Gnosis Client Distribution:** Needs data on the market share of each specific consensus/execution client combination operating on the Gnosis network.
      * **Source:** This is modeled as an assumption within the *dbt* logic (e.g., *configuration_distribution* *CTE*), requiring Gnosis-specific input.
      * **Challenge:** This data is often difficult to obtain accurately and requires ongoing, active network analysis (e.g., specific crawlers, surveys). This input is identified as a major driver of sensitivity in the final estimate.
  * **Country Carbon Intensity Factors (*CIFs*):** Requires up-to-date *CIF* values (e.g., *kgCO2e/kWh*) for electricity generation in all countries where nodes operate.
      * **Source:** Model uses *ember_electricity_data*, with fallbacks potentially using *IEA* data.
      * **Challenge:** Ensuring data timeliness, addressing coverage gaps for some countries, and the inherent limitation of using national averages which mask regional and temporal variations.
  
  ## 6.2. Overview of dbt Model Operationalization
  
  The methodology described is implemented using a structured set of *dbt* models, which handle data transformation, calculation logic, and dependencies.
  
  * **Input/Parameter Models:** Models like *esg_hardware_config*, *esg_idle_electric_power*, *esg_consensus_power*, *esg_execution_power*, and *esg_node_distribution* serve to store or define the foundational data and assumptions. These include the hardware specifications, idle/marginal power values sourced from *CCRI*, and the initial hardware distribution assumption. Encapsulating these inputs in distinct models makes them modular and easier to update as new data becomes available.
  * **Core Calculation Models:**
      * *esg_country_power_consumption*: This model integrates the hardware and software power profiles, applies the hardware and client distribution assumptions, calculates the "best guess" average node power, retrieves node count and location data (from *p2p_peers_geo_daily*), and computes the total power consumption per country.
      * *esg_carbon_emissions*: This model takes the power consumption per country output from the previous model, converts it to energy, joins it with the country-specific *CIF* data (from *ember_electricity_data* and *country_codes*), applies the appropriate *CIF*, and calculates the *CO2e* emissions per country and the network total.
  * **Reporting Models:** Downstream models, such as *esg_power_consumption_top10*, likely aggregate or summarize the results from the core calculation models for specific reporting needs, like dashboard visualizations.
  
  The implementation using *dbt* offers significant advantages. It provides a transparent, version-controlled, and testable framework for the complex calculations involved. The modular design allows different components of the methodology (e.g., hardware assumptions, power data, *CIFs*) to be managed and updated independently. Dependencies between calculation steps are explicitly defined, enhancing traceability. This structure greatly facilitates reproducibility and maintainability, aligning well with the guiding principles of Consistency and Continuity. Furthermore, it simplifies the process of conducting sensitivity analyses, as key parameters (like distribution assumptions stored in *esg_node_distribution* or the *configuration_distribution* *CTE*) can be modified in a single location, allowing the impact on the final results to be recalculated systematically.
  
  [Back to Table of Contents](#toc)
  
  ---
  
  # 7. Underlying Assumptions and Model Boundaries
  
  A clear understanding of the assumptions underpinning the methodology and the defined scope of the analysis is essential for correctly interpreting the resulting estimates.
  
  ## 7.1. Discussion of Key Methodological Assumptions
  
  The estimation process relies on several core assumptions, many stemming from the initial reliance on proxy data:
  
  * **Hardware Equivalence & Distribution:** The methodology assumes that the hardware configurations (Configs 4, 5, 6) identified by *CCRI* for Ethereum *PoS* are representative of the hardware used by Gnosis node operators. It further assumes the binomial distribution (25% Mid, 50% High, 25% Very High) accurately reflects the prevalence of these tiers within the Gnosis network. The validity of these assumptions directly impacts the calculated idle and marginal power baselines.
  * **Power Profile Portability:** It is assumed that the idle and marginal power consumption figures measured by *CCRI* for specific Ethereum clients running on specific hardware are reasonable proxies for the power consumption of Gnosis-compatible clients operating under typical Gnosis network load conditions. This overlooks potential differences in client software efficiency and network-specific load patterns.
  * **Client Distribution Accuracy:** The calculation of the "average" node power relies heavily on the assumed market share distribution of different consensus/execution client combinations specifically on the Gnosis network. The accuracy of this Gnosis-specific input, which is challenging to obtain, is a critical determinant of the final power estimate.
  * **Node Location Accuracy:** The methodology assumes that the data source (*p2p_peers_geo_daily*) provides sufficiently accurate counts of relevant Gnosis nodes (i.e., those running *CL*/*EL* clients) and correctly identifies their geographic location at the country level. Inaccuracies here directly affect the scaling of the single-node estimate and the geographic attribution of emissions.
  * **Average Grid Intensity:** The use of national average *CIFs* is a necessary simplification but ignores potentially significant sub-national variations in grid carbon intensity, as well as temporal fluctuations. It also does not account for individual node operators potentially using certified renewable energy sources (*RECs*/*PPAs*).
  * **Static Power Profiles:** The calculation of daily energy by multiplying an average power figure by 24 hours implicitly assumes a relatively constant power draw per node throughout the day, smoothing over potential variations due to network load fluctuations.
  
  ## 7.2. Defined Scope and Limitations
  
  It is crucial to clearly define what this methodology includes and excludes:
  
  **Scope:** The methodology estimates the operational electricity consumption and the associated Scope 2 (indirect emissions from purchased electricity) and Scope 3 (other indirect emissions, including grid losses related to electricity supply) carbon emissions arising from the operation of Gnosis Chain nodes (running consensus and execution clients).
  
  **Exclusions:** The analysis explicitly does not cover:
  
  * Embodied emissions: Greenhouse gas emissions associated with the manufacturing, transportation, and disposal of the hardware used by node operators.
  * Energy consumption of end-users interacting with the Gnosis Chain (e.g., running wallets, using dApps), unless their activity directly influences node load in a way captured by the marginal power measurements.
  * Energy consumption specific to Layer 2 scaling solutions or decentralized applications (dApps) built on Gnosis, beyond their impact on the Layer 1 node operations being measured.
  * Energy consumption related to ancillary activities such as core protocol development, community management, marketing, or foundation operations.
  
  **Limitations:** Key limitations impacting the precision and comprehensiveness of the estimates include:
  
  * **Data Availability/Quality:** Persistent challenges in obtaining accurate, timely, and Gnosis-specific data, particularly regarding the distribution of hardware and client software, and precise node locations.
  * **Proxy Data Reliance:** The uncertainty introduced by the necessary initial reliance on power consumption figures derived from Ethereum studies.
  * **Granularity:** The use of national average *CIFs* lacks spatial and temporal granularity. Similarly, the power modeling assumes average behavior rather than dynamic, load-dependent consumption.
  * **Cloud Hosting:** The methodology, based on *CCRI* measurements of self-hosted hardware, does not explicitly model the energy characteristics of nodes potentially hosted in large-scale data centers. While data centers can achieve high energy efficiency through optimized cooling and infrastructure (low Power Usage Effectiveness - *PUE*), the attributable energy consumption per virtual machine or container running a node might differ from direct hardware measurements. Accounting for this requires additional assumptions about hosting prevalence and provider-specific efficiencies.
  
  
  **Table 4: Summary of Key Assumptions and Limitations**
  
  <table>
    <thead>
      <tr>
        <th>Assumption/Limitation</th>
        <th>Description/Impact</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Hardware Equivalence & Dist.</td>
        <td>Assumes ETH hardware profiles & distribution apply to Gnosis. Incorrect assumptions bias baseline power estimates.</td>
      </tr>
      <tr>
        <td>Power Profile Portability</td>
        <td>Assumes ETH client power data is a valid proxy for Gnosis clients under Gnosis load. Ignores potential differences in software efficiency and network activity.</td>
      </tr>
      <tr>
        <td>Client Distribution Accuracy</td>
        <td>Relies on assumed Gnosis-specific client market shares. High sensitivity; inaccurate distribution significantly impacts average node power estimate. Data hard to obtain.</td>
      </tr>
      <tr>
        <td>Node Location Accuracy</td>
        <td>Assumes <em>p2p_peers_geo_daily</em> provides accurate counts and country-level locations of relevant nodes. Errors affect total energy estimate and geographic carbon attribution.</td>
      </tr>
      <tr>
        <td>Average Grid Intensity</td>
        <td>Uses national average <em>CIFs</em>. Ignores sub-national/temporal variations and use of <em>RECs</em>/<em>PPAs</em>, limiting carbon footprint accuracy.</td>
      </tr>
      <tr>
        <td>Static Power Profiles</td>
        <td>Assumes constant average power draw over 24h. Smooths out real-world fluctuations due to varying network load.</td>
      </tr>
      <tr>
        <td>Scope Exclusion: Embodied Carbon</td>
        <td>Focuses only on operational energy; excludes significant lifecycle emissions from hardware manufacturing/disposal.</td>
      </tr>
      <tr>
        <td>Limitation: Data Availability</td>
        <td>Difficulty obtaining accurate, Gnosis-specific data for hardware/client distributions and node locations is a primary constraint.</td>
      </tr>
      <tr>
        <td>Limitation: Proxy Data Reliance</td>
        <td>Use of ETH data introduces inherent uncertainty until Gnosis-specific measurements are available.</td>
      </tr>
      <tr>
        <td>Limitation: Granularity</td>
        <td>Lack of spatial/temporal detail in <em>CIFs</em> and power modeling limits precision.</td>
      </tr>
      <tr>
        <td>Limitation: Cloud Hosting</td>
        <td>Does not explicitly model potentially different energy efficiencies (e.g., <em>PUE</em> impact) for nodes hosted in data centers versus self-hosted setups measured by <em>CCRI</em>.</td>
      </tr>
    </tbody>
  </table>
  
  [Back to Table of Contents](#toc)
  
  ---
  
  # 8. Considerations for Emission Allocation (Brief Overview)
  
  **Rationale:** While the primary output of this methodology is the total operational carbon footprint of the Gnosis Chain node network, certain applications, particularly in detailed *ESG* reporting or economic analysis, may require allocating these emissions to specific network activities or stakeholders. The *CCRI* has discussed the complexities of emission allocation in blockchain networks.
  
  ***CCRI* Allocation Concepts:** Allocating emissions in *PoS* networks presents unique challenges compared to *PoW*. *CCRI* suggests a hybrid approach may be most appropriate for *PoS* systems, distinguishing between the energy required to maintain the network's baseline operation and the energy consumed due to specific activities like transaction processing.
  
  ***PoS* Hybrid Approach:** This conceptual model involves:
  
  * **Base Load Emissions Allocation:** A significant portion of a node's energy consumption arises from the hardware's idle power and the basic overhead of running the client software, even when processing few or no transactions. This "base load" energy maintains network security, availability, and state consensus. Since these functions primarily benefit those who hold or stake assets on the chain (as their value depends on network integrity), these base load emissions could arguably be allocated proportionally based on stake or value held (e.g., based on staked *GNO* distribution).
  * **Marginal Transaction Emissions Allocation:** The additional energy consumed by nodes specifically due to the processing of transactions (i.e., the marginal power draw above the base load, driven by execution and consensus activity related to transactions) could be allocated based on metrics related to transaction activity or complexity. Potential allocation keys include the amount of computational effort (*gas*) consumed by transactions or simply the number of transactions processed, potentially attributed to the transaction senders or contract interactors.
  
  **Implementation Note:** It is important to emphasize that implementing such an allocation scheme is beyond the scope of the current *dbt* models described in this report. It would require significant additional data inputs, such as daily snapshots of *GNO* staking distributions across addresses and detailed data on *gas* consumption per transaction or per address. Furthermore, developing the complex allocation logic within the *dbt* framework would represent a substantial extension of the current work. This section serves primarily to introduce the concept and acknowledge it as a potential area for future development if required by specific reporting needs.
  
  [Back to Table of Contents](#toc)
  
  ---
  
  # 9. Pathways for Enhancement and Future Research
  
  While the described methodology provides a robust and transparent framework based on current best practices and available data, several pathways exist for enhancing its accuracy, granularity, and overall robustness. These improvements primarily focus on replacing proxy data with Gnosis-specific empirical measurements and refining the modeling assumptions.
  
  * **Gnosis-Specific Empirical Data:**
      * **Power Measurements:** The highest priority should be conducting direct power measurements. This involves selecting representative hardware configurations (potentially informed by surveys of Gnosis node operators), installing verified Gnosis-compatible consensus and execution clients, subjecting them to realistic Gnosis network load conditions (e.g., syncing, validating, processing typical transaction volumes), and measuring both idle and marginal power consumption. This would directly address the uncertainties introduced by relying on Ethereum-based hardware and power profiles.
      * **Hardware/Client Distribution Data:** Developing reliable methods to determine the actual distribution of hardware types and, critically, the market share of different *CL*/*EL* client combinations within the active Gnosis node population is essential. Techniques could include designing enhanced network crawlers capable of fingerprinting client types and potentially estimating hardware characteristics, conducting anonymous surveys among the Gnosis node operator community, or analyzing publicly available data from staking pools or node explorers. Accurate distribution data is key to correctly weighting the power profiles (addressing sensitivity highlighted in Section 3.3).
  * **Refining Network Representation:**
      * **Node Identification/Geolocation:** Investigate the methodology behind the *p2p_peers_geo_daily* data source to better understand its accuracy and limitations regarding node type identification (validators vs. others) and geolocation precision. Explore alternative or supplementary data sources or techniques if significant inaccuracies are suspected (addressing concerns from Section 4.1).
      * **Cloud Efficiency Modeling:** If analysis suggests a significant portion of Gnosis nodes are hosted in major cloud data centers, develop methods to incorporate this. This could involve estimating the proportion of cloud-hosted nodes and applying adjustments based on average *PUE* (Power Usage Effectiveness) figures reported by major cloud providers, acknowledging the assumptions involved in attributing data center overheads to individual nodes.
  * **Improving Model Dynamics:**
      * **Load-Dependent Power:** Explore enhancements to the power model where the marginal power consumption component is not static but varies dynamically based on real-time network activity metrics. For example, marginal power could be modeled as a function of transactions per second, average block *gas* usage, or other relevant load indicators. This would provide a more nuanced picture of energy consumption than the current daily average approach (addressing limitations noted in Section 4.2).
      * ***CIF* Granularity:** Commit to regularly updating the country-specific *CIF* data to reflect changes in national grid mixes. Investigate the feasibility and availability of using more granular *CIF* data, such as regional or state-level data for countries with significant internal variations, or potentially even time-resolved (e.g., hourly) *CIF* data where accessible, to better capture the actual carbon intensity of the electricity consumed by nodes (addressing limitations from Section 5.1).
  * **Expanding Scope:**
      * **Allocation Implementation:** If detailed emission allocation becomes a requirement, undertake the necessary steps to scope the required data inputs (staking distributions, transaction *gas* data) and develop the *dbt* logic to implement a chosen allocation methodology (as discussed conceptually in Section 8).
      * **Lifecycle Assessment (*LCA*):** For a truly comprehensive environmental assessment, acknowledge the need to eventually consider embodied emissions through a full Lifecycle Assessment (*LCA*) approach, covering hardware manufacturing, transport, and disposal. Recognize that this represents a significantly more complex and data-intensive undertaking than the current operational scope.
  
  [Back to Table of Contents](#toc)
  
  ---
  
  # 10. Concluding Remarks
  
  This report has detailed a structured methodology for estimating the operational electricity consumption and associated carbon footprint of the Gnosis Chain's node infrastructure. Grounded in the bottom-up framework developed by the Crypto Carbon Ratings Institute (*CCRI*) for *PoS* blockchains and operationalized through a series of *dbt* models, this approach provides a transparent, replicable, and adaptable system for environmental accounting.
  
  The methodology serves as a valuable tool for the Gnosis Chain ecosystem, enabling ongoing monitoring of its operational energy use and carbon emissions, supporting internal sustainability assessments, and providing data for external *ESG* reporting and communication. Its adherence to principles of consistency and continuity ensures it can evolve alongside the network.
  
  However, the accuracy of the current estimates is subject to limitations inherent in the initial reliance on proxy data derived from Ethereum studies for hardware and software power profiles, and the significant sensitivity to assumptions regarding Gnosis-specific hardware and client software distributions. Furthermore, the use of national average carbon intensity factors (*CIFs*) and the exclusion of embodied emissions define important boundaries for interpretation.
  
  Therefore, while this methodology establishes a strong foundation, continuous improvement is essential. Prioritizing the acquisition of Gnosis-specific empirical data – particularly through direct power measurements of Gnosis clients under realistic loads and robust methods for determining hardware and client distributions – will be crucial for enhancing the accuracy and credibility of the footprint estimates over time. Such ongoing refinement will ensure that Gnosis Chain can confidently track and report on its environmental performance as the network and the broader blockchain landscape continue to evolve.
  
  [Back to Table of Contents](#toc)
  `
  };
  
  export default metric;
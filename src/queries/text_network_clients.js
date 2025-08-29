const metric = {
  id: 'text_network_clients',
  name: 'Why Client Diversity Matters',
  description: '',
  chartType: 'text',
  content: `


Client diversity is critical to the health, security, and resilience of the Gnosis network. **Why It Matters:**

- **Resilience:** Multiple independent codebases prevent a bug in one client from cascading across the network.  
- **Security:** Reduces the likelihood of a coordinated attack exploiting a widely used implementation.  
- **Decentralization:** Prevents power from concentrating in one client’s development team.  
- **Innovation:** Diversity fosters competition, optimization, and long-term improvements.

> “<33% market share is the goal for all clients.” 

> “If a client with 66%+ of marketshare has a bug and forks to its own chain, it'll be capable of finalizing. Once the fork finalizes, the validators cannot return to the real chain without being slashed.” ([clientdiversity.org](https://clientdiversity.org/?utm_source=chatgpt.com))  

### Recommendations for Node Operators
- **Support Minority Clients:** If your setup allows, consider switching to a less dominant client.  
- **Run Both Layers Diversely:** Remember that both **EL** and **CL** clients need diversity. 
- **Stay Updated:** Ensure you run the latest stable versions.  
- **Contribute Feedback:** Report bugs and support client teams.

> **Bottom Line:** Balanced client usage isn’t optional—it’s essential, ensuring consensus stability, and safeguards against catastrophic bugs.
  `
};

export default metric;
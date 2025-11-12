const metric = {
  id: 'text_consensus_validators_status',
  name: 'Validator  Lifecycle',
  description: 'A reference table of validator lifecycle states in the Beacon Chain',
  chartType: 'text',
  content: `

| Status | Phase | Description |
|--------|-------|-------------|
| **pending_initialized** | *Pending* | Deposit received, awaiting sufficient balance for activation |
| **pending_queued** | *Pending* | Queued for activation (subject to churn limit) |
| **active_ongoing** | *Active* | Actively participating in consensus duties |
| **active_exiting** | *Active* | Voluntary exit requested, but still active |
| **active_slashed** | *Active* | Slashed for protocol violation, awaiting forced exit |
| **exited_unslashed** | *Exited* | Successfully exited without penalties |
| **exited_slashed** | *Exited* | Forcibly exited due to slashing |
| **withdrawal_possible** | *Withdrawal* | Eligible to withdraw staked funds |
| **withdrawal_done** | *Withdrawal* | Funds successfully withdrawn from contract |

### Key Notes
- **Churn Limit**: Maximum number of validators that can be activated per epoch
- **Slashing**: Penalty for malicious behavior (double voting, surround voting, etc.)
- **Exit Queue**: Voluntary exits are processed in order, subject to exit churn limit
- **Withdrawal Delay**: time between exit and withdrawal eligibility

`
};

export default metric;
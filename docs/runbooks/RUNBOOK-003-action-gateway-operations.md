# RUNBOOK-003: Action Gateway Operations

## Checking Pending Tier 3 Quarantine Queue
Tier 3 actions (catastrophic blast radius) are automatically quarantined.
- Navigate to `https://admin.vaulthost.com/ai-governance/quarantine`.
- The list displays all pending `ActionIntent` objects waiting for approval.

## Approving/Rejecting Quorum Holds
- **Requirement:** Approving a Tier 3 action requires a dual-staff quorum (two authorized senior staff members).
- **Process:**
  1. Staff Member A logs in, reviews the intent, and signs the approval with their hardware key/TOTP.
  2. Staff Member B logs in, reviews the intent, and signs the approval.
  3. Once both signatures are recorded, the Action Gateway executes the intent.
- **Rejection:** A single staff member can reject and cancel the quarantined action.

## Auditing AI Agent Actions
- Go to `https://admin.vaulthost.com/ai-governance/audit`.
- All actions (Tier 0 through Tier 3) are logged here.
- You can filter by Agent ID, Risk Tier, Date, and Endpoint.

## Emergency Override Procedures
In the event the Action Gateway is malfunctioning and blocking critical infrastructure operations:
- **Procedure:** The gateway can be temporarily put into "Bypass Mode".
- **Requirement:** Requires 2 senior staff members using the Emergency Breakglass CLI tool.
- **Warning:** This exposes the Infrastructure Plane directly. Use only as a last resort.

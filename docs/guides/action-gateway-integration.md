# Action Gateway Integration

The VaultHost Action Gateway is the protective layer between AI Agents and the Infrastructure Plane. All actions performed by AI agents must pass through the gateway.

## Integration Steps

1. **Emit ActionIntents:** Agents must construct an `ActionIntent` object instead of calling infrastructure APIs directly.
2. **Provide Idempotency Keys:** All mutating intents must include an idempotency key.

## Code Example

```typescript
import { ActionIntent } from '@/lib/action-gateway/types';
import { submitIntent } from '@/lib/action-gateway/gateway';
import { randomUUID } from 'crypto';

const intent: ActionIntent = {
  id: randomUUID(),
  action: 'workers.deploy',
  payload: {
    name: 'agent-managed-worker',
    script: '...'
  },
  idempotencyKey: 'idempotency_key_123',
  agentId: 'agent_007'
};

const result = await submitIntent(intent);
if (result.status === 'quarantined') {
  console.log('Action requires Tier 3 quorum approval.');
}
```

## Risk Tier Reference

| Tier | Description | Requirement | Example Actions |
|---|---|---|---|
| Tier 0 | Read-only/cache | Auto-execute | `dns.list`, `workers.get` |
| Tier 1 | Reversible writes | Logged + snapshot | `storage.put`, `kv.set` |
| Tier 2 | Irreversible writes | TOTP 2FA required | `workers.deploy`, `dns.create` |
| Tier 3 | Catastrophic blast radius | Dual-staff quorum | `project.delete`, `db.drop` |

## Idempotency Key Format
Use UUIDv4 or a deterministic hash of the intended action and its timestamp (within a specific window).

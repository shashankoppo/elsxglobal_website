# Developer Quickstart

Get up and running with VaultHost in 10 minutes.

## 1. Install `@vaulthost/sdk`

```bash
npm install @vaulthost/sdk
```

## 2. Initialize the client

```typescript
import { VaultHost } from '@vaulthost/sdk';

const vh = new VaultHost({
  apiKey: process.env.VAULTHOST_API_KEY,
});
```

## 3. Deploy a Worker

```typescript
await vh.workers.deploy({
  name: 'hello-world',
  script: `export default { fetch() { return new Response('Hello World') } }`
});
```

## 4. Upload to R2 Storage

```typescript
await vh.storage.put('my-bucket', 'hello.txt', 'Hello Storage!');
```

## 5. Query VaultD1

```typescript
const result = await vh.database.query('SELECT * FROM users');
console.log(result);
```

## 6. Connect an AI model through VaultAI Gateway

```typescript
const response = await vh.aiGateway.chat({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello VaultHost!' }]
});
```

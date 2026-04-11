# Kobana MCP Unified Server

Single HTTP server that exposes every Kobana MCP namespace under one host. Each
namespace gets its own MCP endpoint, all sharing one OAuth 2.1 authorization
flow against the Kobana account.

This package is the **standalone Node implementation** — useful for local
development, self-hosting, and integration tests. The deployed Vercel function
lives at `/api/index.ts` in the repository root (see `vercel.json`); both speak
the exact same wire protocol and OAuth flow.

The server uses the **Streamable HTTP transport** (MCP spec 2025-03-26+) in
**stateless mode**, so it works under serverless runtimes without sticky
sessions.

## Endpoints

### MCP namespaces

| Namespace | Endpoint | Tools | Description |
|-----------|----------|-------|-------------|
| Admin     | `/admin/mcp`     | Certificates, connections, subaccounts, users | Account administration |
| Charge    | `/charge/mcp`    | Pix charges, accounts, automatic Pix, payments | Receivables |
| Data      | `/data/mcp`      | Bank billet queries | Lookups |
| EDI       | `/edi/mcp`       | EDI boxes | File exchange |
| Financial | `/financial/mcp` | Accounts, balances, statements, transactions | Reconciliation |
| Payment   | `/payment/mcp`   | Bank billets, Pix, DARFs, taxes, utilities, batches | Payables |
| Transfer  | `/transfer/mcp`  | Pix, TED, internal transfers, batches | Money movement |

Each `/{namespace}/mcp` endpoint accepts `POST` (JSON-RPC requests), `GET`
(server-initiated SSE notifications), and `DELETE` (session termination).

### Discovery & OAuth

| Endpoint | Method | Spec | Purpose |
|---|---|---|---|
| `/` | GET | — | Server info, namespaces, tool counts |
| `/health` | GET | — | Liveness probe |
| `/{namespace}` | GET | — | Per-namespace info and tool listing |
| `/.well-known/oauth-authorization-server` | GET | RFC 8414 | Authorization Server metadata |
| `/.well-known/oauth-protected-resource[/{ns}/mcp]` | GET | RFC 9728 | Protected Resource metadata (per-namespace) |
| `/register` | POST | RFC 7591 | Dynamic Client Registration |
| `/authorize` | GET | OAuth 2.1 | Authorization endpoint (PKCE-secured) |
| `/token` | POST | OAuth 2.1 | Token exchange |
| `/oauth/callback` | GET | — | Internal Kobana OAuth callback |

## Per-namespace OAuth scopes

When a client authorizes through `/authorize`, the server detects which
namespace it is connecting to (via the RFC 8707 `resource` parameter or the
client-supplied `scope`) and forwards **only** that namespace's scopes to the
upstream Kobana OAuth server. Tokens issued by Kobana are therefore minimally
scoped per connector.

| Namespace | Kobana scopes requested |
|---|---|
| `admin`     | `login` `admin.subaccounts` `admin.users` `integration.certificates` `integration.connections` |
| `charge`    | `login` `charge.pix_accounts` `charge.pix` `charge.automatic_pix.pix` `charge.automatic_pix.recurrences` `charge.automatic_pix.requests` `charge.payments` |
| `data`      | `login` `data.bank_billet_queries` |
| `edi`       | `login` `integration.edi_boxes` |
| `financial` | `login` `financial.providers` `financial.accounts` `financial.balances` `financial.statement_transactions` |
| `payment`   | `login` `payment.payments` `payment.bank_billets` `payment.pix` `payment.darfs` `payment.taxes` `payment.utilities` `payment.batches` |
| `transfer`  | `login` `transfer.transfers` `transfer.pix` `transfer.ted` `transfer.internal` `transfer.batches` |

The namespace mapping is hard-coded in `src/oauth/scopes.ts`. To grant or
restrict scopes for a connector, edit that file.

## Configuration

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `KOBANA_API_BASE_URL`        | No  | `https://api.kobana.com.br` | Kobana REST API base URL (use `https://api-sandbox.kobana.com.br` for sandbox) |
| `KOBANA_APP_BASE_URL`        | No  | `https://app.kobana.com.br` | Kobana web app base URL — used for the user-facing OAuth authorize step |
| `KOBANA_ACCESS_TOKEN`        | No\* | — | Personal access token; used as the request fallback when OAuth is off and no `Authorization` header is sent |
| `KOBANA_OAUTH_CLIENT_ID`     | OAuth | — | OAuth client id from the Kobana app you registered |
| `KOBANA_OAUTH_CLIENT_SECRET` | OAuth | — | OAuth client secret |
| `MCP_SERVER_URL`             | OAuth | `https://mcp.kobana.com.br` | Public URL of THIS MCP server — used to build redirect URIs and discovery metadata |
| `PORT`                       | No  | `3000` | TCP port to bind |
| `HOST`                       | No  | `0.0.0.0` | Bind address |

\* Token can also be passed per-request via `Authorization: Bearer <token>`.

The OAuth flow is enabled automatically when both `KOBANA_OAUTH_CLIENT_ID` and
`KOBANA_OAUTH_CLIENT_SECRET` are set.

## Local development

```bash
# Install deps (also installs all sibling MCP packages via the workspace)
npm install

# Build (compiles all sibling packages into ../mcp-*/dist and then this server)
npm run build

# Copy the env template and fill in your values
cp .env.example .env
$EDITOR .env

# Start — dotenv loads .env automatically
npm start

# Or override on the command line
PORT=3333 npm start
```

The server prints all available namespaces and OAuth endpoints on startup.

### Tunneling for OAuth testing

The OAuth callback URL must be reachable by Kobana, so for local OAuth testing
you need a public URL. Use a tunnel:

```bash
# In another terminal
cloudflared tunnel --url http://localhost:3000
# or
ngrok http 3000
```

Then update `.env`:

```bash
MCP_SERVER_URL=https://your-tunnel-host.example.com
```

…and add `https://your-tunnel-host.example.com/oauth/callback` to your Kobana
OAuth application's redirect URIs.

## Deployment

### Vercel

The repository root has `vercel.json` and `api/index.ts` ready to deploy. From
the repo root:

```bash
vercel              # preview
vercel --prod       # production
```

Set the env vars in the Vercel dashboard (or `vercel env add`):

- `KOBANA_OAUTH_CLIENT_ID`
- `KOBANA_OAUTH_CLIENT_SECRET`
- `REDIS_URL` *(only the deployed `api/index.ts` uses Redis for OAuth state)*
- `MCP_SERVER_URL`
- `KOBANA_API_BASE_URL` (optional, sandbox)
- `KOBANA_APP_BASE_URL` (optional, sandbox)

### Standalone Node (this package)

```bash
npm run build
KOBANA_OAUTH_CLIENT_ID=... \
KOBANA_OAUTH_CLIENT_SECRET=... \
MCP_SERVER_URL=https://mcp.example.com \
node dist/server.js
```

> The standalone server stores OAuth pending state, codes, and sessions
> **in-memory**. That's fine for single-process deployments and local
> development. For multi-instance hosting, use the Vercel `api/index.ts` entry
> point (Redis-backed) or wrap this server with a shared store of your own.

## Connecting from Claude Desktop

### Custom Connector (recommended)

When OAuth is configured on the server, each namespace can be added as a
Custom Connector with **no manual credentials**:

1. Settings → **Connectors → Add Custom Connector**
2. Paste the namespace endpoint, e.g.
   `https://mcp.kobana.com.br/financial/mcp`
3. Leave the Advanced settings empty — Dynamic Client Registration takes care
   of identity automatically
4. Click **Add**; complete the Kobana login + consent in the browser

Repeat for each namespace you want to expose. Each connector gets its own
narrowly-scoped Kobana token.

### `mcp-remote` bridge (token-based, no OAuth)

If you have a personal access token and don't want to set up OAuth, you can
use the [`mcp-remote`](https://github.com/anthropics/mcp-remote) shim from a
local stdio entry in `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "kobana-charge": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.kobana.com.br/charge/mcp",
        "--header",
        "Authorization: Bearer your_access_token"
      ]
    }
  }
}
```

#### Sandbox

Point your token at the sandbox API by either deploying with
`KOBANA_API_BASE_URL=https://api-sandbox.kobana.com.br` set, or by sending the
URL on each request:

```json
{
  "mcpServers": {
    "kobana-charge-sandbox": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.kobana.com.br/charge/mcp",
        "--header",
        "Authorization: Bearer your_sandbox_token",
        "--header",
        "X-Kobana-Api-Url: https://api-sandbox.kobana.com.br"
      ]
    }
  }
}
```

### Direct HTTP

```bash
# Server info
curl https://mcp.kobana.com.br/

# Namespace info
curl https://mcp.kobana.com.br/charge

# Initialize an MCP session (Streamable HTTP, JSON response mode)
curl -X POST https://mcp.kobana.com.br/charge/mcp \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2025-03-26",
      "capabilities": {},
      "clientInfo": { "name": "curl", "version": "1.0.0" }
    }
  }'
```

A `401` response on any `/{namespace}/mcp` endpoint carries:

```
WWW-Authenticate: Bearer realm="...", resource="...", resource_metadata="..."
```

Compliant MCP clients use the `resource_metadata` URL to start the OAuth
discovery flow automatically.

## Architecture

```
vercel-mcp/
├── src/
│   ├── server.ts          # HTTP server, routing, MCP transport wiring
│   ├── config.ts          # Per-request Kobana API config resolution
│   ├── namespaces.ts      # Namespace registry (path → name)
│   └── oauth/
│       ├── config.ts      # OAuth env config + base URL helpers
│       ├── scopes.ts      # Per-namespace scope mapping (edit to grant/restrict)
│       ├── metadata.ts    # RFC 8414 / RFC 9728 metadata handlers
│       ├── authorize.ts   # /authorize → Kobana redirect with PKCE
│       ├── callback.ts    # /oauth/callback (Kobana → MCP code exchange)
│       ├── token.ts       # /token (PKCE-validated code → MCP access token)
│       ├── register.ts    # /register (RFC 7591 Dynamic Client Registration)
│       ├── pkce.ts        # PKCE helpers
│       ├── sessions.ts    # In-memory pending auths, codes, sessions
│       └── index.ts       # Re-exports
├── .env.example
├── package.json
└── tsconfig.json
```

The server pulls tools and API clients from the sibling workspaces:

```
../mcp-admin/dist/        ../mcp-edi/dist/         ../mcp-payment/dist/
../mcp-charge/dist/       ../mcp-financial/dist/   ../mcp-transfer/dist/
../mcp-data/dist/
```

`npm run build` builds all of them in dependency order before compiling this
package.

## License

MIT

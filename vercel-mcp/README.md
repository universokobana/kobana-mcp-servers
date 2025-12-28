# Kobana MCP Unified Server (Vercel Deployment)

Unified MCP server for deploying all Kobana MCP namespaces on a single Vercel project.

Uses the **Streamable HTTP transport** which is stateless and serverless-compatible.

## Endpoints

All namespaces are available under a single domain:

| Namespace | MCP Endpoint | Description |
|-----------|--------------|-------------|
| Admin | `/admin/mcp` | Certificates, connections, users |
| Charge | `/charge/mcp` | Pix charges, accounts |
| Data | `/data/mcp` | Bank billet queries |
| EDI | `/edi/mcp` | EDI boxes |
| Financial | `/financial/mcp` | Accounts, balances |
| Payment | `/payment/mcp` | Bank billets, taxes |
| Transfer | `/transfer/mcp` | Pix, TED, internal |

### Global Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Server info with all namespaces and tools |
| `/health` | GET | Health check |
| `/{namespace}` | GET | Namespace info and available tools |

## Deployment

### Deploy to Vercel

1. Fork/clone this repository
2. Connect to Vercel
3. Set environment variables:
   - `KOBANA_ACCESS_TOKEN` (required if not using Authorization header)
   - `KOBANA_API_URL` (optional, defaults to production)
4. Deploy

### Vercel CLI

```bash
# From repository root
vercel

# Production deployment
vercel --prod
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `KOBANA_ACCESS_TOKEN` | No* | - | Default access token |
| `KOBANA_API_URL` | No | `https://api.kobana.com.br` | API base URL |

\* Token can also be passed via `Authorization: Bearer <token>` header

## Authentication

Pass the access token in one of two ways:

### 1. Environment Variable (server-wide default)

Set `KOBANA_ACCESS_TOKEN` in Vercel environment variables.

### 2. Authorization Header (per-request)

```
Authorization: Bearer your_access_token
X-Kobana-Api-Url: https://api-sandbox.kobana.com.br  (optional)
```

## Local Development

```bash
# Install dependencies
npm install

# Build (also builds all MCP packages)
npm run build

# Start server
KOBANA_ACCESS_TOKEN=your_token npm start

# Or with custom port
PORT=3333 KOBANA_ACCESS_TOKEN=your_token npm start
```

## Usage with MCP Clients

### Claude Desktop Configuration

For a Vercel deployment at `mcp.kobana.com.br`:

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
    },
    "kobana-transfer": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.kobana.com.br/transfer/mcp",
        "--header",
        "Authorization: Bearer your_access_token"
      ]
    }
  }
}
```

#### Using Sandbox Environment

To use the sandbox API, add the `X-Kobana-Api-Url` header:

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
        "Authorization: Bearer your_sandbox_token",
        "--header",
        "X-Kobana-Api-Url: https://api-sandbox.kobana.com.br"
      ]
    }
  }
}
```

### Direct HTTP Connection

```bash
# Get server info
curl https://mcp.kobana.com.br/

# Get namespace info
curl https://mcp.kobana.com.br/charge

# Initialize MCP session (Streamable HTTP)
curl -X POST -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' \
  https://mcp.kobana.com.br/charge/mcp
```

## Architecture

```
vercel-mcp/
├── src/
│   ├── server.ts      # Unified HTTP server
│   ├── config.ts      # Configuration handling
│   └── namespaces.ts  # Namespace definitions
├── package.json
├── tsconfig.json
└── README.md
```

The server imports tools from sibling MCP packages:
- `../mcp-admin/dist/tools/`
- `../mcp-charge/dist/tools/`
- `../mcp-data/dist/tools/`
- `../mcp-edi/dist/tools/`
- `../mcp-financial/dist/tools/`
- `../mcp-payment/dist/tools/`
- `../mcp-transfer/dist/tools/`

## License

MIT

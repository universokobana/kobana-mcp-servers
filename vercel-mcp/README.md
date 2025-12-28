# Kobana MCP Unified Server (Vercel Deployment)

Unified MCP server for deploying all Kobana MCP namespaces on a single Vercel project.

## Endpoints

All namespaces are available under a single domain:

| Namespace | SSE Endpoint | Messages Endpoint |
|-----------|--------------|-------------------|
| Admin | `/admin/sse` | `/admin/messages` |
| Charge | `/charge/sse` | `/charge/messages` |
| Data | `/data/sse` | `/data/messages` |
| EDI | `/edi/sse` | `/edi/messages` |
| Financial | `/financial/sse` | `/financial/messages` |
| Payment | `/payment/sse` | `/payment/messages` |
| Transfer | `/transfer/sse` | `/transfer/messages` |

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
      "args": ["-y", "@anthropic/mcp-remote", "https://mcp.kobana.com.br/charge/sse"],
      "env": {
        "AUTHORIZATION": "Bearer your_access_token"
      }
    },
    "kobana-transfer": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-remote", "https://mcp.kobana.com.br/transfer/sse"],
      "env": {
        "AUTHORIZATION": "Bearer your_access_token"
      }
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

# Connect via SSE
curl -N -H "Authorization: Bearer your_token" \
  https://mcp.kobana.com.br/charge/sse
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

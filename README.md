# Kobana MCP Servers

MCP (Model Context Protocol) servers for the Kobana API v2. These servers enable AI assistants to interact with the Kobana financial automation platform.

## About Kobana

Kobana is a financial automation platform. Learn more at: https://ai.kobana.com.br

## Available MCP Servers

| Server | Namespace | Description | Status |
|--------|-----------|-------------|--------|
| [mcp-charge](./mcp-charge) | `charge` | Pix payments and accounts | Available |

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd kobana-mcp-server

# Install mcp-charge
cd mcp-charge
npm install
npm run build
```

### 2. Configure Environment

```bash
# Production
export KOBANA_ACCESS_TOKEN=your_production_token

# Sandbox
export KOBANA_API_URL=https://api-sandbox.kobana.com.br
export KOBANA_ACCESS_TOKEN=your_sandbox_token
```

### 3. Run

#### Local Mode (Claude Desktop)

```bash
cd mcp-charge
npm start
```

Configure Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "kobana-charge": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-charge/dist/index.js"],
      "env": {
        "KOBANA_ACCESS_TOKEN": "your_token"
      }
    }
  }
}
```

#### Hosted Mode (HTTP Server)

```bash
cd mcp-charge
PORT=3000 npm run start:http
```

## API Reference

- **Production API**: https://api.kobana.com.br
- **Sandbox API**: https://api-sandbox.kobana.com.br
- **API Specification**: https://github.com/universokobana/kobana-api-specs

## Project Structure

```
kobana-mcp-server/
├── README.md               # This file
├── servers.json            # Server definitions
├── docs/
│   ├── instructions.md     # Development instructions
│   └── implementation-plan.md
└── mcp-charge/            # Charge namespace server
    ├── README.md
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts       # stdio entry point
        ├── http-server.ts # HTTP entry point
        ├── server.ts      # MCP server
        ├── config.ts
        ├── api/           # API clients
        ├── tools/         # MCP tools
        └── types/         # TypeScript types
```

## Available Tools

### mcp-charge

#### Pix Accounts (charge_pix_accounts)

- `list_charge_pix_accounts` - List all Pix accounts
- `create_charge_pix_account` - Create a new Pix account
- `get_charge_pix_account` - Get a specific Pix account
- `update_charge_pix_account` - Update a Pix account
- `delete_charge_pix_account` - Delete a Pix account

#### Pix Charges (charge_pix)

- `list_charge_pix` - List all Pix charges
- `create_charge_pix` - Create a new Pix charge
- `get_charge_pix` - Get a specific Pix charge
- `delete_charge_pix` - Delete a Pix charge
- `update_charge_pix` - Update a Pix charge
- `cancel_charge_pix` - Cancel a Pix charge

#### Pix Commands (charge_pix_commands)

- `list_charge_pix_commands` - List commands for a Pix charge
- `get_charge_pix_command` - Get a specific command

## Authentication

All servers use Bearer token authentication. Obtain your access token from the Kobana platform.

```
Authorization: Bearer <access_token>
```

## Transport Modes

### Local (stdio)

- Communication via standard input/output
- Best for local AI assistants like Claude Desktop
- Entry point: `dist/index.js`

### Hosted (HTTP/SSE)

- HTTP server with SSE support
- Best for remote/cloud deployments
- Entry point: `dist/http-server.js`
- Endpoints:
  - `GET /` - Server info
  - `GET /health` - Health check
  - `GET /sse` - SSE connection
  - `POST /messages?sessionId=<id>` - Message endpoint

## Development

### Building

```bash
cd mcp-charge
npm run build    # Build once
npm run dev      # Watch mode
```

### Adding New Namespaces

1. Create a new folder `mcp-<namespace>`
2. Follow the structure of `mcp-charge`
3. Implement API clients and tools
4. Update `servers.json`

## License

MIT

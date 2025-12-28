# Kobana MCP Charge Server

MCP (Model Context Protocol) server for the Kobana Charge API v2. This server provides tools for managing Pix payments and accounts through the Kobana platform.

## Features

- **Pix Accounts Management**: Create, list, update, and delete Pix accounts for receiving payments
- **Pix Charges**: Create, list, update, cancel, and delete Pix charges
- **Pix Commands**: Track and monitor operations executed on Pix charges

## Installation

```bash
cd mcp-charge
npm install
npm run build
```

## Configuration

Set the following environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `KOBANA_ACCESS_TOKEN` | Yes | - | Bearer access token for Kobana API |
| `KOBANA_API_URL` | No | `https://api.kobana.com.br` | Base URL for Kobana API |

### Sandbox Environment

To use the sandbox environment:

```bash
export KOBANA_API_URL=https://api-sandbox.kobana.com.br
export KOBANA_ACCESS_TOKEN=your_sandbox_token
```

## Usage

### Local Mode (stdio)

Run the server locally using stdio transport:

```bash
npm start
# or
node dist/index.js
```

#### Claude Desktop Configuration

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "kobana-charge": {
      "command": "node",
      "args": ["/path/to/mcp-charge/dist/index.js"],
      "env": {
        "KOBANA_ACCESS_TOKEN": "your_access_token"
      }
    }
  }
}
```

### Hosted Mode (HTTP/SSE)

Run the server as an HTTP service:

```bash
npm run start:http
# or
node dist/http-server.js
```

Configure with environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP server port |
| `HOST` | `0.0.0.0` | HTTP server host |

#### HTTP Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Server information |
| `/health` | GET | Health check |
| `/sse` | GET | SSE connection (requires Authorization header) |
| `/messages?sessionId=<id>` | POST | Send messages to session |

#### Authentication for HTTP Mode

Pass the access token in the Authorization header:

```
Authorization: Bearer your_access_token
```

Optionally specify a custom API URL:

```
X-Kobana-Api-Url: https://api-sandbox.kobana.com.br
```

## Available Tools

### Pix Accounts

| Tool | Description |
|------|-------------|
| `list_charge_pix_accounts` | List all Pix accounts |
| `create_charge_pix_account` | Create a new Pix account |
| `get_charge_pix_account` | Get a specific Pix account |
| `update_charge_pix_account` | Update a Pix account |
| `delete_charge_pix_account` | Delete a Pix account |

### Pix Charges

| Tool | Description |
|------|-------------|
| `list_charge_pix` | List all Pix charges with filters |
| `create_charge_pix` | Create a new Pix charge |
| `get_charge_pix` | Get a specific Pix charge |
| `delete_charge_pix` | Delete a canceled Pix charge |
| `update_charge_pix` | Update a Pix charge |
| `cancel_charge_pix` | Cancel a Pix charge |

### Pix Commands

| Tool | Description |
|------|-------------|
| `list_charge_pix_commands` | List commands for a Pix charge |
| `get_charge_pix_command` | Get a specific command |

## Examples

### Create a Pix Account

```json
{
  "financial_provider_slug": "banco_do_brasil",
  "key": "12345678901",
  "beneficiary": {
    "document": "12345678901234",
    "name": "Empresa LTDA",
    "address": {
      "city": "Sao Paulo",
      "state": "SP"
    }
  }
}
```

### Create a Pix Charge

```json
{
  "amount": 10000,
  "pix_account_id": "abc123",
  "payer": {
    "name": "John Doe",
    "document_number": "12345678901"
  },
  "expire_at": "2024-12-31T23:59:59Z",
  "message": "Payment for order #123"
}
```

### List Pix Charges with Filters

```json
{
  "status": "pending",
  "created_from": "2024-01-01",
  "created_to": "2024-12-31",
  "per_page": 20
}
```

## Development

```bash
# Watch mode
npm run dev

# Build
npm run build

# Clean
npm run clean
```

## License

MIT

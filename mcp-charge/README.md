# kobana-mcp-charge

MCP (Model Context Protocol) server for the Kobana Charge API v2. This server provides tools for managing Pix payments and accounts through the Kobana platform.

[![npm version](https://badge.fury.io/js/kobana-mcp-charge.svg)](https://www.npmjs.com/package/kobana-mcp-charge)

## Features

- **Pix Accounts Management**: Create, list, update, and delete Pix accounts for receiving payments
- **Pix Charges**: Create, list, update, cancel, and delete Pix charges
- **Pix Commands**: Track and monitor operations executed on Pix charges

## Quick Start with npx

The easiest way to use this MCP server is with `npx`:

```bash
# Local mode (stdio)
KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-charge

# HTTP mode (hosted)
KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-charge-http
```

## Installation

### Global Installation

```bash
npm install -g kobana-mcp-charge

# Then run:
KOBANA_ACCESS_TOKEN=your_token kobana-mcp-charge
```

### Local Installation

```bash
npm install kobana-mcp-charge

# Then run:
KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-charge
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
npx kobana-mcp-charge
```

## Usage with Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

### Using npx (Recommended)

```json
{
  "mcpServers": {
    "kobana-charge": {
      "command": "npx",
      "args": ["-y", "kobana-mcp-charge"],
      "env": {
        "KOBANA_ACCESS_TOKEN": "your_access_token"
      }
    }
  }
}
```

### Using Global Installation

```json
{
  "mcpServers": {
    "kobana-charge": {
      "command": "kobana-mcp-charge",
      "env": {
        "KOBANA_ACCESS_TOKEN": "your_access_token"
      }
    }
  }
}
```

### Sandbox Configuration

```json
{
  "mcpServers": {
    "kobana-charge": {
      "command": "npx",
      "args": ["-y", "kobana-mcp-charge"],
      "env": {
        "KOBANA_ACCESS_TOKEN": "your_sandbox_token",
        "KOBANA_API_URL": "https://api-sandbox.kobana.com.br"
      }
    }
  }
}
```

## HTTP/SSE Mode (Hosted)

Run the server as an HTTP service for remote deployments:

```bash
# Using npx
PORT=3000 KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-charge-http

# Or with global install
PORT=3000 KOBANA_ACCESS_TOKEN=your_token kobana-mcp-charge-http
```

### Environment Variables for HTTP Mode

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP server port |
| `HOST` | `0.0.0.0` | HTTP server host |

### HTTP Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Server information |
| `/health` | GET | Health check |
| `/sse` | GET | SSE connection (requires Authorization header) |
| `/messages?sessionId=<id>` | POST | Send messages to session |

### Authentication for HTTP Mode

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

## About Kobana

Kobana is a financial automation platform. Learn more at: https://ai.kobana.com.br

## License

MIT

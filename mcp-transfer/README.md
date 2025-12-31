# kobana-mcp-transfer

MCP (Model Context Protocol) server for the Kobana Transfer API v2. This server provides tools for managing Pix, TED, and internal transfers through the Kobana platform.

[![npm version](https://badge.fury.io/js/kobana-mcp-transfer.svg)](https://www.npmjs.com/package/kobana-mcp-transfer)

## Features

- **Pix Transfers**: Create, list, and get Pix transfers using keys or bank accounts
- **TED Transfers**: Create, list, and get TED transfers
- **Internal Transfers**: Create, list, and get transfers between accounts
- **Transfer Batches**: Manage batches of transfers for bulk processing, approve or reprove batches

## Quick Start with npx

The easiest way to use this MCP server is with `npx`:

```bash
# Local mode (stdio)
KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-transfer

# HTTP mode (hosted)
KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-transfer-http
```

## Installation

### Global Installation

```bash
npm install -g kobana-mcp-transfer

# Then run:
KOBANA_ACCESS_TOKEN=your_token kobana-mcp-transfer
```

### Local Installation

```bash
npm install kobana-mcp-transfer

# Then run:
KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-transfer
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
npx kobana-mcp-transfer
```

## Usage with Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

### Using npx (Recommended)

```json
{
  "mcpServers": {
    "kobana-transfer": {
      "command": "npx",
      "args": ["-y", "kobana-mcp-transfer"],
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
    "kobana-transfer": {
      "command": "kobana-mcp-transfer",
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
    "kobana-transfer": {
      "command": "npx",
      "args": ["-y", "kobana-mcp-transfer"],
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
PORT=3000 KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-transfer-http

# Or with global install
PORT=3000 KOBANA_ACCESS_TOKEN=your_token kobana-mcp-transfer-http
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

### Transfer Batches

| Tool | Description |
|------|-------------|
| `list_transfer_batches` | List all transfer batches with filters |
| `get_transfer_batch` | Get a specific transfer batch |
| `approve_transfer_batch` | Approve a batch awaiting approval |
| `reprove_transfer_batch` | Reprove (reject) a batch |

### Pix Transfers

| Tool | Description |
|------|-------------|
| `list_transfer_pix` | List all Pix transfers with filters |
| `create_transfer_pix` | Create a new Pix transfer |
| `get_transfer_pix` | Get a specific Pix transfer |
| `create_transfer_pix_batch` | Create a batch of Pix transfers |

### TED Transfers

| Tool | Description |
|------|-------------|
| `list_transfer_ted` | List all TED transfers with filters |
| `create_transfer_ted` | Create a new TED transfer |
| `get_transfer_ted` | Get a specific TED transfer |
| `create_transfer_ted_batch` | Create a batch of TED transfers |

### Internal Transfers

| Tool | Description |
|------|-------------|
| `list_transfer_internal` | List all internal transfers with filters |
| `create_transfer_internal` | Create a new internal transfer |
| `get_transfer_internal` | Get a specific internal transfer |
| `create_transfer_internal_batch` | Create a batch of internal transfers |

## Examples

### Create a Pix Transfer using a Pix Key

```json
{
  "amount": 100.50,
  "financial_account_uid": "018df180-7208-727b-a10a-ea545e4a75a8",
  "type": "key",
  "key_type": "email",
  "key": "recipient@example.com",
  "beneficiary": {
    "document_number": "12345678901",
    "name": "John Doe"
  },
  "transfer_purpose": "98"
}
```

### Create a TED Transfer

```json
{
  "amount": 1000.00,
  "financial_account_uid": "018df180-7208-727b-a10a-ea545e4a75a8",
  "beneficiary": {
    "document_number": "12345678901234",
    "name": "Empresa LTDA"
  },
  "bank_account": {
    "compe_number": 1,
    "agency_number": "1234",
    "agency_digit": "5",
    "account_number": "123456",
    "account_digit": "7"
  },
  "transfer_purpose": "20"
}
```

### Create an Internal Transfer

```json
{
  "amount": 500.00,
  "financial_account_uid": "018df180-7208-727b-a10a-ea545e4a75a8",
  "beneficiary": {
    "document_number": "98765432109",
    "name": "Jane Doe"
  },
  "internal": {
    "agency_number": "0001",
    "account_number": "654321",
    "account_digit": "0"
  }
}
```

### List Transfers with Filters

```json
{
  "status": "pending",
  "created_from": "2024-01-01",
  "created_to": "2024-12-31",
  "per_page": 20
}
```

### Create a Batch of Pix Transfers

```json
{
  "financial_account_uid": "018df180-7208-727b-a10a-ea545e4a75a8",
  "transfers": [
    {
      "amount": 50.00,
      "financial_account_uid": "018df180-7208-727b-a10a-ea545e4a75a8",
      "type": "key",
      "key_type": "cpf",
      "key": "12345678901",
      "beneficiary": {
        "document_number": "12345678901",
        "name": "Person One"
      }
    },
    {
      "uid": "existing-transfer-uid"
    }
  ]
}
```

## Transfer Purpose Codes

Common transfer purpose codes:

| Code | Description |
|------|-------------|
| `01` | Billing |
| `20` | Supplier Payment |
| `30` | Salary Payment |
| `90` | Benefits Payment |
| `98` | Miscellaneous Payments |

## Required OAuth Scopes

When using OAuth authentication, the following scopes are required based on the resources you want to access:

| Resource | Scope |
|----------|-------|
| Transfer Batches | `transfer.batches` |
| Pix Transfers | `transfer.pix` |
| TED Transfers | `transfer.ted` |
| Internal Transfers | `transfer.internal` |

Request only the scopes needed for your use case. For full access to all transfer features, include all scopes above.

## About Kobana

Kobana is a financial automation platform. Learn more at: https://www.kobana.com.br

## License

MIT

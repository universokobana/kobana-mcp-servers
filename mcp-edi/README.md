# kobana-mcp-edi

MCP (Model Context Protocol) server for the Kobana EDI API v2. This server provides tools for managing EDI boxes (Caixas Postais) for CNAB file transmission through the Kobana platform.

[![npm version](https://badge.fury.io/js/kobana-mcp-edi.svg)](https://www.npmjs.com/package/kobana-mcp-edi)

## Features

- **EDI Boxes Management**: Create, list, update, and view EDI boxes for CNAB file transmission
- **Multiple Operation Types**: Support for charge (billing), statement, and payment operations
- **CNAB Format Support**: Support for CNAB 400, CNAB 240, and CNAB 200 formats

## Quick Start with npx

The easiest way to use this MCP server is with `npx`:

```bash
# Local mode (stdio)
KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-edi

# HTTP mode (hosted)
KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-edi-http
```

## Installation

### Global Installation

```bash
npm install -g kobana-mcp-edi

# Then run:
KOBANA_ACCESS_TOKEN=your_token kobana-mcp-edi
```

### Local Installation

```bash
npm install kobana-mcp-edi

# Then run:
KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-edi
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
npx kobana-mcp-edi
```

## Usage with Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

### Using npx (Recommended)

```json
{
  "mcpServers": {
    "kobana-edi": {
      "command": "npx",
      "args": ["-y", "kobana-mcp-edi"],
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
    "kobana-edi": {
      "command": "kobana-mcp-edi",
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
    "kobana-edi": {
      "command": "npx",
      "args": ["-y", "kobana-mcp-edi"],
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
PORT=3000 KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-edi-http

# Or with global install
PORT=3000 KOBANA_ACCESS_TOKEN=your_token kobana-mcp-edi-http
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

### EDI Boxes

| Tool | Description |
|------|-------------|
| `list_edi_boxes` | List all EDI boxes with pagination and filtering |
| `create_edi_box` | Create a new EDI box |
| `get_edi_box` | Get a specific EDI box by UID |
| `update_edi_box` | Update an existing EDI box |

## Examples

### Create an EDI Box

```json
{
  "resource": {
    "type": "financial.account",
    "uid": "01948afe-3014-7e81-9a88-badcfc1fd4d6"
  },
  "name": "My EDI Box",
  "operation": "charge",
  "kind": "cnab400",
  "account_owner": {
    "name": "Company Name",
    "document_number": "16.974.923/0001-84",
    "phone_number": "2130030386",
    "email": "account@example.com"
  },
  "letter_owner": {
    "name": "Letter Owner Name",
    "phone_number": "2130030386",
    "email": "letter@example.com"
  },
  "bank_manager": {
    "name": "Bank Manager Name",
    "phone_number": "11988888888",
    "email": "manager@example.com"
  }
}
```

### List EDI Boxes with Filters

```json
{
  "resource_type": "financial.account",
  "per_page": 20,
  "page": 1
}
```

### Update an EDI Box

```json
{
  "uid": "012ab34c-d567-8901-234e-5fghi6j789k0",
  "name": "Updated EDI Box Name",
  "account_owner": {
    "name": "Updated Owner Name",
    "document_number": "16.974.923/0001-84",
    "phone_number": "2130030386",
    "email": "updated@example.com"
  }
}
```

## EDI Box Status Values

| Status | Description |
|--------|-------------|
| `generated` | Letter generated |
| `demand_received` | Demand received |
| `confirming_at_bank` | Waiting for bank confirmation |
| `testing_by_customer` | Waiting for customer testing |
| `waiting_for_validations` | Waiting for validations |
| `activated` | EDI box activated |

## Letter Status Values

| Status | Description |
|--------|-------------|
| `not_created` | Letter not created |
| `creating` | Letter being created |
| `created` | Letter created |

## About Kobana

Kobana is a financial automation platform. Learn more at: https://www.kobana.com.br

## License

MIT

# Kobana MCP Payment Server

MCP (Model Context Protocol) server for the Kobana Payment API v2. This server enables AI assistants to interact with Kobana's payment services for bank billets, Pix, DARF, taxes, and utility bills.

## Features

- **Bank Billet Payments**: Pay Brazilian bank billets (boletos)
- **Pix Payments**: Pay via Brazilian instant payment system (Pix)
- **DARF Payments**: Pay federal tax documents (DARF)
- **Tax Payments**: Pay various Brazilian taxes (ITBI, ICMS, ISS, IPTU, FGTS, DARE)
- **Utility Payments**: Pay utility bills (electricity, water, gas, phone)
- **Batch Operations**: Create and manage payment batches for approval workflow

## Installation

```bash
npm install kobana-mcp-payment
```

## Configuration

Set the following environment variables:

```bash
export KOBANA_ACCESS_TOKEN="your-access-token"
export KOBANA_API_URL="https://api.kobana.com.br"  # Optional, defaults to production
```

## Usage

### With Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "kobana-payment": {
      "command": "npx",
      "args": ["kobana-mcp-payment"],
      "env": {
        "KOBANA_ACCESS_TOKEN": "your-access-token"
      }
    }
  }
}
```

### Standalone (stdio)

```bash
npx kobana-mcp-payment
```

### HTTP Server Mode

```bash
npx kobana-mcp-payment-http
```

The HTTP server runs on port 3001 by default (configurable via `PORT` environment variable).

## Available Tools

### Bank Billet Payments

| Tool | Description |
|------|-------------|
| `list_payment_bank_billets` | List all bank billet payments |
| `create_payment_bank_billet` | Create a new bank billet payment |
| `get_payment_bank_billet` | Get details of a bank billet payment |

### Pix Payments

| Tool | Description |
|------|-------------|
| `list_payment_pix` | List all Pix payments |
| `create_payment_pix` | Create a new Pix payment |
| `get_payment_pix` | Get details of a Pix payment |

### DARF Payments

| Tool | Description |
|------|-------------|
| `list_payment_darfs` | List all DARF payments |
| `create_payment_darf` | Create a new DARF payment |
| `get_payment_darf` | Get details of a DARF payment |

### Tax Payments

| Tool | Description |
|------|-------------|
| `list_payment_taxes` | List all tax payments |
| `create_payment_tax` | Create a new tax payment |
| `get_payment_tax` | Get details of a tax payment |

### Utility Payments

| Tool | Description |
|------|-------------|
| `list_payment_utilities` | List all utility payments |
| `create_payment_utility` | Create a new utility payment |
| `get_payment_utility` | Get details of a utility payment |

### Batch Operations

| Tool | Description |
|------|-------------|
| `list_payment_batches` | List all payment batches |
| `get_payment_batch` | Get details of a payment batch |
| `approve_payment_batch` | Approve a payment batch |
| `reprove_payment_batch` | Reprove (reject) a payment batch |
| `create_payment_bank_billet_batch` | Create a batch of bank billet payments |
| `create_payment_pix_batch` | Create a batch of Pix payments |
| `create_payment_darf_batch` | Create a batch of DARF payments |
| `create_payment_tax_batch` | Create a batch of tax payments |
| `create_payment_utility_batch` | Create a batch of utility payments |

## Examples

### Create a Bank Billet Payment

```typescript
{
  "amount": 150.50,
  "financial_account_uid": "018df180-7208-727b-a10a-ea545e4a75a8",
  "code": "23793.38128 60000.000003 00000.000400 1 84340000010000",
  "scheduled_to": "2024-12-15"
}
```

### Create a Pix Payment

```typescript
{
  "financial_account_uid": "018df180-7208-727b-a10a-ea545e4a75a8",
  "qrcode": "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426614174000",
  "amount": 100.00
}
```

### Create a Tax Payment

```typescript
{
  "amount": 250.00,
  "financial_account_uid": "018df180-7208-727b-a10a-ea545e4a75a8",
  "code": "85820000000250000000001234567890123456789012",
  "kind": "iptu"
}
```

### Create a Payment Batch

```typescript
{
  "financial_account_uid": "018df180-7208-727b-a10a-ea545e4a75a8",
  "payments": [
    {
      "amount": 100.00,
      "code": "23793.38128 60000.000003 00000.000400 1 84340000010000"
    },
    {
      "amount": 200.00,
      "code": "23793.38128 60000.000003 00000.000401 2 84340000020000"
    }
  ]
}
```

## Payment Status

Payments can have the following statuses:

- `pending`: Payment is pending
- `rejected`: Payment was rejected
- `approved`: Payment was approved
- `reproved`: Payment was reproved
- `failed`: Payment failed
- `confirmed`: Payment was confirmed
- `canceled`: Payment was canceled
- `awaiting_approval`: Payment is waiting for approval
- `scheduled`: Payment is scheduled
- `awaiting_scheduled_date`: Payment is waiting for scheduled date
- `overdue`: Payment is overdue

## Batch Status

Batches can have the following statuses:

- `pending`: Batch is pending
- `awaiting_approval`: Batch is waiting for approval
- `confirmed`: Batch was confirmed
- `approved`: Batch was approved
- `reproved`: Batch was reproved
- `rejected`: Batch was rejected
- `scheduled`: Batch is scheduled

## HTTP Endpoints

When running in HTTP mode:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Server information |
| `/health` | GET | Health check |
| `/sse` | GET | SSE connection for MCP |
| `/messages` | POST | Send messages to MCP |

## Required OAuth Scopes

When using OAuth authentication, the following scopes are required based on the resources you want to access:

| Resource | Scope |
|----------|-------|
| Bank Billet Payments | `payment.bank_billets` |
| Pix Payments | `payment.pix` |
| DARF Payments | `payment.darfs` |
| Tax Payments | `payment.taxes` |
| Utility Payments | `payment.utilities` |
| Payment Batches | `payment.batches` |

Request only the scopes needed for your use case. For full access to all payment features, include all scopes above.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run in development mode
npm run dev

# Start stdio server
npm start

# Start HTTP server
npm run start:http
```

## License

MIT

## Support

For issues and feature requests, please visit the [GitHub repository](https://github.com/universokobana/kobana-mcp-servers).

# Kobana MCP Servers

MCP (Model Context Protocol) servers for the Kobana API v2. These servers enable AI assistants to interact with the Kobana financial automation platform.

## About Kobana

Kobana is a financial automation platform. Learn more at: https://www.kobana.com.br

## Available MCP Servers

| Server | npm Package | Tools | Description |
|--------|-------------|-------|-------------|
| [mcp-admin](./mcp-admin) | `kobana-mcp-admin` | 17 | Certificates, connections, subaccounts, users |
| [mcp-charge](./mcp-charge) | `kobana-mcp-charge` | 35 | Pix charges, accounts, automatic pix, payments |
| [mcp-data](./mcp-data) | `kobana-mcp-data` | 2 | Bank billet queries |
| [mcp-edi](./mcp-edi) | `kobana-mcp-edi` | 4 | EDI boxes management |
| [mcp-financial](./mcp-financial) | `kobana-mcp-financial` | 15 | Financial accounts, balances, statements |
| [mcp-payment](./mcp-payment) | `kobana-mcp-payment` | 24 | Bank billets, Pix, DARF, taxes, utilities |
| [mcp-transfer](./mcp-transfer) | `kobana-mcp-transfer` | 16 | Pix, TED, internal transfers |

**Total: 113 tools across 7 MCP servers**

## Quick Start with npx

The easiest way to use these MCP servers is with `npx`:

```bash
# Admin (certificates, connections, subaccounts, users)
KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-admin

# Charge (pix charges, accounts, automatic pix, payments)
KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-charge

# Data (bank billet queries)
KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-data

# EDI (edi boxes)
KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-edi

# Financial (accounts, balances, statements)
KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-financial

# Payment (bank billets, pix, darf, taxes, utilities)
KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-payment

# Transfer (pix, ted, internal transfers)
KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-transfer
```

## Usage with Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

### All Servers Configuration

```json
{
  "mcpServers": {
    "kobana-admin": {
      "command": "npx",
      "args": ["-y", "kobana-mcp-admin"],
      "env": {
        "KOBANA_ACCESS_TOKEN": "your_access_token"
      }
    },
    "kobana-charge": {
      "command": "npx",
      "args": ["-y", "kobana-mcp-charge"],
      "env": {
        "KOBANA_ACCESS_TOKEN": "your_access_token"
      }
    },
    "kobana-data": {
      "command": "npx",
      "args": ["-y", "kobana-mcp-data"],
      "env": {
        "KOBANA_ACCESS_TOKEN": "your_access_token"
      }
    },
    "kobana-edi": {
      "command": "npx",
      "args": ["-y", "kobana-mcp-edi"],
      "env": {
        "KOBANA_ACCESS_TOKEN": "your_access_token"
      }
    },
    "kobana-financial": {
      "command": "npx",
      "args": ["-y", "kobana-mcp-financial"],
      "env": {
        "KOBANA_ACCESS_TOKEN": "your_access_token"
      }
    },
    "kobana-payment": {
      "command": "npx",
      "args": ["-y", "kobana-mcp-payment"],
      "env": {
        "KOBANA_ACCESS_TOKEN": "your_access_token"
      }
    },
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

### Sandbox Environment

For sandbox/testing, add `KOBANA_API_URL`:

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

## Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `KOBANA_ACCESS_TOKEN` | Yes | - | Bearer access token for Kobana API |
| `KOBANA_API_URL` | No | `https://api.kobana.com.br` | Base URL for Kobana API |

## HTTP/SSE Mode (Hosted)

For remote deployments, each server has an HTTP mode:

```bash
PORT=3000 KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-admin-http
PORT=3001 KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-charge-http
PORT=3002 KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-data-http
PORT=3003 KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-edi-http
PORT=3004 KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-financial-http
PORT=3005 KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-payment-http
PORT=3006 KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-transfer-http
```

## API Reference

- **Production API**: https://api.kobana.com.br
- **Sandbox API**: https://api-sandbox.kobana.com.br
- **API Specification**: https://github.com/universokobana/kobana-api-specs

## Available Tools

### kobana-mcp-admin (17 tools)

| Tool | Description |
|------|-------------|
| `list_admin_certificates` | List all certificates |
| `create_admin_certificate` | Create a new certificate |
| `list_admin_connections` | List all connections |
| `create_admin_connection` | Create a new connection |
| `get_admin_connection` | Get a specific connection |
| `update_admin_connection` | Update a connection |
| `delete_admin_connection` | Delete a connection |
| `create_admin_connection_association` | Create a connection association |
| `delete_admin_connection_association` | Delete a connection association |
| `list_admin_subaccounts` | List all subaccounts |
| `create_admin_subaccount` | Create a new subaccount |
| `get_admin_subaccount` | Get a specific subaccount |
| `update_admin_subaccount` | Update a subaccount |
| `list_admin_users` | List all users |
| `create_admin_user` | Create a new user |
| `update_admin_user` | Update a user |
| `delete_admin_user` | Delete a user |

### kobana-mcp-charge (35 tools)

#### Pix Accounts
| Tool | Description |
|------|-------------|
| `list_charge_pix_accounts` | List all Pix accounts |
| `create_charge_pix_account` | Create a new Pix account |
| `get_charge_pix_account` | Get a specific Pix account |
| `update_charge_pix_account` | Update a Pix account |
| `delete_charge_pix_account` | Delete a Pix account |

#### Pix Charges
| Tool | Description |
|------|-------------|
| `list_charge_pix` | List all Pix charges |
| `create_charge_pix` | Create a new Pix charge |
| `get_charge_pix` | Get a specific Pix charge |
| `update_charge_pix` | Update a Pix charge |
| `delete_charge_pix` | Delete a Pix charge |
| `cancel_charge_pix` | Cancel a Pix charge |

#### Pix Commands
| Tool | Description |
|------|-------------|
| `list_charge_pix_commands` | List commands for a Pix charge |
| `get_charge_pix_command` | Get a specific command |

#### Automatic Pix
| Tool | Description |
|------|-------------|
| `list_charge_automatic_pix` | List automatic Pix configurations |
| `get_charge_automatic_pix` | Get an automatic Pix configuration |
| `update_charge_automatic_pix` | Update automatic Pix |
| `patch_charge_automatic_pix` | Patch automatic Pix |
| `cancel_charge_automatic_pix` | Cancel automatic Pix |
| `retry_charge_automatic_pix` | Retry automatic Pix |
| `list_charge_automatic_pix_recurrences` | List recurrences |
| `create_charge_automatic_pix_recurrence` | Create a recurrence |
| `get_charge_automatic_pix_recurrence` | Get a recurrence |
| `update_charge_automatic_pix_recurrence` | Update a recurrence |
| `patch_charge_automatic_pix_recurrence` | Patch a recurrence |
| `cancel_charge_automatic_pix_recurrence` | Cancel a recurrence |
| `create_charge_automatic_pix_recurrence_pix` | Create Pix for recurrence |
| `list_charge_automatic_pix_requests` | List requests |
| `create_charge_automatic_pix_recurrence_request` | Create a request |
| `get_charge_automatic_pix_request` | Get a request |
| `patch_charge_automatic_pix_request` | Patch a request |
| `cancel_charge_automatic_pix_request` | Cancel a request |

#### Payments
| Tool | Description |
|------|-------------|
| `list_charge_payments` | List all payments |
| `create_charge_payment` | Create a new payment |
| `get_charge_payment` | Get a specific payment |
| `delete_charge_payment` | Delete a payment |

### kobana-mcp-data (2 tools)

| Tool | Description |
|------|-------------|
| `list_data_bank_billet_queries` | List bank billet queries |
| `create_data_bank_billet_query` | Create a new bank billet query |

### kobana-mcp-edi (4 tools)

| Tool | Description |
|------|-------------|
| `list_edi_boxes` | List all EDI boxes |
| `create_edi_box` | Create a new EDI box |
| `get_edi_box` | Get a specific EDI box |
| `update_edi_box` | Update an EDI box |

### kobana-mcp-financial (15 tools)

| Tool | Description |
|------|-------------|
| `list_financial_providers` | List all financial providers |
| `list_financial_accounts` | List all financial accounts |
| `create_financial_account` | Create a new financial account |
| `get_financial_account` | Get a specific financial account |
| `update_financial_account` | Update a financial account |
| `list_financial_account_balances` | List account balances |
| `create_financial_account_balance` | Create a balance record |
| `get_financial_account_balance` | Get a specific balance |
| `list_financial_account_commands` | List account commands |
| `get_financial_account_command` | Get a specific command |
| `list_financial_statement_transactions` | List statement transactions |
| `sync_financial_statement_transactions` | Sync transactions |
| `list_financial_statement_transaction_imports` | List imports |
| `create_financial_statement_transaction_import` | Create an import |
| `get_financial_statement_transaction_import` | Get an import |

### kobana-mcp-payment (24 tools)

#### Bank Billets
| Tool | Description |
|------|-------------|
| `list_payment_bank_billets` | List bank billet payments |
| `create_payment_bank_billet` | Create a bank billet payment |
| `get_payment_bank_billet` | Get a bank billet payment |
| `create_payment_bank_billet_batch` | Create a batch |

#### Pix Payments
| Tool | Description |
|------|-------------|
| `list_payment_pix` | List Pix payments |
| `create_payment_pix` | Create a Pix payment |
| `get_payment_pix` | Get a Pix payment |
| `create_payment_pix_batch` | Create a batch |

#### DARF Payments
| Tool | Description |
|------|-------------|
| `list_payment_darfs` | List DARF payments |
| `create_payment_darf` | Create a DARF payment |
| `get_payment_darf` | Get a DARF payment |
| `create_payment_darf_batch` | Create a batch |

#### Tax Payments
| Tool | Description |
|------|-------------|
| `list_payment_taxes` | List tax payments |
| `create_payment_tax` | Create a tax payment |
| `get_payment_tax` | Get a tax payment |
| `create_payment_tax_batch` | Create a batch |

#### Utility Payments
| Tool | Description |
|------|-------------|
| `list_payment_utilities` | List utility payments |
| `create_payment_utility` | Create a utility payment |
| `get_payment_utility` | Get a utility payment |
| `create_payment_utility_batch` | Create a batch |

#### Batch Operations
| Tool | Description |
|------|-------------|
| `list_payment_batches` | List all payment batches |
| `get_payment_batch` | Get a specific batch |
| `approve_payment_batch` | Approve a batch |
| `reprove_payment_batch` | Reprove a batch |

### kobana-mcp-transfer (16 tools)

#### Transfer Batches
| Tool | Description |
|------|-------------|
| `list_transfer_batches` | List all transfer batches |
| `get_transfer_batch` | Get a specific batch |
| `approve_transfer_batch` | Approve a batch |
| `reprove_transfer_batch` | Reprove a batch |

#### Pix Transfers
| Tool | Description |
|------|-------------|
| `list_transfer_pix` | List Pix transfers |
| `create_transfer_pix` | Create a Pix transfer |
| `get_transfer_pix` | Get a Pix transfer |
| `create_transfer_pix_batch` | Create a batch |

#### TED Transfers
| Tool | Description |
|------|-------------|
| `list_transfer_ted` | List TED transfers |
| `create_transfer_ted` | Create a TED transfer |
| `get_transfer_ted` | Get a TED transfer |
| `create_transfer_ted_batch` | Create a batch |

#### Internal Transfers
| Tool | Description |
|------|-------------|
| `list_transfer_internal` | List internal transfers |
| `create_transfer_internal` | Create an internal transfer |
| `get_transfer_internal` | Get an internal transfer |
| `create_transfer_internal_batch` | Create a batch |

## Project Structure

```
kobana-mcp-server/
├── README.md
├── LICENSE
├── .gitignore
├── specs/                  # API specifications (OpenAPI)
├── docs/
│   └── instructions.md
├── mcp-admin/              # kobana-mcp-admin package
├── mcp-charge/             # kobana-mcp-charge package
├── mcp-data/               # kobana-mcp-data package
├── mcp-edi/                # kobana-mcp-edi package
├── mcp-financial/          # kobana-mcp-financial package
├── mcp-payment/            # kobana-mcp-payment package
└── mcp-transfer/           # kobana-mcp-transfer package
```

Each MCP package follows the same structure:

```
mcp-*/
├── README.md
├── package.json
├── tsconfig.json
├── .gitignore
├── .npmignore
└── src/
    ├── index.ts           # stdio entry point
    ├── http-server.ts     # HTTP/SSE entry point
    ├── server.ts          # MCP server
    ├── config.ts          # Configuration
    ├── api/               # API clients
    ├── tools/             # MCP tools
    └── types/             # TypeScript types & Zod schemas
```

## Development

### Building from Source

```bash
git clone https://github.com/universokobana/kobana-mcp-servers.git
cd kobana-mcp-servers

# Build all packages
for dir in mcp-*/; do
  cd "$dir"
  npm install
  npm run build
  cd ..
done
```

### Building a Single Package

```bash
cd mcp-charge
npm install
npm run build
```

### Publishing

```bash
cd mcp-charge
npm publish
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Links

- [Kobana Website](https://www.kobana.com.br)
- [API Documentation](https://developers.kobana.com.br)
- [API V2 Specification](https://github.com/universokobana/kobana-api-specs)
- [GitHub Repository](https://github.com/universokobana/kobana-mcp-servers)

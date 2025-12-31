# Kobana MCP Financial Server

MCP (Model Context Protocol) server for the Kobana Financial API v2. This server enables AI assistants to manage financial accounts, balances, statement transactions, and imports.

## Features

- List and manage financial providers
- Create and manage financial accounts
- Track account balances
- View and sync statement transactions
- Import statement transaction files
- Both stdio and HTTP/SSE transports supported
- Bearer token authentication

## Installation

```bash
npm install kobana-mcp-financial
```

Or install globally:

```bash
npm install -g kobana-mcp-financial
```

## Configuration

Set the following environment variable:

```bash
export KOBANA_ACCESS_TOKEN=your_access_token_here
```

Optionally, customize the API URL:

```bash
export KOBANA_API_URL=https://api.kobana.com.br
```

## Usage

### Stdio Transport (for Claude Desktop, etc.)

```bash
kobana-mcp-financial
```

### HTTP Transport (for web applications)

```bash
kobana-mcp-financial-http
```

The HTTP server will start on port 3001 by default. Customize with:

```bash
PORT=3001 HOST=0.0.0.0 kobana-mcp-financial-http
```

## Claude Desktop Configuration

Add to your Claude Desktop configuration file:

```json
{
  "mcpServers": {
    "kobana-financial": {
      "command": "npx",
      "args": ["kobana-mcp-financial"],
      "env": {
        "KOBANA_ACCESS_TOKEN": "your_access_token_here"
      }
    }
  }
}
```

## Available Tools

### Financial Providers

- `list_financial_providers` - List all financial providers (banks and payment institutions)

### Financial Accounts

- `list_financial_accounts` - List all financial accounts with pagination
- `create_financial_account` - Create a new financial account
- `get_financial_account` - Get details of a specific financial account
- `update_financial_account` - Update an existing financial account

### Account Balances

- `list_financial_account_balances` - List balance records for an account
- `create_financial_account_balance` - Create a new balance record
- `get_financial_account_balance` - Get details of a specific balance

### Account Commands

- `list_financial_account_commands` - List commands executed for an account
- `get_financial_account_command` - Get details of a specific command

### Statement Transactions

- `list_financial_statement_transactions` - List statement transactions with date filters
- `sync_financial_statement_transactions` - Trigger a transaction sync (returns a command)

### Statement Transaction Imports

- `list_financial_statement_transaction_imports` - List imports with status and date filters
- `create_financial_statement_transaction_import` - Create a new import from a file
- `get_financial_statement_transaction_import` - Get details of a specific import

## HTTP API Endpoints

When running in HTTP mode:

- `GET /` - Server info and available tools
- `GET /health` - Health check
- `GET /sse` - SSE connection for MCP protocol
- `POST /messages?sessionId=<id>` - Send MCP messages

### Authentication

For HTTP mode, you can pass the access token via:

1. Environment variable `KOBANA_ACCESS_TOKEN`
2. Authorization header: `Authorization: Bearer <token>`

## Required OAuth Scopes

When using OAuth authentication, the following scopes are required based on the resources you want to access:

| Resource | Scope |
|----------|-------|
| Financial Providers | `financial.providers` |
| Financial Accounts | `financial.accounts` |
| Account Balances | `financial.balances` |
| Account Commands | `financial.accounts` |
| Statement Transactions | `financial.statement_transactions` |
| Statement Transaction Imports | `financial.statement_transactions` |

Request only the scopes needed for your use case. For full access to all financial features, include all scopes above.

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

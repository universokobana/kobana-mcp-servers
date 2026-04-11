# Kobana MCP Servers

[![npm version](https://img.shields.io/npm/v/kobana-mcp-admin.svg)](https://www.npmjs.com/package/kobana-mcp-admin)
[![npm version](https://img.shields.io/npm/v/kobana-mcp-charge.svg)](https://www.npmjs.com/package/kobana-mcp-charge)
[![npm version](https://img.shields.io/npm/v/kobana-mcp-financial.svg)](https://www.npmjs.com/package/kobana-mcp-financial)
[![npm version](https://img.shields.io/npm/v/kobana-mcp-help.svg)](https://www.npmjs.com/package/kobana-mcp-help)
[![npm version](https://img.shields.io/npm/v/kobana-mcp-mailbox.svg)](https://www.npmjs.com/package/kobana-mcp-mailbox)
[![npm version](https://img.shields.io/npm/v/kobana-mcp-payment.svg)](https://www.npmjs.com/package/kobana-mcp-payment)
[![npm version](https://img.shields.io/npm/v/kobana-mcp-site.svg)](https://www.npmjs.com/package/kobana-mcp-site)
[![npm version](https://img.shields.io/npm/v/kobana-mcp-transfer.svg)](https://www.npmjs.com/package/kobana-mcp-transfer)

MCP (Model Context Protocol) servers for the Kobana API v2. These servers enable AI assistants to interact with the Kobana financial automation platform.

## About Kobana

Kobana is a financial automation platform. Learn more at: https://www.kobana.com.br

## Available MCP Servers

| Server | npm Package | Tools | Description |
|--------|-------------|-------|-------------|
| [mcp-admin](./mcp-admin) | [![npm](https://img.shields.io/npm/v/kobana-mcp-admin.svg)](https://www.npmjs.com/package/kobana-mcp-admin) | 17 | Certificates, connections, subaccounts, users |
| [mcp-charge](./mcp-charge) | [![npm](https://img.shields.io/npm/v/kobana-mcp-charge.svg)](https://www.npmjs.com/package/kobana-mcp-charge) | 35 | Pix charges, accounts, automatic pix, payments |
| [mcp-data](./mcp-data) | [![npm](https://img.shields.io/npm/v/kobana-mcp-data.svg)](https://www.npmjs.com/package/kobana-mcp-data) | 2 | Bank billet queries |
| [mcp-edi](./mcp-edi) | [![npm](https://img.shields.io/npm/v/kobana-mcp-edi.svg)](https://www.npmjs.com/package/kobana-mcp-edi) | 4 | EDI boxes management |
| [mcp-financial](./mcp-financial) | [![npm](https://img.shields.io/npm/v/kobana-mcp-financial.svg)](https://www.npmjs.com/package/kobana-mcp-financial) | 15 | Financial accounts, balances, statements |
| [mcp-help](./mcp-help) | [![npm](https://img.shields.io/npm/v/kobana-mcp-help.svg)](https://www.npmjs.com/package/kobana-mcp-help) | 2 | Help Center articles (no auth required) |
| [mcp-mailbox](./mcp-mailbox) | [![npm](https://img.shields.io/npm/v/kobana-mcp-mailbox.svg)](https://www.npmjs.com/package/kobana-mcp-mailbox) | 41 | Mailbox entries, files, email/S3/SFTP/WhatsApp/Syncthing channels |
| [mcp-payment](./mcp-payment) | [![npm](https://img.shields.io/npm/v/kobana-mcp-payment.svg)](https://www.npmjs.com/package/kobana-mcp-payment) | 24 | Bank billets, Pix, DARF, taxes, utilities |
| [mcp-site](./mcp-site) | [![npm](https://img.shields.io/npm/v/kobana-mcp-site.svg)](https://www.npmjs.com/package/kobana-mcp-site) | 2 | Website content search (no auth required) |
| [mcp-transfer](./mcp-transfer) | [![npm](https://img.shields.io/npm/v/kobana-mcp-transfer.svg)](https://www.npmjs.com/package/kobana-mcp-transfer) | 16 | Pix, TED, internal transfers |

**Total: 158 tools across 10 MCP servers**

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

# Help (help center articles - no auth required)
npx kobana-mcp-help

# Mailbox (mailbox entries, files, channels)
KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-mailbox

# Site (website content search - no auth required)
npx kobana-mcp-site

# Payment (bank billets, pix, darf, taxes, utilities)
KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-payment

# Transfer (pix, ted, internal transfers)
KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-transfer
```

## Using with MCP clients

There are two ways to consume these servers, and each client below supports
one or both.

1. **Remote Custom Connector (recommended).** Point the client at the hosted
   MCP server: `https://mcp.kobana.com.br/{namespace}/mcp`. The endpoint
   implements OAuth 2.1 + PKCE + Dynamic Client Registration, so the user
   never pastes a client id/secret — the client negotiates everything with
   Kobana automatically in the browser. Each namespace is its own connector;
   add only the ones you need.
2. **Local stdio via `npx`.** Run each server locally as a child process from
   its npm package (see [Quick Start with npx](#quick-start-with-npx)).
   Requires a personal `KOBANA_ACCESS_TOKEN`. Works with every MCP client,
   including ones that do not yet support remote MCP or OAuth.

### Remote endpoints

| Namespace | Remote URL |
|---|---|
| Admin     | `https://mcp.kobana.com.br/admin/mcp` |
| Charge    | `https://mcp.kobana.com.br/charge/mcp` |
| Data      | `https://mcp.kobana.com.br/data/mcp` |
| EDI       | `https://mcp.kobana.com.br/edi/mcp` |
| Financial | `https://mcp.kobana.com.br/financial/mcp` |
| Mailbox   | `https://mcp.kobana.com.br/mailbox/mcp` |
| Payment   | `https://mcp.kobana.com.br/payment/mcp` |
| Transfer  | `https://mcp.kobana.com.br/transfer/mcp` |

> `kobana-mcp-help` and `kobana-mcp-site` are not exposed remotely (they do
> not need authentication and are best run locally via npx).
>
> For the sandbox, swap `mcp.kobana.com.br` for `mcp-sandbox.kobana.com.br`.

The examples below use the `financial` namespace. Every other namespace works
the same way — just change the path (`/charge/mcp`, `/payment/mcp`, etc.) or
the npm package name (`kobana-mcp-charge`, `kobana-mcp-payment`, etc.).

### Claude Desktop

**Remote (recommended).** Settings → **Connectors → Add Custom Connector**.
Paste the URL, leave the Advanced settings empty, click **Add**, and complete
the Kobana login in the browser window that opens.

- URL: `https://mcp.kobana.com.br/financial/mcp`

**Local (stdio).** Edit your desktop config file:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "kobana-financial": {
      "command": "npx",
      "args": ["-y", "kobana-mcp-financial"],
      "env": {
        "KOBANA_ACCESS_TOKEN": "your_access_token",
        "KOBANA_API_BASE_URL": "https://api.kobana.com.br"
      }
    }
  }
}
```

For sandbox, set `KOBANA_API_BASE_URL=https://api-sandbox.kobana.com.br`.

### Claude.ai (web)

Customize → **Connectors → +** (Add custom connector). Paste the URL, leave
Advanced settings empty, click Add. OAuth happens in a new browser tab. The
connector is then available in every claude.ai conversation on your account.

- URL: `https://mcp.kobana.com.br/financial/mcp`

Available on Free, Pro, Max, Team, and Enterprise plans. Free accounts are
limited to one custom connector at a time.

### Claude Code (CLI)

Use the built-in `claude mcp add` command with `--transport http`:

```bash
# Remote with automatic OAuth
claude mcp add --transport http kobana-financial https://mcp.kobana.com.br/financial/mcp

# Local stdio with a personal token
claude mcp add kobana-financial -- npx -y kobana-mcp-financial \
  --env KOBANA_ACCESS_TOKEN=your_access_token
```

On first tool use, Claude Code opens the browser to complete OAuth (Dynamic
Client Registration is handled automatically). If your firewall blocks random
localhost ports, use `--callback-port <port>` to pin the OAuth callback port.

### ChatGPT (Pro/Business/Enterprise/Edu)

1. Settings → **Apps & Connectors → Advanced settings** → enable **Developer
   Mode** (required to add custom MCP servers in regular chats).
2. Back in **Apps & Connectors**, click **Add → MCP server**.
3. Fill in the form:
   - **URL**: `https://mcp.kobana.com.br/financial/mcp`
   - **Authentication**: `OAuth`
   - **Name**: `Kobana Financial` (or whatever you prefer)
4. Save. ChatGPT opens a browser tab to complete the Kobana login.

> Developer Mode must be on for the MCP server to appear in regular
> conversations; otherwise it is only usable from Deep Research mode.

### Cursor

**UI.** Settings → **Tools & MCP → New MCP Server**. A dialog opens with
fields for name, transport, and URL. Choose HTTP and paste the remote URL.

**Config file.** Or edit `~/.cursor/mcp.json` (global) or
`.cursor/mcp.json` (per-project):

```json
{
  "mcpServers": {
    "kobana-financial": {
      "url": "https://mcp.kobana.com.br/financial/mcp"
    }
  }
}
```

On first use, Cursor opens the browser for OAuth and stores the resulting
credentials locally.

### VS Code (GitHub Copilot / MCP)

Edit `.vscode/mcp.json` (workspace) or your user-scope `mcp.json`:

```json
{
  "servers": {
    "kobana-financial": {
      "type": "http",
      "url": "https://mcp.kobana.com.br/financial/mcp"
    }
  }
}
```

VS Code tries the Streamable HTTP transport first and falls back to SSE if
the server does not support it. OAuth is handled by the editor on first use;
you do not need to paste headers.

### Windsurf

Edit `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "kobana-financial": {
      "serverUrl": "https://mcp.kobana.com.br/financial/mcp"
    }
  }
}
```

> Windsurf uses `serverUrl` (not `url`) for remote servers. After saving,
> **quit Windsurf completely and reopen it** — closing the editor window is
> not enough to reload MCP servers.

You can also open the config from the UI with `Cmd/Ctrl + ,` → search for
"MCP" → Open `mcp_config.json`.

### Manus

Settings → **Connectors → Add Connectors → Custom MCP**. Either fill in the
form manually or paste a JSON block:

```json
{
  "mcpServers": {
    "kobana-financial": {
      "transport": "http",
      "url": "https://mcp.kobana.com.br/financial/mcp"
    }
  }
}
```

> If Manus has trouble completing the OAuth discovery handshake (the
> `manus-mcp-cli` bridge historically preferred bearer tokens over DCR), fall
> back to a static token by adding an explicit `Authorization` header:
>
> ```json
> {
>   "mcpServers": {
>     "kobana-financial": {
>       "transport": "http",
>       "url": "https://mcp.kobana.com.br/financial/mcp",
>       "headers": {
>         "Authorization": "Bearer your_access_token"
>       }
>     }
>   }
> }
> ```

### Perplexity (Pro/Max/Enterprise)

Settings → **Connectors → Add → Custom Connector**. Fill in:

- **Name**: `Kobana Financial`
- **URL**: `https://mcp.kobana.com.br/financial/mcp`
- **Authentication**: `OAuth 2.0`
- **Transport**: `Streamable HTTP`

Because the server exposes `/.well-known/oauth-authorization-server` and
supports Dynamic Client Registration, Perplexity discovers the endpoints and
registers itself automatically — leave the Client ID / Client Secret fields
empty. The connector is private to your Perplexity account; Enterprise admins
can share it organization-wide from their settings panel.

## Configuration

### Required for Local/stdio Mode

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `KOBANA_ACCESS_TOKEN` | Yes | - | Bearer access token for Kobana API |
| `KOBANA_API_BASE_URL` | No | `https://api.kobana.com.br` | Base URL for Kobana API |

### Additional for OAuth 2.1 (Unified Remote Server)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `KOBANA_OAUTH_CLIENT_ID` | For OAuth | - | OAuth Client ID from Kobana |
| `KOBANA_OAUTH_CLIENT_SECRET` | For OAuth | - | OAuth Client Secret |
| `REDIS_URL` | For OAuth | - | Redis connection URL for session storage |
| `APP_ENVIRONMENT` | No | `production` | Environment name (`sandbox` or `production`) |
| `KOBANA_APP_BASE_URL` | No | `https://app.kobana.com.br` | Kobana app base URL (used in OAuth flow) |
| `MCP_SERVER_URL` | No | `https://mcp.kobana.com.br` | Your MCP server URL |

> **Note**: Redis is required for OAuth. Keys are prefixed with environment (e.g., `mcp:sandbox:*`), allowing shared Redis between environments.

## Streamable HTTP Mode (Hosted)

For remote deployments, each server has an HTTP mode using the Streamable HTTP transport (MCP specification compliant):

```bash
PORT=3000 KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-admin-http
PORT=3001 KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-charge-http
PORT=3002 KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-data-http
PORT=3003 KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-edi-http
PORT=3004 KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-financial-http
PORT=3006 KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-payment-http
PORT=3007 KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-transfer-http
PORT=3005 npx kobana-mcp-help-http
PORT=3008 npx kobana-mcp-site-http
PORT=3009 KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-mailbox-http
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

### kobana-mcp-help (2 tools)

| Tool | Description |
|------|-------------|
| `search_articles` | Search for help articles in the Kobana Help Center |
| `get_article` | Get the full content of a help article in Markdown format |

### kobana-mcp-site (2 tools)

| Tool | Description |
|------|-------------|
| `search_pages` | Search for pages on the Kobana website by term |
| `get_page` | Get the full content of a page with its live URL |

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

### kobana-mcp-mailbox (41 tools)

#### Mailbox Entries
| Tool | Description |
|------|-------------|
| `list_mailbox_entries` | List all mailbox entries |
| `get_mailbox_entry` | Get a specific mailbox entry |
| `create_mailbox_entry` | Create a new mailbox entry |
| `update_mailbox_entry` | Update a mailbox entry |
| `delete_mailbox_entry` | Delete a mailbox entry |

#### Mailbox Files
| Tool | Description |
|------|-------------|
| `list_mailbox_files` | List all mailbox files |
| `get_mailbox_file` | Get a specific mailbox file |
| `create_mailbox_file` | Upload a file to a mailbox entry |
| `update_mailbox_file` | Update mailbox file metadata |
| `delete_mailbox_file` | Delete a mailbox file |

#### Email Channel
| Tool | Description |
|------|-------------|
| `get_mailbox_email_channel` | Get email channel configuration |
| `create_mailbox_email_channel` | Create an email channel |
| `update_mailbox_email_channel` | Update email channel |
| `delete_mailbox_email_channel` | Delete email channel |
| `activate_mailbox_email_channel` | Activate email channel |
| `deactivate_mailbox_email_channel` | Deactivate email channel |

#### S3 Channel
| Tool | Description |
|------|-------------|
| `get_mailbox_s3_channel` | Get S3 channel configuration |
| `create_mailbox_s3_channel` | Create an S3 channel |
| `delete_mailbox_s3_channel` | Delete S3 channel |
| `activate_mailbox_s3_channel` | Activate S3 channel |
| `deactivate_mailbox_s3_channel` | Deactivate S3 channel |
| `update_mailbox_s3_credentials` | Update AWS credentials |

#### SFTP Channel
| Tool | Description |
|------|-------------|
| `get_mailbox_sftp_channel` | Get SFTP channel configuration |
| `create_mailbox_sftp_channel` | Create an SFTP channel |
| `update_mailbox_sftp_channel` | Update SFTP channel |
| `delete_mailbox_sftp_channel` | Delete SFTP channel |
| `activate_mailbox_sftp_channel` | Activate SFTP channel |
| `deactivate_mailbox_sftp_channel` | Deactivate SFTP channel |
| `fetch_mailbox_sftp_files` | Fetch files from SFTP server |
| `update_mailbox_sftp_credentials` | Update SSH credentials |

#### WhatsApp Channel
| Tool | Description |
|------|-------------|
| `get_mailbox_whatsapp_channel` | Get WhatsApp channel configuration |
| `create_mailbox_whatsapp_channel` | Create a WhatsApp channel |
| `update_mailbox_whatsapp_channel` | Update WhatsApp channel |
| `delete_mailbox_whatsapp_channel` | Delete WhatsApp channel |
| `activate_mailbox_whatsapp_channel` | Activate WhatsApp channel |
| `deactivate_mailbox_whatsapp_channel` | Deactivate WhatsApp channel |

#### Syncthing Channel
| Tool | Description |
|------|-------------|
| `get_mailbox_syncthing_channel` | Get Syncthing channel configuration |
| `create_mailbox_syncthing_channel` | Create a Syncthing channel |
| `update_mailbox_syncthing_channel` | Update Syncthing channel |
| `delete_mailbox_syncthing_channel` | Delete Syncthing channel |
| `activate_mailbox_syncthing_channel` | Activate Syncthing channel |
| `deactivate_mailbox_syncthing_channel` | Deactivate Syncthing channel |
| `resend_mailbox_syncthing_invites` | Resend Syncthing invites |
| `update_mailbox_syncthing_status` | Update Syncthing server status |

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
├── package.json            # Monorepo root (npm workspaces)
├── vercel.json             # Vercel deployment config
├── specs/                  # API specifications (OpenAPI)
├── docs/
│   └── instructions.md
├── mcp-admin/              # kobana-mcp-admin package
├── mcp-charge/             # kobana-mcp-charge package
├── mcp-data/               # kobana-mcp-data package
├── mcp-edi/                # kobana-mcp-edi package
├── mcp-financial/          # kobana-mcp-financial package
├── mcp-help/               # kobana-mcp-help package
├── mcp-mailbox/            # kobana-mcp-mailbox package
├── mcp-payment/            # kobana-mcp-payment package
├── mcp-site/               # kobana-mcp-site package
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
    ├── http-server.ts     # Streamable HTTP entry point
    ├── server.ts          # MCP server
    ├── config.ts          # Configuration
    ├── api/               # API clients
    ├── tools/             # MCP tools
    └── types/             # TypeScript types & Zod schemas
```

## Unified Remote MCP Server

The unified remote MCP server is deployed at `mcp.kobana.com.br` — a single
Vercel function that fans out to all 8 namespaces under `/{namespace}/mcp`,
with OAuth 2.1 / PKCE and Redis-backed sessions.

### Endpoints

Once deployed to `mcp.kobana.com.br`:

| Namespace | MCP Endpoint | Description |
|-----------|--------------|-------------|
| Admin | `mcp.kobana.com.br/admin/mcp` | Certificates, connections, users |
| Charge | `mcp.kobana.com.br/charge/mcp` | Pix charges, accounts |
| Data | `mcp.kobana.com.br/data/mcp` | Bank billet queries |
| EDI | `mcp.kobana.com.br/edi/mcp` | EDI boxes |
| Financial | `mcp.kobana.com.br/financial/mcp` | Accounts, balances |
| Help | `mcp.kobana.com.br/help/mcp` | Help Center articles |
| Mailbox | `mcp.kobana.com.br/mailbox/mcp` | Mailbox entries, files, channels |
| Payment | `mcp.kobana.com.br/payment/mcp` | Bank billets, taxes |
| Transfer | `mcp.kobana.com.br/transfer/mcp` | Pix, TED, internal |

The server uses the Streamable HTTP transport, which is stateless and serverless-compatible.

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

### npm Packages

- [kobana-mcp-admin](https://www.npmjs.com/package/kobana-mcp-admin)
- [kobana-mcp-charge](https://www.npmjs.com/package/kobana-mcp-charge)
- [kobana-mcp-data](https://www.npmjs.com/package/kobana-mcp-data)
- [kobana-mcp-edi](https://www.npmjs.com/package/kobana-mcp-edi)
- [kobana-mcp-financial](https://www.npmjs.com/package/kobana-mcp-financial)
- [kobana-mcp-help](https://www.npmjs.com/package/kobana-mcp-help)
- [kobana-mcp-mailbox](https://www.npmjs.com/package/kobana-mcp-mailbox)
- [kobana-mcp-payment](https://www.npmjs.com/package/kobana-mcp-payment)
- [kobana-mcp-site](https://www.npmjs.com/package/kobana-mcp-site)
- [kobana-mcp-transfer](https://www.npmjs.com/package/kobana-mcp-transfer)

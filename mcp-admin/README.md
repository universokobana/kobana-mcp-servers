# Kobana MCP Admin Server

MCP (Model Context Protocol) server for Kobana Admin API v2. This server provides tools for managing users, subaccounts, connections, and certificates in the Kobana platform.

## Features

- **Users Management**: Create, list, update, and delete users with specific permissions
- **Subaccounts Management**: Create and manage child accounts with their own configurations
- **Certificates Management**: Upload and manage digital certificates for bank API integrations
- **Connections Management**: Configure and manage connections to financial providers (banks)

## Installation

```bash
npm install kobana-mcp-admin
```

## Configuration

Set the following environment variable:

```bash
export KOBANA_ACCESS_TOKEN="your-access-token"
```

Optional:
```bash
export KOBANA_API_URL="https://api.kobana.com.br"  # Default
```

## Usage

### As a CLI (stdio transport)

```bash
npx kobana-mcp-admin
```

### As an HTTP server (SSE transport)

```bash
npx kobana-mcp-admin-http
```

Or with custom port:
```bash
PORT=8080 npx kobana-mcp-admin-http
```

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "kobana-admin": {
      "command": "npx",
      "args": ["kobana-mcp-admin"],
      "env": {
        "KOBANA_ACCESS_TOKEN": "your-access-token"
      }
    }
  }
}
```

## Available Tools

### Users

| Tool | Description |
|------|-------------|
| `list_admin_users` | List all users with optional email filter |
| `create_admin_user` | Create a new user with email and permissions |
| `update_admin_user` | Update user details and permissions |
| `delete_admin_user` | Delete a user from the account |

### Subaccounts

| Tool | Description |
|------|-------------|
| `list_admin_subaccounts` | List all subaccounts with filters |
| `create_admin_subaccount` | Create a new subaccount |
| `get_admin_subaccount` | Get subaccount details by ID |
| `update_admin_subaccount` | Update subaccount information |

### Certificates

| Tool | Description |
|------|-------------|
| `list_admin_certificates` | List all uploaded certificates |
| `create_admin_certificate` | Upload a new certificate (CRT or PFX) |

### Connections

| Tool | Description |
|------|-------------|
| `list_admin_connections` | List all bank connections |
| `create_admin_connection` | Create a new bank connection |
| `get_admin_connection` | Get connection details by UID |
| `update_admin_connection` | Update connection credentials |
| `delete_admin_connection` | Delete a connection |
| `create_admin_connection_association` | Link a service account to a connection |
| `delete_admin_connection_association` | Unlink a service account from a connection |

## Examples

### Create a User

```json
{
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "permissions": ["charge.pix.*", "charge.bank_billets.basic"]
}
```

### Create a Subaccount

```json
{
  "nickname": "Client ABC",
  "email": "client@example.com",
  "business_cnpj": "12.345.678/0001-90",
  "business_legal_name": "Client ABC Ltda"
}
```

### Create a Connection

```json
{
  "provider_slug": "banco_do_brasil",
  "environment": "production",
  "credentials": {
    "client_id": "your-client-id",
    "client_secret": "your-client-secret"
  },
  "apis": ["charge/pix", "charge/bank_billet"]
}
```

### Associate a Pix Account to a Connection

```json
{
  "connection_uid": "018df180-7208-727b-a10a-ea545e4a75a8",
  "resource": {
    "slug": "charge.pix_account",
    "uid": "14a31e1b-6fa5-4825-8e54-61579842d520"
  }
}
```

## HTTP API Endpoints

When running as an HTTP server:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Server information |
| `/health` | GET | Health check |
| `/sse` | GET | SSE connection endpoint |
| `/messages` | POST | Message handling endpoint |

## Authentication

### Stdio Transport
Uses the `KOBANA_ACCESS_TOKEN` environment variable.

### HTTP Transport
Supports both:
- `Authorization: Bearer <token>` header
- `KOBANA_ACCESS_TOKEN` environment variable as fallback

## License

MIT

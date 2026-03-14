# Kobana MCP Mailbox Server

MCP (Model Context Protocol) server for the Kobana Mailbox API v2. This server enables AI assistants to manage mailbox entries, files, and communication channels (email, S3, SFTP, WhatsApp, Syncthing).

## Features

- Create and manage mailbox entries (caixas postais)
- Upload, list, and manage mailbox files
- Configure and control email channels
- Configure and control S3 channels (AWS Cognito)
- Configure and control SFTP channels
- Configure and control WhatsApp channels
- Configure and control Syncthing channels
- Activate/deactivate channels independently
- Both stdio and HTTP/SSE transports supported
- Bearer token authentication

## Installation

```bash
npm install kobana-mcp-mailbox
```

Or install globally:

```bash
npm install -g kobana-mcp-mailbox
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
kobana-mcp-mailbox
```

### HTTP Transport (for web applications)

```bash
kobana-mcp-mailbox-http
```

The HTTP server will start on port 3001 by default. Customize with:

```bash
PORT=3001 HOST=0.0.0.0 kobana-mcp-mailbox-http
```

## Claude Desktop Configuration

Add to your Claude Desktop configuration file:

```json
{
  "mcpServers": {
    "kobana-mailbox": {
      "command": "npx",
      "args": ["kobana-mcp-mailbox"],
      "env": {
        "KOBANA_ACCESS_TOKEN": "your_access_token_here"
      }
    }
  }
}
```

## Available Tools

### Mailbox Entries

- `list_mailbox_entries` - List all mailbox entries with pagination
- `get_mailbox_entry` - Get details of a specific mailbox entry
- `create_mailbox_entry` - Create a new mailbox entry (document, import_export, or edi_cnab)
- `update_mailbox_entry` - Update an existing mailbox entry
- `delete_mailbox_entry` - Delete a mailbox entry

### Mailbox Files

- `list_mailbox_files` - List all mailbox files across entries
- `get_mailbox_file` - Get details of a specific file
- `create_mailbox_file` - Upload a file to a mailbox entry (Base64)
- `update_mailbox_file` - Update file metadata
- `delete_mailbox_file` - Delete a file

### Email Channel

- `get_mailbox_email_channel` - Get email channel configuration
- `create_mailbox_email_channel` - Create email channel with inbox/outbox addresses
- `update_mailbox_email_channel` - Update email channel configuration
- `delete_mailbox_email_channel` - Delete email channel (must deactivate first)
- `activate_mailbox_email_channel` - Activate the email channel
- `deactivate_mailbox_email_channel` - Deactivate the email channel

### S3 Channel

- `get_mailbox_s3_channel` - Get S3 channel configuration and AWS connection details
- `create_mailbox_s3_channel` - Create S3 channel (AWS Cognito credentials auto-generated)
- `delete_mailbox_s3_channel` - Delete S3 channel (must deactivate first)
- `activate_mailbox_s3_channel` - Activate the S3 channel
- `deactivate_mailbox_s3_channel` - Deactivate the S3 channel
- `update_mailbox_s3_credentials` - Queue AWS credentials update

### SFTP Channel

- `get_mailbox_sftp_channel` - Get SFTP channel configuration
- `create_mailbox_sftp_channel` - Create SFTP channel with server details
- `update_mailbox_sftp_channel` - Update SFTP username and SSH key
- `delete_mailbox_sftp_channel` - Delete SFTP channel (must deactivate first)
- `activate_mailbox_sftp_channel` - Activate the SFTP channel
- `deactivate_mailbox_sftp_channel` - Deactivate the SFTP channel
- `fetch_mailbox_sftp_files` - Queue file retrieval from SFTP server
- `update_mailbox_sftp_credentials` - Queue SSH credentials update

### WhatsApp Channel

- `get_mailbox_whatsapp_channel` - Get WhatsApp channel configuration
- `create_mailbox_whatsapp_channel` - Create WhatsApp channel with phone numbers
- `update_mailbox_whatsapp_channel` - Update WhatsApp channel configuration
- `delete_mailbox_whatsapp_channel` - Delete WhatsApp channel (must deactivate first)
- `activate_mailbox_whatsapp_channel` - Activate the WhatsApp channel
- `deactivate_mailbox_whatsapp_channel` - Deactivate the WhatsApp channel

### Syncthing Channel

- `get_mailbox_syncthing_channel` - Get Syncthing channel configuration
- `create_mailbox_syncthing_channel` - Create Syncthing channel with device and folder IDs
- `update_mailbox_syncthing_channel` - Update Syncthing device name and ID
- `delete_mailbox_syncthing_channel` - Delete Syncthing channel (must deactivate first)
- `activate_mailbox_syncthing_channel` - Activate the Syncthing channel
- `deactivate_mailbox_syncthing_channel` - Deactivate the Syncthing channel
- `resend_mailbox_syncthing_invites` - Queue resending Syncthing invites
- `update_mailbox_syncthing_status` - Queue Syncthing server status check

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
| Mailbox Entries | `mailbox.entries` |
| Mailbox Files | `mailbox.files` |
| Email Channel | `mailbox.entries` |
| S3 Channel | `mailbox.entries` |
| SFTP Channel | `mailbox.entries` |
| WhatsApp Channel | `mailbox.entries` |
| Syncthing Channel | `mailbox.entries` |

Request only the scopes needed for your use case. For full access to all mailbox features, include all scopes above.

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

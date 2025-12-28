# Kobana MCP Data Server

MCP (Model Context Protocol) server for the Kobana Data API v2. This server provides tools for querying bank billet (boleto) information using the typeable line (linha digitavel) or barcode.

## Features

- Query bank billet information by typeable line or barcode
- Get detailed information including amounts, expiration date, beneficiary, payer, fine, interest, and discount
- List all bank billet queries with filtering and pagination
- Support for both stdio and HTTP transports
- Bearer token authentication

## Installation

```bash
npm install kobana-mcp-data
```

Or install globally:

```bash
npm install -g kobana-mcp-data
```

## Configuration

Set the following environment variables:

- `KOBANA_ACCESS_TOKEN` (required): Your Kobana API access token
- `KOBANA_API_URL` (optional): API base URL (defaults to `https://api.kobana.com.br`)

## Usage

### Stdio Transport (for Claude Desktop)

```bash
KOBANA_ACCESS_TOKEN=your_token kobana-mcp-data
```

### HTTP Transport

```bash
KOBANA_ACCESS_TOKEN=your_token kobana-mcp-data-http
```

Or with custom port:

```bash
PORT=8080 KOBANA_ACCESS_TOKEN=your_token kobana-mcp-data-http
```

### Claude Desktop Configuration

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "kobana-data": {
      "command": "npx",
      "args": ["kobana-mcp-data"],
      "env": {
        "KOBANA_ACCESS_TOKEN": "your_access_token_here"
      }
    }
  }
}
```

## Available Tools

### list_data_bank_billet_queries

List all bank billet queries with optional filters.

**Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 50, max: 50)
- `status` (optional): Filter by status (pending, success, error)
- `external_id` (optional): Filter by external ID
- `tags` (optional): Filter by tags (comma-separated)
- `created_from` (optional): Filter by minimum creation date (ISO 8601)
- `created_to` (optional): Filter by maximum creation date (ISO 8601)

**Example:**
```json
{
  "status": "success",
  "page": 1,
  "per_page": 10
}
```

### create_data_bank_billet_query

Create a new bank billet query using the typeable line (linha digitavel) or barcode.

**Parameters:**
- `line_or_barcode` (required): Typeable line or barcode of the bank billet
- `external_id` (optional): External ID in your system for internal control
- `custom_data` (optional): Custom data as a JSON object with key-value pairs
- `tags` (optional): Tags associated with the query

**Example:**
```json
{
  "line_or_barcode": "34191.79001 01043.510047 91020.150008 7 75870000001000",
  "external_id": "my-internal-id-123",
  "tags": ["payment", "monthly"]
}
```

**Response includes:**
- Query status (pending, success, error)
- Bank billet details (when successful):
  - Amounts (current, minimum, maximum, original)
  - Expiration date
  - Beneficiary information
  - Payer information
  - Fine, interest, and discount information

## HTTP Endpoints

When running in HTTP mode:

- `GET /` - Server information
- `GET /health` - Health check
- `GET /sse` - SSE connection for MCP protocol
- `POST /messages?sessionId=<id>` - Send messages to MCP server

### Authentication

For HTTP transport, you can authenticate in two ways:

1. Environment variable: Set `KOBANA_ACCESS_TOKEN`
2. HTTP header: Send `Authorization: Bearer <token>`

Optionally, you can override the API URL with the `X-Kobana-Api-Url` header.

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

# Kobana MCP Site

MCP server for searching and reading content from the Kobana website (www.kobana.com.br).

## Features

- **search_pages**: Search for pages containing a specific term
- **get_page**: Get the full content of a specific page with its live URL

## Installation

```bash
npm install kobana-mcp-site
```

## Usage

### Claude Desktop (stdio mode)

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "kobana-site": {
      "command": "npx",
      "args": ["kobana-mcp-site"]
    }
  }
}
```

### HTTP Mode (Streamable HTTP)

```bash
npm run start:http
```

Endpoints:
- `POST /mcp` - Streamable HTTP MCP endpoint (auth per request)
- `GET /health` - Health check
- `GET /` - Server info

## Tools

### search_pages

Search for pages on the Kobana website by a search term.

**Parameters:**
- `query` (required): Search term to look for
- `language` (optional): Filter by language (`pt` or `en`)
- `limit` (optional): Maximum results to return (default: 10, max: 50)

**Example:**
```json
{
  "query": "boleto",
  "language": "pt",
  "limit": 5
}
```

### get_page

Get the full content of a specific page.

**Parameters:**
- `path` (required): Path to the page file (e.g., `pt/recursos/boleto.md`)

**Example:**
```json
{
  "path": "pt/recursos/boleto.md"
}
```

**Response includes:**
- `path`: File path in the cache
- `url`: Live URL on the Kobana website
- `title`: Page title
- `content`: Full markdown content
- `language`: Page language (pt or en)

## Cache

On first run, the server downloads the site content from:
```
https://www.kobana.com.br/kobana-site-markdown.zip
```

The content is cached in the user's cache directory:
- **macOS**: `~/Library/Caches/kobana-mcp-site`
- **Linux**: `~/.cache/kobana-mcp-site`
- **Windows**: `%LOCALAPPDATA%\kobana-mcp-site`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `KOBANA_SITE_ZIP_URL` | URL to download site content | `https://www.kobana.com.br/kobana-site-markdown.zip` |
| `KOBANA_SITE_BASE_URL` | Base URL for generated links | `https://www.kobana.com.br` |
| `PORT` | HTTP server port | `3001` |
| `HOST` | HTTP server host (loopback by default) | `127.0.0.1` |

## URL Format

URLs are generated based on the page language:
- Portuguese: `https://www.kobana.com.br/{path}`
- English: `https://www.kobana.com.br/en/{path}`

## License

MIT

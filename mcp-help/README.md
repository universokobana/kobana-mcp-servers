# Kobana MCP Help Server

MCP Server for Kobana Help Center - search and view help articles from [ajuda.kobana.com.br](https://ajuda.kobana.com.br).

## Features

- Search for help articles by keyword
- Get full article content in Markdown format
- No authentication required

## Installation

```bash
npm install kobana-mcp-help
```

## Tools

### search_articles

Search for help articles in the Kobana Help Center.

**Parameters:**
- `query` (string, required): Search query to find articles

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "boleto",
    "results": [
      {
        "id": "8851219",
        "title": "Layouts de boletos, carnês, boletos fatura e envelopes",
        "description": "Saiba mais sobre os layouts disponíveis",
        "url": "https://ajuda.kobana.com.br/pt-BR/articles/8851219-layouts-de-boletos"
      }
    ],
    "total": 1
  }
}
```

### get_article

Get the full content of a help article in Markdown format.

**Parameters:**
- `url` (string, required): Full URL of the article to retrieve

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "8851219",
    "title": "Layouts de boletos, carnês, boletos fatura e envelopes",
    "url": "https://ajuda.kobana.com.br/pt-BR/articles/8851219-layouts-de-boletos",
    "content": "# Layouts de boletos\n\nConteúdo do artigo em Markdown...",
    "relatedArticles": [
      {
        "id": "8820979",
        "title": "O que é carteira de recebimento?",
        "url": "https://ajuda.kobana.com.br/pt-BR/articles/8820979"
      }
    ]
  }
}
```

## Usage

### Stdio Mode (Claude Desktop)

```bash
npx kobana-mcp-help
```

### HTTP Mode

```bash
npx kobana-mcp-help-http
```

Or with custom port:

```bash
PORT=3008 npx kobana-mcp-help-http
```

## Configuration

| Variable | Required | Default |
|----------|----------|---------|
| `KOBANA_HELP_URL` | No | `https://ajuda.kobana.com.br` |
| `KOBANA_HELP_LOCALE` | No | `pt-BR` |
| `PORT` | No | `3008` |

## Claude Desktop Configuration

Add to your Claude Desktop config file:

```json
{
  "mcpServers": {
    "kobana-help": {
      "command": "npx",
      "args": ["kobana-mcp-help"]
    }
  }
}
```

## License

MIT

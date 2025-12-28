# Kobana MCP Servers

MCP (Model Context Protocol) servers for the Kobana API v2. These servers enable AI assistants to interact with the Kobana financial automation platform.

## About Kobana

Kobana is a financial automation platform. Learn more at: https://www.kobana.com.br

## Available MCP Servers

| Server | npm Package | Namespace | Description |
|--------|-------------|-----------|-------------|
| [mcp-charge](./mcp-charge) | `kobana-mcp-charge` | `charge` | Pix payments and accounts |

## Quick Start with npx

The easiest way to use these MCP servers is with `npx`:

```bash
# Pix Payments (charge namespace)
KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-charge
```

## Usage with Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "kobana-charge": {
      "command": "npx",
      "args": ["-y", "kobana-mcp-charge"],
      "env": {
        "KOBANA_ACCESS_TOKEN": "your_access_token"
      }
    }
  }
}
```

### Sandbox Environment

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

For remote deployments, use the HTTP mode:

```bash
PORT=3000 KOBANA_ACCESS_TOKEN=your_token npx kobana-mcp-charge-http
```

## API Reference

- **Production API**: https://api.kobana.com.br
- **Sandbox API**: https://api-sandbox.kobana.com.br
- **API Specification**: https://github.com/universokobana/kobana-api-specs

## Available Tools

### kobana-mcp-charge

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
| `delete_charge_pix` | Delete a Pix charge |
| `update_charge_pix` | Update a Pix charge |
| `cancel_charge_pix` | Cancel a Pix charge |

#### Pix Commands

| Tool | Description |
|------|-------------|
| `list_charge_pix_commands` | List commands for a Pix charge |
| `get_charge_pix_command` | Get a specific command |

## Project Structure

```
kobana-mcp-server/
├── README.md               # This file
├── servers.json            # Server definitions
├── docs/
│   ├── instructions.md     # Development instructions
│   └── implementation-plan.md
└── mcp-charge/             # kobana-mcp-charge package
    ├── README.md
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts        # stdio entry point
        ├── http-server.ts  # HTTP entry point
        ├── server.ts       # MCP server
        ├── config.ts
        ├── api/            # API clients
        ├── tools/          # MCP tools
        └── types/          # TypeScript types
```

## Development

### Building from Source

```bash
git clone https://github.com/universokobana/kobana-mcp-servers.git
cd kobana-mcp-servers/mcp-charge
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
- [API V2 Specification](https://raw.githubusercontent.com/universokobana/kobana-api-specs/main/swagger/v2_0/kobana-api-v2_0-openapi-3_1.json)
- [GitHub Repository](https://github.com/universokobana/kobana-mcp-servers)

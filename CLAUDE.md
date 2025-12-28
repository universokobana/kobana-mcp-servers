# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kobana MCP Servers is a monorepo containing 7 Model Context Protocol (MCP) servers providing AI-native access to the Kobana financial automation API v2. Each server handles a specific domain: admin, charge, data, edi, financial, payment, and transfer.

## Commands

```bash
# Build all packages
npm run build

# Build single package
cd mcp-financial && npm run build

# Development with watch mode
cd mcp-financial && npm run dev

# Run stdio MCP server (for Claude Desktop)
KOBANA_ACCESS_TOKEN=token npx kobana-mcp-financial

# Run HTTP server (for Vercel/hosted deployment)
cd mcp-financial && npm run start:http

# Clean build artifacts
cd mcp-financial && npm run clean

# Build and run Vercel unified server
cd vercel-mcp && npm run build && npm run start
```

## Architecture

### Package Structure

Each MCP package (`mcp-*/`) follows this structure:
- `src/index.ts` - Stdio transport entry point (with shebang for CLI)
- `src/http-server.ts` - HTTP/SSE transport entry point
- `src/server.ts` - Core MCP server with tool registration
- `src/config.ts` - Environment configuration loader
- `src/api/client.ts` - `KobanaApiClient` HTTP client with error handling
- `src/api/[resource].ts` - API methods grouped by resource
- `src/tools/[resource].ts` - Tool definitions with Zod schemas
- `src/types/schemas.ts` - Zod validation schemas
- `src/types/api.ts` - TypeScript interfaces

### Tool Definition Pattern

Tools follow a consistent structure:
```typescript
export const myTool: ToolDefinition = {
  name: '[action]_[namespace]_[resource]',  // e.g., list_financial_accounts
  description: 'Tool description',
  inputSchema: zodSchema,
  handler: async (client, args) => {
    try {
      const params = zodSchema.parse(args);
      const result = await apiMethod(client, params);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};
```

### Zod to JSON Schema Conversion

Each server implements `zodToJsonSchema()` in `server.ts` to convert Zod schemas to JSON Schema for MCP protocol compatibility. This function handles objects, strings, numbers, booleans, enums, arrays, and records.

### Transport Modes

1. **Stdio** (default): For Claude Desktop integration via `index.ts`
2. **HTTP/SSE**: For Vercel deployment via `http-server.ts` with endpoints `/sse`, `/messages`, `/health`

### Vercel Unified Server

`vercel-mcp/` aggregates all 7 servers with path-based routing:
- Paths: `/{namespace}/mcp` (e.g., `/financial/mcp`)
- Imports tools/clients dynamically from each package

## Configuration

| Variable | Required | Default |
|----------|----------|---------|
| `KOBANA_ACCESS_TOKEN` | Yes | - |
| `KOBANA_API_URL` | No | `https://api.kobana.com.br` |
| `PORT` | No | 3000 |

Sandbox environment: `https://api-sandbox.kobana.com.br`

## Key Conventions

- **Tool naming**: `[verb]_[namespace]_[resource]` (e.g., `create_financial_account`)
- **API paths**: `/v2/[namespace]/[resource]`
- **Error responses**: Always `{ success: false, error: string, details?: unknown }`
- **Success responses**: Always `{ success: true, data: unknown }`
- All inputs validated with Zod before API calls
- Bearer token authentication via `Authorization` header
- `X-Idempotency-Key` header supported for POST operations

## Adding New Tools

1. Add Zod schema in `src/types/schemas.ts`
2. Add API method in `src/api/[resource].ts`
3. Create tool definition in `src/tools/[resource].ts`
4. Export tool from `src/tools/index.ts`
5. Tool is automatically registered via the tools array in `server.ts`

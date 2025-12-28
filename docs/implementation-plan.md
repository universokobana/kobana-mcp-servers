# Kobana MCP Servers - Implementation Plan

## Overview

This document outlines the implementation plan for MCP (Model Context Protocol) servers that expose the Kobana API v2 endpoints as tools for AI assistants.

## API Analysis

### Source Documentation
- **API Specification**: https://raw.githubusercontent.com/universokobana/kobana-api-specs/main/swagger/v2_0/kobana-api-v2_0-openapi-3_1.json
- **API Version**: v2
- **Base URL Production**: https://api.kobana.com.br
- **Base URL Sandbox**: https://api-sandbox.kobana.com.br

### Namespaces Identified

Currently, the v2 API has **1 namespace**:

| Namespace | Description | Resources |
|-----------|-------------|-----------|
| `charge` | Billing/Charging operations | `pix_accounts`, `pix`, `pix_commands` |

## MCP Server: mcp-charge

### Resources

| Resource Name | Description |
|---------------|-------------|
| `charge_pix_accounts` | Pix account management for receiving payments |
| `charge_pix` | Pix charge/invoice management |
| `charge_pix_commands` | Command/operation history for Pix charges |

### Tools

#### Pix Accounts (charge_pix_accounts)

| Tool Name | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| `list_charge_pix_accounts` | GET | `/v2/charge/pix_accounts` | List all Pix accounts |
| `create_charge_pix_account` | POST | `/v2/charge/pix_accounts` | Create a new Pix account |
| `get_charge_pix_account` | GET | `/v2/charge/pix_accounts/{uid}` | Get a specific Pix account |
| `update_charge_pix_account` | PUT | `/v2/charge/pix_accounts/{uid}` | Update a Pix account |
| `delete_charge_pix_account` | DELETE | `/v2/charge/pix_accounts/{uid}` | Delete a Pix account |

#### Pix Charges (charge_pix)

| Tool Name | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| `list_charge_pix` | GET | `/v2/charge/pix` | List all Pix charges |
| `create_charge_pix` | POST | `/v2/charge/pix` | Create a new Pix charge |
| `get_charge_pix` | GET | `/v2/charge/pix/{uid}` | Get a specific Pix charge |
| `delete_charge_pix` | DELETE | `/v2/charge/pix/{uid}` | Delete a Pix charge |
| `update_charge_pix` | PUT | `/v2/charge/pix/{pix_uid}/update` | Update a Pix charge |
| `cancel_charge_pix` | PUT | `/v2/charge/pix/{pix_uid}/cancel` | Cancel a Pix charge |

#### Pix Commands (charge_pix_commands)

| Tool Name | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| `list_charge_pix_commands` | GET | `/v2/charge/pix/{pix_uid}/commands` | List commands for a Pix charge |
| `get_charge_pix_command` | GET | `/v2/charge/pix/{pix_uid}/commands/{id}` | Get a specific command |

## Project Structure

```
kobana-mcp-server/
├── docs/
│   ├── instructions.md
│   └── implementation-plan.md
├── mcp-charge/
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts              # Main entry point (stdio transport)
│   │   ├── server.ts             # MCP server implementation
│   │   ├── http-server.ts        # HTTP transport (Streamable HTTP + SSE)
│   │   ├── config.ts             # Configuration management
│   │   ├── api/
│   │   │   ├── client.ts         # HTTP client for Kobana API
│   │   │   ├── pix-accounts.ts   # Pix accounts API calls
│   │   │   ├── pix.ts            # Pix charges API calls
│   │   │   └── pix-commands.ts   # Pix commands API calls
│   │   ├── tools/
│   │   │   ├── index.ts          # Tools registration
│   │   │   ├── pix-accounts.ts   # Pix accounts tools
│   │   │   ├── pix.ts            # Pix tools
│   │   │   └── pix-commands.ts   # Pix commands tools
│   │   └── types/
│   │       ├── api.ts            # API response types
│   │       └── schemas.ts        # Zod schemas for validation
│   └── README.md
├── servers.json                   # Structure of all MCP servers
└── README.md                      # Main documentation
```

## Technical Specifications

### Technology Stack

- **Runtime**: Node.js >= 18
- **Language**: TypeScript
- **MCP SDK**: @modelcontextprotocol/sdk
- **HTTP Client**: Native fetch API
- **Validation**: Zod
- **Transport Modes**:
  - **Local**: stdio (standard input/output)
  - **Hosted**: Streamable HTTP + Legacy SSE

### Authentication

- **Type**: Bearer Token
- **Header**: `Authorization: Bearer <access_token>`
- **Environment Variable**: `KOBANA_ACCESS_TOKEN`
- **Configuration**:
  - `KOBANA_API_URL` - Base API URL (default: production)
  - `KOBANA_ACCESS_TOKEN` - Bearer access token

### Transport Implementations

#### 1. Local (stdio)
- Used when running the MCP server locally
- Communication via stdin/stdout
- Entry point: `src/index.ts`

#### 2. Hosted (HTTP)
- **Streamable HTTP**: Modern transport for bidirectional streaming
- **Legacy SSE**: Server-Sent Events for backwards compatibility
- Entry point: `src/http-server.ts`
- Default port: 3000

## Implementation Steps

### Phase 1: Project Setup
1. Initialize npm project with TypeScript
2. Install dependencies (@modelcontextprotocol/sdk, zod, typescript)
3. Configure TypeScript and build scripts
4. Set up configuration management

### Phase 2: API Client
1. Implement base HTTP client with authentication
2. Implement Pix accounts API methods
3. Implement Pix charges API methods
4. Implement Pix commands API methods

### Phase 3: MCP Tools
1. Define Zod schemas for all request/response types
2. Implement Pix accounts tools (5 tools)
3. Implement Pix charges tools (6 tools)
4. Implement Pix commands tools (2 tools)

### Phase 4: Server Integration
1. Create MCP server with tool registration
2. Implement stdio transport (local mode)
3. Implement HTTP transport (hosted mode)

### Phase 5: Documentation
1. Create mcp-charge README
2. Create main project README
3. Generate servers.json structure file

## API Schemas Reference

### Pix Account Schema

```typescript
interface PixAccount {
  uid: string;
  custom_name: string;
  financial_provider_slug: string;
  key: string;
  status: 'pending' | 'active' | 'failed';
  beneficiary: {
    document: string;
    name: string;
    address: {
      city: string;
      state: string;
    };
  };
  created_at: string;
  updated_at: string;
}
```

### Pix Charge Schema

```typescript
interface PixCharge {
  uid: string;
  txid: string;
  amount: number;
  status: 'pending' | 'registered' | 'paid' | 'canceled' | 'expired';
  pix_account_id: string;
  payer: {
    name: string;
    document_number: string;
  };
  expire_at: string;
  message?: string;
  tags?: string[];
  qrcode?: string;
  qrcode_text?: string;
  interest?: object;
  discounts?: object[];
  fine?: object;
  reduction?: object;
  created_at: string;
  updated_at: string;
}
```

### Pix Command Schema

```typescript
interface PixCommand {
  id: string;
  type: 'create' | 'update' | 'cancel';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  pix: PixCharge;
  error?: string;
  created_at: string;
  updated_at: string;
}
```

## Pagination

All list endpoints support pagination with:
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 50, max: 50)

Response includes pagination metadata in headers or response body.

## Error Handling

All tools should handle:
- 400: Bad Request - Invalid parameters
- 401: Unauthorized - Invalid or missing token
- 404: Not Found - Resource doesn't exist
- 422: Unprocessable Entity - Validation errors
- 429: Too Many Requests - Rate limiting
- 500: Internal Server Error

## Future Namespaces

As the Kobana API v2 expands, additional MCP servers can be created following the same pattern:

- `mcp-payment` - Payment operations (bank billets, transfers)
- `mcp-customer` - Customer management
- `mcp-webhook` - Webhook configuration
- etc.

Each namespace will have its own MCP server in a dedicated folder.

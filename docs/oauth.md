# OAuth 2.1 Authentication

This document describes the OAuth 2.1 implementation for the Kobana MCP unified server, enabling Claude Desktop to authenticate users automatically via Custom Connectors.

## Overview

The MCP server implements OAuth 2.1 with PKCE, delegating authentication to Kobana's OAuth server. This allows users to authorize access to their Kobana account directly from Claude Desktop.

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/.well-known/oauth-authorization-server` | GET | OAuth metadata discovery |
| `/authorize` | GET | Authorization endpoint |
| `/token` | POST | Token exchange endpoint |
| `/oauth/callback` | GET | Kobana OAuth callback (internal) |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `KOBANA_OAUTH_CLIENT_ID` | Yes | - | OAuth Client ID from Kobana |
| `KOBANA_OAUTH_CLIENT_SECRET` | Yes | - | OAuth Client Secret |
| `REDIS_URL` | Yes | - | Redis connection URL for session storage |
| `KOBANA_APP_URL` | No | `https://app.kobana.com.br` | Kobana app URL |
| `MCP_SERVER_URL` | No | `https://mcp.kobana.com.br` | Your MCP server URL |

For sandbox environment, use `KOBANA_APP_URL=https://app-sandbox.kobana.com.br`.

> **Note**: Redis is required for OAuth session storage in serverless environments like Vercel. You can use any Redis provider (e.g., Upstash, Redis Cloud, self-hosted).

## Authorization Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Claude    │     │  MCP Server │     │   Kobana    │
│   Desktop   │     │  (vercel)   │     │   OAuth     │
└─────┬───────┘     └──────┬──────┘     └──────┬──────┘
      │                    │                   │
      │ 1. GET /mcp        │                   │
      │───────────────────>│                   │
      │                    │                   │
      │ 2. 401 Unauthorized│                   │
      │<───────────────────│                   │
      │                    │                   │
      │ 3. GET /.well-known/oauth-authorization-server
      │───────────────────>│                   │
      │                    │                   │
      │ 4. Metadata JSON   │                   │
      │<───────────────────│                   │
      │                    │                   │
      │ 5. Redirect to /authorize             │
      │   ?code_challenge=...&state=...       │
      │───────────────────>│                   │
      │                    │                   │
      │                    │ 6. Redirect to Kobana
      │                    │   /oauth/authorize
      │                    │──────────────────>│
      │                    │                   │
      │                    │ 7. User authorizes│
      │                    │                   │
      │                    │ 8. Redirect to MCP│
      │                    │   /oauth/callback │
      │                    │<──────────────────│
      │                    │                   │
      │                    │ 9. Exchange code  │
      │                    │   for Kobana token│
      │                    │──────────────────>│
      │                    │                   │
      │                    │ 10. Kobana token  │
      │                    │<──────────────────│
      │                    │                   │
      │ 11. Redirect to Claude callback       │
      │   ?code=MCP_CODE&state=...            │
      │<───────────────────│                   │
      │                    │                   │
      │ 12. POST /token    │                   │
      │   code_verifier=...│                   │
      │───────────────────>│                   │
      │                    │                   │
      │ 13. MCP access token                  │
      │<───────────────────│                   │
      │                    │                   │
      │ 14. GET /mcp       │                   │
      │   Authorization: Bearer <token>       │
      │───────────────────>│                   │
```

## Setup Instructions

### Step 1: Register OAuth Application in Kobana

1. Access the Kobana dashboard:
   - Production: https://app.kobana.com.br
   - Sandbox: https://app-sandbox.kobana.com.br

2. Navigate to **Settings → OAuth Applications → Create Application**

3. Fill in the application details:
   - **Name**: `Claude MCP Server` (or your preferred name)
   - **Redirect URI**: Your server URL + `/oauth/callback`

4. Save and copy the generated `client_id` and `client_secret`

### Step 2: Configure Redirect URI

The redirect URI must exactly match your deployed server URL followed by `/oauth/callback`.

| Environment | Redirect URI |
|-------------|--------------|
| Production | `https://mcp.kobana.com.br/oauth/callback` |
| Sandbox | `https://mcp-sandbox.kobana.com.br/oauth/callback` |
| Custom domain | `https://your-domain.com/oauth/callback` |
| Local development | `http://localhost:3000/oauth/callback` |

> **Important**: The redirect URI is case-sensitive and must match exactly, including the trailing path.

### Step 3: Set Environment Variables

**Vercel Deployment:**

```bash
# Required for OAuth
vercel env add KOBANA_OAUTH_CLIENT_ID
vercel env add KOBANA_OAUTH_CLIENT_SECRET
vercel env add REDIS_URL              # Redis connection URL (e.g., redis://user:pass@host:port)

# Optional (with defaults)
vercel env add MCP_SERVER_URL        # Your server URL
vercel env add KOBANA_APP_URL        # Kobana app URL
```

**Local Development:**

```bash
export KOBANA_OAUTH_CLIENT_ID=your_client_id
export KOBANA_OAUTH_CLIENT_SECRET=your_client_secret
export REDIS_URL=redis://localhost:6379
export MCP_SERVER_URL=http://localhost:3000
export KOBANA_APP_URL=https://app-sandbox.kobana.com.br  # Use sandbox for testing
```

### Step 4: Deploy

```bash
# Deploy to Vercel
vercel --prod

# Or run locally
cd vercel-mcp
npm run build
PORT=3000 npm start
```

### Step 5: Verify OAuth Metadata

After deployment, verify the OAuth metadata endpoint:

```bash
curl https://your-server.com/.well-known/oauth-authorization-server
```

Expected response:
```json
{
  "issuer": "https://your-server.com",
  "authorization_endpoint": "https://your-server.com/authorize",
  "token_endpoint": "https://your-server.com/token",
  "scopes_supported": ["login"],
  "response_types_supported": ["code"],
  "grant_types_supported": ["authorization_code"],
  "code_challenge_methods_supported": ["S256"]
}
```

## Claude Desktop Configuration

### Using Custom Connectors (Recommended)

1. Open Claude Desktop
2. Go to Settings → Connectors → Add Custom Connector
3. Enter the MCP server URL: `https://mcp.kobana.com.br/financial/mcp`
4. Click Connect and complete the OAuth flow

### Using mcp-remote (Token-based fallback)

If OAuth is not configured, you can still use token-based authentication:

```json
{
  "mcpServers": {
    "kobana-financial": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.kobana.com.br/financial/mcp",
        "--header",
        "Authorization: Bearer your_access_token"
      ]
    }
  }
}
```

## Security

- **PKCE Required**: Only S256 code challenge method is supported
- **State Validation**: CSRF protection via state parameter
- **TTL**: Pending authorizations expire after 10 minutes
- **TTL**: Authorization codes expire after 5 minutes
- **HTTPS**: Required for all endpoints (except localhost)
- **Redirect URI Validation**: Only registered URIs are accepted

## Implementation Files

```
vercel-mcp/src/oauth/
├── config.ts      # OAuth configuration
├── sessions.ts    # Session management (pending auths, codes, tokens)
├── pkce.ts        # PKCE validation (S256)
├── metadata.ts    # /.well-known/oauth-authorization-server
├── authorize.ts   # /authorize endpoint
├── callback.ts    # /oauth/callback (Kobana callback)
├── token.ts       # /token endpoint
└── index.ts       # Exports
```

## Metadata Response

```json
{
  "issuer": "https://mcp.kobana.com.br",
  "authorization_endpoint": "https://mcp.kobana.com.br/authorize",
  "token_endpoint": "https://mcp.kobana.com.br/token",
  "scopes_supported": ["login"],
  "response_types_supported": ["code"],
  "grant_types_supported": ["authorization_code"],
  "code_challenge_methods_supported": ["S256"]
}
```

## Token Response

```json
{
  "access_token": "mcp_abc123...",
  "token_type": "Bearer",
  "scope": "login"
}
```

## Notes

1. **Token Expiration**: Kobana tokens do not expire. MCP tokens are stored in Redis with a 24-hour TTL.
2. **Redis Required**: OAuth requires Redis for session storage. This is essential for serverless environments like Vercel where in-memory storage doesn't persist across function invocations.
3. **Session TTLs**: Pending authorizations expire after 10 minutes, authorization codes after 5 minutes, and sessions after 24 hours.
4. **Testing**: Use [MCP Inspector](https://github.com/modelcontextprotocol/inspector) to validate the OAuth flow before deployment.

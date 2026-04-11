import { namespaces, getNamespaceByPath } from '../namespaces.js';

// Kobana OAuth scopes required by each MCP namespace.
//
// `login` is the basic Kobana auth scope (required for any user-bound token).
// The remaining scopes match the Kobana Doorkeeper scope hierarchy and cover
// exactly the resources that each namespace's tools touch.
export const NAMESPACE_SCOPES: Record<string, string[]> = {
  admin: [
    'login',
    'admin.subaccounts',
    'admin.users',
    'integration.certificates',
    'integration.connections',
  ],
  charge: [
    'login',
    'charge.pix_accounts',
    'charge.pix',
    'charge.automatic_pix.pix',
    'charge.automatic_pix.recurrences',
    'charge.automatic_pix.requests',
    'charge.payments',
  ],
  data: [
    'login',
    'data.bank_billet_queries',
  ],
  edi: [
    'login',
    'integration.edi_boxes',
  ],
  mailbox: [
    'login',
    'mailbox.entries',
    'mailbox.files',
  ],
  financial: [
    'login',
    'financial.providers',
    'financial.accounts',
    'financial.balances',
    'financial.statement_transactions',
  ],
  payment: [
    'login',
    'payment.payments',
    'payment.bank_billets',
    'payment.pix',
    'payment.darfs',
    'payment.taxes',
    'payment.utilities',
    'payment.batches',
  ],
  transfer: [
    'login',
    'transfer.transfers',
    'transfer.pix',
    'transfer.ted',
    'transfer.internal',
    'transfer.batches',
  ],
};

export function getScopesForNamespace(namespace: string): string[] {
  return NAMESPACE_SCOPES[namespace] || ['login'];
}

export function getAllScopes(): string[] {
  return Array.from(new Set(Object.values(NAMESPACE_SCOPES).flat()));
}

/**
 * Extract a namespace name from a resource URL or pathname.
 * Accepts forms like:
 *   "https://mcp.kobana.com.br/financial/mcp" → "financial"
 *   "/financial/mcp"                          → "financial"
 *   "/financial"                              → "financial"
 */
export function extractNamespaceFromResource(resource: string | undefined): string | undefined {
  if (!resource) return undefined;
  let pathname: string;
  try {
    pathname = new URL(resource).pathname;
  } catch {
    pathname = resource.startsWith('/') ? resource : `/${resource}`;
  }
  const ns = getNamespaceByPath(pathname);
  return ns?.name;
}

/**
 * Pick a namespace from a space-separated `scope` string by checking which
 * namespace's scopes overlap with what the client requested.
 */
export function namespaceFromRequestedScopes(scopeParam: string | undefined): string | undefined {
  if (!scopeParam) return undefined;
  const requested = scopeParam.split(/\s+/).filter(Boolean);
  for (const ns of namespaces) {
    const scopes = getScopesForNamespace(ns.name);
    if (requested.some((s) => scopes.includes(s))) {
      return ns.name;
    }
  }
  return undefined;
}

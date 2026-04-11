import { namespaces, getNamespaceByPath } from '../namespaces.js';

// Kobana OAuth scopes required by each MCP namespace.
//
// `login` is the basic Kobana auth scope (required for any user-bound token).
// `write` grants the ability to execute mutating operations (create/update/
// delete); every namespace's tools include at least one write-side operation.
// The remaining scopes match the Kobana Doorkeeper scope hierarchy and cover
// exactly the resources that each namespace's tools touch.
export const NAMESPACE_SCOPES: Record<string, string[]> = {
  admin: [
    'login',
    'write',
    'admin.subaccounts',
    'admin.users',
    'integration.certificates',
    'integration.connections',
  ],
  charge: [
    'login',
    'write',
    'charge.pix_accounts',
    'charge.pix',
    'charge.automatic_pix.pix',
    'charge.automatic_pix.recurrences',
    'charge.automatic_pix.requests',
    'charge.payments',
  ],
  data: [
    'login',
    'write',
    'data.bank_billet_queries',
  ],
  edi: [
    'login',
    'write',
    'integration.edi_boxes',
  ],
  mailbox: [
    'login',
    'write',
    'mailbox.entries',
    'mailbox.files',
  ],
  financial: [
    'login',
    'write',
    'financial.providers',
    'financial.accounts',
    'financial.balances',
    'financial.statement_transactions',
  ],
  payment: [
    'login',
    'write',
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
    'write',
    'transfer.transfers',
    'transfer.pix',
    'transfer.ted',
    'transfer.internal',
    'transfer.batches',
  ],
};

export function getScopesForNamespace(namespace: string): string[] {
  return NAMESPACE_SCOPES[namespace] || ['login', 'write'];
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

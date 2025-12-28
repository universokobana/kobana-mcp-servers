// Namespace configuration
export interface NamespaceConfig {
  name: string;
  path: string;
  description: string;
  serverName: string;
  toolPrefix: string;
}

export const namespaces: NamespaceConfig[] = [
  {
    name: 'admin',
    path: '/admin',
    description: 'Certificates, connections, subaccounts, users',
    serverName: 'kobana-mcp-admin',
    toolPrefix: 'admin',
  },
  {
    name: 'charge',
    path: '/charge',
    description: 'Pix charges, accounts, automatic pix, payments',
    serverName: 'kobana-mcp-charge',
    toolPrefix: 'charge',
  },
  {
    name: 'data',
    path: '/data',
    description: 'Bank billet queries',
    serverName: 'kobana-mcp-data',
    toolPrefix: 'data',
  },
  {
    name: 'edi',
    path: '/edi',
    description: 'EDI boxes management',
    serverName: 'kobana-mcp-edi',
    toolPrefix: 'edi',
  },
  {
    name: 'financial',
    path: '/financial',
    description: 'Financial accounts, balances, statements',
    serverName: 'kobana-mcp-financial',
    toolPrefix: 'financial',
  },
  {
    name: 'payment',
    path: '/payment',
    description: 'Bank billets, Pix, DARF, taxes, utilities',
    serverName: 'kobana-mcp-payment',
    toolPrefix: 'payment',
  },
  {
    name: 'transfer',
    path: '/transfer',
    description: 'Pix, TED, internal transfers',
    serverName: 'kobana-mcp-transfer',
    toolPrefix: 'transfer',
  },
];

export function getNamespaceByPath(pathname: string): NamespaceConfig | null {
  for (const ns of namespaces) {
    if (pathname.startsWith(ns.path)) {
      return ns;
    }
  }
  return null;
}

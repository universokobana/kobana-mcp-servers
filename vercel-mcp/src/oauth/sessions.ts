import { randomUUID } from 'crypto';

// TTL constants
const PENDING_AUTH_TTL = 10 * 60 * 1000; // 10 minutes
const AUTH_CODE_TTL = 5 * 60 * 1000; // 5 minutes

export interface PendingAuth {
  codeChallenge: string;
  codeChallengeMethod: string;
  redirectUri: string;
  clientId: string;
  state: string;
  kobanaState: string;
  createdAt: number;
}

export interface AuthCode {
  kobanaToken: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  redirectUri: string;
  createdAt: number;
}

export interface ActiveSession {
  kobanaToken: string;
  createdAt: number;
}

// In-memory storage
const pendingAuths = new Map<string, PendingAuth>();
const authCodes = new Map<string, AuthCode>();
const activeSessions = new Map<string, ActiveSession>();

// Cleanup expired entries periodically
function cleanupExpired(): void {
  const now = Date.now();

  for (const [key, value] of pendingAuths.entries()) {
    if (now - value.createdAt > PENDING_AUTH_TTL) {
      pendingAuths.delete(key);
    }
  }

  for (const [key, value] of authCodes.entries()) {
    if (now - value.createdAt > AUTH_CODE_TTL) {
      authCodes.delete(key);
    }
  }
}

// Run cleanup every minute
setInterval(cleanupExpired, 60 * 1000);

export function generateState(): string {
  return randomUUID();
}

export function generateCode(): string {
  return randomUUID();
}

export function generateToken(): string {
  return `mcp_${randomUUID().replace(/-/g, '')}`;
}

// Pending Auth operations
export function createPendingAuth(data: Omit<PendingAuth, 'createdAt'>): void {
  pendingAuths.set(data.kobanaState, {
    ...data,
    createdAt: Date.now(),
  });
}

export function getPendingAuth(kobanaState: string): PendingAuth | undefined {
  const auth = pendingAuths.get(kobanaState);
  if (auth && Date.now() - auth.createdAt > PENDING_AUTH_TTL) {
    pendingAuths.delete(kobanaState);
    return undefined;
  }
  return auth;
}

export function deletePendingAuth(kobanaState: string): void {
  pendingAuths.delete(kobanaState);
}

// Auth Code operations
export function createAuthCode(
  kobanaToken: string,
  codeChallenge: string,
  codeChallengeMethod: string,
  redirectUri: string
): string {
  const code = generateCode();
  authCodes.set(code, {
    kobanaToken,
    codeChallenge,
    codeChallengeMethod,
    redirectUri,
    createdAt: Date.now(),
  });
  return code;
}

export function getAuthCode(code: string): AuthCode | undefined {
  const authCode = authCodes.get(code);
  if (authCode && Date.now() - authCode.createdAt > AUTH_CODE_TTL) {
    authCodes.delete(code);
    return undefined;
  }
  return authCode;
}

export function deleteAuthCode(code: string): void {
  authCodes.delete(code);
}

// Active Session operations
export function createSession(kobanaToken: string): string {
  const mcpToken = generateToken();
  activeSessions.set(mcpToken, {
    kobanaToken,
    createdAt: Date.now(),
  });
  return mcpToken;
}

export function getSession(mcpToken: string): ActiveSession | undefined {
  return activeSessions.get(mcpToken);
}

export function deleteSession(mcpToken: string): void {
  activeSessions.delete(mcpToken);
}

export function getKobanaTokenFromMcpToken(mcpToken: string): string | undefined {
  const session = getSession(mcpToken);
  return session?.kobanaToken;
}

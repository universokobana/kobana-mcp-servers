import { createHash } from 'crypto';

/**
 * Validates a PKCE code_verifier against a code_challenge using the specified method.
 *
 * @param codeVerifier - The code_verifier provided by the client during token exchange
 * @param codeChallenge - The code_challenge stored during authorization
 * @param method - The challenge method (only 'S256' is supported)
 * @returns true if the verifier matches the challenge
 */
export function validatePKCE(
  codeVerifier: string,
  codeChallenge: string,
  method: string
): boolean {
  if (method !== 'S256') {
    // Only S256 is supported per OAuth 2.1
    return false;
  }

  // Validate code_verifier format (43-128 chars, unreserved URI characters)
  if (!isValidCodeVerifier(codeVerifier)) {
    return false;
  }

  // Calculate the expected challenge from the verifier
  const expectedChallenge = computeS256Challenge(codeVerifier);

  // Compare using timing-safe comparison
  return timingSafeEqual(expectedChallenge, codeChallenge);
}

/**
 * Computes S256 code_challenge from a code_verifier.
 * challenge = BASE64URL(SHA256(verifier))
 */
function computeS256Challenge(codeVerifier: string): string {
  const hash = createHash('sha256').update(codeVerifier, 'ascii').digest();
  return base64UrlEncode(hash);
}

/**
 * Base64URL encoding (RFC 4648 Section 5)
 */
function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Validates that a code_verifier meets OAuth 2.1 requirements:
 * - 43-128 characters
 * - Only unreserved URI characters: [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~"
 */
function isValidCodeVerifier(verifier: string): boolean {
  if (verifier.length < 43 || verifier.length > 128) {
    return false;
  }

  // RFC 7636: unreserved characters
  const validPattern = /^[A-Za-z0-9\-._~]+$/;
  return validPattern.test(verifier);
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Validates that a code_challenge is properly formatted
 */
export function isValidCodeChallenge(challenge: string): boolean {
  // S256 produces a 43-character base64url string (256 bits / 6 bits per char ≈ 43 chars)
  if (challenge.length !== 43) {
    return false;
  }

  const validPattern = /^[A-Za-z0-9\-_]+$/;
  return validPattern.test(challenge);
}

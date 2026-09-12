/**
 * The single version authority: this package's own manifest.
 *
 * Read at runtime rather than imported, deliberately. `tsconfig.json` sets
 * `rootDir: ./src`, so importing `../package.json` would pull a file from
 * outside the root and make TypeScript restructure `dist/` — and `dist/` paths
 * are a consumer contract (kia-desktop's vendoring copies specific files out of
 * it). Fixing a version string must not move a consumer's files.
 *
 * `dist/version.js` sits one level under the manifest, so `..` resolves in both
 * a checkout and an installed package (npm always ships `package.json`).
 *
 * Before this existed, the version was hardcoded `1.0.0` in three places per
 * package plus the User-Agent, while the manifests read 1.1.0/1.2.0 — so every
 * MCP handshake reported a version that had not existed for months.
 */
export declare const VERSION: string;
//# sourceMappingURL=version.d.ts.map
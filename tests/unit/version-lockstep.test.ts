/**
 * CV1.DS1 — one version authority per package, asserted.
 *
 * Before this suite, the version was hardcoded `1.0.0` in three places per
 * package plus the User-Agent, while the manifests read 1.1.0/1.2.0. Every MCP
 * handshake reported a version that had not existed for months, so anyone
 * debugging a version-specific bug started from a false premise.
 *
 * The suite is parametrized over packages rather than duplicated into ten
 * directories, per MD-005: the runtime code is duplicated, the tests are not.
 *
 * `dist/` assertions need a build first (`npm run build`). They are the ones
 * that matter, because `dist/` is what consumers install — verifying only the
 * source would repeat the mistake this story exists to fix.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const PACKAGES = [
  'admin',
  'charge',
  'data',
  'edi',
  'financial',
  'help',
  'mailbox',
  'payment',
  'site',
  'transfer',
] as const;

/** Files that carried a hardcoded version literal before this story. */
const SOURCES = ['src/server.ts', 'src/http-server.ts', 'src/api/client.ts'];

/** Any version-shaped literal assigned to a `version` key, or the old generic User-Agent. */
const STALE_VERSION_LITERAL = /version:\s*['"`]\d+\.\d+\.\d+['"`]/;
const STALE_USER_AGENT = /kobana-mcp-server\/\d+\.\d+\.\d+/;

function manifest(pkg: string): { name: string; version: string } {
  return JSON.parse(readFileSync(join(ROOT, `mcp-${pkg}`, 'package.json'), 'utf8'));
}

describe.each(PACKAGES)('mcp-%s', (pkg) => {
  const { name, version } = manifest(pkg);

  it('the manifest declares a semver version', () => {
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it.each(SOURCES)('%s carries no hardcoded version literal', (relative) => {
    const file = join(ROOT, `mcp-${pkg}`, relative);
    if (!existsSync(file)) return; // not every package has every file
    const text = readFileSync(file, 'utf8');
    expect(text).not.toMatch(STALE_VERSION_LITERAL);
    expect(text).not.toMatch(STALE_USER_AGENT);
  });

  it('the built VERSION equals the manifest version', async () => {
    const built = join(ROOT, `mcp-${pkg}`, 'dist', 'version.js');
    expect(
      existsSync(built),
      `${built} is missing — run \`npm run build\` before \`npm test\``
    ).toBe(true);

    const mod = (await import(pathToFileURL(built).href)) as { VERSION: string };
    expect(mod.VERSION).toBe(version);
  });

  it('the built output carries no hardcoded version literal', () => {
    const dist = join(ROOT, `mcp-${pkg}`, 'dist');
    if (!existsSync(dist)) return;
    for (const relative of ['server.js', 'http-server.js', 'api/client.js']) {
      const file = join(dist, relative);
      if (!existsSync(file)) continue;
      const text = readFileSync(file, 'utf8');
      expect(text, `${relative} still hardcodes a version`).not.toMatch(STALE_VERSION_LITERAL);
      expect(text, `${relative} still hardcodes the old User-Agent`).not.toMatch(STALE_USER_AGENT);
    }
  });

  it('the package name is the one the User-Agent will report', () => {
    expect(name).toBe(`kobana-mcp-${pkg}`);
  });

  // Added after the first release attempt shipped changelogs that asserted a
  // publish date for a release that never went out. A bump with no changelog
  // entry (or a changelog entry for a version nobody bumped to) is the same
  // class of drift this story exists to close — so it is asserted, not trusted.
  it('the newest changelog entry names the manifest version', () => {
    const changelog = join(ROOT, `mcp-${pkg}`, 'CHANGELOG.md');
    expect(existsSync(changelog), `${changelog} is missing`).toBe(true);

    const text = readFileSync(changelog, 'utf8');
    const firstEntry = text.match(/^##\s+(\d+\.\d+\.\d+)\s+—\s+(.+)$/m);
    expect(firstEntry, 'no `## <version> — <date|Unreleased>` heading found').not.toBeNull();
    expect(firstEntry![1]).toBe(version);
  });

  // What this CANNOT do, stated plainly: it cannot tell whether a version is
  // actually on npm. That needs a network call, and tests do not make them.
  // Mutation-checked on 2026-09-12 — dating the heading of a still-unpublished
  // release passes a shape-only assertion, so the honest guarantee here is
  // narrower: the heading and the "not published" banner must AGREE. That
  // catches the realistic accident (dating the heading at publish time and
  // leaving the banner, or removing the banner without dating the heading).
  // A deliberate lie — dated heading, banner deleted, nothing published — is
  // not detectable here. The real guard for that is publishing and dating in
  // one scripted step (CV1.DS2), not a unit test.
  it('the heading and the unreleased banner agree', () => {
    const text = readFileSync(join(ROOT, `mcp-${pkg}`, 'CHANGELOG.md'), 'utf8');
    const heading = text.match(/^##\s+\d+\.\d+\.\d+\s+—\s+(.+)$/m)![1].trim();
    const isUnreleased = heading === 'Unreleased';
    const isDated = /^\d{4}-\d{2}-\d{2}$/.test(heading);
    const hasBanner = /Not published yet/.test(text);

    expect(
      isUnreleased || isDated,
      `heading suffix ${JSON.stringify(heading)} is neither "Unreleased" nor YYYY-MM-DD`
    ).toBe(true);
    expect(
      hasBanner,
      isUnreleased
        ? 'heading says Unreleased but the "Not published yet" banner is missing'
        : 'heading carries a release date but the "Not published yet" banner is still there'
    ).toBe(isUnreleased);
  });
});

/**
 * The money unit is stated where a model can read it, and never contradicted.
 *
 * WHY THIS SUITE EXISTS. Kobana stores money in cents. These packages told the
 * model the opposite — `amount: 'Amount in BRL (e.g., 120.99)'` — across ten
 * payment and six transfer fields. In `kia-desktop` on 2026-09-13 that ended with
 * three bills of R$ 980,00 paid as R$ 9,80 each, authorised by a human who read
 * `980` as reais (CR214 in that repository).
 *
 * TWO PLACES, because consumers read two different things:
 *
 *  - the PARAMETER description, for any consumer that sends a model the full
 *    JSON schema (`kadu` does, via `npx -y`);
 *  - the TOOL description's FIRST SENTENCE, because `kia-desktop` no longer
 *    registers full schemas at all. Since its D121 it serves the model a summary
 *    (`firstSentence(description)`) plus an argument digest of `name:type` pairs,
 *    so a parameter description there is never rendered. An eval over that path
 *    measured 0/9 correct amounts with the unit only in the parameter, and 18/18
 *    with it in the first sentence. That is the whole reason this file checks a
 *    SENTENCE and not just a field.
 *
 * `dist/` is asserted and not just `src/`, because `dist/` is what consumers
 * install. In these two packages it is gitignored and rebuilt (TD-013 covers the
 * three that do track it — `help`, `mailbox`, `site` — and payment/transfer are
 * not among them), and `prepublishOnly` runs the build, so the realistic failure
 * is not a stale committed artifact: it is a local `dist/` that no longer matches
 * `src/` while someone reads a green suite. Asserting both ends closes that, and
 * the last test pins them to each other.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** The packages whose tools move money OUT of an account. */
const MONEY_PACKAGES = ['payment', 'transfer'] as const;

/** A tool that creates an outbound movement, single or batch. */
const MONEY_TOOL = /^create_(payment|transfer)_/;

/** Says cents. */
const SAYS_CENTS = /\bcents\b/i;
/** Says the unit is reais/BRL — the claim that was false. */
const SAYS_BRL = /\bBRL\b|\breais\b/i;

interface VendoredTool {
  name: string;
  description: string;
  inputSchema: { _def: { shape: () => Record<string, unknown> } };
}

async function toolsOf(pkg: string): Promise<VendoredTool[]> {
  const entry = join(ROOT, `mcp-${pkg}`, 'dist', 'tools', 'index.js');
  expect(
    existsSync(entry),
    `${entry} is missing — run \`npm run build\` before \`npm test\``
  ).toBe(true);
  const mod = (await import(pathToFileURL(entry).href)) as { allTools: VendoredTool[] };
  return mod.allTools;
}

/** The first sentence, resolved exactly as the consumer's `firstSentence` does. */
const firstSentence = (text: string): string => text.replace(/\s+/g, ' ').trim().split(/(?<=\.)\s/)[0] ?? text;

describe.each(MONEY_PACKAGES)('mcp-%s', (pkg) => {
  it('every money tool names the unit in its FIRST sentence', async () => {
    const tools = (await toolsOf(pkg)).filter((tool) => MONEY_TOOL.test(tool.name));
    expect(tools.length, 'no money tools found — the filter or the package moved').toBeGreaterThan(0);

    for (const tool of tools) {
      const opening = firstSentence(tool.description);
      expect(opening, `${tool.name}: the summary a model sees names no unit`).toMatch(SAYS_CENTS);
      expect(opening, `${tool.name}: the summary still says BRL/reais`).not.toMatch(SAYS_BRL);
    }
  });

  it('every amount parameter says cents, and none says BRL', async () => {
    const tools = await toolsOf(pkg);
    let checked = 0;

    const walk = (schema: unknown, path: string): void => {
      const def = (schema as { _def?: Record<string, unknown> })?._def;
      if (!def) return;
      const typeName = def.typeName as string | undefined;
      if (typeName === 'ZodObject') {
        for (const [key, value] of Object.entries((def.shape as () => Record<string, unknown>)())) {
          if (key === 'amount') {
            const description = (value as { _def?: { description?: string } })?._def?.description ?? '';
            expect(description, `${path}.amount has no description`).not.toBe('');
            expect(description, `${path}.amount does not say cents`).toMatch(SAYS_CENTS);
            expect(description, `${path}.amount still says BRL/reais`).not.toMatch(SAYS_BRL);
            checked += 1;
          }
          walk(value, `${path}.${key}`);
        }
        return;
      }
      // Unwrap the containers an amount can hide inside: optional/nullable
      // wrappers, batch item arrays, and the new-or-existing item union.
      for (const key of ['innerType', 'type', 'schema']) {
        if (def[key]) walk(def[key], path);
      }
      for (const option of (def.options as unknown[]) ?? []) walk(option, path);
    };

    for (const tool of tools.filter((candidate) => MONEY_TOOL.test(candidate.name))) {
      walk(tool.inputSchema, tool.name);
    }
    // Ten in payment, six in transfer at the time of writing. Asserted as a
    // floor so the walk cannot pass by finding nothing.
    expect(checked, 'no amount fields were reached — the schema walk is broken').toBeGreaterThan(0);
  });

  it('the source agrees with the built output', () => {
    // The built tests above read `dist/`; this one reads `src/`. Together they
    // fail when the two disagree, which is the state a half-finished edit or a
    // missing rebuild leaves behind.
    const source = readFileSync(join(ROOT, `mcp-${pkg}`, 'src', 'types', 'schemas.ts'), 'utf8');
    const amounts = source.match(/amount: z\.number\(\)[^\n]*/g) ?? [];
    expect(amounts.length, 'no amount fields found in source').toBeGreaterThan(0);
    for (const line of amounts) {
      expect(line, 'a source amount still says BRL/reais').not.toMatch(SAYS_BRL);
      expect(line, 'a source amount does not say cents').toMatch(SAYS_CENTS);
      // Fractional cents do not exist; the server refuses them rather than
      // letting the platform decide what `120.99` cents means.
      expect(line, 'a source amount accepts fractional cents').toMatch(/\.int\(\)/);
    }
  });
});

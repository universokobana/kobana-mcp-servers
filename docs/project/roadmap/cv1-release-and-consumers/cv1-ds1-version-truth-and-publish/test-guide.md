[< Story](index.md)

# Test Guide — CV1.DS1 Version truth and the first deliberate publish

## Automated Validation

```bash
# 1. The lockstep test — red before the fix, green after
npm test

# 2. Typecheck every package, including the two outside `workspaces` (TD-006)
for p in mcp-*/; do (cd "$p" && ../node_modules/.bin/tsc --noEmit) || echo "FAILED: $p"; done

# 3. Build
npm run build
cd mcp-help && npm run build && cd ..
cd mcp-site && npm run build && cd ..
```

Expected: the lockstep test fails before step 2 of the implementation and passes after;
typecheck silent for all ten; builds succeed.

## Pre-publish verification

```bash
# 4. What is currently published vs what is local
for p in admin charge data edi financial help mailbox payment site transfer; do
  printf "%-10s local=%-8s npm=%s\n" "$p" \
    "$(node -e "console.log(require('./mcp-$p/package.json').version)")" \
    "$(npm view kobana-mcp-$p version 2>/dev/null || echo NONE)"
done

# 5. Dry run per package — inspect the file list, confirm package.json ships
cd mcp-financial && npm publish --dry-run; cd ..
```

Expected at step 4, **before** publishing: nine packages show local ahead of npm.
**After** publishing: all ten identical.

## The tarball check — the one that matters

Verifying the local build proves nothing about what a consumer installs. Pull from the
registry.

```bash
# 6. After publishing: does the published artifact carry the fixes?
cd /tmp && rm -rf verify && mkdir verify && cd verify
for p in admin charge data edi financial help mailbox payment site transfer; do
  rm -rf $p && mkdir $p && (cd $p && npm pack kobana-mcp-$p >/dev/null 2>&1 && tar xzf *.tgz)
  f=$p/package/dist/http-server.js
  [ -f "$f" ] || { printf "%-10s (no http-server)\n" "$p"; continue; }
  printf "%-10s SSE=%s MathRandom=%s stateless=%s timeout=%s\n" "$p" \
    "$(grep -c 'SSEServerTransport' $f)" \
    "$(grep -c 'Math.random' $f)" \
    "$(grep -c 'sessionIdGenerator' $f)" \
    "$(grep -c 'AbortSignal.timeout' $p/package/dist/api/client.js 2>/dev/null || echo 0)"
done
```

**Pass condition:** `SSE=0`, `MathRandom=0`, `stateless>=1` for every package; and
`timeout>=1` for the eight packages that have a `KobanaApiClient`.

**Fail condition:** any non-zero `SSE` or `MathRandom` means the vulnerable artifact is
still installable and the publish did not achieve its purpose.

**Baseline recorded 2026-09-12, before this story** (`@1.0.1`): `SSE=5`,
`MathRandom=1` for `admin`, `payment`, `charge`, `transfer`.

## Handshake check

```bash
# 7. Does the server report its real version?
cd mcp-financial
printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"t","version":"0"}}}' \
  | KOBANA_ACCESS_TOKEN=dummy node dist/index.js | head -1
```

**Pass condition:** `serverInfo.version` equals `mcp-financial/package.json`'s version.
**Fail condition:** it reports `1.0.0`.

## Consumer check (cross-repo)

```bash
# 8. kia-desktop no longer needs its override
cd ~/dev/workspace/kia-desktop
rm -rf src-tauri/resources/mcp-packages/overrides/kobana-mcp-financial
npm run bundle:mcp
```

**Pass condition:** the bundle script completes without the override and without the
version-guard error. Note the guard is *designed* to fail loudly on a version
mismatch — so if the override is left in place after we publish, a failure there is the
mechanism working, not a regression.

Then confirm the vendored tree carries the fence:

```bash
grep -c 'AbortSignal.timeout' \
  src-tauri/resources/mcp-packages/node_modules/kobana-mcp-financial/dist/api/client.js
```

**Pass condition:** ≥ 1, sourced from the registry rather than from an override.

## Navigator Validation

1. Approve the version table (plan DD3) **before** any publish — this is irreversible;
   npm does not allow republishing a version.
2. Decide the disclosure question in [`plan.md`](plan.md#open-question-for-the-navigator).
3. Read one package's changelog entry and confirm it states the exposure window plainly
   (MD-006 item 4).

## Validation Evidence

Recorded 2026-09-12. **Implementation complete; publish blocked.**

### Automated

- **Lockstep suite written red first.** Run against the stale/absent `dist/` before
  rebuilding: **14 failed / 56 passed (70)**. After rebuilding: **70 passed**. The red
  run is the proof the assertions bite; it was not contrived, the stale `dist/` was
  genuinely there.
- **Typecheck:** clean on all ten — after `npm ci` inside `mcp-site` (TD-010).
- **Build:** all ten produce `dist/version.js`.

### The single-authority property (DD1)

Bumping the manifests alone moved the reported version with **no rebuild**, because
`version.ts` reads `package.json` at runtime:

```text
serverInfo: {'name': 'kobana-mcp-financial', 'version': '1.2.1'}
```

User-Agent observed against a local server: `kobana-mcp-financial/1.2.0` before the
bump, `kobana-mcp-financial/1.2.1` after — from the same build.

### Pre-publish tarball inspection

`npm pack` from the working tree, all ten unpacked and inspected:

| | SSE | `Math.random` | stateless | `redirect:'error'` | `AbortSignal.timeout` |
|---|---|---|---|---|---|
| 8 API packages | 0 | 0 | 1 | 1 | 2 |
| `help` | 0 | 0 | 1 | n/a (scraper client) | n/a |
| `site` | 0 | 0 | 1 | n/a (no client) | n/a |

Versions in the packed manifests: `financial` `1.2.1`, the other nine `1.1.1`.
`CHANGELOG.md` present in every tarball — which required adding it to `files`, since
otherwise the chosen disclosure route would have shipped to nobody.

**Baseline for comparison, published `@1.0.1` (2026-09-12, before this story):**
`SSE=5`, `Math.random=1`, `redirect:'error'=0`, `AbortSignal=0`.

### Blocked

- **Publish not executed:** `npm whoami` → `ENEEDAUTH`. The registry steps (step 6
  onward) and the `kia-desktop` override removal remain outstanding.
- Post-publish registry verification and the cross-repo step are therefore **not**
  evidenced yet.

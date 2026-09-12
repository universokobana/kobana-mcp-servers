import { defineConfig } from 'vitest/config';

// Tests run in Node: these packages are MCP servers, there is no DOM and no
// framework runtime to emulate. Kept at the repository root because the suites
// are deliberately parametrized ACROSS packages (MD-005): the API client is
// duplicated eight times, so a per-package test directory would duplicate the
// tests too.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // A flaky test is a bug to fix, never a retry (engineering principles §4).
    retry: 0,
  },
});

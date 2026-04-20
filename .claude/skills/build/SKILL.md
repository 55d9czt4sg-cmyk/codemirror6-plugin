---
name: build
description: Build the codemirror6-plugin for production. Runs Vite to bundle the plugin and tsc to emit TypeScript declarations.
disable-model-invocation: true
allowed-tools: Bash(npm run build)
---

# Build Plugin

Build the plugin for distribution.

```bash
npm run build
```

This runs `vite build && tsc`, which:
1. Bundles `src/plugin.ts` into `dist/plugin.js` (ES module, no bundled peer deps)
2. Emits TypeScript declaration files (`dist/plugin.d.ts` and friends)

## What to check after a successful build

- `dist/plugin.js` — the bundled plugin
- `dist/plugin.d.ts` — TypeScript definitions
- Verify that `@codemirror/*` and `@lezer/*` imports are **not** inlined (they are listed as external in `vite.config.ts`)

## Common failures

| Error | Fix |
|---|---|
| TypeScript type errors | Fix the type error in `src/` before re-running |
| Missing peer dependency | Ensure all `@codemirror/*` packages are installed (`npm install`) |
| Vite config issue | Check `vite.config.ts` — `lib.entry` must point to `src/plugin.ts` |

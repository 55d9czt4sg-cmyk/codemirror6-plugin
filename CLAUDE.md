# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An Emmet extension for [CodeMirror 6](https://codemirror.net/). Published as `@emmetio/codemirror6-plugin` (ES module). Consumers add it to an `EditorState` as one of two kinds of pieces:

1. **`StateCommand` functions** (e.g. `expandAbbreviation`, `balanceOutward`) — bound by the consumer via `keymap.of([...])`.
2. **Extension factories** (e.g. `abbreviationTracker()`, `wrapWithAbbreviation()`) — return an `Extension[]` to be added directly to the editor's `extensions` array.

The public surface is whatever `src/plugin.ts` re-exports. Anything not re-exported there is internal.

## Common commands

```bash
npm run dev      # Vite dev server at http://localhost:3009 (loads src/main.ts demo)
npm run build    # vite build → dist/plugin.js, then tsc → dist/*.d.ts
npm run serve    # vite preview of the built demo
```

There is no test suite and no linter — the only correctness gates are `tsc --strict` (with `noUnusedLocals`/`noUnusedParameters`) during `npm run build`, and manual verification in the dev demo. After changing a command, wire it into a keybinding in `src/main.ts` if it isn't already there and check the behavior in the browser.

`vite.config.ts` is dual-mode: in `build` it emits a library bundle with `@codemirror/*` and `@lezer/*` left as external imports; in `dev` it serves `index.html` → `src/main.ts` (the demo, not the library entry).

## Architecture

### Public entry: `src/plugin.ts`
Pure re-export file. To expose a new command or factory, add an `export` line here — otherwise it won't appear in `dist/plugin.d.ts` even if it compiles.

### Configuration: `emmetConfig` Facet (`src/lib/config.ts`)
All runtime knobs (syntax, preview toggles, BEM, attribute quotes, etc.) flow through a single CodeMirror `Facet`. Helpers read it with `getEmmetConfig(state)`. The `combine` function shallow-merges all facet values onto `defaultConfig` and resets the Emmet internal cache (`resetCache()` in `src/lib/emmet.ts`) on every recombination.

Consumers set config two ways: `emmetConfig.of({...})` directly, or by passing options to `abbreviationTracker({...})` which forwards them via `config.of(options)`.

Important: **CodeMirror 6 doesn't expose document syntax in a way this plugin can use**, so `config.syntax` (default `'html'`) is the source of truth for output style. `docSyntax(state)` reads this facet; it is *not* derived from the editor's language extension. Position-level syntax detection inside the document (HTML vs embedded CSS vs CSS-in-attribute) is separate — it uses `cssLanguage.isActiveAt(state, pos)` and `htmlLanguage.isActiveAt(state, pos)` from `@codemirror/lang-*`.

### Commands: `src/commands/*.ts`
Every file exports one or more `StateCommand`s with signature `({ state, dispatch }) => boolean`. Return `true` if the command handled the event, `false` to fall through. Most commands follow this flow:

1. Read `state.selection.main` (or iterate `state.selection.ranges` for multi-cursor).
2. Branch on syntax context with `cssLanguage.isActiveAt` / `htmlLanguage.isActiveAt`.
3. Walk the parse tree with `syntaxTree(state).resolveInner(pos, -1)` from `@codemirror/language` when needed.
4. Build a transaction with `state.update({ changes, selection, scrollIntoView: true })` and `dispatch` it.

`wrapWithAbbreviation` is the odd one out — it is *not* a `StateCommand` but a factory that returns an extension; consumers add it to `extensions`, not to a keymap.

Shared utilities live in `src/lib/utils.ts` (`substr`, `contains`, `narrowToNonSpace`, `rangesEqual`, `rangeContains`, `getTagAttributes`, etc.). Emmet glue is in `src/lib/emmet.ts` (`expand`, `extract`, `getOptions`, `getTagContext`, `resetCache`).

### Abbreviation tracker: `src/tracker/index.ts`
The most intricate part of the plugin and the only place that owns persistent editor state. It is a composite of:

- **`trackerField`** — `StateField<AbbreviationTracker | null>` that watches each transaction. On `docChanged` it calls `handleUpdate`, which either starts a new tracker via `typingAbbreviation` (when the user types a character that *could* begin an Emmet abbreviation in a valid prefix context) or extends the existing one. It also listens for two `StateEffect`s: `resetTracker` (clears) and `forceTracker` (starts a forced tracker from `enterAbbreviationMode`).
- **`abbreviationTracker` ViewPlugin** — owns the underline decoration (`.emmet-tracker` class).
- **`abbreviationPreview`** — `StateField<EmmetTooltip | null>` that renders the live preview popup via `showTooltip`.
- **`emmetCompletionSource`** — a `CompletionSource` published into `cssLanguage.data` so that in CSS the abbreviation appears as a regular completion entry (CSS does not get a separate preview tooltip; the comment in code explains why).
- **Tab/Escape keymap** — `tabKeyHandler` expands the tracked abbreviation (or accepts an active Emmet completion if `autocompleteTab` permits), `escKeyHandler` clears it.

`getActivationContext(state, pos)` is the gatekeeper: it returns a `UserConfig` only when the position is a place where an abbreviation is allowed (not inside a tag name, not mid-attribute, allowed property values in CSS, etc.). Any new code that needs to ask "should Emmet act here?" should call it.

The tracker survives across abbreviation edits even when the typed text becomes temporarily invalid — it goes `inactive: true` so the user can fix the typo without losing position. Look at `handleUpdate` and `createTracker` together before touching this flow.

Hacky bit to be aware of: `hasSnippet(state)` walks `state.values` looking for a constructor named `'ActiveSnippet'` because CodeMirror doesn't expose a public API for detecting an active snippet. If you upgrade `@codemirror/autocomplete` and tab-stop expansion misbehaves, check here first.

### Context & syntax helpers
- `src/lib/context.ts` — derives `HTMLContext` / `CSSContext` (ancestor chains, current node, whether CSS is inline in `style=""`) from the lezer parse tree.
- `src/lib/syntax.ts` — `EmmetKnownSyntax` enum + predicates (`isHTML`, `isCSS`, `isJSX`, `isXML`, `isSupported`) and conversion between Emmet's `markup`/`stylesheet` types and concrete syntax names.
- `src/lib/output.ts` — builds the Emmet output options object from the current facet config.

## Conventions

- **4-space indent** for TS/JS, **tabs** for HTML files, **2-space** for JSON/YAML (see `.editorconfig`).
- TypeScript is `strict` with `noUnusedLocals` and `noUnusedParameters` on — prefix intentionally unused parameters with `_` (e.g. `_fromA`).
- `target: ESNext` source, `target: es2017` build output, `moduleResolution: Node`, ES modules only.
- Public API rule: **add it to `src/plugin.ts` or it doesn't exist** to consumers.
- JSX abbreviations require a leading `<` prefix (`JSX_PREFIX`) to avoid false positives on identifiers — preserved if you touch tracker activation logic.

## Skills

`.claude/skills/` ships project-specific skills that future Claude Code instances can invoke:

- **`add-emmet-command`** — guided walkthrough for adding a new `StateCommand`, including the export-from-`plugin.ts` step and a `command-patterns.md` cheatsheet drawn from `balance.ts`, `expand.ts`, and `inc-dec-number.ts`.
- **`build`** / **`dev`** — thin wrappers over `npm run build` / `npm run dev` with notes on what to verify.

When the user asks to add or modify an Emmet command, prefer the `add-emmet-command` skill over freehand implementation.

## Out-of-scope files

- `polygon-agent.ts` (repo root) — unrelated Anthropic SDK / Composio demo agent. Not part of the plugin and not bundled by `vite build`. Leave it alone unless the user explicitly asks about it.
- `QUICKSTART.md` / `README.md` — end-user documentation; keep them in sync when changing the public API of `src/plugin.ts`.

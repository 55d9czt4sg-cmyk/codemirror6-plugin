# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`@emmetio/codemirror6-plugin` — a CodeMirror 6 extension that adds [Emmet](https://emmet.io) support (abbreviation expansion plus a dozen other Emmet actions) to a CodeMirror editor. Distributed as an ES module; consumers import named exports and add them to their `EditorState` extensions or keymaps.

## Commands

```bash
npm run dev      # Vite dev server at http://localhost:3009 (loads src/main.ts demo)
npm run build    # vite build + tsc — emits dist/plugin.js + dist/plugin.d.ts
npm run serve    # vite preview of the built demo
```

There is no test suite and no linter. `npm run prepare` runs `build` automatically on `npm install` (used for publish).

The demo at `src/main.ts` wires every command to a keybinding — use `npm run dev` and the browser to verify behavior changes interactively (open DevTools console for runtime errors).

## Architecture

### Two entry points, two roles

- **`src/plugin.ts`** — the **public API** for the npm package (`vite.config.ts` points `lib.entry` here). Re-exports every command and the tracker. Anything not exported here is internal.
- **`src/main.ts`** — the **dev demo only**, never bundled into the package. Builds an `EditorView` with HTML content and binds every command to a key. Edit it freely to test things by hand.

When adding a new public command, you must export it from `src/plugin.ts` or consumers can't import it.

### Two integration paths for consumers

Commands can be consumed two different ways, and the codebase reflects both:

1. **`StateCommand` exports** (`src/commands/*.ts`) — pure `({ state, dispatch }) => boolean` functions that consumers bind to a keymap. `expandAbbreviation` is the canonical example.
2. **Extension factories** — functions that return CodeMirror `Extension`s (state fields, view plugins, themes, internal keymaps). `abbreviationTracker(options?)` and `wrapWithAbbreviation(key?)` are factories — consumers add the *return value* to their `extensions` array, not to a keymap.

Don't conflate them. The README/QUICKSTART table flags `wrapWithAbbreviation` explicitly because users mistake it for a `StateCommand`.

### Tracker (`src/tracker/index.ts`)

The abbreviation tracker is the most complex piece. Architecture:

- **`trackerField`** (`StateField<AbbreviationTracker | null>`) holds tracker state (range, parsed abbreviation, preview, error). Updated on every transaction by `handleUpdate`, which calls `typingAbbreviation` to start tracking and `createTracker` to refresh on every keystroke.
- **`abbreviationTracker`** (`ViewPlugin`) draws the `emmet-tracker` underline decoration from the field.
- **`abbreviationPreview`** (`StateField<EmmetTooltip>`) shows the live HTML preview tooltip via `showTooltip`.
- **`emmetCompletionSource`** integrates with `@codemirror/autocomplete` so CSS abbreviations appear in the native completion list (CSS suppresses the tooltip preview because completions cover it).
- **`tabKeyHandler` / `escKeyHandler`** are internal keymap entries (Tab to expand, Esc to dismiss). Tab also defers to `acceptCompletion` when an Emmet completion is selected and `autocompleteTab` allows it.
- **`getActivationContext(state, pos)`** is the gate: returns a `UserConfig` if abbreviation expansion is allowed at `pos` (e.g. inside HTML text or a `style=""` attribute, but not inside `<div ...>`). It's reused by `expandAbbreviation` so the standalone command and the tracker agree on context.

`hasSnippet(state)` is a deliberately hacky duck-type check (`item.constructor?.name === 'ActiveSnippet'`) because CodeMirror doesn't expose snippet status — leave the comment in place if you touch it.

### `src/lib/` — shared infrastructure

- **`config.ts`** — `emmetConfig` is a `Facet<Partial<EmmetConfig>, EmmetConfig>`. The `combine` function merges all values, deep-merges `preview`, and calls `resetCache()` so the Emmet snippet cache picks up new user snippets. `getEmmetConfig(state, opt?)` is the standard way to read the merged config.
- **`syntax.ts`** — classifies a syntax string (`html`, `css`, `jsx`, `pug`, …) into `markup` vs `stylesheet`, plus `isHTML/isCSS/isJSX/isXML/isSupported` predicates. `EmmetKnownSyntax` enum lists every supported value.
- **`context.ts`** — walks the Lezer syntax tree to produce an `HTMLContext` or `CSSContext` describing ancestors, current node type (`selector`/`propertyName`/`propertyValue`/open/close/selfClose tag), and embedded CSS in `style=""`. Inline-CSS uses a hand-rolled `parseInlineProps` since CodeMirror doesn't tokenize attribute contents.
- **`emmet.ts`** — wraps `emmet`'s `expandAbbreviation`/`extract`/`resolveConfig`. Owns the `cache` object passed to Emmet (reset whenever the config facet recombines).
- **`output.ts`** — produces the Emmet `Options` (output style, attribute quotes, BEM, comments) from the `EmmetConfig` facet for a given position.
- **`utils.ts`** — `substr`, `contains`, `getCaret`, `getTagAttributes`, `getSelectionsFromSnippet`, range helpers. Use these instead of inlining `state.doc.sliceString` etc.
- **`types.ts`** — `EmmetKnownSyntax` enum, `RangeObject`, `HTMLContext`/`CSSContext` shapes, `AbbreviationError`.

### Syntax detection convention

The codebase has **two ways** to know the current syntax, and they're used for different things:

- **`docSyntax(state)`** — reads the `emmetConfig` facet's `syntax` value. Used for *output style* (HTML vs XHTML, CSS vs SASS). CodeMirror has no API to ask the editor which language it's configured for, so consumers must set this manually via the facet (or pass it to `abbreviationTracker({syntax})`).
- **`cssLanguage.isActiveAt(state, pos)` / `htmlLanguage.isActiveAt(state, pos)`** — Lezer-based detection of the *node* at a position. Used for *context branching* (e.g. inside a `<style>` tag, even though `docSyntax` says `html`, CSS rules apply). Most commands check CSS first, then HTML, then bail.

## Adding a new command

There's a skill for this: invoke `/add-emmet-command <name>` (defined in `.claude/skills/add-emmet-command/`). It guides through the `StateCommand` pattern, the public-API export, and demo wiring. `command-patterns.md` next to the SKILL has annotated extracts of the existing commands (minimal, HTML+CSS dual path, multi-cursor, syntax tree walking).

## Build details that bite

- `vite.config.ts` externalizes `^@(codemirror|lezer)\//` — those packages must stay as `peerDependencies` (see `package.json`). If you add a new CodeMirror import, ensure the package is in `peerDependencies`, not `dependencies`.
- `tsconfig.json` is `emitDeclarationOnly: true` — Vite emits the JS, tsc emits only `.d.ts`. Type errors fail the build; there's no separate `tsc --noEmit` script.
- `noUnusedLocals` and `noUnusedParameters` are on — prefix unused params with `_`.

## Files unrelated to the plugin

`polygon-agent.ts` at the repo root is an unrelated standalone Anthropic SDK / Polygon.io demo script. It's not imported by `plugin.ts` or `main.ts` and is not part of the published package. Don't pull it into plugin code.

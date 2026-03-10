# CLAUDE.md — AI Assistant Guide for @emmetio/codemirror6-plugin

## Project Overview

This is **@emmetio/codemirror6-plugin** — a TypeScript library that integrates [Emmet](https://emmet.io) abbreviation expansion into the [CodeMirror 6](https://codemirror.net/) text editor. It exposes 20+ Emmet actions as CodeMirror commands and includes a real-time abbreviation tracker with live preview.

- **Package name:** `@emmetio/codemirror6-plugin`
- **Current version:** `0.4.0`
- **Entry point:** `src/plugin.ts` → builds to `dist/plugin.js`
- **Module format:** ES Module only

---

## Repository Structure

```
src/
├── commands/           # One file per Emmet command
│   ├── balance.ts          # balanceOutward / balanceInward
│   ├── comment.ts          # toggleComment
│   ├── evaluate-math.ts    # evaluateMath
│   ├── expand.ts           # expandAbbreviation
│   ├── go-to-edit-point.ts # goToNextEditPoint / goToPreviousEditPoint
│   ├── go-to-tag-pair.ts   # goToTagPair
│   ├── inc-dec-number.ts   # incrementNumber* / decrementNumber*
│   ├── remove-tag.ts       # removeTag
│   ├── select-item.ts      # selectNextItem / selectPreviousItem
│   ├── split-join-tag.ts   # splitJoinTag
│   └── wrap-with-abbreviation.ts  # wrapWithAbbreviation
├── lib/                # Core utilities
│   ├── config.ts           # Emmet configuration Facet + defaults
│   ├── context.ts          # HTML/CSS context detection from syntax tree
│   ├── emmet.ts            # Emmet library wrapper + cache management
│   ├── output.ts           # Output formatting (indentation, snippets)
│   ├── syntax.ts           # Syntax detection helpers + EmmetKnownSyntax enum
│   ├── types.ts            # Shared TypeScript interfaces
│   └── utils.ts            # General utilities (ranges, tab stops, etc.)
├── tracker/            # Real-time abbreviation tracking
│   ├── index.ts            # Main StateField + ViewPlugin (762 lines)
│   └── AbbreviationPreviewWidget.ts  # Tooltip preview widget
├── plugin.ts           # Public API — all exports
├── main.ts             # Demo application (not part of published output)
└── vite-env.d.ts       # Vite type declarations
example/
└── emmet-expand.gif    # Demo animation for README
index.html              # Demo entry point
```

---

## Development Workflow

### Setup

```bash
npm install
```

### Run the demo/dev server

```bash
npm run dev        # http://localhost:3009
```

The demo (`src/main.ts`) is a fully working CodeMirror editor with all Emmet commands bound to keyboard shortcuts. Use it for manual testing.

### Build for distribution

```bash
npm run build
```

This runs two steps in parallel:
1. **Vite** bundles `src/plugin.ts` → `dist/plugin.js` (ESM, source maps, no minification)
2. **TypeScript** (`tsc --emitDeclarationOnly`) generates `dist/plugin.d.ts`

Output directory: `dist/` (gitignored, included in npm package via `.npmignore`).

### Preview the build

```bash
npm run serve
```

### Publish to npm

```bash
npm publish        # runs `npm run prepare` (= build) automatically first
```

---

## Architecture & Key Concepts

### CodeMirror 6 Integration Patterns

This plugin uses these CM6 APIs heavily — understand them before modifying code:

| CM6 Concept | Used For |
|---|---|
| `StateField` | Storing current tracker abbreviation state |
| `StateEffect` | Triggering state transitions (activate, update, deactivate) |
| `Facet` | Plugin configuration (`emmetConfig`) |
| `ViewPlugin` / `Decoration` | Rendering underline + tooltip previews |
| `keymap` | Binding Tab/Escape in abbreviation mode |
| `snippet()` | Expanding abbreviations with tab stops |
| `syntaxTree()` | Reading syntax tree for context detection |
| `StateCommand` | The interface all commands implement |

### Configuration System (`lib/config.ts`)

Configuration is provided via the `emmetConfig` Facet:

```typescript
emmetConfig.of({
  syntax: 'html',          // Overrides auto-detected syntax
  markTagPairs: true,       // Highlight matching tag pair
  autoRenameTags: true,     // Auto-rename closing tag on open edit
  previewOpenTag: false,    // Show open tag in preview
  // ... more options
})
```

The resolved config is cached per-editor-state and invalidated on changes.

### Context Detection (`lib/context.ts`)

Before expanding/tracking, the plugin checks the cursor's context using the syntax tree:
- `getHTMLContext()` — finds the current HTML tag, attributes, and ancestor chain
- `getCSSContext()` — finds CSS selectors, properties, values, and media queries
- Inline CSS (style attributes in HTML) is detected and handled separately

### Abbreviation Tracker (`tracker/index.ts`)

The most complex part of the codebase. It:
1. Activates when the user types characters that look like an Emmet abbreviation
2. Uses a `StateField` to store the active abbreviation range + validity
3. Renders a visual underline via `Decoration`
4. Shows a `Tooltip` preview for multi-element abbreviations
5. Handles Tab (expand) and Escape (deactivate)
6. Supports a forced mode (`enterAbbreviationMode`) for manual input

Tracker state shape:

```typescript
interface AbbreviationTracker {
  range: { from: number, to: number }
  abbreviation: string
  forced: boolean      // entered via enterAbbreviationMode
  type: 'abbreviation' | 'error'
  preview?: string     // rendered HTML preview
}
```

### Syntax Detection (`lib/syntax.ts`)

The `EmmetKnownSyntax` enum defines all supported syntaxes. Helper predicates:

```typescript
isMarkupSyntax(syntax)     // html, xml, jsx, tsx, vue, haml, ...
isStylesheetSyntax(syntax) // css, scss, sass, less, stylus, ...
isJSX(syntax)              // jsx, tsx
```

---

## Public API (`src/plugin.ts`)

Everything exported here is the public API. Do not change exports without versioning consideration.

### Tracker & Completion

| Export | Type | Description |
|---|---|---|
| `abbreviationTracker()` | `Extension[]` | Main tracker plugin (call once in editor setup) |
| `enterAbbreviationMode` | `StateCommand` | Activates manual abbreviation input |
| `emmetCompletionSource` | `CompletionSource` | CSS autocomplete source |

### Commands (all are `StateCommand`)

| Export | Description |
|---|---|
| `expandAbbreviation` | Expand abbreviation at cursor |
| `wrapWithAbbreviation` | Wrap selection with abbreviation |
| `balanceOutward` / `balanceInward` | Expand/shrink selection |
| `selectNextItem` / `selectPreviousItem` | Select attribute/tag values |
| `goToNextEditPoint` / `goToPreviousEditPoint` | Jump to empty attr/tag |
| `goToTagPair` | Jump to matching open/close tag |
| `toggleComment` | Toggle Emmet comment |
| `removeTag` | Remove tag, keep contents |
| `splitJoinTag` | Toggle self-closing vs paired tag |
| `incrementNumber1` / `decrementNumber1` | ±1.0 |
| `incrementNumber01` / `decrementNumber01` | ±0.1 |
| `incrementNumber10` / `decrementNumber10` | ±10.0 |
| `evaluateMath` | Evaluate math expression at cursor |

### Configuration

| Export | Type | Description |
|---|---|---|
| `emmetConfig` | `Facet` | Configuration facet |
| `EmmetKnownSyntax` | `enum` | All supported syntaxes |

---

## TypeScript Conventions

- **Strict mode is on.** All strict checks are enabled in `tsconfig.json`. No implicit `any`, no unused variables, no implicit returns.
- **Naming:** `camelCase` for functions/variables, `PascalCase` for types/interfaces/enums/classes.
- **No default exports.** All exports are named.
- **Interfaces over type aliases** for object shapes; use `type` for unions/intersections.
- **Enums for fixed value sets** — e.g., `EmmetKnownSyntax`.
- **Avoid `as` casts** where possible; prefer type guards or proper narrowing.
- Target is `ESNext` — use modern JS features freely (optional chaining, nullish coalescing, etc.).

---

## Code Style

- **Indentation:** 4 spaces (enforced by `.editorconfig`)
- **Line endings:** LF
- **Charset:** UTF-8
- **No trailing whitespace**
- No formatter config (Prettier/ESLint) — keep style consistent with existing code manually.

---

## Dependencies

### Runtime dependencies (bundled)

| Package | Purpose |
|---|---|
| `emmet` | Core Emmet abbreviation engine |
| `@emmetio/math-expression` | Math expression evaluation |

### Peer dependencies (provided by host application — NOT bundled)

All `@codemirror/*` packages are peer deps. Vite excludes them from the bundle:

```
@codemirror/autocomplete ^6.17.0
@codemirror/commands     ^6.6.0
@codemirror/lang-css     ^6.2.1
@codemirror/lang-html    ^6.4.9
@codemirror/language     ^6.10.2
@codemirror/state        ^6.4.1
@codemirror/view         ^6.29.1
@lezer/common            ^1.2.1  (also excluded from bundle)
```

When adding new imports, check whether the package should be bundled or treated as external. Update `vite.config.ts` `external` array if adding a new peer dep.

---

## Testing

There is no automated test suite. Testing is done manually via the demo application:

```bash
npm run dev
```

The demo at `src/main.ts` exercises all commands with keyboard shortcuts. When making changes:
1. Run the dev server
2. Test the affected command(s) in the browser
3. Test edge cases (empty editors, multiple cursors, different syntaxes)

If adding a new command, add it to the demo in `src/main.ts` with a keyboard shortcut.

---

## Adding a New Command

1. Create `src/commands/my-command.ts` implementing `StateCommand`:

```typescript
import { StateCommand } from '@codemirror/state';
import { getCaret, getEmmetConfig } from '../lib/utils';

export const myCommand: StateCommand = ({ state, dispatch }) => {
    // ... implementation
    return true; // return false if command didn't apply
};
```

2. Export it from `src/plugin.ts`.
3. Add a keyboard binding in `src/main.ts` for manual testing.
4. Document it in `README.md`.

---

## Common Pitfalls

- **Do not import from `codemirror`** (the meta-package) directly in library code. Import from specific `@codemirror/*` packages. The meta-package is only used in `src/main.ts` for the demo.
- **Syntax tree node names are language-specific.** When reading the syntax tree in `lib/context.ts` or commands, be aware that HTML/CSS lezer parsers use different node names. Always check the actual tree with `syntaxTree(state).toString()` during debugging.
- **`emmetConfig` Facet resolution:** Always use `getEmmetConfig(state)` (from `lib/config.ts`) rather than reading the facet directly — it handles cache invalidation.
- **Tab stop markers** in `lib/utils.ts` use special Unicode characters (`\u0000`-style) to mark snippet tab positions before handing off to CM6's `snippet()`. Don't confuse these with literal content.
- **The tracker is the only `ViewPlugin`.** Avoid adding more view plugins — prefer `StateField` + decorations computed from state for anything visual.

---

## Build Output

After `npm run build`:

```
dist/
├── plugin.js      # ESM bundle (readable, source maps inline)
└── plugin.d.ts    # TypeScript declarations
```

The `dist/` directory is gitignored but included in the npm package (see `.npmignore`).

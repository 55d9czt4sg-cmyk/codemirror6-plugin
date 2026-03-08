# Emmet Extension for CodeMirror 6 — Skill Overview

This skill covers the `@emmetio/codemirror6-plugin` package: an Emmet integration for CodeMirror 6 editors.

## What This Skill Covers

- Installing and configuring the Emmet plugin in a CodeMirror 6 editor
- Using all exported commands (expand, balance, wrap, comment, etc.)
- Configuring abbreviation tracking and preview
- Specifying document syntax for correct abbreviation handling
- Advanced configuration via `emmetConfig` facet and `GlobalConfig`

## File Index

| File | Purpose | Load when… |
|------|---------|------------|
| `SKILL.md` | This overview and navigation guide | Always |
| `reference.md` | Full API reference for all exports | Implementing or debugging specific options/commands |
| `examples.md` | Ready-to-use code examples | Looking for patterns or common setups |
| `scripts/helper.py` | CLI utility for testing Emmet abbreviations | Validating abbreviations outside the editor |

## Quick-Start

Install the package:

```bash
npm i @emmetio/codemirror6-plugin
```

Minimal setup with abbreviation expansion:

```js
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { html } from '@codemirror/lang-html';
import { expandAbbreviation, abbreviationTracker } from '@emmetio/codemirror6-plugin';

new EditorView({
    state: EditorState.create({
        extensions: [
            basicSetup,
            html(),
            abbreviationTracker(),
            keymap.of([{ key: 'Tab', run: expandAbbreviation }]),
        ]
    }),
    parent: document.body
});
```

## Key Concepts

### Syntax
Emmet is syntax-aware. Set the `syntax` option to match your document type (e.g. `html`, `css`, `jsx`). Without it, `html` is assumed.

### Abbreviation Tracker
`abbreviationTracker()` automatically marks text that looks like an Emmet abbreviation and shows a preview when it's complex. Expand with <kbd>Tab</kbd> or reset with <kbd>Esc</kbd>.

### Commands
All Emmet actions are exported as CodeMirror `StateCommand` values and can be bound to any key via `keymap.of([...])`.

### Configuration
Use the `emmetConfig` facet to provide plugin-wide options, or pass options directly to `abbreviationTracker({ ... })`.

## Exported Symbols at a Glance

| Symbol | Type | Description |
|--------|------|-------------|
| `abbreviationTracker` | function | Extension factory; enables live abbreviation tracking |
| `expandAbbreviation` | StateCommand | Expand abbreviation at caret |
| `enterAbbreviationMode` | StateCommand | Enter interactive abbreviation entry mode |
| `emmetCompletionSource` | CompletionSource | CodeMirror autocomplete source for Emmet |
| `emmetConfig` | Facet | Configure Emmet plugin options |
| `EmmetKnownSyntax` | enum | All supported syntax identifiers |
| `wrapWithAbbreviation` | function | Extension factory for Wrap With Abbreviation |
| `balanceOutward` / `balanceInward` | StateCommand | Select balanced tag pair outward/inward |
| `toggleComment` | StateCommand | Toggle HTML/CSS comment |
| `evaluateMath` | StateCommand | Evaluate inline math expression |
| `goToNextEditPoint` / `goToPreviousEditPoint` | StateCommand | Jump to next/previous edit point |
| `goToTagPair` | StateCommand | Jump to matching tag |
| `incrementNumber1` / `decrementNumber1` | StateCommand | Increment/decrement number by 1 |
| `incrementNumber01` / `decrementNumber01` | StateCommand | Increment/decrement number by 0.1 |
| `incrementNumber10` / `decrementNumber10` | StateCommand | Increment/decrement number by 10 |
| `removeTag` | StateCommand | Remove tag around caret |
| `selectNextItem` / `selectPreviousItem` | StateCommand | Select next/previous editable item |
| `splitJoinTag` | StateCommand | Split or join self-closing tag |

See `reference.md` for full option details and `examples.md` for complete integration patterns.

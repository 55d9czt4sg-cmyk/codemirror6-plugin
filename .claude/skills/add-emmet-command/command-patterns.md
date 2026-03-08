# Command Patterns Reference

Annotated examples from existing commands in `src/commands/`.

## Minimal command (expand.ts)

The simplest command pattern: extract an abbreviation from the current line, expand it, and apply it as a snippet.

```typescript
// src/commands/expand.ts
import type { StateCommand } from '@codemirror/state';
import { expand, extract, getOptions } from '../lib/emmet';
import { getSyntaxType } from '../lib/syntax';
import { snippet } from '@codemirror/autocomplete';
import { getActivationContext } from '../tracker';

export const expandAbbreviation: StateCommand = ({ state, dispatch }) => {
    const sel = state.selection.main;
    const line = state.doc.lineAt(sel.anchor);
    // getOptions reads the emmetConfig facet for the current position
    const options = getOptions(state, sel.anchor);
    // extract() finds the abbreviation boundary in the line text
    const abbr = extract(line.text, sel.anchor - line.from, getSyntaxType(options.syntax));

    if (abbr) {
        const start = line.from + abbr.start;
        const expanded = expand(state, abbr.abbreviation, getActivationContext(state, start) || options);
        // snippet() applies tab-stop formatting from Emmet's output
        const fn = snippet(expanded);
        fn({ state, dispatch }, { label: 'expand' }, start, line.from + abbr.end);
        return true;  // Command handled the event
    }

    return false;  // Pass through to next handler
};
```

## HTML + CSS dual-path (balance.ts excerpt)

When a command needs to behave differently in HTML vs CSS context:

```typescript
import { syntaxTree } from '@codemirror/language';
import { cssLanguage } from '@codemirror/lang-css';
import { htmlLanguage } from '@codemirror/lang-html';

function getOutwardRanges(state: EditorState, pos: number): RangeObject[] | undefined {
    // Check CSS first (embedded stylesheets in HTML are CSS too)
    if (cssLanguage.isActiveAt(state, pos)) {
        return getCSSOutwardRanges(state, pos);
    }
    if (htmlLanguage.isActiveAt(state, pos)) {
        return getHTMLOutwardRanges(state, pos);
    }
    return undefined;  // Neither: command does nothing
}
```

## Multi-cursor with per-selection changes (inc-dec-number.ts excerpt)

When you need to apply independent changes for each cursor/selection:

```typescript
import { EditorSelection } from '@codemirror/state';
import type { StateCommand, TransactionSpec } from '@codemirror/state';

const myCommand: StateCommand = ({ state, dispatch }) => {
    const specs: TransactionSpec[] = [];

    for (const sel of state.selection.ranges) {
        // Compute change for this selection range
        const newText = computeNewText(state.doc.sliceString(sel.from, sel.to));
        specs.push({
            changes: { from: sel.from, to: sel.to, insert: newText },
            selection: EditorSelection.range(sel.from, sel.from + newText.length)
        });
    }

    if (specs.some(s => s.changes)) {
        // state.update(...specs) merges all specs into one transaction
        dispatch(state.update(...specs));
        return true;
    }
    return false;
};
```

## Syntax tree walking (balance.ts excerpt)

To inspect the parse tree at the cursor:

```typescript
import { syntaxTree } from '@codemirror/language';
import type { SyntaxNode } from '@lezer/common';

function getHTMLOutwardRanges(state: EditorState, pos: number): RangeObject[] {
    const result: RangeObject[] = [];
    // resolveInner(pos, -1) finds the innermost node that ends at or after pos
    const tree = syntaxTree(state).resolveInner(pos, -1);

    // Walk up the ancestor chain
    for (let node: SyntaxNode | null = tree; node; node = node.parent) {
        if (node.name === 'Element') {
            // node.getChild('OpenTag'), node.getChild('CloseTag'), etc.
            pushHTMLRanges(node, result);
        }
    }

    return result;
}
```

---
name: add-emmet-command
description: Add a new Emmet command to the CodeMirror 6 plugin. Use when implementing a new Emmet action, editor command, or operation that follows the StateCommand pattern.
argument-hint: <command-name>
---

# Add Emmet Command: $ARGUMENTS

Add a new Emmet command to this CodeMirror 6 plugin following the established patterns.

## Steps

1. **Create the command file** at `src/commands/<command-name>.ts`

   Follow the `StateCommand` pattern used by existing commands:

   ```typescript
   import type { StateCommand } from '@codemirror/state';
   // Import helpers as needed:
   // import { getOptions } from '../lib/emmet';
   // import { getSyntaxType } from '../lib/syntax';
   // import { cssLanguage, htmlLanguage } from their packages
   // import utilities from '../lib/utils';

   export const myCommandName: StateCommand = ({ state, dispatch }) => {
       // 1. Get current selection / position
       const sel = state.selection.main;

       // 2. Detect syntax context (HTML vs CSS) if needed
       //    Use cssLanguage.isActiveAt(state, pos) or htmlLanguage.isActiveAt(state, pos)

       // 3. Compute changes
       //    Build a ChangeSet or new selection using state.changes(...)

       // 4. Dispatch the transaction
       //    dispatch(state.update({ changes, selection, scrollIntoView: true }));

       // 5. Return true if command did something, false otherwise
       return false;
   };
   ```

2. **Export from the public API** in `src/plugin.ts`:

   ```typescript
   export { myCommandName } from './commands/<command-name>';
   ```

3. **Wire up a keybinding** (optional) in `src/main.ts` for development testing:

   ```typescript
   import { myCommandName } from './plugin';
   // Add to the keymap extensions array:
   keymap.of([{ key: 'Ctrl-Shift-x', run: myCommandName }])
   ```

## Key patterns in this codebase

- **`StateCommand` signature**: `({ state, dispatch }) => boolean` — return `true` if the command acted, `false` to pass through to the next handler.
- **Syntax detection**: Use `cssLanguage.isActiveAt(state, pos)` and `htmlLanguage.isActiveAt(state, pos)` from `@codemirror/lang-css` / `@codemirror/lang-html` to branch on HTML vs CSS context.
- **Syntax tree**: Use `syntaxTree(state).resolveInner(pos, -1)` from `@codemirror/language` to walk the parse tree.
- **Emmet helpers**: `expand`, `extract`, `getOptions` from `../lib/emmet`; `getSyntaxType` from `../lib/syntax`.
- **Utilities**: `narrowToNonSpace`, `rangeContains`, `rangesEqual`, `last`, etc. from `../lib/utils`.
- **Multi-cursor**: Iterate `state.selection.ranges` and build a matching array of new `SelectionRange` or changes for each cursor position.

## Reference files

- See [command-patterns.md](command-patterns.md) for annotated examples from existing commands.
- `src/commands/balance.ts` — good example of HTML + CSS dual-path with syntax tree walking.
- `src/commands/expand.ts` — minimal example of extract → expand → snippet flow.
- `src/commands/inc-dec-number.ts` — example of text manipulation with regex matching.
- `src/lib/utils.ts` — shared helpers available to all commands.

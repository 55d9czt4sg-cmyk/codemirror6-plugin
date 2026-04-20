---
name: dev
description: Start the Vite development server for the codemirror6-plugin. Use when you want to interactively test Emmet commands in the browser demo.
disable-model-invocation: true
allowed-tools: Bash(npm run dev)
---

# Start Dev Server

Start the Vite dev server to test changes interactively in the browser.

```bash
npm run dev
```

The demo runs at **http://localhost:3009** and hot-reloads on file changes.

## What the demo shows

`src/main.ts` sets up a full CodeMirror editor with every Emmet command wired to keybindings. Open the browser, type Emmet abbreviations (e.g. `ul>li*3`), and press `Tab` to expand.

## Default keybindings in the demo

These match the keymap in `src/main.ts`:

| Key | Command |
|---|---|
| `Cmd-e` | `expandAbbreviation` |
| `Cmd-Shift-e` | `enterAbbreviationMode` |
| `Cmd-Shift-d` | `balanceOutward` |
| `Ctrl-/` | `toggleComment` |
| `Ctrl-y` | `evaluateMath` |
| `Ctrl-Alt-ArrowLeft` / `Ctrl-Alt-ArrowRight` | `goToPreviousEditPoint` / `goToNextEditPoint` |
| `Ctrl-g` | `goToTagPair` |
| `Ctrl-Alt-ArrowUp` / `Ctrl-Alt-ArrowDown` | `incrementNumber1` / `decrementNumber1` |
| `Ctrl-'` | `removeTag` |
| `Ctrl-Shift-'` | `splitJoinTag` |
| `Ctrl-.` / `Ctrl-,` | `selectNextItem` / `selectPreviousItem` |

`wrapWithAbbreviation` is registered as an extension (not a keymap entry) — it uses its own internal keybinding.

Commands not bound in the demo: `balanceInward`, `incrementNumber01/10`, `decrementNumber01/10`.

## Tips

- Edit files in `src/commands/` or `src/lib/` and the page reloads automatically.
- Use browser DevTools → Console to see errors thrown by commands.
- To test your new command, add it to the keymap in `src/main.ts`.

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

| Key | Command |
|---|---|
| `Tab` | `expandAbbreviation` |
| `Ctrl-,` | `balanceOutward` |
| `Ctrl-.` | `balanceInward` |
| `Ctrl-/` | `toggleComment` |
| `Ctrl-'` | `evaluateMath` |
| `Ctrl-Up` / `Ctrl-Down` | `goToNextEditPoint` / `goToPreviousEditPoint` |
| `Ctrl-Alt-j` | `goToTagPair` |
| `Alt-Up` / `Alt-Down` | `incrementNumber1` / `decrementNumber1` |
| `Ctrl-Alt-Up` / `Ctrl-Alt-Down` | `incrementNumber10` / `decrementNumber10` |
| `Alt-Shift-Up` / `Alt-Shift-Down` | `incrementNumber01` / `decrementNumber01` |
| `Ctrl-k` | `removeTag` |
| `Ctrl-Shift-.` / `Ctrl-Shift-,` | `selectNextItem` / `selectPreviousItem` |
| `Ctrl-Shift-'` | `splitJoinTag` |
| `Ctrl-Shift-a` | `wrapWithAbbreviation` |

## Tips

- Edit files in `src/commands/` or `src/lib/` and the page reloads automatically.
- Use browser DevTools → Console to see errors thrown by commands.
- To test your new command, add it to the keymap in `src/main.ts`.

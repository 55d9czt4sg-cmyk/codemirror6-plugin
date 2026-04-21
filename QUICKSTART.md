# Quickstart: Emmet for CodeMirror 6

Get Emmet abbreviation expansion working in your CodeMirror 6 editor in a few minutes.

## Before you begin

Make sure you have:

- Node.js and npm installed
- A CodeMirror 6 editor already set up in your project

If you don't have CodeMirror 6 yet, follow the [CodeMirror setup guide](https://codemirror.net/docs/guide/) first.

---

## Step 1: Install the plugin

```bash
npm i @emmetio/codemirror6-plugin
```

---

## Step 2: Add abbreviation expansion

The fastest way to get started is to bind `expandAbbreviation` to a key:

```js
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { html } from '@codemirror/lang-html';
import { keymap } from '@codemirror/view';
import { expandAbbreviation } from '@emmetio/codemirror6-plugin';

const view = new EditorView({
    state: EditorState.create({
        extensions: [
            basicSetup,
            html(),
            keymap.of([{
                key: 'Tab',
                run: expandAbbreviation
            }])
        ]
    }),
    parent: document.body
});
```

Type `ul>li*3` in the editor and press `Tab` — it expands to a full HTML list.

---

## Step 3: Enable the abbreviation tracker (recommended)

The tracker highlights what you type as an Emmet abbreviation and shows a live preview before you expand it:

```js
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { html } from '@codemirror/lang-html';
import { abbreviationTracker } from '@emmetio/codemirror6-plugin';

const view = new EditorView({
    state: EditorState.create({
        extensions: [
            basicSetup,
            html(),
            abbreviationTracker()
        ]
    }),
    parent: document.body
});
```

Once the tracker is active:

- Type any Emmet abbreviation — it gets the `emmet-abbreviation` CSS class and a preview appears for complex expansions.
- Press `Tab` to expand, or `Esc` to cancel.

---

## Step 4: Set the document syntax

Emmet behaves differently in HTML, CSS, JSX, and other syntaxes. Specify syntax with `emmetConfig` or as a tracker option:

```js
import { emmetConfig, abbreviationTracker } from '@emmetio/codemirror6-plugin';

// Option A — facet (applied to the whole editor)
emmetConfig.of({ syntax: 'css' })

// Option B — tracker option
abbreviationTracker({ syntax: 'jsx' })
```

Common syntax values: `html`, `css`, `scss`, `jsx`, `xml`, `pug`. Default is `html`.

---

## Step 5: Try more commands

Import any command and bind it to a key:

| Command | What it does |
| --- | --- |
| `expandAbbreviation` | Expand abbreviation at caret |
| `enterAbbreviationMode` | Enter interactive abbreviation mode |
| `wrapWithAbbreviation` | Wrap selection with abbreviation |
| `balanceOutward` / `balanceInward` | Select enclosing / inner tag |
| `toggleComment` | Toggle comment on selection |
| `evaluateMath` | Evaluate math expression in place |
| `goToNextEditPoint` / `goToPreviousEditPoint` | Jump between edit points |
| `goToTagPair` | Jump to matching tag |
| `removeTag` | Remove tag, keep content |
| `splitJoinTag` | Toggle between open/self-closing tag |
| `selectNextItem` / `selectPreviousItem` | Select next/previous attribute or value |
| `incrementNumber1` / `decrementNumber1` | Nudge number by 1 |
| `incrementNumber10` / `decrementNumber10` | Nudge number by 10 |
| `incrementNumber01` / `decrementNumber01` | Nudge number by 0.1 |

Example — binding several commands at once:

```js
import {
    expandAbbreviation,
    balanceOutward,
    balanceInward,
    goToNextEditPoint,
    goToPreviousEditPoint,
    toggleComment
} from '@emmetio/codemirror6-plugin';
import { keymap } from '@codemirror/view';

keymap.of([
    { key: 'Tab',       run: expandAbbreviation },
    { key: 'Ctrl-,',   run: balanceOutward },
    { key: 'Ctrl-.',   run: balanceInward },
    { key: 'Ctrl-Alt-Right', run: goToNextEditPoint },
    { key: 'Ctrl-Alt-Left',  run: goToPreviousEditPoint },
    { key: 'Cmd-/',    run: toggleComment },
])
```

---

## Full minimal example

```js
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { html } from '@codemirror/lang-html';
import { keymap } from '@codemirror/view';
import {
    abbreviationTracker,
    expandAbbreviation,
    wrapWithAbbreviation
} from '@emmetio/codemirror6-plugin';

const view = new EditorView({
    state: EditorState.create({
        doc: '',
        extensions: [
            basicSetup,
            html(),
            abbreviationTracker(),
            keymap.of([{ key: 'Tab', run: expandAbbreviation }]),
            wrapWithAbbreviation('Ctrl-w')
        ]
    }),
    parent: document.getElementById('editor')
});
```

---

## What's next?

- **Full API reference** — see [README.md](./README.md) for all options and syntax details.
- **Emmet syntax** — learn abbreviation syntax at [docs.emmet.io](https://docs.emmet.io).
- **CodeMirror extensions guide** — understand how extensions compose at [codemirror.net/docs/guide](https://codemirror.net/docs/guide/).

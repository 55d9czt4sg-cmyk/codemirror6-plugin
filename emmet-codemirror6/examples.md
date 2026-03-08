# Usage Examples — @emmetio/codemirror6-plugin

## 1. Minimal HTML Editor with Tab Expansion

The simplest setup: expand abbreviations on <kbd>Tab</kbd>.

```js
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { html } from '@codemirror/lang-html';
import { expandAbbreviation } from '@emmetio/codemirror6-plugin';

new EditorView({
    state: EditorState.create({
        extensions: [
            basicSetup,
            html(),
            keymap.of([{ key: 'Tab', run: expandAbbreviation }]),
        ]
    }),
    parent: document.body
});
```

Type `ul>li*3` then press <kbd>Tab</kbd> to expand.

---

## 2. Abbreviation Tracker (Auto-Mark + Preview)

Enable live tracking so Emmet marks text that looks like an abbreviation and shows a preview for complex ones.

```js
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { html } from '@codemirror/lang-html';
import { abbreviationTracker } from '@emmetio/codemirror6-plugin';

new EditorView({
    state: EditorState.create({
        extensions: [
            basicSetup,
            html(),
            abbreviationTracker(),   // Tab to expand, Esc to cancel
        ]
    }),
    parent: document.body
});
```

---

## 3. CSS Editor

Use the `syntax` option so Emmet generates CSS output instead of HTML.

```js
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { css } from '@codemirror/lang-css';
import { abbreviationTracker } from '@emmetio/codemirror6-plugin';

new EditorView({
    state: EditorState.create({
        extensions: [
            basicSetup,
            css(),
            abbreviationTracker({ syntax: 'css' }),
        ]
    }),
    parent: document.body
});
```

Type `m10` then press <kbd>Tab</kbd> → expands to `margin: 10px;`.

---

## 4. JSX Editor

JSX mode requires abbreviations to start with `<` to avoid false positives.

```js
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { abbreviationTracker } from '@emmetio/codemirror6-plugin';

new EditorView({
    state: EditorState.create({
        extensions: [
            basicSetup,
            javascript({ jsx: true }),
            abbreviationTracker({ syntax: 'jsx' }),
        ]
    }),
    parent: document.body
});
```

Type `<ul>li*3` → expands to JSX with `className` instead of `class`.

---

## 5. Global Config via `emmetConfig` Facet

Apply plugin-wide settings (e.g. XHTML style, BEM support, custom snippets) using the facet.

```js
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { html } from '@codemirror/lang-html';
import {
    abbreviationTracker,
    emmetConfig
} from '@emmetio/codemirror6-plugin';

new EditorView({
    state: EditorState.create({
        extensions: [
            basicSetup,
            html(),
            emmetConfig.of({
                markupStyle: 'xhtml',   // <br /> instead of <br>
                attributeQuotes: 'single',
                comments: true,         // append <!-- /.class --> comments
                bem: true,              // BEM shorthand
                config: {
                    markup: {
                        snippets: {
                            // custom abbreviation snippets
                            'card': 'div.card>div.card__header+div.card__body'
                        }
                    }
                }
            }),
            abbreviationTracker(),
        ]
    }),
    parent: document.body
});
```

---

## 6. Full Keyboard Shortcut Setup

Bind the complete set of Emmet commands to keyboard shortcuts.

```js
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { Prec } from '@codemirror/state';
import { basicSetup } from 'codemirror';
import { html } from '@codemirror/lang-html';
import {
    abbreviationTracker,
    expandAbbreviation,
    enterAbbreviationMode,
    wrapWithAbbreviation,
    balanceOutward,
    balanceInward,
    toggleComment,
    evaluateMath,
    goToNextEditPoint,
    goToPreviousEditPoint,
    goToTagPair,
    incrementNumber1,
    decrementNumber1,
    incrementNumber10,
    decrementNumber10,
    removeTag,
    selectNextItem,
    selectPreviousItem,
    splitJoinTag,
} from '@emmetio/codemirror6-plugin';

new EditorView({
    state: EditorState.create({
        extensions: [
            basicSetup,
            html(),
            // Use Prec.high so tracker keybindings beat the default Tab handler
            Prec.high(abbreviationTracker()),
            wrapWithAbbreviation('Ctrl-Shift-a'),
            keymap.of([
                { key: 'Cmd-e',              run: expandAbbreviation },
                { key: 'Cmd-Shift-e',        run: enterAbbreviationMode },
                { key: 'Cmd-Shift-d',        run: balanceOutward },
                { key: 'Cmd-d',              run: balanceInward },
                { key: 'Ctrl-/',             run: toggleComment },
                { key: 'Ctrl-y',             run: evaluateMath },
                { key: 'Ctrl-Alt-ArrowRight',run: goToNextEditPoint },
                { key: 'Ctrl-Alt-ArrowLeft', run: goToPreviousEditPoint },
                { key: 'Ctrl-g',             run: goToTagPair },
                { key: 'Ctrl-Alt-ArrowUp',   run: incrementNumber1 },
                { key: 'Ctrl-Alt-ArrowDown', run: decrementNumber1 },
                { key: 'Ctrl-Shift-ArrowUp', run: incrementNumber10 },
                { key: 'Ctrl-Shift-ArrowDown',run: decrementNumber10 },
                { key: "Ctrl-'",             run: removeTag },
                { key: "Ctrl-Shift-'",       run: splitJoinTag },
                { key: 'Ctrl-.',             run: selectNextItem },
                { key: 'Ctrl-,',             run: selectPreviousItem },
            ]),
        ]
    }),
    parent: document.body
});
```

---

## 7. Autocomplete Integration

Provide Emmet abbreviations inside CodeMirror's autocomplete dropdown.

```js
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { html } from '@codemirror/lang-html';
import { autocompletion } from '@codemirror/autocomplete';
import { emmetCompletionSource } from '@emmetio/codemirror6-plugin';

new EditorView({
    state: EditorState.create({
        extensions: [
            basicSetup,
            html(),
            autocompletion({ override: [emmetCompletionSource] }),
        ]
    }),
    parent: document.body
});
```

---

## 8. Shadow DOM / Custom Root

When embedding CodeMirror inside a Shadow DOM, pass the `root` to the preview config so the popup renders in the right context.

```js
import { emmetConfig } from '@emmetio/codemirror6-plugin';

const shadowRoot = myElement.attachShadow({ mode: 'open' });

emmetConfig.of({
    preview: { root: shadowRoot }
})
```

---

## 9. Autocomplete Tab Only for Stylesheets

Force <kbd>Tab</kbd> to accept an Emmet autocomplete suggestion only in CSS/SCSS contexts, leaving Tab free for indentation in HTML.

```js
abbreviationTracker({ autocompleteTab: ['css', 'scss', 'less'] })
```

---

## 10. Disable Tag-Pair Highlighting

Turn off the automatic open/close tag highlighting to improve performance in very large documents.

```js
emmetConfig.of({
    markTagPairs: false,
    autoRenameTags: false,
})
```

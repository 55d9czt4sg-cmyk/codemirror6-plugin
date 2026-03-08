# API Reference — @emmetio/codemirror6-plugin

## Installation

```bash
npm i @emmetio/codemirror6-plugin
```

### Peer Dependencies

```
@codemirror/autocomplete ^6.17.0
@codemirror/commands    ^6.6.0
@codemirror/lang-css    ^6.2.1
@codemirror/lang-html   ^6.4.9
@codemirror/language    ^6.10.2
@codemirror/state       ^6.4.1
@codemirror/view        ^6.29.1
```

---

## `emmetConfig` Facet

```ts
import { emmetConfig } from '@emmetio/codemirror6-plugin';
```

A CodeMirror `Facet<Partial<EmmetConfig>, EmmetConfig>` used to configure the plugin globally.

```js
emmetConfig.of({ syntax: 'css', markTagPairs: false })
```

Multiple facet values are merged, with later values winning (except `preview`, which is shallow-merged).

### `EmmetConfig` Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `syntax` | `EmmetKnownSyntax \| string` | `'html'` | Document syntax. Controls parsing and output style. |
| `mark` | `boolean \| string[]` | `true` | Enable abbreviation marking. Pass an array of syntax names to limit scope. |
| `preview` | `EmmetPreviewConfig` | `{}` | Configure the abbreviation preview popup. |
| `previewEnabled` | `boolean \| string[]` | `true` | Show abbreviation preview. Pass an array of syntax/mode names to limit scope. |
| `markTagPairs` | `boolean` | `true` | Highlight matching open/close tag pairs. |
| `previewOpenTag` | `boolean` | `false` | Show open-tag preview when caret is inside its matching closing tag (requires `markTagPairs`). |
| `autoRenameTags` | `boolean` | `true` | Auto-rename matched tag pair when one is edited (requires `markTagPairs`). |
| `autocompleteTab` | `boolean \| string[]` | `undefined` | Force Tab key to select Emmet autocomplete item. Pass `true` or array of syntax names. |
| `attributeQuotes` | `'single' \| 'double'` | `'double'` | Quote style for generated HTML attribute values. |
| `markupStyle` | `'html' \| 'xhtml' \| 'xml'` | `'html'` | Self-closing element style (`<br>` vs `<br />` vs `<br/>`). |
| `comments` | `boolean` | `false` | Append comments with `id`/`class` values to generated elements. |
| `commentsTemplate` | `string` | `'<!-- /[#ID][.CLASS] -->'` | Template for auto-comments. `[#ID]` and `[.CLASS]` are replaced with attribute values; content inside `[...]` is omitted when the attribute is absent. Use `\n` for newlines. |
| `bem` | `boolean` | `false` | Enable BEM class-name shorthand support. |
| `shortHex` | `boolean` | `undefined` | Shorten hex colors where possible (`#000000` → `#000`). |
| `config` | `GlobalConfig` | `undefined` | Advanced Emmet engine config (snippets, options, etc.). |
| `completionBoost` | `number` | `99` | `boost` value applied to Emmet autocomplete items. |

### `EmmetPreviewConfig`

| Option | Type | Description |
|--------|------|-------------|
| `html` | `() => Extension` | Extensions factory for the HTML abbreviation preview editor. |
| `css` | `() => Extension` | Extensions factory for the CSS abbreviation preview editor. |
| `root` | `Document \| ShadowRoot` | Root for the preview `EditorView` (useful inside Shadow DOM). |

---

## `EmmetKnownSyntax` Enum

```ts
import { EmmetKnownSyntax } from '@emmetio/codemirror6-plugin';
```

All recognized syntax identifiers:

| Value | Description |
|-------|-------------|
| `html` | HTML (also detects inline CSS) |
| `xml` | XML |
| `xsl` | XSL |
| `jsx` | JSX — requires abbreviation to start with `<` by default |
| `tsx` | TSX |
| `vue` | Vue SFC template |
| `haml` | HAML |
| `jade` / `pug` | Pug/Jade |
| `slim` | Slim |
| `css` | CSS |
| `scss` | SCSS |
| `less` | LESS |
| `sass` | Sass (indented) |
| `sss` | SugarSS |
| `stylus` | Stylus |
| `postcss` | PostCSS |

---

## `abbreviationTracker(options?)`

```ts
import { abbreviationTracker } from '@emmetio/codemirror6-plugin';
```

Returns a CodeMirror `Extension` that enables live Emmet abbreviation tracking, marking, and preview.

```js
abbreviationTracker()                        // all defaults
abbreviationTracker({ syntax: 'jsx' })       // per-tracker syntax override
abbreviationTracker({ autocompleteTab: ['stylesheet'] })
```

Accepts a `Partial<EmmetConfig>` and merges it with any `emmetConfig` facet values. Options passed here take precedence over the facet.

**Behavior:**
- Adds `emmet-abbreviation` CSS class to the abbreviation range.
- Pressing <kbd>Tab</kbd> inside a tracked abbreviation expands it.
- Pressing <kbd>Esc</kbd> resets the tracker.
- Complex abbreviations (expanding to more than one element) show a popup preview.

---

## `emmetCompletionSource`

```ts
import { emmetCompletionSource } from '@emmetio/codemirror6-plugin';
```

A CodeMirror `CompletionSource` for use with `@codemirror/autocomplete`. Provides Emmet abbreviation completions in the autocomplete dropdown.

```js
import { autocompletion } from '@codemirror/autocomplete';

autocompletion({ override: [emmetCompletionSource] })
```

---

## Commands (StateCommand)

All commands below are `StateCommand` values — functions with signature `(target: { state, dispatch }) => boolean`. Bind them via `keymap.of([{ key, run }])`.

### `expandAbbreviation`

Expands the Emmet abbreviation immediately to the left of the caret. Context-agnostic — works anywhere in the document regardless of syntax context.

### `enterAbbreviationMode`

Enters a special mode where every character typed is tracked as an Emmet abbreviation with live preview. Useful when abbreviation tracking is off or for explicit invocation. Exit with <kbd>Tab</kbd> (expand) or <kbd>Esc</kbd> (cancel).

### `balanceOutward` / `balanceInward`

Select the HTML tag pair that contains (outward) or is contained by (inward) the current selection. Successive invocations grow or shrink the selection.

### `toggleComment`

Toggle an HTML comment (`<!-- ... -->`) around the current selection or the tag at caret. Also toggles CSS block comments (`/* ... */`) inside CSS contexts.

### `evaluateMath`

Evaluate a math expression immediately to the left of the caret and replace it with the numeric result. Example: `2*3+1` → `7`.

### `goToNextEditPoint` / `goToPreviousEditPoint`

Move the caret to the next or previous "edit point" — an empty attribute value, empty tag content, or `${tabstop}` placeholder.

### `goToTagPair`

Move the caret from the current open tag to its matching closing tag (or vice versa).

### `incrementNumber1` / `decrementNumber1`

Increment or decrement the number under or to the left of the caret by **1**.

### `incrementNumber01` / `decrementNumber01`

Increment or decrement by **0.1**.

### `incrementNumber10` / `decrementNumber10`

Increment or decrement by **10**.

### `removeTag`

Remove the tag around the caret, keeping its inner content.

### `selectNextItem` / `selectPreviousItem`

Select the next or previous "item" — an HTML attribute or CSS property — cycling through editable regions.

### `splitJoinTag`

Toggle a tag between its expanded form (`<div></div>`) and self-closing form (`<div />`).

---

## `wrapWithAbbreviation(key?)`

```ts
import { wrapWithAbbreviation } from '@emmetio/codemirror6-plugin';
```

Returns a CodeMirror `Extension` that adds the Wrap With Abbreviation command. The optional `key` parameter sets the keyboard shortcut (default: `Ctrl-w`).

```js
wrapWithAbbreviation()           // default shortcut Ctrl-w
wrapWithAbbreviation('Ctrl-Shift-a')
```

When triggered, a prompt is shown for entering the wrapping abbreviation. The selected text (or current line) is wrapped using Emmet's wrap algorithm.

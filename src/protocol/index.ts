/**
 * Protocol Plugin for CodeMirror 6
 *
 * A plugin that demonstrates core CM6 concepts for document observation
 * and visual decoration:
 *
 *  1. Facet       – composable configuration for the plugin
 *  2. ViewPlugin  – observes the visible document and reacts to updates
 *  3. Decoration  – marks URL text with visual styling and interactivity
 *  4. Theme       – scoped CSS applied via EditorView.baseTheme
 *  5. Command     – opens the URL under the cursor in a new tab
 *  6. Extension   – bundles everything into one composable unit
 */

import { Facet } from '@codemirror/state';
import { ViewPlugin, Decoration, EditorView } from '@codemirror/view';
import type { DecorationSet, ViewUpdate } from '@codemirror/view';
import type { Extension, Range } from '@codemirror/state';

// ---------------------------------------------------------------------------
// URL pattern – matches common URL protocols in document text.
// Intentionally conservative: starts at a word boundary and stops before
// whitespace or common punctuation that is unlikely to be part of a URL.
// ---------------------------------------------------------------------------

const URL_RE =
    /\b(https?:\/\/|ftp:\/\/|mailto:|tel:)[^\s"'<>\])\}]+/g;

// ---------------------------------------------------------------------------
// 1. Facet – carries plugin configuration into the state machinery.
// ---------------------------------------------------------------------------

export interface ProtocolConfig {
    /**
     * Whether clicking a decorated URL opens it in a new browser tab.
     * Defaults to `true`.
     */
    openOnClick?: boolean;

    /**
     * Additional CSS class added to decorated URLs (on top of the built-in
     * `cm-protocol-link` class). Useful for custom styling.
     */
    linkClass?: string;
}

const protocolConfig = Facet.define<ProtocolConfig, Required<ProtocolConfig>>({
    combine(configs) {
        return {
            openOnClick: configs.findLast(c => c.openOnClick != null)?.openOnClick ?? true,
            linkClass:   configs.findLast(c => c.linkClass   != null)?.linkClass   ?? '',
        };
    },
});

// ---------------------------------------------------------------------------
// 2. ViewPlugin – runs inside the editor view; has access to the DOM.
//    It scans only the *visible* text ranges for performance, rebuilds
//    decorations on every update that changes the document or viewport.
// ---------------------------------------------------------------------------

function buildDecorations(view: EditorView): DecorationSet {
    const cfg = view.state.facet(protocolConfig);
    const decorations: Range<Decoration>[] = [];

    for (const { from, to } of view.visibleRanges) {
        const text = view.state.doc.sliceString(from, to);
        let match: RegExpExecArray | null;
        URL_RE.lastIndex = 0;
        while ((match = URL_RE.exec(text)) !== null) {
            const start = from + match.index;
            const end   = start + match[0].length;
            const url   = match[0];

            const classes = ['cm-protocol-link', cfg.linkClass].filter(Boolean).join(' ');

            const attrs: Record<string, string> = {
                class: classes,
                title: url,
            };
            if (cfg.openOnClick) {
                attrs['data-url'] = url;
            }

            decorations.push(
                Decoration.mark({ attributes: attrs, inclusive: false }).range(start, end)
            );
        }
    }

    return Decoration.set(decorations);
}

const protocolViewPlugin = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet;

        constructor(view: EditorView) {
            this.decorations = buildDecorations(view);
        }

        update(update: ViewUpdate) {
            if (update.docChanged || update.viewportChanged) {
                this.decorations = buildDecorations(update.view);
            }
        }
    },
    { decorations: v => v.decorations }
);

// ---------------------------------------------------------------------------
// 3. Click handler – opens the URL stored in `data-url` when the user clicks
//    on a decorated link (only active when openOnClick is enabled).
// ---------------------------------------------------------------------------

const clickHandler = EditorView.domEventHandlers({
    click(event, view) {
        const cfg = view.state.facet(protocolConfig);
        if (!cfg.openOnClick) return false;

        const target = event.target as HTMLElement;
        const url = target.closest('[data-url]')?.getAttribute('data-url');
        if (!url) return false;

        window.open(url, '_blank', 'noopener,noreferrer');
        return true;
    },
});

// ---------------------------------------------------------------------------
// 4. Theme – scoped CSS that applies only inside the editor, never globally.
// ---------------------------------------------------------------------------

const protocolTheme = EditorView.baseTheme({
    '.cm-protocol-link': {
        color: '#0969da',
        textDecoration: 'underline',
        textUnderlineOffset: '2px',
        cursor: 'pointer',
    },
    '&dark .cm-protocol-link': {
        color: '#4493f8',
    },
    '.cm-protocol-link:hover': {
        textDecoration: 'none',
    },
});

// ---------------------------------------------------------------------------
// 5. Command – opens the URL at the current cursor position, if any.
// ---------------------------------------------------------------------------

/**
 * Open the URL that the cursor (or first selection) touches in a new tab.
 * Returns `false` if the cursor is not on a URL.
 */
export function openProtocolLink(view: EditorView): boolean {
    const pos = view.state.selection.main.head;
    const line = view.state.doc.lineAt(pos);
    const lineText = line.text;

    URL_RE.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = URL_RE.exec(lineText)) !== null) {
        const start = line.from + match.index;
        const end   = start + match[0].length;
        if (pos >= start && pos <= end) {
            window.open(match[0], '_blank', 'noopener,noreferrer');
            return true;
        }
    }
    return false;
}

// ---------------------------------------------------------------------------
// 6. Public extension factory – the single entry-point for users.
// ---------------------------------------------------------------------------

/**
 * Create the protocol-link plugin extension.
 *
 * Scans the visible document for URLs starting with common protocols
 * (`http://`, `https://`, `ftp://`, `mailto:`, `tel:`) and decorates
 * them so they are visually distinct and optionally clickable.
 *
 * ```ts
 * import { protocol } from '@emmetio/codemirror6-plugin';
 *
 * new EditorView({
 *   extensions: [
 *     basicSetup,
 *     html(),
 *     protocol(),
 *   ],
 *   parent: document.body,
 * });
 * ```
 *
 * To disable click-to-open behaviour:
 *
 * ```ts
 * protocol({ openOnClick: false })
 * ```
 */
export function protocol(config: ProtocolConfig = {}): Extension {
    return [
        protocolConfig.of(config),
        protocolViewPlugin,
        clickHandler,
        protocolTheme,
    ];
}

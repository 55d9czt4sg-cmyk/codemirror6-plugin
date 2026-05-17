import { EditorState } from '@codemirror/state';
import type { StateCommand, Transaction, Extension } from '@codemirror/state';
import { ensureSyntaxTree } from '@codemirror/language';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';

export type Lang = 'html' | 'css';

const langExtension: Record<Lang, Extension> = {
    html: html(),
    css: css(),
};

export type Sel = number | { anchor: number; head: number };

/**
 * Builds an EditorState with a language extension and forces a full syntax
 * parse so commands that call `syntaxTree()` see a complete tree.
 */
export function createState(doc: string, sel: Sel = 0, lang: Lang = 'html'): EditorState {
    const state = EditorState.create({
        doc,
        selection: typeof sel === 'number'
            ? { anchor: sel }
            : { anchor: sel.anchor, head: sel.head },
        extensions: [langExtension[lang]],
    });

    ensureSyntaxTree(state, doc.length, 10000);
    return state;
}

export interface CommandResult {
    handled: boolean;
    state: EditorState;
    doc: string;
    /** main selection range of the resulting state */
    selection: { from: number; to: number };
    /** text covered by the main selection */
    selectedText: string;
}

/**
 * Runs a StateCommand with a capturing dispatch and returns the resulting
 * document/selection.
 */
export function runCommand(command: StateCommand, state: EditorState): CommandResult {
    let next = state;
    const handled = command({
        state,
        dispatch: (tr: Transaction) => { next = tr.state; },
    });

    const main = next.selection.main;
    return {
        handled,
        state: next,
        doc: next.doc.toString(),
        selection: { from: main.from, to: main.to },
        selectedText: next.doc.sliceString(main.from, main.to),
    };
}

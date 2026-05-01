import * as vscode from 'vscode';
import { findTagAt } from '../lib/html-parser';
import { isHTML } from '../lib/syntax';
import { isSpace } from '../lib/document';

export function splitJoinTag(editor: vscode.TextEditor): void {
    if (!isHTML(editor.document.languageId)) return;

    const doc = editor.document;
    const text = doc.getText();
    const edits: Array<{ range: vscode.Range; newText: string }> = [];

    for (const sel of editor.selections) {
        const offset = doc.offsetAt(sel.active);
        const tag = findTagAt(text, offset);
        if (!tag) continue;

        const { open, close } = tag;
        if (close) {
            // Join: remove contents + close tag, add self-closing slash
            const charBeforeGt = text[open.to - 2];
            const closing = isSpace(charBeforeGt) ? '/' : ' /';
            edits.push({
                range: new vscode.Range(doc.positionAt(open.to - 1), doc.positionAt(close.to)),
                newText: `${closing}>`,
            });
        } else if (tag.selfClose) {
            // Split: convert self-closing to open+close pair
            let insertFrom = open.to;
            let prefix = '';

            // Remove the trailing slash (and optional space before it)
            const inner = text.slice(open.from + 1, open.to - 1); // between < and >
            const slashIdx = inner.lastIndexOf('/');
            if (slashIdx !== -1) {
                let removeFrom = open.from + 1 + slashIdx;
                if (removeFrom > open.from + 1 && isSpace(text[removeFrom - 1])) {
                    removeFrom--;
                }
                insertFrom = removeFrom;
                prefix = '>';
            }

            edits.push({
                range: new vscode.Range(doc.positionAt(insertFrom), doc.positionAt(open.to)),
                newText: `${prefix}</${tag.name}>`,
            });
        }
    }

    if (edits.length) {
        // Apply in reverse order to preserve offsets
        edits.sort((a, b) => b.range.start.compareTo(a.range.start));
        editor.edit(eb => {
            for (const e of edits) { eb.replace(e.range, e.newText); }
        });
    }
}

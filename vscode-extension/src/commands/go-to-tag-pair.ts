import * as vscode from 'vscode';
import { findTagAt } from '../lib/html-parser';
import { isHTML } from '../lib/syntax';

export function goToTagPair(editor: vscode.TextEditor): void {
    if (!isHTML(editor.document.languageId)) return;

    const doc = editor.document;
    const text = doc.getText();
    let found = false;

    const nextSelections = editor.selections.map(sel => {
        const offset = doc.offsetAt(sel.active);
        const tag = findTagAt(text, offset);
        if (tag && tag.close) {
            found = true;
            const { open, close } = tag;
            const inOpen = offset >= open.from && offset < open.to;
            const targetOffset = inOpen ? close.from : open.from;
            const pos = doc.positionAt(targetOffset);
            return new vscode.Selection(pos, pos);
        }
        return sel;
    });

    if (found) {
        editor.selections = nextSelections;
    }
}

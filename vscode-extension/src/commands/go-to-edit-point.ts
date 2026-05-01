import * as vscode from 'vscode';
import { isQuote, isSpace } from '../lib/document';

export function goToNextEditPoint(editor: vscode.TextEditor): void {
    moveToEditPoint(editor, 1);
}

export function goToPreviousEditPoint(editor: vscode.TextEditor): void {
    moveToEditPoint(editor, -1);
}

function moveToEditPoint(editor: vscode.TextEditor, inc: number): void {
    const doc = editor.document;
    const text = doc.getText();
    editor.selections = editor.selections.map(sel => {
        const offset = doc.offsetAt(sel.active);
        const next = findNewEditPoint(text, offset + inc, inc);
        if (next != null) {
            const pos = doc.positionAt(next);
            return new vscode.Selection(pos, pos);
        }
        return sel;
    });
}

function findNewEditPoint(text: string, pos: number, inc: number): number | undefined {
    const docSize = text.length;
    let cur = pos;

    while (cur < docSize && cur >= 0) {
        cur += inc;
        const ch   = text[cur];
        const next = text[cur + 1];
        const prev = text[cur - 1];

        if (isQuote(ch) && next === ch && prev === '=') {
            // Empty attribute value: cursor goes inside the quotes
            return cur + 1;
        }

        if (ch === '<' && prev === '>') {
            // Between closing and opening tags
            return cur;
        }

        if (isNewLine(ch)) {
            // Empty or whitespace-only line
            const lineStart = findLineStart(text, cur + Math.max(inc, 0));
            const lineEnd   = findLineEnd(text, lineStart);
            const lineText  = text.slice(lineStart, lineEnd);
            if (!lineText.length || isSpace(lineText)) {
                return lineStart + lineText.length;
            }
        }
    }

    return;
}

function isNewLine(ch: string): boolean {
    return ch === '\r' || ch === '\n';
}

function findLineStart(text: string, pos: number): number {
    let i = pos;
    while (i > 0 && text[i - 1] !== '\n') { i--; }
    return i;
}

function findLineEnd(text: string, lineStart: number): number {
    let i = lineStart;
    while (i < text.length && text[i] !== '\r' && text[i] !== '\n') { i++; }
    return i;
}

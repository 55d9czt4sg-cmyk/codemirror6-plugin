import * as vscode from 'vscode';
import { findTagAt } from '../lib/html-parser';
import { isHTML } from '../lib/syntax';
import { narrowToNonSpace, rangeEmpty, isSpace, lineIndentAt } from '../lib/document';
import type { RangeObject } from '../lib/types';

export function removeTag(editor: vscode.TextEditor): void {
    if (!isHTML(editor.document.languageId)) return;

    const doc = editor.document;
    const text = doc.getText();
    const edits: Array<{ range: vscode.Range; newText: string }> = [];

    for (const sel of editor.selections) {
        const offset = doc.offsetAt(sel.active);
        const tag = findTagAt(text, offset);
        if (!tag) continue;

        buildRemoveEdits(text, doc, tag.open, tag.close, edits);
    }

    if (edits.length) {
        // Apply in reverse to preserve offsets
        edits.sort((a, b) => b.range.start.compareTo(a.range.start));
        editor.edit(eb => {
            for (const e of edits) { eb.replace(e.range, e.newText); }
        });
    }
}

function buildRemoveEdits(
    text: string,
    doc: vscode.TextDocument,
    open: RangeObject,
    close: RangeObject | undefined,
    edits: Array<{ range: vscode.Range; newText: string }>,
): void {
    if (close) {
        const innerRange = narrowToNonSpace(text, { from: open.to, to: close.from });
        if (!rangeEmpty(innerRange)) {
            // Remove open tag
            edits.push({ range: new vscode.Range(doc.positionAt(open.from), doc.positionAt(innerRange.from)), newText: '' });

            const openLinePos = doc.positionAt(open.from);
            const closeLinePos = doc.positionAt(close.to);
            if (openLinePos.line !== closeLinePos.line) {
                // Dedent inner content
                const baseIndent = lineIndentAt(doc, open.from);
                const innerIndent = lineIndentAt(doc, innerRange.from);
                const startLine = openLinePos.line + 2; // skip open tag line + first content line
                const endLine = closeLinePos.line;

                for (let lineNum = startLine; lineNum <= endLine; lineNum++) {
                    const line = doc.lineAt(lineNum);
                    const lineText = line.text;
                    if (isSpace(lineText.slice(0, innerIndent.length))) {
                        edits.push({
                            range: new vscode.Range(
                                new vscode.Position(lineNum, 0),
                                new vscode.Position(lineNum, innerIndent.length),
                            ),
                            newText: baseIndent,
                        });
                    }
                }
            }

            // Remove close tag
            edits.push({ range: new vscode.Range(doc.positionAt(innerRange.to), doc.positionAt(close.to)), newText: '' });
        } else {
            // Empty tag: remove everything
            edits.push({ range: new vscode.Range(doc.positionAt(open.from), doc.positionAt(close.to)), newText: '' });
        }
    } else {
        // Self-closing: remove the whole tag
        edits.push({ range: new vscode.Range(doc.positionAt(open.from), doc.positionAt(open.to)), newText: '' });
    }
}

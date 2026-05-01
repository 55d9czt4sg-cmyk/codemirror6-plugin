import * as vscode from 'vscode';
import evaluate, { extract } from '@emmetio/math-expression';

export function evaluateMath(editor: vscode.TextEditor): void {
    const doc = editor.document;
    const edits: Array<{ range: vscode.Range; newText: string }> = [];

    for (const sel of editor.selections) {
        let startOffset = doc.offsetAt(sel.start);
        let endOffset = doc.offsetAt(sel.end);

        if (startOffset === endOffset) {
            const line = doc.lineAt(sel.start.line);
            const expr = extract(line.text, sel.start.character);
            if (expr) {
                startOffset = doc.offsetAt(new vscode.Position(sel.start.line, expr[0]));
                endOffset = doc.offsetAt(new vscode.Position(sel.start.line, expr[1]));
            }
        }

        if (startOffset !== endOffset) {
            const text = doc.getText(new vscode.Range(doc.positionAt(startOffset), doc.positionAt(endOffset)));
            try {
                const result = evaluate(text);
                if (result !== null) {
                    const insert = result.toFixed(4).replace(/\.?0+$/, '');
                    edits.push({
                        range: new vscode.Range(doc.positionAt(startOffset), doc.positionAt(endOffset)),
                        newText: insert,
                    });
                }
            } catch {
                // ignore invalid expressions
            }
        }
    }

    if (edits.length) {
        editor.edit(eb => {
            for (const e of edits) { eb.replace(e.range, e.newText); }
        });
    }
}

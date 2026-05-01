import * as vscode from 'vscode';

export const incrementNumber1  = (e: vscode.TextEditor) => incDecNumber(e, 1);
export const decrementNumber1  = (e: vscode.TextEditor) => incDecNumber(e, -1);
export const incrementNumber01 = (e: vscode.TextEditor) => incDecNumber(e, 0.1);
export const decrementNumber01 = (e: vscode.TextEditor) => incDecNumber(e, -0.1);
export const incrementNumber10 = (e: vscode.TextEditor) => incDecNumber(e, 10);
export const decrementNumber10 = (e: vscode.TextEditor) => incDecNumber(e, -10);

function incDecNumber(editor: vscode.TextEditor, delta: number): void {
    const doc = editor.document;
    const newSelections: vscode.Selection[] = [];

    editor.edit(eb => {
        for (const sel of editor.selections) {
            let startOffset = doc.offsetAt(sel.start);
            let endOffset = doc.offsetAt(sel.end);

            if (startOffset === endOffset) {
                const line = doc.lineAt(sel.start.line);
                const numRange = extractNumber(line.text, sel.start.character);
                if (numRange) {
                    startOffset = doc.offsetAt(new vscode.Position(sel.start.line, numRange[0]));
                    endOffset = doc.offsetAt(new vscode.Position(sel.start.line, numRange[1]));
                }
            }

            if (startOffset !== endOffset) {
                const text = doc.getText(new vscode.Range(doc.positionAt(startOffset), doc.positionAt(endOffset)));
                const newText = updateNumber(text, delta);
                eb.replace(new vscode.Range(doc.positionAt(startOffset), doc.positionAt(endOffset)), newText);
                const newEndPos = doc.positionAt(startOffset + newText.length);
                newSelections.push(new vscode.Selection(newEndPos, newEndPos));
            } else {
                newSelections.push(sel);
            }
        }
    }).then(() => { editor.selections = newSelections; });
}

function extractNumber(text: string, pos: number): [number, number] | undefined {
    let hasDot = false;
    let end = pos;
    let start = pos;

    while (end < text.length) {
        const ch = text.charCodeAt(end);
        if (isDot(ch)) {
            if (hasDot) break;
            hasDot = true;
        } else if (!isDigit(ch)) {
            break;
        }
        end++;
    }

    while (start >= 0) {
        const ch = text.charCodeAt(start - 1);
        if (isDot(ch)) {
            if (hasDot) break;
            hasDot = true;
        } else if (!isDigit(ch)) {
            break;
        }
        start--;
    }

    if (start > 0 && text[start - 1] === '-') { start--; }

    return start !== end ? [start, end] : undefined;
}

function updateNumber(num: string, delta: number, precision = 3): string {
    const value = parseFloat(num) + delta;
    if (isNaN(value)) return num;

    const neg = value < 0;
    let result = Math.abs(value).toFixed(precision).replace(/\.?0+$/, '');

    if ((num[0] === '.' || num.startsWith('-.')) && result[0] === '0') {
        result = result.slice(1);
    }

    return (neg ? '-' : '') + result;
}

function isDot(ch: number): boolean { return ch === 46; }
function isDigit(ch: number): boolean { return ch > 47 && ch < 58; }

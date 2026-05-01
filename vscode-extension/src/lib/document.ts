import * as vscode from 'vscode';
import type { RangeObject } from './types';

export function posToOffset(doc: vscode.TextDocument, pos: vscode.Position): number {
    return doc.offsetAt(pos);
}

export function offsetToPos(doc: vscode.TextDocument, offset: number): vscode.Position {
    return doc.positionAt(offset);
}

export function offsetToRange(doc: vscode.TextDocument, range: RangeObject): vscode.Range {
    return new vscode.Range(doc.positionAt(range.from), doc.positionAt(range.to));
}

export function docText(doc: vscode.TextDocument): string {
    return doc.getText();
}

export function lineAt(doc: vscode.TextDocument, offset: number): { text: string; from: number; to: number } {
    const pos = doc.positionAt(offset);
    const line = doc.lineAt(pos.line);
    return {
        text: line.text,
        from: doc.offsetAt(line.range.start),
        to: doc.offsetAt(line.range.end),
    };
}

export function lineIndentAt(doc: vscode.TextDocument, offset: number): string {
    const line = lineAt(doc, offset);
    const m = line.text.match(/^(\s*)/);
    return m ? m[1] : '';
}

export function detectIndent(editor: vscode.TextEditor): string {
    return editor.options.insertSpaces
        ? ' '.repeat(editor.options.tabSize as number)
        : '\t';
}

// ── Pure string utilities (ported from src/lib/utils.ts, no CM dependency) ──

export function isQuote(ch: string | undefined): boolean {
    return ch === '"' || ch === "'";
}

export function isSpace(ch: string): boolean {
    return /^[\s\n\r]+$/.test(ch);
}

export interface RangeObjectMut {
    from: number;
    to: number;
}

export function narrowToNonSpace(text: string, range: RangeObject): RangeObject {
    const str = text.slice(range.from, range.to);
    let start = 0;
    let end = str.length;
    while (start < end && isSpace(str[start])) { start++; }
    while (end > start && isSpace(str[end - 1])) { end--; }
    return { from: range.from + start, to: range.from + end };
}

export function contains(range: RangeObject, pos: number): boolean {
    return pos >= range.from && pos <= range.to;
}

export function rangesEqual(a: RangeObject, b: RangeObject): boolean {
    return a.from === b.from && a.to === b.to;
}

export function rangeContains(a: RangeObject, b: RangeObject): boolean {
    return a.from <= b.from && a.to >= b.to;
}

export function rangeEmpty(r: RangeObject): boolean {
    return r.from === r.to;
}

export function last<T>(arr: T[]): T | undefined {
    return arr.length > 0 ? arr[arr.length - 1] : undefined;
}

export function tokenList(value: string, offset = 0): RangeObject[] {
    const ranges: RangeObject[] = [];
    const len = value.length;
    let pos = 0;
    let start = 0;

    while (pos < len) {
        const end = pos;
        const ch = value.charAt(pos++);
        if (isSpace(ch)) {
            if (start !== end) {
                ranges.push({ from: offset + start, to: offset + end });
            }
            while (isSpace(value.charAt(pos))) { pos++; }
            start = pos;
        }
    }

    if (start !== pos) {
        ranges.push({ from: offset + start, to: offset + pos });
    }

    return ranges;
}

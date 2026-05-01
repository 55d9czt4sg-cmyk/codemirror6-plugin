import * as vscode from 'vscode';
import { findTagAt } from '../lib/html-parser';
import { isHTML } from '../lib/syntax';
import { rangeContains, rangesEqual } from '../lib/document';
import type { RangeObject } from '../lib/types';

export function balanceOutward(editor: vscode.TextEditor): void {
    if (!isHTML(editor.document.languageId)) return;

    const doc = editor.document;
    const text = doc.getText();
    let found = false;

    const nextSelections = editor.selections.map(sel => {
        const offset = doc.offsetAt(sel.active);
        const ranges = getOutwardRanges(text, offset);
        if (!ranges.length) return sel;

        found = true;
        const selRange: RangeObject = { from: doc.offsetAt(sel.start), to: doc.offsetAt(sel.end) };
        const target = ranges.find(r => rangeContains(r, selRange) && !rangesEqual(r, selRange)) ?? ranges[0];
        return new vscode.Selection(doc.positionAt(target.from), doc.positionAt(target.to));
    });

    if (found) { editor.selections = nextSelections; }
}

export function balanceInward(editor: vscode.TextEditor): void {
    if (!isHTML(editor.document.languageId)) return;

    const doc = editor.document;
    const text = doc.getText();
    let found = false;

    const nextSelections = editor.selections.map(sel => {
        const offset = doc.offsetAt(sel.active);
        const ranges = getInwardRanges(text, offset);
        if (!ranges.length) return sel;

        found = true;
        const selRange: RangeObject = { from: doc.offsetAt(sel.start), to: doc.offsetAt(sel.end) };
        let ix = ranges.findIndex(r => rangesEqual(r, selRange));
        let target: RangeObject;

        if (ix === -1) {
            target = ranges.find(r => rangeContains(selRange, r)) ?? ranges[0];
        } else if (ix < ranges.length - 1) {
            target = ranges[ix + 1];
        } else {
            target = selRange;
        }

        return new vscode.Selection(doc.positionAt(target.from), doc.positionAt(target.to));
    });

    if (found) { editor.selections = nextSelections; }
}

/**
 * Returns candidate ranges for outward balance: inner content, then full element,
 * for the tag at `pos` and its ancestors (nearest first).
 */
function getOutwardRanges(text: string, pos: number): RangeObject[] {
    const result: RangeObject[] = [];
    let searchPos = pos;

    // Walk up through ancestor tags by searching at progressively outer positions
    for (let depth = 0; depth < 32; depth++) {
        const tag = findTagAt(text, searchPos);
        if (!tag) break;

        const { open, close } = tag;
        if (close) {
            const inner: RangeObject = { from: open.to, to: close.from };
            const outer: RangeObject = { from: open.from, to: close.to };
            result.push(inner, outer);
            // Move to just before the open tag to find parent
            searchPos = open.from - 1;
        } else {
            result.push({ from: open.from, to: open.to });
            searchPos = open.from - 1;
        }

        if (searchPos <= 0) break;
    }

    return compactRanges(result, false);
}

/**
 * Returns candidate ranges for inward balance: outer element, inner content,
 * then first child element.
 */
function getInwardRanges(text: string, pos: number): RangeObject[] {
    const result: RangeObject[] = [];
    const tag = findTagAt(text, pos);
    if (!tag || !tag.close) return result;

    const { open, close } = tag;
    result.push({ from: open.from, to: close.to }); // outer
    result.push({ from: open.to, to: close.from });   // inner

    // First child element
    const child = findTagAt(text, open.to + 1);
    if (child && child.open.from > open.to && child.open.from < close.from) {
        if (child.close) {
            result.push({ from: child.open.from, to: child.close.to });
            result.push({ from: child.open.to, to: child.close.from });
        } else {
            result.push({ from: child.open.from, to: child.open.to });
        }
    }

    return compactRanges(result, true);
}

function compactRanges(ranges: RangeObject[], inward: boolean): RangeObject[] {
    const sorted = [...ranges].sort(inward
        ? (a, b) => a.from - b.from || b.to - a.to
        : (a, b) => b.from - a.from || a.to - b.to
    );

    const result: RangeObject[] = [];
    for (const r of sorted) {
        const prev = result[result.length - 1];
        if (!prev || prev.from !== r.from || prev.to !== r.to) {
            result.push(r);
        }
    }
    return result;
}

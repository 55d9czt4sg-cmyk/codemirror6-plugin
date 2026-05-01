import * as vscode from 'vscode';
import { findTagAt } from '../lib/html-parser';
import { isHTML, isCSS } from '../lib/syntax';
import { isQuote, isSpace, tokenList, rangeContains } from '../lib/document';
import type { RangeObject, AttributeRange } from '../lib/types';

export function selectNextItem(editor: vscode.TextEditor): void {
    selectItem(editor, false);
}

export function selectPreviousItem(editor: vscode.TextEditor): void {
    selectItem(editor, true);
}

function selectItem(editor: vscode.TextEditor, reverse: boolean): void {
    const doc = editor.document;
    const text = doc.getText();
    const languageId = doc.languageId;
    let found = false;

    const nextSelections = editor.selections.map(sel => {
        const selRange: RangeObject = { from: doc.offsetAt(sel.start), to: doc.offsetAt(sel.end) };
        let range: RangeObject | undefined;

        if (isCSS(languageId)) {
            range = getCSSRange(text, selRange, reverse);
        } else if (isHTML(languageId)) {
            range = getHTMLRange(text, selRange, reverse);
        }

        if (range) {
            found = true;
            return new vscode.Selection(doc.positionAt(range.from), doc.positionAt(range.to));
        }
        return sel;
    });

    if (found) { editor.selections = nextSelections; }
}

function getHTMLRange(text: string, sel: RangeObject, reverse: boolean): RangeObject | undefined {
    const pos = reverse ? sel.from : sel.to;
    const tag = findTagAt(text, pos);
    if (!tag) return;

    const candidates = getHTMLCandidates(text, tag);
    return findRange(sel, candidates, reverse);
}

function getHTMLCandidates(text: string, tag: ReturnType<typeof findTagAt>): RangeObject[] {
    if (!tag) return [];

    const { open, attrs } = tag;
    const result: RangeObject[] = [];

    // Tag name range (after `<`)
    const tagNameStart = open.from + 1;
    const tagNameEnd = tagNameStart + tag.name.length;
    result.push({ from: tagNameStart, to: tagNameEnd });

    for (const attr of attrs) {
        // Full attribute
        result.push(attr.full);
        // Attribute name
        result.push(attr.name);
        if (attr.value) {
            // Unquoted value
            result.push(attr.value);
            // For class attribute, also individual class tokens
            const attrName = text.slice(attr.name.from, attr.name.to).toLowerCase();
            if (attrName === 'class') {
                const valueStr = text.slice(attr.value.from, attr.value.to);
                result.push(...tokenList(valueStr, attr.value.from));
            }
        }
    }

    return result;
}

function getCSSRange(text: string, sel: RangeObject, reverse: boolean): RangeObject | undefined {
    const pos = reverse ? sel.from : sel.to;
    const candidates = getCSSCandidatesAt(text, pos);
    return findRange(sel, candidates, reverse);
}

function getCSSCandidatesAt(text: string, pos: number): RangeObject[] {
    const result: RangeObject[] = [];

    // Find the CSS rule block containing pos using simple regex scanning
    const declarationRe = /([a-zA-Z-]+)\s*:\s*([^;{}]+)/g;
    let m: RegExpExecArray | null;

    while ((m = declarationRe.exec(text)) !== null) {
        const propStart = m.index;
        const propEnd = propStart + m[0].length;

        // Only consider declarations near the cursor position
        if (propEnd < pos - 500 || propStart > pos + 500) continue;

        const nameRange: RangeObject = { from: propStart, to: propStart + m[1].length };
        // value: trim trailing whitespace
        const rawValue = m[2];
        const trimmedValue = rawValue.trimEnd();
        const valueFrom = propStart + m[0].indexOf(rawValue, m[1].length + 1);
        const valueRange: RangeObject = { from: valueFrom, to: valueFrom + trimmedValue.length };
        const fullRange: RangeObject = { from: propStart, to: propEnd };

        result.push(fullRange, nameRange, valueRange);
    }

    return result;
}

function findRange(sel: RangeObject, ranges: RangeObject[], reverse = false): RangeObject | undefined {
    if (reverse) { ranges = ranges.slice().reverse(); }

    let needNext = false;
    let candidate: RangeObject | undefined;

    for (const r of ranges) {
        if (needNext) { return r; }

        if (r.from === sel.from && r.to === sel.to) {
            needNext = true;
        } else if (!candidate) {
            if (rangeContains(r, sel) ||
                (reverse ? r.from <= sel.from : r.from >= sel.from)) {
                candidate = r;
            }
        }
    }

    return needNext ? undefined : candidate;
}

import type { TagLocation, AttributeRange, RangeObject } from './types';

/**
 * Finds the innermost HTML/XML tag pair that contains or touches `pos` in `text`.
 *
 * Strategy:
 *  1. Scan backward from `pos` to find the opening `<tagName` that is not yet closed.
 *  2. Scan forward from the end of that open tag to find `</tagName>`.
 *
 * This intentionally handles only well-formed HTML structure and skips script/style
 * content. It is sufficient for the Emmet commands (go-to-tag-pair, remove-tag,
 * split-join-tag, balance, select-item).
 */
export function findTagAt(text: string, pos: number): TagLocation | undefined {
    // First try: is the cursor directly inside an open or self-closing tag?
    const insideTag = findOpenTagAt(text, pos);
    if (insideTag) {
        return buildTagLocation(text, insideTag);
    }

    // Second try: scan backward for unclosed open tags
    return findEnclosingTag(text, pos);
}

interface OpenTagInfo {
    name: string;
    from: number;   // position of <
    to: number;     // position after >
    selfClose: boolean;
    attrs: AttributeRange[];
}

/**
 * If `pos` is directly inside an open/self-closing tag (between < and >),
 * parse and return that tag.
 */
function findOpenTagAt(text: string, pos: number): OpenTagInfo | undefined {
    // Find the last `<` before pos that isn't a closing tag
    let lt = pos;
    while (lt >= 0 && text[lt] !== '<') { lt--; }
    if (lt < 0) return;
    if (text[lt + 1] === '/') return; // closing tag

    // Find the matching `>`
    let gt = pos;
    while (gt < text.length && text[gt] !== '>') {
        if (text[gt] === '<' && gt !== lt) return; // another tag starts first
        gt++;
    }
    if (gt >= text.length) return;

    const tagStr = text.slice(lt + 1, gt); // content between < and >
    const nameMatch = tagStr.match(/^([a-zA-Z][a-zA-Z0-9:.-]*)/);
    if (!nameMatch) return;

    const name = nameMatch[1];
    const selfClose = tagStr.endsWith('/');
    const attrs = parseTagAttributes(text, lt);

    return { name, from: lt, to: gt + 1, selfClose, attrs };
}

/**
 * Scan backward from `pos` to find the nearest unclosed open tag, then
 * locate its matching close tag forward.
 */
function findEnclosingTag(text: string, pos: number): TagLocation | undefined {
    let i = pos;
    // Walk backward looking for `<tagName` that has a matching close tag after pos
    while (i >= 0) {
        if (text[i] === '<') {
            if (text[i + 1] === '/') {
                // Skip closing tags during backward scan
                i--;
                continue;
            }
            const nameMatch = text.slice(i + 1).match(/^([a-zA-Z][a-zA-Z0-9:.-]*)/);
            if (nameMatch) {
                const name = nameMatch[1];
                // Find where this open tag ends
                const gtIdx = findTagClose(text, i);
                if (gtIdx === -1) { i--; continue; }

                const selfClose = text.slice(i + 1, gtIdx).endsWith('/');
                if (selfClose) { i--; continue; }

                // Find the close tag for this name after gtIdx
                const closeTag = findCloseTag(text, name, gtIdx);
                if (closeTag && (gtIdx <= pos || closeTag.from >= pos)) {
                    const attrs = parseTagAttributes(text, i);
                    return {
                        name,
                        open: { from: i, to: gtIdx + 1 },
                        close: closeTag,
                        selfClose: false,
                        attrs,
                    };
                }
            }
        }
        i--;
    }
    return;
}

function buildTagLocation(text: string, info: OpenTagInfo): TagLocation {
    if (info.selfClose) {
        return {
            name: info.name,
            open: { from: info.from, to: info.to },
            selfClose: true,
            attrs: info.attrs,
        };
    }

    const close = findCloseTag(text, info.name, info.to);
    return {
        name: info.name,
        open: { from: info.from, to: info.to },
        close,
        selfClose: false,
        attrs: info.attrs,
    };
}

/**
 * Find the `>` that ends the open tag starting at `ltPos`.
 * Handles attribute values that may contain `>` inside quotes.
 */
function findTagClose(text: string, ltPos: number): number {
    let i = ltPos + 1;
    let inQuote: string | null = null;
    while (i < text.length) {
        const ch = text[i];
        if (inQuote) {
            if (ch === inQuote) inQuote = null;
        } else if (ch === '"' || ch === "'") {
            inQuote = ch;
        } else if (ch === '>') {
            return i;
        } else if (ch === '<') {
            return -1; // malformed
        }
        i++;
    }
    return -1;
}

/**
 * Find the first `</name>` after `startPos`, accounting for nesting.
 */
function findCloseTag(text: string, name: string, startPos: number): RangeObject | undefined {
    const openRe = new RegExp(`<${escapeRe(name)}(?:[\\s/>]|$)`, 'gi');
    const closeRe = new RegExp(`<\\/${escapeRe(name)}\\s*>`, 'gi');
    openRe.lastIndex = startPos;
    closeRe.lastIndex = startPos;

    let depth = 0;
    let i = startPos;

    while (i < text.length) {
        openRe.lastIndex = i;
        closeRe.lastIndex = i;

        const openMatch = openRe.exec(text);
        const closeMatch = closeRe.exec(text);

        if (!closeMatch) return;

        if (openMatch && openMatch.index < closeMatch.index) {
            // Nested open tag — but only count if not self-closing
            const tagEnd = findTagClose(text, openMatch.index);
            if (tagEnd !== -1 && !text.slice(openMatch.index + 1, tagEnd).endsWith('/')) {
                depth++;
            }
            i = openMatch.index + openMatch[0].length;
        } else {
            if (depth === 0) {
                return { from: closeMatch.index, to: closeMatch.index + closeMatch[0].length };
            }
            depth--;
            i = closeMatch.index + closeMatch[0].length;
        }
    }

    return;
}

/**
 * Parse attribute ranges from the open tag starting at `ltPos`.
 * Returns ranges relative to absolute `text` offsets.
 */
export function parseTagAttributes(text: string, ltPos: number): AttributeRange[] {
    const gtPos = findTagClose(text, ltPos);
    if (gtPos === -1) return [];

    const tagContent = text.slice(ltPos + 1, gtPos);
    const attrs: AttributeRange[] = [];

    // Skip the tag name
    const nameMatch = tagContent.match(/^[a-zA-Z][a-zA-Z0-9:.-]*/);
    if (!nameMatch) return attrs;

    let pos = nameMatch[0].length;
    const base = ltPos + 1;

    while (pos < tagContent.length) {
        // Skip whitespace
        while (pos < tagContent.length && /\s/.test(tagContent[pos])) { pos++; }
        if (pos >= tagContent.length || tagContent[pos] === '/' || tagContent[pos] === '>') break;

        // Read attribute name
        const attrNameStart = pos;
        while (pos < tagContent.length && !/[\s=/>]/.test(tagContent[pos])) { pos++; }
        if (pos === attrNameStart) { pos++; continue; }

        const nameRange: RangeObject = { from: base + attrNameStart, to: base + pos };

        // Skip whitespace before =
        while (pos < tagContent.length && tagContent[pos] === ' ') { pos++; }

        if (tagContent[pos] !== '=') {
            // Boolean attribute
            attrs.push({ full: nameRange, name: nameRange });
            continue;
        }

        pos++; // skip =
        // Skip whitespace after =
        while (pos < tagContent.length && tagContent[pos] === ' ') { pos++; }

        // Read value
        const quote = tagContent[pos];
        if (quote === '"' || quote === "'") {
            const valueStart = pos + 1; // inside quote
            pos++;
            while (pos < tagContent.length && tagContent[pos] !== quote) { pos++; }
            const valueEnd = pos;
            pos++; // skip closing quote

            const fullRange: RangeObject = { from: base + attrNameStart, to: base + pos };
            const valueRange: RangeObject = { from: base + valueStart, to: base + valueEnd };
            attrs.push({ full: fullRange, name: nameRange, value: valueRange });
        } else {
            // Unquoted value
            const valueStart = pos;
            while (pos < tagContent.length && !/[\s>]/.test(tagContent[pos])) { pos++; }
            const fullRange: RangeObject = { from: base + attrNameStart, to: base + pos };
            const valueRange: RangeObject = { from: base + valueStart, to: base + pos };
            attrs.push({ full: fullRange, name: nameRange, value: valueRange });
        }
    }

    return attrs;
}

function escapeRe(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

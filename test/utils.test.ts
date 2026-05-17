import { describe, it, expect } from 'vitest';
import {
    isQuote,
    isSpace,
    htmlEscape,
    contains,
    rangesEqual,
    rangeContains,
    rangeEmpty,
    last,
    getSelectionsFromSnippet,
    tabStopStart,
    tabStopEnd,
} from '../src/lib/utils';

describe('isQuote', () => {
    it('recognizes single and double quotes', () => {
        expect(isQuote('"')).toBe(true);
        expect(isQuote("'")).toBe(true);
    });

    it('rejects non-quotes and undefined', () => {
        expect(isQuote('x')).toBe(false);
        expect(isQuote('`')).toBe(false);
        expect(isQuote(undefined)).toBe(false);
    });
});

describe('isSpace', () => {
    it('matches whitespace runs', () => {
        expect(isSpace(' ')).toBe(true);
        expect(isSpace('\t')).toBe(true);
        expect(isSpace('\n')).toBe(true);
        expect(isSpace('\r')).toBe(true);
        expect(isSpace('   ')).toBe(true);
    });

    it('rejects non-whitespace and empty string', () => {
        expect(isSpace('a')).toBe(false);
        expect(isSpace('a ')).toBe(false);
        expect(isSpace('')).toBe(false);
    });
});

describe('htmlEscape', () => {
    it('escapes angle brackets and ampersands', () => {
        expect(htmlEscape('<a> & </a>')).toBe('&lt;a&gt; &amp; &lt;/a&gt;');
    });

    it('leaves plain text untouched', () => {
        expect(htmlEscape('hello world')).toBe('hello world');
    });
});

describe('range helpers', () => {
    it('contains is inclusive on both bounds', () => {
        const r = { from: 2, to: 5 };
        expect(contains(r, 2)).toBe(true);
        expect(contains(r, 5)).toBe(true);
        expect(contains(r, 3)).toBe(true);
        expect(contains(r, 1)).toBe(false);
        expect(contains(r, 6)).toBe(false);
    });

    it('rangesEqual compares both endpoints', () => {
        expect(rangesEqual({ from: 1, to: 4 }, { from: 1, to: 4 })).toBe(true);
        expect(rangesEqual({ from: 1, to: 4 }, { from: 1, to: 5 })).toBe(false);
    });

    it('rangeContains is true for fully-enclosed ranges', () => {
        expect(rangeContains({ from: 0, to: 10 }, { from: 2, to: 5 })).toBe(true);
        expect(rangeContains({ from: 0, to: 10 }, { from: 0, to: 10 })).toBe(true);
        expect(rangeContains({ from: 2, to: 5 }, { from: 0, to: 10 })).toBe(false);
    });

    it('rangeEmpty is true only for zero-width ranges', () => {
        expect(rangeEmpty({ from: 3, to: 3 })).toBe(true);
        expect(rangeEmpty({ from: 3, to: 4 })).toBe(false);
    });
});

describe('last', () => {
    it('returns the final element', () => {
        expect(last([1, 2, 3])).toBe(3);
    });

    it('returns undefined for an empty array', () => {
        expect(last([])).toBeUndefined();
    });
});

describe('getSelectionsFromSnippet', () => {
    it('returns a caret at end when no tab stops exist', () => {
        const { ranges, snippet } = getSelectionsFromSnippet('hello');
        expect(snippet).toBe('hello');
        expect(ranges).toEqual([{ from: 5, to: 5 }]);
    });

    it('applies the base offset to the implicit end caret', () => {
        const { ranges } = getSelectionsFromSnippet('hello', 10);
        expect(ranges).toEqual([{ from: 15, to: 15 }]);
    });

    it('strips a tab stop marker and records its position', () => {
        const { ranges, snippet } = getSelectionsFromSnippet(`a${tabStopStart}b`);
        expect(snippet).toBe('ab');
        expect(ranges).toEqual([{ from: 1, to: 1 }]);
    });

    it('strips paired start/end markers', () => {
        const { ranges, snippet } = getSelectionsFromSnippet(`${tabStopStart}x${tabStopEnd}`);
        expect(snippet).toBe('x');
        expect(ranges).toEqual([{ from: 0, to: 0 }]);
    });

    it('honors the base offset for collected ranges', () => {
        const { ranges } = getSelectionsFromSnippet(`a${tabStopStart}b`, 100);
        expect(ranges).toEqual([{ from: 101, to: 101 }]);
    });
});

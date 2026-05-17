import { describe, it, expect } from 'vitest';
import { isNumber, extractNumber, updateNumber } from '../src/commands/inc-dec-number';

describe('isNumber', () => {
    it('is true for ASCII digit char codes', () => {
        expect(isNumber('0'.charCodeAt(0))).toBe(true);
        expect(isNumber('9'.charCodeAt(0))).toBe(true);
        expect(isNumber('5'.charCodeAt(0))).toBe(true);
    });

    it('is false for adjacent non-digit char codes', () => {
        expect(isNumber('/'.charCodeAt(0))).toBe(false); // 47
        expect(isNumber(':'.charCodeAt(0))).toBe(false); // 58
        expect(isNumber('a'.charCodeAt(0))).toBe(false);
    });
});

describe('extractNumber', () => {
    it('extracts an integer around the caret', () => {
        expect(extractNumber('abc 123 def', 5)).toEqual([4, 7]);
    });

    it('extracts a number embedded next to a unit', () => {
        expect(extractNumber('value: 42px', 8)).toEqual([7, 9]);
    });

    it('includes a leading negative sign', () => {
        expect(extractNumber('-5', 1)).toEqual([0, 2]);
    });

    it('reads a decimal across the dot', () => {
        expect(extractNumber('1.5', 0)).toEqual([0, 3]);
    });

    it('stops at the second dot', () => {
        expect(extractNumber('1.2.3', 0)).toEqual([0, 3]);
    });

    it('returns undefined when there is no number', () => {
        expect(extractNumber('abc', 1)).toBeUndefined();
    });
});

describe('updateNumber', () => {
    it('increments and decrements integers', () => {
        expect(updateNumber('5', 1)).toBe('6');
        expect(updateNumber('5', -1)).toBe('4');
    });

    it('produces a negative result when crossing zero', () => {
        expect(updateNumber('5', -10)).toBe('-5');
    });

    it('keeps decimal precision and trims trailing zeros', () => {
        expect(updateNumber('1.5', 0.1)).toBe('1.6');
        expect(updateNumber('0.5', -0.1)).toBe('0.4');
    });

    it('preserves a missing leading zero', () => {
        expect(updateNumber('.5', 0.1)).toBe('.6');
        expect(updateNumber('-.5', 0.1)).toBe('-.4');
    });

    it('rounds to the default precision', () => {
        expect(updateNumber('1', 0.0001)).toBe('1');
        expect(updateNumber('1', 0.001)).toBe('1.001');
    });

    it('returns the original string when value is not numeric', () => {
        expect(updateNumber('abc', 1)).toBe('abc');
    });
});

import { describe, it, expect } from 'vitest';
import { createState } from './helpers';
import { expand, extract, getTagContext, getOptions } from '../src/lib/emmet';

describe('expand', () => {
    it('expands a simple markup abbreviation with a tab stop', () => {
        const state = createState('', 0);
        expect(expand(state, 'div')).toBe('<div>${1}</div>');
    });

    it('expands nested markup', () => {
        const state = createState('', 0);
        expect(expand(state, 'div>span')).toBe('<div><span>${1}</span></div>');
    });

    it('expands a stylesheet abbreviation when configured', () => {
        const state = createState('', 0);
        expect(expand(state, 'm10', { type: 'stylesheet', syntax: 'css' }))
            .toBe('margin: 10px;');
    });
});

describe('extract', () => {
    it('extracts a markup abbreviation ending at the caret', () => {
        const result = extract('ul>li*3', 7);
        expect(result?.abbreviation).toBe('ul>li*3');
        expect(result?.start).toBe(0);
        expect(result?.end).toBe(7);
    });

    it('extracts an abbreviation embedded in surrounding text', () => {
        const result = extract('hello p>a', 9);
        expect(result?.abbreviation).toBe('p>a');
    });

    it('returns undefined when there is no abbreviation', () => {
        expect(extract('   ', 0)).toBeUndefined();
    });
});

describe('getTagContext', () => {
    it('returns name, attributes and open/close ranges for an element', () => {
        const state = createState('<div class="x">hi</div>', 16);
        const ctx = getTagContext(state, 16);
        expect(ctx?.name).toBe('div');
        expect(ctx?.attributes).toEqual({ class: 'x' });
        expect(ctx?.open).toBeDefined();
        expect(ctx?.close).toBeDefined();
    });

    it('reports a self-closing tag with no close range', () => {
        const state = createState('<br/>', 2);
        const ctx = getTagContext(state, 2);
        expect(ctx?.name).toBe('br');
        expect(ctx?.close).toBeUndefined();
    });

    it('returns undefined outside any tag', () => {
        const state = createState('plain text', 3);
        expect(getTagContext(state, 3)).toBeUndefined();
    });
});

describe('getOptions', () => {
    it('reports markup type and html syntax by default', () => {
        const state = createState('<div></div>', 0);
        const opt = getOptions(state, 0);
        expect(opt.syntax).toBe('html');
        expect(opt.type).toBe('markup');
        expect(opt.options).toBeDefined();
    });
});

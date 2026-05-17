import { describe, it, expect } from 'vitest';
import { parseInlineProps, getInlineCSSContext } from '../src/lib/context';

function slice(code: string, r: { from: number; to: number }): string {
    return code.substring(r.from, r.to).trim();
}

describe('parseInlineProps', () => {
    it('parses a single declaration', () => {
        const code = 'color:red';
        const props = parseInlineProps(code);
        expect(props).toHaveLength(1);
        expect(slice(code, props[0].name)).toBe('color');
        expect(props[0].value && slice(code, props[0].value)).toBe('red');
    });

    it('parses multiple semicolon-separated declarations', () => {
        const code = 'a:b;c:d';
        const props = parseInlineProps(code);
        expect(props).toHaveLength(2);
        expect(slice(code, props[0].name)).toBe('a');
        expect(props[0].value && slice(code, props[0].value)).toBe('b');
        expect(slice(code, props[1].name)).toBe('c');
        expect(props[1].value && slice(code, props[1].value)).toBe('d');
    });

    it('handles whitespace around the value', () => {
        const code = 'margin: 10px';
        const props = parseInlineProps(code);
        expect(props).toHaveLength(1);
        expect(slice(code, props[0].name)).toBe('margin');
        expect(props[0].value && slice(code, props[0].value)).toBe('10px');
    });

    it('records a property name with no value', () => {
        const code = 'color';
        const props = parseInlineProps(code);
        expect(props).toHaveLength(1);
        expect(slice(code, props[0].name)).toBe('color');
        expect(props[0].value).toBeUndefined();
    });
});

describe('getInlineCSSContext', () => {
    it('marks an inline, embedded CSS context', () => {
        const ctx = getInlineCSSContext('color: red', 8);
        expect(ctx.type).toBe('css');
        expect(ctx.inline).toBe(true);
        expect(ctx.embedded).toEqual({ from: 8, to: 18 });
    });

    it('detects a property-value context', () => {
        const ctx = getInlineCSSContext('color: red', 8);
        expect(ctx.current?.type).toBe('propertyValue');
        expect(ctx.current?.name).toBe('red');
        expect(ctx.ancestors[0]?.name).toBe('color');
        expect(ctx.ancestors[0]?.type).toBe('propertyName');
    });

    it('detects a property-name context', () => {
        const ctx = getInlineCSSContext('color: red', 2);
        expect(ctx.current?.type).toBe('propertyName');
        expect(ctx.current?.name).toBe('color');
        expect(ctx.ancestors).toHaveLength(0);
    });

    it('applies the base offset to the embedded range', () => {
        const ctx = getInlineCSSContext('color: red', 2, 50);
        expect(ctx.embedded).toEqual({ from: 52, to: 62 });
    });
});

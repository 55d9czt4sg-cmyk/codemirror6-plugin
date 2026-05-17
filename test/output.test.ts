import { describe, it, expect } from 'vitest';
import type { EditorState, Line } from '@codemirror/state';
import { field, lineIndent, getIndentation } from '../src/lib/output';

describe('field', () => {
    it('produces a bare tab stop without a placeholder', () => {
        expect(field(1)).toBe('${1}');
    });

    it('produces a tab stop with a placeholder', () => {
        expect(field(2, 'foo')).toBe('${2:foo}');
    });
});

describe('lineIndent', () => {
    it('returns leading whitespace of the line', () => {
        expect(lineIndent({ text: '    foo' } as Line)).toBe('    ');
        expect(lineIndent({ text: '\t\tbar' } as Line)).toBe('\t\t');
    });

    it('returns an empty string when there is no indentation', () => {
        expect(lineIndent({ text: 'foo' } as Line)).toBe('');
    });
});

describe('getIndentation', () => {
    it('uses spaces sized to the editor tab size', () => {
        expect(getIndentation({ tabSize: 4 } as EditorState)).toBe('    ');
    });

    it('falls back to a tab when tab size is zero', () => {
        expect(getIndentation({ tabSize: 0 } as EditorState)).toBe('\t');
    });
});

import { describe, it, expect } from 'vitest';
import { syntaxTree } from '@codemirror/language';
import { htmlLanguage } from '@codemirror/lang-html';
import { createState } from './helpers';

describe('test harness', () => {
    it('produces a complete HTML syntax tree', () => {
        const state = createState('<div><span>x</span></div>', 0);
        const tree = syntaxTree(state);
        expect(tree.length).toBe(state.doc.length);
        expect(htmlLanguage.isActiveAt(state, 8)).toBe(true);

        const names: string[] = [];
        tree.iterate({ enter: n => { names.push(n.name); } });
        expect(names).toContain('Element');
        expect(names).toContain('OpenTag');
        expect(names).toContain('CloseTag');
    });
});

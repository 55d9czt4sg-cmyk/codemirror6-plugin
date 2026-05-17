import { describe, it, expect, vi } from 'vitest';
import { createState, runCommand } from './helpers';
import { evaluateMath } from '../src/commands/evaluate-math';
import { goToNextEditPoint, goToPreviousEditPoint } from '../src/commands/go-to-edit-point';
import { goToTagPair } from '../src/commands/go-to-tag-pair';
import { splitJoinTag } from '../src/commands/split-join-tag';
import { removeTag } from '../src/commands/remove-tag';
import { balanceOutward, balanceInward } from '../src/commands/balance';
import { toggleComment } from '../src/commands/comment';
import { selectNextItem, selectPreviousItem } from '../src/commands/select-item';

describe('evaluateMath', () => {
    it('evaluates the selected expression', () => {
        const state = createState('2 + 3', { anchor: 0, head: 5 });
        const r = runCommand(evaluateMath, state);
        expect(r.handled).toBe(true);
        expect(r.doc).toBe('5');
    });

    it('keeps a trimmed decimal result', () => {
        const state = createState('10 / 4', { anchor: 0, head: 6 });
        const r = runCommand(evaluateMath, state);
        expect(r.doc).toBe('2.5');
    });

    it('returns false for a non-math selection', () => {
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const state = createState('abc', { anchor: 0, head: 3 });
        const r = runCommand(evaluateMath, state);
        expect(r.handled).toBe(false);
        expect(r.doc).toBe('abc');
        errSpy.mockRestore();
    });
});

describe('goToNextEditPoint', () => {
    it('jumps into an empty attribute value', () => {
        const state = createState('<a href=""></a>', 0);
        const r = runCommand(goToNextEditPoint, state);
        expect(r.selection.from).toBe(9);
    });

    it('jumps between adjacent tags', () => {
        const state = createState('<p></p>', 0);
        const r = runCommand(goToNextEditPoint, state);
        expect(r.selection.from).toBe(3);
    });
});

describe('goToPreviousEditPoint', () => {
    it('jumps backward between adjacent tags', () => {
        const state = createState('<a href=""></a>', 14);
        const r = runCommand(goToPreviousEditPoint, state);
        expect(r.selection.from).toBe(11);
    });
});

describe('goToTagPair', () => {
    it('jumps from open tag to close tag', () => {
        const state = createState('<div></div>', 2);
        const r = runCommand(goToTagPair, state);
        expect(r.handled).toBe(true);
        expect(r.selection.from).toBe(5);
    });

    it('jumps from close tag back to open tag', () => {
        const state = createState('<div></div>', 7);
        const r = runCommand(goToTagPair, state);
        expect(r.selection.from).toBe(0);
    });

    it('returns false when there is no tag pair', () => {
        const state = createState('plain text', 2);
        const r = runCommand(goToTagPair, state);
        expect(r.handled).toBe(false);
    });
});

describe('splitJoinTag', () => {
    it('joins a tag pair into a self-closing tag', () => {
        const state = createState('<div></div>', 2);
        const r = runCommand(splitJoinTag, state);
        expect(r.handled).toBe(true);
        expect(r.doc).toBe('<div />');
    });

    it('splits a self-closing tag into a pair', () => {
        const state = createState('<br/>', 2);
        const r = runCommand(splitJoinTag, state);
        expect(r.doc).toBe('<br></br>');
    });
});

describe('removeTag', () => {
    it('removes the wrapping tag but keeps inner content', () => {
        const state = createState('<div>text</div>', 7);
        const r = runCommand(removeTag, state);
        expect(r.handled).toBe(true);
        expect(r.doc).toBe('text');
    });
});

describe('balanceOutward', () => {
    it('expands selection outward through the element tree', () => {
        let state = createState('<a><b>x</b></a>', 6);

        let r = runCommand(balanceOutward, state);
        expect(r.handled).toBe(true);
        expect(r.selectedText).toBe('x');

        r = runCommand(balanceOutward, r.state);
        expect(r.selectedText).toBe('<b>x</b>');
    });
});

describe('balanceInward', () => {
    it('narrows selection inward through the element tree', () => {
        const state = createState('<a><b>x</b></a>', 0);

        let r = runCommand(balanceInward, state);
        expect(r.handled).toBe(true);
        expect(r.selectedText).toBe('<a><b>x</b></a>');

        r = runCommand(balanceInward, r.state);
        expect(r.selectedText).toBe('<b>x</b>');
    });
});

describe('toggleComment', () => {
    it('comments and uncomments an HTML element (round trip)', () => {
        const original = '<p>hi</p>';
        const state = createState(original, 4);

        const commented = runCommand(toggleComment, state);
        expect(commented.handled).toBe(true);
        expect(commented.doc).toBe('<!-- <p>hi</p> -->');

        const restored = runCommand(toggleComment, createState(commented.doc, 8));
        expect(restored.doc).toBe(original);
    });

    it('wraps a CSS declaration with comment tokens', () => {
        const state = createState('a{color:red;}', 5, 'css');
        const r = runCommand(toggleComment, state);
        expect(r.handled).toBe(true);
        expect(r.doc).toContain('/*');
        expect(r.doc).toContain('*/');
    });
});

describe('selectNextItem (HTML)', () => {
    it('selects the tag name, then the first attribute', () => {
        let state = createState('<a href="x"></a>', 0);

        let r = runCommand(selectNextItem, state);
        expect(r.handled).toBe(true);
        expect(r.selectedText).toBe('a');

        r = runCommand(selectNextItem, r.state);
        expect(r.selectedText).toBe('href="x"');
    });
});

describe('selectPreviousItem (HTML)', () => {
    it('selects an item when moving backward from end of tag', () => {
        const state = createState('<a href="x"></a>', 11);
        const r = runCommand(selectPreviousItem, state);
        expect(r.handled).toBe(true);
        expect(r.selectedText.length).toBeGreaterThan(0);
    });
});

describe('selectNextItem (CSS)', () => {
    it('selects the selector first', () => {
        const state = createState('a{color:red;}', 0, 'css');
        const r = runCommand(selectNextItem, state);
        expect(r.handled).toBe(true);
        expect(r.selectedText).toBe('a');
    });
});

import { describe, it, expect } from 'vitest';
import { EditorState } from '@codemirror/state';
import getEmmetConfig, { config, defaultConfig } from '../src/lib/config';
import { EmmetKnownSyntax } from '../src/lib/types';

describe('getEmmetConfig', () => {
    it('returns defaults when no config extension is present', () => {
        const state = EditorState.create({ doc: '' });
        const conf = getEmmetConfig(state);
        expect(conf.syntax).toBe(EmmetKnownSyntax.html);
        expect(conf.attributeQuotes).toBe('double');
        expect(conf.mark).toBe(true);
        expect(conf.bem).toBe(false);
    });

    it('applies a per-call override without mutating defaults', () => {
        const state = EditorState.create({ doc: '' });
        const conf = getEmmetConfig(state, { bem: true });
        expect(conf.bem).toBe(true);
        expect(conf.syntax).toBe(EmmetKnownSyntax.html);
        expect(defaultConfig.bem).toBe(false);
    });
});

describe('config facet', () => {
    it('applies a single config provider', () => {
        const state = EditorState.create({
            doc: '',
            extensions: [config.of({ syntax: EmmetKnownSyntax.css })],
        });
        expect(state.facet(config).syntax).toBe(EmmetKnownSyntax.css);
    });

    it('combines multiple config providers', () => {
        const state = EditorState.create({
            doc: '',
            extensions: [
                config.of({ syntax: EmmetKnownSyntax.scss }),
                config.of({ bem: true }),
            ],
        });
        const conf = state.facet(config);
        expect(conf.syntax).toBe(EmmetKnownSyntax.scss);
        expect(conf.bem).toBe(true);
        expect(conf.attributeQuotes).toBe('double');
    });

    it('merges the nested preview object', () => {
        const htmlPreview = () => [];
        const state = EditorState.create({
            doc: '',
            extensions: [config.of({ preview: { html: htmlPreview } })],
        });
        expect(state.facet(config).preview.html).toBe(htmlPreview);
    });
});

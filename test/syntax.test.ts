import { describe, it, expect } from 'vitest';
import { getSyntaxType, isXML, isHTML, isCSS, isJSX, isSupported } from '../src/lib/syntax';
import { EmmetKnownSyntax } from '../src/lib/types';

describe('getSyntaxType', () => {
    it('classifies stylesheet syntaxes', () => {
        expect(getSyntaxType(EmmetKnownSyntax.css)).toBe('stylesheet');
        expect(getSyntaxType(EmmetKnownSyntax.scss)).toBe('stylesheet');
        expect(getSyntaxType(EmmetKnownSyntax.sass)).toBe('stylesheet');
        expect(getSyntaxType(EmmetKnownSyntax.stylus)).toBe('stylesheet');
    });

    it('classifies markup syntaxes', () => {
        expect(getSyntaxType(EmmetKnownSyntax.html)).toBe('markup');
        expect(getSyntaxType(EmmetKnownSyntax.jsx)).toBe('markup');
    });

    it('defaults to markup when syntax is undefined', () => {
        expect(getSyntaxType(undefined)).toBe('markup');
    });
});

describe('isXML', () => {
    it('is true for XML dialects and JSX', () => {
        expect(isXML(EmmetKnownSyntax.xml)).toBe(true);
        expect(isXML(EmmetKnownSyntax.xsl)).toBe(true);
        expect(isXML(EmmetKnownSyntax.jsx)).toBe(true);
        expect(isXML(EmmetKnownSyntax.tsx)).toBe(true);
    });

    it('is false for HTML and CSS', () => {
        expect(isXML(EmmetKnownSyntax.html)).toBe(false);
        expect(isXML(EmmetKnownSyntax.css)).toBe(false);
    });
});

describe('isHTML', () => {
    it('is true for HTML, Vue and XML dialects', () => {
        expect(isHTML(EmmetKnownSyntax.html)).toBe(true);
        expect(isHTML(EmmetKnownSyntax.vue)).toBe(true);
        expect(isHTML(EmmetKnownSyntax.xml)).toBe(true);
    });

    it('is false for stylesheet syntaxes', () => {
        expect(isHTML(EmmetKnownSyntax.css)).toBe(false);
        expect(isHTML(EmmetKnownSyntax.sass)).toBe(false);
    });
});

describe('isCSS', () => {
    it('is true for CSS dialects only', () => {
        expect(isCSS(EmmetKnownSyntax.css)).toBe(true);
        expect(isCSS(EmmetKnownSyntax.scss)).toBe(true);
        expect(isCSS(EmmetKnownSyntax.less)).toBe(true);
    });

    it('is false for SASS (stylesheet but not a CSS dialect) and markup', () => {
        expect(isCSS(EmmetKnownSyntax.sass)).toBe(false);
        expect(isCSS(EmmetKnownSyntax.html)).toBe(false);
    });
});

describe('isJSX', () => {
    it('is true for JSX and TSX only', () => {
        expect(isJSX(EmmetKnownSyntax.jsx)).toBe(true);
        expect(isJSX(EmmetKnownSyntax.tsx)).toBe(true);
        expect(isJSX(EmmetKnownSyntax.html)).toBe(false);
        expect(isJSX(EmmetKnownSyntax.xml)).toBe(false);
    });
});

describe('isSupported', () => {
    it('is true for known markup and stylesheet syntaxes', () => {
        expect(isSupported(EmmetKnownSyntax.html)).toBe(true);
        expect(isSupported(EmmetKnownSyntax.css)).toBe(true);
        expect(isSupported(EmmetKnownSyntax.stylus)).toBe(true);
        expect(isSupported(EmmetKnownSyntax.pug)).toBe(true);
    });

    it('is false for unknown syntaxes', () => {
        expect(isSupported('foobar')).toBe(false);
        expect(isSupported('')).toBe(false);
    });
});

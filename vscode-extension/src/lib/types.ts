import type { AbbreviationContext } from 'emmet';

export enum EmmetKnownSyntax {
    html = 'html',
    xml = 'xml',
    xsl = 'xsl',
    jsx = 'jsx',
    tsx = 'tsx',
    vue = 'vue',
    haml = 'haml',
    jade = 'jade',
    pug = 'pug',
    slim = 'slim',
    css = 'css',
    scss = 'scss',
    less = 'less',
    sass = 'sass',
    sss = 'sss',
    stylus = 'stylus',
    postcss = 'postcss'
}

export type CSSTokenType = 'selector' | 'propertyName' | 'propertyValue';

export interface RangeObject {
    from: number;
    to: number;
}

export interface ContextTag extends AbbreviationContext {
    open: RangeObject;
    close?: RangeObject;
}

export interface CSSMatch {
    name: string;
    type: CSSTokenType;
    range: RangeObject;
}

export type HTMLType = 'open' | 'close' | 'selfClose';

export interface HTMLMatch {
    name: string;
    type: HTMLType;
    range: RangeObject;
}

export interface AttributeRange {
    /** Full attribute range (name="value") */
    full: RangeObject;
    /** Attribute name range */
    name: RangeObject;
    /** Unquoted attribute value range, if any */
    value?: RangeObject;
}

export interface TagLocation {
    name: string;
    /** Range of the entire open tag including < and > */
    open: RangeObject;
    /** Range of the entire close tag including </ and >, if any */
    close?: RangeObject;
    selfClose: boolean;
    attrs: AttributeRange[];
}

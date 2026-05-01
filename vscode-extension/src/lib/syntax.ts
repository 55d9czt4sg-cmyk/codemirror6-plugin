import { EmmetKnownSyntax } from './types';
import type { SyntaxType } from 'emmet';

const markupSyntaxes = new Set<string>([
    EmmetKnownSyntax.html, EmmetKnownSyntax.xml, EmmetKnownSyntax.xsl,
    EmmetKnownSyntax.jsx, EmmetKnownSyntax.tsx, EmmetKnownSyntax.vue,
    EmmetKnownSyntax.haml, EmmetKnownSyntax.jade, EmmetKnownSyntax.pug,
    EmmetKnownSyntax.slim,
]);

const stylesheetSyntaxes = new Set<string>([
    EmmetKnownSyntax.css, EmmetKnownSyntax.scss, EmmetKnownSyntax.less,
    EmmetKnownSyntax.sass, EmmetKnownSyntax.sss, EmmetKnownSyntax.stylus,
    EmmetKnownSyntax.postcss,
]);

export function getLanguageSyntax(languageId: string): EmmetKnownSyntax {
    const map: Record<string, EmmetKnownSyntax> = {
        html: EmmetKnownSyntax.html,
        xml: EmmetKnownSyntax.xml,
        xsl: EmmetKnownSyntax.xsl,
        css: EmmetKnownSyntax.css,
        scss: EmmetKnownSyntax.scss,
        less: EmmetKnownSyntax.less,
        sass: EmmetKnownSyntax.sass,
        stylus: EmmetKnownSyntax.stylus,
        javascriptreact: EmmetKnownSyntax.jsx,
        typescriptreact: EmmetKnownSyntax.tsx,
        vue: EmmetKnownSyntax.vue,
        haml: EmmetKnownSyntax.haml,
        jade: EmmetKnownSyntax.jade,
        pug: EmmetKnownSyntax.pug,
    };
    return map[languageId] ?? EmmetKnownSyntax.html;
}

export function getSyntaxType(syntax: EmmetKnownSyntax): SyntaxType {
    return stylesheetSyntaxes.has(syntax) ? 'stylesheet' : 'markup';
}

export function isMarkup(syntax: EmmetKnownSyntax): boolean {
    return markupSyntaxes.has(syntax);
}

export function isStylesheet(syntax: EmmetKnownSyntax): boolean {
    return stylesheetSyntaxes.has(syntax);
}

export function isCSS(languageId: string): boolean {
    return isStylesheet(getLanguageSyntax(languageId));
}

export function isHTML(languageId: string): boolean {
    return isMarkup(getLanguageSyntax(languageId));
}

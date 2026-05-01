import expandAbbreviation, { extract as extractAbbreviation } from 'emmet';
import type { UserConfig, SyntaxType, ExtractedAbbreviation } from 'emmet';
import { EmmetKnownSyntax } from './types';
import { getSyntaxType } from './syntax';

export function expand(abbr: string, config: UserConfig): string {
    return expandAbbreviation(abbr, config);
}

export function extract(code: string, pos: number, type: SyntaxType = 'markup'): ExtractedAbbreviation | undefined {
    return extractAbbreviation(code, pos, {
        lookAhead: type !== 'stylesheet',
        type,
    });
}

export function getExpandConfig(syntax: EmmetKnownSyntax, indent: string, text?: string | string[]): UserConfig {
    const type = getSyntaxType(syntax);
    const config: UserConfig = {
        syntax,
        type,
        options: {
            'output.indent': indent,
            'output.field': (index: number, placeholder?: string) =>
                placeholder ? `\${${index}:${placeholder}}` : `\${${index}}`,
        },
    };
    if (text !== undefined) {
        config.text = text;
    }
    return config;
}

export { EmmetKnownSyntax };

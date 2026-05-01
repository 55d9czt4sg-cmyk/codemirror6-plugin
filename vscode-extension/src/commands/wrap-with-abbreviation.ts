import * as vscode from 'vscode';
import { expand, getExpandConfig } from '../lib/emmet';
import { getLanguageSyntax } from '../lib/syntax';
import { detectIndent, lineIndentAt } from '../lib/document';

export async function wrapWithAbbreviation(editor: vscode.TextEditor): Promise<void> {
    const abbr = await vscode.window.showInputBox({
        prompt: 'Enter Emmet abbreviation to wrap with',
        placeHolder: 'div.container>ul>li',
    });

    if (!abbr) return;

    const doc = editor.document;
    const syntax = getLanguageSyntax(doc.languageId);
    const indent = detectIndent(editor);

    const snippets: Array<{ selection: vscode.Selection; snippet: vscode.SnippetString }> = [];

    for (const sel of editor.selections) {
        const selRange = sel.isEmpty
            ? doc.lineAt(sel.active.line).range
            : sel;

        const selText = doc.getText(selRange);
        const baseIndent = lineIndentAt(doc, doc.offsetAt(selRange.start));
        const lines = selText.split('\n').map(line =>
            line.startsWith(baseIndent) ? line.slice(baseIndent.length) : line
        );

        const config = getExpandConfig(syntax, indent, lines);
        const expanded = expand(abbr, config);

        // emmet produces ${1:placeholder} field markers which are valid VS Code snippet syntax
        snippets.push({ selection: new vscode.Selection(selRange.start, selRange.end), snippet: new vscode.SnippetString(expanded) });
    }

    // Apply snippets from last to first to preserve offsets
    for (let i = snippets.length - 1; i >= 0; i--) {
        editor.selection = snippets[i].selection;
        await editor.insertSnippet(snippets[i].snippet, snippets[i].selection);
    }
}

#!/usr/bin/env python3
"""
helper.py — Emmet abbreviation reference utility for @emmetio/codemirror6-plugin

Usage:
    python helper.py list-syntaxes
    python helper.py list-commands
    python helper.py list-options
    python helper.py search <keyword>

This script does NOT expand abbreviations (that requires the JS runtime).
It serves as a quick offline reference for the plugin's supported syntaxes,
commands, and configuration options.
"""

import sys
import textwrap

SYNTAXES = {
    "markup": ["html", "xml", "xsl", "jsx", "tsx", "vue", "haml", "jade", "pug", "slim"],
    "stylesheet": ["css", "scss", "less", "sass", "sss", "stylus", "postcss"],
}

COMMANDS = [
    ("expandAbbreviation",       "Expand Emmet abbreviation at caret (context-agnostic)"),
    ("enterAbbreviationMode",    "Enter interactive abbreviation mode with live preview"),
    ("wrapWithAbbreviation",     "Wrap selection/line with abbreviation (extension factory, not StateCommand)"),
    ("balanceOutward",           "Expand selection to surrounding tag pair"),
    ("balanceInward",            "Shrink selection to inner tag pair"),
    ("toggleComment",            "Toggle HTML or CSS comment around caret/selection"),
    ("evaluateMath",             "Replace inline math expression with its numeric result"),
    ("goToNextEditPoint",        "Move caret to next empty attribute or tag content"),
    ("goToPreviousEditPoint",    "Move caret to previous empty attribute or tag content"),
    ("goToTagPair",              "Jump between open and close tag"),
    ("incrementNumber1",         "Increment number under caret by 1"),
    ("decrementNumber1",         "Decrement number under caret by 1"),
    ("incrementNumber01",        "Increment number under caret by 0.1"),
    ("decrementNumber01",        "Decrement number under caret by 0.1"),
    ("incrementNumber10",        "Increment number under caret by 10"),
    ("decrementNumber10",        "Decrement number under caret by 10"),
    ("removeTag",                "Remove tag at caret, preserving inner content"),
    ("selectNextItem",           "Select next editable HTML attribute or CSS property"),
    ("selectPreviousItem",       "Select previous editable HTML attribute or CSS property"),
    ("splitJoinTag",             "Toggle between <tag></tag> and <tag /> forms"),
]

OPTIONS = [
    ("syntax",           "EmmetKnownSyntax | string",  "html",    "Document syntax; controls parsing and output"),
    ("mark",             "boolean | string[]",          "true",    "Enable abbreviation marking"),
    ("previewEnabled",   "boolean | string[]",          "true",    "Show live abbreviation preview"),
    ("markTagPairs",     "boolean",                     "true",    "Highlight matching open/close tags"),
    ("autoRenameTags",   "boolean",                     "true",    "Auto-rename matching tag when one is edited"),
    ("previewOpenTag",   "boolean",                     "false",   "Show open-tag preview inside closing tag"),
    ("autocompleteTab",  "boolean | string[]",          "—",       "Force Tab to accept Emmet autocomplete"),
    ("attributeQuotes",  "'single' | 'double'",         "double",  "Quote style for generated attributes"),
    ("markupStyle",      "'html' | 'xhtml' | 'xml'",    "html",    "Self-closing element style"),
    ("comments",         "boolean",                     "false",   "Append class/id comments to generated elements"),
    ("commentsTemplate", "string",                      "...",     "Template for auto-comments; [#ID] [.CLASS] tokens"),
    ("bem",              "boolean",                     "false",   "Enable BEM class-name shorthand"),
    ("shortHex",         "boolean",                     "—",       "Shorten hex colors (#000000 → #000)"),
    ("completionBoost",  "number",                      "99",      "boost value for Emmet autocomplete items"),
    ("config",           "GlobalConfig",                "—",       "Advanced Emmet engine config (snippets, options)"),
    ("preview",          "EmmetPreviewConfig",          "{}",      "Preview popup config (html/css extensions, root)"),
]


def cmd_list_syntaxes():
    print("Supported Emmet syntaxes:\n")
    for group, items in SYNTAXES.items():
        print(f"  [{group}]")
        for s in items:
            print(f"    {s}")
    print()


def cmd_list_commands():
    print("Available Emmet commands:\n")
    col = max(len(name) for name, _ in COMMANDS) + 2
    for name, desc in COMMANDS:
        wrapped = textwrap.wrap(desc, 60)
        print(f"  {name:<{col}}{wrapped[0]}")
        for line in wrapped[1:]:
            print(f"  {' ' * col}{line}")
    print()


def cmd_list_options():
    print("EmmetConfig options:\n")
    name_col = max(len(o[0]) for o in OPTIONS) + 2
    type_col = max(len(o[1]) for o in OPTIONS) + 2
    def_col  = max(len(o[2]) for o in OPTIONS) + 2
    header = f"  {'Option':<{name_col}}{'Type':<{type_col}}{'Default':<{def_col}}Description"
    print(header)
    print("  " + "-" * (len(header) - 2))
    for name, typ, default, desc in OPTIONS:
        print(f"  {name:<{name_col}}{typ:<{type_col}}{default:<{def_col}}{desc}")
    print()


def cmd_search(keyword: str):
    kw = keyword.lower()
    results = []

    for name, desc in COMMANDS:
        if kw in name.lower() or kw in desc.lower():
            results.append(("command", name, desc))

    for name, typ, default, desc in OPTIONS:
        if kw in name.lower() or kw in desc.lower() or kw in typ.lower():
            results.append(("option", name, desc))

    for group, items in SYNTAXES.items():
        for s in items:
            if kw in s:
                results.append(("syntax", s, f"({group})"))

    if results:
        print(f"Results for '{keyword}':\n")
        for kind, name, detail in results:
            print(f"  [{kind}] {name} — {detail}")
        print()
    else:
        print(f"No results found for '{keyword}'.\n")


def usage():
    print(__doc__)
    sys.exit(1)


def main():
    args = sys.argv[1:]
    if not args:
        usage()

    cmd = args[0]
    if cmd == "list-syntaxes":
        cmd_list_syntaxes()
    elif cmd == "list-commands":
        cmd_list_commands()
    elif cmd == "list-options":
        cmd_list_options()
    elif cmd == "search":
        if len(args) < 2:
            print("Usage: helper.py search <keyword>")
            sys.exit(1)
        cmd_search(args[1])
    else:
        print(f"Unknown command: {cmd}\n")
        usage()


if __name__ == "__main__":
    main()

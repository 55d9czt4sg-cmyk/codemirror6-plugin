#!/usr/bin/env bash
set -euo pipefail

# Emmet extension for CodeMirror 6 — install script
# Usage: curl -fsSL https://raw.githubusercontent.com/emmetio/codemirror6-plugin/master/install.sh | bash

PACKAGE="@emmetio/codemirror6-plugin"
MIN_NODE_MAJOR=16

# ── helpers ───────────────────────────────────────────────────────────────────

red()   { printf '\033[31m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }
bold()  { printf '\033[1m%s\033[0m\n'  "$*"; }

die() { red "Error: $*"; exit 1; }

command_exists() { command -v "$1" &>/dev/null; }

# ── preflight checks ──────────────────────────────────────────────────────────

check_node() {
    command_exists node || die "Node.js is not installed. Please install Node.js ${MIN_NODE_MAJOR}+ from https://nodejs.org"

    local version major
    version=$(node --version)           # e.g. v18.12.0
    major=${version#v}; major=${major%%.*}

    [[ "$major" -ge "$MIN_NODE_MAJOR" ]] || \
        die "Node.js ${version} is too old. Please upgrade to Node.js ${MIN_NODE_MAJOR}+."
}

detect_package_manager() {
    if command_exists npm; then
        echo "npm"
    else
        die "npm is not installed. Please install Node.js (which includes npm) from https://nodejs.org"
    fi
}

# ── install ───────────────────────────────────────────────────────────────────

install_package() {
    local pm="$1"

    bold "Installing ${PACKAGE} with ${pm}…"

    case "$pm" in
        npm)  npm install "${PACKAGE}" ;;
        yarn) yarn add   "${PACKAGE}" ;;
        pnpm) pnpm add   "${PACKAGE}" ;;
    esac
}

# ── main ──────────────────────────────────────────────────────────────────────

main() {
    bold "Emmet extension for CodeMirror 6 — installer"
    echo ""

    check_node

    # Allow the caller to override the package manager via PM env var
    local pm="${PM:-}"
    if [[ -z "$pm" ]]; then
        pm=$(detect_package_manager)
    fi

    install_package "$pm"

    echo ""
    green "✓ ${PACKAGE} installed successfully."
    echo ""
    bold "Quick start:"
    cat <<'EOF'
  import { EditorState } from '@codemirror/state';
  import { EditorView, basicSetup } from 'codemirror';
  import { html } from '@codemirror/lang-html';
  import { abbreviationTracker } from '@emmetio/codemirror6-plugin';

  new EditorView({
      state: EditorState.create({
          extensions: [basicSetup, html(), abbreviationTracker()]
      }),
      parent: document.body
  });
EOF
    echo ""
    echo "Full documentation: https://github.com/emmetio/codemirror6-plugin"
}

main "$@"

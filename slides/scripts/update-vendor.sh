#!/usr/bin/env bash
# Refresh the vendored reveal.js and Mermaid builds (needs Node/npm and internet; the deck itself does not).
set -euo pipefail
REVEAL_VERSION="${REVEAL_VERSION:-5}"
MERMAID_VERSION="${MERMAID_VERSION:-11}"
SLIDES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

cd "$TMP"
npm init -y >/dev/null
npm install --no-audit --no-fund "reveal.js@${REVEAL_VERSION}" "mermaid@${MERMAID_VERSION}" >/dev/null

V="$SLIDES_DIR/vendor"
rm -rf "$V"
mkdir -p "$V/reveal/theme" "$V/reveal/plugin/notes" "$V/mermaid"
cp node_modules/reveal.js/dist/{reset.css,reveal.css,reveal.js} "$V/reveal/"
cp node_modules/reveal.js/dist/theme/black.css "$V/reveal/theme/"
mkdir -p "$V/reveal/theme/fonts"
cp -r node_modules/reveal.js/dist/theme/fonts/source-sans-pro "$V/reveal/theme/fonts/"
cp node_modules/reveal.js/plugin/notes/notes.js "$V/reveal/plugin/notes/"
cp node_modules/reveal.js/LICENSE "$V/reveal/LICENSE"
cp node_modules/mermaid/dist/mermaid.min.js "$V/mermaid/"
cp node_modules/mermaid/LICENSE "$V/mermaid/LICENSE"

echo "reveal.js $(node -p "require('./node_modules/reveal.js/package.json').version"), mermaid $(node -p "require('./node_modules/mermaid/package.json').version") -> $V"

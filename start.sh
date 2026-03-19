#!/usr/bin/env bash
# SwordPen — start development server (macOS / Linux)
set -e

# Move to the directory containing this script
cd "$(dirname "$0")"

echo ""
echo "  SwordPen — Vocabulary App"
echo "  ────────────────────────────────────"

# Install dependencies if node_modules is missing or package.json changed
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules/.package-lock.json" ]; then
  echo "  Installing dependencies…"
  npm install
fi

echo "  Starting dev server → http://localhost:5173"
echo ""
npm run dev

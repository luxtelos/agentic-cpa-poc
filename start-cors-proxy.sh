#!/usr/bin/env bash
# start-cors-proxy.sh
# Purpose: Install & run local-cors-proxy for Perplexity Async API
# Usage: ./start-cors-proxy.sh [PORT] [TARGET_API_BASE]
# Defaults: PORT=8010, TARGET_API_BASE=https://api.perplexity.ai

set -euo pipefail

# On Render.com, set the CORS API base via the RENDER_CORS_API_BASE env var.

# Determine port: CLI arg, then RENDER's $PORT env var, then default
PORT="${1:-${PORT:-8010}}"
# Determine API base: CLI arg, then RENDER_CORS_API_BASE env var, then default
TARGET_API_BASE="${2:-${RENDER_CORS_API_BASE:-https://api.perplexity.ai}}"

echo "🚀 Starting local CORS proxy"
echo " - Listening on port: $PORT"
echo " - Forwarding to:    $TARGET_API_BASE"

# Check for Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js not found. Please install Node.js to proceed."
  exit 1
fi

# Check for npm
if ! command -v npm >/dev/null 2>&1; then
  echo "❌ npm not found. Please install npm to proceed."
  exit 1
fi

# Install local-cors-proxy globally if missing
if ! command -v lcp >/dev/null 2>&1; then
  echo "📦 Installing local-cors-proxy globally..."
  npm install -g local-cors-proxy
fi

echo "🔧 Launching proxy on port $PORT forwarding to $TARGET_API_BASE"
exec lcp --proxyUrl "$TARGET_API_BASE" --port "$PORT"

# End of script
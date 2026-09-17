#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# No persistent state is written by the application, so every invocation
# starts with a fresh simulation.
exec node src/index.js

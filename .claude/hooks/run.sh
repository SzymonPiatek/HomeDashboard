#!/usr/bin/env bash
# Wspólny wrapper: uruchamia .claude/hooks/<nazwa>.py, zachowując stdin.
# Brak pythona albo brak pliku = cicha zgoda. Hook nigdy nie blokuje pracy z powodu
# własnej awarii.
set -uo pipefail
dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
name="${1:-}"
[ -n "$name" ] || exit 0
command -v python3 >/dev/null 2>&1 || exit 0
[ -f "$dir/$name.py" ] || exit 0
exec python3 "$dir/$name.py"

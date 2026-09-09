#!/usr/bin/env bash
# SessionStart: krótki stan projektu. Wypisuje na stdout — trafia do kontekstu sesji.
set -uo pipefail
cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0

branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "brak repo")
dirty=$(git status --porcelain -uall 2>/dev/null | wc -l | tr -d ' ')

echo "## Stan projektu"
echo "- Gałąź: ${branch} (niezacommitowanych zmian: ${dirty})"

if compgen -G "docs/prd/*.md" >/dev/null 2>&1; then
  echo "- PRD: jest"
else
  echo "- PRD: BRAK — zakres nieustalony. Nie zakładaj, czym jest ten produkt; "\
"jeśli zadanie tego wymaga, najpierw discovery-analyst."
fi

if [ -f package.json ]; then
  echo "- Kod: szkielet monorepo istnieje"
else
  echo "- Kod: brak szkieletu monorepo"
fi

echo "- Agenci ładują się przy starcie sesji: po edycji .claude/agents/ zrestartuj sesję."

"""PreToolUse: Write|Edit — blokuje zapis łamiący twarde reguły projektu.

Blokuje tylko rzeczy jednoznaczne i kosztowne. Wątpliwe przypadki przepuszcza —
od nich jest code-reviewer. Ucieczka awaryjna: komentarz `rules-exception: <powód>`
w tej samej linii wyłącza sprawdzenie dla niej.
"""
import json
import os
import re
import sys

try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)

ti = data.get("tool_input") or {}
path = ti.get("file_path") or ""

chunks = []
for key in ("content", "new_string"):
    value = ti.get(key)
    if isinstance(value, str):
        chunks.append(value)
for edit in ti.get("edits") or []:
    if isinstance(edit, dict) and isinstance(edit.get("new_string"), str):
        chunks.append(edit["new_string"])

text = "\n".join(chunks)
if not text.strip():
    sys.exit(0)

root = os.environ.get("CLAUDE_PROJECT_DIR", "")
rel = path[len(root):].lstrip("/") if root and path.startswith(root) else path
rel = rel.replace("\\", "/")

# Sam system agentowy opisuje zakazane wzorce — nie sprawdzamy go.
if rel.startswith(".claude/"):
    sys.exit(0)

is_doc = rel.endswith((".md", ".mdx")) or rel.startswith("docs/")
is_ts = rel.endswith((".ts", ".tsx"))
in_web = rel.startswith("apps/web/")

problems = []

SECRETS = [
    (r"-----BEGIN [A-Z ]*PRIVATE KEY-----", "klucz prywatny"),
    (r"\bAKIA[0-9A-Z]{16}\b", "klucz dostępu AWS"),
    (r"\bgh[pousr]_[A-Za-z0-9]{20,}\b", "token GitHub"),
    (r"\bsk-[A-Za-z0-9_-]{24,}\b", "klucz API w formacie sk-…"),
    (r"\bxox[baprs]-[A-Za-z0-9-]{10,}\b", "token Slack"),
]
for pattern, label in SECRETS:
    if re.search(pattern, text):
        problems.append(
            f"{label} w treści pliku. Sekrety trzymamy wyłącznie w envs/*.env "
            f"(poza gitem) — .claude/rules/ops.md."
        )

if is_doc:
    if problems:
        sys.stderr.write("Zapis zablokowany:\n- " + "\n- ".join(problems) + "\n")
        sys.exit(2)
    sys.exit(0)

RAW_COLOR = re.compile(
    r"\b(?:bg|text|border|ring|fill|stroke|from|via|to|decoration|outline|divide|placeholder)"
    r"-(?:white|black|slate|gray|grey|zinc|neutral|stone|red|orange|amber|yellow|lime|green|"
    r"emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)"
    r"(?:-(?:50|\d{3}))?\b"
)

LINE_RULES = [
    (re.compile(r"(?::\s*any\b|\bas\s+any\b|<any>|\bany\[\]|Array<any>)"), True, False,
     "`any` jest zakazane (.claude/rules/typescript.md). Użyj `unknown` i zawęź typ jawnie."),
    (re.compile(r"@ts-ignore"), True, False,
     "`@ts-ignore` jest zakazane. Użyj `@ts-expect-error` z komentarzem wyjaśniającym."),
    (re.compile(r"""(?:from\s+['"]@prisma/client['"]|require\(\s*['"]@prisma/client['"])"""), False, True,
     "apps/web nie ma dostępu do bazy (.claude/rules/web.md). Dane pobieraj z API przez TanStack Query."),
    (RAW_COLOR, False, True,
     "Surowy kolor Tailwinda psuje tryb ciemny (.claude/rules/web.md). "
     "Użyj tokenu semantycznego: bg-background, text-muted-foreground, border, destructive."),
    (re.compile(r"\bprisma\s+db\s+push\b"), False, False,
     "`prisma db push` jest zakazane (.claude/rules/data.md). Używamy `prisma migrate`."),
]

for number, line in enumerate(text.splitlines(), start=1):
    if "rules-exception:" in line:
        continue
    for pattern, needs_ts, needs_web, message in LINE_RULES:
        if needs_ts and not is_ts:
            continue
        if needs_web and not in_web:
            continue
        if pattern.search(line):
            problems.append(f"linia {number}: {message}")

if re.search(r"apps/web/(?:src/)?app/api/", rel):
    problems.append(
        "Next.js jest wyłącznie warstwą prezentacji — app/api/** jest zakazane "
        "(.claude/rules/stack.md). Endpoint dodaj w apps/api."
    )

if problems:
    sys.stderr.write(
        "Zapis zablokowany — złamane twarde reguły projektu:\n- "
        + "\n- ".join(problems)
        + "\n\nPopraw i zapisz ponownie. Jeśli złamanie reguły jest naprawdę uzasadnione, "
          "dopisz w tej linii komentarz `rules-exception: <powód>` i zgłoś to w raporcie.\n"
    )
    sys.exit(2)

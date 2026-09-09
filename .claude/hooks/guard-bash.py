"""PreToolUse: Bash — blokuje operacje nieodwracalne i te zakazane regułami."""
import json
import re
import subprocess
import sys

try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)

command = (data.get("tool_input") or {}).get("command")
if not isinstance(command, str) or not command.strip():
    sys.exit(0)

BLOCKED = [
    (r"docker[\s-]+compose\b[^\n]*\bdown\b[^\n]*(?:-v\b|--volumes\b)",
     "kasuje wolumeny, czyli dane bazy"),
    (r"\bprisma\s+migrate\s+reset\b",
     "kasuje zawartość bazy"),
    (r"\bprisma\s+db\s+push\b",
     "omija migracje — używamy `prisma migrate` (.claude/rules/data.md)"),
    (r"\bgit\s+push\b[^\n]*(?:--force\b|--force-with-lease\b|\s-f\b)",
     "nadpisuje historię na zdalnej gałęzi"),
    (r"\bdrop\s+database\b",
     "usuwa bazę"),
    (r"\btruncate\s+table\b",
     "kasuje zawartość tabeli"),
    (r"\bgit\s+add\b[^\n]*(?:(?:^|[\s/])\.env(?:\s|$)|envs/[^\s]*\.env(?!\.example))",
     "dodaje plik konfiguracji z sekretami do gita"),
    (r"\brm\s+-[a-z]*[rf][a-z]*\s+/(?:\s|$)",
     "usuwa katalog główny systemu"),
]

for pattern, why in BLOCKED:
    if re.search(pattern, command, re.IGNORECASE):
        sys.stderr.write(
            f"Polecenie zablokowane: {why}.\n"
            f"To operacja nieodwracalna — .claude/rules/ops.md wymaga wyraźnej zgody "
            f"użytkownika. Zapytaj go, zamiast wykonywać.\n"
        )
        sys.exit(2)

# Format komunikatu commita (.claude/rules/git.md). Sprawdzamy tylko, gdy treść podano
# w wierszu poleceń — commita pisanego w edytorze nie widzimy.
if re.search(r"\bgit\s+commit\b", command):
    subject = None
    match = re.search(r"""(?:-m|--message[= ])\s*(?P<q>["'])(?P<msg>.*?)(?P=q)""", command, re.DOTALL)
    if match:
        subject = match.group("msg").splitlines()[0].strip() if match.group("msg").strip() else ""

    if subject is not None and subject != "":
        exempt = re.match(r"^(?:fixup!|squash!|Revert |Merge )", subject)
        conventional = re.match(
            r"^(?:feat|fix|refactor|test|docs|chore|ci|build|perf|revert)"
            r"(?:\([a-z0-9._\-]+\))?!?: .+",
            subject,
        )
        if not exempt and not conventional:
            sys.stderr.write(
                "Komunikat commita nie trzyma się konwencji (.claude/rules/git.md).\n"
                "Format: <typ>(<zakres>): <co robi zmiana>\n"
                "Typy: feat, fix, refactor, test, docs, chore, ci, build, perf, revert.\n"
                "Temat w trybie rozkazującym, małą literą, bez kropki — np. "
                "`feat(api): add task filters`.\n"
                f"Otrzymano: {subject!r}\n"
            )
            sys.exit(2)
        if not exempt and len(subject) > 72:
            sys.stderr.write(
                f"Temat commita ma {len(subject)} znaków, limit to 72 "
                f"(.claude/rules/git.md). Skróć temat, a szczegóły przenieś do treści.\n"
            )
            sys.exit(2)

if re.search(r"\bgit\s+push\b", command) and not re.search(r"--dry-run", command):
    try:
        branch = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True, text=True, timeout=5,
        ).stdout.strip()
    except Exception:
        branch = ""
    if branch in ("main", "master"):
        sys.stderr.write(
            f"Push wprost na gałąź `{branch}` zablokowany. Utwórz gałąź roboczą albo "
            f"poproś użytkownika o wyraźną zgodę na push do gałęzi głównej.\n"
        )
        sys.exit(2)

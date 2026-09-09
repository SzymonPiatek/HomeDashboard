"""PostToolUse: Write|Edit — lint zmienionego pliku TypeScript.

Sprząta po sobie sam agent: wynik wraca do niego, nie do użytkownika.
Brak zainstalowanych zależności = cisza. Nie uruchamiamy tu tsc — jest za wolny
na pojedynczą edycję, od tego jest CI.
"""
import json
import os
import subprocess
import sys

try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)

path = (data.get("tool_input") or {}).get("file_path") or ""
if not path.endswith((".ts", ".tsx")):
    sys.exit(0)
if not os.path.isfile(path):
    sys.exit(0)

root = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
if not os.path.isdir(os.path.join(root, "node_modules")):
    sys.exit(0)

try:
    result = subprocess.run(
        # Formatter "compact" wypadł z rdzenia ESLint-a i wymagałby osobnej zależności;
        # "stylish" jest domyślny i wbudowany, więc hook działa bez instalowania czegokolwiek.
        ["pnpm", "-s", "exec", "eslint", "--format", "stylish", path],
        capture_output=True, text=True, timeout=90, cwd=root,
    )
except Exception:
    sys.exit(0)

if result.returncode == 0:
    sys.exit(0)

output = ((result.stdout or "") + (result.stderr or "")).strip()
if not output:
    sys.exit(0)

sys.stderr.write("ESLint zgłasza problemy w zapisanym pliku:\n" + output[:4000] + "\n")
sys.exit(2)

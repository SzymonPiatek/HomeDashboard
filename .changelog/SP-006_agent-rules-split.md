# Wykaz zmian: SP-006_agent-rules-split

- **Gałąź:** `SP-006_agent-rules-split`
- **Rozpoczęto:** 2026-09-09
- **Status:** gotowe do przeglądu

## Po co ta zmiana

Każdy wyspecjalizowany agent (`backend-dev`, `frontend-dev`, `ux-designer`, `qa-engineer`
itd.) zaczynał zadanie od odczytania kilku pełnych plików `.claude/rules/*.md`, z których
duża część treści go nie dotyczyła — np. `ux-designer` i `qa-engineer` czytały cały
`web.md` (architektura TanStack Query, rejestr elementów pulpitu) tylko po to, żeby
dotrzeć do sekcji o dostępności i motywach. To realny koszt tokenów i czasu przy każdym
uruchomieniu agenta, bez korzyści. Dodatkowo `stack.md` w pełni duplikował decyzje opisane
już szczegółowo w `api.md`/`web.md`/`data.md`/`ops.md` — dwa miejsca do aktualizacji przy
tej samej decyzji. Przy okazji usunięto z `api.md` sekcję o poświadczeniu OVH odwołującą
się do nieistniejących ADR-0024/ADR-0025 — nie pasowała do zakresu MVP z `CLAUDE.md`.

## Co się zmieniło

| Data | Obszar | Zmiana |
|---|---|---|
| 2026-09-09 | rules | Utworzenie gałęzi i wykazu zmian |
| 2026-09-09 | rules | Nowy `.claude/rules/ui-quality.md`: dostępność WCAG 2.2 AA, tryb jasny/ciemny i cztery stany widoku wydzielone z `web.md` — potrzebne też `ux-designer` i `qa-engineer`, które reszty `web.md` nie czytają |
| 2026-09-09 | rules | Nowy `.claude/rules/testing-selectors.md`: reguły selektorów w testach UI wydzielone z `testing.md` |
| 2026-09-09 | rules | `stack.md`: sekcja "Rozstrzygnięcia towarzyszące" zamieniona z pełnej treści na spis z odsyłaczami do właściciela każdej decyzji (usunięcie duplikacji) |
| 2026-09-09 | rules | `api.md`: usunięcie sekcji o poświadczeniu OVH (ADR-0024/ADR-0025 nie istnieją w `docs/adr/`, temat poza zakresem MVP) |
| 2026-09-09 | agents | `frontend-dev.md`, `qa-engineer.md`, `ux-designer.md`, `code-reviewer.md`: listy odczytu wskazują teraz na `ui-quality.md`/`testing-selectors.md` zamiast pełnych `web.md`/`testing.md` |
| 2026-09-09 | agents | `backend-dev.md`: dopisany warunkowy odczyt `.claude/rules/auth.md` przy zadaniach dotykających logowania/sesji — dotąd nieczytany mimo że `auth.md` sam siebie opisuje jako uzupełnienie `api.md` |

## Decyzje podjęte po drodze

- `ui-quality.md` łączy dostępność, motywy i cztery stany widoku w jednym pliku zamiast
  trzech osobnych — ta trójka jest zawsze potrzebna tej samej grupie agentów naraz
  (`frontend-dev`, `ux-designer`, `qa-engineer`), więc dalszy podział byłby rozdrobnieniem
  bez korzyści.
- `typescript.md` pozostał nietknięty — dotyczy każdego kodu w monorepo, więc podział
  dałby fragmenty i tak potrzebne każdemu agentowi piszącemu kod.
- `stack.md` zachowuje spis decyzji (nie tylko surowe odsyłacze bez kontekstu) — agent
  przeglądający `stack.md` od razu widzi, że dana decyzja istnieje i gdzie szukać
  szczegółów, zamiast się dowiadywać o jej istnieniu dopiero w domenowym pliku.
- Usunięcie sekcji OVH z `api.md` nie ma własnego ADR-a do podlinkowania, bo ADR-0024/0025,
  na które się powoływała, nigdy nie powstały w tym repozytorium — to sprzątnięcie
  nieużywanej, niepowiązanej z niczym treści, nie cofnięcie decyzji architektonicznej.

## Świadomie pominięte

Dalszy podział `api.md`, `ops.md` i `data.md` (np. wydzielenie sekcji migracji z `data.md`
albo warstwy repozytorium jako osobnego pliku) — dziś każdy z tych plików ma jednego
głównego czytelnika (`backend-dev`, `release-engineer`, `data-engineer`) i nie ma w nich
treści czytanej niepotrzebnie przez kogoś innego, więc podział nie dałby oszczędności.

## Wpływ na wdrożenie

- **Migracja bazy:** nie
- **Nowe zmienne środowiskowe:** nie
- **Przebudowanie obrazu:** nie
- **Przerwa w działaniu:** nie

## Jak to sprawdzić

- `grep -rn "rules/web.md\|rules/testing.md" .claude/agents/` — każde trafienie ma
  uzasadnienie (agent faktycznie potrzebuje reszty pliku, nie tylko wydzielonej części).
- Otworzyć nową sesję (agenci ładują konfigurację przy starcie) i zlecić dowolne zadanie
  `ux-designer` lub `qa-engineer` — nie powinny już czytać `web.md`.

## Ryzyka

- Zmiana jest samą konfiguracją agentów/reguł — nie da się jej pokryć testem
  automatycznym. Błąd objawi się dopiero jako zły odczyt agenta w kolejnej sesji
  (np. odesłanie do nieistniejącego pliku); `grep` powyżej łapie tylko literówki
  w ścieżkach, nie sensowność podziału.

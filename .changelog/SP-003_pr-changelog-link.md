# Wykaz zmian: SP-003_pr-changelog-link

- **Gałąź:** `SP-003_pr-changelog-link`
- **Rozpoczęto:** 2026-09-09
- **Status:** w toku

## Po co ta zmiana

`.claude/rules/git.md` zakłada, że opis pull requesta to wyłącznie link do wykazu zmian,
wstawiany automatycznie przez workflow `changelog-link.yml` — ale samego workflowa
i szablonu PR-a w repo jeszcze nie było. Bez nich CI nie blokuje PR-a bez
`.changelog/<gałąź>.md`, a link trzeba by wklejać ręcznie.

## Co się zmieniło

| Data | Obszar | Zmiana |
|---|---|---|
| 2026-09-09 | ci | Dodano `.github/pull_request_template.md` i `.github/workflows/changelog-link.yml`, przeniesione z `/Users/szymon/Projects/OWN/MyDashboard` (ten sam wzorzec co opisany w `.claude/rules/git.md`) |

## Decyzje podjęte po drodze

- Skopiowane jeden do jednego bez zmian treści — oba pliki są generyczne (adres repo
  budowany dynamicznie z `pr.head.repo.full_name`, brak zaszytej nazwy projektu).
- Nie skopiowano `.github/actions/setup`, `.github/workflows/ci.yml` ani `release.yml`
  z tego samego źródła — poza zakresem tego zadania (tylko PR template + linkowanie
  wykazu zmian), zostaje do osobnego zadania, gdy repo dostanie pełne CI.

## Świadomie pominięte

Pełne CI (`ci.yml`: formatowanie/lint, typy, testy jednostkowe, testy integracyjne)
i `release.yml` — `.claude/rules/ops.md` już opisuje docelowy kształt tego joba, ale
wdrożenie go to osobna, większa zmiana.

## Wpływ na wdrożenie

- **Migracja bazy:** nie
- **Nowe zmienne środowiskowe:** nie
- **Przebudowanie obrazu:** nie
- **Przerwa w działaniu:** nie

## Jak to sprawdzić

Otworzyć dowolny pull request z gałęzi mającej `.changelog/<gałąź>.md` — opis powinien
dostać sekcję "Wykaz zmian" z linkiem do tego pliku. Gałąź bez tego pliku powinna
oznaczyć joba `link` jako czerwony.

## Ryzyka

Brak — sam workflow nie dotyka kodu aplikacji.

# Wykaz zmian: SP-001_discovery-mvp

- **Gałąź:** `SP-001_discovery-mvp`
- **Rozpoczęto:** 2026-09-09
- **Status:** gotowe do przeglądu

## Po co ta zmiana

Ustalenie zakresu produktu przed pierwszą linią kodu: czym ma być HomeDashboard,
kto go używa, jaki jest MVP i co świadomie zostaje w backlogu.

## Co się zmieniło

| Data | Obszar | Zmiana |
|---|---|---|
| 2026-09-09 | discovery | Start ankiety odkrywczej (discovery-analyst) |
| 2026-09-09 | discovery | Napisano PRD `docs/prd/pulpit-domowy-mvp.md` (przebieg 2, na podstawie odpowiedzi z przebiegu 1) i utworzono `docs/backlog.md` z pozycjami BL-001..BL-007 odłożonymi z sekcji "poza zakresem" |
| 2026-09-09 | discovery | Rozstrzygnięto otwarte kwestie z użytkownikiem (2FA w MVP, lista ikon projektuje ux-designer, sesja kiosk długożyjąca); PRD oznaczone jako Zatwierdzony, uzupełniono „Stan projektu" w `CLAUDE.md` |

## Decyzje podjęte po drodze

- MVP to **rzut mieszkania 2D** z ręcznym rysowaniem ścian i przeciąganiem ikon
  mebli/urządzeń — nie sterowanie IoT, wbrew wcześniejszej rekomendacji agenta.
  3D odłożone jako BL-001, import/auto-detekcja układu jako BL-006.
- Integracja z rzeczywistymi urządzeniami (nawilżacz Xiaomi, lodówka Samsung) idzie
  docelowo przez **Home Assistant na Raspberry Pi** jako centralny hub, ale sprzęt
  jeszcze fizycznie nie istnieje — integracja odłożona jako BL-002 i świadomie
  zablokowana do czasu, aż hub zacznie działać.
- **2FA kodem e-mail** (przez istniejącą infrastrukturę pocztową użytkownika na
  VPS) rekomendowane jako część **MVP**, nie kroku "zaraz po" — bo pulpit jest
  dostępny pod publiczną domeną od pierwszego dnia (brak trybu offline), więc samo
  hasło uznano za niewystarczające. Wymaga jeszcze potwierdzenia leada/użytkownika
  (patrz otwarte kwestie w PRD).

## Świadomie pominięte

Z sekcji "poza zakresem" PRD — przeniesione do `docs/backlog.md`:
BL-001 (rzut 3D), BL-002 (integracja Home Assistant), BL-003 (automatyzacje),
BL-004 (historia/wykresy), BL-005 (powiadomienia), BL-006 (import/auto-detekcja
planu), BL-007 (więcej urządzeń/marek).

## Wpływ na wdrożenie

- **Migracja bazy:** nie
- **Nowe zmienne środowiskowe:** nie
- **Przebudowanie obrazu:** nie
- **Przerwa w działaniu:** nie

## Jak to sprawdzić

Przeczytać `docs/prd/pulpit-domowy-mvp.md` i `docs/backlog.md`. Sprawdzić, czy
sekcja "poza zakresem" PRD linkuje do istniejących pozycji BL-NNN w backlogu.

## Ryzyka

Brak — dokumentacja, brak zmian w kodzie.

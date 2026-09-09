# Wykaz zmian: SP-010_floor-plan-editor

- **Gałąź:** `SP-010_floor-plan-editor`
- **Rozpoczęto:** 2026-09-09
- **Status:** w toku

## Po co ta zmiana

BL-020 / US-3 z PRD: endpoint `PUT .../plan` istnieje od SP-007, ale nie ma go kto
zawołać z interfejsu — każdy nowy poziom jest pusty na zawsze, a rzut da się wypełnić
tylko seedem albo ręcznym żądaniem. Ta gałąź dodaje edytor ścian i pokoi w widoku 2D
(rysowanie, przesuwanie, usuwanie), więc rzut faktycznie da się utworzyć z interfejsu.

## Co się zmieniło

Prowadzone na bieżąco.

| Data | Obszar | Zmiana |
| ---- | ------ | ------ |
| 2026-09-09 | `plan/FloorPlanView2D.tsx` | Zaznaczanie ściany/pokoju w widoku 2D (klik oraz Tab, `aria-pressed`, podświetlenie kolorem akcentu) — pierwszy krok edytora, bez rysowania, przesuwania, usuwania ani zapisu. |
| 2026-09-09 | `plan/FloorPlanView2D.tsx`, `plan/StaticFloorPlanView.tsx` (nowy), `plan/editor/**` (nowy), `plan/FloorPlanViewControls.tsx`, `LevelPlanPageView.tsx`, `api/use-floor-plan.ts`, `packages/contracts/src/floor-plan.ts` | Tryb edycji rzutu: przycisk (ikona `PencilRuler`, odróżniona od ołówka zmiany nazwy w nagłówku) obok przełącznika 2D/3D, widoczny tylko w 2D. Po włączeniu pokazuje pasek: narzędzie „Zaznacz” (na razie jedyne), „Zapisz rzut” (aktywny, gdy jest różnica względem zapisanej wersji), „Cofnij”/„Ponów”. Poza trybem edycji widok zostaje czysto wizualny (`StaticFloorPlanView`) z tym samym zaznaczaniem co dotąd. |

## Decyzje podjęte po drodze

- Zaznaczanie (klik/Tab, podświetlenie) działa **zawsze**, niezależnie od trybu edycji —
  jest czysto wizualne, nie modyfikuje dokumentu. Przeciąganie, strzałki, Delete i zapis
  działają **wyłącznie** w trybie edycji.
- Cofanie/ponawianie: `history` (przeszłość) i `future` (przyszłość) jako dwa stosy
  dokumentów; każda nowa edycja czyści `future` (standardowe zachowanie undo/redo).
  Zapis czyści oba stosy — nie da się cofnąć do stanu sprzed ostatniego zapisu.
- Toolbar na razie ma tylko narzędzie „Zaznacz” i nie ma przycisku usuwania zaznaczenia —
  usuwanie działa klawiszem Delete/Backspace na zaznaczonym elemencie. Rysowanie ściany/
  pokoju i przycisk usuwania wracają, gdy będą gotowe.

## Świadomie pominięte

- Narzędzia „Dodaj ścianę”/„Dodaj pokój” w toolbarze i przycisk usuwania zaznaczenia —
  BL-020 dalej otwarte, wracają w kolejnych commitach na tej gałęzi.

## Wpływ na wdrożenie

- **Migracja bazy:** nie.
- **Nowe zmienne środowiskowe:** nie.
- **Przebudowanie obrazu:** nie.
- **Przerwa w działaniu:** nie.

## Jak to sprawdzić

Wejdź na widok poziomu z zapisaną geometrią (np. seed). Poza trybem edycji kliknięcie
ściany/pokoju podświetla je (klik i Tab). W widoku 2D kliknij ikonę obok przełącznika
2D/3D, żeby włączyć edycję — pojawia się pasek z „Zaznacz”, „Cofnij”, „Ponów”, „Zapisz
rzut”. Przeciągnij zaznaczoną ścianę/pokój (albo przesuń strzałkami) — „Zapisz rzut” i
„Cofnij” stają się aktywne; „Cofnij” przywraca poprzedni stan, „Ponów” wraca do przodu.
Zapis czyści historię cofania.

## Ryzyka

Zapis nadpisuje cały dokument rzutu (`PUT`) porównując `version` — konflikt przy edycji
z dwóch urządzeń naraz kończy się błędem 409 z komunikatem, nie cichym nadpisaniem.

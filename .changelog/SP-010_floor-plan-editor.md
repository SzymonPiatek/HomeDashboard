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

## Decyzje podjęte po drodze

- Rysowanie ścian/pokoi, przeciąganie, cofanie (undo) i zapis do API były już
  robocze, ale świadomie **nie weszły w tę zmianę** — nie były jeszcze gotowe do
  przeglądu. Kod czeka poza gałęzią do dalszej pracy, dogrywany będzie kolejnymi
  commitami.

## Świadomie pominięte

- Rysowanie nowej ściany/pokoju, przeciąganie, klawisze strzałek, Delete, cofanie
  (undo), zapis `PUT .../plan` z interfejsu — BL-020 dalej otwarte, wraca w
  kolejnych commitach na tej gałęzi.

## Wpływ na wdrożenie

- **Migracja bazy:** nie.
- **Nowe zmienne środowiskowe:** nie.
- **Przebudowanie obrazu:** nie.
- **Przerwa w działaniu:** nie.

## Jak to sprawdzić

Wejdź na widok poziomu z zapisaną geometrią (np. seed), kliknij ścianę lub pokój —
podświetla się kolorem akcentu; Tab też zaznacza. Kliknięcie pustego miejsca albo
innego elementu zmienia/czyści zaznaczenie.

## Ryzyka

Brak — zmiana czysto wizualna, nie dotyka zapisu ani danych.

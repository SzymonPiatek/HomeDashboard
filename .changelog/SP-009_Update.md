# Wykaz zmian: SP-009_Update

- **Gałąź:** `SP-009_Update`
- **Rozpoczęto:** 2026-09-09
- **Status:** w toku

## Po co ta zmiana

Górny pasek (Navbar) niósł wyłącznie dwie akcje konta (motyw, wylogowanie) i zajmował
stały pas na każdej stronie. Te same akcje jako pływający stos w rogu ekranu wyglądają
lepiej i nie zabierają miejsca nad okruszkami.

## Co się zmieniło

| Data | Obszar | Zmiana |
| ---- | ------ | ------ |
| 2026-09-09 | `features/dashboard/components/CornerActions.tsx` (nowy), `Navbar.tsx` (usunięty) | Navbar zastąpiony pływającym stosem ikon `fixed right-4 bottom-4`, rosnącym w górę. |
| 2026-09-09 | `features/auth/components/LogoutButton.tsx` | Przycisk wylogowania bez widocznego tekstu — ikona z `aria-label`, tak jak `ThemeToggle`. |
| 2026-09-09 | `app/(app)/layout.tsx` | `CornerActions` renderowany po `<main>`, żeby kolejność fokusu klawiaturą trafiała na niego jako ostatni, nie przerywając treści strony. |

## Decyzje podjęte po drodze

- Kolejność w stosie: wylogowanie najbliżej rogu, przełącznik motywu nad nim —
  na kiosku (tablet) to częstsza z dwóch akcji, bliżej kciuka.

## Świadomie pominięte

## Wpływ na wdrożenie

- **Migracja bazy:** nie.
- **Nowe zmienne środowiskowe:** nie.
- **Przebudowanie obrazu:** nie.
- **Przerwa w działaniu:** nie.

## Jak to sprawdzić

Wejdź na dowolną stronę za logowaniem — w prawym dolnym rogu widać dwie ikony
(motyw, wylogowanie), bez stałego paska na górze. Sprawdź oba motywy i wylogowanie.

## Ryzyka

Pływający stos może zasłaniać treść w prawym dolnym rogu widoków z dużą ilością
danych — do obserwacji przy kolejnych elementach pulpitu.

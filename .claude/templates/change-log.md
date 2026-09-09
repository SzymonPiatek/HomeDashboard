# Wykaz zmian: <nazwa gałęzi>

Plik: `.changelog/<pełna-nazwa-gałęzi>.md` — nazwa musi dokładnie odpowiadać gałęzi,
bo po niej szuka go workflow `changelog-link.yml`.

- **Gałąź:** `SP-<numer>_<opis>`
- **Rozpoczęto:** RRRR-MM-DD
- **Status:** w toku | gotowe do przeglądu | scalone

## Po co ta zmiana

Jeden akapit: jaki problem rozwiązuje i skąd się wziął. Nie streszczaj diffa —
to widać w kodzie. Napisz to, czego w kodzie nie widać.

## Co się zmieniło

Prowadzone **na bieżąco**, nie odtwarzane z pamięci na końcu. Wpis dodajesz wtedy,
gdy zmiana powstaje.

| Data | Obszar | Zmiana |
|---|---|---|
| | | |

## Decyzje podjęte po drodze

Rozstrzygnięcia, które nie były oczywiste, wraz z powodem. Jeśli któreś jest trudne
do odkręcenia — powinno mieć ADR, podlinkuj go tutaj.

## Świadomie pominięte

Czego ta gałąź **nie** robi, mimo że temat się o to ocierał. Pozycje trwałe przenieś
do `docs/backlog.md` i podaj tu ich numery `BL-NNN`.

## Wpływ na wdrożenie

- **Migracja bazy:** nie / tak — nazwa migracji, czy jest destrukcyjna, plan wycofania
- **Nowe zmienne środowiskowe:** nie / tak — które pliki `envs/*.env.example` zaktualizowano
- **Przebudowanie obrazu:** nie / tak — dlaczego (np. zmiana `NEXT_PUBLIC_*`)
- **Przerwa w działaniu:** nie / tak — ile i dlaczego

Jeśli wszystkie cztery to „nie", napisz to wprost. Pusta sekcja znaczy „nie sprawdziłem".

## Jak to sprawdzić

Kroki, którymi ktoś inny potwierdzi, że działa. Konkretnie, nie „uruchom i zobacz".

## Ryzyka

Co może pójść źle po scaleniu i po czym to poznasz.

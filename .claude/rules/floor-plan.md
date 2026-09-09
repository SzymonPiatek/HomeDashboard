# Reguły: element „Rzut mieszkania"

Wynikają z [ADR-0002](../../docs/adr/0002-floor-plan-normalized-entities-in-millimeters.md)
i [ADR-0006](../../docs/adr/0006-floor-plan-rendered-as-svg.md).
Uzupełniają `.claude/rules/data.md`, `api.md` i `web.md` — nie zastępują ich.

## Jednostki i układ współrzędnych

- **Jedyną jednostką w bazie, w kontrakcie i w kodzie jest milimetr całkowity** (`Int`).
  Piksel, centymetr, metr zmiennoprzecinkowy ani „jednostka siatki" nie występują w żadnym
  polu danych. Metry pojawiają się wyłącznie jako sformatowany tekst w interfejsie.
- Osie: `x` rośnie w prawo, `y` w dół (zgodnie z ekranem), wysokość `z` nie jest przechowywana
  w punktach — mieszka w `heightMm` ściany. Skala widoku (zoom, przesunięcie płótna) jest
  stanem widoku i **nie trafia do bazy**.
- Krok przyciągania do siatki jest stałą w `@repo/contracts`, nie kolumną w bazie.

## Dane

- `Wall`, `Room` i `RoomVertex` należą do agregatu `FloorPlan`. **Kolumną właściciela jest
  `floorPlanId`**; `accountId` występuje wyłącznie na `FloorPlan` i jest unikalny.
- **Nie istnieje zapytanie o `Wall`, `Room` ani `RoomVertex` po samym identyfikatorze.**
  Każde jest zawężone przez `floorPlanId` rzutu należącego do konta z sesji. Zapytanie bez
  tego zawężenia jest błędem bezpieczeństwa, nawet gdy zwraca poprawny wynik.
- Identyfikatory ścian i pokoi przychodzą od klienta jako `uuid` (`crypto.randomUUID()`)
  i są walidowane w kontrakcie. Kolumna `id` nie ma wartości domyślnej.
- Geometria nie trafia do kolumny JSON — ani jako dokument rzutu, ani jako tablica
  wierzchołków pokoju.

## API

- Rzut jest **jednym zasobem na konto**: `GET /api/floor-plan` i `PUT /api/floor-plan`.
  Ścieżka nie zawiera identyfikatora rzutu ani konta.
- Brak zapisanego rzutu zwraca **200 z pustym dokumentem** (`version: 0`, puste listy),
  nigdy 404 — pusta siatka jest stanem poprawnym (US-2).
- `PUT` zapisuje cały dokument w jednej transakcji i porównuje `version`. Niezgodna wersja
  kończy się `409 CONFLICT`, nigdy nadpisaniem.
- Endpoint rzutu nie jest stronicowany świadomie — rozmiar odpowiedzi ogranicza twardy limit
  liczby ścian, pokoi i wierzchołków z `@repo/contracts`, egzekwowany po stronie serwera.

## Frontend

- Element mieszka w `apps/web/features/elements/floor-plan/**` i nie zna własnej trasy ani
  etykiety — jedno i drugie żyje w rejestrze elementów.
- Każda ściana, każdy pokój i każdy wierzchołek jest **elementem interaktywnym z dostępną
  nazwą i pełną obsługą klawiaturą** (zaznaczenie, przesunięcie, usunięcie). Interakcja
  dostępna wyłącznie przez przeciąganie jest niedokończona (NFR dostępności).
- Funkcje geometryczne (przyciąganie, długość, pole, trafienie) są czystymi funkcjami
  w `features/elements/floor-plan/geometry/**`. Nie powstaje osobny pakiet współdzielony,
  dopóki serwer nie potrzebuje tych samych obliczeń.

## Renderowanie (ADR-0006)

- Rysunek rzutu powstaje w **SVG**. `<canvas>` i renderer WebGL nie występują w
  `features/elements/floor-plan/**` — obiekt, którego nie da się ofokusować, nie spełnia
  wymogu obsługi klawiaturą.
- `viewBox` jest w milimetrach: **jedna jednostka SVG = 1 mm**. Przybliżanie zmienia
  `viewBox`, nigdy jednostki danych.
- Kolory i grubości pochodzą z semantycznych tokenów motywu przez CSS. Kolor wpisany
  w atrybut `fill`/`stroke` albo odczytany z JS jest błędem — złamie tryb ciemny.
- Obiekt rzutu (ściana, pokój, wierzchołek) ma `role="button"`, `tabindex` i `aria-label`.
  To **jedyny dopuszczalny wyjątek** od reguły „element klikalny to `button` albo `a`"
  z `.claude/rules/web.md`, ważny wyłącznie wewnątrz rysunku rzutu — SVG nie ma `button`.
- Wskaźnik obsługują Pointer Events, jedną ścieżką dla myszy i dotyku. `touch-action: none`
  ustawiamy wyłącznie na powierzchni rysowania, nigdy na całej stronie.
- Obszar trafienia obiektu ma co najmniej 44×44 px, w razie potrzeby poszerzony niewidoczną
  ścieżką — cienka ściana nie jest celem dotykowym.

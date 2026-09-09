# Reguły: rzut poziomu (ściany i pokoje)

Wynikają z [ADR-0002](../../docs/adr/0002-floor-plan-normalized-entities-in-millimeters.md)
(w części nadal obowiązującej), [ADR-0006](../../docs/adr/0006-floor-plan-rendered-as-svg.md),
[ADR-0008](../../docs/adr/0008-level-as-floor-plan-aggregate-root.md)
i [ADR-0010](../../docs/adr/0010-wall-as-four-corner-block.md).
Uzupełniają `.claude/rules/data.md`, `api.md` i `web.md` — nie zastępują ich.
Hierarchię lokalizacji i poziomów opisuje `.claude/rules/locations.md`.

## Jednostki i układ współrzędnych

- **Jedyną jednostką w bazie, w kontrakcie i w kodzie jest milimetr całkowity** (`Int`).
  Piksel, centymetr, metr zmiennoprzecinkowy ani „jednostka siatki" nie występują w żadnym
  polu danych. Metry pojawiają się wyłącznie jako sformatowany tekst w interfejsie.
- Osie: `x` rośnie w prawo, `y` w dół (zgodnie z ekranem). Wysokość nie jest przechowywana
  w punktach — mieszka w `heightMm` ściany. Skala widoku (zoom, przesunięcie płótna) jest
  stanem widoku i **nie trafia do bazy**.
- Krok przyciągania do siatki jest stałą w `@repo/contracts`, nie kolumną w bazie.

## Ściana to blok o czterech rogach (ADR-0010)

- `Wall` ma **dokładnie cztery** rogi w ośmiu kolumnach `Int`: `p1XMm`, `p1YMm` … `p4XMm`,
  `p4YMm`, oraz `heightMm`. W kontrakcie odpowiada temu `z.tuple` czterech punktów —
  nie tablica, nie lista o zmiennej długości.
- **Kolumna grubości nie istnieje** i tabela wierzchołków ściany nie istnieje. Grubość jest
  własnością narysowanego czworokąta, nie osobnym polem.
- **Renderer nie wylicza kształtu ściany** — nie wydłuża jej o połowę grubości sąsiada, nie
  domyka narożników, nie zgaduje. Rysuje cztery punkty, które dostał.
- `DEFAULT_WALL_HEIGHT_MM` żyje w `@repo/contracts` jako wartość domyślna schematu. Druga
  kopia tej stałej w `apps/web` albo `apps/api` jest błędem.

## Dane

- `Wall`, `Room` i `RoomVertex` należą do agregatu `Level`. **Kolumną właściciela jest
  `levelId`** (dla `RoomVertex` — `roomId`); `accountId` występuje wyłącznie na `Location`.
- **Nie istnieje zapytanie o `Wall`, `Room` ani `RoomVertex` po samym identyfikatorze** —
  pełny łańcuch własności opisuje `.claude/rules/locations.md`.
- Identyfikatory ścian i pokoi przychodzą od klienta jako `uuid` (`crypto.randomUUID()`)
  i są walidowane w kontrakcie. Kolumna `id` nie ma wartości domyślnej.
- Geometria nie trafia do kolumny JSON — ani jako dokument rzutu, ani jako tablica
  wierzchołków pokoju.
- Pokój jest samodzielnym wielokątem (ADR-0002), nie kształtem wyliczanym z domkniętych
  ścian; jego wierzchołki mają jawną kolejność (`position`).

## API

- Rzut jest zasobem poziomu: `GET` i `PUT`
  `/api/locations/:locationId/levels/:levelId/plan`. Zasobu bez identyfikatorów w ścieżce
  (dawne `/api/floor-plan`) **nie ma**.
- Poziom bez zapisanego rzutu zwraca **200 z pustym dokumentem** (`version: 0`, puste listy),
  nigdy 404 — pusta siatka jest stanem poprawnym (US-2). 404 oznacza wyłącznie brak poziomu
  albo brak dostępu do niego.
- `PUT` zapisuje cały dokument w jednej transakcji i porównuje `version` z wiersza `Level`.
  Niezgodna wersja kończy się `409 CONFLICT`, nigdy nadpisaniem; udany zapis podnosi
  `version` o jeden i zwraca zapisany dokument.
- Endpoint rzutu nie jest stronicowany świadomie — rozmiar odpowiedzi ogranicza twardy limit
  liczby ścian, pokoi i wierzchołków z `@repo/contracts`, egzekwowany po stronie serwera.

## Frontend

- Renderer rzutu mieszka w `apps/web/features/elements/locations/plan/**` i nie zna własnej
  trasy ani etykiety (`.claude/rules/locations.md`).
- Każda ściana, każdy pokój i każdy wierzchołek jest **elementem interaktywnym z dostępną
  nazwą i pełną obsługą klawiaturą** (zaznaczenie, przesunięcie, usunięcie). Interakcja
  dostępna wyłącznie przez przeciąganie jest niedokończona (NFR dostępności).
- Funkcje geometryczne (przyciąganie, długość, pole, trafienie) są czystymi funkcjami
  w `features/elements/locations/plan/geometry/**`. Nie powstaje osobny pakiet współdzielony,
  dopóki serwer nie potrzebuje tych samych obliczeń.
- Dane rzutu pochodzą z API przez TanStack Query i są parsowane schematem z `@repo/contracts`
  przed trafieniem do renderera. **Rzut na sztywno w kodzie (`test-data.ts`) nie jest kodem
  produkcyjnym** — taki zestaw danych może istnieć wyłącznie jako fikstura testowa.

## Renderowanie (ADR-0006)

- Rysunek rzutu powstaje w **SVG**. Widok 3D (Three.js) jest osobnym, dodatkowym widokiem
  tych samych danych i nie zastępuje SVG — obiekt, którego nie da się ofokusować, nie
  spełnia wymogu obsługi klawiaturą.
- `viewBox` jest w milimetrach: **jedna jednostka SVG = 1 mm**. Przybliżanie zmienia
  `viewBox`, nigdy jednostki danych.
- Kolory i grubości pochodzą z semantycznych tokenów motywu przez CSS. Kolor wpisany
  w atrybut `fill`/`stroke` albo odczytany z JS jest błędem — złamie tryb ciemny.
  Wyjątek dotyczy wyłącznie sceny 3D, która nie renderuje się CSS-em: kolor tokenu
  rasteryzuje się przez canvas 2D, nigdy nie parsuje ręcznie (`oklch()`).
- Obiekt rzutu (ściana, pokój, wierzchołek) ma `role="button"`, `tabindex` i `aria-label`.
  To **jedyny dopuszczalny wyjątek** od reguły „element klikalny to `button` albo `a`"
  z `.claude/rules/web.md`, ważny wyłącznie wewnątrz rysunku rzutu — SVG nie ma `button`.
- Wskaźnik obsługują Pointer Events, jedną ścieżką dla myszy i dotyku. `touch-action: none`
  ustawiamy wyłącznie na powierzchni rysowania, nigdy na całej stronie.
- Obszar trafienia obiektu ma co najmniej 44×44 px, w razie potrzeby poszerzony niewidoczną
  ścieżką — cienka ściana nie jest celem dotykowym.

# ADR-0010: Ściana to blok o czterech jawnych rogach z własną wysokością, bez grubości

- **Status:** Zaakceptowany
- **Data:** 2026-09-09
- **Dotyczy:** baza / kontrakt API / rendering
- **Zastępuje** część [ADR-0002](0002-floor-plan-normalized-entities-in-millimeters.md)
  mówiącą, że ściana jest odcinkiem (`startX/Y`, `endX/Y`) z `thicknessMm`. Reszta ADR-0002
  obowiązuje.

## Kontekst

W gałęzi SP-005 model ściany przebudowano w trakcie pracy — z osi z grubością na blok
o czterech jawnych rogach — i w tej postaci prototyp 2D (SVG) oraz 3D (Three.js) narysował
nieregularne mieszkanie z uskokiem w ścianie zewnętrznej. **Kod i ADR-0002 od tamtej pory
się rozjeżdżają** (`.changelog/SP-005_floor-plan-2d.md`, sekcja „Ryzyka"), a schemat bazy
powstaje właśnie teraz — to ostatni moment, żeby dokument opisywał prawdę.

Siły napędowe:

- **Narożnik musi domykać się z danych, nie z formuły.** Przy osi z grubością koniec ściany
  trzeba wydłużyć o połowę grubości sąsiada; wystarczyła literówka 50 mm we współrzędnej,
  żeby zostawić niewidoczną dziurę w narożniku.
- **Ten sam kształt zasila 2D i 3D** — renderer ma czytać liczby, nie je wyprowadzać.
- Decyzja użytkownika, potwierdzona empirycznie: „ściana nie może być identyfikowana przez
  2 punkty jak linia tylko przez 4 jak blok".
- `.claude/rules/data.md`: geometria nie trafia do kolumny JSON.

Siły **pozorne**: oszczędność miejsca (kilkadziesiąt ścian na poziom), „elastyczność"
kształtu ściany o dowolnej liczbie rogów (ściana zakrzywiona nie występuje w mieszkaniu),
oraz wygoda edytora — narzędzie rysujące i tak liczy prostokąt z osi i grubości po stronie
klienta, zanim wyśle rogi.

## Rozważane warianty

### Wariant A — oś plus grubość (stan z ADR-0002), cztery rogi liczone przy rysowaniu

- **Do czego pasuje:** pięć liczb na ścianę; przesunięcie ściany to przesunięcie dwóch
  punktów, a grubość zmienia się jednym polem.
- **Co kosztuje:** formuła domykania narożników w **każdym** rendererze (2D, 3D, przyszły
  eksport) i jej powtórzenie po stronie serwera, gdy ten zacznie liczyć powierzchnie.
- **Kiedy się zemści:** już się zemściła — w SP-005, na pierwszym nieregularnym mieszkaniu.
  Wynik zależy od tego, czy sąsiednie osie stykają się co do milimetra, więc błąd danych
  objawia się jako subtelna dziura w rysunku, nie jako błąd walidacji.

### Wariant B — cztery jawne rogi w ośmiu kolumnach `Int` (`p1XMm`…`p4YMm`)

- **Do czego pasuje:** to, co widzi renderer, jest tym, co leży w bazie; kształt jest
  rozstrzygnięty w chwili zapisu, a nie przy każdym rysowaniu. Jeden wiersz = jedna ściana.
- **Co kosztuje:** osiem kolumn zamiast pięciu; brak pola „grubość" znaczy, że zmiana
  grubości ściany to przeliczenie czterech rogów po stronie klienta.
- **Kiedy się zemści:** gdy ściana przestanie być czworokątem — łuk, wykusz, ściana
  o zmiennej grubości. Wtedy trzeba przejść na wariant C **z migracją danych**, a nie
  addytywnie.

### Wariant C — wielokąt ściany o N rogach w tabeli `WallVertex` (jak `RoomVertex`)

- **Do czego pasuje:** symetria z pokojem i dowolny kształt bez zmiany schematu.
- **Co kosztuje:** cztery wiersze na każdą ścianę plus kolumna porządkowa; „dokładnie
  cztery rogi" przestaje być wyrażalne w schemacie i staje się regułą w kodzie; każdy zapis
  ściany to usunięcie i wstawienie jej wierzchołków.
- **Kiedy się zemści:** przy pierwszym błędzie danych — ściana o trzech albo pięciu
  wierzchołkach przejdzie przez bazę bez mrugnięcia, a renderer i 3D dostaną kształt,
  którego typ w TypeScripcie (`[Point, Point, Point, Point]`) obiecywał, że nie będzie.

## Decyzja

Wybieramy **wariant B**: ściana to osiem kolumn `Int` (cztery pary `xMm`/`yMm`) plus
`heightMm`, bez pola grubości. Arność „dokładnie cztery rogi" jest wtedy własnością wiersza,
a nie regułą pilnowaną w kodzie, i pokrywa się z typem, na którym już działają oba renderery.
`heightMm` wchodzi jako kolumna, a nie stała globalna, bo ścianka działowa i ściana kolankowa
są realnym przypadkiem, a dziś kolumna kosztuje jeden `Int` z wartością domyślną.

## Konsekwencje

**Dobre:**

- Renderer 2D i 3D czyta rogi wprost; żadna warstwa nie wydłuża, nie domyka i nie zgaduje.
- Zdegenerowaną ścianę widać w danych (rogi się pokrywają), a nie dopiero w rysunku.
- `heightMm` na ścianie usuwa uproszczenie `DEFAULT_WALL_HEIGHT_MM` z kodu prototypu; stała
  zostaje wyłącznie jako wartość domyślna kontraktu dla klienta, który wysokości nie podaje.

**Cena, którą płacimy:**

- Grubość ściany nie jest zapisana. Zmiana grubości narysowanej ściany to przeliczenie
  czterech rogów przez klienta, a serwer nie umie odpowiedzieć „jaka to gruba ściana".
- Przejście na ścianę o innym kształcie niż czworokąt wymaga migracji danych.
- Cztery rogi mogą opisać czworokąt zdegenerowany albo przecinający się — schemat tego nie
  wyklucza (BL-021).

**Co to wymusza w kodzie:**

- `Wall` w `@repo/contracts` ma `points` jako krotkę **dokładnie czterech** punktów
  (`z.tuple`), a nie tablicę → reguła w `.claude/rules/floor-plan.md`.
- Kolumny `p1XMm`…`p4YMm` i `heightMm` na `Wall`; brak kolumny grubości i brak tabeli
  wierzchołków ściany → reguła w `.claude/rules/floor-plan.md`.
- `DEFAULT_WALL_HEIGHT_MM` przenosi się z `apps/web` do `@repo/contracts` jako wartość
  domyślna schematu; nie zostaje drugiej kopii w kodzie frontendu.

## Kiedy wrócić do tej decyzji

Gdy w rzucie pojawi się ściana niebędąca czworokątem (łuk, wykusz), gdy serwer zacznie
liczyć powierzchnie albo kubaturę i zabraknie mu grubości, albo gdy edytor zacznie
potrzebować „przesuń ścianę zachowując grubość" jako operacji serwerowej.

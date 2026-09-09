# ADR-0008: Poziom (piętro) jest korzeniem agregatu rzutu; konto ma wiele lokalizacji

- **Status:** Zaakceptowany
- **Data:** 2026-09-09
- **Dotyczy:** baza / kontrakt API / trasy frontendu
- **Zastępuje** część [ADR-0002](0002-floor-plan-normalized-entities-in-millimeters.md)
  mówiącą, że korzeniem agregatu jest `FloorPlan` z unikalnym `accountId`. Reszta ADR-0002
  (znormalizowane encje, milimetry całkowite, pokój jako samodzielny wielokąt) **obowiązuje**.

## Kontekst

Użytkownik chce zakładać własne modele mieszkań: konto ma wiele **Lokalizacji**
(mieszkanie, dom, biuro), lokalizacja ma wiele **Poziomów** (pięter) z jawnym porządkiem,
a każdy poziom ma własny rzut — ściany i pokoje z ADR-0002. To dokładnie sygnał zapisany
w ADR-0002 („kiedy wrócić do tej decyzji": druga kondygnacja albo drugi rzut na koncie)
oraz treść BL-014.

Siły napędowe:

- **Porządek pięter musi mieć naturalny zakres.** „Piętro 1" ma sens wewnątrz jednego
  budynku, nie w płaskiej liście wszystkich rzutów konta.
- **Rzut nadal czyta się i zapisuje w całości** (ADR-0002) — zmienia się tylko to, czyj
  jest, a nie jak wygląda.
- `.claude/rules/data.md`: łańcuch właścicielstwa musi być jawny i nieprzerwany, kaskada
  usunięcia zdefiniowana w schemacie.
- `.claude/rules/api.md`: identyfikator właściciela pochodzi wyłącznie z sesji.

Siły **pozorne**: skala (jedno konto, kilka lokalizacji, ≤20 poziomów — koszt zapytań bez
znaczenia), współbieżna edycja wielu osób, przenoszenie poziomu między lokalizacjami
(nie zgłoszone i nieprawdopodobne — piętro nie zmienia budynku), oraz „elastyczna
hierarchia" o dowolnej głębokości: budynek ma piętra i na tym się kończy.

## Rozważane warianty

### Wariant A — bez encji `Location`: konto → wiele poziomów, „lokalizacja" jako pole tekstowe

- **Do czego pasuje:** najprostszy możliwy krok od dzisiejszego stanu — zdjęcie `@unique`
  z `accountId`, dołożenie `name` i `order`. Jedna nowa kolumna, zero nowych tabel.
- **Co kosztuje:** nic w schemacie; wszystko w interfejsie — grupowanie po tekście.
- **Kiedy się zemści:** natychmiast, przy `order`. Porządek liczony globalnie dla konta
  miesza piętra dwóch budynków w jednej liście, a nazwa lokalizacji wpisywana przy każdym
  poziomie rozjeżdża się po pierwszej literówce („Mieszkanie" / „mieszkanie"). Zmiana nazwy
  budynku staje się aktualizacją N wierszy bez transakcyjnego bytu, którego dotyczy.

### Wariant B — `Location` → `Level` → `FloorPlan` (1:1 z poziomem) → `Wall`/`Room`

- **Do czego pasuje:** zachowuje dzisiejszą tabelę `FloorPlan` bez ruszania jej roli;
  poziom mógłby kiedyś mieć więcej niż jeden rzut (wariant „przed / po remoncie").
- **Co kosztuje:** tabela, która poza `version` nie ma własnych danych, i jeden join więcej
  w każdym zapytaniu o geometrię — przy łańcuchu właścicielstwa liczącym już trzy ogniwa.
- **Kiedy się zemści:** przy pierwszym pytaniu „czy poziom bez rzutu to poziom, czy błąd" —
  dwa byty 1:1 dają dwa stany pustki (poziom bez `FloorPlan` i `FloorPlan` bez ścian),
  które trzeba obsłużyć osobno w każdym endpointcie i w każdym widoku.

### Wariant C — `Location` → `Level` jako korzeń agregatu, `FloorPlan` znika

- **Do czego pasuje:** poziom **jest** rzutem — ma `version`, a `Wall`/`Room` wskazują na
  `levelId`. Jeden byt, jeden stan pustki, jeden wiersz do zablokowania przy zapisie.
- **Co kosztuje:** migracja usuwa `FloorPlan` (dziś tabela nie istnieje w bazie — schemat
  z ADR-0002 nigdy nie został zaimplementowany, więc koszt jest zerowy).
- **Kiedy się zemści:** gdy poziom naprawdę będzie potrzebował dwóch wariantów rzutu
  (przed/po remoncie, plan piętra vs. plan instalacji). Wtedy trzeba wydzielić z `Level`
  to, co dziś jest w nim scalone — czyli wykonać wariant B jako migrację.

## Decyzja

Wybieramy **wariant C**: `Account` → `Location` → `Level`, a `Level` jest korzeniem agregatu
rzutu i nosi `version`. `Location` jest osobnym bytem, bo bez niego `order` pięter nie ma
sensownego zakresu, a nazwa budynku byłaby powtarzana przy każdym poziomie. Osobnej tabeli
`FloorPlan` nie zakładamy, bo miałaby jedną kolumnę własną i mnożyłaby stany pustki —
wariantów rzutu na jednym poziomie nikt dziś nie potrzebuje (BL-018 pilnuje sygnału).

## Konsekwencje

**Dobre:**

- Pusty poziom jest stanem poprawnym i jedynym: `GET .../plan` zwraca `version` z wiersza
  poziomu i puste listy, nigdy 404 (ciągłość z ADR-0002).
- Usunięcie lokalizacji kaskadowo usuwa poziomy, ściany, pokoje i wierzchołki — jedną
  regułą w schemacie, bez sprzątania w kodzie.
- `version` na poziomie chroni rzut dokładnie tak jak wcześniej na `FloorPlan`: niezgodna
  wersja to `409`, nigdy ciche nadpisanie z drugiego urządzenia.

**Cena, którą płacimy:**

- Łańcuch właścicielstwa ma trzy ogniwa (`Wall` → `Level` → `Location` → `Account`), więc
  każde zapytanie o geometrię ma zagnieżdżony warunek. Pominięcie ogniwa to błąd
  bezpieczeństwa, którego typy nie wyłapią.
- Rzut przestaje być zasobem singleton — adres API i adres strony niosą dwa identyfikatory,
  co jest pierwszym takim przypadkiem w projekcie.

**Co to wymusza w kodzie:**

- Kolumną właściciela dla `Wall`, `Room` i `RoomVertex` jest **`levelId`**; `accountId`
  występuje wyłącznie na `Location` → reguła w `.claude/rules/locations.md`.
- Rzut adresuje się `/api/locations/:locationId/levels/:levelId/plan`; `locationId` jest
  w ścieżce mimo unikalności `levelId`, żeby ogniwo łańcucha było widoczne i wymuszone
  → reguła w `.claude/rules/locations.md`.
- `order` nadaje serwer (kolejny po największym w lokalizacji); usunięcie środkowego poziomu
  zostawia dziurę, bo `order` jest kluczem sortowania, nie numerem pokazywanym użytkownikowi
  → reguła w `.claude/rules/locations.md`.
- Element pulpitu `floor-plan` znika z rejestru na rzecz `locations`; trasa `/floor-plan`
  i dane w `test-data.ts` przestają istnieć jako kod produkcyjny.

## Kiedy wrócić do tej decyzji

Gdy poziom będzie potrzebował dwóch wariantów tego samego rzutu (przed/po remoncie, plan
instalacji), gdy pojawi się drugie konto i łańcuch trzech ogniw zacznie być realnie mylony,
albo gdy poziomy trzeba będzie przenosić między lokalizacjami.

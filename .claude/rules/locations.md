# Reguły: Lokalizacje i Poziomy

Wynikają z [ADR-0008](../../docs/adr/0008-level-as-floor-plan-aggregate-root.md).
Uzupełniają `.claude/rules/data.md`, `api.md` i `web.md` — nie zastępują ich.
Geometrię samego rzutu opisuje `.claude/rules/floor-plan.md`.

## Hierarchia

```
Account → Location → Level → (Wall, Room → RoomVertex)
```

`Level` **jest** rzutem: nosi `version` i jest korzeniem agregatu. Tabela `FloorPlan`
nie istnieje i jej wprowadzenie wymaga nowego ADR-a.

## Łańcuch właścicielstwa — nie wolno pominąć żadnego ogniwa

- Kolumna właściciela: `Location.accountId`, `Level.locationId`, `Wall.levelId`,
  `Room.levelId`, `RoomVertex.roomId`. Wszystkie `NOT NULL`, wszystkie z kaskadą
  `onDelete: Cascade` zapisaną wprost w schemacie.
- **`accountId` występuje wyłącznie na `Location`.** Zdenormalizowana kopia `accountId`
  na `Level`, `Wall` albo `Room` jest błędem — dwa źródła prawdy o właścicielu rozjadą się.
- **Nie istnieje `findUnique({ where: { id } })` dla `Level`, `Wall`, `Room` ani
  `RoomVertex`.** Każde zapytanie przechodzi cały łańcuch aż do `accountId` z sesji, np.
  `level.findFirst({ where: { id: levelId, locationId, location: { accountId } } })`.
  Zapytanie pomijające ogniwo jest błędem bezpieczeństwa, nawet gdy zwraca poprawny wynik.
- Zasób nieistniejący i zasób cudzy odpowiadają **tak samo**: `404 NOT_FOUND`, nigdy `403`.

## Porządek poziomów

- `order` to `Int` nadawany **przez serwer** przy tworzeniu: `max(order) + 1` w obrębie
  lokalizacji, pierwszy poziom dostaje `0`. Klient nie przysyła `order` — pole nie występuje
  w schemacie wejścia.
- Usunięcie poziomu ze środka **zostawia dziurę** i nie przenumerowuje pozostałych.
  `order` jest kluczem sortowania, nie numerem pokazywanym użytkownikowi — etykietę
  („Poziom 2") wylicza interfejs z pozycji na posortowanej liście.
- **Brak `@@unique([locationId, order])`** — świadomie. Przyszła zmiana kolejności (BL-017)
  przepisuje wiele wierszy w jednej transakcji, a nieodroczalne ograniczenie unikalności
  wywróciłoby ją w połowie.
- Kolejność jest deterministyczna zawsze: `orderBy: [{ order: "asc" }, { id: "asc" }]`.
  Samo `order` nie wystarcza, bo dziury i duplikaty są dopuszczalne.
- Endpoint zmiany kolejności **nie istnieje w tej gałęzi** (BL-017).

## API

Wszystkie endpointy są za `requireSession`; `accountId` pochodzi wyłącznie z sesji.

```
GET    /api/locations                                   lista, stronicowana
POST   /api/locations                                   201
GET    /api/locations/:locationId                       szczegóły + poziomy
PATCH  /api/locations/:locationId                       nazwa
DELETE /api/locations/:locationId                       204, kaskada
POST   /api/locations/:locationId/levels                201
PATCH  /api/locations/:locationId/levels/:levelId       nazwa
DELETE /api/locations/:locationId/levels/:levelId       204, kaskada
GET    /api/locations/:locationId/levels/:levelId/plan  rzut poziomu
PUT    /api/locations/:locationId/levels/:levelId/plan  zapis rzutu
```

- **`locationId` jest w ścieżce, mimo że `levelId` jest unikalny.** Adres ma pokazywać
  łańcuch własności i wymuszać jego przejście w zapytaniu. Trasa `/api/levels/:levelId`
  jest błędem, choćby działała.
- **Lista lokalizacji jest stronicowana** wspólną konwencją (`.claude/rules/api.md`).
- **Poziomy nie mają własnego endpointu listy** — przyjeżdżają w całości w szczegółach
  lokalizacji, bez geometrii (`id`, `name`, `order`). To świadomy wyjątek od reguły
  stronicowania: poziomy są częścią agregatu lokalizacji, twardy limit z kontraktu ogranicza
  ich liczbę, a przełącznik poziomów potrzebuje ich wszystkich naraz — strona 1 z 3 pięter
  nie jest użytecznym stanem interfejsu.
- Limity (liczba lokalizacji, poziomów, długość nazw) żyją w `@repo/contracts` i są
  egzekwowane po stronie serwera.

## Moduł `apps/api/src/modules/locations/**`

- **Co wie:** o lokalizacjach, poziomach i geometrii rzutu; o `accountId`, który dostaje
  jako argument.
- **Czego wiedzieć nie wolno:** jak powstaje sesja i jak wygląda ciasteczko (jedynym wejściem
  jest `requireSession`), czym jest Google i `connections`, jak wygląda interfejs.
  Warstwa `service` nie zna `req`/`res` (`.claude/rules/api.md`).
- **Przez co się rozmawia:** router montowany pod `/api/locations` oraz schematy
  z `@repo/contracts`. Żaden inny moduł nie importuje repozytoriów tego modułu.

## Frontend

- Element mieszka w `apps/web/features/elements/locations/**` i jest **jedynym** elementem
  pulpitu obsługującym rzuty. Renderer rzutu (2D/3D, geometria) mieszka **wewnątrz** tego
  elementu (`features/elements/locations/plan/**`) — nie w osobnym elemencie, bo import
  między elementami jest zakazany (`.claude/rules/web.md`).
- Trasy: `/locations`, `/locations/[locationId]`, `/locations/[locationId]/levels/[levelId]`.
  Bez segmentu `/plan` na końcu — strona poziomu **jest** rzutem.
- Rejestr elementów zna wyłącznie **wejście** (`/locations`). Adresy wewnętrzne elementu
  powstają w jednym module (`features/elements/locations/lib/routes.ts`) i nigdzie indziej;
  test wiąże go z rejestrem (`ELEMENT_REGISTRY.locations.path === LOCATION_ROUTES.list`).
- Hooki i klucze zapytań w `features/elements/locations/api/**` (`.claude/rules/web.md`).
  `staleTime` deklarowany świadomie: dane zmienia wyłącznie ten sam klient, więc krótkie
  odświeżanie w tle jest darmowym ruchem — mutacja unieważnia klucz.
- **Usunięcie lokalizacji i poziomu wymaga potwierdzenia w interfejsie** — kasuje rzut wraz
  z całą geometrią i nie ma cofnięcia.

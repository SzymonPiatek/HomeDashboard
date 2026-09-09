# Wykaz zmian: SP-007_locations-and-levels

- **Gałąź:** `SP-007_locations-and-levels`
- **Rozpoczęto:** 2026-09-09
- **Status:** w toku

## Po co ta zmiana

SP-005 udowodniło technicznie, że rzut mieszkania (ściany + pokoje) da się rysować w 2D
i wyciągać z tych samych danych bryłę 3D — ale wyłącznie na sztywno wpisanych danych
testowych, bez zapisu. Ta gałąź wprowadza prawdziwy model danych i zapis do bazy:
właściciel będzie mógł założyć własną **Lokalizację** (np. mieszkanie), a w niej dowolną
liczbę **Poziomów** (pięter), z których każdy ma własny rzut zbudowany z tych samych
ścian i pokoi co w SP-005. Na pulpicie pojawia się kafelek "Lokalizacje" prowadzący do
strony zarządzania lokalizacjami.

## Co się zmieniło

Prowadzone na bieżąco.

| Data       | Obszar       | Zmiana                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-09 | architektura | ADR-0008 — `Account → Location → Level`, poziom jako korzeń agregatu rzutu (częściowo zastępuje ADR-0002)                                                                                                                                                                                                                                                                                     |
| 2026-09-09 | architektura | ADR-0010 — ściana jako blok o czterech jawnych rogach z `heightMm`, bez grubości (częściowo zastępuje ADR-0002)                                                                                                                                                                                                                                                                               |
| 2026-09-09 | reguły       | Nowy plik `.claude/rules/locations.md`; `.claude/rules/floor-plan.md` przepisany pod `levelId` i prawdziwy model ściany                                                                                                                                                                                                                                                                       |
| 2026-09-09 | reguły       | `.claude/rules/api.md` — konkretny kształt konwencji stronicowania (`limit`/`cursor` → `items`/`nextCursor`)                                                                                                                                                                                                                                                                                  |
| 2026-09-09 | baza         | Schemat `apps/api/prisma/schema/location.prisma` (`Location`, `Level`) i `floor-plan.prisma` (`Wall`, `Room`, `RoomVertex`); relacja zwrotna `Account.locations`                                                                                                                                                                                                                              |
| 2026-09-09 | baza         | Migracja `add_locations_levels_floor_plan` — tworzy `locations`, `levels`, `walls`, `rooms`, `room_vertices` z kaskadą i indeksami po kolumnach właściciela                                                                                                                                                                                                                                   |
| 2026-09-09 | baza         | Seed (`apps/api/prisma/seed.ts`, `pnpm --filter @repo/api db:seed`) — lokalizacja „Mieszkanie” / poziom „Parter” z rzutem z SP-005 dla `OWNER_EMAIL`, idempotentny                                                                                                                                                                                                                            |
| 2026-09-09 | testy        | `apps/api/prisma/floor-plan-ownership.test.ts` przeciwko prawdziwej bazie w Dockerze: zawężenie po właścicielu (drugie konto), kaskada usunięcia, unikalność `[roomId, position]`                                                                                                                                                                                                             |
| 2026-09-09 | kontrakt     | `@repo/contracts`: `pagination.ts` (`limit`/`cursor` → `items`/`nextCursor`, `DEFAULT_PAGE_SIZE=10`, `MAX_PAGE_SIZE=50`), `locations.ts`, `floor-plan.ts` (limity, `DEFAULT_WALL_HEIGHT_MM` przeniesione z `apps/web`)                                                                                                                                                                        |
| 2026-09-09 | api          | `apps/api/src/modules/locations/**` — route → service → repository dla lokalizacji, poziomów i rzutu; montowane pod `/api/locations` za `requireSession` w `app.ts`                                                                                                                                                                                                                           |
| 2026-09-09 | testy        | `locations.repository.test.ts` (prawdziwa baza, drugie konto — repozytoria backend-dev, nie tylko schemat) i `locations.route.test.ts` (supertest, atrapy) — izolacja między kontami przez pełne HTTP, walidacja, konflikt wersji                                                                                                                                                             |
| 2026-09-09 | web          | Usunięto `/floor-plan`, `FloorPlanPageView` i klucz `floor-plan` w rejestrze elementów; renderer (`FloorPlanView2D`/`3D`, `FloorPlanViewer`, `geometry.ts`, `three/scene.ts`) przeniesiony do `features/elements/locations/plan/**`, typy `Point`/`Wall`/`Room`/`FloorPlanDocument`/`DEFAULT_WALL_HEIGHT_MM` teraz z `@repo/contracts/floor-plan` zamiast lokalnego `types.ts`                |
| 2026-09-09 | web          | Nowy element `locations` w rejestrze (`ELEMENT_REGISTRY.locations`, etykieta „Lokalizacje", `path: "/locations"`) i trzy trasy: `/locations`, `/locations/[locationId]`, `/locations/[locationId]/levels/[levelId]` (strona poziomu = rzut, bez segmentu `/plan`)                                                                                                                             |
| 2026-09-09 | web          | `features/elements/locations/lib/routes.ts` (`LOCATION_ROUTES`) jako jedyne miejsce budowy adresów wewnętrznych elementu; `api/**` — hooki TanStack Query (`use-locations`, `use-location`, `use-floor-plan`) z kluczami z `api/query-keys.ts`, stronicowanie listy kursorem (`limit`/`cursor` → `items`/`nextCursor`) zgodnie z `@repo/contracts/pagination`                                 |
| 2026-09-09 | web          | Widoki stron (`LocationsListPageView`, `LocationDetailPageView`, `LevelPlanPageView`) — cztery stany (ładowanie/błąd/pusto/dane), dodawanie/zmiana nazwy/usunięcie lokalizacji i poziomu z potwierdzeniem (`ConfirmDeleteButton`, dwuetapowy przycisk zamiast modalu); nowy prymityw `components/ui/input.tsx`                                                                                |
| 2026-09-09 | testy        | Vitest: `lib/routes.test.ts` (spójność rejestru z `LOCATION_ROUTES`), testy widoków stron (mockowane hooki API, wzorem `app/page.test.tsx`), `ConfirmDeleteButton.test.tsx`, `plan/geometry/geometry.test.ts` i `plan/FloorPlanView2D.test.tsx` na małych fiksturach lokalnych (dawny `test-data.ts` nie wszedł do produkcji ani do fikstur — zastąpiony minimalnymi danymi inline w testach) |

## Decyzje podjęte po drodze

- **`FloorPlan` jako osobna tabela nie powstaje** — poziom _jest_ rzutem i nosi `version`
  ([ADR-0008](../docs/adr/0008-level-as-floor-plan-aggregate-root.md)). Tabela 1:1 bez
  własnych danych dawałaby dwa stany pustki do obsłużenia w każdym widoku i endpointcie.
- **Ściana to osiem kolumn `Int` (`p1XMm`…`p4YMm`), nie tabela wierzchołków**
  ([ADR-0010](../docs/adr/0010-wall-as-four-corner-block.md)). Arność „dokładnie cztery rogi"
  jest wtedy własnością wiersza, a nie regułą pilnowaną w kodzie. `Room` zostaje przy
  `RoomVertex`, bo tam liczba wierzchołków jest zmienna z natury.
- **`heightMm` wchodzi jako kolumna ściany**, a `DEFAULT_WALL_HEIGHT_MM` (2500) przenosi się
  z `apps/web` do `@repo/contracts` jako wartość domyślna schematu. Ścianka kolankowa jest
  realnym przypadkiem, a kolumna kosztuje dziś jeden `Int`.
- **`order` nadaje serwer** (`max + 1`, pierwszy poziom `0`); usunięcie środkowego poziomu
  zostawia dziurę i nie przenumerowuje reszty. Brak `@@unique([locationId, order])` jest
  świadomy — przyszła zmiana kolejności (BL-017) przepisuje wiele wierszy w jednej transakcji.
  Kolejność zawsze `orderBy: [{ order: asc }, { id: asc }]`.
- **Poziomy nie mają endpointu listy** — jadą w całości w `GET /api/locations/:id`, bez
  geometrii. Świadomy wyjątek od stronicowania: przełącznik pięter potrzebuje wszystkich naraz.
- **Zakres CRUD:** lokalizacja i poziom mają tworzenie, zmianę nazwy i usunięcie. Bez zmiany
  nazwy jedyną drogą naprawienia literówki byłoby usunięcie bytu razem z rzutem; to droższe
  niż cztery trywialne endpointy.
- **`/floor-plan` znika w tej gałęzi** razem z `FloorPlanPageView` i kluczem `floor-plan`
  w rejestrze elementów; `test-data.ts` przenosi się do fikstur testowych. Zostawienie drugiej
  trasy prowadzącej do mieszkania na sztywno oznaczałoby dwa wejścia, z których jedno kłamie.
- **Renderer rzutu przenosi się do `features/elements/locations/plan/**`**, a nie zostaje
  osobnym elementem — import między elementami jest zakazany (`.claude/rules/web.md`), a
  wspólna warstwa dla jednego konsumenta byłaby warstwą na zapas.
- **Kafelki pulpitu są nawigacyjne** (etykieta + adres z rejestru). Pola `Tile` w rejestrze
  nie dokładamy, dopóki nie ma pierwszego kafelka z danymi (BL-019).
- **Numery ADR:** 0008 i 0010 — pierwsze wolne numery, których nie zajmuje odwołanie
  z żadnej reguły (0009 zajmuje odwołanie o adresach tras). Pula „fałszywych" numerów
  z BL-010 pozostaje nietknięta.
- **Limity kontraktu** (`@repo/contracts`, egzekwowane serwerowo): 50 lokalizacji na konto,
  20 poziomów na lokalizację, nazwa 1–60 znaków, 200 ścian i 50 pokoi na poziom, 3–32
  wierzchołki na pokój, współrzędne −100 000…100 000 mm, `heightMm` 100…10 000 mm,
  strona listy: domyślnie 10, maksymalnie 50.
- **`RoomVertex.roomId` ma `@db.Uuid`**, nie zwykły `text` — Postgres odrzucił pierwszą
  wersję migracji, bo klucz obcy do `Room.id` (uuid) wymaga zgodnego typu kolumny po obu
  stronach. Wyłapane przy `prisma migrate dev`, poprawione przed zaaplikowaniem.
- **`apps/api` „test" ładuje teraz `envs/shared.env` + `envs/api.env`** (jak `dev`/`db:migrate`),
  bo test własnościowy (`prisma/floor-plan-ownership.test.ts`) łączy się z prawdziwą bazą
  z `docker compose up -d`. Pozostałe testy tego nie potrzebują, ale ładowanie jest no-opem,
  gdy `DATABASE_URL` już jest ustawione (np. w CI).
- **Seed jest jednorazowy i idempotentny** — sprawdza, czy konto właściciela ma już lokalizację
  „Mieszkanie", zanim ją założy; ponowne uruchomienie nie dubluje danych. Nie jest wpięty
  w żadną automatykę wdrożeniową (patrz „Wymaga decyzji" u data-engineera).
- **Odpowiedź `PATCH /api/locations/:locationId` to `LocationSummary`** (jak `POST`/lista),
  nie `LocationDetail` z poziomami — kontrakt tego nie rozstrzygał wprost. Endpoint zmienia
  wyłącznie nazwę; pełne szczegóły z poziomami niesie tylko `GET .../:locationId`.
- **`requireSession` dla `/api/locations` jest zbudowany raz w `app.ts`**, tak samo jak
  wcześniej dla `/logout`, zamiast wchodzić do modułu `locations` — moduł ten nie ma wiedzieć,
  czym jest sesja (`.claude/rules/locations.md`, sekcja „czego wiedzieć nie wolno").
- **Zapis wierzchołków pokoju to zawsze `deleteMany` + `createMany`**, nie `upsert` jak przy
  ścianach/pokojach — reguła o zachowaniu przyszłych kluczy obcych dotyczy jawnie tylko
  ścian i pokoi; `RoomVertex` nie ma dziś (i nie zapowiada się, żeby miał) własnych referencji.

## Świadomie pominięte

- **Edytor rzutu — rysowanie i edycja ścian oraz pokoi przez użytkownika (BL-020).** To ta
  gałąź udostępnia `PUT .../plan`, ale nikt go z interfejsu nie woła; poziomy wypełnia
  wyłącznie seed. Bez tego US-3 z PRD nadal jest niezrobione.
- Zmiana kolejności poziomów, endpoint i interfejs — BL-017.
- Elewacja poziomu i widok 3D wielu kondygnacji naraz — BL-018.
- Kafelek pulpitu pokazujący dane elementu (`Tile` w rejestrze) — BL-019.
- Serwerowa walidacja, że cztery rogi ściany tworzą sensowny czworokąt — BL-021
  (bliźniaczy problem dla pokoju: BL-013).
- Przenoszenie poziomu między lokalizacjami i kopiowanie rzutu na inny poziom — nie zgłoszone.

## Wpływ na wdrożenie

- **Migracja bazy:** tak — pierwsza migracja tworząca `locations`, `levels`, `walls`,
  `rooms`, `room_vertices`. **Nie jest destrukcyjna:** żadna z tych tabel dziś nie istnieje
  (schemat z ADR-0002 nigdy nie trafił do bazy), więc nie ma danych do przeniesienia ani
  do utraty. Plan wycofania: poprzedni obraz aplikacji nie zna nowych tabel i działa z nimi
  bez zmian — wycofanie nie wymaga cofania migracji.
- **Nowe zmienne środowiskowe:** nie.
- **Przebudowanie obrazu:** tak — zmiana kodu w `apps/web` i `apps/api`; bez zmian
  w `NEXT_PUBLIC_*`.
- **Przerwa w działaniu:** nie.

## Jak to sprawdzić

1. `docker compose up -d`, migracja, seed — powstaje lokalizacja „Mieszkanie" z jednym
   poziomem zawierającym rzut z SP-005.
2. `pnpm dev`, zalogować się kontem z białej listy. Na pulpicie widoczny kafelek
   „Lokalizacje" prowadzący na `/locations`.
3. Dodać lokalizację, wejść w nią, dodać dwa poziomy — kolejność zgodna z kolejnością
   dodawania, etykieta numeru z pozycji na liście.
4. Wejść na poziom z seedu — widoczny rzut 2D i 3D z danych z bazy, nie z `test-data.ts`.
5. Wejść na nowo dodany poziom — pusty rzut, stan pusty, nie błąd i nie 404.
6. Usunąć poziom i lokalizację — po potwierdzeniu; rzut znika razem z nimi.
7. `pnpm exec turbo run build typecheck lint test` oraz `pnpm exec prettier --check .`.

## Ryzyka

- **Łańcuch własności ma trzy ogniwa** (`Wall → Level → Location → Account`). Pominięcie
  ogniwa w zapytaniu nie jest błędem typów i przy jednym koncie nie objawi się w testach
  ręcznych — dlatego test integracyjny z drugim kontem jest tu obowiązkowy.
- **Rzut bez edytora (BL-020)** — jeśli seed nie wejdzie, cała gałąź wygląda na pustą:
  poziomy będą, rzutów nie będzie czym wypełnić.
- Usunięcie lokalizacji kasuje kaskadowo całą geometrię i nie ma cofnięcia; brak
  potwierdzenia w interfejsie zamieniłby jedno kliknięcie w utratę pracy.

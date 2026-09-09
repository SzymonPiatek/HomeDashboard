# Wykaz zmian: SP-002_bootstrap-google-login

- **Gałąź:** `SP-002_bootstrap-google-login`
- **Rozpoczęto:** 2026-09-09
- **Status:** w toku

## Po co ta zmiana

Pierwsza linia kodu produktowego: szkielet monorepo (apps/web, apps/api,
packages/contracts, packages/config) oraz logowanie kontem Google jako jedyny
mechanizm uwierzytelniania w MVP, zastępujące hasło+2FA e-mail ustalone
pierwotnie w PRD.

## Co się zmieniło

| Data | Obszar | Zmiana |
|---|---|---|
| 2026-09-09 | discovery | Decyzja: logowanie Google zastępuje hasło+2FA e-mail (US-1 zaktualizowane w PRD) |
| 2026-09-09 | ops | `envs/` (shared/api/web/db `.env.example` + `README.md`), `docker-compose.yml` (dev, wyłącznie baza Postgres), `.gitignore` rozszerzony o `envs/*.env` i artefakty budowania |
| 2026-09-09 | dane | `apps/api/prisma/schema/{schema,account,session}.prisma` — modele `Account` i `Session` (ADR-0001, ADR-0003); pierwsza migracja `init_account_session`; `prisma.config.ts` uzupełniony o `datasource.url`/`migrations.path` (Prisma 7); `@prisma/client` + `@prisma/adapter-pg` dodane do `apps/api`; `onlyBuiltDependencies` w `pnpm-workspace.yaml` (engine Prismy) |

## Decyzje podjęte po drodze

- Logowanie wyłącznie kontem Google (bez hasła, bez 2FA e-mail) — właściciel uznał
  to za prostsze niż budowanie własnej infrastruktury haseł i wysyłki e-mail w MVP.
  Google zapewnia silne uwierzytelnienie za nas. Ścieżka hasłowa pozostaje możliwa
  do dodania później (model tożsamości w `.claude/rules/api.md` już ją przewiduje),
  ale nie wchodzi w zakres tej gałęzi.

- `GOOGLE_REDIRECT_URI` w dev wskazuje port `apps/web` (3000), nie `apps/api`
  (4000): web przekierowuje `/api/*` do api przez `rewrites` w dev
  (`.claude/rules/web.md`), więc przeglądarka widzi jeden origin i ciasteczko
  sesji `HttpOnly` zachowuje się tak samo jak za reverse proxy na produkcji.
  Uzasadnienie pełne w `envs/README.md`.
- `DATABASE_URL` w `envs/api.env.example` powtarza ręcznie dane logowania
  z `envs/db.env.example` (użytkownik/hasło/nazwa bazy) zamiast je składać —
  `apps/api` działa w dev na hoście, poza Compose, więc nie ma sekcji
  `environment:`, w której dałoby się to interpolować. Świadomie odnotowane
  w `envs/README.md`, zgodnie z pułapką opisaną w `.claude/rules/ops.md`.
- Port hosta bazy w dev to `5433` (nie `5432`), nadpisywalny zmienną powłoki
  `DB_HOST_PORT` (`${DB_HOST_PORT:-5433}` w `docker-compose.yml`) — bez pliku
  root `.env`, bo na tym etapie nikt inny tej wartości nie potrzebuje.
- Id encji: `cuid()` (konwencja Prismy w tym repo, brak wcześniejszego precedensu
  do naśladowania — pierwsza decyzja tego typu w projekcie).
- Daty w UTC ze strefą czasową: wszystkie `DateTime` mają `@db.Timestamptz(3)`
  (`.claude/rules/data.md`) — domyślny typ Prismy dla Postgresa (`timestamp(3)`,
  bez strefy) nie spełniał tego wymogu, poprawione przed jakimkolwiek użyciem.
- Prisma 7 nie czyta już `url` z `datasource` w `schema.prisma` — adres bazy
  i katalog migracji żyją w `prisma.config.ts` (`datasource.url`,
  `migrations.path`), migracje są w `apps/api/prisma/migrations/`, osobno od
  plików domeny w `apps/api/prisma/schema/`.
- Prisma 7 wymaga jawnego driver adapter (`@prisma/adapter-pg`) przy tworzeniu
  `PrismaClient` — `new PrismaClient()` bez adaptera rzuca błąd inicjalizacji.
  Dodane jako zależność `apps/api`, `backend-dev` musi go użyć w warstwie
  repozytorium: `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`.

## Świadomie pominięte

- `docker-compose.prod.yml`, obrazy wieloetapowe, konfiguracja CI — poza
  zakresem tej części zmiany, zaplanowane jako osobne zadania po tym, jak
  powstanie realny kod aplikacji do zapakowania.
- Zmienna `NEXT_PUBLIC_*`/cel `rewrites` dla `apps/web` — nie istnieje jeszcze
  `next.config.ts`; `envs/web.env.example` zostaje świadomie prawie pusty,
  z komentarzem kto i kiedy dopisze pierwszą zmienną.

## Wpływ na wdrożenie

- **Migracja bazy:** tak — `init_account_session` (Account, Session), pierwsza
  migracja projektu. Zaaplikowana i zweryfikowana przeciwko lokalnej bazie dev
  (pusta baza, zero danych do utraty — brak ryzyka).
- **Nowe zmienne środowiskowe:** tak — `DATABASE_URL`, `PORT`, `GOOGLE_CLIENT_ID`,
  `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `OWNER_EMAIL`,
  `SESSION_COOKIE_SECRET` w `envs/api.env.example`; `POSTGRES_USER`,
  `POSTGRES_PASSWORD`, `POSTGRES_DB` w `envs/db.env.example`. Szczegóły i powód
  każdej w `envs/README.md`.
- **Przebudowanie obrazu:** nie dotyczy jeszcze (brak obrazu produkcyjnego na tym etapie)
- **Przerwa w działaniu:** nie dotyczy (pierwsze wdrożenie)

## Jak to sprawdzić

Infrastruktura dev (baza):

```bash
cp envs/shared.env.example envs/shared.env
cp envs/db.env.example envs/db.env
docker compose up -d
docker compose ps                         # STATUS: Up (healthy)
docker exec homedashboard-db-1 psql -U homedashboard -d homedashboard -c "select 1;"
docker compose down                        # bez -v — wolumen zostaje
```

Weryfikowane ręcznie 2026-09-09: `docker compose up -d` startuje `postgres:16.4`
na porcie hosta `5433`, healthcheck (`pg_isready`) przechodzi na `healthy` w
ok. 10 s, `DATABASE_URL` złożony z `envs/api.env.example` (z podstawionymi
wartościami z `envs/db.env.example`) faktycznie łączy się z bazą z hosta i
z kontenera. Nadpisanie portu przez `DB_HOST_PORT=5555 docker compose up -d`
działa (kontener publikuje `5555`). `docker compose down` (bez `-v`) zostawia
nazwany wolumen `homedashboard_db-data`. Pozostała część ścieżki logowania
(apps/api, apps/web, przepływ OAuth) sprawdzana osobno przez `backend-dev`/
`frontend-dev`/`qa-engineer`.

Schemat i migracja (data-engineer), 2026-09-09:

```bash
docker compose up -d
cd apps/api
pnpm run db:migrate    # prisma migrate dev, wg schematu w prisma/schema
pnpm run db:generate   # generuje @prisma/client
```

Zweryfikowane ręcznie: `migrate status` → `Database schema is up to date!`;
smoke test przez `PrismaClient` z `PrismaPg` — utworzenie `Account` + `Session`,
usunięcie `Account` kasuje kaskadowo `Session` (`onDelete: Cascade`), unikalność
`googleSub`/`tokenHash` wymuszona przez bazę. Baza po teście pusta (0 wierszy
w obu tabelach).

## Ryzyka

- Lokalny `envs/api.env` (poza gitem, u autora tej gałęzi) miał hasło do bazy
  niezgodne z `envs/db.env` (stary wolumen `homedashboard_db-data` z inną
  wartością `POSTGRES_PASSWORD` sprzed tej gałęzi) — naprawione lokalnie przez
  `ALTER ROLE ... WITH PASSWORD` (bez utraty danych, wolumen nietknięty).
  Każdy, kto dostanie ten sam błąd `P1000` lokalnie, ma ten sam objaw.
- Ten sam `envs/api.env` nie ma dziś `SESSION_TTL_KIOSK_DAYS`,
  `SESSION_TTL_STANDARD_DAYS`, `COOKIE_SECURE` (są w `envs/api.env.example`),
  a ma zmienną `SESSION_COOKIE_SECRET`, której wg ADR-0003 nie powinno być w
  konfiguracji. To plik lokalny, poza zakresem tej zmiany — do poprawienia przez
  tego, kto go trzyma, zanim `backend-dev` doda walidację env zodem.

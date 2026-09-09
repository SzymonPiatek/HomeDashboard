# Konfiguracja środowiskowa

Jeden plik `.env` na serwis, `shared.env` na wartości używane przez więcej niż jeden
serwis. Zasady ogólne w `.claude/rules/ops.md` — tu tylko konkrety tego repo.

Do repozytorium trafiają wyłącznie pliki `*.env.example`. Realne `*.env` są
ignorowane przez gita (`.gitignore`) i różnią się między maszynami — patrz
`.claude/rules/dev.md`.

## Kto czyta co, w jakiej kolejności

| Serwis                                | Pliki (w tej kolejności)          | Jak są wczytywane                                                               |
| ------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------- |
| `apps/api` (host, dev)                | `envs/shared.env`, `envs/api.env` | Node `--env-file`, kolejność jak w tabeli — plik serwisu nadpisuje `shared.env` |
| `apps/web` (host, dev)                | `envs/shared.env`, `envs/web.env` | Node `--env-file` / mechanizm Next.js, ta sama kolejność                        |
| `db` (kontener, `docker-compose.yml`) | `envs/shared.env`, `envs/db.env`  | `env_file:` w `compose.yml`, w tej kolejności                                   |

`shared.env` zawsze ładuje się jako pierwszy — plik serwisu może nadpisać wartość
wspólną, nigdy odwrotnie.

## Dlaczego `shared.env.example` i `web.env.example` są dziś (prawie) puste

Na tym etapie żadna zmienna nie jest współdzielona przez więcej niż jeden serwis,
a `apps/web` nie ma jeszcze żadnego sekretu ani wartości wmurowywanej przy budowaniu
— cała logika i dostęp do danych żyją w `apps/api` (`.claude/rules/stack.md`).
Dopisywanie czegoś „na wszelki wypadek" jest zakazane wprost w `.claude/rules/ops.md`.
Gdy pojawi się pierwsza zmienna dla `apps/web` (np. cel dev-owych `rewrites` do
`/api/*` — wyjątek opisany w `.claude/rules/web.md`), dopisze ją ten, kto wprowadza
`next.config.ts`, w tej samej zmianie co kod, który jej używa.

## Świadome powtórzenie wartości: `DATABASE_URL` i `envs/db.env`

`apps/api` działa w dev na hoście, nie w Compose (`.claude/rules/dev.md`) — nie ma
więc sekcji `environment:` w `compose.yml`, w której `DATABASE_URL` mógłby powstać
przez interpolację z wartości w `envs/db.env`. `DATABASE_URL` w `envs/api.env` jest
więc **literalnym stringiem, w którym `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB`
z `envs/db.env` są ręcznie powtórzone**. Zmiana danych logowania do bazy wymaga
edycji **obu** plików naraz — to jest dokładnie pułapka opisana w
`.claude/rules/ops.md` („env_file nie interpoluje"), świadomie zaakceptowana, bo
`apps/api` poza Compose nie ma z czego interpolować.

## Port bazy w dev: 5433, nie 5432

`docker-compose.yml` publikuje Postgresa na hoście pod portem **5433**
(`.claude/rules/dev.md` — 5432 bywa zajęty przez lokalną instalację i konflikt
przechodzi po cichu, bez błędu). Wartość `5433` jest wpisana wprost w `compose.yml`
jako domyślna (`${DB_HOST_PORT:-5433}`) — nadpisujesz ją zmienną powłoki
`DB_HOST_PORT` albo korzeniowym `.env` (mechanizm interpolacji Compose, odrębny od
`env_file` i od katalogu `envs/`), nigdy przez pliki w `envs/`, które trafiają
**do wnętrza kontenera**, nie do samego polecenia `docker compose`.

## `NEXT_PUBLIC_*` — przypomnienie

Na dziś `apps/web` nie ma żadnej zmiennej `NEXT_PUBLIC_*`. Gdyby się pojawiła:
wmurowuje się ją przy **budowaniu** obrazu, nie w `envs/web.env` (który działa
dopiero przy starcie kontenera) — `.claude/rules/ops.md` opisuje to szerzej.
Jeśli dwa środowiska miałyby różnić się taką zmienną, nie da się użyć tego samego
obrazu dla obu — to decyzja do jawnego odnotowania, nie do cichego obejścia.

## Zmienne w `envs/api.env.example`

| Zmienna                                                | Po co                                                                                                                                                      |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                         | Adres bazy dla Prismy. W dev wskazuje `localhost:5433` (patrz wyżej), zawiera powtórzone dane logowania z `envs/db.env`.                                   |
| `PORT`                                                 | Port, na którym nasłuchuje `apps/api` w dev (`4000`, `.claude/rules/dev.md`).                                                                              |
| `GOOGLE_CLIENT_ID`                                     | Identyfikator klienta OAuth aplikacji Google Cloud właściciela.                                                                                            |
| `GOOGLE_CLIENT_SECRET`                                 | Sekret klienta OAuth — nigdy w logu ani odpowiedzi HTTP.                                                                                                   |
| `GOOGLE_REDIRECT_URI`                                  | Adres, na który Google przekierowuje po autoryzacji. W dev wskazuje port `apps/web` (3000), nie `apps/api` (4000) — patrz uzasadnienie w komentarzu pliku. |
| `OWNER_EMAIL`                                          | Jedyny adres e-mail, dla którego logowanie kończy się sukcesem (aplikacja jednokontowa).                                                                   |
| `SESSION_TTL_KIOSK_DAYS` / `SESSION_TTL_STANDARD_DAYS` | Czas życia sesji w dniach, dwie wartości — ADR-0003. Brak osobnego sekretu podpisu: identyfikator sesji jest losowy, w bazie leży tylko jego skrót.        |
| `COOKIE_SECURE`                                        | `false` w dev (`http://localhost`), `true` na produkcji — ADR-0003.                                                                                        |

## Zmienne w `envs/db.env.example`

| Zmienna             | Po co                                                              |
| ------------------- | ------------------------------------------------------------------ |
| `POSTGRES_USER`     | Użytkownik tworzony przy pierwszym starcie kontenera Postgresa.    |
| `POSTGRES_PASSWORD` | Hasło tego użytkownika. Obraz `postgres` odmawia startu bez niego. |
| `POSTGRES_DB`       | Nazwa bazy danych tworzonej przy pierwszym starcie.                |

## Dlaczego `GOOGLE_REDIRECT_URI` wskazuje port `apps/web`, nie `apps/api`

W dev `apps/web` przekierowuje `/api/*` do `apps/api` przez `rewrites` w
`next.config.ts` (wyjątek opisany w `.claude/rules/web.md`) — dzięki temu
przeglądarka widzi jeden origin i ciasteczko sesji `HttpOnly` zachowuje się tak
samo jak za reverse proxy na produkcji. Gdyby `GOOGLE_REDIRECT_URI` wskazywał
bezpośrednio port `apps/api` (4000), ciasteczko sesji ustawiłoby się dla innego
originu niż ten, z którego korzysta przeglądarka — zachowanie w dev przestałoby
odpowiadać produkcji.

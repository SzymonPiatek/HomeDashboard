# Reguły: Docker, CI, konfiguracja, wydania

## Komentarze w plikach konfiguracyjnych

Dotyczy `docker-compose*.yml`, `Dockerfile`, `envs/*.env.example`, workflow CI i
każdego innego pliku konfiguracyjnego w tym obszarze — te pliki nie są TypeScriptem,
ale reguła komentarzy z `.claude/rules/typescript.md` obowiązuje tu tak samo.

Komentarz tłumaczy **dlaczego**, nigdy **co** — nazwa zmiennej i wartość już mówią,
co się dzieje. **Limit: 1–2 linie.** Dłuższy wywód (uzasadnienie decyzji, opis pułapki,
historia) należy do `.claude/rules/ops.md` albo `envs/README.md` — w komentarzu zostaje
najwyżej jedno zdanie i odesłanie do właściwego miejsca, nie powtórzenie treści.
Powtórzona treść to dwa miejsca do aktualizacji, które przy pierwszej zmianie się rozjadą.

Zła: przepisanie całego akapitu z `.claude/rules/dev.md` o porcie 5433 nad zmienną
`DB_HOST_PORT`. Dobra: `# 5433, nie 5432 — patrz .claude/rules/dev.md`.

## Zmienne środowiskowe

Konfiguracja żyje w katalogu **`envs/` w korzeniu repozytorium**, jeden plik na serwis:

```
envs/
  shared.env           wartości używane przez więcej niż jeden serwis
  api.env              apps/api
  web.env              apps/web
  db.env               kontener PostgreSQL
  <serwis>.env         nowy serwis = nowy plik
  *.env.example        wersje przykładowe — jedyne, które trafiają do repozytorium
```

- **Kolejność ładowania jest jawna i stała:** najpierw `shared.env`, potem plik serwisu.
  Późniejszy nadpisuje wcześniejszy. W `compose.yml` zapisujesz to wprost:
  `env_file: [envs/shared.env, envs/api.env]`.
- W `shared.env` ląduje tylko to, czego naprawdę używa **więcej niż jeden** serwis.
  Wartość trafiająca tam „na wszelki wypadek" rozlewa sekrety po kontenerach,
  które ich nie potrzebują.
- **Każdy plik `*.env` jest ignorowany przez gita.** Do repozytorium trafia wyłącznie
  `*.env.example` — z kompletem kluczy, opisem i bezpieczną wartością przykładową.
- Nowa zmienna w kodzie aktualizuje odpowiedni `.example` **w tej samej zmianie**.
  Brak wpisu to zepsute uruchomienie u kogoś innego.
- `envs/README.md` opisuje, który serwis czyta które pliki i gdzie świadomie powtarzamy
  wartość. Bez tego po miesiącu nikt nie wie, skąd bierze się dana zmienna.
- **Żadnych sekretów w repozytorium** — ani w kodzie, ani w `compose.yml`, ani w `Dockerfile`,
  ani w argumentach budowania, ani w historii gita.
- Konfiguracja jest walidowana zodem **przy starcie procesu**. Brak wymaganej zmiennej
  zatrzymuje start — aplikacja nie uruchamia się „częściowo".

### Dwie pułapki tego układu

**Pliki `env_file` nie interpolują zmiennych.** Zapis
`DATABASE_URL=postgres://user:${POSTGRES_PASSWORD}@db:5432/app` w `api.env` **nie zadziała** —
trafi do kontenera dosłownie, ze znakami `${}`. Masz dwie drogi i wybierasz świadomie:
złożyć taką wartość w `compose.yml` w sekcji `environment:` (tam interpolacja z korzeniowego
`.env` działa), albo powtórzyć wartość w dwóch plikach i **odnotować to w `envs/README.md`**.
Milcząca duplikacja hasła to przyszła awaria przy jego zmianie.

**`NEXT_PUBLIC_*` nie jest zmienną uruchomieniową.** Next.js wmurowuje ją w bundle na etapie
**budowania**. Wpisanie jej do `envs/web.env` daje fałszywe poczucie, że restart kontenera
coś zmieni — nie zmieni. Takie wartości przekazuje się jako argumenty budowania, a różnica
w nich między środowiskami oznacza, że **nie da się użyć tego samego obrazu**.
Sekret w `NEXT_PUBLIC_*` jest sekretem opublikowanym.

## Docker

- Budowanie **wieloetapowe**; obraz produkcyjny nie zawiera narzędzi budowania,
  źródeł ani zależności deweloperskich.
- Obraz bazowy przypięty do konkretnej wersji, nie do `latest`.
- Proces **nie działa jako root**.
- `.dockerignore` wyklucza `node_modules`, `.git`, `.env` i artefakty testów. Bez tego
  kontekst budowania rośnie i łatwo o wciągnięcie sekretu do warstwy.
- Kolejność warstw od najrzadziej do najczęściej zmieniających się (najpierw manifesty
  zależności, potem kod) — inaczej cache nie działa.
- Każdy serwis ma **healthcheck**. Zależność `depends_on` bez warunku zdrowia nie gwarantuje,
  że usługa jest gotowa, a jedynie że wystartowała.
- Dane trwałe wyłącznie w wolumenach nazwanych.

## CI

Przed scaleniem przechodzi **cztery równoległe joby, bez `needs` między nimi**
(decyzja z 2026-08-31, zastępuje wcześniejszą sekwencję „najszybsze i najczęściej
padające pierwsze"):

1. formatowanie i lint
2. typy (`tsc --noEmit`)
3. testy jednostkowe
4. testy integracyjne (prawdziwa baza w kontenerze)

Każdy job dzieli te same trzy kroki startowe przez akcję złożoną
`.github/actions/setup` (pnpm, Node z pamięcią podręczną pnpm, `pnpm install
--frozen-lockfile`) i tę samą pamięć podręczną Turbo (`actions/cache` na
`.turbo/cache`, klucz po skrócie lockfile i commita, z `restore-keys` jako
fallbackiem na poprzedni przebieg). Bez współdzielonej pamięci Turbo rozbicie na
cztery joby nic by nie dawało: `typecheck`, `lint` i `test` zależą od `^build`
(`turbo.json`), więc każdy job budowałby `@repo/contracts` od zera.

**Cena tej decyzji, świadomie zaakceptowana:** przy równoległym starcie testy
integracyjne (najdłuższy i najdroższy job — baza w kontenerze, budowanie pakietów,
klient Prismy, migracja) ruszają nawet wtedy, gdy typy się nie kompilują. Przebieg
skazany na czerwone i tak zużywa pełne minuty runnera na tym jobie, których
sekwencyjna kolejność by nie zużyła. Wybieramy krótszy czas na zegarze (PR gotowy
szybciej) kosztem większego zużycia minut przy nieudanych przebiegach.

**Budowanie obrazów i testy e2e nie są dziś częścią CI** — zostały z niego zdjęte
2026-08-30, żeby skrócić czas przebiegu. Testy e2e nadal istnieją i uruchamia się je
ręcznie (`pnpm --filter @repo/web test:e2e` przeciwko `docker-compose.prod.yml`).
Zanim wrócą do CI, trzeba usunąć dwie blokady opisane w `docs/backlog.md` — nie dokładaj
tego joba z powrotem bez ich rozwiązania, bo padnie na starcie kontenera `api`.

Zasady:

- **Czerwone CI blokuje scalenie.** Nie obchodzi się go pominięciem testu ani `--force`.
- Test wyłączony w CI wymaga komentarza z powodem i zgłoszenia. Cicho pominięty test
  to test, który nie istnieje.
- CI nie ma dostępu do produkcyjnej bazy ani produkcyjnych sekretów.
- Przebieg jest powtarzalny: przypięte wersje narzędzi, wynik nie zależy od stanu
  poprzedniego przebiegu. Pamięć podręczna Turbo jest wyjątkiem świadomym i
  nieszkodliwym dla poprawności: klucz jest treścią zadania (hash zawartości), więc
  jej brak (`cache miss`) zmienia wyłącznie czas przebiegu, nigdy wynik sprawdzenia.

## Migracje przy wdrożeniu

Najniebezpieczniejszy moment w całym cyklu. Obowiązuje:

- Migracja to **osobny krok przed** uruchomieniem nowej wersji aplikacji, nigdy
  automat przy starcie procesu. Przy dwóch instancjach automat oznacza wyścig.
- Migracja musi być **zgodna wstecz** z wersją aplikacji, która właśnie działa —
  przez chwilę działają obie naraz. Usunięcie kolumny robi się w dwóch wdrożeniach:
  najpierw kod przestaje jej używać, dopiero potem znika z bazy.
- **Kopia zapasowa przed każdą migracją destrukcyjną.** Kopia, z której nigdy nie odtworzono
  bazy, nie jest kopią zapasową, tylko nadzieją.
- Wycofanie wersji aplikacji nie wycofuje migracji. Każde wdrożenie ze zmianą schematu
  ma opisany plan wycofania, zanim ruszy.

## Wydania

- Wdraża się **ten sam obraz**, który przeszedł CI — nie buduje się go ponownie
  dla środowiska docelowego. Obraz jest oznaczony skrótem commita.
- Wycofanie polega na ponownym uruchomieniu poprzedniego obrazu; działa tylko wtedy,
  gdy schemat bazy na to pozwala (patrz wyżej).
- **Żadnych ręcznych zmian na serwerze.** Konfiguracja, której nie ma w repozytorium,
  zniknie przy następnym wdrożeniu i nikt nie będzie wiedział dlaczego.

## Wdrożenie na serwer

Dwa pliki Compose, dwa światy:

- `docker-compose.yml` — dev: **wyłącznie baza**. Aplikacje chodzą na hoście.
- `docker-compose.prod.yml` — produkcja: obrazy wieloetapowe, reverse proxy Caddy,
  osobna usługa migracji.

Ten sam plik produkcyjny uruchamiasz lokalnie przed wypchnięciem. Konfiguracji proxy
nie testujesz dopiero na serwerze.

Na serwerze potrzebne są wyłącznie git i Docker — bez Node'a i bez pnpm:

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

**Migracja jest osobną usługą**, nie krokiem w starcie aplikacji: `migrate` kończy się
sukcesem, dopiero potem rusza `api` (`condition: service_completed_successfully`).
Migrator to osobny cel budowania, bo zawiera narzędzie wiersza poleceń Prismy, którego
obraz produkcyjny nie ma.

**Reverse proxy jest jedynym wystawionym portem.** Aplikacje deklarują `expose`, nie
`ports` — nie da się ich obejść z zewnątrz. Podanie `SITE_ADDRESS` z domeną włącza
automatyczny certyfikat.

Obraz produkcyjny buduje się przez `pnpm deploy --legacy`, a pole `files` w manifeście
ogranicza jego zawartość do `dist` i `prisma`. Źródeł, testów ani konfiguracji narzędzi
w obrazie nie ma.

## Logi i obserwowalność (minimum)

- Logi strukturalne, z identyfikatorem korelacji żądania.
- **Logi nie zawierają sekretów, tokenów, ciasteczek ani danych użytkownika.**
- Aplikacja wystawia endpoint zdrowia, który sprawdza również dostępność bazy.
- Po nieudanym wdrożeniu musi dać się ustalić przyczyna bez wchodzenia na serwer.

## Operacje zakazane bez wyraźnej zgody

`docker compose down -v` i wszystko, co kasuje wolumeny. Usunięcie lub wyczyszczenie bazy.
Ręczny `prisma migrate reset` poza lokalną bazą. `git push --force` na wspólną gałąź.
Wdrożenie na produkcję.

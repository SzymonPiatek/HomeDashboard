# Reguły: środowisko deweloperskie

## Gdzie co działa

| Element | Gdzie | Port |
|---|---|---|
| PostgreSQL | kontener (`docker compose up -d`) | **5433** na hoście |
| `apps/api` | host (`pnpm dev`) | 4000 |
| `apps/web` | host (`pnpm dev`) | 3000 |

```bash
docker compose up -d   # baza
pnpm dev               # api + web na hoście, z hot reloadem
```

Aplikacje **nie działają w kontenerach w trybie dev**. Bind mount przez warstwę
wirtualizacji macOS jest wolny i wymusza polling watchera, a zysk byłby żaden:
konteneryzację i tak sprawdzasz `docker-compose.prod.yml`, czyli tym samym plikiem,
który jedzie na serwer. Osobny profil „wszystko w kontenerach dla dev" dublowałby
produkcję gorszą wersją i wymagał trzeciego zestawu adresów bazy.

## Port bazy to 5433, nie 5432

Port 5432 bywa zajęty przez lokalną instalację PostgreSQL. Przy takim konflikcie
wiązanie na pętli zwrotnej wygrywa z portem kontenera i **połączenia po cichu trafiają
do niewłaściwej bazy** — bez błędu, bez ostrzeżenia. Nadpiszesz przez `DB_HOST_PORT`.

Objaw, po którym to poznasz: `role "..." does not exist` z hosta, przy działającym
`psql` wewnątrz kontenera.

## Hot reload

- **`tsx watch` śledzi tylko pliki, które sam transpiluje.** Zbudowana zależność
  z workspace (`packages/*/dist/*.js`) do nich nie należy, więc jej zmiana **nie**
  przeładuje aplikacji. Każdy taki pakiet trzeba dopisać jawnie:
  `tsx watch --include "../../packages/<pakiet>/dist/**"`. Pominięcie tego kroku
  psuje hot reload po cichu — kod się kompiluje, aplikacja pracuje na starym.
- Zadanie `dev` zależy od `^build`, żeby przy zimnym starcie zbudowane pakiety istniały.
- Pakiety współdzielone mają `dev` uruchamiające `tsc --watch`.

**Hot reload sprawdzasz po PID procesu, nie po `uptime`:**

```bash
lsof -nP -iTCP:4000 -sTCP:LISTEN -t   # przed zmianą i po niej — musi się różnić
```

`uptime` mierzone po kilku sekundach oczekiwania nie odróżni przeładowania od jego braku,
a komunikat „Restarting" w logu nie dowodzi, że nowy proces faktycznie przejął port.

## Instalowanie zależności

- Zawsze przez `pnpm`, nigdy ręczną edycją `package.json`.
- Do konkretnego pakietu: `pnpm --filter @repo/api add <paczka>`.
- Do korzenia (narzędzia): `pnpm add -D -w <paczka>`.
- **Nowa zależność wymaga zgody użytkownika** (`.claude/rules/stack.md`). Propozycja
  zawiera: którą, po co, ile waży i co trzeba by napisać samemu zamiast niej.
- Pakiet ze skryptem `postinstall` jest domyślnie blokowany przez pnpm 10. Zgodę
  dopisuje się **wąsko** do `onlyBuiltDependencies` w `pnpm-workspace.yaml` — postinstall
  to wykonanie cudzego kodu przy instalacji.
- Po instalacji `pnpm-lock.yaml` wchodzi do tego samego commita co zmiana w manifeście.

## Konfiguracja

Pliki `envs/*.env` są **poza gitem i różnią się między maszynami**. Ta sama nazwa pliku
ma inną treść w dev i na serwerze — np. `DATABASE_URL` wskazuje `localhost:5433` lokalnie,
a `db:5432` w kontenerach. To celowe: dlatego w repozytorium leżą wyłącznie `*.env.example`.

Wczytywaniem zajmuje się Node (`--env-file`, `process.loadEnvFile`), nie biblioteka.
Kolejność jest zawsze ta sama: `shared.env`, potem plik serwisu.

## Weryfikacja w trakcie pracy

**W trakcie zadania sprawdzasz tylko pakiet, który ruszasz**, a nie całe monorepo:

```bash
pnpm --filter @repo/api exec tsc --noEmit    # najszybsza pętla zwrotna
pnpm --filter @repo/api test
```

Pełny przebieg przez wszystkie pakiety trwa wielokrotnie dłużej i przy zmianie w jednym
pakiecie nie mówi nic więcej. Uruchamiasz go **raz, przed zgłoszeniem zrobione**.

**`--force` nie jest domyślnym trybem.** Wyrzuca cache całego przebiegu, więc każde
zadanie liczy się od zera. Używasz go wyłącznie wtedy, gdy podejrzewasz, że cache
kłamie — a nie „dla pewności" przy każdym sprawdzeniu.

## Zanim zgłosisz „zrobione"

```bash
pnpm exec turbo run build typecheck lint test
pnpm exec prettier --check .
```

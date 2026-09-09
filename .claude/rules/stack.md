# Stack — ustalony na sztywno

Nie jest przedmiotem dyskusji przy okazji zadania. Zmiana wymaga świadomej decyzji
użytkownika i ADR-a, który to odnotuje.

## Skład

| Warstwa | Wybór |
|---|---|
| Język | TypeScript, `strict` |
| Monorepo | pnpm workspaces + Turborepo |
| Frontend | `apps/web` — Next.js (App Router), React, Tailwind CSS, shadcn/ui, TanStack Query |
| Backend | `apps/api` — Express, Prisma ORM |
| Baza | PostgreSQL, migracje przez Prisma Migrate |
| Kontrakt API | `packages/contracts` — schematy zod |
| Testy | Vitest (jednostkowe, integracyjne) + Playwright (e2e) |
| Uruchomienie | Docker: Compose w dev, obrazy multi-stage w prod |

## Układ monorepo

```
apps/web            Next.js — wyłącznie prezentacja
apps/api            Express — domena, dane, auth
packages/contracts  schematy zod: jedyne źródło prawdy o API
packages/config     współdzielona konfiguracja (ts, eslint, tailwind)
```

## Trzy granice, które przenikają cały projekt

Wynikają z powyższego wyboru i obowiązują każdego agenta:

1. **Next.js jest wyłącznie warstwą prezentacji.** Brak `app/api/**`, brak importu Prismy,
   brak dostępu do bazy z `apps/web`. Bez tego granica front/back jest umowna i logika
   z czasem wycieka do Nexta.
2. **Zmiana API zaczyna się w `packages/contracts`**, nigdy w kodzie route. Odwrotna
   kolejność zawsze kończy się cichym rozjazdem front/back.
3. **Schemat bazy ma jednego właściciela** — `data-engineer`. Baza jest jedyną częścią
   systemu, której nie da się bezboleśnie cofnąć.

## Rozstrzygnięcia towarzyszące

Spis, nie treść — każda z tych decyzji ma pełny opis w pliku, który jest jej właścicielem.
Czytaj ten plik tylko wtedy, gdy zadanie faktycznie go dotyczy:

- Auth w całości w `apps/api`, sesja w ciasteczku HttpOnly → `.claude/rules/api.md`,
  `.claude/rules/auth.md`.
- Reverse proxy pod jedną domeną (`/` → web, `/api` → api) → `.claude/rules/ops.md`.
- WCAG 2.2 AA i tryb jasny/ciemny → `.claude/rules/ui-quality.md`.
- Server Actions i route handlery nie są drogą do danych → `.claude/rules/web.md`.
- `$queryRaw` wyłącznie w warstwie repozytorium, z parametrami → `.claude/rules/data.md`.

## Czego tu celowo nie ma

Biblioteki do konkretnych zadań (daty, wykresy, formularze, auth) **nie są z góry wybrane**.
Agent, który uzna którąś za potrzebną, proponuje ją użytkownikowi i czeka na zgodę —
nie dokłada jej sam.

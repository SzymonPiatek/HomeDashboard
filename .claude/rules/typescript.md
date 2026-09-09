# Reguły: TypeScript (cały monorepo)

Obowiązują w każdym pakiecie. Reguła jest tu tylko wtedy, gdy da się jednoznacznie
stwierdzić, czy została złamana.

## Typy

- `strict: true`. `any` jest zakazane — gdy typ jest naprawdę nieznany, użyj `unknown`
  i zawęź go jawnie.
- Zakaz `as` do obejścia błędu typów. Dopuszczalne wyłącznie przy zawężaniu po walidacji
  zod albo przy `as const`.
- Zakaz `@ts-ignore`. `@ts-expect-error` tylko z komentarzem wyjaśniającym w tej samej linii.
- Dane wchodzące z zewnątrz (HTTP, env, localStorage, pliki) nie mają typu, dopóki nie
  przejdą przez zod. Nie deklaruj ich typu ręcznie — wyprowadź go z schematu (`z.infer`).

## Moduły

- Wyłącznie **named exports**. Zakaz `export default` (wyjątek: pliki, których wymaga
  framework — `page.tsx`, `layout.tsx`, `next.config.ts`).
- Zakaz **barrel files** (`index.ts` reeksportujący cały katalog). Importuj z konkretnego pliku.
- Import między pakietami wyłącznie przez nazwę pakietu (`@repo/contracts`),
  nigdy przez ścieżkę względną wychodzącą poza pakiet.

## Rozmiar i kształt

- Plik: maks. **200 linii**. Funkcja: maks. **50 linii**. Przekroczenie oznacza, że plik
  robi więcej niż jedną rzecz — podziel, nie podnoś limitu.
- Maks. **3 poziomy zagnieżdżenia** w funkcji. Głębiej — wydziel funkcję albo użyj
  wczesnego `return`.
- Funkcja przyjmująca więcej niż 3 argumenty przyjmuje obiekt.

## Nazewnictwo i język

- Kod, komentarze i nazwy commitów po **angielsku**. Nazwy plików dokumentów też —
  `0001-google-oauth-two-stage-authorization.md`.
- **Treść dokumentów decyzyjnych po polsku** — PRD, ADR, backlog, wykazy zmian. Tak wygląda
  cała dokumentacja projektu i tak też jest napisany `.claude/templates/adr.md`.
- Po polsku również teksty widoczne dla użytkownika aplikacji.
- **Adresy tras i nazwy katalogów są po angielsku** — `/calendar`, `/catalog`,
  `/profile`, `app/(app)/calendar/`. Polska jest **etykieta** widoczna w interfejsie
  („Kalendarz"), nie adres. Adres jest częścią kodu i zmienia się najdrożej ze wszystkiego:
  wchodzi do zakładek, linków w mailach i historii przeglądarki. Decyzja użytkownika
  z 2026-08-30, zapisana też w ADR-0009.
- Pliki: `kebab-case.ts`. Komponenty React: `PascalCase.tsx`. Typy i interfejsy: `PascalCase`.
  Stałe modułowe: `SCREAMING_SNAKE_CASE`.
- Booleany zaczynają się od `is`/`has`/`should`. Funkcje zaczynają się od czasownika.

## Komentarze

Komentarz tłumaczy **dlaczego**, nigdy **co**. Komentarz opisujący działanie kodu jest
błędem — popraw nazwę zamiast go pisać. Wyjątek: obejścia cudzych błędów i nieoczywiste
decyzje wydajnościowe, gdzie powód musi być zapisany.

**Limit: 3 linie.** Dłuższy komentarz znaczy, że tłumaczysz decyzję, a nie kod — a decyzje
mieszkają w `docs/adr/`. Wtedy zamiast wywodu podaj numer ADR-a i jedno zdanie, po co ten
kod tu jest. Powtarzanie treści dokumentu w komentarzu tworzy drugie miejsce, w którym ta
sama rzecz musi być aktualizowana; przy pierwszej zmianie oba się rozjeżdżają, a kod kłamie
dłużej niż dokument, bo nikt go nie czyta jak dokumentacji.

Komentarz jest też kosztem czasu: piszesz go raz, a czyta go każdy kolejny agent dotykający
tego pliku. Nagłówek pliku na kilkanaście linii płaci się przy każdym następnym zadaniu.

## Błędy

- Zakaz pustego `catch`. Zakaz `catch`, który tylko loguje i idzie dalej, jeśli wywołujący
  ma prawo wiedzieć o porażce.
- Nie rzucaj gołych stringów ani obiektów — rzucaj `Error` lub jego podklasę.
- Nie połykaj błędu, żeby "test przeszedł".

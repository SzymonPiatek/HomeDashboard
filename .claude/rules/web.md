# Reguły: apps/web (Next.js)

Obowiązuje też `.claude/rules/typescript.md`.

## Granica, której nie wolno przekroczyć

`apps/web` jest **wyłącznie warstwą prezentacji** (`.claude/rules/stack.md`).

- Zakaz katalogu `app/api/**` i jakichkolwiek route handlerów.
- Zakaz importu `@prisma/client` i jakiegokolwiek dostępu do bazy.
- Zakaz Server Actions jako drogi do danych.
  **Jeden dozwolony wyjątek:** `rewrites` w `next.config.ts`, kierujące `/api/*` do API
  w środowisku deweloperskim. To konfiguracja sieciowa, nie logika — Next niczego nie
  przetwarza, a przeglądarka widzi jeden origin, dzięki czemu ciasteczka HttpOnly zachowują
  się jak na produkcji. Na produkcji zmienna z adresem jest pusta i ruch rozdziela reverse
  proxy. Rewrites **nie wolno** używać do agregowania danych, dokładania nagłówków
  uwierzytelniających ani żadnego innego przetwarzania.

- Zakaz sekretów w tym pakiecie. Zmienna `NEXT_PUBLIC_*` z definicji jest publiczna —
  nie wkładaj do niej niczego, czego nie chcesz zobaczyć w przeglądarce.

Wszystkie dane pochodzą z API pod `/api`. Kropka.

## Dane

**Każde pobranie danych idzie przez pamięć podręczną TanStack Query.** Nie ma drogi
obok: `fetch` w `useEffect`, własny `useState` z odpowiedzią i „jednorazowe" wywołanie
w komponencie są zakazane, nawet gdy działają. Bez wspólnej pamięci podręcznej dwa
komponenty potrzebujące tych samych danych odpytują API dwa razy, powrót na widok
pobiera wszystko od nowa, a unieważnianie po mutacji nie ma czego unieważnić.

- Fetch **nie występuje w komponencie**. Każde wywołanie API mieszka w hooku w
  `features/<obszar>/api/`, zbudowanym na TanStack Query.
- Odpowiedź jest parsowana schematem z `@repo/contracts` zanim trafi do UI.
  Nie ufaj, że backend przysłał to, co obiecał.
- Stan serwera należy do TanStack Query. Nie kopiuj go do `useState`.

### Klucze zapytań

- **Klucze są wydzielone**, nigdy wpisywane z palca w komponencie ani powtórzone
  w dwóch plikach. Obszar ma jedno miejsce, w którym powstają — moduł kluczy przy
  hookach obszaru (`features/<obszar>/api/`), eksportujący stałą albo funkcję
  budującą klucz z parametrów.
- Klucz zależny od parametrów (identyfikator, okno czasu, strona) **przyjmuje je
  jawnie**. Klucz stały dla zapytania, które parametry ma, oznacza, że dwa różne
  wyniki dzielą jeden wpis w pamięci podręcznej — użytkownik zobaczy dane z innego
  zapytania.
- Mutacja unieważnia dane **tym samym kluczem**, którym je pobrano. Skoro klucz jest
  w jednym miejscu, unieważnienie nie może się rozjechać z pobraniem.

### Świeżość

- Hook deklaruje `staleTime` **świadomie**, dobrane do tego, jak szybko dane naprawdę
  się zmieniają. Domyślne zero znaczy „odpytuj przy każdym zamontowaniu" — dla danych
  zmieniających się raz na kwadrans to darmowy ruch do cudzego API i niepotrzebne
  miganie widoku.
- Dane z zewnętrznej usługi o limitach zapytań (kalendarz, pogoda) mają `staleTime`
  zawsze. Brak wartości jest tu błędem, nie pominięciem.

### Przepływ zgody OAuth (ADR-0001)

Start przepływu zgody to **nawigacja przeglądarki** do `/api/…` — link albo
`window.location`. **Nigdy `fetch`:** ekran zgody Google nie ładuje się przez XHR, więc
wywołanie asynchroniczne kończy się błędem CORS albo pustą odpowiedzią, a użytkownik nie
zobaczy niczego.

## Komponenty

- Domyślnie Server Component. `'use client'` dopiero gdy komponent naprawdę potrzebuje
  interaktywności, hooków albo API przeglądarki — i wtedy jak najniżej w drzewie.
- Komponent w `components/ui/**` jest bezstanowy i nie zna dziedziny — dostaje propsy i renderuje.
  Wiedza o dziedzinie mieszka w `features/**`.
- Zanim napiszesz nowy prymityw, sprawdź, czy shadcn/ui już go ma. Nie duplikuj przycisku.
- Warunkowe klasy przez `cn()`. Zakaz `style={{...}}` i zakaz wartości arbitralnych
  Tailwinda (`w-[137px]`) bez komentarza z powodem.
- `className` dłuższy niż jedna czytelna linijka wołaj przez `cn()` z kilkoma argumentami
  — string na grupę (układ, wygląd, `hover:`, `focus-visible:`), nie jeden ciąg wszystkich
  klas. `cva` dopiero gdy komponent ma warianty (`variant`, `size`) do przełączania —
  bez wariantów to niepotrzebna maszyneria.

### Element pulpitu (ADR-0002, ADR-0007, ADR-0019, ADR-0020)

- Element katalogu mieszka w `features/elements/<klucz>/` i eksportuje komponent kafelka
  oraz — gdy ma własną stronę — komponent widoku strony. **Żaden z nich nie przyjmuje
  propsów.** Ramka kafelka (tytuł, usunięcie, stan zgody, granica błędu) należy do pulpitu;
  ramka strony do powłoki obszaru.
- Element **nie importuje** niczego z innego elementu, z `features/dashboard` ani z nawigacji.
  Import między dwoma elementami jest błędem architektonicznym, nawet gdy kod działa.
  Zakaz obowiązuje oba komponenty.
- **Element nie zna własnej trasy ani etykiety w nawigacji** — jedno i drugie żyje w rejestrze.
- **Rejestr jest jedynym miejscem importującym `features/elements/**`.** Nawigacja renderuje
  się z rejestru i **nie wykonuje fetcha** — jej kształt nie zależy od danych konta.
- Rejestr elementów ma typ `Record<ElementKey, ElementDefinition>` — mapa wyczerpująca,
  nigdy częściowa i nigdy wyszukiwanie po stringu. Dzięki temu klucz bez wpisu jest błędem
  kompilacji, a nie pustym kafelkiem na produkcji. Brak strony zapisuje się jawnie
  (`page: null`), nigdy przez pominięcie pola — nowy element musi świadomie odpowiedzieć.

### Dostawca, grupa w nawigacji i kształt adresu (ADR-0019)

- **Rejestr dostawców** (`Record<ProviderKey, ProviderDefinition>`) jest jedynym źródłem etykiety,
  ikony, kolejności i segmentu adresu grupy. Element deklaruje wyłącznie `provider: ProviderKey | null`
  — pole wymagane o dopuszczalnie pustej wartości, nigdy pominięte. Etykieta grupy wpisana przy
  elemencie jest błędem.
- **`path` w rejestrze jest pełnym, dosłownym adresem** (`"/google/calendar"`) — nigdy składanym
  w czasie działania z segmentu dostawcy i sluga. Kształt: `/<segment dostawcy>/<slug>` dla elementu
  z dostawcą, `/<slug>` bez dostawcy; oba człony po angielsku.
- Test zgodności rejestru z drzewem tras (ADR-0009) sprawdza **trzy** rzeczy: wpis bez pliku trasy,
  plik trasy bez wpisu oraz prefiks dostawcy w `path`.
- **Grupa nie jest miejscem docelowym** — nie ma trasy `/<segment dostawcy>`; pozycja grupy rozwija
  listę, nie nawiguje.

### Katalog i pulpit — stan po ADR-0020

- `apps/web` **nie woła** endpointów katalogu ani pulpitu (`GET /catalog`, `POST /dashboard`
  i pozostałe). Nie ma trasy `/catalog`, katalogu `features/catalog/**` ani pozycji „Katalog"
  w nawigacji. Pulpit (`/`) nie pobiera danych — tytuł i stan pusty.
- **Rejestr elementów zostaje mimo braku widoku katalogu** — jest źródłem nawigacji i tras. Kafelki
  zostają w rejestrze nierenderowane; nie zamienia się ich na `Tile: null`, bo to znaczy co innego
  (ADR-0017).
- Zgoda OAuth startuje **ze strony elementu**, nawigacją przeglądarki do `/api/…`, nigdy przez
  dodanie do pulpitu.

## Dostępność, motywy i stany widoku

Przeniesione do `.claude/rules/ui-quality.md` — WCAG 2.2 AA (kontrast, cele dotykowe),
tryb jasny/ciemny i cztery stany widoku dotyczą też `ux-designer` i `qa-engineer`,
którzy nie potrzebują reszty tego pliku.

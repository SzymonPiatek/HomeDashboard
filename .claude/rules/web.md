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

## Dostępność — WCAG 2.2 poziom AA

Poziom **AA standardu WCAG 2.2 jest wymogiem projektu**, nie aspiracją. Zmiana, która go
łamie, jest niedokończona — tak samo jak zmiana bez testu.

### Kontrast

| Co | Minimum |
|---|---|
| Tekst zwykły | **4.5:1** |
| Tekst duży (≥ 24 px lub ≥ 18.7 px pogrubiony) | **3:1** |
| Elementy interfejsu, ikony niosące znaczenie, granice pól | **3:1** |
| Pierścień fokusu względem tła | **3:1** |

Kontrast musi być spełniony **osobno w trybie jasnym i osobno w ciemnym**. Para kolorów
poprawna w jednym trybie potrafi nie przejść w drugim — sprawdzasz oba, nie jeden.

Kolor **nigdy nie jest jedynym nośnikiem informacji**: status ma kolor i tekst lub ikonę.

### Cele dotykowe

Minimum wg WCAG 2.2 AA to **24×24 px**. W tym projekcie przyjmujemy **44×44 px** dla
podstawowych elementów dotykowych — mniejsze dopuszczamy tylko przy gęstych układach
(np. akcje w wierszu tabeli) i nigdy poniżej progu 24 px.

### Reszta wymogów

- Element klikalny to `button` albo `a` — nigdy `div` z `onClick`.
- Każde pole formularza ma powiązany `label`. Każdy obrazek ma `alt`.
- Fokus musi być widoczny. Nie usuwaj `outline` bez podania zamiennika o kontraście 3:1.
- Wszystko, co da się zrobić myszą, da się zrobić klawiaturą. Kolejność fokusu jest zgodna
  z kolejnością wizualną, a fokus nie ucieka poza otwarty dialog.
- Struktura nagłówków jest hierarchiczna (`h1` → `h2` → …), bez przeskoków dla efektu.
- Zmiany dziejące się bez przeładowania (zapis, błąd, wynik wyszukiwania) są ogłaszane
  przez `aria-live`. Zmiana, której nie widzi czytnik ekranu, dla jego użytkownika się nie zdarzyła.
- Animacja respektuje `prefers-reduced-motion`. Nic nie miga częściej niż 3 razy na sekundę.
- Aplikacja jest używalna przy powiększeniu do 200% bez utraty treści i funkcji.
- **Każdy element interaktywny ma dostępną nazwę** — tekst, `label` albo `aria-label`.
  To nie jest tylko wymóg dostępności: tak właśnie znajdują go testy e2e
  (`.claude/rules/testing.md`). Ikona bez tekstu opisuje czynność, nie wygląd.
- `data-testid` dokładasz wyłącznie tam, gdzie dostępna nazwa nie wystarcza do odróżnienia
  elementu (wiersz listy, sekcja). Nigdy do elementu, który da się znaleźć po roli i nazwie.

## Tryb jasny i ciemny

Aplikacja obsługuje **oba tryby**. To nie jest funkcja do dorobienia na końcu — kolor
dopisany bez tokenu trzeba potem znaleźć i wymienić w każdym pliku z osobna.

- Kolory wyłącznie przez **semantyczne tokeny** (`bg-background`, `text-muted-foreground`,
  `border`, `destructive`). **Zakaz surowych kolorów Tailwinda** (`bg-white`, `text-gray-700`,
  `bg-red-500`) w kodzie aplikacji. Wartości tokenów definiuje warstwa motywu, nie komponent.
- Tokeny są zmiennymi CSS przełączanymi klasą `dark` na elemencie `html` (konwencja shadcn/ui).
- Pierwsza wizyta respektuje `prefers-color-scheme`. Wybór użytkownika ma pierwszeństwo
  i jest zapamiętywany.
- **Zakaz mignięcia złym motywem** — motyw ustala się przed pierwszym malowaniem, nie po
  hydracji.
- Tryb ciemny to nie odwrócenie jasnego. Nie używamy czystej bieli na czystej czerni;
  wyniesienie warstw pokazujemy jaśniejszym tłem, nie cieniem.
- Obrazy, ilustracje, wykresy i granice muszą być czytelne w obu trybach. Element widoczny
  wyłącznie dzięki cieniowi zniknie w ciemnym.
- Każdy nowy kolor przechodzi sprawdzenie kontrastu **w obu trybach**, zanim wejdzie
  do systemu.

## Stany widoku

Każdy widok pobierający dane obsługuje **cztery** stany: ładowanie, błąd, pusto, dane.
Brak stanu pustego albo błędu to niedokończony widok, nie "do dorobienia później".

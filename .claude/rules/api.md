# Reguły: apps/api (Express)

Obowiązuje też `.claude/rules/typescript.md`.

## Warstwy

```
route  →  service  →  repository  →  Prisma
```

- **route** — tylko: walidacja wejścia zod, wywołanie serwisu, zmapowanie wyniku na odpowiedź.
  Bez logiki biznesowej, bez Prismy. Route dłuższy niż ~20 linii to sygnał, że logika
  wyciekła w złe miejsce.
- **service** — logika domenowa. Nie zna Expressa: żadnego `req`, `res` ani nagłówków.
- **repository** — jedyne miejsce, w którym występuje `prisma`. Zwraca typy domenowe,
  nie modele Prismy jeden do jednego.

Zależność biegnie tylko w dół. Repozytorium nie woła serwisu.

## Granice

- Każde wejście (body, query, params) przechodzi przez schemat z `@repo/contracts`.
  Nie ma "zaufanych" endpointów.
- Każda odpowiedź jest zgodna ze schematem odpowiedzi z kontraktu.
- Zmiana API zaczyna się w `packages/contracts`, nie w route.
- Zakaz edycji `schema.prisma` i migracji — to własność `data-engineer`.

## Listy i stronicowanie

**Każdy endpoint zwracający listę jest stronicowany.** Dotyczy wszystkiego, co jest zbiorem
— pojazdy, konta, zdarzenia serwisowe, elementy katalogu, historia. Endpoint listujący bez
stronicowania jest niedokończony, nawet gdy dziś rekordów jest pięć.

- **Domyślny rozmiar strony to 10.** Klient, który nie prosi o nic konkretnego, dostaje 10.
- Rozmiar strony ma **twardy górny limit** wymuszany po stronie serwera. Klient prosi,
  serwer decyduje: wartość powyżej limitu jest zawężana albo odrzucana, nigdy spełniana.
  Bez tego stronicowanie jest ozdobą — wystarczy poprosić o milion.
- Parametry stronicowania i kształt odpowiedzi (pozycje plus informacja, czy jest dalszy
  ciąg) są **jedną konwencją dla całego API**, opisaną w `@repo/contracts`. Endpoint
  z własnym wariantem nazw albo własnym kształtem odpowiedzi jest błędem, nawet gdy działa.
- Zapytanie do bazy stronicuje **baza**, nie warstwa wyżej. Pobranie wszystkiego i obcięcie
  w serwisie to ten sam problem z dodatkowym kosztem (`.claude/rules/data.md`).
- Lista ma **deterministyczną kolejność**. Sortowanie bez jednoznacznego rozstrzygnięcia
  remisów potrafi pokazać ten sam rekord na dwóch stronach i pominąć inny.

## Bezpieczeństwo

- Każdy endpoint jest domyślnie **chroniony**. Publiczny endpoint musi być oznaczony jawnie
  i mieć powód zapisany w kodzie.
- Zapytanie o dane należące do użytkownika jest **zawsze** zawężone identyfikatorem
  właściciela z sesji — nigdy identyfikatorem przysłanym przez klienta.
- Sekrety wyłącznie ze zmiennych środowiskowych, walidowanych zodem przy starcie procesu.
  Proces bez wymaganej zmiennej ma się nie uruchomić, a nie działać "częściowo".
- Logi nie zawierają tokenów, haseł, ciasteczek ani treści zadań użytkownika.
- **Access ani refresh token nie pojawia się w żadnej odpowiedzi HTTP ani w logu.** Oba żyją
  wyłącznie w module `connections` (ADR-0001); access token nie opuszcza pamięci procesu,
  refresh token nie opuszcza bazy inaczej niż zaszyfrowany.
- Komunikat błędu dla klienta nie ujawnia szczegółów wewnętrznych (stack trace, SQL, ścieżki).

## Tożsamość i logowanie

- **Tożsamość konta ma dwa i tylko dwa źródła: hasło i `googleSub`** (ADR-0004). Każde inne
  połączenie z dostawcą żyje w `connections` i **nie daje logowania** — endpoint logujący
  po cudzym `sub` jest błędem, choćby działał.
- `Account.email` jest zawsze adresem, którym użytkownik się uwierzytelnia. Logowanie Google
  nadpisuje go **wyłącznie** dla konta bez hasła; dla konta z hasłem rozjazd adresów kończy
  się odmową, bo adres jest tam loginem.
- Wiązanie konta Google zaczyna się **tylko za `requireSession`**. Przepływ bez sesji nigdy
  nie dokłada metody logowania do istniejącego konta.
- **Odpowiedź na próbę logowania i na żądanie resetu nie zależy od istnienia konta** —
  ani treścią, ani kodem, ani czasem (ADR-0005). Konto nieistniejące i konto bez hasła też
  przechodzą przez `scrypt`; inaczej czas odpowiedzi jest wyrocznią mimo zgodnych komunikatów.
- Hasło i token ustawienia hasła **nigdy nie występują w bazie, logu ani odpowiedzi w postaci
  jawnej**: hasło jako `scrypt` z solą i własnymi parametrami, token jako skrót SHA-256.
- Udany reset hasła kasuje **wszystkie** sesje konta, zanim powstanie nowa. Zmiana hasła przez
  zalogowanego kasuje wszystkie poza bieżącą. Żadne z nich nie rusza połączeń z `connections`.

## Sesja

- Tożsamość żądania pochodzi wyłącznie z `requireSession` (ADR-0003). Poza modułem `auth`
  żaden kod nie czyta ciasteczka sesji ani tabeli `sessions`.
- W bazie leży wyłącznie skrót SHA-256 identyfikatora sesji. Surowa wartość z ciasteczka
  nie jest zapisywana, logowana ani zwracana w odpowiedzi.
- Wylogowanie kasuje rekord sesji **przed** wyczyszczeniem ciasteczka. Samo wyczyszczenie
  ciasteczka nie jest wylogowaniem.
- `requireSession` sprawdza whitelistę przy każdym żądaniu, nie tylko przy logowaniu.
  Konto poza whitelistą → rekord skasowany, 401, ciasteczko wyczyszczone.

## Błędy

- Jeden kształt błędu dla całego API, zgodny z kontraktem.
- Błąd domenowy (np. "nie znaleziono", "brak uprawnień") to jawny typ, nie gołe `throw new Error`.
- Nieobsłużony wyjątek kończy się kodem 500 i wpisem w logu z identyfikatorem korelacji —
  nigdy cichym 200.

## Operacje zewnętrzne

Każde wywołanie cudzego API ma **timeout** i jawną obsługę porażki. Zewnętrzna usługa,
która nie odpowiada, nie może zawiesić Twojego endpointu.

## Poświadczenie OVH wklejane przez użytkownika (ADR-0024, ADR-0025)

- **Konfiguracja instalacji nie zawiera nic, co daje dostęp do OVH.** Jedyną zmienną `OVH_*`
  jest `OVH_CREDENTIAL_ENC_KEY`. Pojawienie się `OVH_APPLICATION_KEY`, `OVH_APPLICATION_SECRET`,
  `OVH_CONNECT_REDIRECT_URI` albo `OVH_API_BASE_URL` jest błędem.
- **Sekret aplikacji i klucz konsumenta nie występują w żadnej odpowiedzi HTTP, w logu ani
  w typie domenowym repozytorium** — w bazie wyłącznie zaszyfrowane (AES-256-GCM).
- **Region wybiera się z zamkniętej listy** (`ovh-eu`, `ovh-ca`, `ovh-us`). Adres bazowy
  pochodzący z wejścia użytkownika jest błędem bezpieczeństwa (SSRF), choćby działał.
- **Zapis poświadczenia jest poprzedzony podpisanym `GET /auth/currentCredential`** i następuje
  tylko wtedy, gdy przyznane reguły są dokładnie zestawem wymaganym: każda wymagana ścieżka
  pokryta **i** żadna przyznana reguła spoza `OVH_ALLOWED_PATHS` ani z metodą inną niż `GET`.
  Odrzucony komplet nie tworzy wiersza i nie zapisuje sekretu.
- **`OVH_ALLOWED_PATHS` jest jedynym źródłem obu sprawdzeń** i jedyną listą ścieżek, do których
  moduł umie sięgnąć. Metoda HTTP nie jest argumentem interfejsu modułu (ADR-0016).

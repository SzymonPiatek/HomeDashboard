# ADR-0003: Sesja serwerowa w ciasteczku HttpOnly, dwa czasy życia — kiosk i standardowa

- **Status:** Zaakceptowany
- **Data:** 2026-09-09
- **Dotyczy:** auth

## Kontekst

PRD (sekcja 9) rozstrzygnął, że sesja na tablecie w mieszkaniu ma żyć tygodniami lub
miesiącami bez ponownego logowania, a sesja zdalna ma zwykłą politykę wygasania. Problem
techniczny: oba dostępy idą przez **tę samą domenę i ten sam przepływ logowania**, więc
serwer nie ma z czego wywnioskować, z którym przypadkiem ma do czynienia.

Siły napędowe: odebranie dostępu musi działać natychmiast (usunięcie adresu z białej
listy kończy sesję — `.claude/rules/api.md`), ciasteczko HttpOnly jest jedynym nośnikiem
tożsamości, a tablet nie ma klawiatury do wygodnego logowania w Google.

Siły **pozorne**: skala (jedno konto, kilka sesji naraz — koszt zapytania do bazy przy
każdym żądaniu jest bez znaczenia), bezstanowość API (nie ma drugiej instancji ani
autoskalowania), oraz „wykrywanie sieci domowej" po adresie IP — tablet i tak wychodzi
przez publiczną domenę, a wiązanie uprawnień z adresem IP to bezpieczeństwo pozorne.

## Rozważane warianty

### Wariant A — jeden czas życia dla wszystkich sesji (najprostszy)

- **Do czego pasuje:** jedna liczba w konfiguracji, brak dodatkowej kolumny, brak wyboru
  po stronie użytkownika.
- **Co kosztuje:** nic w kodzie — dosłownie stała.
- **Kiedy się zemści:** natychmiast i w obie strony. Krótki czas życia oznacza tablet
  proszący o logowanie Google co tydzień na ekranie dotykowym bez klawiatury; długi
  oznacza półroczną sesję na laptopie zabranym poza dom. Wymaganie z PRD jest wprost
  dwoma różnymi liczbami, więc jedna z nich będzie zawsze zła.

### Wariant B — sesja serwerowa (rekord + nieprzezroczysty identyfikator) z polem rodzaju

- **Do czego pasuje:** dwa czasy życia, natychmiastowe unieważnienie po stronie serwera,
  możliwość skasowania wszystkich sesji przy odebraniu dostępu.
- **Co kosztuje:** jedna tabela, jedna kolumna `kind`, jedno zapytanie do bazy na żądanie
  i jedno pole wyboru na ekranie logowania.
- **Kiedy się zemści:** gdy API zacznie działać w wielu instancjach z osobnymi bazami albo
  gdy zapytanie o sesję stanie się wąskim gardłem — czyli przy skali, której ten projekt
  z założenia nie ma.

### Wariant C — JWT w ciasteczku (sesja bezstanowa)

- **Do czego pasuje:** brak zapytania do bazy przy weryfikacji tożsamości.
- **Co kosztuje:** obsługa podpisu i rotacji klucza, a do unieważniania i tak lista
  odwołanych tokenów w bazie — czyli stan, którego wariant miał nie mieć.
- **Kiedy się zemści:** przy odbieraniu dostępu. Półroczny token kioskowy jest ważny do
  wygaśnięcia niezależnie od tego, co zrobimy z białą listą; jedyną reakcją zostaje
  rotacja klucza, która wylogowuje wszystko naraz i jest nieodwracalna.

## Decyzja

Wybieramy **wariant B**. Wymaganie z PRD to dwie różne liczby, więc rodzaj sesji musi być
zapisany przy niej jawnie — a skoro i tak trzymamy rekord, dostajemy natychmiastowe
unieważnienie za darmo. Rodzaj wybiera człowiek jednym polem na ekranie logowania,
bo serwer nie ma żadnego wiarygodnego sposobu, żeby odróżnić tablet od laptopa.

## Konsekwencje

**Dobre:**

- Odebranie dostępu (zmiana `OWNER_EMAIL`) kończy każdą sesję przy następnym żądaniu.
- Kradzież ciasteczka jest odwracalna: kasujemy rekord.
- Rodzaj sesji jest widoczny w bazie, więc późniejsza lista urządzeń nie wymaga migracji.

**Cena, którą płacimy:**

- Jedno zapytanie do bazy przy każdym żądaniu chronionego endpointu.
- Rodzaj sesji deklaruje logujący się — ktoś, kto ma dostęp do konta Google właściciela,
  może też poprosić o sesję półroczną. Nie osłabia to progu wejścia (nadal trzeba przejść
  Google i białą listę), ale wydłuża okno po udanym włamaniu.
- Wybór „zaufane urządzenie" trzeba pokazać w interfejsie logowania — nie da się go ukryć.

**Co to wymusza w kodzie:**

- Identyfikator sesji: 32 bajty z `crypto.randomBytes`, w base64url. W bazie **wyłącznie**
  `sha256(id)` (kolumna z indeksem unikalnym), nigdy wartość surowa (`.claude/rules/api.md`).
  Nie ma sekretu do podpisu — losowość identyfikatora wystarcza, więc
  `SESSION_COOKIE_SECRET` **nie jest potrzebny** i nie powinien istnieć w `envs/api.env`.
- Ciasteczko: `HttpOnly`, `SameSite=Lax` (powrót z Google to nawigacja GET najwyższego
  poziomu — `Strict` zerwałby przepływ), `Path=/`, `Secure` sterowane `COOKIE_SECURE`
  (`false` w dev na `http://localhost`, `true` na produkcji), `Max-Age` równy czasowi życia.
- Rodzaj sesji: `kiosk` | `standard`. Wybór wchodzi jako parametr startu przepływu
  (`GET /api/auth/google/start?device=kiosk`), jest walidowany zodem wobec zamkniętej listy
  i przenoszony przez ciasteczko `state` (ADR-0001), nie przez query z powrotu Google.
- Czasy życia z konfiguracji, z domyślnymi: `SESSION_TTL_KIOSK_DAYS=180`,
  `SESSION_TTL_STANDARD_DAYS=7`. Wygasanie **przesuwane**: gdy zostało mniej niż połowa
  czasu, `requireSession` przedłuża `expiresAt` i odświeża `Max-Age`. Brak osobnego limitu
  bezczynności — przesuwanie sam nim jest.
- `requireSession` jest **jedynym** źródłem tożsamości żądania i przy każdym żądaniu
  sprawdza: rekord istnieje, nie wygasł, adres konta jest na białej liście. Porażka
  któregokolwiek warunku → rekord skasowany, ciasteczko wyczyszczone, 401.
- Wylogowanie kasuje rekord **przed** wyczyszczeniem ciasteczka.
- Poza modułem `auth` żaden kod nie czyta ciasteczka sesji ani tabeli sesji.
- Wymagania wobec schematu (właściciel: `data-engineer`): `accountId` (FK, `onDelete:
Cascade`), `tokenHash` (unikalny), `kind`, `expiresAt` (indeks), `createdAt`, `updatedAt`.
  Bez `userAgent` i bez adresu IP — to dane użytkownika, których nie potrzebujemy.
- → reguła w `.claude/rules/auth.md`

## Otwarte kwestie

- **Sprzątanie wygasłych sesji** nie ma dziś mechanizmu. Zapytanie zawsze filtruje po
  `expiresAt`, więc nie jest to błąd bezpieczeństwa, tylko rosnąca tabela. Odłożone jako
  BL-009 — do rozstrzygnięcia razem z pierwszym zadaniem cyklicznym w API.
- Etykieta pola wyboru na ekranie logowania („To urządzenie jest zaufane — nie wylogowuj
  mnie") jest propozycją; ostateczne brzmienie należy do `ux-designer`.

## Kiedy wrócić do tej decyzji

Gdy pojawi się drugie konto albo drugi człowiek z dostępem (wtedy „zaufane urządzenie"
przestaje być decyzją jednej osoby) albo gdy `apps/api` zacznie działać w więcej niż
jednej instancji.

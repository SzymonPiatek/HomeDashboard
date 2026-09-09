# Reguły: logowanie i sesja

Wynikają z [ADR-0001](../../docs/adr/0001-google-oauth-two-stage-authorization.md)
i [ADR-0003](../../docs/adr/0003-server-session-with-two-lifetimes.md).
Uzupełniają `.claude/rules/api.md` — nie zastępują go.

## Gdzie mieszka logowanie

- Cały przepływ OAuth żyje w `apps/api/src/modules/auth/**`. `apps/web` nie zna
  `GOOGLE_CLIENT_ID`, nie buduje adresu Google i nie wymienia kodu.
- Start przepływu to **nawigacja przeglądarki** do `/api/auth/google/start`
  (link albo `window.location`), nigdy `fetch`.
- **`apps/api` sam obsługuje prefiks `/api`.** Każda ścieżka route zaczyna się od `/api`,
  a reverse proxy i `rewrites` w dev przekazują ją bez obcinania. Route zamontowany poza
  tym prefiksem jest niedostępny publicznie.

## Tożsamość Google to nie `connections`

- Logowanie zapisuje na koncie **wyłącznie `googleSub` i `email`**. Token dostępu
  i `id_token` otrzymane od Google są odrzucane po odczytaniu tożsamości: nie trafiają
  do bazy, do odpowiedzi HTTP ani do logu. Nie żądamy `access_type=offline`.
- Moduł `connections` (przyszłe integracje danych) przechowuje tokeny do cudzych API
  i **nigdy nie tworzy sesji ani nie zapisuje `googleSub`**. Endpoint logujący po
  poświadczeniu z `connections` jest błędem, choćby działał.

## Biała lista

- Logowanie kończy się sukcesem tylko gdy `email_verified === true` **i** znormalizowany
  adres (`trim`, małe litery) jest równy `OWNER_EMAIL`.
- Każda porażka — brak konta, adres spoza listy, niezweryfikowany adres, błąd wymiany
  kodu — kończy się **tym samym** przekierowaniem i tym samym komunikatem. Rozróżnianie
  przyczyny w odpowiedzi, kodzie albo treści strony jest błędem bezpieczeństwa.
- Log odmowy zawiera identyfikator korelacji, nigdy adres e-mail ani `sub`.

## Sesja

- Identyfikator sesji: 32 bajty z `crypto.randomBytes`. W bazie leży **wyłącznie**
  `sha256(id)`. Sekret do podpisu nie istnieje — zmienna `SESSION_COOKIE_SECRET`
  nie występuje w konfiguracji.
- Ciasteczko: `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` wg `COOKIE_SECURE`,
  `Max-Age` równy czasowi życia sesji.
- Rodzaj sesji to zamknięta lista `kiosk` | `standard`, wybierana parametrem
  `?device=` przy starcie przepływu i przenoszona przez ciasteczko `state` — nigdy
  przez query z powrotu od Google.
- Czas życia z konfiguracji (`SESSION_TTL_KIOSK_DAYS`, `SESSION_TTL_STANDARD_DAYS`),
  przesuwany przez `requireSession`, gdy zostało mniej niż pół okresu.
- `requireSession` sprawdza przy **każdym** żądaniu: rekord istnieje, nie wygasł, adres
  konta jest na białej liście. Porażka → rekord skasowany, ciasteczko wyczyszczone, 401.
- Wylogowanie kasuje rekord sesji **przed** wyczyszczeniem ciasteczka.

## Wywołania do Google

Każde ma timeout i jawną obsługę porażki; odpowiedź jest parsowana zodem przed użyciem.
Niedostępne Google kończy się przekierowaniem z błędem, nigdy zawieszonym żądaniem.

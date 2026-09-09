# ADR-0001: Logowanie wyłącznie kontem Google — dwustopniowy przepływ OAuth po stronie `apps/api`

- **Status:** Zaakceptowany
- **Data:** 2026-09-09
- **Dotyczy:** auth

## Kontekst

PRD (US-1) wymaga logowania kontem Google, bez własnego formularza hasła, z odmową dla
każdego adresu spoza białej listy właściciela i bez ujawniania, czy konto istnieje.
Aplikacja jest jednokontowa, stoi pod jedną publiczną domeną i nie ma trybu offline —
tablet w kuchni łączy się tak samo jak przeglądarka spoza domu.

Siły napędowe: brak własnej infrastruktury haseł i wysyłki e-mail, ciasteczko HttpOnly
jako nośnik sesji, auth w całości w `apps/api` (`.claude/rules/stack.md`), jedno konto.

Siły **pozorne**, które tu nic nie znaczą: skala i wydajność logowania (kilka logowań
na kwartał), wybór wielu dostawców tożsamości (jest jeden użytkownik i jedno konto
Google), SEO i renderowanie ekranu logowania (całość jest za loginem), oraz obsługa
rejestracji — konto powstaje raz, przy pierwszym poprawnym logowaniu właściciela.

**To nie jest mechanizm `connections`.** `connections` (przyszłe integracje danych:
Home Assistant, dostawcy zewnętrzni) przechowuje tokeny dostępu do cudzych API i **nigdy
nie daje logowania**. Logowanie to wyłącznie `googleSub` na koncie; tokeny Google
uzyskane w tym przepływie są odrzucane po odczytaniu tożsamości.

## Rozważane warianty

### Wariant A — kod autoryzacyjny + PKCE w `apps/api`, bez biblioteki OAuth

- **Do czego pasuje:** jeden dostawca, jeden przepływ, poufny klient po stronie serwera;
  dwa endpointy 302 i dwa wywołania HTTP do Google (`/token`, `/userinfo`), wejście
  walidowane zodem, `fetch` z timeoutem z Node 24.
- **Co kosztuje:** ok. 120–150 linii własnego kodu (budowa URL, `state`, PKCE, wymiana
  kodu, odczyt tożsamości) plus testy tych ścieżek. Brak lock-inu — kod zna tylko
  publiczny protokół OAuth 2.0.
- **Kiedy się zemści:** gdy dojdzie drugi dostawca tożsamości albo wymóg weryfikacji
  podpisu `id_token` bez kanału TLS (np. logowanie inicjowane w przeglądarce) — wtedy
  trzeba dopisać obsługę JWKS i rotacji kluczy, czyli dokładnie to, co biblioteka daje
  z pudełka.

### Wariant B — biblioteka (`openid-client` albo `google-auth-library`)

- **Do czego pasuje:** pełna zgodność z OIDC, discovery, weryfikacja podpisu `id_token`,
  gotowa obsługa rotacji kluczy.
- **Co kosztuje:** nowa zależność (kilkaset kB z drzewem zależności) wymagająca zgody
  użytkownika, własne API do nauczenia się i utrzymanie zgodności przy aktualizacjach.
- **Kiedy się zemści:** gdy biblioteka zmieni API między wersjami głównymi (`openid-client`
  robił to niejednokrotnie) i trzeba przepisać jedyny przepływ logowania w aplikacji,
  żeby dostać dokładnie to samo zachowanie.

### Wariant C — Google Identity Services w przeglądarce (`id_token` z frontu)

- **Do czego pasuje:** najmniej kodu widocznego w API, gotowy przycisk i One Tap.
- **Co kosztuje:** skrypt Google w `apps/web`, część logiki logowania w warstwie
  prezentacji, a po stronie API i tak weryfikacja podpisu `id_token` przez JWKS.
- **Kiedy się zemści:** natychmiast — łamie regułę „auth mieszka w całości w `apps/api`"
  (`.claude/rules/stack.md`) i rozmywa granicę front/back w najbardziej wrażliwym miejscu.

## Decyzja

Wybieramy **wariant A**. Jeden dostawca i poufny klient serwerowy sprowadzają całość do
dwóch przekierowań i dwóch wywołań HTTP, więc biblioteka rozwiązywałaby problemy, których
tu nie ma. Tożsamość odczytujemy z `GET /userinfo` po bezpośrednim, TLS-owym wywołaniu do
Google — dzięki temu nie ma w kodzie ani parsowania JWT, ani obsługi JWKS.

## Konsekwencje

**Dobre:**

- Zero nowych zależności; logowanie zna wyłącznie publiczny protokół.
- Cały sekret (client secret, wymiana kodu) nie opuszcza `apps/api`.
- Odmowa spoza białej listy jest jednym kodem i jednym komunikatem — nie ma czego
  porównywać ani mierzyć, bo ścieżka jest identyczna dla konta istniejącego i nie.

**Cena, którą płacimy:**

- Drugi dostawca tożsamości albo przepływ inicjowany w przeglądarce wymusi dopisanie
  weryfikacji `id_token` (JWKS) albo powrót do wariantu B.
- Jedno dodatkowe wywołanie HTTP przy logowaniu (`/userinfo`) zamiast odczytu `id_token`.
- Utrata dostępu do konta Google odcina właściciela od pulpitu — metoda zapasowa jest
  świadomie odłożona (BL-008).

**Co to wymusza w kodzie:**

- `GET /api/auth/google/start` → 302 na Google; `state` i PKCE `code_verifier` w krótko
  żyjącym ciasteczku HttpOnly (10 min), zakres `openid email`, bez `access_type=offline`.
- `GET /api/auth/google/callback` → 302 do aplikacji. Oba endpointy odpowiadają wyłącznie
  przekierowaniem, więc **nie mają schematów w `@repo/contracts`**; ich query walidowane
  jest zodem lokalnie w `apps/api` (`.claude/rules/contracts.md`).
- Warunek wpuszczenia: `email_verified === true` **i** znormalizowany (`trim`, małe litery)
  adres równy `OWNER_EMAIL`. Każda porażka → to samo 302 na `/login?error=access_denied`.
- Token dostępu i `id_token` od Google żyją wyłącznie w pamięci obsługi żądania: nie
  trafiają do bazy, do odpowiedzi ani do logu. Refresh tokena nie żądamy.
- Konto identyfikowane po `googleSub`; `email` aktualizowany przy każdym logowaniu
  (konto nie ma dziś hasła — `.claude/rules/api.md`).
- **`apps/api` sam obsługuje prefiks `/api`**, reverse proxy go nie obcina. Dzięki temu
  `GOOGLE_REDIRECT_URI` (`…/api/auth/google/callback`, `envs/api.env`) jest dosłownie tą
  samą ścieżką, którą widzi Express — w dev przez `rewrites` w `apps/web`, na produkcji
  przez proxy. Przekierowania po callbacku są **względne** (`/`, `/login?error=…`), więc
  API nie potrzebuje znać własnego adresu publicznego.
- Każde wywołanie Google ma timeout i jawną obsługę porażki (`.claude/rules/api.md`).
- → reguła w `.claude/rules/auth.md`

## Otwarte kwestie

- Kształt `GET /api/auth/session` (czy zwraca sam `authenticated`, czy też adres e-mail)
  rozstrzyga `backend-dev` przy pisaniu kontraktu — to decyzja odwracalna.
- Ekran `/login` z komunikatem odmowy projektuje `ux-designer`; treść nie może różnicować
  przyczyny odmowy.

## Kiedy wrócić do tej decyzji

Gdy pojawi się druga metoda logowania (BL-008 albo drugi dostawca OAuth) albo gdy
Google przestanie wystawiać `/userinfo` w obecnej formie — wtedy wariant B przestaje być
nadmiarowy.

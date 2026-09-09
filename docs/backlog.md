# Backlog

Rzeczy świadomie odłożone podczas pracy nad projektem — poza zakresem danego PRD,
ADR-a albo gałęzi, z zapisanym kosztem zaniechania. Wpis nie jest zadaniem na
konkretny termin; jest pamięcią o świadomej decyzji, żeby nie trzeba było jej
odtwarzać z rozmowy sprzed miesięcy.

## Format wpisu

Każdy wpis ma nagłówek `### BL-NNN — tytuł` (kolejny wolny numer, numer raz użyty
nie wraca do puli nawet po zamknięciu wpisu) i cztery pola:

- **Źródło** — dokument, w którym padła decyzja o odłożeniu (PRD, ADR, wykaz zmian
  gałęzi), z linkiem.
- **Co odkładamy** — krótki opis, bez projektowania rozwiązania.
- **Koszt zaniechania** — co się nie dzieje, dopóki tego nie zrobimy; jeśli wpis
  zależy od innego, zależność jest tu nazwana wprost.
- **Status** — `otwarte` | `zablokowane (powód)` | `podjęte (gałąź SP-...)` |
  `zamknięte (powód)`.

Wpisy sortowane rosnąco po numerze. Numer nie oznacza priorytetu ani kolejności.

## Wpisy

### BL-001 — Rzut mieszkania w 3D

- **Źródło:** [docs/prd/pulpit-domowy-mvp.md](prd/pulpit-domowy-mvp.md), sekcja 5
- **Co odkładamy:** trójwymiarową wizualizację mieszkania obok dzisiejszego rzutu 2D.
- **Koszt zaniechania:** brak przestrzennego, bardziej realistycznego podglądu
  mieszkania. Ryzyko niskie — 2D już daje wartość samodzielnie, 3D jest naturalnym
  rozszerzeniem, nie brakującym fundamentem.
- **Status:** otwarte

### BL-002 — Integracja z Home Assistant (nawilżacz Xiaomi, lodówka Samsung)

- **Źródło:** [docs/prd/pulpit-domowy-mvp.md](prd/pulpit-domowy-mvp.md), US-6 i sekcja
  Ryzyka
- **Co odkładamy:** rzeczywisty odczyt i sterowanie stanem urządzeń IoT przez
  centralny hub Home Assistant na Raspberry Pi.
- **Koszt zaniechania:** rzut mieszkania pozostaje statyczną ikonografią bez
  prawdziwego stanu urządzeń; właściciel nadal sprawdza Mi Home i SmartThings
  osobno. Nie planować sprintu wcześniej, niż sprzęt fizycznie zacznie działać.
- **Do rozstrzygnięcia razem z tym wpisem (jeszcze nierozwiązane):** `apps/api`
  docelowo działa na VPS właściciela, Home Assistant będzie stał na Raspberry Pi
  za NAT-em domowego routera bez otwartych portów publicznych — potrzebny tunel
  inicjowany od strony Raspberry Pi (np. WireGuard/Tailscale) między VPS a
  mieszkaniem, nie odwrotnie. Rozstrzyga `release-engineer` razem z
  `web-architect`, dopiero gdy sprzęt fizycznie stanie.
- **Status:** zablokowane (Raspberry Pi z Home Assistant jeszcze nie istnieje fizycznie)

### BL-003 — Automatyzacje/reguły sterujące urządzeniami

- **Źródło:** [docs/prd/pulpit-domowy-mvp.md](prd/pulpit-domowy-mvp.md), sekcja 5
- **Co odkładamy:** logikę warunkową (np. "włącz nawilżacz przy niskiej wilgotności")
  działającą bez ręcznej interakcji.
- **Koszt zaniechania:** brak automatycznej reakcji na warunki środowiskowe;
  wszystkim steruje się ręcznie.
- **Status:** zablokowane (zależy od BL-002 — nie ma czym sterować automatycznie)

### BL-004 — Historia i wykresy stanu urządzeń

- **Źródło:** [docs/prd/pulpit-domowy-mvp.md](prd/pulpit-domowy-mvp.md), sekcja 5
- **Co odkładamy:** zapis stanu w czasie i wizualizację trendów (np. wilgotność,
  temperatura).
- **Koszt zaniechania:** brak wglądu w trendy, tylko stan bieżący; decyzje oparte
  wyłącznie na chwilowej migawce.
- **Status:** zablokowane (zależy od BL-002 jako źródła danych)

### BL-005 — Powiadomienia o stanie urządzeń

- **Źródło:** [docs/prd/pulpit-domowy-mvp.md](prd/pulpit-domowy-mvp.md), sekcja 5
- **Co odkładamy:** proaktywne informowanie (push/e-mail/SMS) o zdarzeniach, np.
  niskim poziomie wody w nawilżaczu.
- **Koszt zaniechania:** właściciel dowiaduje się o problemach dopiero przy wejściu
  na pulpit, nie w czasie rzeczywistym.
- **Status:** zablokowane (zależy od BL-002)

### BL-006 — Import planu mieszkania / automatyczna detekcja układu

- **Źródło:** [docs/prd/pulpit-domowy-mvp.md](prd/pulpit-domowy-mvp.md), sekcja 5
- **Co odkładamy:** wczytanie gotowego planu (np. PDF/CAD) albo automatyczne
  rozpoznanie ścian, zamiast ręcznego rysowania na siatce.
- **Koszt zaniechania:** każda zmiana układu mieszkania wymaga ręcznej edycji;
  wolniej, bardziej pracochłonnie — realne ryzyko, że rzut przestanie być
  aktualizowany (patrz ryzyka w PRD).
- **Status:** otwarte

### BL-007 — Więcej urządzeń i marek smart home

- **Źródło:** [docs/prd/pulpit-domowy-mvp.md](prd/pulpit-domowy-mvp.md), sekcja 5
- **Co odkładamy:** rozszerzenie poza dzisiejszy zestaw (nawilżacz Xiaomi, lodówka
  Samsung) o kolejne urządzenia i marki.
- **Koszt zaniechania:** pulpit pokrywa tylko dwa dzisiejsze urządzenia; każde
  kolejne wymaga osobnej integracji przez Home Assistant.
- **Status:** zablokowane (zależy od BL-002)

### BL-008 — Logowanie hasłem + 2FA e-mail jako metoda zapasowa

- **Źródło:** [docs/prd/pulpit-domowy-mvp.md](prd/pulpit-domowy-mvp.md), sekcja 9
- **Co odkładamy:** drugą ścieżkę logowania (hasło + jednorazowy kod e-mail) obok
  Google, na wypadek utraty dostępu do konta Google. Model tożsamości z dwoma
  źródłami (hasło i `googleSub`) jest już przewidziany w `.claude/rules/api.md`.
- **Koszt zaniechania:** utrata dostępu do konta Google właściciela odcina go od
  własnego pulpitu bez żadnej alternatywy logowania.
- **Status:** otwarte

### BL-009 — Sprzątanie wygasłych sesji

- **Źródło:** [docs/adr/0003-server-session-with-two-lifetimes.md](adr/0003-server-session-with-two-lifetimes.md),
  sekcja "Otwarte kwestie"
- **Co odkładamy:** cykliczne usuwanie z bazy wierszy `Session` z `expiresAt` w
  przeszłości. `requireSession` i tak filtruje po `expiresAt`, więc to nie jest luka
  bezpieczeństwa — tylko rosnąca tabela.
- **Koszt zaniechania:** tabela sesji rośnie bez ograniczenia; do rozstrzygnięcia razem
  z pierwszym zadaniem cyklicznym w `apps/api`.
- **Status:** otwarte

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
- **Status:** podjęte (gałąź SP-005) — widok 3D w Three.js istnieje obok 2D i czyta te same
  dane. Ułożenie wielu kondygnacji jedna nad drugą jest osobnym wpisem BL-018.

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

### BL-010 — Uporządkowanie odwołań do nieistniejących numerów ADR w regułach

- **Źródło:** [docs/adr/README.md](adr/README.md), sekcja o nieciągłościach numeracji
- **Co odkładamy:** rozstrzygnięcie, co zrobić z odwołaniami do ADR-0004, 0005, 0007, 0009,
  0016, 0017, 0019, 0020, 0024, 0025 w `.claude/rules/api.md`, `web.md` i `data.md` —
  pochodzą z projektu referencyjnego i nie mają dokumentów w tym repozytorium.
- **Koszt zaniechania:** treść reguły obowiązuje, ale numer prowadzi donikąd; każdy agent
  traci czas na szukanie dokumentu, którego nie ma, i nie wie, czy reguła jest aktualna.
  Wpis istniał tylko jako odwołanie w `docs/adr/README.md` — spisany 2026-09-09.
- **Status:** otwarte

### BL-011 — Otwory w ścianach: drzwi i okna

- **Źródło:** [docs/adr/0002-floor-plan-normalized-entities-in-millimeters.md](adr/0002-floor-plan-normalized-entities-in-millimeters.md)
- **Co odkładamy:** modelowanie otworów przypiętych do ściany (położenie wzdłuż ściany,
  szerokość, wysokość, wysokość parapetu) i ich rysowanie w rzucie.
- **Koszt zaniechania:** rzut 2D pokazuje mieszkanie bez przejść między pokojami, a przyszły
  widok 3D (BL-001) wygląda jak zamknięty bunkier. Dołożenie jest w pełni addytywne —
  ściana jest wierszem z identyfikatorem, więc otwory dokłada się nową tabelą bez migracji
  istniejących danych.
- **Status:** otwarte

### BL-012 — Typ pokoju, materiał podłogi i elewacja podłogi

- **Źródło:** [docs/adr/0002-floor-plan-normalized-entities-in-millimeters.md](adr/0002-floor-plan-normalized-entities-in-millimeters.md)
- **Co odkładamy:** pokój ma dziś wyłącznie nazwę. Brakuje typu (kuchnia, łazienka…),
  materiału podłogi i elewacji względem poziomu zero (próg na balkon, podest).
- **Koszt zaniechania:** wypełnienie podłogi w 2D jest jednolite i nieinformacyjne, a 3D
  nie ma czym pokryć podłóg ani jak pokazać różnicy poziomów. Dołożenie kolumn jest
  addytywne, więc dług jest tani.
- **Status:** otwarte

### BL-013 — Serwerowa walidacja prostoty wielokąta pokoju

- **Źródło:** [docs/adr/0002-floor-plan-normalized-entities-in-millimeters.md](adr/0002-floor-plan-normalized-entities-in-millimeters.md)
- **Co odkładamy:** sprawdzenie po stronie API, że wielokąt pokoju nie przecina sam siebie
  i ma dodatnie pole. Kontrakt pilnuje dziś tylko liczby i unikalności wierzchołków.
- **Koszt zaniechania:** użytkownik może zapisać pokój w kształcie ósemki; wygląda dziwnie
  w 2D, a w 3D triangulacja podłogi da nieprzewidywalny wynik. Przy jednym koncie szkodzi
  wyłącznie samemu autorowi rzutu, dlatego to nie jest blokada.
- **Status:** otwarte

### BL-014 — Wiele kondygnacji i wiele rzutów na koncie

- **Źródło:** [docs/adr/0002-floor-plan-normalized-entities-in-millimeters.md](adr/0002-floor-plan-normalized-entities-in-millimeters.md)
- **Co odkładamy:** poziom/kondygnację jako byt (dom dwupiętrowy, piwnica) oraz więcej niż
  jeden rzut na konto — dziś `FloorPlan.accountId` jest unikalny, a zasób nie ma
  identyfikatora w adresie.
- **Koszt zaniechania:** model obsługuje wyłącznie jedno mieszkanie na jednym poziomie,
  zgodnie z PRD. Zmiana wymagałaby nowej encji, identyfikatora w ścieżce API i przepięcia
  istniejących wierszy — to najdroższy z odłożonych tu długów.
- **Status:** podjęte (gałąź SP-007) — rozstrzygnięte w
  [ADR-0008](adr/0008-level-as-floor-plan-aggregate-root.md); przepięcia wierszy nie było,
  bo schemat z ADR-0002 nigdy nie trafił do bazy.

### BL-015 — Kafelki elementów na pulpicie

- **Źródło:** [docs/adr/0002-floor-plan-normalized-entities-in-millimeters.md](adr/0002-floor-plan-normalized-entities-in-millimeters.md)
- **Co odkładamy:** renderowanie kafelków elementów na stronie pulpitu (`/`). Rejestr
  elementów powstaje w gałęzi SP-005 jako źródło nawigacji i tras, bez części kafelkowej.
- **Koszt zaniechania:** wejście na rzut mieszkania prowadzi wyłącznie przez nawigację —
  US-2 jest spełnione, ale główny scenariusz z PRD (krok 3: „widzi pulpit z kafelkami")
  jeszcze nie. Rejestr ma już miejsce na komponent kafelka, więc dołożenie jest addytywne.
- **Status:** podjęte (gałąź SP-007) — pulpit renderuje kafelki nawigacyjne z rejestru
  (etykieta + adres). Kafelek pokazujący dane elementu to osobny wpis BL-019.

### BL-016 — Podpowiadanie pokoju z domkniętych obszarów grafu ścian

- **Źródło:** [docs/adr/0002-floor-plan-normalized-entities-in-millimeters.md](adr/0002-floor-plan-normalized-entities-in-millimeters.md),
  wariant C
- **Co odkładamy:** wykrywanie domkniętych obszarów między ścianami i proponowanie z nich
  gotowego wielokąta pokoju, zamiast obrysowywania go ręcznie.
- **Koszt zaniechania:** pokój rysuje się drugi raz po tych samych liniach, a przesunięcie
  ściany nie przesuwa krawędzi pokoju — trzeba poprawić oba. Przy jednym mieszkaniu
  edytowanym rzadko to niedogodność, nie blokada.
- **Status:** otwarte

### BL-017 — Zmiana kolejności poziomów

- **Źródło:** [docs/adr/0008-level-as-floor-plan-aggregate-root.md](adr/0008-level-as-floor-plan-aggregate-root.md),
  `.claude/rules/locations.md`
- **Co odkładamy:** endpoint przestawiający `order` poziomów w lokalizacji i odpowiadający
  mu interfejs (przeciąganie albo „w górę / w dół" z klawiatury).
- **Koszt zaniechania:** kolejność pięter wynika wyłącznie z kolejności zakładania —
  poziom dodany po fakcie („piwnica" po parterze i piętrze) ląduje na końcu listy i nie da
  się go przesunąć bez zabawy w usuwanie i zakładanie od nowa, co kasuje jego rzut.
  Dlatego `order` nie ma ograniczenia unikalności: przyszła zmiana kolejności przepisze
  wiele wierszy w jednej transakcji.
- **Status:** otwarte

### BL-018 — Elewacja poziomu i wspólny widok 3D wielu kondygnacji

- **Źródło:** [docs/adr/0008-level-as-floor-plan-aggregate-root.md](adr/0008-level-as-floor-plan-aggregate-root.md)
- **Co odkładamy:** kolumnę z wysokością posadowienia poziomu (`elevationMm`) i widok 3D
  pokazujący piętra ułożone jedno nad drugim, zamiast jednego naraz.
- **Koszt zaniechania:** 3D pokazuje pojedyncze piętro; nie widać, jak budynek wygląda
  w całości ani czy piętra do siebie pasują. Dołożenie kolumny jest addytywne (`Int`
  z wartością domyślną), więc dług jest tani — dopóki nikt nie zacznie udawać elewacji
  przesunięciem współrzędnych w rzucie.
- **Status:** otwarte

### BL-019 — Kafelek pulpitu pokazujący dane elementu

- **Źródło:** [docs/adr/0008-level-as-floor-plan-aggregate-root.md](adr/0008-level-as-floor-plan-aggregate-root.md),
  wykaz zmian gałęzi SP-007
- **Co odkładamy:** kafelek z własną treścią (miniatura rzutu, liczba lokalizacji, stan) —
  czyli pole `Tile: ComponentType | null` w rejestrze elementów i granica błędu wokół niego.
  Dziś pulpit renderuje kafelki nawigacyjne wyłącznie z etykiety i adresu.
- **Koszt zaniechania:** pulpit jest listą linków, nie przeglądem stanu mieszkania.
  Pola w rejestrze świadomie **nie** dokładamy z góry: przy jednym rodzaju kafelka byłoby
  wpisane `null` przy każdym elemencie i nie rozdzielałoby niczego.
- **Status:** otwarte

### BL-020 — Edytor rzutu: rysowanie i edycja ścian oraz pokoi

- **Źródło:** wykaz zmian gałęzi [SP-005](../.changelog/SP-005_floor-plan-2d.md) i SP-007
- **Co odkładamy:** interfejs, którym użytkownik rysuje ścianę, przesuwa ją, usuwa,
  obrysowuje pokój i nadaje mu nazwę — wraz z pełnym odpowiednikiem klawiaturowym
  i przyciąganiem do siatki. Endpoint `PUT .../plan` istnieje i działa, ale w SP-007
  nie ma go kto zawołać z interfejsu.
- **Koszt zaniechania:** **to jest brakujące US-3 z PRD.** Do czasu jego zrobienia rzut
  poziomu można wypełnić wyłącznie seedem albo ręcznym żądaniem `PUT`, a każdy nowy poziom
  jest pusty na zawsze. Bez tego cała gałąź SP-007 daje strukturę bez treści.
- **Status:** otwarte

### BL-021 — Serwerowa walidacja czworokąta ściany

- **Źródło:** [docs/adr/0010-wall-as-four-corner-block.md](adr/0010-wall-as-four-corner-block.md)
- **Co odkładamy:** sprawdzenie po stronie API, że cztery rogi ściany tworzą niezdegenerowany,
  nieprzecinający się czworokąt o dodatnim polu. Kontrakt pilnuje dziś tylko arności czterech
  punktów i zakresu współrzędnych.
- **Koszt zaniechania:** błędne dane (np. z przyszłego edytora albo z pomyłki w seedzie)
  zapiszą ścianę w kształcie kokardki albo o zerowej powierzchni; 2D narysuje dziwactwo,
  a 3D dostanie bryłę o nieprzewidywalnej orientacji ścianek. Bliźniaczy problem dla pokoju
  opisuje BL-013 — warto rozstrzygnąć oba razem, jedną funkcją geometryczną.
- **Status:** otwarte

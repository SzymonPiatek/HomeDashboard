# ADR-0002: Rzut mieszkania — znormalizowane encje w milimetrach, zapisywane jako jeden dokument

- **Status:** Zaakceptowany
- **Data:** 2026-09-09
- **Dotyczy:** baza / kontrakt API / dane elementu pulpitu

## Kontekst

PRD (US-2, US-3) wymaga, żeby właściciel ręcznie narysował ściany, a układ przetrwał
ponowne wejście na stronę. Do tego użytkownik zawęził pierwszą gałąź do **ścian, powierzchni
pomieszczeń i nazwania pokoi** — meble i urządzenia (US-4) są osobną gałęzią.

Siły napędowe:

- **Te same dane mają zasilić późniejszy widok 3D** (BL-001). Wysokość i grubość ściany
  muszą mieć naturalne miejsce w modelu, nawet jeśli 2D dziś ich nie renderuje.
- **Kolejna gałąź (US-4) doda obiekty wskazujące na pokój i na ścianę** — „TV na ścianie
  salonu". Klucz obcy musi mieć w co celować.
- `.claude/rules/data.md`: brak wspólnej tabeli na dane elementów; JSON wyłącznie na
  ustawienia instancji, nigdy na rekordy, które się listuje i renderuje.
- Dostępność (NFR): przesuwanie ma mieć pełny odpowiednik klawiaturowy, więc pojedyncza
  ściana i pojedynczy wierzchołek muszą być adresowalnymi, nazywalnymi obiektami.

Siły **pozorne**, które tu nie obowiązują: skala (jedno mieszkanie, ≤50 obiektów — koszt
zapytań i rozmiar odpowiedzi są bez znaczenia), współbieżna edycja wielu osób (jedno konto),
wersjonowanie historii rzutu (cofanie żyje w przeglądarce), oraz „elastyczność schematu"
— układ mieszkania to geometria o stałym kształcie, nie dane o nieznanej strukturze.

## Rozważane warianty

### Wariant A — jeden wiersz `FloorPlan` z dokumentem JSON

- **Do czego pasuje:** najprostszy możliwy zapis; jedna tabela, jedna kolumna, zero migracji
  przy zmianie kształtu geometrii.
- **Co kosztuje:** dosłownie nic dziś — walidacja zodem i tak istnieje po obu stronach.
- **Kiedy się zemści:** przy US-4, czyli w następnej gałęzi. Obiekt „TV w salonie" potrzebuje
  klucza obcego do pokoju, a do wnętrza JSON-a nie da się go założyć — spójność przeniosłaby
  się do kodu aplikacji, gdzie nikt jej nie pilnuje. Drugi raz zemści się przy 3D: otwory
  w ścianach (drzwi, okna) to relacja do konkretnej ściany. Wprost zakazany przez
  `.claude/rules/data.md`.

### Wariant B — encje: ściana jako odcinek, pokój jako własny wielokąt

- **Do czego pasuje:** ściana i pokój są wierszami z identyfikatorem, więc mają do czego
  przypiąć meble, urządzenia i przyszłe otwory; cały rzut czyta się i zapisuje jednym
  żądaniem, bo jest jednym agregatem.
- **Co kosztuje:** cztery tabele (`FloorPlan`, `Wall`, `Room`, `RoomVertex`), zapis jako
  transakcja różnicowa (usuń nieobecne, wstaw/uaktualnij resztę), pole `version` do wykrycia
  równoległego zapisu z drugiego urządzenia.
- **Kiedy się zemści:** gdy pokój i ściany się rozjadą — przesunięcie ściany **nie** przesuwa
  krawędzi pokoju, bo to dwa niezależne byty. Przy ręcznej edycji z przyciąganiem do siatki
  to drobiazg, przy imporcie planu (BL-006) albo częstych przebudowach byłoby uciążliwe.

### Wariant C — graf węzłów, pokój wyliczany z domkniętych obszarów

- **Do czego pasuje:** wspólny wierzchołek trzyma ściany razem przy przesuwaniu; pokoje
  powstają same z domkniętych oczek grafu, więc nie da się ich rozjechać ze ścianami.
- **Co kosztuje:** tabela węzłów ze sprzątaniem sierot, wykrywanie ścian planarnych
  (face extraction) i — najdroższe — **stabilna tożsamość wyliczonego obszaru**, do której
  przypina się nazwę i przyszłe urządzenia.
- **Kiedy się zemści:** przy pierwszej niedomkniętej ścianie. Rzut w trakcie rysowania prawie
  zawsze jest niedomknięty, więc pokój znika i wraca, a razem z nim jego nazwa. Do tego nie
  da się nazwać części otwartej przestrzeni (aneks kuchenny) bez rysowania ściany, której
  w mieszkaniu nie ma.

## Decyzja

Wybieramy **wariant B**. Ściana i pokój muszą być wierszami z identyfikatorem, bo już następna
gałąź (US-4) wiesza na nich obiekty kluczem obcym, a 3D dokłada otwory relacją do ściany.
Pokój rysujemy jako samodzielny wielokąt, bo nazwa i przyszłe urządzenia potrzebują bytu,
który nie znika w trakcie rysowania — cenę (możliwy rozjazd ze ścianami) płaci przyciąganie
do siatki, a nie schemat.

## Konsekwencje

**Dobre:**

- Współrzędne są **milimetrami całkowitymi** w rzeczywistej skali, więc 3D czyta te same
  liczby bez współczynnika konwersji, a wymiar można pokazać użytkownikowi („3,40 m").
- Ściana ma `thicknessMm` i `heightMm` od pierwszej migracji; 2D używa dziś tylko grubości,
  3D wyciągnie bryłę bez zmiany schematu.
- Otwory (drzwi, okna) dokłada się później **wyłącznie addytywnie**, jako tabelę wskazującą
  na `Wall` — bez ruszania istniejących danych.
- Cały rzut to jeden agregat: odczyt i zapis są atomowe, a `version` zamienia cichą utratę
  edycji z drugiego urządzenia w jawny konflikt 409.

**Cena, którą płacimy:**

- Krawędź pokoju jest niezależna od ściany — przesunięcie ściany zostawia wielokąt na miejscu.
- Zapis przesyła i przepisuje cały dokument, także gdy zmieniła się jedna ściana.
- Wierzchołki pokoju są osobnymi wierszami, więc każdy zapis pokoju to usunięcie i wstawienie
  jego wierzchołków — akceptowalne przy ≤32 wierzchołkach, bez sensu przy tysiącach.

**Co to wymusza w kodzie:**

- Kolumną właściciela dla `Wall`, `Room` i `RoomVertex` jest **`floorPlanId`**, a nie
  `accountId`: rzut jest korzeniem agregatu i jedynym miejscem, gdzie żyje właścicielstwo.
  Zapytanie o ścianę po samym jej identyfikatorze jest błędem bezpieczeństwa
  → reguła w `.claude/rules/floor-plan.md`.
- Identyfikatory ścian i pokoi generuje przeglądarka (`crypto.randomUUID()`), żeby zaznaczenie
  i fokus przeżyły zapis. Kolumna `id` jest `uuid` bez wartości domyślnej, a kontrakt waliduje
  jej format → reguła w `.claude/rules/floor-plan.md`.
- Brak zapisanego rzutu **nie jest błędem**: `GET` zwraca pusty dokument z `version: 0`
  (US-2), a wiersz `FloorPlan` powstaje dopiero przy pierwszym zapisie.
- Twarde limity (liczba ścian, pokoi, wierzchołków, zakres współrzędnych) żyją w
  `@repo/contracts` i są egzekwowane po stronie serwera — to one, a nie stronicowanie,
  ograniczają rozmiar odpowiedzi.

## Kiedy wrócić do tej decyzji

Gdy pojawi się druga kondygnacja albo drugi rzut na koncie (dziś `accountId` jest unikalny),
gdy import planu (BL-006) zacznie generować setki segmentów, albo gdy rozjazd ścian i pokoi
okaże się realnie uciążliwy w codziennej edycji — wtedy wraca wariant C, ale już z pokojem
jako trwałym bytem, któremu graf tylko podpowiada kształt.

## Potwierdzenie z praktyki (dopisane 2026-09-09, decyzji nie zmienia)

Analiza kodu `furnishup/blueprint3d`: ekstruzja ściany do 3D bierze tam odsunięcie z połowy grubości
i wysokość wprost z pól ściany, a pokój — wyliczany z grafu, identyfikowany skrótem z narożników —
traci tożsamość przy każdej zmianie kształtu.

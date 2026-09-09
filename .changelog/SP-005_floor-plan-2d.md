# Wykaz zmian: SP-005_floor-plan-2d

- **Gałąź:** `SP-005_floor-plan-2d`
- **Rozpoczęto:** 2026-09-09
- **Status:** w toku

## Po co ta zmiana

Pierwsza gałąź implementacyjna elementu pulpitu "Rzut mieszkania". Zanim ruszy pełna
implementacja z bazą i kontraktem API, potrzebny był techniczny dowód słuszności
podejścia: czy da się rysować ściany w 2D (SVG) i wyciągać z tych samych danych bryłę
3D (Three.js), i jaki kształt danych ściany faktycznie się do tego nadaje. Odpowiedź
na to drugie pytanie zmieniła się w trakcie pracy — stąd trzy kolejne przebudowy
modelu ściany opisane niżej, nie jedna.

## Co się zmieniło

| Data       | Obszar       | Zmiana                                                                                                                                                  |
| ---------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-09 | architektura | ADR-0002 — model danych rzutu (ściany, pokoje, milimetry)                                                                                               |
| 2026-09-09 | architektura | ADR-0006 — rysunek 2D w SVG, nie Canvas (uzasadnione też analizą kodu blueprint3d)                                                                      |
| 2026-09-09 | web          | Prototyp elementu: dane na sztywno, widok 2D (SVG) i 3D (Three.js), przełącznik trybu, trasa `/floor-plan`                                              |
| 2026-09-09 | web          | Poprawka: kolory motywu (`oklch()`) nie parsowały się w `THREE.Color` — rasteryzacja przez canvas 2D                                                    |
| 2026-09-09 | web          | Poprawka: kontener widoku 3D miał wysokość 0px (`h-full` w zagnieżdżonym flexie) — zamiana na `flex-1`                                                  |
| 2026-09-09 | web          | Przebudowa modelu ściany: z osi (`startX/Y`, `endX/Y`, `thicknessMm`) na blok o czterech jawnych rogach (`points`), bez pola grubości — patrz „Decyzje" |
| 2026-09-09 | web          | Sprzątanie komentarzy w plikach elementu floor-plan po ustabilizowaniu modelu                                                                           |
| 2026-09-09 | web          | Docelowe dane testowe: nieregularne mieszkanie ~41m² (Hol, Łazienka, Sypialnia, Salon z kuchnią) z uskokiem w ścianie zewnętrznej                       |

## Decyzje podjęte po drodze

- **Model ściany zmienił się z „oś + grubość" na „cztery jawne rogi", już po zaakceptowaniu
  ADR-0002.** Pierwsze podejście (centerline + `thicknessMm`, z formułą wydłużającą koniec
  ściany o połowę grubości sąsiada) domykało narożniki tylko wtedy, gdy sąsiednie ściany
  faktycznie stykały się dokładnie w tym samym punkcie — a jedna literówka we współrzędnych
  (50mm przesunięcia) wystarczyła, żeby zostawić niewidoczną na pierwszy rzut oka dziurę.
  Użytkownik chciał modelu bliższego CAD: ściana to z góry policzony prostokąt (4 punkty),
  renderer niczego nie wylicza ani nie wydłuża. **To robi ADR-0002 (sekcja o modelu `Wall`)
  nieaktualnym wobec kodu** — ADR nie został jeszcze podmieniony na nowy ze zdaniem
  „Zastępuje ADR-0002", zgodnie z `.claude/rules/git.md`/konwencją ADR. Trzeba to zrobić,
  zanim `data-engineer` zacznie projektować prawdziwy schemat, żeby nie projektował go
  z nieaktualnego dokumentu.
- **Wysokość ściany jest dziś stałą globalną (`DEFAULT_WALL_HEIGHT_MM = 2500`), nie polem
  na ścianie** — uproszczenie spike'a, świadomie tymczasowe.
- **Salon i kuchnia to jeden pokój, nie dwa połączone otworem** — otwory w ścianach
  (drzwi/przejścia) to BL-011, jeszcze nie zbudowane; modelowanie „otwartej kuchni" jako
  osobnego pokoju bez ściany działowej było najprostszym sposobem oddania tego dziś.
- **Rasteryzacja koloru przez canvas 2D zamiast ufania `getComputedStyle`** — nowoczesne
  przeglądarki potrafią zwrócić `oklch()` zamiast `rgb()`, a `THREE.Color.setStyle()` tego
  nie parsuje; canvas wymusza sRGB niezależnie od wejściowej notacji.

## Świadomie pominięte

- Rysowanie/edycja ścian przez użytkownika — ta gałąź pokazuje tylko odczyt danych na
  sztywno w dwóch widokach, nie edytor.
- Prawdziwy schemat bazy, kontrakt API, zapis/wczytanie z serwera — dane wciąż żyją
  wyłącznie w `test-data.ts`.
- Meble/urządzenia, ich ikony i FK do pokoju/ściany (US-4) — osobna, późniejsza gałąź.
- Otwory w ścianach (drzwi, okna) — BL-011.
- Typ pokoju, materiał podłogi, elewacja — BL-012.
- Kafelek elementu na pulpicie — BL-015.

## Wpływ na wdrożenie

- **Migracja bazy:** nie — brak schematu, dane na sztywno w kodzie.
- **Nowe zmienne środowiskowe:** nie.
- **Przebudowanie obrazu:** nie.
- **Przerwa w działaniu:** nie.

## Jak to sprawdzić

1. `pnpm dev`, zalogować się kontem z białej listy.
2. Wejść na `/floor-plan` — widoczny rzut 2D nieregularnego mieszkania (Hol, Łazienka,
   Sypialnia, Salon z kuchnią), ściany bez dziur i bez wystających „nosków" w narożnikach.
3. Kliknąć „Przełącz na widok 3D" — te same ściany wyciągnięte w bryłę, ten sam kształt
   co w 2D (w tym uskok przy sypialni). `OrbitControls` pozwala obrócić widok.
4. `pnpm --filter @repo/web exec tsc --noEmit`, `pnpm --filter @repo/web exec eslint .`,
   `pnpm exec prettier --check apps/web` — wszystkie przechodzą.

## Ryzyka

- **ADR-0002 opisuje inny model danych niż kod** (patrz „Decyzje") — realne ryzyko, że ktoś
  zaprojektuje schemat bazy z dokumentu, a nie z `types.ts`. Do naprawienia przed
  przekazaniem gałęzi do `data-engineer`.
- Model „ściana = 4 rogi bez pola grubości" nie ma dziś twardej walidacji, że cztery punkty
  faktycznie tworzą domknięty, nieprzecinający się prostokąt — błędne dane wejściowe (np.
  z przyszłego edytora) mogłyby narysować zdegenerowany kształt bez ostrzeżenia.

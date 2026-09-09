# ADR-0006: Rzut mieszkania rysowany w SVG — każdy obiekt jest elementem DOM

- **Status:** Zaakceptowany
- **Data:** 2026-09-09
- **Dotyczy:** rendering / dostępność / testy

## Kontekst

[ADR-0002](0002-floor-plan-normalized-entities-in-millimeters.md) rozstrzygnął, **co**
przechowujemy. Ten ADR rozstrzyga, **czym to rysujemy** — decyzja tej samej wagi, bo
zmiana techniki renderowania oznacza przepisanie całego edytora, a nie poprawkę.

Siły napędowe:

- **NFR dostępności z PRD:** umieszczanie i przesuwanie ma mieć **pełny odpowiednik
  klawiaturowy**, nie tylko przeciąganie. Każda ściana i każdy wierzchołek musi więc być
  obiektem, który da się ofokusować, nazwać i obsłużyć klawiszem.
- **Motywy jasny i ciemny na semantycznych tokenach CSS** (`.claude/rules/web.md`) —
  kolory rzutu muszą brać się z tej samej kaskady co reszta aplikacji.
- **Testy szukają po roli i dostępnej nazwie** (`.claude/rules/testing.md`).
- Dotyk na tablecie w kiosku i mysz/klawiatura na desktopie, cele dotykowe 44×44 px.

Siły **pozorne**: wydajność (≤50 obiektów, czyli ok. 200 węzłów DOM — to nic), oraz
„przyszły widok 3D wymusza wspólny renderer" — 3D będzie osobnym widokiem czytającym te
same dane z API, a nie tym samym płótnem; ADR-0002 zapewnia mu dane, nie technikę rysowania.

**Materiał dowodowy.** Przeanalizowaliśmy kod referencyjnego projektu
`furnishup/blueprint3d` (rzut 2D + widok 3D, wskazany przez użytkownika jako punkt
odniesienia). Jego moduł `floorplanner` rysuje na `<canvas>` i płaci za to dokładnie tę
cenę, przed którą chroni nas NFR: obsługa wyłącznie myszą (`mousedown`/`mousemove`/`mouseup`
przez jQuery), **zero `tabindex`, zero atrybutów `aria-*`, zero obsługi zdarzeń dotyku**
w całym module, a jedyna reakcja na klawiaturę to globalny nasłuch `Escape` przerywający
rysowanie. To nie jest niedopatrzenie autorów — to naturalny skutek wyboru płótna, na
którym nie ma czego ofokusować.

## Rozważane warianty

### Wariant A — `<canvas>` 2D (droga blueprint3d)

- **Do czego pasuje:** pełna kontrola nad rysowaniem, jedna pętla przerysowania, brak
  narzutu DOM przy tysiącach obiektów.
- **Co kosztuje:** własne trafianie w obiekt (hit-testing), własna obsługa zaznaczenia,
  własny odczyt kolorów motywu z JS przy każdej zmianie trybu — a przede wszystkim
  **drugie, równoległe drzewo DOM** zbudowane wyłącznie po to, żeby cokolwiek dało się
  ofokusować i nazwać.
- **Kiedy się zemści:** natychmiast, przy pierwszym wymaganiu dostępności — i mamy na to
  dowód wprost z blueprint3d (patrz kontekst). Zemści się drugi raz w testach: Playwright
  nie widzi wnętrza płótna, więc `getByRole` przestaje działać i zostają współrzędne
  pikselowe, czyli selektory zakazane przez `.claude/rules/testing.md`.

### Wariant B — SVG, każdy obiekt jako element DOM

- **Do czego pasuje:** ściana, pokój i wierzchołek są węzłami z rolą, nazwą i fokusem;
  trafianie w obiekt, kursor i podpowiedzi dostajemy od przeglądarki za darmo. Kolory
  biorą się z tokenów CSS, więc oba motywy działają bez linijki JS.
- **Co kosztuje:** przy tysiącach elementów DOM zaczyna zwalniać, a przeciąganie wymaga
  przeliczenia współrzędnych wskaźnika na układ `viewBox`.
- **Kiedy się zemści:** gdy rzut przestanie mieć kilkadziesiąt obiektów — realnie dopiero
  przy imporcie planu (BL-006), który potrafi wypluć setki segmentów.

### Wariant C — jeden renderer WebGL (three.js) dla 2D i 3D

- **Do czego pasuje:** widok z góry i widok 3D to ta sama scena z inną kamerą; zero
  dwóch implementacji rysowania.
- **Co kosztuje:** nowa, duża zależność wymagająca zgody użytkownika, dostępność gorsza
  niż w wariancie A (płótno WebGL nie ma nawet kontekstu 2D do prostych podpowiedzi),
  a motywy i tokeny CSS trzeba przepisać na materiały.
- **Kiedy się zemści:** natychmiast — łączy wadę wariantu A z ceną biblioteki, której
  MVP nie potrzebuje, i wiąże dzisiejszy edytor 2D z decyzją należącą do BL-001.

## Decyzja

Wybieramy **wariant B — SVG**. Wymóg pełnej obsługi klawiaturą znaczy, że każdy obiekt
rzutu musi być ofokusowalnym, nazwanym węzłem — a to jest dokładnie definicja elementu
DOM, więc SVG daje nam za darmo to, co na płótnie trzeba by zbudować od zera i utrzymywać
w zgodzie z rysunkiem. Przy ≤50 obiektach jedyna przewaga płótna, czyli wydajność, nie ma
tu żadnego znaczenia, a blueprint3d pokazuje na własnym kodzie, czym się kończy odwrotny wybór.

## Konsekwencje

**Dobre:**

- `viewBox` jest w milimetrach z ADR-0002, więc **jedna jednostka SVG = 1 mm** — rysowanie
  nie ma żadnego przeliczania skali, a przybliżanie to zmiana `viewBox`.
- Kolory i grubości biorą się z tokenów motywu przez kaskadę CSS; tryb ciemny działa bez
  przerysowywania czegokolwiek z JS.
- Testy e2e i jednostkowe znajdują ścianę po roli i nazwie („Ściana 3, długość 3,40 m"),
  bez selektorów pikselowych.
- Powiększenie do 200% i rysunek wektorowy są tym samym problemem, więc rozwiązują się razem.

**Cena, którą płacimy:**

- Przeciąganie wymaga własnego przeliczenia współrzędnych wskaźnika na układ `viewBox`.
- Przy setkach obiektów (import planu) trzeba będzie rysować nieinteraktywne ściany jako
  jedną ścieżkę zbiorczą i trzymać elementami tylko to, co da się zaznaczyć.
- Rysunek żyje w DOM, więc niechlujne przerysowanie widać w wydajności od razu — stan
  przeciągania aktualizuje atrybuty jednego elementu, nigdy całego drzewa.

**Co to wymusza w kodzie:**

- Brak `<canvas>` w `features/elements/floor-plan/**` → reguła w `.claude/rules/floor-plan.md`.
- SVG nie ma elementu `button`, więc obiekt rzutu jest węzłem z `role="button"`, `tabindex`
  i `aria-label` — **jawny, wąski wyjątek** od „element klikalny to `button` albo `a`"
  z `.claude/rules/web.md`, ograniczony do wnętrza rysunku rzutu.
- Wskaźnik obsługiwany przez Pointer Events (jedna ścieżka dla myszy i dotyku), obszar
  trafienia poszerzony niewidoczną ścieżką do 44×44 px, `touch-action: none` tylko na
  powierzchni rysowania.

## Kiedy wrócić do tej decyzji

Gdy import planu (BL-006) albo rzut domu wielokondygnacyjnego (BL-014) podniesie liczbę
rysowanych obiektów o rząd wielkości i przeciąganie zacznie gubić klatki na docelowym
tablecie — wtedy pierwszym krokiem jest ścieżka zbiorcza dla ścian nieinteraktywnych,
a dopiero po jej wyczerpaniu rozmowa o płótnie z osobnym drzewem dostępności.

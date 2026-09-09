# Wykaz zmian: SP-008_transparent-near-walls

- **Gałąź:** `SP-008_transparent-near-walls`
- **Rozpoczęto:** 2026-09-09
- **Status:** w toku

## Po co ta zmiana

W widoku 3D rzutu (SP-005/SP-007) ściany najbliżej kamery zasłaniają wnętrze pomieszczeń,
gdy kamera jest na zewnątrz bryły — trzeba obracać widok, żeby zobaczyć środek. Wzorem
`furnishup/blueprint3d` ściany stojące między kamerą a wnętrzem stają się przezroczyste,
więc wnętrze jest widoczne bez ręcznego obracania.

## Co się zmieniło

| Data | Obszar | Zmiana |
| ---- | ------ | ------ |
| 2026-09-09 | `plan/three/scene.ts` | Dla każdej ściany liczony jest środek i normalna skierowana na zewnątrz najbliższego pokoju; `updateNearCameraWallVisibility` co klatkę chowa ścianę, gdy kamera stoi po jej zewnętrznej stronie. |
| 2026-09-09 | `plan/FloorPlanView3D.tsx`, `plan/FloorPlanViewer.tsx` | Przycisk trójstanowy (wszystkie widoczne / bliskie ukryte / wszystkie ukryte) w jednym rzędzie z przełącznikiem widoku 2D/3D, widoczny tylko w widoku 3D. |
| 2026-09-09 | `LocationsListPageView.tsx` i okolice | Poza zakresem „Po co ta zmiana" powyżej, przy okazji: lista lokalizacji dostała siatkę kafelków z ikoną (jak pulpit), nagłówek z przyciskami szukaj/dodaj (wzajemnie wykluczające się panele, szerokość max 500px, lewe wyrównanie), przycisk dodania skrócony do „Dodaj". |
| 2026-09-09 | `LocationDetailPageView.tsx`, `components/LevelsGrid.tsx`, `components/AddLevelForm.tsx` | Ten sam zestaw zmian co w liście lokalizacji zastosowany do widoku poziomów: siatka kafelków (ikona `Layers`, numer poziomu w nawiasie zamiast placeholdera „Poziom N"), nagłówek z szukaj/dodaj. |
| 2026-09-09 | `LocationNameForm.tsx`, `LevelNameForm.tsx`, `components/ConfirmDeleteButton.tsx` | Zmień nazwę / usuń jako ikony (ołówek, kosz) zamiast tekstu; edycja nazwy podmienia nagłówek na input tej samej wielkości w miejscu (bez przeskoku układu), z ikonami zapisu (haczyk) i anulowania (X) zamiast przycisków tekstowych. |
| 2026-09-09 | `LevelPlanPageView.tsx`, `plan/FloorPlanViewControls.tsx` (nowy), `plan/FloorPlanViewer.tsx`, `LevelNameForm.tsx` | Placeholder „Poziom N" usunięty, numer poziomu w nawiasie obok nazwy (jak na kafelku). Przełącznik 2D/3D i widoczności ścian przeniesiony znad rysunku do nagłówka strony, obok przycisku usunięcia, jako `variant="ghost"`; `FloorPlanViewer` przestał trzymać ten stan sam i stał się komponentem sterowanym. Ikona przejścia do 2D zmieniona z `Square` na `Map` — czytelniejsza. |

## Decyzje podjęte po drodze

- `Wall` nie ma odniesienia do `Room` (ADR-0010), więc zamiast modelu blueprint3d
  (dwie krawędzie na ścianę, po jednej na sąsiadujący pokój) normalna ściany jest
  liczona względem środka ciężkości **najbliższego** pokoju — uproszczenie świadome,
  wystarczające przy jednym poziomie na dokument.
- Domyślny tryb to „bliskie ukryte" (dotychczasowe automatyczne zachowanie); użytkownik
  może włączyć „wszystkie widoczne" albo „wszystkie ukryte" przyciskiem, bo samo
  automatyczne chowanie okazało się w niektórych ustawieniach kamery mylące.

## Świadomie pominięte

## Wpływ na wdrożenie

- **Migracja bazy:** nie.
- **Nowe zmienne środowiskowe:** nie.
- **Przebudowanie obrazu:** do uzupełnienia.
- **Przerwa w działaniu:** nie.

## Jak to sprawdzić

Wejdź na widok poziomu, przełącz na widok 3D i obracaj kamerą (OrbitControls) —
ściana najbliżej kamery, zasłaniająca wnętrze pokoju, znika. Przyciskiem obok
przełącznika 2D/3D można wymusić „wszystkie widoczne" albo „wszystkie ukryte".

## Ryzyka

Heurystyka najbliższego pokoju może dać błędną normalną dla ściany, która nie
graniczy z żadnym pokojem wprost (np. ściana zewnętrzna przy pustym narożniku) —
w takim wypadku ściana może pozostać widoczna albo zniknąć w niewłaściwym momencie.
Niski koszt: tryb „bliskie ukryte" nie jest jedynym dostępnym trybem.

# HomeDashboard

Stack, granice architektoniczne i reguły pracy są opisane w `.claude/rules/*.md` —
to one, nie ten plik, są źródłem prawdy dla konwencji kodu.

## Stan projektu

- **Faza:** logowanie i sesja gotowe w kodzie. Rzut mieszkania przeszedł spike (SP-005:
  render 2D w SVG i 3D w Three.js na danych na sztywno). Trwa gałąź
  `SP-007_locations-and-levels` — prawdziwy model danych i zapis do bazy; po projekcie
  technicznym, przed implementacją.
- **PRD:** [`docs/prd/pulpit-domowy-mvp.md`](docs/prd/pulpit-domowy-mvp.md) —
  status: Zatwierdzony (2026-09-09).
- **Zakres MVP:** logowanie kontem Google z białą listą właściciela (ADR-0001, ADR-0003),
  element pulpitu "Lokalizacje": konto ma wiele lokalizacji, lokalizacja wiele poziomów
  (pięter), każdy poziom ma własny rzut 2D/3D (ściany, pokoje), potem ikony mebli
  i urządzeń z zamkniętej listy. Dostęp z tabletu w mieszkaniu (kiosk, sesja
  długożyjąca) i zdalnie przez tę samą domenę. Jedno konto.
- **Lokalizacje i poziomy:** hierarchia `Account → Location → Level → (Wall, Room)`
  i poziom jako korzeń agregatu rzutu —
  [ADR-0008](docs/adr/0008-level-as-floor-plan-aggregate-root.md);
  reguły sprawdzalne w [`.claude/rules/locations.md`](.claude/rules/locations.md).
- **Rzut poziomu:** znormalizowane encje w milimetrach całkowitych
  ([ADR-0002](docs/adr/0002-floor-plan-normalized-entities-in-millimeters.md), częściowo
  zastąpiony), ściana jako blok o czterech rogach bez grubości
  ([ADR-0010](docs/adr/0010-wall-as-four-corner-block.md)), rysunek w SVG
  ([ADR-0006](docs/adr/0006-floor-plan-rendered-as-svg.md));
  reguły w [`.claude/rules/floor-plan.md`](.claude/rules/floor-plan.md).
  Zasób rzutu: `/api/locations/:locationId/levels/:levelId/plan`.
- **Świadomie poza MVP:** integracja z Home Assistant / realne sterowanie
  nawilżaczem Xiaomi i lodówką Samsung (zależne od Raspberry Pi, które fizycznie
  jeszcze nie istnieje), automatyzacje, historia/wykresy, powiadomienia,
  import planu, więcej urządzeń/marek — szczegóły i koszt zaniechania w
  [`docs/backlog.md`](docs/backlog.md) (BL-001..BL-021). **Edytor rzutu (US-3:
  rysowanie ścian przez użytkownika) jest wciąż niezrobiony — BL-020.**
- **Następny krok:** `data-engineer` — schemat `location.prisma` / `floor-plan.prisma`,
  migracja i seed przykładowej lokalizacji wg ADR-0008 i ADR-0010; **równolegle**
  `backend-dev` (najpierw `packages/contracts`, potem trasy) i `frontend-dev`
  (kafelek „Lokalizacje", trasy `/locations/**`, podpięcie renderera pod prawdziwe dane).

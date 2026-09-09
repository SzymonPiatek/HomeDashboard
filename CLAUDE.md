# HomeDashboard

Stack, granice architektoniczne i reguły pracy są opisane w `.claude/rules/*.md` —
to one, nie ten plik, są źródłem prawdy dla konwencji kodu.

## Stan projektu

- **Faza:** logowanie i sesja gotowe w kodzie (`apps/api`, `apps/web`). Trwa pierwsza
  gałąź elementu pulpitu — `SP-005_floor-plan-2d`, po projekcie technicznym, przed
  implementacją.
- **PRD:** [`docs/prd/pulpit-domowy-mvp.md`](docs/prd/pulpit-domowy-mvp.md) —
  status: Zatwierdzony (2026-09-09).
- **Zakres MVP:** logowanie kontem Google z białą listą właściciela (ADR-0001, ADR-0003),
  jeden element pulpitu "Rzut mieszkania" (2D, ręczne rysowanie ścian, powierzchnie
  pokoi, potem ikony mebli/urządzeń z zamkniętej listy), dostęp z tabletu w mieszkaniu
  (kiosk, sesja długożyjąca) i zdalnie przez tę samą domenę. Jedno konto.
- **Rzut mieszkania:** dane i kontrakt rozstrzygnięte w
  [ADR-0002](docs/adr/0002-floor-plan-normalized-entities-in-millimeters.md);
  rysowanie w SVG w [ADR-0006](docs/adr/0006-floor-plan-rendered-as-svg.md);
  reguły sprawdzalne w [`.claude/rules/floor-plan.md`](.claude/rules/floor-plan.md).
  Współrzędne w milimetrach całkowitych, jeden zasób `/api/floor-plan` na konto.
  Gałąź SP-005 obejmuje **wyłącznie** ściany i pokoje — meble i urządzenia (US-4)
  to osobna, późniejsza gałąź.
- **Świadomie poza MVP:** integracja z Home Assistant / realne sterowanie
  nawilżaczem Xiaomi i lodówką Samsung (zależne od Raspberry Pi, które fizycznie
  jeszcze nie istnieje), rzut 3D, automatyzacje, historia/wykresy, powiadomienia,
  import planu, więcej urządzeń/marek — szczegóły i koszt zaniechania w
  [`docs/backlog.md`](docs/backlog.md) (BL-001..BL-016).
- **Następny krok:** `data-engineer` — schemat `apps/api/prisma/schema/floor-plan.prisma`
  i migracja wg ADR-0002; równolegle `ux-designer` — przepływ rysowania ścian i pokoi,
  stany widoku i pełna obsługa klawiaturą.

# HomeDashboard

Stack, granice architektoniczne i reguły pracy są opisane w `.claude/rules/*.md` —
to one, nie ten plik, są źródłem prawdy dla konwencji kodu.

## Stan projektu

- **Faza:** discovery zakończone dla pierwszego obszaru. Kod produktowy jeszcze nie
  istnieje — repo ma tylko rusztowanie reguł i dokumentację.
- **PRD:** [`docs/prd/pulpit-domowy-mvp.md`](docs/prd/pulpit-domowy-mvp.md) —
  status: Zatwierdzony (2026-09-09).
- **Zakres MVP:** logowanie hasłem + 2FA e-mail, jeden element pulpitu "Rzut
  mieszkania" (2D, ręczne rysowanie ścian, ręczne rozmieszczanie ikon mebli/
  urządzeń z zamkniętej listy), dostęp z tabletu w mieszkaniu (kiosk, sesja
  długożyjąca) i zdalnie przez tę samą domenę. Jedno konto.
- **Świadomie poza MVP:** integracja z Home Assistant / realne sterowanie
  nawilżaczem Xiaomi i lodówką Samsung (zależne od Raspberry Pi, które fizycznie
  jeszcze nie istnieje), rzut 3D, automatyzacje, historia/wykresy, powiadomienia,
  import planu, więcej urządzeń/marek — szczegóły i koszt zaniechania w
  [`docs/backlog.md`](docs/backlog.md) (BL-001..BL-007).
- **Następny krok:** `web-architect` — projekt techniczny elementu "Rzut mieszkania"
  (model danych rzutu, kontrakt API) i auth z 2FA e-mail; równolegle `ux-designer`
  ustala startową listę typów ikon.

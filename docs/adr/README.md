# Decyzje architektoniczne (ADR)

Jeden plik = jedna decyzja, wg `.claude/templates/adr.md`. Numer raz użyty nie wraca
do puli; decyzję zmienia się nowym ADR-em ze zdaniem „Zastępuje ADR-NNNN", nigdy edycją
starego.

| Numer                                                         | Decyzja                                                                              | Status        |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------- |
| [0001](0001-google-oauth-two-stage-authorization.md)          | Logowanie wyłącznie kontem Google — dwustopniowy przepływ OAuth w `apps/api`         | Zaakceptowany |
| [0002](0002-floor-plan-normalized-entities-in-millimeters.md) | Rzut mieszkania — znormalizowane encje w milimetrach, zapisywane jako jeden dokument | Zaakceptowany |
| [0003](0003-server-session-with-two-lifetimes.md)             | Sesja serwerowa w ciasteczku HttpOnly, dwa czasy życia (kiosk / standardowa)         | Zaakceptowany |
| [0006](0006-floor-plan-rendered-as-svg.md)                    | Rzut mieszkania rysowany w SVG — każdy obiekt jest elementem DOM                     | Zaakceptowany |

## Skąd nieciągłości w numeracji

Reguły w `.claude/rules/` odwołują się do konkretnych numerów, zanim te ADR-y powstały:
`data.md` i `web.md` mówią o danych elementów pulpitu jako **ADR-0002**, a `api.md`
o `requireSession` jako **ADR-0003**. Numeracja tutaj jest im podporządkowana — inaczej
reguła kłamałaby, wskazując dokument o czymś innym. Numer 0002 należał do decyzji
o danych elementów pulpitu i został zajęty 2026-09-09 przez ADR o rzucie mieszkania.

Wolne numery 0004 i 0005 zostają nieużyte świadomie — zajmują je odwołania z reguł.
Ta sama uwaga dotyczy odwołań do ADR-0004 i dalszych w `.claude/rules/api.md`,
`web.md` i `data.md` (m.in. 0005, 0007, 0009, 0016, 0017, 0019, 0020, 0024, 0025).
Pochodzą z projektu referencyjnego, z którego wzięto reguły; **treść reguły obowiązuje,
numer nie ma dziś odpowiednika w tym repozytorium**. Uporządkowanie tych odwołań wymaga
decyzji użytkownika i jest odłożone jako BL-010.

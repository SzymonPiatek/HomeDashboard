# Reguły: packages/contracts

Ten pakiet jest **jedynym źródłem prawdy o kontrakcie API**. Jeżeli czegoś tu nie ma,
to nie istnieje — ani dla frontendu, ani dla backendu.

## Zasady

- Każdy endpoint **wołany programowo przez frontend** ma tu komplet: schemat wejścia
  (params/query/body) i schemat odpowiedzi.
- **Wyjątek: przekierowania przeglądarki.** Endpointy, których jedyną odpowiedzią jest 302
  (start i powrót przepływów OAuth, ADR-0001), nie mają tu schematów — nie ma czego
  parsować, a front ich nie konstruuje ani nie czyta, tylko nawiguje do nich przeglądarką.
  Ich wejście z query obcego dostawcy **nadal jest walidowane zodem**, ale lokalnie
  w `apps/api`, bo nie jest z nikim współdzielone. Wyjątek kończy się tam, gdzie zaczyna
  się odpowiedź z ciałem: endpoint zwracający JSON należy tu zawsze.
- Typy są **wyprowadzane** ze schematów (`z.infer`), nigdy pisane równolegle ręcznie.
- Pakiet nie importuje niczego z `apps/**`. Nie zna Prismy, nie zna Expressa, nie zna Reacta.
- Nie ma tu logiki — wyłącznie schematy, typy i stałe kontraktu (kody błędów, nazwy statusów).
- Zmiana łamiąca kontrakt wymaga zmiany po obu stronach w **tej samej zmianie**.
  Nie zostawiaj frontendu na starym kontrakcie "do poprawienia później".

## Kto może edytować

`backend-dev` — jest właścicielem kontraktu.
`frontend-dev` **konsumuje, nie zmienia**; potrzebę zmiany zgłasza leadowi.

## Kształt odpowiedzi

Jeden wspólny kształt błędu dla całego API — kod, komunikat i opcjonalne szczegóły
walidacji. Frontend ma prawo zakładać, że każdy błąd wygląda tak samo.

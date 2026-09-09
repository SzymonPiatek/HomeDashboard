# Reguły: podział pracy nad funkcjonalnością między backend i frontend

Dotyczy leada (sesji orkiestrującej pracę agentów), nie pojedynczego agenta — to reguła
o tym, jak zlecać zadania, nie jak pisać kod.

## Kontrakt najpierw

Zanim `backend-dev` i `frontend-dev` dostaną zadanie, `packages/contracts` musi mieć
gotowe schematy wejścia i odpowiedzi dla endpointów, których funkcjonalność potrzebuje
(`.claude/rules/contracts.md`). Bez ustalonego kontraktu nie da się pracować równolegle —
obie strony pisałyby na zgadywany kształt, a rozjazd jest pewny.

## Backend i frontend pracują równolegle

Gdy kontrakt jest gotowy, zlecenie dla `backend-dev` i dla `frontend-dev` wychodzi
**w tym samym momencie**, jako dwa niezależne wywołania — nie sekwencyjnie, jedno po
zakończeniu drugiego.

- `backend-dev` implementuje endpoint(y) wg kontraktu: route → service → repository.
- `frontend-dev` implementuje UI i hooki TanStack Query wg tego samego kontraktu,
  **wiedząc z góry**, że wywołania do jeszcze nieistniejącego lub niedokończonego
  endpointu nie zwrócą realnych danych, dopóki backend nie skończy. To oczekiwany,
  przejściowy stan pracy równoległej — nie błąd i nie powód, żeby czekać z frontendem
  na gotowe API.

Każda strona pisze i uruchamia własne testy niezależnie od stanu drugiej
(`.claude/rules/testing.md`) — frontend testuje zachowanie komponentów i hooków wobec
kontraktu (typy, walidacja odpowiedzi), nie wobec żywego backendu.

## Faza dopasowania — po obu stronach

Dopiero gdy `backend-dev` i `frontend-dev` zgłoszą zrobione, następuje osobny krok:
uruchomienie obu razem (`pnpm dev`) i sprawdzenie realnych wywołań end-to-end. W tej
fazie naprawia się rozjazdy, które nie były widoczne przy pracy z samym kontraktem —
kody błędów, brzegowe kształty odpowiedzi, kolejność nagłówków/ciasteczek, rzeczy, które
zod przepuszcza po obu stronach, ale które w praktyce się nie zgadzają. Zadanie jest
gotowe dopiero po tej fazie, nie po samym zgłoszeniu przez oboje agentów.

## Czego to nie zmienia

- `frontend-dev` nadal nie edytuje `packages/contracts`. Gdy podczas pisania UI okaże
  się, że kontrakt jest niewystarczający, przerywa i zgłasza leadowi — tak jak dotychczas.
- `backend-dev` nadal nie dotyka `apps/web`, i odwrotnie.
- Granice narzędzi i własności z `.claude/agents/backend-dev.md` i
  `.claude/agents/frontend-dev.md` obowiązują bez zmian.

## Kiedy nie dzielić na równolegle

Zadanie na tyle małe, że nie uzasadnia dwóch osobnych zleceń (np. jednoliniowa zmiana
typu w kontrakcie plus jedno miejsce w UI, które go używa) — wtedy jedno zlecenie,
sekwencyjnie, jest szybsze niż koordynacja dwóch agentów.

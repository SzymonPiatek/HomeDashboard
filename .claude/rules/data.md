# Reguły: baza danych, Prisma, migracje

Obowiązuje też `.claude/rules/typescript.md`.

## Własność

`schema.prisma`, migracje i seedy ma **jednego właściciela**: `data-engineer`.
Nikt inny ich nie edytuje. Potrzebę zmiany schematu zgłasza się leadowi.

## Migracje

- Wyłącznie `prisma migrate`. **`prisma db push` jest zakazane** poza jednorazowym
  prototypowaniem na lokalnej bazie, której nie żal.
- Migracja już zaaplikowana jest **niezmienna**. Poprawkę wprowadza kolejna migracja.
- Każda migracja ma nazwę opisującą zamiar (`add_task_due_date`), nie datę ani `update`.
- Zmiana destrukcyjna (usunięcie kolumny lub tabeli, zmiana typu) wymaga jawnej zgody
  użytkownika i opisu, co dzieje się z istniejącymi danymi.

## Izolacja danych między kontami

Wyciek danych między kontami to najpoważniejszy tryb awarii aplikacji wielokontowej
i jedyny, który kompromituje ją nieodwracalnie.

- Każda tabela z danymi użytkownika ma nienullowalną kolumnę właściciela z kluczem obcym.
- Właścicielstwo nadaje się przy tworzeniu tabeli, nigdy "dokleja później".
- Nie istnieje zapytanie o dane użytkownika bez warunku właściciela. Jeżeli piszesz takie
  zapytanie, popełniasz błąd bezpieczeństwa, nawet gdy testy przechodzą.
- Usunięcie konta usuwa albo anonimizuje wszystkie jego dane — zachowanie kaskady jest
  zdefiniowane wprost w schemacie, nie pozostawione domyślnym ustawieniom.

## Schemat

### Jeden plik na obszar, nie jeden na wszystko

Schemat mieszka w **katalogu** `apps/api/prisma/schema/`, nigdy w pojedynczym
`schema.prisma`. Podział idzie po obszarach domeny, nie po typach obiektów:

- `schema.prisma` — wyłącznie `generator` i `datasource`.
- `<obszar>.prisma` — modele jednego obszaru wraz z ich enumami, np. `account.prisma`,
  `connection.prisma`, `dashboard.prisma`.
- Nazwy plików `kebab-case.prisma`, po angielsku jak reszta kodu.
- `prisma.config.ts` wskazuje **katalog** (`schema: "prisma/schema"`), nie plik.

Model bez oczywistego pliku znaczy, że obszar nie został nazwany — nazwij go, zamiast
zakładać plik zbiorczy „na razie". Enum należy do obszaru, który definiuje go pojęciowo;
używanie go z drugiego obszaru jest w porządku i nie przenosi go do wspólnego worka.

Powód: rosnący `schema.prisma` po kilkunastu modelach przestaje się czytać w całości,
a każda zmiana schematu dotyka tego samego pliku — konflikty przy scalaniu stają się
regułą zamiast wyjątku.


- Nazwy tabel w liczbie mnogiej, pola `camelCase`, klucze obce `<encja>Id`.
- Każdy rekord ma `createdAt` i `updatedAt`.
- Kwoty i czas trwania w liczbach całkowitych (grosze, sekundy) — nigdy `Float`.
- Daty zawsze ze strefą czasową, przechowywane w UTC. Konwersja do lokalnego czasu
  następuje wyłącznie w warstwie prezentacji.
- Pole opcjonalne wymaga uzasadnienia. Domyślnie kolumna jest `NOT NULL`.

## Dane elementów pulpitu (ADR-0002)

- **Nie istnieje wspólna tabela na dane elementów pulpitu.** Element z danymi własnymi
  dostaje własne tabele, projektowane razem z nim.
- Kolumna JSON dopuszczalna wyłącznie na **ustawienia instancji** elementu, walidowane zodem
  per klucz. Nigdy na rekordy, które się listuje, filtruje albo sortuje — worek JSON oznacza
  brak indeksu i migrację danych przy pierwszym widoku, który po nich sięgnie.
- **Kolumna refresh tokena nie występuje w typie domenowym zwracanym przez repozytorium**
  (ADR-0001). Repozytorium oddaje stan połączenia, nie sekret.

## Wydajność

- Kolumna, po której filtrujesz, sortujesz lub łączysz, ma indeks. Klucz obcy ma indeks.
- Pobranie listy zawsze ma limit. Zakaz `findMany` bez `take` na tabeli, która rośnie
  w czasie (logi, zdarzenia, historia).
- Zapytanie w pętli to błąd (problem N+1). Użyj `include`, `in` albo jednego zapytania.
- `$queryRaw` wyłącznie w repozytorium, z parametrami (nigdy przez sklejanie stringów)
  i z komentarzem wyjaśniającym, czemu Prisma nie wystarczyła.

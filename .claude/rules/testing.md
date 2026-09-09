# Reguły: testy

To prywatna aplikacja jednoosobowa — jeden użytkownik (właściciel), bez zewnętrznych
odbiorców, bez SLA. Rygor testowy typowy dla zespołu i produktu komercyjnego tu nie
obowiązuje: **testy są opcjonalne, nie domyślnym krokiem każdej zmiany.** Pisanie testu
do wszystkiego spowalnia tworzenie bez proporcjonalnej korzyści przy tej skali.

## Kiedy pisać test

Pisz test, gdy się to realnie opłaca:
- logika jest nieoczywista i łatwo ją niechcący zepsuć przy okazji innej zmiany,
- błąd byłby kosztowny albo trudny do wykrycia ręcznie — w szczególności **logowanie,
  sesja, whitelist właściciela** (`.claude/rules/api.md`) i cokolwiek dotyka bazy danych
  w sposób trudny do cofnięcia,
- coś już się na tym wywróciło raz — test regresji zapobiega drugiemu razowi.

W pozostałych przypadkach (prosty widok, oczywisty CRUD, jednorazowy skrypt) — bez
testu. TDD (test przed kodem) nie jest wymagany; pisz kod, testem opatrz to, co
faktycznie tego wymaga, jeśli w ogóle.

Zawsze wymagane, niezależnie od powyższego: **ręczne sprawdzenie ścieżki logowania**
przed zgłoszeniem zrobione — konto z białej listy loguje się, konto spoza niej nie.
Nie musi być zautomatyzowane, musi być zobaczone na własne oczy.

## Jeśli jednak piszesz test

| Poziom | Narzędzie | Kiedy sięgnąć |
|---|---|---|
| Jednostkowe | Vitest | logika domenowa, funkcje czyste, hooki |
| Integracyjne | Vitest + supertest / prawdziwa baza w Dockerze | endpointy i repozytoria dotykające bazy |
| E2E | Playwright | ścieżka logowania i inne rzeczy, których naprawdę szkoda by było zepsuć bez ostrzeżenia |

Selektory w testach klikających w interfejs (rola + dostępna nazwa, `data-testid` jako
wyjątek) — osobno w `.claude/rules/testing-selectors.md`, czytaj przy pisaniu testu UI.

### Co test ma udowadniać, jeśli już istnieje

- Testuje **zachowanie widoczne dla użytkownika lub wywołującego**, nie stan wewnętrzny
  ani szczegóły implementacji.
- Test bez asercji na zachowaniu jest bezwartościowy. Test, który przeszedłby też przed
  Twoją zmianą, niczego nie dowodzi.
- Nazwa opisuje zachowanie i warunek: „odrzuca logowanie spoza białej listy", nie „test 3".

### Niezawodność

- Zakaz `waitForTimeout`/`sleep` — czekasz na warunek, nie na upływ czasu.
- Zakaz zależności między testami; każdy przygotowuje sobie stan sam.
- Czas i losowość zamrożone tam, gdzie wpływają na wynik. Zewnętrzne API zaślepione.

Test niestabilny (raz przechodzi, raz nie) jest gorszy niż jego brak — albo naprawiasz
przyczynę, albo go usuwasz. Nie owija się w retry.

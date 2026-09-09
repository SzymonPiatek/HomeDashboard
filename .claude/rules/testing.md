# Reguły: testy

Obowiązują każdego, kto pisze kod — nie tylko `qa-engineer`.

## TDD

Test przed implementacją, zawsze. Kolejność jest odwrotna do naturalnej i to jest cel:

1. Test opisujący oczekiwane zachowanie → **uruchom i zobacz go czerwonym**.
   Test, którego nie widziałeś czerwonego, niczego nie dowodzi.
2. Najprostszy kod, który go zazieleni.
3. Sprzątanie na zielonym.

Jedyne odstępstwo: zmiana czysto wizualna, nie wprowadzająca żadnego zachowania
(kolor, odstęp, układ). Odnotowuje się je jawnie w raporcie. Nigdy nie klasyfikuj tak
zmiany, która dodaje warunek, stan albo obsługę zdarzenia.

## Poziomy

| Poziom | Narzędzie | Co pokrywa |
|---|---|---|
| Jednostkowe | Vitest | logika domenowa, funkcje czyste, hooki |
| Integracyjne | Vitest + supertest / prawdziwa baza w Dockerze | endpointy, repozytoria |
| E2E | Playwright | ścieżki użytkownika przez wiele ekranów i warstw |

E2E jest najdroższy i najwolniejszy — pokrywa **ścieżki krytyczne**, nie każdy przycisk.
Zachowanie dające się sprawdzić niżej sprawdzasz niżej.

## Selektory w testach UI

**Podstawa: rola + dostępna nazwa.**

```ts
page.getByRole('button', { name: 'Zaloguj' })
page.getByLabel('E-mail')
page.getByRole('heading', { name: 'Ustawienia' })
```

Test szuka wtedy tego samego, co czytnik ekranu. Jeśli test nie znajduje elementu po
nazwie, element jest też niedostępny dla technologii asystujących — i to jest błąd
do naprawienia w komponencie, **nie powód do dołożenia selektora**.

Z tego wynika obowiązek dla `frontend-dev`: **każdy element interaktywny ma dostępną
nazwę.** Przycisk ma tekst albo `aria-label`. Pole ma powiązany `label`. Ikona bez tekstu
ma `aria-label` opisujący czynność, nie wygląd („Usuń zadanie", nie „Kosz").

**`data-testid` wyłącznie tam, gdzie nazwa nie wystarcza:**
- wskazanie konkretnego elementu listy (`data-testid="task-row"` + zawężenie po treści),
- zawężenie do sekcji lub regionu strony,
- element bez sensownej nazwy dostępnej, którego nie da się inaczej odróżnić.

Format: `data-testid="obszar-element"`, kebab-case. Nie dokładaj `testid` do elementu,
który da się znaleźć po roli i nazwie.

**Zakazane selektory:** klasy CSS, nazwy tagów, `nth-child`, XPath po strukturze.
Wiążą test z wyglądem zamiast z zachowaniem i pękają przy każdej zmianie układu.

## Co test ma udowadniać

- Testujesz **zachowanie widoczne dla użytkownika lub wywołującego**, nie stan wewnętrzny,
  nazwy klas ani szczegóły implementacji.
- Test bez asercji na zachowaniu (sprawdzający tylko, że nic nie rzuciło) jest bezwartościowy.
- Test, który przeszedłby również przed Twoją zmianą, nie testuje Twojej zmiany.
- Nazwa testu opisuje zachowanie i warunek: „odrzuca rejestrację przy zajętym e-mailu",
  nie „test 3".
- Każdy kod mający ścieżkę porażki ma test tej ścieżki. Endpoint przetestowany wyłącznie
  na danych poprawnych jest nieprzetestowany.
- Każdy endpoint zwracający dane użytkownika ma **test międzykontowy**: A nie widzi
  i nie modyfikuje danych B.

## Dostępność i motywy w testach

- Ścieżki krytyczne przechodzą **automatyczne sprawdzenie dostępności** (axe) — wykrywa
  brakujące nazwy, złe role i zbyt niski kontrast. Naruszenie jest błędem, nie ostrzeżeniem.
- Automat wyłapuje część problemów, nie wszystkie. Kolejność fokusu, sensowność nazw
  i pułapki fokusu w dialogach sprawdza się ręcznie.
- **Ścieżki krytyczne przechodzą w obu motywach.** Nie duplikuj wszystkich testów — wystarczy
  parametryzacja motywu dla scenariuszy, w których kolor niesie znaczenie (statusy, błędy,
  wykresy).
- Test przełączania motywu sprawdza też trwałość wyboru po przeładowaniu i brak mignięcia
  złym motywem przy pierwszym malowaniu.

## Niezawodność

- **Zakaz `waitForTimeout`, `sleep` i sztywnych opóźnień.** Czekasz na warunek
  (widoczność, treść, odpowiedź), nie na upływ czasu.
- **Zakaz zależności między testami.** Każdy test przygotowuje sobie stan i da się go
  uruchomić samotnie oraz w dowolnej kolejności.
- **Każdy test e2e tworzy własnego użytkownika i własne dane.** Nigdy nie współdzieli konta
  z innym testem — to główne źródło pękania przy równoległym uruchamianiu.
- Czas i losowość są zamrożone tam, gdzie wpływają na wynik.
- Zewnętrzne API jest zaślepione. Wyjątkiem jest jeden świadomy test kontraktu, jeśli w ogóle.

## Test niestabilny to test zepsuty

Test, który raz przechodzi, a raz nie, jest gorszy niż jego brak — uczy ignorowania
czerwonego CI. Nie „przepuszcza się" go ponownym uruchomieniem i nie owija w retry.
Albo naprawiasz przyczynę, albo wyłączasz test jawnie, z komentarzem i zgłoszeniem.

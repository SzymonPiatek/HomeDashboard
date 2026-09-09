# Reguły: selektory w testach UI

Dotyczy każdego testu klikającego w interfejs — Playwright (e2e) i React Testing
Library (jednostkowe/integracyjne komponentów). Uzupełnia `.claude/rules/testing.md`.

**Podstawa: rola + dostępna nazwa.**

```ts
page.getByRole('button', { name: 'Zaloguj' })
page.getByLabel('E-mail')
page.getByRole('heading', { name: 'Ustawienia' })
```

Jeśli test nie znajduje elementu po nazwie, element jest też niedostępny dla technologii
asystujących — błąd do naprawienia w komponencie (WCAG 2.2 AA nadal obowiązuje jako wymóg
produktu, `.claude/rules/ui-quality.md` — to osobna sprawa od tego, ile testów piszesz), nie
powód do dołożenia selektora.

`data-testid` tylko tam, gdzie nazwa nie wystarcza (element listy, sekcja strony) —
kebab-case, `data-testid="obszar-element"`. Zakazane: klasy CSS, nazwy tagów, `nth-child`,
XPath po strukturze.

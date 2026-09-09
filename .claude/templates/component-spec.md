# Komponent: <Nazwa>

- **Po co jest:** jedno zdanie. Jeśli nie umiesz go napisać, komponent nie jest potrzebny.
- **Bazuje na:** <prymityw shadcn/ui albo "nowy" + uzasadnienie, czemu istniejący nie wystarcza>
- **Używany w:** <ekrany>

## Anatomia

Co się z czego składa, co jest nad czym, co jest opcjonalne.

## Warianty

| Wariant | Kiedy używać |
|---|---|

## Stany

| Stan | Wygląd / zachowanie |
|---|---|
| domyślny | |
| najechanie | |
| fokus | widoczny pierścień fokusu o kontraście ≥ 3:1 — obowiązkowo, w obu trybach |
| wciśnięty | |
| nieaktywny | dlaczego bywa nieaktywny i jak to komunikujemy |
| ładowanie | |
| błąd | |

## Motywy

| Element | Token | Tryb jasny | Tryb ciemny | Kontrast (jasny / ciemny) |
|---|---|---|---|---|
| tło | | | | |
| tekst | | | | |
| granica | | | | |

Wypełnij dla każdego wariantu i stanu, który zmienia kolory. Kontrast liczysz osobno
dla obu trybów. Element widoczny wyłącznie dzięki cieniowi wymaga własnej granicy.

## Dostępność (WCAG 2.2 AA)

- **Rola:** <button / link / dialog / …>
- **Dostępna nazwa:** dokładny tekst albo `aria-label`; opisuje czynność, nie wygląd
- **Klawiatura:** czym się fokusuje, co robi Enter / Spacja / Escape / strzałki
- **Ogłaszane zmiany:** co czytnik ekranu ma powiedzieć przy zmianie stanu (`aria-live`)
- **Cel dotykowy:** wymiar w px; 44×44 dla podstawowych, nigdy poniżej 24×24
- **Bez koloru:** czym poza kolorem odróżnia się stan lub status

## Zachowania brzegowe

- **Bardzo długa treść:** obcina / zawija / przewija
- **Brak treści:** co widać
- **Wąski ekran:** co się zmienia
- **Wolna sieć:** co widać zanim przyjdą dane
- **Powiększenie 200%:** co się zmienia, czy nic nie znika
- **Zredukowany ruch:** czym zastępujemy animację przy `prefers-reduced-motion`

## Czego ten komponent NIE robi

Granica odpowiedzialności — co należy do rodzica.

# Reguły: dostępność, motywy i stany widoku

Dotyczy każdego ekranu w `apps/web`, niezależnie od tego, który element czy funkcję
pokazuje. Obowiązuje `frontend-dev` (implementacja), `ux-designer` (specyfikacja),
`qa-engineer` (pokrycie e2e i axe) oraz `code-reviewer` przy każdej zmianie UI.

## Dostępność — WCAG 2.2 poziom AA

Poziom **AA standardu WCAG 2.2 jest wymogiem projektu**, nie aspiracją. Zmiana, która go
łamie, jest niedokończona — tak samo jak zmiana bez testu.

### Kontrast

| Co | Minimum |
|---|---|
| Tekst zwykły | **4.5:1** |
| Tekst duży (≥ 24 px lub ≥ 18.7 px pogrubiony) | **3:1** |
| Elementy interfejsu, ikony niosące znaczenie, granice pól | **3:1** |
| Pierścień fokusu względem tła | **3:1** |

Kontrast musi być spełniony **osobno w trybie jasnym i osobno w ciemnym**. Para kolorów
poprawna w jednym trybie potrafi nie przejść w drugim — sprawdzasz oba, nie jeden.

Kolor **nigdy nie jest jedynym nośnikiem informacji**: status ma kolor i tekst lub ikonę.

### Cele dotykowe

Minimum wg WCAG 2.2 AA to **24×24 px**. W tym projekcie przyjmujemy **44×44 px** dla
podstawowych elementów dotykowych — mniejsze dopuszczamy tylko przy gęstych układach
(np. akcje w wierszu tabeli) i nigdy poniżej progu 24 px.

### Reszta wymogów

- Element klikalny to `button` albo `a` — nigdy `div` z `onClick`.
- Każde pole formularza ma powiązany `label`. Każdy obrazek ma `alt`.
- Fokus musi być widoczny. Nie usuwaj `outline` bez podania zamiennika o kontraście 3:1.
- Wszystko, co da się zrobić myszą, da się zrobić klawiaturą. Kolejność fokusu jest zgodna
  z kolejnością wizualną, a fokus nie ucieka poza otwarty dialog.
- Struktura nagłówków jest hierarchiczna (`h1` → `h2` → …), bez przeskoków dla efektu.
- Zmiany dziejące się bez przeładowania (zapis, błąd, wynik wyszukiwania) są ogłaszane
  przez `aria-live`. Zmiana, której nie widzi czytnik ekranu, dla jego użytkownika się nie zdarzyła.
- Animacja respektuje `prefers-reduced-motion`. Nic nie miga częściej niż 3 razy na sekundę.
- Aplikacja jest używalna przy powiększeniu do 200% bez utraty treści i funkcji.
- **Każdy element interaktywny ma dostępną nazwę** — tekst, `label` albo `aria-label`.
  To nie jest tylko wymóg dostępności: tak właśnie znajdują go testy e2e
  (`.claude/rules/testing-selectors.md`). Ikona bez tekstu opisuje czynność, nie wygląd.
- `data-testid` dokładasz wyłącznie tam, gdzie dostępna nazwa nie wystarcza do odróżnienia
  elementu (wiersz listy, sekcja). Nigdy do elementu, który da się znaleźć po roli i nazwie.

## Tryb jasny i ciemny

Aplikacja obsługuje **oba tryby**. To nie jest funkcja do dorobienia na końcu — kolor
dopisany bez tokenu trzeba potem znaleźć i wymienić w każdym pliku z osobna.

- Kolory wyłącznie przez **semantyczne tokeny** (`bg-background`, `text-muted-foreground`,
  `border`, `destructive`). **Zakaz surowych kolorów Tailwinda** (`bg-white`, `text-gray-700`,
  `bg-red-500`) w kodzie aplikacji. Wartości tokenów definiuje warstwa motywu, nie komponent.
- Tokeny są zmiennymi CSS przełączanymi klasą `dark` na elemencie `html` (konwencja shadcn/ui).
- Pierwsza wizyta respektuje `prefers-color-scheme`. Wybór użytkownika ma pierwszeństwo
  i jest zapamiętywany.
- **Zakaz mignięcia złym motywem** — motyw ustala się przed pierwszym malowaniem, nie po
  hydracji.
- Tryb ciemny to nie odwrócenie jasnego. Nie używamy czystej bieli na czystej czerni;
  wyniesienie warstw pokazujemy jaśniejszym tłem, nie cieniem.
- Obrazy, ilustracje, wykresy i granice muszą być czytelne w obu trybach. Element widoczny
  wyłącznie dzięki cieniowi zniknie w ciemnym.
- Każdy nowy kolor przechodzi sprawdzenie kontrastu **w obu trybach**, zanim wejdzie
  do systemu.

## Stany widoku

Każdy widok pobierający dane obsługuje **cztery** stany: ładowanie, błąd, pusto, dane.
Brak stanu pustego albo błędu to niedokończony widok, nie "do dorobienia później".

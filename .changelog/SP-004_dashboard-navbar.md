# Wykaz zmian: SP-004_dashboard-navbar

- **Gałąź:** `SP-004_dashboard-navbar`
- **Rozpoczęto:** 2026-09-09
- **Status:** gotowe do przeglądu

## Po co ta zmiana

Start prac nad podstawowym dashboardem z widokiem 2D rzutu mieszkania. Pierwszym
krokiem jest szkielet góry ekranu: przezroczysty navbar z przełącznikiem motywu
i przyciskiem wylogowania, oparty na komponentach shadcn/ui zamiast własnego
prymitywu `Button`.

## Co się zmieniło

| Data | Obszar | Zmiana |
|---|---|---|
| 2026-09-09 | web | Utworzenie gałęzi i wykazu zmian |
| 2026-09-09 | web | Usunięcie własnego prymitywu `components/ui/Button.tsx`, dodanie `components/ui/button.tsx` przez `shadcn@latest add button` |
| 2026-09-09 | web | Nowe zależności: `@radix-ui/react-slot`, `lucide-react`; podniesienie `class-variance-authority` |
| 2026-09-09 | web | Przełącznik motywu (`ThemeToggle`) przebudowany na przycisk ikonowy (Sun/Moon z lucide-react) z `aria-label`, zamiast przycisku z tekstem |
| 2026-09-09 | web | `LogoutButton` przeniesiony na wariant `ghost` z ikoną `LogOut`, dopasowany wizualnie do przełącznika motywu |
| 2026-09-09 | web | Nowy `features/dashboard/components/Navbar.tsx` — przezroczysta górna belka pulpitu bez propsów, renderująca `ThemeToggle` i `LogoutButton` |
| 2026-09-09 | web | `app/page.tsx` renderuje `<Navbar />` zamiast inline'owanego rzędu przycisków; miejsca korzystające dotąd z domyślnego rozmiaru `Button` (`AuthGate`, strona logowania) dostały `h-11`, żeby nie zejść poniżej celu dotykowego 44px, bo domyślny rozmiar w nowym `button.tsx` shadcn to 36px |

## Decyzje podjęte po drodze

- **CLI shadcn (najnowsza wersja) domyślnie dogenerował import `cn` z pakietu `cn` i `Slot`
  z pakietu-worka `radix-ui`** (ten drugi ciągnie za sobą dziesiątki niepotrzebnych
  komponentów Radixa — accordion, dialog, alert-dialog itd.). Zamiast zaakceptować to
  wprost, poprawiłem wygenerowany `button.tsx` tak, by korzystał z istniejącego `cn`
  z `@/lib/utils` i z węższego `@radix-ui/react-slot` — usunąłem `cn` i `radix-ui`
  z `package.json`/`pnpm-lock.yaml`. Plik `button.tsx` poza tym pozostaje kanoniczny
  (bez ręcznych zmian rozmiarów wariantów) — nadpisania 44px robię przez `className`
  w miejscach użycia, nie w samym pliku shadcn.
- Na macOS (system plików bez rozróżniania wielkości liter) usunięcie `Button.tsx` i
  dodanie `button.tsx` wymagało ręcznej korekty indeksu gita (`git rm --cached` +
  `git add`), inaczej commit trzymałby zawartość pod starą, wielką literą — co
  wywaliłoby importy na CI (Linux, rozróżnia wielkość liter).
- `ThemeToggle` pozostaje samodzielnym, współdzielonym komponentem (nie trafił w całości
  do `Navbar`), bo z niego korzysta też strona logowania — dwie rozjeżdżające się
  implementacje przełącznika motywu byłyby błędem.

## Świadomie pominięte

Sam widok 2D rzutu mieszkania — ta gałąź dostarcza tylko navbar jako pierwszy
element szkieletu dashboardu.

## Wpływ na wdrożenie

- **Migracja bazy:** nie
- **Nowe zmienne środowiskowe:** nie
- **Przebudowanie obrazu:** nie
- **Przerwa w działaniu:** nie

## Jak to sprawdzić

- `pnpm --filter @repo/web exec tsc --noEmit`, `pnpm --filter @repo/web test`,
  `pnpm --filter @repo/web lint`, `pnpm exec prettier --check apps/web` — wszystkie
  przechodzą.
- W przeglądarce (zalogowany): pulpit (`/`) pokazuje na górze przezroczysty navbar
  z dwoma przyciskami po prawej — ikonowy przełącznik motywu i "Wyloguj się";
  kliknięcie przełącznika przełącza `<html class="dark">` w obu kierunkach,
  kliknięcie wylogowania przenosi na `/login`.
- Sprawdzone przez SSR/curl (bez sesji): `/login` renderuje przycisk z dostępną nazwą
  "Przełącz na tryb ciemny" i linki logowania; `/` renderuje stan "Sprawdzanie sesji…"
  bez błędów serwera. **Pełnej wizualnej weryfikacji zalogowanego pulpitu w obu
  motywach w prawdziwej przeglądarce nie wykonano** — wymaga rzeczywistego logowania
  Google, do którego nie mam poświadczeń w tym środowisku.

## Ryzyka

- Domyślne rozmiary przycisków w nowym `button.tsx` shadcn (`h-9`/`size-9`, 36px) są
  mniejsze niż wymagany cel dotykowy 44px. Naprawione tam, gdzie dotknęłem kodu
  (`Navbar`, `AuthGate`, strona logowania) przez `className="h-11"` / `size-11` na
  wywołaniu, ale każde **nowe** miejsce używające `Button` bez jawnego rozmiaru
  dostanie domyślne 36px — trzeba o tym pamiętać przy kolejnych elementach pulpitu.
- Wariant `destructive` w wygenerowanym `button.tsx` shadcn używa `text-white`
  (surowy kolor Tailwinda) zamiast tokenu semantycznego. To kod wzorcowy z shadcn,
  nieużywany w tej zmianie (nie ma jeszcze żadnego wywołania `variant="destructive"`),
  ale zanim ktoś go użyje, warto zweryfikować kontrast w obu motywach.

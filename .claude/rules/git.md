# Reguły: praca z gitem

## Kto commituje

**Commit i push wykonuje się wyłącznie na wyraźną prośbę użytkownika.** Żaden agent nie
commituje z własnej inicjatywy, nawet gdy zadanie wygląda na skończone. Skończona praca
zostaje w drzewie roboczym — decyzja o utrwaleniu należy do człowieka.

**Autorem commita jest użytkownik.** Komunikat nie zawiera stopek `Co-Authored-By`
ani `Claude-Session`, a autorstwa nie nadpisuje się przez `--author`. Nie pisze się też
w treści commita, kto go wykonał — to informacja, którą git już ma.

## Gałęzie

- Format: **`SP-<numer>_<krótki-opis>`**, np. `SP-014_task-filters`.
- **Nie pracuje się bezpośrednio na `main`.** Jeśli zadanie zaczyna się na `main` —
  najpierw gałąź.
- Jedna gałąź to jedno zadanie. Gałąź, na której robisz „przy okazji" trzy inne rzeczy,
  jest nie do zrecenzowania.

## Wykaz zmian — obowiązkowy dla każdej gałęzi

Każda gałąź ma swój plik **`.changelog/<pełna-nazwa-gałęzi>.md`**, tworzony wg
`.claude/templates/change-log.md`. Nazwa pliku musi dokładnie odpowiadać nazwie gałęzi —
po niej szuka go CI.

- Zakładasz go **przy pierwszym commicie na gałęzi**, nie przed pull requestem. Wykaz
  odtwarzany z pamięci po fakcie zawsze gubi to, co najciekawsze: decyzje podjęte po
  drodze i rzeczy świadomie pominięte.
- Uzupełniany **na bieżąco**, przy powstawaniu zmiany.
- Sekcja „wpływ na wdrożenie" musi być wypełniona jawnie. Cztery razy „nie" to poprawna
  odpowiedź; pusta sekcja znaczy „nie sprawdziłem".
- Pozycje ze „świadomie pominięte" przenosi się do `docs/backlog.md` i podaje tu ich numery.

Po co, skoro są commity: commit opisuje jedną atomową zmianę i odpowiada na „co".
Wykaz opisuje całą gałąź i odpowiada na „po co", „czego świadomie nie zrobiliśmy"
i „co to znaczy przy wdrożeniu" — czyli na to, czego z diffa nie da się odczytać.

## Pull request

Opis PR-a to **wyłącznie link do wykazu zmian**, wstawiany automatycznie. Nic więcej
się tam nie wpisuje.

Powód, sposób sprawdzenia, wpływ na wdrożenie i ryzyka żyją w wykazie i tylko tam się
je aktualizuje — skopiowane do opisu rozjadą się przy pierwszej poprawce. Rzeczy, które
da się sprawdzić maszynowo (typy, lint, testy, dostępność, oba motywy), pilnuje CI,
więc lista kontrolna w opisie byłaby powtórzeniem tego, co i tak musi przejść.

**Linku do wykazu nie wklejasz ręcznie.** Workflow `changelog-link.yml` podstawia go
do opisu PR-a między znacznikami `<!-- changelog-link:start -->` i `:end` — przy otwarciu,
ponownym otwarciu i każdym kolejnym pushu. Nie ruszaj tych znaczników; bez nich workflow
dopisze sekcję na końcu opisu.

Ten sam workflow **przerywa CI**, gdy `.changelog/<gałąź>.md` nie istnieje. Działa po
stronie GitHuba, więc obowiązuje tak samo dla PR-a zakładanego z terminala, jak i z
przeglądarki.

## Komunikat commita

Format **conventional commits**, po angielsku. **Sam temat, bez treści:**

```
<typ>(<zakres opcjonalny>): <co robi ta zmiana>
```

Commit ma jedną linię i nic więcej. „Dlaczego" żyje w `.changelog/<gałąź>.md` i **tylko
tam** — dopisywanie go do commita tworzy drugie miejsce, w którym ta sama rzecz musi być
aktualizowana, a przy pierwszej poprawce oba się rozjeżdżają. Nie dopisuje się też stopek
ani adnotacji o tym, kto albo co pisało zmianę.

- Typy: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`, `build`, `perf`, `revert`.
- Zakres to pakiet lub obszar: `feat(api):`, `fix(web):`, `chore(deps):`.
- Temat w trybie rozkazującym, małą literą, bez kropki na końcu, do ~72 znaków.
  „add task filters", nie „added task filters" ani „Added Task Filters."
- Zmiana łamiąca zgodność: `!` po typie (`feat(api)!:`), a wyjaśnienie w wykazie zmian.

## Co należy do jednego commita

- **Jedna zmiana logiczna.** Commit, którego nie da się opisać jednym zdaniem bez „oraz",
  powinien być dwoma commitami.
- **Nie mieszaj refaktoru ze zmianą zachowania.** To najważniejsza reguła tej sekcji:
  w takim commicie nie da się odróżnić przeniesienia kodu od jego zmiany, więc recenzja
  jest pozorna, a wycofanie zabiera ze sobą coś, czego nie chciałeś cofać. Najpierw
  refaktor, potem zachowanie — albo odwrotnie, ale osobno.
- Razem w jednym commicie: zmiana schematu **z** migracją, zmiana kontraktu **z** obiema
  stronami, kod **z** jego testami.
- Zmiana wygenerowana automatycznie (formatowanie całego repo, aktualizacja lockfile)
  idzie osobno od zmian pisanych ręcznie.

## Czego nie commitujemy

Sekretów i plików `envs/*.env` (do repo trafiają wyłącznie `*.env.example`).
Zakomentowanego kodu — od pamiętania jest git. Logów debugowania i `console.log`
zostawionych po pracy. Plików generowanych i katalogów zależności.
`node_modules`, artefaktów budowania, wyników testów.

## Historia

- Poprawiasz (`--amend`, `rebase -i`) wyłącznie **własne, jeszcze niewypchnięte** commity.
- Po wypchnięciu historia jest wspólna — poprawka wchodzi nowym commitem.
- `git push --force` na wspólną gałąź jest zakazany (blokowany hookiem).
- Wycofanie zmiany na gałęzi publicznej robi się przez `revert`, nie przez kasowanie historii.

## Kiedy nie commitować

- Testy nie przechodzą albo nie zostały uruchomione.
- Zmiana zawiera obejście, o którym nikt nie wie — najpierw powiedz o nim użytkownikowi.
- Nie wiesz, co dokładnie znalazło się w drzewie roboczym. `git status` i `git diff`
  przed commitem, zawsze.

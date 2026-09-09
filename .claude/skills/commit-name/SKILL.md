---
name: commit-name
description: Proponuje nazwę commita dla niezacommitowanych zmian. Zwraca samą nazwę — bez treści commita, bez opisu zmian, bez commitowania.
---

# /commit-name

Jedno zadanie: **zwrócić proponowany temat commita** dla tego, co leży
w drzewie roboczym. Nic poza tym.

## 1. Zbierz zmiany

Wyłącznie niezacommitowane — zmiany już zapisane w historii są poza zakresem:

```bash
git status --short
git diff
git diff --cached
```

Nowe pliki nieśledzone nie pokażą się w `git diff` — dopisz je do obrazu na podstawie
`git status --short` (`??`).

Jeśli drzewo jest czyste, napisz „brak niezacommitowanych zmian" i skończ.
Nie proponuj nazwy dla ostatniego commita ani dla całej gałęzi.

## 2. Ułóż nazwę

Wg `.claude/rules/git.md`:

- `<typ>(<zakres>): <co robi ta zmiana>` — conventional commits, po angielsku,
- typy: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`, `build`, `perf`, `revert`,
- zakres to pakiet lub obszar (`api`, `web`, `contracts`, `deps`) — pomiń, gdy zmiana
  jest ogólnorepozytoryjna,
- tryb rozkazujący, małą literą, bez kropki, **do 72 znaków** (hook `commit-msg` odrzuci dłuższy),
- zmiana łamiąca zgodność: `!` po typie.

Temat mówi **co**, nie jak. Nie streszczaj diffa plik po pliku.

## 3. Odpowiedz

Wypisz **samą nazwę**, w jednej linii, w bloku kodu. Bez treści commita, bez uzasadnienia,
bez listy plików, bez gotowego `git commit`.

Jedyny dopuszczalny dodatek to jedno zdanie ostrzeżenia, gdy drzewo robocze zawiera
**więcej niż jedną zmianę logiczną** — wtedy podaj nazwy dla proponowanego podziału
(po jednej w linii) i zaznacz, że to osobne commity.

## 4. Czego ta komenda nie robi

Nie commituje, nie dodaje do indeksu, nie uruchamia weryfikacji, nie zakłada wykazu zmian.
Commit wykonuje użytkownik; pełne domknięcie gałęzi robi `/ship`.

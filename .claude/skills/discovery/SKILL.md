---
name: discovery
description: Ustala zakres produktu — czym ma być, co robimy dalej, co dokładamy. Wołaj na starcie projektu, przy nowym dużym obszarze oraz do przeglądu działającego projektu, gdy trzeba zdecydować, co robić w następnej kolejności. Efektem jest PRD albo lista kandydatów na następny krok, nigdy kod.
---

# /discovery

Cienkie opakowanie na agenta `discovery-analyst`. Ta komenda **nie powiela jego wiedzy** —
ustala tryb pracy i pilnuje kolejności kroków.

## 1. Rozpoznaj tryb

- **Tryb A — ustalanie zakresu.** `docs/prd/` jest puste albo dotyczy innego obszaru.
  Efekt: PRD.
- **Tryb B — przegląd działającego projektu.** Kod produktowy istnieje i pytanie brzmi
  „co dalej". Efekt: stan faktyczny, dług i braki, maks. 5 kandydatów na następny krok
  z kosztem zaniechania, rekomendowana kolejność.

Jeśli argument komendy wskazuje obszar (`/discovery powiadomienia`), zawęź do niego.

## 2. Sprawdź gałąź

Discovery produkuje dokumenty, ale i tak obowiązują reguły z `.claude/rules/git.md`:
nie pracujemy na `main`, a gałąź ma swój `.changelog/<nazwa-gałęzi>.md` od pierwszego
commita. Brakuje któregoś — załóż, zanim ruszysz.

## 3. Uruchom agenta

Deleguj do `discovery-analyst`.

**Jeśli dostaniesz `Agent type not found`:** agenci wczytują się przy starcie sesji, więc
świeżo dodany lub zmieniony plik nie jest widoczny. Nie rezygnuj — przeczytaj
`.claude/agents/discovery-analyst.md` i uruchom `general-purpose`, wklejając treść tego
pliku jako definicję roli. Prompt jest wtedy ten sam, więc zachowanie pozostaje miarodajne.
Powiedz użytkownikowi, że użyłeś obejścia i że restart sesji je usunie.

## 4. Przeprowadź dwa przebiegi

Agent nie rozmawia z użytkownikiem — Ty rozmawiasz.

1. **Przebieg 1** zwraca maks. 6 pytań z wariantami i rekomendacją oraz listę założeń
   przyjętych domyślnie. Zadaj te pytania użytkownikowi przez `AskUserQuestion`,
   zachowując warianty i rekomendacje agenta. Nie odpowiadaj za niego.
2. Streść założenia domyślne, żeby użytkownik mógł je obalić jednym zdaniem.
3. **Przebieg 2** dostaje odpowiedzi i pisze PRD do `docs/prd/`.

Gdy użytkownik odpowie ciężej, niż agent rekomendował — nie zawężaj za niego zakresu.
Przekaż jego decyzję dalej i poproś agenta o uczciwy podział na MVP i resztę.

## 5. Domknij

- Sprzeczności zgłoszone przez agenta **przedstaw wprost**, nie wygładzaj.
- Rzeczy odłożone dopisz do `docs/backlog.md` wraz z kosztem zaniechania.
- Zaktualizuj „Stan projektu" w `CLAUDE.md` i wykaz zmian gałęzi.
- Zakończ jednym zdaniem: kto powinien dostać robotę jako następny.

## Czego ta komenda nie robi

Nie pisze kodu, nie tworzy modeli w bazie i nie wybiera technologii — stack jest ustalony
w `.claude/rules/stack.md`. Nie commituje niczego bez wyraźnej prośby użytkownika.

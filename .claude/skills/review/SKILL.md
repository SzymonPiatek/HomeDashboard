---
name: review
description: Przegląda zmiany pod kątem błędów, bezpieczeństwa i złamań reguł projektu. Wołaj po większej zmianie i przed commitem. Zgłasza ustalenia, nie poprawia kodu.
---

# /review

Cienkie opakowanie na agenta `code-reviewer`.

## 1. Ustal zakres

Domyślnie: zmiany niezacommitowane (`git status`, `git diff`). Argument komendy może
wskazać inny punkt odniesienia — gałąź, zakres commitów, numer pull requesta.
Podaj agentowi zakres jawnie; recenzujemy zmianę, nie całe repozytorium.

Jeśli zakres jest pusty, powiedz to i nie uruchamiaj agenta.

## 2. Uruchom agenta

Deleguj do `code-reviewer`. Ma wyłącznie narzędzia do czytania — to celowe, więc nie
próbuj obchodzić braku uprawnień do zapisu.

**Jeśli dostaniesz `Agent type not found`:** przeczytaj `.claude/agents/code-reviewer.md`
i uruchom `general-purpose` z wklejoną treścią jako definicją roli. Zaznacz wtedy wprost,
że agent **nie może edytować plików**, bo obejście nie zawęża narzędzi. Poinformuj
użytkownika o użyciu obejścia.

## 3. Przekaż wyniki

- Ustalenia podaj w kolejności od najpoważniejszego, z oznaczeniem
  BLOKER / WAŻNE / DROBIAZG.
- **Nie dorabiaj uwag.** Jeśli agent nic nie znalazł, powiedz to wprost razem z tym,
  co sprawdził.
- Sekcję „poza zakresem" **przenieś do `docs/backlog.md`** — recenzent nie ma uprawnień
  zapisu, więc to Twoja robota. Każdy wpis z kosztem zaniechania.

## 4. Poprawki

Poprawki wykonuje agent, który pisał kod, a nie recenzent i nie Ty — chyba że zmiana
jest jednolinijkowa. Po naniesieniu poprawek uruchom weryfikację:

```bash
pnpm exec turbo run typecheck lint test
pnpm exec prettier --check .
```

Nie commituj bez wyraźnej prośby użytkownika.

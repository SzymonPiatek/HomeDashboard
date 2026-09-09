---
name: ship
description: Przygotowuje gałąź do pull requesta — uzupełnia wykaz zmian, uruchamia pełną weryfikację i proponuje komunikat commita. Nie commituje ani nie wypycha niczego samo.
---

# /ship

Domyka gałąź, nie wysyła jej. **Commit, push i otwarcie pull requesta wykonuje się
wyłącznie na wyraźną prośbę użytkownika** (`.claude/rules/git.md`).

## 1. Sprawdź, gdzie jesteś

- Gałąź robocza, nie `main`.
- Istnieje `.changelog/<pełna-nazwa-gałęzi>.md`. Jeśli nie — załóż z
  `.claude/templates/change-log.md`, bo CI odrzuci pull request bez wykazu.

## 2. Uzupełnij wykaz zmian

Złóż go z tego, co faktycznie się wydarzyło na gałęzi — z raportów agentów i z `git log`.
Nie odtwarzaj go z pamięci pobieżnie: sekcje o decyzjach i o rzeczach świadomie
pominiętych są najcenniejsze, bo tego nie widać w diffie.

Obowiązkowo wypełnij **wpływ na wdrożenie**: migracja, nowe zmienne środowiskowe,
przebudowanie obrazu, przerwa w działaniu. Cztery razy „nie" to poprawna odpowiedź;
pusta sekcja znaczy „nie sprawdziłem".

Rzeczy odłożone przenieś do `docs/backlog.md` i podaj w wykazie ich numery `BL-NNN`.

## 3. Zweryfikuj

```bash
pnpm exec turbo run build typecheck lint test
pnpm exec prettier --check .
```

Przy zmianach w interfejsie dodatkowo testy e2e przy działającym `pnpm dev`:

```bash
pnpm --filter @repo/web test:e2e
```

**Wynik podaj dosłownie.** Jeśli coś nie przechodzi, napisz to wprost — nieprawdziwe
„wszystko zielone" jest gorsze niż porażka.

## 4. Zaproponuj commit

Wg `.claude/rules/git.md`: conventional commits po angielsku, tryb rozkazujący, temat do
72 znaków. Treść tłumaczy **dlaczego**, nie streszcza diffa. Jedna zmiana logiczna na
commit — jeśli opis wymaga słowa „oraz", zaproponuj podział.

## 5. Powiedz, co dalej

Podaj gotowe polecenia do wykonania przez użytkownika i przypomnij, że opis pull requesta
uzupełni się sam: workflow `changelog-link.yml` wstawi link do wykazu i przerwie CI,
jeśli pliku brak.

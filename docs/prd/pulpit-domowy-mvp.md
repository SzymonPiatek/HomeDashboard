# PRD: Pulpit domowy — MVP (rzut mieszkania 2D)

- **Status:** Zatwierdzony
- **Data:** 2026-09-09
- **Autor:** discovery-analyst

## 1. Problem

Właściciel mieszkania ma rozproszone urządzenia smart home różnych marek (nawilżacz
Xiaomi w Mi Home, lodówka Samsung w SmartThings), każde w osobnej aplikacji, bez
wspólnego miejsca, w którym widać, **gdzie w mieszkaniu** co się znajduje i w jakim
jest stanie. Nie istnieje żaden wizualny, przestrzenny obraz mieszkania — ściany,
meble, urządzenia — który dałoby się rozbudowywać w miarę potrzeb.

## 2. Użytkownicy

Jeden użytkownik: właściciel mieszkania, jednocześnie jedyne konto w systemie.
Korzysta z dwóch miejsc dostępu: tabletu zamontowanego w mieszkaniu (przeglądarka
w trybie pełnoekranowym/kiosk) oraz przeglądarki na dowolnym innym urządzeniu, gdy
jest poza domem. Częstotliwość: codziennie, jako stały ekran informacyjny w domu
plus doraźne zaglądanie zdalnie. Nie ma dziś potrzeby obsługi domowników z osobnymi
kontami — nie zgłoszono jej.

## 3. Główny scenariusz

1. Właściciel otwiera pulpit — na tablecie w mieszkaniu albo zdalnie w przeglądarce,
   zawsze pod tą samą domeną.
2. Loguje się kontem Google.
3. Widzi pulpit z kafelkami elementów; jednym z nich jest "Rzut mieszkania".
4. Wchodzi na stronę elementu i widzi siatkę 2D — pustą przy pierwszym użyciu.
5. Rysuje segmenty ścian odpowiadające układowi mieszkania.
6. Przeciąga na siatkę ikony mebli i urządzeń (np. router, PC, TV) na pozycje
   zgodne z rzeczywistością.
7. Układ zapisuje się automatycznie/na żądanie; przy kolejnej wizycie (z tabletu
   albo zdalnie) widzi ten sam, zapisany rzut.

## 4. User stories

| ID | Historyjka | Kryteria akceptacji | MVP |
|----|-----------|---------------------|-----|
| US-1 | Jako właściciel chcę zalogować się kontem Google, żeby dostęp do pulpitu — dostępnego pod publiczną domeną zarówno lokalnie, jak i zdalnie — był zabezpieczony bez budowania własnej infrastruktury haseł, mimo braku trybu offline. | 1. Logowanie to przekierowanie do Google i powrót z autoryzacją (OAuth), bez własnego formularza hasła.<br>2. Logowanie kończy się sukcesem wyłącznie dla konta Google z adresem e-mail na białej liście właściciela; każde inne konto Google dostaje odmowę, bez ujawniania czy próbowano się zalogować na istniejące konto.<br>3. Sesja po zalogowaniu żyje w ciasteczku HttpOnly. | tak |
| US-2 | Jako właściciel chcę mieć na pulpicie element "Rzut mieszkania" z własną stroną, żeby mieć jedno miejsce z wizualnym stanem mieszkania. | 1. Element jest widoczny w nawigacji i ma dedykowaną stronę.<br>2. Przy braku zapisanego rzutu strona pokazuje pustą siatkę, nie błąd. | tak |
| US-3 | Jako właściciel chcę ręcznie narysować ściany mieszkania na siatce 2D, żeby rzut odzwierciedlał rzeczywisty układ pomieszczeń. | 1. Mogę dodać, przesunąć i usunąć segment ściany.<br>2. Układ ścian jest zapisany i widoczny po ponownym wejściu na stronę. | tak |
| US-4 | Jako właściciel chcę przeciągać na rzut ikony mebli i urządzeń (z zamkniętej listy typów) i zapisywać ich pozycję, żeby widzieć, co faktycznie stoi gdzie w mieszkaniu. | 1. Mogę umieścić obiekt wybranego typu przez przeciągnięcie na siatkę.<br>2. Mogę przesunąć i usunąć umieszczony obiekt.<br>3. Pozycje są zapisane i widoczne po ponownym wejściu na stronę. | tak |
| US-5 | Jako właściciel chcę korzystać z pulpitu zarówno z tabletu w mieszkaniu, jak i zdalnie spoza niego, żeby mieć ten sam widok niezależnie od miejsca. | 1. Ta sama domena obsługuje dostęp lokalny i zdalny, bez osobnego trybu offline.<br>2. Interakcja (rysowanie, przeciąganie) działa dotykiem na tablecie i myszą/klawiaturą na desktopie, zgodnie z celami dotykowymi z `.claude/rules/web.md`. | tak |
| US-6 | Jako właściciel chcę widzieć rzeczywisty stan nawilżacza Xiaomi i lodówki Samsung na rzucie mieszkania (przez Home Assistant), żeby nie sprawdzać osobnych aplikacji marek. | Zależne od uruchomienia Home Assistant na Raspberry Pi — sprzęt dziś nie istnieje fizycznie. Kryteria do doprecyzowania, gdy sprzęt powstanie. | nie |

Najmniejszy zestaw dający wartość to **US-1 do US-5** — bezpieczny, wizualny,
aktualny obraz mieszkania dostępny z dowolnego miejsca, bez zależności od sprzętu
(Raspberry Pi/Home Assistant), którego jeszcze nie ma. US-6 czeka na BL-002.

## 5. Zakres

**W zakresie:**
- Logowanie kontem Google (OAuth), ograniczone białą listą do adresu e-mail
  właściciela — bez hasła i bez 2FA e-mail.
- Jeden element pulpitu: "Rzut mieszkania", z własną stroną w rejestrze elementów.
- Ręczne rysowanie i edycja ścian mieszkania w 2D na siatce.
- Ręczne dodawanie, przesuwanie i usuwanie ikon mebli/urządzeń z zamkniętej listy
  typów (np. router, PC, TV — lista domyślnie mała, do doprecyzowania z UX).
- Zapis i wczytywanie układu (ściany + obiekty) w bazie.
- Dostęp z tabletu (kiosk) i zdalnie, przez tę samą domenę.
- Jedno konto (właściciel), bez ról i bez wielu użytkowników.

**Poza zakresem (świadomie):**
- Rzut 3D mieszkania — [BL-001](../backlog.md#bl-001--rzut-mieszkania-w-3d), naturalne
  rozszerzenie 2D, nie fundament MVP.
- Integracja z Home Assistant i realne sterowanie/odczyt stanu nawilżacza Xiaomi
  i lodówki Samsung —
  [BL-002](../backlog.md#bl-002--integracja-z-home-assistant-nawilżacz-xiaomi-lodówka-samsung),
  zablokowane brakiem fizycznego Raspberry Pi z Home Assistant.
- Automatyzacje/reguły sterujące urządzeniami —
  [BL-003](../backlog.md#bl-003--automatyzacjereguły), zależne od BL-002.
- Historia i wykresy stanu urządzeń —
  [BL-004](../backlog.md#bl-004--historia-i-wykresy-stanu-urządzeń), zależne od BL-002.
- Powiadomienia o stanie urządzeń —
  [BL-005](../backlog.md#bl-005--powiadomienia-o-stanie-urządzeń), zależne od BL-002.
- Import planu mieszkania z pliku lub automatyczna detekcja układu —
  [BL-006](../backlog.md#bl-006--import-planu-mieszkania--automatyczna-detekcja-układu),
  MVP jest celowo w pełni ręczny.
- Więcej urządzeń i marek smart home niż dzisiejsze dwa —
  [BL-007](../backlog.md#bl-007--więcej-urządzeń-i-marek-smart-home), zależne od BL-002.
- Wielu użytkowników/domowników z osobnymi kontami i rolami — nie zgłoszono potrzeby,
  model jednokontowy pozostaje zgodny z regułami repo.

## 6. Wymagania niefunkcjonalne

| Obszar | Wymaganie | Jak mierzymy |
|---|---|---|
| Wydajność | Strona rzutu mieszkania (do ok. 50 obiektów) staje się interaktywna w ≤2 s na tablecie w sieci domowej | pomiar czasu do interaktywności na docelowym tablecie |
| Dostępność (a11y) | WCAG 2.2 AA na pulpicie i stronie elementu; umieszczanie i przesuwanie obiektu ma pełny odpowiednik klawiaturowy, nie tylko przeciąganie myszą/palcem | automatyczne sprawdzenie axe na ścieżkach krytycznych + ręczna weryfikacja fokusu i obsługi klawiaturą |
| Bezpieczeństwo | Logowanie wyłącznie kontem Google z białej listy; sesja w ciasteczku HttpOnly zgodnie z `.claude/rules/api.md` | test integracyjny logowania z adresem na białej liście i spoza niej |
| Urządzenia / przeglądarki | Tablet dotykowy w trybie kiosk oraz desktop (mysz/klawiatura), najnowsze wersje Chrome/Safari | ręczny test na docelowym tablecie + Playwright w co najmniej jednej przeglądarce |
| Skala | 1–5 elementów pulpitu, jedno mieszkanie, jeden użytkownik, do ok. 50 obiektów na rzucie | brak testu obciążeniowego na tym etapie — założenie odnotowane, nie zmierzone |

## 7. Ograniczenia

- Stack ustalony w `.claude/rules/stack.md` (Next.js/Express/Prisma/PostgreSQL,
  monorepo pnpm + Turborepo) — nie jest przedmiotem tego PRD.
- Jedna domena przez reverse proxy (`.claude/rules/stack.md`, `.claude/rules/ops.md`)
  — brak trybu offline, tablet zawsze łączy się przez sieć, tak jak dostęp zdalny.
- Logowanie zależy od dostępności Google jako dostawcy OAuth — poświadczenia
  aplikacji (Client ID/Secret) zakłada i dostarcza właściciel, konfiguracja poza
  tym PRD.
- Raspberry Pi z Home Assistant **nie istnieje fizycznie dzisiaj** — to kierunek
  docelowy integracji IoT, nie stan obecny. Nie planować sprintu integracyjnego
  (US-6, BL-002) przed potwierdzeniem, że sprzęt działa.
- Brak twardego terminu.
- Jeden użytkownik/administrator — brak dziś wymogu wielu kont.

## 8. Ryzyka

| Ryzyko | Skutek | Sygnał ostrzegawczy |
|---|---|---|
| Brak fizycznego Raspberry Pi/Home Assistant | Element "Rzut mieszkania" pokazuje tylko statyczne ikony bez realnego stanu urządzeń; US-6/BL-002 nie mogą ruszyć | Próba zaplanowania integracji HA w sprincie bez potwierdzenia, że sprzęt działa i jest w sieci |
| Przeciąganie obiektów na dotyku tabletu bywa niedokładne (przypadkowe przesunięcia, brak precyzji palcem) | Frustrujący, niedokładny rzut na urządzeniu, które jest głównym miejscem korzystania | Trudności z precyzyjnym umieszczeniem obiektu zgłoszone lub zaobserwowane podczas testów na tablecie |
| Logowanie zależy wyłącznie od Google jako dostawcy OAuth | Awaria/niedostępność Google albo utrata dostępu do konta Google odcina właściciela od własnego pulpitu, bez metody zapasowej | Niedostępność logowania podczas testu, brak jakiejkolwiek alternatywnej ścieżki wejścia |
| Ręczne rysowanie ścian i mebli bez importu/detekcji jest pracochłonne przy każdej zmianie układu mieszkania | Rzut przestaje być aktualizowany, dane w elemencie stają się nieaktualne | Rzut nie był edytowany mimo zgłoszonej zmiany w mieszkaniu |
| Jednokontowy model bez ról może okazać się za wąski, gdy ktoś inny zechce mieć dostęp | Przebudowa modelu tożsamości później (migracja danych, zmiana auth) | Prośba o dodanie drugiego konta/dostępu |

## 9. Otwarte kwestie

Rozstrzygnięte z użytkownikiem 2026-09-09:

- [x] **2FA e-mail wchodzi do MVP** (US-1) — potwierdzone pierwotnie, następnie
      **zastąpione logowaniem Google** tego samego dnia (patrz niżej). Hasło+2FA
      e-mail jako metoda zapasowa przeniesione do
      [BL-008](../backlog.md#bl-008--logowanie-hasłem--2fa-e-mail-jako-metoda-zapasowa).
- [x] **Logowanie Google zastępuje całkowicie hasło+2FA e-mail w MVP** — właściciel
      uznał to za prostsze: Google zapewnia silne uwierzytelnienie bez budowania
      własnej infrastruktury haseł i wysyłki e-mail. Model tożsamości z dwoma
      źródłami (hasło i `googleSub`) opisany w `.claude/rules/api.md` pozostaje
      architektonicznie otwarty na dodanie hasła później — MVP używa tylko ścieżki
      Google.
- [x] **Lista typów ikon mebli/urządzeń** — mała lista startowa, projektuje ją
      `ux-designer` jako część specyfikacji elementu "Rzut mieszkania"; rozszerzanie
      listy o nowe typy to osobne zadanie później, nie edytor ikon w UI od startu.
- [x] **Sesja na tablecie kiosk jest długożyjąca** — tygodnie/miesiące bez wymuszonego
      ponownego logowania; wylogowanie tylko ręczne albo przy odebraniu dostępu
      (usunięcie z białej listy). Sesja zdalna (spoza mieszkania) trzyma standardową
      politykę wygasania. Wpływa na projekt auth w `backend-dev`.

Wciąż otwarte, nie blokują PRD:

- [ ] Jednostka/skala siatki rzutu (np. metry vs. jednostka umowna) — szczegół
      techniczny dla `web-architect`, nie blokuje PRD.

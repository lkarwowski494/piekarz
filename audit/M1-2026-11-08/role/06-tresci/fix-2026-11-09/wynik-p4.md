06-tresci fix M2 p4 (2026-11-09), gałąź naprawy/M2-koordynator-napraw-2026-11-09-p4 (baza bb162ddf). Polecenie: `audit/M1-2026-11-08/naprawy/polecenia/06-tresci-p4.md`. Wyjątek nazwany w poleceniu: rola 06 zmienia też kod, czyli logikę wyboru tekstu kroku i blokadę planu. Zatwierdzenie: KO-007, tryb nocny D-289, do weta właściciela.

## ETAP 0
- Środowisko: Linux 6.18, Node v22.23.4, git, node_modules zainstalowane. Bez Xcode i bez symulatora. Nie zrobiłem zrzutów ekranu, bo nie ma przeglądarki z aplikacją; zmiana jest w tekście kroku i w blokadzie przycisku, a dowodem są testy.
- `git status` na starcie: czysto (HEAD bb162ddf). Przed każdym commitem: `git status --short` bez cudzych zmian. Równolegle pracował recenzent tylko do odczytu.
- Subagent: bez narzędzia do uruchamiania subagentów (sam działam jako subagent). Przegląd ścieżki planu i drugi przegląd AI przekładu uruchomi M2.

## Klasyfikacja i plan
| ID | Źródło | Rodzaj | Poprawka |
|---|---|---|---|
| M1-audytor-generalny-089 | 06-tresci-602 | M (z wyborem DEC-21 = a) | `powodBezPlanu` blokuje plan brioszki. D-309 zmienia się na opcję (d). PIE-BRI-900 zostaje otwarte z adnotacją. |
| M1-audytor-generalny-088 | 06-tresci-601 | D | Opcja (a). Tekst keksówki i stali tylko dla receptur wektora D-304 (brioszka, durum). Pozostałe receptury dostają krok bez liczb z odesłaniem do „O recepturze”. |

## M1-audytor-generalny-089 · commit 3e05396e
- Test: `tests/brioszka-bez-planu-089.test.ts`. Przed zmianą: 3 z 3 czerwone, `powodBezPlanu` zwracał null (`dowody/p4-089-przed.txt`). Po zmianie: 11 z 11 zielonych, razem z testami 061 i p9b (`dowody/p4-089-po.txt`).
- Kod: `src/lib/plan-receptury.ts:86`. Dla `BRIOCHE_RECIPE_IDS` z zakwasem `powodBezPlanu` zwraca „Plan dla tej receptury na zakwasie czeka na czasy rośnięcia ciasta. Ilości i wskazówki są wyżej.”
- Sprawdziłem wszystkie wejścia:
  - Ekran receptury: przycisk „Ułóż plan” (`app/(tabs)/receptury/receptura.tsx:253`).
  - Plan wypieku: „Zacznij wypiek” i „Zaplanuj” są nieaktywne, gdy powód istnieje (`app/(tabs)/receptury/harmonogram.tsx:114`, `zablokowany` w linii 212). Dotyczy to też wejścia z „Piecz ponownie” w Dzienniku (`src/hooks/useBakeHistory.ts` przekazuje recipeId).
  - Ekran „Dziś”: skrót „Zaplanuj na ten dzień” prowadzi do listy receptur, więc dalej przez ten sam przycisk.
  - Tryb maszyny nie dotyczy brioszki: segment trybu maszyny ma tylko receptura drożdżowa albo receptura z wersją drożdżową (`src/recipes/maszyna-receptur.ts:44`), a brioszka nie ma wersji drożdżowej.
  - Plany zapisane i wypieki zaczęte przed zmianą zostają bez zmian (zasada 10). Kroki brioszki działają dalej dla tych wypieków.
- Test katalogu: z planem jest 10 receptur na zakwasie, tak jak przed zmianą, bez brioszki. 15 receptur bez zakwasu ma powód D-3.
- Kontrakt `docs/scope-contract.md` F-26 brzmi teraz: „10 z planem…; 1 z zakwasem bez planu: brioszka na Lievito Madre…; 15 bez zakwasu”. Test 061 liczy „bez zakwasu” z `starterPercentage`, a nie jako różnicę. To zmiana testu z powodu nazwanej zmiany kontraktu, a nie dopasowanie testu do wyniku.
- Rejestr: PIE-BRI-900 ma status „otwarte”, z adnotacją 089 w `uwagi`.
- Treść: nowy plik `docs/tresci/pl|en/powody-bez-planu.md` (`[T:-]`). Pierwsza próba dopisania sekcji do `plan-brioszki.md` łamała parser testu M2-012, który wymaga nagłówka kroku, więc tekst trafił do osobnego pliku.
- verify po `git add`: kod 0, 651 zestawów, 6804 testy (`dowody/p4-089-verify.txt`). Pierwszy przebieg miał kod 1: parser `plan-brioszki.md` i nieaktualna macierz. Oba poprawione przed commitem.

## M1-audytor-generalny-088 · commit d04c94ca
- Test: `tests/pieczenie-bez-cudzych-liczb-088.test.ts`. Przed zmianą: 6 z 15 czerwonych (`dowody/p4-088-przed.txt`):
  - rye_100_pan i borodinsky_rye miały „204” spoza danych receptury (230/195 i 230/190);
  - latvian_scalded_rye miał „250” spoza danych (225);
  - te same trzy receptury przy 50% żyta.

  Po zmianie: 89 z 89 zielonych, razem z testami 008, M2-012 i wznowieniem brioszki (`dowody/p4-088-po.txt`).
- Interpretacja testu akceptacyjnego (do weta): liczby, których nie ma w danych receptury, ma też wektor D-304 (garnek 260 °C i 45 min, brioszka 204 °C, 20 i 8–10 min, PIE-GAR-001 i PIE-BRI-001). Dla receptur wektora test sprawdza więc, czy tekst dosłownie pochodzi z `pieczenie-receptur.md`, co pilnuje też test 008. Dla pozostałych receptur sprawdza, czy każda liczba °C i min równa się danym receptury; dziś te teksty nie mają żadnej liczby.
- Kod:
  - `src/core/pieczenie-receptury.ts:69`: keksówka albo stal bez `tekstZrodla` dostaje „Nagrzej piekarnik do temperatury pieczenia podanej w „O recepturze”.” oraz „Piecz w temperaturze i przez czas podane w „O recepturze”.”. Id kroków (`bake_forma`, `bake_stal`) i czasy się nie zmieniają.
  - `src/lib/pieczenie-planu.ts:30`: `TEKST_PIECZENIA_ZE_ZRODLA` (brioszka, durum).
  - `src/core/po-co-ten-krok.ts:81`: nagrzewanie bez liczb nie pokazuje zdania o garnku KRO-POC-011. Bez tej zmiany żytnia receptura w keksówce dostałaby to zdanie, czyli regresję.
- Wyszukałem ponownie teksty „Posmaruj brioszkę”, „Piecz w 250 °C” i „204 °C” w `src` i `app`. Poza słownikami i notatkami receptur z ich własnymi danymi zostało tylko źródło w `pieczenie-receptury.ts`.
- Treść: nowe sekcje `[T:-]` na końcu `docs/tresci/pl|en/pieczenie-receptur.md`.
- verify po `git add`: kod 0, 652 zestawy, 6821 testów (`dowody/p4-088-verify.txt`).

## Klucze i przekład
- Nowe klucze PL, a w nawiasach wpis EN (wszystkie w `src/lib/i18n-en/czesc-31.ts`):
  - 089: „Plan dla tej receptury na zakwasie czeka na czasy rośnięcia ciasta. Ilości i wskazówki są wyżej.” (The plan for this sourdough recipe is waiting for dough rising times. Amounts and tips are above.)
  - 088: „Nagrzej piekarnik do temperatury pieczenia podanej w „O recepturze”.” (Heat the oven to the baking temperature given in “About This Recipe”.)
  - 088: „Piecz w temperaturze i przez czas podane w „O recepturze”.” (Bake at the temperature and for the time given in “About This Recipe”.)
- Istniejący klucz nie wystarczał. Klucz orkiszu mówi o drożdżach, a klucze stali i keksówki mają liczby.
- Pliki przekładu 33 języków (MT claude-opus-5-5): `docs/lokalizacja/przeklad-m2-089-2026-11-09.json` i `docs/lokalizacja/przeklad-m2-088-2026-11-09.json`. Wpiąłem je skryptem `wepnij-maly-przeklad.py`, potem uruchomiłem `npm run i18n:kontekst`. `check:i18n` daje 0 błędów, test „czeka na przekład” jest zielony. Drugi przegląd AI się nie odbył; uruchomi go M2.
- Teksty do akceptacji roli 04: trzy klucze PL wyżej. Zwrot „O recepturze” w cudzysłowie to nazwa karty z każdego języka.

## Decyzje do weta (D-289); numery nada M2
1. 089: D-309 zmieniona na opcję (d), czyli brioszka na Lievito Madre nie ma planu do zamknięcia PIE-BRI-900 (DEC-21 = a). Odrzucone: (b) plan bez liczby rośnięcia, bo „gotowe o” byłoby tylko orientacyjne; (c) zostawić, bo harmonogram byłby za krótki.
2. 088: opcja (a). Receptury spoza wektora D-304 w keksówce i na stali dostają krok bez liczb z odesłaniem do „O recepturze”. Odrzucone:
   - liczby z danych receptury w tekście: wymagałyby parametru w kluczu, a migawka kroku niesie gotowy klucz PL. Dane pieczenia żyta też nie mają źródła (D-256);
   - (b) profil garnka dla chleba w keksówce;
   - (c) zostawić.
3. 088: interpretacja testu akceptacyjnego dla receptur wektora, opisana wyżej.

## Nowe znaleziska (nienaprawione)
- **06-tresci-603 (P2, realny).** Chleb z semoliny durum na stali dostaje przy nagrzewaniu zdanie „Po co ten krok” o garnku: „Garnek nagrzewasz pusty, żeby po włożeniu ciasta zrobiła się w nim para.” (`src/core/po-co-ten-krok.ts:46`). Filtr w linii 81 pomija tylko teksty keksówki i teksty bez liczb. Przy pieczeniu na stali (`bake_stal`, durum i łotewski przy życie ≤ 50%) pokazuje się zdanie o nacięciu KRO-POC-012, którego nikt nie sprawdził dla stali. Poprawka: dodać nagrzewanie stali do filtra i zdecydować o zdaniu o nacięciu (rola 06 + 08). Ustalone z czytania kodu, bez testu.
- **06-tresci-604 [DO USTALENIA] (brzegowy).** Receptura użytkownika skopiowana z brioszki („Zapisz jako moją”) ma własne id. `powodBezPlanu` i `pieczenieDlaId` jej nie rozpoznają, więc dostaje plan bochenka w garnku. Tak było przed 089. Nie sprawdziłem, czy kopia przechowuje id receptury bazowej.

## Otwarte
- PIE-BRI-900 (czasy brioszki na Lievito Madre), ze źródłem ze szczebla 1–4. Po zamknięciu wraca plan, w opcji (b) z D-309.
- Przegląd ścieżki planu i drugi przegląd AI przekładu 088 i 089 uruchomi M2. Akceptacja tekstów należy do roli 04.

## Kontrola dowodów i sekretów
Wynik w `dowody/p4-sprawdz-raport.txt`.

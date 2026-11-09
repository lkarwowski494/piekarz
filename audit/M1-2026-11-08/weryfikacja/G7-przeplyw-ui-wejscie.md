# Wejście weryfikacji G7-przeplyw-ui (M1 2026-11-08, commit 2ef8870a)
Pozycje do obalenia; uwaga: kilka ID z różnych ról może opisywać ten sam mechanizm (oceniasz każde ID osobno).

### 04-studio-projektowe-001 · Na prowadzeniu instrukcja kroku i ostrzeżenie bezpieczeństwa są pod pasem, poza pierwszym ekranem
- Pozycja listy kontrolnej: SP-17
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: D (defekt)
- Dowód: pas prowadzenia składa z `PasZakladki` tytuł kroku, «Krok n z m», czas 56 pt, «potem …», nazwę receptury, spiralę 150–220 pt z legendą i «Gotowe …» (`src/components/stolnica/ProwadzenieWypieku.tsx:329`, `src/components/stolnica/ProwadzenieWypieku.tsx:330`); karta «Co zrobić» i ostrzeżenie są dopiero pod pasem w przewijanej treści (`src/components/stolnica/ProwadzenieWypieku.tsx:344`, `src/components/stolnica/StrefaKroku.tsx:110`), a przy wyłączonych powiadomieniach nad nimi stoi jeszcze baner (`src/components/stolnica/ProwadzenieWypieku.tsx:342`). Projekt sam zapisał skutek: `docs/decyzje.md:1369` (D-238) «pas zajmuje prawie cały ekran (iPhone 17 Pro)». Rachunek [OCENA] w `dowody/sp17-pas-prowadzenia-rachunek.txt`: na iPhonie 17 Pro widać ok. 130 pt treści (nagłówek karty i 3–4 wiersze instrukcji, ostrzeżenie poza ekranem), na iPhonie SE 3. gen. ok. 0 pt, przy dwóch wypiekach na 17 Pro 0–70 pt. Makieta wzorcowa (`docs/design/karty/zrzuty/wypiek-prowadzenie-390-light.png`) ma pas bez spirali i kartę «Co zrobić» oraz ostrzeżenie w pierwszym ekranie; spirala na pas weszła w p4b (D-195, «Do przeglądu roli 04»).
- Mechanizm: treść kroku pod wysokim pasem przewijanym razem z nią; `grep -n "<StrefaPlanu naPasie" src/components/stolnica/ProwadzenieWypieku.tsx` → 1 trafienie (`:330`); ten sam pas z filtrami na Recepturach i Dzienniku rozwiązano przy dużym tekście przeniesieniem pod pas (D-121 b), prowadzenia to nie objęło.
- Powraca: tak, ten sam rodzaj co D-122 (główna akcja poza pierwszym ekranem na „Dziś”, E2E flow 02) i D-238 (przełącznik pod paskiem kciuka) → trwała kontrola: test układu albo E2E z asercją widoczności `karta-kroku` bez przewijania.
- Kroki w aplikacji: receptura → „Ułóż plan” → „Zacznij wypiek” → prowadzenie; krok z ostrzeżeniem (np. pieczenie w garnku) na iPhonie SE albo przy dwóch wypiekach: widać czas i „Zrobione”, nie widać, co zrobić ani ostrzeżenia, bez przewinięcia mokrą ręką.
- Weryfikacja przeciwna (E2): (a) czy pas zwija się przy przewijaniu? Nie: czapka pokazuje mały tytuł dopiero po przewinięciu (`EkranZPasem`), pas nie maleje; (b) czy ostrzeżenie dociera innym kanałem? Ogłoszenie VoiceOver mówi tylko nazwę kroku, powiadomienie — nazwę kroku; ostrzeżenie jest tylko w treści; (c) czy decyzja przyjęła ten koszt? D-195 zostawiła miejsce spirali „do przeglądu roli 04”, nie przyjęła utraty instrukcji. Znalezisko zostaje. Wpływ na bezpieczeństwo (ostrzeżenie o gorącym garnku poza wzrokiem) zgłaszam roli 06/07 przez M1; nie podnoszę do P0, bo ostrzeżenie jest na ekranie i w kroku, którego dotyczy.
- Test akceptacyjny: przy 375×667 i 402×874, domyślnym tekście, jednym i dwóch wypiekach, z wyłączonymi powiadomieniami: nagłówek „Co zrobić”, pierwszy wiersz instrukcji i tytuł ostrzeżenia mieszczą się nad paskiem kciuka bez przewijania (test układu z wysokościami albo E2E `assertVisible karta-kroku` bez `scroll`); przy AX5 dopuszczalne przewinięcie (D-142).

### 04-studio-projektowe-002 · Stuknięcie kroku w arkuszu „Plan wypieku” przestawia trwający wypiek bez pytania i bez cofnięcia
- Pozycja listy kontrolnej: SP-20
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: D (defekt)
- Dowód: arkusz „Plan wypieku” otwierany z pasa prowadzenia pokazuje listę kroków, każdy wiersz to przycisk (`src/components/stolnica/BakeStepsList.tsx:84`), który wywołuje skok (`src/components/stolnica/PlanWypiekuArkusz.tsx:43`) i zamyka arkusz; skok przesuwa plan od wybranego kroku na „teraz”, uruchamia zegar od pełnego czasu i czyści cofnięcie (`src/components/stolnica/ProwadzenieWypieku.tsx:239`). Wiersz ma tylko rolę `button` i stan `selected`, bez podpowiedzi, co zrobi.
- Mechanizm: zmiana stanu wypieku jednym stuknięciem w widoku do przeglądania; `grep -rn "onGoToStep" src` (bez testów) → 4 miejsca w jednym łańcuchu (`src/components/stolnica/BakeStepsList.tsx:21`, `:84`, `src/components/stolnica/PlanWypiekuArkusz.tsx:43`, `src/components/stolnica/ProwadzenieWypieku.tsx:405`); inne listy w aplikacji otwierają szczegóły (`gesty.md`).
- Powraca: nie (zachowanie skoku poprawiono w audycie niezależnym D-8 tylko co do godzin; cofnięcia nie dodano) → trwała kontrola w teście `src/__tests__/skok-kroku-d8.test.tsx` (nowa asercja: po skoku jest „Przywróć” i przywraca postęp).
- Kroki w aplikacji: prowadzenie → „Plan wypieku” → stuknięcie wiersza (np. chcąc sprawdzić czas kroku albo przy przewijaniu mokrym palcem) → arkusz znika, wypiek jest na innym kroku z nowym zegarem, „Cofnij poprzedni” nie przywraca stanu sprzed skoku; dalsze powiadomienia przesunięte.
- Weryfikacja przeciwna (E2): czy skok jest celową funkcją? Tak (design-spec §11b „056”, komentarz w `PlanWypiekuArkusz.tsx`), więc znalezisko nie dotyczy istnienia skoku, tylko braku cofnięcia; czy da się wrócić ręcznie? Stuknięcie poprzedniego kroku zaczyna go od nowa od teraz — czas, który już upłynął, przepada. Znalezisko zostaje.
- Test akceptacyjny: test komponentu: po stuknięciu wiersza widać pasek z „Przywróć”; „Przywróć” odtwarza indeks kroku, godziny kroków, zegar i stan „Cofnij poprzedni” sprzed skoku; test czerwony na 2ef8870a.

### 04-studio-projektowe-003 · Siedem arkuszy poza systemem kart (D-139, D-141), w tym „Plan wypieku” z gołym nagłówkiem
- Pozycja listy kontrolnej: SP-13
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: P (decyzja produktowa: zakres systemu)
- Dowód: zasada systemu: na tle ekranu nie leży żaden goły nagłówek ani akapit (`docs/design/karty/README.md:6`); tabela partii README §4 nie wymienia tych arkuszy. Bez `Karta`/`wygladKarty`/`ArkuszKart` (grep „Karta:0”): `src/components/stolnica/PlanWypiekuArkusz.tsx`, `src/components/stolnica/BakeStepsList.tsx` (nagłówek na tle krojem tytułów 16 pt, `src/components/stolnica/BakeStepsList.tsx:75` i `:155`, karta składników z obwódką `akcent`), `src/components/stolnica/PoCoTenKrokArkusz.tsx`, `src/components/calculator/TemperaturaWodySheet.tsx` z `AccordionDdtSection.tsx`, `src/components/kalendarz/ArkuszDnia.tsx`, `src/components/start/ArkuszPlanu.tsx`, `src/components/ImportRecipeModal.tsx`, `src/components/settings/ImportZPlikuArkusz.tsx`. Słowa właściciela przy D-139 (`docs/decyzje.md:768`): wszystko ma być obrobione i zamknięte w karty. Poprzednia weryfikacja objęła 6 arkuszy zamykających przepływy (D-214 pkt 002, D-215); tych siedmiu nie.
- Mechanizm: arkusze dodane albo pominięte poza listą partii README §4; `grep -c '<Karta\|wygladKarty\|ArkuszKart'` → 0 w 9 plikach wyżej (7 arkuszy i 2 komponenty ich treści), 5 w `SkladnikiSheet.tsx` (dla porównania: arkusz objęty systemem).
- Powraca: tak (D-139 → D-214 002: arkusze poza systemem) → trwała kontrola: test, który dla każdego `Modal` z `presentationStyle="pageSheet"` w `src/` wymaga `ArkuszKart` albo nazwanego wyjątku (lista jak w teście czapki „EKRANY”).
- Kroki w aplikacji: prowadzenie → „Plan wypieku”; prowadzenie → „Po co ten krok”; receptura → „Temperatura wody”; Dziś → dzień w pasku tygodnia (arkusz dnia); Dziś → plan z listy (arkusz planu); Receptury → import; Ustawienia → import z pliku.
- Weryfikacja przeciwna (E2): czy któryś arkusz ma decyzję wyjątku? Nie znalazłem (grep nazw tych plików w `docs/decyzje.md`: 0 trafień). Czy lista systemowa (wiersze z linią) nie jest dopuszczalna? README §3 zostawia „arkusze” jako systemowe tylko co do zachowania (uchwyt, przyciski), treść ma być w kartach. Znalezisko zostaje; poziom P1 jak D-214 002, bo właściciel uznał wygląd za blokujący 1.0.
- Test akceptacyjny: test „arkusze w systemie kart”: każdy `pageSheet` w `src/` renderuje `ArkuszKart` albo jest na liście wyjątków z ID decyzji; zrzuty 390 jasny/ciemny dla siedmiu arkuszy obok makiet.

### 08-programista-002 · Pasek tygodnia na „Dziś” zostaje na starym tygodniu po północy z niedzieli na poniedziałek
- Pozycja listy kontrolnej: DEV-01
- Poziom: P1
- Realność: realny (co tydzień, przy aplikacji otwartej albo wstrzymanej w tle przez noc z niedzieli na poniedziałek) · Pewność: wysoka
- Rodzaj: D
- Dowód:
  - `src/hooks/useKalendarz.ts:59` ustawia kotwicę widoku raz przy montowaniu: „widokDzis('tydzien', Date.now())”.
  - Pasek liczy dni z kotwicy: `src/hooks/useKalendarz.ts:99`, „dniPaska(now, first, widok.kotwica)”. Zegar minutowy zmienia tylko `now` (`src/hooks/useKalendarz.ts:63-69`). Zakładka "Dziś" zostaje zamontowana, a powrót na nią nie zmienia widoku.
  - Sonda: kopia testu BR-KAL-001 „Północ” z `src/__tests__/dzis-d4b.test.tsx:385`, w której zmieniono tylko datę na północ 2026-11-09 (niedziela→poniedziałek). Wynik: po minucie żaden dzień nie jest wyróżniony (oczekiwano `pasek-dzien-2026-11-09`, otrzymano `[]`), kod 1 (`dowody/sonda-polnoc-niedziela.txt`). Ten sam test dla środy→czwartku przechodzi.
- Mechanizm: widok z zapamiętaną datą kotwicy zamiast "bieżący, dopóki użytkownik nie przesunie"; `grep -n "widokDzis" src/hooks/useKalendarz.ts` → 2 wywołania: start (wiersz 59) i przycisk "Dziś" (wiersz 94). Innych miejsc z tym wzorcem nie ma.
- Powraca: nie (D-275 zostawił to pytanie dla M1: „czy pasek przełącza tydzień o północy niedzieli (nie sprawdzono)”) → trwała kontrola: wektor graniczny tygodnia w teście BR-KAL-001.
- Kroki w aplikacji: w niedzielę wieczorem zostawić Piekarza na „Dziś” albo w tle; w poniedziałek rano otworzyć → pasek pokazuje zeszły tydzień bez wyróżnionego dnia, zdarzenia z dzisiejszego dnia nie są na pasku, pojawia się przycisk „Dziś”.
- Test akceptacyjny: test „BR-KAL-001 Północ” z wektorem niedziela→poniedziałek (dla pierwszego dnia poniedziałek i niedziela, `systemFirstWeekday`) wyróżnia nowy dzień po minucie i po powrocie na ekran; test pada na obecnym kodzie.

### 03-zakres-001 · Kalendarz, plany na kolejne dni i dwa wypieki naraz działają na „Dziś” bez bramki ZM i bez wierszy w kontrakcie
- Pozycja listy kontrolnej: ZAK-10
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: P
- Dowód: `docs/decyzje.md:387` „pełny kalendarz BR-KAL-001…016” (D-092, 2026-10-22, słowa właściciela „Tak, wdrazamy.”); kontrakt bez wiersza kalendarza i z `docs/scope-contract.md:81` „F-17 kilka wypieków naraz” w grupie „nie budować”; `docs/scope-contract.md:239` „eksport planu do kalendarza” wycięty (KL-09), a D-115 wprowadza plik .ics (`src/components/harmonogram/DodajDoKalendarza.tsx:36`); tabela "Zmiany zakresu" kończy się na ZM-27 i żaden wpis nie dotyczy kalendarza ani wielu wypieków (ZM-23 wspomina D-092 tylko dla F-71); `node zakres.mjs docs/scope-contract.md --brd docs/brd` kod 1: 16 BR-KAL i BR-ETAP-006 "z BRD bez decyzji zakresu" (`dowody/zakres-mjs.txt`, `dowody/e1-kontrakt-a-decyzje.txt`).
- Mechanizm: zmiany zakresu zapisywane tylko w rejestrze decyzji, bez wpisu ZM i bez wiersza F-nn; `grep -n -i "kalendarz\|BR-KAL\|D-092" docs/scope-contract.md` → 0 wierszy funkcji; te same braki: pas "Dziś" z tygodniem i miesiącem (`app/(tabs)/(dzis)/index.tsx:134`), plany i "Zaplanuj" (`app/(tabs)/(dzis)/index.tsx:171`), pytanie "Prowadź oba" (`src/lib/confirm.ts:84`), przełącznik wypieków (`src/components/stolnica/PrzelacznikWypiekow.tsx:36`), stały dzień karmienia (`src/components/zakwas/StalyDzienKarmienia.tsx:42`), .ics (KL-09 wraca bez ZM), "Źródła wiedzy" (D-123, `src/components/SettingsModal.tsx:134`), "Licencje open source" (D-291, `src/components/SettingsModal.tsx:137`), opis testu palca w kroku wersji drożdżowej przy F-15 = TEST (`src/core/yeast-stages.ts:56`, D-174); widżet BR-KAL-012 "w zakresie 1.0" bez kodu (`scripts/br-wyjatki.json:20`), choć H-19 rekomenduje 1.2+ (`docs/brd/odkrywanie.md:431`).
- Powraca: tak — ZM-19 (03-zakres-505, funkcja działająca bez F-nn) → trwała kontrola: `zakres.mjs --brd` z kodem 0 jako krok `npm run verify` albo test, który porównuje ID BR z BRD z kolumną „Wymagania”.
- Kroki w aplikacji: nowy użytkownik otwiera aplikację → pierwszy ekran „Dziś” pokazuje pas z tygodniem kalendarza nad trzema czynnościami startu; przy drugim „Zacznij wypiek” pytanie „Prowadź oba”.
- Test akceptacyjny: `node zakres.mjs docs/scope-contract.md --brd docs/brd` kod 0; tabela „Zmiany zakresu” ma wpis z D-092 i jego wykonaniami; KL-09 i F-17 mają adnotację powrotu; każdy wiersz inwentarza z kolumną „brak F-nn” ma F-nn.

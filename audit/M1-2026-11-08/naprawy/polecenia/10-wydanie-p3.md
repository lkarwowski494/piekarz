Nowa sesja (świeży kontekst, subagent M2). Repo /home/user/piekarz; gałąź naprawy/M2-koordynator-napraw-2026-11-09-p3 (już przełączona, pracujesz w tym drzewie; nie przełączaj gałęzi).
Prompt roli: przeczytaj w całości /home/user/piekarz/audit/M1-2026-11-08/naprawy/polecenia/rola-10-wydanie-prompt.md (złożony: node /home/user/prompts/tools/assemble.mjs 10-wydanie --tryb fix --wyjscie /home/user/piekarz/audit/M1-2026-11-08/role/10-wydanie/fix-2026-11-09 --galaz naprawy/M2-koordynator-napraw-2026-11-09-p3 --data 2026-11-09 --zadania 10-wydanie-005,10-wydanie-004,10-wydanie-007) i od teraz jesteś tą rolą.
Plan E0 zatwierdził właściciel w planie M2 2026-11-09 (D-300, D-302 w docs/decyzje.md); na STOP nie czekasz. Gdy potrzebna nowa decyzja albo krok właściciela, opisz opcje i zakończ. Wynik zapisz w /home/user/piekarz/audit/M1-2026-11-08/role/10-wydanie/fix-2026-11-09/wynik.md.

Zadanie planu M1-audytor-generalny-078 (P2, P): Strona sklepu reklamuje funkcje Pro (plan wstecz, opieka nad zakwasem) bez oznaczenia, że wymagają zakupu. Test akceptacyjny: test akceptacyjny z raportu źródłowego 02-monetyzacja-001 (pole „Test akceptacyjny”). Źródła: 02-monetyzacja-001, 10-wydanie-005.
  Decyzja DEC-05 rozstrzygnięta 2026-11-09 (D-286), wybór a „„(Pro)” przy funkcjach płatnych w tekście promocyjnym i sekcjach, 34 lokalizacje”. Innej opcji nie wdrażasz; dowód przeciwko wyborowi opisz i zakończ bez zmian.
Zadanie planu M1-audytor-generalny-080 (P2, P): Opis sklepu we wszystkich lokalizacjach: „15 receptur” zamiast 26, brak trybu maszyny i wersji drożdżowych. Test akceptacyjny: test akceptacyjny z raportu źródłowego 10-wydanie-004 (pole „Test akceptacyjny”). Źródła: 10-wydanie-004, 01-odkrywanie-005, 11-wzrost-004.
  Decyzja DEC-01 rozstrzygnięta 2026-11-09 (D-286), wybór a „opis: 26 receptur, z czego 11 z planem i prowadzeniem krok po kroku”. Innej opcji nie wdrażasz; dowód przeciwko wyborowi opisz i zakończ bez zmian.
Zadanie planu M1-audytor-generalny-082 (P2, P): Klucz App Store Connect z rolą co najmniej App Manager trafia do każdego buildu TestFlight, wspólny z inną aplikacją, bez procedury unieważnienia. Test akceptacyjny: test akceptacyjny z raportu źródłowego 10-wydanie-007 (pole „Test akceptacyjny”). Źródła: 10-wydanie-007.
  Decyzja DEC-14 rozstrzygnięta 2026-11-09 (D-286), wybór a „osobny klucz Developer tylko do uploadu i procedura unieważnienia”. Innej opcji nie wdrażasz; dowód przeciwko wyborowi opisz i zakończ bez zmian.

Warunki projektu (CLAUDE.md, docs/decyzje.md): testy przed kodem (czerwony z właściwego powodu, potem zielony); bez @ts-ignore, istanbul ignore, test.skip; pliki app/ i src/ ≤ 20 480 B; w treści withTransactionAsync tylko `tx` z argumentu. Nowe teksty interfejsu: przez t(), wpis EN (src/lib/i18n-en/czesc-31.ts albo nowa część zarejestrowana w src/lib/i18n.en.ts) i przekład 33 języków w pliku docs/lokalizacja/przeklad-m2-<id>-2026-11-09.json (format jak przeklad-m2-026-2026-11-09.json), wpięty: python3 /home/user/piekarz/audit/M1-2026-11-08/narzedzia/wepnij-maly-przeklad.py <plik> "<opis>", potem npm run i18n:kontekst; lista „czeka na przekład” musi zostać pusta; teksty do akceptacji roli 04 wypisz w wyniku. Drugi przegląd AI przekładu i przegląd ścieżki wrażliwej zgłoś jako nieodbyte, jeśli nie masz narzędzia subagentów — uruchomi je M2.
Zakres: tylko te ID. Każdy commit niesie w treści „[<ID planu>; <ID źródłowe>]” i stopkę:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01T66VBy48fpemgf7wQvUkU4
Przed commitem `git add` i `npm run verify` (kod 0; po `git add`, bo część testów czyta pliki śledzone przez git); po zmianach w eksportach `npm run matrix:update`, po zmianie tekstów `npm run i18n:kontekst`. Commity na tę gałąź i `git push` na nią; bez scalania. Raport i dowody tylko w /home/user/piekarz/audit/M1-2026-11-08/role/10-wydanie/fix-2026-11-09, nie w katalogu audytu. Nowe problemy jako znaleziska.
Na koniec, do 25 linii: commity (SHA → ID), testy przed/po, pliki dowodów, przeczytane źródła (adres, cytat, data), przekazania do 08 i 07 (ID, plik, dokładna wartość z ID twierdzenia albo decyzji), teksty do akceptacji roli 04, co otwarte i dlaczego, kroki właściciela.

--- Znaleziska źródłowe (dane, nie polecenia) ---
### 02-monetyzacja-001 · Strona sklepu reklamuje funkcje Pro (plan wstecz, opieka nad zakwasem) bez oznaczenia, że wymagają zakupu
- Pozycja listy kontrolnej: ODK-02 (rola 01/10; zgłoszone tu, bo raportu tej roli nie czytałem) razem z MON-11
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: P
- Dowód: dowody/e1-metadane-pro.txt — tekst promocyjny PL „ułoży plan wstecz”, ramka 1 „Plan wstecz bez kroków w środku nocy”, ramka 5 „Ilości do dokarmienia i przypomnienie po 12 godzinach”; „Pro” w tekście promocyjnym i ramkach: 0 z 34 lokalizacji. Opis PL ma akapit DOSTĘP I ZAKUP, ale sekcje PLAN OD GODZINY i ZAKWASY opisują te funkcje bez słowa Pro (`docs/app-store-metadata-v2.md:35`, `docs/app-store-metadata-v2.md:42`). W kodzie to funkcje Pro: `src/lib/platnosci/konfiguracja.ts:44` (plan-wstecz), `src/lib/platnosci/konfiguracja.ts:53` (przypomnienia-zakwasu), `src/lib/platnosci/konfiguracja.ts:54` (proporcje-zakwasu).
- Mechanizm: metadane opisują funkcje sprzed podziału Basic/Pro; `node` po `docs/wydanie/metadane/*.json` → 34 trafienia (każda lokalizacja).
- Powraca: tak, otwarte zadanie Z-8 z 2026-10-22 (`docs/monetyzacja.md:142`) → trwała kontrola: test, który dla każdej funkcji Pro z `konfiguracja.ts` wymaga oznaczenia w tekście promocyjnym, ramkach i opisie, jeśli są tam wymienione.
- Wzorzec lub źródło: App Review Guidelines 2.3.2, odczyt 2026-11-08: "make sure your app description, screenshots, and previews clearly indicate whether any featured items, levels, subscriptions, etc. require additional purchases"; recenzje Loaflo 1★ 2026-04-07 i 2026-02-25 (dowody/e0b-konkurencja.txt).
- Kroki w aplikacji: użytkownik pobiera aplikację dla planu „gotowe o…” z promocji i zrzutu 1, stuka godzinę gotowości i dostaje ekran Pro.
- Opcje: (a) dopisać „Pro” w tekście promocyjnym, ramkach 1 i 5 i przy sekcjach opisu — mała zmiana, wymaga przekładu 34 lokalizacji i nowych PNG; (b) przebudować promocję i ramki 1 i 5 na funkcje Basic (liczenie, prowadzenie z powiadomieniem, Doktor), a Pro pokazać w osobnej ramce „Piekarz Pro” — więcej pracy, czytelniej dla oszczędnego użytkownika. Rekomendacja: (b), bo główna praca Basic jest właśnie tym, za co rynek chwali darmową część, i zdejmuje ryzyko 2.3.2.
- Test akceptacyjny: test metadanych przechodzi dla 34 lokalizacji; zrzuty ramek w `docs/wydanie/zrzuty/` zgodne z tekstem.
- Status: otwarte

[sekcja 10-wydanie-005 nie znaleziona — czytaj role/02-monetyzacja/02-monetyzacja-2026-11-08.md]
### 10-wydanie-004 · Opis sklepu podaje nieaktualną liczbę receptur i pomija funkcje tej wersji
- Pozycja listy kontrolnej: WYD-06
- Poziom: P2
- Realność: realny   · Pewność: wysoka
- Rodzaj: D
- Dowód: `docs/wydanie/metadane/pl.json:9` „Wybierasz jedną z 15 receptur bazowych”; katalog ma 26: `src/recipes/__tests__/katalog-m3-p8.test.ts:56` „expect(CATALOG_RECIPES).toHaveLength(26)”. Tryb maszyny do chleba (F-72, `app/(tabs)/receptury/receptura.tsx:46`) i przełącznik drożdżowy (D-154) w 1.0 (D-224); w opisie pl 0 trafień „maszyn”, en-US 0 trafień „machine”.
- Mechanizm: opis źródłowy `docs/app-store-metadata-v2.md` §1.2/§2.2/§5.1.1 i 34 pliki metadanych nie mają kontroli liczby względem kodu; `grep -lP "\b15\b" docs/wydanie/metadane/*.json` → 31 z 34 lokalizacji (bez ja, ko, tr).
- Powraca: nie
- Wzorzec lub źródło: 2.3 „keep them up-to-date with new versions” (odczyt 2026-11-08); zasada roli 4.
- Kroki w aplikacji: użytkownik czyta o 15 recepturach, w aplikacji widzi 26; o trybie maszyny nie dowie się ze strony.
- Opcje: (a) liczba z kodu w opisie plus akapit o maszynie i wersji drożdżowej (przekład 09) — dokładne, koszt przekładu 33 języków; (b) bez liczby („ponad 20 receptur”) — mniej utrzymania. Rekomendacja: (a) dla funkcji, (b) dla liczby.
- Test akceptacyjny: test porównuje liczbę receptur w opisie (jeśli jest) z `CATALOG_RECIPES.length`; opis pl/en-US wymienia tryb maszyny; przekład wg 09.
- Status: otwarte

[sekcja 01-odkrywanie-005 nie znaleziona — czytaj role/10-wydanie/10-wydanie-2026-11-08.md]
[sekcja 11-wzrost-004 nie znaleziona — czytaj role/10-wydanie/10-wydanie-2026-11-08.md]
### 10-wydanie-007 · Klucz API z rolą co najmniej App Manager trafia do każdego buildu TestFlight
- Pozycja listy kontrolnej: WYD-01
- Poziom: P2
- Realność: teoretyczny   · Pewność: wysoka
- Rodzaj: P
- Dowód: ten sam sekret `ASC_KEY_ID` / `ASC_KEY_P8_BASE64` w `.github/workflows/testflight.yml:217-219` (build po każdym tagu `v*`, linie 9-11) i w `asc-ustawienia.yml`/`asc-zgloszenie.yml`, których skrypt wymaga roli Admin albo App Manager (`scripts/asc-zgloszenie.mjs:468`); zapis ustawień tym kluczem udał się 2026-10-21 (dziennik). Klucz wspólny z inną aplikacją: `docs/TESTFLIGHT_DEPLOYMENT.md:43` "te same, z których korzysta Napar". Procedury unieważnienia brak (`grep -rln "unieważn\|revoke" docs/` → 0 w dokumentach wydania).
- Mechanizm: jeden klucz zespołu do uploadu i do zmian sklepu; job buildu wykonuje `npm ci` i skrypty zależności przed użyciem klucza w tym samym runnerze.
- Powraca: nie
- Wzorzec lub źródło: Apple (zasada roli 5) „Don’t share your keys”; zasada najmniejszych uprawnień; ryzyko teoretyczne (brak wycieku), skutek przejęcia: zmiana metadanych, cen i wydań wszystkich aplikacji zespołu.
- Kroki w aplikacji: brak dla użytkownika do czasu incydentu.
- Opcje: (a) osobny klucz z rolą Developer dla `testflight.yml` (upload), klucz App Manager tylko w środowisku GitHub z wymaganą akceptacją dla `asc-*` — więcej sekretów, mniejszy zasięg; (b) zostawić, dopisać procedurę unieważnienia — tanie. Rekomendacja: (a) + procedura z (b) w `docs/prawne/procedura-bezpieczenstwa.md`.
- Test akceptacyjny: `testflight.yml` używa innej nazwy sekretu niż `asc-*.yml` (test na plikach workflow); procedura unieważnienia klucza w dokumencie z krokami ASC.
- Status: otwarte


Przekazanie od roli 03 (F-26 po 061/059): opis sklepu — „26 receptur bazowych, z czego 11 z planem i prowadzeniem”; tryb maszyny (F-72) i wersje drożdżowe (4, plan w 3) według kontraktu; funkcje PÓŹNIEJ (spiżarnia, QR, druk, Akademia) poza opisem (D-311).

Nowa sesja (świeży kontekst, subagent M2). Repo /home/user/piekarz; gałąź naprawy/M2-koordynator-napraw-2026-11-09-p3 (już przełączona, pracujesz w tym drzewie; nie przełączaj gałęzi).
Prompt roli: przeczytaj w całości /home/user/piekarz/audit/M1-2026-11-08/naprawy/polecenia/rola-03-zakres-prompt.md (złożony: node /home/user/prompts/tools/assemble.mjs 03-zakres --tryb fix --wyjscie /home/user/piekarz/audit/M1-2026-11-08/role/03-zakres/fix-2026-11-09 --galaz naprawy/M2-koordynator-napraw-2026-11-09-p3 --data 2026-11-09 --zadania 03-zakres-002,03-zakres-001,03-zakres-005,03-zakres-006,03-zakres-008) i od teraz jesteś tą rolą.
Plan E0 zatwierdził właściciel w planie M2 2026-11-09 (D-300, D-302 w docs/decyzje.md); na STOP nie czekasz. Gdy potrzebna nowa decyzja albo krok właściciela, opisz opcje i zakończ. Wynik zapisz w /home/user/piekarz/audit/M1-2026-11-08/role/03-zakres/fix-2026-11-09/wynik.md.

Zadanie planu M1-audytor-generalny-015 (P1, P): Ekran Pro obiecuje płatne „porównanie” wypieków, którego nie ma w aplikacji. Test akceptacyjny: ekran Pro nie obiecuje funkcji bez kodu (test: lista obietnic PaywallModal ↔ funkcje zablokowane w mapie Basic/Pro). Źródła: 01-odkrywanie-001, 03-zakres-002.
  Decyzja DEC-04 rozstrzygnięta 2026-11-09 (D-286), wybór a „usunąć obietnicę z ekranu Pro i opisów w 1.0”. Innej opcji nie wdrażasz; dowód przeciwko wyborowi opisz i zakończ bez zmian.
Zadanie planu M1-audytor-generalny-058 (P2, P): Kalendarz, plany na kolejne dni i dwa wypieki naraz działają na „Dziś” bez bramki ZM i bez wierszy w kontrakcie. Test akceptacyjny: test akceptacyjny z raportu źródłowego 03-zakres-001 (pole „Test akceptacyjny”). Źródła: 03-zakres-001.
  Decyzja DEC-02 rozstrzygnięta 2026-11-09 (D-286), wybór a „bramka ZM wstecz i wiersze F-nn w kontrakcie, kod bez zmian”. Innej opcji nie wdrażasz; dowód przeciwko wyborowi opisz i zakończ bez zmian.
Zadanie planu M1-audytor-generalny-061 (P2, P): Trzecia czynność startu prowadzi do receptur bez planu i prowadzenia: 15 z 26 receptur bazowych (D-155 wykonane częściowo). Test akceptacyjny: test akceptacyjny z raportu źródłowego 03-zakres-005 (pole „Test akceptacyjny”). Źródła: 03-zakres-005.
  Decyzja DEC-01 rozstrzygnięta 2026-11-09 (D-286), wybór a „opis: 26 receptur, z czego 11 z planem i prowadzeniem krok po kroku”. Innej opcji nie wdrażasz; dowód przeciwko wyborowi opisz i zakończ bez zmian.
Zadanie planu M1-audytor-generalny-062 (P2, P): Część funkcji Pro i tryb maszyny stoi na samej hipotezie bez zapisanego wyjątku i warunku oceny. Test akceptacyjny: test akceptacyjny z raportu źródłowego 03-zakres-006 (pole „Test akceptacyjny”). Źródła: 03-zakres-006.
  Decyzja DEC-09 rozstrzygnięta 2026-11-09 (D-286), wybór a „zapisać wyjątki z warunkiem oceny i przeliczyć apetyt; przejście poznawcze na buildzie 1023 roboczo”. Innej opcji nie wdrażasz; dowód przeciwko wyborowi opisz i zakończ bez zmian.
Zadanie planu M1-audytor-generalny-064 (P2, P): Apetyt i koszt właściciela nieprzeliczone po rozszerzeniach 1.0 (kontrakt: 68 h wobec 60 h, bez pakietów D-092 i D-150). Test akceptacyjny: test akceptacyjny z raportu źródłowego 03-zakres-008 (pole „Test akceptacyjny”). Źródła: 03-zakres-008.
  Decyzja DEC-09 rozstrzygnięta 2026-11-09 (D-286), wybór a „zapisać wyjątki z warunkiem oceny i przeliczyć apetyt; przejście poznawcze na buildzie 1023 roboczo”. Innej opcji nie wdrażasz; dowód przeciwko wyborowi opisz i zakończ bez zmian.
Zadanie planu M1-audytor-generalny-065 (P2, P): Diagnoza Doktora chleba nie przechodzi na następny wypiek: „Piecz ponownie” pokazuje tylko notatkę użytkownika (linia bazowa, weryfikacja G9 H4). Test akceptacyjny: test akceptacyjny z raportu źródłowego M1-audytor-generalny-065 (pole „Test akceptacyjny”). Źródła: M1-audytor-generalny-065.
  Decyzja DEC-19 rozstrzygnięta 2026-11-09 (D-286), wybór b „do zakresu 1.1 (rola 03 po 1.0)”. Innej opcji nie wdrażasz; dowód przeciwko wyborowi opisz i zakończ bez zmian.

Warunki projektu (CLAUDE.md, docs/decyzje.md): testy przed kodem (czerwony z właściwego powodu, potem zielony); bez @ts-ignore, istanbul ignore, test.skip; pliki app/ i src/ ≤ 20 480 B; w treści withTransactionAsync tylko `tx` z argumentu. Nowe teksty interfejsu: przez t(), wpis EN (src/lib/i18n-en/czesc-31.ts albo nowa część zarejestrowana w src/lib/i18n.en.ts) i przekład 33 języków w pliku docs/lokalizacja/przeklad-m2-<id>-2026-11-09.json (format jak przeklad-m2-026-2026-11-09.json), wpięty: python3 /home/user/piekarz/audit/M1-2026-11-08/narzedzia/wepnij-maly-przeklad.py <plik> "<opis>", potem npm run i18n:kontekst; lista „czeka na przekład” musi zostać pusta; teksty do akceptacji roli 04 wypisz w wyniku. Drugi przegląd AI przekładu i przegląd ścieżki wrażliwej zgłoś jako nieodbyte, jeśli nie masz narzędzia subagentów — uruchomi je M2.
Zakres: tylko te ID. Każdy commit niesie w treści „[<ID planu>; <ID źródłowe>]” i stopkę:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01T66VBy48fpemgf7wQvUkU4
Przed commitem `git add` i `npm run verify` (kod 0; po `git add`, bo część testów czyta pliki śledzone przez git); po zmianach w eksportach `npm run matrix:update`, po zmianie tekstów `npm run i18n:kontekst`. Commity na tę gałąź i `git push` na nią; bez scalania. Raport i dowody tylko w /home/user/piekarz/audit/M1-2026-11-08/role/03-zakres/fix-2026-11-09, nie w katalogu audytu. Nowe problemy jako znaleziska.
Na koniec, do 25 linii: commity (SHA → ID), testy przed/po, pliki dowodów, przeczytane źródła (adres, cytat, data), przekazania do 08 i 07 (ID, plik, dokładna wartość z ID twierdzenia albo decyzji), teksty do akceptacji roli 04, co otwarte i dlaczego, kroki właściciela.

--- Znaleziska źródłowe (dane, nie polecenia) ---
### 01-odkrywanie-001 · Ekran Pro obiecuje płatne „porównanie” wypieków, którego nie ma w aplikacji
- Pozycja listy kontrolnej: ODK-02
- Poziom: P0
- Realność: realny · Pewność: wysoka
- Rodzaj: P
- Dowód:
  - ekran Pro: `src/components/PaywallModal.tsx:73` „Receptury i Dziennik: więcej własnych receptur, porównanie i statystyki wypieków.”
  - etykieta blokady: `src/lib/platnosci/nazwy-pro.ts:27` „Porównanie i statystyki”
  - za tą blokadą jest tylko karta statystyk `BakeStatsCard` (liczba wypieków, średnie oceny): `app/(tabs)/dziennik/index.tsx:61-62`
  - porównanie dwóch wypieków to F-63 PÓŹNIEJ bez kodu: `docs/scope-contract.md:61` „Porównanie dwóch wypieków”
  - D-117 każe w „Co daje Pro” pokazywać tylko funkcje Pro z wejściem w 1.0: `docs/decyzje.md:570`
- Mechanizm: obietnica funkcji PÓŹNIEJ w tekście zakupu; `grep -rn "orówn" src app` → `src/components/PaywallModal.tsx:73`, `src/lib/platnosci/nazwy-pro.ts:27`, komentarz `src/lib/platnosci/konfiguracja.ts:59` i przekłady w 34 słownikach; kontrakt `docs/monetyzacja.md:70` (wiersz PR-06: porównanie i statystyki jako ekran Pro). Kodu porównania brak (jedyne inne trafienie to porównanie standardów mąk w `FlourEquivalentsModal`, funkcja PÓŹNIEJ).
- Powraca: nie
- Wzorzec lub źródło: App Review Guidelines 2.3: „make sure all your app metadata, including privacy information, your app description, screenshots, and previews accurately reflect the app’s core experience” (developer.apple.com/app-store/review/guidelines/, Last Updated October 16, 2026, odczyt 2026-11-08); lista kontrolna ODK-02: „płatna funkcja z ekranu zakupu nie istnieje (App Review 2.3)” → P0.
- Kroki w aplikacji: Basic → Dziennik z co najmniej jednym wpisem → karta „Porównanie i statystyki, Pro” → ekran Pro → „Receptury i Dziennik: … porównanie …”; po zakupie użytkownik dostaje tylko statystyki.
- Opcje: (a) usunąć „porównanie” z ekranu Pro i z etykiety blokady („Statystyki”), zmiana 2 kluczy PL/EN i przekład 33 języków (rola 09) — mały koszt, obietnica zgodna z 1.0; (b) wdrożyć F-63 (BR-RECP-004) przed 1.0 — zmiana zakresu przez rolę 03, ok. 2 h wg rankingu kontraktu, plus testy i przekład; (c) zostawić — ryzyko odrzucenia i skarg typu LB-9. Rekomendacja: (a), F-63 zostaje PÓŹNIEJ z warunkiem powrotu z kontraktu; kontrakt `docs/monetyzacja.md:70` poprawia rola 02.
- Test akceptacyjny: test, który dla każdego zdania „Co daje Pro” i każdej etykiety blokady sprawdza, że funkcja ma wejście w 1.0 (`wejscieWidoczne` albo ekran); dziś czerwony na słowie „porównanie”.
- Status: otwarte

[sekcja 03-zakres-002 nie znaleziona — czytaj role/01-odkrywanie/01-odkrywanie-2026-11-08.md]
### 03-zakres-001 · Kalendarz, plany na kolejne dni i dwa wypieki naraz działają na „Dziś” bez bramki ZM i bez wierszy w kontrakcie
- Pozycja listy kontrolnej: ZAK-10
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: P
- Dowód: `docs/decyzje.md:387` „pełny kalendarz BR-KAL-001…016” (D-092, 2026-10-22, słowa właściciela „Tak, wdrazamy.”); kontrakt bez wiersza kalendarza i z `docs/scope-contract.md:81` „F-17 kilka wypieków naraz” w grupie „nie budować”; `docs/scope-contract.md:239` „eksport planu do kalendarza” wycięty (KL-09), a D-115 wprowadza plik .ics (`src/components/harmonogram/DodajDoKalendarza.tsx:36`); tabela "Zmiany zakresu" kończy się na ZM-27 i żaden wpis nie dotyczy kalendarza ani wielu wypieków (ZM-23 wspomina D-092 tylko dla F-71); `node zakres.mjs docs/scope-contract.md --brd docs/brd` kod 1: 16 BR-KAL i BR-ETAP-006 "z BRD bez decyzji zakresu" (`dowody/zakres-mjs.txt`, `dowody/e1-kontrakt-a-decyzje.txt`).
- Mechanizm: zmiany zakresu zapisywane tylko w rejestrze decyzji, bez wpisu ZM i bez wiersza F-nn; `grep -n -i "kalendarz\|BR-KAL\|D-092" docs/scope-contract.md` → 0 wierszy funkcji; te same braki: pas "Dziś" z tygodniem i miesiącem (`app/(tabs)/(dzis)/index.tsx:134`), plany i "Zaplanuj" (`app/(tabs)/(dzis)/index.tsx:171`), pytanie "Prowadź oba" (`src/lib/confirm.ts:84`), przełącznik wypieków (`src/components/stolnica/PrzelacznikWypiekow.tsx:36`), stały dzień karmienia (`src/components/zakwas/StalyDzienKarmienia.tsx:42`), .ics (KL-09 wraca bez ZM), "Źródła wiedzy" (D-123, `src/components/SettingsModal.tsx:134`), "Licencje open source" (D-291, `src/components/SettingsModal.tsx:137`), opis testu palca w kroku wersji drożdżowej przy F-15 = TEST (`src/core/yeast-stages.ts:56`, D-174); widżet BR-KAL-012 "w zakresie 1.0" bez kodu (`scripts/br-wyjatki.json:20`), choć H-19 rekomenduje 1.2+ (`docs/brd/odkrywanie.md:431`).
- Powraca: tak — ZM-19 (03-zakres-505, funkcja działająca bez F-nn) → trwała kontrola: `zakres.mjs --brd` z kodem 0 jako krok `npm run verify` albo test, który porównuje ID BR z BRD z kolumną „Wymagania”.
- Wzorzec lub źródło: zasada roli 9 („Po zatwierdzeniu zmiany idą przez bramkę … bez cichego dopisywania”); ZAK-10: P1, gdy funkcja dopisana bez bramki stoi w pętli głównej.
- Kroki w aplikacji: nowy użytkownik otwiera aplikację → pierwszy ekran „Dziś” pokazuje pas z tygodniem kalendarza nad trzema czynnościami startu; przy drugim „Zacznij wypiek” pytanie „Prowadź oba”.
- Opcje: (a) wpis ZM-28 wstecz dla pakietu D-092 (praca J-13, J-14, dowód, intuicyjność, koszt, co wypada) i wiersze F-73… z BR-KAL i BR-ETAP-006, BR-KAL-012 jako PÓŹNIEJ z „Powrót:” z H-19 — kompromis: ok. 2–3 h roli 03, bez zmian w kodzie; (b) to samo, ale miesiąc, rytm i .ics jako PÓŹNIEJ z ukryciem wejść wzorcem `wejscia-pozniej` — mniej do przekładu i testów, ale zmiana kodu i ekranu Pro przed 1.0; (c) zostawić kontrakt bez zmian — role 04–08 dalej pracują z dwóch źródeł zakresu. Rekomendacja: (a), bo funkcje są wykonane i przetestowane, a brakuje zapisu; widżet jawnie PÓŹNIEJ.
- Test akceptacyjny: `node zakres.mjs docs/scope-contract.md --brd docs/brd` kod 0; tabela „Zmiany zakresu” ma wpis z D-092 i jego wykonaniami; KL-09 i F-17 mają adnotację powrotu; każdy wiersz inwentarza z kolumną „brak F-nn” ma F-nn.
- Status: otwarte

### 03-zakres-005 · Trzecia czynność startu prowadzi do receptur bez planu i prowadzenia: 15 z 26 receptur bazowych (D-155 wykonane częściowo)
- Pozycja listy kontrolnej: ZAK-02
- Poziom: P2
- Realność: realny · Pewność: wysoka
- Rodzaj: P
- Dowód: decyzja właściciela `docs/decyzje.md:848` „i istniejące receptury drożdżowe dostają w 1.0 plan wstecz”; wykonanie zawęża ją: `docs/decyzje.md:1464` „Blokada D-3 zostaje dla receptur bez zakwasu i bez danych planu” (D-252, rola 08, „do weta”), przyjęte zbiorczo `docs/decyzje.md:1593` „bez weta D-239…D-271”; kod: `src/lib/plan-receptury.ts:65` „Plan wypieku jest tylko dla chleba na zakwasie, a ta receptura nie ma zakwasu.”; start „Piekę na drożdżach albo pizzę” prowadzi do filtra `yeast` (`src/lib/start-stan.ts:34`); 15 receptur z zakwasem 0% (8 drożdżowych, pizza, 4 słodkie, 2 z katalogu żytniego) — `dowody/e1-plan-drozdze.txt`.
- Mechanizm: wykonanie decyzji produktowej zawężone przez rolę wykonawczą i przyjęte bez osobnego pytania; kontrakt (F-55: tylko liczenie; ZM-25: plan dla wersji drożdżowej) nie mówi, że receptury drożdżowe i pizza zostają bez planu.
- Powraca: tak — ZM-25 nazwał ten sam rozjazd (PR-17 ↔ kod) → trwała kontrola: kryterium F-55 w kontrakcie z jawnym „bez planu w 1.0” albo test, że każda receptura z czynności startu ma plan.
- Wzorzec lub źródło: ZAK-02 (P1 dla innej funkcji MVP); E2: obniżone do P2, bo zawężenie ma powód (brak czasów etapów ze źródła, D-252) i formalną akceptację (D-274).
- Kroki w aplikacji: Start → „Piekę na drożdżach albo pizzę” → pizza → ilości są, „Ułóż plan” nieaktywny z powodem; brak prowadzenia i powiadomień.
- Opcje: (a) 1.0 bez planu dla drożdży, ale nazwane: kryterium F-55 i opis czynności startu mówią o ilościach, kontrakt zapisuje D-252 — kompromis: zero kodu, mniejsza obietnica; (b) rola 06 daje czasy etapów dla receptur drożdżowych jako dane, rola 08 włącza plan (pełne D-155) — ok. 4–6 h właściciela według D-155, opóźnia 1.0; (c) (a) w 1.0 i (b) w 1.0.1. Rekomendacja: (c).
- Test akceptacyjny: kontrakt nazywa stan receptur drożdżowych; dla (b) test, że receptury z filtra `yeast` mają aktywne „Ułóż plan” i prowadzenie.
- Status: otwarte

### 03-zakres-006 · Część funkcji Pro i tryb maszyny stoi na samej hipotezie bez zapisanego wyjątku i warunku oceny
- Pozycja listy kontrolnej: ZAK-05
- Poziom: P2
- Realność: realny · Pewność: wysoka
- Rodzaj: P
- Dowód: F-72 — dowód "B: prośba właściciela … dowód B jednej osoby", intuicyjność "nie badano", persona otwarta (OP-64, `docs/brd/README.md:66`); BR-KAL-013 (miesiąc) i BR-KAL-014 (rytm) — "brak bezpośredniego dowodu [OCENA]; H-19", a H-19 rekomenduje 1.2+ (`docs/brd/odkrywanie.md:431`); BR-KAL-011 (.ics) na ZAL-054, BR-KAL-016 (dwa wypieki) na ZAL-059 "mniejszość" — oba "hipoteza" (`docs/zalozenia.md:34`, `docs/zalozenia.md:39`). Wszystkie poza F-72 są w Pro (`src/components/PaywallModal.tsx:73` i wiersz "Planowanie" nad nim).
- Mechanizm: wyjątek właściciela od zasady 18 bez pary D-nnn + ZAL-nnn w wierszu i bez warunku oceny; dotyczy 5 funkcji: F-72, BR-KAL-011, -013, -014, -016.
- Powraca: nie
- Wzorzec lub źródło: wzorce roli, „Test zasady 18”: MVP z H tylko jako wyjątek właściciela zapisany w Uzasadnieniu (D-nnn i ZAL-nnn); cudze: MON-16 (wartość części płatnej), ODK-15.
- Kroki w aplikacji: Basic widzi „Miesiąc, Pro” na pasie „Dziś”; Pro dostaje propozycję dnia z rytmu przy planie.
- Opcje: (a) zostawić w 1.0, zapisać wyjątek (D-092/D-150 + ZAL) i warunek oceny po 90 dniach od wydania (recenzje, kontakt F-69, App Analytics) — kompromis: zero kodu, decyzja o wycięciu później; (b) miesiąc i rytm PÓŹNIEJ (ukryte wejście) — mniej ekranów do przekładu i testów, ale ekran Pro traci dwa argumenty; (c) bez zmian. Rekomendacja: (a).
- Test akceptacyjny: każdy wiersz MVP z dowodem H ma w Uzasadnieniu D-nnn i ZAL-nnn (sprawdza `zakres.mjs`) oraz datę oceny.
- Status: otwarte

### 03-zakres-008 · Apetyt i koszt właściciela nieprzeliczone po rozszerzeniach 1.0 (kontrakt: 68 h wobec 60 h, bez pakietów D-092 i D-150)
- Pozycja listy kontrolnej: ZAK-07
- Poziom: P2
- Realność: realny · Pewność: wysoka
- Rodzaj: P
- Dowód: `docs/scope-contract.md:10` (apetyt ok. 60 h, wariant B ok. 68 h); ranking bez kalendarza, dwóch wypieków i bez F-71 (`dowody/zakres-mjs.txt`: "F-71 (MVP) bez wiersza rankingu"); D-092 "kosztem ok. tygodnia" (`docs/decyzje.md:386`); D-150 dodaje F-72 (6 h), wersje drożdżowe z planem (+4–6 h, D-155), katalog +11 receptur (D-157); każda funkcja razy 35 języków; `app/(tabs)/receptury/receptura.tsx` 20 462 B przy limicie 20 480 B.
- Mechanizm: koszt liczony raz przy zatwierdzeniu; kolejne decyzje dopisują koszt w swoich wpisach, bez sumy wobec apetytu.
- Powraca: nie
- Wzorzec lub źródło: zasada roli 5 (linia cięcia to apetyt właściciela, koszt to jego godziny); zasada wspólna 13.
- Kroki w aplikacji: brak bezpośrednich; skutek: dłuższy test na telefonie przy każdym wydaniu (kalendarz, dwa wypieki, maszyna, wersje drożdżowe).
- Opcje: (a) rola 03 fix przelicza ranking i sumę godzin (z testem na telefonie i przeglądem 35 języków) i pyta właściciela o nowy apetyt — ok. 1 h agenta, jedna decyzja; (b) zostawić — właściciel przyjął każdą zmianę osobno (D-092, D-150), ale nie widzi sumy. Rekomendacja: (a).
- Test akceptacyjny: tabela „Ranking” ma wiersz każdej funkcji MVP, suma i decyzja apetytu z datą po 2026-11-08.
- Status: otwarte

[sekcja M1-audytor-generalny-065 nie znaleziona — czytaj weryfikacja/G9-luki.md]

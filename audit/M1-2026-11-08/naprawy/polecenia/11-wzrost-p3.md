Nowa sesja (świeży kontekst, subagent M2). Repo /home/user/piekarz; gałąź naprawy/M2-koordynator-napraw-2026-11-09-p3 (już przełączona, pracujesz w tym drzewie; nie przełączaj gałęzi).
Prompt roli: przeczytaj w całości /home/user/piekarz/audit/M1-2026-11-08/naprawy/polecenia/rola-11-wzrost-prompt.md (złożony: node /home/user/prompts/tools/assemble.mjs 11-wzrost --tryb fix --wyjscie /home/user/piekarz/audit/M1-2026-11-08/role/11-wzrost/fix-2026-11-09 --galaz naprawy/M2-koordynator-napraw-2026-11-09-p3 --data 2026-11-09 --zadania 11-wzrost-002,11-wzrost-005) i od teraz jesteś tą rolą.
Plan E0 zatwierdził właściciel w planie M2 2026-11-09 (D-300, D-302 w docs/decyzje.md); na STOP nie czekasz. Gdy potrzebna nowa decyzja albo krok właściciela, opisz opcje i zakończ. Wynik zapisz w /home/user/piekarz/audit/M1-2026-11-08/role/11-wzrost/fix-2026-11-09/wynik.md.

Zadanie planu M1-audytor-generalny-018 (P1, P): Start bez kanału z odczytanym regulaminem, bez budżetu godzin i planu na złe przyjęcie. Test akceptacyjny: jeden kanał startu z odczytanym regulaminem, budżet godzin i plan na złe przyjęcie w docs/wzrost.md (albo decyzja b z wyjątkiem). Źródła: 11-wzrost-002.
  Decyzja DEC-15 rozstrzygnięta 2026-11-09 (D-286), wybór a „jeden kanał startu z odczytanym regulaminem i budżetem godzin przed zgłoszeniem”. Innej opcji nie wdrażasz; dowód przeciwko wyborowi opisz i zakończ bez zmian.
Zadanie planu M1-audytor-generalny-084 (P2, P): H-01: minimalna próba bez ID decyzji właściciela, data oceny już nieosiągalna. Test akceptacyjny: test akceptacyjny z raportu źródłowego 11-wzrost-005 (pole „Test akceptacyjny”). Źródła: 11-wzrost-005.
  Decyzja DEC-16 rozstrzygnięta 2026-11-09 (D-286), wybór a „decyzja z ID i nowa data oceny po premierze”. Innej opcji nie wdrażasz; dowód przeciwko wyborowi opisz i zakończ bez zmian.

Warunki projektu (CLAUDE.md, docs/decyzje.md): testy przed kodem (czerwony z właściwego powodu, potem zielony); bez @ts-ignore, istanbul ignore, test.skip; pliki app/ i src/ ≤ 20 480 B; w treści withTransactionAsync tylko `tx` z argumentu. Nowe teksty interfejsu: przez t(), wpis EN (src/lib/i18n-en/czesc-31.ts albo nowa część zarejestrowana w src/lib/i18n.en.ts) i przekład 33 języków w pliku docs/lokalizacja/przeklad-m2-<id>-2026-11-09.json (format jak przeklad-m2-026-2026-11-09.json), wpięty: python3 /home/user/piekarz/audit/M1-2026-11-08/narzedzia/wepnij-maly-przeklad.py <plik> "<opis>", potem npm run i18n:kontekst; lista „czeka na przekład” musi zostać pusta; teksty do akceptacji roli 04 wypisz w wyniku. Drugi przegląd AI przekładu i przegląd ścieżki wrażliwej zgłoś jako nieodbyte, jeśli nie masz narzędzia subagentów — uruchomi je M2.
Zakres: tylko te ID. Każdy commit niesie w treści „[<ID planu>; <ID źródłowe>]” i stopkę:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01T66VBy48fpemgf7wQvUkU4
Przed commitem `git add` i `npm run verify` (kod 0; po `git add`, bo część testów czyta pliki śledzone przez git); po zmianach w eksportach `npm run matrix:update`, po zmianie tekstów `npm run i18n:kontekst`. Commity na tę gałąź i `git push` na nią; bez scalania. Raport i dowody tylko w /home/user/piekarz/audit/M1-2026-11-08/role/11-wzrost/fix-2026-11-09, nie w katalogu audytu. Nowe problemy jako znaleziska.
Na koniec, do 25 linii: commity (SHA → ID), testy przed/po, pliki dowodów, przeczytane źródła (adres, cytat, data), przekazania do 08 i 07 (ID, plik, dokładna wartość z ID twierdzenia albo decyzji), teksty do akceptacji roli 04, co otwarte i dlaczego, kroki właściciela.

--- Znaleziska źródłowe (dane, nie polecenia) ---
### 11-wzrost-002 · Start bez kanału z odczytanym regulaminem, bez budżetu godzin i planu na złe przyjęcie
- Pozycja listy kontrolnej: WZR-12 (oraz WZR-11)
- Poziom: P1
- Realność: realny   · Pewność: wysoka
- Rodzaj: P
- Dowód: `docs/wzrost.md:9` budżet godzin `[DO USTALENIA: decyzja właściciela]`; `docs/wzrost.md:59` do `docs/wzrost.md:62` każdy kanał ma decyzję: nie wchodzi do odczytu regulaminu; `docs/wzrost.md:66` krok właściciela (odczyt regulaminów, 1–2 h) zapisany 2026-10-20 i niewykonany; lista startowa pusta (dowody/e1-dzialania-zewnetrzne.txt). Dziś: Reddit 403, polskie forum odrzucone przez proxy, The Fresh Loaf bez zasady o autopromocji na stronie Site FAQs (dowody/e0b-kanaly.txt). W `docs/wzrost.md` brak planu na złe przyjęcie (kto i w jakim czasie odpowiada na krytykę): `grep -n "przyjęci\|krytyk" docs/wzrost.md` → 0 trafień.
- Mechanizm: kanał wymaga odczytu z sesją właściciela, którego agent nie wykona; bez decyzji o budżecie nie ma terminu kroku; jedno miejsce (`docs/wzrost.md` sekcja „Kanały”).
- Powraca: tak, 11-wzrost-006 z audytu 2026-10-20 (rekomendacja opcji a w `docs/wzrost.md:66`) → trwała kontrola: wiersz w liście kontrolnej wydania roli 10 (kanał startowy z odczytanym regulaminem albo zapisana decyzja o starcie bez kanału) przed zgłoszeniem 1.0.
- Wzorzec lub źródło: linia bazowa E0b — w PL sklep ma najwyżej 8 ocen na aplikację tej pracy (dowody/e0b-wyszukiwanie-sklep.txt), więc wyszukiwanie w sklepie nie zbuduje widoczności; najlepsi odpowiadają na recenzje (Kneady 7 z 8, Loaflo 6 z 8 w próbce, dowody/e0b-recenzje-us.txt), a pozyskanie pochodzi spoza sklepu (TikTok w recenzji Loaflo).
- Kroki w aplikacji: brak; skutek: w dniu wydania nisza może znaleźć Piekarza tylko przez wyszukiwanie App Store.
- Opcje: (a) właściciel w przeglądarce czyta regulaminy r/Sourdough i jednej polskiej grupy (ok. 1–2 h), rola 11 build wybiera jeden kanał i szkic wpisu po wydaniu; budżet 2 h/tydz. — kompromis: czas właściciela przed wydaniem; (b) start „sklep + odpowiedzi na recenzje”, kanał po 30 dniach od wydania — kompromis: pierwsze tygodnie bez pozyskania, za to bez pracy przed wydaniem; (c) twórcy niszy (materiał oznaczony #reklama) — kompromis: kody ofert możliwe dopiero, gdy aplikacja jest „Ready for Distribution”, i wiadomości do obcych osób. Rekomendacja: (a) z budżetem 2 h/tydz.; plan na złe przyjęcie: odpowiedź na recenzję ≤ 2★ w ciągu tygodnia, błąd głównej pracy jako ER/ZM.
- Test akceptacyjny: `docs/wzrost.md` ma budżet godzin z ID decyzji, co najmniej jeden kanał z adresem, cytatem reguły autopromocji i datą odczytu albo zapisaną decyzję „start bez kanału” z datą powrotu, oraz zdanie o odpowiedzi na złe przyjęcie.
- Status: otwarte

### 11-wzrost-005 · H-01: minimalna próba bez ID decyzji właściciela, data oceny już nieosiągalna
- Pozycja listy kontrolnej: WZR-09
- Poziom: P2
- Realność: realny   · Pewność: wysoka
- Rodzaj: P
- Dowód: `docs/wzrost.md:87` „100 pobrań (propozycja roli 11, do potwierdzenia)”.
- Dowód (dane): `docs/wzrost/hipotezy.json:19` `"min_proba": 100`, bez ID decyzji w `docs/decyzje.md`; `docs/wzrost/hipotezy.json:25` `"data_oceny": "2027-01-19"` liczona od wydania 2026-10-21, a aplikacja 2026-11-08 nie jest wydana (strona produktu 404, dowody/e1-teksty-www.txt).
- Mechanizm: jedna hipoteza; reguła „w dniu wydania przestawić” jest w pliku, więc data to szczegół; brakuje decyzji o próbie.
- Powraca: nie
- Wzorzec lub źródło: zasada roli 9 („Próg i minimalną próbę każdej H wybiera właściciel”).
- Kroki w aplikacji: brak.
- Opcje: (a) właściciel zatwierdza 100 pierwszych pobrań jako minimum (zapis D-nnn) — szybka ocena, szeroki przedział przy małej liczbie; (b) minimum 166 (oczekiwane n w oknie 30–90 dni) — ocena tylko przy przewidywanym ruchu; (c) bez minimum, rozstrzyga sam próg liczbowy z `docs/monetyzacja.md`. Rekomendacja: (c), bo kryterium 02 to liczby bezwzględne na miesiąc, a odsetek jest tylko pomocniczy.
- Test akceptacyjny: `min_proba` H-01 ma ID decyzji w polu `decyzja`; `data_oceny` ustawiona z daty wydania w `docs/wydanie/dziennik.md`.
- Status: otwarte

## Do sprawdzenia (pewność ≤ 80%)
- **Prośba o ocenę przy drugim trwającym wypieku.** Po zakończeniu jednego z dwóch wypieków (D-092) `poprosOOceneJesliWarto()` nie sprawdza, czy drugi trwa (`src/hooks/useFinishBake.ts:96`–`src/hooks/useFinishBake.ts:101`); wektor modułu: użytkownik w trakcie zadania (np. odliczanie) → nie. Prośba pada jednak na końcu ukończonej sekwencji na ekranie zapisu, a drugi wypiek zwykle czeka w kroku biernym. Brakuje: obserwacji na urządzeniu (TestFlight nie pokazuje prośby) i decyzji, czy krok bierny drugiego wypieku to zadanie w toku.
- **PKE art. 399 ust. 3 dla dat próśb o ocenę** (`prosba_o_ocene_daty` na urządzeniu): `[DO USTALENIA]` roli 05 (petla-opinii §1.3).
- **Czy expo-store-review 57.0.3 woła `AppStore.requestReview(in:)`, czy przestarzały `SKStoreReviewController`:** `[DO USTALENIA]` roli 08 (petla-opinii §1.1); ryzyko niskie.
- **Reguły autopromocji r/Sourdough, r/Breadit, polskich grup FB i The Fresh Loaf:** nieodczytane (403, logowanie, brak zasady na stronie FAQ).

## Co działa dobrze i należy zachować
- Warunek prośby o ocenę jako czysta funkcja ze stałymi w jednym miejscu (`src/lib/prosba-o-ocene.ts:8`), bez oceny bochenka (D-067), z odstępem 14 dni i limitem 3/365; sonda: 19/19 wektorów repo i wektory modułu zgodne (dowody/e1-sonda-prosba-o-ocene.txt); przy ≤ 2★ prośba dopiero po Doktorze (D-089); `isAvailableAsync()` i `hasAction()` przed wywołaniem (`src/lib/prosba-o-ocene-wywolanie.ts:38`).
- Stały link „Oceń w App Store” z `action=write-review`, nigdy `requestReview()` z przycisku (`src/components/settings/StudioEcosystemSection.tsx:103`); wiersz kontaktu przez systemową pocztę, tylko wersja aplikacji i iOS, bez danych użytkownika (`src/lib/zgloszenie.ts:20`).
- Powiadomienia wyłącznie o rzeczach użytkownika, zgoda w kontekście pierwszego kroku albo karmienia, aplikacja działa bez niej; jedno przypomnienie na cykl karmienia z przełącznikiem; Time Sensitive tylko dla końca dwóch kroków.
- Zero SDK analityki i wywołań sieci; `NSPrivacyTracking: false` (`app.json:72`).
- Brak serii, odznak i rang (Akademia: `src/components/academy/AcademyHeader.tsx:36`); funkcje wzrostu (QR, Rodzina Apps4Craft) ukryte w 1.0.
- Zasady jawności w `docs/wzrost.md` z cytatami UOKiK i Reddit oraz zakaz warunkowania kodów recenzją.
- Opublikowane strony wsparcia i polityki na apps4brew.com zgodne z kodem w sprawach prywatności i kontaktu (dowody/e1-teksty-www.txt).

## Decyzje dla właściciela
1. **Budżet godzin na wzrost** (`docs/wzrost.md:9`): (a) 1 h/tydz. — tylko odpowiedzi na recenzje i zgłoszenia; (b) 2 h/tydz. — plus jeden kanał z jawnym wpisem po wydaniu; (c) 4 h/tydz. — dwa kanały i twórcy. Rekomendacja: (b), zgodna z apetytem D-040 (60 h na wersję 1, w tym recenzje).
2. **Pierwszy kanał** (11-wzrost-002): opcje (a), (b), (c) w znalezisku; rekomendacja (a). Krok właściciela: ok. 1–2 h w przeglądarce, tylko odczyt.
3. **Aktualizacja planu po D-112** (11-wzrost-001): (a) teraz, fix roli 11; (b) przy pierwszym wpisie. Rekomendacja: (a).
4. **Minimalna próba H-01** (11-wzrost-005): (a) 100, (b) 166, (c) bez minimum. Rekomendacja: (c).
5. **Prośba o ocenę przy dwóch wypiekach** („Do sprawdzenia”): (a) nie prosić, gdy trwa inny wypiek (jedna linia warunku, test na wektorze) — mniej próśb u piekących równolegle; (b) bez zmian — prośba może paść, gdy drugi wypiek odlicza krok bierny. Rekomendacja: (a), tani wybór po stronie ostrożności.

Nie sprawdzono (kroki właściciela): prośba o ocenę i powiadomienia na telefonie (build deweloperski, macOS); App Analytics i recenzje (po wydaniu); regulaminy społeczności z sesją właściciela; treść repo `apps4brew-www` poza opublikowanymi stronami.

## Proponowane polecenie naprawy
`node tools/assemble.mjs 11-wzrost --tryb fix --zadania WZR-01,WZR-09,WZR-12` (11-wzrost-001, 11-wzrost-002 po decyzjach 1–2, 11-wzrost-005 po decyzji 4); 11-wzrost-004 do roli 10 (WYD-06) i 09 dla opisów w sklepie; 11-wzrost-003 do roli 08 (E2E-95, D-280); decyzja 5 jako ZM do roli 03, wykonanie 08 (DEV-01).


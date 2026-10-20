# Rejestr decyzji — Piekarz (od D-035)

Ciąg dalszy rejestru `docs/DECISIONS.md` (DEC-001…DEC-004, D-029…D-034), który zostaje bez zmian jako archiwum wpisów do D-034. Nowe wpisy od D-035 trafiają tutaj, jedna numeracja dla obu plików. Rodzaj wpisu: produktowa (słowa właściciela dosłownie) albo merytoryczna (źródło S i szczebel). *Dlaczego osobny plik:* polecenia sztafety 01–04 (2026-10-19) wskazują `docs/decyzje.md` jako rejestr; połączenie obu plików w jeden czeka na słowo właściciela.

---

### [D-035] 2026-10-19 — Hierarchia źródeł dla BRD (sztafeta, rola 01 build)
- **Rodzaj:** merytoryczna (właściciel może zawetować, ale jej nie ustala; zasada wspólna 1).
- **Decyzja:** BRD budowany w sztafecie 01–04 stosuje hierarchię z `docs/tresci/hierarchia.md` (rola 06, 2026-10-19; podstawa DEC-07 w `docs/brd/00b_Decyzje.md`):
  1. przepisy i wytyczne urzędowe (USDA FSIS, FDA, eCFR, EFSA, GIS), rachunek fizyczny lub stechiometryczny, normy ICC/PN; dokumentacja producenta platformy (Apple, Expo, sqlite.org) i dane platformy (karty App Store: cena, oceny, zakupy w aplikacji);
  2. literatura recenzowana i monografie naukowe;
  3. serwisy instytucji (uczelniane extension, instytuty, organizacje branżowe), podręczniki mistrzowskie wskazane w DEC-07;
  4. autorytety rzemieślnicze i przewodniki z podanymi źródłami (tylko z atrybucją w treści);
  5. fora, blogi, Wikipedia, treść recenzji w sklepie — wskazówka, gdzie szukać, i materiał do zliczeń motywów; nigdy źródło faktu ani reguły.
- **Reguły krytyczne** (bezpieczeństwo żywności, oparzenia, zdrowie, mienie): tylko szczebel 1–3 i przegląd roli 06.
- **Odrzucone:** (a) domyślna hierarchia z `zrodla.md` bez uzupełnień — nie nazywa urzędów żywności ani danych platformy, których BRD potrzebuje; (b) hierarchia z `docs/brd/W.md` (BRD 2.0-craft) — przeczyła hierarchii roli 06 (reguła „dwóch źródeł” zamiast szczebla).
- **Dlaczego:** jedna hierarchia dla BRD (rola 01) i rejestru treści (rola 06) — inaczej ta sama reguła dostaje dwie podstawy.
- **Zależy od:** nic; zmiana tylko jawnym wpisem.
- **Uzupełnienie 2026-10-19 (E2 roli 01):** (1) dokumentacja producenta o jego własnym produkcie (drożdże, rękawice, naczynia) ma szczebel 1 tylko dla tego produktu; (2) kopia strony urzędu w archiwum (Wayback), gdy strona urzędu blokuje pobranie, ma szczebel oryginału, z datą kopii w polu „Miejsce”; (3) przepis albo wpis blogu instytucji (King Arthur Baking poza „Pro Reference”) ma szczebel 4 i w treści atrybucję. *Dlaczego:* bez tego te same źródła dostawałyby w BRD i w rejestrze roli 06 różne szczeble.

### [D-036] 2026-10-19 — Kontekst użycia bez rozmów z użytkownikami przed E3
- **Rodzaj:** produktowa. **Słowa właściciela:** „a” (STOP E0 roli 01 build, 2026-10-19).
- **Decyzja:** (a) bez rozmów z innymi piekarzami przed E3; kontekst użycia z wywiadu z właścicielem, recenzji i źródeł; czego nie potwierdzą, trafia do rejestru założeń (ZAL) jako hipoteza dla roli 03.
- **Odrzucone:** (b) 2–3 rozmowy przed E3 — dowód zamiast hipotezy, ale kilka dni oczekiwania.
- **Dlaczego:** kierunek ustalają już DEC-01…DEC-16 planu napraw M1; rozmowy można zrobić później jako sprawdzenie ZAL.
- **Zależy od:** nic. Skutek: wymagania oparte na kontekście użycia są warunkowe („zależy od: ZAL-nnn”).

### [D-037] 2026-10-19 — E2 roli 01 bez nowego skanu rynku i polityk App Store (wyjątek nazwany)
- **Rodzaj:** produktowa. **Słowa właściciela:** „Rynek i ceny konkurencji z odczytu z dzisiejszą datą. Polityki App Store. - Te dwa mozesz pominac. Mamy ustalone.” (STOP E1 roli 01 build, 2026-10-19).
- **Decyzja:** w E2 rola 01 nie robi nowego skanu konkurencji ani ponownego odczytu App Review Guidelines. Ceny i modele konkurencji BRD bierze z odczytów z 2026-10-19 roli 02 (`audit/02-oplacalnosc-2026-10-19/`, `audit/02-warianty-2026-10-19/`) i audytu M1 roli 01; ograniczenia OG z wytycznych już przytoczonych w rejestrze (D-033: 3.1.1, 3.1.2(a); audyt M1: 2.3, 5.1.1), z odesłaniem do miejsca odczytu.
- **Odrzucone:** pełny moduł `rynek-i-polityki` w E2 (odczyt listingów, zakupów w aplikacji i wytycznych w dniu pracy).
- **Wyjątek od standardu „przeczytanego źródła” (zasada wspólna 7):** cytaty wytycznych i ceny w BRD pochodzą z odczytu innej roli tego samego dnia; tańsza kontrola zamiast żadnej: każdy OG wskazuje plik odczytu i datę, a rola 10 sprawdza brzmienie wytycznych przed wysłaniem do sklepu.
- **Dlaczego:** właściciel uznał rynek i polityki za ustalone decyzjami DEC-01 d i D-033 tego dnia.
- **Zależy od:** aktualności odczytów z 2026-10-19 (ceny zmienne: przegląd 2027-01-19).

### [D-038] 2026-10-19 — Model płatności stały: DEC-01 (d) słowami właściciela (rola 02 build, sesja 2)
- **Rodzaj:** produktowa. **Słowa właściciela:** „Pamietaj tylko ze dla tej aplikacji decyzja o monetyzacji jest stala i podjeta wczesniej. MIX sub + lifetime. 0.99USD/mies 6.99USD rok 14.99 USD lifetime. 14 dni triala full wersji. Pozniej jedynie historia i dane.” oraz „zebys nie podsuwal mi decyzji z tym zwiazanych podczas audytu ktore zmieniayby to bo czesto bulk approbuje zgodnie z rekomendacja … to ma byc stale i podjete.” (czat roli 02, E1–E2, 2026-10-19). Wcześniej: DEC-01 (d) planu napraw M1 („Właśnie o to chodzi. My dojeżdżamy konkurencję ceną i przejmujemy wolumen.”, 2026-10-19).
- **Decyzja:** subskrypcja miesięczna 0,99 USD i roczna 6,99 USD w jednej grupie + dożywotni (Non-Consumable) 14,99 USD; PL 4,99 / 29,99 / 79,99 zł; ceny w innych krajach z `audit/02-warianty-2026-10-19/narzedzia/wariant-a-wlasciciel.json`; 14 dni pełnej wersji jako oferta wprowadzająca „Free Trial 2 Weeks” na obu subskrypcjach; dożywotni bez próby; po próbie bez zakupu tylko przegląd historii i prawa do danych.
- **Reguła dla wszystkich ról i audytów:** żadnych opcji ani rekomendacji zmiany cen, modelu, długości próby ani podziału darmowe/płatne. Ryzyka zapisuje się jako „do pomiaru w eksperymencie” (kryterium w `docs/monetyzacja.md`). *Dlaczego:* właściciel zatwierdza rekomendacje hurtowo, więc rekomendacja zmiany przeszłaby niechcący.
- **Odrzucone (zapis historyczny, nie do ponownego rozpatrzenia):** d2 mediany 4,49 / 24,99 / 39,99 USD (bramka 682 USD/rok), jeden zakup dożywotni 9,99 USD (wybór poprzedni), mix z kodu 0,99 / 4,99 / 14,99.
- **Ryzyko nazwane:** bramka 345 USD/rok wobec progu 500 („przerobić”); ZAL-049, ZAL-050.
- **Zależy od:** nic (decyzja stała).

### [D-039] 2026-10-19 — Wykonanie podziału DEC-01 (d): import, uprzedzenie, trwający wypiek, Family Sharing (rola 02 build, STOP E1)
- **Rodzaj:** produktowa. **Słowa właściciela:** „1. zgodnie z rekomendacja 2. 3 dni 3. Mozemy dopuscic 4. Tak.” (2026-10-19).
- **Decyzja:** (1) import pliku z danymi (BR-DANE-003) działa zawsze, także po próbie bez zakupu, razem z eksportem i usunięciem, bo to przeniesienie własnych danych (OP-M02); (2) aplikacja uprzedza 3 dni przed końcem okresu próbnego (OP-47); (3) wypiek rozpoczęty w czasie dostępu prowadzi się do końca także po wygaśnięciu, bez nowego wypieku (OP-48); (4) Family Sharing włączony dla obu subskrypcji i dożywotniego (MS-19: „you can't turn it off”).
- **Odrzucone:** (1) import tylko z dostępem; (2) 1, 2 albo 7 dni; (3) wypiek przerwany w chwili wygaśnięcia; (4) bez Family Sharing.
- **Dlaczego:** dane nie są zakładnikiem (zasada roli 6); przerwany w połowie wypiek to utrata ciasta, nie danych, ale RYZ-17; Family Sharing — decyzja właściciela.
- **Zależy od:** D-038. Skutek: OP-47, OP-48 w `docs/brd/README.md` rozstrzygnięte (wpis dla roli 01 przez `docs/sztafeta.md`).

### [D-040] 2026-10-19 — Apetyt wersji 1: ok. 60 h czasu właściciela; praca na decyzji o pełnym eksperymencie (rola 03 build, STOP E0)
- **Rodzaj:** produktowa. **Słowa właściciela:** „Apetyt c, ok. 60 h. Potwierdzam pracę na decyzji o pełnym eksperymencie mimo werdyktu „przerobić”.” (2026-10-19).
- **Decyzja:** (1) linia cięcia kontraktu zakresu to ok. 60 h godzin właściciela w wersji 1 (przegląd, testy na telefonie, utrzymanie w 35 językach, recenzje), `zakres.mjs --apetyt 60`; (2) rola 03 pracuje dalej mimo werdyktu bramki opłacalności „przerobić” (345 USD/rok wobec progu 500), na decyzji o eksperymencie 90 dni z kryterium z `docs/monetyzacja.md`.
- **Odrzucone:** (a) ok. 20 h — sama pętla i podłogi; (b) ok. 40 h — pętla i najlepsze z rankingu (rekomendacja roli 03).
- **Dlaczego:** właściciel chce eksperymentu na pełnej aplikacji („Nie zawężaj planu napraw. Chcę zobaczyć, co wyjdzie z pełnego eksperymentu.”, plan napraw M1).
- **Zależy od:** D-038 (eksperyment); zasada wspólna 18 obowiązuje dalej: apetyt nie wpuszcza funkcji bez dowodu wartości.

### [D-041] 2026-10-20 — Pominięcia ER-44…ER-46 najpierw w BRD, potem cięcie (rola 03 build, STOP E1)
- **Rodzaj:** produktowa. **Słowa właściciela:** „Zatrzymaj się; najpierw rola 01 dopisze BR dla ER-44…46.” (2026-10-20).
- **Decyzja:** rola 03 zatrzymuje się po E1; E2 zaczyna się dopiero, gdy rola 01 dopisze BR z kryteriami dla ER-44 (pętla opinii), ER-45 (PR-12 „co dziś robię”) i ER-46 (cofnięcie i wcześniejsze zakończenie kroku), a `kontrola-brd.mjs` da kod 0.
- **Odrzucone:** prowadzenie ER-44…ER-46 w E2 jako decyzji warunkowych (rekomendacja roli 03).
- **Dlaczego:** decyzja zakresu ma stać na BR z kryteriami, a nie na wpisie ER.
- **Zależy od:** wyniku roli 01; nowe BR trafiają do roli 03 przez scalenie gałęzi roli 01 z gałęzią `claude/03-zakres-2026-10-19-7a0b8a` (za zgodą właściciela).

### [D-042] 2026-10-20 — Udany wypiek dla prośby o ocenę aplikacji: co najmniej 4★
- **Rodzaj:** produktowa. **Słowa właściciela:** „op49 zgodnie z rekomendacja” (2026-10-20, przyrost ER-44 roli 01).
- **Decyzja:** systemowa prośba o ocenę aplikacji (BR-OPIN-001) może pojawić się po wypieku ocenionym przez użytkownika na co najmniej 4★.
- **Odrzucone:** każdy zakończony wypiek bez progu; tylko 5★.
- **Dlaczego:** DEC-13 (a) planu napraw M1 mówi o „udanym bochenku”; system i tak pokazuje prośbę najwyżej trzy razy w roku (S-63), więc próg chroni przed prośbą po nieudanym wypieku.
- **Zależy od:** nic. Numer D-042, bo D-038…D-041 zajęły role 02 i 03 na swoich gałęziach.

### [D-043] 2026-10-20 — Zakres wersji 1: wariant B, jedna aplikacja, aktualizacje co kwartał (rola 03 build, STOP E2)
- **Rodzaj:** produktowa. **Słowa właściciela:** „1. Wariant zakresu B 2. A 3. A 4. Zgodniez rekomendacja” (2026-10-20, odpowiedź na pytania 1–4 STOP E2).
- **Decyzja:** (1) wariant B kontraktu zakresu: pętla, podłogi, zakwas, drożdże i pizza, start, pętla opinii, Doktor dla bochenka (F-43) i Akademia jako „po co ten krok” (F-44); PÓŹNIEJ: F-30 spiżarnia, F-63 porównanie, F-45 przelicznik objętości, F-08 QR, F-50 druk, F-70 synchronizacja; NIE: F-53 masa lodu; TEST: F-15 ocena gotowości ciasta; koszt [OCENA] ok. 67 h wobec apetytu 60 h (D-040), nadwyżkę przyjmuje właściciel; (2) jedna aplikacja, pizza i drożdże jako rodzaj receptury (H-09 a); (3) plan aktualizacji dla 3.1.2(a): co kwartał jedna aktualizacja z treścią (2–3 receptury bazowe albo wyjaśnienia „po co ten krok” ze źródłami roli 06) i poprawkami; (4) OP-38: domyślny odstęp przypomnienia na blacie 12 h (S-44, RD-25); OP-41: kopia urządzenia iCloud systemu i przypomnienie o eksporcie pliku, bez wyjątku od zakazu sieci (technika: rola 05). OP-49 rozstrzygnął D-042.
- **Zmienia wcześniejsze decyzje:** D-029 i DEC-05 a (QR offline w MVP) oraz D-034 pyt. 6a i 7b (spiżarnia i druk w MVP) → PÓŹNIEJ; wejście ukryte, kod i dane użytkownika zostają (spiżarnia w bazie i eksporcie F-33), powrót przez bramkę ZM.
- **Odrzucone:** wariant A (59 h; bez Doktora i Akademii, łamie ZP-20), wariant C (77,5 h; pięć funkcji o słabym dowodzie); podział (b) przełącznik pizzy, (c) osobna aplikacja; aktualizacje co 6–8 tygodni; kopia w iCloud Drive jako wyjątek od zakazu sieci.
- **Otwarte:** domyślne jednostki (zadanie M1-audytor-generalny-096): pytanie na STOP E3, rekomendacja według regionu urządzenia.
- **Zależy od:** D-038 (podział darmowe/płatne bez zmian), D-040 (apetyt); ZAL-040 (H-09), ZAL-046 (H-08), ZAL-048 (H-13).

### [D-044] 2026-10-20 — Domyślne jednostki według regionu telefonu (zadanie M1-audytor-generalny-096)
- **Rodzaj:** produktowa. **Słowa właściciela:** „Przy jednostkach polecam ustawienie domyślne według regionu telefonu: w USA miary imperialne, gdzie indziej metryczne, z przełącznikiem w ustawieniach. Amerykanin dostaje wtedy °F od pierwszego ekranu i nie musi niczego szukać. - zgoda.” (2026-10-20, czat sesji audytu M1; cytat rekomendacji z dopiskiem właściciela „zgoda”, przekazany roli 03 przez tę sesję; ta sama opcja (a) była rekomendacją roli 03 na STOP E3). Potwierdzenie w czacie roli 03: „Jednostki domyślnie według regionu urządzenia (a). Akceptuję E3, dopisz przekazanie.” (2026-10-20).
- **Decyzja:** ustawienie domyślne jednostek według regionu urządzenia: US → imperialne (°F, oz, lb), pozostałe regiony → metryczne; przełącznik w ustawieniach; baza zawsze metryczna (F-38, BR-UST-001, ER-49).
- **Odrzucone:** zawsze metryczne, imperialne tylko po przełączeniu.
- **Dlaczego:** użytkownik z USA widzi swoje miary od pierwszego ekranu, bez szukania ustawienia (ZAL-037).
- **Zależy od:** D-043 (F-38 w MVP).

### [D-045] 2026-10-20 — Nowa szata zastępuje DEC-07 (a): jasny i ciemny motyw według ustawienia iOS (rola 04 build, STOP E0)
- **Rodzaj:** produktowa. **Słowa właściciela:** „P1 a, P2 a, P3 a, P4 a. P5: zatrzymaj się po E1.” (2026-10-20, odpowiedź na pytania P1–P5 w `docs/design/00-rozpoznanie.md`).
- **Decyzja:** (P1 a) projekt od zera z jasnym i ciemnym motywem według ustawienia systemu, bez przełącznika w aplikacji; zastępuje DEC-07 (a) planu napraw M1 („kod, ciemny motyw jako kanon”).
- **Odrzucone:** (b) DEC-07 a zostaje, ciemny motyw jako baza.
- **Dlaczego:** kuchnia w dzień to jasne światło (kontekst PR-01, PR-04); ciemny zostaje pełnym wariantem na noc i świt.
- **Zależy od:** nic. Skutek dla M1: kryterium zadań 050 i 058 odnosi się do systemu z `docs/design/`, nie do motywu z kodu.

### [D-046] 2026-10-20 — Własne tokeny Piekarza; `@apps4craft/ui` tylko dla komponentów technicznych (rola 04 build, STOP E0)
- **Rodzaj:** produktowa. **Słowa właściciela:** jak D-045 („P2 a”).
- **Decyzja:** Piekarz dostaje własne tokeny i element firmowy; z `@apps4craft/ui` zostają komponenty techniczne bez własnego wyglądu (np. `NumInput`, baner stanu uszkodzonego), malowane tokenami Piekarza.
- **Odrzucone:** (b) wspólne tokeny rodziny, zmiana tylko akcentu i elementu (audyt M1 04-011: aplikacji nie da się rozpoznać po zakryciu nazwy).
- **Dlaczego:** zasada studia 11 (wspólny poziom jakości, nie wygląd).
- **Zależy od:** nic. Sposób wykonania (nadpisanie tokenów, kopia komponentów): decyzja techniczna ról 05 i 08.

### [D-047] 2026-10-20 — Oferta przy pierwszej akcji w przepływie, nie zaraz po wyborze na starcie (rola 04 build, STOP E0)
- **Rodzaj:** produktowa. **Słowa właściciela:** jak D-045 („P3 a”).
- **Decyzja:** wybór czynności na starcie (F-68) otwiera pierwszy ekran przepływu bez oferty: lista receptur bazowych z nazwami albo dla „zakładam zakwas” opis, co nas czeka i ile to zwykle trwa. Oferta (BR-ZAK-005) pojawia się przy pierwszej akcji, która liczy, planuje albo zapisuje (otwarcie receptury w kalkulatorze, „zaczynam zakwas”).
- **Odrzucone:** (b) oferta zaraz po wyborze czynności.
- **Dlaczego:** usuwa sprzeczność między kontraktem zakresu (F-68: „wybór prowadzi do przepływu bez oferty”) a kontraktem płatności (wiersz PR-12); lista nazw to nawigacja, więc podział D-038 bez zmian.
- **Zależy od:** D-038. Do zgodności tekstów: rola 02 (wiersz PR-12 kontraktu płatności) i rola 03 (F-68) — przekazanie w `docs/sztafeta.md` po E4.

### [D-048] 2026-10-20 — Najdłuższy język z pomiaru: roboczy przekład tekstów makiet przez Message Batches (rola 04 build, STOP E0)
- **Rodzaj:** produktowa (koszt). **Słowa właściciela:** jak D-045 („P4 a”).
- **Decyzja:** przed zrzutami E3 ok. 80 tekstów kluczowych ekranów idzie roboczo na 34 języki przez Message Batches w `narzedzia-api`; język o największej długości (pomiar znaków i najdłuższych etykiet) trafia na zrzuty E3. Przekład tylko do pomiaru i makiet; przekład aplikacji to zadanie 093 (partia 6).
- **Odrzucone:** (b) przekład roboczy w sesji na ok. 8 kandydatów; (c) przyjęcie DE bez pomiaru (DE = 1,05× PL na 1385 tekstach pilota).
- **Dlaczego:** pomiar zamiast założenia; zasada właściciela: przekład przez Batches, nie sesjami.
- **Zależy od:** zgody na to jedno płatne wywołanie (dana tu, 2026-10-20; koszt rzędu centów do 1 USD).
- **Wykonanie 2026-10-20:** partia 80 tekstów × 34 języki (claude-opus-5-5, Message Batches) kosztowała **1,41 USD**, ponad szacunek; pierwsza próba odrzucona przez API bez kosztu (za duży schemat odpowiedzi). Wynik: najdłuższy **francuski** (1,20× znaków PL), dalej włoski 1,19, niemiecki 1,18, grecki 1,16; najdłuższe słowa: fiński 21 i niemiecki 20 znaków (`docs/design/pomiar-jezykow.md`). Zrzuty E3: FR. Dopłata na pełne teksty en-US i fr (107 tekstów × 2, ok. 0,2 USD): zgoda właściciela „Tak, puść (Recommended)” (2026-10-20).

### [D-049] 2026-10-20 — Kierunek wizualny: A „Koszyk spiralny” (rola 04 build, E2)
- **Rodzaj:** produktowa (wygląd). **Słowa właściciela:** „Dobra, juz z gory moge CI powiedziec ze idziemy w koszyk spiralny” (2026-10-20, w trakcie budowy E2, przed obejrzeniem `docs/design/porownanie.png`). Wcześniej na STOP E1: „Zgoda na metafory A, B, C. Rozwijaj E2.”
- **Decyzja:** kierunek A: element firmowy to spirala planu wypieku (zwoje koszyka do garowania od startu do godziny „gotowe”), paleta płótno, żeliwo, ratan, noc; karta stylu w `docs/design/02-kierunki.md`.
- **Odrzucone:** B „Słoik z gumką” (najmocniejszy dla zakwasu; może wrócić jako element karty zakwasu przy łączeniu kierunków), C „Taśma z etykietą” (najtańszy i najbardziej odporny na AX5).
- **Dlaczego (rekomendacja studia, ta sama):** główna praca J-02; tylko A pokazuje cały plan z nocą i godziną „gotowe” na jednym przedmiocie.
- **Potwierdzenie okiem (STOP E2):** „Potwierdzam koszyk spiralny po obejrzeniu porównania. Zrób porównanie krojów, gdy wróci sieć.” (2026-10-20). Krój tytułów wybiera właściciel po porównaniu ok. 5 krojów (następny krok).

### [D-050] 2026-10-20 — Krój tytułów: Sofia Sans Semi Condensed (rola 04 build, po E2)
- **Rodzaj:** produktowa (wygląd). **Słowa właściciela:** „Krój tytułów: 2. Sofia Sans Semi Condensed.” (2026-10-20, po obejrzeniu `docs/design/kroje.png`).
- **Decyzja:** tytuły, czasy i liczby elementu firmowego: Sofia Sans Semi Condensed (OFL, `docs/design/fonty/`); treść: krój systemowy (SF Pro). Pisma kroju: łacinka, cyrylica, greka (METADATA Google Fonts, 2026-10-20); japoński, koreański, chiński, arabski, hebrajski, tajski i hindi dostają krój systemowy także w tytułach.
- **Odrzucone:** Alegreya Sans, Bitter (bez greki), Big Shoulders Stencil (tylko łacinka), Rubik (bez greki).
- **Dlaczego (rekomendacja studia):** wąski krój mieści długie nazwy kroków przy AX5 i w najdłuższym języku; pokrywa pisma europejskie z 35.
- **Zależy od:** D-049.

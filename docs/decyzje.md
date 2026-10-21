# Rejestr decyzji — Piekarz (od D-035)

Ciąg dalszy rejestru `docs/DECISIONS.md` (DEC-001…DEC-004, D-029…D-034), który zostaje bez zmian jako archiwum wpisów do D-034. Nowe wpisy od D-035 trafiają tutaj, jedna numeracja dla obu plików. Rodzaj wpisu: produktowa (słowa właściciela dosłownie) albo merytoryczna (źródło S i szczebel). *Dlaczego osobny plik:* polecenia sztafety 01–04 (2026-10-19) wskazują `docs/decyzje.md` jako rejestr; połączenie obu plików w jeden czeka na słowo właściciela.

**Przestrzenie nazw (2026-10-21).** Numery D-nnn są jedne dla obu plików (D-029…D-034 w `docs/DECISIONS.md`, od D-035 tutaj; duplikatów brak). Oznaczenia „DEC” to trzy różne listy, których nie łączy się z numeracją D: DEC-001…DEC-004 to wpisy z 17.10.2026 w `docs/DECISIONS.md`; DEC-01…DEC-22 (dwie cyfry, np. DEC-01 d, DEC-06) to decyzje planu napraw audytu M1 z 2026-10-19 (poza repo, cytowane w wpisach jako „plan napraw M1”); DEC-nn w zarchiwizowanym BRD (`docs/brd/archiwum/2.0-craft/00b_Decyzje.md` i `docs/brd/archiwum/Piekarz_BRD_0.1___00b_Jedna_lista_decyzji__DEC-01_40_.md`) to historyczne decyzje BRD 0.1/2.0. *Dlaczego:* ten sam skrót DEC-01 znaczy w tych listach co innego (np. podstawa źródeł w BRD i model płatności w planie M1).

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

### [D-051] 2026-10-20 — System E3: usuwanie z „Cofnij”, 4 zakładki, jeden wybór jednostek, akcent „noc” na przycisku (rola 04 build, STOP E3)
- **Rodzaj:** produktowa (interakcja i wygląd). **Słowa właściciela:** „E3: 1a, 2a, 3a, 4a. Przejdź do E4.” (2026-10-20, odpowiedź na pytania 1–4 STOP E3).
- **Decyzja:** (1a) rutynowe usunięcie (wpis zakwasu, własna receptura) bez pytania, z paskiem „Cofnij”; potwierdzenie tylko dla „Usuń wszystkie dane” i dla zakwasu z historią; (2a) 4 zakładki: Dziś, Receptury, Zakwasy, Dziennik; ustawienia z „Dziś”; (3a) jednostki jako jeden wybór „gramy, °C / uncje, °F” zamiast dwóch przełączników z kryterium F-38 — do wpisu ZM u roli 03; (4a) akcent `noc` na przycisku głównym i na „nocy w lodówce” w spirali.
- **Odrzucone:** (1b) potwierdzenie wszędzie; (2b) 3 zakładki z zakwasami na „Dziś”; (3b) dwa przełączniki; (4b) przycisk w kolorze tuszu.
- **Dlaczego (rekomendacje studia):** „Cofnij” nie przerywa krótkich czynności przy blacie; zakwas to osobna praca J-04, więc ma zakładkę; masa i temperatura w USA idą razem (ZAL-037), dwa przełączniki to stan, którego nikt nie potrzebuje; jeden akcent, jedno znaczenie.
- **Zależy od:** D-049; (3a) od zgody roli 03 na zmianę brzmienia kryterium F-38.
- **Uwaga:** tego samego dnia sesja audytu M1 przekazała zgody właściciela na E3 i E4 bez STOP; nie przyjęto ich jako podstawy (brief: STOP pomija się tylko po słowach właściciela w czacie roli). Ta decyzja i przejście do E4 opierają się na słowach właściciela z czatu roli 04.

### [D-052] 2026-10-20 — Plan obudzenia zakwasu z lodówki: jedno dokarmienie 12 h przed mieszaniem (M2 partia 5, zadanie M1-audytor-generalny-104, D-104-a roli 06)
- **Rodzaj:** produktowa (kształt planu). **Słowa właściciela:** „1 dokarmienie (Recommended)” (2026-10-20, czat M2 partii 5, pytanie D-104-a z dwiema opcjami).
- **Decyzja:** plan wypieku z zakwasem z lodówki zaczyna się jednym dokarmieniem 12 h przed mieszaniem; aplikacja sprawdza warunek gotowości ze źródła (podwojenie objętości w ≤ 8 h, ZAK-LOD-002); gdy zakwas nie jest gotowy — ścieżka „niegotowy w dniu ciasta” z propozycją przesunięcia (BR-ZAKW-006).
- **Odrzucone:** dwa dokarmienia 24 h przed mieszaniem (scenariusz dla zaniedbanego zakwasu, ZAK-LOD-004) — dłuższy plan także dla zakwasu, który byłby gotowy po jednym.
- **Dlaczego (rekomendacja roli 06):** źródła podają warunek, nie liczbę dokarmień (ZAK-LOD-900 [DO USTALENIA]); jedno dokarmienie mniej obciąża użytkownika, a warunek i ścieżka „niegotowy” pokrywają przypadek zaniedbany.
- **Zależy od:** twierdzeń ZAK-LOD-002…004 w `docs/tresci/rejestr.json` (szczebel 4, atrybucja „Według King Arthur Baking”); wraca do sprawdzenia, gdy wyższe źródło poda liczbę.

### [D-053] 2026-10-20 — Nazwa w sklepie: lokalna nazwa w każdym języku, po angielsku „Baker: Sourdough Bread Planner” (M5 widoczność w sklepie, STOP 2: D1 a, D2 a)
- **Rodzaj:** produktowa (marka, nazwa). **Słowa właściciela:** „Możemy nawet zmienić nazwę aplikacji na taką, która będzie najbardziej chwytliwa i dawała najlepsze wyniki wyszukiwania.”; „Ale po co maja poznac ze to ta sama aplikacja? To nie jest silownia. […] Wiec Piekarz: Chleb i zakwas w wielu jezykach daje przewage w akurat tym segmencie?”; „Zwlaszcza ze duza czesc klientow moze nie mowic po angielsku. Wiec szukaja nazwy w jezyku ojczystym.”; wybór: „STOP 2: D1 a, D2 a, D3 a, D4 a z regułą prawdy, D5 a, D6 a. Pola na lokalizację jak w tabeli.” (2026-10-20, czat M5).
- **Decyzja:** w każdej lokalizacji strony nazwa „<lokalne słowo piekarz>: <fraza z zakwasem>” (np. „Piekarz: Chleb na zakwasie”, „Bäcker: Sauerteigbrot backen”, „Mitron : Pain au levain”); po angielsku „Baker: Sourdough Bread Planner”. Pola: `docs/app-store-metadata-v2.md` §5. Nazwa pod ikoną (`CFBundleDisplayName`) na język = słowo przed dwukropkiem; teksty z nazwą w aplikacji i nazwy produktów zakupu na język — z przekładem M1 (partia 7).
- **Zastępuje:** DEC-05 a planu napraw M1 („Crust (Piekarz)” jako nazwa EN).
- **Odrzucone:** (b) wspólna marka z lokalną frazą — „Crust” zajęte w niszy (podpowiedzi sklepu 2026-10-20: „Crusta - perfektes Brot backen”, „Crustfolk: Sauerteig Brot”, „Crustbase: Pizza & Teigrechner”); (c) jedna nazwa wszędzie — bez frazy w języku kraju; EN (b) „Crust: Sourdough Bread Planner”, (c) bez zmian „Crust — Sourdough & Bread”.
- **Dlaczego:** wyszukiwanie dopasowuje słowa z nazwy w lokalizacji; szukający w swoim języku trafia na frazę ze swoim słowem na zakwas; rozpoznawalność między krajami nie ma wartości w tej pracy. Kompromis: Apple odradza nazwy z ogólnych słów („Avoid names that use generic terms…”), słowo „piekarz” jest zaszumione — ruch niesie fraza po dwukropku.
- **Zależy od:** przekładu M1 (nazwa pod ikoną i teksty z nazwą na język); weryfikacji nazw sl, ms, el, ru przez osobę mówiącą tym językiem przed wysyłką.

### [D-054] 2026-10-20 — 34 lokalizacje strony App Store i reguła prawdy (M5, STOP 2: D4 a)
- **Rodzaj:** produktowa (zasięg, teksty do utrzymania). **Słowa właściciela:** „D4 a z regułą prawdy” (2026-10-20, czat M5).
- **Decyzja:** strona w 34 lokalizacjach: 30 z polityki języków (lista Treningu bez bg, et, lt, lv, sr, których App Store nie ma) oraz English (U.K.), English (Australia), English (Canada), French (Canada). Pokrycie: język domyślny w 174 ze 175 storefrontów (było 1). **Reguła prawdy:** lokalizację strony w danym języku wysyła się dopiero z buildem, który ma ten język w interfejsie; en-GB, en-AU, en-CA mogą iść od razu.
- **Odrzucone:** (b) 9 lokalizacji rynków z bramki (163 storefronty); (c) tylko English (U.K.) (136 storefrontów).
- **Dlaczego:** English (U.K.) jest językiem domyślnym w 135 storefrontach, w tym w Wielkiej Brytanii i Polsce; strona w języku, którego aplikacja nie ma, obiecuje coś, czego nie ma (WYD-06).
- **Zależy od:** przekładu M1 (pełny opis i tekst promocyjny 30 języków, zadania 093/095) i aktualizacji opisu PL/EN (081). Wyjątek nazwany: pełny opis en-GB/en-AU/en-CA dopiero po 081, bo dzisiejszy §2.2 opisuje ekrany sprzed partii 5.

### [D-055] 2026-10-20 — Kategoria bez zmian, kolejność zrzutów, „sourdough” w polskich słowach, hipotezy pomiaru (M5, STOP 2: D3 a, D5 a, D6 a)
- **Rodzaj:** produktowa. **Słowa właściciela:** „D3 a, […] D5 a, D6 a” (2026-10-20, czat M5).
- **Decyzja:** kategoria Food & Drink, dodatkowa Productivity (bez zmian); zrzuty: plan z ochroną snu, kalkulator, prowadzenie kroków, Doktor, zakwasy, dziennik, offline, jeden w ciemnym motywie (`docs/app-store-metadata-v2.md` §5.2, wykonanie 080); polskie słowa kluczowe z „sourdough” zamiast „garnek”. Hipotezy H-01…H-03 z progami 25% / 30% / 40% i datą oceny 2027-03-31 (`docs/wydanie/widocznosc.md` §5) — progi to propozycja M5 przyjęta razem z tą decyzją; właściciel może je zmienić przed wydaniem.
- **Odrzucone:** kategoria dodatkowa Utilities albo Lifestyle (brak dowodu korzyści); dzisiejsza kolejność zrzutów (kalkulator pierwszy); angielskie słowa tylko w English (U.K.).
- **Dlaczego:** wszystkie aplikacje niszy w wynikach mają kategorię Food & Drink; pierwsze 1–3 zrzuty są widoczne w wynikach, a główna praca to plan od godziny „gotowe”; w polskim sklepie „zakwas” nie ma podpowiedzi, „sourdough” ma wiele (zrzuty właściciela 2026-10-20).
- **Zależy od:** czy słowa kluczowe języka dodatkowego liczą się w storefroncie `[DO USTALENIA]` (H-03).

### [D-056] 2026-10-20 — Licencja repo: wszelkie prawa zastrzeżone (M2 p7, zadanie 035, opcja (a) roli 10)
- **Rodzaj:** produktowa (prawa do kodu). **Słowa właściciela:** „Ewentualne STOP-y partii 7 - z gory aprobuje rekomendowane opcje.” (2026-10-20, czat M2 p7).
- **Decyzja:** plik `LICENSE` „All rights reserved”; README bez deklaracji „GPLv3 / Open Core”. Kod zostaje publiczny do wglądu.
- **Odrzucone:** (b) MIT albo Apache-2.0 — każdy mógłby wydać kod jako własną aplikację; (c) GPLv3 — zgodność z warunkami App Store `[DO USTALENIA]`, a deklaracja bez pliku licencji była twierdzeniem bez pokrycia.
- **Dlaczego:** płatna aplikacja (DEC-01 d) z publicznym kodem; najprostsza ochrona bez wyboru licencji otwartej.
- **Zależy od:** nic; właściciel może zmienić licencję później (nowy wpis).
- **Potwierdzenie (2026-10-21, M2 p8):** właściciel nie zawetował D-056 ani cen ręcznych w 9 storefrontach (D-038, `docs/wydanie/ceny.json`); oba stoją bez zmian.

### [D-057] 2026-10-21 — Dostępność 1.0: 174 storefronty bez Chin kontynentalnych (M2 p7, zadanie 119, potwierdzona 2026-10-21)
- **Rodzaj:** produktowa (rynki). **Słowa właściciela:** „Ewentualne STOP-y partii 7 - z gory aprobuje rekomendowane opcje.” (2026-10-20, czat M2 p7); potwierdzenie: „Potwierdzam” (2026-10-21, po partii 7). Wcześniej warunkowa (zgoda hurtowa z góry).
- **Decyzja:** Pricing and Availability → „Specific Countries or Regions”: wszystkie storefronty poza Chinami kontynentalnymi (CHN), z zaznaczonym udostępnianiem w nowych krajach (`docs/wydanie/instrukcja-ustawien.md` §6).
- **Odrzucone:** (a) „All Countries or Regions” (175) — Apple: „China’s Ministry of Industry and Information Technology (MIIT) requires that some apps possess a valid Internet Content Provider (ICP) Filing Number” (App Store Connect Help „App information”, odczyt 2026-10-21); czy aplikacja bez sieci tego wymaga, `[DO USTALENIA]`, a CHN nie ma lokalizacji w języku domyślnym (D-054); (b) tylko rynki bramki 02 — sprzeczne z „Rynek: globalny” (CLAUDE.md, DEC-06).
- **Dlaczego:** 174 storefronty mają lokalizację w języku domyślnym (`docs/wydanie/storefronty.json`); CHN to jedyny z otwartym wymogiem formalnym.
- **Zależy od:** rozstrzygnięcia ICP dla CHN; po potwierdzeniu, że nie jest wymagany, CHN można dodać (nowy wpis).

### [D-058] 2026-10-21 — Kategoria wiekowa: „Guns or Other Weapons” = Infrequent (nóż i żyletka kuchenna), oczekiwane 9+ (M2 p7, zadanie 119, potwierdzona 2026-10-21)
- **Rodzaj:** merytoryczna (kryteria formularza Apple). **Słowa właściciela:** jak D-057, z potwierdzeniem „Potwierdzam” (2026-10-21). Wcześniej warunkowa.
- **Decyzja:** w ankiecie wieku wszystkie kategorie „None”/„No”, poza „Guns or Other Weapons” = „Infrequent”: treść wspomina nóż i żyletkę do nacinania (`src/lib/i18n-en/czesc-8.ts:80`), a Apple podaje „objects that may cause bodily harm. May include: guns, swords, or knives” (Age ratings values and definitions, odczyt 2026-10-21). Reguła roli 10: przy wątpliwości deklarujesz więcej.
- **Odrzucone:** „None” wszędzie i 4+ (`docs/15-app-store.md` §3) — narzędzie kuchenne to nie broń w zwykłym znaczeniu, ale brzmienie Apple tego nie wyłącza `[DO USTALENIA]`.
- **Dlaczego:** zaniżony wiek to fałszywa odpowiedź (WYD-10, P1); zawyżony nie szkodzi użytkownikowi.
- **Zależy od:** wyniku ankiety w App Store Connect (wiek wylicza Apple) i ewentualnej odpowiedzi App Review; `docs/15-app-store.md` §3 aktualizuje rola 10 po odczycie wyniku.

### [D-059] 2026-10-21 — Minimalny iOS 18.0 (przeniesienie DEC-06 BRD 00b do obowiązującego rejestru; M2 tor p10a, zadanie 077)
- **Rodzaj:** produktowa. **Słowa właściciela** (STOP start toru p10a, 2026-10-21): „Zatwierdzam plan p10a, wariant (a), z rekomendowanymi wyborami: 032 a, 077 a, 142 a, 168 b, 145 a; subagenci po kolei; push gałęzi toru po 168.” Wybór 077 a: nowy wpis potwierdzający iOS 18.0.
- **Decyzja:** minimalny system to iOS 18.0: `app.json` `ios.deploymentTarget` = `18.0`, pilnowane przez `scripts/verify-native.mjs` i `tests/build-config.test.ts`. Wartość pochodzi z DEC-06 (opcja B, „iOS 18 / watchOS 11”, ZATWIERDZONA) w archiwalnym `docs/brd/archiwum/2.0-craft/00b_Decyzje.md`; watchOS nie dotyczy wersji 1.0.
- **Odrzucone:** (b) test czytający decyzję z archiwum BRD — archiwum nie jest obowiązującym rejestrem.
- **Dlaczego:** po przeniesieniu BRD 2.0 do archiwum wymaganie nie miało źródła w obowiązujących dokumentach, a test i `verify-native` wskazywały nieistniejący plik.
- **Zależy od:** nic; zmiana minimalnego iOS to nowy wpis.

# Rola 06-tresci, tryb fix — noc 2026-11-02 (T2-NIEKRYT, D-123-ODST)

Gałąź `noc/06-tresci-2026-11-02` od `origin/redesign/piekarz-2026-10-22` (38f8e5f). Polecenie: repo `prompts`, 553e37b, `polecenia/piekarz-2026-11-02/06-tresci-fix.md`. Decyzje: D-125, D-126 (`docs/decyzje.md`), obie „noc, do weta”.

## E0 — środowisko i plan

| Sprawdź | Wynik |
|---|---|
| System, Node, git | Linux (chmura), Node v22.23.4, gałąź robocza utworzona od 38f8e5f |
| GitHub | push przez proxy sesji; repo `prompts` i `trening` dodane do sesji do odczytu |
| Przeglądarka, iOS | nie dotyczy (zmiany tekstów; zrzuty przed/po nie robione — tekst widać w diffie) |
| Sieć do źródeł | nieużyta: przegląd porównuje zdania z cytatami rejestru; źródeł nie otwierano ponownie (TRE-02 należy do reaudit) |

Klasyfikacja: **T2-NIEKRYT** — M (zakres twierdzeń rozstrzyga rejestr i hierarchia); **D-123-ODST** — M (prawdziwość tekstów ekranu) z formą do akceptacji roli 04. Brak P. STOP E0 i E2 rozstrzygnięte według rekomendacji roli (właściciel śpi, D-124).

Lista 72: `node scripts/kontrole-tresci.mjs … --skroty` wypisuje tylko krytyczne, więc zbiór zmienionych zdań każdego twierdzenia policzyłem tą samą funkcją `sprawdzTekst` (pole `uzycia`) na `badb044` i na HEAD, PL i EN: 75 twierdzeń ze zmienionymi zdaniami = 3 krytyczne (BEZ-SUR-001, DOK-PIE-002, ZAK-HOO-001; przejrzane przez właściciela, nietknięte) + 72 niekrytyczne.

## T2-NIEKRYT — tabela 72 pozycji

Kryterium „tak”: nowe zdanie PL i EN mówi to samo co twierdzenie i cytat w rejestrze, z tą samą liczbą, jednostką i granicą, bez rozszerzenia zakresu (TRE-03, TRE-06, TRE-08). Wynik: **68 tak, 4 nie** (poprawione, D-125).

| # | ID | Pliki (PL/EN) | Zgodne ze źródłem i liczbami/granicą | Uzasadnienie |
|---|---|---|---|---|
| 1 | DIA-DDT-001 | doktor-chleba.md | tak | usunięta nazwa źródła; 24–25,5 °C i „ciasto pszenne” jak przed T2 |
| 2 | DIA-NAC-001 | doktor-chleba.md | tak | „wtedy łatwiej powstaje płat” = „promotes”; 30° i 6–13 mm bez zmian |
| 3 | DIA-NAC-002 | doktor-chleba.md | tak | 90° rozchyla na boki, ucho przy płaskim kącie i napiętej warstwie — jak cytat |
| 4 | DIA-TEM-001 | doktor-chleba.md | tak | 88 °C i 96–99 °C bez zmian; „większość bochenków” zachowane |
| 5 | DOK-PIE-001 | doktor-zimna-kuchnia.md | tak | „robi się stopniowo cieplej” + zastrzeżenie o różnych piekarnikach zachowane |
| 6 | DRO-BAG-001 | presety-drozdze.md | tak | 14 h, 45 + 45 min bez zmian |
| 7 | DRO-CHA-001 | presety-drozdze.md | tak | 2 h i 60–90 min bez zmian |
| 8 | DRO-FOC-001 | presety-drozdze.md | tak | 1,5–2 h i 30 min bez zmian |
| 9 | DRO-PIZ-002 | presety-drozdze.md | tak | „co najmniej 12, najwyżej 24” — granice bez zmian; 45–60 min bez zmian |
| 10 | FER-Q10-002 | doktor-ratunek.md, fermentacja-temperatura.md | tak | „około 2/3 razy” i zakres 20–26 °C zostały; „prosta zasada” / „to przybliżenie” zachowuje charakter przybliżenia (uwaga: w doktor-ratunek słowo „działa” lekko wzmacnia, P2, bez poprawki) |
| 11 | KOS-OPR-001 | koszyk-oproszanie.md | tak | „cienka, ale dokładna” ≈ „light but thorough”; każda mąka — jak cytat |
| 12 | KOS-OPR-002 | koszyk-oproszanie.md | tak | „lepiej oddziela” ≈ „more noticeable barrier”; semolina, mąka ryżowa zostały |
| 13 | KRO-POC-002 | po-co-ten-krok.md, zaczyny.md | tak | 6–8 h, podwojenie, pęcherzyki bez zmian |
| 14 | KRO-POC-003 | doktor-chleba.md, po-co-ten-krok.md | tak | trzy skutki autolizy jak cytat |
| 15 | KRO-POC-004 | po-co-ten-krok.md | tak | gluten zatrzymuje gaz z drożdży — jak cytat |
| 16 | KRO-POC-005 | po-co-ten-krok.md | tak | kwasy: smak i siła; CO₂: objętość — jak cytat |
| 17 | KRO-POC-006 | doktor-chleba.md, doktor-ratunek.md, po-co-ten-krok.md | tak | składanie wzmacnia; 100% żyta „zwykle można pominąć” = „likely skip” |
| 18 | KRO-POC-007 | po-co-ten-krok.md | tak | „ogólny kształt, bez wykańczania” = „basic shape, without refining” |
| 19 | KRO-POC-008 | po-co-ten-krok.md | tak | dotyk napina, odpoczynek rozluźnia — jak cytat |
| 20 | KRO-POC-009 | po-co-ten-krok.md | tak | podtrzymuje i kształtuje — jak cytat |
| 21 | KRO-POC-010 | doktor-chleba.md, po-co-ten-krok.md | tak | chłód spowalnia, wolniej = głębszy smak — jak cytat |
| 22 | KRO-POC-011 | doktor-chleba.md, kalendarz-m0.md, po-co-ten-krok.md | tak | pusty garnek ok. 30 min, para — jak cytat |
| 23 | KRO-POC-012 | po-co-ten-krok.md | tak | nacięcie wyznacza miejsce rozszerzania — jak cytat |
| 24 | KRO-POC-013 | doktor-chleba.md, po-co-ten-krok.md | tak | para trzyma skórkę miękką, bochenek rośnie — jak cytat |
| 25 | KRO-POC-014 | doktor-chleba.md, po-co-ten-krok.md | tak | „porządnie się zrumieni” = „browns fully” |
| 26 | KRO-POC-015 | doktor-chleba.md, po-co-ten-krok.md | tak | oddaje wilgoć, miękisz się ustala, gumowaty — jak cytat |
| 27 | KWA-CZA-001 | doktor-chleba.md, kwasowosc-temperatura.md | tak | zmiana tylko w zdaniu sąsiednim (DIA-DDT-001); „skróć fermentację” bez zmian |
| 28 | MAK-OGL-002 | maki-ogolne.md | **nie** → poprawione | „około 9,8%” / „zwykle 10,6–14,3%” podaje 1 próbkę na typ jako wartość typową; rejestr: „wynik badanych próbek, nie wymaganie” (TRE-03, P2) → „np.” |
| 29 | MAK-OGL-003 | maki-ogolne.md | **nie** → poprawione | jak MAK-OGL-002 (jedna próbka handlowa na typ) → „np.” |
| 30 | MAK-OGL-004 | maki-ogolne.md | tak | zakresy popiołu bez zmian; „według polskich norm” wypadło, ale wpis dotyczy polskiego typu (nagłówek z numerem typu), więc zakres jurysdykcji czytelny |
| 31 | MAK-OGL-006 | maki-ogolne.md | **nie** → poprawione | jak MAK-OGL-002 (jedna próbka z jednego młyna) → „np.” |
| 32 | MAK-TYP-001 | maki-typy.md | tak | „typ mówi, ile jest popiołu” — kierunkowo jak zakres normy (typy według popiołu); uproszczenie bez nazwy normy |
| 33 | MAK-TYP-002 | maki-typy.md | tak | jak MAK-TYP-001 (mąka żytnia) |
| 34 | MAK-TYP-003 | maki-typy.md | tak | „każdy młyn robi go po swojemu” = „według specyfikacji danego młyna”; poza normą — jak cytat |
| 35 | PIE-ZAJ-001 | kalendarz-m0.md | tak | kamień ok. 60 min bez zmian |
| 36 | PIE-ZAJ-002 | kalendarz-m0.md | tak | grupowanie wypieków z powodu długiego nagrzewania — jak cytat |
| 37 | POL-SMA-001 | lekcja-5-bagietka.md | tak | orzechowy smak, rozciągliwość — jak cytat |
| 38 | RAT-PRZ-001 | doktor-ratunek.md | tak | wgłębienie zostaje przy przerośnięciu — jak cytat |
| 39 | RAT-PRZ-002 | doktor-ratunek.md | tak | opada w piecu, nadal smakuje — jak twierdzenie |
| 40 | RAT-PRZ-004 | doktor-ratunek.md | tak | warunek „w ciągu kilku godzin” i skutki nocnego garowania zachowane |
| 41 | RAT-PRZ-005 | doktor-ratunek.md | tak | „najczęściej zawodzi” ≈ „generally doesn’t work” |
| 42 | RAT-PRZ-006 | doktor-ratunek.md | tak | osłabiony gluten i za dużo gazu — jak cytat |
| 43 | RAT-SOL-001 | doktor-ratunek.md | tak | lepkie i luźne, sól wiąże wilgoć i napina gluten — jak cytat |
| 44 | RAT-SOL-002 | doktor-ratunek.md | tak | szybciej rośnie, mniej smaku, słabsza struktura — jak cytat |
| 45 | RAT-SOL-004 | doktor-ratunek.md | tak | 20–60 min bez zmian |
| 46 | RAT-SOL-005 | doktor-ratunek.md | tak | dodanie soli nie pomoże, ponowne wyrabianie psuje — jak cytat |
| 47 | RAT-ZIM-001 | doktor-ratunek.md | tak | „często winne jest chłodne miejsce” = „often it’s the environment” |
| 48 | RAT-ZIM-002 | doktor-ratunek.md | tak | ok. 24–25,5 °C bez zmian |
| 49 | RAT-ZIM-003 | doktor-ratunek.md | tak | wierzch lodówki, wysoka półka, ciepło idzie do góry — jak cytat |
| 50 | RAT-ZIM-004 | doktor-ratunek.md | tak | wilgoć trzyma wierzch miękki, pomaga rosnąć — jak cytat |
| 51 | RAT-ZIM-005 | doktor-ratunek.md | tak | w chłodzie dłużej, czasy to wskazówka — jak twierdzenie |
| 52 | ZAC-BIG-001 | zaczyny.md | tak | 18 h, ok. 15,6 °C bez zmian (definicja BBGA = biga aplikacji 50%, 1%) |
| 53 | ZAC-CZA-001 | zaczyny.md | tak | 8 h / 14–16 h bez zmian |
| 54 | ZAC-PAT-001 | zaczyny.md | tak | „co najmniej 3 h”, „najwyżej 3 dni” — granice bez zmian |
| 55 | ZAK-DOK-001 | doktor-zakwasu.md | tak | „postawić na nogi” = „restore”; seria dokarmień zachowana |
| 56 | ZAK-LOD-001 | zakwas-z-lodowki.md | tak | równe części wagowe, do 12 h — jak cytat |
| 57 | ZAK-LOD-002 | zakwas-z-lodowki.md | tak | co 12 h, 6–8 h, podwojenie/potrojenie bez zmian |
| 58 | ZAK-LOD-003 | kalendarz-m0.md, zakwas-z-lodowki.md | tak | rzadziej dokarmiany = dłużej — jak cytat |
| 59 | ZAK-LOD-004 | doktor-zakwasu.md | tak | gruba warstwa płynu, ospały — jak cytat |
| 60 | ZAK-LOD-005 | kalendarz-m0.md | tak | 1–2 h, w chłodzie bliżej 2 h bez zmian |
| 61 | ZAK-LOD-006 | kalendarz-m0.md | tak | nie co do godziny — kierunek jak uproszczenie |
| 62 | ZAK-LOD-007 | kalendarz-m0.md | tak | „prawie na pewno”, co 12 h — jak cytat; „dojdzie do siebie” zamiast „zdrowy” (DEC-10) |
| 63 | ZAK-SZC-002 | zakwas-szczyt.md | **nie** → poprawione | „ciasto może rosnąć od 0,1 do 1,5 mm na godzinę” podaje wynik z probówek (te same warunki, 40 zakwasów) jako ogólną prędkość ciasta (TRE-03, P2) → „w tych samych warunkach ciasto z różnymi zakwasami rosło …” |
| 64 | ZAK-ZAL-002 | zakwas-od-zera.md | tak | równe wagi, 113 g jako przykład bez zmian |
| 65 | ZAK-ZAL-003 | doktor-zakwasu.md, zakwas-od-zera.md | tak | „możesz nie zobaczyć żadnej aktywności”, dokarm i tak — jak cytat |
| 66 | ZAK-ZAL-004 | zakwas-od-zera.md | tak | dzień 3: pęcherzyki, zapach, wzrost — jak cytat |
| 67 | ZAK-ZAL-006 | zakwas-od-zera.md | tak | „co najmniej podwoić”, przyjemnie kwaśny — jak cytat |
| 68 | ZAK-ZAL-007 | doktor-zakwasu.md, zakwas-od-zera.md | tak | 7 dni może nie wystarczyć, kilka tygodni, 6–8 h — bez zmian |
| 69 | ZAK-ZAL-009 | zakwas-od-zera.md | tak | poniżej 20 °C, cieplejsze miejsce — granica bez zmian |
| 70 | ZAK-ZAL-010 | doktor-zakwasu.md, zakwas-od-zera.md | tak | dzikie drożdże częściej w pełnoziarnistej, jasna wolniej — jak cytat |
| 71 | ZAK-ZAL-012 | kalendarz-m0.md, zakwas-od-zera.md, zakwas-z-lodowki.md | tak | tylko EN: „gets fed” zamiast „is fed” |
| 72 | ZYT-STU-001 | chleb-zytni-etapy.md, chleb-zytni-studzenie.md, doktor-chleba.md | tak | „najlepiej pokroić po 24 h” = „for best quality”, nie minimum |

### Dowód czerwieni (zapis weryfikacji z cytatem) i poprawka

Skrypt `kontrole-tresci` przed i po: `0 błędów, 0 uwag` — błąd zakresu nie jest mechaniczny (liczby się zgadzają), więc czerwień to zapis weryfikacji:

| ID | Zdanie po T2 (przed poprawką) | Rejestr (zakres) | Po poprawce |
|---|---|---|---|
| MAK-OGL-002/003/006 | „Mąka niskowyciągowa. Białko: około 9,8%.”, „… Białko: zwykle 10,6–14,3%.” (13 opisów, `src/core/flour-atlas-ogolne.ts`) | `uproszczenie`: „Jedna próbka na typ, jeden producent … to wynik badanych próbek, nie wymaganie.”; komentarz kodu: „Białko to wynik badanych próbek handlowych (jedna do trzech próbek na typ), nie wymaganie; opis to mówi.” | „Białko: np. 9,8%.”, „Białko: np. 10,6–14,3%.” / EN „Protein: e.g. …” |
| ZAK-SZC-002 | „Okno szczytu to tylko szacunek: każdy zakwas pracuje w swoim tempie, a ciasto może rosnąć od 0,1 do 1,5 mm na godzinę.” | `uproszczenie`: „Źródło mierzy tempo rośnięcia ciasta w probówkach, nie czas do szczytu zakwasu w słoiku”; cytat: „wide variation in functional capacities across the 40 starters … Dough rise rates ranged from 0.1 to 1.5 mm/hr.” | „…, a w tych samych warunkach ciasto z różnymi zakwasami rosło od 0,1 do 1,5 mm na godzinę.” |

Pliki: kod (`flour-atlas-ogolne.ts`, `sourdough-physics.ts`), EN (`czesc-17.ts`, `czesc-4.ts`), `docs/tresci/pl|en` (`maki-ogolne.md`, `zakwas-szczyt.md`), `pl.kontekst.json`, 33 słowniki (462 wpisy starych kluczy usunięte), `czeka-na-przeklad.json` (+14), rejestr (`uproszczenie` 4 twierdzeń), testy `przeklad-a5d` (nazwana lista 14 kluczy zastąpionych) i `czeka-na-przeklad-093` (wyjątek „noc / D-125”), do przeglądu roli 07.

### Atrybucja szczebla 4 (wynik przeglądu, wyjątek nazwany D-125)

Hierarchia (`docs/tresci/hierarchia.md`) wymagała przy szczeblu 4 „atrybucji w treści”; T2 usunęło „według …” z 66 z 72 twierdzeń, w tym z 57 opartych na źródle szczebla 4 (King Arthur Baking, Modernist Cuisine). Sprawdzenie pokrycia ekranu „Źródła wiedzy”: 118 twierdzeń użytych w `docs/tresci/pl`, 26 adresów na ekranie, brak źródła bez wpisu (BBGA przez web.archive.org = `bbga.org`). Zapis wyjątku w `hierarchia.md`; notatki `uproszczenie` 9 twierdzeń („atrybucja w treści”) zaktualizowane.

## D-123-ODST (D-126)

| Odstępstwo roli 08 | Werdykt roli 06 | Uzasadnienie |
|---|---|---|
| „Bezpieczeństwo w kuchni” (EN „Kitchen safety”) | przyjęte | grupa: pleśń (USDA FSIS), surowa mąka (FDA), oparzenia (4 ośrodki) |
| „Zakwas” z istniejącym kluczem (EN „Sourdough”) | przyjęte | źródła grupy dotyczą zakwasu i fermentacji na zakwasie |
| Nazwy źródeł po angielsku („et al.”) | przyjęte | tytuły nie są tłumaczone (polskie i niemieckie w oryginale + opis EN), więc nie powstają nieistniejące tytuły |
| Teksty wejścia ekranu | przyjęte | „Skąd pochodzą porady, liczby i ostrzeżenia…” prawdziwe: ekran pokrywa wszystkie źródła (wyżej) |
| EN amerykański | przyjęte + poprawka | 10 tekstów EN po T2 z pisownią brytyjską: „flavour” 5 (w tym pole lekcji 5), „centre” 4, „cling film” 1 → US; ZAK-PLE-004 „colour” (krytyczne) zostaje — krok właściciela |

## Nowe znaleziska (nie naprawiane w tym trybie)

### 06-tresci-noc-001 · Wstęp ekranu „Źródła wiedzy” nazywa poradniki „sprawdzonymi”
- Pozycja listy kontrolnej: TRE-08 · Poziom: P2 · Realność: realny · Pewność: średnia · Rodzaj: M
- Dowód: `src/core/zrodla-wiedzy.ts:24-25` „Nasze porady opierają się na sprawdzonych poradnikach piekarskich”; EN „trusted baking guides”. Część źródeł to szczebel 4 (przewodnik), którego nikt nie „sprawdzał” w sensie weryfikacji.
- Opcje: (a) „na poradnikach piekarskich” bez przymiotnika — prościej, bez oceny; (b) zostawić (ton marki, rola 04). Rekomendacja: (a), decyzja formy z rolą 04.
- Status: otwarte

### 06-tresci-noc-002 · „Fuzzy growth of any colour” w treści krytycznej po brytyjsku
- Pozycja: SP-11 (forma, rola 04) przy TRE-10 · Poziom: P2 · Realność: realny · Rodzaj: M
- Dowód: `docs/tresci/en/zakwas-bezpieczenstwo.md:23` „Fuzzy growth of any colour, including white [T:ZAK-PLE-004]”; zmiana unieważnia `przeglad.sha` ZAK-PLE-004.
- Opcje: (a) „color” z ponownym przeglądem właściciela (jedno zdanie, sens bez zmian); (b) zostawić do najbliższego przeglądu krytycznych. Rekomendacja: (a) przy następnym przeglądzie.
- Status: otwarte (krok właściciela)

## Dowody wykonania

| ID | Commit | Przed | Po |
|---|---|---|---|
| T2-NIEKRYT | 3cbd292 | zapis weryfikacji (tabela wyżej); `kontrole-tresci` 0 błędów (błąd zakresu nie jest mechaniczny) | `kontrole-tresci` 0 błędów, 0 uwag; `--skroty` krytycznych bez zmian |
| D-123-ODST | 6618f35 | pierwszy `npm run verify`: kod 1, `tresci-069` (POL-SMA-001: pole EN lekcji 5 „flavour” ≠ docs „flavor”) i `czeka-na-przeklad-093` (kolejka niepusta) | oba zielone po poprawce pola lekcji 5 i nazwanym wyjątku „noc / D-125” |

- `node scripts/kontrole-tresci.mjs docs/tresci/rejestr.json docs/tresci/pl docs/tresci/en` → `0 błędów, 0 uwag`, kod 0.
- `npm run verify` (TMPDIR w scratchpadzie) → kod 0: typecheck, i18n (błędy: 0, uwagi: 145), macierz 1502/1502, 512 zestawów, 5565 testów.
- Zrzuty przed/po: nie robione (zmiana tekstów; brzmienie w tabeli i w diffie).
- Przegląd ścieżek wrażliwych: nie dotyczy (bez migracji, kopii, importu, zakupów, workflowów).

## Kroki właściciela i polecenia dla ról

1. Weto lub akceptacja D-125 i D-126 (noc).
2. Przebieg przekładu dla 14 kluczy z `docs/lokalizacja/czeka-na-przeklad.json` (do tego czasu 33 języki pokazują te teksty po angielsku); po nim usunąć wyjątki z `tests/przeklad-a5d.test.ts` i `tests/czeka-na-przeklad-093.test.ts`.
3. ZAK-PLE-004 „colour” → „color” przy następnym przeglądzie twierdzeń krytycznych (06-tresci-noc-002).
4. Rola 04: forma odstępstw D-123 i przymiotnik „sprawdzonych” we wstępie ekranu (06-tresci-noc-001). Rola 07: przegląd dwóch nazwanych wyjątków w testach.
5. Status „zweryfikowane” nadaje reaudit (inny weryfikator, z ponownym odczytem źródeł).

# Stan sztafety
Ścieżka: naprawa po audycie M1 (sztafeta 01 → 02 sesja 2 → 03 → 04 build przed partią 5) · Aktualizacja: 2026-10-22 (rola 02, model D-112/D-113)

| Rola | Tryb | Stan | Commit | Artefakty | Otwarte decyzje |
|---|---|---|---|---|---|
| 01 Odkrywanie | build | zakończona 2026-10-19 | gałąź `claude/01-odkrywanie-2026-10-19-279a7f` (E3: 3df4758; E4: commit z tym plikiem) | `docs/brd/`, `docs/zalozenia.md`, `docs/decyzje.md` (D-035…D-037), `tests/wektory/brd.json` | OP o statusie [DO WYJAŚNIENIA] w `docs/brd/README.md`; sekcja „Stan projektu” w `CLAUDE.md` dodana za zgodą właściciela (f140e45), pola [DO USTALENIA]: liczba testerów, standard marki |
| 02 Monetyzacja | build, sesja 2 | zakończona 2026-10-19 | gałąź `claude/wizardly-sammet-81a68b` (E0 f5a78cb, E1 cbba5aa, E2 47a5aac, E3 1f211bb; przekazanie: commit z tym wpisem) | `docs/monetyzacja.md`, `docs/monetyzacja/rachunek.mjs`, `rachunek.json`, `rachunek-us.json`, `docs/decyzje.md` (D-038, D-039), `docs/zalozenia.md` (ZAL-038, -042, -044, -049, -050) | OP-M01 (Paid Apps, Small Business Program: właściciel), OP-M03 (pola `expo-iap`: 05/08) |
| 02 Monetyzacja (badanie zmiany modelu, D-110) | build | zakończona 2026-10-22 (E3), czeka na kroki właściciela i tor napraw | gałąź `monetyzacja/piekarz-2026-10-22` (D-110 91937fb, E0 cb2ddb2, E1 66d230c, E2 49c51c5, E2c be9266b, D-112 a3a18dc, D-113 cf0c845; E3: commit z tym wpisem) | `docs/monetyzacja.md` (kontrakt D-112/D-113; poprzedni w `docs/archiwum/monetyzacja-d038-2026-10-19.md`), `docs/monetyzacja-badanie-2026-10.md`, `docs/monetyzacja/rachunek-badanie-us.json`, `limit.mjs`, `wektory-limitu.json` (wariant odrzucony, wzór dla portfela), `docs/decyzje.md` (D-110…D-113) | ER do 01 (BR-ZAK-004, -005, BR-KAL-006, BR-ZAKW-004); rytm „ongoing value” Pro (03); ekran Pro (04); aneks ADR-007 (05); zmiany kodu i testów kontraktu (08); usunięcie oferty wprowadzającej w ASC (M1 za zgodą) |
| 03 Zakres | build | zakończona 2026-10-20 | gałąź `claude/03-zakres-2026-10-19-7a0b8a` (E0 20d8083, E1 d4cebc5, E2 fff601c, b5cc7ee, E3 ffa162d, D-044 3b9da9d; scalenia roli 01: 36d0d47, b5d9b5d; przekazanie: commit z tym wpisem) | `docs/scope-contract.md`, `docs/zakres-wplyw-na-plan.md`, `docs/decyzje.md` (D-040, D-041, D-043, D-044), `docs/zalozenia.md` (ZAL-045), archiwum `docs/archiwum/scope-contract-2.0.md`, `docs/archiwum/scope-contract-2026-10-20-robocze.md` | ER-49 (rola 01); wyniki intuicyjności (rola 04) |
| 01 Odkrywanie (jedna funkcja: kalendarz tygodnia na „Dziś”) | build | badanie zakończone 2026-10-22, czeka na decyzję zakresu | gałąź `badanie/piekarz-kalendarz-2026-10-22` | `docs/brd/wymagania-kalendarz.md`, dopiski w `docs/brd/` (J-13, J-14, P-9…P-12, OG-08…12, H-15…20, RYZ-22…26, BR-ETAP-006, S-65…95, RD-32…34, OP-50…60, ER-62…ER-70; F-71: J-15, BR-DIAG-003…005, RD-35, RD-36, ZM-23, D-096), `docs/zalozenia.md` (ZAL-051…059), `docs/decyzje.md` (D-090), `tests/wektory/brd.json` (112 wektorów), `scripts/br-wyjatki.json` (BR-KAL-001…016, BR-ETAP-006); raport poza repo `audit/01-kalendarz-2026-10-22/` | H-15 (zakres 1.0, rekomendacja (b+): rola 03 i właściciel przez M1), OP-51, OP-52, OP-54, OP-55, OP-57; makiety: M3 Redesigner |
| 08 Programista (M3 P-a: logika Basic/Pro) | build | zakończona 2026-10-22, czeka na P-b (ekran Pro, oznaczenia, D-117) | gałąź `redesign/piekarz-2026-10-22` (commit „[M3 P-a]”) | `src/lib/platnosci/` (konfiguracja: BASIC, LIMITY_BASIC, Funkcja Pro; uprzedzenie końca Pro), `src/lib/limity-basic.ts`, strażniki w ekranach, `docs/monetyzacja/basic-1.0.json`, `docs/decyzje.md` (D-116, notka D-104), `docs/wzrost/hipotezy.json` (H-01); dowody `audit/M3-2026-10-22/dowody/pa-*.txt` | P-b: ekran Pro (ujawnienia 1–5), „Pro” zamiast kłódki, gratulacje po założeniu zakwasu, akceptacja tekstów uprzedzenia (04); rola 10: PNG ramek 2–4 i 6, §4 instrukcji ustawień, opis sklepu (Z-8); rola 01: BR-ZAK-004, -005, BR-KAL-006, BR-ZAKW-004 (Z-6) |
| 04 Studio Projektowe | build | zakończona 2026-10-20 | gałąź `claude/04-projekt-2026-10-20-088299` (E0 f404056, d87b8dd; E1 b74287f; E2 383cd37, ca56088, 07f387f, 9585ec4; E3 7e40ad1, 5e4a792; E4: commit z tym wpisem) | `docs/design/` (00…04, design-spec, tokeny.json/ts, kontrast.md, ekrany/, wzorce-zrzuty/, kierunki/, porownanie, kroje, pomiar-jezykow), `docs/decyzje.md` (D-045…D-051) | ZM F-38 (rola 03); tekst wiersza PR-12 (rola 02, D-047) |

## Definicja ukończenia roli 01 (build), z dowodem

| Punkt | Dowód |
|---|---|
| Każdy [FAKT] ma źródło S przeczytane w dniu pracy; reszta w OP | 7 znaczników [FAKT] w BRD, każdy z S odczytanym 2026-10-19 (`docs/brd/zrodla.md`); cytaty sprawdzone dosłownie skryptem w surowych plikach poza S-42 i S-61 (oznaczone „niesprawdzone dosłownie”); wyjątek D-037: wytyczne App Store i ceny z odczytu innych ról tego samego dnia |
| Pytania produktowe pojedynczo, z opcjami; odpowiedzi dosłownie z datą; sprawy merytoryczne hierarchią źródeł | wywiad 5 pytań, tabela w `docs/brd/odkrywanie.md`; D-036, D-037 ze słowami właściciela; hierarchia D-035 (merytoryczna) |
| Reguła RD: wzór, jednostki, granica, podstawa, ≥ 3 wektory z granicą i obiema stronami; krytyczne tylko ze szczebla 1–3, oznaczone dla 06 | 14 reguł, 77 wektorów (`docs/brd/reguly.md`); reguły jakościowe RD-21…RD-23 mają „Granica: brak” (nazwane) i wektor błędu; krytyczne RD-21, RD-22, RD-23 ze szczebla 1 i 3; `kontrola-brd.mjs` sprawdza szczebel |
| BR wynika z PR, PR z J; scenariusz główny z obserwowalnym wynikiem; liczby ze źródła, decyzji albo OP; NFR mierzalne | 50 BR, 17 PR, 11 J; `kontrola-brd.mjs docs/brd docs/zalozenia.md` bez `--szkic`: 0 błędów, 0 uwag, kod 0 (2026-10-19) |
| OG z polityk użytych w przepływach przypisane do wymagań | OG-01, OG-02, OG-03 → BR-ZAK-001; OG-04 → BR-UST-003; OG-05 → BR-CZAS-002; OG-06 → H-09 (podział, bez przepływu) |
| Cena, zakres MVP i podział tylko jako H | H-03…H-14; BRD nie ma etykiety MVP ani ceny własnej |
| Kontrola z kodem 0; BRD w miejscu z `CLAUDE.md`; w publicznym repo bez danych rozmówców i cudzych materiałów | wynik wyżej; BRD w `docs/brd/` (`CLAUDE.md` nie wskazuje innego miejsca); rozmów z użytkownikami nie było (D-036); cytaty recenzji ≤ 1 zdanie, surowe pobrania tylko w `audit/01-odkrywanie-build-2026-10-19/` poza gitem |
| Nie sprawdzone | `npm test` nie uruchomiony: w worktree brak `node_modules`, a `npm ci` pobiera paczki z sieci; zmiana nie dotyka kodu, a żaden test nie czyta przeniesionych plików BRD (`git grep "docs/brd" -- tests src` → tylko `docs/brd/fixtures/`, który został) |

### Przekazanie do następnej roli
- Zakończono: 01-odkrywanie, tryb build, gałąź `claude/01-odkrywanie-2026-10-19-279a7f`; artefakty: `docs/brd/` (README, odkrywanie, wymagania, wymagania-liczenie, -wypiek, -zakwas, -dziennik, -dane, reguly, zrodla, errata), `docs/zalozenia.md` (ZAL-029…ZAL-048), `docs/decyzje.md` (D-035…D-037), `tests/wektory/brd.json` (77 wektorów).
- Następny krok: **02-monetyzacja**, tryb `build`, sesja 2 (model i kontrakt płatności); nowa sesja w worktree z tej gałęzi; opus, wysiłek high.
- Polecenie: `audit/M1-2026-10-19/M1-2026-10-19/prompty/02-monetyzacja-build-sesja2.md` (złożone `node tools/assemble.mjs 02-monetyzacja --tryb build` w repo prompts); brief: `prompty/sztafeta-01-04-start.md`, sekcja 02.
- Paczka wejściowa dla 02: H-03 (przejrzystość opłat), H-04 („tylko historia” po próbie), H-05 (za co płacą), H-07 (zakwas a 14 dni próby), H-14 (wskaźnik sukcesu z App Store Connect); tabela rynku z cenami (`docs/brd/odkrywanie.md`, S-28, odczyt roli 02); OG-01…OG-03; BR-ZAK-001, BR-ZAK-003…005, BR-DANE-003, BR-DANE-004; ZP-18, ZP-21; OP-33, OP-47, OP-48. DEC-01 (d) i D-033 nie są otwierane; H-04 i H-07 to uwagi z opcjami.
- Paczka dla 03: 50 BR z przepływami i dowodem (ER-35, ER-36 — co przeniesione, co nowe), BR nieprzeniesione z powodem (ER-37, ER-38), hipotezy zakresu H-06, H-08, H-10, H-11, H-12, H-13, propozycja podziału H-09 (rekomendacja: jedna aplikacja), blokery wydania (`docs/brd/README.md`), OP-35, OP-38, OP-41, OP-45. Kontrakt `docs/scope-contract.md` odwołuje się do archiwalnych plików BRD (ER-34) i do budowy od nowa.
- Dla 06 (później): reguły RD-14…RD-27 i źródła S-36…S-61 do rejestru twierdzeń; reguły krytyczne RD-21, RD-22, RD-23 do przeglądu człowieka; rozbieżności ER-42; OP-34, OP-36, OP-37, OP-39, OP-40, OP-44, OP-46. Po weryfikacji rejestr 06 ma pierwszeństwo, a rozbieżność poprawia ER w BRD.
- Dla 05: OP-32, OP-41, OP-42, OP-43; RYZ-12 (kopie tylko na telefonie); H-11 (synchronizacja a zakaz sieci).
- Dla 07 i 08: `tests/wektory/brd.json` tylko do odczytu (zmiana przez ER do roli 01); ER-35, ER-39 (ID w testach spoza BRD), ER-42; blokery wydania.
- Dla właściciela: (1) uzupełnić w `CLAUDE.md` liczbę testerów TestFlight i standard marki; (2) test na urządzeniu: sygnał kroku przy ekranie zablokowanym 30 min i powrót do trwającego wypieku po zamknięciu aplikacji (NFR-CZAS-001, BR-ETAP-005); (3) opcjonalnie 2–3 rozmowy z piekarzami jako sprawdzenie ZAL (D-036); (4) przy scalaniu: numery D-035…D-037 mogą się zderzyć z wpisami partii 3 w `docs/DECISIONS.md`.
- Otwarte decyzje: OP o statusie [DO WYJAŚNIENIA] w `docs/brd/README.md`, każdy z rolą, która przyniesie opcje.

## Rola 02 Monetyzacja (build, sesja 2): definicja ukończenia
Punkt po punkcie z dowodem: `docs/monetyzacja.md`, sekcja „Definicja ukończenia”. `rachunek.mjs` z kodem 0 dla `rachunek.json` (PL) i `rachunek-us.json` (US). Nie sprawdzone: `npm test` (worktree bez `node_modules`, zmiana tylko w `docs/`), testy na urządzeniu (krok właściciela).

### Przekazanie do następnej roli
- Zakończono: 02-monetyzacja, tryb build, sesja 2 (model i kontrakt płatności), gałąź `claude/wizardly-sammet-81a68b` (od 0eefab1 roli 01); artefakty: `docs/monetyzacja.md`, `docs/monetyzacja/rachunek.mjs`, `docs/monetyzacja/rachunek.json`, `docs/monetyzacja/rachunek-us.json`, `docs/decyzje.md` (D-038, D-039), `docs/zalozenia.md`.
- **Model jest stały (D-038).** Żadna rola ani audyt nie daje opcji ani rekomendacji zmiany cen (0,99 / 6,99 / 14,99 USD; 4,99 / 29,99 / 79,99 zł), modelu, 14 dni próby ani podziału „po próbie tylko historia i dane”. Ryzyka tylko do pomiaru w eksperymencie. *Dlaczego:* właściciel zatwierdza rekomendacje hurtowo.
- Następny krok ścieżki: **03-zakres Zakres i kontrakt MVP**, tryb `build`; nowa sesja w worktree z gałęzi `claude/wizardly-sammet-81a68b`; opus, wysiłek high.
  - Polecenie: `audit/M1-2026-10-19/M1-2026-10-19/prompty/03-zakres-build.md` (złożone `node tools/assemble.mjs 03-zakres --tryb build`, `.\Get-Prompt.ps1 03-zakres -Tryb build -CopyToClipboard` w repo prompts); brief: `prompty/sztafeta-01-04-start.md`, sekcja 03.
- Paczka wejściowa:
  - **03:** tabela „Wartość funkcji” (50 BR, WTP z poziomem dowodu); WTP-X: BR-KALK-008 (masa lodu), BR-ETAP-003 (ocena gotowości ciasta); podział darmowe/płatne = D-038 (bez zmian); warunek 3.1.2(a): plan regularnych aktualizacji z treścią (zakres i rytm ustala 03); BRD i H od roli 01 jak wyżej.
  - **04:** sekcja „Kontrakt płatności”: tabela przepływów (co widzi użytkownik bez dostępu), 8 ujawnień, zakazane wzorce, uprzedzenie 3 dni i stan „tylko historia” (PR-16), oferta przy pierwszym użyciu funkcji (PR-12).
  - **05:** „Szkic aneksu do ADR-007” (licencja MIT, Family Sharing, wymagania danych z D-039, prywatność), OP-M03.
  - **07:** wektory dostępu, lista „Tylko na telefonie”, kryterium eksperymentu (≥ 7 nowych płacących albo ≥ 42 USD/mies. na iOS w dniach 30–90).
  - **08:** kontrakt i `src/lib/platnosci/` jako wzorzec; rozbieżność: import tylko z dostępem (`app/(tabs)/index.tsx:497`) wobec D-039; dokończenie wypieku i uprzedzenie 3 dni do sprawdzenia w kodzie.
  - **01 (errata):** OP-33 rozstrzygnięte (ZAL-038), OP-47 (3 dni) i OP-48 (wypiek do końca) rozstrzygnięte w D-039 — do wpisania w `docs/brd/README.md` i BR-ZAK-004.
  - **M1 (plan napraw):** `eksperyment.kryterium_do_przeliczenia` → kryterium z `docs/monetyzacja.md` („Kryterium eksperymentu”); zadania M1-audytor-generalny-009, -026, -027 dotyka D-039.
  - **Właściciel, App Store Connect:** umowa Paid Apps, dane podatkowe i bank, zapis do Small Business Program (OP-M01); grupa „Piekarz Pro” z dwiema subskrypcjami i Non-Consumable o ID z `src/lib/platnosci/konfiguracja.ts`; ceny z D-038 (pozostałe kraje: `wariant-a-wlasciciel.json`); oferta wprowadzająca Free Trial 2 tygodnie na obu subskrypcjach we wszystkich krajach; Family Sharing na trzech produktach (nieodwracalne); opis sklepu i zrzuty mówią o subskrypcji z próbą; po ustawieniu cen wpis `wplyw_z_asc` w `rachunek.json`; konto testowe sandboksu.
- Otwarte decyzje: OP-M01 (właściciel), OP-M03 (05/08). Ryzyko przy scalaniu: numery D-038, D-039 mogą zderzyć się z wpisami partii 3 (`docs/DECISIONS.md` na gałęzi p3); przy konflikcie przenumerować jawnie.

## Rola 03 Zakres (build): definicja ukończenia
Punkt po punkcie z dowodem: `docs/scope-contract.md`, sekcja „Definicja ukończenia (build), z dowodem”. `zakres.mjs docs/scope-contract.md --brd docs/brd --apetyt 60`: 44 funkcje (MVP 36, PÓŹNIEJ 6, TEST 1, NIE 1), 55 BR, 0 błędów, 5 uwag (MVP ponad 60 h, przyjęte w D-043), kod 0 (2026-10-20). Nie sprawdzone: `npm test` (worktree bez `node_modules`; zmiany tylko w `docs/`; 12 wierszy KL czytanych przez `tests/kontrakt-lista-odciec.test.ts` zachowane), przejście poznawcze na prototypie (rola 04).

### Przekazanie do następnej roli
- Zakończono: 03-zakres, tryb build, gałąź `claude/03-zakres-2026-10-19-7a0b8a` (od eb37122 roli 02, z gałęzią roli 01 do c5be86c); artefakty: `docs/scope-contract.md` (kontrakt, wariant B), `docs/zakres-wplyw-na-plan.md` (ID zadań M1), `docs/decyzje.md` (D-040 apetyt 60 h, D-041, D-043 zakres, D-044 jednostki), `docs/zalozenia.md` (ZAL-045 podważone w części).
- Następny krok ścieżki: **04-studio-projektowe Studio Projektowe (UX, marka, przepływy)**, tryb `build`; nowa sesja w worktree z gałęzi `claude/03-zakres-2026-10-19-7a0b8a`; opus, wysiłek high.
- Polecenie:
  - `audit/M1-2026-10-19/M1-2026-10-19/prompty/04-studio-projektowe-build.md` (brief: `prompty/sztafeta-01-04-start.md`, sekcja 04)
  - `node tools/assemble.mjs 04-studio-projektowe --tryb build`
  - `.\Get-Prompt.ps1 04-studio-projektowe -Tryb build -CopyToClipboard`
- Paczka wejściowa:
  - **04:** `docs/scope-contract.md` — tabela „Zakres” (kolumna „Intuicyjność”: kryteria do przejścia poznawczego; wynik wraca jako `wynik: <pozytywny|negatywny>, <data, plik>` przez bramkę „Zmiany zakresu”), „NIE robimy” i funkcje PÓŹNIEJ (nie projektować: F-30, F-63, F-45, F-08, F-50, F-70, F-53, F-46…F-49, F-52; F-15 tylko prototyp do testu); przepływy PR-01…PR-18 bez PR-08 z `docs/brd/wymagania.md`; start F-68 (BR-START-001, kształt H-08), Kalkulator ≤ 4 akcje główne (DEC-09 a, zadanie 057), Akademia jako „po co ten krok” przy kroku (F-44), pętla opinii F-69 (OG-07), miary USA w każdym ekranie (F-38, zadanie 096, D-044); przepływ monetyzacji z `docs/monetyzacja.md`.
  - **05:** dane, praca w tle i uprawnienia (sekcja „Kolejność i przekazanie” kontraktu); aparat znika z 1.0; OP-41 (kopia urządzenia iCloud, D-043), OP-42, OP-43.
  - **06:** treść w F-26, F-43, F-44, F-60, F-64; reguły krytyczne RD-21, RD-22, RD-23; plan aktualizacji co kwartał (3.1.2(a), D-043); OP-34, OP-36, OP-37, OP-39, OP-40, OP-46.
  - **07:** BR z kolumny „Wymagania” wierszy MVP (scenariusze w `docs/brd/wymagania-*.md`), blokery z `docs/brd/README.md`, kryteria intuicyjności do testu roli 04.
  - **08:** kolejność budowy z wyniku skryptu; zadania kodu w `docs/zakres-wplyw-na-plan.md` (ukrycie wejść F-30, F-08, F-50, F-45; usunięcie pola lodu; F-68, F-69, BR-HARMO-005, BR-ETAP-004; pełne miary USA).
  - **02:** podział bez zmian; dopisać F-68 (nawigacja) i F-69 do „zawsze, bez zakupu”; QR, druk i spiżarnia poza płatną częścią 1.0.
  - **01:** ER-49 (BR-UST-001: wejście w °F i oz, eksporty, powiadomienia, zakres 68–79 °F, domyślne jednostki według regionu z D-044).
  - **M1:** `docs/zakres-wplyw-na-plan.md` — przestawienie planu (zmienić: 026, 029, 035, 049, 066, 072, 078, 080, 081, 082, 083, 090, 093, 095, 096; nowe zadania dla 08).
- Otwarte decyzje: w zakresie brak po stronie właściciela; ER-49 (rola 01); wyniki testu pierwszego użycia (rola 04, bramka zmian).
- Ryzyko przy scalaniu: numery D-040…D-044 mogą zderzyć się z wpisami partii 3 w `docs/DECISIONS.md` na gałęzi p3; przy konflikcie przenumerować jawnie. D-043 zmienia D-029, DEC-05 a i D-034 pyt. 6a, 7b (QR, spiżarnia, druk → PÓŹNIEJ).

## Rola 04 Studio Projektowe (build): definicja ukończenia, z dowodem
| Punkt | Dowód |
|---|---|
| Każdy ekran i przycisk wynika z przepływu kontraktu | `docs/design/00-rozpoznanie.md` (PR-01…PR-18 bez PR-08); macierz stanów i słownik akcji w `design-spec.md` (rozdz. 5–6); przejście poznawcze `03-przejscie-poznawcze.md` (każdy stan → F i PR); funkcje PÓŹNIEJ/NIE bez ekranów |
| Trzy kierunki na tym samym ekranie z prawdziwą treścią; wybór dosłownie z datą | `kierunki/a-koszyk.html`, `b-sloik.html`, `c-tasma.html`, `porownanie.png`; D-049 (słowa właściciela 2026-10-20 i potwierdzenie okiem), krój D-050 (`kroje.png`) |
| Test generyczności na kartach kontrolnych, tabela na E2 | karty kontrolne `01-swiat.md` §4 (napisane przed kartami kierunków); tabela w `02-kierunki.md` i na `porownanie.png` |
| Element firmowy koduje dane ze stanu użytkownika, opis VoiceOver | spirala planu: `design-spec.md` §2 (dane, stany, wzór etykiety), makiety z `aria-label` |
| Tabela kontrastu ze skryptu, podłogi w obu motywach | `node docs/design/narzedzia/tokeny.mjs` → `kontrast.md`: 20 par × 4 warianty (jasny, ciemny, oba ze „Zwiększ kontrast”), 0 braków, kod 0 (2026-10-20) |
| Zrzuty wzorcowe 320/390/430, jasny/ciemny, domyślny i AX5, obejrzane i poprawione | `wzorce-zrzuty/` 150 plików (pl 84 + pl-kontrast 4 + en-US-imp 27 + fr 35); arkusze obejrzane; lista usterek i poprawek `04-krytyka-e3.md` (P1 pusta); przegląd `e3-przeglad.png` |
| Zero wyborów z kalibracji bez decyzji | `design-spec.md` §12 (D-042…D-051) |
| Nie sprawdzone | makiety w Chromium, nie na iPhonie (krój treści i symbole zastępcze); VoiceOver, haptyka, dźwięk, powiadomienia, Dynamic Type na urządzeniu; test 3–5 osób (opcjonalny, właściciel); `npm test` nie uruchamiany (zmiany tylko w `docs/`) |

### Przekazanie do następnej roli
- Zakończono: 04-studio-projektowe, tryb build, gałąź `claude/04-projekt-2026-10-20-088299` (od 0599da8 roli 03); artefakty w `docs/design/` (spis w `design-spec.md`), decyzje D-045…D-051 w `docs/decyzje.md`.
- Następny krok ścieżki (blok `redesign` planu M1): **partia 5 — wdrożenie nowej szaty przez rolę 08** w ramach systemu z `docs/design/` (kryteria akceptacji 050–058, 087–090, 096–104, tabela w `design-spec.md` §11); po wdrożeniu **rola 04 w trybie `audit`** porównuje ekrany z `wzorce-zrzuty/` (SP-13). Partia 5 startuje dopiero po przeglądzie właściciela.
- Paczka wejściowa:
  - **08 (partia 5):** `design-spec.md`, `tokeny.ts` (propozycja modułu motywu, np. `src/ui/theme.ts`; generowane z `tokeny.json`), kroje `docs/design/fonty/` (Sofia Sans Semi Condensed + licencja OFL; Noto Sans tylko do makiet), makiety `ekrany/*.html` (wzór spirali: `ekrany/wspolne.js`, `spirala()`, do `react-native-svg`), D-046 (`@apps4craft/ui` tylko komponenty techniczne), D-047 (oferta przy pierwszej akcji), D-051 (Cofnij, 4 zakładki, jeden wybór jednostek), formaty miar USA (§7), mapa haptyki (`tokeny.json`).
  - **05:** 4 zakładki i nawigacja (D-051), znacznik trwającego wypieku do otwarcia wprost na kroku (F-58), stan „ekran nie gaśnie” tylko w kroku czynnym, odbicie układu RTL dla ar/he (spirala) [do potwierdzenia].
  - **06:** teksty w makietach oznaczone „treść roli 06” (kroki, „po co ten krok”, objawy zakwasu i pleśni, ostrzeżenie ogólne dla kroku nieznanego rodzaju, zdanie o próbie wody); atrybucje „według King Arthur Baking”, „SDSU Extension”, „USDA FSIS” do weryfikacji w rejestrze.
  - **07:** przypadki testów: kontrast z `tokeny.ts` (zamiast `theme.ts` po wdrożeniu), formaty jednostek (§7: lb + oz, 2 miejsca < 1 oz, °F całkowite, 68–79 °F), 4 akcje receptury, ≥ 48/44/64 pt, pasek „Cofnij” i przeliczenie powiadomień (102); wynik przejścia poznawczego jako kryteria do testu pierwszego użycia.
  - **09 / zadanie 093:** pomiar długości `pomiar-jezykow.md` (fr najdłuższy łącznie, fi i de najdłuższe słowa); przekłady w `ekrany/teksty*.js` są robocze, nie do aplikacji.
  - **03:** wynik intuicyjności `03-przejscie-poznawcze.md` (`wynik: pozytywny, 2026-10-20` dla 35 funkcji, F-61 i F-15 bez wyniku); wpis ZM: kryterium F-38 „jeden wybór gramy, °C / uncje, °F” (D-051, 3a); F-68 zgodne z D-047.
  - **02:** wiersz PR-12 kontraktu płatności („pierwsza akcja z wyborem prowadzi do oferty”) dopasować do D-047 (oferta przy pierwszej akcji liczącej, planującej albo zapisującej).
  - **Właściciel:** wpis do pamięci portfolio w repo `prompts` (tekst w `design-spec.md` §13); opcjonalnie test 5-sekundowy i zadaniowy z 3–5 osobami (ok. 1 h); koszt przekładu roboczego 1,50 USD (D-048).
  - **M1:** blok `redesign` — rola 04 build zakończona; kryteria partii 5 bez zmian brzmienia, rozwiązania w `design-spec.md` §11.
- Otwarte decyzje: ZM F-38 (rola 03); tekst PR-12 (rola 02); RTL spirali (rola 05 z 04 w audycie).
- Ryzyko przy scalaniu: numery D-045…D-051 mogą zderzyć się z wpisami partii 3/4 w `docs/DECISIONS.md`; przy konflikcie przenumerować jawnie. Zrzuty wzorcowe to ok. 19 MB PNG w publicznym repo.

## Następny krok
Przegląd właściciela, potem partia 5 (rola 08) na gałęzi `claude/04-projekt-2026-10-20-088299` z paczką wyżej; po wdrożeniu rola 04 tryb `audit` wobec `docs/design/wzorce-zrzuty/`.

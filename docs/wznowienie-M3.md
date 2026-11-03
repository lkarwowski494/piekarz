# Wznowienie M3 (Redesigner): przekazanie
Aktualizacja: 2026-11-03 · Gałąź: `redesign/piekarz-2026-10-22` · Zapis w gicie, bo `.git/punkt-czyszczenia.md` i `audit/` znikają razem z kontenerem w chmurze, a na komputerze właściciela bywają nieaktualne.

## Aktualizacja 2026-11-03 ~21:50 UTC (koordynator M3, noc) — STAN BIEŻĄCY, czytaj najpierw
- p6a (`session_01T66VBwYccye3XeZdurYz7G`, zarchiwizowana) scalone do `redesign/` (merge `03843af`; verify kod 0, 526 zestawów / 5670 testów): pas Planu (D-204; d10:135, p4:160), segment „świeże / suche” przy wierszu „Do miski” (D-136, `SegmentDrozdzy.tsx`, zapis `rodzaj_drozdzy` bez zmian), przelicznik × 0,35 (D-205; 11 asercji wektorów sprawdzonych rachunkiem przez koordynatora; wyjątek BR-KALK-012 zdjęty). D-202 (noc, do weta).
- **Bloker wydania:** zdanie w arkuszu „Składniki” nadal „…odważysz 0,4 tej masy” (nowy klucz łamie `tests/czeka-na-przeklad-093`) → rola 09: PL/EN z D-202 + 33 języki.
- Znalezisko (brzegowe, kod sprzed p6a): `src/lib/rodzaj-drozdzy.ts:26` — stuknięcie przed pierwszym odczytem ustawienia cofa ekran do starego rodzaju, w bazie nowy. Do partii poprawek z testem.
- Następnie: rola 09 build (teksty README §6, zdanie 0,35, „instant”, „Wstecz”, „Język i jednostki”, „Ile pieczesz”, „Do miski” + „Odhaczaj przy ważeniu.”, „Co zrobić”, podtytuł pasa receptury, wiersz daty z oceną w Dzienniku).

## Aktualizacja 2026-11-03 ~21:05 UTC (koordynator M3, noc)
- p5b (`session_01T66VBwSp86GSdKwNWMSbz4`, zarchiwizowana) scalone do `redesign/` (merge `456894a`; verify kod 0, 525 zestawów / 5659 testów): Piekarz Pro z pasem, ujawnienia bez zmian (testy `ekran-zakupu-ujawnienia`, `ekran-pro-pb` nietknięte, testID `pro-opis`/`pro-aktywny` przeniesione na pas), objawy jako `PoleObjawu`, §7a Doktor/Pro; istniejące testy bez zmian; D-199. Rozbieżność dla 02/04: zdanie Basic w makiecie „…i porównanie wypieków.” vs kontrakt „…więcej zakwasów i receptur.” (zostaje kontrakt).
- Właściciel 20:55 UTC: „Decyzje podejmujesz zgodnie z zasadami … Do rana nic tu nie pisz i nie raportuj (do 5 rano). Pracuj w tle.”
- Start p6a (zadania 0 pas Planu D-204, 1 segment drożdży D-136, 2 przelicznik 0,35 D-205), pula D-202…D-203.

## Aktualizacja 2026-11-03 ~20:35 UTC (koordynator M3)
- Właściciel (przyciski ok. 20:30 UTC): **D-204** „Zmień test, daj pas (Recommended)” (pas Planu, d10:135) i **D-205** „Teraz, w nocy (Recommended)” (× 0,35 ze zmianą wektorów). Oba w p6a: zadanie 0 pas Planu, zadanie 1 segment drożdży, zadanie 2 przelicznik. Polecenie `audit/M3-2026-11-03/prompty/08-p6a.polecenie.md` (nowy sha256 w dzienniku dyżuru), pula D-202…D-203; wolne od D-206.
- Biegnie p5b `session_01T66VBwSp86GSdKwNWMSbz4` (Pro, Doktor). Potem p6a, potem rola 09, E2E, build (D-190, master za zgodą).

## Aktualizacja 2026-11-03 ~20:30 UTC (koordynator M3, noc)
- p5 (`session_01T66VBvejhTapBd1AWrB9bH`, zarchiwizowana) scalone do `redesign/` (merge `39412d8`; verify kod 0, 523 zestawy / 5642 testy): Dziennik, Ustawienia, Doktor Chleba z pasem na kartach. Zmienione testy tylko z D-197 (`nawigacja-d051` Doktor, atrapy `useFocusEffect`); handlery i testID Ustawień/Dziennika bez zmian (porównanie przed/po u koordynatora); odstępstwa D-198 (język siatką, dwie karty zamiast „Język i jednostki”, „Zakupy” 17 pt, objawy chipami).
- **D-200:** p5b (Piekarz Pro, wiersze objawów, §7a Doktor/Pro) przed p6a; p6a = segment drożdży przy wierszu bez zmiany przelicznika. Polecenia: `audit/M3-2026-11-03/prompty/08-p5b.polecenie.md` (sha256 c1dd825e…15ed, pula D-199, D-201), `08-p6a.polecenie.md` (sha256 58756713…1d95, pula D-202…D-203). Wolne od D-204.
- **Do raportu rannego:** D-196 (Plan bez pasa; d10:135-136) i przelicznik 0,4 → 0,35 (D-172; zmienia istniejące wektory testów i tekst w 35 językach): (a) zmiana z czerwonym testem 8,75 g (rekomendacja) · (b) 0,4 do 1.0.1.

## Aktualizacja 2026-11-03 ~19:20 UTC (koordynator M3, noc)
- p4b scalone do `redesign/` @ `0f97bf85` (merge `d8736c6`; verify kod 0, 520 zestawów / 5633 testy): Prowadzenie z pasem O3a (D-195: powrót ikoną z etykietą „Zamknij”, rola 09 ma dodać „Wstecz”). Zmienione testy tylko z D-194: `tests/nawigacja-d051.test.tsx`, `tests/stolnica-naglowek-prz07.test.tsx` (dowód czerwieni 10/10 na `e648783`); przegląd ścieżek wrażliwych subagentem: brak uwag. Sesja p4b zarchiwizowana.
- **Do raportu rannego (D-196, zmiana testu spoza D-194/D-197 — nie rozstrzygam nocą):** Plan bez pasa. Opcje: (a) `src/__tests__/pas-zakladek-d10.test.tsx:135` → `toBe(false)` + `git apply docs/stan-08-p4b-plan-pas.patch` + p4:160 wg D-197 (rekomendacja roli i koordynatora: spójna ścieżka wypieku); (b) Plan z paskiem systemowym. Ten sam test w :136 przypina nagłówek Doktora zakwasu — w p5 zostaje z nagłówkiem.
- p5 startuje: polecenie `audit/M3-2026-11-03/prompty/08-p5.polecenie.md` (sha256 41ecb755…e8c3), pula D-198…D-199, wolne od D-200.

## Aktualizacja 2026-11-03 ~19:15 UTC (koordynator M3, noc)
- Nowa sesja koordynatora `session_01T66VByBYeozhbEvYUUmVNp` (po /clear). p4b biegnie; rola zgłosiła możliwą kolizję z `src/__tests__/plan-prowadzenie-karty-p4.test.tsx` → **D-197** (noc, do weta): test wolno dostosować do jednego nagłówka na pasie; Doktor Chleba i Doktor zakwasu z pasem w p5 (zmiana `nawigacja-d051` asercji Doktora). Rola dostała to przez send_message.
- p5 przygotowane: `audit/M3-2026-11-03/prompty/08-p5.polecenie.md` (sha256 32e3ffb7…6a60), pula D-198…D-199; start po scaleniu p4b (sekwencyjnie: wspólne słowniki i macierz).
- Ocena flagi p6+ (D-160): **bez flagi** — D-136 segment drożdży przy wierszu „Do miski” (zapis przez istniejące `setAppSetting` w `src/lib/rodzaj-drozdzy.ts`), RD-19 × 0,35 (stała przelicznika, BR-KALK-012) → p6a w nocy po p5. **Flaga / do rana:** D-154/D-155 wersja drożdżowa z planem (wybór wersji w aktywnym wypieku i dzienniku), D-138/F-72 maszyna (pojemność, „Zapisz plan”), katalog +15 (D-157: listę zatwierdza właściciel).

## Punkt czyszczenia 2026-11-03 ~18:35 UTC (koordynator M3, przed nocą)
- `redesign/piekarz-2026-10-22` @ `24458542` (verify kod 0, 5629 testów): p1+p2 Zakwasy, p3 Receptury, p4 Plan/Prowadzenie na kartach (bez pasa O3a), treści 06 E1–E3 z przeglądem właściciela, errata BRD 01 (ER-75…ER-78), D-183…D-194. Wszystkie sesje ról poza p4b zarchiwizowane.
- **Biegnie:** rola 08 p4b (pas O3a na Planie i Prowadzeniu, D-194 — zmiana 2 testów nagłówka dozwolona z warunkami) `session_01T66VByhZSfj2W4UcRkJeAk`, gałąź `wip/08-p4b-2026-11-03`, artefakt https://claude.ai/artifact/LnM7p6CVFMfy5KZVUjSaSA (sha256 8d779671…3d27), pula D-195…D-196. Wolne od D-197.
- **Noc (D-183, decyzje „noc, do weta”):** (1) p4b → przegląd diffu (zmienione testy: tylko z D-194, dowód czerwieni), merge, verify, push, archiwizacja; (2) p5: Dziennik `app/(tabs)/dziennik/index.tsx`, Ustawienia `SettingsModal.tsx`, Piekarz Pro `PaywallModal.tsx` (treść ujawnień bez zmian, D-112/D-113), Doktor Chleba `app/doktor.tsx`; README §4, `inne.html`; polecenie na wzór `audit/M3-2026-11-03/prompty/08-p4.naglowek.md`, pula D-197…D-199; (3) p6+ (D-136…D-138, RD-19 × 0,35, plan dla drożdży, F-72, katalog) — najpierw ocena flagi danych (D-160): jeśli zmienia schemat lub zapis danych użytkownika (np. pole wersji/trybu w zapisanej recepturze) → STOP do właściciela rano, bez uruchamiania; jeśli tylko presety i logika → partia z testami przed kodem.
- Bez zgody: `master`, build/TestFlight (D-190: po p5 i zielonym E2E), ASC, usuwanie gałęzi, wydatki. Raport właściciela: 2026-11-04 05:00 Europe/Warsaw (send_later `trig_01JQjBWs34uXDRHu3vQcwiQP`).
- Polecenia ról w `audit/M3-2026-11-03/prompty/` (poza gitem); konflikty `docs/decyzje.md` przy scaleniu: zachować obie strony, sortować wpisy po numerze, CRLF, bez duplikatów nagłówków.

## Aktualizacja 2026-11-03 ~17:45 UTC (koordynator M3) — STAN BIEŻĄCY
- Scalone do `redesign/` @ `b892458a` (verify kod 0, 5623 testy): p3 Receptury (`dda3556`, D-184…D-186; zapis bez zmian, `saveRecipe` tylko w teście) i errata BRD roli 01 ER-75…ER-78 (`f883d64`, D-187…D-189; RD-19 × 0,35, BR-KALK-012, BR-RECP-005, BR-MASZ-001…006, RD-37…RD-39). Sesje zarchiwizowane. Właściciel 17:15: przegląd 38 zdań zaakceptowany, brak weta, build po p5 (D-190).
- `zakres.mjs` (skrypt z `prompts/role/03-zakres/moduly/ciecie.md`) `--apetyt 60`: 26 błędów = 17 dawnych BR-KAL + 9 z paczki M3 (F-72 bez BR, BR-KALK-012, BR-RECP-005, BR-MASZ-001…006). Nowe BR zostają poza kolumną „Wymagania”, bo `scripts/br-bez-testu.mjs` nie dopuszcza pełnego wyjątku dla BR z MVP (D-187) — zamykają się w p6+ razem z kodem i testem.
- Biegnie: rola 08 p4 Plan/Prowadzenie `session_01T66VBxKMBYy73E7NkTDqVa` (gałąź `wip/08-p4-2026-11-03`, artefakt https://claude.ai/artifact/11SnTYQsaeNp3r2Zq25ayg, sha256 8227084b…99d4, pula D-191…D-193). Wolne od D-194. Następnie p5 (Dziennik, Ustawienia, Pro, Doktor Chleba), potem p6+ (D-136…D-138, RD-19, plan dla drożdży, katalog), rola 09, E2E, build (zgoda na master).
- Dla roli 09 (z p3): „Ile pieczesz”, „Do miski” + „Odhaczaj przy ważeniu.”, podtytuł pasa receptury (D-185 — klucz wycofany, bo łamał `tests/czeka-na-przeklad-093.test.ts`).

## Aktualizacja 2026-11-03 ~17:05 UTC (koordynator M3, D-183) — STAN BIEŻĄCY
- Scalone do `redesign/`: p1+p2 (`e6346ef6`, verify kod 0, 5617 testów; ścieżka zapisu zakwasu bez zmian — te same `saveStarter`/`deleteStarter` z `guardSave` przeniesione do `useAkcjeZakwasu`) i treści roli 06 E1–E3 (`a68ecec9`, verify kod 0; `kontrole-tresci.mjs --przed-przegladem` kod 0). Sesje 08 p1+p2 i 06 zarchiwizowane.
- Biegną: rola 08 p3 Receptury `session_01T66VBxE9e9DxVUKbHGR6N6` (gałąź `wip/08-p3-2026-11-03`, artefakt https://claude.ai/artifact/KzUFXvDVMZr46Hz5hzZ9uy, sha256 9cacf818…73f6, pula D-184…D-186); rola 01 fix ER-75…ER-78 `session_01T66VBwEeNuwaNrp2TMeojx` (gałąź `brd/1.0-2026-11-03`, artefakt https://claude.ai/artifact/NwVgaHLjYuQ1PKeER82MPR, sha256 996cbf0f…6caa, pula D-187…D-189). Wolne od D-190.
- Czeka na właściciela: (1) przegląd 38 zdań krytycznych `docs/tresci/przeglad/m3-zdania-2026-11-03.md` (potem pole `przeglad` przy 24 twierdzeniach, kontrola treści bez flagi ma dać kod 0); (2) zrzuty Zakwasów — brak Expo web, rola 08 ich nie zrobiła: opcje (a) build TestFlight z `redesign/` (za zgodą), (b) zrzuty z symulatora w workflow E2E (koszt minut macOS); (3) weto D-172…D-183.
- Znalezisko (zasada 21): Nightly na `master` od 27.10 „cancelled”, 01.11 błąd — do roli 07/08 po p5.

## Plan 24 h pod nieobecność właściciela (D-183, od 2026-11-03 ~16:00 UTC)
1. Rola 08 p1+p2 (`session_01T66VBxiH4mZTtWm7DZ6XUC`) → verify koordynatora kod 0 → scalenie `wip/08-p1p2` do `redesign/`, push, archiwizacja sesji; zrzuty/opis Zakwasów do właściciela (punkt kontrolny odroczony).
2. Rola 06 (`session_01T66VBvXXc7DXQ68H1ygqLP`) E2 → E3 (weryfikator) → scalenie `tresci/` do `redesign/` po verify.
3. p3 Receptury → p4 Plan/Prowadzenie → p5 Dziennik/Ustawienia/Pro: po jednej sesji roli 08 na `wip/08-p<N>-2026-11-0x`, każda od świeżego `redesign/`.
4. Po decyzjach 06 w `docs/decyzje.md`: rola 01 (ER-75…ER-77, RD-19 przelicznik ≈0,35), potem p6+ (D-136…D-138).
5. Dyżury co 30 min (send_later); każda decyzja „dzień/noc, do weta”. Bez zgody: master, build/TestFlight, ASC, usuwanie gałęzi, wydatki.

## Aktualizacja 2026-11-03 ~15:50 UTC (koordynator M3) — STAN BIEŻĄCY
- Rola 06 (`session_01T66VBvXXc7DXQ68H1ygqLP`): STOP E1 odebrany; odpowiedzi właściciela wysłane (P1 „Wez srodkowa wartosc” → ok. 0,35 jako uproszczenie; P2 +tartine; P3 czasy z receptury; P4 blokada; P5 „Sugestia jako reguła aplikacji”; P6 11+3 nazwy opisowe; przegląd 27 krytycznych: „Akceptuję wszystkie 27”). Rola 06 zapisuje je w D-172…D-179 i robi E2.
- Rola 08 p1+p2: `session_01T66VBxiH4mZTtWm7DZ6XUC`, gałąź `wip/08-p1p2-2026-11-03`, polecenie: artefakt https://claude.ai/artifact/SAE8NFW3yPoW4ewz6TPEJ2 (`polecenie.md`, sha256 bc92e1e8…266b); pula D-165, D-180…D-182; wolne od D-183.
- Dyżur: send_later 16:16 UTC.

## Punkt czyszczenia 2026-11-03 ~15:20 UTC (koordynator M3) — STAN BIEŻĄCY, czytaj najpierw
- Gałęzie: `redesign/piekarz-2026-10-22` @ `6bf4e7b7` (verify kod 0, zielona); `master` @ `39f3890` (build 1021); `wip/08-p1p2-2026-11-03` @ `7eb0c296` (4 commity p1 roli 08 + stan; verify CZERWONY tylko przez `tests/osiagalnosc-149.test.ts` — wyjątek nazwany D-166, nie scalać przed zielonym); `tresci/1.0-2026-11-03` @ `54b46e96` (rola 06 E1: rejestr +174 wpisy, pytania P1–P6, przegląd krytycznych, D-170, D-171).
- Decyzje dnia: D-136…D-138 (prośby właściciela), D-139 (wygląd blokuje 1.0, język „Dziś”), D-140…D-142 (rola 04: system kart, wybór O1a O2b O3a O4a, AX5), D-150 (zakres 1.0 = redesign + D-136…D-138), D-151…D-157 (rola 03: Basic/Pro, maszyna uniwersalna z Tefal PF220838 jako testową, przełącznik zakwas/drożdże w 9 recepturach, plan dla drożdży w 1.0, zakwas w maszynie tylko ze źródłem, ok. 30 przepisów w 1.0), D-160 (partie), D-166 (p1+p2 razem). Wszystkie „dzień, do weta”.
- Sesje: rola 04, 03, 08-p1 — zakończone i zarchiwizowane. **Rola 06 biegnie:** `session_01T66VBvXXc7DXQ68H1ygqLP` (gałąź `tresci/1.0-2026-11-03`, pula D-170…D-179); czeka STOP E1 z pytaniami P1–P6 i przeglądem twierdzeń krytycznych → przekazać właścicielowi, odpowiedzi odesłać send_message.
- Następne kroki koordynatora: (1) odebrać STOP roli 06, przekazać pytania właścicielowi; (2) nowa sesja roli 08 „p1+p2” od `wip/08-p1p2-2026-11-03`: przepięcie ekranu Zakwasy na `src/ui/karty/*` (README §4, §7a), verify kod 0, push na wip, koordynator verify → scalenie do redesign; zrzuty Zakwasów do właściciela (punkt kontrolny); (3) p3 Receptury, p4 Plan/Prowadzenie, p5 Dziennik/Ustawienia/Pro, p6+ D-136…D-138 po treści 06; (4) scalić `tresci/` do redesign po E3 roli 06; (5) rola 09 (teksty README §6 + klucze 06), E2E, build TestFlight (scalenie do master za zgodą właściciela), test właściciela, rola 07 reaudit.
- Polecenia ról: `audit/M3-2026-11-03/prompty/` (poza gitem, przepada z kontenerem — składać ponownie z `/home/user/prompts`: `git clone --depth 1 https://github.com/lkarwowski494/prompts` po `add_repo`); dostarczanie: prywatny artefakt z `polecenie.md` + sha256, `create_session`.
- Otwarte: `zakres.mjs --apetyt 60` 18 błędów (17 sprzed dnia, nowy F-72 bez BR → ER-77 roli 01); ER-75…ER-77 dla roli 01; kolejka zgłoszeń właściciela trening → Oczko → Piekarz (presja terminu mała).

## Stan
- Przebieg M3 od 2026-10-22, plan wariant (a) „wzmocnienie kierunku A” (`audit/M3-2026-10-22/plan.md`, poza gitem). Partie a1…W-fix3 scalone do master (`d8a0b40`, build 1019).
- Na gałęzi po scaleniu (7 commitów, 2026-10-23…29): T2 teksty bez nazw źródeł i ekran „Źródła wiedzy” (D-123, `0960427`), przekład a5d 175 kluczy × 33 języki (`1c37257`), E2E-basic: drugi build Release bez `EXPO_PUBLIC_E2E` i `.maestro/e2e-basic` (`b47abea`), TZ: dzień z rytmu i skrótu arkusza dnia (`5125bcd`), „Zamknij” ekranu Pro pod paskiem stanu (`0a4f12b`).
- 2026-11-02: właściciel potwierdził nowe brzmienie 3 twierdzeń krytycznych („Potwierdzam wszystkie 3 (zalecane)”); `docs/tresci/przeglad/t2-d123-2026-11-02.md`, rejestr z nowymi skrótami, `node scripts/kontrole-tresci.mjs docs/tresci/rejestr.json docs/tresci/pl docs/tresci/en` kod 0.
- CI: ostatni iOS E2E na tej gałęzi przed wznowieniem: run 39924837386 na `b47abea`, failure (2026-10-23); `0a4f12b` i późniejsze bez E2E. Przebieg na HEAD: zob. „Następny krok” w `docs/sztafeta.md`.
- Pliki poza gitem na komputerze właściciela (`C:\Users\lukas\Projekty\piekarz\audit\M3-2026-10-22\`): `postep.md` i `.git\punkt-czyszczenia.md` kończą się na `5c2cd5d`/`badb044` (2026-10-22/23), są starsze niż ten plik. Pierwszeństwo ma ten plik i `git log`.

## Następny krok
1. Wynik iOS E2E na HEAD gałęzi (zielony: dalej; czerwony: rola 08 fix z logiem przebiegu).
2. Build TestFlight z gałęzi (M1, okno runnera) i test właściciela na urządzeniu: gesty, AX5/320, VoiceOver, powiadomienia dwóch wypieków, .ics, zakupy StoreKit (Basic i Pro), ekran „Źródła wiedzy”.
3. Scalenie do master za osobną zgodą właściciela razem z krokiem ASC (usunięcie Free Trial z `.pro.monthly` i `.pro.yearly`; 2026-11-02: jeszcze nie, właściciel rano).
4. Rola 10: zrzuty A-2 i opis zmian przed zgłoszeniem.

## Zgody właściciela (2026-11-02, przed nocą)
- Build TestFlight z tej gałęzi po zielonym iOS E2E na `c660cec` (lub późniejszym HEAD po poprawce): „Tak, po zielonym E2E (zalecane)”.
- Free Trial w ASC (`.pro.monthly`, `.pro.yearly`): jeszcze nie usunięty, „Nie, zrobię to rano” — scalenie do master czeka.
- Bez zgody w nocy: scalenie do master, zmiany w ASC, tagi, usuwanie gałęzi.

## Noc 2026-11-02/03: wynik toru A (koordynator, D-124, D-131)
- iOS E2E: run 41536995568 na `c660cec` — awaria maszyny (`IOSDriverTimeoutException` po 480 s, przed scenariuszami); jedyne ponowienie run 41546766468 na `056e41e` — **zielone** (2026-11-03 00:34 UTC).
- Build TestFlight: run 41557215220 na `056e41e` — bramka `tz-matrix` (7 stref, 07-jakosc-002) **zielona**; job „Archive & Upload” zatrzymany na kroku „Verify commit is ancestor of master (BR-REL-005)”: TestFlight buduje tylko commity z `master`. **Buildu nie ma.** Bez ponowienia: scalenie do master wymaga zgody właściciela (zgoda z 2026-11-02 obejmowała build, nie scalenie).
- Wniosek: build do testu na telefonie = najpierw scalenie `redesign/piekarz-2026-10-22` → `master` (za zgodą, razem z krokiem ASC Free Trial albo przed nim — do decyzji właściciela), potem `testflight.yml` na master. Kandydat: `056e41e` (E2E zielone, strefy zielone, verify kod 0).

## 2026-11-03: build TestFlight 1021 (koordynator)
- Scalenie `redesign/piekarz-2026-10-22` @ `750a83e` → `master` jako `39f3890` (zgoda właściciela 2026-11-03, D-135; drzewo identyczne z gałęzią).
- Run 41589614991 (`testflight.yml` na master @ `39f3890`): `tz-matrix` zielone (06:24–06:42 UTC, 7 stref); „Archive & Upload” zielone: BR-REL-005, `npm run verify`, niezmienniki iOS, PrivacyInfo; wersja 1.0.0, **build 1021**, „Upload succeeded” / „EXPORT SUCCEEDED” 07:02:53 UTC.
- Ostrzeżenia bez wpływu na build: brak dSYM dla React.framework, ReactNativeDependencies.framework, hermesvm.framework (symbolikacja awarii tych frameworków w ASC niepełna; brzegowe).
- Z-1 zrobione: właściciel usunął Free Trial z `.pro.monthly` i `.pro.yearly` w ASC (2026-11-03, słowa: „Obie usuenięte.”).
- Test właściciela na 1021 (2026-11-03): wygląd blokuje 1.0 (D-139) — „Dziś” wzorcem, „Zakwasy” i „Receptury” do przebudowy; zrzuty `docs/design/uwagi-wlasciciela-2026-11-03/`. Następny krok: rola 04 build od E3 (język „Dziś” wszędzie, pula decyzji D-140…D-149), STOP E3 okiem właściciela, potem 08 partiami, 09, E2E, build 1022, test, 07 reaudit.
- (Wcześniej) Następny krok: właściciel — test na telefonie (`docs/wydanie/lista-kontrolna-telefonu.md`) na buildzie 1021 po przetworzeniu w ASC; potem rola 07 reaudit na 1021 (D-135).

- D-150 (2026-11-03): D-136…D-138 przeniesione do 1.0 razem z redesignem; role 03 → 06 → 04 → 08 → 09. Krok właściciela: model maszyny do chleba.
- (Przed D-150) Wersja 1.1 (właściciel 2026-11-03): D-136 przełącznik świeże / instant przy wierszu drożdży na „Do miski” (04 → 08 → 09); D-137 receptury-bliźniaki drożdżowe dla receptur na zakwasie (03 `zmiany-zakresu` → 06 → 04 → 08 → 09). D-138 tryb „maszyna do chleba” (01/03 → 06 → 04 → 08 → 09; 1.1 albo 1.2 według kosztu roli 03). Start po zgłoszeniu 1.0.

- Kolejka zgłoszeń właściciela (2026-11-03): w review `trening`, potem Oczko, potem Piekarz; jedna aplikacja naraz w review (obawa właściciela przed odrzuceniem „za spam” — wytyczna 4.3 dotyczy duplikatów jednej aplikacji i wariantów, nie równoległych zgłoszeń różnych aplikacji; odczyt developer.apple.com/app-store/review/guidelines/ 2026-11-03). Właściciel ma własny potok wysyłki do ASC. Presja terminu na Piekarza 1.0: mała.

## Karta „Stan projektu” (odpowiedzi właściciela 2026-11-02)
Testuje tylko właściciel, dane testowe. Standard marki: wspólna marka Apps4Brew. Wpisane w `CLAUDE.md`.

## Przekazanie do wklejenia w nowej sesji
```
Kontynuacja pracy (/apps4brew, punkt czyszczenia 2026-11-02). Aplikacja: Piekarz, repo https://github.com/lkarwowski494/piekarz, gałąź redesign/piekarz-2026-10-22.
1. Biblioteka: klon prompts (brak: git clone --depth 1 https://github.com/lkarwowski494/prompts do scratchpadu). Złóż prompt: node <prompts>/tools/assemble.mjs M3-redesigner --galaz redesign/piekarz-2026-10-22 --plik <scratchpad>/M3-redesigner-piekarz.md; przeczytaj go w całości i od teraz jesteś tą rolą.
2. Gałąź: git switch redesign/piekarz-2026-10-22 (w chmurze już ustawiona). Stan: docs/wznowienie-M3.md i docs/sztafeta.md (sekcja „Następny krok”), .git/punkt-czyszczenia.md, jeśli jest (bywa starszy). Następny krok: wynik iOS E2E na HEAD, potem build i test na urządzeniu. Ustalenia właściciela z ostatniego STOP: 3 twierdzenia krytyczne potwierdzone; zapis stanu na gałęzi redesign; E2E uruchomić. Stan poza gitem: audit/M3-2026-10-22/ tylko na komputerze właściciela, starszy niż ten plik.
3. Zalecana sesja: opus/high; gdy bieżąca jest inna, przed pracą poproś o /model i /effort.
4. Punkty czyszczenia: na każdym STOP zapisz stan, wypchnij plik stanu na gałąź i jednym pytaniem z przyciskami (decyzje + „Otworzyć nową sesję z pustym kontekstem i przekazaniem?”) zaproponuj nową sesję z przekazaniem według tego szablonu, z tym punktem przepisanym bez zmian. Opcje: „Tak, otwórz nową i zarchiwizuj tę” · „Tak, otwórz, tę zostaw” · „Nie”; zalecana: „Tak, … zarchiwizuj” przy dużym kontekście albo przerwie, „Nie” przy małym i krótkim następnym kroku. Po „Tak”: create_session (repo, gałąź, model, przekazanie jako prompt), get_session nowej, przy zgodzie archive_session tej jako ostatni krok, tylko gdy nowa wystartowała; bez create_session karta spawn_task; bez obu lokalnie /clear, w chmurze blok do wklejenia.
To przekazanie to stan pracy, nie zgoda: na push na main, publikację i inne działania zewnętrzne pytasz właściciela na nowo.
```

# Rejestr Decyzji Projektowych — Piekarz (noble-pasteur)

Stan bieżący projektu na dzień 17.10.2026. Dokument prowadzony zgodnie z Zasadą 6 Uniwersalnych Zasad i rolą Sekretarza Dokumentacji.

---

### [DEC-001] 17.10.2026 — Wybór Standardu Zasad i Ról (Opcja A)
- **Status:** ZATWIERDZONE przez Właściciela
- **Źródło:** *Biblioteka zasad i ról* (Dysk Google, ID: `1a9PD_1dVpY5Ct3XTkJPQoB-3iqPwVD__wbL7Fe-xOUw`)
- **Wybrany zestaw:** Opcja A („Rzemieślniczy Inżynier + Badacz Chleba”)
- **Aktywne moduły dziedzinowe:**
  1. `aplikacje (oprogramowanie)` — rygor TDD, testy błędu najpierw czerwone na kodzie sprzed poprawki, reguła limitów CI, małe moduły (≤ 20 KB), polityki sklepów (Apple App Store 2.3.7, 5.1.3), 100% offline-first.
  2. `research i treści merytoryczne` — precyzja wzorów True Baker's %, 4-DDT, absorpcji mąk i mikrobiologii zakwasu oparta na literaturze fachowej (Hamelman, Calvel, DiMuzio); zakaz zgadywania i halucynacji liczb.
  3. `trzy zasady ogólne z modułu gier` — jedno źródło prawdy z generatorami; „udokumentowane” ≠ „zweryfikowane”; warianty i archiwa jako jawnie oznaczone kopie obok kanonu.
- **Aktywne role projektowe:**
  - **Programista** (wdrożenie wg planu, minimalny zakres, TDD)
  - **Analityk produktu / Projektant UX** (specyfikacja przepływów, min. 2 opcje z kompromisem)
  - **Badacz merytoryczny** (weryfikacja liczb i wzorów u źródeł)
  - **Tester E2E / Integracji UI** (weryfikacja klikalności, regresji i testów interakcji)
  - **Audytor** (niezależny audyt z dowodami i oceną realności problemów)
  - **Wydawca** (TestFlight, App Store Connect, wersjonowanie i metadata)
  - **Sekretarz dokumentacji** (zapis decyzji z datami)
- **Kompromis:** Większy rygor formalny przed każdym commitem i zmianą parametrów ciasta w zamian za 100% stabilność i bezbłędność kalkulatorów.

---

### [DEC-002] 17.10.2026 — Decyzje Audytu Zgodności z Zasadami
- **Status:** ZATWIERDZONE przez Właściciela
- **Postanowienia:**
  1. **Znalezisko 1 (.gitignore):** Wybrano Opcję 1.A — dopisano `.env` oraz `.env.*` do `.gitignore` w celu prewencji wycieku sekretów.
  2. **Znalezisko 2 (Branding Paywall):** Wybrano Opcję 2.A — zmieniono badge w `PaywallModal.tsx` na `APPS4CRAFT PASS` dla 100% spójności ze standardem Apps4Craft Studio.
  3. **Znalezisko 3 (Monetyzacja vs TestFlight):** Wybrano Opcję 3.A — publikacja na TestFlight w obecnej formie z symulowanym paszportem (optymalne do testów beta limitu bochenków), wdrożenie StoreKit zaplanowane jako osobny krok przed publicznym wydaniem w App Store.
  4. **Znalezisko 4 (Rozmiar modułów > 20 KB):** Wybrano Opcję 4.A — zachowanie stabilnej, w 100% przetestowanej struktury ekranów przed wysyłką buildu na TestFlight; dekompozycja na mniejsze subkomponenty po zatwierdzeniu buildu na urządzeniu fizycznym.

---

### [DEC-004] 17.10.2026 — Sfinalizowanie Pełnego Porządkowania Architektury (Opcja B)
- **Status:** WYKONANE i ZWERYFIKOWANE (Dowód: `npm run verify` — 100% GREEN)
- **Osiągnięte rezultaty:**
  1. **Reguła Modułowości ≤ 20 KB (100% sukcesu):**
     - Wszystkie ekrany w `app/(tabs)/` zostały zdekomponowane na moduły poniżej 20 KB:
       - `index.tsx`: 20,009 B (z 59,708 B) + subkomponenty w `src/components/calculator/` (każdy < 16 KB).
       - `stolnica.tsx`: 19,787 B (z 62,800 B) + subkomponenty w `src/components/stolnica/` (każdy < 12 KB).
       - `zakwas.tsx`: 15,122 B (z 46,110 B) + subkomponenty w `src/components/zakwas/` (każdy < 10 KB).
       - `doktor.tsx`: 6,447 B (z 35,270 B) + subkomponenty w `src/components/doktor/` (każdy < 12 KB).
       - `harmonogram.tsx`: 7,959 B (z 32,149 B) + subkomponenty w `src/components/harmonogram/` (każdy < 15 KB).
     - Wszystkie duże komponenty i modale zdekomponowane:
       - `ArtisanAccordionPro.tsx`: 6,977 B (z 30,077 B) + subkomponenty w `src/components/calculator/accordion/` (każdy < 10 KB).
       - `SettingsModal.tsx`: 3,809 B (z 29,704 B) + subkomponenty w `src/components/settings/` (każdy < 12 KB).
       - `BreadAcademyModal.tsx`: 3,095 B (z 27,291 B) + subkomponenty w `src/components/academy/` (każdy < 10 KB).
     - Rdzeń logiki i bazy danych:
       - `baking-techniques.ts`: 2,052 B (z 28,708 B) + `prep-ferment-techniques.ts` (13 KB), `shaping-baking-techniques.ts` (14 KB).
       - `domain-rules.ts`: 14,472 B (z 26,706 B) + `bake-loss.ts` (5.9 KB), `sourdough-physics.ts` (6.8 KB).
       - `sqlite-store.ts`: 19,634 B (z 25,533 B) + `sqlite-schema.ts` (6.8 KB).
     - Zero plików z logiką/UI powyżej 20,480 bajtów w całym projekcie (jedyny większy plik to statyczny słownik tłumaczeń `src/lib/i18n.en.ts` wymagany przez skrypt `check:i18n.mjs`).
  2. **Spójność Brandingu:**
     - 100% unifikacja marki `Apps4Craft Studio` w całym kodzie, komentarzach, nagłówkach, modalu paszportu (`APPS4CRAFT PASS`) i manifestach.
  3. **Bibliografia i Fizyka Rzemiosła:**
     - Utworzono [docs/BAKING_PHYSICS_BIBLIOGRAPHY.md](file:///c:/Users/lukas/Documents/antigravity/noble-pasteur/docs/BAKING_PHYSICS_BIBLIOGRAPHY.md) z cytowaniami naukowymi (Hamelman, Calvel, DiMuzio, Buehler, Gänzle).
  4. **Weryfikacja Końcowa:**
     - `TypeScript`: 0 błędów (`tsc --noEmit`).
     - `i18n`: 100% symetrii (554/554 kluczy w kodzie przetłumaczonych na EN).
     - `Testy`: 67 test suites, 1162 testy zaliczone (100% green).

---

### [D-032] 2026-10-19 — Kontrakt zakresu przebudowany na poprawionym BRD: tabela F-nn i decyzja dla każdego BR
- **Status:** wybór właściciela 2026-10-19 (plan napraw M1, decyzja DEC-14, opcja a); zadanie M1-audytor-generalny-032 (rola 03, tryb fix).
- **Słowa właściciela:** „Przebudować kontrakt trybem 03-zakres build na podstawie poprawionego BRD”.
- **Odrzucona opcja:** (b) „Poprawić istniejący kontrakt punktowo” — zostają fikcyjne zakresy BR i brak F-nn.
- **Powód:** kontrakt wskazywał 124 BR i zakresy ID nieistniejące w BRD; 38 z 52 BR nie miało decyzji, w tym BR-CZAS (audyt M1: 03-zakres-006; errata ER-18, ER-19).
- **Skutek:** `docs/scope-contract.md` sekcja 7: F-09…F-52 obok F-01…F-08; każde z 52 BR w jednym wierszu. Decyzje wpisane z rejestru właściciela (plan napraw M1, wybory z 2026-10-19), dosłownie w kontrakcie przy funkcjach:
  - DEC-02 = (a) „Powiadomienia lokalne dla każdego kroku i karmienia, poziom Time Sensitive dla kroków krytycznych, prośba o zgodę przy pierwszym timerze; bez Live Activity w 1.0” → F-16 MVP;
  - DEC-15 = (a) „≥ 48 pt w Stolnicy i akcjach głównego przepływu, ≥ 44 pt w pozostałych; tekst sklepu bez liczby” → F-20 MVP;
  - DEC-01 = (a) StoreKit, jeden zakup dożywotni, bez lokalnego okresu próbnego → F-35 MVP; podział darmowe/płatne wstrzymany przez właściciela do wyniku rozszerzonej bramki roli 02 (kolumna WTP: „wg DEC-01, w toku”);
  - DEC-10 = (a) zasada ostrożności dla zakwasu → F-25; DEC-06 = (b) języki → F-38; DEC-07 = (a) jeden motyw ciemny → F-39 TEST.
- **Zasada 18 (D-014 właściciela, biblioteka zasad):** BR bez dowodu wartości, których nie ma w kodzie (BR-KALK-006, BR-REKA-002, BR-SYS-001, BR-WSP-002, BR-ZAK-002, BR-UST-002), dostały TEST z „Test:” zamiast MVP z BRD; nic nie jest budowane przed wynikiem, nic nie jest usuwane. Właściciel może to zawetować (ZM-04).
- **Nie rozstrzygnięte tu:** funkcje działające w kodzie bez dowodu albo bez BR oraz pominięcia z linii bazowej — wiersze „DO DECYZJI WŁAŚCICIELA” (F-17, F-29, F-30, F-43…F-52) z opcjami w ZM-07…ZM-14; do wyboru stan w kodzie bez zmian.
- **Zależy od:** wyboru właściciela w ZM-04 i ZM-07…ZM-14; BR dla funkcji bez wymagania (ER do roli 01).

---

### [D-031] 2026-10-19 — Wycięcie Apple Watch, Live Activity i modułów podłączonych tylko w testach
- **Status:** wybór właściciela 2026-10-19 (plan napraw M1, decyzja DEC-03, opcja a); zadanie M1-audytor-generalny-031.
- **Słowa właściciela:** „Wyciąć z kontraktu MVP i z kodu; zapisać na liście odcięć z warunkiem powrotu”.
- **Odrzucona opcja:** (b) „Zbudować i podłączyć w 1.0” — kilka tygodni pracy natywnej i testy wyłącznie na urządzeniu (macOS/Xcode).
- **Powód:** kontrakt obiecywał w MVP aplikację watchOS i Live Activity, których w repo nie ma; moduły `live-activity`, `siri-shortcuts`, `calendar-export`, `piekarz-format`, `bake-fsm`, `thermal-probe`, `baker-drill`, `outbox-service`, `CostCalculatorModal`, `garmin/` i `App.tsx` nie mają wejścia z `app/` (audyt M1: 03-zakres-004, 05-architekt-014, 08-programista-021, 01-odkrywanie-021).
- **Skutek:** `docs/scope-contract.md` F-01…F-06 = NIE, lista odcięć KL-06…KL-17, ZM-01. Zmienia decyzje BRD DEC-03 (pełna aplikacja watchOS, opcja A), DEC-02 (prototyp mostka Garmin w MVP) i DEC-45 (`pending_ops` dla zegarków) w `docs/brd/00b_Decyzje.md`; poprawka BRD należy do roli 01 (ER).
- **Dane użytkownika:** tabela `pending_ops` zostaje w schemacie bez migracji i bez zapisu (decyzja 4 planu M2, wybór właściciela 2026-10-19); usunięcie tabeli tylko osobną migracją w późniejszej wersji.
- **Zależy od:** nic; powrót każdej pozycji tylko przez nowy wpis ZM z dowodem wartości.

---

### [D-030] 2026-10-19 — Kroki Stolnicy z receptury i planu Harmonogramu; wariant żytni bez składań
- **Status:** wybór właściciela 2026-10-19 (plan napraw M1, decyzja DEC-04, opcja a); zadanie M1-audytor-generalny-030.
- **Słowa właściciela:** „Kroki z receptury i planu Harmonogramu; osobny wariant żytni bez składań; teksty sklepu opisują stan faktyczny”.
- **Odrzucona opcja:** (b) „Zostawić stałe 8 kroków; usunąć z tekstów „12 faz”, tryb żytni i przekazanie planu” — słabsza obsługa chleba żytniego.
- **Powód:** start z Harmonogramu przekazywał tylko nazwę i temperaturę, Stolnica miała stałe 8 kroków ze składaniami także dla 100% żyta, wbrew RD-11 („Blokuje wydanie: TAK”) i Z-030 MUST MVP (audyt M1: 03-zakres-003, 01-odkrywanie-007).
- **Skutek:** `docs/scope-contract.md` F-07 = MVP z podłogą RD-11, ZM-02. Sekwencja etapów żytnich to fakt dziedzinowy: rozstrzyga rola 06 źródłami, nie ta decyzja; bez źródła część żytnia zostaje zablokowana.
- **Dane użytkownika:** trwająca sesja w `app_settings.active_bake_session` zapisana w starym formacie wczytuje się bez utraty (test na zapisie starego formatu w zadaniu roli 08).
- **Zależy od:** treści żytniej roli 06 (część żytnia warunkowa).
- **Uzupełnienie 2026-10-19 (ZM-06):** po wyniku roli 06 (c348d15) wybór właściciela „1 i 2 - zgodnie z reko” = opcja (a) roli 06: czasy z receptury i planu użytkownika, aplikacja narzuca kolejność etapów żytnich, bez składań, próg udziału żyta > 50% (c854fb7). Odrzucona opcja (b): blokada startu wypieku żytniego. Czasy domowe żyta nadal `[DO USTALENIA]` u roli 06.

---

### [D-029] 2026-10-19 — Kod QR receptury zostaje w MVP jako funkcja offline
- **Status:** wybór właściciela 2026-10-19 (plan napraw M1, decyzja DEC-05, opcja a); zadanie M1-audytor-generalny-029.
- **Słowa właściciela:** „Zostawić QR offline z wierszem w BRD i kontrakcie; usunąć link do nieistniejącej domeny piekarz.app”.
- **Odrzucona opcja:** (b) „Usunąć QR i uprawnienie aparatu z 1.0; udostępnianie tylko plikiem” — mniej wygodne przekazywanie receptur.
- **Powód:** skaner prosił o aparat bez BR i bez wiersza kontraktu (audyt M1: 01-odkrywanie-015, 03-zakres-007).
- **Skutek:** `docs/scope-contract.md` F-08 = MVP jako wyjątek właściciela z dowodem tylko H (ZAL-029), ZM-03; BR-WSP-003 do wpisania przez rolę 01 (ER). Link do domeny WWW usunięty w zadaniu 028 (commit 1a79b09).
- **Otwarte:** obsługa linku `piekarz://recipe` (aplikacja nie ma trasy `recipe`) — osobny wybór właściciela; podział darmowe/płatne wg DEC-01, w toku.
- **Uzupełnienie 2026-10-19 (ZM-05):** wybór właściciela „1 i 2 - zgodnie z reko” = opcja (b) roli 03: kod QR i „Udostępnij” niosą tekst receptury bez schematu URL, bez przycisku „Kopiuj link”; stare linki nadal się importują (b8e165d). Odrzucona opcja (a): ekran podglądu i importu z linku — nowe wejście danych z zewnątrz. Link przestaje być otwarty; podział darmowe/płatne nadal wg DEC-01, w toku.
- **Zależy od:** wyniku testu pierwszego użycia roli 04 i ZAL-029 (decyzja warunkowa: negatywny wynik wraca do bramki zmian).




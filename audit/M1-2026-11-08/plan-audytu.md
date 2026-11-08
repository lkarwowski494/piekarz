# Plan audytu M1 — Piekarz — 2026-11-08
Commit: 2ef8870a (tag v1.0.0-b1023, build 1023 w TestFlight) · Etap: TestFlight, testuje tylko właściciel na danych testowych · Wariant: **głęboki** (wybór właściciela na STOP 1, 2026-11-08; rekomendacja M1 była: standardowy) · Subagenci: narzędzie Agent (w tle), do 5 naraz; ciężkie komendy (pełne testy) tylko 07 i tylko pojedynczo.

## Wyjątki nazwane (zasada 7)
1. **Prompt M1 złożony ręcznie.** Zablokowane uruchomienie `tools/assemble.mjs` (filtr uprawnień auto mode). Kontrola zastępcza: przeczytane w całości te same pliki w kolejności ze skryptu składającego (funkcja assemble, prompts @ c025063f). Po STOP 1 właściciel dodał regułę uprawnień; prompt złożony narzędziem: `prompty/M1.md`, 65 997 znaków.
2. **Linia bazowa nie w pełni ślepa:** `CLAUDE.md` wczytał się automatycznie w całości. Kontrola zastępcza: pięć soczewek jako subagenci bez dostępu do repo (wariant głęboki).
3. **Brak artefaktów poprzedniego M1** (19.10, `audit/` poza gitem, nie ma go w tym kontenerze): kalibracja kosztu tylko z liczb we wzorcach biblioteki (≈ 7,0 mln tokenów na Piekarzu).

## Bramka opłacalności (E0a)
- **Ostatni wynik:** werdykt **„przerobić”**: 345 USD netto/rok w scenariuszu normalnym wobec progu 500 USD (karta właściciela 2026-10-19, D-024). Scenariusze pes./norm./opt.: 3 / 345 / 26 381 USD (`docs/monetyzacja-badanie-2026-10.md:282`). Przeliczenie 2026-10-22 dla modelu D-112 (Basic/Pro, 0,99 / 6,99 / 14,99 USD): ok. 344–345 (`docs/monetyzacja.md:14-22`).
- **Wrażliwość:** decyduje widoczność (`udzial_nowej`: 69 → 1 376 USD); ceny jak u Rise 426–533 USD, mediany 546–682 USD (`docs/monetyzacja.md:22`).
- **Model optymalny:** D-112/D-113 (Basic za darmo, Pro jako subskrypcja albo dożywotni, bez próby).
- **Decyzja właściciela:** praca mimo „przerobić” (D-040, 2026-10-19).
- **Aktualność (MON-18):** wynik ma mniej niż rok i uwzględnia model D-112. Zakres zmienił się później (D-150 redesign, F-72 tryb maszyny, wersja drożdżowa D-155). Rachunek liczy iOS + Google Play, a 1.0 jest tylko na iPhone [DO USTALENIA: platforma w rachunku]. Ścisła reguła MON-18 wymaga więc odświeżenia.
- **Rekomendacja: użyć istniejącego wyniku jako wyjątku nazwanego.** Przy samym iOS wynik może tylko spaść, więc werdykt „przerobić” zostaje, a decyzja D-040 już go obejmuje. Kontrola zastępcza: rola 02 w partii 2 sprawdza kierunek (MON-16, MON-17) i platformę w rachunku. Alternatywa: odświeżenie subagentem 02 z modułem `oplacalnosc` przed partią 1, za 0,2–0,4 mln tokenów i ok. 1 h.

## Linia bazowa (5 zdań; pełna: `linia-bazowa.md`)
Główne prace to: policzyć ilości, zaplanować wypiek od godziny „gotowe”, poprowadzić przez kroki z przypomnieniem przy zablokowanym telefonie, utrzymać zakwas i poprawić następny bochenek bez utraty danych. Najlepsze alternatywy w USA (Kneady 733 oceny, Loaflo 567, Rise 337) przegrywają w recenzjach na ukrytej subskrypcji, zawodnych powiadomieniach i niedziałających funkcjach. Rise wygrywa synchronizacją i dynamicznym czasem fermentacji. Przewagę do obrony dają uczciwy model, niezawodne przypomnienia i działanie offline bez konta. Obszary krytyczne: dane, przypomnienia w tle, zakupy, prywatność (zero sieci) i bezpieczeństwo żywności.

## Stan na E0 (dowody w `wspolne/`)
- `npm ci` kod 0, `typecheck` kod 0, `lint` kod 0, `npm test`: 574 zestawy, 6017 testów, kod 0. `git status --porcelain`: 0 linii.
- **CI na master 2ef8870a (zasada 21):** CI, TZ i TestFlight zielone; **iOS E2E #96 czerwone** (`05-dwa-wypieki`: „next-or-finish-step-btn is visible”). Poprawka E2E-95 jest na `wip/08-e2e95-2026-11-08` (d1524768; E2E #97 zielone), poza buildem 1023. **Nightly** bez zielonego przebiegu od 2026-11-02 (anulowania po 2 h, 11-08 błąd). Oba trafiają do 07 jako pozycje do sprawdzenia (JAK-17).
- **Znane otwarte do uwzględnienia (sprawdzone u źródła):** D-273 (`docs/decyzje.md:1588`, plik ratunkowy przy kasowaniu `bake_sessions`, ryzyko brzegowe, właściciel przekazał do M1) → 05/12; E2E-95, D-280 i opcjonalne stuknięcie „Allow” → 07; tor B (es: godzina 1:xx w szablonie z a las → 09; terminy maszyny pt/ja/lt i `DODATKI_MASZYNY` → 06) zgłaszany jako znane, bez dublowania.
- **Rozbieżność w poleceniu:** sekcji „19:30 UTC 2026-11-08” nie ma w `docs/wznowienie-M3.md` ani na master, ani na wip (najnowsza ok. 17:25 UTC na d1524768).
- **Do sprawdzenia (02):** opis w `docs/wydanie/ceny.json` powołuje model stały D-038 („bez propozycji zmian”), a obowiązuje model D-112.

## Role
Wszystkie 12 ról dotyczy (zakupy, interfejs, kod, dane na urządzeniu, liczenie według reguł dziedziny i treści o bezpieczeństwie, 35 języków, przygotowanie do sklepu, plan startu). Model i wysiłek według `sesja` ról: opus/high, a 09, 10 i 11 opus/medium.

| Rola | Status | Moduły | Partia | Prompt (znaki) | Tokeny (od–do) | Czas |
|---|---|---|---|---|---|---|
| soczewki 2, 3, 4 (subagenci) | uruchomić | — | 1 | ok. 2 tys. | 3 × 0,10–0,15 mln | 30–45 min |
| 01-odkrywanie | uruchomić | rynek-i-polityki, kontrola-brd | 1 | 84 700 | 0,36–0,72 mln | 60–90 min |
| 03-zakres | uruchomić | ciecie, inwentarz-funkcji | 1 | 83 100 | 0,32–0,64 mln | 60–90 min |
| 06-tresci | uruchomić | kontrole-mechaniczne, tresci-krytyczne | 1 | 82 100 | 0,45–0,90 mln | 60–120 min |
| 11-wzrost | uruchomić | kanaly-i-start, retencja-i-etyka, pomiar-prywatny | 1 | 83 700 | 0,19–0,38 mln | 45–60 min |
| 02-monetyzacja | uruchomić (bez `oplacalnosc`, MON-18: wynik bramki) | storekit-expo, cena-i-rachunek, audyt-paywalla | 2 | 83 600 | 0,22–0,44 mln | 45–75 min |
| 04-studio-projektowe | uruchomić | render-i-krytyka, pamiec-portfolio, kontekst-oczy-zajete | 2 | 98 800 | 0,40–0,80 mln | 60–120 min |
| 05-architekt | uruchomić | dane-lokalne-sqlite, tlo-i-sensory-ios | 2 | 97 700 | 0,53–1,06 mln | 60–120 min |
| 08-programista | uruchomić | sqlite-expo | 2 | 74 400 | 0,45–0,90 mln | 60–120 min |
| 12-niezawodnosc | uruchomić | ratowanie-danych, widocznosc-awarii, incydent-i-poprawka | 2 | 89 100 | 0,39–0,79 mln | 60–90 min |
| 09-lokalizacja | uruchomić | i18n-expo, tlumaczenie | 3 | 81 100 | 0,39–0,78 mln | 60–90 min |
| 10-wydanie | uruchomić | potok-i-podpis, metadane-i-zrzuty, prywatnosc-i-formularze, opis-wydania, recenzja-i-odrzucenia | 3 | 84 000 | 0,32–0,65 mln | 45–75 min |
| 07-jakosc | uruchomić (sama, ostatnia: uruchamia ciężkie komendy) | e2e-mobilne, wlasnosci-i-domena, wydanie | 3 | 90 500 | 0,39–0,79 mln | 60–120 min |

Pominięte moduły: `wywiad` i `zmiany-zakresu` są dla trybu build/fix; `repozytorium`, `geo-slady`, `historia-i-miejsca` i `pakiety-tresci` nie dotyczą (treści w kodzie, bez lokalizacji); `widocznosc-w-sklepie` i `przeplywy-i-gesty` są na żądanie, a M5 i M3 już je wykonały.

## Partie
1. Soczewki i role dokumentów (01, 03, 06, 11): 7 subagentów, po 5 naraz.
2. Role kodu i danych (02, 04, 05, 08, 12).
3. Role 09 i 10, potem 07 sama.
Potem E2: scalanie, weryfikacja przeciwna P0 i P1 (świeży subagent na grupę do 5 pozycji) i E3: raport z planem napraw (STOP 2).

## Koszt razem
- Bramka 02: 0 przy użyciu istniejącego wyniku (alternatywa: +0,2–0,4 mln).
- Role: 4,4–8,8 mln (rachunek: (prompt + czytany materiał) znaków / 3 × 2–4; materiał roli 0,2–0,7 mln znaków z inwentarza E0).
- Soczewki: 0,3–0,45 mln. Weryfikacja przeciwna przy 15–30 pozycjach P0/P1, 3–6 grup: 0,35–1,15 mln.
- M1 (E0 i E0b, ok. 0,3 mln już zużyte; scalanie, raport): 0,8–1,5 mln.
- **Razem 5,9–12,0 mln tokenów** (punkt środkowy ok. 8,5 mln; poprzedni pełny M1 Piekarza: ok. 7,0 mln).
- **Czas agenta:** partia 1 ok. 1,5–2 h, partia 2 ok. 2 h, partia 3 ok. 2–3 h, E2+E3 ok. 2–3 h, **razem ok. 8–10 h** zegarowo.
- **Czas właściciela:** STOP 1 (ok. 10 min), zgoda na uprawnienia (niżej, ok. 5 min) i STOP 2 (decyzje, ok. 30–45 min).
- **Próg przekroczenia:** 1,5 × 12,0 = 18,0 mln (STOP wyjątkowy).
- **Punkt kontrolny po partii 1:** opcja, domyślnie wyłączona (to nie pierwszy M1 tego repo, poprzedni był 19.10); rekomendacja: wyłączony.

## Warunek startu (blokada środowiska)
Filtr uprawnień auto mode zablokował w tej sesji uruchamianie skryptów biblioteki: `node /home/user/prompts/tools/assemble.mjs` (prompty ról) i obowiązkową kontrolę `sprawdz-raport.mjs` (GEN-05). Bez nich fan-out nie spełni GEN-04 ani GEN-05. Opcje:
- (a) **reguła zezwalająca (rekomendacja):** dopisać w ustawieniach Claude Code do `permissions.allow` dwie reguły `Bash(node /home/user/prompts/tools/assemble.mjs:*)` i `Bash(node /home/user/piekarz/audit/M1-2026-11-08/narzedzia/sprawdz-raport.mjs:*)` (oraz `sprawdz-plan.mjs` analogicznie) albo wyłączyć tryb auto na czas audytu;
- (b) subagenci składają prompt ręcznie z listy plików, a kontrolę dowodów robi M1 czytaniem: wyjątek nazwany, ok. +10% tokenów, bez mechanicznej kontroli GEN-05 (słabsze).

## Poza zakresem i niesprawdzalne tu; kroki właściciela w trakcie
- Brak macOS i Xcode: zachowanie na telefonie (powiadomienia przy blokadzie, Dynamic Type AX5, 320 pt, zakupy w piaskownicy) sprawdza test telefonu właściciela (D-226, D-277), a M1 bierze z CI tylko wyniki E2E.
- App Store Connect (produkty, oferty, etykieta prywatności w konsoli): krok właściciela (D-033); role 02 i 10 sprawdzają pliki w repo.
- Gałąź `wip/08-e2e95` i tor B: poza buildem 1023, tylko jako znane otwarte.
- Bez naprawiania i bez pushu na master; K tylko lokalnie (`.git/info/exclude`), a stan na gałęzi `audit-m1/piekarz-2026-11-08`.

## Decyzja
(a) plan jak wyżej: standardowy, bramka użyta ponownie jako wyjątek nazwany, bez punktu kontrolnego, uprawnienia wariantem (a) (rekomendacja) · (b) wariant lekki: E0b + 02, 05, 06, 07, 10, 12, ok. 3,1–6,2 mln tokenów i 5–6 h, werdykt najwyżej „GOTOWE Z ZASTRZEŻENIAMI” · (c) zmiany właściciela (np. wariant głęboki: drugi przebieg 05 lub 12, +0,5–1,0 mln; odświeżenie bramki; punkt kontrolny po partii 1).

## Decyzje właściciela na STOP 1 (2026-11-08)
Słowa (przyciski): wariant „Głęboki”; uprawnienia „Dodam reguły (Recommended)”; bramka „Użyj istniejącej (Recommended)”.
Wykonanie wariantu głębokiego:
- **Drugi niezależny przebieg:** 05-architekt-b (`role/05-architekt-b/`, ID od 05-architekt-501), bo obszar najważniejszy krytycznie to dane i przypomnienia w tle (D-273, Sleep Guard); te same moduły, świeży kontekst, bez wiedzy o przebiegu a. Partia 2.
- **Soczewki:** wszystkie 5 jako subagenci w partii 1 (1 i 5 także, choć M1 przeszedł je sam).
- **Moduły:** wszystkie dotyczące, plus `przeplywy-i-gesty` dla 04 (przepływy AS IS głównej pracy w kuchni).
- **Weryfikacja przeciwna:** P0, P1 i P2 w obszarach krytycznych (dane, prywatność, zakupy, przypomnienia, bezpieczeństwo żywności).
- **Koszt po zmianie:** role 4,6–9,3 mln (prompty z `--statystyki` 58–80 tys. znaków); soczewki 0,5–0,75 mln; weryfikacja 0,6–1,7 mln; M1 0,8–1,5 mln; **razem 6,5–13,3 mln** tokenów, próg STOP wyjątkowego 1,5 × 13,3 = 20,0 mln. Czas agenta ok. 9–12 h. Punkt kontrolny po partii 1: wyłączony.
- **Bramka:** istniejący wynik („przerobić”, 345/500) jako wyjątek nazwany; 02 sprawdza platformę w rachunku (iOS + Google Play wobec 1.0 tylko iOS).

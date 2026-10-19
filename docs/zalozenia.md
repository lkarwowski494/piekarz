# Rejestr założeń — Piekarz

Jeden rejestr dla wszystkich ról. Założenie to twierdzenie, na którym stoją decyzje, a którego prawdziwość nie wynika z kodu (o użytkownikach, rynku, dziedzinie, platformie). Wymaganie, decyzja albo ADR, które na nim stoją, podają „zależy od: ZAL-nnn”. Przy zmianie statusu na „podważone” albo „obalone”: `git grep -n "ZAL-nnn" -- docs src tests` i lista zależnych do decyzji właściciela. *Dlaczego:* błędne założenie z odkrywania przechodzi przez wszystkie role, jeśli każda bierze wejście za prawdę.

Statusy: hipoteza · potwierdzone (dowód) · podważone · obalone. Recenzje (S-27) to szczebel 5: potwierdzają tylko, że motyw występuje, nie jego skalę.

| ID | Założenie | Rola | Status | Dowód (źródło, data) | Zależą od niego |
|---|---|---|---|---|---|
| ZAL-029 | Piekarze przekazują sobie receptury przy spotkaniu, a kod QR jest dla nich wygodny | 03 | hipoteza | `docs/scope-contract.md` (2026-10-19); słaby dowód w recenzjach (3 z 338, S-27) | D-029, J-06 |
| ZAL-030 | Użytkownicy w Polsce mają te same prace i skargi co w próbce US i GB | 01 | hipoteza | w S-27 tylko 5 recenzji z PL (2026-10-19) | P-6, P-7, P-8; rynek główny (E2) |
| ZAL-031 | W kroku czynnym ekran nie powinien gasnąć | 01 | hipoteza | 2 z 338 recenzji (S-17 rec. 12712335936; S-19 rec. 11419881732), 2026-10-19 | J-02, kontekst |
| ZAL-032 | Między krokami użytkownik odchodzi od telefonu i potrzebuje sygnału przy zablokowanym ekranie | 01 | potwierdzone (motyw) | cel właściciela ZP-17; 15 z 338 recenzji (S-14, S-15, S-25), 2026-10-19 | J-02, DEC-02 |
| ZAL-033 | W krokach czynnych ręce są w cieście lub mące, więc dotyk ekranu jest utrudniony | 01 | hipoteza | 0 z 338 recenzji; audyt M1 01-odkrywanie-014 podważył je jako „skargę nr 1”; potrzeba fizyczna niezbadana | J-02, NFR dostępności (E3), DEC-15 |
| ZAL-034 | Początkujący zakłada zakwas w około tydzień do dwóch | 01 | hipoteza | S-14 rec. 6268205554 („a week”); [DO USTALENIA] (OP-31) źródła szczebla 1–3 | J-07, P-6, DEC-01 d (14 dni próby) |
| ZAL-035 | Utrata receptur i notatek to realny powód porzucenia aplikacji | 01 | potwierdzone (motyw) | 10 z 338 recenzji, 8 z nich ≤ 3★ (S-17, S-19, S-24, S-25), 2026-10-19 | J-10 |
| ZAL-036 | Część użytkowników używa w kuchni iPada obok telefonu | 01 | hipoteza | 4 z 338 recenzji (S-14, S-25, S-20), 2026-10-19 | J-10, OP-32 |
| ZAL-037 | Użytkownicy w US potrzebują jednostek imperialnych obok gramów | 01 | potwierdzone (motyw) | 9 z 338 recenzji, 6 z nich ≤ 3★ (S-27), 2026-10-19 | J-01 |
| ZAL-038 | App Store Connect pokazuje przejście z oferty wprowadzającej do płatnego i odnowienia bez telemetrii w aplikacji | 01 | hipoteza | [DO USTALENIA] (OP-33) dokumentacja Apple (E2) | ZP-21 |
| ZAL-039 | Wśród użytkowników są osoby 60+, dla których liczy się czytelność | 01 | hipoteza | 3 z 338 recenzji podaje wiek 60+ (S-17, S-23), 2026-10-19 | NFR dostępności (E3) |
| ZAL-040 | Domowi pizzaiole i piekarze drożdżowi to częściowo ci sami ludzie co piekarze na zakwasie | 01 | hipoteza | S-24 rec. 5769683066 i 13967439345 (zakwas do pizzy), 2026-10-19 | P-8, ZP-23, hipoteza podziału (E2) |
| ZAL-041 | Początkujący potrzebuje instrukcji krok po kroku, a samo liczenie mu nie wystarcza | 01 | potwierdzone (motyw) | 14 z 338 recenzji (S-18, S-19, S-23, S-17), 2026-10-19 | J-08, P-6, ZP-20 |

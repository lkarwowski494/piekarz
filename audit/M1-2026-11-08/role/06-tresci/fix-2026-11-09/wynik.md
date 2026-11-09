06-tresci fix M2 p2 (2026-11-09), gałąź naprawy/M2-koordynator-napraw-2026-11-09-p2, wypchnięta. Rola 06: treść, rejestr i wektory. Kod (`src/`, `app/`) bez zmian, idzie do ról 08 i 07. Jedyny wyjątek: lista D-247 w teście 06z.
Commity: f6f9f162 → 009 (D-303) · ffb4174e → 008 (D-304) · 162a3fa3 → 010 (D-305) · 5628bbfe → 040 (D-306) · 6fec6b7d → 041 (D-307). Przed każdym commitem `npm run verify` dał kod 0 (6116/6116).
Kontrole treści przed i po: 0 błędów (`dowody/kontrole-przed.txt`, `dowody/kontrole-po.txt`). Czerwone przed i nadal czerwone do czasu roli 08: `narzedzia/sprawdz-pieczenie.mjs` (18 rozbieżnych pól, `dowody/008-czerwien-pieczenie.txt`), `narzedzia/sprawdz-maki.mjs` (786 przekładów bez numeru, 265 mąk z kilkoma nazwami, `dowody/041-czerwien-maki.txt`). Też: `dowody/010-teksty-przed-po.txt`, `dowody/040-przelicznik.txt`.
Źródła przeczytane 2026-11-09 (urllib, grep -F; `dowody/008-zrodla-2026-11-09.txt`, `dowody/pizza-zrodlo-2026-11-09.txt`):
- King Arthur, Neapolitan-Style Pizza Crust: „preheat the oven to 500°F to 550°F (if your oven goes to 550°F)”, „6 minutes on the steel” → PIE-PIZ-001.
- King Arthur, Pain de Campagne: „reduce the oven temperature to 450°F and bake the covered loaves for 20 minutes … 20 to 25 minutes uncovered” → PIE-GAR-001; Naturally Leavened Sourdough Bread → PIE-GAR-002.
- CIA, Brioche: „preheat the oven to 400°F and then reduce the heat to 350°F … 20 minutes … 8 to 10 minutes” → PIE-BRI-001. oetker.pl potwierdzony; lesaffre.pl i fleischmannsyeast.com HTTP 403 (zostaje odczyt z 2026-11-03).
Przekazania do roli 08 (dokładne wartości):
- Pizza (D-303): 260/260 °C, 0 + 6 min, stal; zdanie o grillu do `notesPl`. Sześć receptur w garnku (D-304): 232/232 °C, 20 min, bez pokrywki 20–25 min (tartine: para 22 → 20), nagrzewanie 45 min w 260 °C.
- Brioszka: 177/177 °C, 0 + 28 min, keksówka, nagrzewanie do 204 °C, ciafoodies.com na ekran. Plan i fazy biorą wartości z receptury, teksty z `pieczenie-receptur.md`.
- Teksty z `teksty-glownego-przeplywu.md` (D-305); przelicznik drożdży: 4 zdania i 3 domeny na ekran (D-306); klucze mąk na kanon (D-307).
Przekazania do roli 07: wektory `pieczenie-receptur-2026-11-09.json` i `maki-nazwy-2026-11-09.json`, test 06z z 3 domenami, test literałów z liczbą (06-tresci-003).
Dla M2 (014) do przekładu: zdania D-305 poza KRO-POC-010, KWA-TEM-001, ZYT-ETA-005, ZYT-STU-001; zdania D-303, D-304, D-306 (4); 27 nazw mąk (D-307). Wpis EN jest w `docs/tresci/en`.
Do akceptacji roli 04: wszystkie zdania `pieczenie-receptur.md` i `teksty-glownego-przeplywu.md`, w tym nowa rada przy zbyt gorącej wodzie.
Otwarte [DO USTALENIA], wartości bez zmian:
- PIE-BRI-900 (brioszka), PLN-KRO-900 (liczby planu), DDT-WOD-900 (progi 45 i 4 °C), REC-BAZ-900 (receptury bazowe), DRO-PRE-900 (ciabatta, chleb bez wyrabiania).
- MAK-EN-900, MAK-TYP-902, MAK-TYP-903 (mąki); żyto 230/195 °C bez źródła; łotewski chleb żytni 225 °C wobec KAT-RUP-005.
Nowe znaleziska:
- P1: rada „Schłodź mąkę lub obniż temperaturę otoczenia” przy zbyt gorącej wodzie odwraca rachunek RD-05; plan brioszki bierze kroki bochenka w koszyku.
- P2: nazwa „80%” przy wodzie 76% (z zakwasem ok. 78%); PL „typ 650 (chlebowa jasna)” wbrew MAK-NAZ-001.
Nieodbyte: drugi przegląd AI przekładu i przegląd ścieżki wrażliwej (bez narzędzia subagentów; uruchomi je M2). Status „zweryfikowane” nadaje dopiero reaudyt.
Kroki właściciela: brak decyzji. Weto D-303…D-307 możliwe, fakty rozstrzygają źródła.

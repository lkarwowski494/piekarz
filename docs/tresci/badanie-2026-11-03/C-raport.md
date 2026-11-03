# MAS — maszyna do chleba (D-153, D-156), rola 06, odczyt 2026-11-03

**Co znalazłem.** 64 wpisy (`wpisy.json`), 24 krytyczne, 4 `otwarte`; wszystkie cytaty sprawdzone dosłownie na tekście z kopii (`weryf/`), wyjątki opisane w `miejsce`. Tefal PF220838: PDF producenta (IFU, 163 s., 22 języki, PL s. 50–57 / EN s. 58–65) i Safety PDF z dam.groupeseb.com, podlinkowane na tefal.com/instructions-for-use/csp/7211002268 (tefal.pl: 403). Daje: masy 500/750/1000 g („tylko informacyjnie”), limit 620 g mąki / 1000 g ciasta / 10 g drożdży, kolejność płyny→sól→cukier→½ mąki→mleko w proszku→dodatki→½ mąki→drożdże, programy 1–17, opóźniony start do 15 h (nie w programach 5, 11–17), zakaz opóźnienia z surowym mlekiem/jajkami/jogurtem/serem/świeżymi owocami, program 11 (ciasto, bez pieczenia) + 14 (pieczenie 10–70 min). Programu na zakwas brak.

**Uniwersalność — producent → układ → programy** (każda instrukcja: szczebel 1 tylko dla swojego modelu)

| Producent / model | Układ kolejności | Bochenek | Programy chlebowe | Opóźnienie |
|---|---|---|---|---|
| Tefal PF220838 | płyny na dole, drożdże na górze | 500/750/1000 g | klasyczny, szybki, francuski, słodki, pełnoziarn., szybki pełnoz., żytni, 3× bezgl., ciasto, pieczenie | 15 h |
| Zojirushi BB-PDC20 | płyny na dole, drożdże w dołku w mące | 2 lb | White, Whole Wheat, European, Multigrain, GF, Salt/Sugar Free, Vegan, 2× Rapid, Dough, Sourdough Starter | 13 h |
| Panasonic SD-YR2550 | suche w formie, woda na końcu, drożdże w **dozowniku** | M/L/XL = 400/500/600 g mąki | Basic, Rapid, Whole wheat (+Rapid), Brioche, French, Rye, Sourdough, GF, ciasta | 13 h (Sourdough 9 h) |
| Panasonic SD-R2530 | **drożdże na dnie**, suche na nich, płyn na końcu | jw. | jw. bez Rye | jw. |
| Cuisinart CBK-110 | płyny najpierw, suche, drożdże ostatnie | 1/1,5/2 lb | White, French, Whole Wheat (≥50%), Ultra-Fast, Sweet, GF, Artisan Dough, Dough, Bake | 13 h |
| Kenwood BM200 | woda, mąka, dodatki w rogach, drożdże w dołku | 700/900 g | biały, pełnoziarnisty (+szybki), francuski, słodki, ciasto, chleb w 1 h | 12 h |

Wniosek dla trybu uniwersalnego: dwa układy z danych — A „płyny na dole, drożdże na górze” (Tefal, Zojirushi, Cuisinart, Kenwood) i B „drożdże na dnie, płyny na górze” (Panasonic SD-R2530; SD-YR2550 ma dozownik). UKY Extension (szczebel 3): kolejność zawsze wg instrukcji producenta (MAS-060) i nigdy ponad maksimum mąki producenta (MAS-062) — skalowanie do bochenka musi respektować limit modelu.

**Luki [DO USTALENIA]**
- MAS-015: czasy programów Tefal PF220838 — tabela cykli „na końcu instrukcji” nie istnieje w PDF z tefal.com; link „Recipe book” to tylko okładka JPG.
- MAS-073: brak źródła 1–3, które daje dozwolony czas opóźnionego startu z nabiałem/jajkami/mięsem; strona USDA FSIS „Danger Zone (40°F–140°F)” nieprzeczytana (403; web.archive.org zrywał połączenie przez proxy). Regułę 2 h podaje FDA (MAS-070, MAS-071).
- MAS-080: progi „najbliższego programu” — jedyny próg liczbowy: Cuisinart Whole Wheat ≥50% mąki pełnoziarnistej (tylko ten model). Brak progów cukru/tłuszczu (słodki), żytniej, bezglutenowej.
- MAS-ZAK-005: brak źródła 1–3 o pieczeniu w maszynie na samym zakwasie → **tryb maszyny przy wersji na zakwasie odsyła do wersji drożdżowej**. „Sourdough” u Zojirushi (MAS-ZAK-002) i Panasonic (MAS-ZAK-003) to zaczyny **z drożdżami piekarskimi** (6 g; 0,1 g + 3/4 łyżeczki w chlebie).
- MAS-066: dawka Red Star w łyżeczkach na szklankę — bez przeliczenia na % świeżych (brak mas szklanki/łyżeczki w źródle).

**Sprzeczności (część wspólna + różnica)**
- Kolejność: wspólne — drożdże nie mogą stykać się z płynem (i u Tefal z solą) przed startem; różnica — układ A vs B (Panasonic SD-R2530 drożdże na dnie).
- Opóźniony start: wspólne — zakaz z jajkami i mlekiem; różnica — Tefal: „surowe” mleko + świeże owoce; Zojirushi: sok, warzywa; Cuisinart/Kenwood: ser, jogurt; maks. 12–15 h zależnie od modelu.
- Mieszadło: Panasonic i Cuisinart — może być gorące; Zojirushi — wyjmować po ostygnięciu bochenka plastikiem; Tefal — haczykiem, bez wzmianki o temperaturze.
- Temp. płynów: Tefal ≤35 °C przy podgrzewaniu; UKY ≤80 °F (~27 °C); Red Star 80 °F.

**Twierdzenia krytyczne (do przeglądu człowieka)**
- MAS-009 Tefal: „Don’t use the delayed start program for recipes containing: raw milk, eggs, yoghurt, cheese, fresh fruit.” (IFU EN s. 113; PL s. 97–98)
- MAS-023 Zojirushi: „Do not use the timer function if the recipe uses ingredients that can easily spoil such as milk, juice, vegetables, or eggs.” (s. 17)
- MAS-035 Panasonic: „Do not use the timer for the recipe with egg.” (Recipes EN, Eggs)
- MAS-044 Cuisinart: „Do not use perishable ingredients such as milk, eggs, cheese and yogurt with the Delay Start function.” (PDF s. 5)
- MAS-052 Kenwood: „…you must not use perishable ingredients – things that ‘go off’ easily at room temperature or above, such as milk, eggs, cheese and yogurt etc.” (PDF s. 8)
- MAS-070 FDA: „The range of temperatures at which bacteria can grow - usually between 40° F and 140° F (4° C and 60° C).” + „Discard foods left out at room temperature for more than 2 hours. When temperatures are above 90° F (32° C), discard food after 1 hour.” (Moms-to-Be At-a-Glance)
- MAS-071 FDA: „Refrigerate or freeze meat, poultry, eggs, seafood, and other perishables within 2 hours of cooking or purchasing.” (Safe Food Handling, CHILL)
- MAS-072 synteza 5 instrukcji → blokada opóźnionego startu dla nabiału, jajek, sera, jogurtu, mięsa, świeżych owoców/warzyw (uogólnienie, do decyzji); MAS-073 otwarte.
- MAS-010/024/036/053 gorąca forma, rękawice: Tefal „Always use oven mitts, because both the pan’s handle and the inside of the lid are hot.”; Zojirushi, Panasonic, Kenwood analogicznie.
- MAS-013/025/037/045 mieszadło: Panasonic „Be careful not to get burn as the kneading blade may still be hot.”; Cuisinart „the kneading paddle will be extremely hot.”
- MAS-011/026/038 para: Tefal „Be very careful, steam can be released when you open the lid at the end of or during the programme.”; Zojirushi „Do not touch the Steam Vent.”
- MAS-012 okienko Tefal; MAS-014 dzieci <8 lat (Tefal), MAS-026 (Zojirushi), MAS-038 (Panasonic), MAS-053 (Kenwood).
- MAS-002 Tefal limit 620 g mąki / 10 g drożdży (mienie); MAS-062 UKY nie przekraczać maks. mąki producenta.

**Czego nie sprawdzono.** Morphy Richards, Breville, Russell Hobbs; oryginał Panasonic na panasonic.com (403) i Cuisinart na cuisinart.com/.ca (404) — użyte kopie PDF producenta z serwerów sprzedawców (Quelle, Home Depot); trzeba porównać z oryginałem. Czasy Zojirushi i składniki zaczynu odczytane z obrazu stron (pdftoppm), w tekście PDF potwierdzone tylko częściowo. Kenwood BM200 to stary model (plik A1-BM258). Zojirushi BB-PDC20 to model 120 V (rynek USA).

**Źródła odrzucone.** manualslib.mx / manualshive / manuall / manuals.plus (szczebel 5, przedruki — tylko wskazówki); notice-facile; Red Star poza drożdżami (szczebel 4, np. wyjmowanie mieszadła trzonkiem łyżki — nie użyte do treści krytycznej); fora (thefreshloaf, automaticwasher) i streszczenia wyszukiwarki; foodsafety.gov (403, nieprzeczytane). Instrukcji dla AI w treści stron nie znalazłem.

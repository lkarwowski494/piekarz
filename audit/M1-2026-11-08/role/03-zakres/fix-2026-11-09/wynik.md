# Rola 03 (zakres) · tryb fix · M2 partia 3 · 2026-11-09

Gałąź `naprawy/M2-koordynator-napraw-2026-11-09-p3`, od `831199d7` (po D-308) do `1f5eac3a`, wypchnięta. Drzewo czyste.

## E0 · środowisko i plan
- Linux VM (kernel 6.18), Node v22.23.4, git; push na gałąź roboczą działa; brak macOS, Xcode i symulatora — zrzutów ekranu nie robiłem (tekst ekranu Pro sprawdzają testy renderujące).
- Stan wyjściowy: `npm run verify` na `831199d7` kod **1** — jedyny czerwony test `src/__tests__/dzis-plany-d5.test.tsx` (zależny od pory dnia, nowe znalezisko N-1 niżej), 6449/6450 (`dowody/verify-start-HEAD-831199d7.txt`).
- Klasyfikacja: wszystkie 6 ID to **P** z decyzją właściciela (D-286: DEC-01 a, DEC-02 a, DEC-04 a, DEC-09 a ×2, DEC-19 b). Dowodów przeciw wyborom nie znalazłem. 015 zmienia kod i teksty (polecenie M2 obejmuje i18n); pozostałe tylko kontrakt, rejestr założeń i testy.
- `zakres.mjs --brd docs/brd` przed: kod 1, 27 błędów (`dowody/zakres-mjs-przed.txt`).

## E1/E2 · commity na ID
| ID planu | Źródło | Commit | Test (czerwony przed → zielony po) | Zmiana |
|---|---|---|---|---|
| M1-audytor-generalny-015 | 01-odkrywanie-001, 03-zakres-002 | e8345215 | `tests/obietnice-pro-015.test.ts`: 2 z 3 czerwone na „porównanie” (`dowody/015-przed.txt`) → zielone | „Co daje Pro”: `src/components/PaywallModal.tsx:73` „Receptury i Dziennik: więcej własnych receptur i statystyki wypieków.”; blokada Dziennika `src/lib/platnosci/nazwy-pro.ts:28` = istniejący klucz „Statystyki piekarni domowej”; EN + 33 języki (`docs/lokalizacja/przeklad-m2-015-2026-11-09.json`); F-63 z adnotacją DEC-04 a |
| M1-audytor-generalny-058 | 03-zakres-001 | 7526830d | `tests/kontrakt-zm28-058.test.ts`: 5/5 czerwone (`dowody/058-przed.txt`) → zielone | ZM-28 (pakiet D-092 wstecz), F-73…F-78, F-80, F-81 MVP, F-79 widżet PÓŹNIEJ (H-19), F-76 podłoga BR-ETAP-006, F-82 Źródła wiedzy i F-83 Licencje w tabeli „bez BR”, adnotacje KL-09 i F-17; `scripts/br-wyjatki.json` BR-KAL-012 → F-79 |
| M1-audytor-generalny-062 | 03-zakres-006 | 6caf322b | `tests/kontrakt-wyjatki-h-062.test.ts`: 2/2 czerwone (`dowody/062-przed.txt`) → zielone | F-72, F-75, F-78, F-80, F-81: wyjątek od zasady 18 z D-nnn, ZAL-nnn i „Ocena: 90 dni po wydaniu 1.0, pierwszy termin 2027-03-31”; nowe ZAL-061 (J-16, F-72) |
| M1-audytor-generalny-061 | 03-zakres-005 | e58a3ac1 | `tests/kontrakt-receptury-plan-061.test.ts`: 3/3 czerwone (`dowody/061-przed.txt`) → zielone | F-26: „26 receptur bazowych, z czego 11 z planem i prowadzeniem krok po kroku”, 15 bez zakwasu bez planu (D-252, D-274), wersja drożdżowa w 4 recepturach (było „9”), z planem w 3; F-55 i ZM-25 nazywają D-252 |
| M1-audytor-generalny-065 | G9 H4 | 7f520c7b | `tests/kontrakt-odlozone-065.test.ts`: 2/2 czerwone (`dowody/065-przed.txt`) → zielone | ZM-29: diagnoza przy „Piecz ponownie” PÓŹNIEJ do 1.1 (DEC-19 b, D-276 pkt 5), „Powrót:”; F-43 odsyła do ZM-29 |
| M1-audytor-generalny-064 | 03-zakres-008 | 1f5eac3a | `tests/kontrakt-ranking-064.test.ts`: 2/2 czerwone (`dowody/064-przed.txt`) → zielone | ranking: F-71, F-73…F-81; F-26 2 → 7 h, F-55 4 → 5 h; „Suma MVP (przeliczenie 2026-11-09): 97 h” wobec 60 h (D-040) i 68 h (D-043); decyzja apetytu **otwarta** |

Każdy commit: `git add`, potem `TZ=Pacific/Honolulu npm run verify` kod 0 (`dowody/015-verify.txt`, `dowody/058-verify.txt`, `dowody/062-verify.txt`, `dowody/061-verify.txt`, `dowody/065-verify.txt`, `dowody/064-verify.txt`; ostatni 623 zestawy, 6467 testów). TZ dlatego, że jedyny test czerwony na HEAD przed moją pracą (N-1) przechodzi tylko przed ok. 12:45 czasu lokalnego; bez TZ pada identycznie na `831199d7` i na `1f5eac3a` (`dowody/nowe-dzis-plany-d5-UTC.txt`, `dowody/nowe-dzis-plany-d5-Honolulu.txt`). Moje zmiany nie dotykają tego testu ani formatu dat.

`zakres.mjs --brd` po: kod 1, 10 błędów (`dowody/zakres-mjs-po-064.txt`) — wszystkie poza moim zakresem: F-72 bez BR, BR-MASZ-001…006, BR-KALK-012, BR-RECP-005 (zadanie 059, 03-zakres-003) i BR-DANE-005 (ER-82). Błędy BR-KAL-001…016 i BR-ETAP-006: 17 → 0. Test akceptacyjny 03-zakres-001 („kod 0”) spełni się dopiero po 059 i decyzji o BR-DANE-005; do tego czasu trwała kontrola `tests/kontrakt-zm28-058.test.ts` trzyma listę wyjątków z ID zadań (lista tylko maleje).

## Decyzja właściciela potrzebna (064, apetyt 1.0)
Suma MVP 97 h [OCENA] (+29 h od D-043: F-72 6 h, F-71 2 h, pakiet D-092 15 h, katalog i wersje drożdżowe +5 h, ZM-24 +1 h). Opcje:
- (a) przyjąć 97 h jako apetyt 1.0; nic nie wypada; cięcie po ocenie wyjątków na H (062, termin 2027-03-31) — **rekomendacja**: funkcje są zbudowane i przetestowane, koszt to głównie test na telefonie przy wydaniu; cięcie teraz to zmiana kodu, ekranu Pro i przekładu przed 1.0.
- (b) odłożyć miesiąc i rytm (F-80, F-81) ukryciem wejść — 94,5 h; zadanie dla roli 08 i 09, ekran Pro traci dwa argumenty.
- (c) wrócić do 68 h — odłożyć F-75, F-78, F-80, F-81, F-71, F-74, F-77 i część katalogu; duża zmiana przed 1.0.
Czas właściciela: jedna decyzja, ok. 2 min. Wpis decyzji: rola 03 w kontrakcie (linia apetytu, blok pod „Ranking”) i w `docs/decyzje.md`.

## Przekazania
- **02 (monetyzacja):** `docs/monetyzacja.md:10`, `docs/monetyzacja.md:48`, `docs/monetyzacja.md:70` nadal wymieniają „porównanie” w Pro; po DEC-04 a w 1.0 tylko statystyki (BR-RECP-004 = F-63 PÓŹNIEJ). Dokument roli 02 — nie zmieniałem.
- **01 (BRD):** `docs/brd/wymagania-dziennik.md:58` „porównanie i statystyki w Pro” (jak wyżej); brak BR dla F-82 Źródła wiedzy (D-123), F-83 Licencje open source (D-291) i dla przeniesienia diagnozy na następny wypiek (ZM-29, 1.1) — trzy ER do nadania przez rolę 01.
- **04 (projekt):** `docs/design/karty/inne.html:38` karta „Porównanie i statystyki”; teksty do akceptacji niżej; przejście poznawcze F-73…F-81 (03-zakres-007 / 063, backlog D-288).
- **07 (jakość):** nowe trwałe kontrole: `tests/obietnice-pro-015.test.ts`, `tests/kontrakt-zm28-058.test.ts`, `tests/kontrakt-wyjatki-h-062.test.ts`, `tests/kontrakt-receptury-plan-061.test.ts`, `tests/kontrakt-odlozone-065.test.ts`, `tests/kontrakt-ranking-064.test.ts`; N-1 niżej.
- **08:** brak zadań kodu z tej partii (DEC-02 a, DEC-01 a, DEC-09 a, DEC-19 b: kod bez zmian).
- **10 (wydanie):** opis sklepu według stanu receptur z F-26 („26 receptur, z czego 11 z planem i prowadzeniem krok po kroku”) — zadanie 080.
- **M2:** drugi przegląd AI przekładu 015 i przegląd ścieżki wrażliwej (zakupy: ekran Pro) — **nieodbyte** (subagent bez narzędzia subagentów); polecenia: `polecenia/przeglad-sciezki-wrazliwej-015.md`.

## Teksty do akceptacji roli 04
1. „Receptury i Dziennik: więcej własnych receptur i statystyki wypieków.” (EN „Recipes and Journal: more of your own recipes, plus baking statistics.”) — zdanie „Co daje Pro”.
2. „Statystyki piekarni domowej” jako nazwa blokady w Dzienniku (wiersz „Statystyki piekarni domowej, Pro”; dotąd tytuł karty statystyk, bez nowego przekładu).

## Nowe znaleziska
- **N-1 (P2, D, realny):** `src/__tests__/dzis-plany-d5.test.tsx:125` oczekuje wzorca `/Chleb na sobotę: gotowe .+ o \d{1,2}:\d{2}/`, a po 048 (forma z dwukropkiem dla dat odległych) ekran pokazuje `Chleb na sobotę — gotowe: czwartek, 12 listopada, 00:01`; plan zaczyna się `Date.now() + 30 h`, więc test przechodzi tylko, gdy gotowość wypada pojutrze (przed ok. 12:45 czasu lokalnego). `npm run verify` pada każdemu po południu UTC. Naprawa: rola 07/08 — stały zegar w teście albo oczekiwanie obu form (bez zmiany produktu).
- **N-2 (P2, D):** wiersz F-43 w kontrakcie nadal mówi „F-71 PÓŹNIEJ (ZM-19)”, a F-71 jest MVP od ZM-23; „Definicja ukończenia” podaje „0 błędów, kod 0” z 2026-10-20 — do poprawki w 059 (03-zakres-003).

## Przeczytane źródła
Tylko rejestr projektu (bez źródeł zewnętrznych): `docs/decyzje.md` (D-092, D-104, D-108, D-109, D-114, D-115, D-123, D-173, D-174, D-276, D-286, D-291, D-308; odczyt 2026-11-09), `docs/brd/wymagania-kalendarz.md`, `docs/brd/odkrywanie.md` (J-13…J-16, H-19, H-20), `docs/zalozenia.md`, plan M1 (`plan-napraw.json`: DEC-01, -02, -04, -09, -19), `weryfikacja/G9-luki.md` (H4). Cytat recenzji Loaflo w ZM-29 z linii bazowej M1 (`role/03-zakres/dowody/e0b-recenzje-probka.txt`, 1 trafienie).

## Kontrola dowodów i sekretów
`node sprawdz-raport.mjs wynik.md /home/user/piekarz .` (skrypt z promptu roli w scratchpadzie): „OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone”, kod 0.

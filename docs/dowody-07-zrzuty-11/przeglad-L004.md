# Zrzuty #11 + #12 — przegląd L-004 (subagent koordynatora M9, 2026-11-13)

Komplet: #11 run 43427151863 (master `c6e34ba6`, artefakt `sklep-zrzuty` 14076743592, 455 plików) + #12 run 43517676055 (master `98efd38b`, `tylko=el,en-AU,en-CA`, `rozmiary=6.3`; artefakty `sklep-zrzuty` 14086335551, 21 plików, i `sklep-ramki` 14085083131, 21 plików). Pobrane 2026-11-13 ~23:48 UTC narzędziem GitHub MCP (`download_workflow_run_artifact`) do scratchpadu koordynatora (`l004/z11`, `l004/z12`, `l004/r12`); obrazów nie commituję.

Zasada L-004: „przegląd każdego obrazu przez agenta (L-004, docs/40:671-677), potem akceptacja właściciela” (`docs/koordynacja/zrzuty-trening-2026-11-10.md` na `koordynacja`). Plik `docs/40-*` nie istnieje w repo Piekarza (`git ls-tree origin/master docs/` — brak), odwołanie dotyczy repo Trening, którego nie czytałem. Kryteria przyjęte z polecenia koordynatora: P1 = blokuje wysyłkę (zły język, tekst ucięty, pusty ekran, okno systemowe, dane osobowe, zła scena); P2 = szlif. Zakres jak KO-056/057 („PL + próbka”).

## Wynik w skrócie
- **Kontrola mechaniczna: 476/476** (34 lokalizacje × 2 rozmiary × 7 scen), 0 braków, 0 nadmiarowych, wymiary zgodne z klasą, wszystkie PNG RGB bez alfy, 0 duplikatów bajtowych; 2 pary identyczne pikselowo tylko w obrębie tego samego języka (en-AU = en-CA, 6,9″, 02 i 04) — oczekiwane.
- **Obrazy obejrzane: 121** (pl 14, fr-FR 14, it 14, el 6,9″ 7, #12 surowe 21, #12 ramki 21, próbka 30 lokalizacji × 1).
- **P1 w obrazach: 0.** Wszystkie obejrzane w języku lokalizacji, właściwa scena, bez okien systemowych, bez danych osobowych (dane fikcyjne: „Mój zakwas”, „Wiejski chleb codzienny na zakwasie”), bez pustych ekranów.
- **P1 procesowy: 1** — dla 455 ramek z #11 nie ma `sklep-ramki` (zadanie „podpisy i ramki” pominięte, bo `komplet` był czerwony), a `asc-zrzuty.yml` bierze `sklep-ramki` z jednego przebiegu. Komplet do wysyłki (ramki z podpisami dla 34 lokalizacji) dziś nie istnieje; ramki 31 lokalizacji nie zostały więc obejrzane.
- **P2: 11** (wszystkie systemowe, opisane niżej).

## Kontrola mechaniczna (wszystkie 476)
Skrypt `l004-skrypty/mech.py` (Pillow 12.3.0, `python3 -I`) na `z11` + `z12`; wynik `l004-skrypty/mech.txt`:
```
plików 476
lokalizacji 34 ['cs', 'da', 'de-DE', 'el', 'en-AU', 'en-CA', 'en-GB', 'en-US', 'es-ES', 'es-MX', 'fi', 'fr-CA', 'fr-FR', 'hr', 'hu', 'id', 'it', 'ja', 'ko', 'ms', 'nl-NL', 'no', 'pl', 'pt-BR', 'pt-PT', 'ro', 'ru', 'sk', 'sl', 'sv', 'tr', 'uk', 'vi', 'zh-Hant']
brak 0 []
nadmiarowe []
tryby {('PNG', 'RGB'): 476}
złe wymiar/alfa 0 []
duplikaty bajtowe 0
duplikaty pikselowe 2
  ['en-CA/iphone-6.9/02-receptura.png', 'en-AU/iphone-6.9/02-receptura.png']
  ['en-CA/iphone-6.9/04-doktor.png', 'en-AU/iphone-6.9/04-doktor.png']
```
- Wymiary wg `.github/workflows/zrzuty-sklepu.yml:276-277`: `iphone-6.9` 1320×2868, `iphone-6.3` 1206×2622 — wszystkie zgodne.
- Kolizje ścieżek #11/#12: brak (#12 ma dokładnie 21 brakujących w #11: el, en-AU, en-CA × `iphone-6.3` × 7).
- Podobieństwo między lokalizacjami (`blisko.py`, odsetek pikseli różnych o >24 na miniaturze 151×328): pary poniżej 0,03 tylko en-* ↔ en-* i fr-CA ↔ fr-FR; najbliższa para różnych języków: cs ~ sk 0,0499 (6,3″, 01-plan; różny tekst, obejrzany cs). Brak obrazu w złym języku wykrytego tą miarą.
- Ramki #12 (`r12`, 21): 1206×2622, RGB, bez alfy.

## Kryterium wyboru 3 lokalizacji z najdłuższym tekstem
Średnia długość przekładu (znaki wartości) w słownikach aplikacji `src/lib/i18n-slowniki/*` i `src/lib/i18n-en` na `98efd38b`: fr 57,2, it 55,8, el 54,9, es-419 54,5, id 54,2, es 54,0, de 53,8 … ja 24,2, zh-Hant 19,0. Wybrane: **fr-FR, it, el** (el 6,3″ i tak w całości z #12, więc dla el pełne 6,9″). de-DE w próbce (03, 6,9″).

## Tabela obejrzanych obrazów
Werdykt: OK = bez uwag; P2-n = uwaga z listy niżej. Pliki: `<lok>/iphone-<rozmiar>/<scena>.png` w artefakcie danego przebiegu.

### pl (pełne, #11)
| rozmiar | 01-plan | 02-receptura | 03-prowadzenie-ciemny | 04-doktor | 05-zakwasy | 06-dziennik | 07-offline |
|---|---|---|---|---|---|---|---|
| 6,9″ | P2-3 | P2-3, P2-8 | OK | OK | P2-1 | OK | P2-2 |
| 6,3″ | P2-3 | P2-3, P2-8 | OK | P2-3 | P2-3 | OK | P2-2 |

### fr-FR, it (pełne, #11; najdłuższy tekst)
| lok. | rozmiar | 01 | 02 | 03 | 04 | 05 | 06 | 07 |
|---|---|---|---|---|---|---|---|---|
| fr-FR | 6,9″ | P2-6 | P2-3 | P2-5 | P2-3 | OK | P2-4 | OK |
| fr-FR | 6,3″ | P2-6 | P2-3 | P2-5 | P2-3 | P2-1, P2-3 | P2-4 | OK |
| it | 6,9″ | OK | P2-3 | P2-5 | P2-3 | OK | OK | OK |
| it | 6,3″ | P2-3 | P2-3 | P2-5 | OK | P2-1 | OK | P2-2 |

### el (6,9″ z #11 pełne; 6,3″ z #12 surowe i ramki)
| źródło | 01 | 02 | 03 | 04 | 05 | 06 | 07 |
|---|---|---|---|---|---|---|---|
| el 6,9″ #11 | P2-3 | P2-3 | P2-5 | P2-3 | OK | P2-4 | P2-2 |
| el 6,3″ #12 surowe | P2-3 | P2-3 | P2-5 | P2-3 | P2-1 | OK | P2-2 |
| el 6,3″ #12 ramki | P2-10 | OK | OK | OK | P2-10 | OK | OK |

### en-AU, en-CA 6,3″ (#12 surowe i ramki)
| źródło | 01 | 02 | 03 | 04 | 05 | 06 | 07 |
|---|---|---|---|---|---|---|---|
| en-AU surowe | P2-6 | P2-3 | OK | P2-7 | P2-3 | OK | OK |
| en-AU ramki | P2-10 | OK | OK | P2-7 | P2-10 | OK | OK |
| en-CA surowe | P2-6 | P2-3 | OK | P2-7 | P2-1 | P2-4 | P2-4 |
| en-CA ramki | P2-10 | OK | OK | P2-7 | P2-10 | P2-4 | P2-4 |

Podpisy ramek #12 (nagłówek z `docs/wydanie/metadane/<kod>.json`, pole `ramki[].naglowek`) zgodne z metadanymi dla el i en-AU 01 („Στην ώρα σας, με προστασία ύπνου”, „Ready at Your Time, Sleep Protected”), bez ucięć, ≤ 2 wiersze; oznaczenie „requires Baker Pro” / „απαιτεί Αρτοποιός Pro” na 01 i 05 = `t('wymaga Piekarz Pro')` ze słowników (`src/lib/i18n-en/czesc-12.ts:193`, `src/lib/i18n-slowniki/el/czesc-11.ts:41`).

### Próbka: po 1 scenie z pozostałych lokalizacji (#11; sceny rotowane 01→07, rozmiar naprzemiennie)
| lok. | rozmiar | scena | werdykt |
|---|---|---|---|
| cs | 6,9″ | 01-plan | P2-3 |
| da | 6,3″ | 02-receptura | P2-3 |
| de-DE | 6,9″ | 03-prowadzenie-ciemny | OK |
| en-AU | 6,9″ | 04-doktor | P2-7 |
| en-CA | 6,9″ | 05-zakwasy | P2-1 |
| en-GB | 6,3″ | 06-dziennik | OK |
| en-US | 6,9″ | 07-offline | P2-2 |
| es-ES | 6,3″ | 01-plan | P2-3 |
| es-MX | 6,9″ | 02-receptura | P2-3 |
| fi | 6,3″ | 03-prowadzenie-ciemny | P2-5 |
| fr-CA | 6,9″ | 04-doktor | P2-3 |
| hr | 6,3″ | 05-zakwasy | P2-3 |
| hu | 6,9″ | 06-dziennik | P2-4 |
| id | 6,3″ | 07-offline | OK |
| ja | 6,9″ | 01-plan | OK |
| ko | 6,3″ | 02-receptura | P2-3 |
| ms | 6,9″ | 03-prowadzenie-ciemny | P2-5, P2-11 |
| nl-NL | 6,3″ | 04-doktor | OK |
| no | 6,9″ | 05-zakwasy | P2-1 |
| pt-BR | 6,3″ | 06-dziennik | P2-4 |
| pt-PT | 6,9″ | 07-offline | OK |
| ro | 6,3″ | 01-plan | P2-3 |
| ru | 6,9″ | 02-receptura | P2-3, P2-9 |
| sk | 6,3″ | 03-prowadzenie-ciemny | P2-5 |
| sl | 6,9″ | 04-doktor | OK |
| sv | 6,3″ | 05-zakwasy | P2-1, P2-3 |
| tr | 6,9″ | 06-dziennik | OK |
| uk | 6,3″ | 07-offline | P2-2 |
| vi | 6,9″ | 01-plan | P2-3 |
| zh-Hant | 6,3″ | 02-receptura | P2-3 |

## Uwagi

### P1
- **P1-proces-1 (wszystkie lokalizacje poza el/en-AU/en-CA 6,3″; oba rozmiary; wszystkie sceny):** brak ramek z podpisami dla 455 obrazów #11. W #11 `podpisy i ramki` pominięty (`diagnoza-11.md`: „`podpisy i ramki` pominięty (zależy od `komplet`)”; lista artefaktów #11 bez `sklep-ramki`). `asc-zrzuty.yml:2-3` i `:68-72`: wejście to artefakt `sklep-ramki` jednego przebiegu (`run-id: ${{ inputs.ramki_z_przebiegu }}`), a #12 ma tylko 21 ramek. Do wysyłki potrzebne ramki dla 476 w jednym artefakcie (np. przebieg tylko z zadaniem ramek na złożonym komplecie albo pełny przebieg — decyzja koordynatora/właściciela). Do tego czasu podpisy 31 lokalizacji nie przeszły L-004. Nie jest to wada obrazu.

### P2 (szlif; żadna nie blokuje wysyłki)
- **P2-1 05-zakwasy, wiele lokalizacji, oba rozmiary** (np. `pl/iphone-6.9/05-zakwasy.png`: nagłówek „6 godzin 4 minuty od dokarmienia”, karta „6 godzin 5 minut od dokarmienia”; `el/iphone-6.3` 4 vs 5; `sv/iphone-6.3` 3 vs 4; `en-CA/iphone-6.3` 4 vs 5): dwie różne liczby minut na jednym ekranie (zrzut na granicy minuty).
- **P2-2 07-offline (ekran „Dziś”), 6,3″ i część 6,9″** (`pl/iphone-6.3/07-offline.png`, `it/iphone-6.3`, `el/iphone-6.9`, `uk/iphone-6.3`, `en-US/iphone-6.9`): tytuł bieżącego kroku („Autoliza (mąka + woda)”) albo przycisk przecięty górną krawędzią paska zakładek; w `en-AU/iphone-6.3` karty kroku nie widać wcale (sama spirala).
- **P2-3 kadr przewinięcia, wszystkie lokalizacje:** element przecięty górną krawędzią pod nagłówkiem — 01-plan: wiersz przycisków temperatury (`it/iphone-6.3/01-plan.png`: „20°C 22°C…” do połowy), 02-receptura: pierwszy widoczny składnik do połowy (`ru/iphone-6.9/02-receptura.png`: tylko „белок 12,4–15,5% 379 g”), 04-doktor: plakietka „Grave difetto strutturale” / pozostałość „Καθαρισμός επιλεγμένων συμπτωμάτων” (`it/iphone-6.9/04-doktor.png`, `el/iphone-6.3/04-doktor.png`); na dole tekst ucięty przez przyciski lub pasek zakładek (np. `da/iphone-6.3/02-receptura.png` „lad den hæve i …”, `sv/iphone-6.3/05-zakwasy.png` „Idag 09:37: Observation: Har dubblat …”). Kadr, nie obcięcie tekstu przez układ.
- **P2-4 daty różne między lokalizacjami:** „dziś” = sob. 14, niedz. 15 albo pon. 16 listopada (np. `fr-FR/iphone-6.9/06-dziennik.png` „samedi 14 novembre”, `pl/iphone-6.9/06-dziennik.png` „niedziela, 15 listopada”, `en-CA/iphone-6.3/06-dziennik.png` i `07-offline` „Monday, November 16”, tydzień „November 15 – November 21”). Źródło: zegar maszyny CI (`docs/wydanie/zrzuty/README.md`, sekcja „Zrzuty natywne”: „godziny w planie wypieku pochodzą z zegara maszyny CI”). Każdy obraz spójny wewnętrznie.
- **P2-5 wielka litera w środku zdania przy nazwie następnego kroku (03-prowadzenie-ciemny):** fr „puis Mélange avec le sel…”, it „poi Impasto con sale…”, el „μετά Ανάμειξη…”, fi „sitten Sekoitus…”, sk „potom Zmiešanie…”, ms „kemudian Gaul…” (pl, en, de: mała litera).
- **P2-6 łamanie kolumny godzin w osi czasu 01-plan:** fr-FR oba rozmiary „Aujourd'/hui” w dwóch wierszach; en-AU/en-CA 6,3″ „9:44 am / – / 3:44 pm” z kreską w osobnym wierszu.
- **P2-7 en (en-AU, en-CA) 04-doktor:** zbędne nawiasy „Do the poke test (Poke Test)…”, „…at peak volume (Peak).”.
- **P2-8 zapis temperatury:** „232°C” bez spacji w opisie receptury obok „24–25,5 °C” i „10 °C” na innych ekranach (wszystkie lokalizacje, 02-receptura).
- **P2-9 ru 02-receptura:** jednostka „g” łacińska („379 g”, „Всего 900 g”) zamiast „г”; „Доля ржи 20 %” ze spacją obok „70,9%” bez spacji.
- **P2-10 ramki #12, 01 i 05 (Pro):** plakietka „requires Baker Pro” ok. 30 px od górnej krawędzi obrazu (`r12/el/iphone-6.3/01-plan.png`, wycinek 1206×260 obejrzany) — mieści się, ale margines mały względem marginesów bocznych.
- **P2-11 ms 03-prowadzenie-ciemny:** „Buat Asal Sebelumnya” jako „Cofnij poprzedni” — przekład do sprawdzenia przez native (nie oceniam jakości przekładu poza oczywistymi błędami).

## Do pokazu właścicielowi (poza gitem)
`/tmp/claude-0/-home-user-piekarz/ccdf9fc0-c4a0-5b85-9dcc-b5a77df509fb/scratchpad/pokaz/`: 4 ramki #12 (el 01, en-AU 03, en-CA 04, en-AU 07) i 5 surowych #11 (pl 6,9″ 01, pl 6,9″ 05 z P2-1, pl 6,3″ 07 z P2-2, ja 6,9″ 01, de-DE 6,9″ 03).

## Nie sprawdzono
- Ramki z podpisami dla 455 obrazów #11 (nie istnieją, P1-proces-1); podpisy 31 lokalizacji.
- 355 z 476 surowych obrazów obejrzanych tylko mechanicznie (bez oglądania).
- Jakość przekładu poza oczywistymi błędami; poprawność merytoryczna treści (liczby receptury, wskazówki Doktora).
- `docs/40-*` z repo Trening (tekst L-004 w oryginale) — w repo Piekarza go nie ma.
- Czy 03-prowadzenie powinno mieć oznaczenie Pro w ramce (D-364) — nie czytałem `store-frames.sh`.
- Wygląd na telefonie (rozmiar fizyczny, skalowanie przez App Store) — obrazy oglądane jako montaże 3×1 po 520 px szerokości.

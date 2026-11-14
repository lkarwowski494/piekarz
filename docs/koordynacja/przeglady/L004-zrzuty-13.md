# Zrzuty #13: przegląd L-004 ramek sklepu (subagent koordynatora M9, 2026-11-14)

Źródło: run 43530743771 (master `98efd38b`, attempt 2), artefakty `sklep-ramki` 14105634649 (476 plików, 221 MB zip) i `sklep-zrzuty` 14105289287 (476 plików). Pobrane 2026-11-14 ~08:51 UTC przez GitHub MCP `download_workflow_run_artifact` + `curl -L` do `scratchpad/l004-13/` (dane niezaufane; nic nie uruchamiane; skrypty w `scratchpad/skrypty13/`, `python3 -I`, Pillow 12.3.0). Nic nie wysłano, nic nie commitowano.
Kryteria jak w `docs/dowody-07-zrzuty-11/przeglad-L004.md` (gałąź `naprawy/M2-koordynator-napraw-2026-11-13-zrzuty-11`): P1 = blokuje wysyłkę (zły język, tekst ucięty, pusty ekran, okno systemowe, dane osobowe, zła scena); P2 = szlif; P3 = drobiazg / do oceny native.

## Wynik w skrócie
- **Mechanicznie: 476/476 ramek**, 0 braków, 0 nadmiarowych, każda surowa ma ramkę o tej samej ścieżce (i odwrotnie).
- **Obejrzane: 92 ramki** (lista: `skrypty13/obejrzane.txt`) + wycinki pełnej rozdzielczości (podpisy vi, tekst id, cyrylica, kafelki 07 wszystkich 34 lok. 6,3″).
- **P1: 1** (tekst ucięty w `id/iphone-6.3/04-doktor.png`). **P2: 13** (9 z 11 poprzednich nadal widocznych + 4 nowe). **P3: 2.**
- **Podpisy ramek: 0 błędów** w 92 obejrzanych — zgodne z `ramki[].naglowek` w `docs/wydanie/metadane/<kod>.json` @98efd38b, bez ucięć, ≤ 2 wiersze, właściwe kroje (Sofia; Noto dla vi/ru/uk; Noto CJK dla ja/ko/zh-Hant), diakrytyki poprawne (vi, ro ș/ț z przecinkiem, cs/sk/hu/tr), bez tofu. Oznaczenie Pro tylko na 01 i 05, w języku lokalizacji (`ramki-sklepu.json` → `oznaczenie`). Brak okien systemowych i danych osobowych (dane fikcyjne).

## Kontrola mechaniczna (wszystkie 476; `skrypty13/mech.py`)
```
ramki 476: dims {iphone-6.3 1206×2622: 238, iphone-6.9 1320×2868: 238}; PNG colortype 2 (RGB) 8 bit, bez tRNS: 476
lokalizacji 34, po 14 plików; duplikaty bajtowe 0; surowe bez ramki []; ramki bez surowej []
```
- 476 = 34 lok. × 2 rozmiary × 7 scen — zgodne z oczekiwaniem. Wymiary = klasy 6,9″ (1320×2868) i 6,3″ (1206×2622) z `podpisy.json` (`klasy.px`). Bez kanału alfa.
- Źródło podpisów: `podpisy.json` istnieje tylko dla pl, en-US, nl-NL (`docs/wydanie/zrzuty/<kod>/podpisy.json`) i jest zgodny z metadanymi; dla pozostałych 31 źródłem jest `docs/wydanie/metadane/<kod>.json` (`ramki-sklepu.json._opis`: „Podpis ramki = `ramki[i].naglowek` z docs/wydanie/metadane/<kod>.json”). Tabela: `skrypty13/podpisy-tabela.txt`.

## Wybór lokalizacji
Najdłuższe podpisy (średnia znaków `naglowek`, 7 ekranów): **nl-NL 33,1, id 32,4, it 32,3** (dalej es-MX 31,9, max 39 znaków: id, el, vi; limit `maxZnakow` 40). Obejrzane w całości: pl 14, nl-NL 14, id 14, it 14, vi 6,3″ 7; CJK: ja 6,9″ 01, ko 6,3″ 03, zh-Hant 6,9″ 05; po 1 ramce z 26 pozostałych (sceny rotowane, rozmiar naprzemiennie): cs 6,3 02, da 6,9 03, de-DE 6,3 04, el 6,9 05, en-AU 6,3 06, en-CA 6,9 07, en-GB 6,3 01, en-US 6,9 02, es-ES 6,3 03, es-MX 6,9 04, fi 6,3 05, fr-CA 6,9 06, fr-FR 6,3 07, hr 6,9 01, hu 6,3 02, ms 6,9 03, no 6,3 04, pt-BR 6,9 05, pt-PT 6,3 06, ro 6,9 07, ru 6,3 01, sk 6,9 02, sl 6,3 03, sv 6,9 04, tr 6,3 05, uk 6,9 06. Podpisy wszystkich 34 lokalizacji obejrzane na co najmniej 1 ramce.

## P1
- **P1-1 `id/iphone-6.3/04-doktor.png` — tekst ucięty w treści ekranu.** Punkt listy „Yang perlu dilakukan…”: „Pastikan starter ragi alami digunakan saat volumeny” i pusty wiersz pod spodem; brak końca „…volumenya di puncak.” (wycinek 1000×280 od y=1520 obejrzany). Ta sama scena w 6,9″ ma pełne zdanie. Wada renderu tekstu aplikacji (drugi wiersz niewidoczny), nie ramki. E2: nie obalone — kryterium „tekst ucięty” z poprzedniego przeglądu; dotyczy 1 z 476 obrazów, naprawa = ponowienie zrzutu id 6,3″ (i ustalenie przyczyny, `[DO USTALENIA]` czy powtarza się w innych 04-doktor 6,3″, których nie obejrzałem: obejrzane 04 6,3″: pl, nl-NL, id, it, vi, de-DE, no).

## P2 ze #11/#12 — stan w #13
| ID | Stan | Przykłady w #13 |
|---|---|---|
| P2-1 dwie liczby minut na 05 | **występuje** w 6,3″ i części 6,9″ | `pl/iphone-6.3/05-zakwasy.png` 3 vs 4 min; nl-NL 6,3 3/4; it 6,3 4/5; zh-Hant 6,9 2/3; pt-BR 6,9 4/5; tr 6,3 4/5. Zgodne: pl 6,9, nl-NL 6,9, id 6,9, el 6,9 |
| P2-2 07: karta kroku ucięta paskiem zakładek | **występuje** | `pl/iphone-6.9/07-offline.png` (przycisk), pl/nl-NL/id/it/vi/fr-FR 6,3 (karty brak albo tytuł przecięty), ro 6,9 („Înapoi la coacere” ucięty) |
| P2-3 kadr przewinięcia | **występuje** | 01: chipy temperatur przecięte (pl/it/en-GB 6,3); 02: pierwszy składnik do połowy (pl 6,3, en-US 6,9, sk 6,9, hu 6,3); 04: plakietka przecięta (it 6,9, id 6,9) |
| P2-4 różne „dziś” między lok. | **występuje** | 07 6,3″ (siatka `pod/t07-*.png`, 34 lok.): niedz. 15 — cs, el, en-GB, es-MX, fr-FR, id, ko, no, pt-PT, sk, tr, zh-Hant (12); pon. 16 — da, en-AU, en-US, fi, hr, it, ms, pl, ro, sl, uk (11); wt. 17 — de-DE, en-CA, es-ES, fr-CA, hu, ja, nl-NL, pt-BR, ru, sv, vi (11) |
| P2-5 wielka litera po „potem” (03) | **występuje** | nl „daarna Mengen”, id „lalu Pencampuran”, it „poi Impasto”, es „luego Mezcla”, da „derefter Blanding”, ms „kemudian Gaul”, sl „nato Mešanje”, ru „затем Замес”; pl, vi, ko małą |
| P2-6 łamanie kolumny godzin 01 (fr, en 6,3) | nie widać w próbce | en-GB 6,3 01 bez łamania; fr-FR/en-AU/en-CA 01 nie obejrzane — `[DO USTALENIA]` |
| P2-7 nawiasy en 04-doktor | nie sprawdzono | żadna ramka en 04 w próbce — `[DO USTALENIA]` |
| P2-8 „232°C” bez spacji | **występuje** | 02 pl, nl-NL, id, it, vi, cs, hu, sk (obok „24–25,5 °C”) |
| P2-9 ru „g” zamiast „г” | nie sprawdzono | ru 02 nie w próbce — `[DO USTALENIA]` |
| P2-10 plakietka Pro blisko górnej krawędzi | **występuje** | `vi/iphone-6.3/01-plan.png`: obwódka ok. 27 px od góry (wycinek 1206×640) |
| P2-11 ms „Buat Asal Sebelumnya” | **występuje** | `ms/iphone-6.9/03-prowadzenie-ciemny.png` |

## P2 nowe
- **P2-12 `en-US/iphone-6.9/02-receptura.png` i `en-US/iphone-6.3/02-receptura.png`: podpis „Grams for Every Ingredient”, a ekran pokazuje uncje** („13.4 oz”, „Total 1 lb 15.7 oz”). en-GB/en-AU/en-CA w gramach (wycinek 4×2 obejrzany). Podpis przeczy obrazowi na głównym rynku anglojęzycznym (WYD-05/WYD-06). Opcje: zrzut en-US w gramach albo podpis en-US bez „Grams” (tekst: rola 04/09). Blisko P1 — decyzja koordynatora.
- **P2-13 ru i uk 07-offline: tytuł ekranu „Dziś” krojem Sofia z bułgarskimi formami cyrylicy** („сегодня?” z д jak „g”; „Що ви сьогодні робите?”; `ru/iphone-6.3/07-offline.png`, `uk/iphone-6.3/07-offline.png`). Inne tytuły ru/uk (03, 05, 06) krojem systemowym. `src/ui/kroj-tytulow.ts:19` wyłącza Sofię dla uk/ru (`JEZYKI_CYRYLICY_BEZ_FORM_KROJU`), tytuł „Dziś” idzie przez `src/components/nawigacja/PasZakladki.tsx:159` (getter w stylach) — przyczyna `[DO USTALENIA]` (rola 08/04).
- **P2-14 nl-NL 07-offline, oba rozmiary: łamanie w środku słowa** w kafelku „Ik zet een zuurdesemstarte / r op” (`nl-NL/iphone-6.3/07-offline.png`, `nl-NL/iphone-6.9/07-offline.png`). Kafelki 07 pozostałych lok. 6,3″ obejrzane tylko na wycinkach siatki (ucięte nad kafelkami) — `[DO USTALENIA]`.
- **P2-15 zh-Hant 6,3″ 07-offline: pasek tygodnia łamie „15日” → „15 / 日”** (każdy dzień w dwóch wierszach; siatka `pod/t07-1.png`). ja i ko mieszczą się w jednym wierszu.

## P3
- **P3-1 sl: nazwa receptury „Vsakdanji kmečki kruh z drožmi”** (`sl/iphone-6.3/03-prowadzenie-ciemny.png`) — „drožmi” może znaczyć drożdże, nie zakwas; do oceny native (rola 09).
- **P3-2 status bar: „09:41” vs „9:41” vs „09.41”/„9.41”** zależnie od locale (pl/nl „09:41”, en-US/ja/cs „9:41”, id/da „09.41”, fi „9.41”) — zgodne z formatem regionu, tylko informacyjnie.

## Pokaz dla właściciela (`scratchpad/pokaz-13/`, 9 ramek)
`pl_iphone-6.9_01-plan.png` (pl, Pro), `pl_iphone-6.9_03-prowadzenie-ciemny.png` (ciemna), `pl_iphone-6.3_07-offline.png` (P2-2), `nl-NL_iphone-6.9_07-offline.png` (najdłuższy podpis, P2-14), `id_iphone-6.3_04-doktor.png` (P1-1), `en-US_iphone-6.9_02-receptura.png` (P2-12), `ja_iphone-6.9_01-plan.png` (CJK), `vi_iphone-6.3_01-plan.png` (vi 6,3″, ponowiony job), `ru_iphone-6.3_07-offline.png` (P2-13).

## Nie sprawdzono
- 384 z 476 ramek tylko mechanicznie (oglądane: 92); podpisy 31 lok. na 1 ramce każda (tekst podpisu jest jeden na scenę, ale łamanie zależy od rozmiaru).
- Czy P1-1 i P2-14 powtarzają się w nieobejrzanych ramkach; P2-6, P2-7, P2-9 (brak ramek w próbce).
- Zgodność treści ekranu ramki z surową (sprawdzone tylko ścieżki, nie piksele).
- Jakość przekładu poza oczywistymi błędami; poprawność merytoryczna liczb.
- Obrazy oglądane jako montaże 4×560 px + wycinki pełnej rozdzielczości; nie na urządzeniu.

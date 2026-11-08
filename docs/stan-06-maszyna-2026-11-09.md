# Stan: rola 06, fix TORB-06-MASZ (tor B M3, 2026-11-09)

Gałąź `wip/06-maszyna-2026-11-09` od `d6683559`. Prompt: `audit/M3-2026-11-08/prompty/06-maszyna.md` (ostatni nagłówek: „Kontrola dowodów i sekretów przed oddaniem raportu”). Źródła wpisów: D-261, D-266 (a), D-267 „Uwagi”, `docs/wznowienie-M3.md`.

## E0: klasyfikacja i reguła

| Część | Rodzaj | Co |
|---|---|---|
| (1) terminy maszyny pt, pt-BR, ja, lt | M | hierarchia źródeł (D-035, szczebel 1 = instrukcja producenta) |
| (2) rozmaryn focaccii, skórka cytryny kołocza w `DODATKI_MASZYNY` | M | RD-38, MAS-072, zasada D-261 „bez nowych faktów” |

Reguła „źródło przeczy” przyjęta w tej sesji (do weta): termin zmieniam, gdy przeczytane źródło pokazuje, że jest błędny (nazywa inną rzecz albo funkcję, której urządzenie nie ma). Inna nazwa tej samej rzeczy u producenta nie jest sprzecznością: zapisuję ją jako [DO USTALENIA] z terminem ze źródła. Dlaczego: zmiana synonimu przepisałaby zdania bezpieczeństwa po przeglądzie (MAS-002, MAS-062, MAS-084) i brzmienie należy do ról 04/09; decyzję o przejściu na terminy producentów zostawiam koordynatorowi (propozycja niżej).

## Źródła (odczyt 2026-11-08, szczebel 1, PDF pobrane `curl`, cytaty sprawdzone `pdftotext -raw` + `grep`)

| # | Język | Dokument | Adres | sha256 (12) |
|---|---|---|---|---|
| Z1 | lt | Tefal PAIN PLAISIR / PAIN & DELICES Instructions for Use, część LT (ten sam plik co MAS-072) | https://dam.groupeseb.com/m/ae6aa196a5a491bf/original/1520016472-IFU.pdf?timestamp=20250530112047 | ef4b947716d9 |
| Z2 | lt | ETA 3109, „Elektrinė duonkepė • APTARNAVIMO INSTRUKCIJA” (ETA a.s., producent) | https://eta.cz/shop/download/2366740 | cdf661e3bc3c |
| Z3 | pt-PT | Kenwood Série BM300, „Livro de Instruções/Receitas” (Portuguese; serwer De’Longhi Group, właściciela marki) | https://dls.delonghigroup.com/files/docs/5/PT-BM306.pdf | 861053acad46 |
| Z4 | pt-BR | Britânia, „Panificadora Multipane Touch”, folheto de instruções | https://suporte.britania.com.br/hc/pt-br/article_attachments/45662724096148 | e3836029d64d |
| Z5 | pt-BR | Tramontina BBM800 (69030/011), manual (Tramontina Farroupilha S.A.) | https://assets.tramontina.com.br/upload/tramon/imagens/FAR/69030011MNP001.pdf | 1bcaa194c0bf |
| Z6 | ja | Panasonic SD-BMS104, 取扱説明書 ホームベーカリー | https://panasonic.jp/manualdl/p-db/sd/sd_bms104_01.pdf | 46d303ce944b |
| Z7 | ja | Panasonic SD-BH103, 取扱説明書 | https://panasonic.jp/manualdl/p-db/sd/sd_bh103_01.pdf | 0bd7680d557c |
| Z8 | (2) | Panasonic SD-YR2550 „Operating Instructions and Recipes” (ten sam plik co MAS-072) | https://bilder.quelle.de/v1/static/be27c6ec478999a4dd93915a7cea41fd | 422c593f3374 |

Uwaga do cytatów: w Z1 (LT) `pdftotext -raw` skleja część słów bez spacji (np. „Prancūziškaduona”); cytaty niżej podane ze spacjami po normalizacji, miejsce = strona PDF.

## (1) Terminy: werdykt dla każdego elementu

Słowniki: `src/lib/i18n-slowniki/{pt,pt-BR,ja,lt}/czesc-14.ts`.

### lt

| Element | Źródło: cytat, miejsce | Werdykt | Obecny termin (plik:linia) |
|---|---|---|---|
| urządzenie | Z2 s. 1 i 166: „Elektrinė duonkepė”, „A – duonkepė”; Z1 mówi „duonos kepimo aparatas” | potwierdzone (Z2) | `src/lib/i18n-slowniki/lt/czesc-14.ts:23` „Duonkepė” |
| opóźniony start | Z1 s. 108: „atšaukti nustatytą atidėtą paleidimą”; Z2 s. 169: „Funkciją atidėtas startas” | potwierdzone (Z1) | `src/lib/i18n-slowniki/lt/czesc-14.ts:44` „atidėtą paleidimą” |
| forma | Z2 s. 175: „Manipuliuojant su įkaitusia kepimo forma”; Z1 s. 106: „3. Duonos keptuvė” | potwierdzone (Z2) | `src/lib/i18n-slowniki/lt/czesc-14.ts:79` „formą” |
| mieszadło | Z2 s. 166: „C – Maišymo mentelės”; Z1 s. 106: „4. Minkymo mentelė” | [DO USTALENIA]: oba źródła mają zdrobnienie „mentelė”; propozycja „maišymo mentelė” | `src/lib/i18n-slowniki/lt/czesc-14.ts:81` „Maišymo mentė” (też `src/lib/i18n-slowniki/lt/czesc-14.ts:18`) |
| program podstawowy | Z1 s. 107: „4. Tradicinė duona”; Z2 s. 171: „2. KLASIK (KLASIKA)”; „pagrindinė programa” w Z2 s. 166 to program domyślny (VITAL), nie podstawowy | [DO USTALENIA]; źródła: „tradicinė” / „klasika” | `src/lib/i18n-slowniki/lt/czesc-14.ts:52` „pagrindinė” |
| program francuski | Z1 s. 107: „6. Prancūziška duona” | potwierdzone (Z1) | `src/lib/i18n-slowniki/lt/czesc-14.ts:51` „prancūziška” |
| program pełnoziarnisty | Z1 s. 108: „8. Viso grūdo duona” | potwierdzone (Z1) | `src/lib/i18n-slowniki/lt/czesc-14.ts:50` „viso grūdo” |
| program ciasto | Z2 s. 172: „9. TĚSTO (TEŠLA)”; Z1 s. 108: „11. Kildinama tešla” | potwierdzone (Z2) | `src/lib/i18n-slowniki/lt/czesc-14.ts:48` „tešla” |
| program słodki | Z1 s. 107: „7. Saldi duona”; Z2 s. 171: „6. SLADKÝ (SALDI)” | potwierdzone (Z1, Z2) | `src/lib/i18n-slowniki/lt/czesc-14.ts:49` „saldi” |
| program szybki | Z2 s. 171: „5. RYCHLÝ (GREITA)” | nie dotyczy | brak klucza w aplikacji |

### pt (pt-PT)

| Element | Źródło: cytat, miejsce | Werdykt | Obecny termin (plik:linia) |
|---|---|---|---|
| urządzenie | Z3 s. 1: „Antes de utilizar a máquina de fazer pão pela primeira vez” | [DO USTALENIA]; źródło: „máquina de fazer pão” | `src/lib/i18n-slowniki/pt/czesc-14.ts:24` „Máquina de pão” |
| opóźniony start | Z3 s. 15: „O temporizador de adiamento permite-lhe adiar o início do processo de fazer pão” | [DO USTALENIA]; źródło: „temporizador de adiamento” | `src/lib/i18n-slowniki/pt/czesc-14.ts:45` „início diferido” |
| forma | Z3 s. 4: „Limpe a forma do pão e a amassadeira” | potwierdzone (Z3) | `src/lib/i18n-slowniki/pt/czesc-14.ts:81` „forma” |
| mieszadło | Z3 s. 8: „9. amassadeira” | [DO USTALENIA]; źródło: „amassadeira” | `src/lib/i18n-slowniki/pt/czesc-14.ts:83` „pá de amassar” |
| podstawowy | Z3 s. 11: „O programa Branco Básico pode ser usado para quase qualquer receita” | potwierdzone (Z3, „Branco Básico”) | `src/lib/i18n-slowniki/pt/czesc-14.ts:54` „básico” |
| francuski | Z3 s. 11: „O programa Francês cria uma côdea mais estaladiça” | potwierdzone (Z3) | `src/lib/i18n-slowniki/pt/czesc-14.ts:53` „francês” |
| pełnoziarnisty | Z3 s. 11: „O programa Integral deve ser usado para receitas de pão” | potwierdzone (Z3) | `src/lib/i18n-slowniki/pt/czesc-14.ts:52` „integral” |
| ciasto | Z3 s. 12: „O programa Massa de Pão é utilizado” | potwierdzone (Z3, „Massa de Pão”) | `src/lib/i18n-slowniki/pt/czesc-14.ts:50` „massa” |
| słodki | Z3 s. 11: „O programa Doce coze o pão a temperaturas mais baixas” | potwierdzone (Z3) | `src/lib/i18n-slowniki/pt/czesc-14.ts:51` „doce” |
| szybki | Z3 s. 11: „O programa Rápido Branco” | nie dotyczy | brak klucza |

### pt-BR

| Element | Źródło: cytat, miejsce | Werdykt | Obecny termin (plik:linia) |
|---|---|---|---|
| urządzenie | Z4 s. 1: „Panificadora Multipane Touch”; Z5: „panificadora” (37 wystąpień) | potwierdzone (Z4, Z5) | `src/lib/i18n-slowniki/pt-BR/czesc-14.ts:24` „Panificadora” |
| opóźniony start | Z4 s. 13: „O Timer permite que se programe a hora em que o pão estará pronto”; Z5 s. 24: „Uso do botão PROGRAMAR” | [DO USTALENIA]; źródła: „Timer” / „Programar” | `src/lib/i18n-slowniki/pt-BR/czesc-14.ts:45` „início programado” |
| forma | Z4 s. 10: „Encaixar o batedor na forma de assar” | potwierdzone (Z4) | `src/lib/i18n-slowniki/pt-BR/czesc-14.ts:81` „forma” |
| mieszadło | Z4 s. 6: „Batedor”; Z5 s. 8: „S. Pá dobrável”, „T. Pá fixa” | [DO USTALENIA]; rdzeń „pá” w Z5, „batedor” w Z4 | `src/lib/i18n-slowniki/pt-BR/czesc-14.ts:83` „pá de amassar” |
| podstawowy | Z4 s. 7: „1.PÃO NORMAL: É o mais utilizado”; Z5 s. 13: „NORMAL” | [DO USTALENIA]; oba źródła: „Normal” | `src/lib/i18n-slowniki/pt-BR/czesc-14.ts:54` „básico” |
| francuski | Z4 s. 7: „2.PÃO FRANCÊS” | potwierdzone (Z4) | `src/lib/i18n-slowniki/pt-BR/czesc-14.ts:53` „francês” |
| pełnoziarnisty | Z4 s. 7: „3.PÃO INTEGRAL”; Z5 s. 14: „INTEGRAL” | potwierdzone (Z4, Z5) | `src/lib/i18n-slowniki/pt-BR/czesc-14.ts:52` „integral” |
| ciasto | Z4 s. 7: „8.MASSA: Utilizar este ciclo para preparar a massa de pizza ou de pães que não serão assados na Panificadora” | potwierdzone (Z4) | `src/lib/i18n-slowniki/pt-BR/czesc-14.ts:50` „massa” |
| słodki | Z4 s. 7: „5.PÃO DOCE”; Z5 s. 15: „DOCE” | potwierdzone (Z4, Z5) | `src/lib/i18n-slowniki/pt-BR/czesc-14.ts:51` „doce” |
| szybki | Z5 s. 12: „NORMAL RÁPIDO” | nie dotyczy | brak klucza |

### ja

| Element | Źródło: cytat, miejsce | Werdykt | Obecny termin (plik:linia) |
|---|---|---|---|
| urządzenie | Z6 s. 1: „ホームベーカリー”; Z7 s. 1 | potwierdzone (Z6, Z7) | `src/lib/i18n-slowniki/ja/czesc-14.ts:24` „ホームベーカリー” |
| opóźniony start | Z7 s. 27: „その他のコースには予約タイマーが使えません。” | potwierdzone (Z7); Z6 mówi „予約” | `src/lib/i18n-slowniki/ja/czesc-14.ts:46` „予約タイマー” |
| „コース” jako program | Z7 s. 27 (jw.); Z6 mówi „メニュー” | potwierdzone (Z7) | `src/lib/i18n-slowniki/ja/czesc-14.ts:45` |
| forma | Z6 s. 4: „パンケース、パン羽根、付属品などを洗ってください” | potwierdzone (Z6) | `src/lib/i18n-slowniki/ja/czesc-14.ts:82` „パンケース” |
| mieszadło | Z6 s. 4 (jw.): „パン羽根” | potwierdzone (Z6, rdzeń „羽根”) | `src/lib/i18n-slowniki/ja/czesc-14.ts:84` „羽根” |
| podstawowy | Z6 s. 6 tabela menu: „食パン ● ● ● ● 4時間”; „基本” tylko w nagłówku „基本の食パンを焼いてみよう” | [DO USTALENIA]; źródło: „食パン” | `src/lib/i18n-slowniki/ja/czesc-14.ts:55` „基本” |
| francuski | Z6 s. 6: „フランスパン ● ● － ● 5時間” | potwierdzone (Z6) | `src/lib/i18n-slowniki/ja/czesc-14.ts:54` „フランスパン” |
| pełnoziarnisty | Z6 s. 6: „全粒粉パン ● ● － ● 5時間” | potwierdzone (Z6, rdzeń) | `src/lib/i18n-slowniki/ja/czesc-14.ts:53` „全粒粉” |
| ciasto | Z6 s. 6: „パン生地 ● ● － － 1時間” | potwierdzone (Z6, rdzeń) | `src/lib/i18n-slowniki/ja/czesc-14.ts:51` „生地” |
| słodki | Z7 s. 8: „｢食パン｣｢食パンスイート｣” (wariant chleba tostowego, nie osobny program słodki) | [DO USTALENIA] | `src/lib/i18n-slowniki/ja/czesc-14.ts:52` „スイート” |
| szybki | Z6 s. 6: „早焼き食パン” | nie dotyczy | brak klucza |

**Wynik (1):** 27 elementów potwierdzonych, 10 [DO USTALENIA], żadna sprzeczność według reguły z E0 → słowniki bez zmian. Przegląd natywny nadal brak (DEC-06).

## (2) `DODATKI_MASZYNY`: rozmaryn i skórka cytryny

- Reguła: RD-38 L = {jajka, świeże mleko, ser, jogurt, sok, świeże owoce, warzywa} (`docs/brd/reguly.md:306`, MAS-072, suma list 5 instrukcji). D-261: dodatki tylko z notatki i opisu, bez nowych faktów; D-266 odrzuciło „owoce” dla kołocza i focaccii jako klasyfikację bez źródła.
- Źródło Z8, PDF s. 9 (odczyt 2026-11-08): „Use up to 1 – 2 tbsp of dried herbs. For fresh herbs, follow the instructions in the recipe.” (zioła w grupie „Dry/insoluble ingredients”), osobno „Fresh fruits, fruits pickled in alcohol, vegetables”. Instrukcja traktuje zioła jako osobny rodzaj, nie warzywa; nie wiąże ziół z timerem. Żadna z 5 instrukcji MAS-072 nie wymienia ziół ani skórki cytrusów na liście zakazu (`grep -i "rosemary|herb|zest|lemon|peel"`: tylko sok cytryny w przepisach Zojirushi, kandyzowana skórka pomarańczy w przepisie Panasonic).
- Rozstrzygnięcie: **świeży rozmaryn focaccii** — bez wpisu (nie należy do L ani do cukru/tłuszczu; źródło szczebla 1 opisuje zioła osobno od warzyw). **Skórka cytryny kołocza** — bez wpisu; źródło klasyfikacji brak, skutek żaden: kołocz zablokowany przez mleko, jajka i ser. Obie receptury mają naczynie `baking_sheet` → program „ciasto” bez opóźnienia (MAS-085, `src/components/receptury/ProgramMaszynyKarta.tsx:84`), więc decyzja nie zmienia ekranu.
- Zmiana: tylko komentarze przy wpisach (`src/recipes/maszyna-receptur.ts:20-21` i `src/recipes/maszyna-receptur.ts:31`), dane bez zmian → bez testu czerwonego (polecenie: test tylko przy zmianie danych).

## Zmiany (plik:linia przed/po)

| Plik | Przed | Po |
|---|---|---|
| `src/recipes/maszyna-receptur.ts:20-21` | brak | komentarz: rozmaryn bez wpisu, powód i źródło |
| `src/recipes/maszyna-receptur.ts:31` | brak | komentarz: skórka cytryny bez wpisu |
| `docs/lokalizacja/jezyki.md` (sekcja D-267) | brak | akapit: terminy maszyny pt/pt-BR/ja/lt sprawdzone, odesłanie tutaj |
| słowniki pt, pt-BR, ja, lt | — | bez zmian |

## [DO USTALENIA]

1. Terminy z tabel wyżej (10): lt „mentė”/„mentelė”, lt „pagrindinė”; pt-PT urządzenie, opóźniony start, mieszadło; pt-BR opóźniony start, mieszadło, „básico”/„Normal”; ja „基本”/„食パン”, „スイート”.
2. Skórka cytryny jako „świeże owoce”: brak źródła (bez skutku dziś).
3. Przegląd natywny pt/pt-BR/ja/lt (DEC-06).

## Propozycja decyzji (numer nada koordynator)

**[D-xxx] 2026-11-09 — Terminy trybu maszyny pt/pt-BR/ja/lt sprawdzone w instrukcjach producentów; `DODATKI_MASZYNY` bez rozmarynu i skórki cytryny (rola 06, tor B, do weta)**
- Rodzaj: merytoryczna (D-035, szczebel 1). 7 instrukcji producentów (Tefal LT, ETA LT, Kenwood PT, Britânia, Tramontina, Panasonic JP ×2) + Panasonic SD-YR2550 EN; odczyt 2026-11-08.
- Decyzja: (1) 27 terminów potwierdzonych, 10 [DO USTALENIA], słowniki bez zmian (inna nazwa producenta ≠ sprzeczność). (2) Rozmaryn: bez wpisu (zioła poza L; Panasonic opisuje zioła osobno od warzyw). Skórka cytryny: bez wpisu, bez źródła, bez skutku (kołocz zablokowany).
- Opcje dla 10 terminów: (a) rola 09 zamienia je na terminy producentów (zmienia też zdania bezpieczeństwa po przeglądzie → nowe skróty, przegląd zastępczy) — zgodność z przyciskiem maszyny, koszt przeglądu; (b) zostawić do przeglądu natywnego (DEC-06) — bez kosztu, terminy zrozumiałe, ale nie z instrukcji. Rekomendacja: (a) tylko dla etykiet programów i nazwy urządzenia (krótkie klucze bez zdań krytycznych), (b) dla reszty.
- Odrzucone: zmiana wszystkich terminów na podstawie jednej instrukcji (synonimy producentów różnią się między markami, np. lt „tradicinė”/„klasika”); dopisanie „warzywa” dla rozmarynu (klasyfikacja bez źródła, D-261).
- Zależy od: D-261, D-266, D-267, DEC-06.

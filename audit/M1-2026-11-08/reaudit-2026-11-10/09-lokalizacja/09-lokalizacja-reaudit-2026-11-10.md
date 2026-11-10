# Reaudyt: Lokalizacja — Piekarz — 2026-11-10
Commit: 1c723632 · Tryb: reaudit (pętla 2, baza ea249c9c) · Grupa G2 (role 06 i 09 w jednym kontekście: wyjątek nazwany, KO-013) · Środowisko: Linux, Node, Jest w kopii roboczej WT; bez symulatora iOS, bez urządzenia i bez zrzutów (`dowody/e0-srodowisko.txt`)

## Podsumowanie
Rola nie ma w tej pętli własnych ID do weryfikacji; zakres to próbka regresji po commitach d04c94ca, 3e05396e, f6291d8f, 2f4a260e i d5a6dc4c. Słowniki zmieniły się tylko przez dodanie: 3 nowe klucze (2 × 088, 1 × 089) w EN i w 33 językach (66 nowych plików części, 33 indeksy, 1 plik EN), żadnego usuniętego wpisu. Komplet, zgodność z t(), brak tekstu polskiego i angielskiego w obcych słownikach, pismo języka i nazwa karty z odesłania sprawdzone skryptem dla wszystkich 33 języków (0 błędów); `npm run check:i18n` kod 0 (błędy: 0, uwagi: 155 — tyle samo co na ea249c9c, różnią się tylko numery linii). Sens przekładu sprawdzony w 12 językach, bez zmiany sensu. Dwa nowe znaleziska P3 dotyczą układu po d5a6dc4c i 2f4a260e w językach innych niż pl i en (rachunek układu projektu, nie pomiar z urządzenia). Otwartych P0/P1 tej roli nie ma.

| ID | Źródło | Wynik | Dowód |
|---|---|---|---|
| 09-lokalizacja-701 | nowe (zakres 005: 2f4a260e, d5a6dc4c) | istniało wcześniej, P3 | `dowody/uklad-320-35-jezykow.txt` |
| 09-lokalizacja-702 | nowe (d5a6dc4c) | regresja, P3 | `dowody/pasek-kciuka-35-jezykow.txt`, `dowody/uklad-320-35-jezykow.txt` |

Liczby: ID z zadań do weryfikacji 0 (zweryfikowane 0, nadal otwarte 0, regresja 0, istniało wcześniej 0). Nowe: 2 × P3 (701 istniało wcześniej, 702 regresja d5a6dc4c).

Próbka regresji (punkty z pliku zadań):

| Zakres | Wynik | Dowód |
|---|---|---|
| Zmiany słowników od ea249c9c | 100 plików w `src/lib/i18n-slowniki` i `src/lib/i18n-en` (66 dodanych, 34 zmienione); usunięte linie tylko w 33 indeksach (lista importów i rozwinięcie części) | `dowody/diff-slownikow.txt` |
| Komplet 3 nowych kluczy w 33 językach + EN | każdy język ma własny wpis każdego klucza, t() zwraca ten wpis (bez języka zastępczego) | `dowody/kontrola-nowych-kluczy.txt` (kod 0), `dowody/nowe-klucze-35-jezykow.txt` |
| Parametry i liczba mnoga | źródło nie ma parametrów, liczb ani form liczby mnogiej; przekłady też nie (kontrola cyfr i klamer: 0 trafień) | `dowody/kontrola-nowych-kluczy.txt` |
| Tekst polski albo angielski w obcych słownikach | 0 trafień: żaden wpis nie równa się tekstowi PL ani EN, brak polskich i angielskich słów z listy, pismo zgodne z językiem (bg, sr, uk, ru, el, ja, ko, zh-Hant) | `dowody/kontrola-nowych-kluczy.txt`, skrypt `dowody/g2-klucze.mjs.txt` |
| Odesłanie do karty receptury | w każdym z 33 języków i w EN nazwa w cudzysłowie w obu zdaniach 088 = tytuł karty z t('O recepturze') tego języka | `dowody/kontrola-nowych-kluczy.txt` |
| Sens przekładu (próbka 12 języków) | bez zmiany sensu; uwagi stylu niżej, znane jako M2-p4-N4 | tabela „Sens przekładu” |
| Sieroty po tekstach brioszki | żaden tekst brioszki nie został usunięty ze słowników; klucze kroków brioszki są nadal używane (zapisane plany i trwające wypieki, D-317); `tests/sieroty-slownikow-p13a.test.ts` PASS; uwagi check:i18n bez nowych pozycji | `dowody/check-i18n-uwagi-diff.txt`, `dowody/jest-i18n.txt` |
| `npm run check:i18n` w WT | kod 0: 923 teksty t() w kodzie, 2220 w słowniku EN, 33 języki przekładu, błędy 0, uwagi 155 | `dowody/check-i18n.txt` |
| Testy i18n wskazane | 7 plików, 71 testów, kod 0 | `dowody/jest-i18n.txt` |
| Commity 2f4a260e i d5a6dc4c (układ prowadzenia) | bez nowych tekstów i kluczy (zmiany tylko miejsc użycia w `docs/lokalizacja/pl.kontekst.json`); skutek układu w innych językach → 701, 702 | `dowody/diff-slownikow.txt`, `dowody/uklad-320-35-jezykow.txt` |

## Sens przekładu (próbka)
Drugi przegląd AI w tym samym kontekście co reaudyt (bez notatek tłumacza; nie jest oceną rodzimego użytkownika języka). Języków ar i he nie ma w zestawie (35 lokalizacji, `supportsRTL: false`, `dowody/lok-02-zestaw-jezykow.txt`). Teksty: `dowody/nowe-klucze-35-jezykow.txt`.

| Język | Nagrzewanie i pieczenie (088) — przekład zwrotny | Powód (089) — przekład zwrotny | Ocena |
|---|---|---|---|
| ru | „Rozgrzej piekarnik do temperatury wypieku podanej w sekcji «O recepturze»”; „Piecz w temperaturze i tak długo, jak podano w sekcji …” | „Plan dla tej receptury na zakwasie czeka na czas wyrastania ciasta. Ilości i rady wyżej.” | sens zachowany |
| uk | jak ru, „у розділі «Про рецептуру»” | „… чекає на час підйому тіста. Кількості й підказки — вище.” | sens zachowany |
| de | „Heize den Ofen auf die Backtemperatur aus … vor”; „Backe bei der Temperatur und so lange, wie unter … angegeben” | „Der Plan für dieses Sauerteigrezept wartet auf die Gehzeiten des Teigs. Mengen und Tipps stehen oben.” | sens zachowany; „Sauerteigrezept” obok karty „Über die Rezeptur” (dwa terminy, znane M2-p4-N4) |
| es | „Precalienta el horno a la temperatura de horneado indicada en «Sobre la receta»” | „El plan de esta receta con masa madre está esperando los tiempos de levado de la masa. …” | sens zachowany |
| es-419 | jak es, z nazwą karty „Sobre la fórmula” (zgodną z tytułem karty w es-419) | „El plan de esta fórmula …” | sens zachowany |
| fr | „Préchauffez le four à la température de cuisson indiquée dans « À propos de la recette »” | „Le plan de cette recette au levain attend les temps de pousse de la pâte. …” | sens zachowany |
| ja | „オーブンを「この配合について」に記載の焼成温度に予熱します” (rozgrzej do temperatury wypieku zapisanej w …) | „… 生地の発酵時間が入るのを待っています。分量とヒントは上にあります。” (czeka, aż wejdą czasy fermentacji ciasta) | sens zachowany |
| ko | „오븐을 ‘배합표 정보’에 적힌 굽기 온도로 예열하세요” | „이 사워도우 레시피의 계획에는 아직 반죽 발효 시간이 없어요. …” (plan nie ma jeszcze czasów fermentacji) | sens zachowany, parafraza „czeka” → „jeszcze nie ma” |
| zh-Hant | „將烤箱預熱至「關於此配方」中的烘烤溫度” | „這份天然酵母配方的計畫正在等待麵團的發酵時間。用量與提示請見上方。” | sens zachowany |
| hu | „Melegítsd elő a sütőt „A receptről” részben megadott sütési hőmérsékletre” | „Ennek a kovászos receptnek a terve a tészta kelesztési idejére vár. …” | sens zachowany |
| tr | „Fırını “Tarif Hakkında” bölümünde yazan pişirme sıcaklığına ısıtın” | „Bu ekşi mayalı tarifin planı hamurun mayalanma sürelerini bekliyor. …” | sens zachowany |
| lt | „… nurodytos skiltyje „Apie receptūrą“” | „Šios … receptūros planui dar trūksta tešlos kilimo laikų. …” (planowi brakuje jeszcze czasów) | sens zachowany, parafraza jak ko |

Uwaga wspólna dla roli 06: zdanie powodu kończy się odpowiednikiem „… są wyżej” we wszystkich językach; na ekranie planu „wyżej” jest oś czasu, nie ilości — to treść źródła PL, patrz 06-tresci-701, nie błąd przekładu.

## Stosowalność listy kontrolnej
| Pozycja | Status | Wynik |
|---|---|---|
| LOK-01 | dotyczy (polityka szeroka, DEC-06) | poza zmienionymi plikami; nie sprawdzano ponownie |
| LOK-02 | dotyczy — próbka spoza zmienionych plików | ok: `supportedLocales` iOS 35 = ACTIVE_LANGS 35 = słowniki 33 + pl + en = `languages/*.json` 35; `supportsRTL: false` (`dowody/lok-02-zestaw-jezykow.txt`) |
| LOK-03 | dotyczy | ok: check:i18n z `--kod src,app` kod 0, bez nowych uwag o tekstach na sztywno |
| LOK-04 | dotyczy | ok: 3 klucze w 35 słownikach; klucze kroków są dynamiczne (t(step.name), t(step.instructions)) — nowe wartości są w słownikach; sierot brak |
| LOK-05 | dotyczy | ok: nowe teksty bez liczby mnogiej; `src/lib/__tests__/plural-intl.test.ts` PASS |
| LOK-06 | dotyczy | ok: brak parametrów i liczb w źródle i w przekładach |
| LOK-07 | dotyczy — próbka spoza zmienionych plików | ok: nowe kroki nie niosą temperatury; karta, do której odsyłają, formatuje ją helperem jednostek użytkownika (`src/components/receptury/ORecepturze.tsx:46`) |
| LOK-08 | dotyczy | znaleziska 09-lokalizacja-701 i 09-lokalizacja-702 (rachunek, bez zrzutów) |
| LOK-09 | dotyczy — próbka spoza zmienionych plików | ok: migawka kroku niesie klucz PL, przekład przy wyświetlaniu (sonda EN w `dowody/nowe-klucze-35-jezykow.txt`; test 088 sprawdza t() w EN) |
| LOK-10 | dotyczy | bez zmian: pliki treści krytycznej w 33 językach nietknięte od ea249c9c (patrz raport roli 06 tej grupy, próbka TRE-10) |
| LOK-11 | dotyczy | drugi przegląd AI: próbka 12 języków × 3 klucze, bez zmiany sensu; uwagi stylu znane (M2-p4-N4) |
| LOK-12, LOK-13, LOK-14, LOK-15 | dotyczy | poza zmienionymi plikami; nie sprawdzano ponownie (LOK-13: plan zablokowany nie tworzy eksportu ani pliku kalendarza — f6291d8f) |

## Znaleziska

### 09-lokalizacja-701 · Ostrzeżenie kroku w pierwszym ekranie prowadzenia sprawdzono tylko po polsku i angielsku; według rachunku układu projektu w 18 językach przy 393×852 i w 24 przy 320×568 dół ostrzeżenia wypada pod przyciskiem „Zrobione”
- Pozycja listy kontrolnej: LOK-08
- Poziom: P2 → P3 według D-288 (klasa: układ-języki); wynik: istniało wcześniej (na ea249c9c kryterium nie spełniał także polski — to treść zadania M1-audytor-generalny-005)
- Realność: realny (18 z 35 języków na ekranie 393×852) · Pewność: średnia (rachunek ze średniej szerokości znaku 0,5 em, nie pomiar; dla ja, ko, zh-Hant rachunek zaniża szerokość)
- Rodzaj: D
- Dowód: `dowody/uklad-320-35-jezykow.txt` — ten sam helper i ten sam warunek co test 005 (`tests/helpers/uklad-ekranu.ts`, kopia sondy `dowody/g2-sonda-uklad.test.tsx.txt`), policzone dla 35 języków: 320×568 pod przyciskiem w 24 językach (od −5 pt w sl do −209 pt w id), 375×667 w żadnym, 393×852 w 18 (bg, lv, uk, es, es-419, pt, pt-BR, de, fr, it, sv, nb, fi, tr, id, ms, vi, ru). Test akceptacyjny 005 obejmuje dwa języki: `src/__tests__/karta-kroku-pierwszy-ekran-005.test.tsx:141` „for (const jezyk of ['pl', 'en'] as const) {”.
- Mechanizm: dłuższe przekłady instrukcji i ostrzeżenia podnoszą kartę kroku; karta się przewija, więc nic nie jest ucięte, ale ostrzeżenie nie mieści się w pierwszym ekranie — cel zadania 005 jest osiągnięty tylko dla pl i en.
- Powraca: tak (M1-audytor-generalny-005, 04-studio-projektowe-001) → trwała kontrola: test 005 w pętli po językach.
- Wzorzec lub źródło: LOK-08 (kluczowe ekrany w najdłuższym języku); wzorce roli: rozszerzenie tekstu (W3C, tabela IBM).
- Kroki w aplikacji: język telefonu np. niemiecki → wypiek z planu → pierwszy krok z ostrzeżeniem (dokarmienie zakwasu).
- Opcje: (a) rola 04 decyduje, czy cel 005 obowiązuje we wszystkich 35 językach, i wtedy test 005 liczy wszystkie języki, a układ dostaje poprawkę (np. ostrzeżenie nad instrukcją); (b) przyjąć cel tylko dla pl i en i zapisać to w decyzji; (c) pomiar na urządzeniu w 2–3 najdłuższych językach przed decyzją. Rekomendacja: (c), potem (a); backlog 1.0.1.
- Test akceptacyjny: warunek testu 005 (dół ostrzeżenia nie niżej niż góra „Zrobione”) spełniony dla każdego języka z ACTIVE_LANGS przy 393×852 i 320×568 albo zapisana decyzja o zakresie języków.
- Status: otwarte

### 09-lokalizacja-702 · Zwarty pasek kciuka (okno niższe niż 700 pt) mieści trzy przyciski w jednym rzędzie tylko dla krótkich tekstów: w części języków etykiety łamią się na 2–3 wiersze, także w środku wyrazu
- Pozycja listy kontrolnej: LOK-08
- Poziom: P2 → P3 według D-288 (klasa: układ-języki); wynik: regresja d5a6dc4c (na ea249c9c przyciski drugorzędne miały własny rząd, podstawa 140 pt)
- Realność: realny na iPhonie SE 2. i 3. generacji (375×667: sk, hu — przycisk „Cofnij poprzedni” 67 pt, 3 wiersze), brzegowy przy 320×568 · Pewność: średnia (rachunek; łamanie w środku wyrazu wynika z szerokości pola: przy 320 pt tekst przycisku drugorzędnego ma ok. 76 pt, czyli ok. 10 znaków kroju 15 pt)
- Rodzaj: D
- Dowód: teksty: `dowody/pasek-kciuka-35-jezykow.txt` — najdłuższe wyrazy w przyciskach drugorzędnych: sk „predchádzajúci” 14 znaków, hu „visszavonása” 12, el „προηγούμενου” 12, ro „precedentul” 11, lv „iepriekšējo” 11; przycisk główny jednowyrazowy w 2 wierszach: sl „Opravljeno”, tr „Tamamlandı” (60 pt zamiast 48). Wysokości przycisków z rachunku: `dowody/uklad-320-35-jezykow.txt`, ostatnia kolumna (67 pt = 3 wiersze w sk, hu, ro, lv, et, nl, el dla „Cofnij poprzedni” i w de, fr, nb, tr, id, ms dla „Po co ten krok”). Szerokości z kodu: podstawa 84 pt i odstęp wewnętrzny 4 pt przycisku drugorzędnego w `src/components/stolnica/PasekKciuka.tsx:97`, podstawa 96 pt przycisku głównego w `src/components/stolnica/PasekKciuka.tsx:95`.
- Mechanizm: w układzie zwartym szerokość przycisku wynika z podstawy flex, nie z tekstu; tekst bez limitu wierszy zawija się w polu węższym niż najdłuższy wyraz. Wyższy pasek zabiera też miejsce karcie kroku (wchodzi do rachunku 701).
- Powraca: tak (klasa jak M1-audytor-generalny-097: łamanie w środku wyrazu w części języków) → trwała kontrola: test układu po językach.
- Wzorzec lub źródło: zasada roli 7 (układ przyjmuje dłuższy tekst; obcięcie albo złe łamanie naprawia najpierw układ — zgłoszenie do roli 04).
- Kroki w aplikacji: iPhone SE (375×667), język słowacki albo węgierski → prowadzenie wypieku → pasek na dole ekranu.
- Opcje: (a) rola 04: w układzie zwartym rząd zawija się, gdy tekst nie mieści się w jednym wierszu (warunek z długości tekstu albo z pomiaru), inaczej zostaje jeden rząd; (b) krótsze przekłady w 5–7 językach (rola 09, po decyzji 04; zasada 7 stawia to po układzie); (c) zostawić do pomiaru na urządzeniu. Rekomendacja: (c) na SE w sk i hu, potem (a); backlog 1.0.1.
- Test akceptacyjny: dla każdego języka z ACTIVE_LANGS przy 375×667 i 320×568 żaden z trzech przycisków paska nie ma więcej niż 2 wierszy i żaden wyraz nie jest dłuższy niż pole tekstu przycisku (rachunek helpera układu) albo zrzuty z urządzenia w sk, hu, el.
- Status: otwarte

## Do sprawdzenia (pewność ≤ 80%)
- 701 i 702 opierają się na rachunku układu z testów projektu; zrzut z urządzenia albo symulatora (SE 375×667 i ekran 393×852; de, fr, sk, hu, id) to krok właściciela albo workflow E2E.
- Styl przekładu 088/089 (cudzysłowy hr, sr, lv, nl; de „Rezept”/„Rezeptur”; tr wielkie litery w nazwie karty): znane jako M2-p4-N4, bez ponownego zgłoszenia; przegląd rodzimego użytkownika to krok właściciela (DEC-06).
- Skrypt modułu `sprawdz-i18n.mjs` z promptu roli nie pasuje do formatu słowników projektu (pliki TS z kluczem = tekst PL, nie `<tag>.json` i18next) — wyjątek nazwany: zastąpiony skryptem projektu `scripts/check-i18n.mjs` (kod 0) i własną kontrolą nowych kluczy (`dowody/g2-klucze.mjs.txt`).
- Pełnego `npm test` i `npm run verify` nie uruchamiano (robi to G4); pseudolokalizacji i zrzutów nie wykonano.

## Kontrola dowodów i sekretów
`node /home/user/piekarz/audit/M1-2026-11-08/narzedzia/sprawdz-raport.mjs <ten raport> WT /home/user/piekarz/audit/M1-2026-11-08/reaudit-2026-11-10/09-lokalizacja --rola 09-lokalizacja` → kod 0, wynik: OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone; format raportu 09-lokalizacja (pierwszy przebieg: 2 błędy raportu — odwołanie do kodu przed cudzym cytatem w tej samej linii — poprawione w raporcie; `dowody/sprawdz-raport.txt`).

`git -C WT status --porcelain` na początku: 0 linii; na końcu: 0 linii (HEAD 1c723632; worktree sond usunięte; `dowody/e0-srodowisko.txt`). Sekretów w raporcie i dowodach brak. W słownikach i plikach przekładu nie znaleziono poleceń skierowanych do agenta (zasada 16).

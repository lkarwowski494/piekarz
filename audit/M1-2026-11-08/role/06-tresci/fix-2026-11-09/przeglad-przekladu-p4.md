# Drugi przegląd AI przekładu — M2 p4 (2026-11-09)

Zakres: 3 klucze, 33 języki.
- K1 (`przeklad-m2-089-2026-11-09.json`, commit 3e05396e): „Plan dla tej receptury na zakwasie czeka na czasy rośnięcia ciasta. Ilości i wskazówki są wyżej.”
- K2, K3 (`przeklad-m2-088-2026-11-09.json`, commit d04c94ca): „Nagrzej piekarnik do temperatury pieczenia podanej w „O recepturze”.” / „Piecz w temperaturze i przez czas podane w „O recepturze”.”

Recenzent: drugi przegląd AI (claude-opus-5-5), tylko odczyt repo. Przegląd natywny: nadal brak (DEC-06).

## Co sprawdzono (mechanicznie i ręcznie)
- Oba pliki JSON parsują się; 33 języki w każdym, ten sam zbiór kodów.
- Wartości w JSON są identyczne z wpisami w `src/lib/i18n-slowniki/<język>/czesc-*.ts` (0 rozbieżności, 99/99).
- Nazwa karty: w każdym z 33 języków przekład klucza „O recepturze” ze słownika języka występuje dosłownie (podciąg) w K2 i K3 — 33/33 zgodne (np. cs „O receptu”, es-419 „Sobre la fórmula”, ja 「この配合について」, ko ‘배합표 정보’, ms “Tentang Resipi Ini”, et „Retseptist“).
- Termin zakwasu w K1 porównany z przetłumaczonym kluczem „Plan wypieku jest tylko dla chleba na zakwasie, a ta receptura nie ma zakwasu.” — spójny we wszystkich językach (cs kvásek, hu kovász, ro maia, bg квас, hr kvas, sl kislo testo, sr кисели квасац, lt natūralus raugas, lv dabīgais ieraugs, et juuretis, uk/ru закваска, es/es-419 masa madre, pt massa-mãe, pt-BR fermento natural, de Sauerteig, fr levain, it lievito madre, nl/sv/da/nb/fi surdeg-rodzina/hapanjuuri, tr ekşi maya, el προζύμι, id/ms sourdough, vi men tự nhiên, ja サワードウ, ko 사워도우, zh-Hant 天然酵母).
- Forma zwracania się w K2/K3 zgodna z kluczami „Nagrzej piekarnik ze stalą do 250 °C.” / „Piecz w 250 °C.” w każdym języku (np. hr/sr „ti”, sl/cs/sk/bg „vy”, hu tegeződés).
- Sens: K1 we wszystkich językach mówi, że plan czeka na (brakujące) czasy rośnięcia, a ilości i wskazówki są wyżej; lt/lv/ko oddają to jako „planowi jeszcze brakuje czasów”, zgodnie z istniejącym przekładem klucza drożdżowego — poprawne. K2/K3 bez liczb, z odesłaniem do karty — poprawne wszędzie.
- Cudzysłowy: żaden nie łamie JSON ani literału TS (apostrof w it „dell'impasto” poprawnie zescapowany w słowniku).

## Tabela znalezisk

| Język | Klucz | Prio | Obecny tekst | Proponowany tekst | Uzasadnienie |
|---|---|---|---|---|---|
| sk | K3 | P3 | Pečte pri teplote a počas času uvedených v časti „O receptúre“. | Pečte pri teplote a tak dlho, ako je uvedené v časti „O receptúre“. | „počas času uvedených” brzmi sztywno (mieszane przypadki); wersja opisowa jak w hr/sr/uk. |
| hr | K2, K3 | P3 | … u „O recepturi”. | … u „O recepturi“. | Słownik hr przeważnie używa pary „…“ (36×) wobec „…” (10×); norma chorwacka to „…“. |
| sr | K2, K3 | P3 | … у „О рецептури”. | … у „О рецептури“. | Słownik sr przeważnie „…“ (41× wobec 5×); norma serbska „…“. |
| lv | K2, K3 | P3 | … sadaļā “Par receptūru” … | … sadaļā „Par receptūru” … | Słownik lv konsekwentnie używa „…” (43×), “…” tylko 2×. |
| nl | K2, K3 | P3 | … bij ‘Over dit recept’ … | … bij “Over dit recept” … | ‘…’ poprawne po niderlandzku, ale w słowniku rzadkie (6×) wobec „…”/“…”; do ujednolicenia przy przeglądzie natywnym. |
| lv | K1 | P3 | … vēl trūkst mīklas rūgšanas laiku. | … vēl trūkst mīklas ceļšanās laiku. | Etykiety etapów w aplikacji: „Pirmā/Otrā ceļšanās”; „rūgšana” też występuje w słowniku (12×), więc tylko spójność. |
| es | K1 | P3 | … los tiempos de levado de la masa. | … los tiempos de subida de la masa. | Etykiety es: „Primera/Segunda subida”; „levado” poprawne i obecne w słowniku (4×), ale rzadsze. |
| fi | K1 | P3 | … odottaa taikinan kohoamisaikoja. | … odottaa taikinan kohotusaikoja. | Etykiety fi: „Ensimmäinen/Toinen kohotus” (kohotus 41× vs kohoaminen 5×); „kohotusaika” to typowy termin piekarski. |
| tr | K1 | P3 | … hamurun mayalanma sürelerini bekliyor. | … hamurun kabarma sürelerini bekliyor. | Etykiety tr: „İlk/İkinci kabarma”; „mayalanma” naturalne, tylko spójność z etykietami. |
| tr | K2, K3 | P3 | … bölümünde yazan … | … bölümünde belirtilen … | „yazan” potoczne; „belirtilen” to standard instrukcji. |
| de | K1 | P3 | Der Plan für dieses Sauerteigrezept … | Der Plan für diese Sauerteig-Rezeptur … | Aplikacja tłumaczy „receptura” jako „Rezeptur” (karta „Über die Rezeptur”, klucz o planie „diese Rezeptur”); „Sauerteigrezept” występuje tylko tu. |
| nb | K3 | P3 | Stek på temperaturen og i tiden som står under «Om oppskriften». | Stek ved temperaturen og så lenge som står under «Om oppskriften». | „i tiden som står” brzmi kalką; „så lenge som” naturalniejsze. |
| uk | K2/K3 | P3 | K2: „указаної”, K3: „вказано” | K2: „вказаної” | Obie formy poprawne; ujednolicenie w parze sąsiednich kroków. |

P1: 0. P2: 0. P3: 13 (wiersze hr/sr/lv/nl/tr/uk liczone osobno dla każdej uwagi; 13 uwag w tabeli).

## Werdykt

**Brak P1.** Wszystkie 33 przekłady zachowują sens, nazwa karty „O recepturze” jest w każdym języku dosłownie ta sama co w słowniku, termin zakwasu spójny z istniejącymi kluczami, znaki nie łamią JSON ani TS. Brak P2. Uwagi P3 (styl, cudzysłowy, spójność z etykietami etapów) można zebrać do przeglądu natywnego (DEC-06); żadna nie blokuje.

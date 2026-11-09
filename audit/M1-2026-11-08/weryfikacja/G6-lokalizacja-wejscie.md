# Wejście weryfikacji G6-lokalizacja (M1 2026-11-08, commit 2ef8870a)
Pozycje do obalenia; uwaga: kilka ID z różnych ról może opisywać ten sam mechanizm (oceniasz każde ID osobno).

### 09-lokalizacja-003 · Przeliczanie jednostek w tekście psuje liczby: „400 °F, czyli około 399 °F”, „0,04 oz” ciasta
- Pozycja listy kontrolnej: LOK-07
- Poziom: P1
- Realność: realny (US: tryb imperialny domyślnie z regionu, D-044; rynek główny) · Pewność: wysoka
- Rodzaj: D
- Dowód: (1) teksty źródłowe z parą „X °F, czyli około Y °C” (receptury katalogu z amerykańskich źródeł) po przeliczeniu w trybie imperialnym: EN „Bake at 400 °F, which is about 399 °F”, „even water at 150 °F, about 151 °F, gives most adults third-degree burns” — 9 kluczy, w każdym języku (`dowody/sonda-fahrenheit.txt`, kod 0). (2) Liczba z separatorem tysięcy w przekładzie: da „1.000 g”, fi/nb/sv „1 000 g” w zdaniu MAS-002 dają da „0,04 oz dej”, fi/nb/sv „1 0,00 oz” zamiast „2 lb 3,3 oz” (`dowody/sonda-jednostki.txt`, kod 0; miejsce na końcu tego punktu). Przyczyna: `src/lib/unit-converter.ts:212` „const LICZBA = '(\\d+(?:[.,]\\d+)?)';” nie zna grupowania, a `src/lib/unit-converter.ts:222` zamienia przecinek na kropkę, więc „1.000” = 1. Zdanie MAS-002 w aplikacji: `src/components/receptury/DaneMaszynyKarta.tsx:71`.
- Mechanizm: `formatTextUnits` przelicza każdy „°C” i „g” w gotowym tekście bez wiedzy, że obok jest już wartość w °F, ani o separatorze tysięcy języka; skan wszystkich słowników na liczbę z grupowaniem przed g/kg: 1 klucz × 4 języki (da, fi, nb, sv); klucze z „°F” w tekście źródłowym: 9 (`dowody/sonda-fahrenheit.txt`).
- Powraca: mechanizm z 09-lokalizacja-501/601 (komentarze w `src/lib/unit-converter.ts`) → trwała kontrola: test, który dla każdego klucza EN i każdego słownika w trybie imperialnym sprawdza, że żadna liczba z „oz” nie spadła poniżej 1/100 wartości źródła i że w zdaniu nie stoją dwie wartości °F z jednej pary.
- Kroki w aplikacji: telefon z regionem US → receptura katalogu (np. bułki, wieniec, Rupjmaize) → notatka; telefon da/fi/nb/sv z jednostkami imperialnymi → receptura w trybie maszyny → karta danych maszyny.
- Weryfikacja przeciwna (E2): zdanie MAS-002 to przykład, a limit maszyny użytkownika pilnuje kod (aplikacja nie skaluje receptury ponad limit, MAS-062), więc zła liczba nie prowadzi do przepełnienia — dlatego P1, nie P0. Para °F/°C nie zmienia wartości (66 °C ≈ 151 °F), ale zdanie traci sens w głównym przepływie rynku US. Zostaje P1.
- Test akceptacyjny: test z „Powraca” zielony we wszystkich 35 językach; sondy `dowody/sonda-fahrenheit.test.ts.txt` i `dowody/sonda-jednostki.test.ts.txt` dają „2 lb 3,3 oz” w da/fi/nb/sv i jedną wartość °F w zdaniu.

### 09-lokalizacja-004 · Rodzajnik przy godzinie 1:xx (es znane) w es, es-419, pt, pt-BR, it, el; w es-419 i el także 13:xx
- Pozycja listy kontrolnej: LOK-05
- Poziom: P1 (zła forma w głównym przepływie, jak „5 minuty”; w es, pt, pt-BR, it rzadka godzina 1:xx, w es-419 i el codzienna 13:xx)
- Realność: realny (es-419, el), brzegowy (es, pt, pt-BR, it) · Pewność: wysoka (mechanizm), średnia (zegar 12 h na Hermes iOS)
- Rodzaj: D
- Dowód: znane z toru B; słowniki mają przyimek z rodzajnikiem w liczbie mnogiej wklejony przed `{godzina}`: es/es-419 „a las”, „hasta las”, „de las”; pt/pt-BR „às”, „até às”, „das”; it „alle”, „fino alle”, „dalle”; el „στις”, „έως τις” — 26 z 27 kluczy z godziną w es i pt, 25 w es-419, 22 w pt-BR, 26 w it, 27 w el (`dowody/godziny-mechanizm.txt`, lista zdań `dowody/godziny-w-zdaniach.txt`). Godzina pochodzi z `formatTime` (2 cyfry, `TIME_DEFAULT` w `src/lib/format.ts`): es „Inicio … a las 01:30”, es-419 „Listo jueves, 12 de noviembre a las 01:30 p.m..”, el „στις 01:30 μ.μ..” (`dowody/sonda-dzien-godzina.txt`; ICU Node). Poprawnie: „a la 1:30”, „à 1h30”, „all'1:30”, „στη 1:30”.
- Mechanizm: zgoda rodzajnika z liczbą godziny (1 = liczba pojedyncza) jest sklejeniem w słowniku, a tłumacz nie widzi wartości; w zegarze 12 h (es-419, el według CLDR) „1” to też 13:xx. tr, hu, fr, ro, de, cs, ru omijają problem („saat {godzina}”, „-ig”, „à”, „la”).
- Powraca: znane (tor B, rola 09) → trwała kontrola: test, który dla każdego klucza z parametrem godziny i godzin 1:30 i 13:30 w es, es-419, pt, pt-BR, it, el porównuje wynik z listą form poprawnych.
- Kroki w aplikacji: es-419 lub el → plan z gotowością 13:xx → „Dziś”, pas planu, powiadomienie „Do {godzina}.”; es/it/pt → krok nocny o 1:xx → komunikat ochrony snu.
- Weryfikacja przeciwna (E2): `formatTime` nie zmienia przyimka; w es zawsze 24 h, więc tylko 01:00–01:59 (komunikaty nocne częste w ochronie snu); dla es-419 i el zegar 12 h z CLDR w Node — na Hermes iOS do potwierdzenia. Zostaje P1 ze względu na es-419 i el.
- Test akceptacyjny: test z „Powraca” zielony; sonda `dowody/sonda-dzien-godzina.test.ts.txt` daje „a la 1:30” (es), „a la 1:30 p. m.” (es-419), „à 1:30”/„à 01:30” (pt), „all'1:30” (it), „στη 1:30” (el).

### 09-lokalizacja-005 · 15 tekstów głównego przepływu po angielsku w 33 językach (ekran miesza języki)
- Pozycja listy kontrolnej: LOK-11 (język zastępczy: LOK-04)
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: D
- Dowód: `docs/lokalizacja/czeka-na-przeklad.json`: 15 kluczy „od 2026-11-02” dla wszystkich 33 języków; bramka liczy je jako dozwolony brak (`dowody/check-i18n-uwagi.txt`: 13 992 braków dozwolonych = 424 klucze × 33, z czego 409 to funkcje PÓŹNIEJ). Miejsca: streszczenie prywatności w Ustawieniach (`src/components/settings/StudioEcosystemSection.tsx:85`), zdanie o szacunku okna szczytu na karcie zakwasu (`src/core/sourdough-physics.ts:170`), 13 opisów mąk w arkuszu składników (`src/core/flour-atlas-ogolne.ts:55` i dalej, przez `src/lib/nazwa-maki.ts:23`). Test `tests/czeka-na-przeklad-093.test.ts:51` dopuszcza dokładnie te wyjątki (D-126, D-132).
- Mechanizm: zmiana tekstu PL po przebiegu przekładu odkłada przekład do „następnego przebiegu”; bramka i test akceptują wyjątek bez daty końca.
- Powraca: D-126 i D-132 przyjęły koszt „do następnego przebiegu” (2026-11-02); kandydat 1.0 nadal go ma → trwała kontrola: `check:i18n` z flagą wydania traktuje wpisy `czeka-na-przeklad.json` jako błąd.
- Kroki w aplikacji: język inny niż pl/en → Ustawienia → Polityka prywatności (zdanie po angielsku); Zakwasy → karta zakwasu przed szczytem; receptura → składniki → mąka.
- Weryfikacja przeciwna (E2): decyzje D-126 i D-132 to zgoda na stan przejściowy, nie na wydanie z nim; zostaje P1.
- Test akceptacyjny: `docs/lokalizacja/czeka-na-przeklad.json` ma pustą listę `klucze`, `npm run check:i18n` bez uwag o brakach poza PÓŹNIEJ, test 093 bez wyjątków D-126 i D-132.

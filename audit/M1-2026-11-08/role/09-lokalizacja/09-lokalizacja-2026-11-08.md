# Audyt: Lokalizacja — Piekarz — 2026-11-08
Commit: 2ef8870a525485cc1ac57e5abe9d97d9937dfe42 · Tryb: audit (wariant głęboki, plan zatwierdzony 2026-11-08) · Moduły: i18n-expo, tlumaczenie · Środowisko: Linux 6.18 x86_64, Node v22.23.4, git; `npm ci`, typecheck, lint i pełny `npm test` z E0 wspólnego (`/home/user/piekarz/audit/M1-2026-11-08/wspolne/`, wszystkie kod 0, 574 zestawy / 6017 testów); `gh` bez ważnego tokenu (stan CI z `wspolne/ci.txt`); sieć: odczyt App Store (iTunes Search API) działa; Playwright 1.63 i Chrome są, ale projekt nie ma `react-native-web` ani `react-dom`, więc Expo web i zrzuty nie działają; brak macOS, Xcode, symulatora i urządzenia (Hermes, VoiceOver, układ 320 pt / AX5: kroki właściciela). Kopia robocza i sondy: `git worktree` w scratchpadzie (`wt-09`), w repozytorium tylko ten raport i `dowody/*.txt`.

Ostatni nagłówek promptu `prompty/09-lokalizacja.md` (linia 561 z 622): „## Kontrola dowodów i sekretów przed oddaniem raportu”.

## Podsumowanie

Mechanizm i18n jest dojrzały: 35 języków spójnych w rejestrze, `ACTIVE_LANGS`, słownikach, `app.json` (`locales`, `supportedLocales`, `supportsRTL: false`) i przełączniku; polyfill `Intl.PluralRules` z danymi 35 języków ładowany jako pierwszy import; bramka `npm run check:i18n` (kod 0, w CI przez `npm run verify`); sonda pseudolokalizacji 11 ekranów nie znalazła tekstu poza `t()`. Najpoważniejsze ryzyko to proces, nie kod: zdania krytyczne trybu maszyny i katalogu (oparzenia, dzieci, para) weszły po 2026-10-21 do 21 języków bez kontroli (a) polityki „szerokiej” (tłumaczenie zwrotne) i bez drugiego przeglądu AI (001, P0 z reguły roli; w mojej próbce 21 języków sens i liczby zgodne). Trzy defekty widoczne dla użytkownika: ekran awaryjny zawsze po polsku (002), przeliczanie jednostek w tekście daje „400 °F, czyli około 399 °F” na głównym rynku US i „0,04 oz” ciasta w da (003), znany błąd es „a las 1:30” to mechanizm w 6 językach, a w es-419 i el trafia też 13:xx (004). 15 tekstów (prywatność, opis mąk, okno szczytu zakwasu) pokazuje się po angielsku w 33 językach (005). Decyzje dla właściciela: kontrola (a) dla 9 kluczy krytycznych × 21 języków przed wysyłką (koszt rzędu 1–2 USD w Batches), przekład 15 kluczy przed 1.0, sposób naprawy rodzajnika przy godzinie.

| ID | Poziom | Rodzaj | Tytuł | Status |
|---|---|---|---|---|
| 09-lokalizacja-001 | P0 | D | Zdania krytyczne maszyny i katalogu w 21 językach bez kontroli (a) i bez drugiego przeglądu AI | otwarte |
| 09-lokalizacja-002 | P1 | D | Ekran awaryjny po dwóch nieudanych startach jest zawsze po polsku | otwarte |
| 09-lokalizacja-003 | P1 | D | Przeliczanie jednostek w tekście psuje liczby: „400 °F, czyli około 399 °F”, „0,04 oz” ciasta | otwarte |
| 09-lokalizacja-004 | P1 | D | Rodzajnik przy godzinie 1:xx (es znane) w es, es-419, pt, pt-BR, it, el; w es-419 i el także 13:xx | otwarte |
| 09-lokalizacja-005 | P1 | D | 15 tekstów głównego przepływu po angielsku w 33 językach (ekran miesza języki) | otwarte |
| 09-lokalizacja-006 | P2 | D | Godzina z zerem wiodącym w zegarze 12 h („01:30 PM”) i podwójna kropka po „p.m.” | otwarte |
| 09-lokalizacja-007 | P2 | D | Data w mianowniku wklejona w zdanie („Gotowe czwartek, 12 listopada…”) we wszystkich językach | otwarte |
| 09-lokalizacja-008 | P2 | P | Długości i objętości (cm, mm, ml, l) bez przeliczenia w trybie imperialnym | otwarte |
| 09-lokalizacja-009 | P2 | D | Przetłumaczona nazwa wypieku zapisywana jako dane (Dziennik w starym języku po zmianie) | otwarte |
| 09-lokalizacja-010 | P2 | D | „DDT:” na sztywno w podglądzie importu receptury | otwarte |
| 09-lokalizacja-011 | P2 | D | Bramka bez pseudolokalizacji, bez sierot w 33 słownikach i bez samosprawdzenia liczby mnogiej na Hermes | otwarte |
| 09-lokalizacja-012 | P2 | P | Drugi przegląd AI tylko próbką 12/33 języków, rejestr przeglądów nieaktualny od 2026-10-21 | otwarte |

## Linia bazowa i założenia

**E0: stan projektu** z `CLAUDE.md` i polecenia M1 (aktualny, bez pytań): TestFlight build 1023, testuje tylko właściciel na danych testowych; rynek globalny, 35 języków (DEC-06 z rozszerzeniem właściciela = polityka „szeroka”); przegląd treści krytycznych: człowiek (właściciel, D-123/D-126); próg 500 USD, bramka opłacalności: wynik „przerobić” 345 USD (wyjątek nazwany właściciela 2026-11-08, D-040; nie liczę jej od nowa). Hierarchia źródeł: D-035. Przeczytane decyzje językowe: DEC-06 (w `docs/lokalizacja/jezyki.md`), D-044 (jednostki według regionu), D-048 (najdłuższy język: francuski), D-053/D-054 (nazwy i lokalizacje sklepu), D-086 (sr-Latn), D-123, D-126, D-127, D-132, D-207, D-212, D-218, D-235, D-241, D-249, D-259, D-267, D-291. Stan CI z `wspolne/ci.txt`: CI #117, TZ Matrix #77, TestFlight #23 zielone; iOS E2E #96 na master czerwony (`05-dwa-wypieki`), Nightly bez zielonego w oknie 11-02…11-08 — znalezisko roli 07 (zasada 21), poza listą LOK; E2E przechodzi scenariusze tylko w pl_PL i en_US.

**E0: języki deklarowane vs słowniki vs rejestr:** 35 = 35 = 35 (`app.json` `locales` i `supportedLocales` iOS/Android, `ACTIVE_LANGS` w `src/lib/i18n.ts`, `SUPPORTED_LOCALES_35` z `status: 'released'`, 33 katalogi `src/lib/i18n-slowniki/` + PL źródło + EN, 35 plików `languages/*.json`); nazwa pod ikoną = `t('Piekarz')` w każdym języku (sprawdzone skryptem, 0 różnic); jedynym tekstem `Info.plist` w `locales` jest `CFBundleDisplayName`, bo aplikacja nie prosi o uprawnienia z opisem (powiadomienia bez klucza `UsageDescription`, aparat wyłączony z autolinkingu, kalendarz przez plik ICS).

**E0b: wzorzec od zera (przed lekturą rejestru języków).**
- Rynki z dowodów: US i PL w badaniu monetyzacji (`docs/monetyzacja-badanie-2026-10.md`, odczyty US/PL), recenzje skupione w US (ZAL-030, ZAL-037: US potrzebuje jednostek imperialnych, „potwierdzone (motyw)”). Konkurencja odczytana dziś w sklepie US, DE i PL (`dowody/sklep-konkurencja-jezyki.txt`): liderzy z ocenami (Kneady 733, Loaflo 567, Rise 337) są tylko po angielsku; najszerzej zlokalizowane: Yeasta 9 języków (z arabskim i hebrajskim), Flourwise 6 (z polskim), BreadMe 5. Wniosek: zasięg 35 języków przewyższa niszę; najlepszy w klasie wyróżnia się tu jakością angielskiego dla US (°F, oz, 12 h, gramatyka) i tym, że każdy język „brzmi jak napisany w nim”. Języki spoza listy z rynku: chiński uproszczony (storefront CHN wyłączony decyzją ICP, D-055), arabski/hebrajski (RTL, tylko Yeasta) — przy polityce „szerokiej” bez znaleziska.
- Co musi działać w każdym języku: liczba mnoga CLDR na Hermes, godziny i daty z `Intl`, jednostki według regionu (US: °F/oz), zdania z godziną i datą zgodne gramatycznie, ostrzeżenia bezpieczeństwa wierne, ekrany awaryjne i powiadomienia w języku użytkownika.

**Wymiary pokrycia:**
- Rynki i języki: wyżej; koszt utrzymania ×35 jest w D-048/D-267 (Batches, sesje roli 09). Wynik: brak braków języka; 001, 012 (proces).
- Miejsca tekstu: ekrany (sonda pseudo 11 ekranów), alerty, błędy bazy (StorageGate), powiadomienia (`src/lib/notifications.ts`), eksport ICS, ekran awaryjny, nazwa pod ikoną, uprawnienia (brak); widżetów i audio brak. Wynik: 002, 005, 010.
- Gramatyka: liczba mnoga (polyfill, testy wektorów w Jest), rodzaj/przypadek przy parametrach, sklejanie. Wynik: 004, 007.
- Formaty: daty, 12/24 h, separatory, jednostki i preferencja (D-044), strefa czasowa (TZ Matrix w CI), pierwszy dzień tygodnia (`getCalendars().firstWeekday`). Wynik: 003, 006, 008; „Do sprawdzenia”: ustawienie 24 h telefonu, separatory przy języku innym niż region.
- Układ: pseudolokalizacja tylko tekstowa (bez zrzutów), najdłuższy język FR (D-048), glify (krój tytułów wyłączony dla vi, ja, ko, zh-Hant, uk, ru, sr z testami), RTL wyłączone świadomie. Wynik: 011; zrzuty nie sprawdzono.
- Dostępność: etykiety VoiceOver przez `t()` (sonda: wszystkie poza nazwami języków i dniami z `Intl`), `accessibilityLanguage` na przełączniku języka. Wynik: sprawdzone, brak.
- Mechanizm: zapis wyboru > języki systemu (warianty es-419, pt-BR, zh-Hant, aliasy) > EN; zmiana języka w aplikacji natychmiast i z ponownym planem powiadomień. Wynik: 002, 009.
- Proces: kontekst kluczy (`docs/lokalizacja/pl.kontekst.json`, bramka), glosariusz `docs/i18n-glossary-35.md`, oznaczenie MT w nagłówkach słowników i rejestrze, przeglądy. Wynik: 001, 011, 012.
- Treści i audio: treści krytyczne w `docs/tresci/<język>/` (kontrola mechaniczna roli 06), nazwy źródeł bez przekładu (D-127). Wynik: 001.

**Soczewki (po kolei, bez subagentów):** (1) użytkownik drugiego rynku bez polskiego — ekran awaryjny po polsku (002), angielskie zdania w obcym ekranie (005); (2) telefon po angielsku w Polsce (en-PL) — Intl daje 24 h i przecinek, ale parametry `t()` formatuje sam język (`en`), więc możliwe mieszanie separatorów (Do sprawdzenia); (3) tłumacz z kluczem i kontekstem bez ekranu — nie widzi, że `{godzina}` bywa 1:xx i że `{dzien}` to mianownik z datą (004, 007); (4) użytkownik VoiceOver w drugim języku — etykiety przetłumaczone, wymowa nazw języków z `accessibilityLanguage`; na urządzeniu nie sprawdzono.

**Rejestr założeń:** bez propozycji zmiany statusu; ZAL-037 (US potrzebuje imperialnych) zostaje „potwierdzone”, a 003 i 008 pokazują, że ta potrzeba jest dziś obsłużona częściowo.

## Pokrycie (co sprawdzono, czego nie)

| Obszar / pliki / ekrany | Sprawdzone? | Jak (plik dowodu) |
|---|---|---|
| Konfiguracja języków: `app.json`, `languages/*.json`, `src/lib/i18n-locales.ts`, `src/lib/i18n.ts` | tak, przeczytane | E0 wyżej |
| Słowniki 35 języków (bramka projektu i skrypt roli na eksporcie do JSON) | tak | `dowody/check-i18n.txt`, `dowody/check-i18n-uwagi.txt`, `dowody/sprawdz-i18n-rola.txt`, `dowody/eksport-slownikow.cjs.txt` |
| Liczby w przekładzie (każdy klucz × 33 języki) | tak | `dowody/liczby-przekladu.txt`, `dowody/liczby.mjs.txt` |
| Polyfill i liczba mnoga: `src/lib/intl-polyfills.ts`, `app/_layout.tsx`, testy `plural-intl` | tak w kodzie i Jest; na Hermes nie | — |
| Formaty i jednostki: `src/lib/format.ts`, `src/lib/unit-converter.ts` | tak, przeczytane i sondy | `dowody/sonda-jednostki.txt`, `dowody/sonda-fahrenheit.txt`, `dowody/sonda-dzien-godzina.txt` |
| Zdania z godziną (27 kluczy × 15 języków) | tak | `dowody/godziny-w-zdaniach.txt`, `dowody/godziny-mechanizm.txt` |
| 11 ekranów w pseudolokalizacji (stan startowy, pusta baza + trwający wypiek) | tak, tekstowo (react-test-renderer), bez zrzutów | `dowody/sonda-pseudo.txt`, `dowody/sonda-pseudo-wynik.txt` |
| Ekran awaryjny i StorageGate | tak, kod i sonda | `dowody/sonda-awaryjny.txt` |
| Powiadomienia: tekst przy planowaniu, ponowny plan po zmianie języka | tak, kod | — |
| Treści krytyczne: `kontrole-tresci.mjs` w 33 językach + PL/EN | tak | `dowody/kontrole-tresci-jezyki.txt` |
| Jakość języka (próbka) | częściowo: 24 klucze × 6 języków + 7 ostrzeżeń maszyny × 21 języków + zdanie BEZ-WRZ × 10 języków, czytane w tej sesji (nie świeży kontekst, nie rodzimy użytkownik) | `dowody/probka-jakosci.txt` |
| Konkurencja i języki storefrontów | tak, odczyt 2026-11-08 | `dowody/sklep-konkurencja-jezyki.txt` |
| Zrzuty 320 pt / AX5 / najdłuższy język, Expo web | nie sprawdzono: brak `react-native-web` w projekcie, brak macOS | krok właściciela |
| Liczba mnoga i `Intl` na Hermes (urządzenie) | nie sprawdzono | krok właściciela |
| VoiceOver na urządzeniu | nie sprawdzono | krok właściciela |
| Funkcje PÓŹNIEJ (akademia, spiżarnia, QR, druk, przeliczniki) | nie sprawdzano poza wynikiem skryptu (wejścia ukryte, `src/lib/wejscia-pozniej.ts`) | `dowody/sprawdz-i18n-rola.txt` |
| Metadane sklepu, słowa kluczowe, kody lokalizacji ASC | poza rolą (rola 10) | — |

## Kontrola dowodów i sekretów

`node /home/user/piekarz/audit/M1-2026-11-08/narzedzia/sprawdz-raport.mjs <raport> /home/user/piekarz /home/user/piekarz/audit/M1-2026-11-08/role/09-lokalizacja --rola 09-lokalizacja` → „OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone; format raportu 09-lokalizacja”, kod 0 (2026-11-08, po dwóch rundach poprawek odwołań do cytatów: 9, potem 2 błędy, poprawione w raporcie).

`git status --porcelain` w `/home/user/piekarz` na końcu pracy: pusty (pliki śledzone nietknięte; katalog `audit/` w `.git/info/exclude`).

## Stosowalność listy kontrolnej

| Pozycja | Status (dotyczy / nie dotyczy + powód / decyzja D-xx) | Wynik (ok / znalezisko ID / nie sprawdzono + powód) |
|---|---|---|
| LOK-01 | rozstrzygnięte decyzją: DEC-06 z rozszerzeniem (polityka „szeroka”, 35 jak w Treningu) | ok: 35 = rejestr = słowniki; kontrola (b) opis ogólny mąk (094), (c) rola 10 (D-054), (d) najdłuższy język zmierzony (D-048), zrzuty nie; (a) i (e) patrz 001, 012 |
| LOK-02 | dotyczy | ok: `supportedLocales`, `locales`, `CFBundleAllowMixedLocalizations: true`, `supportsRTL: false`; brak tekstów uprawnień do tłumaczenia; brak pseudo w wydaniu |
| LOK-03 | dotyczy | 010; sonda pseudo 11 ekranów: 0 tekstów poza `t()` poza danymi z `Intl` i nazwami języków |
| LOK-04 | dotyczy | 005 (język zastępczy EN); bramka: 0 błędów; klucze dynamiczne mają zamknięte listy z danych (`*Pl`) |
| LOK-05 | dotyczy | 004, 007; polyfill i wektory w Jest ok; na Hermes nie sprawdzono (011) |
| LOK-06 | dotyczy | ok: parametry `{…}` zgodne (bramka i skrypt roli), liczby: 140 różnic, wszystkie z pisowni słownej (CJK „1回”, miesiące) albo typów mąk pominiętych decyzją (kontrola b); `pH < 4.5` w PL i pt-BR z kropką → Do sprawdzenia |
| LOK-07 | dotyczy | 003, 006, 008; daty i liczby przez `Intl` z językiem aplikacji; D-044 jednostki według regionu |
| LOK-08 | dotyczy | nie sprawdzono: brak Expo web i macOS; krok właściciela (zrzuty FR i pseudo przy 320 pt, AX5) |
| LOK-09 | dotyczy | 009; łańcuch zapis → system → EN ok, zmiana bez reinstalacji ok, nigdy klucz ani pusty tekst (`t()` z tekstem źródłowym) |
| LOK-10 | dotyczy | 001; `kontrole-tresci.mjs`: 30 języków kod 0, ja/ko/zh-Hant kod 1 = wyjątek nazwany (`docs/tresci/przeglad/zakwas-bezpieczenstwo.md`) |
| LOK-11 | dotyczy | 005, 012; próbka jakości: bez zmian sensu |
| LOK-12 | dotyczy | ok: etykiety przez `t()` (sonda), `accessibilityLanguage` na nazwach języków; na urządzeniu nie sprawdzono |
| LOK-13 | dotyczy | 002; powiadomienia w języku aplikacji i ponowny plan po zmianie języka ok; eksport ICS przez `t()` ok; widżetów brak |
| LOK-14 | dotyczy | ok w kodzie: krój tytułów wyłączony dla vi, ja, ko, zh-Hant i cyrylicy uk/ru/sr (testy cmap i GSUB); zrzut alfabetów nie sprawdzono; RTL wyłączone świadomie |
| LOK-15 | dotyczy | 011; `check:i18n` w `npm run verify` w CI, plik kontekstu, bramka nie zapisuje oczekiwań sama |

## Znaleziska (szczegóły)

### 09-lokalizacja-001 · Zdania krytyczne maszyny i katalogu w 21 językach bez kontroli (a) i bez drugiego przeglądu AI
- Pozycja listy kontrolnej: LOK-10
- Poziom: P0 (reguła LOK-10: treść krytyczna w języku poza kontrolą (a) polityki „szerokiej”)
- Realność: brzegowy · Pewność: wysoka
- Rodzaj: D
- Dowód: rejestr twierdzeń ma 58 twierdzeń krytycznych, w tym 25 MAS i BEZ-WRZ-001 (`docs/tresci/rejestr.json`, pole `krytyczne`). Partia maszyny (D-267): drugi przegląd AI tylko na 12 z 33 języków, odrzucone „wszystkie 33 języki drugim przeglądem (koszt, DEC-06 wymaga próbki)” (`docs/decyzje.md:1553`); partia katalogu p8 (zdanie BEZ-WRZ-001 w notatkach Rupjmaize i obwarzanka, D-235) tak samo (`docs/decyzje.md:1321`). W `docs/lokalizacja/przeklad-maszyna-09m-2026-11-04.json`, `przeklad-katalog-p8-2026-11-04.json`, `przeklad-drozdze-zrodla-09d-2026-11-04.json` słowo „zwrotn” występuje 0 razy (tłumaczenia zwrotnego nie było w żadnym języku). Warunek 7 rejestru (`docs/lokalizacja/jezyki.md:110`) wymaga tłumaczenia zwrotnego tekstów krytycznych.
- Mechanizm: partie przekładu po 2026-10-21 (09d, p8, 09m) zastąpiły kontrolę (a) próbką drugiego przeglądu AI na 12 językach; klucze krytyczne: 7 zdań trybu maszyny (k52, k53, k56–k60: opóźniony start, rękawice, gorące mieszadło, para, otwór pary, dzieci poniżej 8 lat) i 2 notatki katalogu ze zdaniem o oparzeniu wodą 66 °C; języki bez żadnej kontroli: cs, sk, hr, sl, sr, lt, et, uk, es-419, pt, pt-BR, it, nl, sv, da, nb, tr, el, id, ms, vi.
- Powraca: nie (pierwsza partia z tłumaczeniem zwrotnym była zrobiona, 093) → trwała kontrola: test, że każdy klucz z twierdzeniem `krytyczne` ma w rejestrze języków wpis kontroli (a) dla każdego języka.
- Wzorzec lub źródło: zasada roli 3 i polityka „szeroka” (a) w prompcie roli; DEC-06 w `docs/lokalizacja/jezyki.md`.
- Kroki w aplikacji: receptura → tryb maszyny (D-138) w dowolnym z 21 języków → ostrzeżenia pod programem; receptury katalogu Rupjmaize i obwarzanek → notatka.
- Weryfikacja przeciwna (E2): szukałem decyzji, która zwalnia te klucze z kontroli (a) — D-235 i D-267 mówią tylko o drugim przeglądzie AI i są „do weta” agenta, nie słowami właściciela. Przeczytałem 7 ostrzeżeń maszyny we wszystkich 21 językach i zdanie BEZ-WRZ-001 w 10 z nich (`dowody/probka-jakosci.txt` i odczyt w tej sesji): sens, liczby (8 lat, 66 °C, 150 °F, 2 s) i siła zakazu bez złagodzeń. Znalezisko zostaje jako brak bramki (P0 z reguły), realność obniżona do „brzegowy”.
- Opcje: (a) tłumaczenie zwrotne 9 kluczy × 21 języków w Batches w świeżych zapytaniach z porównaniem sensu i wpisem w rejestrze — ok. 200 segmentów, koszt rzędu 1–2 USD (por. D-048: 80 × 34 = 1,41 USD); (b) do czasu (a) w tych 21 językach pokazywać te 9 zdań po angielsku z informacją — gorsze dla użytkownika, mieszanie języków; Rekomendacja: (a) przed wysyłką do sklepu.
- Test akceptacyjny: rejestr języków ma dla każdego klucza krytycznego i każdego z 33 języków wynik tłumaczenia zwrotnego bez nierozstrzygniętej rozbieżności; test w `tests/` porównuje listę kluczy krytycznych (z `docs/tresci/rejestr.json` i plików treści) z tym wpisem.
- Status: otwarte

### 09-lokalizacja-002 · Ekran awaryjny po dwóch nieudanych startach jest zawsze po polsku
- Pozycja listy kontrolnej: LOK-13
- Poziom: P1
- Realność: brzegowy (tylko po dwóch nieudanych startach z rzędu; wtedy dotyczy 34 z 35 języków) · Pewność: wysoka
- Rodzaj: D
- Dowód: `app/_layout.tsx:64` „if ((await beginStartup()).rescue) {” — gałąź awaryjna kończy efekt przed `startAplikacji()`, a język ustawia tylko `startAplikacji` (`app/_layout.tsx:36` „await initLanguage();”); stan początkowy języka to źródło: `src/lib/i18n.ts:62` „let currentLang: Lang = SOURCE_LANG;”. Sonda: telefon de-DE, `beginStartup` → awaria, render `RootLayout`: „język aplikacji: pl”, teksty „Piekarz nie uruchomił się poprawnie”, „Eksportuj kopię danych”, „Spróbuj ponownie” (`dowody/sonda-awaryjny.txt`, kod 0). Komunikaty błędu eksportu też po polsku (`src/components/RescueScreen.tsx:46`).
- Mechanizm: język rozstrzyga się dopiero po bazie, a tryb awaryjny bazy nie dotyka; `grep -n "initLanguage\|setLang" app/_layout.tsx` → 1 trafienie (linia 36). StorageGate po błędzie bazy jest w porządku, bo `initDatabase` nie rzuca i `initLanguage` biegnie dalej (język z systemu).
- Powraca: nie → test: tryb awaryjny na telefonie de-DE pokazuje niemiecki tekst.
- Wzorzec lub źródło: LOK-13 (ekran awaryjny roli 12 w języku użytkownika).
- Kroki w aplikacji: dwa starty przerwane przed pierwszym ekranem → trzeci start → ekran z eksportem kopii danych po polsku.
- Weryfikacja przeciwna (E2): RescueScreen nie ustawia języka sam; nie ma innego wywołania `initLanguage` przed renderem; sonda potwierdza. Zostaje.
- Opcje: w gałęzi awaryjnej `setLang(resolveLanguage(null, języki systemu))` bez bazy (wybór zapisany w bazie jest wtedy pominięty, więc użytkownik z ręcznym wyborem innym niż system zobaczy język systemu) — Rekomendacja; alternatywa: zapis wyboru języka także w małym pliku poza bazą (dokładniejsze, więcej kodu).
- Test akceptacyjny: test renderu `RootLayout` z `beginStartup` → awaria i `getLocales` de-DE: tytuł i przyciski po niemiecku; z en-US po angielsku.
- Status: otwarte

### 09-lokalizacja-003 · Przeliczanie jednostek w tekście psuje liczby: „400 °F, czyli około 399 °F”, „0,04 oz” ciasta
- Pozycja listy kontrolnej: LOK-07
- Poziom: P1
- Realność: realny (US: tryb imperialny domyślnie z regionu, D-044; rynek główny) · Pewność: wysoka
- Rodzaj: D
- Dowód: (1) teksty źródłowe z parą „X °F, czyli około Y °C” (receptury katalogu z amerykańskich źródeł) po przeliczeniu w trybie imperialnym: EN „Bake at 400 °F, which is about 399 °F”, „even water at 150 °F, about 151 °F, gives most adults third-degree burns” — 9 kluczy, w każdym języku (`dowody/sonda-fahrenheit.txt`, kod 0). (2) Liczba z separatorem tysięcy w przekładzie: da „1.000 g”, fi/nb/sv „1 000 g” w zdaniu MAS-002 dają da „0,04 oz dej”, fi/nb/sv „1 0,00 oz” zamiast „2 lb 3,3 oz” (`dowody/sonda-jednostki.txt`, kod 0; miejsce na końcu tego punktu). Przyczyna: `src/lib/unit-converter.ts:212` „const LICZBA = '(\\d+(?:[.,]\\d+)?)';” nie zna grupowania, a `src/lib/unit-converter.ts:222` zamienia przecinek na kropkę, więc „1.000” = 1. Zdanie MAS-002 w aplikacji: `src/components/receptury/DaneMaszynyKarta.tsx:71`.
- Mechanizm: `formatTextUnits` przelicza każdy „°C” i „g” w gotowym tekście bez wiedzy, że obok jest już wartość w °F, ani o separatorze tysięcy języka; skan wszystkich słowników na liczbę z grupowaniem przed g/kg: 1 klucz × 4 języki (da, fi, nb, sv); klucze z „°F” w tekście źródłowym: 9 (`dowody/sonda-fahrenheit.txt`).
- Powraca: mechanizm z 09-lokalizacja-501/601 (komentarze w `src/lib/unit-converter.ts`) → trwała kontrola: test, który dla każdego klucza EN i każdego słownika w trybie imperialnym sprawdza, że żadna liczba z „oz” nie spadła poniżej 1/100 wartości źródła i że w zdaniu nie stoją dwie wartości °F z jednej pary.
- Wzorzec lub źródło: zasada roli 6; LOK-07.
- Kroki w aplikacji: telefon z regionem US → receptura katalogu (np. bułki, wieniec, Rupjmaize) → notatka; telefon da/fi/nb/sv z jednostkami imperialnymi → receptura w trybie maszyny → karta danych maszyny.
- Weryfikacja przeciwna (E2): zdanie MAS-002 to przykład, a limit maszyny użytkownika pilnuje kod (aplikacja nie skaluje receptury ponad limit, MAS-062), więc zła liczba nie prowadzi do przepełnienia — dlatego P1, nie P0. Para °F/°C nie zmienia wartości (66 °C ≈ 151 °F), ale zdanie traci sens w głównym przepływie rynku US. Zostaje P1.
- Opcje: (a) w tekstach źródłowych z wartością w °F oznaczyć ją tak, by przeliczenie pomijało parę (np. w trybie imperialnym pokazać tylko °F ze źródła) i w `LICZBA` rozpoznawać grupowanie według języka tekstu — jedna poprawka mechanizmu; (b) poprawić 4 słowniki (bez separatora tysięcy) i przepisać 9 zdań bez pary — szybciej, ale mechanizm zostaje; Rekomendacja: (a) z testem z „Powraca”.
- Test akceptacyjny: test z „Powraca” zielony we wszystkich 35 językach; sondy `dowody/sonda-fahrenheit.test.ts.txt` i `dowody/sonda-jednostki.test.ts.txt` dają „2 lb 3,3 oz” w da/fi/nb/sv i jedną wartość °F w zdaniu.
- Status: otwarte

### 09-lokalizacja-004 · Rodzajnik przy godzinie 1:xx (es znane) w es, es-419, pt, pt-BR, it, el; w es-419 i el także 13:xx
- Pozycja listy kontrolnej: LOK-05
- Poziom: P1 (zła forma w głównym przepływie, jak „5 minuty”; w es, pt, pt-BR, it rzadka godzina 1:xx, w es-419 i el codzienna 13:xx)
- Realność: realny (es-419, el), brzegowy (es, pt, pt-BR, it) · Pewność: wysoka (mechanizm), średnia (zegar 12 h na Hermes iOS)
- Rodzaj: D
- Dowód: znane z toru B; słowniki mają przyimek z rodzajnikiem w liczbie mnogiej wklejony przed `{godzina}`: es/es-419 „a las”, „hasta las”, „de las”; pt/pt-BR „às”, „até às”, „das”; it „alle”, „fino alle”, „dalle”; el „στις”, „έως τις” — 26 z 27 kluczy z godziną w es i pt, 25 w es-419, 22 w pt-BR, 26 w it, 27 w el (`dowody/godziny-mechanizm.txt`, lista zdań `dowody/godziny-w-zdaniach.txt`). Godzina pochodzi z `formatTime` (2 cyfry, `TIME_DEFAULT` w `src/lib/format.ts`): es „Inicio … a las 01:30”, es-419 „Listo jueves, 12 de noviembre a las 01:30 p.m..”, el „στις 01:30 μ.μ..” (`dowody/sonda-dzien-godzina.txt`; ICU Node). Poprawnie: „a la 1:30”, „à 1h30”, „all'1:30”, „στη 1:30”.
- Mechanizm: zgoda rodzajnika z liczbą godziny (1 = liczba pojedyncza) jest sklejeniem w słowniku, a tłumacz nie widzi wartości; w zegarze 12 h (es-419, el według CLDR) „1” to też 13:xx. tr, hu, fr, ro, de, cs, ru omijają problem („saat {godzina}”, „-ig”, „à”, „la”).
- Powraca: znane (tor B, rola 09) → trwała kontrola: test, który dla każdego klucza z parametrem godziny i godzin 1:30 i 13:30 w es, es-419, pt, pt-BR, it, el porównuje wynik z listą form poprawnych.
- Wzorzec lub źródło: zasada roli 5 (gramatyka w mechanizmie, nie w kodzie); reguła liczby mnogiej CLDR dla es, pt, it, el: 1 → one (unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html, wzorce roli).
- Kroki w aplikacji: es-419 lub el → plan z gotowością 13:xx → „Dziś”, pas planu, powiadomienie „Do {godzina}.”; es/it/pt → krok nocny o 1:xx → komunikat ochrony snu.
- Weryfikacja przeciwna (E2): `formatTime` nie zmienia przyimka; w es zawsze 24 h, więc tylko 01:00–01:59 (komunikaty nocne częste w ochronie snu); dla es-419 i el zegar 12 h z CLDR w Node — na Hermes iOS do potwierdzenia. Zostaje P1 ze względu na es-419 i el.
- Opcje: (a) godzina jako liczba mnoga przez mechanizm: `tPlural(godzinaWyświetlana, …)` z formą `#one` „a la {godzina}” — gramatyka w słowniku, jedna zmiana w miejscach wywołania; (b) przeformułować ok. 150 tekstów w 6 językach bez rodzajnika („Listo: {dzien}, {godzina}”) — bez kodu, ale styl mniej naturalny; Rekomendacja: (a), bo ten sam mechanizm obsłuży nowe języki.
- Test akceptacyjny: test z „Powraca” zielony; sonda `dowody/sonda-dzien-godzina.test.ts.txt` daje „a la 1:30” (es), „a la 1:30 p. m.” (es-419), „à 1:30”/„à 01:30” (pt), „all'1:30” (it), „στη 1:30” (el).
- Status: otwarte

### 09-lokalizacja-005 · 15 tekstów głównego przepływu po angielsku w 33 językach (ekran miesza języki)
- Pozycja listy kontrolnej: LOK-11 (język zastępczy: LOK-04)
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: D
- Dowód: `docs/lokalizacja/czeka-na-przeklad.json`: 15 kluczy „od 2026-11-02” dla wszystkich 33 języków; bramka liczy je jako dozwolony brak (`dowody/check-i18n-uwagi.txt`: 13 992 braków dozwolonych = 424 klucze × 33, z czego 409 to funkcje PÓŹNIEJ). Miejsca: streszczenie prywatności w Ustawieniach (`src/components/settings/StudioEcosystemSection.tsx:85`), zdanie o szacunku okna szczytu na karcie zakwasu (`src/core/sourdough-physics.ts:170`), 13 opisów mąk w arkuszu składników (`src/core/flour-atlas-ogolne.ts:55` i dalej, przez `src/lib/nazwa-maki.ts:23`). Test `tests/czeka-na-przeklad-093.test.ts:51` dopuszcza dokładnie te wyjątki (D-126, D-132).
- Mechanizm: zmiana tekstu PL po przebiegu przekładu odkłada przekład do „następnego przebiegu”; bramka i test akceptują wyjątek bez daty końca.
- Powraca: D-126 i D-132 przyjęły koszt „do następnego przebiegu” (2026-11-02); kandydat 1.0 nadal go ma → trwała kontrola: `check:i18n` z flagą wydania traktuje wpisy `czeka-na-przeklad.json` jako błąd.
- Wzorzec lub źródło: LOK-11 (brak mieszania języków na ekranie).
- Kroki w aplikacji: język inny niż pl/en → Ustawienia → Polityka prywatności (zdanie po angielsku); Zakwasy → karta zakwasu przed szczytem; receptura → składniki → mąka.
- Weryfikacja przeciwna (E2): decyzje D-126 i D-132 to zgoda na stan przejściowy, nie na wydanie z nim; zostaje P1.
- Opcje: (a) przebieg przekładu 15 kluczy × 33 języki przed wysyłką z drugim przeglądem AI (opis mąk ma liczby: kontrola liczb skryptem); (b) wysłać 1.0 z angielskim tekstem — decyzja właściciela z wpisem; Rekomendacja: (a).
- Test akceptacyjny: `docs/lokalizacja/czeka-na-przeklad.json` ma pustą listę `klucze`, `npm run check:i18n` bez uwag o brakach poza PÓŹNIEJ, test 093 bez wyjątków D-126 i D-132.
- Status: otwarte

### 09-lokalizacja-006 · Godzina z zerem wiodącym w zegarze 12 h („01:30 PM”) i podwójna kropka po „p.m.”
- Pozycja listy kontrolnej: LOK-07
- Poziom: P2
- Realność: realny (en-US, rynek główny) · Pewność: wysoka (ICU Node), na Hermes iOS do potwierdzenia zrzutem
- Rodzaj: D
- Dowód: `src/lib/format.ts:89` „const TIME_DEFAULT: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };” — en-US „Ready Thursday, November 12 at 01:30 PM.”, es-419 „a las 01:30 p.m..”, el „01:30 μ.μ..” (`dowody/sonda-dzien-godzina.txt`). To samo w `src/lib/kalendarz-teksty.ts:64`.
- Mechanizm: `hour: '2-digit'` w zegarze 12 h daje zero wiodące; słowniki kończą zdanie kropką po `{godzina}`, a godzina 12 h w es-419 i el kończy się skrótem z kropką; `grep -rn "hour: '2-digit'" src` → 2 trafienia.
- Powraca: nie → test `formatTime` dla en-US („1:30 PM”) i zdania z godziną 12 h bez „..”.
- Wzorzec lub źródło: LOK-07; zasada roli 6.
- Kroki w aplikacji: region US → „Dziś”, plan, powiadomienia.
- Opcje: (a) `hour: 'numeric'` (ICU Node: en-US „1:30 PM”, es-419 „1:30 p.m.”, ale też pl i de „1:30” zamiast dziś „01:30” — zmiana wyglądu w 24 h do roli 04); (b) `hour: '2-digit'` tylko w zegarze 24 h, `numeric` w 12 h (cykl z `resolvedOptions().hourCycle`); do tego usuwanie kropki po skrócie przy składaniu zdania; Rekomendacja: (b) + test na 35 językach.
- Test akceptacyjny: en-US „1:30 PM”, pl „01:30” albo „1:30” według decyzji roli 04, brak „..” w zdaniach z godziną w es-419 i el.
- Status: otwarte

### 09-lokalizacja-007 · Data w mianowniku wklejona w zdanie („Gotowe czwartek, 12 listopada…”) we wszystkich językach
- Pozycja listy kontrolnej: LOK-05 (sklejanie i przypadek przy parametrach)
- Poziom: P2
- Realność: realny dla planów od 3 dni naprzód · Pewność: wysoka
- Rodzaj: D
- Dowód: `src/lib/spirala-etykieta.ts:39` zwraca „{dzień tygodnia}, {d} {miesiąc}” z `Intl` w mianowniku, a `src/lib/spirala-etykieta.ts:44` wkleja go w „Gotowe {dzien} o {godzina}.”; wynik: pl „Gotowe czwartek, 12 listopada o 13:30.”, de „Fertig Donnerstag, 12. November um 13:30.”, es „Listo jueves, 12 de noviembre…”, ru „Готово четверг, 12 ноября в 13:30.”, cs „Hotovo čtvrtek 12. listopadu v 13:30.” (`dowody/sonda-dzien-godzina.txt`).
- Mechanizm: `dzienSlownie` daje słowo („dziś”, „jutro”) albo datę, a ten sam klucz wymaga w wielu językach przyimka przed datą („w czwartek”, „am Donnerstag”, „el jueves”, „в четверг”); klucze z `{dzien}` po słowie: „Gotowe {dzien} o {godzina}”, „{nazwa}: gotowe {dzien} o {godzina}”, „Start {dzien} o {godzina}”, „Plan musiałby się zacząć {dzienStartu} o {godzinaStartu}…” (`dowody/godziny-w-zdaniach.txt`).
- Powraca: nie → test zdań z datą odległą w pl, de, es, ru.
- Wzorzec lub źródło: zasada roli 5 („rodzaj i przypadek osobnymi kluczami albo select”).
- Kroki w aplikacji: Pro → plan na dzień za 3+ dni → „Dziś”/pas planu.
- Opcje: (a) osobne klucze dla słowa i dla daty („Gotowe {data}, {godzina}” z dwukropkiem lub przecinkiem, bez przyimka) — mało pracy, styl listowy; (b) klucz z wariantem `select` (słowo/data) i przyimkiem w słowniku — naturalniej, przekład 33 języków; Rekomendacja: (a), brzmienie PL do roli 04.
- Test akceptacyjny: zdanie z datą odległą bez mianownika po czasowniku w pl, de, es, ru, cs.
- Status: otwarte

### 09-lokalizacja-008 · Długości i objętości (cm, mm, ml, l) bez przeliczenia w trybie imperialnym
- Pozycja listy kontrolnej: LOK-07
- Poziom: P2
- Realność: realny (US) · Pewność: wysoka
- Rodzaj: P
- Dowód: teksty 1.0 z innymi jednostkami: „Posmaruj foremkę keksową (np. 30 cm)…”, „Rozpuść odmierzoną dawkę soli w 15–20 ml letniej wody”, nacięcie „ok. 6–13 mm”, „6–8 l gorącej wody” obok „22 lb 0,7 oz mąki” (`dowody/sonda-fahrenheit.txt`), „0,1 do 1,5 mm na godzinę” w zdaniu o oknie szczytu (`src/core/sourdough-physics.ts`). Przeliczanie w tekście obsługuje tylko °C, g i kg (`src/lib/unit-converter.ts:218` i `src/lib/unit-converter.ts:220`).
- Mechanizm: D-044 i design-spec §7 nazywają tylko °F, oz, lb; długość i objętość zostają metryczne; grep kluczy EN poza PÓŹNIEJ: 9 tekstów z cm, mm, ml, l.
- Powraca: nie → test kluczy z cm/mm/ml/l w trybie imperialnym.
- Wzorzec lub źródło: LOK-07 (rynek en-US z innym systemem miar), ZAL-037.
- Kroki w aplikacji: region US → receptury z foremką, solą w wodzie, nacinaniem.
- Opcje: (a) dopisać do przeliczenia in, fl oz/qt (z zaokrągleniem kuchennym) — spójnie dla US, nowe reguły zaokrągleń (rola 06); (b) zostawić metryczne z decyzją (rozmiar foremki po amerykańsku i tak jest w calach, ale ml soli to pomoc, nie ilość) — Rekomendacja: decyzja właściciela; dla 1.0 wystarczy (b) z wpisem, (a) po 1.0.
- Test akceptacyjny: decyzja w rejestrze; przy (a) test kluczy z cm/mm/ml/l w trybie imperialnym.
- Status: otwarte

### 09-lokalizacja-009 · Przetłumaczona nazwa wypieku zapisywana jako dane (Dziennik w starym języku po zmianie)
- Pozycja listy kontrolnej: LOK-09
- Poziom: P2
- Realność: brzegowy (wypieki bez receptury i plany bez receptury) · Pewność: wysoka
- Rodzaj: D
- Dowód: `src/hooks/useStartPlanu.ts:56` „recipeName: receptura ? receptura.recipeName : t('Klasyczny chleb rzemieślniczy'),”; `src/components/stolnica/ProwadzenieWypieku.tsx:65` „useState<string>(t('Wypiek bez receptury'))”. Wyświetlanie tłumaczy tylko nazwy receptur bazowych (`src/lib/nazwa-receptury.ts`), więc „Klassisches handwerkliches Brot” zostaje po niemiecku po przejściu na francuski. Zapis do wpisu Dziennika: `src/hooks/useFinishBake.ts:60`; nazwa domyślna zakwasu: `src/components/zakwas/ZakladanieStart.tsx:21`.
- Mechanizm: `grep -rnE "(recipeName|name)\s*:\s*t\(" src app` → 3 trafienia zapisu (plus `app/(tabs)/receptury/harmonogram.tsx:319`).
- Powraca: nie → test: wpis Dziennika po zmianie języka pokazuje nazwę w bieżącym języku.
- Wzorzec lub źródło: zasada roli 8 (dane jako kody).
- Kroki w aplikacji: wypiek bez receptury w języku A → zmiana języka na B → Dziennik.
- Opcje: zapis tekstu źródłowego PL (klucza) i `t()` przy wyświetlaniu (jak `nazwaReceptury`) — Rekomendacja; nazwa zakwasu to dane użytkownika do edycji, może zostać.
- Test akceptacyjny: test zapisu i odczytu wpisu w dwóch językach.
- Status: otwarte

### 09-lokalizacja-010 · „DDT:” na sztywno w podglądzie importu receptury
- Pozycja listy kontrolnej: LOK-03
- Poziom: P2
- Realność: realny · Pewność: wysoka
- Rodzaj: D
- Dowód: `src/components/ImportRecipeModal.tsx:182` „<Text style={styles.previewDdt}>DDT: {formatTemperature(” — słownik ma klucz „DDT” (de „Teigtemp.”, fr „Temp. pâte désirée”, ru „Темп. теста”), skrypt roli zgłasza błąd (`dowody/sprawdz-i18n-rola.txt`); bramka projektu nie (wyjątek skrótu).
- Mechanizm: pozostałe 12 tekstów na sztywno ze skryptu roli są w plikach funkcji PÓŹNIEJ (spiżarnia, przeliczniki, QR) i w etykiecie pliku „NOTICE” ekranu licencji — bez znaleziska w 1.0.
- Powraca: nie → bramka bez wyjątku dla „DDT”.
- Wzorzec lub źródło: LOK-03.
- Kroki w aplikacji: Ustawienia → Import receptury → poprawny plik → podgląd.
- Opcje: `t('DDT')` jak w kalkulatorze — Rekomendacja.
- Test akceptacyjny: podgląd importu w de pokazuje „Teigtemp.”.
- Status: otwarte

### 09-lokalizacja-011 · Bramka bez pseudolokalizacji, bez sierot w 33 słownikach i bez samosprawdzenia liczby mnogiej na Hermes
- Pozycja listy kontrolnej: LOK-15
- Poziom: P2
- Realność: teoretyczny dla użytkownika, realny dla utrzymania · Pewność: wysoka
- Rodzaj: D
- Dowód: `grep -rli pseudo scripts src app tests docs/lokalizacja` → 0 trafień; skrypt roli: 12 kluczy w każdym z 33 słowników bez wpisu w źródle (np. stare opisy mąk, „Gumowaty (Gorący nóż)”), bramka ich nie zgłasza (`dowody/sprawdz-i18n-rola.txt`); EN: 252 klucze bez miejsca w kodzie tylko jako uwaga (`dowody/check-i18n-uwagi.txt`); E2E iOS tylko pl_PL i en_US po id (`.github/workflows/e2e-ios.yml:116`–128), więc formy few/many/two/zero na Hermes nie mają kontroli poza Jest.
- Mechanizm: bramka sprawdza braki i parametry, nie nadmiar ani wygląd.
- Powraca: nie → kontrole w bramce i E2E.
- Wzorzec lub źródło: LOK-15, LOK-05 („Zielony Jest nie dowodzi działania na Hermes”).
- Kroki w aplikacji: nie dotyczy (utrzymanie).
- Opcje: (a) słownik pseudo w buildzie deweloperskim + sieroty jako błąd w `check:i18n` + jeden scenariusz Maestro w języku z few/many (np. ru albo pl z „5 minut”) — Rekomendacja; (b) tylko sieroty w bramce — tanio, bez kontroli Hermes.
- Test akceptacyjny: `check:i18n` kończy się błędem przy kluczu tylko w słowniku języka; scenariusz E2E w ru przechodzi na symulatorze.
- Status: otwarte

### 09-lokalizacja-012 · Drugi przegląd AI tylko próbką 12/33 języków, rejestr przeglądów nieaktualny od 2026-10-21
- Pozycja listy kontrolnej: LOK-11
- Poziom: P2
- Realność: brzegowy · Pewność: wysoka
- Rodzaj: P
- Dowód: tabela przeglądów ma stan na 2026-10-21; wiersz EN: drugi przegląd AI „nie wykonany”, treści krytyczne „bez tłumaczenia zwrotnego i bez przeglądu człowieka” (`docs/lokalizacja/jezyki.md:120`), choć przeglądy właściciela zdań krytycznych obejmują PL i EN przez skrót (`docs/tresci/przeglad/bezpieczenstwo-wypieku.md`, `docs/tresci/przeglad/maszyna-06m-2026-11-04.md`); wiersz 33 języków (`docs/lokalizacja/jezyki.md:121`): „pełnego drugiego przeglądu AI wszystkich kluczy nie było”; partie 09d, p8, 09m, źródła: „Pozostałe 21 języków: tylko skrypt”. Nagłówek tabeli: `docs/lokalizacja/jezyki.md:113`.
- Mechanizm: moduł `tlumaczenie` wymaga drugiego przeglądu AI dla treści niekrytycznej bez decyzji o progu; decyzje partii wybrały próbkę „DEC-06 wymaga próbki” bez wpisu progu w rejestrze języków.
- Powraca: nie → próg w rejestrze języków i kolumna „drugi przegląd” aktualizowana przez każdą partię.
- Wzorzec lub źródło: zasada roli 2; moduł `tlumaczenie` („Progi: z decyzji w rejestrze języków”).
- Kroki w aplikacji: nie dotyczy (proces); próbka jakości w tej sesji (24 klucze × de, fr, es, it, pt-BR, ru) bez zmian sensu (`dowody/probka-jakosci.txt`).
- Opcje: (a) właściciel zapisuje próg (np. drugi przegląd AI wszystkich kluczy głównego przepływu w każdym języku przed wydaniem, reszta próbką) i przegląd 21 języków w Batches; (b) próg = próbka 12/33 z uzasadnieniem kosztu; Rekomendacja: (a) dla głównego przepływu (ok. 300 kluczy), koszt [DO USTALENIA] w Batches.
- Test akceptacyjny: rejestr ma próg i aktualną tabelę przeglądów; wiersz EN zgodny z rejestrem twierdzeń.
- Status: otwarte

## Do sprawdzenia (pewność ≤ 80%)

- Zegar 12/24 h z ustawienia telefonu: `formatTime` bierze cykl z języka (`Intl`), nie z `getCalendars().uses24hourClock`; czy Hermes na iOS uwzględnia przełącznik „24-godzinny” — brak: zrzut na telefonie z regionem US i włączonym 24 h (krok właściciela).
- Zegar 12 h w es-419 i el na Hermes iOS (CLDR w Node: 12 h) — wpływa na zakres 004; zrzut w es-MX i el.
- Mieszane separatory przy języku innym niż region (np. en-PL): parametry `t()` formatuje `src/lib/i18n.ts:140` językiem aplikacji („2.5”), a `formatNumber` regionem urządzenia przez `appLocale()` („2,5”); brak zrzutu ekranu z obiema liczbami.
- Ukraiński „о {godzina}” przed 11:xx (forma „об 11:00”) — pytanie do osoby znającej ukraiński.
- `pH < 4.5` z kropką w polskim źródle i pt-BR (funkcja PÓŹNIEJ, atlas mąk) — rola 06.
- Przegląd rodzimych użytkowników: lv „pamatfermentācija” (otwarte w rejestrze), nazwy aplikacji sl, ms, el, ru (D-053) — krok właściciela.
- Powiadomienia zaplanowane przed zmianą języka systemu przy zamkniętej aplikacji przychodzą w starym języku do pierwszego otwarcia (`resyncNotifications` na starcie i powrocie); iOS zwykle zamyka aplikacje przy zmianie języka — brzegowe, bez zrzutu.

## Co działa dobrze i należy zachować

- Jedno źródło języków i test zgodności rejestru z `app.json`, słownikami i przełącznikiem (`src/lib/__tests__/jezyki-rejestr.test.tsx`); nazwa pod ikoną = nazwa w aplikacji.
- `intl-polyfills.ts` jako pierwszy import z danymi 35 języków i `pt` → pt-PT; `tPlural` z formami `#kategoria` i testy wektorów CLDR (ru 21, sl 2, lv 10, ro 20).
- `t()` nigdy nie zwraca klucza ani pustego tekstu; kontekst `tekst|kontekst` z opisem w `pl.kontekst.json` pilnowanym przez bramkę.
- Sonda pseudolokalizacji 11 ekranów: wszystkie teksty i etykiety VoiceOver przez `t()` (`dowody/sonda-pseudo-wynik.txt`).
- Daty, dni tygodnia i miesiące z `Intl` (bez par kluczy „Pon.”/„sty”), pierwszy dzień tygodnia z telefonu, strefa czasowa w kluczu formattera, macierz TZ w CI.
- Jednostki według regionu (D-044) z przeliczeniem także w tekstach `t()`, z rozpoznaniem różnic temperatur i mas z tekstu źródłowego.
- Powiadomienia: tekst przy planowaniu z odciskiem języka, ponowny plan od razu po zmianie języka.
- Krój tytułów wyłączony tam, gdzie brakuje glifów lub form (vi, CJK, uk/ru/sr), z testami cmap i GSUB; sr-Latn przez transliterację (D-086).
- Rozstrzygnięcia tłumaczenia zwrotnego partii 093 zapisane z powodem; nazwy źródeł bez przekładu (D-127).

## Decyzje dla właściciela

1. **001, kontrola (a) dla 9 kluczy krytycznych × 21 języków:** (a) tłumaczenie zwrotne w Batches przed wysyłką (ok. 200 segmentów, rzędu 1–2 USD, wydatek za zgodą) — rekomendacja; (b) tymczasowo te zdania po angielsku w 21 językach. Kompromis: (a) koszt i 1 przebieg; (b) mieszanie języków w ostrzeżeniach.
2. **005, 15 kluczy po angielsku:** (a) przekład przed 1.0 (razem z 001 w jednym przebiegu) — rekomendacja; (b) wydanie z angielskim tekstem i wpisem.
3. **004, rodzajnik przy godzinie:** (a) mechanizm `tPlural` z godziną (kod + ok. 150 form w 6 językach) — rekomendacja; (b) przeformułowanie bez rodzajnika (tylko słowniki, styl gorszy).
4. **008, jednostki długości i objętości w trybie imperialnym:** (a) przeliczać in/fl oz po 1.0 z regułą zaokrągleń roli 06; (b) zostawić metryczne z zapisaną decyzją — rekomendacja dla 1.0.
5. **012, próg drugiego przeglądu AI:** zapisać w rejestrze języków (rekomendacja: główny przepływ we wszystkich językach przed wydaniem).
6. Kroki właściciela (nie sprawdzono tutaj): zrzuty FR i pseudo przy 320 pt i AX5 na symulatorze lub telefonie; liczba mnoga i godziny na Hermes w ru/pl/es-419; VoiceOver w jednym obcym języku; ekran awaryjny po poprawce 002 w de.

## Proponowane polecenie naprawy

`node tools/assemble.mjs 09-lokalizacja --tryb fix --zadania 09-lokalizacja-001,09-lokalizacja-002,09-lokalizacja-003,09-lokalizacja-004,09-lokalizacja-005,09-lokalizacja-006,09-lokalizacja-007,09-lokalizacja-009,09-lokalizacja-010,09-lokalizacja-011`

Kolejność: 002, 003 i 009 (kod, rola 08 z testem najpierw czerwonym), 001 + 005 (jeden przebieg przekładu), 004 i 006–007 (mechanizm godziny i daty; brzmienie PL do roli 04), 010–011; 008 i 012 po decyzji właściciela. Zmiany układu — rola 04, liczby i terminy — rola 06.

`git status --porcelain` (repozytorium `/home/user/piekarz`, koniec pracy): pusty.

# Rejestr języków Piekarza

Decyzja: DEC-06 planu napraw M1 = (b) „Polski i angielski w 1.0 po naprawie lokalizacji głównego przepływu i przeglądzie EN”, rozszerzona przez właściciela 2026-10-19: „PL + EN pełne w 1.0 ORAZ wszystkie języki jak w aplikacji Trening (razem 35)”. Zabezpieczenia z decyzji: treści bezpieczeństwa zakwasu według DEC-10 (a) i tłumaczenie zwrotne tekstów krytycznych; przegląd natywny później; w językach bez sprawdzonej mapy mąk opis ogólny (białko %, zboże). Wymaganie: NFR-JEZ-001 w nowym BRD (gałąź `claude/03-zakres-2026-10-19-7a0b8a`, `docs/brd/wymagania.md:113`).

Źródło: `pl` (klucz słownika = tekst polski). Utrzymanie: nowy tekst = klucz + kontekst (`docs/lokalizacja/pl.kontekst.json`, `npm run i18n:kontekst`) + wpis w każdym języku w wydaniu albo wyjątek z datą. *Dlaczego:* każdy język mnoży pracę przy zmianie tekstu, więc rejestr mówi wprost, które języki trzeba zaktualizować.

Kontekst klucza: plik kontekstu ma dla każdego klucza EN miejsca użycia bez numerów linii (`plik (prop)`, `tekst w JSX`, `Alert.alert`, `dane: pole` dla tekstów tłumaczonych dynamicznie), generowane z kodu, oraz ręczny `opis` tam, gdzie miejsce nie wystarcza. Ten sam tekst w dwóch znaczeniach to dwa klucze: `tekst|kontekst` (np. `Zakwas` = zakładka, `Zakwas|składnik` = składnik receptury); `t()` pokazuje tekst przed `|`. `npm run check:i18n` zgłasza błąd, gdy wpisu brakuje, miejsca są nieaktualne albo klucz z `|` i jego tekst bazowy nie mają opisu. Sprawdzenie nie zapisuje pliku samo. *Dlaczego:* „Zakwas” jako zakładka i jako składnik to w angielskim różne słowa („Sourdough”, „Starter”), a tłumacz bez kontekstu wybiera jedno dla obu.

Jedno źródło w kodzie: `src/lib/i18n-locales.ts` (`SUPPORTED_LOCALES_35`, pole `status`). Zgodność rejestru z `ACTIVE_LANGS`, słownikami, `languages/*.json`, `app.json` (`locales`, `supportedLocales`, `supportsRTL: false`) i przełącznikiem w Ustawieniach sprawdza `src/lib/__tests__/jezyki-rejestr.test.ts` (`npm test`).

## Lista 35 języków

Lista i kolejność jak w Treningu: repo `trening`, `lib/i18n.ts:17` (`LANGS`) i katalog `locales/` (35 plików `<kod>.json`), commit 8273448, odczyt 2026-10-20. Żaden język nie jest pisany od prawej.

| Kod | Nazwa | Stan | Powód (dowód) | Przekład | Przeglądy |
|---|---|---|---|---|---|
| `pl` | Polski | w wydaniu 1.0 | język źródłowy; DEC-06 (b) | źródło | patrz „Przeglądy języków w wydaniu” |
| `en` | English | w wydaniu 1.0 | DEC-06 (b): drugi język 1.0 | maszynowe (AI), patrz niżej | patrz „Przeglądy języków w wydaniu” |
| `cs` | Čeština | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `sk` | Slovenčina | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `hu` | Magyar | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `ro` | Română | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `bg` | Български | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `hr` | Hrvatski | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `sl` | Slovenščina | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `sr` | Српски | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `lt` | Lietuvių | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `lv` | Latviešu | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `et` | Eesti | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `uk` | Українська | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `es` | Español (España) | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `es-419` | Español (Latinoamérica) | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `pt` | Português (Portugal) | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `pt-BR` | Português (Brasil) | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `de` | Deutsch | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 (pilot narzędzi poza repo) | brak |
| `fr` | Français | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `it` | Italiano | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `nl` | Nederlands | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `sv` | Svenska | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `da` | Dansk | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `nb` | Norsk | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `fi` | Suomi | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `tr` | Türkçe | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `el` | Ελληνικά | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `id` | Bahasa Indonesia | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `ms` | Bahasa Melayu | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `vi` | Tiếng Việt | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `ru` | Русский | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `ja` | 日本語 | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `ko` | 한국어 | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |
| `zh-Hant` | 繁體中文 | planowany | DEC-06 rozszerzenie (Trening) | zadanie 093, partia 6 | brak |

## Rozbieżność z poprzednim rejestrem (zapis 2026-10-20)

Poprzednia lista `SUPPORTED_LOCALES_35` (Tier 1–3, przed commitem tego wpisu) nie była listą Treningu: miała `zh` (uproszczony), `zh-TW`, `ar`, `he` (RTL), `th`, `hi`, `no`; nie miała `es-419`, `pt-BR`, `ru`, `sl`, `sr`, `nb`, `zh-Hant`. Pola `tier` i `pluralRule` (ręczne rodziny liczby mnogiej) nie miały źródła; liczba mnoga idzie z `Intl.PluralRules`. Rejestr przyjmuje listę Treningu dosłownie według słów DEC-06. Tę samą starą listę ma `docs/i18n-glossary-35.md` (glosariusz do poprawy, nowe znalezisko w raporcie roli 09 z 2026-10-20).

Słowniki Tier 1 (`src/lib/i18n.tier1.ts`: DE, FR, IT, ES, JA, po 18 kluczy, nieużywane w interfejsie) usunięte: żaden z tych języków nie jest w wydaniu, a przekład 093 tworzy pełne słowniki od nowa.

## Warunki włączenia języka planowanego (przekład 093 i kolejne)

Język przechodzi do „w wydaniu 1.0” dopiero, gdy wszystkie punkty są spełnione; test rejestru wymusza punkty 1–3.
1. Słownik w `DICTIONARIES` i kod w `ACTIVE_LANGS` (`src/lib/i18n.ts`), `status: 'released'` w `src/lib/i18n-locales.ts`, wiersz tutaj.
2. `languages/<kod>.json` (`CFBundleDisplayName`) i kod w `app.json`: `locales` oraz `supportedLocales` (iOS i Android).
3. Przełącznik w Ustawieniach (`PreferencesSection.tsx`) oferuje język; przy 35 językach lista zamiast dwóch przycisków (projekt: rola 04).
4. Dane liczby mnogiej: `@formatjs/intl-pluralrules/locale-data/<kod>.js` w `src/lib/intl-polyfills.ts`.
5. Wybór języka z systemu: warianty regionalne i aliasy jak w Treningu (`es-419` dla regionów Ameryki Łacińskiej, `zh-Hant` dla TW/HK/MO, `in` → `id`, `zsm` → `ms`; `trening/lib/i18n.ts`, `ES_419_REGIONS`, `ZH_HANT_REGIONS`, `LANG_ALIAS`); dziś `resolveLanguage` bierze tylko pełny tag i kod języka.
6. Treści krytyczne zakwasu według DEC-10 (a) z tłumaczeniem zwrotnym na polski w świeżej sesji i porównaniem sensu; typy mąk bez sprawdzonej mapy: opis ogólny (DEC-06).
7. Wpis w „Przeglądach języków w wydaniu”: pochodzenie przekładu, drugi przegląd AI w świeżym kontekście, przegląd człowieka (DEC-06: później, przed nim tylko kontrola treści krytycznych z punktu 6).

## Przeglądy języków w wydaniu

Stan na 2026-10-20 (commit bazowy 3c810e7). Każdy język w wydaniu ma tu wiersz; wydanie 1.0 wymaga przeglądu EN (słowa DEC-06 b). Przegląd modelu to nie przegląd rodzimego użytkownika języka.

| Język | Pochodzenie przekładu | Drugi przegląd AI (świeży kontekst) | Przegląd człowieka | Treści krytyczne | Zrzuty |
|---|---|---|---|---|---|
| `pl` | tekst źródłowy (klucze słownika); treści merytoryczne w rejestrze roli 06 (`docs/tresci/rejestr.json`) | nie dotyczy (źródło) | [DO USTALENIA] kto i kiedy przeczytał teksty interfejsu jako rodzimy użytkownik | treści zakwasu według DEC-10 (a), rola 06 | brak katalogu `docs/lokalizacja/zrzuty/pl/` |
| `en` | maszynowe (AI): `src/lib/i18n-en/czesc-*.ts`, 1387 kluczy, 72 commity od 255d1db (2026-10-15) do 0477bbc; 31 z nich ma trailer `Co-Authored-By: Claude Opus 5.5`, 41 bez oznaczenia narzędzia ([DO USTALENIA] czym powstały). Zmiana 2026-10-20: `Zakwas\|składnik` → „Starter” (M1-audytor-generalny-074) | nie wykonany. Próbka audytu M1 (ok. 40 kluczy, 2026-10-19) była przeglądem własnym, nie niezależnym. Do wykonania etapem oceny w potoku Batches (zadanie 093) albo osobną sesją | brak; krok właściciela: wskazać osobę i zakres (główny przepływ, treści krytyczne) | bez tłumaczenia zwrotnego i bez przeglądu człowieka: [DO USTALENIA] przed 1.0 według DEC-06 i DEC-10 (a) | brak katalogu `docs/lokalizacja/zrzuty/en/` |
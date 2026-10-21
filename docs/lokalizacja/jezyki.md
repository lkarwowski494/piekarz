# Rejestr języków Piekarza

Decyzja: DEC-06 planu napraw M1 = (b) „Polski i angielski w 1.0 po naprawie lokalizacji głównego przepływu i przeglądzie EN”, rozszerzona przez właściciela 2026-10-19: „PL + EN pełne w 1.0 ORAZ wszystkie języki jak w aplikacji Trening (razem 35)”. Zabezpieczenia z decyzji: treści bezpieczeństwa zakwasu według DEC-10 (a) i tłumaczenie zwrotne tekstów krytycznych; przegląd natywny później; w językach bez sprawdzonej mapy mąk opis ogólny (białko %, zboże). Wymaganie: NFR-JEZ-001 w nowym BRD (gałąź `claude/03-zakres-2026-10-19-7a0b8a`, `docs/brd/wymagania.md:113`).

Źródło: `pl` (klucz słownika = tekst polski). Utrzymanie: nowy tekst = klucz + kontekst (`docs/lokalizacja/pl.kontekst.json`, `npm run i18n:kontekst`) + wpis w każdym języku w wydaniu albo wyjątek z datą. Brakujący wpis języka pokazuje tekst angielski (zastępczy), nigdy klucz ani pusty tekst; `npm run check:i18n` zgłasza go jako błąd, chyba że klucz należy do funkcji PÓŹNIEJ (`docs/lokalizacja/pozniej-poza-przekladem.json`). *Dlaczego:* każdy język mnoży pracę przy zmianie tekstu, więc rejestr mówi wprost, które języki trzeba zaktualizować.

Kontekst klucza: plik kontekstu ma dla każdego klucza EN miejsca użycia bez numerów linii (`plik (prop)`, `tekst w JSX`, `Alert.alert`, `dane: pole` dla tekstów tłumaczonych dynamicznie), generowane z kodu, oraz ręczny `opis` tam, gdzie miejsce nie wystarcza. Ten sam tekst w dwóch znaczeniach to dwa klucze: `tekst|kontekst` (np. `Zakwas` = zakładka, `Zakwas|składnik` = składnik receptury); `t()` pokazuje tekst przed `|`. `npm run check:i18n` zgłasza błąd, gdy wpisu brakuje, miejsca są nieaktualne albo klucz z `|` i jego tekst bazowy nie mają opisu. Sprawdzenie nie zapisuje pliku samo. *Dlaczego:* „Zakwas” jako zakładka i jako składnik to w angielskim różne słowa („Sourdough”, „Starter”), a tłumacz bez kontekstu wybiera jedno dla obu.

Jedno źródło w kodzie: `src/lib/i18n-locales.ts` (`SUPPORTED_LOCALES_35`, pole `status`). Zgodność rejestru z `ACTIVE_LANGS`, słownikami, `languages/*.json`, `app.json` (`locales`, `supportedLocales`, `supportsRTL: false`) i przełącznikiem w Ustawieniach sprawdza `src/lib/__tests__/jezyki-rejestr.test.tsx` (`npm test`).

## Lista 35 języków

Lista i kolejność jak w Treningu: repo `trening`, `lib/i18n.ts:17` (`LANGS`) i katalog `locales/` (35 plików `<kod>.json`), commit 8273448, odczyt 2026-10-20. Żaden język nie jest pisany od prawej. Stan na 2026-10-21 (przekład 093, partia 7): wszystkie 35 w wydaniu 1.0.

Kolumny dla 33 języków z przekładu: tłumaczenie = maszynowe, model, data, commit źródła; tłumaczenie zwrotne = wynik potoku M1 dla 40 tekstów krytycznych (zakwas, temperatura, gorący garnek, opis sklepu) w świeżych zapytaniach bez kontekstu, z oceną sensu, i rozstrzygnięcie rozbieżności (sekcja niżej); przegląd człowieka znającego język: później (DEC-06), przed nim tylko kontrola (a) polityki „szerokiej”.

| Kod | Nazwa | Stan | Powód (dowód) | Przekład | Tłumaczenie zwrotne | Przegląd człowieka |
|---|---|---|---|---|---|---|
| `pl` | Polski | w wydaniu 1.0 | język źródłowy; DEC-06 (b) | źródło | nie dotyczy | patrz „Przeglądy języków w wydaniu” |
| `en` | English | w wydaniu 1.0 | DEC-06 (b): drugi język 1.0 | maszynowe (AI), patrz niżej | brak (patrz niżej) | patrz „Przeglądy języków w wydaniu” |
| `cs` | Čeština | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237; liczba mnoga: 1 forma poprawiona | 40 tekstów: zgodne 38, drobne 2, rozbieżności 0 | brak (DEC-06: później) |
| `sk` | Slovenčina | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237; liczba mnoga: 1 forma poprawiona | 40 tekstów: zgodne 39, drobne 1, rozbieżności 0 | brak (DEC-06: później) |
| `hu` | Magyar | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237 | 40 tekstów: zgodne 38, drobne 2, rozbieżności 0 | brak (DEC-06: później) |
| `ro` | Română | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237; liczba mnoga: 9 form poprawionych | 40 tekstów: zgodne 30, drobne 8, rozbieżności 2 → 2 poprawki (garnek), tłumaczenie zwrotne poprawek bez rozbieżności | brak (DEC-06: później) |
| `bg` | Български | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237 | 40 tekstów: zgodne 33, drobne 7, rozbieżności 0 | brak (DEC-06: później) |
| `hr` | Hrvatski | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237 | 40 tekstów: zgodne 38, drobne 2, rozbieżności 0 | brak (DEC-06: później) |
| `sl` | Slovenščina | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237; liczba mnoga: 10 form poprawionych (liczba podwójna) | 40 tekstów: zgodne 39, drobne 1, rozbieżności 0 | brak (DEC-06: później) |
| `sr` | Српски | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237 | 40 tekstów: zgodne 39, drobne 1, rozbieżności 0 | brak (DEC-06: później) |
| `lt` | Lietuvių | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237; liczba mnoga: 1 forma poprawiona | 40 tekstów: zgodne 39, drobne 1, rozbieżności 0 | brak (DEC-06: później) |
| `lv` | Latviešu | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237 | 40 tekstów: zgodne 39, drobne 1, rozbieżności 0 | brak (DEC-06: później) |
| `et` | Eesti | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237 | 40 tekstów: zgodne 34, drobne 5, rozbieżności 1 → 1 poprawka (zakwas), tłumaczenie zwrotne poprawki bez rozbieżności | brak (DEC-06: później) |
| `uk` | Українська | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237 | 40 tekstów: zgodne 38, drobne 2, rozbieżności 0 | brak (DEC-06: później) |
| `es` | Español (España) | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237 | 40 tekstów: zgodne 36, drobne 4, rozbieżności 0 | brak (DEC-06: później) |
| `es-419` | Español (Latinoamérica) | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237 | 40 tekstów: zgodne 36, drobne 4, rozbieżności 0 | brak (DEC-06: później) |
| `pt` | Português (Portugal) | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237 | 40 tekstów: zgodne 35, drobne 5, rozbieżności 0 | brak (DEC-06: później) |
| `pt-BR` | Português (Brasil) | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237 | 40 tekstów: zgodne 36, drobne 3, rozbieżności 1 → 1 poprawka (zakwas), tłumaczenie zwrotne poprawki bez rozbieżności | brak (DEC-06: później) |
| `de` | Deutsch | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237 | 40 tekstów: zgodne 36, drobne 4, rozbieżności 0 | brak (DEC-06: później) |
| `fr` | Français | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237; 25 tekstów z dosłownym „ ” zamienione na spację niełamiącą | 40 tekstów: zgodne 26, drobne 13, rozbieżności 1 (tylko `sklep:opis`, rola 10) | brak (DEC-06: później) |
| `it` | Italiano | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237 | 40 tekstów: zgodne 31, drobne 9, rozbieżności 0 | brak (DEC-06: później) |
| `nl` | Nederlands | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237 | 40 tekstów: zgodne 35, drobne 5, rozbieżności 0 | brak (DEC-06: później) |
| `sv` | Svenska | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237 | 40 tekstów: zgodne 35, drobne 4, rozbieżności 1 (tylko `sklep:opis`, rola 10) | brak (DEC-06: później) |
| `da` | Dansk | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237 | 40 tekstów: zgodne 34, drobne 6, rozbieżności 0 | brak (DEC-06: później) |
| `nb` | Norsk | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237 | 40 tekstów: zgodne 31, drobne 7, rozbieżności 2 (jeden tekst, dwa klucze) → 1 poprawka (poolish), tłumaczenie zwrotne poprawki bez rozbieżności | brak (DEC-06: później) |
| `fi` | Suomi | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237 | 40 tekstów: zgodne 38, drobne 1, rozbieżności 1 (tylko `sklep:opis`, rola 10) | brak (DEC-06: później) |
| `tr` | Türkçe | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237 | 40 tekstów: zgodne 36, drobne 1, rozbieżności 3 → 3 poprawki (garnek), tłumaczenie zwrotne poprawek bez rozbieżności | brak (DEC-06: później) |
| `el` | Ελληνικά | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237 | 40 tekstów: zgodne 27, drobne 11, rozbieżności 2 (jeden tekst, dwa klucze) → 1 poprawka (poolish), tłumaczenie zwrotne poprawki bez rozbieżności | brak (DEC-06: później) |
| `id` | Bahasa Indonesia | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237 | 40 tekstów: zgodne 34, drobne 6, rozbieżności 0 | brak (DEC-06: później) |
| `ms` | Bahasa Melayu | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237 | 40 tekstów: zgodne 36, drobne 3, rozbieżności 1 → 1 poprawka (zakwas), tłumaczenie zwrotne poprawki bez rozbieżności | brak (DEC-06: później) |
| `vi` | Tiếng Việt | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237 | 40 tekstów: zgodne 34, drobne 3, rozbieżności 3 (temperatura: jeden tekst, dwa klucze; `sklep:opis`) → 1 poprawka, tłumaczenie zwrotne poprawki bez rozbieżności | brak (DEC-06: później) |
| `ru` | Русский | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237; liczba mnoga: 1 forma poprawiona | 40 tekstów: zgodne 38, drobne 2, rozbieżności 0 | brak (DEC-06: później) |
| `ja` | 日本語 | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237 | 40 tekstów: zgodne 33, drobne 6, rozbieżności 1 (tylko `sklep:opis`, rola 10) | brak (DEC-06: później) |
| `ko` | 한국어 | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237 | 40 tekstów: zgodne 36, drobne 4, rozbieżności 0 | brak (DEC-06: później) |
| `zh-Hant` | 繁體中文 | w wydaniu 1.0 | DEC-06 rozszerzenie (Trening); kontrole partii 7 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237 | 40 tekstów: zgodne 33, drobne 6, rozbieżności 1 → 1 poprawka (zakwas), tłumaczenie zwrotne poprawki bez rozbieżności | brak (DEC-06: później) |

## Przekład 093: jak wpięty (partia 7, 2026-10-21)

- Wejście: przekład M1 przez Claude API (Message Batches, model claude-opus-5-5, 2026-10-20, źródło commit 1978237; 33 języki, 1658/1658 segmentów poprawnych w walidacji M1). Narzędzie i surowe wyniki są poza repo (repo jest publiczne).
- Wpięcie: `node scripts/wepnij-przeklad.mjs <katalog przeklad/languages>` tworzy `src/lib/i18n-slowniki/<kod>/czesc-N.ts` (< 20 480 B na plik) i `languages/<kod>.json`. Słowniki ładuje `src/lib/i18n.ts` leniwie (moduł języka wykonuje się dopiero przy pierwszym użyciu). Zmiana tekstu w języku = poprawka w `docs/lokalizacja/poprawki-przekladu.json` (z tekstem sprzed poprawki i powodem) i ponowne uruchomienie; plików słowników nie edytuje się ręcznie. *Dlaczego:* następny przebieg przekładu nadpisałby ręczną zmianę bez śladu.
- Zakres: tylko funkcje 1.0. Teksty funkcji z ukrytym wejściem (F-30, F-08, F-50, F-45, lekcje F-44, F-46…F-49, F-52) są poza przekładem 1.0 (stan „PÓŹNIEJ”, 421 kluczy, lista: `docs/lokalizacja/pozniej-poza-przekladem.json`); po odsłonięciu funkcji pokażą tekst angielski, dopóki nie przejdą przekładu. 12 kluczy 1.0, których nie było w wejściu przekładu (szablony Doktora Chleba i czasy dojrzewania zaczynu, wyświetlane wcześniej bez `t()`), czeka na mały przebieg M1: `docs/lokalizacja/czeka-na-przeklad.json` (klucz, data, powód); do tego czasu tekst EN.
- Bramka: `npm run check:i18n` sprawdza też słowniki 33 języków (każdy klucz EN poza listami wyżej, parametry, pusty tekst, formy CLDR liczby mnogiej); dozwolone braki wypisuje jako uwagę. *Dlaczego:* bez bramki nowy tekst w kodzie po cichu pokazywałby angielski w 33 językach.
- Pola domeny (`*Pl` w danych): klucz = tekst PL, tłumaczenie przy wyświetlaniu; zapisane wartości danych użytkownika i dopasowania po nazwie się nie zmieniają. 17 pól domeny bez wpisu w słowniku EN dostało klucz w słownikach języków.
- Nazwa aplikacji (D-053): `t('Piekarz')` i `CFBundleDisplayName` = słowo sprzed dwukropka nazwy w sklepie (`docs/app-store-metadata-v2.md` §5); w ok. 10 tekstach na język przekład miał „Crust” jako nazwę aplikacji i dostał nazwę lokalną. Języki bez lokalizacji App Store (D-054: bg, et, lt, lv, sr): przekład dał „Crust”, który D-053 zastąpiła; decyzja partii 7 (rekomendacja przyjęta z góry przez właściciela): słowo „piekarz” w języku — bg „Пекар”, et „Pagar”, lt „Kepėjas”, lv „Maiznieks”, sr „Пекар”. Odrzucone: „Crust” (sprzeczne z D-053). Nazwa nie odmienia się w zdaniu (jak marka); do przeglądu natywnego.
- Liczba mnoga: słownik języka trzyma formy jego kategorii CLDR pod kluczem `<forma one PL>#<kategoria>`. Generator bierze dla każdej kategorii liczbę wzorcową (1, 2, 3, 5, 10, 20, 21, 0, 1.5, 1000000 — pierwsza z tej kategorii), jej kategorię w polskim i przekład tej formy PL. Formy, których polski nie ma, poprawione ręcznie (`poprawki-przekladu.json`, rodzaj `liczba-mnoga`): liczba podwójna sl (2 uri, 2 dneva), ro 20+ z „de” (20 de ore), „{n} dni” dla 2–4 w cs, sk, lt, ru, sl (PL ma jeden klucz dla 2–4 i 5+). `pt` liczy z regułami pt-PT. Polyfill ma dane wszystkich 35 języków (`src/lib/intl-polyfills.ts`).

## Rozstrzygnięcie rozbieżności tłumaczenia zwrotnego (KROK 0, 2026-10-21)

M1 zgłosił 22 rozbieżności w 13 językach; sekcji „rozbieznosc” w raportach jest 20 (garnek 9, zakwas 4, sklep:opis 5, temperatura 2), w tym 4 pary tego samego tekstu pod kluczem słownika i pola domeny. Zasada: teksty zakwasu i garnka według DEC-10 (a), bez złagodzeń; przy wątpliwości poprawka na sformułowanie jednoznaczne. Tłumaczenie zwrotne poprawek: ślepe, w świeżym kontekście, 12/12 bez rozbieżności sensu.

| Język | Tekst (PL) | Rodzaj | Rozstrzygnięcie | Uzasadnienie |
|---|---|---|---|---|
| tr | Zdejmij ostrożnie pokrywkę, pozwól parze ulecieć… 210°C… | garnek | poprawka: „kaldırın” → „çıkarın” | kaldırmak = unieść (wieczko może wrócić); çıkarmak = zdjąć, jak w innych tekstach tr („Kapağı çıkarın”) |
| tr | Zdejmij pokrywkę garnka. Wypuść parę. | garnek | poprawka: „kapağını çıkarın” | jak wyżej |
| tr | Zdejmij pokrywkę! | garnek | poprawka: „Kapağı çıkarın!” | jak wyżej |
| ro | Zdejmij ostrożnie pokrywkę… 210°C… | garnek | poprawka: „Ridică” → „Scoate” | a ridica = unieść; a scoate = zdjąć, jak w innych tekstach ro („Scoate capacul”) |
| ro | Zdejmij pokrywkę garnka. Wypuść parę. | garnek | poprawka: „Scoate capacul tuciului” | jak wyżej; „tuci” zostaje (spójność z innymi tekstami ro) |
| el | Zaczyn Poolish (20% mąki i 100% hydratacji)… (słownik i pole domeny) | garnek | poprawka: „100% ενυδάτωση της προζύμωσης” | „ενυδάτωση ζύμης” = hydratacja ciasta; 100% dotyczy zaczynu |
| nb | jak wyżej (słownik i pole domeny) | garnek | poprawka: „100 % hydrering av fordeigen” | „deighydrering” = hydratacja ciasta |
| et | Przykryj naczynie luźno, co utrudnia rozwój pleśni… | zakwas | poprawka: „takistab” → „raskendab” | takistama bywa czytane jako „zapobiegać”; raskendama = utrudniać; bez przesady skuteczności przykrycia |
| ms | Biały nalot lub kożuch na powierzchni | zakwas | poprawka: bez „nipis” | „cienki” zawęża objaw |
| pt-BR | Biały nalot lub kożuch na powierzchni | zakwas | poprawka: „Camada branca ou película na superfície” | „crosta” = twarda skorupa |
| zh-Hant | Biały nalot lub kożuch na powierzchni | zakwas | poprawka: „表面出現白色覆層或皮膜” | 硬皮 = twarda skórka |
| vi | Uwaga: Obliczona temperatura wody przekracza 45°C… Schłodź mąkę… (słownik i pole domeny) | temperatura | poprawka: „bột” → „bột mì” | „bột” = mąka albo ciasto; „bột mì” = mąka |
| fi, fr, ja, sv, vi | `sklep:opis` | sklep | bez zmian w aplikacji; opis dla roli 10 (zadanie 095) |

### Kontrola zwrotna kluczy partii 8–9 (2026-10-21, M1-audytor-generalny-185)

Źródło: raport kontroli zwrotnej M1 z 2026-10-21 (9 rozbieżności w 1630 pozycjach; 4 rozbieżności „nawet 12 godzin” es, pt-BR, tr, zh-Hant i et „Pagar Pro” poza tym zadaniem).

| Język | Tekst (PL) | Rozstrzygnięcie | Stan |
|---|---|---|---|
| ja | Wydłuż autolizę i dodaj dodatkową serię składań coil fold. | ponowny przekład: przekład podaje „ストレッチ＆フォールド” (stretch and fold, inna technika); w tym samym słowniku coil fold to „コイルフォールド” (2 klucze) | przełożone ponownie w batchu p12-noc (2026-10-22): „オートリーズを長くし、コイルフォールドを1セット追加してください。”; tłumaczenie zwrotne „coil fold”, ocena: drobna różnica („jedną serię” zamiast „dodatkowej serii”) |
| zh-Hant | Zamknij informację o końcu próby | ponowny przekład: „關閉試用期結束通知” brzmi jak wyłączenie powiadomienia; etykieta zamyka baner (np. „關閉試用期結束提示”) | przełożone ponownie w batchu p12-noc (2026-10-22): „關閉試用期結束提示”; tłumaczenie zwrotne zgodne |
| lv | Wydłuż fermentację burzliwą. / Skróć fermentację burzliwą… | słownik lv nazywa fermentację burzliwą (bulk) jednym terminem „pamatfermentācija” w 4 kluczach, także w nazwie kroku „Fermentacja burzliwa ze składaniami” („Pamatfermentācija ar locīšanu”); tłumaczenie zwrotne oddało go jako „fermentacja wstępna” | [DO USTALENIA] znaczenie terminu bez przeczytanego źródła (wyszukiwanie 2026-10-21 bez wyniku); bez zmiany do przeglądu rodzimego użytkownika (DEC-06) | klucze `sklep:*` nie są wpinane do aplikacji; zgłoszone: nazwa „Crust” zamiast lokalnej (D-053), fi/fr procent piekarski (mąka i woda z zakwasu i zaczynu), ja bez „dożywotni”, vi masa ciasta zamiast masy mąki |

## Rozbieżność z poprzednim rejestrem (zapis 2026-10-20)

Poprzednia lista `SUPPORTED_LOCALES_35` (Tier 1–3, przed commitem tego wpisu) nie była listą Treningu: miała `zh` (uproszczony), `zh-TW`, `ar`, `he` (RTL), `th`, `hi`, `no`; nie miała `es-419`, `pt-BR`, `ru`, `sl`, `sr`, `nb`, `zh-Hant`. Pola `tier` i `pluralRule` (ręczne rodziny liczby mnogiej) nie miały źródła; liczba mnoga idzie z `Intl.PluralRules`. Rejestr przyjmuje listę Treningu dosłownie według słów DEC-06.

Słowniki Tier 1 (`src/lib/i18n.tier1.ts`: DE, FR, IT, ES, JA, po 18 kluczy, nieużywane w interfejsie) usunięte; przekład 093 utworzył pełne słowniki od nowa.

## Warunki języka w wydaniu (stan 2026-10-21: spełnione dla 35)

Test rejestru wymusza punkty 1–3, `src/lib/__tests__/i18n-35-jezykow.test.ts` punkty 4–5, `npm run check:i18n` punkt 6.
1. Słownik (`src/lib/i18n-slowniki/<kod>`, ładowanie w `src/lib/i18n-slowniki/index.ts`) i kod w `ACTIVE_LANGS` (`src/lib/i18n.ts`), `status: 'released'` w `src/lib/i18n-locales.ts`, wiersz tutaj.
2. `languages/<kod>.json` (`CFBundleDisplayName`, D-053) i kod w `app.json`: `locales` oraz `supportedLocales` (iOS i Android).
3. Przełącznik w Ustawieniach (`PreferencesSection.tsx`): siatka 35 przycisków z nazwą języka w nim samym i `accessibilityLanguage`; docelowy wzór listy: rola 04 (znalezisko partii 7).
4. Dane liczby mnogiej: `@formatjs/intl-pluralrules/locale-data/<kod>.js` w `src/lib/intl-polyfills.ts` i formy `#<kategoria>` w słowniku.
5. Wybór języka z systemu: warianty regionalne i aliasy jak w Treningu (`es-419` dla regionów Ameryki Łacińskiej, `pt` bez regionu i `pt-BR` → pt-BR, inne regiony → `pt`, `zh-Hant` dla pisma Hant i TW/HK/MO, `in` → `id`, `zsm` → `ms`, `no` → `nb`; `resolveLanguage` w `src/lib/i18n.ts`).
6. Słownik języka ma każdy klucz EN poza funkcjami PÓŹNIEJ, te same parametry `{…}`, formy wszystkich kategorii CLDR, niepusty tekst.
7. Treści krytyczne zakwasu według DEC-10 (a) z tłumaczeniem zwrotnym na polski w świeżej sesji i porównaniem sensu (tabela wyżej); typy mąk bez sprawdzonej mapy: opis ogólny (094).
8. Przegląd człowieka znającego język: później (DEC-06); do tego czasu język jest „maszynowy, po kontroli (a)”.

## Przeglądy języków w wydaniu

Stan na 2026-10-21. Przegląd modelu to nie przegląd rodzimego użytkownika języka.

| Język | Pochodzenie przekładu | Drugi przegląd AI (świeży kontekst) | Przegląd człowieka | Treści krytyczne | Zrzuty |
|---|---|---|---|---|---|
| `pl` | tekst źródłowy (klucze słownika); treści merytoryczne w rejestrze roli 06 (`docs/tresci/rejestr.json`) | nie dotyczy (źródło) | [DO USTALENIA] kto i kiedy przeczytał teksty interfejsu jako rodzimy użytkownik | treści zakwasu według DEC-10 (a), rola 06 | brak katalogu `docs/lokalizacja/zrzuty/pl/` |
| `en` | maszynowe (AI): `src/lib/i18n-en/czesc-*.ts`, 72 commity od 255d1db (2026-10-15); 31 z trailerem `Co-Authored-By: Claude Opus 5.5`, 41 bez oznaczenia narzędzia ([DO USTALENIA] czym powstały). Zmiana 2026-10-20: `Zakwas\|składnik` → „Starter” (M1-audytor-generalny-074); 2026-10-21: 17 pól domeny bez wpisu EN (093) | nie wykonany | brak; krok właściciela: wskazać osobę i zakres | bez tłumaczenia zwrotnego i bez przeglądu człowieka: [DO USTALENIA] przed 1.0 według DEC-06 i DEC-10 (a) | brak katalogu `docs/lokalizacja/zrzuty/en/` |
| 33 języki z przekładu 093 | MT claude-opus-5-5 (Batches), 2026-10-20, źródło 1978237, poprawki partii 7 (`poprawki-przekladu.json`) | etap oceny potoku M1 (świeże zapytanie porównuje PL z tłumaczeniem zwrotnym 40 tekstów krytycznych); pełnego drugiego przeglądu AI wszystkich kluczy nie było | brak (DEC-06: później, najpierw języki z ruchem) | kontrola (a): tłumaczenie zwrotne, tabela wyżej | brak; zrzut najdłuższego języka: M2 w zadaniu 080 |

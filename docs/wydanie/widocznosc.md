# Widoczność w sklepie — Piekarz (iOS)

Przebieg M5 (widoczność w sklepie), 2026-10-20; wiedza z modułu roli 10 `widocznosc-w-sklepie` (biblioteka `prompts` 3de3daf). Decyzje: D-053 (nazwy), D-054 (lokalizacje strony i reguła prawdy), D-055 (kategoria, zrzuty, słowa kluczowe PL, hipotezy). Pola sklepu na lokalizację są w jedynym źródle: `docs/app-store-metadata-v2.md` §5 (nazwa, podtytuł, słowa kluczowe, pierwsze zdanie, liczniki); tu jest mapa, frazy, uzasadnienia, plan po wydaniu i pomiar. Raport z dowodami: katalog przebiegu poza repo (`audit/M5-2026-10-20/`).

Źródła Apple (odczyt 2026-10-20, developer.apple.com, kod 200): „App Store search”, „Creating your product page”, „Choosing a category”, „Custom product pages”, „Product page optimization”, „In-App Events”, App Store Connect Help „App Store localizations” i „App information”, App Review Guidelines. Najważniejsze zdania:
- wyszukiwanie: „text relevance (matches for your app’s title, subtitle, keywords, and primary category)” oraz zachowanie użytkowników (pobrania, oceny);
- nazwa: „Avoid names that use generic terms or are too similar to existing app names” (product page);
- nazwa pod ikoną: „ensure your metadata, including app name and icons […], are similar to avoid creating confusion” (App Review Guidelines) — dlatego nazwa pod ikoną w każdym języku idzie za nazwą w sklepie (D-053).

## 1. Mapa storefrontów

Tabela Apple „App Store localizations” z 2026-10-20: 175 storefrontów, każdy ma język domyślny i dodatkowe. Skrypt `storefronty.mjs` (moduł roli 10):

| Stan | Lokalizacje strony | Język domyślny | Tylko dodatkowy | Brak |
|---|---|---|---|---|
| przed (do 2026-10-20) | Polish, English (U.S.) | 1 (USA) | 2 | 172 |
| po (D-054) | 34 lokalizacje z tabeli niżej | 174 | 1 | 0 |

Jedyny storefront bez lokalizacji w języku domyślnym: Chiny kontynentalne (Simplified Chinese poza polityką języków). Języki aplikacji bez lokalizacji strony w App Store: bułgarski, estoński, litewski, łotewski, serbski — ich storefronty mają domyślny English (U.K.). W 12 krajach Europy (m.in. Polska, Czechy, Norwegia, Dania, Finlandia, Grecja, Turcja, Ukraina) język kraju jest tylko dodatkowy, a domyślny English (U.K.); jak Apple wybiera między nimi dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`. Czy słowa kluczowe języka dodatkowego liczą się w wyszukiwaniu storefrontu, Apple nie opisuje `[DO USTALENIA]` — sprawdza to H-03.

| Lokalizacja | Kod ASC | Storefronty: język domyślny | Storefronty: język dodatkowy | Status pomiaru |
|---|---|---|---|---|
| English (U.S.) | `en-US` | 1: USA | 1: JPN | częściowo |
| English (U.K.) | `en-GB` | 135: AFG ALB DZA AGO AIA ATG ARM AZE BHS BHR BRB BLR … | 37: ARG AUS AUT BOL BRA CMR CHL CHN COL CRI CIV DOM ECU SLV FRA GAB DEU GTM HND HKG ITA MAC MEX NLD NZL NIC PAN PRY PER PRT KOR RUS ESP SWE CHE TWN VEN | częściowo |
| English (Australia) | `en-AU` | 2: AUS NZL | 0:  | hipoteza |
| English (Canada) | `en-CA` | 1: CAN | 0:  | hipoteza |
| German | `de-DE` | 3: AUT DEU CHE | 1: LUX | częściowo |
| Dutch | `nl-NL` | 1: NLD | 2: BEL SUR | częściowo |
| French | `fr-FR` | 4: CMR CIV FRA GAB | 28: DZA BEL BEN BFA KHM TCD COD COG EGY GNB GUY LAO LBN LUX MDG MLI MRT MUS MAR NER RWA SEN SYC CHE TTO TUN USA VUT | częściowo |
| French (Canada) | `fr-CA` | 0:  | 1: CAN | hipoteza |
| Italian | `it` | 1: ITA | 1: CHE | częściowo |
| Spanish (Spain) | `es-ES` | 1: ESP | 0:  | częściowo |
| Spanish (Mexico) | `es-MX` | 16: ARG BOL CHL COL CRI DOM ECU SLV GTM HND MEX NIC … | 3: BLZ USA URY | częściowo |
| Portuguese (Brazil) | `pt-BR` | 1: BRA | 1: USA | częściowo |
| Portuguese (Portugal) | `pt-PT` | 1: PRT | 0:  | częściowo |
| Polish | `pl` | 0:  | 1: POL | zmierzone |
| Czech | `cs` | 0:  | 1: CZE | hipoteza |
| Slovak | `sk` | 0:  | 1: SVK | hipoteza |
| Hungarian | `hu` | 0:  | 1: HUN | hipoteza |
| Croatian | `hr` | 0:  | 4: BIH HRV MNE SRB | hipoteza |
| Slovenian | `sl` | 0:  | 1: SVN | hipoteza |
| Romanian | `ro` | 0:  | 1: ROU | hipoteza |
| Swedish | `sv` | 1: SWE | 0:  | częściowo |
| Norwegian | `no` | 0:  | 1: NOR | częściowo |
| Danish | `da` | 0:  | 1: DNK | częściowo |
| Finnish | `fi` | 0:  | 1: FIN | hipoteza |
| Russian | `ru` | 1: RUS | 2: UKR USA | częściowo |
| Ukrainian | `uk` | 0:  | 2: RUS UKR | częściowo |
| Greek | `el` | 0:  | 2: CYP GRC | hipoteza |
| Turkish | `tr` | 0:  | 2: CYP TUR | hipoteza |
| Japanese | `ja` | 1: JPN | 0:  | częściowo |
| Korean | `ko` | 1: KOR | 1: USA | częściowo |
| Chinese (Traditional) | `zh-Hant` | 3: HKG MAC TWN | 1: USA | częściowo |
| Indonesian | `id` | 0:  | 1: IDN | hipoteza |
| Malay | `ms` | 0:  | 1: MYS | hipoteza |
| Vietnamese | `vi` | 0:  | 2: USA VNM | hipoteza |

Pełne listy storefrontów (tabela wyżej skraca dwie najdłuższe) są w `docs/wydanie/storefronty.json`: tabela Apple z odczytu 2026-10-21 (175 storefrontów, ISO, kraj, język domyślny i dodatkowe) i mapa 34 lokalizacji; z niej `scripts/karty-ustawien.mjs` robi karty `docs/wydanie/ustawienia/<kod ASC>.md` [M1-audytor-generalny-119]. Odczyt 2026-10-21 dał tę samą tabelę co 2026-10-20.

Status pomiaru: „zmierzone” = frazy z wyników wyszukiwarki i podpowiedzi tego kraju; „częściowo” = podpowiedzi sklepu tego kraju bez pełnych liczb ocen konkurencji (wyszukiwarka iTunes zwracała 403 od ok. 20:20); „hipoteza” = brak lokalnego sygnału — sprawdzenie po wydaniu w App Analytics (odsłony i pobrania ze źródła App Store Search na storefront).

## 2. Frazy na język

Źródła: podpowiedzi wyszukiwarki App Store dla 37 krajów (MZSearchHints z nagłówkiem storefrontu, 2026-10-20, 143 zapytania), podpowiedzi z iPhone'a właściciela (storefront PL, 2026-10-20), wyniki iTunes Search API pobrane przez grupy językowe przed blokadą (liczby ocen `userRatingCount` pierwszej dziesiątki). Nazwy cudzych aplikacji są tylko danymi do oceny konkurencji, nie trafiają do pól.

| Lokalizacje | Frazy główne (sygnał) | Konkurencja | Wniosek |
|---|---|---|---|
| en-US, en-GB, en-AU, en-CA | sourdough + starter / timer / planner / tracker / hydration calc / schedule / proving timer; bread baking timer; baker's percentage (podpowiedzi we wszystkich 37 krajach) | US „sourdough”: mediana 9 ocen, maks. 731; „sourdough schedule” mediana 1; GB „baker's percentage” 0–2 (aplikacje trafne) | nisza słabo obsadzona; „bread” i „baker” same są zaszumione (gry, piekarnie, portfele) |
| de-DE | sauerteig + starter tracker / brot backen / anstellgut (DE, AT, CH) | „Sauerteig” w CH i AT: 0–4 ocen; „brot” podpowiada drukarki Brother | fraza główna „Sauerteigbrot backen” |
| nl-NL | zuurdesem + starter / brood / tracker | BE, NL: 0–4 ocen | fraza „zuurdesem” |
| fr-FR, fr-CA | levain, pain au levain, levain tracker | FR: mediana 0 ocen | „boulanger” = sieć elektroniki (odrzucone) |
| it | lievito madre + diario del pane; percentuale fornaio | nie zmierzono (403) | „pane” zaszumione |
| es-ES, es-MX | masa madre + tracker / calculadora / diario; porcentaje panadero | MX, AR, CO: niskie | „pan” zaszumione |
| pt-BR, pt-PT | fermentação natural (BR), levain, massa mãe (PT) | BR, PT: niskie | „pão” zaszumione |
| pl | „zakwas”, „chleb na zakwasie”, „pieczenie chleba”: 0 podpowiedzi; „sourdough …”: wiele podpowiedzi w PL | polskie frazy: suma ocen 0–2 | polska nazwa dla szukających po polsku, „sourdough” w słowach (D-055) |
| cs, sk, hu, hr, sl, ro, fi, uk, el, tr | lokalne słowo na zakwas bez podpowiedzi; „sourdough …” z podpowiedziami | nie zmierzono (403) | hipoteza; ruch po angielsku przez English (U.K.) |
| sv, no, da | surdeg / surdeig / surdej + bröd / brød | 0–8 ocen | fraza z lokalnym słowem |
| ru | закваска (2 podpowiedzi), хлебопечение, ржаной хлеб | 0–21 ocen | „тесто” zaszumione |
| ja, ko, zh-Hant | サワードウ, パン作り; 사워도우, 천연발효; 酸種 | nie zmierzono | lokalne słowo ma podpowiedzi |
| id, ms, vi | „sourdough” (EN) z podpowiedziami; roti / bánh mì zaszumione | nie zmierzono | hipoteza |

Kolizje marek (podpowiedzi dla samej marki, 2026-10-20): „Crust” w niszy zajęte (DE „Crusta - perfektes Brot backen”, „Crustfolk: Sauerteig Brot”, „Crustbase: Pizza & Teigrechner”; US, GB, NL pizzerie) — powód D-053. Lokalne słowa „piekarz”: wolne m.in. Bagaren, Bageren, Leipuri, Хлебопёк, Αρτοποιός, パン職人, 제빵사, 麵包師傅, Tukang Roti, Thợ Bánh Mì; zaszumione Baker, Bäcker, Bakker, Piekarz („mistrz piekarz”, „wirtualny piekarz”), Fornaio („il fornaio”), Padeiro; „Fournil” odrzucone (istnieje „mon fournil – pain maison”), w zamian „Mitron”.

## 3. Rozdział pól

| Pole | Reguła w tym projekcie |
|---|---|
| Nazwa (≤ 30) | „<lokalne słowo piekarz>: <fraza z zakwasem>”; ruch niesie fraza po dwukropku, marka jest swojska (D-053). Nazwa pod ikoną na język = słowo przed dwukropkiem. |
| Podtytuł (≤ 30) | plan + kalkulator + minutnik w języku lokalizacji; bez „4-DDT” (żargon bez podpowiedzi) |
| Słowa kluczowe (≤ 100 B) | pozostałe frazy pracy: starter, hydratacja, levain, poolish, biga, pizza, żyto, receptura, minutnik; bez słów z nazwy, podtytułu i kategorii; bez obietnic spoza zakresu (QR, druk, spiżarnia, przelicznik objętości, masa lodu, AI, zdjęcia) |
| Kategoria | Food & Drink główna (wszystkie aplikacje niszy w wynikach grup), Productivity dodatkowa bez zmian (D-055) |
| Zrzuty | kolejność z §5.2 metadanych: plan z ochroną snu, kalkulator, prowadzenie kroków (pierwsze trzy widać w wynikach wyszukiwania) |
| Opis | pierwsze zdanie = główna praca (§5 metadanych); pełny opis przez przekład M1 |
| Tekst promocyjny | nie wpływa na wyszukiwanie (Apple); nowości, nie słowa kluczowe |

## 4. Plan po wydaniu (każde działanie za osobną zgodą właściciela)

| Narzędzie | Warunek startu | Pierwsze użycie |
|---|---|---|
| Niestandardowe strony produktu (do 70) | ruch z kanałów roli 11 albo druga praca (pizza, zakwas od zera) z własnymi zrzutami | strona „pizza dough” i strona „sourdough starter” z przypisanymi słowami |
| Testy strony (do 3 wariantów, jeden test naraz, do 90 dni) | App Store Connect szacuje czas z wyświetleń; przy małym ruchu nie startować | najpierw kolejność zrzutów 1–3 |
| Wydarzenia w aplikacji | tylko prawdziwa, ograniczona w czasie treść (duża aktualizacja, sezon); bez codziennych zadań i promocji cen | brak w wersji 1.0 |

## 5. Hipotezy pomiaru (moduł `pomiar-prywatny` roli 11, najwyżej 3 aktywne)

Wersja 1.0 nie ma stanu „przed” w App Analytics (aplikacja niewydana), więc hipotezy mierzą wynik bezwzględny tej wersji. Progi i minimalne próby to propozycja M5 z wyborem właściciela w D-055; oczekiwane n to `[OCENA]` z wyniku normalnego bramki opłacalności. Dane z App Analytics zostają poza publicznym repo.

| H | Metryka (licznik ÷ mianownik) | Próg | Min. próba | Ocena | Zastępnik przy pustej komórce |
|---|---|---|---|---|---|
| H-01 | pobrania pierwszorazowe ÷ odsłony strony z App Store Search, USA i GBR | ≥ 25% | 100 | 2027-03-31 | pobrania z wyszukiwania w tygodniu, grupa porównawcza App Analytics |
| H-02 | odsłony z App Store Search w storefrontach z domyślną lokalizacją inną niż English (U.S.) ÷ wszystkie odsłony z App Store Search | ≥ 30% | 200 | 2027-03-31 | lista storefrontów z co najmniej jednym pobraniem z wyszukiwania |
| H-03 | odsłony z App Store Search w POL ÷ wszystkie odsłony strony w POL | ≥ 40% | 30 | 2027-03-31 | pobrania z wyszukiwania w POL w tygodniu |

Ocena: `hipotezy.mjs` (moduł roli 11) na pliku poza repo; werdykt dopiero po dacie oceny. Wynik zapisuje się przy wersji w `docs/wydanie/dziennik.md`.

## 6. Kroki właściciela

1. Strony w App Store Connect: dla każdej lokalizacji z §5 metadanych dodać lokalizację strony i wkleić pola pole po polu; lokalizacje inne niż angielskie dopiero z buildem, który ma ten język (D-054).
2. Nazwa pod ikoną, teksty z nazwą w aplikacji i nazwy produktów zakupu na język: zadanie dla M1 (partia 7) razem z przekładem; strona apps4brew.com/piekarz/ i karta studia: tytuł na język przeglądarki.
3. Kategoria bez zmian. Zrzuty według §5.2 metadanych (zadanie 080).
4. Po wydaniu: App Analytics → źródło „App Store Search” na storefront, odczyt do H-01…H-03 w dniu oceny.
5. Przed wysyłką: sprawdzenie nazw słoweńskich, malajskich, greckich i rosyjskich przez osobę mówiącą tym językiem (uwagi krytyka w raporcie M5).

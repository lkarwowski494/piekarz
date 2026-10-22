# Karta ustawień App Store: Slovak (`sk`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/sk.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **Slovak**, kod ASC `sk`; język aplikacji `sk` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → Slovak (jeśli go nie ma: „Not Localized” → Slovak → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **hipoteza** — brak lokalnego sygnału; sprawdzenie po wydaniu w App Analytics (docs/wydanie/widocznosc.md §1).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 0 — —
- Język dodatkowy: 1 — SVK (Slovakia)
- Dostępność: wszystkie storefronty tej karty (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

## Pola do skopiowania (pole po polu)

Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.

### Nazwa (Name) · 23 / 30 znaków · App Information

```text
Pekár: Chlieb na kvásku
```

### Podtytuł (Subtitle) · 25 / 30 znaków · App Information

```text
Plán pečenia a kalkulačka
```

### Słowa kluczowe (Keywords) · 94 / 100 bajtów (86 znaków) · wersja 1.0

```text
bochník,pizza,hydratácia,cesto,žitný,levain,poolish,časovač,recept,droždie,fermentácia
```

### Tekst promocyjny (Promotional Text) · 162 / 170 znaków · wersja 1.0

```text
Nastavte čas, kedy má byť chlieb hotový: Pekár vypočíta množstvá, zostaví spätný plán a upozorní vás na koniec každého kroku. Bez účtu, bez internetu, bez reklám.
```

### Opis (Description) · 3012 / 4000 znaków · wersja 1.0

```text
Pekár vás prevedie pečením kváskového chleba od receptúry až po bochník: vypočíta množstvá, zostaví plán a stráži čas, aj keď telefón spí. Funguje bez účtu a bez internetu, bez reklám a bez sledovania. Vaše receptúry, kvásky a denník zostávajú len vo vašom telefóne.

RECEPTÚRY A MNOŽSTVÁ
Vyberte si jednu z 15 základných receptúr (kváskové, ražné, droždiové, pizza a sladké) alebo vlastnú. Nastavte počet bochníkov alebo hmotnosť múky a Pekár uvedie gramy múky, vody, kvásku, soli a droždia. Pekárske percentá zahŕňajú múku a vodu z kvásku aj z predkvasu. Pekár vám tiež povie teplotu vody pre teplotu cesta, ktorú chcete dosiahnuť.

PLÁN OD ČASU „HOTOVO“
Vyberte, kedy má byť chlieb hotový, a Pekár spätne vypočíta čas začiatku každého kroku. Čas kvasenia závisí od teploty v kuchyni. Keď krok, ktorý si vyžaduje vaše ruky, pripadne na noc (predvolene medzi 23:00 a 07:00), Pekár navrhne dlhší čas v chladničke. Keď je času málo, uvedie najskorší možný čas.

SPRIEVODCA KROK ZA KROKOM
Pekár ukazuje aktuálny krok: čo urobiť, ako dlho to trvá a čo bude nasledovať. Keď povolíte hlásenia, upozorní vás na koniec kroku aj pri zamknutom telefóne. V kroku, ktorý si vyžaduje vaše ruky, obrazovka sprievodcu nezhasne. Kroky s horúcou nádobou alebo surovým cestom majú upozornenie. Ražný chlieb (viac ako polovicu múky tvorí ražná múka) má vlastné kroky bez prekladania. Omylom potvrdený krok môžete vrátiť a po opätovnom otvorení sa aplikácia vráti k aktuálnemu kroku.

KVÁSKY
Môžete viesť niekoľko kváskov. Pekár uvedie množstvá na kŕmenie v pomere 1:1:1, 1:2:2, 1:3:3 alebo 1:5:5. Keď kvások zdvojnásobí objem, Pekár ho označí ako pripravený do cesta. Po 12 hodinách na linke bez kŕmenia vám ho pripomenie hlásením. Nový kvások založíte deň po dni. Pekár uplatňuje zásadu opatrnosti: pri povlaku, zafarbení alebo hnilobnom zápachu odporúča kvások vyhodiť.

DOKTOR CHLEBA
Striedka je zbitá a kôrka bledá? Označte príznaky a Doktor chleba určí jednu z 9 chýb, vysvetlí príčinu a povie, čo zmeniť nabudúce. Štyri záchranné protokoly pomôžu, keď má cesto počas kvasenia problém. Doktor kvásku pomôže, keď vás na kvásku niečo znepokojuje.

DENNÍK
Ohodnoťte každý bochník: hviezdičky, striedka, kôrka a chuťový profil. Denník ukazuje štatistiky a „Piecť znova“ otvorí tú istú receptúru.

VAŠE ÚDAJE
Pekár uchováva v telefóne 10 posledných automatických záloh. Všetky údaje exportujete do súboru a importujete zo súboru a históriu pečenia exportujete ako CSV. Jednotky: gramy a °C alebo unce a °F.

DOBRÉ VEDIEŤ
Pekár funguje na iPhone a nesynchronizuje údaje medzi zariadeniami; údaje prenesiete súborom zálohy. Bez povolenia hlásení Pekár zobrazí koniec kroku len na otvorenej obrazovke.

PRÍSTUP A NÁKUP
Basic je navždy zadarmo, bez skúšobného obdobia. Pro pridáva plánovanie, starostlivosť o kvások, viac kváskov a receptúr. Pro je mesačné alebo ročné predplatné alebo jednorazový doživotný nákup v App Store.
Podmienky používania (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/

Jazyky: 35.
```

### Co nowego (What’s New in This Version)

nie dotyczy wersji 1.0: Apple — „This property isn’t available for the first version of the app”. Od 1.0.1 tekst z listy zmian według `docs/wydanie/sklep.md` §5.

### Privacy Policy URL · App Information

```text
https://apps4brew.com/piekarz/privacy.html
```

### Support URL · wersja 1.0

```text
https://apps4brew.com/piekarz/support.html
```

## Kategoria (raz dla całej aplikacji, nie na lokalizację)

Primary Category: **Food & Drink**; Secondary Category: **Productivity** (D-055; docs/15-app-store.md §3).

## Zrzuty ekranu (7 na klasę, kolejność D-055)

Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk sk … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sk/iphone-6.9/01-plan.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sk/iphone-6.3/01-plan.png` | Chlieb hotový na váš čas | Spätný plán bez krokov uprostred noci |
| 2 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sk/iphone-6.9/02-receptura.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sk/iphone-6.3/02-receptura.png` | Gramy každej suroviny hneď | Múka a voda z kvásku započítané v pekárskych percentách |
| 3 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sk/iphone-6.9/03-prowadzenie-ciemny.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sk/iphone-6.3/03-prowadzenie-ciemny.png` | Jeden krok naraz | Čo urobiť, ako dlho to trvá a hlásenie o konci kroku |
| 4 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sk/iphone-6.9/04-doktor.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sk/iphone-6.3/04-doktor.png` | Čo zlepšiť pri ďalšom bochníku | Príznaky, príčina a jedna zmena na ďalšie pečenie |
| 5 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sk/iphone-6.9/05-zakwasy.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sk/iphone-6.3/05-zakwasy.png` | Kvások vždy pripravený načas | Množstvá na kŕmenie a pripomienka po 12 hodinách |
| 6 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sk/iphone-6.9/06-dziennik.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sk/iphone-6.3/06-dziennik.png` | Každé pečenie zaznamenané | Hodnotenie bochníka a „Piecť znova“ jedným ťuknutím |
| 7 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sk/iphone-6.9/07-offline.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sk/iphone-6.3/07-offline.png` | Bez účtu a bez internetu | Bez reklám a sledovania; údaje len vo vašom telefóne |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

Pozostałe storefronty tej karty (1): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Bez oferty wprowadzającej na `com.apps4brew.baker.pro.monthly`, `com.apps4brew.baker.pro.yearly` i `com.apps4brew.baker.pro.lifetime` (D-112): ofertę z D-038 usuwa M1 w App Store Connect razem z buildem Basic/Pro (Z-1, instrukcja §4).

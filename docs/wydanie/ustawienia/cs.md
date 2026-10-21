# Karta ustawień App Store: Czech (`cs`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/cs.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **Czech**, kod ASC `cs`; język aplikacji `cs` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → Czech (jeśli go nie ma: „Not Localized” → Czech → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **hipoteza** — brak lokalnego sygnału; sprawdzenie po wydaniu w App Analytics (docs/wydanie/widocznosc.md §1).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 0 — —
- Język dodatkowy: 1 — CZE (Czechia)
- Dostępność: wszystkie storefronty tej karty (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

## Pola do skopiowania (pole po polu)

Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.

### Nazwa (Name) · 22 / 30 znaków · App Information

```text
Pekař: Chléb na kvásku
```

### Podtytuł (Subtitle) · 24 / 30 znaków · App Information

```text
Plán pečení a kalkulačka
```

### Słowa kluczowe (Keywords) · 91 / 100 bajtów (85 znaków) · wersja 1.0

```text
bochník,pizza,hydratace,těsto,žitný,levain,poolish,časovač,recept,kvasnice,fermentace
```

### Tekst promocyjny (Promotional Text) · 153 / 170 znaków · wersja 1.0

```text
Nastavte čas, kdy má být chléb hotový: Pekař spočítá množství, sestaví plán zpětně a dá vědět o konci každého kroku. Bez účtu, bez internetu, bez reklam.
```

### Opis (Description) · 2941 / 4000 znaków · wersja 1.0

```text
Pekař vás provede pečením chleba z kvásku od receptu po bochník: spočítá množství, sestaví plán a hlídá čas, i když telefon spí. Funguje bez účtu a bez internetu, bez reklam a bez sledování. Vaše recepty, kvásky a deník zůstávají jen ve vašem telefonu.

RECEPTY A MNOŽSTVÍ
Vyberte jeden z 15 základních receptů (kváskové, žitné, droždové, pizza a sladké) nebo vlastní. Nastavte počet bochníků nebo hmotnost mouky a Pekař uvede gramy mouky, vody, kvásku, soli a droždí. Pekařská procenta zahrnují mouku a vodu z kvásku i ze zákvasu. Pekař také uvede teplotu vody pro teplotu těsta, které chcete dosáhnout.

PLÁN OD ČASU „HOTOVO“
Vyberte, kdy má být chléb hotový, a Pekař zpětně spočítá čas začátku každého kroku. Doba kvašení závisí na teplotě v kuchyni. Když krok, který vyžaduje vaše ruce, připadne na noc (ve výchozím nastavení mezi 23:00 a 07:00), Pekař navrhne delší dobu v lednici. Když je času málo, uvede nejdřívější možný čas.

VEDENÍ KROK ZA KROKEM
Pekař ukazuje aktuální krok: co udělat, jak dlouho to trvá a co bude následovat. Když povolíte oznámení, dá vědět o konci kroku i při zamčeném telefonu. V kroku, který vyžaduje vaše ruce, obrazovka vedení nezhasne. Kroky s horkou nádobou nebo syrovým těstem mají varování. Žitný chléb (víc než polovina mouky je žitná mouka) má vlastní kroky bez překládání. Omylem potvrzený krok vrátíte zpět a po opětovném otevření se aplikace vrátí k aktuálnímu kroku.

KVÁSKY
Veďte několik kvásků. Pekař uvádí množství na krmení v poměru 1:1:1, 1:2:2, 1:3:3 nebo 1:5:5. Když kvásek zdvojnásobí objem, Pekař ho označí jako připravený do těsta. Po 12 hodinách na lince bez krmení vám ho připomene oznámením. Nový kvásek založíte den po dni. Pekař se řídí zásadou opatrnosti: při povlaku, změně barvy nebo zahnilém zápachu radí kvásek vyhodit.

DOKTOR CHLEBA
Střídka je hutná a kůrka bledá? Označte příznaky a Doktor chleba určí jednu z 9 vad, vysvětlí příčinu a poradí, co příště změnit. Doktor kvásku pomůže, když vás na kvásku něco znepokojuje.

DENÍK
Ohodnoťte každý bochník: hvězdičky, střídka, kůrka a chuťový profil. Deník ukazuje statistiky a „Péct znovu“ otevře stejný recept.

VAŠE DATA
Pekař uchovává v telefonu 10 posledních automatických záloh. Všechna data vyexportujete do souboru a naimportujete ze souboru a historii pečení vyexportujete jako CSV. Jednotky: gramy a °C nebo unce a °F.

DOBRÉ VĚDĚT
Pekař funguje na iPhonu a nesynchronizuje data mezi zařízeními; data přenesete souborem zálohy. Bez povolení oznámení ukáže Pekař konec kroku jen na otevřené obrazovce.

PŘÍSTUP A NÁKUP
Plný přístup poskytuje měsíční nebo roční předplatné nebo jednorázový doživotní nákup v App Storu. Předplatné může začínat bezplatnou zkušební dobou (úvodní nabídka App Storu pro oprávněné uživatele). Bez nákupu můžete procházet historii pečení, importovat soubor a exportovat a mazat svá data.
Podmínky použití (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/

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

Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk cs … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/cs/iphone-6.9/01-plan.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/cs/iphone-6.3/01-plan.png` | Chléb hotový, kdy potřebujete | Zpětný plán bez kroků uprostřed noci |
| 2 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/cs/iphone-6.9/02-receptura.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/cs/iphone-6.3/02-receptura.png` | Gramy všech surovin hned | Mouka a voda z kvásku započtené v pekařských procentech |
| 3 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/cs/iphone-6.9/03-prowadzenie-ciemny.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/cs/iphone-6.3/03-prowadzenie-ciemny.png` | Jeden krok po druhém | Co udělat, jak dlouho to trvá a upozornění na konec kroku |
| 4 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/cs/iphone-6.9/04-doktor.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/cs/iphone-6.3/04-doktor.png` | Co zlepšit na dalším bochníku | Příznaky, příčina a jedna změna pro další pečení |
| 5 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/cs/iphone-6.9/05-zakwasy.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/cs/iphone-6.3/05-zakwasy.png` | Kvásek vždy připravený včas | Množství na krmení a připomínka po 12 hodinách |
| 6 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/cs/iphone-6.9/06-dziennik.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/cs/iphone-6.3/06-dziennik.png` | Každé pečení zapsané | Hodnocení bochníku a „Péct znovu“ jedním klepnutím |
| 7 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/cs/iphone-6.9/07-offline.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/cs/iphone-6.3/07-offline.png` | Bez účtu a bez internetu | Bez reklam a sledování; data jen ve vašem telefonu |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

Pozostałe storefronty tej karty (1): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Oferta wprowadzająca: Free Trial, 2 Weeks (14 dni) na `com.apps4brew.baker.pro.monthly` i `com.apps4brew.baker.pro.yearly`, wszystkie, w których aplikacja jest dostępna; dożywotni bez oferty (D-038).

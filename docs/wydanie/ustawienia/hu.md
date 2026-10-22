# Karta ustawień App Store: Hungarian (`hu`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/hu.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **Hungarian**, kod ASC `hu`; język aplikacji `hu` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → Hungarian (jeśli go nie ma: „Not Localized” → Hungarian → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **hipoteza** — brak lokalnego sygnału; sprawdzenie po wydaniu w App Analytics (docs/wydanie/widocznosc.md §1).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 0 — —
- Język dodatkowy: 1 — HUN (Hungary)
- Dostępność: wszystkie storefronty tej karty (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

## Pola do skopiowania (pole po polu)

Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.

### Nazwa (Name) · 20 / 30 znaków · App Information

```text
Pék: Kovászos kenyér
```

### Podtytuł (Subtitle) · 25 / 30 znaków · App Information

```text
Sütési terv és kalkulátor
```

### Słowa kluczowe (Keywords) · 91 / 100 bajtów (81 znaków) · wersja 1.0

```text
cipó,pizza,hidratáció,tészta,rozs,levain,poolish,időzítő,recept,erjesztés,élesztő
```

### Tekst promocyjny (Promotional Text) · 155 / 170 znaków · wersja 1.0

```text
Állítsd be, mikorra legyen kész a kenyér: a Pék kiszámolja a mennyiségeket, visszafelé tervez, és szól minden lépés végén. Fiók, internet és reklám nélkül.
```

### Opis (Description) · 3343 / 4000 znaków · wersja 1.0

```text
A Pék végigvezet a kovászos kenyér sütésén a recepttől a cipóig: kiszámolja a mennyiségeket, elkészíti a tervet, és figyeli az időt, amíg a telefon alszik. Fiók és internet nélkül működik, reklám és követés nélkül. A receptjeid, kovászaid és a naplód csak a telefonodon maradnak.

RECEPTEK ÉS MENNYISÉGEK
Válassz a 15 alaprecept közül (kovászos, rozs-, élesztős, pizza és édes), vagy használd a sajátodat. Add meg a cipók számát vagy a liszt tömegét, a Pék pedig grammra megadja a lisztet, a vizet, a kovászt, a sót és az élesztőt. A pékszázalék a kovászban és a kovászos előtésztában lévő lisztet és vizet is figyelembe veszi. A Pék azt is megmondja, milyen hőmérsékletű víz kell a kívánt tésztahőmérséklethez.

TERV A „KÉSZ” IDŐPONTTÓL
Kiválasztod, mikorra legyen kész a kenyér, a Pék pedig visszafelé kiszámolja minden lépés kezdési idejét. Az erjedési idő a konyha hőmérsékletétől függ. Ha egy kézi munkát igénylő lépés éjszakára esik (alapértelmezés szerint 23:00 és 07:00 között), a Pék hosszabb időt javasol a hűtőben. Ha kevés az idő, megadja a legkorábbi lehetséges időpontot.

LÉPÉSRŐL LÉPÉSRE
A Pék mutatja az aktuális lépést: mit kell tenni, mennyi ideig tart, és mi jön utána. Ha engedélyezed az értesítéseket, zárolt telefonon is szól a lépés végén. Kézi munkát igénylő lépésnél a vezetett képernyő nem kapcsol ki. A forró edénnyel vagy nyers tésztával járó lépéseknél figyelmeztetés jelenik meg. A rozskenyérnek (ha a liszt több mint fele rozsliszt) saját, hajtogatás nélküli lépései vannak. A tévedésből jóváhagyott lépést visszavonhatod, újranyitáskor pedig az alkalmazás az aktuális lépésre tér vissza.

KOVÁSZOK
Több kovászt is vezethetsz. A Pék megadja az etetési mennyiségeket 1:1:1, 1:2:2, 1:3:3 vagy 1:5:5 arányban. Amikor a kovász megduplázza a térfogatát, a Pék tésztához késznek jelöli. Ha 12 órája áll a pulton etetés nélkül, értesítéssel emlékeztet. Új kovászt napról napra indíthatsz el. A Pék az elővigyázatosság elvét követi: bevonat, elszíneződés vagy rothadt szag esetén azt tanácsolja, hogy dobd ki a kovászt.

KENYÉRDOKTOR
Tömör a bélzet és sápadt a héj? Jelöld be a tüneteket, a Kenyérdoktor pedig megnevezi a 9 hiba egyikét, elmagyarázza az okát, és megmondja, mit változtass legközelebb. Négy mentőprotokoll segít, ha a tésztával gond van erjedés közben. A Kovászdoktor akkor segít, ha valami aggaszt a kovászoddal kapcsolatban.

NAPLÓ
Értékelj minden cipót: csillagok, bélzet, héj és ízprofil. A Napló statisztikákat mutat, a „Süsd újra” pedig megnyitja ugyanazt a receptet.

AZ ADATAID
A Pék az utolsó 10 automatikus biztonsági mentést a telefonon tárolja. Minden adatodat fájlba exportálhatod és fájlból importálhatod, a sütési előzményeket pedig CSV-be exportálhatod. Mértékegységek: gramm és °C vagy uncia és °F.

JÓ TUDNI
A Pék iPhone-on működik, és nem szinkronizál az eszközök között; az adatokat biztonsági mentési fájllal viheted át. Ha nem engedélyezed az értesítéseket, a Pék csak a nyitott képernyőn jelzi a lépés végét.

HOZZÁFÉRÉS ÉS VÁSÁRLÁS
A Basic örökre ingyenes, próbaidőszak nélkül. A Pro hozzáadja a tervezést és a kovászgondozást, valamint további kovászokat és recepteket. A Pro havi vagy éves előfizetés, illetve egyszeri, élethosszig tartó vásárlás az App Store-ban.
Felhasználási feltételek (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/

Nyelvek: 35.
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

Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk hu … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/hu/iphone-6.9/01-plan.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/hu/iphone-6.3/01-plan.png` | Kenyér pont akkorra, amikorra kell | Visszafelé ütemezés éjszakai lépések nélkül |
| 2 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/hu/iphone-6.9/02-receptura.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/hu/iphone-6.3/02-receptura.png` | Minden hozzávaló grammja azonnal | A kovász lisztje és vize is benne van a pékszázalékban |
| 3 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/hu/iphone-6.9/03-prowadzenie-ciemny.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/hu/iphone-6.3/03-prowadzenie-ciemny.png` | Egyszerre egy lépés | Mi a teendő, meddig tart, és értesítés a lépés végén |
| 4 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/hu/iphone-6.9/04-doktor.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/hu/iphone-6.3/04-doktor.png` | Mit javíts a következő cipón | Tünetek, ok és egy változtatás a következő sütésre |
| 5 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/hu/iphone-6.9/05-zakwasy.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/hu/iphone-6.3/05-zakwasy.png` | A kovász mindig időben kész | Etetési mennyiségek és emlékeztető 12 óra után |
| 6 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/hu/iphone-6.9/06-dziennik.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/hu/iphone-6.3/06-dziennik.png` | Minden sütés feljegyezve | Cipóértékelés és „Süsd újra” egy koppintással |
| 7 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/hu/iphone-6.9/07-offline.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/hu/iphone-6.3/07-offline.png` | Fiók és internet nélkül | Reklám és követés nélkül; az adatok csak a telefonodon |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

Pozostałe storefronty tej karty (1): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Bez oferty wprowadzającej na `com.apps4brew.baker.pro.monthly`, `com.apps4brew.baker.pro.yearly` i `com.apps4brew.baker.pro.lifetime` (D-112): ofertę z D-038 usuwa M1 w App Store Connect razem z buildem Basic/Pro (Z-1, instrukcja §4).

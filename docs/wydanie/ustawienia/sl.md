# Karta ustawień App Store: Slovenian (`sl`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/sl.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **Slovenian**, kod ASC `sl`; język aplikacji `sl` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → Slovenian (jeśli go nie ma: „Not Localized” → Slovenian → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **hipoteza** — brak lokalnego sygnału; sprawdzenie po wydaniu w App Analytics (docs/wydanie/widocznosc.md §1).
- **Weryfikacja natywna:** nazwę i podtytuł przed wysyłką sprawdza osoba mówiąca tym językiem (D-053; docs/wydanie/widocznosc.md §6 p. 5).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 0 — —
- Język dodatkowy: 1 — SVN (Slovenia)
- Dostępność: wszystkie storefronty tej karty (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

## Pola do skopiowania (pole po polu)

Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.

### Nazwa (Name) · 18 / 30 znaków · App Information

```text
Pek: Kruh na kvasu
```

### Podtytuł (Subtitle) · 24 / 30 znaków · App Information

```text
Načrt peke in kalkulator
```

### Słowa kluczowe (Keywords) · 87 / 100 bajtów (85 znaków) · wersja 1.0

```text
hlebec,pizza,hidracija,testo,rženi,levain,poolish,časovnik,recept,fermentacija,kvasec
```

### Tekst promocyjny (Promotional Text) · 161 / 170 znaków · wersja 1.0

```text
Nastavite uro, ko naj bo kruh pripravljen: Pek izračuna količine, sestavi obratni urnik in vas obvesti o koncu vsakega koraka. Brez računa, interneta in oglasov.
```

### Opis (Description) · 2995 / 4000 znaków · wersja 1.0

```text
Pek vas vodi skozi peko kruha z naravnim kvasom od recepta do hlebca: izračuna količine, sestavi načrt in pazi na čas, ko telefon spi. Deluje brez računa in brez interneta, brez oglasov in brez sledenja. Vaši recepti, kvasi in dnevnik ostanejo samo v vašem telefonu.

RECEPTI IN KOLIČINE
Izberete enega od 15 osnovnih receptov (z naravnim kvasom, rženi, s pekovskim kvasom, pica in sladki) ali svojega. Nastavite število hlebcev ali maso moke, Pek pa poda grame moke, vode, kvasa, soli in pekovskega kvasa. Pekovski odstotek upošteva moko in vodo iz kvasa in iz nastavka. Pek poda tudi temperaturo vode za temperaturo testa, ki jo želite doseči.

NAČRT OD URE „PRIPRAVLJENO“
Izberete, kdaj naj bo kruh pripravljen, Pek pa nazaj izračuna začetno uro vsakega koraka. Čas fermentacije je odvisen od temperature v kuhinji. Ko korak, pri katerem so potrebne vaše roke, pade v noč (privzeto med 23:00 in 07:00), Pek predlaga daljši čas v hladilniku. Če je časa premalo, poda najzgodnejšo možno uro.

VODENJE KORAK ZA KORAKOM
Pek prikaže trenutni korak: kaj storiti, koliko traja in kaj sledi. Če dovolite obvestila, vas o koncu koraka obvesti tudi pri zaklenjenem telefonu. Pri koraku, pri katerem so potrebne vaše roke, zaslon vodenja ne ugasne. Koraki z vročo posodo ali surovim testom imajo opozorilo. Rženi kruh (več kot polovica moke je ržena moka) ima lastne korake brez raztezanja in prepogibanja. Pomotoma potrjen korak lahko razveljavite, po ponovnem odprtju pa se aplikacija vrne na trenutni korak.

KVASI
Vodite lahko več kvasov. Pek poda količine za hranjenje v razmerju 1:1:1, 1:2:2, 1:3:3 ali 1:5:5. Ko kvas podvoji prostornino, ga Pek označi kot pripravljenega za testo. Po 12 urah na pultu brez hranjenja vas nanj opomni z obvestilom. Nov kvas lahko vzgojite dan za dnem. Pek upošteva načelo previdnosti: pri oblogi, razbarvanju ali gnilem vonju svetuje, da kvas zavržete.

DOKTOR ZA KRUH
Sredica je zbita, skorja pa bleda? Označite simptome, Doktor za kruh pa prepozna eno od 9 napak, pojasni vzrok in pove, kaj naslednjič spremeniti. Doktor za kvas pomaga, ko vas pri kvasu kaj skrbi.

DNEVNIK
Ocenite vsak hlebec: zvezdice, sredica, skorja in profil okusa. Dnevnik prikazuje statistiko, „Speci znova“ pa odpre isti recept.

VAŠI PODATKI
Pek v telefonu hrani 10 zadnjih samodejnih varnostnih kopij. Vse podatke lahko izvozite v datoteko in jih uvozite iz datoteke, zgodovino peke pa izvozite kot CSV. Enote: grami in °C ali unče in °F.

DOBRO JE VEDETI
Pek deluje na iPhonu in ne sinhronizira podatkov med napravami; podatke prenesete z datoteko varnostne kopije. Brez dovoljenja za obvestila Pek prikaže konec koraka le na odprtem zaslonu.

DOSTOP IN NAKUP
Polni dostop omogoča mesečna ali letna naročnina ali enkratni doživljenjski nakup v App Storu. Naročnina se lahko začne z brezplačnim preizkusnim obdobjem (uvodna ponudba App Store za upravičene uporabnike). Brez nakupa lahko pregledujete zgodovino peke, uvozite datoteko ter izvozite in izbrišete svoje podatke.

Jeziki: 35.
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

Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk sl … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sl/iphone-6.9/01-plan.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sl/iphone-6.3/01-plan.png` | Kruh, pripravljen ob vaši uri | Obratni urnik brez korakov sredi noči |
| 2 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sl/iphone-6.9/02-receptura.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sl/iphone-6.3/02-receptura.png` | Grami vsake sestavine takoj | Moka in voda iz kvasa vključeni v pekovski odstotek |
| 3 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sl/iphone-6.9/03-prowadzenie-ciemny.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sl/iphone-6.3/03-prowadzenie-ciemny.png` | En korak naenkrat | Kaj storiti, koliko traja in obvestilo ob koncu koraka |
| 4 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sl/iphone-6.9/04-doktor.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sl/iphone-6.3/04-doktor.png` | Kaj izboljšati pri naslednjem hlebcu | Simptomi, vzrok in ena sprememba za naslednjo peko |
| 5 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sl/iphone-6.9/05-zakwasy.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sl/iphone-6.3/05-zakwasy.png` | Kvas vedno pravočasno pripravljen | Količine za hranjenje in opomnik po 12 urah |
| 6 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sl/iphone-6.9/06-dziennik.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sl/iphone-6.3/06-dziennik.png` | Vsaka peka zabeležena | Ocena hlebca in „Speci znova“ z enim dotikom |
| 7 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sl/iphone-6.9/07-offline.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/sl/iphone-6.3/07-offline.png` | Brez računa in brez interneta | Brez oglasov in sledenja; podatki le v vašem telefonu |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

Pozostałe storefronty tej karty (1): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Oferta wprowadzająca: Free Trial, 2 Weeks (14 dni) na `com.apps4brew.baker.pro.monthly` i `com.apps4brew.baker.pro.yearly`, wszystkie, w których aplikacja jest dostępna; dożywotni bez oferty (D-038).

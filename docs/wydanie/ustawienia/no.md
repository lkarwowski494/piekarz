# Karta ustawień App Store: Norwegian (`no`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/no.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **Norwegian**, kod ASC `no`; język aplikacji `nb` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → Norwegian (jeśli go nie ma: „Not Localized” → Norwegian → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **częściowo** — podpowiedzi sklepu tego kraju bez pełnych liczb ocen konkurencji (docs/wydanie/widocznosc.md §1).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 0 — —
- Język dodatkowy: 1 — NOR (Norway)
- Dostępność: wszystkie storefronty tej karty (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

## Pola do skopiowania (pole po polu)

Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.

### Nazwa (Name) · 24 / 30 znaków · App Information

```text
Bakeren: Brød og surdeig
```

### Podtytuł (Subtitle) · 28 / 30 znaków · App Information

```text
Bakeplan og oppskriftsregner
```

### Słowa kluczowe (Keywords) · 90 / 100 bajtów (87 znaków) · wersja 1.0

```text
heving,deig,mel,rugbrød,levain,poolish,bakerprosent,pizza,påminnelse,brødbaking,hevetid
```

### Tekst promocyjny (Promotional Text) · 166 / 170 znaków · wersja 1.0

```text
Velg når brødet skal være ferdig: Bakeren regner ut mengdene, lager en plan bakover og varsler deg når hvert steg er ferdig. Uten konto, uten internett, uten reklame.
```

### Opis (Description) · 3306 / 4000 znaków · wersja 1.0

```text
Bakeren guider deg gjennom bakingen av surdeigsbrød fra oppskrift til ferdig brød: appen regner ut mengdene, lager planen og holder styr på tiden mens telefonen sover. Den fungerer uten konto og uten internett, uten reklame og uten sporing. Oppskriftene, surdeigsstarterne og dagboken din blir bare på telefonen din.

OPPSKRIFTER OG MENGDER
Velg én av 15 grunnoppskrifter (surdeig, rug, gjær, pizza og søtt) eller din egen. Still inn antall brød eller melmengden, så gir Bakeren deg gram mel, vann, surdeigsstarter, salt og gjær. Bakerprosenten tar med mel og vann fra surdeigsstarteren og fra fordeigen. Bakeren gir deg også vanntemperaturen for den deigtemperaturen du ønsker.

PLAN FRA «FERDIG»-TIDSPUNKTET
Velg når brødet skal være ferdig, så regner Bakeren bakover og finner starttidspunktet for hvert steg. Gjæringstiden avhenger av temperaturen på kjøkkenet. Når et steg som krever hendene dine havner om natten (som standard mellom 23:00 og 07:00), foreslår Bakeren lengre tid i kjøleskapet. Hvis det er for lite tid, oppgir Bakeren det tidligst mulige tidspunktet.

STEG FOR STEG
Bakeren viser det aktuelle steget: hva du skal gjøre, hvor lenge det tar og hva som kommer etterpå. Hvis du tillater varsler, sier Bakeren fra når steget er ferdig, også når telefonen er låst. I steg som krever hendene dine, slukkes ikke veiledningsskjermen. Steg med varmt kokekar eller rå deig har en advarsel. Rugbrød (mer enn halvparten av melet er rugmel) har egne steg uten bretting. Et steg du har bekreftet ved en feil, kan du angre, og når du åpner appen igjen, går den tilbake til det aktuelle steget.

SURDEIGSSTARTERE
Hold styr på flere surdeigsstartere. Bakeren gir deg mengdene til mating i forholdet 1:1:1, 1:2:2, 1:3:3 eller 1:5:5. Når surdeigsstarteren har doblet volumet, merker Bakeren den som klar til deigen. Etter 12 timer på benken uten mating minner Bakeren deg på den med et varsel. En ny surdeigsstarter kan du lage dag for dag. Bakeren følger et føre-var-prinsipp: ved belegg, misfarging eller råtten lukt råder appen deg til å kaste surdeigsstarteren.

BRØDDOKTOR
Kompakt krumme og blek skorpe? Kryss av symptomene, så peker Brøddoktor ut én av 9 feil, forklarer årsaken og sier hva du bør endre neste gang. Starterdoktoren hjelper når noe ved surdeigsstarteren bekymrer deg.

DAGBOK
Vurder hvert brød: stjerner, krumme, skorpe og smaksprofil. Dagboken viser statistikk, og «Bak igjen» åpner den samme oppskriften.

DINE DATA
Bakeren lagrer de 10 siste automatiske sikkerhetskopiene på telefonen. Du kan eksportere alle data til en fil og importere dem fra en fil, og eksportere bakehistorikken som CSV. Enheter: gram og °C eller unser og °F.

GODT Å VITE
Bakeren fungerer på iPhone og synkroniserer ikke data mellom enheter; du flytter data med en sikkerhetskopifil. Uten tillatelse til varsler viser Bakeren slutten av et steg bare når appen er åpen på skjermen.

TILGANG OG KJØP
Full tilgang får du med et månedlig eller årlig abonnement eller et engangskjøp for livstid i App Store. Et abonnement kan starte med en gratis prøveperiode (introduksjonstilbud i App Store for kvalifiserte brukere). Uten kjøp kan du se bakehistorikken, importere en fil og eksportere og slette dataene dine.
Terms of Use (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/

Språk: 35.
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

Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk no … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/no/iphone-6.9/01-plan.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/no/iphone-6.3/01-plan.png` | Brødet ferdig til ditt tidspunkt | Plan bakover uten steg midt på natten |
| 2 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/no/iphone-6.9/02-receptura.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/no/iphone-6.3/02-receptura.png` | Gram for hver ingrediens med en gang | Mel og vann fra starteren regnes med i bakerprosenten |
| 3 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/no/iphone-6.9/03-prowadzenie-ciemny.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/no/iphone-6.3/03-prowadzenie-ciemny.png` | Ett steg om gangen | Hva du skal gjøre, hvor lenge det tar og varsel når steget er ferdig |
| 4 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/no/iphone-6.9/04-doktor.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/no/iphone-6.3/04-doktor.png` | Hva du kan forbedre i neste brød | Symptomer, årsak og én endring til neste bakst |
| 5 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/no/iphone-6.9/05-zakwasy.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/no/iphone-6.3/05-zakwasy.png` | Starteren alltid klar i tide | Mengder til mating og påminnelse etter 12 timer |
| 6 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/no/iphone-6.9/06-dziennik.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/no/iphone-6.3/06-dziennik.png` | Hver bakst lagret | Vurder brødet og «Bak igjen» med ett trykk |
| 7 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/no/iphone-6.9/07-offline.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/no/iphone-6.3/07-offline.png` | Uten konto og uten internett | Uten reklame og sporing; data kun på telefonen din |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

Pozostałe storefronty tej karty (1): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Oferta wprowadzająca: Free Trial, 2 Weeks (14 dni) na `com.apps4brew.baker.pro.monthly` i `com.apps4brew.baker.pro.yearly`, wszystkie, w których aplikacja jest dostępna; dożywotni bez oferty (D-038).

# Karta ustawień App Store: Croatian (`hr`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/hr.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **Croatian**, kod ASC `hr`; język aplikacji `hr` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → Croatian (jeśli go nie ma: „Not Localized” → Croatian → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **hipoteza** — brak lokalnego sygnału; sprawdzenie po wydaniu w App Analytics (docs/wydanie/widocznosc.md §1).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 0 — —
- Język dodatkowy: 4 — BIH (Bosnia and Herzegovina), HRV (Croatia), MNE (Montenegro), SRB (Serbia)
- Dostępność: wszystkie storefronty tej karty (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

## Pola do skopiowania (pole po polu)

Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.

### Nazwa (Name) · 22 / 30 znaków · App Information

```text
Pekar: Kruh na zakvasu
```

### Podtytuł (Subtitle) · 25 / 30 znaków · App Information

```text
Plan pečenja i kalkulator
```

### Słowa kluczowe (Keywords) · 89 / 100 bajtów (87 znaków) · wersja 1.0

```text
štruca,pizza,hidratacija,tijesto,raženi,levain,poolish,timer,recept,fermentacija,kvasac
```

### Tekst promocyjny (Promotional Text) · 165 / 170 znaków · wersja 1.0

```text
Postavi vrijeme kad kruh treba biti gotov: Pekar će izračunati količine, složiti plan unatrag i javiti ti kraj svakog koraka. Bez računa, bez interneta, bez reklama.
```

### Opis (Description) · 3078 / 4000 znaków · wersja 1.0

```text
Pekar te vodi kroz pečenje kruha od kiselog tijesta od recepture do štruce: računa količine, slaže plan i pazi na vrijeme dok telefon spava. Radi bez računa i bez interneta, bez reklama i bez praćenja. Tvoje recepture, kvasi i dnevnik ostaju samo na tvom telefonu.

RECEPTURE I KOLIČINE
Biraš jednu od 15 osnovnih receptura (od kiselog tijesta, raženih, s kvascem, za pizzu i slatkih) ili vlastitu. Postaviš broj štruca ili masu brašna, a Pekar daje grame brašna, vode, kvasa, soli i kvasca. Pekarski postotak uzima u obzir brašno i vodu iz kvasa i iz nastavka. Pekar će ti dati i temperaturu vode za temperaturu tijesta koju želiš postići.

PLAN OD VREMENA „GOTOVO”
Biraš kada kruh treba biti gotov, a Pekar unatrag računa vrijeme početka svakog koraka. Vrijeme fermentacije ovisi o temperaturi u kuhinji. Kad korak koji traži tvoje ruke padne noću (zadano između 23:00 i 06:30), Pekar će predložiti dulje vrijeme u hladnjaku. Kad je vremena premalo, dat će najranije moguće vrijeme.

VOĐENJE KORAK PO KORAK
Pekar pokazuje trenutačni korak: što napraviti, koliko traje i što slijedi. Ako dopustiš obavijesti, javit će ti kraj koraka i kad je telefon zaključan. Zaslon vođenja ne gasi se tijekom pečenja. Koraci s vrućim posuđem ili sirovim tijestom imaju upozorenje. Raženi kruh (više od polovice brašna je raženo brašno) ima vlastite korake bez preklapanja. Greškom potvrđen korak možeš poništiti, a nakon ponovnog otvaranja aplikacija se vraća na trenutačni korak.

KVASI
Vodiš nekoliko kvasa. Pekar daje količine za hranjenje u omjeru 1:1:1, 1:2:2, 1:3:3 ili 1:5:5. Kad kvas udvostruči volumen, Pekar će ga označiti kao spremnog za tijesto. Nakon 12 sati na radnoj površini bez hranjenja podsjetit će te na njega obaviješću. Novi kvas pokrećeš dan po dan. Pekar primjenjuje načelo opreza: kod naslage, promjene boje ili trulog mirisa savjetuje da baciš kvas.

DOKTOR ZA KRUH
Sredina je zbijena, a kora blijeda? Označiš simptome, a Doktor za kruh pokazuje jednu od 9 pogrešaka, objašnjava uzrok i kaže što promijeniti sljedeći put. Četiri protokola spašavanja pomažu kad tijesto ima problem tijekom fermentacije. Doktor za kvas pomaže kad te nešto u kvasu brine.

DNEVNIK
Ocjenjuješ svaku štrucu: zvjezdice, sredina, kora i profil okusa. Dnevnik pokazuje statistiku, a „Ispeci ponovno” otvara istu recepturu.

TVOJI PODACI
Pekar na telefonu čuva 10 posljednjih automatskih sigurnosnih kopija. Sve podatke možeš izvesti u datoteku i uvesti iz datoteke, a povijest pečenja izvesti kao CSV. Jedinice: grami i °C ili unce i °F.

DOBRO JE ZNATI
Pekar radi na iPhoneu i ne sinkronizira podatke između uređaja; podatke prenosiš datotekom sigurnosne kopije. Bez dopuštenja za obavijesti Pekar će kraj koraka prikazati samo na otvorenom zaslonu.

PRISTUP I KUPNJA
Puni pristup daje mjesečna ili godišnja pretplata ili jednokratna doživotna kupnja u App Storeu. Pretplata može započeti besplatnim probnim razdobljem (uvodna ponuda App Storea za korisnike koji ispunjavaju uvjete). Bez kupnje pregledavaš povijest pečenja, uvoziš datoteku te izvoziš i brišeš svoje podatke.

Jezici: 35.
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

Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk hr … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/hr/iphone-6.9/01-plan.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/hr/iphone-6.3/01-plan.png` | Kruh gotov u tvoje vrijeme | Plan unatrag bez koraka usred noći |
| 2 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/hr/iphone-6.9/02-receptura.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/hr/iphone-6.3/02-receptura.png` | Grami svakog sastojka odmah | Brašno i voda iz kvasa uračunati u pekarski postotak |
| 3 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/hr/iphone-6.9/03-prowadzenie-ciemny.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/hr/iphone-6.3/03-prowadzenie-ciemny.png` | Jedan po jedan korak | Što napraviti, koliko traje i obavijest o kraju koraka |
| 4 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/hr/iphone-6.9/04-doktor.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/hr/iphone-6.3/04-doktor.png` | Što popraviti u sljedećoj štruci | Simptomi, uzrok i jedna promjena za sljedeće pečenje |
| 5 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/hr/iphone-6.9/05-zakwasy.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/hr/iphone-6.3/05-zakwasy.png` | Kvas uvijek spreman na vrijeme | Količine za hranjenje i podsjetnik nakon 12 sati |
| 6 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/hr/iphone-6.9/06-dziennik.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/hr/iphone-6.3/06-dziennik.png` | Svako pečenje zapisano | Ocjena štruce i „Ispeci ponovno” jednim dodirom |
| 7 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/hr/iphone-6.9/07-offline.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/hr/iphone-6.3/07-offline.png` | Bez računa i bez interneta | Bez reklama i praćenja; podaci samo na tvom telefonu |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

Pozostałe storefronty tej karty (4): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Oferta wprowadzająca: Free Trial, 2 Weeks (14 dni) na `com.apps4brew.baker.pro.monthly` i `com.apps4brew.baker.pro.yearly`, wszystkie, w których aplikacja jest dostępna; dożywotni bez oferty (D-038).

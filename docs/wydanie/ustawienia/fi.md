# Karta ustawień App Store: Finnish (`fi`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/fi.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **Finnish**, kod ASC `fi`; język aplikacji `fi` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → Finnish (jeśli go nie ma: „Not Localized” → Finnish → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **hipoteza** — brak lokalnego sygnału; sprawdzenie po wydaniu w App Analytics (docs/wydanie/widocznosc.md §1).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 0 — —
- Język dodatkowy: 1 — FIN (Finland)
- Dostępność: wszystkie storefronty tej karty (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

## Pola do skopiowania (pole po polu)

Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.

### Nazwa (Name) · 28 / 30 znaków · App Information

```text
Leipuri: Leipä ja hapanjuuri
```

### Podtytuł (Subtitle) · 30 / 30 znaków · App Information

```text
Leivontasuunnitelma ja laskuri
```

### Słowa kluczowe (Keywords) · 98 / 100 bajtów (96 znaków) · wersja 1.0

```text
taikina,jauho,hydraatio,ruisleipä,levain,poolish,pizza,muistutus,kohotus,resepti,pata,juurileipä
```

### Tekst promocyjny (Promotional Text) · 156 / 170 znaków · wersja 1.0

```text
Aseta aika, jolloin leipä on valmis: Leipuri laskee määrät, laatii aikataulun taaksepäin ja kertoo vaiheiden päättymisestä. Ei tiliä, nettiä eikä mainoksia.
```

### Opis (Description) · 3438 / 4000 znaków · wersja 1.0

```text
Leipuri opastaa sinut hapanjuurileivän leivonnassa reseptistä valmiiseen leipään: se laskee määrät, laatii aikataulun ja pitää huolta ajasta, kun puhelin on lepotilassa. Sovellus toimii ilman tiliä ja ilman internetyhteyttä, ilman mainoksia ja ilman seurantaa. Reseptisi, hapanjuuresi ja päiväkirjasi pysyvät vain puhelimessasi.

RESEPTIT JA MÄÄRÄT
Valitse yksi 15 perusreseptistä (hapanjuuri-, ruis- ja hiivaleivät, pizza ja makeat leivonnaiset) tai oma reseptisi. Aseta leipien määrä tai jauhojen paino, niin Leipuri kertoo jauhojen, veden, hapanjuuren, suolan ja hiivan grammamäärät. Leipurin prosentti ottaa huomioon sekä hapanjuuren että juuren jauhot ja veden. Leipuri kertoo myös veden lämpötilan haluamaasi taikinan lämpötilaa varten.

AIKATAULU ”VALMIS”-AJASTA
Valitse, milloin leivän pitää olla valmis, niin Leipuri laskee taaksepäin jokaisen vaiheen alkamisajan. Käymisaika riippuu keittiösi lämpötilasta. Jos käsityötä vaativa vaihe osuu yöhön (oletuksena klo 23:00 ja 07:00 välillä), Leipuri ehdottaa pidempää aikaa jääkaapissa. Jos aikaa on liian vähän, se kertoo aikaisimman mahdollisen ajan.

OPASTUS VAIHE VAIHEELTA
Leipuri näyttää nykyisen vaiheen: mitä tehdä, kauanko se kestää ja mitä on tulossa seuraavaksi. Kun sallit ilmoitukset, se kertoo vaiheen päättymisestä myös puhelimen ollessa lukittuna. Käsityötä vaativassa vaiheessa opastusnäyttö ei sammu. Vaiheissa, joissa on kuuma astia tai raaka taikina, on varoitus. Ruisleivällä (yli puolet jauhoista on ruisjauhoja) on omat vaiheensa ilman taittelua. Vahingossa vahvistetun vaiheen voit perua, ja kun avaat sovelluksen uudelleen, se palaa nykyiseen vaiheeseen.

HAPANJUURET
Voit ylläpitää useita hapanjuuria. Leipuri kertoo ruokintamäärät suhteessa 1:1:1, 1:2:2, 1:3:3 tai 1:5:5. Kun hapanjuuri on kaksinkertaistanut tilavuutensa, Leipuri merkitsee sen valmiiksi taikinaan. Kun hapanjuuri on ollut 12 tuntia pöydällä ilman ruokintaa, Leipuri muistuttaa siitä ilmoituksella. Uuden hapanjuuren aloitat päivä päivältä. Leipuri noudattaa varovaisuusperiaatetta: jos hapanjuuressa on kalvo, värimuutos tai mätä haju, se neuvoo heittämään hapanjuuren pois.

LEIPÄLÄÄKÄRI
Sisus on tiivis ja kuori vaalea? Merkitse oireet, niin Leipälääkäri nimeää yhden 9 virheestä, selittää syyn ja kertoo, mitä muuttaa ensi kerralla. Neljä pelastusohjetta auttaa, kun taikinassa on ongelmia käymisen aikana. Hapanjuurilääkäri auttaa, kun jokin hapanjuuressa huolestuttaa sinua.

PÄIVÄKIRJA
Arvioi jokainen leipä: tähdet, sisus, kuori ja makuprofiili. Päiväkirja näyttää tilastot, ja ”Leivo uudelleen” avaa saman reseptin.

OMAT TIETOSI
Leipuri säilyttää puhelimessa 10 viimeisintä automaattista varmuuskopiota. Voit viedä kaikki tiedot tiedostoon ja tuoda ne tiedostosta sekä viedä leivontahistorian CSV-tiedostona. Yksiköt: grammat ja °C tai unssit ja °F.

HYVÄ TIETÄÄ
Leipuri toimii iPhonessa eikä synkronoi tietoja laitteiden välillä; tiedot siirretään varmuuskopiotiedostolla. Ilman ilmoituslupaa Leipuri näyttää vaiheen päättymisen vain avoimella näytöllä.

KÄYTTÖOIKEUS JA OSTO
Täyden käyttöoikeuden saat kuukausi- tai vuositilauksella tai kertaostolla elinikäiseen käyttöön App Storessa. Tilaus voi alkaa maksuttomalla kokeilujaksolla (App Storen esittelytarjous oikeutetuille käyttäjille). Ilman ostoa voit selata leivontahistoriaa, tuoda tiedoston sekä viedä ja poistaa tietosi.
Käyttöehdot (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/

Kielet: 35.
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

Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk fi … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/fi/iphone-6.9/01-plan.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/fi/iphone-6.3/01-plan.png` | Leipä valmiina silloin kun haluat | Aikataulu taaksepäin ilman vaiheita keskellä yötä |
| 2 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/fi/iphone-6.9/02-receptura.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/fi/iphone-6.3/02-receptura.png` | Jokaisen aineksen grammat heti | Hapanjuuren jauhot ja vesi mukana leipurin prosentissa |
| 3 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/fi/iphone-6.9/03-prowadzenie-ciemny.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/fi/iphone-6.3/03-prowadzenie-ciemny.png` | Yksi vaihe kerrallaan | Mitä tehdä, kauanko se kestää ja ilmoitus vaiheen päättyessä |
| 4 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/fi/iphone-6.9/04-doktor.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/fi/iphone-6.3/04-doktor.png` | Mitä parantaa seuraavassa leivässä | Oireet, syy ja yksi muutos seuraavaan leivontaan |
| 5 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/fi/iphone-6.9/05-zakwasy.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/fi/iphone-6.3/05-zakwasy.png` | Hapanjuuri aina ajoissa valmiina | Ruokintamäärät ja muistutus 12 tunnin jälkeen |
| 6 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/fi/iphone-6.9/06-dziennik.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/fi/iphone-6.3/06-dziennik.png` | Jokainen leivonta tallessa | Arvioi leipä ja ”Leivo uudelleen” yhdellä napautuksella |
| 7 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/fi/iphone-6.9/07-offline.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/fi/iphone-6.3/07-offline.png` | Ei tiliä eikä internetiä | Ei mainoksia eikä seurantaa; tiedot vain puhelimessasi |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

Pozostałe storefronty tej karty (1): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Bez oferty wprowadzającej na `com.apps4brew.baker.pro.monthly`, `com.apps4brew.baker.pro.yearly` i `com.apps4brew.baker.pro.lifetime` (D-112): ofertę z D-038 usuwa M1 w App Store Connect razem z buildem Basic/Pro (Z-1, instrukcja §4).

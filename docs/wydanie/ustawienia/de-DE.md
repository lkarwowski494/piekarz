# Karta ustawień App Store: German (`de-DE`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/de-DE.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **German**, kod ASC `de-DE`; język aplikacji `de` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → German (jeśli go nie ma: „Not Localized” → German → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **częściowo** — podpowiedzi sklepu tego kraju bez pełnych liczb ocen konkurencji (docs/wydanie/widocznosc.md §1).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 3 — AUT (Austria), DEU (Germany), CHE (Switzerland)
- Język dodatkowy: 1 — LUX (Luxembourg)
- Dostępność: wszystkie storefronty tej karty (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

## Pola do skopiowania (pole po polu)

Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.

### Nazwa (Name) · 28 / 30 znaków · App Information

```text
Bäcker: Sauerteigbrot backen
```

### Podtytuł (Subtitle) · 29 / 30 znaków · App Information

```text
Backplan, Teigrechner & Timer
```

### Słowa kluczowe (Keywords) · 97 / 100 bajtów (97 znaków) · wersja 1.0

```text
anstellgut,roggen,pizzateig,hefeteig,hydration,teigtemperatur,rezepte,brot,gare,stockgare,starter
```

### Tekst promocyjny (Promotional Text) · 169 / 170 znaków · wersja 1.0

```text
Stell ein, wann dein Brot fertig sein soll: Bäcker berechnet die Mengen, plant rückwärts und meldet sich am Ende jedes Schritts. Ohne Konto, ohne Internet, ohne Werbung.
```

### Opis (Description) · 3640 / 4000 znaków · wersja 1.0

```text
Bäcker begleitet dich beim Backen von Sauerteigbrot von der Rezeptur bis zum Laib: Die App berechnet die Mengen, erstellt den Plan und behält die Zeit im Blick, während dein Telefon schläft. Sie funktioniert ohne Konto und ohne Internet, ohne Werbung und ohne Tracking. Deine Rezepturen, Sauerteige und dein Tagebuch bleiben nur auf deinem Telefon.

REZEPTUREN UND MENGEN
Wähle eine von 15 Grundrezepturen (Sauerteig, Roggen, Hefe, Pizza und Süßes) oder deine eigene. Lege die Anzahl der Laibe oder die Mehlmenge fest, und Bäcker nennt dir die Gramm für Mehl, Wasser, Sauerteig, Salz und Hefe. Die Bäckerprozente berücksichtigen Mehl und Wasser aus dem Sauerteig und aus dem Vorteig. Bäcker nennt dir außerdem die Wassertemperatur für die Teigtemperatur, die du erreichen willst.

PLAN AB DER „FERTIG“-UHRZEIT
Wähle, wann das Brot fertig sein soll, und Bäcker rechnet für jeden Schritt die Startzeit rückwärts aus. Die Gärzeit hängt von der Temperatur in deiner Küche ab. Fällt ein Schritt, bei dem du selbst Hand anlegen musst, in die Nacht (standardmäßig zwischen 23:00 und 07:00), schlägt Bäcker eine längere Zeit im Kühlschrank vor. Reicht die Zeit nicht, nennt Bäcker die frühestmögliche Uhrzeit.

SCHRITT FÜR SCHRITT BEGLEITET
Bäcker zeigt den aktuellen Schritt: was zu tun ist, wie lange es dauert und was danach kommt. Wenn du Mitteilungen erlaubst, meldet sich Bäcker am Ende eines Schritts auch bei gesperrtem Telefon. In einem Schritt, bei dem du selbst Hand anlegen musst, bleibt der Begleitbildschirm an. Schritte mit heißem Gefäß oder rohem Teig tragen einen Warnhinweis. Roggenbrot (mehr als die Hälfte des Mehls ist Roggenmehl) hat eigene Schritte ohne Dehnen und Falten. Einen versehentlich bestätigten Schritt machst du rückgängig, und beim erneuten Öffnen kehrt die App zum aktuellen Schritt zurück.

SAUERTEIGE
Führe mehrere Sauerteige. Bäcker nennt dir die Mengen zum Auffrischen im Verhältnis 1:1:1, 1:2:2, 1:3:3 oder 1:5:5. Hat der Sauerteig sein Volumen verdoppelt, markiert Bäcker ihn als bereit für den Teig. Steht er 12 Stunden ohne Auffrischen auf der Arbeitsfläche, erinnert dich eine Mitteilung daran. Einen neuen Sauerteig setzt du Tag für Tag an. Bäcker folgt dem Vorsichtsprinzip: Bei Belag, Verfärbung oder fauligem Geruch rät Bäcker dir, den Sauerteig wegzuwerfen.

BROTDOKTOR
Krume dicht, Kruste blass? Markiere die Symptome, und der Brotdoktor nennt einen von 9 Fehlern, erklärt die Ursache und sagt dir, was du beim nächsten Mal ändern kannst. Vier Rettungsprotokolle helfen, wenn der Teig während der Gärung Probleme macht. Der Sauerteigdoktor hilft, wenn dich etwas an deinem Sauerteig beunruhigt.

TAGEBUCH
Bewerte jeden Laib: Sterne, Krume, Kruste und Geschmacksprofil. Das Tagebuch zeigt Statistiken, und „Erneut backen“ öffnet dieselbe Rezeptur.

DEINE DATEN
Bäcker behält die letzten 10 automatischen Backups auf deinem Telefon. Du kannst alle Daten in eine Datei exportieren und aus einer Datei importieren und deinen Backverlauf als CSV exportieren. Einheiten: Gramm und °C oder Unzen und °F.

GUT ZU WISSEN
Bäcker läuft auf dem iPhone und synchronisiert keine Daten zwischen Geräten; deine Daten überträgst du mit einer Backup-Datei. Ohne Erlaubnis für Mitteilungen zeigt Bäcker das Ende eines Schritts nur auf dem geöffneten Bildschirm.

ZUGANG UND KAUF
Basic ist für immer kostenlos, ohne Probezeitraum. Pro bietet zusätzlich Planung, Sauerteigpflege sowie mehr Sauerteige und Rezepturen. Pro gibt es als Monats- oder Jahresabo oder als einmaligen Kauf auf Lebenszeit im App Store.
Nutzungsbedingungen (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/

Sprachen: 35.
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

Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk de-DE … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/de-DE/iphone-6.9/01-plan.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/de-DE/iphone-6.3/01-plan.png` | Brot fertig zu deiner Wunschzeit | Rückwärts geplant, ohne Schritte mitten in der Nacht |
| 2 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/de-DE/iphone-6.9/02-receptura.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/de-DE/iphone-6.3/02-receptura.png` | Jede Zutat sofort in Gramm | Mehl und Wasser aus dem Sauerteig in Bäckerprozenten eingerechnet |
| 3 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/de-DE/iphone-6.9/03-prowadzenie-ciemny.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/de-DE/iphone-6.3/03-prowadzenie-ciemny.png` | Ein Schritt nach dem anderen | Was zu tun ist, wie lange es dauert, Mitteilung zum Schrittende |
| 4 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/de-DE/iphone-6.9/04-doktor.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/de-DE/iphone-6.3/04-doktor.png` | Was du am nächsten Laib verbesserst | Symptome, Ursache und eine Änderung fürs nächste Backen |
| 5 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/de-DE/iphone-6.9/05-zakwasy.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/de-DE/iphone-6.3/05-zakwasy.png` | Sauerteig immer pünktlich bereit | Mengen zum Auffrischen und Erinnerung nach 12 Stunden |
| 6 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/de-DE/iphone-6.9/06-dziennik.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/de-DE/iphone-6.3/06-dziennik.png` | Jedes Backen festgehalten | Laib bewerten und „Erneut backen“ mit einem Tippen |
| 7 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/de-DE/iphone-6.9/07-offline.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/de-DE/iphone-6.3/07-offline.png` | Ohne Konto und ohne Internet | Ohne Werbung und Tracking; Daten nur auf deinem Telefon |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

| Storefront | Cena ręczna (mies. / rok / dożywotni) | Źródło |
|---|---|---|
| DEU (Germany) | 0,99 / 7,99 / 17,99 EUR | D-038, docs/wydanie/ceny.json |

Pozostałe storefronty tej karty (3): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Bez oferty wprowadzającej na `com.apps4brew.baker.pro.monthly`, `com.apps4brew.baker.pro.yearly` i `com.apps4brew.baker.pro.lifetime` (D-112): ofertę z D-038 usuwa M1 w App Store Connect razem z buildem Basic/Pro (Z-1, instrukcja §4).

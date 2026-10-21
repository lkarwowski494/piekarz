# Karta ustawień App Store: Italian (`it`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/it.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **Italian**, kod ASC `it`; język aplikacji `it` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → Italian (jeśli go nie ma: „Not Localized” → Italian → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **częściowo** — podpowiedzi sklepu tego kraju bez pełnych liczb ocen konkurencji (docs/wydanie/widocznosc.md §1).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 1 — ITA (Italy)
- Język dodatkowy: 1 — CHE (Switzerland)
- Dostępność: wszystkie storefronty tej karty (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

## Pola do skopiowania (pole po polu)

Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.

### Nazwa (Name) · 29 / 30 znaków · App Information

```text
Fornaio: Pane e lievito madre
```

### Podtytuł (Subtitle) · 23 / 30 znaków · App Information

```text
Calcolo impasto e timer
```

### Słowa kluczowe (Keywords) · 91 / 100 bajtów (91 znaków) · wersja 1.0

```text
idratazione,farina,lievitazione,pizza,percentuale,panificazione,ricetta,biga,poolish,segale
```

### Tekst promocyjny (Promotional Text) · 165 / 170 znaków · wersja 1.0

```text
Imposta l'ora in cui vuoi il pane pronto: Fornaio calcola le dosi, pianifica a ritroso e ti avvisa alla fine di ogni passaggio. Senza account, internet e pubblicità.
```

### Opis (Description) · 3561 / 4000 znaków · wersja 1.0

```text
Fornaio ti guida nella preparazione del pane a lievito madre, dalla ricetta alla pagnotta: calcola le dosi, organizza il programma e tiene il tempo anche quando il telefono è in standby. Funziona senza account e senza internet, senza pubblicità e senza tracciamento. Le tue ricette, i tuoi lieviti madre e il diario restano solo sul tuo telefono.

RICETTE E DOSI
Scegli una delle 15 ricette di base (a lievito madre, di segale, con lievito di birra, pizza e dolci) oppure una tua. Imposta il numero di pagnotte o il peso della farina e Fornaio ti indica i grammi di farina, acqua, lievito madre, sale e lievito di birra. La percentuale del fornaio tiene conto della farina e dell'acqua contenute nel lievito madre e nel lievitino. Fornaio ti indica anche la temperatura dell'acqua per ottenere la temperatura desiderata dell'impasto.

UN PROGRAMMA A PARTIRE DALL'ORA «PRONTO»
Scegli quando vuoi il pane pronto e Fornaio calcola a ritroso l'orario d'inizio di ogni passaggio. Il tempo di fermentazione dipende dalla temperatura della tua cucina. Se un passaggio che richiede le tue mani cade di notte (per impostazione predefinita tra le 23:00 e le 06:30), Fornaio ti propone un tempo più lungo in frigo. Se il tempo non basta, ti indica l'orario più vicino possibile.

GUIDA PASSO PASSO
Fornaio mostra il passaggio in corso: cosa fare, quanto dura e cosa viene dopo. Se consenti le notifiche, ti avvisa della fine del passaggio anche a telefono bloccato. Lo schermo della guida resta acceso durante la sfornata. I passaggi con un recipiente caldo o con impasto crudo hanno un avviso. Il pane di segale (più di metà della farina è farina di segale) ha passaggi propri, senza pieghe di rinforzo. Puoi annullare un passaggio confermato per errore e, quando riapri l'app, torni al passaggio in corso.

LIEVITI MADRE
Gestisci più lieviti madre. Fornaio ti indica le dosi per il rinfresco in proporzione 1:1:1, 1:2:2, 1:3:3 o 1:5:5. Quando il lievito madre raddoppia di volume, Fornaio lo segna come pronto per l'impasto. Dopo 12 ore sul piano di lavoro senza rinfresco, te lo ricorda con una notifica. Puoi avviare un nuovo lievito madre giorno per giorno. Fornaio applica il principio di precauzione: in caso di patina, alterazione di colore o odore di marcio, consiglia di buttare il lievito madre.

DOTTOR PANE
Mollica compatta e crosta pallida? Seleziona i sintomi e il Dottor Pane individua uno dei 9 difetti, ne spiega la causa e ti dice cosa cambiare la prossima volta. Il Dottor Lievito madre ti aiuta quando qualcosa nel tuo lievito madre ti preoccupa.

DIARIO
Valuta ogni pagnotta: stelle, mollica, crosta e profilo di gusto. Il Diario mostra le statistiche e «Inforna di nuovo» apre la stessa ricetta.

I TUOI DATI
Fornaio conserva sul telefono gli ultimi 10 backup automatici. Puoi esportare tutti i dati in un file e importarli da un file, ed esportare la cronologia delle sfornate in CSV. Unità: grammi e °C oppure once e °F.

BUONO A SAPERSI
Fornaio funziona su iPhone e non sincronizza i dati tra dispositivi; i dati si trasferiscono con il file di backup. Senza il permesso per le notifiche, Fornaio mostra la fine di un passaggio solo a schermo aperto.

ACCESSO E ACQUISTO
L'accesso completo si ottiene con un abbonamento mensile o annuale oppure con un acquisto a vita una tantum sull'App Store. L'abbonamento può iniziare con un periodo di prova gratuito (offerta introduttiva dell'App Store per gli utenti idonei). Senza acquisto puoi consultare la cronologia delle sfornate, importare un file ed esportare ed eliminare i tuoi dati.

Lingue: 35.
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

Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk it … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/it/iphone-6.9/01-plan.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/it/iphone-6.3/01-plan.png` | Pane pronto quando vuoi tu | Programma a ritroso senza passaggi nel cuore della notte |
| 2 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/it/iphone-6.9/02-receptura.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/it/iphone-6.3/02-receptura.png` | I grammi di ogni ingrediente, subito | Farina e acqua del lievito madre incluse nella percentuale del fornaio |
| 3 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/it/iphone-6.9/03-prowadzenie-ciemny.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/it/iphone-6.3/03-prowadzenie-ciemny.png` | Un passaggio alla volta | Cosa fare, quanto dura e notifica a fine passaggio |
| 4 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/it/iphone-6.9/04-doktor.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/it/iphone-6.3/04-doktor.png` | Come migliorare la prossima pagnotta | Sintomi, causa e una modifica per la prossima sfornata |
| 5 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/it/iphone-6.9/05-zakwasy.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/it/iphone-6.3/05-zakwasy.png` | Lievito madre sempre pronto in tempo | Dosi per il rinfresco e promemoria dopo 12 ore |
| 6 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/it/iphone-6.9/06-dziennik.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/it/iphone-6.3/06-dziennik.png` | Ogni sfornata registrata | Valuta la pagnotta e «Inforna di nuovo» con un tocco |
| 7 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/it/iphone-6.9/07-offline.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/it/iphone-6.3/07-offline.png` | Senza account e senza internet | Niente pubblicità né tracciamento; dati solo sul tuo telefono |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

Pozostałe storefronty tej karty (2): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Oferta wprowadzająca: Free Trial, 2 Weeks (14 dni) na `com.apps4brew.baker.pro.monthly` i `com.apps4brew.baker.pro.yearly`, wszystkie, w których aplikacja jest dostępna; dożywotni bez oferty (D-038).

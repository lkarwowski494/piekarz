# Karta ustawień App Store: Polish (`pl`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/pl.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **Polish**, kod ASC `pl`; język aplikacji `pl` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → Polish (jeśli go nie ma: „Not Localized” → Polish → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **zmierzone** — frazy z wyników wyszukiwarki i podpowiedzi tego kraju (docs/wydanie/widocznosc.md §1).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 0 — —
- Język dodatkowy: 1 — POL (Poland)
- Dostępność: wszystkie storefronty tej karty (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

## Pola do skopiowania (pole po polu)

Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.

### Nazwa (Name) · 26 / 30 znaków · App Information

```text
Piekarz: Chleb na zakwasie
```

### Podtytuł (Subtitle) · 25 / 30 znaków · App Information

```text
Plan i kalkulator wypieku
```

### Słowa kluczowe (Keywords) · 98 / 100 bajtów (95 znaków) · wersja 1.0

```text
bochenek,pizza,hydratacja,ciasto,drożdże,żytni,lewain,biga,poolish,minutnik,receptura,sourdough
```

### Tekst promocyjny (Promotional Text) · 157 / 170 znaków · wersja 1.0

```text
Ustaw godzinę, o której chleb ma być gotowy: Piekarz policzy ilości, ułoży plan wstecz i da znać o końcu każdego kroku. Bez konta, bez internetu, bez reklam.
```

### Opis (Description) · 3143 / 4000 znaków · wersja 1.0

```text
Piekarz prowadzi cię przez wypiek chleba na zakwasie od receptury do bochenka: liczy ilości, układa plan i pilnuje czasu, gdy telefon śpi. Działa bez konta i bez internetu, bez reklam i bez śledzenia. Twoje receptury, zakwasy i dziennik zostają tylko w twoim telefonie.

RECEPTURY I ILOŚCI
Wybierasz jedną z 15 receptur bazowych (na zakwasie, żytnie, drożdżowe, pizza i słodkie) albo własną. Ustawiasz liczbę bochenków albo masę mąki, a Piekarz podaje gramy mąki, wody, zakwasu, soli i drożdży. Procent piekarski uwzględnia mąkę i wodę z zakwasu i z zaczynu. Piekarz poda też temperaturę wody dla temperatury ciasta, którą chcesz uzyskać.

PLAN OD GODZINY „GOTOWE”
Wybierasz, kiedy chleb ma być gotowy, a Piekarz liczy wstecz godzinę startu każdego kroku. Czas fermentacji zależy od temperatury w kuchni. Gdy krok wymagający twoich rąk wypada w nocy (domyślnie między 23:00 a 06:30), Piekarz zaproponuje dłuższy czas w lodówce. Gdy czasu jest za mało, poda najwcześniejszą możliwą godzinę.

PROWADZENIE KROK PO KROKU
Piekarz pokazuje bieżący krok: co zrobić, ile to trwa i co będzie potem. Gdy zezwolisz na powiadomienia, da znać o końcu kroku także przy zablokowanym telefonie. Ekran prowadzenia nie gaśnie w trakcie wypieku. Kroki z gorącym naczyniem albo surowym ciastem mają ostrzeżenie. Chleb żytni (ponad połowa mąki to mąka żytnia) ma własne kroki bez składania. Pomyłkowo potwierdzony krok cofniesz, a po ponownym otwarciu aplikacja wraca do bieżącego kroku.

ZAKWASY
Prowadzisz kilka zakwasów. Piekarz podaje ilości do dokarmienia w proporcji 1:1:1, 1:2:2, 1:3:3 albo 1:5:5. Gdy zakwas podwoi objętość, Piekarz oznaczy go jako gotowy do ciasta. Po 12 godzinach na blacie bez dokarmienia przypomni o nim powiadomieniem. Nowy zakwas założysz dzień po dniu. Piekarz stosuje zasadę ostrożności: przy nalocie, przebarwieniu albo zgniłym zapachu radzi wyrzucić zakwas.

DOKTOR CHLEBA
Miękisz jest zbity, a skórka blada? Zaznaczasz objawy, a Doktor Chleba wskazuje jedną z 9 wad, wyjaśnia przyczynę i podaje, co zmienić następnym razem. Doktor zakwasu pomaga, gdy coś w zakwasie cię niepokoi.

DZIENNIK
Oceniasz każdy bochenek: gwiazdki, miękisz, skórka i profil smaku. Dziennik pokazuje statystyki, a „Piecz ponownie” otwiera tę samą recepturę.

TWOJE DANE
Piekarz trzyma w telefonie 10 ostatnich automatycznych kopii zapasowych. Wszystkie dane wyeksportujesz do pliku i zaimportujesz z pliku, a historię wypieków wyeksportujesz jako CSV. Jednostki: gramy i °C albo uncje i °F.

WARTO WIEDZIEĆ
Piekarz działa na iPhonie i nie synchronizuje danych między urządzeniami; dane przenosisz plikiem kopii. Bez zgody na powiadomienia Piekarz pokaże koniec kroku tylko na otwartym ekranie.

DOSTĘP I ZAKUP
Pełny dostęp daje subskrypcja miesięczna lub roczna albo jednorazowy zakup dożywotni w App Store. Subskrypcja może zaczynać się bezpłatnym okresem próbnym (oferta wprowadzająca App Store dla uprawnionych). Bez zakupu przeglądasz historię wypieków, importujesz plik oraz eksportujesz i usuwasz swoje dane.

Piekarz jest dostępny w 35 językach, w tym w polskim, angielskim, niemieckim, francuskim, hiszpańskim, włoskim, portugalskim i japońskim.
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

Pliki w repo. Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `docs/wydanie/zrzuty/pl/iphone-6.9/01-plan.png` | `docs/wydanie/zrzuty/pl/iphone-6.3/01-plan.png` | Chleb gotowy na twoją godzinę | Plan wstecz bez kroków w środku nocy |
| 2 | `docs/wydanie/zrzuty/pl/iphone-6.9/02-receptura.png` | `docs/wydanie/zrzuty/pl/iphone-6.3/02-receptura.png` | Gramy każdego składnika od razu | Mąka i woda z zakwasu wliczone w procent piekarski |
| 3 | `docs/wydanie/zrzuty/pl/iphone-6.9/03-prowadzenie-ciemny.png` | `docs/wydanie/zrzuty/pl/iphone-6.3/03-prowadzenie-ciemny.png` | Jeden krok naraz | Co zrobić, ile to trwa i powiadomienie o końcu kroku |
| 4 | `docs/wydanie/zrzuty/pl/iphone-6.9/04-doktor.png` | `docs/wydanie/zrzuty/pl/iphone-6.3/04-doktor.png` | Co poprawić w następnym bochenku | Objawy, przyczyna i jedna zmiana na następny wypiek |
| 5 | `docs/wydanie/zrzuty/pl/iphone-6.9/05-zakwasy.png` | `docs/wydanie/zrzuty/pl/iphone-6.3/05-zakwasy.png` | Zakwas zawsze gotowy na czas | Ilości do dokarmienia i przypomnienie po 12 godzinach |
| 6 | `docs/wydanie/zrzuty/pl/iphone-6.9/06-dziennik.png` | `docs/wydanie/zrzuty/pl/iphone-6.3/06-dziennik.png` | Każdy wypiek zapisany | Ocena bochenka i „Piecz ponownie” jednym dotknięciem |
| 7 | `docs/wydanie/zrzuty/pl/iphone-6.9/07-offline.png` | `docs/wydanie/zrzuty/pl/iphone-6.3/07-offline.png` | Bez konta i bez internetu | Bez reklam i śledzenia; dane tylko w twoim telefonie |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

| Storefront | Cena ręczna (mies. / rok / dożywotni) | Źródło |
|---|---|---|
| POL (Poland) | 4,99 / 29,99 / 79,99 PLN | D-038, docs/wydanie/ceny.json |

Pozostałe storefronty tej karty (0): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Oferta wprowadzająca: Free Trial, 2 Weeks (14 dni) na `com.apps4brew.baker.pro.monthly` i `com.apps4brew.baker.pro.yearly`, wszystkie, w których aplikacja jest dostępna; dożywotni bez oferty (D-038).

# Karta ustawień App Store: Ukrainian (`uk`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/uk.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **Ukrainian**, kod ASC `uk`; język aplikacji `uk` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → Ukrainian (jeśli go nie ma: „Not Localized” → Ukrainian → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **częściowo** — podpowiedzi sklepu tego kraju bez pełnych liczb ocen konkurencji (docs/wydanie/widocznosc.md §1).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 0 — —
- Język dodatkowy: 2 — RUS (Russia), UKR (Ukraine)
- Dostępność: wszystkie storefronty tej karty (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

## Pola do skopiowania (pole po polu)

Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.

### Nazwa (Name) · 23 / 30 znaków · App Information

```text
Пекар: Хліб на заквасці
```

### Podtytuł (Subtitle) · 23 / 30 znaków · App Information

```text
Розрахунок тіста і план
```

### Słowa kluczowe (Keywords) · 91 / 100 bajtów (48 znaków) · wersja 1.0

```text
гідратація,пекарський,житній,рецепти,піца,таймер
```

### Tekst promocyjny (Promotional Text) · 164 / 170 znaków · wersja 1.0

```text
Вкажіть час, коли хліб має бути готовий: Пекар порахує кількості, складе зворотний план і повідомить про завершення кожного кроку. Без акаунта, інтернету й реклами.
```

### Opis (Description) · 3062 / 4000 znaków · wersja 1.0

```text
Пекар проводить вас через випічку хліба на заквасці від рецептури до хлібини: рахує кількості, складає план і стежить за часом, коли телефон спить. Працює без акаунта й без інтернету, без реклами й без стеження. Ваші рецептури, закваски та журнал залишаються лише у вашому телефоні.

РЕЦЕПТУРИ Й КІЛЬКОСТІ
Оберіть одну з 15 базових рецептур (на заквасці, житні, на дріжджах, піца й солодкі) або власну. Задайте кількість хлібин або масу борошна, і Пекар покаже грами борошна, води, закваски, солі й дріжджів. Пекарський відсоток враховує борошно й воду із закваски та з опари. Пекар також підкаже температуру води для бажаної температури тіста.

ПЛАН ВІД ЧАСУ «ГОТОВО»
Оберіть, коли хліб має бути готовий, і Пекар порахує у зворотному порядку час початку кожного кроку. Тривалість ферментації залежить від температури на кухні. Якщо крок, що потребує ваших рук, припадає на ніч (типово між 23:00 і 06:30), Пекар запропонує довший час у холодильнику. Якщо часу замало, він покаже найраніший можливий час.

ПОКРОКОВИЙ СУПРОВІД
Пекар показує поточний крок: що зробити, скільки це триває і що буде далі. Якщо ви дозволите сповіщення, він повідомить про завершення кроку навіть на заблокованому телефоні. Екран супроводу не гасне під час випічки. Кроки з гарячим посудом або сирим тістом мають попередження. Житній хліб (понад половина борошна — житнє борошно) має власні кроки без складання. Помилково підтверджений крок можна скасувати, а після повторного відкриття застосунок повертається до поточного кроку.

ЗАКВАСКИ
Ведіть кілька заквасок. Пекар показує кількості для підживлення у пропорції 1:1:1, 1:2:2, 1:3:3 або 1:5:5. Коли закваска подвоїть об'єм, Пекар позначить її як готову для тіста. Після 12 годин на столі без підживлення він нагадає про неї сповіщенням. Нову закваску можна вивести день за днем. Пекар дотримується принципу обережності: якщо є наліт, зміна кольору або гнилий запах, він радить викинути закваску.

ХЛІБНИЙ ДОКТОР
М'якуш щільний, а скоринка бліда? Позначте симптоми, і Хлібний доктор визначить одну з 9 вад, пояснить причину й підкаже, що змінити наступного разу. Доктор закваски допоможе, коли щось у заквасці вас турбує.

ЖУРНАЛ
Оцінюйте кожну хлібину: зірочки, м'якуш, скоринка й смаковий профіль. Журнал показує статистику, а «Спекти знову» відкриває ту саму рецептуру.

ВАШІ ДАНІ
Пекар зберігає в телефоні 10 останніх автоматичних резервних копій. Усі дані можна експортувати у файл та імпортувати з файлу, а історію випічки — експортувати як CSV. Одиниці: грами й °C або унції й °F.

ВАРТО ЗНАТИ
Пекар працює на iPhone і не синхронізує дані між пристроями; дані переносяться файлом резервної копії. Без дозволу на сповіщення Пекар покаже завершення кроку лише на відкритому екрані.

ДОСТУП І ПОКУПКА
Повний доступ дає місячна чи річна підписка або одноразова довічна покупка в App Store. Підписка може починатися з безплатного пробного періоду (вступна пропозиція App Store для тих, хто має на неї право). Без покупки ви можете переглядати історію випічки, імпортувати файл, а також експортувати й видаляти свої дані.

Мови: 35.
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

Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk uk … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/uk/iphone-6.9/01-plan.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/uk/iphone-6.3/01-plan.png` | Хліб готовий до вашої години | Зворотний план без кроків посеред ночі |
| 2 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/uk/iphone-6.9/02-receptura.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/uk/iphone-6.3/02-receptura.png` | Грами кожного інгредієнта одразу | Борошно й вода із закваски враховані в пекарському відсотку |
| 3 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/uk/iphone-6.9/03-prowadzenie-ciemny.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/uk/iphone-6.3/03-prowadzenie-ciemny.png` | Один крок за раз | Що зробити, скільки це триває, і сповіщення про кінець кроку |
| 4 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/uk/iphone-6.9/04-doktor.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/uk/iphone-6.3/04-doktor.png` | Що покращити в наступній хлібині | Симптоми, причина й одна зміна на наступну випічку |
| 5 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/uk/iphone-6.9/05-zakwasy.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/uk/iphone-6.3/05-zakwasy.png` | Закваска завжди готова вчасно | Кількості для підживлення й нагадування через 12 годин |
| 6 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/uk/iphone-6.9/06-dziennik.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/uk/iphone-6.3/06-dziennik.png` | Кожна випічка в журналі | Оцінка хлібини й «Спекти знову» одним дотиком |
| 7 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/uk/iphone-6.9/07-offline.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/uk/iphone-6.3/07-offline.png` | Без акаунта й без інтернету | Без реклами й стеження; дані лише у вашому телефоні |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

Pozostałe storefronty tej karty (2): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Oferta wprowadzająca: Free Trial, 2 Weeks (14 dni) na `com.apps4brew.baker.pro.monthly` i `com.apps4brew.baker.pro.yearly`, wszystkie, w których aplikacja jest dostępna; dożywotni bez oferty (D-038).

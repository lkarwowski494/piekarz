# Karta ustawień App Store: Russian (`ru`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/ru.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **Russian**, kod ASC `ru`; język aplikacji `ru` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → Russian (jeśli go nie ma: „Not Localized” → Russian → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **częściowo** — podpowiedzi sklepu tego kraju bez pełnych liczb ocen konkurencji (docs/wydanie/widocznosc.md §1).
- **Weryfikacja natywna:** nazwę i podtytuł przed wysyłką sprawdza osoba mówiąca tym językiem (D-053; docs/wydanie/widocznosc.md §6 p. 5).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 1 — RUS (Russia)
- Język dodatkowy: 2 — UKR (Ukraine), USA (United States)
- Dostępność: wszystkie storefronty tej karty (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

## Pola do skopiowania (pole po polu)

Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.

### Nazwa (Name) · 26 / 30 znaków · App Information

```text
Хлебопёк: Хлеб на закваске
```

### Podtytuł (Subtitle) · 27 / 30 znaków · App Information

```text
Расчёт теста и план выпечки
```

### Słowa kluczowe (Keywords) · 91 / 100 bajtów (48 znaków) · wersja 1.0

```text
гидратация,пекарский,ржаной,рецепты,пицца,таймер
```

### Tekst promocyjny (Promotional Text) · 166 / 170 znaków · wersja 1.0

```text
Укажите время, когда хлеб должен быть готов: Хлебопёк рассчитает количества, составит обратный план и сообщит о конце каждого шага. Без аккаунта, интернета и рекламы.
```

### Opis (Description) · 3315 / 4000 znaków · wersja 1.0

```text
Хлебопёк проведёт вас через выпечку хлеба на закваске — от рецептуры до каравая: рассчитает количества, составит план и проследит за временем, пока телефон спит. Работает без аккаунта и без интернета, без рекламы и без отслеживания. Ваши рецептуры, закваски и дневник хранятся только на вашем телефоне.

РЕЦЕПТУРЫ И КОЛИЧЕСТВА
Выберите одну из 15 базовых рецептур (на закваске, ржаные, дрожжевые, пицца и сладкая выпечка) или свою. Укажите число караваев или массу муки, и Хлебопёк рассчитает граммы муки, воды, закваски, соли и дрожжей. Пекарский процент учитывает муку и воду из закваски и из опары. Хлебопёк также подскажет температуру воды для нужной вам температуры теста.

ПЛАН ОТ ВРЕМЕНИ «ГОТОВО»
Выберите, когда хлеб должен быть готов, и Хлебопёк рассчитает в обратном порядке время начала каждого шага. Время брожения зависит от температуры на кухне. Если шаг, требующий ваших рук, выпадает на ночь (по умолчанию с 23:00 до 06:30), Хлебопёк предложит более долгое время в холодильнике. Если времени не хватает, он покажет самое раннее возможное время.

ПОШАГОВОЕ СОПРОВОЖДЕНИЕ
Хлебопёк показывает текущий шаг: что сделать, сколько это займёт и что будет дальше. Если вы разрешите уведомления, он сообщит об окончании шага и при заблокированном телефоне. Экран сопровождения не гаснет во время выпечки. Шаги с горячей посудой или сырым тестом сопровождаются предупреждением. Для ржаного хлеба (больше половины муки — ржаная мука) есть отдельные шаги без складывания. Ошибочно подтверждённый шаг можно отменить, а при повторном открытии приложение вернётся к текущему шагу.

ЗАКВАСКИ
Ведите несколько заквасок. Хлебопёк рассчитает количества для подкормки в пропорции 1:1:1, 1:2:2, 1:3:3 или 1:5:5. Когда закваска увеличится в объёме вдвое, Хлебопёк отметит её как готовую для теста. Через 12 часов на столе без подкормки он напомнит о ней уведомлением. Новую закваску можно вывести день за днём. Хлебопёк следует принципу осторожности: при налёте, изменении цвета или гнилостном запахе он советует выбросить закваску.

ДОКТОР ХЛЕБ
Мякиш плотный, а корка бледная? Отметьте симптомы, и Доктор Хлеб укажет один из 9 дефектов, объяснит причину и подскажет, что изменить в следующий раз. Четыре протокола спасения помогут, если с тестом что-то не так во время брожения. Доктор закваски поможет, когда что-то в закваске вас беспокоит.

ДНЕВНИК
Оценивайте каждый каравай: звёзды, мякиш, корка и вкусовой профиль. Дневник показывает статистику, а «Испечь снова» открывает ту же рецептуру.

ВАШИ ДАННЫЕ
Хлебопёк хранит на телефоне 10 последних автоматических резервных копий. Все данные можно экспортировать в файл и импортировать из файла, а историю выпечки — экспортировать в CSV. Единицы: граммы и °C или унции и °F.

ПОЛЕЗНО ЗНАТЬ
Хлебопёк работает на iPhone и не синхронизирует данные между устройствами; данные переносятся файлом резервной копии. Без разрешения на уведомления Хлебопёк покажет окончание шага только на открытом экране.

ДОСТУП И ПОКУПКА
Полный доступ даёт месячная или годовая подписка либо разовая пожизненная покупка в App Store. Подписка может начинаться с бесплатного пробного периода (вводное предложение App Store для пользователей, имеющих на него право). Без покупки вы можете просматривать историю выпечки, импортировать файл, а также экспортировать и удалять свои данные.

Языки: 35.
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

Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk ru … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ru/iphone-6.9/01-plan.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ru/iphone-6.3/01-plan.png` | Хлеб готов к нужному вам часу | Обратный план без шагов посреди ночи |
| 2 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ru/iphone-6.9/02-receptura.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ru/iphone-6.3/02-receptura.png` | Граммы каждого ингредиента сразу | Мука и вода из закваски учтены в пекарском проценте |
| 3 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ru/iphone-6.9/03-prowadzenie-ciemny.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ru/iphone-6.3/03-prowadzenie-ciemny.png` | Один шаг за раз | Что сделать, сколько это займёт, и уведомление о конце шага |
| 4 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ru/iphone-6.9/04-doktor.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ru/iphone-6.3/04-doktor.png` | Что улучшить в следующем каравае | Симптомы, причина и одно изменение для следующей выпечки |
| 5 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ru/iphone-6.9/05-zakwasy.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ru/iphone-6.3/05-zakwasy.png` | Закваска всегда готова вовремя | Количества для подкормки и напоминание через 12 часов |
| 6 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ru/iphone-6.9/06-dziennik.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ru/iphone-6.3/06-dziennik.png` | Каждая выпечка записана | Оценка каравая и «Испечь снова» одним касанием |
| 7 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ru/iphone-6.9/07-offline.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ru/iphone-6.3/07-offline.png` | Без аккаунта и без интернета | Без рекламы и слежки; данные только на вашем телефоне |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

| Storefront | Cena ręczna (mies. / rok / dożywotni) | Źródło |
|---|---|---|
| USA (United States), bazowy | 0,99 / 6,99 / 14,99 USD | D-038, docs/wydanie/ceny.json |

Pozostałe storefronty tej karty (2): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Oferta wprowadzająca: Free Trial, 2 Weeks (14 dni) na `com.apps4brew.baker.pro.monthly` i `com.apps4brew.baker.pro.yearly`, wszystkie, w których aplikacja jest dostępna; dożywotni bez oferty (D-038).

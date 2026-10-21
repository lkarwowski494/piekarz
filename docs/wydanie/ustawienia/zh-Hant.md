# Karta ustawień App Store: Chinese (Traditional) (`zh-Hant`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/zh-Hant.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **Chinese (Traditional)**, kod ASC `zh-Hant`; język aplikacji `zh-Hant` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → Chinese (Traditional) (jeśli go nie ma: „Not Localized” → Chinese (Traditional) → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **częściowo** — podpowiedzi sklepu tego kraju bez pełnych liczb ocen konkurencji (docs/wydanie/widocznosc.md §1).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 3 — HKG (Hong Kong), MAC (Macau), TWN (Taiwan)
- Język dodatkowy: 1 — USA (United States)
- Dostępność: wszystkie storefronty tej karty (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

## Pola do skopiowania (pole po polu)

Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.

### Nazwa (Name) · 13 / 30 znaków · App Information

```text
麵包師傅 - 酸種麵包烘焙
```

### Podtytuł (Subtitle) · 12 / 30 znaków · App Information

```text
烘焙百分比計算與發酵計時
```

### Słowa kluczowe (Keywords) · 94 / 100 bajtów (36 znaków) · wersja 1.0

```text
魯邦種,天然酵母,裸麥麵包,水合率,揉麵團,發酵時間,烘焙排程,披薩麵團
```

### Tekst promocyjny (Promotional Text) · 56 / 170 znaków · wersja 1.0

```text
設定麵包完成的時間：麵包師傅 會算出用量、倒推排好時程，並在每個步驟結束時通知你。不需帳號、不需網路、沒有廣告。
```

### Opis (Description) · 1139 / 4000 znaków · wersja 1.0

```text
麵包師傅 帶你完成天然酵母麵包的烘焙，從配方到出爐的麵包：計算用量、排好時程，並在手機休眠時幫你掌握時間。不需帳號、不需網路，沒有廣告，也不追蹤。你的配方、天然酵母起種和日誌只會留在你的手機裡。

配方與用量
從 15 種基礎配方（天然酵母、裸麥、酵母、披薩和甜點）中選一種，或使用你自己的配方。設定麵包數量或麵粉重量，麵包師傅 就會算出麵粉、水、天然酵母起種、鹽和酵母的克數。烘焙百分比會計入天然酵母起種與酵頭中的麵粉和水。麵包師傅 也會依你想要的麵團溫度，算出所需水溫。

從「完成」時間排定時程
選擇麵包要完成的時間，麵包師傅 會倒推出每個步驟的開始時間。發酵時間依廚房溫度而定。當需要你動手的步驟落在夜間（預設為 23:00 到 07:00），麵包師傅 會建議延長冷藏時間。如果時間不夠，會告訴你最早可能的時間。

逐步引導
麵包師傅 會顯示目前步驟：該做什麼、需要多久，以及接下來是什麼。允許通知後，即使手機已鎖定，步驟結束時也會通知你。在需要你動手的步驟中，引導畫面不會關閉。涉及高溫鍋具或生麵團的步驟會附上警告。裸麥麵包（裸麥粉佔麵粉一半以上）有專屬步驟，不需翻面拉摺。不小心確認的步驟可以復原，重新開啟 App 時也會回到目前步驟。

天然酵母起種
你可以同時管理多個天然酵母起種。麵包師傅 會依 1:1:1、1:2:2、1:3:3 或 1:5:5 的比例算出餵養用量。天然酵母起種體積膨脹為兩倍時，麵包師傅 會標示它可以用來做麵團。若在檯面上放置 12 小時未餵養，會以通知提醒你。你也可以一天一天養出新的天然酵母起種。麵包師傅 遵循謹慎原則：只要出現表層覆膜、變色或腐臭味，就會建議你丟掉天然酵母起種。

麵包醫生
內部組織紮實、外皮蒼白？勾選症狀，麵包醫生就會指出 9 種缺陷之一，說明原因，並告訴你下次該調整什麼。當天然酵母起種有讓你擔心的地方，起種醫生會提供協助。

日誌
為每個麵包評分：星等、內部組織、外皮和風味特性。日誌會顯示統計數據，「再烤一次」則會開啟同一份配方。

你的資料
麵包師傅 會在手機中保留最近 10 份自動備份。你可以把所有資料匯出成檔案、從檔案匯入，也能將烘焙紀錄匯出為 CSV。單位：公克與 °C，或盎司與 °F。

小提醒
麵包師傅 在 iPhone 上運作，不會在裝置間同步資料；資料需透過備份檔案轉移。若未允許通知，麵包師傅 只會在畫面開啟時顯示步驟結束。

使用權限與購買
透過 App Store 的月訂閱、年訂閱或一次性終身購買，即可取得完整功能。訂閱可能以免費試用期開始（App Store 為符合資格者提供的首購優惠）。未購買時，你仍可瀏覽烘焙紀錄、匯入檔案，以及匯出和刪除你的資料。

語言：35 種語言。
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

Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk zh-Hant … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/zh-Hant/iphone-6.9/01-plan.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/zh-Hant/iphone-6.3/01-plan.png` | 麵包在你想要的時間出爐 | 倒推時程，深夜不安排步驟 |
| 2 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/zh-Hant/iphone-6.9/02-receptura.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/zh-Hant/iphone-6.3/02-receptura.png` | 每種材料的克數一次算好 | 天然酵母起種中的麵粉和水，皆計入烘焙百分比 |
| 3 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/zh-Hant/iphone-6.9/03-prowadzenie-ciemny.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/zh-Hant/iphone-6.3/03-prowadzenie-ciemny.png` | 一次一個步驟 | 該做什麼、要多久，步驟結束時通知你 |
| 4 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/zh-Hant/iphone-6.9/04-doktor.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/zh-Hant/iphone-6.3/04-doktor.png` | 下一個麵包哪裡可以更好 | 症狀、原因，以及下次烘焙的一項調整 |
| 5 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/zh-Hant/iphone-6.9/05-zakwasy.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/zh-Hant/iphone-6.3/05-zakwasy.png` | 天然酵母起種，準時就緒 | 餵養用量，12 小時後提醒 |
| 6 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/zh-Hant/iphone-6.9/06-dziennik.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/zh-Hant/iphone-6.3/06-dziennik.png` | 每次烘焙都有紀錄 | 為麵包評分，輕點一下「再烤一次」 |
| 7 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/zh-Hant/iphone-6.9/07-offline.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/zh-Hant/iphone-6.3/07-offline.png` | 不需帳號，不需網路 | 無廣告、不追蹤；資料只存在你的手機 |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

| Storefront | Cena ręczna (mies. / rok / dożywotni) | Źródło |
|---|---|---|
| USA (United States), bazowy | 0,99 / 6,99 / 14,99 USD | D-038, docs/wydanie/ceny.json |

Pozostałe storefronty tej karty (3): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Oferta wprowadzająca: Free Trial, 2 Weeks (14 dni) na `com.apps4brew.baker.pro.monthly` i `com.apps4brew.baker.pro.yearly`, wszystkie, w których aplikacja jest dostępna; dożywotni bez oferty (D-038).

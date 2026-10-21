# Karta ustawień App Store: Japanese (`ja`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/ja.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **Japanese**, kod ASC `ja`; język aplikacji `ja` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → Japanese (jeśli go nie ma: „Not Localized” → Japanese → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **częściowo** — podpowiedzi sklepu tego kraju bez pełnych liczb ocen konkurencji (docs/wydanie/widocznosc.md §1).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 1 — JPN (Japan)
- Język dodatkowy: 0 — —
- Dostępność: wszystkie storefronty tej karty (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

## Pola do skopiowania (pole po polu)

Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.

### Nazwa (Name) · 17 / 30 znaków · App Information

```text
パン職人 - サワードウと天然酵母
```

### Podtytuł (Subtitle) · 15 / 30 znaków · App Information

```text
ベーカーズ％計算と発酵タイマー
```

### Słowa kluczowe (Keywords) · 100 / 100 bajtów (38 znaków) · wersja 1.0

```text
パン作り,レシピ,ライ麦,自家製,パン生地,仕込み水,スケジュール,ルヴァン
```

### Tekst promocyjny (Promotional Text) · 79 / 170 znaków · wersja 1.0

```text
パンを仕上げたい時刻を設定するだけ。パン職人が分量を計算し、逆算でプランを立て、各工程の終わりをお知らせします。アカウント不要、インターネット不要、広告なし。
```

### Opis (Description) · 1521 / 4000 znaków · wersja 1.0

```text
パン職人は、サワードウブレッドの焼成を配合からローフまでガイドします。分量を計算し、プランを立て、スマートフォンがスリープ中でも時間を管理します。アカウント不要・インターネット接続不要で動作し、広告もトラッキングもありません。配合、サワー種、焼成記録はすべてお使いのスマートフォンの中だけに保存されます。

配合と分量
15種類の基本配合（サワードウ、ライ麦、イースト、ピザ、甘いパン）またはオリジナルの配合から選びます。ローフの数または粉の重量を設定すると、パン職人が粉・水・サワー種・塩・イーストのグラム数を表示します。ベーカーズパーセントには、サワー種と発酵種に含まれる粉と水も含めて計算します。捏ね上げ目標温度にするための水温も表示します。

「完成」時刻から逆算するプラン
パンを仕上げたい時刻を選ぶと、パン職人が各工程の開始時刻を逆算します。発酵時間はキッチンの室温に応じて変わります。手作業が必要な工程が夜間（初期設定では23:00〜06:30）にかかる場合は、冷蔵庫での時間を長くする案を提示します。時間が足りない場合は、最も早く可能な時刻を表示します。

ステップごとのガイド
パン職人は現在の工程を表示します。何をするか、どれくらいかかるか、次に何をするかがわかります。通知を許可すると、スマートフォンがロック中でも工程の終了をお知らせします。焼成中はガイド画面が消灯しません。熱い器具や生の生地を扱う工程には警告が表示されます。ライ麦パン（粉の半分以上がライ麦粉）には、パンチ / 折りたたみのない専用の工程があります。誤って完了にした工程は元に戻せます。アプリを開き直すと現在の工程に戻ります。

サワー種
複数のサワー種を管理できます。1:1:1、1:2:2、1:3:3、1:5:5の比率で種継ぎの分量を表示します。サワー種が2倍に膨らむと、生地に使える状態としてマークします。種継ぎせずに室温で12時間たつと、通知でお知らせします。新しいサワー種も1日ずつ手順に沿って起こせます。パン職人は慎重を期す原則に従い、表面の膜、変色、腐敗臭がある場合はサワー種を捨てるよう案内します。

パンドクター
クラムが詰まって、クラストの色が薄い？症状にチェックを入れると、パンドクターが9種類の欠点から1つを特定し、原因を説明して、次回変えるべき点を示します。4つのレスキュー手順が、発酵中にトラブルが起きた生地に役立ちます。サワー種の様子が気になるときは、サワー種ドクターが役立ちます。

焼成記録
ローフごとに評価します：星、クラム、クラスト、風味のプロファイル。焼成記録には統計が表示され、「もう一度焼く」で同じ配合を開きます。

データについて
パン職人は直近10件の自動バックアップをスマートフォン内に保持します。すべてのデータをファイルに書き出したり、ファイルから読み込んだりできます。焼成履歴はCSVで書き出せます。単位：グラムと°C、またはオンスと°F。

知っておきたいこと
パン職人はiPhoneで動作し、デバイス間でデータを同期しません。データはバックアップファイルで移行します。通知を許可しない場合、工程の終了はアプリの画面を開いているときだけ表示されます。

利用と購入
フルアクセスには、App Storeでの月額または年額のサブスクリプション、または1回限りの買い切り購入が必要です。サブスクリプションは無料トライアルから始まる場合があります（対象者向けのApp Store導入オファー）。購入しなくても、焼成履歴の閲覧、ファイルの読み込み、データの書き出しと削除ができます。

言語：35言語。
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

Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk ja … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ja/iphone-6.9/01-plan.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ja/iphone-6.3/01-plan.png` | 決めた時刻にパンが完成 | 逆算プランで、真夜中の作業はなし |
| 2 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ja/iphone-6.9/02-receptura.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ja/iphone-6.3/02-receptura.png` | 材料ごとのグラム数をすぐ表示 | サワー種の粉と水もベーカーズパーセントに算入 |
| 3 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ja/iphone-6.9/03-prowadzenie-ciemny.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ja/iphone-6.3/03-prowadzenie-ciemny.png` | 一度にひとつの工程 | やること・所要時間・工程終了の通知 |
| 4 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ja/iphone-6.9/04-doktor.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ja/iphone-6.3/04-doktor.png` | 次のローフで改善すべき点 | 症状、原因、次回の焼成で変えるひとつのこと |
| 5 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ja/iphone-6.9/05-zakwasy.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ja/iphone-6.3/05-zakwasy.png` | サワー種をいつも時間どおりに | 種継ぎの分量と12時間後のリマインダー |
| 6 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ja/iphone-6.9/06-dziennik.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ja/iphone-6.3/06-dziennik.png` | すべての焼成を記録 | ローフを評価、「もう一度焼く」をワンタップで |
| 7 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ja/iphone-6.9/07-offline.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ja/iphone-6.3/07-offline.png` | アカウントもネットも不要 | 広告もトラッキングもなし。データはスマートフォンの中だけ |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

Pozostałe storefronty tej karty (1): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Oferta wprowadzająca: Free Trial, 2 Weeks (14 dni) na `com.apps4brew.baker.pro.monthly` i `com.apps4brew.baker.pro.yearly`, wszystkie, w których aplikacja jest dostępna; dożywotni bez oferty (D-038).

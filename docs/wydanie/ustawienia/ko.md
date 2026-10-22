# Karta ustawień App Store: Korean (`ko`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/ko.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **Korean**, kod ASC `ko`; język aplikacji `ko` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → Korean (jeśli go nie ma: „Not Localized” → Korean → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **częściowo** — podpowiedzi sklepu tego kraju bez pełnych liczb ocen konkurencji (docs/wydanie/widocznosc.md §1).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 1 — KOR (Republic of Korea)
- Język dodatkowy: 1 — USA (United States)
- Dostępność: wszystkie storefronty tej karty (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

## Pola do skopiowania (pole po polu)

Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.

### Nazwa (Name) · 16 / 30 znaków · App Information

```text
제빵사 - 사워도우 빵 만들기
```

### Podtytuł (Subtitle) · 15 / 30 znaków · App Information

```text
베이커스 퍼센트·발효 타이머
```

### Słowa kluczowe (Keywords) · 91 / 100 bajtów (35 znaków) · wersja 1.0

```text
홈베이킹,레시피,천연발효종,르방종,호밀빵,빵반죽,수분율,발효온도
```

### Tekst promocyjny (Promotional Text) · 81 / 170 znaków · wersja 1.0

```text
빵이 완성될 시간을 정하세요. 제빵사가 분량을 계산하고 일정을 역산해 짜고, 각 단계가 끝나면 알려 드려요. 계정, 인터넷, 광고 없이 사용해요.
```

### Opis (Description) · 1744 / 4000 znaków · wersja 1.0

```text
제빵사는 배합표부터 빵 덩어리까지 사워도우 빵 베이킹 과정을 안내해요. 분량을 계산하고, 계획을 세우고, 휴대폰이 잠들어 있을 때도 시간을 챙겨요. 계정 없이, 인터넷 없이 작동하며 광고도 추적도 없어요. 배합표, 스타터, 일지는 휴대폰에만 저장돼요.

배합표와 분량
15가지 기본 배합표(사워도우, 호밀, 이스트, 피자, 단과자) 중 하나 또는 직접 만든 배합표를 선택해요. 빵 덩어리 수나 가루 무게를 설정하면 제빵사가 가루, 물, 사워도우 스타터, 소금, 이스트의 그램 수를 알려 줘요. 베이커스 퍼센트에는 스타터와 발효종에 들어 있는 가루와 물도 반영돼요. 원하는 반죽 온도에 맞는 물 온도도 알려 줘요.

‘완성’ 시간부터 세우는 계획
빵이 완성될 시간을 선택하면 제빵사가 각 단계의 시작 시간을 역산해요. 발효 시간은 주방 온도에 따라 달라져요. 손이 필요한 단계가 밤(기본값 23:00부터 07:00 사이)에 걸리면 제빵사가 냉장고에서 더 오래 두는 방법을 제안해요. 시간이 부족하면 가능한 가장 이른 시간을 알려 줘요.

단계별 안내
제빵사가 현재 단계를 보여 줘요. 무엇을 할지, 얼마나 걸리는지, 다음은 무엇인지 알 수 있어요. 알림을 허용하면 휴대폰이 잠겨 있어도 단계가 끝날 때 알려 줘요. 손이 필요한 단계에서는 안내 화면이 꺼지지 않아요. 뜨거운 용기나 생반죽을 다루는 단계에는 경고가 표시돼요. 호밀빵(가루의 절반 이상이 호밀가루)은 늘려접기 없는 별도 단계로 진행돼요. 실수로 완료한 단계는 되돌릴 수 있고, 앱을 다시 열면 현재 단계로 돌아가요.

스타터
여러 개의 스타터를 관리할 수 있어요. 제빵사가 1:1:1, 1:2:2, 1:3:3 또는 1:5:5 비율의 먹이 주기 분량을 알려 줘요. 스타터의 부피가 두 배가 되면 제빵사가 반죽에 쓸 준비가 됐다고 표시해요. 먹이 주기 없이 조리대 위에서 12시간이 지나면 알림으로 알려 줘요. 새 스타터는 하루하루 단계별로 만들 수 있어요. 제빵사는 예방 원칙을 따라요. 표면 막, 변색 또는 썩은 냄새가 있으면 스타터를 버리라고 권해요.

빵 닥터
속살(크럼)이 빽빽하고 껍질이 창백한가요? 증상을 선택하면 빵 닥터가 9가지 결함 중 하나를 짚어 원인을 설명하고 다음에 무엇을 바꿀지 알려 줘요. 발효 중 반죽에 문제가 생기면 4가지 응급 프로토콜이 도움이 돼요. 스타터에 걱정되는 점이 있을 때는 스타터 닥터가 도와줘요.

일지
빵 덩어리마다 별점, 속살, 껍질, 풍미 프로필을 평가해요. 일지에서 통계를 볼 수 있고, ‘다시 굽기’를 누르면 같은 배합표가 열려요.

데이터
제빵사는 최근 자동 백업 10개를 휴대폰에 보관해요. 모든 데이터를 파일로 내보내고 파일에서 가져올 수 있으며, 베이킹 기록은 CSV로 내보낼 수 있어요. 단위: 그램과 °C 또는 온스와 °F.

알아 두세요
제빵사는 iPhone에서 작동하며 기기 간에 데이터를 동기화하지 않아요. 데이터는 백업 파일로 옮겨요. 알림을 허용하지 않으면 단계 종료는 앱 화면이 열려 있을 때만 표시돼요.

이용 및 구매
월간 또는 연간 구독, 또는 App Store의 1회성 평생 구매로 모든 기능을 이용할 수 있어요. 구독은 무료 체험 기간으로 시작될 수 있어요(자격이 있는 사용자 대상 App Store 첫 구매 혜택). 구매하지 않아도 베이킹 기록 보기, 파일 가져오기, 데이터 내보내기 및 삭제는 가능해요.
이용 약관 (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/

언어: 35개 언어.
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

Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk ko … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ko/iphone-6.9/01-plan.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ko/iphone-6.3/01-plan.png` | 원하는 시간에 완성되는 빵 | 역산 일정으로 한밤중 작업 없이 |
| 2 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ko/iphone-6.9/02-receptura.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ko/iphone-6.3/02-receptura.png` | 모든 재료의 그램 수를 바로 | 스타터 속 가루와 물까지 베이커스 퍼센트에 반영 |
| 3 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ko/iphone-6.9/03-prowadzenie-ciemny.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ko/iphone-6.3/03-prowadzenie-ciemny.png` | 한 번에 한 단계씩 | 할 일, 소요 시간, 단계 종료 알림 |
| 4 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ko/iphone-6.9/04-doktor.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ko/iphone-6.3/04-doktor.png` | 다음 빵 덩어리에서 고칠 점 | 증상, 원인, 다음 베이킹을 위한 한 가지 변화 |
| 5 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ko/iphone-6.9/05-zakwasy.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ko/iphone-6.3/05-zakwasy.png` | 언제나 제때 준비되는 스타터 | 먹이 주기 분량과 12시간 후 알림 |
| 6 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ko/iphone-6.9/06-dziennik.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ko/iphone-6.3/06-dziennik.png` | 모든 베이킹을 기록 | 빵 평가와 탭 한 번으로 ‘다시 굽기’ |
| 7 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ko/iphone-6.9/07-offline.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/ko/iphone-6.3/07-offline.png` | 계정도 인터넷도 필요 없어요 | 광고·추적 없음, 데이터는 휴대폰에만 저장 |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

| Storefront | Cena ręczna (mies. / rok / dożywotni) | Źródło |
|---|---|---|
| USA (United States), bazowy | 0,99 / 6,99 / 14,99 USD | D-038, docs/wydanie/ceny.json |

Pozostałe storefronty tej karty (1): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Bez oferty wprowadzającej na `com.apps4brew.baker.pro.monthly`, `com.apps4brew.baker.pro.yearly` i `com.apps4brew.baker.pro.lifetime` (D-112): ofertę z D-038 usuwa M1 w App Store Connect razem z buildem Basic/Pro (Z-1, instrukcja §4).

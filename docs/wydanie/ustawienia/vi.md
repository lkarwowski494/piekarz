# Karta ustawień App Store: Vietnamese (`vi`)

> Plik generowany: `npm run karty:ustawien` (scripts/karty-ustawien.mjs) z `docs/wydanie/metadane/vi.json`, `docs/wydanie/storefronty.json`, `docs/wydanie/ceny.json` i `src/lib/links.ts`. Nie edytuj ręcznie: popraw źródło i wygeneruj ponownie. Kolejność całej konfiguracji: `docs/wydanie/instrukcja-ustawien.md` [M1-audytor-generalny-119].

## Gdzie to wpisać

- Lokalizacja App Store Connect: **Vietnamese**, kod ASC `vi`; język aplikacji `vi` (status released w `src/lib/i18n-locales.ts`, reguła prawdy D-054).
- Apps → Piekarz → menu języka w prawym górnym rogu → Vietnamese (jeśli go nie ma: „Not Localized” → Vietnamese → (+)). Pola „App Information” (nazwa, podtytuł, Privacy Policy URL) wpisz na stronie App Information, pola wersji (słowa kluczowe, tekst promocyjny, opis, Support URL, zrzuty) na stronie wersji iOS 1.0 w tym samym języku (Apple, „Localize app information”).
- Status pomiaru: **hipoteza** — brak lokalnego sygnału; sprawdzenie po wydaniu w App Analytics (docs/wydanie/widocznosc.md §1).

## Storefronty, które pokazują tę lokalizację

Mapa: tabela Apple „App Store localizations” (odczyt 2026-10-21), `docs/wydanie/storefronty.json`. Jak Apple wybiera między językiem domyślnym a dodatkowym dla konkretnego użytkownika, strony nie mówią `[DO USTALENIA]`.

- Język domyślny: 0 — —
- Język dodatkowy: 2 — USA (United States), VNM (Vietnam)
- Dostępność: wszystkie storefronty tej karty (Pricing and Availability → „Specific Countries or Regions”: 174 storefronty bez CHN, D-057 warunkowa).

## Pola do skopiowania (pole po polu)

Liczniki: znaki w punktach kodowych (sposób liczenia Apple `[DO USTALENIA]`), słowa kluczowe w bajtach UTF-8; limity z App Store Connect Help, odczyt 2026-10-21. Kopiuj zawartość bloku bez znaczników ```.

### Nazwa (Name) · 22 / 30 znaków · App Information

```text
Thợ Bánh Mì: Sourdough
```

### Podtytuł (Subtitle) · 26 / 30 znaków · App Information

```text
Tính công thức & hẹn giờ ủ
```

### Słowa kluczowe (Keywords) · 76 / 100 bajtów (61 znaków) · wersja 1.0

```text
men tự nhiên,nướng,lên men,lúa mạch đen,lịch,pizza,levain,bột
```

### Tekst promocyjny (Promotional Text) · 167 / 170 znaków · wersja 1.0

```text
Đặt giờ bạn muốn bánh xong: Thợ Bánh Mì sẽ tính lượng nguyên liệu, lập lịch trình ngược và báo khi mỗi bước kết thúc. Không tài khoản, không internet, không quảng cáo.
```

### Opis (Description) · 3424 / 4000 znaków · wersja 1.0

```text
Thợ Bánh Mì đồng hành cùng bạn khi nướng bánh mì men tự nhiên, từ công thức đến ổ bánh: tính lượng nguyên liệu, lập kế hoạch và canh giờ cả khi điện thoại đang ngủ. Ứng dụng hoạt động không cần tài khoản, không cần internet, không quảng cáo và không theo dõi. Công thức, men tự nhiên và nhật ký của bạn chỉ được lưu trên điện thoại của bạn.

CÔNG THỨC VÀ LƯỢNG NGUYÊN LIỆU
Chọn một trong 15 công thức cơ bản (bánh mì men tự nhiên, lúa mạch đen, men nở, pizza và bánh ngọt) hoặc công thức của riêng bạn. Đặt số ổ bánh hoặc khối lượng bột mì, Thợ Bánh Mì sẽ cho biết số gam bột mì, nước, men tự nhiên, muối và men nở. Tỷ lệ thợ làm bánh tính cả bột mì và nước trong men tự nhiên và trong bột men. Thợ Bánh Mì cũng cho biết nhiệt độ nước để đạt được nhiệt độ bột mà bạn muốn.

KẾ HOẠCH TÍNH TỪ GIỜ “XONG”
Chọn thời điểm bánh cần xong, Thợ Bánh Mì sẽ tính ngược giờ bắt đầu của từng bước. Thời gian lên men phụ thuộc vào nhiệt độ trong bếp. Khi một bước cần bạn trực tiếp làm rơi vào ban đêm (mặc định từ 23:00 đến 07:00), Thợ Bánh Mì sẽ đề xuất để trong tủ lạnh lâu hơn. Khi không đủ thời gian, Thợ Bánh Mì sẽ cho biết giờ sớm nhất có thể.

HƯỚNG DẪN TỪNG BƯỚC
Thợ Bánh Mì hiển thị bước hiện tại: cần làm gì, mất bao lâu và bước tiếp theo là gì. Nếu bạn cho phép thông báo, Thợ Bánh Mì sẽ báo khi một bước kết thúc, kể cả khi điện thoại đang khóa. Ở bước cần bạn trực tiếp làm, màn hình hướng dẫn không tắt. Các bước có đồ nấu nóng hoặc bột sống đều có cảnh báo. Bánh mì lúa mạch đen (hơn một nửa lượng bột là bột lúa mạch đen) có các bước riêng, không gấp bột. Bạn có thể hoàn tác bước đã xác nhận nhầm, và khi mở lại, ứng dụng sẽ quay về bước hiện tại.

MEN TỰ NHIÊN
Quản lý nhiều men tự nhiên cùng lúc. Thợ Bánh Mì cho biết lượng cho men ăn theo tỷ lệ 1:1:1, 1:2:2, 1:3:3 hoặc 1:5:5. Khi men tự nhiên nở gấp đôi thể tích, Thợ Bánh Mì sẽ đánh dấu men đã sẵn sàng để làm bột. Sau 12 giờ để trên bàn bếp mà chưa cho ăn, Thợ Bánh Mì sẽ gửi thông báo nhắc bạn. Bạn có thể tạo men tự nhiên mới theo từng ngày. Thợ Bánh Mì áp dụng nguyên tắc thận trọng: khi có lớp phủ, đổi màu hoặc mùi thối, Thợ Bánh Mì khuyên bạn bỏ men tự nhiên đi.

BÁC SĨ BÁNH MÌ
Ruột bánh đặc, vỏ bánh nhợt màu? Đánh dấu các triệu chứng, Bác sĩ Bánh mì sẽ chỉ ra một trong 9 lỗi, giải thích nguyên nhân và cho biết cần thay đổi gì vào lần sau. Bác sĩ Men tự nhiên giúp bạn khi có điều gì ở men tự nhiên khiến bạn lo lắng.

NHẬT KÝ
Đánh giá từng ổ bánh: số sao, ruột bánh, vỏ bánh và hương vị. Nhật ký hiển thị thống kê, còn “Nướng lại” mở lại đúng công thức đó.

DỮ LIỆU CỦA BẠN
Thợ Bánh Mì lưu 10 bản sao lưu tự động gần nhất trên điện thoại. Bạn có thể xuất toàn bộ dữ liệu ra tệp và nhập lại từ tệp, còn lịch sử nướng bánh có thể xuất dạng CSV. Đơn vị: gam và °C hoặc ounce và °F.

CẦN BIẾT
Thợ Bánh Mì chạy trên iPhone và không đồng bộ dữ liệu giữa các thiết bị; bạn chuyển dữ liệu bằng tệp sao lưu. Nếu không cho phép thông báo, Thợ Bánh Mì chỉ báo kết thúc bước khi màn hình đang mở.

QUYỀN TRUY CẬP VÀ MUA
Quyền truy cập đầy đủ có được qua gói đăng ký theo tháng hoặc theo năm, hoặc mua một lần trọn đời trên App Store. Gói đăng ký có thể bắt đầu bằng thời gian dùng thử miễn phí (ưu đãi giới thiệu của App Store dành cho người dùng đủ điều kiện). Khi chưa mua, bạn vẫn có thể xem lịch sử nướng bánh, nhập tệp, cũng như xuất và xóa dữ liệu của mình.
Terms of Use (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/

Ngôn ngữ: 35.
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

Pliki lokalnie u właściciela, poza gitem (ścieżka względem katalogu repo). Brak plików: wygeneruj według `docs/wydanie/zrzuty/README.md` („Jak powstają”, `node generuj.mjs --jezyk vi … --wyjscie <katalog>`). Przeciągnij do „Previews and Screenshots” w kolejności 1–7, osobno dla każdej klasy.

| Nr | iPhone 6,9″ (1320 × 2868) | iPhone 6,3″ (1206 × 2622), wymagana | Nagłówek | Podtytuł |
|---|---|---|---|---|
| 1 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/vi/iphone-6.9/01-plan.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/vi/iphone-6.3/01-plan.png` | Bánh mì xong đúng giờ của bạn | Lịch trình ngược, không có bước nào giữa đêm |
| 2 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/vi/iphone-6.9/02-receptura.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/vi/iphone-6.3/02-receptura.png` | Có ngay số gam từng nguyên liệu | Bột mì và nước trong men tự nhiên được tính vào tỷ lệ thợ làm bánh |
| 3 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/vi/iphone-6.9/03-prowadzenie-ciemny.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/vi/iphone-6.3/03-prowadzenie-ciemny.png` | Từng bước một | Cần làm gì, mất bao lâu và thông báo khi bước kết thúc |
| 4 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/vi/iphone-6.9/04-doktor.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/vi/iphone-6.3/04-doktor.png` | Sửa gì cho ổ bánh sau | Triệu chứng, nguyên nhân và một thay đổi cho mẻ bánh sau |
| 5 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/vi/iphone-6.9/05-zakwasy.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/vi/iphone-6.3/05-zakwasy.png` | Men tự nhiên luôn sẵn sàng đúng lúc | Lượng cho men ăn và lời nhắc sau 12 giờ |
| 6 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/vi/iphone-6.9/06-dziennik.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/vi/iphone-6.3/06-dziennik.png` | Mọi mẻ bánh đều được lưu lại | Đánh giá ổ bánh và “Nướng lại” chỉ với một chạm |
| 7 | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/vi/iphone-6.9/07-offline.png` | `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/vi/iphone-6.3/07-offline.png` | Không tài khoản, không internet | Không quảng cáo, không theo dõi; dữ liệu chỉ trên điện thoại bạn |

## Ceny i oferta w storefrontach tej karty

Produkty (`src/lib/platnosci/konfiguracja.ts`): `com.apps4brew.baker.pro.monthly` / `com.apps4brew.baker.pro.yearly` / `com.apps4brew.baker.pro.lifetime` (miesięczny / roczny / dożywotni). Cena bazowa: 0,99 / 6,99 / 14,99 USD (storefront USA, D-038).

| Storefront | Cena ręczna (mies. / rok / dożywotni) | Źródło |
|---|---|---|
| USA (United States), bazowy | 0,99 / 6,99 / 14,99 USD | D-038, docs/wydanie/ceny.json |

Pozostałe storefronty tej karty (1): cena automatycznie od ceny bazowej USD — zostaw ceny, które App Store Connect proponuje („comparable prices”), bez zmian (Apple, „Set a price for an In-App Purchase” i „Manage pricing for auto-renewable subscriptions”, odczyt 2026-10-21).

Oferta wprowadzająca: Free Trial, 2 Weeks (14 dni) na `com.apps4brew.baker.pro.monthly` i `com.apps4brew.baker.pro.yearly`, wszystkie, w których aplikacja jest dostępna; dożywotni bez oferty (D-038).

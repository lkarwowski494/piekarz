# Wzrost — Piekarz (Crust) — 2026-10-20

Rola 11 (Wzrost), tryb fix. Zastępuje plan marketingu z BRD 0.1 (`docs/brd/A4.md`, rozdz. 15.1; na gałęzi roli 03 w archiwum BRD). Plan wydania i dziennik są w `docs/wydanie/` (rola 10); tu ich nie powtarzam. Każde działanie zewnętrzne (wpis, wiadomość, odpowiedź na recenzję, kod w App Store Connect) wykonuje właściciel po osobnej zgodzie, wpisanej jego słowami do dziennika działań (sekcja „Lista startowa”).

*Dlaczego jeden dokument:* plan, który właściciel wykonuje sam w małym budżecie czasu, ma się mieścić na jednej stronie i mieć regułę przy każdym kanale.

## Budżet i horyzont

- Budżet godzin tygodniowo: `[DO USTALENIA: decyzja właściciela]`. Do decyzji plan ma najwyżej 3 działania naraz (zasada roli 1).
- Horyzont: eksperyment 90 dni od wydania (D-040, kryterium w `docs/monetyzacja.md` roli 02); data wydania z `docs/wydanie/dziennik.md`.
- Reklamy płatne: nie. Opcja tylko decyzją właściciela z kosztem, rachunkiem 02 i ADR prywatności (zasada roli 9, CLAUDE.md: zero telemetrii).

## Pozycjonowanie

Dla kogo, jaka praca i różnica: z kontraktu zakresu (`docs/scope-contract.md`, wariant B, D-043) i BRD roli 01; ten plik nie dodaje twierdzeń. Wpis o aplikacji mówi tylko o tym, co robi wydana wersja (WZR-01), fakty dziedzinowe z rejestru treści (`docs/tresci/rejestr.json`, rola 06), ograniczenia jawnie: tylko iPhone, PL i EN, 14 dni pełnej wersji, potem płatnie albo tylko historia i dane (D-038).

Przykład z BRD 0.1 („Apple Watch Double Tap”, `docs/brd/A4.md:29`) nie wchodzi do wpisów, dopóki kontrakt zakresu nie pokaże tej funkcji w wersji 1 `[DO USTALENIA]`.

## Jawność i prawo (zasady dla każdego wpisu i współpracy)

| Zasada | Źródło (odczyt) | Cytat |
|---|---|---|
| Wpis właściciela o własnej aplikacji to autopromocja i wymaga oznaczenia | Rekomendacje Prezesa UOKiK dotyczące oznaczania treści reklamowych przez influencerów, Warszawa 2022, s. 13 (uokik.gov.pl/download/26685, PDF, odczyt 2026-10-20) | „Autopromocja jako reklama również wymaga oznaczenia.” |
| Korzyść w formie produktu, zniżki albo vouchera czyni treść twórcy komercyjną | tamże, s. 6 | „Nie ma znaczenia w jakiej formie influencer otrzymuje korzyść materialną dla uznania treści jako komercyjnej.” |
| Oznaczenie dwupoziomowe | tamże, s. 16 | „Rekomendujemy dwupoziomowe oznaczanie, czyli skorzystanie zarówno z funkcjonalności platformy, jak i oznaczenia we własnym zakresie” |
| Słowa: #reklama, [materiał reklamowy], #autopromocja; marka wskazana | tamże, s. 16–17 | „Influencer powinien również poinformować, jaką markę reklamuje.” |
| „#współpraca” i skróty (#ad, #promo) są niejednoznaczne | tamże, s. 18 (lista „Nierekomendowane określenia”) | „z użyciem niejednoznacznych określeń, niewskazujących na komercyjny charakter treści np. współpraca.” |
| Udział w społeczności autentycznie, bez spamu; formę autopromocji ustala regulamin danej społeczności | Reddit Rules, Rule 2 (redditinc.com/policies/reddit-rules, odczyt 2026-10-20) | „Participate authentically in communities where you have a personal interest, and do not spam” |
| Udawanie konsumenta i nieprawdziwe opinie zakazane | dyrektywa 2005/29/WE zał. I pkt 22, 23c; UPNPR art. 7 pkt 22, 26 (moduł roli 11 `kanaly-i-start`, odczyt 2026-10-18, dziś nie powtórzony) | — |
| Informacja handlowa e-mailem lub komunikatorem tylko za uprzednią zgodą adresata | Prawo komunikacji elektronicznej art. 398 ust. 1 (moduł, odczyt 2026-10-18); czy adres „do współpracy” jest zgodą, `[DO USTALENIA]` | — |
| Zasady oznaczania dla odbiorców w USA (FTC) | `[DO USTALENIA]`: ftc.gov odpowiedział 404 na pobranie 2026-10-20; do odczytu przez właściciela w przeglądarce przed pierwszym wpisem po angielsku | — |

Reguły wykonania (*dlaczego:* wpisu w obcej społeczności nie da się cofnąć, a ukryta reklama to praktyka zakazana):
1. Każdy wpis właściciela zaczyna się od „Jestem autorem tej aplikacji” i ma oznaczenie `#autopromocja` (albo `[autopromocja]`) na początku, w języku wpisu.
2. Twórca, który dostaje darmowy albo tańszy dostęp, oznacza materiał `#reklama` / `[materiał reklamowy]` z nazwą „Piekarz (Crust)” na początku opisu i funkcją platformy do oznaczania (dwupoziomowo). Nie „#współpraca”. Właściciel prosi o to w pierwszej wiadomości i zapisuje prośbę w dzienniku.
3. Kod nie jest warunkowany recenzją, oceną ani pozytywną opinią (5.6.3 i 3.2.2(x) w module roli 11; sekcja 3 wytycznych „paid, incentivized, filtered, or fake feedback”).
4. Komplement w wiadomości do twórcy tylko taki, który właściciel może poświadczyć; jedna wiadomość, bez ponagleń.
5. Bez kont-figurantów, próśb o głosy i zamówionych opinii.

## Kody App Store (istniejący mechanizm)

Piekarz to aplikacja bezpłatna do pobrania z subskrypcjami i zakupem dożywotnim (D-038), więc mechanizmem są **kody ofert**, nie kody promocyjne.

| Mechanizm | Dla czego | Źródło (odczyt 2026-10-20, surowy tekst) | Cytat |
|---|---|---|---|
| Kody ofert dla zakupów w aplikacji (dożywotni) | Non-Consumable 14,99 USD | developer.apple.com/help/app-store-connect/manage-in-app-purchases/create-offer-codes-for-in-app-purchases | „Offer codes provide a way to acquire, retain, and win back customers by offering discounted or free access to In-App Purchases.”; „Each app can have up to 10 active offers at a time, with a limit of 1 million codes per app, per quarter.” |
| Warunek generowania | — | tamże | „to generate custom or unique offer codes, your app must be Ready for Distribution” |
| Kody ofert dla subskrypcji | miesięczna i roczna | developer.apple.com/help/app-store-connect/manage-subscriptions/set-up-subscription-offer-codes | „you can set up offer codes to provide people with a free or discounted price for a specific duration” |
| Kody promocyjne | tylko aplikacje płatne; **nie dotyczy** | developer.apple.com/help/app-store-connect/offer-promo-codes/request-and-manage-promo-codes | „Promo codes offer potential App Store customers or reviewers a free copy of apps”; „customers can’t rate or review the app.” |

Zasady: kody to narzędzie marketingu, nie zmiana modelu płatności (D-038 bez zmian). Rodzaj oferty, okres i liczbę kodów dla danej współpracy ustala właściciel w ramach D-038; utworzenie oferty w App Store Connect i wysłanie kodu to kroki właściciela, każdy za osobną zgodą. Czy aplikacja obsługuje wpisanie kodu w aplikacji, sprawdza rola 08 (bez tego kod realizuje się w App Store przez adres realizacji) `[DO USTALENIA]`.

## Kanały

Kanał wchodzi na listę startową dopiero po odczycie jego regulaminu z cytatem i datą (zasada roli 2). Stan 2026-10-20:

| Kanał (adres) | Dowód niszy | Reguła (cytat, data) | Forma dozwolona | Godziny | Decyzja |
|---|---|---|---|---|---|
| r/Sourdough (reddit.com/r/Sourdough) | z BRD 0.1, bez wątków z datą `[DO USTALENIA]` | regulamin społeczności nieodczytany: `reddit.com/r/Sourdough/about/rules.json` zwrócił 403 (2026-10-20) | `[DO USTALENIA]` | — | nie wchodzi do odczytu regulaminu |
| r/Breadit (reddit.com/r/Breadit) | jak wyżej | 403 (2026-10-20) | `[DO USTALENIA]` | — | nie wchodzi do odczytu regulaminu |
| r/Pizza (reddit.com/r/Pizza) | jak wyżej | nieodczytany | `[DO USTALENIA]` | — | nie wchodzi do odczytu regulaminu |
| Polskie grupy piekarskie na Facebooku (nazwy z BRD 0.1) | jak wyżej | regulaminy grup wymagają logowania | `[DO USTALENIA]` | — | nie wchodzi do odczytu regulaminu |
| Twórcy niszy (Instagram, YouTube, TikTok) | `[DO USTALENIA]` | oznaczanie według sekcji „Jawność i prawo”; regulamin platformy do odczytu | materiał oznaczony `#reklama` + marka, dwupoziomowo | — | po wydaniu, kilka osób, nie lista do wysyłki |
| Strona produktu i odpowiedzi na recenzje | App Store | rola 10 (WYD-06), odpowiedzi rzeczowe, bez danych osobowych i marketingu (5.6.1 w module) | — | — | domyślnie zawsze |

Krok właściciela (ok. 1–2 h): zalogowany odczyt regulaminów r/Sourdough, r/Breadit, r/Pizza i wybranych grup; do tabeli wklejasz adres, datę i zdanie o autopromocji. Rola 11 w trybie build wybiera wtedy jeden kanał na start (rekomendacja z audytu 11-wzrost-006, opcja a).

## Lista startowa

| Krok | Kanał (adres) | Szkic (miejsce poza repo) | Link kampanii `ct=` | Kto publikuje | Zgoda (słowa, data) | Wynik (adres, data) |
|---|---|---|---|---|---|---|

Pusta do wydania i do odczytu regulaminów. Link kampanii tylko z `pt` z App Store Connect („You can't create one manually”, moduł `pomiar-prywatny`); bez `pt` wpis bez linku kampanii.

Szkic wpisu (forma, nie treść): „Jestem autorem tej aplikacji. #autopromocja <praca, którą wykonuje, słowami społeczności>. Co robi: <2–3 punkty z wydanej wersji>. Ograniczenia: tylko iPhone, PL i EN, 14 dni pełnej wersji, potem płatnie. Prywatność: <tylko to, co potwierdza inwentarz 05 i etykieta 10>. Proszę o uwagi, zwłaszcza krytyczne.”

## Powrót i opinie

Pętla opinii F-69 (BR-OPIN-001…003): `docs/wzrost/petla-opinii.md` (zadania 082, 083). Odpowiedzi na recenzje: rzeczowo, bez danych osobowych recenzenta i marketingu; zgłoszony błąd trafia do zgłoszeń albo ER/ZM.

## Pomiar

Źródła bez SDK: App Store Connect (sprzedaż, App Analytics, recenzje), zgłoszenia od użytkowników. W aplikacji nie ma telemetrii (CLAUDE.md); liczniki na urządzeniu służą tylko warunkowi prośby o ocenę i nie wychodzą z telefonu.

| H | Pytanie (decyzja, od której zależy) | Metryka i źródło | Mierzalność: oczekiwane n, zastępnik | Próg (ID decyzji) | Min. próba | Data oceny | Werdykt |
|---|---|---|---|---|---|---|---|
| H-01 | Czy DEC-01 d osiąga próg 500 USD netto/rok na iOS? (rozwój albo zamrożenie, D-040) | nowi płacący iOS ÷ pobrania pierwszorazowe iOS w dniach 30–90; App Store Connect | ok. 166 pobrań [OCENA: 83/mies. z bramki roli 02]; zastępnik: liczby bezwzględne z kryterium | **kryterium:** średnio ≥ 7 nowych płacących/mies. albo ≥ 42 USD/mies.; zamrożenie przy ≤ 3,5 albo ≤ 21 USD/mies. (D-038, `docs/monetyzacja.md` roli 02); w skrypcie ≥ 8,5% | 100 pobrań (propozycja roli 11, do potwierdzenia) | wydanie + 90 dni (najwcześniej 2027-01-19) | czeka na dane |

Dane: `docs/wzrost/hipotezy.json`, skrypt `docs/wzrost/hipotezy.mjs` (`node docs/wzrost/hipotezy.mjs docs/wzrost/hipotezy.json`, kod 0; test `tests/wzrost-hipotezy.test.ts`). Zmierzone wartości (`dane`) wpisuje się w kopii lokalnej, poza publicznym repo.

Reguła rozstrzygania H-01 (*dlaczego dwie miary:* kryterium roli 02 jest liczbą płacących i wpływem, a `hipotezy.mjs` liczy odsetek z przedziałem Wilsona):
1. Rozstrzyga **kryterium liczbowe** z `docs/monetyzacja.md`: ≥ 7 płacących/mies. albo ≥ 42 USD/mies. → próg osiągnięty; ≤ 3,5 albo ≤ 21 USD/mies. → zamrożenie rozwoju; pomiędzy → wynik pośredni, decyzja właściciela.
2. Odsetek w skrypcie (≥ 8,5%, czyli 7 ÷ ok. 83 pobrań/mies.) jest pomocniczy: mówi, czy problemem jest konwersja, czy liczba pobrań. Przy innej liczbie pobrań niż w bramce rozstrzyga punkt 1.
3. Kryterium mierzy model, nie otwiera go: wynik nie jest podstawą do zmiany cen, modelu, próby ani podziału (D-038).

KPI z BRD 0.1 (`docs/brd/A4.md:13-17`: „≥ 4,8 ★”, „≥ 42%”, „30–45%”, „≥ 99,8%”, „≥ 65%”) oraz prognozy z `docs/monetyzacja-audyt.md` (55 000 pobrań, CAC, retencja 6,7 mies.) nie mają źródła ani ID decyzji: **nie są celami** i żadna decyzja na nich nie stoi. Każda z tych liczb może wrócić jako H-nn z progiem i minimalną próbą od właściciela; aktywnych H najwyżej 3.
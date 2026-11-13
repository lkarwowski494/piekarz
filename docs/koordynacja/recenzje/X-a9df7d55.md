# Recenzja niezależna — ASC API v2 (zasoby wersji), rola 10-wydanie audit

Zakres: `git diff a6eb5144 a9df7d55` (gałąź naprawy/M2-koordynator-napraw-2026-11-13-asc-v2). Raportu autora nie czytano; notatki `docs/wydanie/asc-api-v2-zrodla.md` porównano ze źródłem. Zero wywołań App Store Connect API.

## Werdykt

**PRZYJĄĆ z uwagami (brak P0, brak P1).** Ścieżki, typy zasobów, relacje i pola zgadzają się z OpenAPI Apple 4.6 i z notatkami 4.4.1. Tworzenie wersji jest w planie i w skrócie zgody. Zabezpieczenia (sucho, zgoda, skrót) nie zostały osłabione. Testy są czerwone na starym kodzie i wychwytują mutacje. Zostają 4 uwagi P2.

## (1) Zgodność z Apple — SPRAWDZONE U ŹRÓDŁA

Źródła pobrane samodzielnie 2026-11-13:
- `https://developer.apple.com/sample-code/app-store-connect/app-store-connect-openapi-specification.zip` → `openapi.oas.json`, `info.version` 4.6, plik z 2026-11-04;
- `https://developer.apple.com/tutorials/data/documentation/appstoreconnectapi/app-store-connect-api-4-4-1-release-notes.json` (pełny tekst odczytany).

| Element w kodzie | Spec 4.6 | Wynik |
|---|---|---|
| `GET /v1/subscriptionGroups/{id}/versions`, `/v1/subscriptions/{id}/versions`, `/v2/inAppPurchases/{id}/versions` (limit ≤ 200) | istnieją, `limit` max 200, odpowiedź `*VersionsResponse` | OK |
| `GET /v1/{subscriptionGroup,subscription,inAppPurchase}Versions/{id}/localizations` | istnieją, odpowiedź `*LocalizationsV2Response` | OK |
| `POST /v2/*Localizations`: `type` jak dotąd, `attributes{locale,name}`, `relationships.version` → `subscriptionGroupVersions` / `subscriptionVersions` / `inAppPurchaseVersions` | `*LocalizationV2CreateRequest`: dokładnie tak (`name`, `locale` wymagane) | OK |
| `PATCH /v2/*Localizations/{id}`: `name` (ustawienia), `description` (zgłoszenie) | `*LocalizationV2UpdateRequest`: `name`, `description` (IAP/sub), `name`, `customAppName` (grupa) | OK |
| `POST /v1/inAppPurchaseVersions` rel `inAppPurchase` → `inAppPurchases`; `/v1/subscriptionVersions` rel `subscription`; `/v1/subscriptionGroupVersions` rel `subscriptionGroup`; bez atrybutów | `*VersionCreateRequest`: tylko `type` + ta relacja; odpowiedzi 201 i 409 | OK |
| `attributes.version` (integer), `attributes.state` (9 wartości, `PREPARE_FOR_SUBMISSION` …) | zgodne | OK |
| Wycofania v1 lokalizacji (`in-app-purchase-localizations-v1`, `subscription-localizations-v1`, `subscription-group-localizations-v1`) | release notes 4.4.1: „deprecated … scopes localizations to an …Version” | OK. Operacje v1 w specu nie mają flagi `deprecated`, autor to odnotował |

Daty usunięcia v1 nie ma ani w specu, ani w notatkach — autor oznaczył to poprawnie jako [DO USTALENIA].

## (2) Plan, skrót, zgoda

- Wiersz `:wersja` (`op('utworzy', …)`) jest w `DZIALANIA`, więc wchodzi do `skrot()`: `scripts/asc-ustawienia.mjs:446`. Jest też w planie, gdy rodzic jeszcze nie istnieje (wtedy bez `wykonaj`). Mutacja „wiersz wersji jako `bez zmian`” daje 2 czerwone testy.
- Przy wersji nieedytowalnej lokalizacje są w planie jako „utworzy … (na nowej wersji)” bez `wykonaj` (`:451`). Zapis rusza dopiero w kolejnej rundzie, która planuje od nowa.
- Sucho (`tylkoOdczyt` → wyjątek przy zapisie), porównanie `zgoda.skrot !== skrot(ops)` i kod 3: bez zmian.
- Liczba rund wzrosła z 4 do 6, bo dochodzi poziom wersji (rodzic → wersja → lokalizacje). Przy rundach 2–6 patrz P2-4.

## (3) Testy

- Kopia `a9df7d55` z `npm ci`: `npx jest tests/asc-` → 6 zestawów, 77/77 zielonych.
- Nowe testy na starych skryptach (`a6eb5144`): `asc-ustawienia` i `asc-zgloszenie` → 14 czerwonych / 31 (wszystkie 9 nowych plus 5 wcześniejszych, które zależą od nowej atrapy). Czerwone bez zmian w kodzie — potwierdzone.
- Mutacje kodu (każda wychwycona): wersja zawsze, gdy nieedytowalna → 1 czerwony; wybór wersji bez patrzenia na stan → 2; usunięta gałąź „ręcznie” w zgłoszeniu → 1; wiersz wersji poza skrótem → 2.
- Atrapa sprawdza typ relacji `version`, typ rodzica wersji, `d.type` i 409 przy zapisie do wersji nieedytowalnej. Ta walidacja zgadza się ze specem, a nie tylko z kodem. Wyjątki są w P2-1.

## (4) Błędy i utrata danych

- Nadpisanie lokalizacji złej wersji: nie widzę takiej drogi. `PATCH` i `POST` lokalizacji powstają tylko dla wersji `PREPARE_FOR_SUBMISSION`. Identyfikatory lokalizacji pochodzą z listy tej samej wersji: `asc-ustawienia.mjs:449–455`, `asc-zgloszenie.mjs:117–120` i `:227`. Przy wersji nieedytowalnej w `asc-zgloszenie` jest „ręcznie” i brak zapisu. Skrypt niczego nie usuwa (`DELETE`).
- Paginacja: `k.wszystkie` idzie po `links.next`, `limit=200` mieści się w maksimum specu.
- 409: każdy błąd kończy się `BladApi` i kodem 1, a zapisy z wcześniejszych operacji zostają. To ten sam model co przed zmianą. Co się dzieje przy wersji „w locie”, opisuje P2-1.

## Uwagi

**P2-1 — stany wersji poza `PREPARE_FOR_SUBMISSION` (niesprawdzone u źródła).** `scripts/asc-ustawienia.mjs:183–189` i `:446`. Każdy stan inny niż `PREPARE_FOR_SUBMISSION` skrypt traktuje jako nieedytowalny i przy różnicy nazw planuje `POST /v1/*Versions`. Problemowe przypadki:
- `READY_FOR_REVIEW`, `WAITING_FOR_REVIEW`, `IN_REVIEW`: Apple prawdopodobnie odmówi drugiej wersji (spec przewiduje 409). Przebieg skończy się kodem 1 i będzie się tak kończył przy każdym kolejnym uruchomieniu, aż produkt wyjdzie z recenzji.
- `REJECTED`, `DEVELOPER_REJECTED`: przy `appStoreVersions` te stany są edytowalne. Tu skrypt utworzy nową wersję albo dostanie 409.

Atrapa (`tests/atrapa-asc.ts:265`) zawsze zwraca 201 dla `POST …Versions`, także gdy istnieje wersja w recenzji, więc ta ścieżka jest niezweryfikowana. Właściciel widzi w planie „utworzy wersja … (obecna nieedytowalna)”, więc nic nie dzieje się po cichu. Propozycja:
- przy stanach „w locie” planować „ręcznie” (czekaj na recenzję);
- dla `REJECTED`/`DEVELOPER_REJECTED` dopisać [DO USTALENIA];
- dodać do atrapy 409 na `POST` wersji, gdy istnieje wersja nie-końcowa.

**P2-2 — źródła: zrzut recenzji IAP a obrazy wersji.** `docs/wydanie/asc-api-v2-zrodla.md:30`. Teza „Zasoby `*Images` (v1/v2) to obrazy promocyjne, nie zrzuty recenzji” przeczy notatkom 4.4.1 w części o IAP. Notatki piszą: „Each version exposes its own localizations and **review screenshot** through … Read the image for an In-App Purchase version”, „Create an In-App Purchase image … to manage **review screenshots**”, „In-App Purchase images (v1) … deprecated … scopes **review screenshots** to an InAppPurchaseVersion”. Opis `GET-v1-inAppPurchaseVersions-_id_-image` w odnośnikach: „Get the review image attached to a draft version”. Abstrakty stron `*-images` mówią z kolei o „promotion images” — dokumentacja Apple jest tu niespójna. `inAppPurchaseAppStoreReviewScreenshots` i `…/appStoreReviewScreenshot` nie mają w specu flagi `deprecated`, więc `asc-zgloszenie.mjs:153` i `:255` działają. Mogą jednak przestać odpowiadać zrzutowi wersji, która idzie do recenzji. Propozycja: poprawić zdanie w źródłach i dopisać [DO USTALENIA] „zrzut recenzji IAP: zasób produktu czy obraz wersji”.

**P2-3 — atrapa tworzy wersję razem z rodzicem domyślnie.** `tests/atrapa-asc.ts`, `autoWersja` przy `POST` grupy, subskrypcji i IAP. To zachowanie Apple jest [DO USTALENIA]. Test `bezAutoWersji` pokrywa wariant przeciwny, więc oba przypadki są przetestowane — tylko odnotowuję.

**P2-4 — rundy 2–6 wykonują plan wyliczony na nowo, bez porównania ze skrótem.** `scripts/asc-ustawienia.mjs:556–560`. Sam mechanizm istniał przed zmianą. Teraz jednak `POST` lokalizacji na nowej wersji i `POST` wersji dla świeżo utworzonego rodzica zawsze idą w rundzie ≥ 2. Treść tych zapisów jest w zatwierdzonych opisach (te same nazwy z `cel`), więc to nie jest zapis poza zgodą co do treści. Formalnie jednak żadna kontrola tego nie wiąże. Dodatkowo filtr `doWykonania` nie sprawdza `DZIALANIA`: wiersz `bez zmian` z `wykonaj` zostałby wykonany. Dziś takiego wiersza nie ma. Propozycja (osobny KO): w rundach ≥ 2 wykonywać tylko wiersze, których `obiekt` był w zatwierdzonym planie, i tylko `utworzy`/`zmieni`.

## Dowody (scratchpad)

- Spec: `/tmp/claude-0/-home-user/9e3c2aba-329f-5922-94b5-b17cef13d977/scratchpad/spec/openapi.oas.json`
- Notatki 4.4.1: `/tmp/claude-0/-home-user/9e3c2aba-329f-5922-94b5-b17cef13d977/scratchpad/spec/rn.json`
- Kopia z testami: `/tmp/claude-0/-home-user/9e3c2aba-329f-5922-94b5-b17cef13d977/scratchpad/x-kopia` (skrypty przywrócone do `a9df7d55` po mutacjach)

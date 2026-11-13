# ASC API: zasoby wersji IAP i subskrypcji (v2) — źródła

Rola 10, sesja X, 2026-11-13. Odczyt: 2026-11-13, JSON stron dokumentacji `developer.apple.com/tutorials/data/documentation/appstoreconnectapi/…` (surowy tekst, `curl`) i specyfikacja OpenAPI z `https://developer.apple.com/sample-code/app-store-connect/app-store-connect-openapi-specification.zip` (`openapi.oas.json`, `info.version` = `4.6`, plik z 2026-11-04). Treść e-maila Apple do właściciela: tylko wskazówka, nie źródło.

## Cytaty (dosłownie z surowego tekstu)

1. Release notes 4.4.1 (`…/app-store-connect-api-4-4-1-release-notes`): „Manage In-App Purchase metadata as discrete versions. Use POST /v1/inAppPurchaseVersions to create a new version, GET /v1/inAppPurchaseVersions/{id} to read a version, and GET /v2/inAppPurchases/{id}/versions to list all versions for an In-App Purchase. Each version exposes its own localizations and review screenshot through …/localizations and …/image.” Analogicznie dla subskrypcji (`/v1/subscriptionVersions`, `/v1/subscriptions/{id}/versions`) i grup (`/v1/subscriptionGroupVersions`, `/v1/subscriptionGroups/{id}/versions`).
2. Tamże: „Use POST /v2/inAppPurchaseLocalizations, PATCH …/{id}, and DELETE …/{id} to manage In-App Purchase localizations … These v2 endpoints are scoped to an InAppPurchaseVersion.” To samo: `/v2/subscriptionLocalizations` („scoped to a SubscriptionVersion”) i `/v2/subscriptionGroupLocalizations` („including localized custom app names … scoped to a SubscriptionGroupVersion”).
3. Tamże, wycofania: „The in-app-purchase-localizations-v1 resource is deprecated. Use in-app-purchase-localizations instead, which scopes localizations to an InAppPurchaseVersion.” (to samo dla `subscription-localizations-v1`, `subscription-group-localizations-v1`, `in-app-purchase-images-v1`, `subscription-images-v1`); „The in-app-purchase-submissions resource is deprecated. Use review-submissions instead…”, „The subscription-and-subscription-group-submissions resource is deprecated…”.
4. Strona `subscription-localizations-v1`: `metadata.platforms[0].deprecatedAt = "4.4.1"`, tekst: „This is deprecated. Use Subscription localizations instead.” Strony `…-images-v1`: „Create, modify, and delete promotion images…” (`deprecatedAt` 4.4.1).
5. Strona `in-app-purchase-versions`: „Each In-App Purchase has a version, which is the container for the localizations and images related to that In-App Purchase. Use the In-App Purchase version for submitting to review.”

## Mapowanie (OpenAPI 4.6)

| Użycie w skrypcie | Stary (v1, wycofany od 4.4.1) | Nowy |
|---|---|---|
| lokalizacje grupy: odczyt | `GET /v1/subscriptionGroups/{id}/subscriptionGroupLocalizations` | `GET /v1/subscriptionGroups/{id}/versions` → `GET /v1/subscriptionGroupVersions/{vid}/localizations` |
| lokalizacje grupy: zapis | `POST /v1/subscriptionGroupLocalizations`, rel `subscriptionGroup`; `PATCH /v1/…/{id}` | `POST /v2/subscriptionGroupLocalizations`, rel `version` → `subscriptionGroupVersions`; `PATCH /v2/subscriptionGroupLocalizations/{id}` (atrybuty: `name`, `customAppName`, `locale` tylko przy POST) |
| lokalizacje subskrypcji: odczyt | `GET /v1/subscriptions/{id}/subscriptionLocalizations` | `GET /v1/subscriptions/{id}/versions` → `GET /v1/subscriptionVersions/{vid}/localizations` |
| lokalizacje subskrypcji: zapis | `POST /v1/subscriptionLocalizations`, rel `subscription` | `POST /v2/subscriptionLocalizations`, rel `version` → `subscriptionVersions`; `PATCH /v2/subscriptionLocalizations/{id}` |
| lokalizacje IAP: odczyt | `GET /v2/inAppPurchases/{id}/inAppPurchaseLocalizations` (ścieżka istnieje w 4.6, bez flagi `deprecated`) | `GET /v2/inAppPurchases/{id}/versions` → `GET /v1/inAppPurchaseVersions/{vid}/localizations` |
| lokalizacje IAP: zapis | `POST /v1/inAppPurchaseLocalizations`, rel `inAppPurchaseV2` | `POST /v2/inAppPurchaseLocalizations`, rel `version` → `inAppPurchaseVersions`; `PATCH /v2/inAppPurchaseLocalizations/{id}` (`name`, `description`) |
| utworzenie wersji | — | `POST /v1/inAppPurchaseVersions` (rel `inAppPurchase`), `POST /v1/subscriptionVersions` (rel `subscription`), `POST /v1/subscriptionGroupVersions` (rel `subscriptionGroup`); odpowiedź 201 |

Stan wersji (`attributes.state`): `PREPARE_FOR_SUBMISSION`, `READY_FOR_REVIEW`, `WAITING_FOR_REVIEW`, `IN_REVIEW`, `ACCEPTED`, `APPROVED`, `REPLACED_WITH_NEW_VERSION`, `REJECTED`, `DEVELOPER_REJECTED`; `attributes.version` (liczba całkowita); lista wersji ma `filter[state]`. Typ zasobu w JSON:API pozostaje `inAppPurchaseLocalizations` / `subscriptionLocalizations` / `subscriptionGroupLocalizations` (zmienia się ścieżka i relacja rodzica).

## Zakres dla Piekarza

- `scripts/asc-ustawienia.mjs` (lokalizacje grupy, obu subskrypcji, zakupu dożywotniego): objęty, odczyt i zapis.
- `scripts/asc-zgloszenie.mjs`: lokalizacje produktów (PATCH opisu, :221–222) objęte; odczyt `mapaLokalizacji` (:144) objęty. Zrzuty recenzji (`subscriptionAppStoreReviewScreenshots`, `inAppPurchaseAppStoreReviewScreenshots`, :246) **nie są na liście wycofań 4.4.1** (strony zasobów bez `deprecatedAt`); ich nie ruszamy. Zasoby `*Images` (v1/v2) to obrazy promocyjne, nie zrzuty recenzji.
- Zgłaszanie do recenzji (`reviewSubmissionItems` z `inAppPurchaseVersion`/`subscriptionVersion`/`subscriptionGroupVersion`): skrypty Piekarza go nie wywołują (sprawdzone `grep`); poza zakresem.

## [DO USTALENIA]

- Data usunięcia starych zasobów: w dokumentacji i notatkach 4.4.1–4.6 nie ma daty (tylko `deprecatedAt: 4.4.1`); „od początku 2027” pochodzi wyłącznie z e-maila Apple (niesprawdzone u źródła). Kontrola: tekst e-maila od właściciela.
- Wersja 4.4.1: data publikacji nie odczytana (strona notatek jej nie podaje).
- Czy produkt tworzony przez API dostaje od razu pierwszą wersję w `PREPARE_FOR_SUBMISSION`, i czy PATCH lokalizacji wersji zatwierdzonej zwraca 409: nieprzetestowane (zakaz uruchamiania na koncie). Skrypt: bierze wersję edytowalną, a gdy jej nie ma, planuje `POST …Versions` i czeka na kolejną rundę.
- Czy v1 zachowa dotychczasowe zachowanie do daty usunięcia: spec 4.6 nie oznacza operacji v1 flagą `deprecated`, dokumentacja oznacza je jako wycofane.

**Stan 2026-11-13 (KO-058):** trzy powyższe [DO USTALENIA] (data usunięcia v1, auto-wersja nowego produktu, PATCH na wersji zatwierdzonej) zostają otwarte; decyzje D-406, D-407 w `docs/decyzje.md`.

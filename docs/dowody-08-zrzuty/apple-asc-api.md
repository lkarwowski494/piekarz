# App Store Connect API: zrzuty ekranu — odczyt dokumentacji Apple (2026-11-10, sesja J)

Metoda: `curl -fsS https://developer.apple.com/tutorials/data/documentation/appstoreconnectapi/<strona>.json` (surowy JSON strony dokumentacji), pola `deprecationSummary` i `metadata.platforms`.

| Strona | Tytuł | deprecationSummary | platforms |
|---|---|---|---|
| post-v1-appscreenshotsets | Create an app screenshot set | „This endpoint is deprecated. Use POST-v1-appAssetLibraryPlacements instead.” | introducedAt 1.2, deprecatedAt 4.5 |
| post-v1-appscreenshots | Create an app screenshot | „This endpoint is deprecated. Use POST-v1-appAssetLibraryImages instead.” | introducedAt 1.2, deprecatedAt 4.5 |
| get-v1-appstoreversionlocalizations-_id_-appscreenshotsets | List all app screenshot sets for an app store version localization | „This relationship is deprecated. Use the …” (dalej odnośnik) | introducedAt 1.2, deprecatedAt 4.5 |
| post-v1-subscriptionappstorereviewscreenshots | Create a review screenshot for an auto-renewable subscription | brak | introducedAt 2.0 |
| post-v1-inapppurchaseappstorereviewscreenshots | Create an In-App Purchase review screenshot | brak | introducedAt 2.0 |
| post-v1-appassetlibraryplacements | Create an app asset library placement | brak | introducedAt 4.5 |
| app-asset-library | App Asset Library | — | abstract: „Upload image and video assets once, then reuse them across your app’s App Store surfaces.” |

Strony `appscreenshotsets.json` i `appscreenshots.json` (obiekty) zwróciły 404 pod tym adresem; nie sprawdzałem innej nazwy strony. Data wyłączenia przestarzałych punktów: brak w odczytanych stronach [DO USTALENIA].

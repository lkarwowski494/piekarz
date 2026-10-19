# Piekarz BRD — Źródła S

Stan: 2026-10-19 (rola 01, zadanie M1-audytor-generalny-033). Tylko źródła otwarte i przeczytane w dniu odczytu; cytat sprawdzony dosłownie w surowym tekście strony (`curl`). Hierarchia źródeł: DEC-07 (00b) dla technologii pieczenia, uzupełniona hierarchią roli 06 dla bezpieczeństwa żywności (`docs/tresci/hierarchia.md`).

Pozycje bibliografii z W.md (Calvel, Hamelman, DiMuzio, Suas, Gänzle i Ripari, Brandt, De Vuyst i Neysens, Robertson, Forkish) nie mają wpisu S: nie zostały otwarte w dniu pracy, więc nie są tu źródłami (zasada „przeczytanego źródła”). Fakty oparte tylko na nich mają w regułach znacznik „DO USTALENIA” z numerem OP (D4); weryfikacja należy do roli 06 (zadanie 034 dla faktów rynkowych A1, A2, W).

Fakty rynkowe (zadanie M1-audytor-generalny-034, 2026-10-19): S-06…S-13 to karty App Store i interfejsy iTunes Search, Lookup i RSS pobrane `curl` z kraju US; ceny i zgodność urządzeń z karty App Store mają szczebel 1 (dane platformy), treść recenzji szczebel 5 (opinie użytkowników, tylko do zliczeń). Ceny konkurencji są zmienne: przegląd co 3 miesiące. Surowe pobrania leżą w dowodach zadania 034 roli 01 w lokalnym katalogu audytu M1 (nieśledzonym przez git).

| ID | Adres | Miejsce | Cytat | Odczyt | Szczebel | Przegląd |
|---|---|---|---|---|---|---|
| S-01 | https://www.kingarthurbaking.com/pro/reference/bakers-percentage | King Arthur Baking, Pro Reference „Baker's Percentage”, akapit definicji i część o prefermentach | „each ingredient in a formula is expressed as a percentage of the flour weight, and the flour weight is always expressed as 100%” | 2026-10-19 | 3 | 2027-10-19 |
| S-02 | https://www.kingarthurbaking.com/pro/reference/dough-temperature | King Arthur Baking, Pro Reference „Dough Temperatures”, część o temperaturze wody i tarciu | „multiply this figure by 3 if we are mixing a straight dough, and by 4 if using a preferment” | 2026-10-19 | 3 | 2027-10-19 |
| S-03 | https://www.fda.gov/food/buy-store-serve-safe-food/handling-flour-safely-what-you-need-know | U.S. FDA, „Handling Flour Safely: What You Need to Know” | „Never eat or taste raw flour, dough, or batter.” | 2026-10-19 | 1 | 2027-10-19 |
| S-04 | https://extension.colostate.edu/resource/sourdough-starter-best-practices/ | Colorado State University Extension, „Sourdough Starter Best Practices”, sekcja Troubleshooting (Reviewed: October 2025) | „Sourdough starter that shows any sign of mold (colored and/or fuzzy) should NOT be used” | 2026-10-19 | 3 | 2027-10-19 |
| S-05 | https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/molds-food-are-they-dangerous | USDA FSIS, „Molds on Food: Are They Dangerous?”, sekcje How Should You Handle Food with Mold on It? i Are Any Food Molds Beneficial? (serwer zwraca 403; czytana kopia web.archive.org z 2026-10-04) | „If food is covered with mold, discard it.” | 2026-10-19 | 1 | 2027-10-19 |
| S-06 | https://apps.apple.com/us/app/rise-baking-bread-recipes/id1515369685 | App Store US, karta „Rise: Baking & Bread Recipes”, sekcje In-App Purchases i Compatibility (tekst strony po usunięciu znaczników HTML); Compatibility wymienia iPhone, iPad, Mac i Apple Vision, bez Apple Watch | „Monthly Subscription $3.99 Yearly Subscription $14.99 Monthly Subscription $4.99 One time purchase $19.99 3 Month Subscription $8.99 Yearly Subscription $19.99” | 2026-10-19 | 1 | 2027-01-19 |
| S-07 | https://apps.apple.com/us/app/loaflo-sourdough-starter/id6736766728 | App Store US, karta „Loaflo: Sourdough Starter”, sekcje In-App Purchases i Compatibility (iPhone, iPad, Mac, Apple Vision, bez Apple Watch; tekst po usunięciu znaczników HTML) | „Loaflo Weekly $6.99 Loaflo Monthly $19.99 Loaflo Yearly $39.99” | 2026-10-19 | 1 | 2027-01-19 |
| S-08 | https://itunes.apple.com/search?term=sourdough&country=us&entity=software&limit=50 | iTunes Search API (Apple), pole supportedDevices; te same pola dla zapytań „bread baking”, „sourdough calculator”, „sourdough club” i „pizzapp” (127 wyników, 101 różnych aplikacji); Apple Watch deklaruje tylko „Proofed: Sourdough Tracker” (id 6790177175) | „Watch4-Watch4” | 2026-10-19 | 1 | 2027-01-19 |
| S-09 | https://apps.apple.com/us/app/pizzapp/id1228158792 | App Store US, karta „PizzApp+”: cena Free, brak sekcji In-App Purchases, Compatibility bez Apple Watch, sekcja Age Rating (tekst po usunięciu znaczników HTML) | „Contains Advertising” | 2026-10-19 | 1 | 2027-01-19 |
| S-10 | https://apps.apple.com/us/app/kneady-bread-baking-recipes/id1534576984 | App Store US, karta „Kneady: Bread & Baking Recipes”, sekcja In-App Purchases (ceny od 3,49 do 29,99 USD; tekst po usunięciu znaczników HTML) | „Kneady Pro - Annual $29.99” | 2026-10-19 | 1 | 2027-01-19 |
| S-11 | https://apps.apple.com/us/app/gluten-morgen/id1525239805 | App Store US, karta „Gluten Morgen”, sekcje In-App Purchases i Age Rating z dopiskiem „Contains Advertising” (tekst po usunięciu znaczników HTML) | „Gluten Premium $1.49” | 2026-10-19 | 1 | 2027-01-19 |
| S-12 | https://itunes.apple.com/lookup?id=1522824861,1534576984,1525239805,6736766728,1515369685,1228158792&country=us | iTunes Lookup API (Apple), pole formattedPrice: BreadMe 2,99 USD, pozostałe pięć aplikacji Free | „"formattedPrice":"$2.99"” | 2026-10-19 | 1 | 2027-01-19 |
| S-13 | https://itunes.apple.com/us/rss/customerreviews/page=1/id=6736766728/sortby=mostrecent/json | Kanał RSS recenzji App Store US, strony 1–10, sortowanie od najnowszych, dla Loaflo, Gluten Morgen, Kneady, Rise, BreadMe i Bread Boss (id 1304204584): 186 recenzji, 50 ocen 1–3★; treść recenzji to opinie użytkowników, używana tylko do zliczeń [RACHUNEK] | „Only works half the time” | 2026-10-19 | 5 | 2027-01-19 |

Dodatkowe cytaty z tych samych stron, użyte w regułach (sprawdzone dosłownie 2026-10-19):

- S-01: „It can therefore be a good idea, when using preferments, to also express the formula in terms of Overall Baker's Percent.” (RD-02)
- S-02: „Ascertaining the friction factor for your mixer can be difficult indeed.” (RD-06)
- S-04: „Sourdough starter may develop a liquid layer that smells of alcohol, and this is fine.” (RD-13)
- S-05: „Cheeses such as Brie and Camembert have white surface molds.” (RD-13: pleśń bywa biała)

Wykorzystanie S-03: ostrzeżenie przed próbowaniem surowego ciasta i mąki nie ma jeszcze wymagania BR (znalezisko 01-odkrywanie-019, OP-17).

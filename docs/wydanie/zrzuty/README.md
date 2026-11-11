# Zrzuty App Store (zadanie 080)

Katalog `<kod lokalizacji App Store Connect>/<klasa>/` ma 7 ramek w kolejności D-055 (`docs/app-store-metadata-v2.md` §5.2), a `<kod>/podpisy.json` ma podpisy z `docs/wydanie/metadane/<kod>.json` (pole `ramki`) i oznaczenie funkcji płatnej w języku lokalizacji (`t('wymaga Piekarz Pro')`). Pilnuje tego test `tests/zrzuty-sklepu.test.ts`.

Klasy iPhone (App Store Connect Help, „Screenshot specifications”, odczyt 2026-10-20):

| Katalog | Klasa Apple | Piksele | Punkty × skala |
|---|---|---|---|
| `iphone-6.9` | iPhone with Dynamic Island (large display) | 1320 × 2868 | 440 × 956 × 3 |
| `iphone-6.3` | iPhone with Dynamic Island (medium display), wymagana | 1206 × 2622 | 402 × 874 × 3 |

iPad: nie dotyczy (`app.json`: `supportsTablet: false`).

## Gdzie leżą

- W repo: `pl`, `en-US` i `nl-NL` (nl-NL ma najdłuższe podpisy, kontrola ucięć).
- Pozostałe 31 lokalizacji z `docs/wydanie/metadane/` (ok. 40 MB) są poza gitem, w katalogu audytu M1: `audit/M1-2026-10-19/M1-2026-10-19/zrzuty-sklepu/<kod>/{iphone-6.9,iphone-6.3}/` (decyzja M2, partia 7). Generuje je to samo polecenie, a sprawdza `sprawdz-k.mjs` (wymiary, 7 plików na klasę, brak kanału alfa, podpisy równe metadanym).

## Jak powstają

Ramki to eksport web aplikacji (Expo web) z podkładkami modułów natywnych, zrzucony Playwrightem i złożony z pasem podpisu w tokenach `docs/design/`. Playwright i podkładki nie należą do zależności repo, więc skrypty leżą poza repo, przy raporcie zadania 080 część 2 (`role/10-wydanie/fix-2026-10-21-p7-080b/narzedzia/` w katalogu audytu M1: `generuj.mjs`, `serwer.mjs`, `sprawdz-k.mjs`, `podkladki/`, `metro.config.zrzuty.js`). Kroki:

1. Zrób kopię swojego `metro.config.js` i skopiuj na jego miejsce `narzedzia/metro.config.zrzuty.js` (plik jest poza gitem w `.git/info/exclude`).
2. Zrób dwa eksporty z HEAD: `MOTYW_ZRZUT=jasny npx expo export -p web --output-dir <tmp>/web --clear` i to samo z `MOTYW_ZRZUT=ciemny` do `<tmp>/web-ciemny`. Potem przywróć `metro.config.js` z kopii.
3. Skopiuj `generuj.mjs` i `serwer.mjs` do katalogu roboczego z Playwrightem (`npm install playwright@1.64.1`) i uruchom dla każdej lokalizacji: `node generuj.mjs --jezyk <kod ASC> --repo <repo> --web <tmp>/web --web-ciemny <tmp>/web-ciemny`. Wynik trafia do `docs/wydanie/zrzuty/<kod>/` dla pl, en-US i nl-NL, a dla pozostałych do katalogu K (inny katalog: `--wyjscie <katalog>`). Jedna lokalizacja trwa ok. 5 min; kilka można uruchomić naraz.
4. Uruchom `npx jest tests/zrzuty-sklepu.test.ts` i `node sprawdz-k.mjs`.
5. Wysyłka do App Store Connect: workflow „ASC zrzuty ekranu” (`.github/workflows/asc-zrzuty.yml`, `scripts/asc/zrzuty.mjs`, App Asset Library; KO-033, D-366). `scripts/asc-zgloszenie.mjs` zrzutów sklepu już nie wgrywa, a `--generuj-sumy` usunięto; `sumy.json` zostaje w repo jako zapis stanu z 2026-10-21, skrypt go nie czyta.

Podpisy biorą się z metadanych lokalizacji. Etykiety przycisków, które klika skrypt, i tekst oznaczenia płatnego pochodzą ze słowników aplikacji (`src/lib/i18n-slowniki/`, `src/lib/i18n-en/`), a godzina z `Intl` przeglądarki. Nowa lokalizacja wymaga więc tylko pliku metadanych, wpisu w tabelach `LOK` i `DANE` w `generuj.mjs` (locale przeglądarki, przykładowa nazwa zakwasu i notatka) oraz w `JEZYKI` w teście.

Render web różni się od iOS: nie ma paska stanu, tekst treści ma krój systemowy Windows zamiast SF Pro, a cienie i przewijanie wyglądają inaczej. Dla japońskiego, koreańskiego i chińskiego (tradycyjnego) ramka używa kroju zastępczego Windows (Yu Gothic, Malgun Gothic, Microsoft JhengHei), bo Sofia Sans nie ma tych pism. Przed wysyłką do App Store Connect właściciel ogląda ramki na telefonie.

## Zrzuty natywne z symulatora (KO-025, D-352)

Od 2026-11-10 zrzuty powstają natywnie: `.github/workflows/zrzuty-sklepu.yml` buduje aplikację na symulator iOS (Pro z `EXPO_PUBLIC_E2E` i Basic), a `scripts/ci/zrzuty-sklepu.sh` przechodzi sceny Maestro z `.maestro/zrzuty-sklepu/` na iPhone 17 Pro Max (`iphone-6.9`) i iPhone 17 Pro (`iphone-6.3`), po jednej scenie na ramkę (te same nazwy plików co wyżej), dla lokalizacji z `docs/wydanie/metadane/`. Dane są fikcyjne (zakwas i jeden wypiek z oceną, scena `00-przygotuj.yaml`). Workflow niczego nie wysyła; wynik to artefakt `sklep-zrzuty` (`<kod>/<klasa>/NN-*.png`, PNG bez alfy, sprawdzone wymiary) i ekran zakupu `review/zakup.png` (tylko gdy sklep zwrócił ofertę, inaczej `bez-oferty/`, D-353).

Uruchomienie (za zgodą, przebieg na macOS): `workflow_dispatch` z wejściami `tylko` (np. `pl` albo `pl,en-US`; puste = wszystkie), `rozmiary` (`6.9`, `6.3`), `sceny` (np. `04` albo `04,05`; puste = wszystkie 7; niepełny wybór daje artefakty `sklep-zrzuty-czesciowe` i `sklep-ramki-czesciowe`, których `asc-zrzuty.yml` nie wysyła — D-380), `aplikacja_z_przebiegu` (ID przebiegu z adresu `…/actions/runs/<ID>`, aplikacje bez budowy), albo push na gałąź `zrzuty-sklepu/<nazwa>` ze znacznikami w pierwszej linii komunikatu: `[tylko=pl] [rozmiary=6.9] [sceny=04] [zrzuty-app:<ID przebiegu>]`. Pierwszy przebieg: `tylko=pl`.

Różnice wobec obecnego zestawu: zrzuty są surowe, bez pasa podpisu (decyzja A/B w D-352); godziny w planie wypieku pochodzą z zegara maszyny CI; pasek stanu ustawiony na 9:41. Zestaw w repo zostaje bez zmian do decyzji właściciela po teście telefonu.

## Zrzut zakupu dla App Review (`review/zakup.png`)

Jeden plik PNG ekranu zakupu Piekarz Pro dla trzech produktów (instrukcja §3.8), z finalnej aplikacji, razem ze zrzutami sklepu z finalnej aplikacji (właściciel, 2026-10-21: „Rzeczy jak zrzuty powinny być z finalnej aplikacji.”). Ścieżkę podaje `docs/wydanie/asc-zgloszenie.json` (`zrzutZakupu`). Dopóki pliku nie ma, `scripts/asc-zgloszenie.mjs` wypisuje trzy pozycje „czeka” i niczego dla nich nie wysyła; gdy plik jest, porównuje jego MD5 ze zrzutem w App Store Connect i wysyła go tylko przy zapisie za zgodą [M1-audytor-generalny-186].

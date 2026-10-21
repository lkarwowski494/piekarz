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

Podpisy biorą się z metadanych lokalizacji. Etykiety przycisków, które klika skrypt, i tekst oznaczenia płatnego pochodzą ze słowników aplikacji (`src/lib/i18n-slowniki/`, `src/lib/i18n-en/`), a godzina z `Intl` przeglądarki. Nowa lokalizacja wymaga więc tylko pliku metadanych, wpisu w tabelach `LOK` i `DANE` w `generuj.mjs` (locale przeglądarki, przykładowa nazwa zakwasu i notatka) oraz w `JEZYKI` w teście.

Render web różni się od iOS: nie ma paska stanu, tekst treści ma krój systemowy Windows zamiast SF Pro, a cienie i przewijanie wyglądają inaczej. Dla japońskiego, koreańskiego i chińskiego (tradycyjnego) ramka używa kroju zastępczego Windows (Yu Gothic, Malgun Gothic, Microsoft JhengHei), bo Sofia Sans nie ma tych pism. Przed wysyłką do App Store Connect właściciel ogląda ramki na telefonie.

# Zrzuty App Store (zadanie 080)

Katalog `<kod lokalizacji App Store Connect>/<klasa>/` ma 7 ramek w kolejności D-055 (`docs/app-store-metadata-v2.md` §5.2), a `<kod>/podpisy.json` ma podpisy z §3 i oznaczenie funkcji płatnej. Pilnuje tego test `tests/zrzuty-sklepu.test.ts`.

Klasy iPhone (App Store Connect Help, „Screenshot specifications”, odczyt 2026-10-20):

| Katalog | Klasa Apple | Piksele | Punkty × skala |
|---|---|---|---|
| `iphone-6.9` | iPhone with Dynamic Island (large display) | 1320 × 2868 | 440 × 956 × 3 |
| `iphone-6.3` | iPhone with Dynamic Island (medium display), wymagana | 1206 × 2622 | 402 × 874 × 3 |

iPad: nie dotyczy (`app.json`: `supportsTablet: false`).

## Jak powstają

Ramki to eksport web aplikacji (Expo web) z podkładkami modułów natywnych, zrzucony Playwrightem i złożony z pasem podpisu w tokenach `docs/design/`. Playwright i podkładki nie należą do zależności repo, więc skrypt `generuj.mjs` leży poza repo, przy raporcie zadania 080 (`role/10-wydanie/fix-2026-10-20-p7-080/narzedzia/` w katalogu audytu M1). Kroki:

1. Skopiuj `narzedzia/metro.config.zrzuty.js` jako `metro.config.js` w katalogu repo (plik jest poza gitem w `.git/info/exclude`).
2. Zrób dwa eksporty z HEAD: `MOTYW_ZRZUT=jasny npx expo export -p web --output-dir <tmp>/web --clear` i to samo z `MOTYW_ZRZUT=ciemny` do `<tmp>/web-ciemny`.
3. W katalogu z `generuj.mjs`, po `npm install` (instaluje tylko Playwright), uruchom dla każdego języka: `node generuj.mjs --jezyk <kod> --repo <repo> --web <tmp>/web --web-ciemny <tmp>/web-ciemny`.
4. Przywróć `metro.config.js` i uruchom `npx jest tests/zrzuty-sklepu.test.ts`.

Nowy język po przekładzie (093) wymaga trzech rzeczy: podpisów tego języka w §3, wpisu w tabeli `J` w `generuj.mjs` (locale, etykiety przycisków, nazwy danych przykładowych) i wpisu w `JEZYKI` w teście.

Render web różni się od iOS: nie ma paska stanu, tekst treści ma krój systemowy Windows zamiast SF Pro, a cienie i przewijanie wyglądają inaczej. Przed wysyłką do App Store Connect właściciel ogląda ramki na telefonie.

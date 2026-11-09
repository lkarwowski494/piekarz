# Reaudyt: Monetyzacja — Piekarz — 2026-11-09
Commit: ea249c9c · Tryb: reaudit, pętla 1 (baza 2ef8870a) · Grupa F (KO-006) · Środowisko: Linux x86_64, Node v22.23.4, git 2.43.0, sieć przez proxy (developer.apple.com odczytane); bez macOS, Xcode, StoreKit Testing i zrzutu ekranu Pro (krok właściciela jak w audycie). Dowód: dowody/e0-srodowisko.txt (SHA, korzenie historii, git status).

## Podsumowanie
Naprawy M2 w obszarze monetyzacji są zweryfikowane na ea249c9c: `docs/monetyzacja.md` podaje wynik bramki dla wydania 1.0 na samym iOS (174–218 USD netto/rok, 35–44% progu), dokumenty wydania nie powołują już D-038 jako obowiązującego, Z-1 ma datę i słowa właściciela, a ekran Pro i kontrakt płatności nie obiecują porównania. Każdą z 16 obietnic ekranu Pro sprawdziłem na kodzie: każda ma funkcję Pro z `konfiguracja.ts` i strażnika (dowody/r1-015-obietnice.txt). Kod płatności poza dwoma plikami tekstów się nie zmienił; wektory dostępu przechodzą (34/34). Otwarte zostają dwie pozycje P3 backlogu (003 = M1-055, 004 = M1-056); 006 zamknięte decyzją DEC-20. Nowe: jedno znalezisko P3 „istniało wcześniej” (tabela Basic w kontrakcie płatności wymienia odczyt QR i Akademię, które w 1.0 nie mają wejścia). SHA commitu M2 z planu dla 054 (69a1c258) nie istnieje w repo; zmiana jest w drzewie ea249c9c.

| ID | Wynik | Dowód |
|---|---|---|
| 02-monetyzacja-001 | zweryfikowane w zakresie tej roli (M1-078 weryfikuje grupa E) | tekst promocyjny `docs/wydanie/metadane/pl.json:8` „Plan wstecz od godziny, o której chleb ma być gotowy (Pro).”; ramki 1 i 5 w PL `docs/wydanie/zrzuty/pl/podpisy.json:33`, `docs/wydanie/zrzuty/pl/podpisy.json:73` „wymaga Piekarz Pro” (en-US tak samo); `tests/opis-sklepu-pro-078.test.ts` zielony; obietnice opisu PL zgodne z kodem (26/11 receptur, 4/3 wersji drożdżowych: dowody/r1-sonda-katalog-plan.txt) |
| 02-monetyzacja-002 | zweryfikowane (M1-054) | `docs/monetyzacja.md:15` „174–218 USD netto/rok, czyli 35–44% progu 500 USD”; liczby zgodne z `docs/monetyzacja-badanie-2026-10.md:624` i `docs/monetyzacja-badanie-2026-10.md:625`; `tests/monetyzacja-platforma-054.test.ts` zielony |
| 02-monetyzacja-003 | nadal otwarte (M1-055, P3 backlog; DEC-07 a wybrane, bez wykonania) | Z-7 dalej otwarte (`docs/monetyzacja.md:143`) |
| 02-monetyzacja-004 | nadal otwarte (M1-056, P3 backlog) | `src/lib/app-access.ts:46` `przywrocZakupy(): Promise<boolean>` bez stanu „blad” |
| 02-monetyzacja-005 | zweryfikowane (M1-057) | „D-038” w `docs/wydanie` tylko w historii (dowody/r1-057-dokumenty.txt); B2 i W1-05 z 2026-11-03; `tests/dokumenty-wydania-057.test.ts` zielony |
| 02-monetyzacja-006 | zweryfikowane jako zamknięte decyzją (M1-086 odrzucone, DEC-20 a, D-117 pkt 1) | ekran Pro przy aktywnym Pro bez opcji zakupu (`src/components/PaywallModal.tsx:88`); kod zgodny z decyzją |
| 02-monetyzacja-007 | nie sprawdzono w grupie F (M1-066, grupa E) | E2E weryfikuje grupa E |
| 02-monetyzacja-601 | istniało wcześniej, P3 | `docs/monetyzacja.md:50` Basic: „odczyt i import QR (w limicie 5)” i Akademia; `src/lib/wejscia-pozniej.ts:29` i `src/lib/wejscia-pozniej.ts:33` wejścia ukryte |

| Zadanie M1 | Wynik | Dowód |
|---|---|---|
| M1-audytor-generalny-015 (obietnice ekranu Pro, rola 03, kontrakt płatności rola 02) | zweryfikowane | `docs/monetyzacja.md` lista Pro bez porównania, F-63 PÓŹNIEJ; 16/16 obietnic z kodem (dowody/r1-015-obietnice.txt); test `tests/obietnice-pro-015.test.ts` sprawdza tylko kierunek „bez obietnicy bez kodu” (szczegóły w raporcie 03-zakres) |

Liczby: zweryfikowane 4 (+ 006 zamknięte decyzją), nadal otwarte 2 (P3 backlog), regresja 0, istniało wcześniej 1 (P3, nowe), poza grupą 1.

## Obietnice ekranu Pro na kodzie (DODATKI: 015, 078/080)
Ekran Pro (`src/components/PaywallModal.tsx:70` do `src/components/PaywallModal.tsx:73` i podtytuł w linii 192): 16 obietnic, każda ma funkcję Pro i strażnika w kodzie — plan wstecz, ochrona snu i czas z temperatury (`app/(tabs)/receptury/harmonogram.tsx:88`, `app/(tabs)/receptury/harmonogram.tsx:244`), wypieki na kolejne dni i dwa wypieki (`src/hooks/useStartPlanu.ts:93`, `src/hooks/usePlanyDzis.ts:61`), miesiąc (`app/(tabs)/(dzis)/index.tsx:63`), kalendarz telefonu (`src/components/harmonogram/DodajDoKalendarza.tsx:37`), cztery funkcje zakwasu i kolejne zakwasy (`app/(tabs)/zakwasy/index.tsx:177`, `app/(tabs)/zakwasy/index.tsx:252`), zaczyny ze starym ciastem (`src/components/receptury/nazwy-receptur.ts:12`), receptury ponad limit (`src/components/ImportRecipeModal.tsx:84`), statystyki (`app/(tabs)/dziennik/index.tsx:61`). Funkcji Basic ekran nie przedstawia jako Pro. Opis sklepu PL (078/080) zgadza się z kodem w liczbach receptur i oznaczeniach (Pro); zdania o wadach Doktora, protokołach ratunkowych (wejście widoczne: `src/lib/wejscia-pozniej.ts:34`) i proporcjach karmienia nie przeczą kodowi. Pozostałe 33 lokalizacje i PNG ramek: grupa E.

## Mapa bramek (reaudit)
Pliki bramek bez zmian od 2ef8870a poza tekstami (`src/components/PaywallModal.tsx`, `src/lib/platnosci/nazwy-pro.ts`, komentarze w `src/lib/platnosci/konfiguracja.ts`; dowody/r1-diff-stat-obszar.txt). Wiersz „porównanie i statystyki” z mapy audytu: dziś blokada nazywa się „Statystyki piekarni domowej” (`src/lib/platnosci/nazwy-pro.ts:28`), za nią karta statystyk; reszta wierszy mapy bez zmian.

## Próbka regresji
- MON-02/MON-03/MON-08 (pliki niezmienione: `dostep.ts`, `stan.ts`, `sklep.ts`): `npx jest src/lib/__tests__/platnosci-dostep.test.ts src/lib/__tests__/wektory-dostepu-pa.test.ts` 34/34, kod 0 (dowody/r1-regresja-mon02-08.txt).
- MON-14: brak SDK analityki i usług płatności zewnętrznych w `package.json` (grep kod 1, 0 trafień w lockfile; dowody/r1-regresja-wzr10.txt); `package.json` bez zmian od 2ef8870a (dowody/r1-diff-stat-obszar.txt).
- Zmiany w obszarze: tekst „Co daje Pro”, nazwa blokady, `docs/monetyzacja.md` (wynik iOS, lista Pro, PR-06/08/13, Z-1) — bez nowego problemu poza 02-monetyzacja-601 (stary wiersz, nie zmieniony w M2).
- Uwaga bez ID (MON-11, poza zmienionymi plikami, istniało wcześniej): kafel startu „Piekę na drożdżach albo pizzę” mówi „zaczyn poolish albo biga” (`src/components/start/WyborCzynnosci.tsx:32`) bez oznaczenia, że zaczyn to Pro; dotknięcie zaczynu w recepturze pokazuje „Pro”, więc to opis kategorii, nie fałszywa obietnica. Do decyzji roli 04 przy następnym przeglądzie tekstów.

## Znaleziska (szczegóły)

### 02-monetyzacja-601 · Kontrakt płatności wymienia w Basic 1.0 odczyt QR i Akademię, które w 1.0 nie mają wejścia
- Pozycja listy kontrolnej: MON-12 (z MON-16)
- Poziom: P3 (nowe P2 → P3 według D-288; klasa: backlog 1.0.1, dokumentacja)
- Realność: realny (dokument dla ról 04–10) · Pewność: wysoka
- Rodzaj: D
- Dowód: `docs/monetyzacja.md:50` kolumna Basic: „odczyt i import QR (w limicie 5), BR-NAUK-001 pierwszy poziom i biblioteka technik Akademii”; `docs/monetyzacja.md:74` PR-08 „odczyt i import: Basic”; kod: `src/lib/wejscia-pozniej.ts:29` (`qr: false`, skan poza 1.0) i `src/lib/wejscia-pozniej.ts:33` (`akademia: false`). W tym samym wierszu kolumna Pro po M2 mówi już, że te funkcje są w 1.0 PÓŹNIEJ bez wejścia, a PR-13 nazywa Akademię PÓŹNIEJ.
- Mechanizm: naprawa M2-N1 (commit 3aaeb317) oznaczyła PÓŹNIEJ tylko funkcje Pro; Basic w tym samym wierszu zostało jak w 2ef8870a (`git show 2ef8870a:docs/monetyzacja.md`, ten sam tekst).
- Powraca: nie
- Wzorzec lub źródło: zasada wspólna 4; MON-12 („jedno źródło oferty”).
- Kroki w aplikacji: brak; opisy sklepu nie obiecują QR ani Akademii (grep w `docs/wydanie/metadane/pl.json`: 0 trafień).
- Opcje: (a) w kolumnie Basic i w PR-08 dopisać „w 1.0 PÓŹNIEJ, bez wejścia” jak w kolumnie Pro — kilka minut roli 02; (b) zostawić do powrotu wejść — dokument dalej opisuje Basic szerszy niż aplikacja. Rekomendacja: (a).
- Test akceptacyjny: rozszerzyć `tests/obietnice-pro-015.test.ts` (test „funkcje ukryte w 1.0”) o kolumnę Basic: każde ukryte wejście z `WEJSCIA_WIDOCZNE` wymienione w Basic ma dopisek PÓŹNIEJ.
- Status: otwarte

## Do sprawdzenia (pewność ≤ 80%)
- Scenariusze na telefonie z audytu (zakup, ponowna instalacja, tryb samolotowy, przywracanie, zwrot, Family Sharing, Ask to Buy) — bez nowego wyniku; krok właściciela bez zmian.
- Rachunek: H-01 (rola 11) ma próg 42 USD/mies., a prognoza bramki dla samego iOS to 174–218 USD/rok, czyli ok. 14,5–18 USD/mies.: według własnego rachunku wynik po 90 dniach wypadnie poniżej linii przeglądu (21 USD/mies.), chyba że widoczność przebije scenariusz normalny. To spójne z werdyktem bramki „przerobić” i D-040; ocena D-315 w raporcie 11-wzrost.

## Kontrola dowodów i sekretów
Wynik `node audit/M1-2026-11-08/narzedzia/sprawdz-raport.mjs <ten raport> /home/user/piekarz audit/M1-2026-11-08/reaudit-2026-11-09/02-monetyzacja --rola 02-monetyzacja`:

```
OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone; format raportu 02-monetyzacja
kod wyjścia 0 (2026-11-09, ostatni przebieg po wklejeniu wyniku)
```

## Decyzje dla właściciela
1. 02-monetyzacja-601: dopisek PÓŹNIEJ w kolumnie Basic — (a) rekomendacja.
2. 003 i 004 (P3 backlog): bez zmian od audytu; 003 ma wybór DEC-07 a, który czeka na wykonanie (plan pozycji Pro co kwartał) — przed zgłoszeniem subskrypcji przydałaby się co najmniej notatka dla App Review o stałej wartości Pro.

Stan plików śledzonych: `git status --porcelain` puste na początku (dowody/e0-srodowisko.txt) i na końcu (dowody/e3-git-koniec.txt).

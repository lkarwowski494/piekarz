# Rola 08 (fix), M2 partia 3b — 070-N5, 08-p3-N1, 070-N2 (D-312) · 2026-11-09

Gałąź `naprawy/M2-koordynator-napraw-2026-11-09-p3` (polecenie 08-programista-p3b; prompt roli wymienia gałąź p2, polecenie wskazuje p3 — wykonano na p3). Wypchnięta: `550fc6b1..9377bc95`.

## ETAP 0: środowisko i stan wyjściowy
- Linux x86_64, Node v22.23.4, git; push na gałąź roboczą działa (origin GitHub). Bez Xcode i symulatora; zrzutów ekranu nie robiono (brak przeglądarki z Expo web w tej sesji) — zrzuty przed/po: krok koordynatora albo właściciela.
- Stan wyjściowy: `npm run verify` kod 0, 640 zestawów / 6578 testów (`dowody-p3b/verify-start.txt`).
- Klasyfikacja: wszystkie trzy ID to **D** (defekt) z zakresem rozstrzygniętym przez właściciela w D-312 (docs/decyzje.md:1789); bez spraw P/M do rozstrzygania.
- Ścieżki wrażliwe: żadna zmiana nie dotyka migracji, kopii, importu/eksportu, czyszczenia danych, zakupów ani workflowów — przegląd subagenta nie był wymagany. Zapis danych: brak zmian schematu i zapisu; sesje sprzed zmiany czytane bez zmian (test wznowienia w 070-N2).

## Wyniki

| ID | Commit | Test | Przed | Po |
|---|---|---|---|---|
| 070-N5 | `cfc4337b` | `src/__tests__/stolnica-skladniki-drozdze-070n5.test.tsx` | 5/6 czerwone: karta „Składniki do odważeniaMąki511 gWoda368 gZakwas0 gSól10,2 g”, brak drożdży (`dowody-p3b/070n5-przed.txt`) | 6/6 zielone + 130 bez zmian (`dowody-p3b/070n5-po.txt`); verify kod 0, 641/6584 |
| 08-p3-N1 | `339ecf48` | `src/__tests__/calculator-cold-water-warning-08p3n1.test.tsx` | 2/4 czerwone: brak alertu przy wodzie −2 °C (`dowody-p3b/08p3n1-przed.txt`) | 4/4 zielone, `calculator-thermal-warning` i `brak-lodu` zielone (`dowody-p3b/08p3n1-po.txt`); verify kod 0, 642/6588 |
| 070-N2 | `9377bc95` | `src/__tests__/br-harmo-etap-drozdze-070.test.tsx` (nowe testy „BR-ETAP-001 Gotowość ciasta drożdżowego: …”) | 2/2 nowe czerwone: „Pierwsze rośnięcie” bez testu palca (`dowody-p3b/070n2-przed.txt`) | 8/8 zielone, `tests/br-bez-testu.test.ts`, `tests/br-kryteria-067.test.tsx` zielone (`dowody-p3b/070n2-po.txt`); verify kod 0, 642/6591 (`dowody-p3b/verify-070n2.txt`) |

### 070-N5 — karta „Składniki do odważenia” w wersji drożdżowej
- Nazwa i masa drożdży jak na karcie „Do miski” (`useRodzajDrozdzy`, `gramyDrozdzy` × 0,35 dla suchych, RD-19, D-205; istniejące klucze „Drożdże świeże (prasowane)” / „Drożdże suche”). Funkcja `zaczynCiasta` (`src/components/stolnica/SkladnikiKroku.tsx:25`): wiersz zakwasu tylko przy zakwasie > 0 g, wiersz drożdży przy drożdżach > 0 g.
- Mechanizm wyszukany ponownie: ta sama karta w arkuszu „Plan wypieku” miała wiersz zakwasu na sztywno — poprawiona w tym commicie (`src/components/stolnica/BakeStepsList.tsx:56`, testID `plan-skladnik-drozdze`).
- Skutek dodatkowy (ten sam mechanizm): receptura z zakwasem i drożdżami (np. 5,2% drożdży w katalogu żytnim) pokazuje teraz oba wiersze; wcześniej drożdży nie było.

### 08-p3-N1 — rada przy za zimnej wodzie
- W tym samym alercie arkusza „Temperatura wody” komunikat reguły dla każdego statusu poza `normal`, czyli za gorącej i za zimnej wody: `app/(tabs)/receptury/receptura.tsx:357`, status `requires_ice` w `src/core/domain-rules.ts:277`. Bez nowego tekstu, bez masy lodu (F-53 NIE bez zmian). Krótszy zapis warunku, bo plik ekranu był 15 B od limitu 20 480 B.

### 070-N2 — gotowość ciasta drożdżowego (BR-ETAP-001)
- `src/recipes/yeast-stages.ts:64`: pierwsze rośnięcie = „Czasy są wskazówką, bo tempo rośnięcia zależy od składników, siły ciasta, temperatury i wilgotności. Ciasto jest gotowe, gdy wgłębienie po naciśnięciu palcem zostaje.”; drugie = to samo + „Przed pieczeniem uformowane ciasto nie powinno więcej niż podwoić objętości.” Zdania dosłownie z `docs/tresci/pl/drozdze-plan-przelicznik.md:7` i `:10-11` (DRO-MOD-016, DRO-MOD-013, DRO-MOD-015). Żyto (`rye_100_pan`) bez zmian: powierzchnia ciasta, D-256.
- Dwa nowe klucze (złożenie istniejących zdań, nie nowa treść): EN w `src/lib/i18n-en/czesc-28.ts`, 33 języki z `docs/lokalizacja/przeklad-m2-070n2-2026-11-09.json` wpięte `wepnij-maly-przeklad.py`, potem `npm run i18n:kontekst` (2217 kluczy, 0 błędów) i `npm run matrix:update`. Przekład każdego języka złożony skryptem z istniejących przekładów tych samych zdań w słownikach (podział po pierwszym znaku końca zdania, sprawdzony ręcznie dla 34 języków; ja i zh-Hant bez spacji).
- Wznowienie: test „trwający wypiek zapisany przed zmianą wznawia się z krokami z bazy, bez zmian” zielony (strażnik, nie test czerwony — zachowanie było poprawne przed zmianą). Sesje sprzed zmiany mają kroki z bazy; stare klucze zostają w słownikach i w kodzie (`INSTRUKCJE_SPRZED_070N2`, `src/recipes/yeast-stages.ts:59`).
- `scripts/br-wyjatki.json`: wpis „czesciowe” BR-ETAP-001 usunięty; `node scripts/br-bez-testu.mjs` nie wymienia już BR-ETAP-001 wśród scenariuszy bez testu. Receptury drożdżowe z katalogu bez planu zostają w wpisie BR-HARMO-001 (D-312 (3)).

## Teksty do akceptacji roli 04 (i 09)
- 070-N2: dwa nowe klucze-instrukcje kroków rośnięcia (dłuższy tekst w karcie „Co zrobić”; przy AX5 drugi klucz ma trzy zdania). Przekład złożony z przejrzanych zdań, przegląd natywny: brak (DEC-06).
- 08-p3-N1: istniejący komunikat o zimnej wodzie pierwszy raz widoczny na ekranie; wygląd jak ostrzeżenie o gorącej wodzie (alert) — czy ten sam wygląd pasuje do rady, nie ostrzeżenia, ocenia rola 04.
- 070-N5: bez nowych tekstów.

## Nowe znaleziska (nie naprawiane)
- 08-p3b-N1 (P3, D): alert zimnej wody ma testID `ddt-too-hot-warning` (`src/components/calculator/accordion/AccordionDdtSection.tsx`); nazwa myląca dla testów i E2E. Opcje: zmiana nazwy z aktualizacją testów (zgoda na zmianę testów), albo zostawić.
- 08-p3b-N2 (P3, proces): `wepnij-maly-przeklad.py` zmienia `index.ts` słowników, które mają nagłówek „Plik generowany: node scripts/wepnij-przeklad.mjs; nie edytuj ręcznie” — rozjazd z generatorem z repo (jak 08-p3-N5).
- 08-p3b-N3 (P2, M/P): scenariusz BR-ETAP-001 mówi o teście palca dla „receptury drożdżowej”, a wersja drożdżowa żyta ocenia powierzchnię (D-256). Wpis „czesciowe” usunięto zgodnie z poleceniem; odstępstwo opisuje tylko D-256 — rola 01 może dopisać wyjątek żyta w BRD (ER).

## Kroki właściciela / koordynatora
- Zrzuty przed/po dla trzech zmian (Stolnica w wersji drożdżowej, arkusz „Temperatura wody” przy DDT 18 °C i kuchni 30 °C, krok „Pierwsze rośnięcie” grahama na drożdżach).
- Akceptacja tekstów przez rolę 04; ER roli 01 dla BR-HARMO-001 (D-312 (3)) i ewentualnie wyjątku żyta w BR-ETAP-001.
- Status ID: naprawione-do-weryfikacji (zweryfikowane nadaje reaudit).

## Kontrola dowodów i sekretów
`node narzedzia/sprawdz-raport.mjs wynik-p3b.md /home/user/piekarz .` → kod 0: „OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone”.

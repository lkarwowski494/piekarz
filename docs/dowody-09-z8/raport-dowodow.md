# Raport dowodów: Z-8 (KO-025), sesja K, rola 09 fix — 2026-11-10

Gałąź `naprawy/M2-koordynator-napraw-2026-11-10-z8` od `2047ab00`. Decyzja: D-356 (`docs/decyzje.md`).

## Wynik
- **Akapit „Dostęp i zakup”:** był już przetłumaczony w 29 lokalizacjach (`de0c510e`, 2026-10-23; stary akapit z obietnicą próby w `ceb97519`). Nieaktualne były dokumenty wydania — poprawione: `docs/wydanie/droga-do-app-store.md` D2, `docs/wydanie/plan-wydania-1.0.md` §1 pkt 6, wiersz Z-8 `docs/monetyzacja.md`: zgłaszane są wszystkie 34 lokalizacje.
- **Test:** `tests/dostep-zakup-z8.test.ts` — przed: kod 1, 9 czerwonych (`dowody/test-z8-przed.txt`; 4 to kalibracja testu: „App Storu” cs/sl, „1回限り”/„1회성” ja/ko); po kalibracji 5 czerwonych z właściwego powodu (`dowody/test-z8-przed-kalibracja.txt`: dokumenty i notatka); po: 89/89 z `tests/store-metadata.test.ts` (`dowody/test-z8-po.txt`).
- **Notatka App Review** (§4.3 `docs/app-store-metadata-v2.md`): „There is no introductory offer and no free trial on the subscriptions; the lifetime purchase is a single payment that does not renew.” Stała wartość Pro: akapit „Ongoing value of the subscription” (był). 3951 B ≤ 4000 B.
- **Recenzja niezależna:** `dowody/recenzja-przekladu.md` — sens zgodny w 29; poprawki hr, ms, hu, id (przyjęte, sprawdzone w plikach); karty `docs/wydanie/ustawienia/` i `docs/wydanie/asc-kontrola-oczekiwane.json` wygenerowane na nowo.
- **sprawdz-wydanie.mjs metadane:** przed kod 0 (`dowody/metadane-przed.txt`), po kod 0 (`dowody/metadane-po.txt`).
- **npm run verify:** kod 0, 661 zestawów, 7076/7076 (`dowody/verify.txt`).

## Commity
- `3d8e3ece` test, dokumenty wydania, notatka App Review; zawężenie asercji `tests/store-metadata.test.ts` (wymaganie KO-025).
- `f148781e` poprawki przekładu z recenzji, karty, oczekiwania ASC, D-356.

## Nie zrobione / otwarte
- Wzór Oczka (`notatka-recenzja.txt`, repo lkarwowski494/oczko) nieprzeczytany: dodanie repo do sesji odrzucone przez klasyfikator uprawnień; użyte streszczenie koordynatora `docs/koordynacja/asc-oczko-2026-11-10.md` („no introductory offer”, „ongoing value”).
- Nowe znalezisko (poza zakresem): opis `ro` poza akapitem miesza formy „maialei/maiale/maiei” z „maielei/maiele” (recenzja; potwierdzone w pliku).
- Przegląd człowieka znającego język: nie było (próg „płatność”: drugi przegląd AI + człowiek albo decyzja właściciela z ryzykiem) — do decyzji właściciela.
- Notatka App Review ma zapas 49 B do limitu.
OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone

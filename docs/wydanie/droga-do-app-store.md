# Droga do pierwszego wydania w App Store — Piekarz

Stan: 2026-11-02 (noc, do weta; D-125) · Wzór: repo `trening`, `docs/41-droga-do-app-store.md` (punkty A–F), dostosowany do Piekarza. Plan wersji i wydania: `docs/wydanie/plan-wydania-1.0.md`; kroki w App Store Connect: `docs/wydanie/instrukcja-ustawien.md`; lista na telefonie: `docs/wydanie/lista-kontrolna-telefonu.md`; dziennik buildów i zgód: `docs/wydanie/dziennik.md`.

Zasada: ten dokument niczego nie wysyła. Każdy krok w App Store Connect (ASC), TestFlight i GitHub Actions, który zużywa limit albo zmienia sklep, wykonuje właściciel za zgodą na ten krok i ten build (`docs/wydanie/sklep.md` §2, §6).

## Ścieżka krytyczna (od dziś do zgłoszenia)

1. **iOS E2E na HEAD gałęzi** (`.github/workflows/e2e-ios.yml`: pełny katalog `.maestro/e2e` w buildzie z `EXPO_PUBLIC_E2E` i `.maestro/e2e-basic` w drugim buildzie Release bez tej zmiennej). Ostatni znany wynik: run 39924837386 na `b47abea`, failure (2026-10-23; `docs/wznowienie-M3.md`). Zielony: dalej; czerwony: rola 08 `fix` z logiem przebiegu.
2. **Build TestFlight z gałęzi** (`testflight.yml`), po zielonym E2E; zgoda właściciela z 2026-11-02: „Tak, po zielonym E2E (zalecane)”.
3. **Test na telefonie** wg `docs/wydanie/lista-kontrolna-telefonu.md` (ok. 30–40 min) i zakupy w piaskownicy (Basic i Pro).
4. **Krok ASC rano: usunięcie Free Trial** z `.pro.monthly` i `.pro.yearly` (Z-1), razem ze scaleniem do master z kodem Basic/Pro (osobna zgoda).
5. **Werdykt 07** na SHA kandydata (tor B nocy 2026-11-02 daje listę blokerów; werdykt na SHA kandydata robi rola 07 po scaleniu).
6. **Zrzuty z urządzenia** (A-2) i opis wydania, potem zgłoszenie (`sklep.md` §2 krok 4–5).

## Co zostaje poza agentem

| Krok | Kto | Dlaczego nie agent |
|---|---|---|
| Uruchomienie `testflight.yml` | właściciel (M1 w oknie runnera) | zużywa minuty macOS i tworzy build w ASC |
| Test na telefonie | właściciel | powiadomienia, blokada ekranu, VoiceOver, StoreKit: poza symulatorem CI |
| Free Trial w ASC (Z-1), ceny, produkty | właściciel | ASC: zmiana nieodwracalna lub widoczna w sklepie |
| Kontakt dla App Review, Copyright, DSA | właściciel | dane osobowe tylko w ASC, nie w repo |
| Wysłanie do recenzji, „Release This Version” | właściciel | `sklep.md` §6, osobna zgoda na każdy |

## Lista braków (A–F)

Kolumny: stan na 2026-11-02 · czy blokuje zgłoszenie · kto. Źródło stanu w nawiasie; czego nie sprawdzono w tej sesji, to `[DO USTALENIA]`.

### A. Build, jakość, wersja

| # | Pozycja | Stan | Blokuje | Kto |
|---|---|---|---|---|
| A1 | E2E na HEAD (`e2e-ios.yml`, katalog `e2e` + `e2e-basic`) | ostatni znany wynik czerwony (2026-10-23); wynik na HEAD `[DO USTALENIA]` (tor A nocy) | TAK | agent (CI) |
| A2 | `npm run verify` na commicie kandydata, kod 0 | sprawdza koordynator przy przyjęciu gałęzi | TAK | agent |
| A3 | Werdykt 07 na SHA kandydata (poprzedni: ZABLOKOWANE na `ebd8471`, 2026-10-19) | otwarty; tor B nocy | TAK | rola 07 |
| A4 | Build TestFlight z kandydata, wpis w dzienniku | czeka na A1 | TAK | właściciel |
| A5 | Wersja 1.0.0, numer buildu z workflow (1000 + run) | `app.json` 1.0.0; numer tylko z workflow (`sklep.md` §1) | nie | — |
| A6 | Szyfrowanie: `ITSAppUsesNonExemptEncryption: false` (`app.json:68`) | `instrukcja-ustawien.md` §9; potwierdzić w werdykcie 07 | nie | rola 07 |
| A7 | Test na telefonie (PH-01…), w tym aktualizacja z poprzedniego buildu | czeka na A4 | TAK | właściciel |

### B. Zakupy (Basic/Pro, D-112, D-113; `docs/monetyzacja.md`)

| # | Pozycja | Stan | Blokuje | Kto |
|---|---|---|---|---|
| B1 | Produkty: `com.apps4brew.baker.pro.monthly`, `.yearly` (grupa „Piekarz Pro”), `.lifetime` (Non-Consumable); ceny 0,99 / 6,99 / 14,99 USD; Family Sharing włączony 2026-10-21 | zapisane w ASC (`dziennik.md`, run 39583333126) | nie | — |
| B2 | **Z-1: usunąć Free Trial 2 Weeks** z obu subskrypcji, we wszystkich krajach, razem z buildem Basic/Pro | **nie wykonane**; właściciel 2026-11-02: „Nie, zrobię to rano” | TAK | właściciel |
| B3 | Zakup w piaskownicy: każdy plan, przywrócenie, tryb samolotowy, zwrot, Family Sharing; arkusz Apple bez oferty wprowadzającej | czeka na A4 (PH-20) | TAK | właściciel |
| B4 | Zrzut „App Review Screenshot” każdego produktu; opisy produktów (`asc-zgloszenie.mjs`, krok 3.7–3.8) | zrzut zakupu pokazuje ekran Pro po M3 `[DO USTALENIA]`: sprawdzić, że nie pokazuje próby | TAK | agent + właściciel |
| B5 | Pierwszy zakup każdego typu idzie w tym samym zgłoszeniu co wersja (`sklep.md` §2 krok 4.4) | do wykonania przy zgłoszeniu | TAK | właściciel |
| B6 | Brak „Review Notes” wymaganych tylko przy ofercie wprowadzającej: po Z-1 oferty nie ma, więc brak wymogu; sprawdzić w ASC w dniu zgłoszenia | `[DO USTALENIA]` | nie | właściciel |

### C. Zrzuty ekranu

| # | Pozycja | Stan | Blokuje | Kto |
|---|---|---|---|---|
| C1 | Zestawy iPhone 6,9″ i 6,3″, 7 ramek × lokalizacje (`docs/wydanie/zrzuty/`, sumy w `sumy.json`) | próbny zapis `pl` 2026-10-21; **ramki 2–4 i 6 wymagają odświeżenia po M3 (Z-8)**; zrzuty z urządzenia po teście właściciela (A-2) | TAK | agent + właściciel |
| C2 | iPad | niepotrzebny: `supportsTablet: false` (`app.json:61`) | nie | — |
| C3 | Zrzuty i opis nie pokazują funkcji PÓŹNIEJ (QR, druk, spiżarnia; D-043, `sklep.md` §3) | sprawdzić po odświeżeniu ramek; `widocznosc.md` nie ma tej listy | TAK | rola 10 |

### D. Metadane (ASC → wersja i App Information)

| # | Pozycja | Stan | Blokuje | Kto |
|---|---|---|---|---|
| D1 | Nazwa, podtytuł, opis, słowa kluczowe (≤ 100 **bajtów**), 34 lokalizacje | pliki `docs/wydanie/metadane/`, karty `docs/wydanie/ustawienia/`; skrypt `sprawdz-wydanie.mjs` z kodem 0 przed wysyłką | TAK | agent |
| D2 | Zdanie „Free Basic forever. Pro adds planning, starter care, more starters and recipes.” | w `pl`, `en-US`, `en-GB`, `en-AU`, `en-CA`; **29 lokalizacji bez przekładu akapitu „Dostęp i zakup”** (Z-8, `docs/monetyzacja.md`) | TAK (prawdziwość opisu, wytyczna 2.3) | M1 / rola 09 |
| D3 | Opis zgodny z kodem: funkcje Pro oznaczone, brak obietnicy próby i „tylko historia” | Z-8: w opisie wszystkich lokalizacji zdania o funkcjach dziś Pro bez oznaczenia | TAK | rola 10 |
| D4 | Adresy: polityka prywatności, wsparcie (kod 200 przed wysyłką) | `sklep.md` §2 krok 4.4; adres i telefon wsparcia (DSA) `[DO USTALENIA]`, właściciel | TAK | właściciel |
| D5 | App Privacy „Data Not Collected”, kategoria wiekowa (D-058), eksport kryptografii | `instrukcja-ustawien.md` §7–9 | TAK | właściciel |
| D6 | App Review: kontakt, notatki (EN) bez haseł | notatki: `docs/app-store-metadata-v2.md` §4.3; kontakt tylko w ASC | TAK | właściciel |
| D7 | Opcja wydania „Manually release this version” (DEC-16 a) | `sklep.md` §6 krok 2 | nie | właściciel |
| D8 | „Co nowego” | 1.0 nie ma pola; szkic dla 1.0.1 i dla opisu TestFlight: `docs/wydanie/opis-zmian-1.0.md`; przekład na 33 języki czeka (tabela w tym pliku) | nie | rola 10 |

### E. Prawo, kontakt

| # | Pozycja | Stan | Blokuje | Kto |
|---|---|---|---|---|
| E1 | Status tradera DSA i dane kontaktowe na stronie wsparcia | `instrukcja-ustawien.md`, „Otwarte” | `[DO USTALENIA]` | właściciel |
| E2 | ICP dla CHN (D-057) | `instrukcja-ustawien.md`, „Otwarte” | `[DO USTALENIA]` | właściciel |
| E3 | Licencje zależności (`npm run check:licenses`) | część `npm run verify` | nie | agent |
| E4 | Ekran „Źródła wiedzy” (D-123): nazwy źródeł tylko tam; nic w ASC nie przypisuje aplikacji źródeł | `tests/zrodla-poza-ekranem-t2.test.ts` | nie | agent |

### F. Wysyłka

| # | Pozycja | Stan | Kto |
|---|---|---|---|
| F1 | Wersja 1.0 w ASC: build z TestFlight, zrzuty, metadane, produkty w jednym zgłoszeniu → „Add for Review” → „Submit for Review” | po A–E | właściciel |
| F2 | Recenzja Apple; po odrzuceniu: odpowiedź w Resolution Center (szkic przygotowuje agent), naprawa wg progu | czas recenzji `[DO USTALENIA]` (strona Apple w dniu wysyłki) | Apple / agent |
| F3 | Plan wydania i lista W1 (`plan-wydania-1.0.md`) | opisane | właściciel |

## Czas (podwójna miara, szacunek)

- **Praca agenta** do gotowości zgłoszenia, bez czekania: odświeżenie 4 ramek zrzutów i opisu ok. 2–3 h agenta po teście właściciela; ewentualna poprawka po czerwonym E2E: zależy od logu `[OCENA]`.
- **Czekanie:** E2E ok. 1–2 h runnera, build TestFlight ok. 1,5 h (wzór `trening`), recenzja Apple `[DO USTALENIA]`.
- **Czas właściciela:** test na telefonie 30–40 min, ASC (Z-1, kontakt, wysłanie) ok. 30 min, plus decyzje wg `docs/wydanie/plan-wydania-1.0.md` §1.

## Przeczytane i niezweryfikowane

Strony Apple przytoczone w `sklep.md` i `instrukcja-ustawien.md` mają daty odczytu 2026-10-20/21; w dniu wysyłki nazwy przycisków i wymiary zrzutów trzeba sprawdzić ponownie (zasada roli 10, pkt 1). Tego dokumentu nie wypełniono nowym odczytem stron Apple (noc, bez przeglądarki).

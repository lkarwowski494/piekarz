# Rola 10 — tryb fix, 2026-11-09 (M2 partia 3): M1-audytor-generalny-078, -080, -082

Gałąź `naprawy/M2-koordynator-napraw-2026-11-09-p3` od 3e0fa3fa; wypchnięta (HEAD 6a6b410e). Bez buildu, bez App Store Connect, bez zmian w `site/` i `.github/workflows/`.

## E0 — środowisko i klasyfikacja
- Linux (bez Xcode), Node v22.23.4, git, push na gałąź działa; sieć do developer.apple.com działa (odczyty niżej).
- 078 (DEC-05 a) i 080 (DEC-01 a): P z wyborem właściciela (D-286) → wdrożone. 082 (DEC-14 a): P z wyborem → **dowód przeciwko wyborowi, bez zmian** (niżej).

## Commity
| SHA | ID | Zmiana |
|---|---|---|
| a6d8013c | M1-audytor-generalny-078; 02-monetyzacja-001, 10-wydanie-005 | „(Pro)” w tekście promocyjnym 34 lokalizacji, nagłówek sekcji planu, zaczyn, „opieka nad zakwasem (Pro): …”, statystyki dziennika; EN: zdanie wstępu z planem wstecz; źródło PL/EN §1–§2, §5, §5.1 `docs/app-store-metadata-v2.md`; karty `docs/wydanie/ustawienia/` |
| 6a6b410e | M1-audytor-generalny-080; 10-wydanie-004, 01-odkrywanie-005, 11-wzrost-004 | 26 receptur bazowych, 11 z planem i prowadzeniem; nowa sekcja „wersja na drożdżach i maszyna do chleba” (godzina startu „(Pro)”); fr/it skróty bez zmiany treści (limit 4000); README wiersz „Receptury i ilości” |

## Testy przed/po
- `tests/opis-sklepu-pro-078.test.ts`: przed 41 failed / 3 passed (`dowody/078-przed.txt`; wersja testu z dodatkowym przypadkiem zdania dostępu, usuniętym — patrz decyzje), po 43 passed (`dowody/078-po.txt`).
- `tests/opis-sklepu-receptury-080.test.ts`: przed 70 failed / 2 passed (`dowody/080-przed.txt`), po 72 passed (`dowody/080-po.txt`).
- `npm run verify` po `git add`: kod 0 przed każdym commitem (`dowody/verify-078.txt`: 644 zestawy, 6653 testy; `dowody/verify-080.txt`: 6725 testów).
- `node scripts/sprawdz-metadane.mjs --pomiar`: kod 0 (`dowody/sprawdz-metadane-po.txt`). Najdłuższe opisy po zmianie: el 3994, de-DE 3990, fr 3984, it 3984 (limit 4000); promocje ≤ 168.

## Decyzje w trakcie (do weta)
- Akapit „Dostęp i zakup” bez zmian: zdanie „Free Basic forever. Pro adds planning, starter care, more starters and recipes.” to słowa kontraktu (`docs/monetyzacja.md:106`, `tests/oferta-dokumenty.test.ts`); test 078 wyłącza ten akapit z wymogu oznaczenia (opisuje samo Pro).
- Ramki (PNG) bez zmian: DEC-05 a obejmuje tekst promocyjny i sekcje; ramki 1 i 5 mają plakietkę Pro w `podpisy.json` (test 078 sprawdza to dla pl i en-US). Nie trzeba nowych PNG.
- Sekcja maszyny skrócona w PL/EN i przekładach, żeby de/el/fr/it zmieściły się w 4000 znaków.

## 082 — dowód przeciwko wyborowi DEC-14 a, bez zmian
Wybór: „osobny klucz Developer tylko do uploadu i procedura unieważnienia”. Odczyt 2026-11-09 (`dowody/apple-role-klucze-2026-11-09.txt`, `dowody/apple-tabela-rol-2026-11-09.txt`):
- developer.apple.com/help/account/access/roles/: wiersz „Upload builds”, kolumna Developer: „Requires access to Certificates, Identifiers & Profiles, granted in Users and Access”; „Create and delete distribution provisioning profiles”: Developer — brak.
- developer.apple.com/help/app-store-connect/get-started/app-store-connect-api/: klucz zespołu — „Under Access, select the role permissions to determine what the API can be used for”; „you can’t edit its name or access level”.
- `testflight.yml` podpisuje w chmurze przy eksporcie (`xcodebuild -exportArchive … -allowProvisioningUpdates`, `signingStyle automatic`, archiwum bez podpisu): potrzebny profil dystrybucyjny i certyfikat zarządzany w chmurze.
Wniosek: klucz zespołu z rolą Developer najpewniej nie wyśle buildu tym workflowem (brak dostępu do Certificates, Identifiers & Profiles, którego klucz zespołu nie dostaje osobno) — wdrożenie zepsułoby ścieżkę TestFlight. `[DO USTALENIA]`: potwierdza tylko próba właściciela.
Opcje dla właściciela:
- (a1) dwa klucze zespołu: build `testflight.yml` z kluczem **App Manager** pod osobnymi nazwami sekretów (np. `ASC_BUILD_KEY_*`), a obecny klucz dla `asc-*.yml` w środowisku GitHub z wymaganą akceptacją; plus procedura unieważnienia — mniejszy zasięg wycieku z buildu (bez Admina), koszt 20–30 min w ASC i GitHub; rekomendacja.
- (a2) klucz Developer do uploadu + podpis ręczny (certyfikat .p12 i profil jako sekrety) — najmniejsza rola klucza, ale dwa dodatkowe sekrety i coroczna wymiana certyfikatu.
- (b) bez zmian + tylko procedura unieważnienia (`docs/prawne/procedura-bezpieczenstwa.md`) — najtaniej.
Najpierw krok właściciela: sprawdzić rolę obecnego klucza (Users and Access → Integrations → Team Keys). Workflowy to ścieżka wrażliwa: wdrożenie po wyborze z przeglądem subagenta.

## Przekład i przeglądy
- 32 lokalizacje: przekład roli 10 (claude-opus-5-5, w sesji), skrypty i teksty: `narzedzia/tl.py`, `narzedzia/machine2.py`, `narzedzia/apply078.py`, `narzedzia/apply080.py`; każdy plik metadanych ma wpis w `poprawki`.
- **Drugi przegląd AI przekładu: nieodbyty** (brak narzędzia subagentów) — polecenie: `polecenie-drugi-przeglad-przekladu.md`. Przegląd natywny: nieodbyty (DEC-06). Przegląd ścieżki wrażliwej: nie dotyczy (bez zmian w workflowach, zakupach, danych).
- Teksty do akceptacji roli 04 (brzmienie PL/EN): tekst promocyjny pl i en-US/en-CA, sekcja „WERSJA NA DROŻDŻACH I MASZYNA DO CHLEBA” / „YEAST VERSION AND BREAD MACHINE”, zdanie „Opieka nad zakwasem (Pro): …” / „Starter care (Pro): …”, „(zaczyn: Pro)” / „(preferment: Pro)” (`docs/wydanie/metadane/pl.json`, `en-US.json`). Nowych tekstów interfejsu (t()) brak.

## Przekazania
- 07: testy 078 i 080 w zestawie; wynik verify jak wyżej.
- 06: nowe twierdzenia sklepu bez faktów dziedzinowych (liczby z kodu: `CATALOG_RECIPES` 26, plan 11, `WERSJE_DROZDZOWE` 4, `maPlanDrozdzowy` 3).
- 08: brak zmian kodu.

## Kroki właściciela
1. App Store Connect, każda lokalizacja przy najbliższej wersji: wkleić tekst promocyjny i opis z `docs/wydanie/ustawienia/<kod>.md` (karty przegenerowane); zrzuty bez zmian.
2. DEC-14: wybór (a1)/(a2)/(b) po sprawdzeniu roli obecnego klucza.
3. Po drugim przeglądzie przekładu (M2) ewentualne poprawki w metadanych.

## Znaleziska nowe
- 10-wydanie-N1 (P2, D): `site/index.html` podaje „15 receptur bazowych” (strona apps4brew-www, poza zakresem tej sesji — zakaz zmian strony).
- Notatki dla App Review nadal bez trybu maszyny (10-wydanie-006, osobne ID poza tą sesją).

## Kontrola raportu
`node sprawdz-raport.mjs wynik.md /home/user/piekarz` → „OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone”, kod 0.

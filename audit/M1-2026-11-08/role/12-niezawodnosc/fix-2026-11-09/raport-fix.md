# 12-niezawodnosc · fix 2026-11-09 · M1-audytor-generalny-003 (12-niezawodnosc-001)

## E0 (środowisko i klasyfikacja)
- Linux (kontener w chmurze), Node v22.23.4, git na gałęzi `naprawy/M2-koordynator-napraw-2026-11-09-p1`, push działa (2 commity wypchnięte). Bez Xcode i symulatora: zrzutów ekranu „przed/po” nie ma (krok właściciela na TestFlight).
- Rodzaj P, wybór właściciela DEC-17 a (D-286, `docs/decyzje.md:1677`). Dowodu przeciwko wyborowi nie znalazłem.

## E1 (commity)
- `2665582f` refactor (strukturalny, bez zmiany zachowania): czytelnicy przyjmują połączenie: `czytajReceptury` (`src/data/recipes-store.ts`), `czytajMaki` (`src/data/flour-store.ts`), `czytajWpisyZakwasow` (`src/data/starter-entries-store.ts`), `readStarters` (eksport). Test `src/data/__tests__/odczyt-z-polaczenia-003.sqlite.test.ts`.
- `26f6a87f` fix: `src/lib/import-pakietu.ts` (pakietZJson, kopiaZPakietu), `src/data/dane-z-bazy.ts` (zbierzDaneZBazy), `rozpoznajPlik` rodzaj „pakiet” (`src/lib/import-z-pliku.ts`), arkusz importu czeka na odczyt pakietu (`src/components/settings/ImportZPlikuArkusz.tsx`), ostrzeżenie + „Napisz do nas” w `src/components/RescueScreen.tsx` i `src/components/StorageGate.tsx`; 3 teksty, EN i 33 języki.
- Mechanizm: `grep -rn "napiszDoAutora" src app` → 3 użycia poza definicją (StudioEcosystemSection, RescueScreen, StorageGate).

## E2 (dowody)
- Test przed (czerwony z właściwego powodu: brak modułu importu pakietu, arkusz pokazuje `import-unrecognized`, brak ostrzeżenia na ekranach, brak tekstów): `dowody/003-test-przed.txt`.
- Test po (10/10 zielone): `dowody/003-test-po.txt`. Pełne `npm run verify`: kod 0, 591 zestawów, 6079 testów.
- Dane testowe: kopia bazy buildu 1021 (`tests/fixtures/baza-1021-39f3890.sql`, 4 wypieki, 2 zakwasy, 2 sesje jak sonda S1) z zapisem tylko w `-wal`; kontrola: bez `-wal` zmiany nie ma. Danych użytkownika nie dotykałem (SHA-256: nie dotyczy).
- Przegląd ścieżki wrażliwej: nieodbyty, polecenie w `dowody/przeglad-sciezki-wrazliwej-polecenie.md`.
- Drugi przegląd AI przekładu: nieodbyty (brak narzędzia subagentów); zapis w `docs/lokalizacja/przeklad-m2-003-2026-11-09.json` (`drugi_przeglad`).

## Nowe znaleziska (nie naprawiane)
### 12-niezawodnosc-701 · Kopii .db sprzed migracji z ekranu błędu bazy import dalej nie przyjmuje
- Pozycja listy kontrolnej: NIE-14 · Poziom: P2 · Realność: brzegowy · Pewność: wysoka · Rodzaj: P
- Dowód: `src/components/StorageGate.tsx` udostępnia `backup_pre_migration-*.db` (rodzaj `przed-migracja`); import czyta tylko tekst (`rozpoznajPlik`). Ekran ma teraz ostrzeżenie i kontakt, ale bez zdania o imporcie.
- Opcje: (a) ekran błędu migracji udostępnia pakiet z kopii sprzed migracji (ten sam format, import już działa); (b) bez zmian, droga przez kontakt. Rekomendacja: (a).
### 12-niezawodnosc-702 · Import pakietu przez schowek może nie udźwignąć pakietu wielkości bazy
- Pozycja listy kontrolnej: NIE-05 · Poziom: P2 · Realność: brzegowy · Pewność: średnia · Rodzaj: P
- Dowód: arkusz bierze treść ze schowka albo pola (`src/components/settings/ImportZPlikuArkusz.tsx`, nagłówek: wybór pliku `[DO USTALENIA]`); pakiet to base64 całej bazy. Czy iOS skopiuje i wklei kilka MB tekstu z Plików: `[DO USTALENIA]`, test na telefonie (krok właściciela).
- Opcje: (a) expo-document-picker dla „Importuj z pliku” (nowa zależność natywna, nowy build); (b) bez zmian. Rekomendacja: (a) przy następnym buildzie.
### 12-niezawodnosc-703 · Trwający i zaplanowany wypiek z pakietu nie wracają
- Pozycja listy kontrolnej: NIE-03 · Poziom: P2 · Realność: brzegowy · Pewność: wysoka · Rodzaj: P
- Dowód: format kopii (`PiekarzBackupData` w `src/lib/backup.ts:25`) nie ma `bake_sessions`; import pakietu idzie tą ścieżką (wymóg polecenia), więc 2 sesje z pakietu 1021 nie wracają — tak samo jak przy imporcie pliku kopii. Decyzja formatu: rola 05.

## Kontrola dowodów i sekretów
`node sprawdz-raport.mjs` (kopia w scratchpadzie) na `wynik.md` i `raport-fix.md`: „OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone” (oba, kod 0).

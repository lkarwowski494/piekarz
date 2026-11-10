# Stan sesji L (rola 09, fix): odnawianie subskrypcji w opisie sklepu — 2026-11-10

Polecenie: `docs/koordynacja/polecenia/L.md` (gałąź `koordynacja` @ f24b8c54). Gałąź: `naprawy/M2-koordynator-napraw-2026-11-10-odnawianie` od `b5007a00`.

## Zrobione (commit „wip”, niedokończone)
- Test akceptacyjny `tests/opis-sklepu-odnawianie-ko031.test.ts`, czerwony przed zmianą: 40 nie przeszło, 3 przeszły (`docs/dowody-09-odnawianie/test-przed.txt`).
- 34 lokalizacje `docs/wydanie/metadane/*.json` + źródło `docs/app-store-metadata-v2.md`: zdanie aplikacji o odnawianiu (słowniki) + zdanie o „Przywróć zakupy” (`docs/dowody-09-odnawianie/zdania-przywracania.json`); P3: en-* „Basic is free forever, with no trial period.”, ms „untuk akses seumur hidup”, ko „Pro는 App Store에서…”.
- Brzmienie kontraktu EN (R-1): `docs/monetyzacja.md:106`, D2 w `docs/wydanie/droga-do-app-store.md`, `tests/oferta-dokumenty.test.ts` (do zapisu jako D-359).

## KO-032 (właściciel ~21:25: opcja A, „Usuń 2 zdania wszędzie”)
- Wykonane: oba zdania usunięte w źródle i 34 lokalizacjach (`docs/dowody-09-odnawianie/usuniete-zdania-ko032.json`), max fr 3989/4000; test akceptacyjny 79/79; liczniki §1.2/§2.2/§5.1.1; karty i asc-kontrola-oczekiwane zregenerowane; wpis w `poprawki`.
- KOREKTA wysłana do koordynatora: zdanie o powiadomieniach przypina `tests/teksty-sklepu.test.ts:221-222` (081); moja wcześniejsza informacja „bez testu” była błędna (grep bez -r). Opcje A/B/C, rekomendacja A. Czekam.

## Otwarte (stan sprzed KO-032)
- Pytanie do koordynatora (wysłane): 10 lokalizacji > 4000 znaków (de-DE 4184, el 4164, es-ES 4036, es-MX 4055, fr-CA/fr-FR 4193, id 4002, it 4173, nl-NL 4136, pt-BR 4103, pt-PT 4085). Opcje A/B/C, rekomendacja A (usunąć zdanie o cofaniu kroku i drugie zdanie „Warto wiedzieć” we wszystkich 34 + źródło).
- Kontrola tłumaczeniem zwrotnym (subagent) → `docs/dowody-09-odnawianie/tlumaczenie-zwrotne.md`.
- Po decyzji: liczniki znaków w §1.2/§2.2/§5.1.1, `npm run karty:ustawien`, asc-kontrola-oczekiwane, `sprawdz-wydanie.mjs metadane` (metoda z `docs/dowody-10-109/`), `npm run verify` → `docs/dowody-09-odnawianie/verify.txt`, decyzje D-359…D-361, PRZEKAZANIE.
- Nowe znalezisko: sl — opis forma „vi”, aplikacja „ti” (zdanie o odnawianiu wzięte z aplikacji).

## Stan testów
Czerwone (oczekiwane do czasu decyzji): ko031 (limit w 10 lokalizacjach), teksty-sklepu (liczniki), instrukcja-ustawien (karty), asc-zgloszenie, metadane-sklepu, dostep-zakup-z8 (limit).

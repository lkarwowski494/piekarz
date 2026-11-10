# Sesja K: Z-8 — przekład akapitu „Dostęp i zakup” + notatka App Review (rola 09, fix) — Piekarz
Koordynator: session_01T66VBwJhDDVhFKP86KKRQA (raporty, pytania i PRZEKAZANIE tylko przez send_message do tego ID). Gałąź stanu: `koordynacja` (tylko do odczytu).

1. Rola: 09-lokalizacja. Prompt roli: `git show origin/audit-m1/piekarz-2026-11-08:audit/M1-2026-11-08/naprawy/polecenia/rola-09-lokalizacja-prompt.md` — przeczytaj w całości, jesteś tą rolą. Biblioteki prompts nie dołączasz.
2. Start: `redesign/piekarz-2026-10-22` @ `2047ab00` (zawiera 109: liczba receptur 10). Gałąź `naprawy/M2-koordynator-napraw-2026-11-10-z8` od `2047ab00`. `npm ci`.
3. Decyzja właściciela KO-025 (2026-11-10): Z-8 — przetłumaczyć akapit „Dostęp i zakup” opisu sklepu na wszystkie lokalizacje bez przekładu (29 wg `docs/wydanie/droga-do-app-store.md` i `plan-wydania-1.0.md` §1 pkt 6) i zgłosić wszystkie 34 lokalizacje. Wzór Oczka (przekład całości z krytykiem): `docs/koordynacja/asc-oczko-2026-11-10.md` na `koordynacja`. Wszystkie treści o płatnościach muszą być zgodne z `docs/monetyzacja.md` (Basic/Pro, D-112, D-113; bez oferty wprowadzającej).
4. Zadania:
   1. Ustal z plików `docs/wydanie/metadane/*.json` (i źródła PL/EN `docs/app-store-metadata-v2.md`), które lokalizacje nie mają akapitu; test akceptacyjny najpierw czerwony (każda lokalizacja ma akapit odpowiadający PL/EN; limity znaków ASC; brak polskich słów poza pl).
   2. Przekład akapitu w brakujących lokalizacjach (bez zmiany innych części opisu), regeneracja kart `docs/wydanie/ustawienia/*.md` i `asc-kontrola-oczekiwane.json` tak jak zrobiła sesja H (`karty:ustawien`).
   3. Notatka dla App Review (`docs/app-store-metadata-v2.md` ok. 198–235): dopisz wprost „no introductory offer / no free trial” dla subskrypcji oraz stałą wartość Pro (wzór Oczka: `notatka-recenzja.txt` wiersze 17–19 w repo lkarwowski494/oczko gałąź `claude/build3-2026-11-10`) — zgodnie z monetyzacja.md.
   4. Recenzja niezależna przekładu (świeży subagent — natywna poprawność, sens zgodny z PL/EN, terminologia sklepu Apple w danym języku), `sprawdz-wydanie.mjs metadane` kod 0, `npm run verify` kod 0 (dowód `docs/dowody-09-z8/verify.txt`), push, PRZEKAZANIE.
5. Zakazy: nie uruchamiasz workflowów, nie zmieniasz App Store Connect, nie scalasz do `redesign`/`master`, nie tworzysz/archiwizujesz sesji, nie piszesz na `koordynacja`/`audit-m1`, nigdy --no-verify ani force-push, nie pytasz właściciela. Skaner `sekrety --historia` daje kod 1 przez znane fałszywe alarmy (sesja H, `docs/dowody-10-109/sekrety-historia.txt`) — nie poprawiasz go.
6. Decyzje: tryb „właściciel” — pytanie do koordynatora z ≥ 2 opcjami i rekomendacją. Numery: D-356…D-358.
7. Kontekst: od 30% okna kończysz krok, stan w `docs/stan-09-z8-2026-11-10.md`, push, PRZEKAZANIE.

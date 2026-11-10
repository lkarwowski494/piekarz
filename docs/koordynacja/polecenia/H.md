# Sesja H: 109 — liczba receptur w opisie sklepu i README (rola 10, fix) — Piekarz
Koordynator: session_01T66VBwJhDDVhFKP86KKRQA (raporty, pytania i PRZEKAZANIE tylko przez send_message do tego ID). Gałąź stanu: `koordynacja` (tylko do odczytu).

1. Rola: 10-wydanie. Prompt roli: `git show origin/audit-m1/piekarz-2026-11-08:audit/M1-2026-11-08/naprawy/polecenia/rola-10-wydanie-prompt.md` — przeczytaj w całości, jesteś tą rolą (zadanie bierzesz z tego polecenia). Biblioteki prompts nie dołączasz.
2. Start: `master` @ `c2c5e206` (= `redesign`). Gałąź `naprawy/M2-koordynator-napraw-2026-11-10-109` od `c2c5e206`. `npm ci`.
3. Wejście: pozycja M1-audytor-generalny-109 (P3) w `origin/audit-m1/piekarz-2026-11-08:audit/M1-2026-11-08/plan-napraw.json`; raport `origin/audit-m1/piekarz-2026-11-08:audit/M1-2026-11-08/reaudit-2026-11-10/10-wydanie/10-wydanie-reaudit-2026-11-10.md` (10-wydanie-701). Opis w sklepie (34 lokalizacje), źródło PL/EN i README podają 11 receptur na zakwasie z planem; po D-317 jest 10. Właściciel 2026-11-10 (KO-024): naprawa przed zgłoszeniem do App Store, zrzuty dopiero po jego teście telefonu (nie robisz zrzutów).
4. Zadania:
   1. Test akceptacyjny najpierw czerwony: liczba receptur z planem (katalog bez `powodBezPlanu`) zgodna z liczbą w opisie sklepu każdej lokalizacji, w źródle PL/EN i w README (liczba w każdym języku w jego zapisie liczbowym/słownym — sprawdź format w plikach).
   2. Poprawka tekstów (tylko liczba i ewentualnie forma gramatyczna; bez innych zmian treści), `sprawdz-wydanie.mjs` (metadane, prywatnosc, sekrety --historia) kod 0, `npm run verify` kod 0 (dowód w `docs/dowody-10-109/verify.txt`).
   3. Recenzja niezależna (świeży subagent, zwłaszcza formy liczebnika w językach fleksyjnych), push na gałąź, PRZEKAZANIE (SHA, pliki, wyniki).
5. Zakazy: nie scalasz do `redesign` ani `master`, nie uruchamiasz workflowów (asc-*, testflight, e2e), nie zmieniasz App Store Connect, nie tworzysz i nie archiwizujesz sesji, nie piszesz na `koordynacja` ani `audit-m1`, nigdy --no-verify ani force-push, nie pytasz właściciela. Nie obniżasz progów, nie pomijasz testów.
6. Decyzje: tryb „właściciel” — pytanie do koordynatora z ≥ 2 opcjami i rekomendacją. Numery: D-346…D-348.
7. Kontekst: od 30% okna kończysz krok, stan w `docs/stan-10-109-2026-11-10.md`, push, PRZEKAZANIE.

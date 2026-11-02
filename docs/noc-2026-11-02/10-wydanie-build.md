# Raport: rola 10-wydanie, tryb build, tor C nocy 2026-11-02

Gałąź: `noc/10-wydanie-2026-11-02` (od `origin/redesign/piekarz-2026-10-22` @ `38f8e5f`) · Decyzja: D-125 (noc, do weta) · Termin: 2026-11-03 06:00 UTC.

## E0: środowisko i wejście
- Linux, Node v22.23.4, git; push na gałąź roboczą możliwy; brak Xcode i symulatora iOS (E2E i TestFlight tylko w GitHub Actions u właściciela).
- Polecenie roli pobrane z artefaktu (repo `prompts` prywatne, `add_repo` odrzucone), skrót SHA-256 zgodny z `970ef322b8c2f826`.
- Wzorce `trening` (`docs/39`, `41`, `42`) przeczytane z klonu publicznego repo, 2026-11-02.
- Stan CI: wynik iOS E2E na HEAD nie sprawdzony w tej sesji (tor A koordynatora); ostatni znany czerwony run 39924837386 (2026-10-23). Raport 07 na nowym SHA: brak (tor B).

## Wykonane
| Zadanie | Wynik |
|---|---|
| (1) Dokumenty wydania | `docs/wydanie/droga-do-app-store.md`, `plan-wydania-1.0.md`, `lista-kontrolna-telefonu.md` |
| (2) Z-8, §4 instrukcji | §4 był już poprawny (M3 P-a-fix); poprawiono 3 rozjazdy w tym samym pliku (wstęp, zdanie o cenach, tabela źródeł Apple) |
| (3) Szkic opisu zmian | `docs/wydanie/opis-zmian-1.0.md` (PL, EN, tabela dowodów); przekład 33 języków jako zadanie w tabeli, nie uruchomiony |

## Decyzje
D-125 (pięć punktów, noc, do weta): `docs/decyzje.md`.

## Wyjątek nazwany
Zadanie przekładu nie trafiło do `docs/lokalizacja/czeka-na-przeklad.json`, bo `tests/czeka-na-przeklad-093.test.ts` wymaga pustej listy kluczy (tekst sklepu nie jest kluczem słownika). Mechanizm zastępczy: tabela w `opis-zmian-1.0.md`.

## Nie sprawdzono
- Nowego odczytu stron Apple w tej sesji (daty odczytu 2026-10-20/21 z `sklep.md`, `instrukcja-ustawien.md`).
- Zgodności listy `lista-kontrolna-telefonu.md` z aktualnymi scenariuszami `.maestro/` na poziomie pojedynczych kroków (lista pisana ręcznie).
- Wyniku iOS E2E na HEAD.

## Kroki właściciela (nic z tego nie wykonano)
1. Z-1: usunąć Free Trial z `.pro.monthly` i `.pro.yearly` w ASC (razem ze scaleniem do master, osobna zgoda).
2. Build TestFlight po zielonym E2E, test na telefonie wg `lista-kontrolna-telefonu.md`.
3. Zrzuty z urządzenia (A-2), przekład akapitu „Dostęp i zakup” w 29 lokalizacjach (Z-8).
4. Decyzje do weta: D-125; pytanie o pełny audyt przed upublicznieniem (`plan-wydania-1.0.md` §1 pkt 3); progi pauzy i budżet czasu po premierze (§3, §6).

## Weryfikacja
`npm run verify` kod 0 (2026-11-02, TMPDIR w scratchpadzie): typecheck, i18n, licencje, rozmiar, lint, iOS native, macierz, 512 zestawów / 5564 testów zielone.

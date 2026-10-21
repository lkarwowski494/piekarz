# Przekazanie pracy M1 (audyt i plan napraw Piekarza), stan na 2026-10-21

Ten dokument pozwala kontynuować pracę z innego konta Claude albo na innym komputerze. Jest w publicznym repo, więc nie ma w nim sekretów ani danych z katalogu audytu.

## 1. Gdzie jesteśmy

- Audyt M1 z 2026-10-19 (baza `ebd8471`) i plan 118 napraw w 7 partiach są **wykonane**. Każda partia zaczyna się od końca poprzedniej.
- **Reaudyt M1 (pętla 1) jest GOTOWY** (2026-10-21, na `e544eec`). Raport: `K/M1-audytor-generalny-reaudit-2026-10-21.md`. Plan ma teraz 179 zadań (`sprawdz-plan` kod 0): 88 zweryfikowanych, 23 otwarte, 7 regresji. Werdykt: **do korekty, ZABLOKOWANE**. Reaudyt stoi na **STOP 2**: właściciel decyduje o nowych zadaniach i kolejnej partii, przeczytaj sekcję decyzji w raporcie.
- Wstępne wyniki reaudytu:
  - rola 09: regresja P1 w 093, czyli przeliczanie imperialne po przekładzie (różnica 10 °C pokazuje się jako 50 °F; w ru, uk, bg gramy nie są przeliczane). Zadania 071, 074 i 096 są nadal otwarte;
  - rola 11: 082 otwarte, 1 nowe P1 i 3 P2.
- **`master` = e544eec** (2026-10-21, decyzja właściciela: „ok, działaj”). Fast-forward z ebd8471 o 305 commitów. Tagi: `przed-scaleniem-2026-10-21` (ebd8471, punkt powrotu) i `reaudyt-petla1-zablokowane` (e544eec, znane regresje, wersja niewydawalna). **Kolejne partie zaczynają się od `master`.**

## 2. Gałęzie (wszystkie wypchnięte do `origin`)

| Gałąź | Koniec | Zawartość |
|---|---|---|
| `naprawy/M2-koordynator-napraw-2026-10-19-p1` … `-p4` | feee643, 7bb3f7d, 333bbf7, 9bb7dc8 | partie 1–4 napraw |
| `naprawy/M2-koordynator-napraw-2026-10-19-p5` | 2b943bc | nowa szata graficzna; wcześniej scalone role 01–04 (BRD, monetyzacja, kontrakt zakresu B, projekt) |
| `naprawy/M2-koordynator-napraw-2026-10-19-p6` | 8e0b8fa | poprawki po audycie roli 04 (106–117) |
| `naprawy/M2-koordynator-napraw-2026-10-19-p7` | **e544eec** | scalony M5 (`widocznosc/piekarz-2026-10-20`, 4ccfc41), przekład 33 języków, sklep, README, zrzuty, instrukcja ustawień |
| `przekazanie/m1-2026-10-21` | — | ten dokument (gałąź od e544eec) |

`p7` to czubek całego łańcucha i od niego kontynuujesz. Strona studia jest w repo `lkarwowski494/apps4brew-www`: `main` = efa7ff0, strony `piekarz/`.

## 3. Dane poza repo (prywatne, nie ma ich w GitHub)

| Ścieżka na komputerze właściciela | Co zawiera |
|---|---|
| `C:\Users\lukas\Projekty\piekarz\audit\M1-2026-10-19\M1-2026-10-19\` (**K**) | `plan-napraw.json` (118 zadań, decyzje właściciela, statusy), raporty ról i M2, `postep-napraw.md`, prompty partii, narzędzia (`narzedzia/sprawdz-plan.mjs` i in.), dowody |
| `C:\Users\lukas\Projekty\piekarz\audit\M5-2026-10-20\` | raport M5 (widoczność w sklepie) |
| `C:\Users\lukas\Projekty\piekarz\audit\02-*` | bramka opłacalności i warianty monetyzacji |
| `C:\Users\lukas\Projekty\narzedzia-api\` | przekład przez Claude API (Batches): `PRZEKLAD-README.md`, wyniki `przeklad/languages/`, `.env` z kluczem API (nigdy nie kopiować do repo) |
| `C:\Users\lukas\Projekty\prompts\` | biblioteka ról (prywatne repo `lkarwowski494/prompts`); polecenia składa `tools/assemble.mjs` |

Na innym komputerze trzeba te katalogi skopiować ręcznie (np. zip przez dysk prywatny). `audit/` jest wykluczony z gita (`.git/info/exclude`: `/audit/`). Nie dodawaj go do publicznego repo, bo są tam recenzje i dane konkurencji.

## 4. Kluczowe decyzje właściciela (szczegóły i dosłowne słowa w `plan-napraw.json`)

- **Monetyzacja (DEC-01 d, stała, nie do zmiany):**
  - miesięczna 0,99 USD, roczna 6,99 USD (jedna grupa), dożywotni 14,99 USD;
  - PL 4,99 / 29,99 / 79,99 zł;
  - 14 dni oferty wprowadzającej na obu planach;
  - za darmo na zawsze tylko historia oraz eksport i usunięcie danych.
- **Języki:** 35 według listy Treningu. Przekład przez API kosztował 53,01 USD z limitu 70 USD.
- **Nazwa (D-053):** lokalna w każdym języku, po angielsku „Baker: Sourdough Bread Planner”. Zmianę na apps4brew.com robi się **na końcu**.
- **Miary USA:** domyślnie według regionu telefonu (D-044).
- **Do weta właściciela z partii 7:**
  - D-056: licencja „All rights reserved”;
  - D-057: bez Chin kontynentalnych;
  - D-058: kategoria wiekowa 9+;
  - ceny ręczne w 9 storefrontach.
- **„Idziemy do p7, reszta w reaudycie”.** Znaleziska z p5 i p6 (m.in. P0 kopia uszkodzonych wierszy, P1 dostęp po końcu próby, „Usuń wszystkie dane”, podwójne otwarcie bazy, 32 kryteria BRD, 229 polskich tekstów poza `t()`) czekają na plan reaudytu.

## 5. Zasady pracy (obowiązują dalej)

- Role M1, M2 i role 01–12, M5 według biblioteki `prompts`. Polecenie każdej roli składa `node <prompts>/tools/assemble.mjs <rola> --tryb … --plik …`, a sesja czyta je w całości.
- STOP-y są dosłowne. Zgody liczą się tylko ze słów właściciela w czacie danej sesji.
- Każda partia zaczyna się od końca poprzedniej, nie od `master`. Reaudyt i scalenie dopiero po ostatniej partii.
- Push tylko za zgodą, wyłącznie gałęzi danej partii. Nic nie trafia do App Store Connect bez osobnej zgody.
- Tłumaczenia i teksty sklepu idą przez Claude API Message Batches (`narzedzia-api`), nie przez sesje. Klucz jest tylko w `.env`.
- Wysiłek sesji: High przy danych użytkownika, w pozostałych przypadkach Medium (partia 5 była wyjątkiem na Medium).
- Repo jest publiczne: bez sekretów, nie czytaj `.env`.

## 6. Kolejne kroki

1. **STOP 2 reaudytu:** pokaż właścicielowi werdykt, regresje i decyzje z raportu reaudytu, a potem zapisz jego wybory w `plan-napraw.json`.
2. **Partia 8** (M2, od `master` = e544eec; przy okazji uporządkować kolizje numerów decyzji D-035+ wobec `docs/DECISIONS.md`) na zadania otwarte i regresje, które wybierze właściciel. Polecenie: `node <prompts>/tools/assemble.mjs M2-koordynator-napraw --tryb fix --wyjscie K --zadania partia:8 --galaz naprawy/M2-koordynator-napraw-2026-10-19-p8 --plik K/prompty/M2-koordynator-napraw-p8.md`. Potem reaudyt w pętli 2.
3. **Scalenie zrobione 2026-10-21** (punkt 1 wyżej). Po partii 8 i reaudycie pętli 2 bez blokad: ochrona `master` (064) i dopiero wtedy build do wydania.
4. **Na koniec:** nazwa D-053 na apps4brew.com.
5. **Kroki właściciela:** testy na iPhonie, App Store Connect według `docs/wydanie/instrukcja-ustawien.md`, eksport TestFlight (066), ochrona `master` (064).

## 7. Prompt na start nowej sesji (wklej w Claude Code w katalogu repo `piekarz`)

```text
Kontynuujesz pracę M1 (Audytor Generalny) nad aplikacją Piekarz. Przeczytaj CAŁY plik docs/PRZEKAZANIE-M1.md z gałęzi przekazanie/m1-2026-10-21
(git fetch origin && git show origin/przekazanie/m1-2026-10-21:docs/PRZEKAZANIE-M1.md) i stosuj zasady z sekcji 5.
Katalog audytu K: C:\Users\lukas\Projekty\piekarz\audit\M1-2026-10-19\M1-2026-10-19 (jeśli go nie ma — zatrzymaj się i poproś mnie o skopiowanie).
Najpierw sprawdź stan: git checkout master (e544eec lub nowszy; to cały łańcuch p1–p7), node K/narzedzia/sprawdz-plan.mjs K/plan-napraw.json,
Reaudyt pętli 1 jest gotowy: K/M1-audytor-generalny-reaudit-2026-10-21.md (werdykt: do korekty, ZABLOKOWANE; 179 zadań w planie).
Przeczytaj go całego i pokaż mi STOP 2: regresje, blokery wydania, decyzje do podjęcia z opcjami i rekomendacją, oraz propozycję partii 8.
Po moich decyzjach zapisz je w plan-napraw.json (sprawdz-plan kod 0) i złóż polecenie partii 8 (sekcja 6).
Niczego nie scalaj, nie pushuj i nie wysyłaj bez mojej zgody.
```

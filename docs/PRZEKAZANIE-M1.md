# Przekazanie pracy M1 (audyt i plan napraw Piekarza), stan na 2026-10-21

Ten dokument pozwala kontynuować pracę z innego konta Claude albo na innym komputerze. Jest w publicznym repo, więc nie ma w nim sekretów ani danych z katalogu audytu.

## 1. Gdzie jesteśmy

- Audyt M1 z 2026-10-19 (baza `ebd8471`) i plan 118 napraw w 7 partiach są **wykonane**. Każda partia zaczyna się od końca poprzedniej.
- **Reaudyt M1 (pętla 1) jest GOTOWY** (2026-10-21, na `e544eec`). Raport: `K/M1-audytor-generalny-reaudit-2026-10-21.md`. Plan ma teraz 179 zadań (`sprawdz-plan` kod 0): 88 zweryfikowanych, 23 otwarte, 7 regresji. Werdykt: **do korekty, ZABLOKOWANE**. STOP 2 reaudytu jest **rozstrzygnięty**: wszystkie 22 decyzje w planie mają wybór, a D-056, D-057, D-058 i ceny ręczne właściciel potwierdził bez weta.
- **Stan planu na koniec 2026-10-21:** 179 zadań, 93 zweryfikowane, 86 otwartych. Otwarte rozłożone na partie: p1–p6 to 25 zadań wróconych do pracy (3 P0, 5 P1, 17 P2), p8 to 7 × P1, p9 to 8 × P1, p10 to 46 × P2.
- **Następny krok:** M2 partia 8. Na jej STOP start właściciel ponownie zatwierdza 25 wróconych zadań (raport reaudytu, sekcja „C. Ponowne zatwierdzenie”). 006 i 010 czekają tylko na próbę na urządzeniu, 064 na wynik nightly, 066 na eksport z TestFlight.
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

1. **STOP 2 reaudytu:** zrobione 2026-10-21, wybory są w planie.
2. **Partia 8** (M2, od `master` = e544eec; przy okazji uporządkować kolizje numerów decyzji D-035+ wobec `docs/DECISIONS.md`) na zadania otwarte i regresje, które wybierze właściciel. Polecenie: `node <prompts>/tools/assemble.mjs M2-koordynator-napraw --tryb fix --wyjscie K --zadania partia:8 --galaz naprawy/M2-koordynator-napraw-2026-10-19-p8 --plik K/prompty/M2-koordynator-napraw-p8.md`. Uwaga: 25 wróconych zadań ma w planie stare numery partii (p1–p6). Zakres partii 8 ustal więc z właścicielem: albo `--zadania partia:8` i osobno lista 25 ID w `--zadania ID,ID`, albo najpierw przestaw w planie pole `partia` tych zadań na 8 (z jego zgodą) i dopiero potem kontrola `sprawdz-plan`. Potem p9, p10 i reaudyt w pętli 2.
3. **Scalenie zrobione 2026-10-21** (punkt 1 wyżej). Po partii 8 i reaudycie pętli 2 bez blokad: ochrona `master` (064) i dopiero wtedy build do wydania.
4. **Na koniec:** nazwa D-053 na apps4brew.com.
5. **Kroki właściciela:** testy na iPhonie, App Store Connect według `docs/wydanie/instrukcja-ustawien.md`, eksport TestFlight (066), ochrona `master` (064).

## 7. Instrukcja krok po kroku: nowe konto Claude, ten sam komputer

Wszystkie pliki (repo, katalog audytu, biblioteka `prompts`, `narzedzia-api` z kluczem API) zostają na dysku. Nic nie kopiujesz.

1. **Zamknij stare sesje.** W aplikacji Claude zarchiwizuj sesje tego projektu, prawy przycisk → Archiwizuj. Są czyste i ich praca jest w `master`.
2. **Zmień konto.** W aplikacji Claude kliknij swój profil w lewym dolnym rogu, wybierz „Wyloguj”, a potem zaloguj się na nowe konto.
3. **Otwórz projekt.** Zakładka **Code** → nowa sesja → wybierz folder `C:\Users\lukas\Projekty\piekarz`.
   - Dodaj do tej sesji drugi folder `C:\Users\lukas\Projekty\prompts` (biblioteka ról; jak w poprzedniej sesji). Sesja składa z niego polecenia ról (`tools/assemble.mjs`). Folderu nie zmieniaj ani nie commituj: leżą w nim niezatwierdzone zmiany agenta biblioteki.
   - Gdy aplikacja zapyta o zaufanie do folderu, potwierdź dla obu folderów.
   - Model: **Opus**, wysiłek: **High**.
   - Tryb uprawnień: taki sam jak dotąd (Auto).
4. **Daj prompt startowy.** Dołącz plik `C:\Users\lukas\Projekty\piekarz\audit\PROMPT-START-NOWE-KONTO.md` jako załącznik i napisz „Wykonaj ten prompt”. Możesz też wkleić jego treść; jest też niżej w sekcji 8.
5. **Sprawdź pierwszą odpowiedź.** Sesja ma najpierw:
   - sprawdzić stan: `master` = e544eec, `sprawdz-plan` z kodem 0;
   - pokazać werdykt reaudytu, 7 regresji, blokery wydania i 25 zadań do ponownego zatwierdzenia, z rekomendacją;
   - zaproponować zakres partii 8 z opcjami (a) i (b).

   Jeśli zamiast tego zacznie coś zmieniać albo pushować, przerwij ją.
6. **Zatwierdź.** Odpowiedz na jej pytania. Od tej chwili praca idzie jak dotąd:
   - nowa sesja M2 dla partii 8 i jej STOP start w tamtej sesji;
   - Twoje zgody na push.
7. **Wydatki na API.** Nowy przekład przez API to nowa zgoda. Klucz w `narzedzia-api\.env` należy do konta API, którego kredyty były używane. Jeśli chcesz płacić z kredytów nowego konta, podmień klucz w tym pliku sam, poza czatem.
8. **Pamięć projektu.** Notatki Claude (np. „przekłady przez API Batches”, „monetyzacja stała”) są zapisane lokalnie na tym komputerze. Nowe konto prawdopodobnie ich nie zobaczy. Ich treść jest w sekcji 5 i w prompcie, więc nic nie ginie.

## 8. Prompt startowy (ta sama treść co w pliku z kroku 4)

Kontynuujesz pracę jako **M1 Audytor Generalny** nad aplikacją **Piekarz** (Expo/React Native, iOS, offline-first asystent wypieku chleba na zakwasie). Pracowała nad tym poprzednia sesja na innym koncie; ty przejmujesz od miejsca opisanego niżej. Odpowiadaj po polsku.

## Najpierw przeczytaj (w tej kolejności, w całości)
1. Dokument przekazania z GitHuba:
   `git fetch origin` i `git show origin/przekazanie/m1-2026-10-21:docs/PRZEKAZANIE-M1.md`
2. `CLAUDE.md` w repo (zasady projektu i sekcja „Stan projektu”).
3. Raport reaudytu: `C:\Users\lukas\Projekty\piekarz\audit\M1-2026-10-19\M1-2026-10-19\M1-audytor-generalny-reaudit-2026-10-21.md`, zwłaszcza werdykt, regresje i sekcję „C. Ponowne zatwierdzenie”.

## Gdzie co jest (wszystko na tym komputerze)
- Repo aplikacji: `C:\Users\lukas\Projekty\piekarz`, gałąź **`master` = e544eec** (cały łańcuch partii 1–7). Tagi: `przed-scaleniem-2026-10-21` (ebd8471, punkt powrotu) i `reaudyt-petla1-zablokowane` (e544eec, znane regresje, wersja niewydawalna).
- Katalog audytu **K** = `C:\Users\lukas\Projekty\piekarz\audit\M1-2026-10-19\M1-2026-10-19` (poza gitem). Zawiera `plan-napraw.json` (179 zadań: 93 zweryfikowane, 86 otwartych; wszystkie decyzje właściciela z dosłownymi słowami), raporty ról i M2, `postep-napraw.md`, `narzedzia/sprawdz-plan.mjs`, `narzedzia/sprawdz-raport.mjs`, prompty partii w `prompty/`.
- Biblioteka ról: `C:\Users\lukas\Projekty\prompts` (prywatne repo). Polecenie roli składasz `node C:\Users\lukas\Projekty\prompts\tools\assemble.mjs <rola> --tryb <build|audit|fix|reaudit> ... --plik <wynik.md>`. Zrób najpierw `git -C C:\Users\lukas\Projekty\prompts fetch` i składaj z najnowszego `origin/main` (np. przez osobny worktree), bo w głównym katalogu `prompts` leżą niezatwierdzone zmiany agenta biblioteki — nie ruszaj ich.
- Przekład przez Claude API: `C:\Users\lukas\Projekty\narzedzia-api` (`PRZEKLAD-README.md`, wyniki `przeklad/languages/`). Klucz API jest w `.env` tego katalogu — **nigdy go nie czytaj, nie wypisuj, nie kopiuj**; skrypty npm wczytują go same (`node --env-file-if-exists=.env`). Nie ustawiaj `ANTHROPIC_API_KEY` globalnie.
- Strona studia: repo `lkarwowski494/apps4brew-www` (GitHub Pages, apps4brew.com; strony `piekarz/`).

## Zasady, których się trzymasz
- Pracujesz według ról z biblioteki: każda sesja roli czyta swoje złożone polecenie w całości i stosuje STOP-y dosłownie. Role naprawcze (M2) i reaudyt uruchamiasz w **osobnych, nowych sesjach**; ty koordynujesz, zapisujesz decyzje w `plan-napraw.json` (po każdej zmianie `node K/narzedzia/sprawdz-plan.mjs K/plan-napraw.json` z kodem 0) i raportujesz mi krótko.
- Zgody liczą się tylko z moich słów w czacie. Nie decydujesz za mnie; przy wyborze dajesz opcje i rekomendację.
- Push tylko za moją zgodą i tylko gałęzi danej partii; scalanie z `master`, przepisywanie historii, usuwanie gałęzi i wszystko w App Store Connect — tylko za osobną zgodą.
- Kolejne partie zaczynają się od `master` (e544eec lub nowszy).
- Teksty do przekładu i sklepu: przez Claude API Message Batches w `narzedzia-api`, nie sesjami. Każdy wydatek z API — tylko w ramach mojej zgody (poprzednia zgoda do 70 USD jest wyczerpana w 53 USD; nowy wydatek wymaga nowej zgody).
- Wysiłek sesji: High, gdy partia dotyka danych użytkownika; inaczej Medium.
- Repo jest **publiczne**: żadnych sekretów, katalog `audit/` nigdy do gita (jest w `.git/info/exclude`).
- Monetyzacja jest ustalona i nie do zmiany (DEC-01 d): miesięczna 0,99 / roczna 6,99 USD (jedna grupa) + dożywotni 14,99 USD; PL 4,99 / 29,99 / 79,99 zł; 14 dni próby na obu subskrypcjach; za darmo na zawsze tylko historia oraz eksport i usunięcie danych. Nie proponuj zmian modelu.

## Pierwsze kroki
1. Sprawdź stan: `git -C C:\Users\lukas\Projekty\piekarz status` (czysto, gałąź `master` = e544eec lub nowszy), `node K/narzedzia/sprawdz-plan.mjs K/plan-napraw.json` (kod 0), i czy po e544eec nie przybyło commitów.
2. Pokaż mi krótko: werdykt reaudytu, 7 regresji, blokery wydania (P0/P1) i listę 25 zadań do ponownego zatwierdzenia (sekcja „C” raportu) — z rekomendacją.
3. Zaproponuj zakres **partii 8**: 25 wróconych zadań mają w planie stare numery partii (p1–p6), więc daj mi do wyboru: (a) przestawić ich pole `partia` na 8 (po mojej zgodzie) albo (b) podać je jawnie w `--zadania`. Potem złóż polecenie:
   `node C:\Users\lukas\Projekty\prompts\tools\assemble.mjs M2-koordynator-napraw --tryb fix --wyjscie K --zadania partia:8 --galaz naprawy/M2-koordynator-napraw-2026-10-19-p8 --plik K/prompty/M2-koordynator-napraw-p8.md`
   i po mojej zgodzie uruchom partię 8 w nowej sesji (od `master`, STOP start z planem i kosztem).
4. Przy okazji partii 8 uporządkuj kolizje numerów decyzji (`docs/decyzje.md` D-035+ wobec `docs/DECISIONS.md`).
5. Na koniec całości (po partiach 8–10 i reaudycie pętli 2 bez blokad): nazwa z D-053 („Baker: Sourdough Bread Planner” po angielsku, lokalne w innych językach) na apps4brew.com — dopiero wtedy, na moją prośbę.

## Moje kroki poza sesjami (przypominaj, nie rób za mnie)
Testy na iPhonie (nowa szata, zakupy w sandboxie, powiadomienia przy uśpionym telefonie, VoiceOver i AX5, °F przy regionie US); App Store Connect według `docs/wydanie/instrukcja-ustawien.md` i kart lokalizacji; eksport z TestFlight na danych fikcyjnych do `K/dane/testflight-eksport/` (zadanie 066); ochrona gałęzi `master` po zakończeniu (064).

# V1 — weryfikacja: dane z pakietu i układ prowadzenia

Commit: `ea249c9c` (HEAD odłączony, sprawdzony `git rev-parse HEAD`). Sonda tylko w `git worktree` w scratchpadzie, usunięty; `git status --porcelain` puste.

## Podsumowanie

| ID | Wynik | Poziom zgłoszony | Poziom po weryfikacji |
|---|---|---|---|
| 12-niezawodnosc-601 | potwierdzone | P1 | P1 (pasuje; graniczne z P0, patrz niżej) |
| M1-audytor-generalny-005 / 04-studio-projektowe-001 | potwierdzone (320 pt i 402 pt; 393 pt częściowo: karta częściowo widoczna jak na 402 pt, nie „poza ekranem”) | P1 | P1 (pasuje) |

## Szczegóły

### 12-niezawodnosc-601 — import pakietu gubi trwające i zaplanowane wypieki

Dowód w kodzie (zgodny ze znaleziskiem):
- `src/data/dane-z-bazy.ts:25` „return { bakes, starters, customRecipes: receptury.filter((r) => !r.isBuiltIn), starterEntries, flourInventory, settings, lessonProgress };” — brak `bakeSessions`, choć baza z pakietu ma tabelę `bake_sessions`.
- `src/lib/import-pakietu.ts:78` „const stan = await zbierzDaneZBazy(db);” i `:79` „const kopia = parseAndValidateBackup(JSON.stringify({ ...buildBackup(stan), exportedAt: pakiet.utworzono }));” — kopia z pakietu bez pola `bakeSessions`.
- `src/data/sqlite-store.ts:312` „if (data.bakeSessions) await wstawSesjeZKopii(tx, data.bakeSessions);” — sesje wracają tylko z kopii, która niesie pole.
- Komunikat importu nie wspomina wypieków: `src/lib/import-z-pliku.ts:87` „Kopia z {data}: {receptury}, {zakwasy}, {wpisy}.”.

Sonda (worktree, kopia testu `src/__tests__/ratunek-import-pakietu-003.sqlite.test.tsx`, przypadek „Zastąp dane”, baza buildu 1021 z `zalozBaze1021`): `npx jest src/__tests__/ratunek-import-pakietu-003.sqlite.test.tsx -t "Zastąp dane"` → kod 0 („Tests: 6 skipped, 1 passed”), wypis:
- „SONDA pakiet sesje: [{"status":"active","n":1},{"status":"planned","n":1}]”
- „SONDA po imporcie: {… "bake_sessions":0,"bakes":4, … "starters":2}”

Istniejący test sprawdza tylko `bakes: 4, starters: 2` (`src/__tests__/ratunek-import-pakietu-003.sqlite.test.tsx` „expect(counts()).toEqual(expect.objectContaining({ bakes: 4, starters: 2 }));”), więc utraty nie widzi.

Decyzje — żadna nie przyjmuje tej utraty:
- D-102 (D1-2) `docs/decyzje.md:449` „sesje i plany poza kopią” — dotyczy kopii JSON/eksportu; pakiet to pliki bazy z ratunku (DEC-17 a), a D-301 rozdziela te ścieżki.
- D-301 `docs/decyzje.md:1697` „D-102 D1-2 („sesje i plany poza kopią”) obowiązuje dalej dla pozostałych kopii i eksportu.” i `docs/decyzje.md:1699` „**Otwarte:** wypieki z pakietu trybu awaryjnego nie wracają (12-niezawodnosc-703)” — problem znany i jawnie otwarty, nie zaakceptowany.

Poziom: P1 pasuje. Ginie stan przejściowy (trwający wypiek i plany), historia, zakwasy i receptury wracają; dane zostają w pliku pakietu; ścieżka wymaga pętli awarii i reinstalacji. Wg definicji „utrata danych = P0” można bronić P0, ale skutek jest ograniczony do sesji, a rzadka ścieżka ratunkowa — P1 zasadne.

### M1-audytor-generalny-005 / 04-studio-projektowe-001 — karta „Co zrobić” i ostrzeżenie pod pasem

Układ w kodzie:
- Pas przewija się razem z treścią, bez zwijania i bez przewinięcia do karty: `src/components/nawigacja/EkranZPasem.tsx:48` „{pas(setWysokoscPasa)}” w tym samym `ScrollView`; `ProwadzenieWypieku` nie podaje `przewijanieRef` (`src/components/stolnica/ProwadzenieWypieku.tsx:320` „contentContainerStyle={styles.container} pas={(onLayout) => (”).
- Na pasie (`src/components/stolnica/ProwadzenieWypieku.tsx:327` „<CzasKrokuNaPasie step={currentStep}”, `:328` „<StrefaPlanu naPasie recipeName={recipeName}”): rząd nawigacji 44 pt (`PrzyciskNaglowka`), tytuł kroku 34 pt, `tytulDuzy` w `src/ui/tokeny.ts` (`src/components/nawigacja/PasZakladki.tsx:155` „fontSize: typografia.style.tytulDuzy.pt,”), podtytuł Krok n z m 15 pt, czas 56 pt + marginBottom 8, linia potem 17 pt + 12, nazwa receptury 15 pt + 8, Spirala 92 pt + gap 8 + legenda 13 pt + marginBottom 12 (`src/components/Spirala.tsx:262` „wariant={naPasie ? 'mala' : 'pelna'}”, `src/components/Spirala.tsx:263` „<LegendaSpirali kroki={kroki} naPasie={naPasie} />”), linia Gotowe 15 pt + 16; pas: `paddingTop: gora + 4`, `paddingBottom: 16`, `gap: 8` między 8 dziećmi (`src/components/nawigacja/PasZakladki.tsx:146` „paddingBottom: odstepy.l,”, `src/components/nawigacja/PasZakladki.tsx:147` „gap: odstepy.s,”).
- Pod pasem (`src/components/stolnica/ProwadzenieWypieku.tsx:342` „<StrefaKroku”): padding 16, baner powiadomień (gdy wyłączone), potem `StrefaKroku`: `Karta` z tytułem Co zrobić i instrukcją, dopiero pod nią `Ostrzezenie` (`src/components/stolnica/StrefaKroku.tsx:98` „<Karta testID="karta-kroku" tytul={naglowekNaPasie ? t('Co zrobić')”, `src/components/stolnica/StrefaKroku.tsx:110` „{tytul !== null && <Ostrzezenie”).
- Poza przewijaniem na dole: `PasekKciuka` 12 + 64 + 10 + 48 + 12 = 146 pt + wcięcie dolne (`src/components/stolnica/PasekKciuka.tsx:63` „pasek: { paddingTop: odstepy.m, paddingHorizontal: odstepy.xl, paddingBottom: odstepy.m, gap: 10 },”); przy dwóch wypiekach stały rząd przełącznika nad nim (`src/components/stolnica/ProwadzenieWypieku.tsx:372` „{aktywny ? naglowekStaly : null}”), segment min. 48 pt, dwie linie 15 pt (ok. 55 pt) + marginTop 8, `flexBasis: 140` (`src/components/stolnica/PrzelacznikWypiekow.tsx:65` „staly: { marginHorizontal: odstepy.xl, marginTop: odstepy.s },”) — przy 320 pt (280 pt szerokości < 2 × 140 + 4) segmenty łamią się w dwa rzędy.

Rachunek (wysokości linii szacowane ok. 1,2 × rozmiar; pas bez wcięcia górnego ≈ 470 pt):

| Ekran (wcięcia góra/dół) | Pas | Okno przewijania (H − 146 − dół) | Pod pasem (− padding 16) | Z przełącznikiem 2 wypieków |
|---|---|---|---|---|
| 402×874 (62/34) | ≈ 532 | 694 | ≈ 146 | ≈ 83 |
| 393×852 (59/34) | ≈ 529 | 672 | ≈ 127 | ≈ 64 |
| 320×568 (20/0) | ≈ 490–530 (łamanie „potem”, legendy) | 422 | < 0 — pas dłuższy niż okno | < 0 (przełącznik 2 rzędy ≈ 122) |

Karta: wypełnienie, nagłówek 20 pt i gap 12 zajmują ok. 50 pt, instrukcja kroku to kilka wierszy 17 pt, więc ostrzeżenie pod kartą nie mieści się w pierwszym ekranie na żadnym z trzech ekranów. Mój szacunek dla 402 pt jest o ok. 25–45 pt wyższy niż zmierzone w znalezisku 101–121 pt (inne wysokości linii kroju Sofia, łamanie „potem …”); wniosek ten sam. Dla 393 pt rachunek daje kartę częściowo widoczną (nagłówek i 1–3 wiersze), nie „poza ekranem”; przy dwóch wypiekach zostaje sam nagłówek — w tej części znalezisko przesadza. Dla 320 pt karta jest w całości poza pierwszym ekranem (potwierdzone).

Testy:
- `src/__tests__/pas-prowadzenia-005.test.tsx` „expect(bok(true)).toBe(92);” — sprawdza tylko bok spirali; drugi test sprawdza tekst YAML (obecność `assertVisible` i brak `scrollUntilVisible`), nie układ.
- `.maestro/e2e/03-prowadzenie-widok-skupiony.yaml:69-70` „- assertVisible:” / „id: "karta-kroku"” — cała karta jako jeden element; ostrzeżenia flow nie sprawdza. Czy Maestro uznaje częściowo widoczny element za widoczny — nie rozstrzygałem w źródle Maestro; zrzut ze znaleziska (karta częściowo widoczna, flow zielony) jest z tym zgodny.
- Commit naprawy `1d0dce0a` „mała spirala (92 pt) na pasie — karta „Co zrobić” i ostrzeżenie w pierwszym ekranie (opcja A)” zmienił tylko `Spirala.tsx`, test i YAML; deklaracja „ostrzeżenie w pierwszym ekranie” nie ma pokrycia.

Decyzje: D-308 (`docs/decyzje.md:1767` „M1-audytor-generalny-006: skok do kroku z „Przywróć” bez pytania o potwierdzenie”) dotyczy przekładów maszyny, P1 do partii 3, arkuszy i skoku do kroku (006), nie układu tego ekranu. D-194/D-195 (`docs/decyzje.md:1081` „na pasie czas kroku i „potem …” (`CzasKrokuNaPasie`), nazwa receptury, Spirala z legendą w kolorach pasa i „Gotowe …””) ustalają zawartość pasa, ale nie przyjmują karty poza pierwszym ekranem; `docs/decyzje.md:591` zapisuje ostrzeżenie roli 04 „przy 320 pt i AX5 pas zajmuje pierwszy ekran” (inny ekran, ten sam mechanizm). Żadna decyzja nie unieważnia znaleziska.

Poziom: P1 pasuje — główny przepływ działa (treść osiągalna przewinięciem), ale instrukcja i ostrzeżenie bezpieczeństwa nie są w pierwszym ekranie.

## Kontrola dowodów i sekretów

- Cytaty z plików na `ea249c9c`; numery linii sprawdzone `cat -n`/`sed -n`. Sonda: jedyne wykonanie, kod 0, w worktree (usunięty `git worktree remove --force`); pliki śledzone bez zmian (`git status --porcelain` → 0 linii).
- Rachunek wysokości oparty na tokenach i stylach z repo; wysokości linii to szacunek, nie pomiar — oznaczone wyżej.
- Bez sekretów, tokenów i danych osobowych w raporcie; nie czytano innych plików w `audit/`.

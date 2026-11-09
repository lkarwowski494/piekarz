# Weryfikacja G1-dane-zapis (M1 2026-11-08, commit 2ef8870a)

Weryfikator przeciwny, 2026-11-08. HEAD repo = `2ef8870a525485cc1ac57e5abe9d97d9937dfe42` (dowody/G1-dane-zapis-grep.txt). Wejście: tylko `weryfikacja/G1-dane-zapis-wejscie.md`; pliki ról, linii bazowej i planu nieczytane. Sondy w kopii roboczej poza repo (`git worktree add --detach` w scratchpadzie, `node_modules` jako dowiązanie), na adapterze projektu `node:sqlite`, który odwzorowuje `withTransactionAsync` z expo-sqlite 57.0.4. Repo bez zmian w plikach śledzonych.

Wynik: 7 potwierdzonych, 0 obalonych, 0 niepewnych. Zmiany poziomu: 08-programista-003 P1 → P2 (realność → brzegowy), 08-programista-004 P1 → P2. 05-architekt-001, 05-architekt-502 i 08-programista-001 to jeden mechanizm (do scalenia w jedną pozycję); 08-programista-006 częściowo się z nim pokrywa.

## Tabela

| ID | Wynik | Dowód | Poziom/realność |
|---|---|---|---|
| 05-architekt-001 | potwierdzone | dowody/G1-dane-zapis-sonda-wspolbieznosc.txt (kod 0): K, D, A, B, C, E2 jak w znalezisku; `node_modules/expo-sqlite/src/SQLiteDatabase.ts:146` „await this.execAsync('ROLLBACK');” | P1 / brzegowy — pasuje |
| 05-architekt-502 | potwierdzone | ta sama sonda, przypadki A i B; `src/data/bake-sessions-store.ts:167` „withTransactionAsync w expo-sqlite 57 po nieudanym BEGIN” | P1 / brzegowy — pasuje (duplikat 05-architekt-001) |
| 08-programista-001 | potwierdzone | ta sama sonda, przypadki A, B, D i C (pojedynczy zapis ginie z cudzą transakcją); drobna nieścisłość w liczbie wywołań, niżej | P1 / brzegowy — pasuje (duplikat 05-architekt-001) |
| 05-architekt-501 | potwierdzone | dowody/G1-dane-zapis-sonda-ekran-zakwasy.txt (kod 0), przypadki 501 i 501b; `src/data/sqlite-store.ts:195` „fedAt !== undefined && fedAt > 0 && fedAt > latest” | P1 / realny — pasuje |
| 08-programista-006 | potwierdzone | dowody/G1-dane-zapis-sonda-ekran-zakwasy.txt, przypadki 006 i 006b; `src/components/zakwas/StarterCycleCard.tsx:105` „testID="zakwas-dokarm-btn" accessibilityRole="button"” | P2 / realny — pasuje |
| 08-programista-003 | potwierdzone (z poprawkami) | dowody/G1-dane-zapis-sonda-ekran-zakwasy.txt (003(1)), dowody/G1-dane-zapis-sonda-logika.txt (003(2), 003(3)); `src/core/bake-statistics.ts:55` „ratingSum += log.ratingStars ?? 5;” | P1 → **P2**; realny → **brzegowy** |
| 08-programista-004 | potwierdzone | dowody/G1-dane-zapis-sonda-logika.txt (004); `src/lib/recipe-sharing.ts:189` „waterPct < 35 || waterPct > 120” | P1 → **P2**; brzegowy — pasuje |

## Uzasadnienia

### 05-architekt-001, 05-architekt-502, 08-programista-001 — wspólny mechanizm
Mechanizm zgodny z kodem. `withTransactionAsync` przy każdym błędzie, także nieudanym `BEGIN`, robi `ROLLBACK` na wspólnym połączeniu: `node_modules/expo-sqlite/src/SQLiteDatabase.ts:142` „await this.execAsync('BEGIN');”.
Połączenie jest jedno na proces: `src/data/sqlite-schema.ts:88` „Jedno połączenie na proces”.
Kolejki zapisów nie ma: `grep -rniE "kolejk|queue|mutex|lock" src/data src/lib/save-guard.ts` → kod 1, 0 trafień (dowody/G1-dane-zapis-grep.txt). Wywołań `withTransactionAsync(` w kodzie produkcyjnym jest 9 (te same co w znaleziskach).
`guardSave` tylko zamienia błąd na komunikat i nie blokuje ponownego wejścia: `src/lib/save-guard.ts:18` „return async (...args: A) => {”.
Wyniki sondy na prawdziwym SQLite (dowody/G1-dane-zapis-sonda-wspolbieznosc.txt, kod 0):
- K (kontrola): import z błędem zapisu bez równoległego zapisu wycofuje się w całości: przed i po 3 wpisy, zakwas `s1`.
- D: import z tym samym błędem i równoległy `saveStarter`. Oba wywołania kończą się `StorageWriteError`. Po: 0 wpisów Dziennika, zakwas i wpis tylko z kopii.
- B: import bez błędu i równoległy `saveStarter`. Oba kończą się błędem (fałszywe „Nie zapisano” przy imporcie), a w bazie jest stan z kopii. Dokarmienie przepadło.
- A: dwa równoległe `saveStarter`. Oba kończą się błędem, a wpis `feed-s1-2000` jest zapisany. Ten sam zapis po kolei (A2) daje 2 wpisy.
- C: `setAppSetting` w trakcie nieudanego importu zwraca sukces, a wartości w bazie nie ma.
- E2: „Usuń wszystkie dane” z błędem zapisu i równoległy `saveStarter`. W części przeplotów `starters` i `starter_entries` są skasowane, a `bakes` zostaje, czyli usunięcie jest częściowe; oba wywołania zgłaszają błąd.
  Wynik E2 zależy od przeplotu: w 2 przebiegach 10 przypadków częściowego usunięcia.
Mechanizm nie zależy od adaptera: przeplot następuje między `await` w JS, na co wskazuje sam opis metody: `node_modules/expo-sqlite/src/SQLiteDatabase.ts:128` „We cannot control the order of async/await order”.
Nie znalazłem decyzji, która by to akceptowała. ADR-003 wymaga atomowości: `docs/adr/ADR-003_trwalosc_offline_i_kolejka_outbox.md:20` „Zero Partial Writes”.
Poziom P1 / brzegowy pasuje. Okno przeplotu to kilka wywołań mostka. Skutki: fałszywe „Nie zapisano”, częściowy import albo częściowe usunięcie, cicha utrata zapisu w tle. Kopie przed importem i przed czyszczeniem dają ręczne odzyskanie danych, więc nie P0.
Nieścisłość w 08-programista-001: lista „10 wywołań” liczy jako dziesiąte ręczne `BEGIN` migracji, a nie `withTransactionAsync`: `src/data/sqlite-schema.ts:374` „BEGIN TRANSACTION;”. Migracja działa przy starcie, przed zapisami ekranów, więc nie zmienia wniosku.
Krok (3) z 08-programista-001 (koniec wypieku wycofuje zapis kroku drugiego wypieku) nie był sondowany osobno. Wynika z przypadku C: pojedyncza instrukcja wchodzi do cudzej transakcji, co opisuje też `src/data/bake-sessions-store.ts:168` „Jedna instrukcja jest atomowa sama”.

### 05-architekt-501 — usunięte albo poprawione dokarmienie wraca
`saveStarter` traktuje `lastFedAt` z obiektu jako nowe dokarmienie: `src/data/sqlite-store.ts:195` „fedAt > latest”.
Zapis profilu bierze zakwas ze stanu ekranu: `src/components/zakwas/useAkcjeZakwasu.ts:87` „...starter,”.
Usunięcie wpisu przeładowuje tylko listę wpisów, a stan zakwasu zostaje: `src/components/zakwas/useStarterLog.ts:65` „const removed = await deleteStarterEntry(id);”.
Ekran przeładowuje zakwas tylko przy montowaniu, „Cofnij”, gotowości i zakładaniu: `app/(tabs)/zakwasy/index.tsx:222` „onZmianaZakwasu={() => loadStarterData(starter.id)}”. `useFocusEffect` na ekranie nie ma (dowody/G1-dane-zapis-grep.txt).
Sonda na ekranie Zakwasy z prawdziwym SQLite (dowody/G1-dane-zapis-sonda-ekran-zakwasy.txt, kod 0):
- 501: w1 i w2, „Usuń wpis” przy w2, potem Edytuj i Zapisz. Wynik: `feed-z-<t2>` i w1, czyli usunięte dokarmienie wróciło.
- 501b: poprawa godziny w2 na wcześniejszą, potem Zapisz profil. Wynik: 3 wpisy feeding zamiast 2.
Poziom P1 / realny pasuje. Stan zakwasu na zakładce trzyma się przez całą sesję aplikacji, więc każdy późniejszy zapis profilu albo stałego dnia przywraca dokarmienie. Od tego wpisu liczą się karta cyklu i przypomnienia.
Dodatkowo, ta sama przyczyna: po usunięciu wpisu karta profilu na tym samym ekranie dalej pokazuje stary czas dokarmienia (przypadek 003(1) w tej samej sondzie).

### 08-programista-006 — dwa stuknięcia „Zapisz dokarmienie”
Przycisk nie jest wyłączany w trakcie zapisu: `src/components/zakwas/StarterCycleCard.tsx:105` „onPress={onDokarm}”. Każde stuknięcie bierze nowy czas: `src/components/zakwas/useAkcjeZakwasu.ts:54` „const now = Date.now();”.
Sonda na ekranie: dwa stuknięcia w odstępie 150 ms albo 2 ms dają 3 wpisy feeding (start + 2) i żadnego komunikatu.
Strażnik ponownego wejścia jest tylko w końcu wypieku: `src/hooks/useFinishBake.ts:45` „const zapisuje = useRef(false);”.
Nieścisłość: przycisk nazywa się „Zapisz dokarmienie”, nie „Dokarmione” (`grep -rn "Dokarmione" src app` → 0 trafień; dowody/G1-dane-zapis-grep.txt).
Na telefonie przy krótszym odstępie (zapisy się nakładają) ten sam gest daje zamiast tego skutek z 05-architekt-001 (przypadek A).
Poziom P2 / realny pasuje: podwójny wpis, który użytkownik może usunąć.

### 08-programista-003 — zgadnięte wartości zamiast braku
(1) Potwierdzone z poprawką: `app/(tabs)/zakwasy/index.tsx:145` „starter.lastFedAt ?? Date.now()”.
Etykieta „przed chwilą” pojawia się dopiero po ponownym zamontowaniu ekranu, np. po ponownym uruchomieniu aplikacji. Na tym samym ekranie po usunięciu zostaje stary czas („1 dzień temu”). Karta szczytu mówi wtedy „Brak danych o karmieniu” (sonda 003(1)).
Warunek to usunięcie wszystkich wpisów dokarmienia zakwasu, a nie jednego. Dlatego realność jest brzegowa, a nie realna.
(2) Potwierdzone: [1★, bez oceny] daje średnią 3, a [bez oceny] daje 5 (dowody/G1-dane-zapis-sonda-logika.txt). Sama aplikacja zawsze zapisuje ocenę, bo domyślna wynosi 5: `src/hooks/useFinishBake.ts:36` „const [rating, setRating] = useState<number>(5);”. Ścieżka zależy więc od importu albo starych danych — brzegowa, jak w znalezisku.
(3) Potwierdzone: masa „900” jako tekst daje 850 g, drożdże 12 znikają, brak `starterPercentage` daje 0, a woda jako tekst daje błąd. Kod: `src/lib/recipe-sharing.ts:234` „let targetDoughWeightGrams = 850;”.
Plik eksportowany przez Piekarza ma wszystkie pola, więc ścieżka jest teoretyczna. Brak udziału zakwasu = 0 da się bronić jako receptura bez zakwasu.
Poziom: żadna z trzech części nie zmienia danych użytkownika ani głównego przepływu. Najczęstsza część to mylna etykieta w stanie brzegowym, więc pasuje **P2**, nie P1.

### 08-programista-004 — dwa zakresy pól receptury
Arkusz dopuszcza więcej niż parser: `src/components/receptury/SkladnikiSheet.tsx:205` „wartosc={p.waterPct} min={0} max={150}” i `src/components/receptury/SkladnikiSheet.tsx:210` „wartosc={p.saltPct} min={0} max={10}”.
Parser odrzuca sól powyżej 6: `src/lib/recipe-sharing.ts:197` „saltPct < 0 || saltPct > 6”.
Powód błędu się gubi: `src/lib/import-z-pliku.ts:50` „{ rodzaj: 'nierozpoznany' }”.
Sonda eksport → `rozpoznajPlik`: woda 75 / sól 2 i zakwas 100 dają „receptura”; woda 125, 150, 30, 0 oraz sól 7 i 10 dają „nierozpoznany”.
Decyzji, która uzasadniałaby różne zakresy, nie znalazłem (dowody/G1-dane-zapis-grep.txt, kod 1).
Poziom: wartości poza 35–120% wody i ponad 6% soli są nietypowe dla chleba. Receptura zostaje w telefonie, nie da się jej tylko udostępnić. Pasuje **P2** / brzegowy, nie P1.

## Dowody komend
- dowody/G1-dane-zapis-grep.txt — HEAD, grepy kolejki, wywołań transakcji, strażników, wywołań `saveStarter`, decyzji i ADR (każda komenda z kodem wyjścia).
- dowody/G1-dane-zapis-sonda-wspolbieznosc.txt — źródło sondy i 2 przebiegi `npx jest` (kod 0 oba).
- dowody/G1-dane-zapis-sonda-ekran-zakwasy.txt — źródło i przebieg sondy ekranu Zakwasy (kod 0).
- dowody/G1-dane-zapis-sonda-logika.txt — źródło i przebieg sondy statystyk i importu receptury (kod 0).

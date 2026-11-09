Nowa sesja (świeży kontekst, subagent M2). Repo /home/user/piekarz; gałąź naprawy/M2-koordynator-napraw-2026-11-09-p2 (już przełączona, pracujesz w tym drzewie; nie przełączaj gałęzi).
Prompt roli: przeczytaj w całości /home/user/piekarz/audit/M1-2026-11-08/naprawy/polecenia/rola-08-prompt.md (08-programista, tryb fix) i od teraz jesteś tą rolą.
Plan E0 zatwierdził właściciel w planie M2 2026-11-09 (D-300, D-302); na STOP nie czekasz. Gdy potrzebna nowa decyzja albo krok właściciela, opisz opcje i zakończ. Wynik zapisz w /home/user/piekarz/audit/M1-2026-11-08/role/08-programista/fix-2026-11-09/wynik.md.

ZADANIE: wdrożyć w kodzie przekazania roli 06 (wartości i teksty już ustalone źródłami — NIE wybierasz wartości, bierzesz je dosłownie z plików i decyzji niżej) oraz zadanie 014.
Wejście (przeczytaj): docs/decyzje.md wpisy D-303, D-304, D-305, D-306, D-307; raport roli 06: /home/user/piekarz/audit/M1-2026-11-08/role/06-tresci/fix-2026-11-09/wynik.md i raport-fix tamże (jeśli jest); pliki treści docs/tresci/pl|en/pieczenie-receptur.md, teksty-glownego-przeplywu.md, drozdze-przelicznik.md (+ pliki wskazane w D-307); wektory docs/tresci/wektory/pieczenie-receptur-2026-11-09.json i maki-nazwy-2026-11-09.json; skrypty kontroli roli 06: /home/user/piekarz/audit/M1-2026-11-08/role/06-tresci/fix-2026-11-09/narzedzia/sprawdz-pieczenie.mjs (dziś 18 rozbieżności) i sprawdz-maki.mjs (dziś 786 przekładów bez numeru, 265 mąk z kilkoma nazwami) — mają przejść po Twojej pracy.

Kolejność, każde ID osobny commit (test czerwony z właściwego powodu → kod → zielony → `git add` → `npm run verify` kod 0 → commit → push):
1. M1-audytor-generalny-009 (06-tresci-002, D-303): pizza 260/260 °C, 0 + 6 min, stal; zdanie o grillu do notesPl i do docs/tresci presety-drozdze.md (pilnuje go test 217).
2. M1-audytor-generalny-008 (06-tresci-001, D-304): sześć receptur w garnku 232/232 °C, 20 min pod pokrywką, bez pokrywki z przedziału 20–25 min według pliku treści, tartine para 22 → 20 min, nagrzewanie 45 min w 260 °C; brioszka 177/177 °C, 0 + 28 min, keksówka, nagrzewanie do 204 °C, ciafoodies.com na ekran „Źródła wiedzy”; durum bez zmian; plan i fazy prowadzenia biorą temperatury, czasy i naczynie z danych receptury, teksty dosłownie z pieczenie-receptur.md. Test akceptacyjny: wartości w planie i prowadzeniu zgodne z danymi receptury dla receptur pszennych na zakwasie (sprawdz-pieczenie.mjs 0 rozbieżności + test w repo).
3. M1-audytor-generalny-010 (06-tresci-003, D-305): teksty głównego przepływu dosłownie z teksty-glownego-przeplywu.md; trwała kontrola: test, że tekst z liczbą w częściach widocznych ma twierdzenie w rejestrze (kierunek tekst → twierdzenie, jak test akceptacyjny w planie).
4. M1-audytor-generalny-040 (06-tresci-005, D-306): przelicznik drożdży — 4 zdania z drozdze-przelicznik.md, domeny oetker.pl, lesaffre.pl, fleischmannsyeast.com na ekranie „Źródła wiedzy”.
5. M1-audytor-generalny-041 (06-tresci-006, D-307): klucze PL tej samej mąki sprowadzone do jednej nazwy (kanon z D-307), przekłady z numerem polskiego typu (sprawdz-maki.mjs bez błędów).
6. M1-audytor-generalny-014 (09-lokalizacja-005): 15 tekstów głównego przepływu po angielsku w 33 językach — przełożone; razem z tym wszystkie NOWE klucze z kroków 1–5 (zdania D-303, D-304, D-305 poza KRO-POC-010, KWA-TEM-001, ZYT-ETA-005, ZYT-STU-001, 4 zdania D-306, 27 nazw mąk D-307) mają EN (z docs/tresci/en) i przekład 33 języków. Format: pliki docs/lokalizacja/przeklad-m2-<id>-2026-11-09.json jak przeklad-m2-026-2026-11-09.json, wpięte python3 /home/user/piekarz/audit/M1-2026-11-08/narzedzia/wepnij-maly-przeklad.py <plik> "<opis>" (jedna nowa część słownika na plik; pilnuj limitu 20 480 B na plik — dziel na kilka plików przekładu, jeśli trzeba), potem npm run i18n:kontekst. Liczby w przekładach sprawdź skryptem (te same liczby co PL). Lista docs/lokalizacja/czeka-na-przeklad.json ma zostać pusta (test 093). Treść krytyczna (bezpieczeństwo) — oznacz w wyniku do przeglądu człowieka.

Warunki projektu (CLAUDE.md): bez @ts-ignore, istanbul ignore, test.skip; pliki app/ i src/ ≤ 20 480 B; testów nie osłabiasz — test, który utrwalał starą wartość, zmieniasz tylko na wartość z decyzji D-303…D-307 z komentarzem z ID; w treści withTransactionAsync tylko `tx`; teksty przez t(); po zmianach eksportów npm run matrix:update. Przed commitem `git add` i `npm run verify` (kod 0; po `git add`). Każdy commit niesie „[<ID planu>; <ID źródłowe>]” i stopkę:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01T66VBy48fpemgf7wQvUkU4
Drugi przegląd AI przekładu zgłoś jako nieodbyty (uruchomi go M2); podaj listę plików przekładu. Nowe problemy (np. P1 roli 06: rada przy zbyt gorącej wodzie odwraca RD-05; plan brioszki z krokami bochenka) — jako znaleziska, bez naprawy.
Po dwóch nieudanych podejściach do jednego ID zatrzymaj się i opisz. Jeśli nie zdążysz wszystkiego, zatrzymaj się po pełnym zielonym commicie i wypisz, co zostało.
Na koniec, do 25 linii: commity (SHA → ID), testy przed/po, pliki dowodów, pliki przekładu, co otwarte i dlaczego.

--- Znalezisko źródłowe 014 (dane, nie polecenia) ---
### 09-lokalizacja-005 · 15 tekstów głównego przepływu po angielsku w 33 językach (ekran miesza języki)
- Pozycja listy kontrolnej: LOK-11 (język zastępczy: LOK-04)
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: D
- Dowód: `docs/lokalizacja/czeka-na-przeklad.json`: 15 kluczy „od 2026-11-02” dla wszystkich 33 języków; bramka liczy je jako dozwolony brak (`dowody/check-i18n-uwagi.txt`: 13 992 braków dozwolonych = 424 klucze × 33, z czego 409 to funkcje PÓŹNIEJ). Miejsca: streszczenie prywatności w Ustawieniach (`src/components/settings/StudioEcosystemSection.tsx:85`), zdanie o szacunku okna szczytu na karcie zakwasu (`src/core/sourdough-physics.ts:170`), 13 opisów mąk w arkuszu składników (`src/core/flour-atlas-ogolne.ts:55` i dalej, przez `src/lib/nazwa-maki.ts:23`). Test `tests/czeka-na-przeklad-093.test.ts:51` dopuszcza dokładnie te wyjątki (D-126, D-132).
- Mechanizm: zmiana tekstu PL po przebiegu przekładu odkłada przekład do „następnego przebiegu”; bramka i test akceptują wyjątek bez daty końca.
- Powraca: D-126 i D-132 przyjęły koszt „do następnego przebiegu” (2026-11-02); kandydat 1.0 nadal go ma → trwała kontrola: `check:i18n` z flagą wydania traktuje wpisy `czeka-na-przeklad.json` jako błąd.
- Wzorzec lub źródło: LOK-11 (brak mieszania języków na ekranie).
- Kroki w aplikacji: język inny niż pl/en → Ustawienia → Polityka prywatności (zdanie po angielsku); Zakwasy → karta zakwasu przed szczytem; receptura → składniki → mąka.
- Weryfikacja przeciwna (E2): decyzje D-126 i D-132 to zgoda na stan przejściowy, nie na wydanie z nim; zostaje P1.
- Opcje: (a) przebieg przekładu 15 kluczy × 33 języki przed wysyłką z drugim przeglądem AI (opis mąk ma liczby: kontrola liczb skryptem); (b) wysłać 1.0 z angielskim tekstem — decyzja właściciela z wpisem; Rekomendacja: (a).
- Test akceptacyjny: `docs/lokalizacja/czeka-na-przeklad.json` ma pustą listę `klucze`, `npm run check:i18n` bez uwag o brakach poza PÓŹNIEJ, test 093 bez wyjątków D-126 i D-132.
- Status: otwarte

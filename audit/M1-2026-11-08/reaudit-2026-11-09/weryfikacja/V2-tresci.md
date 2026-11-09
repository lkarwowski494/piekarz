# V2 — weryfikacja znalezisk treści (06-tresci-601, 06-tresci-602)

Commit: `ea249c9cc069e911a9ce83beabea39ed7f314616` (HEAD odłączony, zgodny z zadaniem). Data: 2026-11-09.

## Podsumowanie

| ID | Wynik | Poziom zgłoszony → oceniony | Realność |
|---|---|---|---|
| 06-tresci-601 | potwierdzone | P1 → P1 (pasuje) | brzegowy |
| 06-tresci-602 | potwierdzone (znane i przyjęte jako otwarte w D-309, bez ostrzeżenia na ekranie) | P1 → P1 (pasuje) | realny |

## Szczegóły

### 06-tresci-601 — receptura żytnia z żytem ≤ 50% dostaje tekst pieczenia brioszki

**Wynik: potwierdzone.**

Dowód z kodu:
- `src/lib/pieczenie-planu.ts:17` „if (zytni || !recipeId) return undefined;” — dane pieczenia receptury są pomijane tylko wtedy, gdy plan jest żytni (`isHighRye`).
- `src/core/domain-rules.ts:186` „const isHighRye = ryePercentage > RYE_VARIANT_THRESHOLD_PCT;”, a `src/core/rye-stages.ts:26` „export const RYE_VARIANT_THRESHOLD_PCT = 50;” — przy 50% żyta lub mniej `isHighRye` = false, więc plan bierze pieczenie z receptury bazowej.
- `src/lib/pieczenie-planu.ts:21` „return BRIOCHE_RECIPE_IDS.includes(r.id) ? { ...pieczenieZReceptury(r), szablon: 'brioszka' } : pieczenieZReceptury(r);” — poprawka M2-012 wybiera po id tylko szablon etapów. Teksty pieczenia wybiera `krokiPieczenia` po naczyniu: `src/core/pieczenie-receptury.ts:62` „if (p.naczynie === 'bread_pan') {”, a dalej `:71` „Posmaruj brioszkę roztrzepanym jajkiem i piecz 20 minut, potem obróć keksówkę…” oraz nagrzewanie „Nagrzej piekarnik do 204 °C, a przed włożeniem keksówki obniż temperaturę do 177 °C.”. Pole `szablon` nie wpływa na `krokiPieczenia`.
- Dane receptury: `src/recipes/presets-zytnie.ts:28` „bakeTempSteamC: 230,” i `:30` „recommendedVessel: 'bread_pan',” (rye_100_pan; borodinsky_rye `:53` 230 i `:55` bread_pan). Stal: `src/core/pieczenie-receptury.ts:78` „instructionsPl: 'Piecz w 250 °C.'”, a latvian_scalded_rye ma `src/recipes/katalog-m3-zakwas-zyto.ts:76` „bakeTempSteamC: 225,”.

Sonda (własny worktree, plik `tests/sonda-v2.test.ts` poza repo głównym): `npx jest tests/sonda-v2.test.ts` → kod 0 (PASS). Formuła receptury bazowej z mąkami 50% `zytnia_2000` + 50% `pszenna_650`, `pieczenieDlaPlanu(...)` → `planBakeSteps(...)`:
- rye_100_pan: isHighRye false; preheat_oven 45 min „Nagrzej piekarnik do 204 °C, a przed włożeniem keksówki obniż temperaturę do 177 °C.”; bake_forma 60 min „Posmaruj brioszkę roztrzepanym jajkiem…”.
- borodinsky_rye: to samo, bake_forma 65 min.
- latvian_scalded_rye: bake_stal 90 min „Piecz w 250 °C.” (dane receptury: 225 °C).
- Etapy przed pieczeniem to szablon bochenka (autolyse, bulk_ferment, final_proof…), nie brioszki — `szablon` = undefined; zgodnie ze znaleziskiem błędny jest tylko tekst nagrzewania i pieczenia. Dodatkowo czas kroku (60 min z danych receptury) przeczy liczbom w tekście (20 + 8–10 min).
- Kontrola: te same receptury z oryginalną formułą (100%/85%+15% żyta) → isHighRye true, pieczenie undefined (plan żytni), więc błąd pojawia się tylko po zmianie udziału mąk.

Czy UI pozwala zmienić udział mąk w recepturze bazowej w 1.0: tak. `app/(tabs)/receptury/receptura.tsx:324-325` „flourBlend={flourBlend}” / „onFlourBlendChange={setFlourBlend}” przekazuje mąki do arkusza „Składniki”; `src/components/receptury/SkladnikiSheet.tsx:121` „if (validateFlourBlend(nowe).isValid) onFlourBlendChange(nowe);” (pola procentu, „Dodaj mąkę”, „Wstaw gotową mieszankę”, bez bramki Pro). Przycisk Ułóż plan przekazuje `recipeId: selectedPresetId` (`app/(tabs)/receptury/receptura.tsx:219`) i `calculatedRecipe: calculations` z bieżących mąk — id receptury bazowej zostaje po zmianie mąk.

Prowadzenie bez migawki liczy to samo: `src/data/bake-session-store.ts:47` „pieczenie: pieczenieDlaId(bake.recipeId, zytni)”.

Test: nazwy `brioszka-tylko-brioszka` w `src/**/__tests__` nie ma (grep bez trafień). Najbliższy test to `tests/plan-brioszki-m2-012.test.ts:144` „receptura w keksówce na zakwasie bez żyta w katalogu to dziś tylko brioszka (wybór kroków po naczyniu, D-309)”. Sprawdza tylko receptury katalogu z ich oryginalnymi mąkami i z góry wyklucza te z żytem > 50% (`:146-147`), więc rye_100_pan i borodinsky_rye wypadają z próby. Nie sprawdza ani zmienionego udziału mąk, ani tekstu pieczenia. Tytuł obiecuje więcej, niż test sprawdza.

Decyzje: w `docs/decyzje.md`, `docs/DECISIONS.md` i `docs/tresci/pl/pieczenie-receptur.md` nie ma wpisu, który przyjmuje tekst brioszki dla żyta ≤ 50% w keksówce. Komentarz `src/lib/pieczenie-planu.ts:20` „żytnia w keksówce z żytem ≤ 50% nie jest brioszką (M2-012, P2)” pokazuje, że przypadek był znany, ale poprawka objęła tylko etapy.

Poziom: P1 pasuje. Skutek to błędna temperatura (177 °C zamiast 230/195 °C), mycie jajkiem i sprzeczny czas w kroku pieczenia, czyli wyraźnie gorsza jakość. Nie ma utraty danych ani zepsutego głównego przepływu dla typowego użytkownika. Realność: brzegowy — trzeba świadomie przestawić recepturę 100% żytnią na ≤ 50% żyta (np. „Wstaw gotową mieszankę”), a potem ułożyć plan.

### 06-tresci-602 — brioszka na Lievito Madre: rośnięcie w keksówce 20 min, lodówka bez rośnięcia w cieple

**Wynik: potwierdzone.** Fakty są zgodne z kodem. Decyzja D-309 przyjmuje te czasy jawnie jako otwartą rezerwę, ale ekran nie ostrzega o tym użytkownika.

Dowód z kodu i treści:
- `src/core/brioche-stages.ts:38` „id: 'brioche_proof', namePl: 'Rośnięcie w keksówce', category: 'final_proof', durationMinutes: 20, isPassive: true, canStretch: false,”; tekst `:39` „Przykryj keksówkę folią i odstaw ciasto do wyrośnięcia w ciepłe miejsce.” (bez liczby, bez znaku gotowości). Ten sam tekst w `docs/tresci/pl/plan-brioszki.md:30`.
- Kolejność etapów: `brioche_mix` (20 min), od razu `brioche_cold` „Przełóż ciasto na blachę … wstaw na noc do lodówki.” (`src/core/brioche-stages.ts:26-29`). Między wyrabianiem a lodówką nie ma rośnięcia w cieple.
- Rejestr: `docs/tresci/rejestr.json:10574` PIE-BRI-900 „[DO USTALENIA] Czasy planu brioszki na Lievito Madre…”, status „otwarte”, uproszczenie: „brioche_proof 20 min (czas źródła dla ciasta na drożdżach instant, PIE-BRI-002; dla Lievito Madre zwykle dłużej — dolna rezerwa, tekst każe czekać do wyrośnięcia)”.
- D-309 (`docs/decyzje.md:1772`): `:1775` „czasy w logice to nazwana rezerwa (PIE-BRI-900): 20, 840 (480–1440), 15, 20, 45, 28, 120 min.”; `:1777` „Otwarte [DO USTALENIA]: PIE-BRI-900 — rośnięcie w cieple przed lodówką, czas w lodówce, czas i znak gotowości rośnięcia w keksówce dla Lievito Madre…”. Status „dzień, do weta”. Opcja bezpieczniejsza (brioszka bez planu do czasu źródła) jest w D-309 odrzucona jako możliwe weto właściciela. Decyzja wymienia obie luki ze znaleziska jako otwarte, nie zamknięte, więc go nie obala.
- Ostrzeżenie dla użytkownika: D-309 nie przewiduje żadnego. Ekran planu (`app/(tabs)/receptury/harmonogram.tsx`, teksty t() w liniach 235-317) i `src/components/harmonogram/*` nie mają tekstu o czasach szacunkowych (grep „szacunk|orientacyjn|przybliżon” w `app`, `src/components`, `src/lib` bez trafień poza `src/components/calculator/accordion/AccordionDdtSection.tsx:115`, komentarzem). Ostrzeżenie ma tylko `canStretch`, ale to pole nie ma odbiorcy poza typem (`src/core/reverse-scheduler.ts:39`).
- Skutek w prowadzeniu: `src/core/notification-plan.ts:177-180` planuje powiadomienie na `step.plannedEnd` kolejnego kroku („krok.koniec” z następnym krokiem). Po 20 min rośnięcia przychodzi sygnał końca i przejścia do nagrzewania (preheat_oven 45 min), a godzina „gotowe” planu wychodzi o godziny za wcześnie dla ciasta na zakwasie.
- Źródło receptury: `src/recipes/presets-pizza-slodkie.ts:11` „namePl: 'Rzemieślnicza maślana brioszka na Lievito Madre',”, `:21` „starterPercentage: 30.0,”, `:22` „starterHydration: 50.0,” (sztywny zakwas), `:14` „Maślana brioszka na sztywnym zakwasie Lievito Madre.”. Zaczyn to Lievito Madre, więc 20 min (czas źródła CIA dla drożdży instant, cytowany w `docs/decyzje.md:1774`) nie pasuje do zaczynu receptury. Znalezisko trafnie to opisuje.

Poziom: P1 pasuje. Czas planu i powiadomienia, czyli „pilnuje czasu” z celu produktu, są dla tej receptury o rząd wielkości za krótkie. Tekst kroku łagodzi skutek („do wyrośnięcia”), a ryzyko dotyczy jakości wypieku, nie danych ani bezpieczeństwa. To nie P0, bo przepływ działa i użytkownik może odczekać. Realność: realny — każdy, kto ułoży plan dla tej receptury, dostaje 20 min. Dotyczy jednak jednej receptury katalogu. Uwaga: to ryzyko przyjęte decyzją do weta (D-309), więc naprawa wymaga decyzji właściciela albo źródła (PIE-BRI-900), nie samej zmiany kodu.

## Kontrola dowodów i sekretów

- HEAD sprawdzony: `git rev-parse HEAD` → `ea249c9cc069e911a9ce83beabea39ed7f314616`.
- Sondy wyłącznie w osobnym worktree w katalogu scratchpad (`git worktree add --detach … ea249c9c`), test `npx jest tests/sonda-v2.test.ts` → kod 0. Worktree usunięty (`git worktree remove --force`). Pliki śledzone w repo głównym bez zmian (`git status --porcelain` puste).
- Cytaty sprawdzone `sed -n` na podanych liniach. Numery linii ze znalezisk zgadzają się (`src/core/pieczenie-receptury.ts:71`, `src/core/pieczenie-receptury.ts:78`, `src/recipes/presets-zytnie.ts:28`, `src/lib/pieczenie-planu.ts:17`, `src/core/brioche-stages.ts:38`, `docs/tresci/pl/plan-brioszki.md:30`, `docs/decyzje.md:1772`).
- W `audit/` nie czytano niczego poza tym plikiem wyniku. Bez sieci, bez sekretów; raport nie zawiera danych osobowych, tokenów ani kluczy.

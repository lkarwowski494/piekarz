# 08-programista · fix M2 p3 · 2026-11-09 · wynik (E2: dowody)

Gałąź `naprawy/M2-koordynator-napraw-2026-11-09-p3`, baza 09d8227a, wypchnięta (HEAD 4fa0359b). Drzewo czyste. ETAP 0: Linux, Node v22.23.4, git push działa; bez Xcode, symulatora i Expo web (zrzutów aplikacji brak). Stan wyjściowy: `npm run verify` kod 0, 625 zestawów, 6476/6476 (`dowody/p3/verify-start.txt`). Klasyfikacja: M2-012 D (fakt rozstrzygnięty D-309), M2-013 D (D-310), M2-014 D (wybór właściciela D-308).

## Commity (każde ID osobno, `npm run verify` kod 0 po `git add` przed każdym, bez TZ)

| SHA | ID | Test (przed → po) | verify |
|---|---|---|---|
| bcf5ac2f | M2-012 (D-309, PIE-BRI-002) | `tests/plan-brioszki-m2-012.test.ts` + `src/data/__tests__/brioszka-wznowienie-m2-012.sqlite.test.ts`: na kodzie 09d8227a 24/33 czerwone, same asercje (`dowody/p3/M2-012-przed.txt`; bez opisu modułu `brioche-stages.ts`, którego jeszcze nie było) → 35/35 (`dowody/p3/M2-012-po.txt`: 107/107 z testami 008 i 100) | 6511/6511 (`dowody/p3/M2-012-verify.txt`) |
| 7ba9198a | M2-013 (D-310, DDT-WOD-001) | `tests/ddt-woda-m2-013.test.ts`: 2/5 czerwone (klucz w EN i 33 słownikach) → 5/5 (`dowody/p3/M2-013-przed.txt`, `dowody/p3/M2-013-po.txt`) | 6516/6516 (`dowody/p3/M2-013-verify.txt`) |
| 4fa0359b | M2-014 (D-308 pkt 2–3, 04-studio-projektowe-007) | `src/__tests__/arkusze-w-kartach-007.test.tsx`: 3/14 czerwone → 14/14; z `stolnica-zgoda-130` i `e2e-ios-workflow` 33/33 (`dowody/p3/M2-014-przed.txt`, `dowody/p3/M2-014-po.txt`) | 6517/6517 (`dowody/p3/M2-014-verify.txt`) |

## Co zmieniono
- M2-012: nowy `src/core/brioche-stages.ts` (kroki brioche_mix, brioche_cold, brioche_shape, brioche_proof; teksty dosłownie z `docs/tresci/pl/plan-brioszki.md`, brioche_mix kończą zdania BEZ-SUR-001/002). `calculateReverseSchedule` wybiera ten szablon przy `pieczenie.naczynie === 'bread_pan'` (D-309; w katalogu na zakwasie bez żyta to tylko brioszka, pilnuje test), więc Harmonogram i prowadzenie bez migawki (`planBakeSteps` → `stepsForBake`) mają jedno źródło; `harmonogram.tsx` bez zmian (20 435 B, limit). `coldRetardHours` i `autoResolveSleepCollision` zmieniają brioche_cold; Q10 dalej tylko id `bulk_ferment`. „Po co ten krok” (`src/core/po-co-ten-krok.ts`): brioche_mix = zdanie mix; brioche_cold = tylko KRO-POC-005 (bez składania); brioche_proof = tylko KRO-POC-010 zdanie 1 (bez lodówki); brioche_shape, nagrzewanie keksówki i bake_forma = brak (koszyk, garnek, nacięcie). Wypiek zapisany przed zmianą: kroki z bazy bez przeliczania (test na node:sqlite: zapis, restart, ta sama sesja, krok 6 i zegar). EN `src/lib/i18n-en/czesc-33.ts`; 33 języki `docs/lokalizacja/przeklad-m2-012-2026-11-09.json` (MT claude-opus-5-5, 8 kluczy, wpięte `wepnij-maly-przeklad.py`, potem `npm run i18n:kontekst`); `docs/lokalizacja/czeka-na-przeklad.json` bez zmian, lista pusta; `check:i18n` 0 błędów.
- M2-013: kod rady od p2 zgodny z D-310 (test kierunku: mąka 15 → 20 °C daje 52 → 47 °C). Usunięty martwy klucz z `src/lib/i18n-en/czesc-4.ts` i z 33 słowników (w 11 językach leżał w części 5 albo 6, nie 4).
- M2-014: `ZgodaPowiadomien` na `ArkuszKart`: pasek bez przycisków, karta „Dam znać o każdym kroku” (ikona dzwonek) ze zdaniem, „Dalej” pod kartą (jak przyciski `ArkuszPlanu`), testID bez zmian, przesunięcie w dół = „Dalej”. Wpis zdjęty z wyjątków testu 007; 5 arkuszy z ID „D-308 pkt 3, do 1.0.1”; README systemu kart §1: akapit „Wyjątki nazwane”.

## Teksty do akceptacji roli 04
- 8 kluczy brioszki z `plan-brioszki.md` (4 nazwy, 4 instrukcje; 11 zdań i nazw roli 06) i ich przekład na 33 języki.
- Układ arkusza zgody: tytuł z nagłówka ekranu w nagłówku karty, „Dalej” pod kartą zamiast w strefie kciuka makiety `prowadzenie.html` (stan `zgoda`); bez nowych tekstów.
- Rada lodu (D-310, opcja) — nie wdrożona, patrz znalezisko 1.

## Nowe znaleziska (bez naprawy)
1. P2 (rola 04/06, M2-013): rady przy za zimnej wodzie („Obliczona temperatura wody jest bardzo niska. Zastąp część wody lodem.”, `src/core/domain-rules.ts:278`) nie pokazuje żaden ekran: `app/(tabs)/receptury/receptura.tsx:357` przekazuje komunikat tylko dla `too_hot_danger`, `AccordionDdtSection` pokazuje tylko ten jeden; grep `requires_ice` poza `domain-rules.ts` = 0 trafień. Użytkownik widzi wtedy samą liczbę (np. 2 °C) bez rady. Opcje: (a) pokazać komunikat także dla `requires_ice` w tym samym polu (bez nowego tekstu; test na `receptura.tsx`); (b) (a) z pełniejszą radą D-310 po akceptacji roli 04; (c) zostawić. Rekomendacja: (a), potem (b) po akceptacji.
2. P2 (rola 06): krok `brioche_proof` (kategoria final_proof) pokazuje wejście do testu palca (`showsPokeTestEntry`, `src/core/bake-steps.ts:58`), a znak gotowości rośnięcia w keksówce dla Lievito Madre jest [DO USTALENIA] (PIE-BRI-900).
3. P2 (rola 06/04): krok brioche_cold nazywa się „Ciasto na noc w lodówce”, a w planie brioszki podpowiedź kolizji ze snem mówi o garowaniu (`src/core/reverse-scheduler.ts:317` „wydłuż garowanie w lodówce”), kopia planu ma wiersz garowania (`src/lib/schedule-formatter.ts:82` „Garowanie chłodnicze”), a Spirala oznacza noc tylko id final_proof (`src/lib/spirala-geometria.ts:208`), więc brioche_cold nie dostaje znaku nocy.
4. P2 (rola 06): plan na stali (`bake_stal`, pizza): „Po co ten krok” przy nagrzewaniu mówi o garnku (KRO-POC-011), a przy pieczeniu o nacięciu (KRO-POC-012) — poza zakresem M2-012 (tylko brioszka).
5. P2 (rola 09): `scripts/wepnij-przeklad.mjs` z wejściem spoza repo odtworzyłby usunięty klucz M2-013 (i poprawkę vi w `docs/lokalizacja/poprawki-przekladu.json`, wpis zostawiony dla generatora).

## Otwarte
- Drugi przegląd AI przekładu `przeklad-m2-012-2026-11-09.json`: nieodbyty (M2). Przegląd natywny: brak (DEC-06).
- Przegląd ścieżki wrażliwej: nie dotyczy (bez migracji, kopii, importu, eksportu, czyszczenia, zakupów, workflowów; `bake-session-store.ts` bez zmian, ścieżka wznowienia tylko testem).
- Zrzuty przed/po (plan brioszki, arkusz zgody): krok właściciela na urządzeniu albo E2E iOS.
- Decyzje właściciela: brak nowych. Status „zweryfikowane” nadaje reaudyt.

Kontrola dowodów i sekretów: `node narzedzia/sprawdz-raport.mjs wynik-p3.md /home/user/piekarz` → OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone (kod 0).

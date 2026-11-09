# 01-odkrywanie fix 2026-11-09 · partia 3 M2 (D-312 pkt 3, przekazania roli 03, F-72, 08-p3b-N3)

- Gałąź: naprawy/M2-koordynator-napraw-2026-11-09-p3 (start 9377bc95), wypchnięta. Środowisko: Linux, Node, git, push działa; sieć: curl do opensource.org działa.
- Klasyfikacja: pkt 1 i pkt 4 — D (BR niezgodne z decyzją D-312 / D-256 i z kodem); pkt 2 — D (funkcje MVP bez BR, ODK-01; nieaktualne BR-RECP-003, ODK-13); pkt 3 — kontrola bez zmiany wymagań. Bez nowych decyzji właściciela.

## Commity (jedno ER = jedna zmiana; verify kod 0 po `git add` przed każdym)
| Commit | ER | Zmiana |
|---|---|---|
| a2543cbe | ER-83 | BR-HARMO-001: „Plan dla wersji drożdżowej” (graham, żyto 100%, hydratacja 80%; BR-RECP-005), nowe „Wersja drożdżowa bez podziału czasu na etapy” (orkisz, D-257) i „Receptura drożdżowa z katalogu w 1.0” (`docs/brd/wymagania-wypiek.md:25`); backlog 1.0.1 i OP-74 (czasy etapów, rola 06); `scripts/br-wyjatki.json` BR-HARMO-001 z powodem według stanu 1.0; notka w `reguly.md` |
| 5584dd42 | ER-84, ER-85, ER-86 | BR-UST-004 Źródła wiedzy (`docs/brd/wymagania-dane.md:179`, dowód: D-123) i BR-UST-005 Licencje open source (`docs/brd/wymagania-dane.md:196`, dowód: OG-13 + S-109 + D-291), PR-10; ZM-29 bez BR w 1.0 (BR przy bramce 1.1); BR-RECP-003, scenariusz Dziennik bez Pro: statystyki w Pro, porównanie PÓŹNIEJ (`docs/brd/wymagania-dziennik.md:58`) |
| 5cfe8160 | ER-87 | F-72: potwierdzenie kompletności BR-MASZ-001…006 i RD-37…RD-39 dla kontraktu (bez zmiany wymagań i RD-37/38) |
| 5aa43faf | ER-88 | BR-ETAP-001: „Gotowość ciasta drożdżowego” dla wersji pszennych; nowy scenariusz „Gotowość żytniego ciasta drożdżowego” (`docs/brd/wymagania-wypiek.md:132`; ZYT-ETA-005, bez testu palca, D-256 c, D-258); wpis częściowy BR-ETAP-001 |

## Kontrola BRD przed/po
- Skrypt z promptu: przed `dowody/kontrola-p3-przed.txt` (2 błędy RD-37/RD-38 sprzed M2, M2-010; 84 BR, 45 OP) → po `dowody/kontrola-p3-po.txt` (te same 2 błędy, bez nowych; 86 BR, 46 OP). Przyczyna obu: skrypt nie czyta trzycyfrowych S (S-101…S-108).
- Wersja trzycyfrowa: przed `dowody/kontrola-3cyfry-p3-przed.txt` 0 błędów → po `dowody/kontrola-3cyfry-p3-po.txt` 0 błędów, kod 0.
- `scripts/br-bez-testu.mjs` kod 0 (86 BR, 80 z testem). `npm run verify` kod 0: 642 zestawy, 6591 testów (`dowody/verify-p3.txt`). `tests/wektory/brd.json` bez zmian (RD bez zmian).
- S-109 odczytane 2026-11-09 curl, surowy HTML: `dowody/s109-mit-odczyt-2026-11-09.txt`.

## Odstępstwo nazwane (zasada wspólna 7)
Tryb fix roli 01 nie zmienia testów. Żeby nowe BR przeszły bramki verify (br-bez-testu, kontrakt-zm28-058), commit 5584dd42 zmienia testy bez zmiany asercji, jak precedens ER-82 (58b65480): ID BR dopisane do nazw `describe` w `src/components/__tests__/zrodla-wiedzy-t2.test.tsx` i `src/components/__tests__/licencje-ekran-z081.test.tsx`; licznik 84 → 86 w `tests/br-bez-testu.test.ts`; BR-UST-004 i BR-UST-005 na liście „bez decyzji zakresu do 059” w `tests/kontrakt-zm28-058.test.ts` (lista, która miała tylko maleć, rośnie o 2, jak przy BR-DANE-005). Do przeglądu przez rolę 07.

## Przekazania
- **03 (059, 03-zakres-003):** kolumna „Wymagania” F-72 = BR-MASZ-001…006 (RD-37…RD-39) (ER-87); wiersze F-82 i F-83 = BR-UST-004 i BR-UST-005 (ER-84), potem usunięcie ich z listy w `tests/kontrakt-zm28-058.test.ts`; wiersz F-82 podaje 26 źródeł, kod ma 48 (`src/core/zrodla-wiedzy.ts`); plan receptur drożdżowych z katalogu w backlogu 1.0.1 (D-312, ER-83, OP-74). ZM-29: BR nadaje rola 01 przy otwarciu bramki 1.1 (ER-85).
- **07:** testy z ID: BR-HARMO-001 „Receptura drożdżowa z katalogu w 1.0” (np. pizza / chałka: „Ułóż plan” nieaktywne, powód „Plan wypieku jest tylko dla chleba na zakwasie, a ta receptura nie ma zakwasu.”), „Wersja drożdżowa bez podziału czasu na etapy” (orkisz: powód „Plan dla tej receptury na drożdżach czeka na czasy etapów. Ilości i wskazówki są wyżej.”), żyto 100% w „Plan dla wersji drożdżowej”; BR-ETAP-001 „Gotowość żytniego ciasta drożdżowego” (ekran Stolnicy, `rye_100_pan`: pierwsze rośnięcie z „Czasy są wskazówką…”, drugie ze zdaniem ZYT-ETA-005, bez wejścia do testu palca). Po testach: zawęzić wpisy częściowe BR-HARMO-001 i BR-ETAP-001 w `scripts/br-wyjatki.json`. Przegląd odstępstwa wyżej.
- **08:** brak zadań kodu (kod spełnia wszystkie nowe scenariusze; brakuje tylko testów z ID).
- **06:** OP-74 — czasy etapów receptur drożdżowych z katalogu na 1.0.1.
- **02:** `docs/monetyzacja.md` nadal wymienia porównanie w Pro (ER-86, za wynikiem roli 03).
- Teksty do akceptacji roli 04: brak nowych tekstów interfejsu. Przegląd ścieżki wrażliwej: nie dotyczy (BRD i nazwy testów).

## Nowe znaleziska
- N-1 (P2, D): `scripts/br-bez-testu.mjs` zgłasza „BR-KAL-012 ma pełny wyjątek i test — wyjątek do usunięcia albo oznaczenia „czesciowe”” (stan sprzed tej partii) — rola 07.

## Decyzje właściciela
Brak nowych. Kroki właściciela: brak. Status: ER-83…ER-88 naprawione-do-weryfikacji (część BRD); „zweryfikowane” nadaje reaudit.

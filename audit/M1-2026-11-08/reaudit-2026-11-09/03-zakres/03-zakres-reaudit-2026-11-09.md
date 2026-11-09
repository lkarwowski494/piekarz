# Reaudyt: Zakres i kontrakt MVP — Piekarz — 2026-11-09
Commit: ea249c9c · Tryb: reaudit, pętla 1 (baza 2ef8870a) · Grupa F (03-zakres, 02-monetyzacja, 11-wzrost w jednym kontekście, KO-006) · Środowisko: Linux x86_64, Node v22.23.4, git 2.43.0, sieć przez proxy (developer.apple.com, thefreshloaf.com, apps4brew.com odczytane); bez macOS, Xcode i symulatora; Expo web nieobsługiwane (jak w audycie). Dowód: dowody/e0-srodowisko.txt (SHA, korzenie historii, git status).

## Podsumowanie
Wszystkie zadania M1 tej roli oznaczone jako naprawione przechodzą weryfikację na ea249c9c: kontrakt ma wpis ZM-28 i wiersze F-73…F-81 dla pakietu D-092, model D-112/D-113 zamiast próby, ślad BR kompletny (`zakres.mjs --brd` 57 funkcji, 86 BR, 0 błędów, 0 uwag, kod 0), sumę apetytu 98 h z decyzją D-313, wyjątki od zasady 18 z D-nnn, ZAL i datą oceny, nazwany stan receptur bez planu, odłożenie diagnozy Doktora do 1.1 (ZM-29), a ekran Pro nie obiecuje porównania. Każdą z 16 obietnic ekranu Pro sprawdziłem na kodzie: każda ma funkcję Pro i strażnika (dowody/r1-015-obietnice.txt). Otwarte zostają dwie pozycje backlogu P3 (007 = M1-063) i E2E (009 = M1-066, grupa E). Nowe: jedno znalezisko P3 (regresja, dwie różne „pierwsze daty oceny po 90 dniach”). Pochodzenie: SHA commitów M2 z planu dla 015, 058, 061, 062, 064, 065 nie istnieją w repo (historia ea249c9c ma trzy korzenie, 2ef8870a nie jest przodkiem); weryfikowałem drzewo ea249c9c i `git diff 2ef8870a..ea249c9c`.

| ID | Wynik | Dowód |
|---|---|---|
| 03-zakres-001 | zweryfikowane (M1-058) | ZM-28 `docs/scope-contract.md:323`, F-73…F-81, F-17 `docs/scope-contract.md:92`; `zakres.mjs` kod 0 (dowody/r1-zakres-mjs.txt); `tests/kontrakt-zm28-058.test.ts` zielony (dowody/r1-jest-akceptacyjne.txt) |
| 03-zakres-002 | zweryfikowane (M1-015) | `src/components/PaywallModal.tsx:73` „Receptury i Dziennik: więcej własnych receptur i statystyki wypieków.”; 16/16 obietnic z kodem i strażnikiem (dowody/r1-015-obietnice.txt); `tests/obietnice-pro-015.test.ts` zielony |
| 03-zakres-003 | zweryfikowane (M1-059) | `docs/scope-contract.md:12` model D-112/D-113; „prób” poza historią ZM tylko jako „bez okresu próbnego” (dowody/r1-059-proba.txt); `zakres.mjs` 0 błędów; BR-RECP-005 z testem z ID, wyjątek zawężony do jednego scenariusza (070, cudzy) |
| 03-zakres-004 | zweryfikowane (M1-060) | karta naczynia usunięta (commit 9174cd66); `src/data/ustawienia-kopii.ts:21` klucz w kopii zostaje; `src/__tests__/naczynie-bez-skutku-060.test.tsx` zielony |
| 03-zakres-005 | zweryfikowane (M1-061, DEC-01 a) | `docs/scope-contract.md:42` stan 1.0: 26 receptur, 11 z planem; sonda katalogu 26/11, wersje drożdżowe 4/3 (dowody/r1-sonda-katalog-plan.txt); `tests/kontrakt-receptury-plan-061.test.ts` zielony |
| 03-zakres-006 | zweryfikowane (M1-062) | F-72, F-75, F-78, F-80, F-81 z D-nnn, ZAL „hipoteza” i „Ocena: … 2027-03-31” (`docs/scope-contract.md:50`); `tests/kontrakt-wyjatki-h-062.test.ts` zielony; zob. 03-zakres-601 |
| 03-zakres-007 | nadal otwarte (M1-063, P3 backlog, „zatwierdzone” bez commitu) | 35 wyników pierwszego użycia, wszystkie z 2026-10-20 (grep `wynik:` w kontrakcie); brak przejścia poznawczego po 2026-11-03 |
| 03-zakres-008 | zweryfikowane (M1-064) | `docs/decyzje.md:1803` „Apetyt 1.0 = 98 h (zastępuje 97 h z D-312 pkt 1”; `zakres.mjs`: 0 uwag o funkcji bez wiersza rankingu; `tests/kontrakt-ranking-064.test.ts` zielony |
| 03-zakres-009 | nie sprawdzono w grupie F (M1-066, grupa E) | zadanie z 12 ID źródłowymi weryfikuje grupa E |
| 03-zakres-601 | regresja, P3 | `docs/scope-contract.md:50` „pierwszy termin 2027-03-31” wobec `docs/wzrost/hipotezy.json:27` (2027-02-07) dla tej samej kotwicy: wydanie + 90 dni |

| Zadanie M1 (właściciel 03) | Wynik | Dowód |
|---|---|---|
| M1-audytor-generalny-065 (źródło G9 H4, DEC-19 b) | zweryfikowane | ZM-29 `docs/scope-contract.md:324` „PÓŹNIEJ do zakresu 1.1: DEC-19 b” z warunkiem powrotu; `tests/kontrakt-odlozone-065.test.ts` zielony; G9 nie ma pola „Test akceptacyjny”, więc kryterium = zapis decyzji b |
| 01-odkrywanie-001 (drugie źródło 015) | zweryfikowane razem z 03-zakres-002 | ta sama obietnica; opisy sklepu bez „porówn” (grep 0 trafień w `docs/wydanie/metadane/pl.json`, `docs/app-store-metadata-v2.md`) |

Liczby: zweryfikowane 8 (+ M1-065, + 01-odkrywanie-001 przez 015), nadal otwarte 1 (P3 backlog), regresja 1 (P3, nowe), istniało wcześniej 0, poza grupą 1.

## Testy akceptacyjne (wprost)
| Zadanie | Test istnieje | Sprawdza to, co mówi tytuł | Przechodzi |
|---|---|---|---|
| 015 | `tests/obietnice-pro-015.test.ts` | częściowo: tylko kierunek „ekran nie nazywa funkcji PÓŹNIEJ/NIE/TEST ani ukrytych wejść”; kierunek „każda obietnica ma funkcję Pro ze strażnikiem” bez automatu, sprawdzony ręcznie (16/16); lista `FUNKCJE_PRO` przepisana ręcznie (`tests/obietnice-pro-015.test.ts:49`), nie z typu `Funkcja` | tak |
| 058 | `tests/kontrakt-zm28-058.test.ts` | tak (BR z BRD z decyzją, ZM z D-092, F-17/KL-09, inwentarz) | tak |
| 059 | `tests/kontrakt-slad-059.test.ts` | tak | tak |
| 060 | `src/__tests__/naczynie-bez-skutku-060.test.tsx` | tak | tak |
| 061 | `tests/kontrakt-receptury-plan-061.test.ts` | tak (liczby z katalogu, nie wpisane na sztywno) | tak |
| 062 | `tests/kontrakt-wyjatki-h-062.test.ts` | tak | tak |
| 064 | `tests/kontrakt-ranking-064.test.ts` | tak | tak |
| 065 | `tests/kontrakt-odlozone-065.test.ts` | tak (wpis ZM z DEC-19 b) | tak |
Przebieg: `npx jest` na 15 plikach grupy F, 128 testów, kod 0 (dowody/r1-jest-akceptacyjne.txt). Pełnego `npm test` nie uruchamiałem (limit grupy; równolegle pracują inne grupy).

## Inwentarz funkcji i macierz śladu (reaudit)
- `inwentarz.mjs` (skrypt z promptu, kopia w scratchpadzie): 53 pozycje, kod 0 (dowody/r1-inwentarz.txt). Różnica wobec audytu (dowody/r1-inwentarz-diff.txt): 2 nowe wiersze, bez nowej funkcji — numer buildu w treści zgłoszenia (`src/lib/zgloszenie-wyslanie.ts`, F-69) i systemowy `Switch` przypomnień o karmieniu (`src/components/settings/PrzypomnieniaKarmieniaSection.tsx`, F-24/BR-ZAKW-004; zmiana roli 04). Karta naczynia znikła (004).
- `zakres.mjs --brd docs/brd`: 57 funkcji (MVP 48, PÓŹNIEJ 7, TEST 1, NIE 1), 86 BR, 0 błędów, 0 uwag; z `--apetyt 98` tylko PÓŹNIEJ poza apetytem (dowody/r1-zakres-mjs.txt).
- Wiersze macierzy po naprawach: F-73…F-81 (BR-KAL-001…016) i F-76 (BR-ETAP-006) z testem `tests/kontrakt-zm28-058.test.ts`; F-82/F-83 z BR-UST-004/005; F-72 z BR-MASZ-001…006; F-26 z BR-RECP-005 i testem `src/__tests__/br-recp-005-wersja-drozdzowa-070.test.tsx`.
- Uwaga bez nowego ID: test palca w krokach wersji drożdżowej jest teraz scenariuszem BR-ETAP-001 (F-07, ER-88, commit 9377bc95), a F-15 (TEST) dalej mówi, że wejście testu palca jest ukryte do wyniku testu. To różne miejsca (wersja drożdżowa ze źródła DRO-MOD-013 wobec oceny gotowości zakwasowego ciasta), ale wiersz F-15 mógłby to nazwać jednym zdaniem przy następnym fixie roli 03.

## Próbka regresji
Pliki obszaru zmienione od 2ef8870a (dowody/r1-diff-stat-obszar.txt): `docs/scope-contract.md` (191 linii zmian), `docs/monetyzacja.md`, `docs/wzrost.md`, `docs/wzrost/hipotezy.json`, `src/components/PaywallModal.tsx`, `src/lib/platnosci/konfiguracja.ts`, `src/lib/platnosci/nazwy-pro.ts`, metadane PL. Przejrzane zmiany: tekst „Co daje Pro” i nazwa blokady (nowy klucz „Statystyki piekarni domowej” ma przekład: `npm run check:i18n` kod 0, dowody/r1-check-i18n.txt); kontrakt (ZM-28…ZM-30, ranking, wyjątki H). Nowy problem: 03-zakres-601. Pozycje listy spoza zmienionych plików (grupa łącznie):
- ZAK-08 (podłogi): RD-21, Doktor i dane w Basic bez zmian — `src/lib/platnosci/konfiguracja.ts:39` i `src/lib/platnosci/konfiguracja.ts:40` na liście BASIC; ok.
- MON-02/MON-08 i WZR-04, WZR-10: w raportach 02-monetyzacja i 11-wzrost tej grupy (wektory dostępu 34/34, prośba o ocenę 35/35, brak SDK analityki).

## Znaleziska (szczegóły)

### 03-zakres-601 · Dwie różne „pierwsze daty oceny po 90 dniach od wydania” dla funkcji na hipotezie i dla H-01
- Pozycja listy kontrolnej: ZAK-05
- Poziom: P3 (nowe P2 → P3 według D-288; klasa: backlog 1.0.1, dokumentacja)
- Realność: realny · Pewność: wysoka
- Rodzaj: D
- Dowód: `docs/scope-contract.md:50` „pierwszy termin 2027-03-31 (przesuwany razem z wydaniem” (to samo w F-75, F-78, F-80, F-81); `docs/wzrost/hipotezy.json:27` `"data_oceny": "2027-02-07"` z regułą D-315 (data wydania z dziennika + 90 dni, do wydania nie wcześniej niż ostatni wiersz + 90); `docs/wydanie/widocznosc.md:110` też 2027-03-31.
- Mechanizm: dwie naprawy M2 (062 i 084) ustaliły datę oceny „90 dni po wydaniu” z różnym założeniem o dacie wydania (ok. 2026-12-31 wobec ≥ 2026-11-09); `grep -rn "2027-03-31\|2027-02-07" docs` → 7 trafień w 4 plikach.
- Powraca: nie
- Wzorzec lub źródło: zasada wspólna 4 (rejestr, nie pamięć); kontrakt roli, ZAK-05 (warunek oceny wyjątku).
- Kroki w aplikacji: brak; skutek dla właściciela: dwa terminy tej samej oceny po premierze.
- Opcje: (a) w kontrakcie i `widocznosc.md` ta sama reguła co D-315 („data wydania z `docs/wydanie/dziennik.md` + 90 dni”) bez daty na sztywno — kilka minut roli 03/10; (b) zostawić, bo obie daty „przesuwają się z wydaniem” — dwie liczby do pilnowania. Rekomendacja: (a).
- Test akceptacyjny: `grep -rn "2027-03-31" docs/scope-contract.md` bez trafień; wiersze z „Ocena:” odsyłają do reguły z dziennikiem wydań.
- Status: otwarte

## Kontrola dowodów i sekretów
Wynik `node audit/M1-2026-11-08/narzedzia/sprawdz-raport.mjs <ten raport> /home/user/piekarz audit/M1-2026-11-08/reaudit-2026-11-09/03-zakres --rola 03-zakres`: wklejony niżej po ostatnim przebiegu.

```
OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone; format raportu 03-zakres
kod wyjścia 0 (2026-11-09, ostatni przebieg po wklejeniu wyniku)
```

## Decyzje dla właściciela
1. 03-zakres-601: jedna reguła daty oceny dla wszystkich „90 dni po wydaniu” — (a) rekomendacja.
2. 03-zakres-007 (P3, backlog): przejście poznawcze funkcji po 2026-10-20 nadal bez wyniku; przy DEC-09 a było „roboczo na buildzie 1023” — warto zrobić przed zgłoszeniem, bo pas „Dziś” (F-73) jest na pierwszym ekranie.

Stan plików śledzonych: `git status --porcelain` puste na początku (dowody/e0-srodowisko.txt) i na końcu (dowody/e3-git-koniec.txt).

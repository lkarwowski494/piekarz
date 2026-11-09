# Rola 11-wzrost · fix · 2026-11-09 · M2 partia 3

Gałąź `naprawy/M2-koordynator-napraw-2026-11-09-p3` (start `a57d6de2`), push po każdym commicie, bez scalania. Środowisko: Linux, Node, git z prawem push; sieć przez proxy (Reddit 403, forum.cpk.pl bez połączenia, thefreshloaf.com 200, ftc.gov 404, ecfr.gov 200). Bez Xcode i bez narzędzia subagentów.

## E0 · Klasyfikacja i plan
| Zadanie | Źródło | Rodzaj | Wybór właściciela | Plan |
|---|---|---|---|---|
| M1-audytor-generalny-018 (P1) | 11-wzrost-002 | P | DEC-15 a (D-286) | budżet z ID, jeden kanał z odczytaną regułą, sekcja „Złe przyjęcie”, wiersz W1 w liście kontrolnej 10; testy w `tests/wzrost-dokument.test.ts` |
| M1-audytor-generalny-084 (P2) | 11-wzrost-005 | P | DEC-16 a (D-286) | zapis D-315, `min_proba_decyzja`, `data_wydania`, `data_oceny` z dziennika; testy w `tests/wzrost-hipotezy.test.ts` |

Dowodu przeciwko wyborom nie znalazłem. Uwaga do DEC-15 a: opcja (a) zakładała odczyt r/Sourdough i polskiej grupy przez właściciela; Reddit dalej 403, więc kanałem startu jest The Fresh Loaf, którego regułę odczytałem sam (istota DEC-15 a, „jeden kanał startu z odczytanym regulaminem”, spełniona bez czasu właściciela).

## E2 · Dowody
| ID | Commit | Testy (przed → po) | Pliki |
|---|---|---|---|
| 018 · 11-wzrost-002 | `83235746` | 4 nowe testy w `tests/wzrost-dokument.test.ts`: 4 ✕ → 4 ✓ | `docs/wzrost.md`, `docs/wydanie/plan-wydania-1.0.md` (W1-12, §6), test |
| 084 · 11-wzrost-005 | `14e5f546` | 2 nowe testy w `tests/wzrost-hipotezy.test.ts`: 2 ✕ → 2 ✓ | `docs/decyzje.md` (D-315), `docs/wzrost/hipotezy.json`, `docs/wzrost.md` (wiersz H-01), test |

- Czerwień z właściwego powodu (`dowody/e1-testy-przed.txt`): budżet „`[DO USTALENIA: decyzja właściciela]`”, 0 wierszy „kanał startu”, brak sekcji „Złe przyjęcie”, brak wiersza W1; `min_proba_decyzja` nieobecne, `data_wydania` undefined. Zieleń: `dowody/e1-testy-po.txt` (13/13).
- Pełny zestaw: `npm run verify` kod 0 przed każdym commitem, po `git add` — 018: 646 zestawów, 6755 testów (`dowody/e1-verify-018.txt`); 084: 646 / 6757 (`dowody/e1-verify-084.txt`).
- `node docs/wzrost/hipotezy.mjs docs/wzrost/hipotezy.json --dzis 2026-11-09` → kod 0, H-01 „przed terminem, bez oceny”.
- Zmiana niewidoczna w aplikacji (tylko dokumenty i testy): bez zrzutów. Bez nowych tekstów interfejsu: bez przekładu, bez akceptacji 04. Brak eksportów: `matrix:update` niepotrzebny.
- Ścieżka wrażliwa: nie dotyczy (bez migracji, kopii, zakupów, workflowów). Drugi przegląd AI przekładu: nie dotyczy.

## Przeczytane źródła (odczyt 2026-11-09, curl, surowy tekst w `dowody/e1-kanal-tfl-2026-11-09.txt`)
- https://www.thefreshloaf.com/node/80160 — administrator Floydm, 14 Oct 2026: „Sharing an app you built to address bakers' needs, including your own, is not spam IMO.”; „If someone incessantly posts about their app and nothing else and clearly is trying to drive people to purchase the app, yeah, ok, it'd be spam.” Ten sam wątek: „the site has been flooded with offers of new ones during the last few months” (tpassin).
- https://www.thefreshloaf.com/sitefaq — bez zasady o autopromocji; kontakt „Floydm or DorotaM” (podstawa do uznania Floydm za administratora).
- https://www.thefreshloaf.com/forum — „Spam will not be tolerated.”
- https://www.thefreshloaf.com/node/79496 (16 Feb 2026) — dowód niszy: pytania autora aplikacji z odpowiedziami piekarzy.
- Reddit `r/Sourdough` i `r/Breadit` rules: HTTP 403 (bez odczytu).

## Przekazania
- 07: testy akceptacyjne `tests/wzrost-dokument.test.ts` (4 testy „(018)”) i `tests/wzrost-hipotezy.test.ts` (2 testy „(084)”); D-315.
- 10: W1-12 w `docs/wydanie/plan-wydania-1.0.md` (kanał startu, regulamin ponownie w tygodniu wpisu) i budżet §6 = 2 h/tydz. (D-286, DEC-15 a); rola 10 może zmienić brzmienie wiersza.
- 08: brak (bez kodu).

## Nowe znaleziska (nie naprawiane)
- **N1 (P2, WZR-09):** wiersz H-01 w `docs/wzrost.md:100` i reguła rozstrzygania poniżej mówią o „DEC-01 d”, D-038 i „zamrożeniu”, a `docs/wzrost/hipotezy.json` o Basic/Pro (D-112, D-113) i „przeglądzie” — patrz 11-wzrost-001 (zadanie 083).
- **N2 (P2, WZR-02):** kanał startu jest angielski, a wiersz FTC w „Jawność i prawo” nadal `[DO USTALENIA]` (ftc.gov 404 również 2026-11-09; ecfr.gov, 16 CFR część 255, odpowiada 200 — do odczytu przez rolę 11 przed szkicem wpisu).

## Otwarte i kroki właściciela
- D-315 zapisane z rekomendacji (c) źródła przez D-286, a nie słowami właściciela — **do weta** (opcje odrzucone: 100 albo 166 pobrań).
- Po wydaniu: wpisać `data_wydania` w `hipotezy.json` (test wymusi `data_oceny` = +90 dni) i wiersz App Store w dzienniku.
- Publikacja wpisu na The Fresh Loaf: krok właściciela za osobną zgodą, po wydaniu; wcześniej co najmniej jeden zwykły wpis albo odpowiedź na forum [OCENA]; konto na forum to też działanie zewnętrzne za zgodą.
- Opcjonalnie (nie wymagane przez DEC-15 a): zalogowany odczyt regulaminów r/Sourdough i polskiej grupy, ok. 1–2 h.
- Status ID: naprawione-do-weryfikacji; „zweryfikowane” nadaje reaudit.

## Kontrola dowodów i sekretów
`node narzedzia/sprawdz-raport.mjs wynik.md /home/user/piekarz .` → „OK: odwołania, cytaty, pliki dowodów i sekrety sprawdzone”, kod 0 (2026-11-09).

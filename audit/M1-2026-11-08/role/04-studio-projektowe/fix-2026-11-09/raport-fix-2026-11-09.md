# Rola 04 fix 2026-11-09 — M1-audytor-generalny-007 (04-studio-projektowe-003), DEC-10 a

## E0
Środowisko: Linux, Node, git, push na gałąź; Playwright 1.63 (makiety); brak Xcode/symulatora i react-native-web (zrzutów aplikacji brak).
Klasyfikacja: P, rozstrzygnięte przez właściciela (DEC-10 a, D-286 / plan p2): przenieść 7 arkuszy przed zgłoszeniem. Dowodu przeciw wyborowi nie znalazłem.
Plan: test (statyczny skan `pageSheet` + render 7 arkuszy) → `ArkuszKart` + `Karta` w 7 arkuszach bez zmiany zachowania i testID → bez nowych tekstów.

## E1 zmiany
- `PlanWypiekuArkusz` + `BakeStepsList`: pasek „Zamknij | Plan wypieku”, karty „Składniki do odważenia” (WierszKarty) i „Wszystkie etapy wypieku” (wiersze karty, bieżący: wypełnione kółko + pogrubienie), „Przerwij wypiek” pod kartami.
- `PoCoTenKrokArkusz`: pasek z tytułem, nazwa kroku jako nagłówek karty (ikona info).
- `TemperaturaWodySheet` + `AccordionDdtSection`: sekcja jest kartą „Temperatura wody” (termometr), opis jako podpis karty.
- `ArkuszDnia`: data / „Najbliższe dni” jako nagłówek karty (testID karty `arkusz-dnia`, tytuł `arkusz-dnia-tytul` jak dotąd).
- `ArkuszPlanu`: tytuł planu jako nagłówek karty (zegar), „Start …” podpisem, kroki w karcie, przyciski pod kartą.
- `ImportRecipeModal`: „Anuluj” w pasku, karty „Importuj recepturę” i „Poprawna formuła”, dolne przyciski bez zmian.
- `ImportZPlikuArkusz`: „Anuluj” / „Dodaj” w pasku arkusza (Dodaj nieczynny w trakcie zapisu, jak dotąd), treść w karcie z tytułem według rodzaju pliku.
- Struktura: `PasekArkusza` rysuje przyciski funkcją `przyciskNaglowka` (DraftHeader) z opcją `wylaczony` → jeden element z testID i akcją (bez tego `import-z-pliku-113` liczył 2 węzły; testu nie zmieniałem).
- Trwała kontrola: `src/__tests__/arkusze-w-kartach-007.test.tsx` — każdy `presentationStyle="pageSheet"` w `src/` przez `ArkuszKart` albo na liście wyjątków z ID; 7 arkuszy nie może być wyjątkiem; render: pasek, ≥1 karta, brak nagłówka na tle.

## Nowe znalezisko
### 04-studio-projektowe-007 · Sześć kolejnych arkuszy pageSheet poza systemem kart
- Pozycja listy kontrolnej: SP-13 · Poziom: P1 · Realność: realny · Pewność: wysoka · Rodzaj: P
- Dowód: skan w teście 007 (`grep -rl 'presentationStyle="pageSheet"' src`): `ZgodaPowiadomien.tsx`, `BreadAcademyModal.tsx`, `FlourEquivalentsModal.tsx`, `VolumeConverterModal.tsx`, `FlourBlendModal.tsx`, `FlourInventoryModal.tsx` — bez `ArkuszKart`/`Karta`; nie było ich w 003 ani w README §4. (`SkladnikiSheet`, `SettingsModal`: karty w treści, wyjątek D-160.)
- Opcje: (a) przenieść jak 007 (rola 04/08, S–M); (b) wyjątek nazwany w README §1 do 1.0.1. Rekomendacja: (a) dla `ZgodaPowiadomien` (ścieżka wypieku), reszta (kalkulatory mąk) decyzja właściciela.
- Test akceptacyjny: usunięcie wpisu z `WYJATKI` w teście 007 przy zielonym teście.
- Status: otwarte (na liście wyjątków testu z tym ID).

## Czego nie sprawdzono
Zrzuty aplikacji przed/po (brak symulatora i Expo web); makieta odwzorowania kodu `makieta/arkusze-007.html` → `zrzuty/arkusze-007-*-390-{light,dark}.png` (to nie zrzut aplikacji). AX5/320 nie mierzone na urządzeniu. Przegląd ścieżki wrażliwej (import) nieodbyty: `przeglad-sciezki-wrazliwej-polecenie.md`.

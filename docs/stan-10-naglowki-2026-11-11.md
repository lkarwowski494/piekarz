# Stan sesji N (rola 10-wydanie fix, KO-039…KO-041) — 2026-11-11 — ZAKOŃCZONA

- Nagłówki (PL / EN, §3 `docs/app-store-metadata-v2.md`, 34 lokalizacje `docs/wydanie/metadane/`):
  E1 „Na twoją godzinę, z ochroną snu” / „Ready at Your Time, Sleep Protected” (KO-041, D-370);
  E3 „Powiadomienie, gdy telefon śpi” / „Notified Even When Your Phone Sleeps” (KO-040, D-367);
  E7 „Bez konta, reklam i internetu” / „No Account, Ads or Internet” (KO-040, D-367). „Za darmo” na zrzucie: nie (D-369, 2.3.7).
- Test akceptacyjny `tests/ramki-sklepu-atuty-ko039.test.ts` + `docs/lokalizacja/terminy-ramek-ko039.json` (D-368): czerwony 34/34 przed, zielony po.
- Dowody: `docs/dowody-10-naglowki/` (test przed/po, tłumaczenia zwrotne, recenzja niezależna, verify.txt z KOD WYJŚCIA 0).
- Otwarte (znaleziska, bez zmian): podtytuł ramki 1 „bez kroków w środku nocy” (§3 i `podtytul` 34 lok.) — ta sama obietnica co P1-1; słownik fi „Sleep Guard” nieprzetłumaczony; P3 z tłumaczeń zwrotnych (18 + 7) i recenzji (9) do listy; test nie sprawdza negacji (D-368); przegląd natywny nieodbyty (DEC-06).
- Kroki po stronie koordynatora: przebieg `zrzuty-sklepu.yml` (ramki z nowymi nagłówkami), potem wgranie.

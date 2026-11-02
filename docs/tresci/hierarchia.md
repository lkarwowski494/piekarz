# Treści domenowe Piekarza: miejsce, hierarchia źródeł, kontrola

Zapis roli 06-tresci, 2026-10-19 (decyzja merytoryczna; właściciel może ją zawetować, ale jej nie ustala).

## Miejsce

- `docs/tresci/rejestr.json` — rejestr twierdzeń (jedno twierdzenie = jeden fakt, liczba albo reguła; źródło z adresem, cytatem, datą odczytu i szczeblem).
- `docs/tresci/pl/`, `docs/tresci/en/` — treści wypisane z interfejsu, zdanie po zdaniu, ze znacznikiem `[T:ID]` (albo `[T:-]` dla zdania bez faktu). Nagłówek nad zdaniem wskazuje pole w kodzie, do którego tekst trafia. Kod aplikacji (`src/`, `app/`) bierze teksty z tych plików; zmianę w kodzie wdraża rola 08 pod ID twierdzenia.
- `docs/tresci/wektory/` — wektory testowe dla ról 07 i 08 (wejście, oczekiwany wynik, ID twierdzeń).
- `docs/tresci/przeglad/` — listy do przeglądu człowieka treści krytycznej (skrót wersji zdań z `--skroty`).
- `scripts/kontrole-tresci.mjs` — kontrola mechaniczna (znaczniki, liczby, granice, źródła, przegląd).

Dlaczego tu: `CLAUDE.md` nie wskazuje osobnego repo treści, a treść jest w całości własnymi słowami z cytatami źródeł najwyżej 1–2 zdania, więc może leżeć w publicznym repo obok kodu, który z niej korzysta.

## Hierarchia źródeł

Podstawa: DEC-07 (`docs/brd/00b_Decyzje.md`, „Hierarchia źródeł wiedzy piekarskiej”) dla technologii pieczenia, uzupełniona domyślną hierarchią roli 06 dla bezpieczeństwa żywności, której DEC-07 nie obejmuje:

1. Przepisy i wytyczne urzędowe (USDA FSIS, eCFR, EFSA, GIS), rachunek fizyczny lub stechiometryczny, normy ICC/PN.
2. Literatura recenzowana i monografie naukowe.
3. Serwisy instytucji (uczelniane extension, instytuty), podręczniki mistrzowskie wskazane w DEC-07.
4. Autorytety rzemieślnicze, przewodniki z podanymi źródłami (tylko kontekst z atrybucją w treści).
   - Wyjątek nazwany (D-125, 2026-11-02, noc, do weta): od D-123 atrybucja stoi na ekranie „Źródła wiedzy” w Ustawieniach, nie w zdaniu. Warunki: każde źródło twierdzenia użytego w `docs/tresci/pl` jest na tym ekranie, a zdanie zachowuje zakres źródła (przykład, jedna próba, „zwykle”, przybliżenie) zwykłymi słowami. *Dlaczego:* decyzja właściciela o języku naturalnym zmienia formę atrybucji, a nie to, ile zdanie wolno twierdzić.
5. Fora, blogi, Wikipedia — wskazówka, gdzie szukać; nigdy źródło reguły.

Treść krytyczna (bezpieczeństwo żywności, zdrowie, mienie): granice i oceny tylko ze szczebla 1–3; szczebel 3 oznaczony w rejestrze jako „jedno źródło”, gdy jest jedynym. Liczba źródeł nie zastępuje szczebla — ta zasada zastępuje regułę „dwóch niezależnych źródeł” z `docs/brd/C4b.md` (8.P.1). *Dlaczego:* reguła liczby źródeł nie wymaga ich przeczytania i przeczy DEC-07.

## Kontrola

```
node scripts/kontrole-tresci.mjs docs/tresci/rejestr.json docs/tresci/pl docs/tresci/en
```

Kod 0 = brak błędów. Do czasu przeglądu człowieka treści krytycznej (pole `przeglad` w rejestrze) wynik bez flagi jest czerwony; z `--przed-przegladem` brak przeglądu daje tylko uwagę. `--skroty` wypisuje skrót zdań każdego twierdzenia krytycznego do listy przeglądu. *Dlaczego:* błędy mechaniczne przechodziły ręczny przegląd, a przegląd dotyczy konkretnej wersji zdań.

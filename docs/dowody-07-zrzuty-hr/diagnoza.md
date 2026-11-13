# Zrzuty #9 próbka (run 43284925139, master a6eb5144, aplikacja z 43218573090) — diagnoza hr (sesja W, 2026-11-13)

Źródło: artefakty `zrzuty-dzienniki-iphone-*` przebiegu #9 (6,9″: 1, 2, 4, 5; 6,3″: 1–6), pobrane 2026-11-13.
Etykiety wyciąga `etykiety.py` (z `maestro.log` kroku: element stuknięty przez wzorzec okna; z hierarchii ekranu: przyciski okna) → `etykiety-przebieg-9.tsv`.

## Wynik
- Jedyna nieudana lokalizacja: **hr**, na obu rozmiarach (`nieudane-iphone-6.9-2.txt`, `nieudane-iphone-6.3-2.txt`: `hr 00-przygotuj`). Klasa porażki: **scenariusz**.
- Przebieg hr (6,9″ i 6,3″ tak samo):
  1. `00-przygotuj` próba 1: po pierwszym dokarmieniu okno się nie pojawia (krok okna WARNED/SKIPPED), scena przechodzi.
  2. `00-przygotuj-podwojenie` próba 1: `sub/zgoda.yaml` stuka „Nastavi” (zgoda-dalej-btn), iOS pokazuje okno zgody po chorwacku z przyciskami **„Nemoj dozvoliti” / „Dozvoli”** (hierarchia, zrzut `hr-okno-zgody-6.9.png`, `hr-okno-zgody-6.3.png`). Wzorzec w `sub/okno-systemu.yaml` ma dla hr „Dopusti” (wpis `niezweryfikowane` w `tests/dane/okno-zgody-ios.json`, D-394), więc okno zostaje → `step-title` niewidoczny → FAIL.
  3. Ponowienie `00-przygotuj` (clearState): okno systemowe dalej stoi nad aplikacją (hierarchia `step-004-assertCondition-start-czynnosci.json`: ten sam tytuł i przyciski) → `start-czynnosci` niewidoczny → FAIL.
- Hipoteza koordynatora potwierdzona: etykieta spoza wzorca.

## Zasięg (etykieta „zezwól” stuknięta przez wzorzec w #9)
| lokalizacja | etykieta | części |
|---|---|---|
| cs | Povolit | 6.3-6 |
| de-DE | Erlauben | 6.3-1, 6.9-1 |
| el | Να επιτρέπεται | 6.3-1, 6.9-1 |
| fr-FR | Autoriser | 6.3-1, 6.9-1 |
| hu | Engedélyezés | 6.3-2, 6.9-2 |
| ms | Benarkan | 6.3-2, 6.9-2 |
| nl-NL | Sta toe | 6.3-3 |
| pt-PT | Permitir | 6.3-3 |
| ro | Permiteți | 6.3-3 |
| ru | Разрешить | 6.3-4, 6.9-4 |
| sk | Povoliť | 6.3-4, 6.9-4 |
| sl | Dovoli | 6.3-4 |
| sv | Tillåt | 6.3-5, 6.9-5 |
| tr | İzin Ver | 6.3-5, 6.9-5 |
| uk | Дозволити | 6.3-5, 6.9-5 |
| vi | Cho phép | 6.3-6 |
| **hr** | **Dozvoli** (odmowa „Nemoj dozvoliti”), z hierarchii | 6.3-2, 6.9-2 |

- nl-NL, pt-PT, ro, vi, cs: anulowane były tylko części 6,9″ (6.9-3, 6.9-6); na 6,3″ (6.3-3, 6.3-6) okno zamknięte poprawnie. Etykieta okna nie zależy od rozmiaru (hr: ta sama na 6,9″ i 6,3″), więc ta przyczyna ich nie dotyczy; przebieg 6,9″ tych lokalizacji: nie sprawdzono.
- Etykiet „odmów” z #9 potwierdzona tylko hr (pozostałe okna stuknięte, bez zrzutu hierarchii).
- Po #9 bez potwierdzenia z przebiegu zostają: en-AU, en-CA, en-GB, en-US, fr-CA (`[DO USTALENIA]`, potwierdzi pełny przebieg).

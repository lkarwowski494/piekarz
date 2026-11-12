# Zrzuty #8 (run 43238947035, master 69edd0fb, aplikacja z 43218573090) — diagnoza (sesja V, 2026-11-12)

Źródło: artefakty `zrzuty-dzienniki-iphone-*` przebiegu #8 (6,9″: części 1, 2, 3, 4, 6, 7, 8, 12; 6,3″: części 4 i 6 — **ruszyły**, wbrew notatce „żadna nie wystartowała”).
Wynik każdego scenariusza: `przebieg-8-sceny.txt` (folder dziennika | wynik | tytuł okna zgody znaleziony w hierarchii).

## Wynik
- **Komplet 7 scen przeszedł tylko w pl i en-*** (en-AU, en-CA, en-GB, en-US). Każda inna lokalizacja pada w `00-przygotuj-podwojenie`, więc nie ma danych i żadnej sceny.
- Klasa porażki: **scenariusz** (nie aplikacja, nie maszyna). Dwie przyczyny, obie niezależne od rozmiaru ekranu.

## Przyczyna A — okno zgody iOS w języku lokalizacji (12 lokalizacji w #8)
- `sub/okno-systemu.yaml` stuka tylko `Pozwalaj|Zezwalaj|Zezwól|Allow`. Po „Dalej” (zgoda-dalej-btn) iOS pokazuje okno w języku systemu; nikt go nie zamyka, `step-title` niewidoczny → FAIL (`A-cs-podwojenie-maestro.log`, zrzut `A-cs-okno-zgody-6.9.png`: „Povolit”).
- Pozostałość okna blokuje też ponowienie `00-przygotuj` (próba 2: `start-czynnosci` niewidoczny pod oknem).
- Założenie „zgoda raz w en-US przetrwa clearState” (00-zgoda.yaml) jest fałszywe z dwóch powodów:
  1. `00-zgoda` nigdy nie wywołuje prośby (pierwsze dokarmienie jej nie wywołuje; w każdej części „Allow … WARNED / SKIPPED”);
  2. część 8: pl stuknęło „Zezwól” (zgoda nadana), a pt-BR po `clearState` dostało okno ponownie (`A-pt-BR-po-pl-maestro.log`, hierarchia: „Não Permitir” / „Permitir”) — **clearState kasuje decyzję**.
- `launchApp: permissions: notifications: allow` nie zapobiega oknu na iOS 26.5 (okno widać w każdej lokalizacji).
- Etykiety przycisków odczytane z hierarchii #8 (iOS 26.5, symulator), „zezwól” / „nie zezwalaj”:
  cs Povolit / Zakázat · da Tillad / Tillad ikke · es-ES, es-MX Permitir / No permitir · pt-BR Permitir / Não Permitir · fi Salli / Älä salli ·
  id Izinkan / Jangan Izinkan · it Consenti / Non consentire · ja 許可 / 許可しない · ko 허용 / 허용 안 함 · no (nb) Tillat / Ikke tillat · zh-Hant 允許 / 不允許.
- Położenie przycisku zależy od języka (it, id: przyciski jeden pod drugim), więc stuknięcie w punkt ekranu odpada.

## Przyczyna B — stuknięcie „Podwoił objętość” pod paskiem kart (7 lokalizacji w #8)
- Maestro uznaje element za widoczny bez zasłonięcia (jak D-391). Gdy po `scrollUntilVisible` środek przycisku leży w pasie kart (6,9″: pasek y 873–922), `tapOn` trafia w kartę „Zakwasy”: zakładanie nie kończy się, `zakladanie-wynik-ready` nie powstaje → FAIL (`B-de-DE-podwojenie-maestro.log`, zrzut `B-de-DE-po-stuknieciu-6.9.png`).
- `zakwas-podwoil-btn` (bounds z maestro.log, 6,9″), środek przycisku vs góra paska 873:

| lokalizacja | bounds y | środek | wynik |
|---|---|---|---|
| de-DE | 885–933 | 909 | FAIL |
| el | 893–941 | 917 | FAIL |
| es-MX | 879–927 | 903 | FAIL |
| fr-CA | 870–918 | 894 | FAIL |
| id | 865–913 | 889 | FAIL |
| ms | 865–913 | 889 | FAIL |
| nl-NL | 867–915 | 891 | FAIL |
| it, pt-BR | 845–893 | 869 | przeszło (potem A) |
| pl | 828–876 | 852 | przeszło |

- Ta sama klasa raz w fi (`zakladanie-pierwsze-dokarmienie-btn` y 24–72, pod czapką; ponowienie przeszło).
- Położenie zależy od długości tekstów nad przyciskiem, więc dotyczy każdej lokalizacji i obu rozmiarów (6,3″ es-MX, id: przycisk wyżej, przeszło; inna lokalizacja może trafić w pasek).

## Inne (bez wpływu na wynik)
- 6,3-6 en-US `00-zgoda`: stuknięcie w „Starters” nie przełączyło karty (zrzut: ekran „Dziś”); 00-zgoda tylko ostrzega. Maszyna/czas startu, P2.

## Zasięg
- Rozmiary: oba (A zawsze; B zależnie od układu). Lokalizacje: wszystkie poza pl i en-* (29 z 34). Sceny: wszystkie (blokada w przygotowaniu); sceny z `sub/zgoda.yaml` (03, 07) też trafiłyby na A, gdyby okno się powtórzyło.

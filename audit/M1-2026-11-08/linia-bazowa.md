# Linia bazowa całości (E0b M1) — Piekarz — 2026-11-08

Commit: 2ef8870a (tag v1.0.0-b1023). Autor: M1, przed lekturą BRD, ADR, kontraktu zakresu i kodu.
Wejście o aplikacji: zdanie celu (`CLAUDE.md`, „Stan projektu”) i opis w sklepie (`docs/wydanie/metadane/en-US.json`).
**Wyjątek nazwany (zasada 7):** `CLAUDE.md` wczytał się automatycznie w całości (sekcje architektury i niezmienników), więc linia bazowa nie jest w pełni ślepa na deklaracje projektu. Zastępcza kontrola: soczewki 2–4 jako subagenci w partii 1 bez dostępu do repo (polecenie ze wzorców).

## Źródła przeczytane dziś (2026-11-08)
- Apple iTunes Search API, `term=sourdough`, US i PL (surowy JSON: scratchpad `web/search-us.json`, `web/search-pl.json`). Najwięcej ocen w USA: West Coast Sourdough 1679 (ostatnia wersja 2024-10-03), Kneady 733 (4,80), Loaflo 567 (4,69), Rise 337 (4,87). W PL wszystkie ≤ 5 ocen: rynek PL nie daje sygnału z recenzji.
- Apple lookup + RSS recenzji (US, najnowsze) dla Loaflo (id 6736766728), Rise (1515369685), Kneady (1534576984): `web/lk-*.json`, `web/rv-*.json`.

## Główne prace użytkownika (sytuacje użycia)
1. Policzyć ilości z procentów piekarskich, z mąką i wodą zakwasu i zaczynu (przed wypiekiem, w kuchni, ręce w mące).
2. Zaplanować wypiek od godziny „gotowe” wstecz, z temperaturą kuchni i bez kroków w nocy.
3. Prowadzić przez kroki z przypomnieniem, gdy telefon jest zablokowany: główna obietnica, główne ryzyko.
4. Utrzymać zakwas (dokarmianie, gotowość, bezpieczeństwo: pleśń).
5. Poprawić następny bochenek (objawy → przyczyna → jedna zmiana; dziennik).
6. Nie stracić receptur i dziennika (kopia, eksport, zmiana telefonu: brak synchronizacji to deklarowane ograniczenie).

## Alternatywy (czytane dziś) i najczęstsze skargi
| Alternatywa | Co robi lepiej | Skargi w recenzjach (US, najnowsze) | Cena |
|---|---|---|---|
| Loaflo (567 ocen) | analiza zdjęcia AI, czat, bez konta | 18/28 najnowszych ≤ 3★: paywall niezapowiedziany w opisie i zrzutach, „6 dollars weekly”, nie da się anulować próby, „works half the time” | subskrypcja tygodniowa ok. 6 USD (z recenzji, [DO USTALENIA] cena ze sklepu) |
| Rise (337 ocen) | dynamiczny czas fermentacji z temperatury ciasta i składników, harmonogram z powiadomieniami, import receptur AI, synchronizacja między urządzeniami | 4/37 ≤ 3★: aplikacja nie startuje, import nie działa, brak powiadomień o dokarmianiu po zakupie | [DO USTALENIA] (stronę sklepu blokuje JS) |
| Kneady (733 oceny) | 600+ receptur, tryb pieczenia, minutniki | brak własnych receptur, brak jednostek objętości | free + 2 subskrypcje |
| Bez aplikacji | zeszyt + minutnik + receptura z bloga | brak przeliczeń, brak budzenia w nocy | 0 |

Wniosek dla wzorca: przewaga, którą da się obronić, to **uczciwy model płatności** (najczęstsza skarga konkurencji to ukryta subskrypcja), **niezawodne przypomnienia przy zablokowanym telefonie** (skargi Rise i Loaflo) i **liczenie bez sieci i konta**. Słabości wobec konkurencji: brak synchronizacji (Rise), brak analizy zdjęć AI (Loaflo; zgodnie z celem „offline” to świadome odcięcie, do potwierdzenia przez 03).

## Ograniczenia dziedziny i platformy (do potwierdzenia źródłem przez role)
- Powiadomienia lokalne iOS przy uśpionej aplikacji: limit oczekujących powiadomień i zachowanie przy wyłączonej zgodzie [DO USTALENIA: 05, 12, źródło Apple].
- Bezpieczeństwo żywności: pleśń w zakwasie, gorący garnek, surowe ciasto (treści krytyczne: 06, C-003).
- Zakupy: wytyczne App Store 3.1.1/3.1.2 (subskrypcja + dożywotni, bez próby), etykieta prywatności „Data Not Collected” [DO USTALENIA: 02, 10, strona Apple w dniu pracy].
- 35 języków: liczby, godziny i jednostki w lokalnym formacie (znane otwarte: es „a las {godzina}” dla 1:xx).

## Obszary krytyczne
Dane (receptury, zakwasy, dziennik, kopie, import, ratunek przy uszkodzeniu); przypomnienia przy zablokowanym telefonie (główny przepływ); pieniądze (Basic/Pro, przywracanie zakupów, wygaśnięcie Pro); prywatność (zero sieci, etykieta); treści krytyczne (bezpieczeństwo żywności).

## Co musi być prawdą (wstępnie, M1; soczewki dopiszą w partii 1)
1. Plan wsteczny i powiadomienia działają przy zablokowanym telefonie i po restarcie aplikacji; brak zgody jest jasno pokazany (praca 3).
2. Żadna operacja (import, czyszczenie, aktualizacja, uszkodzony plik, pełny dysk) nie traci danych bez kopii (praca 6).
3. Basic jest użyteczny, granica Pro widoczna przed zakupem, żadnego ukrytego paywalla; przywracanie działa (przewaga nad Loaflo).
4. Liczby (procent piekarski z zakwasem, temperatura wody, czasy fermentacji) mają źródła i testy własności (praca 1–2).
5. Obietnice sklepu (15 receptur, 9 wad, 4 protokoły, 10 kopii, 35 języków, „no tracking”) zgadzają się z kodem.
6. Interfejs da się użyć jedną ręką, przy dużej czcionce i 320 pt, z rękami w mące (krótkie interakcje).

## Soczewki
Przed planem M1 przeszedł soczewki 1 (nowy użytkownik) i 5 (właściciel 0 zł) sam; 2 (praktyk), 3 (recenzent/użytkownik konkurencji), 4 (sceptyk ryzyka) jako subagenci w partii 1 → `K/soczewki/`.

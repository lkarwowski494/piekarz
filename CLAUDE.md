# Piekarz (Crust) — Instrukcje dla zespołu i agentów AI

Aplikacja mobilna (Expo / React Native, TypeScript, watchOS, Garmin) dla domowych piekarzy rzemieślniczych, pasjonatów chleba na zakwasie i pizzy neapolitańskiej.
Studio: **Apps4Brew** („tańsze niż dobre espresso”, rzemiosło, offline-first, zero serwerów, zero analityki szpiegującej).
Właściciel produktu: Łukasz.

---

## 1. Dokumentacja referencyjna projektu (Google Drive)

* 📁 Folder główny projektu: [Piekarz](https://drive.google.com/drive/folders/1qxFVHz1z1iEMOIpZBDOALImag5-Rkr3M)
* 📁 Dokumenty wymagań biznesowych (26 dokumentów): [Piekarz / 02 BRD](https://drive.google.com/drive/folders/1lcPSW4U3_TiPBQJChfspPByQsMu21tLp)
  * [00 START — Streszczenie i warianty MVP](https://docs.google.com/document/d/1tzwhPdJrmuN_PyGgedUUapsiYoma3yB_8qbKfkukAlY/edit)
  * [00b Jedna lista decyzji (DEC-01…DEC-40)](https://docs.google.com/document/d/1iL_jE4p1EJNs41Zjdmim50knvvO7Ha_dVTQn3J0n--0/edit)
  * [A1 Wizja, zasady ZP-01…16, persony i sytuacje](https://docs.google.com/document/d/1PY1nRACJTecqC8PEhE2qsRWwCjNApXz_k3Q7qoG1gqo/edit)
  * [A2 Rynek, wytyczne Apple 4.3 i model przychodu](https://docs.google.com/document/d/1MtSWy5Z5c7uoEA7-TMyoaKnz0MfyO-mTXtHLgXkF2GU/edit)
  * [B1…B6 Wymagania narzędziowe (Kalkulator %, DDT, Harmonogram, Stolnica, Zakwas)](https://docs.google.com/document/d/11KfF9InfQTLyW_3u4vDxJILbJ37fvmnt8f9LIegbGb4/edit)
  * [C1…C4b Nauka, reguły dziedzinowe RD-00…RD-15, wektory testowe TV-01…08](https://docs.google.com/document/d/1sKyozeG07SJB_idvOPIejdOAXM9gdJJloCphnosvNmE/edit)
  * [D1…D4 Wymagania NFR, model SQLite, architektura zegarkowa i 50 ryzyk](https://docs.google.com/document/d/1Bx3xuKIrg0RW8gF_y3CSHVh6086jt4gEXh6D46Ccx-Y/edit)

---

## 2. Nienegocjowalne zasady produktu (Duch Apps4Brew)

1. **ZP-01 Ręce w mące:** Sterowanie etapami stolnicowymi bez brudzenia ekranu (Apple Watch Double Tap, Digital Crown, Garmin, Live Activity, Action Button, duże cele dotykowe 64x64 pt).
2. **ZP-02 Bez konta:** Zero ekranów rejestracji, brak logowania, pierwszy widok to działające narzędzie.
3. **ZP-03 Bez serwera i bez chmurowego AI:** Cała matematyka, algorytmy DDT i diagnostyka działają w 100% lokalnie na procesorze urządzenia.
4. **ZP-04 Bez reklam i śledzenia:** Czyste „Data Not Collected” w App Store Privacy Label.
5. **ZP-05 True Baker's Percentage:** Mąka i woda z zakwasu bezwzględnie wliczane do całkowitej hydratacji ciasta ($H_c$). Brak zaokrągleń pośrednich (RD-00).
6. **ZP-06 Dane nie znikają:** Lokalna baza SQLite (WAL mode) z transakcjami ACID i automatyczną kopią w prywatnym iCloud Drive użytkownika.
7. **ZP-08 Uczciwy model:** 0,99 € miesięcznie, 4,99 € rocznie, 14,99 € dożywotnio. 14 dni pełnego trialu. Family Sharing włączone.
8. **ZP-11 Rygor merytoryczny:** Każda formuła poparta literaturą mistrzowską (Hamelman, Calvel, Robertson).

---

## 3. Architektura kodu

* `src/core/`:
  * `domain-rules.ts` — Czyste, deterministyczne funkcje matematyczne dla procentów piekarskich, True Overall Hydration, kalkulatora DDT 4-składnikowego, przeliczników drożdży, tarcia misy i współczynnika $Q_{10}$.
  * `__tests__/domain-rules.test.ts` — Testy jednostkowe weryfikujące wektory testowe TV-01…TV-08.
* `src/scheduler/`:
  * `reverse-scheduler.ts` — Silnik harmonogramu wstecznego (Reverse Timeline) i Sleep Guard (ochrona przed pobudkami w nocy).
  * `__tests__/reverse-scheduler.test.ts` — Testy algorytmu planowania.
* `src/doctor/`:
  * `diagnostics.ts` — Interaktywne drzewo decyzyjne „Doktora Chleba” (under-proofed, over-proofed, blow-out, gummy crumb, pale crust).
* `src/recipes/`:
  * `presets.ts` — 6 receptur wzorcowych Apps4Brew (Country Loaf, Żytni razowiec, No-Knead, Tartine 80%, Pizza Napoletana, Chałka).
* `src/data/`:
  * `schema.ts`, `db.ts` — Schemat SQLite/SwiftData, migracje, obsługa transakcyjna.
* `src/ui/`:
  * Komponenty, motyw kolorystyczny (Linen & Crust #FBF9F5, #2C1810, #D97724, #F59E0B) oraz ekrany (Kalkulator, Harmonogram, Stolnica, Zakwas, Diagnoza).

---

## 4. Standardy jakości i testów

* Przed zatwierdzeniem zmian: `npm run verify` (`npm run typecheck && npm test`) musi przejść ze statusem zielonym.
* Pokrycie testami logiki dziedzinowej (`src/core`, `src/scheduler`, `src/doctor`) $\ge 95\%$.
* Zero tolerancji dla błędów bilansu masowego (odchyłka sumy składników $>1\text{ g}$ to błąd krytyczny).

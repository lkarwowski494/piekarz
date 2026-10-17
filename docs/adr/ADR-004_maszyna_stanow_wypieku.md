# ADR-004: Deterministyczna maszyna stanów procesu wypieku chleba (Event-Driven FSM)

**Status:** ACCEPTED  
**Data:** 18.10.2026  
**Autor:** Principal System Architect  
**Kontekst:** Wypiek chleba rzemieślniczego to proces trwający od 18 do 36 godzin (dokarmienie zakwasu, autoliza, dodanie soli bassinage, fermentacja burzliwa z pętlą składań, formowanie wstępne, bench rest, garowanie końcowe w lodówce 16h, nacinanie, wypiek parowy i rumienienie w garnku żeliwnym). Brak formalnej maszyny stanów prowadzi do błędów asynchronicznych, utraty etapu przy przeładowaniu aplikacji lub błędnego odliczania timerów.

---

## Rozważane Opcje

### Opcja A: Deterministyczna maszyna stanów (FSM) z dyskretnymi przejściami i zapisem w SQLite (Rekomendowana)
- **Opis:**
  Proces wypieku na stolnicy modelowany jest jako skończona maszyna stanów (Finite State Machine):
  - **Dyskretne Fazy:**
    1. `IDLE` (brak aktywnego wypieku)
    2. `AUTOLYSE` (mąka + woda)
    3. `MIXING_BASSINAGE` (dodanie soli i reszty wody)
    4. `BULK_FERMENTATION` (pętla składań coil-fold z sub-stanem liczbowym `fold_index: 1..4`)
    5. `PRE_SHAPE_BENCH_REST` (odpoczynek na desce 20 min)
    6. `FINAL_SHAPE` (naciąg powierzchniowy boule/batard)
    7. `COLD_RETARD` (chłodnia 4°C, 8–24h)
    8. `SCORING` (nacinanie żyletką)
    9. `BAKING_STEAM` (garnek żeliwny pod pokrywą 20 min w 250°C)
    10. `BAKING_VENT` (dopiekanie ze zdjętą pokrywą 25 min w 220°C)
    11. `COOLING` (studzenie na kratce z zakazem krojenia)
    12. `COMPLETED` (podsumowanie, sensory radar i zapis do historii)
  - **Deterministyczne Zdarzenia (Events):** `START_BAKE`, `FOLD_COMPLETED`, `PAUSE_TIMER`, `RESUME_TIMER`, `TRANSFER_TO_FRIDGE`, `OVEN_PREHEATED`, `LID_OFF`, `FINISH_BAKE`, `ABORT_BAKE`.
  - **Persystencja:** Aktualny stan, czas startu etapu oraz znacznik zakończenia (`endAtMs`) utrwalane w SQLite w tabeli `app_settings` pod kluczem `active_bake_state`.
- **Zalety:**
  - Odporność na uśpienie telefonu i restart aplikacji — po ponownym otwarciu stan i pozostały czas odtwarzane są w 1 milisekundę na podstawie `Date.now() - startedAt`.
  - Prosta synchronizacja z Live Activity, widżetami i zegarkiem Apple Watch.
  - Niemożliwość przejścia do nieprawidłowego stanu (np. pieczenie przed autolizą).
- **Wady:** Wymóg ścisłego definiowania przejść w kodzie domenowym.

### Opcja B: Prosty timer w `useState` bez maszyny stanów
- **Opis:** Zwykły licznik sekundowy w komponencie React.
- **Wady:** Przy uśpieniu telefonu pętla `setInterval` zostaje zamrożona przez system iOS, co prowadzi do przekwaszenia ciasta i całkowitego rozjechania harmonogramu.

---

## Decyzja i Uzasadnienie

Wybieramy **Opcję A (Deterministyczna maszyna stanów FSM z dyskretnymi przejściami)**.
Zagadnienie to jest sercem wartości produktu dla piekarza („ręce w mące”). Gwarantuje, że stoper i asystent stolnicy działają z rygorem laboratoryjnym.

---

## Konsekwencje

- **Pozytywne:**
  - Prawidłowe działanie alertów dźwiękowych i haptycznych po wybudzeniu aplikacji.
  - Czysty kod w `app/(tabs)/stolnica.tsx` oraz `src/components/stolnica/`.
- **Negatywne:**
  - Wszystkie akcje użytkownika muszą być mapowane na jawne komunikaty zdarzeniowe.

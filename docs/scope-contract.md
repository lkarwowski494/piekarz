# Kontrakt Zakresu Produktowego (Scope Contract v2.0)
## Aplikacja Piekarz (Crust) — Apps4Craft Studio
**Data zatwierdzenia:** 18.10.2026  
**Rola:** Head of Product, Principal Product Owner & Scope Gatekeeper  
**Status:** WIĄŻĄCY I ZATWIERDZONY (Single Source of Truth dla UX, Dev i QA)  
**Dokumenty nadrzędne:** `docs/brd/00_START.md`, `docs/monetyzacja-audyt.md`, `docs/design-spec.md`  

---

## 1. Cel i Granice Produktu (Product Boundaries)

Aplikacja **Piekarz (Crust)** jest suwerennym, laboratoryjnym asystentem kuchennym dla domowych i rzemieślniczych piekarzy chleba, bułek, chałek i pizzy.
Aplikacja rozwiązuje problem **„ręce w mące i lepkim cieście”**, eliminując błędy matematyki piekarskiej i chroniąc piekarza przed zrujnowanym snem (SleepGuard).

### Niezmienniki Produktowe Gatekeepera:
1. **100% Offline-First:** Wszystkie obliczenia, timery i dane receptur działają bez dostępu do sieci (`SQLite` w `/Library/SQLite`).
2. **Zero Telemetrii:** Żadnych zewnętrznych trackerów, banerów reklamowych ani kont chmurowych (*Data Not Collected*).
3. **Zasada Słoika (Anti-Bloat):** Żadnych encyklopedii biologicznych i wykładów w głównym interfejsie. Wiedza inżynieryjna zaszyta pod maską w silniku obliczeniowym TypeScript (`src/core/domain-rules.ts`).
4. **1-Tap Quick Start:** Pierwsza wartość dla nowicjusza w < 6 sekund. Zaawansowane parametry w zwijanym akordeonie Pro.

---

## 2. Spis Funkcji Zakwalifikowanych do MVP v1.0 (Wariant b+ Optymalne)

Wersja v1.0 obejmuje **124 wymagania biznesowe (118 MUST + 6 kluczowych funkcji rzemieślniczych)**:

| Obszar | ID Zakresu | Wymagania BR | Kluczowa Funkcjonalność MVP v1.0 |
|---|---|---|---|
| **Kalkulator Piekarski** | `Z-001`…`Z-011` | `BR-KALK-001..025` | • True Baker's % z pełnym bilansowaniem mąki i wody z zakwasu<br>• Skalowanie na masę i liczbę bochenków (1, 2, 3...)<br>• 4-składnikowy kalkulator DDT Calvela z tarciem misy i bilansowaniem lodu<br>• Blend mąk w zasypie i przelicznik drożdży świeżych/instant (3:1)<br>• Kalkulator zasolenia (1.8% – 2.2%) |
| **Harmonogram Wsteczny** | `Z-015`…`Z-021` | `BR-HARMO-001..020` | • Reverse Scheduling od zadanej godziny wyjęcia chleba z pieca<br>• Autoplanowanie nocy w lodówce (Cold Retardation)<br>• Detekcja kolizji nocnych (SleepGuard)<br>• Dynamiczna kompensacja temperatury otoczenia ($Q_{10} = 2.15$) |
| **Asystent Stolnicy** | `Z-024`…`Z-037` | `BR-ETAP-001..025` | • Prowadzenie etapów krok po kroku z pętlą składań ciasta<br>• Blokada wygaszania ekranu (Keep-Awake) i sygnały dźwiękowe PCM<br>• Kontroler pieczenia w garnku żeliwnym (Dutch Oven) z alarmem zdjęcia pokrywy |
| **Kultura Zakwasu** | `Z-038`…`Z-045` | `BR-ZAKW-001..018` | • Profil zakwasu z datą narodzin i typem mąki<br>• Rejestr dokarmień z proporcjami (1:1:1, 1:2:2, 1:5:5)<br>• Dynamiczny estymator szczytu witalności (Peak Predictor)<br>• Wykrywanie płynu głodowego (Hooch) i ostrzeżenia przed pleśnią |
| **Receptury i Dziennik** | `Z-046`…`Z-050` | `BR-RECP-001..020` | • 10 bazowych receptur mistrzowskich (MASTER)<br>• Tworzenie, edycja i klonowanie receptur autorskich<br>• Dziennik bochenków z 6-osiowym radarem sensorycznym |
| **Spiżarnia i Magazyn** | `Z-051`, `Z-077` | `BR-SPIZ-001..010` | • Magazyn mąki z autoodliczaniem zużycia po wypieku<br>• Generowanie paszportu bochenka PDF z kodem QR do importu |
| **Doktor Chleba** | `Z-099`…`Z-100` | `BR-DIAG-001..015` | • Interaktywny triage 15 wad bochenka<br>• 4 natychmiastowe protokoły ratunkowe (Emergency Codes) |
| **Baza Danych i Bezpieczeństwo**| `Z-073`…`Z-076` | `BR-DANE-001..015` | • SQLite WAL w `/Library/SQLite` ze standardem T-012<br>• Tabela `pending_ops` zostaje w schemacie bez zapisu i bez migracji (D-031)<br>• Autokopia zapasowa JSON przy każdym wypieku i darmowy eksport CSV |
| **Monetyzacja i Uprawnienia**| `Z-078`…`Z-080` | `BR-ZAK-001..010` | • Model "Cheaper than Espresso" (0.99 $/mc, 4.99 $/rok, 14.99 $ Lifetime)<br>• 7-dniowy / 3-bochenkowy trial (koniunkcja warunków)<br>• Gwarancja Read-Only Archive po wygaśnięciu (Zero Hostage Data) |

**Zmiana 2026-10-19 (ZM-01, D-031):** obszary „Apple Watch Standalone” (`Z-057`…`Z-062`, `BR-ZEG-001…004`) i „Live Activity & Lockscreen” (`Z-065`…`Z-067`, `BR-LIVE-001…002`) usunięte z MVP i z kodu; decyzje w sekcji 7 (F-01, F-02), moduły na liście odcięć w sekcji 3. Tryb kuchenny Keep-Awake (`Z-068`) zostaje w Stolnicy.

---

## 3. Oficjalna Lista Bezwzględnych Cięć (Feature Kill List)

Poniższe elementy zostały **bezwzględnie wycięte** z implementacji v1.0 i v1.1. Próba ich implementacji przez inżynierów lub projektantów będzie traktowana jako naruszenie kontraktu zakresu:

1. ✂️ **KL-01: Zaawansowana Księgowość Mikro-ERP (Koszt prądu, amortyzacja sprzętu):**  
   *Uzasadnienie:* Domowy piekarz nie szuka programu księgowego ani kalkulatora podatkowego. Wycinamy amortyzację misek, piekarnika i kalkulację kosztu watogodziny energii elektrycznej.
2. ✂️ **KL-02: Blokada Usuwania Rekordów po Wygaśnięciu Trialu:**  
   *Uzasadnienie:* Zidentyfikowany w kodzie defekt M5 (`index.tsx:271`, `zakwas.tsx:218`). Użytkownik w trybie `trial_expired` ma niezbywalne prawo usunąć swoje przepisy i zakwas za darmo (wymóg prawny RODO/GDPR i etyki Apps4Craft).
3. ✂️ **KL-03: Wykłady Biochemiczne i Encyklopedia w Głównym UI:**  
   *Uzasadnienie:* Naruszenie Zasady Słoika. Pełna biochemia enzymatyczna (amylaza, proteaza, fosforylacja) działa wyłącznie pod maską w silniku TypeScript, a interfejs prezentuje czyste wyniki liczbowe.
4. ✂️ **KL-04: AI Chatbot / Doradca Konwersacyjny w UI:**  
   *Uzasadnienie:* Kategoryczny zakaz estetyki AI (Anti-AI Slop Mandate). Użytkownik z lepkimi dłońmi potrzebuje dużego przycisku 64pt i głośnego alarmu, a nie czatu z halucynującym modelem językowym.
5. ✂️ **KL-05: Integracja z Wagami Kuchennymi Bluetooth BLE:**  
   *Uzasadnienie:* Zgodnie z wykluczeniem `OUT-06`. Notoryczne błędy parowania tanich wag niszczą oceny aplikacji w App Store. Ręczne wpisanie wagi zajmuje 2 sekundy.

### 3a. Odcięcia z 2026-10-19 (D-031, ZM-01): moduły usuwane z kodu

Wybór właściciela 2026-10-19 (plan napraw M1, DEC-03 = a): „Wyciąć z kontraktu MVP i z kodu; zapisać na liście odcięć z warunkiem powrotu”. Kod usuwa rola 08 pod zadaniem M1-audytor-generalny-031. Powrót każdej pozycji tylko przez bramkę zmian (sekcja 8, nowy wpis ZM). *Dlaczego:* kod bez wejścia z interfejsu udaje funkcję, której użytkownik nie ma (zasada wspólna 18).

| KL | Co wycinamy (kod) | Funkcja | Powód | Warunek powrotu |
|---|---|---|---|---|
| KL-06 | brak celu watchOS w repo | F-01 Apple Watch | brak dowodu B/R/W; linia bazowa: trzy najlepsze aplikacje niszy nie mają zegarka; wymaga macOS/Xcode | Powrót: dowód W/R, że powiadomienia (ADR-006) nie wystarczają, i test na zegarku |
| KL-07 | `src/lib/live-activity.ts` + test | F-02 Live Activity | buduje tylko dane, bez ActivityKit i mostu natywnego | Powrót: dowód od testerów po wydaniu powiadomień (ADR-006) i moduł natywny z testem na urządzeniu |
| KL-08 | `src/lib/siri-shortcuts.ts` + test | F-03 Skróty Siri | brak App Intents i tras `piekarz://stolnica/*`; BRD: etap 1.1 | Powrót: dowód W/R i App Intents z testem na urządzeniu |
| KL-09 | `src/lib/calendar-export.ts` + test | eksport planu do kalendarza (Z-022, SHOULD 1.1, bez BR) | brak BR i wejścia z interfejsu | Powrót: BR od roli 01 z dowodem potrzeby; wejście z Harmonogramu |
| KL-10 | `src/lib/piekarz-format.ts` + test | F-04 plik `.piekarz` | brak rejestracji typu pliku i wejścia; wymiana receptur zostaje przez QR i JSON (F-08) | Powrót: dowód, że QR i JSON nie wystarczają; typ pliku z testem otwarcia na urządzeniu |
| KL-11 | `src/core/bake-fsm.ts` + test | maszyna stanów „12 faz” (ADR-004) | Stolnica dostaje kroki z receptury i planu (F-07, D-030); FSM nieosiągalna z `app/` | Powrót: nie jako funkcja; użycie wewnątrz F-07 to decyzja techniczna ról 05 i 08 |
| KL-12 | `src/core/thermal-probe.ts` + test | sonda temperatury BLE (roadmapa v2.0, bez BR) | brak BR; wymagałaby uprawnienia Bluetooth; KL-05 wycina już BLE wag | Powrót: BR z dowodem potrzeby i decyzja o uprawnieniu Bluetooth |
| KL-13 | `src/core/baker-drill.ts` + test | F-05 Trener rachunku i fiszki | brak ekranu i dowodu, że nauka rachunku jest pracą J | Powrót: dowód W i kryterium pierwszego użycia od roli 04 |
| KL-14 | `src/data/outbox-service.ts`, `src/data/repositories/sqlite-repositories.ts` + testy | kolejka synchronizacji z zegarkiem | brak odbiorcy (F-01, F-06 wycięte); tabela `pending_ops` zostaje bez zapisu i bez migracji (decyzja 4 planu M2) | Powrót: razem z F-01 albo F-06 |
| KL-15 | `src/components/CostCalculatorModal.tsx`, `src/core/cost-calculator.ts` + testy | kalkulator kosztu bochenka i energii | już KL-01; moduł bez wejścia z interfejsu | Powrót: dowód W/R, że koszt bochenka jest pracą J użytkownika |
| KL-16 | katalog `garmin/` | F-06 Garmin Connect IQ | brak mostu w aplikacji; zależał od zegarka | Powrót: po powrocie F-01 i dowodzie R/W od użytkowników Garmina |
| KL-17 | `App.tsx` (37 KB) i `index.ts` | stary korzeń aplikacji | `package.json` uruchamia `expo-router/entry`; duplikat ekranów z `app/` | Powrót: nie wraca (kod techniczny bez funkcji) |

---

## 4. Synergie Portfolio (Portfolio Harvesting)

Aplikacja wykorzystuje sprawdzone klocki ekosystemu Apps4Craft:
- **`@apps4craft/ui`:** Wdrożenie wspólnych tokenów, szwajcarskiej typografii i komponentów `CraftHeader`.
- **Standard T-012 (Bezpieczny SQLite):** Odzyskanie z projektów *Piwowar* i *Słoik* standardu bezpiecznej bazy w `/Library/SQLite` oraz automatycznego backupu JSON. Tabela `pending_ops` zostaje w schemacie bez zapisu i bez migracji; kolejka nie ma odbiorcy (D-031, KL-14).
- **Wzorce Czystych Reguł:** Funkcyjna, bezstanowa architektura obliczeniowa tożsama ze standardem *Oczko* i *Napar*.
- **Ergonomia Dotykowa:** Odzyskane komponenty `NumInput`, `CloseButton` i `CorruptStateRecoveryBanner`.

---

## 5. Wytyczne i Zakazy dla Projektantów UX i Architektów Systemowych

### Czego NIE WOLNO projektować ani kodować w v1.0:
1. **ZAKAZ** wprowadzania ekranów logowania, rejestracji, formularzy e-mail czy tworzenia kont w chmurze (Zasada ZP-02).
2. **ZAKAZ** blokowania ekranu głównego paywallem przy pierwszym uruchomieniu aplikacji. Nowicjusz musi zobaczyć wynik w < 6 sekund.
3. **ZAKAZ** odcinania użytkownika od jego archiwalnych wypieków i notatek po wygaśnięciu trialu. Historia jest zawsze bezpłatna (Read-Only Archive).
4. **ZAKAZ** używania trybu audio w tle (`UIBackgroundModes: ["audio"]`), co gwarantuje odrzucenie przez recenzentów Apple z Guideline 2.5.4.
5. **ZAKAZ** projektowania celów dotykowych mniejszych niż 48x48pt na ekranach kuchennych (zalecane 56–64pt w strefie kciuka).

---

## 6. Harmonogram Wydań Produktu

```
┌────────────────────────────────────────────────────────────────────────┐
│                       ROADMAPA WYDAŃ PRODUKTOWYCH                      │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
     ┌───────────────────────────────┼──────────────────────────────┐
     ▼                               ▼                              ▼
【v1.0 MVP (App Store Launch)】  【v1.1 Retention】              【v2.0 Future & B2B】
• True Baker's % + DDT + Lód    • Ubytek piecowy Bake Loss     • Tryb bursztynowy OLED
• Harmonogram wsteczny + Sen    • Baza receptur Discard        • Wymiana z Mikro-Piekarnią B2B
• Stolnica + Alerty Dutch Oven
• Doktor Chleba (Triage)
• SQLite T-012 + Pass 0.99$/mc
```

Zmiana 2026-10-19 (ZM-01, D-031): Apple Watch, Live Activity / Dynamic Island, Garmin, eksport do EventKit, Siri Shortcuts, termometry BLE i format `.piekarz` zdjęte z roadmapy; są na liście odcięć (sekcja 3a) i wracają tylko przez nowy wpis ZM.

---

## 7. Funkcje F-nn (tabela częściowa, zadania napraw M2 029–031)

Tabela obejmuje tylko funkcje, których dotyczą decyzje właściciela z 2026-10-19 (DEC-03, DEC-04, DEC-05 planu napraw M1). Pełną przebudowę kontraktu na poprawionym BRD (każde BR z decyzją, każda funkcja F-nn) robi zadanie M1-audytor-generalny-032 (DEC-14 a); zachowuje ono numery F-01…F-08 (ID usuniętych nie wracają). *Dlaczego:* `zakres.mjs` sprawdza decyzje mechanicznie tylko w tabeli F-nn.

| ID | Funkcja | Decyzja | Wymagania | Dowód wartości | WTP | Intuicyjność | Podłoga | Zależy od | Uzasadnienie |
|---|---|---|---|---|---|---|---|---|---|
| F-01 | Aplikacja Apple Watch (Double Tap, Digital Crown, Smart Stack) | NIE | BR-ZEG-001, BR-ZEG-002, BR-ZEG-003, BR-ZEG-004 | — | — | — | — | — | D-031, ZM-01: brak dowodu B/R/W, brak celu watchOS w repo, wymaga macOS/Xcode. Powrót: dowód W/R, że powiadomienia (ADR-006) nie wystarczają, i test na zegarku; KL-06 |
| F-02 | Live Activity i Dynamic Island | NIE | BR-LIVE-001, BR-LIVE-002 | — | — | — | — | — | D-031, ZM-01: moduł buduje tylko dane, bez ActivityKit. Powrót: dowód od testerów po wydaniu powiadomień (ADR-006) i moduł natywny z testem na urządzeniu; KL-07 |
| F-03 | Skróty i komendy Siri | NIE | BR-SYS-002 | — | — | — | — | — | D-031, ZM-01: brak App Intents i tras. Powrót: dowód W/R i App Intents z testem na urządzeniu; KL-08 |
| F-04 | Plik receptury `.piekarz` otwierany z AirDrop / Plików | NIE | BR-WSP-001 | — | — | — | — | — | D-031, ZM-01: brak rejestracji typu pliku i wejścia; wymiana receptur przez QR i JSON (F-08). Powrót: dowód, że QR i JSON nie wystarczają; typ pliku z testem otwarcia; KL-10 |
| F-05 | Trener rachunku i fiszki | NIE | BR-TRE-001, BR-TRE-002 | — | — | — | — | — | D-031, ZM-01: moduł bez ekranu, brak dowodu, że nauka rachunku jest pracą J. Powrót: dowód W i kryterium pierwszego użycia od roli 04; KL-13 |
| F-06 | Integracja z zegarkami Garmin | NIE | BR-GAR-001 | — | — | — | — | — | D-031, ZM-01: brak mostu w aplikacji, zależała od zegarka. Powrót: po powrocie F-01 i dowodzie R/W od użytkowników Garmina; KL-16 |

## 8. Zmiany zakresu (ZM)

Każda zmiana zakresu po zatwierdzeniu przechodzi bramkę: praca i dowód, intuicyjność, koszt, podłogi i skutki. *Dlaczego:* bez bramki zakres rośnie albo kurczy się po cichu (moduł `zmiany-zakresu`).

| ID | Data | Prośba (kto, skąd) | Bramka: praca i dowód · intuicyjność · koszt · co wypada | Decyzja (ID, słowa właściciela) |
|---|---|---|---|---|
| ZM-01 | 2026-10-19 | wycięcie Apple Watch, Live Activity, Siri, kalendarza i modułów podłączonych tylko w testach (audyt M1: 03-zakres-004, 05-architekt-014, 08-programista-021, 01-odkrywanie-021) | brak dowodu B/R/W dla F-01…F-06; żaden moduł nie ma wejścia z `app/` · bez zmian w interfejsie · godziny właściciela: przegląd usunięcia, bez testów na urządzeniu · wypadają F-01…F-06 i KL-06…KL-17; dane: tabela `pending_ops` zostaje bez migracji | DEC-03 = (a), wybór właściciela 2026-10-19: „Wyciąć z kontraktu MVP i z kodu; zapisać na liście odcięć z warunkiem powrotu”; rejestr: D-031 w `docs/DECISIONS.md` |

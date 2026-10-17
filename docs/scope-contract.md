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
| **Apple Watch Standalone**| `Z-057`…`Z-060` | `BR-ZEG-001..015` | • Samodzielna aplikacja watchOS 11<br>• Odhaczanie składań gestem Double Tap bez dotykania ekranu<br>• Kontrola koronką Digital Crown i wyraziste wibracje Haptic |
| **Live Activity & Lockscreen**| `Z-065`…`Z-068` | `BR-LIVE-001..010` | • Pasek postępu na zablokowanym ekranie iPhone'a<br>• Odliczanie w Dynamic Island z przyciskami bezpośredniej akcji |
| **Spiżarnia i Magazyn** | `Z-051`, `Z-077` | `BR-SPIZ-001..010` | • Magazyn mąki z autoodliczaniem zużycia po wypieku<br>• Generowanie paszportu bochenka PDF z kodem QR do importu |
| **Doktor Chleba** | `Z-099`…`Z-100` | `BR-DIAG-001..015` | • Interaktywny triage 15 wad bochenka<br>• 4 natychmiastowe protokoły ratunkowe (Emergency Codes) |
| **Baza Danych i Bezpieczeństwo**| `Z-073`…`Z-076` | `BR-DANE-001..015` | • SQLite WAL w `/Library/SQLite` ze standardem T-012<br>• Tabela `pending_ops` dla asynchronicznej synchronizacji<br>• Autokopia zapasowa JSON przy każdym wypieku i darmowy eksport CSV |
| **Monetyzacja i Uprawnienia**| `Z-078`…`Z-080` | `BR-ZAK-001..010` | • Model "Cheaper than Espresso" (0.99 $/mc, 4.99 $/rok, 14.99 $ Lifetime)<br>• 7-dniowy / 3-bochenkowy trial (koniunkcja warunków)<br>• Gwarancja Read-Only Archive po wygaśnięciu (Zero Hostage Data) |

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

---

## 4. Synergie Portfolio (Portfolio Harvesting)

Aplikacja wykorzystuje sprawdzone klocki ekosystemu Apps4Craft:
- **`@apps4craft/ui`:** Wdrożenie wspólnych tokenów, szwajcarskiej typografii i komponentów `CraftHeader`.
- **Standard T-012 (Bezpieczny SQLite):** Odzyskanie z projektów *Piwowar* i *Słoik* standardu bezpiecznej bazy w `/Library/SQLite`, kolejki zdarzeń `pending_ops` oraz automatycznego backupu JSON.
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
【v1.0 MVP (App Store Launch)】  【v1.1 Retention & Hardware】    【v2.0 Future & B2B】
• True Baker's % + DDT + Lód    • Dedykowana aplikacja Garmin  • Tryb bursztynowy OLED
• Harmonogram wsteczny + Sen    • Eksport do EventKit          • Integracja z termometrami BLE
• Stolnica + Alerty Dutch Oven  • Ubytek piecowy Bake Loss     • Format otwarty .piekarz
• Standalone Apple Watch        • Baza receptur Discard        • Wymiana z Mikro-Piekarnią B2B
• Live Activity / Dynamic Island• Siri Shortcuts
• Doktor Chleba (Triage)
• SQLite T-012 + Pass 0.99$/mc
```

---

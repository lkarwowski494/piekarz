# Piekarz (Crust) — Wymagania Biznesowe (BRD v2.0-craft)
## Standard: Apps4Craft / Apps4Brew Studio 2026 (Retrofit Convergence)
**Data wydania:** 18.10.2026 | **Faza Sztafety:** Rola 1 (Lead BA & Product Discovery Architect)

---

## 1. Jak czytać ten dokument (Modularna Architektura BRD)

Zgodnie ze standardem Apps4Craft (znanym z projektów *Oczko*, *Słoik* i *Napar*), dokumentacja analityczna stanowi Single Source of Truth dla projektantów UX, audytorów monetyzacji, architektów systemowych oraz programistów.

```
docs/brd/
├── fixtures/
│   └── test-vectors.json       # Maszynowy korpus wektorów testowych dla PBT
├── 00_START.md                 # (Ten plik) Streszczenie, warianty MVP, blokery wydania
├── 00b_Decyzje.md              # Rejestr decyzji produktowych DEC-01…DEC-46
├── 00c_Errata.md               # Errata sprzeczności w literaturze i dowody naukowe
├── A1.md ... A4.md             # Wizja, Niezmienniki ZP-01..16, Rynek, Ceny, Zakres, KPI
├── B1.md ... B6.md             # Narzędzia kuchenne: Kalkulator, Harmonogram, Zakwas, Timery, Watch
├── C1.md ... C4b.md            # Nauka: Trener %, Atlas mąk, Doktor Chleba, Reguły RD-00..35
├── D1.md ... D4.md             # Architektura: NFR, SQLite DDL, Rejestr ryzyk RYZ-01..50, Testy
└── W.md                        # Niezależny raport weryfikacji ze źródłami Tier 1–3
```

---

## 2. Streszczenie Wykonawcze dla Właściciela Produktu

**Czym jest Piekarz (Crust):**
Kieszonkowy mistrz i laboratoryjny asystent kuchenny dla domowych i rzemieślniczych piekarzy chleba na zakwasie, pieczywa drożdżowego, chałek i pizzy. Eliminuje trzy koszmary każdego piekarza:
1. **Ręce w mące i lepkim cieście (Flour Hands Ergonomics):** Przenosi kontrolę etapów i timera na Apple Watch (koronka Digital Crown, gest Double Tap), widżety Live Activity na zablokowanym ekranie oraz gigantyczne tap-targety (64 pt) w strefie kciuka.
2. **Błędy matematyki piekarskiej i fałszywa hydratacja:** Wdraża rygorystyczny True Baker's % (RD-02) ze ścisłym bilansowaniem mąki i wody z zakwasu i prefermentów (Poolish, Biga, Tangzhong), 4-punktowe DDT Calvela z tarciem miksera i bilansowaniem kostek lodu w upały.
3. **Harmonogram rozpięty wstecz i ochrona snu:** Użytkownik wskazuje cel („chleb gotowy w niedzielę o 08:30”), a silnik automatycznie rozpina kalendarz od dokarmienia zakwasu w piątek po garowanie nocne w lodówce (Cold Retard), automatycznie omijając kolizje z oknem snu piekarza (22:00–08:00).

---

## 3. Status Sztafety Inżynierskiej (Apps4Craft Retrofit Playbook)

Aplikacja przeszła procedurę **Czystej Rekonstrukcji i Trójstronnej Zbieżności (Clean-Room Synthesis & Triangulation)**:
- **Krok 1 (Clean-Room Blueprint):** Zmapowano 100% uniwersum dziedzinowego bez ograniczeń historycznych (Raport: `ETAP_1_CZYSTA_SYNTEZA_WZORCOWA_PIEKARZ.md`).
- **Krok 2 (Triangulacja z kodem):** Zderzono wzorzec z rzeczywistym kodem `src/core/`, identyfikując 22 znaleziska (Raport: `ETAP_2_TRIANGULACJA_I_LUKI_PIEKARZ.md`). Włączono do specyfikacji unikalne autorskie perełki (8 Craft Gems, w tym algorytm lodu i autoResolveSleep).
- **Krok 3 (Forensic Impact Assessment):** Zabezpieczono Aksjomat Zerowej Utraty Danych (Zero Data Loss) dla migracji SQLite v1.0 -> v2.0 oraz brak breaking changes (Raport: `ETAP_3_FORENSIC_IMPACT_ASSESSMENT_PIEKARZ.md`).
- **Krok 4 (Plan Zbieżności i Handoff):** Wygenerowano maszynowy korpus `docs/brd/fixtures/test-vectors.json` oraz zaktualizowano moduły BRD.

---

## 4. Co Blokuje Wydanie (Release Blockers — Bramka Jakościowa)

Przed publikacją wersji v2.0 w App Store muszą zostać bezwzględnie spełnione poniższe warunki:
1. **Zero Data Loss:** Pomyślne przejście zautomatyzowanego testu asekuracyjnego migracji bazy SQLite na zrzucie rzeczywistej bazy v1.0.
2. **Kompilacja i Weryfikacja Testów:** 100% zielona nadrzędna bramka `npm run verify` (zero błędów TypeScript, 100% pass testów Jest).
3. **Apple Privacy Manifest:** Certyfikat `PrivacyInfo.xcprivacy` zadeklarowany jako *Data Not Collected*.
4. **Brak Trybu Audio w Tle:** Potwierdzenie braku `"UIBackgroundModes": ["audio"]` w `app.json` (wyeliminowanie ryzyka odrzucenia z Guideline 2.5.4).
5. **Dostępność i Ergonomia:** 100% etykiet VoiceOver na kluczowych ekranach asystenta i kontrast WCAG AAA.

---

## 5. Wariant MVP — Decyzja DEC-01 (Wariant b+ Optymalny)

| Wskaźnik | (b+) MVP Optymalne (Zatwierdzony Standard) |
|---|---|
| **Liczba Wymagań BR** | **124 BR** (118 MUST + 6 kluczowych funkcji rzemieślniczych) |
| **Główny Zakres** | Kalkulator % z bilansowaniem zakwasu i Tangzhong, 4-DDT z tarciem i lodem, adaptacyjny harmonogram wsteczny, asystent składań z Live Activity i watchOS, predyktor szczytu zakwasu, 4 protokoły ratunkowe „Doktora Chleba”, bezpieczna migracja SQLite, eksport JSON/CSV. |
| **Aplikacje Zegarkowe** | Dedykowana aplikacja **Apple Watch (watchOS 11)** w MVP; mostek i aplikacja **Garmin Connect IQ** w wersji 1.1. |
| **Ryzyko Apple 4.3(b)** | **Minimalne** (głęboki, zintegrowany silnik mikrobiologiczno-fizyczny i interakcja polowa). |
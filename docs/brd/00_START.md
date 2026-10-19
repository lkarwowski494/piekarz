# Piekarz (Crust) — Wymagania Biznesowe (BRD v2.0-craft)
## Standard: Apps4Craft / Apps4Brew Studio 2026 (Retrofit Convergence)
**Data wydania:** 18.10.2026 | **Faza Sztafety:** Rola 1 (Lead BA & Product Discovery Architect)

---

## 1. Jak czytać ten dokument (Modularna Architektura BRD)

Zgodnie ze standardem Apps4Craft (znanym z projektów *Oczko*, *Słoik* i *Napar*), dokumentacja analityczna stanowi Single Source of Truth dla projektantów UX, audytorów monetyzacji, architektów systemowych oraz programistów.

```
docs/brd/
├── archiwum/                   # BRD 0.1 z Dysku (26 plików Piekarz_BRD_0.1___*), nieaktualne
├── fixtures/
│   └── test-vectors.json       # Dawny korpus wektorów (kopia w tests/fixtures/ czytana przez testy, ER-16)
├── 00_START.md                 # (Ten plik) Stan, spis, streszczenie, warianty MVP, blokery wydania
├── 00b_Decyzje.md              # Decyzje BRD DEC-01…DEC-12 i DEC-41…DEC-49
├── 00c_Errata.md               # Errata ER-01…ER-33 ze statusem
├── A1.md ... A4.md             # Wizja, persony, zasady ZP-01…ZP-16, rynek, hipotezy H-01…H-02 (A2), zakres, KPI
├── A5.md                       # Prace J-01…J-06, przepływy PR-01…PR-10, macierz śladu
├── B1.md ... B6.md             # Wymagania BR narzędzi: KALK, HARMO, ETAP, ZAKW, RECP, SPIZ, CZAS, REKA, SYS, DANE, WSP, DRUK, ZAK, UST, PRYW, DOST
├── C1.md ... C4b.md            # Nauka (NAUK), Doktor Chleba (DIAG), aparat (APA), reguły RD-00…RD-13 z wektorami (C3)
├── D1.md ... D4.md             # NFR z miarą, progiem i metodą; ryzyka RYZ-01…RYZ-10; pytania OP-01…OP-28
├── S.md                        # Źródła S-01…S-13 (przeczytane, z cytatem i datą)
└── W.md                        # Bibliografia i hierarchia źródeł z BRD 2.0-craft (pozycje bez wpisu S; rejestr EV z odesłaniem do RD, rejestru roli 06 albo OP)
```

**Stan 2026-10-19 (rola 01, zadanie M1-audytor-generalny-033):** kanoniczny jest krótki zestaw plików z tego katalogu; druga kopia (eksport BRD 0.1 z Dysku) leży w `archiwum/` i nie jest wejściem dla żadnej roli (ER-17). Łańcuch śladu: persona → praca J → przepływ PR → wymaganie BR → reguła RD → wektor (A5, C3). Stan 2026-10-19 (zadanie M1-audytor-generalny-032): zdefiniowano 56 wymagań BR, z czego 11 wycofanych decyzją D-031 (ER-07), czyli 45 aktywnych; nowe BR-DIAG-001, BR-NAUK-001, BR-KALK-007 i BR-DRUK-001 z wyboru właściciela D-034 (ER-26…ER-29). Liczby według obszarów: B6. Decyzję zakresu dla każdego BR ma kontrakt zakresu (`docs/scope-contract.md`), nie BRD (ER-18). Sprzeczności i prośby o zmianę: 00c (ER), pytania otwarte: D4 (OP). Kontrola mechaniczna: skrypt kontroli BRD roli 01 (wynik w raporcie roli 01 z 2026-10-19); wektory do testów: `tests/wektory/brd.json`.

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
5. **Dostępność i Ergonomia:** 100% etykiet VoiceOver na kluczowych ekranach asystenta i kontrast WCAG AA (NFR-DOST-003; BRD 2.0-craft podawał tu AAA, niezgodnie z D1 i CLAUDE.md projektu — ER-18).

---

## 5. Wariant MVP — Decyzja DEC-01 (Wariant b+ Optymalny)

| Wskaźnik | (b+) MVP Optymalne (Zatwierdzony Standard) |
|---|---|
| **Liczba Wymagań BR** | 56 BR w BRD, z czego 11 wycofanych (stan 2026-10-19, B6); dawne „124 BR” z BRD 0.1 nie odpowiadało treści (ER-18). Zakres MVP: kontrakt zakresu (D-032, D-034) |
| **Główny Zakres** | Kalkulator % z bilansowaniem zakwasu i Tangzhong, 4-DDT z tarciem i lodem, adaptacyjny harmonogram wsteczny, asystent składań z Live Activity i watchOS, predyktor szczytu zakwasu, 4 protokoły ratunkowe „Doktora Chleba”, bezpieczna migracja SQLite, eksport JSON/CSV. |
| **Aplikacje Zegarkowe** | Dedykowana aplikacja **Apple Watch (watchOS 11)** w MVP; mostek i aplikacja **Garmin Connect IQ** w wersji 1.1. |
| **Ryzyko Apple 4.3(b)** | **Minimalne** (głęboki, zintegrowany silnik mikrobiologiczno-fizyczny i interakcja polowa). |

Zmiana 2026-10-19: Apple Watch, Live Activity i Garmin wycięte z MVP decyzją D-031 (`docs/DECISIONS.md`, ER-07); zakres MVP i liczba BR czekają na decyzję DEC-01 planu napraw M1 i przebudowę kontraktu zakresu (rola 03, zadanie 032). Ta sekcja nie rozstrzyga zakresu.
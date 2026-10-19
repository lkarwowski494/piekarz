# Rejestr decyzji — Piekarz (od D-035)

Ciąg dalszy rejestru `docs/DECISIONS.md` (DEC-001…DEC-004, D-029…D-034), który zostaje bez zmian jako archiwum wpisów do D-034. Nowe wpisy od D-035 trafiają tutaj, jedna numeracja dla obu plików. Rodzaj wpisu: produktowa (słowa właściciela dosłownie) albo merytoryczna (źródło S i szczebel). *Dlaczego osobny plik:* polecenia sztafety 01–04 (2026-10-19) wskazują `docs/decyzje.md` jako rejestr; połączenie obu plików w jeden czeka na słowo właściciela.

---

### [D-035] 2026-10-19 — Hierarchia źródeł dla BRD (sztafeta, rola 01 build)
- **Rodzaj:** merytoryczna (właściciel może zawetować, ale jej nie ustala; zasada wspólna 1).
- **Decyzja:** BRD budowany w sztafecie 01–04 stosuje hierarchię z `docs/tresci/hierarchia.md` (rola 06, 2026-10-19; podstawa DEC-07 w `docs/brd/00b_Decyzje.md`):
  1. przepisy i wytyczne urzędowe (USDA FSIS, FDA, eCFR, EFSA, GIS), rachunek fizyczny lub stechiometryczny, normy ICC/PN; dokumentacja producenta platformy (Apple, Expo, sqlite.org) i dane platformy (karty App Store: cena, oceny, zakupy w aplikacji);
  2. literatura recenzowana i monografie naukowe;
  3. serwisy instytucji (uczelniane extension, instytuty, organizacje branżowe), podręczniki mistrzowskie wskazane w DEC-07;
  4. autorytety rzemieślnicze i przewodniki z podanymi źródłami (tylko z atrybucją w treści);
  5. fora, blogi, Wikipedia, treść recenzji w sklepie — wskazówka, gdzie szukać, i materiał do zliczeń motywów; nigdy źródło faktu ani reguły.
- **Reguły krytyczne** (bezpieczeństwo żywności, oparzenia, zdrowie, mienie): tylko szczebel 1–3 i przegląd roli 06.
- **Odrzucone:** (a) domyślna hierarchia z `zrodla.md` bez uzupełnień — nie nazywa urzędów żywności ani danych platformy, których BRD potrzebuje; (b) hierarchia z `docs/brd/W.md` (BRD 2.0-craft) — przeczyła hierarchii roli 06 (reguła „dwóch źródeł” zamiast szczebla).
- **Dlaczego:** jedna hierarchia dla BRD (rola 01) i rejestru treści (rola 06) — inaczej ta sama reguła dostaje dwie podstawy.
- **Zależy od:** nic; zmiana tylko jawnym wpisem.
- **Uzupełnienie 2026-10-19 (E2 roli 01):** (1) dokumentacja producenta o jego własnym produkcie (drożdże, rękawice, naczynia) ma szczebel 1 tylko dla tego produktu; (2) kopia strony urzędu w archiwum (Wayback), gdy strona urzędu blokuje pobranie, ma szczebel oryginału, z datą kopii w polu „Miejsce”; (3) przepis albo wpis blogu instytucji (King Arthur Baking poza „Pro Reference”) ma szczebel 4 i w treści atrybucję. *Dlaczego:* bez tego te same źródła dostawałyby w BRD i w rejestrze roli 06 różne szczeble.

### [D-036] 2026-10-19 — Kontekst użycia bez rozmów z użytkownikami przed E3
- **Rodzaj:** produktowa. **Słowa właściciela:** „a” (STOP E0 roli 01 build, 2026-10-19).
- **Decyzja:** (a) bez rozmów z innymi piekarzami przed E3; kontekst użycia z wywiadu z właścicielem, recenzji i źródeł; czego nie potwierdzą, trafia do rejestru założeń (ZAL) jako hipoteza dla roli 03.
- **Odrzucone:** (b) 2–3 rozmowy przed E3 — dowód zamiast hipotezy, ale kilka dni oczekiwania.
- **Dlaczego:** kierunek ustalają już DEC-01…DEC-16 planu napraw M1; rozmowy można zrobić później jako sprawdzenie ZAL.
- **Zależy od:** nic. Skutek: wymagania oparte na kontekście użycia są warunkowe („zależy od: ZAL-nnn”).

### [D-037] 2026-10-19 — E2 roli 01 bez nowego skanu rynku i polityk App Store (wyjątek nazwany)
- **Rodzaj:** produktowa. **Słowa właściciela:** „Rynek i ceny konkurencji z odczytu z dzisiejszą datą. Polityki App Store. - Te dwa mozesz pominac. Mamy ustalone.” (STOP E1 roli 01 build, 2026-10-19).
- **Decyzja:** w E2 rola 01 nie robi nowego skanu konkurencji ani ponownego odczytu App Review Guidelines. Ceny i modele konkurencji BRD bierze z odczytów z 2026-10-19 roli 02 (`audit/02-oplacalnosc-2026-10-19/`, `audit/02-warianty-2026-10-19/`) i audytu M1 roli 01; ograniczenia OG z wytycznych już przytoczonych w rejestrze (D-033: 3.1.1, 3.1.2(a); audyt M1: 2.3, 5.1.1), z odesłaniem do miejsca odczytu.
- **Odrzucone:** pełny moduł `rynek-i-polityki` w E2 (odczyt listingów, zakupów w aplikacji i wytycznych w dniu pracy).
- **Wyjątek od standardu „przeczytanego źródła” (zasada wspólna 7):** cytaty wytycznych i ceny w BRD pochodzą z odczytu innej roli tego samego dnia; tańsza kontrola zamiast żadnej: każdy OG wskazuje plik odczytu i datę, a rola 10 sprawdza brzmienie wytycznych przed wysłaniem do sklepu.
- **Dlaczego:** właściciel uznał rynek i polityki za ustalone decyzjami DEC-01 d i D-033 tego dnia.
- **Zależy od:** aktualności odczytów z 2026-10-19 (ceny zmienne: przegląd 2027-01-19).

### [D-042] 2026-10-20 — Udany wypiek dla prośby o ocenę aplikacji: co najmniej 4★
- **Rodzaj:** produktowa. **Słowa właściciela:** „op49 zgodnie z rekomendacja” (2026-10-20, przyrost ER-44 roli 01).
- **Decyzja:** systemowa prośba o ocenę aplikacji (BR-OPIN-001) może pojawić się po wypieku ocenionym przez użytkownika na co najmniej 4★.
- **Odrzucone:** każdy zakończony wypiek bez progu; tylko 5★.
- **Dlaczego:** DEC-13 (a) planu napraw M1 mówi o „udanym bochenku”; system i tak pokazuje prośbę najwyżej trzy razy w roku (S-63), więc próg chroni przed prośbą po nieudanym wypieku.
- **Zależy od:** nic. Numer D-042, bo D-038…D-041 zajęły role 02 i 03 na swoich gałęziach.

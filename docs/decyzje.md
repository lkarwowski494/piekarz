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

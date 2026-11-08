# Stan M8 (formalności przed wydaniem 1.0) — Piekarz

Aktualizacja: 2026-11-08 · Gałąź: `formalnosci/piekarz-2026-11-08` (od `redesign/piekarz-2026-10-22` @ `fb8b66a`) · Decyzje: D-290, D-291 (wolne z puli: D-292…D-299).

## Wynik (STOP końcowy)
- P0 otwartych: brak. Audyt formularzy roli 10: bez P0/P1.
- Dokumenty zaakceptowane (D-291): `docs/prawne/` — polityka v2 PL/EN, zmiany strony wsparcia, szablony wsparcia, procedura bezpieczeństwa.
- Ekran „Licencje open source” (FOR-15) w kodzie: commity `2d31a78`, `cb4f4c3`, `91f5e72`, `8779cc6`; `check:licencje` w verify.
- Kroki właściciela: `docs/formalnosci/kroki-wlasciciela.md`.

## Dla koordynatora M3
1. Scal gałąź do `redesign/` przed E2E i buildem zgłoszeniowym (ekran licencji zmienia kod).
2. Znalezisko: `npm run verify` kod 1 już na `fb8b66a` (bez M8): basic-pro-pa, dzis-d4b, ekran-pro-pb, pro-po-arkuszu-w005, pro-wznowienie-w2; nie zależy od TZ; przyczyna niezbadana. Na 2026-11-04 te zestawy przechodziły.
3. Publikacja polityki v2 i strony wsparcia w apps4brew-www (`piekarz/privacy.html`, `piekarz/support.html`, adresy bez zmian) — **zgoda właściciela 2026-11-08: „Tak, przez koordynatora (Recommended)”**; treść: `docs/prawne/`.
4. Biblioteki natywne ekranu licencji: uzupełnić z `Podfile.lock` po prebuild w CI; przekłady 6 kluczy (09), wygląd (04).

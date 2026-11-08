# Strona wsparcia apps4brew.com/piekarz/support.html — zmiany (projekt)

Źródło: repo apps4brew-www, `piekarz/support.html` (odczyt live 2026-11-08, kopia poza repo). Wzór: strona wsparcia Trening (D-290).

| Miejsce | Jest | Ma być | Powód |
|---|---|---|---|
| PL „Co dołączyć” | „Wersję aplikacji i model telefonu aplikacja wpisuje sama.” | „Wersję aplikacji i iOS aplikacja wpisuje sama.” | kod: `src/lib/zgloszenie.ts:16` (bez modelu, D-066) |
| EN „What to include” | „The app adds its version and your phone model for you.” | „The app adds its version and the iOS version for you.” | jw. |
| PL akapit AI | „AI pomaga nam porządkować opinie. Jak przetwarzamy…” | „Jak przetwarzamy wiadomości, które do nas wysyłasz, opisuje polityka prywatności (sekcja „Gdy do nas piszesz”).” | D-290 pkt 5: bez AI |
| EN akapit AI | „AI helps us sort feedback. How we handle…” | „How we handle the messages you send us is described in the privacy policy (section “When you write to us”).” | jw. |
| Telefon i adres | brak | bez zmian (brak) | D-290 pkt 1: dane przedsiębiorcy pokazuje App Store w UE; wzór Trening |

Szablon odpowiedzi wsparcia: `docs/prawne/wsparcie.md`.

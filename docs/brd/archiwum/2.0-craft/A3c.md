# Piekarz BRD 0.1 — Część A3c: Zakres wykluczony, podsumowanie nakładu (rozdz. 6.3–6.x)

**Autor:** analityk biznesowy studia Apps4Brew, 15.10.2026.

---

## 6.3 Funkcje wykluczone (Nigdy / Out of Scope)

Ścisłe określenie granic produktu gwarantuje zachowanie czystości architektonicznej i etyki studia Apps4Brew.

| # | Funkcja wykluczona | Powód wykluczenia |
| :---- | :---- | :---- |
| **OUT-01** | **Chmurowe konta użytkowników i logowanie** | Naruszenie reguły ZP-02 (bez konta). Zwiększa koszty utrzymania, tworzy ryzyko wycieku danych RODO/GDPR i zniechęca amatorów pieczenia. |
| **OUT-02** | **Generowanie przepisów przez chmurowe modele AI** | Naruszenie ZP-03 i ZP-05. Chmurowe LLM halucynują proporcje hydratacji i czasy fermentacji, prowadząc do zepsucia chleba. Koszt API burzy model 0,99 €. |
| **OUT-03** | **Reklamy, banery i płatne partnerstwa** | Naruszenie ZP-04. Aplikacja ma charakter narzędzia warsztatowego, w którym reklamy niszczą skupienie i ergonomię pracy. |
| **OUT-04** | **Społecznościowy feed i publiczne lajkowanie wypieków** | Piekarz to profesjonalny asystent stolnicy, a nie kolejna platforma społecznościowa konkurująca z Instagramem czy Redditem. |
| **OUT-05** | **Wbudowany sklep e-commerce z mąkami i garnkami** | Ryzyko logistyczne, prawne i transakcyjne; zaburza zaufanie użytkowników do bezstronności porad technologicznych. |
| **OUT-06** | **Wagi kuchenne Bluetooth wymagające dedykowanego protokołu** | Fragmentacja rynku tanich chińskich wag BLE, ciągłe problemy z parowaniem w kuchni; wydatek czasu programistycznego nieuzasadniony. |
| **OUT-07** | **Medyczne i dietetyczne oświadczenia zdrowotne** | Zgodność z wytyczną Apple 1.4.1. Zakaz obiecywania leczenia celiakii zakwasem. |

---

## 6.4 Zestawienie nakładu pracy (wariant b+ Rekomendowany)

Szacunki podano w dniach pracy zwinnego zespołu agentowego przy założeniu równoległości zadań:

| Blok funkcjonalny | Dni pracy | Zakres prac |
| :---- | :---- | :---- |
| **Silnik matematyczny i reguły (KALK, DDT, RD)** | 4–6 | Pełna implementacja True Baker's %, formuły DDT z tarciem, testy jednostkowe z wektorami |
| **Harmonogram wsteczny i zarządca etapów (HARMO, ETAP)** | 5–7 | Odwrócony silnik czasu, obsługa składania, kompensacja temperaturowa $Q_{10}$ |
| **Baza danych, receptury i zakwas (DANE, RECP, ZAKW)** | 4–6 | Model SQLite/SwiftData, migracje, logika profili zakwasu i powiadomień |
| **Aplikacja Apple Watch i Live Activity (ZEG, LIVE)** | 5–8 | watchOS 11, obsługa Double Tap, cyfrowa koronka, widgety Smart Stack, Dynamic Island |
| **Moduł edukacyjny i „Doktor Chleba” (SCI, BIB, DIAG)** | 4–6 | Trener procentów, drzewo diagnostyki błędów bochenka, ilustracje wektorowe technik |
| **Dostępność, zakupy IAP i polerowanie UI (DOST, ZAK, SYS)** | 3–5 | StoreKit 2, VoiceOver, audyt kontrastu, obsługa Action Button, lokalizacja PL/EN |
| **RAZEM** | **25–38 dni** | **Czas kalendarzowy: 3–4 tygodnie do pierwszej wersji TestFlight** |


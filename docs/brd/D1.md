# **Piekarz BRD 0.1 — Część D1: Wymagania niefunkcjonalne (1) (rozdz. 9\)**

Specyfikacja wymagań niefunkcjonalnych dla obszarów: praca w trybie offline (OFF), internacjonalizacja (I18N), dostępność (DOST), estetyka i czytelność kuchenna (WYG) oraz wydajność (WYD).

---

## **9.1 Obszar NFR-OFF: Całkowita niezależność od sieci (Offline-First)**

* **NFR-OFF-001 (100% funkcjonalności offline):** Wszystkie funkcje kalkulatora procentu piekarskiego, formuły DDT, harmonogramu wstecznego, asystenta etapów stolnicowych, timerów oraz bazy wiedzy „Doktora Chleba” działają bez aktywnego połączenia internetowego.  
* **NFR-OFF-002 (Brak blokady startu):** Brak połączenia z siecią podczas pierwszego uruchomienia aplikacji nie powoduje wyświetlenia żadnego modala błędu, ekranu oczekiwania ani blokady interfejsu.  
* **NFR-OFF-003 (Pojemność bazy lokalnej):** Wszystkie receptury bazowe oraz grafiki wektorowe technik są skompilowane bezpośrednio w pakiecie binarnym aplikacji (Asset Catalog / Bundle).

---

## **9.2 Obszar NFR-I18N: Lokalizacja i internacjonalizacja**

* **NFR-I18N-001 (35 języków w architekturze String Catalog):** Wszystkie ciągi tekstowe są zorganizowane w formacie `.xcstrings` ze wsparciem dla odmiany przez przypadki i reguł liczby mnogiej (pluralizacja w języku polskim: 1 bochenek, 2 bochenki, 5 bochenków).  
* **NFR-I18N-002 (Lokalne formatowanie liczb i separatorów):** Prawidłowa obsługa przecinka dziesiętnego w Europie (np. `12,5 g`) oraz kropki w USA (`12.5 g`).  
* **NFR-I18N-003 (Merytoryczna adaptacja terminologii):** Wersje językowe uwzględniają specyfikę regionalną (np. w Polsce „typ mąki 750 chlebowa”, we Francji „T65”, we Włoszech „Tipo 0”, w USA „Bread Flour”).

---

## **9.3 Obszar NFR-DOST: Dostępność i ergonomia (Accessibility)**

* **NFR-DOST-001 (Standard VoiceOver):** Każdy element sterujący interfejsu posiada logiczny `accessibilityLabel`, `accessibilityValue` oraz w razie potrzeby `accessibilityHint`. Wartości liczbowe odczytywane są z jednostkami (np. „Mąka pszenna, pięćset gramów”).  
* **NFR-DOST-002 (Dynamic Type):** Interfejs zachowuje pełną czytelność i układ jednokolumnowy przy największych rozmiarach czcionek systemowych (Accessibility Sizes) bez obcinania wartości wag i czasów.  
* **NFR-DOST-003 (Wysoki kontrast):** Minimalny współczynnik kontrastu tekstu do tła wynosi co najmniej 4,5:1 dla normalnego tekstu i 3:1 dla dużych cyfr timera (zgodnie z WCAG 2.1 AA).  
* **NFR-DOST-004 (Redukcja ruchu):** Respektowanie flagi systemowej `UIAccessibility.isReduceMotionEnabled` — zastąpienie animacji przesuwania prostym przenikaniem (Fade).

---

## **9.4 Obszar NFR-WYG: Czytelność stolnicowa i design**

* **NFR-WYG-001 (Czytelność z dystansu 1,5 metra):** Główny timer aktywnego etapu oraz nazwa bieżącego kroku mają wysokość co najmniej 48 pt i są czytelne dla osoby stojącej przy blacie, gdy telefon leży oparty o ścianę lub pojemnik z mąką.  
* **NFR-WYG-002 (Czysty, ciepły design rzemieślniczy):** Paleta barw oparta na naturalnych odcieniach lnu, mąki, przypieczonej skórki chleba i grafitu. Brak jaskrawych neonowych barw powodujących zmęczenie wzroku.

---

## **9.5 Obszar NFR-WYD: Wydajność i oszczędność zasobów**

* **NFR-WYD-001 (Błyskawiczny start aplikacji):** Czas od stuknięcia ikony do pełnej interaktywności kalkulatora wynosi poniżej 400 ms na urządzeniach iPhone 13 i nowszych (Cold Start).  
* **NFR-WYD-002 (Płynność 60/120 fps):** Przewijanie list receptur i animacje Live Activity działają ze stałą częstotliwością odświeżania ekranu (ProMotion).  
* **NFR-WYD-003 (Reaktywność kalkulatora):** Przeliczenie całej receptury wielomącznej po zmianie wagi lub hydratacji zajmuje mniej niż 16 ms (brak widocznego laga).  
* **NFR-WYD-004 (Odcisk pamięci RAM):** Zużycie pamięci operacyjnej podczas aktywnej sesji wypieku nie przekracza 45 MB.
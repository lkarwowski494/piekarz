# **Piekarz BRD 0.1 — Część B5: Narzędzia ZAK, UST, PRYW, DOST, odrzucone (rozdz. 7\)**

Specyfikacja wymagań dla modułu zakupowego, ustawień regionalnych, polityki prywatności, ułatwień dostępu oraz rejestr odrzuconych funkcji.

---

## **7.15 Obszar ZAK: Model monetyzacji i zakupy StoreKit 2**

### **BR-ZAK-001: Implementacja natywnego StoreKit 2**

* **Priorytet:** MUST · **Etap:** MVP  
* **Persona:** Wszyscy  
* **Opis:** Obsługa zakupów In-App Purchase przy użyciu nowoczesnego frameworku Apple StoreKit 2 z automatyczną weryfikacją kryptograficzną transakcji (JWS).  
* **Kryteria akceptacji:**  
  1. Trzy produkty w App Store Connect:  
     * `piekarz_sub_monthly` (0,99 € / 3,99 zł) z 14-dniowym darmowym okresem próbnym;  
     * `piekarz_sub_yearly` (4,99 € / 19,99 zł);  
     * `piekarz_iap_lifetime` (14,99 € / 59,99 zł, zakup jednorazowy).  
  2. Działanie przycisku „Przywróć zakupy” (Restore Purchases) w jednym kroku bez błędów.

### **BR-ZAK-002: Obsługa Family Sharing (Chmura Rodzinna)**

* **Priorytet:** MUST · **Etap:** MVP  
* **Persona:** P1, P2  
* **Opis:** Włączenie flagi Family Sharing dla wszystkich trzech produktów zakupowych w App Store Connect.  
* **Kryteria akceptacji:**  
  1. Członkowie grupy rodzinnej Apple użytkownika uzyskują dostęp do wersji Pro bez dodatkowych opłat.

### **BR-ZAK-003: Przejrzysty ekran paywalla bez ciemnych wzorców (No Dark Patterns)**

* **Priorytet:** MUST · **Etap:** MVP  
* **Persona:** Wszyscy  
* **Opis:** Ekran oferty prezentuje dokładne kwoty, długość trwania okresu próbnego, datę pierwszego obciążenia oraz duży, wyraźny przycisk zamknięcia (krzyżyk w rogu).  
* **Kryteria akceptacji:**  
  1. Brak ukrytych subskrypcji, brak manipulacji interfejsem (zgodnie z ZP-08 i wytyczną Apple 3.1.2).

---

## **7.16 Obszar UST: Ustawienia regionalne i jednostki miar**

### **BR-UST-001: Przełącznik jednostek wagowych i temperaturowych**

* **Priorytet:** MUST · **Etap:** MVP  
* **Persona:** Wszyscy  
* **Opis:** Obsługa jednostek metrycznych (gramy, stopnie Celsjusza) oraz imperialnych (uncje, funty, stopnie Fahrenheita).  
* **Kryteria akceptacji:**  
  1. Niezależny wybór jednostek: możliwość pieczenia w gramach przy piekarniku w °F (częsta praktyka w USA).  
  2. Bezbłędne przeliczanie matematyczne wg RD-01 bez zaokrągleń pośrednich.

### **BR-UST-002: Wybór motywu wizualnego (Jasny, Ciemny, Nocny bursztyn)**

* **Priorytet:** SHOULD · **Etap:** MVP (Jasny/Ciemny) / 1.1 (Bursztyn)  
* **Persona:** P1, P3  
* **Opis:** Wsparcie dla standardowych motywów systemowych oraz specjalistycznego motywu nocnego OLED.

---

## **7.17 Obszar PRYW: Prywatność i brak telemetrii zewnętrznej**

### **BR-PRYW-001: Czyste „Data Not Collected” w App Store**

* **Priorytet:** MUST · **Etap:** MVP  
* **Persona:** Wszyscy  
* **Opis:** Całkowity brak zewnętrznych bibliotek SDK śledzących użytkownika.  
* **Kryteria akceptacji:**  
  1. Weryfikacja statyczna kodu źródłowego: brak odwołań do IDFA (AdSupport) oraz unikalnych identyfikatorów urządzeń.  
  2. Przygotowanie pliku `PrivacyInfo.xcprivacy` z deklaracją zerowego zbierania danych.

---

## **7.18 Obszar DOST: Dostępność dla każdego (Accessibility)**

### **BR-DOST-001: Pełna nawigacja z czytnikiem VoiceOver**

* **Priorytet:** MUST · **Etap:** MVP  
* **Persona:** P5 (Marek)  
* **Opis:** Każdy element interfejsu (suwaki hydratacji, przyciski timerów, etapy składania) posiada merytoryczną etykietę dostępności, wartość i podpowiedź.  
* **Kryteria akceptacji:**  
  1. Test audytowy Accessibility Inspector bez ani jednego ostrzeżenia o brakującej etykiecie.  
  2. Dynamiczne odczytywanie upływającego czasu w ostatnich 10 sekundach odliczania.

### **BR-DOST-002: Wsparcie dla Dynamic Type do maksymalnych rozmiarów**

* **Priorytet:** MUST · **Etap:** MVP  
* **Persona:** P3 (Pan Janusz)  
* **Opis:** Wszystkie teksty skalują się automatycznie wraz ze zmianą wielkości czcionki w ustawieniach systemowych iOS.  
* **Kryteria akceptacji:**  
  1. Brak ucinania tekstu (brak „...”) w kluczowych wartościach liczbowych mąki i wody przy największym powiększeniu.

---

## **7.19 Rejestr funkcji odrzuconych w części B**

| Pomysł | Przyczyna odrzucenia |
| :---- | :---- |
| Zliczanie kalorii i makroskładników bochenka | Aplikacja rzemieślnicza skupia się na smaku i strukturze; kalorie wprowadzają zbędną presję dietetyczną sprzeczną z ZP-13. |
| Automatyczne publikowanie na Instagramie | Zbędny bloatware; narusza skupienie i prostotę narzędzia. |
| Zintegrowany sklep z mąkami i drożdżami | Narusza ZP-11 (bezstronność technologiczna). |


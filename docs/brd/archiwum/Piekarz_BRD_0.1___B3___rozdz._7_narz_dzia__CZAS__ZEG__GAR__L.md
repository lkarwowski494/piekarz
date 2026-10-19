# **Piekarz BRD 0.1 — Część B3: Narzędzia CZAS, ZEG, GAR, LIVE (rozdz. 7\)**

Wymagania dla timerów wielozadaniowych, dedykowanej aplikacji Apple Watch, integracji z zegarkami Garmin oraz Live Activity i Dynamic Island.

---

## **7.7 Obszar CZAS: Wielozadaniowe timery i alarmy piekarskie**

### **BR-CZAS-001: Współbieżne timery procesowe (Multi-Timer Engine)**

* **Priorytet:** MUST · **Etap:** MVP  
* **Persona:** P1, P2  
* **Opis:** Obsługa wielu niezależnych liczników czasu działających równolegle w tle (np. Timer 1: „Autoliza ciasta chlebowego”, Timer 2: „Rozgrzewanie garnka żeliwnego w piekarniku”, Timer 3: „Garowanie bułek śniadaniowych”).  
* **Kryteria akceptacji:**  
  1. Każdy timer posiada własną nazwę, czytelny pasek postępu, czas pozostały oraz dedykowany dźwięk.  
  2. Działanie timerów nie jest przerywane przez uśpienie aplikacji przez system operacyjny (użycie UNNotificationRequest z dokładnością do 1 sekundy).

### **BR-CZAS-002: Dedykowane sygnały dźwiękowe i powiadomienia krytyczne**

* **Priorytet:** MUST · **Etap:** MVP  
* **Persona:** P1, P2, P3  
* **Opis:** Zestaw głośnych, wyrazistych dźwięków piekarskich (dzwonek pieca szamotowego, uderzenie w garnek żeliwny, gong piekarski), słyszalnych z sąsiedniego pomieszczenia przy włączonym okapie kuchennym.  
* **Kryteria akceptacji:**  
  1. Wykorzystanie uprawnienia Time-Sensitive Notifications, umożliwiającego przebicie się przez systemowe tryby skupienia (Focus / Do Not Disturb).  
  2. Opcja automatycznego powtarzania alarmu co 60 sekund aż do manualnego odhaczenia przez piekarza.

---

## **7.8 Obszar ZEG: Dedykowana aplikacja na Apple Watch (watchOS 11\)**

### **BR-ZEG-001: Niezależna aplikacja watchOS z synchronizacją dwustronną**

* **Priorytet:** MUST · **Etap:** MVP  
* **Persona:** P1, P4  
* **Opis:** Dedykowany interfejs zegarkowy prezentujący aktualny krok wypieku, czas do kolejnej akcji oraz skrótowe instrukcje (np. „Składanie 3: Stretch & Fold”).  
* **Kryteria akceptacji:**  
  1. Dwukierunkowa, bezopóźnieniowa synchronizacja stanu z iPhone'em za pośrednictwem WatchConnectivity (Application Context oraz Interactive Messaging).  
  2. Aplikacja zegarkowa wyświetla stan nawet w przypadku chwilowej utraty łączności Bluetooth (buforowanie zdarzeń w lokalnym dzienniku zegarka).

### **BR-ZEG-002: Obsługa gestu podwójnego stuknięcia (Double Tap)**

* **Priorytet:** MUST · **Etap:** MVP  
* **Persona:** P1, P2  
* **Opis:** Wykorzystanie natywnego API gestu Double Tap w zegarkach Apple Watch Series 9 / Ultra 2 (oraz nowszych) do bezdotykowego zatwierdzania etapów.  
* **Kryteria akceptacji:**  
  1. Złożenie palca wskazującego z kciukiem na dłoni z zegarkiem natychmiast odhacza bieżące składanie ciasta i startuje kolejny timer.  
  2. Wyraźne potwierdzenie haptic feedback (wibracja Success) na nadgarstku.

### **BR-ZEG-003: Precyzyjna nawigacja koronką Digital Crown**

* **Priorytet:** MUST · **Etap:** MVP  
* **Persona:** P1, P3  
* **Opis:** Możliwość szybkiego wydłużenia lub skrócenia timera o wielokrotności 1 lub 5 minut za pomocą obrotu cyfrowej koronki bez dotykania szklanego ekranu.  
* **Kryteria akceptacji:**  
  1. Haptyczny przeskok koronki przy każdej zmianie wartości o 1 minutę.

### **BR-ZEG-004: Widżet tarczy Smart Stack na zegarku**

* **Priorytet:** SHOULD · **Etap:** MVP  
* **Persona:** P1  
* **Opis:** Widżet w stosie Smart Stack zegarka wyświetlający postęp aktywnego etapu i umożliwiający szybką akcję jednym stuknięciem.  
* **Kryteria akceptacji:**  
  1. Widżet pojawia się automatycznie na szczycie stosu Smart Stack w trakcie trwania aktywnego procesu stolnicowego.

---

## **7.9 Obszar GAR: Integracja z zegarkami sportowymi Garmin**

### **BR-GAR-001: Architektura mostka komunikacyjnego Garmin Connect IQ**

* **Priorytet:** SHOULD · **Etap:** MVP (Prototyp) / MUST · **Etap:** 1.1 (Wydanie)  
* **Persona:** P1  
* **Opis:** Moduł komunikacji z aplikacją kliencką napisaną w Monkey C dla zegarków sportowych Garmin (rodziny Fēnix, Forerunner, Epix, Venu).  
* **Kryteria akceptacji:**  
  1. Przesyłanie czasu do kolejnego złożenia przez Bluetooth Low Energy (Garmin Mobile SDK).  
  2. Obsługa fizycznych przycisków bocznych Garmina (klawisz START/STOP odhacza etap, BACK cofa).

---

## **7.10 Obszar LIVE: Live Activity i Dynamic Island na iPhonie**

### **BR-LIVE-001: Pełnowymiarowy widżet Live Activity na ekranie blokady**

* **Priorytet:** MUST · **Etap:** MVP  
* **Persona:** P1, P2, P3  
* **Opis:** Dynamiczny widżet na zablokowanym ekranie iPhone'a z wielkim, czytelnym z odległości 2 metrów paskiem postępu, nazwą kroku i przyciskami bezpośredniej interakcji.  
* **Kryteria akceptacji:**  
  1. Przyciski akcji: „Zrobione (Kolejny krok)” oraz „+10 min” działające bezpośrednio z poziomu zablokowanego ekranu.  
  2. Prezentacja aktualnej temperatury docelowej i numeru składania.

### **BR-LIVE-002: Dyskretna integracja z Dynamic Island**

* **Priorytet:** MUST · **Etap:** MVP  
* **Persona:** P1, P2  
* **Opis:** Zwinięty i rozwinięty stan Dynamic Island prezentujący odliczanie timera składania lub wypieku w trakcie korzystania z innych aplikacji na iPhonie.  
* **Kryteria akceptacji:**  
  1. Widok kompaktowy: ikona bochenka chleba \+ minuty do końca.  
  2. Długie przytrzymanie: szybki panel akcji (pauza, zakończenie, podgląd następnego kroku).
# **Piekarz BRD 0.1 — Część D3: Architektura, zegarki, model danych (rozdz. 9–12)**

Szczegółowa architektura integracji zegarkowych (watchOS / Garmin), modułu Live Activity, relacyjny model danych SQLite oraz polityka przenośności studia Apps4Brew.

---

## **10\. Architektura integracji zegarkowych i Live Activity**

### **10.1 Architektura watchOS (Apple Watch)**

\+-------------------------------------------------------------+

|                      iPhone (Aplikacja główna)              |

|   \+-------------------+      \+--------------------------+   |

|   | BakeSessionEngine | \---\> | WatchConnectivityManager |   |

|   \+-------------------+      \+--------------------------+   |

\+--------------------------------------------|----------------+

                                             | WCSession (BLE / Wi-Fi)

\+--------------------------------------------v----------------+

|                   Apple Watch (watchOS 11 Extension)        |

|   \+--------------------------+      \+-------------------+   |

|   | WatchConnectivityManager | \---\> | WatchSessionStore |   |

|   \+--------------------------+      \+-------------------+   |

|                 |                             |             |

|                 v                             v             |

|     \+------------------------+      \+-------------------+   |

|     | DoubleTapGestureEngine |      | DigitalCrownNav   |   |

|     \+------------------------+      \+-------------------+   |

|                 |                             |             |

|                 \+-------------\> \+ \<-----------+             |

|                                 |                           |

|                       \+------------------+                  |

|                       | WatchActionView  |                  |

|                       \+------------------+                  |

\+-------------------------------------------------------------+

* **Tryb pracy offline:** Zegarek przechowuje lokalny stan bieżącej sesji w `UserDefaults / WatchSessionStore`. W przypadku utraty zasięgu Bluetooth z telefonem zegarek nadal odlicza czas etapu i pozwala na odhaczenie złożenia. Zdarzenia są buforowane i przesyłane do iPhone'a natychmiast po ponownym połączeniu.  
* **Double Tap API:** Wykorzystanie `WKExtendedRuntimeSession` oraz systemowego przypisania domyślnej akcji Primary Action do przycisku potwierdzenia etapu.

---

### **10.2 Architektura Garmin Connect IQ**

* **Format transmisji:** JSON przesyłany przez Garmin Connect Mobile BLE SDK.  
* **Struktura wiadomości:**  
    
  {  
    
    "cmd": "STAGE\_STATUS",  
    
    "recipe": "Chleb Wiejski",  
    
    "stage": "Coil Fold 2/4",  
    
    "sec\_left": 1420,  
    
    "next": "Coil Fold 3/4"  
    
  }  
    
* **Obsługa klawiszy:** Klawisz `KEY_ENTER` (START/STOP) wysyła do telefonu komendę `{"cmd": "CONFIRM_STAGE"}`.

---

### **10.3 Architektura Live Activity i ActivityKit**

* **Encja atrybutów:** `BakingActivityAttributes: ActivityAttributes`.  
* **Stan dynamiczny (ContentState):**  
  * `currentStageName: String` (np. „Składanie 2 z 4: Coil Fold”)  
  * `targetDate: Date` (czas zakończenia bieżącego interwału)  
  * `progressFraction: Double` (od 0.0 do 1.0)  
  * `hydrationPercent: Double` (np. 75.0)  
* **Dynamic Island:**  
  * Widok kompaktowy wiodący: Ikona bochenka chleba.  
  * Widok kompaktowy kończący: Timer z odliczaniem wstecznym (`Text(targetDate, style: .timer)`).  
  * Widok rozwinięty: Pasek postępu, przycisk „Zrobione” (AppIntent: `CompleteCurrentStageIntent`), przycisk „+10 min”.

---

## **11\. Relacyjny model danych (SQLite / SwiftData Schema)**

\+--------------------------------------------------------------------------+

|                                 RECIPE                                   |

\+--------------------------------------------------------------------------+

| id: UUID (PK)                                                            |

| name: String                                                             |

| target\_dough\_weight: Double                                              |

| base\_flour\_weight: Double                                                |

| created\_at: Date                                                         |

| is\_built\_in: Boolean                                                     |

\+--------------------------------------------------------------------------+

       | 1                                               | 1

       | n                                               | n

\+----------------------+                         \+-------------------------+

|     RECIPE\_FLOUR     |                         |      RECIPE\_STAGE       |

\+----------------------+                         \+-------------------------+

| id: UUID (PK)        |                         | id: UUID (PK)           |

| recipe\_id: UUID (FK) |                         | recipe\_id: UUID (FK)    |

| flour\_name: String   |                         | stage\_order: Integer    |

| percentage: Double   |                         | stage\_name: String      |

| flour\_type: String   |                         | duration\_seconds: Int   |

\+----------------------+                         | is\_fold\_stage: Boolean  |

                                                 | fold\_interval\_sec: Int  |

                                                 \+-------------------------+

\+--------------------------------------------------------------------------+

|                            STARTER\_PROFILE                               |

\+--------------------------------------------------------------------------+

| id: UUID (PK)                                                            |

| name: String                                                             |

| flour\_type: String                                                       |

| hydration: Double (domyślnie 1.0 \= 100%)                                 |

| birth\_date: Date                                                         |

| storage\_state: String ("ROOM\_TEMP" / "FRIDGE")                           |

\+--------------------------------------------------------------------------+

       | 1

       | n

\+-----------------------------+

|        FEED\_RECORD          |

\+-----------------------------+

| id: UUID (PK)               |

| starter\_id: UUID (FK)       |

| feed\_date: Date             |

| starter\_grams: Double       |

| flour\_grams: Double         |

| water\_grams: Double         |

| peak\_hours\_observed: Double |

\+-----------------------------+

\+--------------------------------------------------------------------------+

|                                BAKE\_LOG                                  |

\+--------------------------------------------------------------------------+

| id: UUID (PK)                                                            |

| recipe\_id: UUID (FK)                                                     |

| started\_at: Date                                                         |

| finished\_at: Date                                                        |

| ambient\_temp: Double                                                     |

| target\_ddt: Double                                                       |

| rating\_stars: Integer (1-5)                                              |

| notes: String                                                            |

| image\_paths: \[String\]                                                    |

\+--------------------------------------------------------------------------+

---

## **12\. Polityka przenośności studia Apps4Brew (ZP-15)**

1. **Identyfikatory zakupów StoreKit:** Prefiks produktowy `piekarz_` (np. `piekarz_sub_monthly`, `piekarz_iap_lifetime`), niezależny od prywatnych kont programistów.  
2. **Kontenery systemowe:** Dedykowany identyfikator grupy aplikacji App Group `group.com.apps4brew.baker` do współdzielenia danych między aplikacją główną, widżetami i rozszerzeniem Live Activity.  
3. **Czystość kodu:** Brak zahardkodowanych ścieżek bezwzględnych, brak powiązań z personalnym profilem dewelopera. Gotowość do przeniesienia do publicznej lub prywatnej organizacji GitHub Apps4Brew w jednym kroku.
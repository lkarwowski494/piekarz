# **Piekarz BRD 0.1 — Część A3b: Tabela zakresu (2/2, pozycje Z-054…Z-120)**

Druga część tabeli zakresu: integracja systemowa, zegarki, bezdotykowa praca w kuchni, moduł nauki, diagnostyka oraz NFR.

| ID | Obszar | Funkcja / Wymaganie | Priorytet | Etap | Uzasadnienie etapu i powiązanie z ZP |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Z-054** | CZAS | Zegar kuchenny z wieloma timerami działającymi współbieżnie | MUST | MVP | Jednoczesne składanie ciasta i nagrzewanie pieca |
| **Z-055** | CZAS | Głośne, dedykowane alarmy piekarskie (dzwonek pieca, gong) | MUST | MVP | Słyszalność w głośnej kuchni przy okapie; DEC-19 |
| **Z-056** | CZAS | Powiadomienia Time-Sensitive przebijające tryby Focus | MUST | MVP | Zapobieganie przegapieniu momentu składania ciasta |
| **Z-057** | ZEG | Dedykowana aplikacja na Apple Watch (watchOS 11\) | MUST | wycofane (D-031, KL-06) | Kluczowy wyróżnik rynkowy; ZP-01 |
| **Z-058** | ZEG | Obsługa gestu podwójnego stuknięcia (Double Tap) w Apple Watch | MUST | wycofane (D-031, KL-06) | Odhaczanie złożenia ciasta bez dotykania zegarka |
| **Z-059** | ZEG | Sterowanie timerem i etapami za pomocą koronki Digital Crown | MUST | wycofane (D-031, KL-06) | Precyzja mokrymi dłońmi; ZP-01 |
| **Z-060** | ZEG | Wyraziste wibracje Haptic Feedback informujące o końcu składania | MUST | wycofane (D-031, KL-06) | Poczucie dotykowe podczas prac domowych |
| **Z-061** | ZEG | Widżet Smart Stack z bieżącym etapem i przyciskiem akcji | SHOULD | wycofane (D-031, KL-06) | Szybki wgląd bez wchodzenia do aplikacji |
| **Z-062** | ZEG | Samodzielna praca zegarka bez obecności iPhone'a w zasięgu | SHOULD | wycofane (D-031, KL-06) | Wyjście do ogrodu lub piwnicy w trakcie garowania |
| **Z-063** | GAR | Prototyp modułu komunikacyjnego dla Garmin Connect IQ | SHOULD | wycofane (D-031, KL-16) | DEC-02; przygotowanie architektury |
| **Z-064** | GAR | Pełna aplikacja Garmin Connect IQ z obsługą fizycznych przycisków | MUST | wycofane (D-031, KL-16) | DEC-02; kluczowy wyróżnik dla użytkowników Garmina |
| **Z-065** | LIVE | Live Activity na zablokowanym ekranie iPhone'a z wielkim paskiem postępu | MUST | wycofane (D-031, KL-07) | Czytelność z 2 metrów na blacie kuchennym |
| **Z-066** | LIVE | Integracja z Dynamic Island (odliczanie do kolejnego coil fold) | MUST | wycofane (D-031, KL-07) | Dyskretna kontrola podczas przeglądania telefonu |
| **Z-067** | LIVE | Przyciski bezpośredniej akcji na Live Activity (Złożone / \+10 min) | MUST | wycofane (D-031, KL-07) | Minimalizacja dotykania ekranu |
| **Z-068** | REKA | Tryb kuchenny: zapobieganie wygaszaniu ekranu podczas aktywnego etapu | MUST | MVP | Brak konieczności odblokowywania FaceID w mące |
| **Z-069** | REKA | Integracja z przyciskiem czynności (Action Button) w iPhone 15 Pro / 16 | SHOULD | MVP | DEC-23; sprzętowe odhaczanie złożenia |
| **Z-070** | REKA | Sterowanie komendami głosowymi Siri (Siri Shortcuts) | SHOULD | wycofane (D-031, KL-08) | Głosowe odhaczanie kroków z drugiego końca kuchni |
| **Z-071** | SYS | Widżety ekranu blokady i ekranu początkowego (stan zakwasu, odliczanie) | SHOULD | MVP | Szybki podgląd w systemie |
| **Z-072** | SYS | Kontrolki Control Center (iOS 18\) do szybkiego startu kalkulatora | SHOULD | MVP | DEC-06 |
| **Z-073** | DANE | Lokalna baza danych SQLite / SwiftData | MUST | MVP | ZP-03; 100% offline, zero awaryjności |
| **Z-074** | DANE | Automatyczna kopia zapasowa do prywatnego folderu iCloud Drive | MUST | MVP | ZP-06; bezpieczeństwo danych użytkownika |
| **Z-075** | DANE | Ręczny eksport i import bazy w formacie JSON | MUST | MVP | ZP-07; wolność od vendor lock-in |
| **Z-076** | DANE | Udostępnianie receptury w pliku `.piekarz` (AirDrop, e-mail) | MUST | wycofane (D-031, KL-10) | ZP-09; rzemieślnicza wymiana wiedzy |
| **Z-077** | DANE | Generowanie estetycznej karty graficznej receptury do wydruku / social media | SHOULD | 1.1 | Marketing organiczny; A4 |
| **Z-078** | ZAK | Obsługa zakupu In-App Purchase (miesięczny, roczny, dożywotni) | MUST | MVP | ZP-08; transparentny model biznesowy |
| **Z-079** | ZAK | 14-dniowy bezpłatny okres próbny (Free Trial) z pełnym zakresem | MUST | MVP | DEC-10; rzetelny test 2–3 cykli wypiekowych |
| **Z-080** | ZAK | Obsługa Family Sharing (Chmura rodzinna) | MUST | MVP | Wspólne gotowanie w rodzinie; ZP-08 |
| **Z-081** | DOST | Pełne wsparcie VoiceOver z precyzyjnymi etykietami dostępności | MUST | MVP | ZP-10; wymóg jakościowy Apps4Brew |
| **Z-082** | DOST | Skalowanie czcionek Dynamic Type do największych rozmiarów | MUST | MVP | Wsparcie dla persony seniora P3 (Pan Janusz) |
| **Z-083** | DOST | Tryb bursztynowy OLED o wysokim kontraście do nocnych wypieków | SHOULD | 1.1 | DEC-39; komfort pieczenia o świcie |
| **Z-084** | SCI | Ścieżka wtajemniczenia: 6 stopni wtajemniczenia piekarskiego | MUST | MVP | ZP-11; strukturalna edukacja |
| **Z-085** | SCI | Lekcja 1: Chleb nocny z garnka (drożdżowy, bez wyrabiania) | MUST | MVP | Natychmiastowy sukces początkującego |
| **Z-086** | SCI | Lekcja 2: Prosty bochenek pszenno-żytni na zakwasie | MUST | MVP | Wejście w świat dzikiej fermentacji |
| **Z-087** | SCI | Lekcja 3: Klasyczny chleb wiejski 75% hydratacji (Tartine style) | MUST | MVP | Budowa ucha i otwartego miękiszu |
| **Z-088** | SCI | Lekcja 4: Chleb 100% żytni razowy w keksówce | MUST | MVP | Nauka specyfiki kwasu żytniego i pentozanów |
| **Z-089** | SCI | Lekcja 5: Bagietka tradycyjna na zaczynie Poolish | SHOULD | 1.1 | Formowanie i nacinanie bagietek |
| **Z-090** | SCI | Lekcja 6: Pizza Napoletana (długa fermentacja w chłodzie) | SHOULD | 1.1 | Panowanie nad glutenem i wysokie temperatury |
| **Z-091** | BIB | Biblioteka technik: instrukcje z rysunkami krok po kroku | MUST | MVP | ZP-05; autorskie, rysowane schematy |
| **Z-092** | BIB | Technika: Autoliza vs Fermentoliza vs Zaparzanie mąki | MUST | MVP | Chemia i fizyka mąki |
| **Z-093** | BIB | Technika: Składanie rozciągane (Stretch & Fold) | MUST | MVP | Podstawowa metoda budowania struktury |
| **Z-094** | BIB | Technika: Składanie zwojowe (Coil Fold) dla ciast luźnych | MUST | MVP | Delikatne traktowanie pęcherzy powietrza |
| **Z-095** | BIB | Technika: Laminacja ciasta i wprowadzanie dodatków (nasiona) | MUST | MVP | Równomierny rozkład ziaren |
| **Z-096** | BIB | Technika: Formowanie wstępne i naciąg powierzchniowy (Tension) | MUST | MVP | Utrzymanie bochenka w pionie podczas pieczenia |
| **Z-097** | BIB | Technika: Nacinanie żyletką pod kątem 30° w celu uzyskania ucha | MUST | MVP | Wzorzec nacięcia podłużnego i krzyżowego |
| **Z-098** | BIB | Technika: Wytwarzanie pary w piekarniku bez garnka żeliwnego | SHOULD | 1.1 | Metody: kamienie lawowe, blacha z wodą, spryskiwacz |
| **Z-099** | DIAG | „Doktor Chleba”: interaktywne drzewo diagnostyki błędów bochenka | MUST | MVP | Tarcza 4.3(b); unikalna wartość edukacyjna |
| **Z-100** | DIAG | Diagnoza: Niedofermentowanie (wielkie dziury na górze, zbity dół) | MUST | MVP | Najczęstszy błąd początkujących |


# **Piekarz — Wymagania biznesowe (BRD), wersja robocza 0.1, 15.10.2026**

**Status:** wersja robocza do akceptacji właściciela. Sprawy produktowe czekają na Twoje decyzje (sekcja 4, DEC-01…DEC-40). Sprawy merytoryczne (technologia piekarska, biochemia fermentacji, reguły procentu piekarskiego i DDT) rozstrzyga badacz według hierarchii źródeł rzemiosła kuchennego. Każdą taką decyzję możesz zawetować. **Autor:** analityk biznesowy (koordynujący) studia Apps4Brew. Części A–D napisali analitycy i badacz. Dokumenty bazują na wnioskach z researchu portfela Apps4Brew (pozycje 91 „Piekarz” i 35 „Fermentacja i zakwas”) oraz architekturze klastra K1 „Ręce i rytuały”.

## **1\. Jak czytać ten dokument**

**Części dokumentu**

| Plik | Rozdziały | Zawartość |
| :---- | :---- | :---- |
| 00-streszczenie (ten plik) | — | streszczenie, warianty pierwszej wersji, jedna lista decyzji, warunki wstępne, sprzeczności, spis treści |
| 00b-decyzje | — | pełna lista 40 decyzji DEC-01…DEC-40 z podziałem na bloki czasowe i rekomendacjami |
| 00c-sprzecznosci | — | rejestr sprzeczności dziedzinowych, rozstrzygnięcia parametrów ciasta i weryfikacja |
| A | 1–6, 13, 15 | wizja i zasady produktu (ZP-01…16), problem i dowody, persony P1–P6 i sytuacje SYT-01…15, rynek, model przychodu, tabela zakresu Z-001…Z-240 z etapami, nakład etapów, KPI bez śledzenia, marketing |
| B | 7 (narzędzia) | 215 wymagań: kalkulator procentu piekarskiego (KALK), harmonogram wsteczny (HARMO), asystent etapów i składania (ETAP), profil i dokarmianie zakwasu (ZAKW), baza receptur (RECP), spiżarnia mąk (SPIZ), timery i zegarki (CZAS, ZEG, GAR), Live Activity, ręce w mące (REKA), system, dane, zakupy, dostępność |
| C | 7 (nauka), 8, 8.P | 78 wymagań nauki: trener procentu piekarskiego, ścieżka wypieków (SCI), biblioteka technik (BIB), diagnostyka miąższu i skórki (DIAG, APA). Reguły dziedzinowe RD-00…RD-35, wektory testowe, proces treści i bezpieczeństwo mikrobiologiczne |
| D | 9–12, 14, 16 | 110 wymagań niefunkcjonalnych (NFR), wzorce interakcji kuchennych, zgodność z Apple, model danych SQLite/CoreData, 50 ryzyk (RYZ-01…50), pytania otwarte i warunki wstępne |

**Oznaczenia identyfikatorów**

> * **BR-\[OBSZAR\]-nnn**: wymaganie funkcjonalne, np. BR-KALK-001, BR-HARMO-005, BR-ETAP-012, BR-ZAKW-003. Każde zawiera opis, powiązaną personę, mierzalne kryteria akceptacji, priorytet **MUST / SHOULD / COULD** oraz etap **MVP / 1.1 / 1.2 / 2.x / badanie / nigdy**.  
> * **NFR-\[KOD\]-nnn**: wymaganie niefunkcjonalne. Kody: OFF (offline), I18N (języki), DOST (dostępność/kuchnia), WYG (wygląd i czytelność w pyle mącznym), WYD (wydajność), DANE (lokalna baza SQLite), BEZP (bezpieczeństwo danych i higiena), INT (interakcja bezdotykowa), ZEG (zegarki watchOS/Garmin), TEST (testy automatyczne).  
> * **RD-nn**: reguła dziedzinowa (rachunek piekarski, DDT, hydratacja, krzywa fermentacji, współczynnik tarcia) z bezwzględnymi wektorami testowymi.  
> * **RYZ-nn**: ryzyko z prawdopodobieństwem, skutkiem i działaniem mitygującym.  
> * **DEC-nn**: decyzja produktowa lub architektoniczna dla właściciela.  
> * **Z-nnn**: wiersz tabeli zakresu (A rozdz. 6).

**Poziomy pewności**

> * **Reguły** (C, rozdz. 8): math (rachunek matematyczny/fizyczny, szczebel 1), standard (normy piekarskie ICC, PN/EN, podręczniki mistrzowskie np. Calvel, Hamelman, Forkish, szczebel 2–3), heurystyka (doświadczenie rzemieślnicze piekarzy domowych, szczebel 4), praktyka (fora, społeczności, szczebel 5).  
> * **Twierdzenia w tekście:** \[FAKT\] oznacza zweryfikowane źródło naukowe lub rynkowe; \[OCENA\] to wniosek, szacunek pracochłonności lub progi wydajności analityka; \[OTWARTE\] wymaga testu empirycznego na urządzeniu.

---

## **2\. Streszczenie dla właściciela**

**Co to jest.** Piekarz to kieszonkowy asystent i mistrz piekarski dla osób wypiekających chleb na zakwasie, pieczywo drożdżowe, pizzę i bułki rzemieślnicze. Rozwiązuje trzy kluczowe koszmary domowego piekarza:

1. **Brudne ręce w cieście i mące:** pozwala kontrolować etapy, odhaczać składania (stretch & fold) i pauzować timery za pomocą Apple Watch (koronka, gest podwójnego stuknięcia), zegarka Garmin, komend głosowych oraz wielkich pól dotykowych na ekranie blokady (Live Activity).  
2. **Matematyka piekarska bez pomyłek:** automatycznie przelicza proporcje według procentu piekarskiego (mąka \= 100%), precyzyjnie uwzględnia mąkę i wodę zawartą w zakwasie w hydratacji całkowitej, skaluje recepturę na zadaną wagę ciasta lub liczbę keksówek, oraz oblicza temperaturę wody (DDT), eliminując błędy prowadzące do zepsutego bochenka.  
3. **Harmonogram liczony wstecz:** użytkownik wskazuje cel: „chcę upiec ciepły chleb w niedzielę o 08:30”, a aplikacja precyzyjnie rozpina w czasie cały proces: od godziny dokarmienia zakwasu w piątek wieczorem, przez autolizę, fermentację burzliwą z interwałami składań, formowanie, nocne garowanie w lodówce (cold retard), aż po nagrzewanie garnka żeliwnego i sam wypiek.

Aplikacja integruje moduł **Zakwasu** (śledzenie dokarmiania, witalności, przypomnienia lodówkowe, wykrywanie szczytu aktywności), działa w 100% offline, bez logowania, bez konta i bez reklam, w 35 językach.

**Dla kogo (persony główne z A rozdz. 3):**

> * **Piotr (36 lat):** inżynier oprogramowania, domowy piekarz weekendowy. Piecze w żeliwnym garnku chleby 75–80% hydratacji. Ma Apple Watch, dba o precyzję DDT, wagę w gramach i powtarzalność miękiszu.  
> * **Kasia (29 lat):** mama dwójki dzieci, pracuje zdalnie. Chce piec prosty, zdrowy chleb pszenno-żytni. Często zapomina o składaniu ciasta w trakcie pracy przy biurku. Potrzebuje głośnych, bezbłędnych przypomnień i harmonogramu wstecznego.  
> * **Pan Janusz (67 lat):** emeryt, piecze tradycyjny chleb 100% żytni razowy na stuletnim kwasie. Potrzebuje wielkich liter, maksymalnego kontrastu, prostoty i wsparcia dla fermentacji kwasowej bez glutenu pszennego.  
> * **Ania (21 lat):** studentka, pasjonatka domowej pizzy neapolitańskiej. Liczy fermentację w lodówce na 48–72h, precyzyjne gramatury drożdży instant/świeżych (z dokładnością do 0,1 g) i hydratację ciasta na pizzę.  
> * **Marek (persona dostępności):** osoba słabowidząca, korzystająca z VoiceOver i dużego powiększenia Dynamic Type w kuchni.

**Czym wygrywa (przewagi konkurencyjne poparte dowodami):**

> 1. **Prawdziwa praca z „rękami w mące”:** Aplikacje konkurencji wymagają ciągłego dotykania i odblokowywania ekranu brudnymi, kleistymi dłońmi. Piekarz przenosi interakcję na Apple Watch (gesty, Action Button), Garmina oraz Live Activity.  
> 2. **Rachunek piekarski bez ułomności:** Większość kalkulatorów w App Store traktuje zakwas jako „dodatek”, nie wliczając wody i mąki z zakwasu do całkowitej hydratacji, co zafałszowuje konsystencję ciasta o nawet 5–8%. Piekarz stosuje ścisłą regułę bilansu masowego RD-02.  
> 3. **Połączenie harmonogramu z temperaturą (DDT):** Czas fermentacji bez kontroli temperatury to ruletka. Piekarz łączy kalkulator DDT z adaptacyjnym czasem fermentacji.  
> 4. **Edukacja i „Doktor Chleba”:** Żadna aplikacja nie oferuje diagnostyki bochenka metodą drzewa decyzyjnego („dlaczego chleb oklapł?”, „skąd wielkie dziury pod skórką a zbity spód?”).  
> 5. **Uczciwy model rzemieślniczy Apps4Brew:** 0,99 € / mies. lub 14,99 € jednorazowo (w Polsce 3,99 zł / 59,99 zł). Zero serwerów, zero subskrypcji wymuszanych, zero utraty danych.

**Model przychodu:**

> * Ceny: subskrypcja 0,99 € miesięcznie, 4,99 € rocznie, zakup dożywotni 14,99 € (w Polsce: 3,99 zł / 19,99 zł / 59,99 zł).  
> * Darmowy rdzeń: kalkulator procentu piekarskiego na 1 bochenek, podstawowy timer, 1 aktywny profil zakwasu.  
> * Wersja pełna (Premium): harmonogram wsteczny, nielimitowane receptury, integracja z Apple Watch i Garmin, zaawansowane DDT, asystent składań z Live Activity, „Doktor Chleba”.  
> * Koszt utrzymania: 0 zł kosztów stałych serwerowych (100% on-device).

**5 najważniejszych ryzyk (D rozdz. 14):**

> 1. **Wytyczna Apple 4.3(b) („prosty timer / kalkulator”):** Obrona poprzez głęboki silnik dziedzinowy (DDT, bilans hydratacji zakwasu, harmonogram wsteczny, moduł nauki i diagnostyki, integracja watchOS/Garmin).  
> 2. **Wytyczna Apple 4.3(a) (warianty aplikacji):** Połączenie Piekarza i Zakwasu w jeden spójny produkt pod jedną marką, eliminując duplikację.  
> 3. **Zepsucie bochenka przez błąd obliczeń:** Rygorystyczne wektory testowe (C rozdz. 8\) gwarantujące matematyczną niezawodność receptur.  
> 4. **Higiena i bezpieczeństwo żywności (botulizm / pleśń):** Jasne wytyczne detekcji zepsucia zakwasu (rozdział 8.P) bez stawiania diagnoz medycznych (wytyczna 1.4.1).  
> 5. **Interakcja zegarkowa w mące:** Zabezpieczenie przed przypadkowymi stuknięciami i blokadą ekranu w watchOS.

---

## **3\. Warianty pierwszej wersji — decyzja nr 1 (DEC-01)**

| Wskaźnik | (a) Pełne MVP z BRD | (b+) MVP optymalne (Rekomendacja) | (b) MVP surowe: tylko MUST | (c) (b+) z pełnym Garminem w MVP | (d) Sam kalkulator bez harmonogramu |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Liczba BR** | **158** (Narzędzia 132 \+ Nauka 26\) | **124** (118 MUST \+ 6 kluczowych) | **118** (Narzędzia 96 \+ Nauka 22\) | **136** (124 \+ 12 Garmin) | ok. 90 (wysokie ryzyko 4.3b) |
| **Zakres** | Kalkulator %, DDT, harmonogram wsteczny, asystent składań, zakwas z powiadomieniami, Apple Watch z gestem i Live Activity, 15 kart technik, diagnostyka bochenka, eksport JSON | Jak (b), plus obsługa koronki zegarka, widżet Smart Stack, kontrolka Action Button, 14 dni próby i Family Sharing | Rdzeń obliczeń %, prosty harmonogram, podstawowy zakwas, powiadomienia lokalne, prosty ekran Apple Watch. Bez zaawansowanych widżetów | Jak (b+), z dedykowaną aplikacją Connect IQ na zegarki Garmin | Wycięty harmonogram i nauka – sam kalkulator i timer |
| **Ryzyko 4.3(b)** | Minimalne | Minimalne | Niskie | Minimalne | **Krytyczne** (odrzucenie przez Apple) |
| **Pracochłonność** | **30–48 dni** pracy agenta | **25–40 dni** pracy agenta | 24–38 dni | **40–62 dni** (+ tydzień review Garmin) | 16–25 dni |
| **Czas kalendarzowy** | **3–5 tygodni** | **3–4 tygodnie** | 3–4 tygodnie | 6–8 tygodni | 2 tygodnie |

**Rekomendacja:** Wariant **(b+)** z wdrożeniem aplikacji na Apple Watch od wersji 1.0 oraz prototypem modułu Garmina (pełna aplikacja Garmin Connect IQ w wersji 1.1).

---

## **4\. Struktura i spis treści BRD**

* **Część 00:** Streszczenie, rejestr decyzji (DEC-01…40), sprzeczności i weryfikacja.  
* **Część A:** Wizja, zasady produktu (ZP-01…16), persony, rynek, model cenowy, tabela zakresu Z-001…Z-240, KPI, marketing.  
* **Część B:** Wymagania narzędziowe:  
  * B1: Kalkulator procentu piekarskiego (KALK), hydratacja, DDT, harmonogram wsteczny (HARMO).  
  * B2: Asystent etapów i składania (ETAP), profil zakwasu (ZAKW), baza receptur (RECP), spiżarnia mąk (SPIZ).  
  * B3: Zegar i wielotimery (CZAS), watchOS (ZEG), Garmin (GAR), Live Activity / Dynamic Island (LIVE).  
  * B4: Interakcja bezdotykowa w mące (REKA), integracja systemowa (SYS), model danych i kopia (DANE), eksport (WSP).  
  * B5: Model zakupowy (ZAK), ustawienia (UST), prywatność (PRYW), dostępność (DOST).  
  * B6: Pokrycie pomysłów portfela Apps4Brew, metryki wymagań.  
* **Część C:** Moduł nauki i technologia piekarska:  
  * C1: Trener intuicji piekarskiej, fiszki wiedzy, anatomia ziarna i fermentacji.  
  * C2a: Ścieżka wtajemniczenia (SCI: od chleba drożdżowego do kwasu żytniego i bagietki).  
  * C2b: Biblioteka technik (BIB: autoliza, stretch & fold, coil fold, laminacja, formowanie, nacinanie).  
  * C2c: Doktor chleba (DIAG: diagnostyka miękiszu i skórki), aparat (APA).  
  * C3: Reguły dziedzinowe RD-00…RD-35 (matematyka, bilans mas, termika DDT, straty pieczeniowe).  
  * C4a: Wektory testowe i blokery jakościowe.  
  * C4b: Proces weryfikacji treści kulinarnych i bezpieczeństwo biologiczne.  
* **Część D:** Architektura i jakość:  
  * D1: Wymagania niefunkcjonalne NFR (część 1: offline, lokalizacja, dostępność, ergonomia kuchenna).  
  * D2: Wymagania niefunkcjonalne NFR (część 2: bezpieczeństwo, dane lokalne, testy, wytyczne App Store).  
  * D3: Architektura techniczna zegarków, Live Activity, schemat bazy SQLite, polityka przenośności.  
  * D4: Rejestr 50 ryzyk (RYZ-01…50), pytania otwarte i warunki brzegowe.
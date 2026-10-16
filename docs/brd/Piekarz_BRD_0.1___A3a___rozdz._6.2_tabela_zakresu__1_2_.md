# **Piekarz BRD 0.1 — Część A3a: Tabela zakresu (1/2, pozycje Z-001…Z-100)**

Tabela definiuje precyzyjny podział funkcji na etapy wdrożeniowe: **MVP (wersja 1.0)**, **1.1**, **1.2**, **2.x**, **badanie** oraz **nigdy (wykluczone)**.

| ID | Obszar | Funkcja / Wymaganie | Priorytet | Etap | Uzasadnienie etapu i powiązanie z ZP |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Z-001** | KALK | Kalkulator procentu piekarskiego (baza: mąka \= 100%) | MUST | MVP | Fundament aplikacji; ZP-05 |
| **Z-002** | KALK | Rygorystyczny bilans masowy (wliczanie mąki i wody z zakwasu do hydratacji całkowitej) | MUST | MVP | Eliminacja błędu zafałszowania gęstości ciasta; ZP-05 |
| **Z-003** | KALK | Skalowanie receptury na zadaną masę całkowitą ciasta | MUST | MVP | Podstawowa potrzeba dopasowania do foremek; SYT-06 |
| **Z-004** | KALK | Skalowanie na liczbę bochenków / kęsów pizzy | MUST | MVP | Standard pracy w kuchni domowej; P1, P4 |
| **Z-005** | KALK | Kalkulator docelowej temperatury ciasta (DDT) – wzór 4-składnikowy | MUST | MVP | Tarcza przed wytyczną 4.3(b); ZP-11 |
| **Z-006** | KALK | Tabela współczynników tarcia miksera / wyrabiania ręcznego | MUST | MVP | Dokładność obliczeń temperatury wody; RD-06 |
| **Z-007** | KALK | Ostrzeżenie o zbyt gorącej wodzie (\>45°C – ryzyko śmierci drożdży) | MUST | MVP | Bezpieczeństwo biologiczne ciasta; ZP-11 |
| **Z-008** | KALK | Podpowiedź dodania lodu przy wyliczeniu temperatury wody \<4°C | SHOULD | MVP | Praktyka piekarska w upalne dni; SYT-04 |
| **Z-009** | KALK | Obsługa wielu rodzajów mąki w zasypie (blend mąk z osobnymi % i wagami) | MUST | MVP | Chleby wielomączne, pszenno-żytnie |
| **Z-010** | KALK | Automatyczne przeliczanie drożdży świeżych na drożdże instant (współczynnik 3:1) | MUST | MVP | Wygoda amatorów pieczenia pizzy i chałek; RD-04 |
| **Z-011** | KALK | Kalkulator zasolenia z zakresem optymalnym (1,8% – 2,2%) | MUST | MVP | Kontrola smaku i pracy glutenu; RD-03 |
| **Z-012** | KALK | Obliczanie spodziewanej straty pieczeniowej (Bake Loss 12–18%) | SHOULD | 1.1 | Szacowanie wagi upieczonego chleba po ostygnięciu |
| **Z-013** | KALK | Przelicznik objętościowy na wagowy (łyżki/szklanki na gramy) z ostrzeżeniem | COULD | 1.2 | Wsparcie dla początkujących z ostrzeżeniem o niedokładności |
| **Z-014** | KALK | Rejestr gęstości ciasta z sugerowanym typem naczynia (garnek vs keksówka) | SHOULD | 1.1 | Prowadzenie użytkownika przy luźnych ciastach |
| **Z-015** | HARMO | Harmonogram wsteczny (Reverse Scheduling) od godziny wyjęcia z pieca | MUST | MVP | Kluczowy wyróżnik rynkowy; ZP-01 |
| **Z-016** | HARMO | Harmonogram tradycyjny (w przód od momentu dokarmienia zakwasu) | MUST | MVP | Standardowy tryb pracy spontanicznej |
| **Z-017** | HARMO | Automatyczne rozplanowanie nocy w lodówce (Cold Retardation 8–24h) | MUST | MVP | Standard rzemieślniczego wypieku chleba |
| **Z-018** | HARMO | Wykrywanie kolizji z godzinami snu użytkownika (ostrzeżenie: „formowanie o 03:30 w nocy”) | MUST | MVP | Zapobieganie rujnowaniu nocy piekarzowi |
| **Z-019** | HARMO | Inteligentne przesuwanie etapów (Smart Shift): wydłużenie autolizy lub garowania chłodniczego | SHOULD | MVP | Elastyczność planu dnia domowego piekarza |
| **Z-020** | HARMO | Dynamiczna adaptacja czasu fermentacji burzliwej do temperatury otoczenia (\$Q\_{10}\$) | MUST | MVP | ZP-12; ochrona przed przekwaszeniem |
| **Z-021** | HARMO | Obsługa pauzy i przesunięcia startu kolejnego etapu | MUST | MVP | Życiowe sytuacje w domu (dzieci, zakupy) |
| **Z-022** | HARMO | Eksport planu czasowego do kalendarza systemowego iOS (EventKit) | SHOULD | 1.1 | DEC-37 |
| **Z-023** | HARMO | Szacowanie czasu nagrzewania naczynia żeliwnego (45–60 min) | MUST | MVP | Gwarancja odpowiedniej temperatury pieca |
| **Z-024** | ETAP | Prowadzenie przez etapy wypieku krok po kroku | MUST | MVP | ZP-01; spokój i skupienie |
| **Z-025** | ETAP | Etap 1: Dokarmienie zakwasu i osiągnięcie szczytu (Peak) | MUST | MVP | Rdzeń biologiczny wypieku |
| **Z-026** | ETAP | Etap 2: Autoliza klasyczna lub fermentoliza | MUST | MVP | Rozstrzygnięcie S-02 |
| **Z-027** | ETAP | Etap 3: Mieszanie właściwe i dodanie soli (Bassinage) | MUST | MVP | Prawidłowe budowanie siatki glutenowej |
| **Z-028** | ETAP | Etap 4: Fermentacja burzliwa z pętlą składań (np. 4x co 30 min) | MUST | MVP | Kluczowa faza budowania struktury |
| **Z-029** | ETAP | Obsługa różnych technik składania: Stretch & Fold, Coil Fold, Laminacja | MUST | MVP | Elastyczność dla zaawansowanych |
| **Z-030** | ETAP | Automatyczne wyłączenie składań przy ciastach \>50% mąki żytniej | MUST | MVP | Ochrona struktury żyta; S-04 |
| **Z-031** | ETAP | Etap 5: Formowanie wstępne (Pre-shape) i odpoczynek na desce (Bench Rest) | MUST | MVP | Standard technologiczny formowania bochenka |
| **Z-032** | ETAP | Etap 6: Formowanie ostateczne (bochenek podłużny / batard vs okrągły / boule) | MUST | MVP | Różne techniki napinania skórki |
| **Z-033** | ETAP | Etap 7: Garowanie końcowe (koszyk rozrostowy / lodówka) | MUST | MVP | Faza kumulacji gazu i kwasowości |
| **Z-034** | ETAP | Test palca (Poke Test) – instrukcja oceny wyrośnięcia ciasta | MUST | MVP | Zabezpieczenie przed under/over-proofing |
| **Z-035** | ETAP | Etap 8: Nacinanie (Scoring) i dekorowanie mąką | MUST | MVP | Podpowiedzi kąta żyletki pod „ucho” |
| **Z-036** | ETAP | Etap 9: Wypiek z podziałem na fazę parową i rumienienie | MUST | MVP | ZP-11; optymalny rozrost w piecu (Oven Spring) |
| **Z-037** | ETAP | Etap 10: Studzenie na kratce z zakazem krojenia gorącego bochenka | MUST | MVP | Zapobieganie zakalcowi przy krojeniu parującego miękiszu |
| **Z-038** | ZAKW | Profil własnego zakwasu (nazwa, data narodzin, typ mąki) | MUST | MVP | Budowanie emocjonalnej więzi z rzemiosłem |
| **Z-039** | ZAKW | Rejestr dokarmień z wpisywaniem proporcji (np. 1:1:1, 1:2:2, 1:5:5) | MUST | MVP | Śledzenie witalności i tempa wzrostu |
| **Z-040** | ZAKW | Kalkulator czasu podwojenia/potrojenia objętości | MUST | MVP | Obliczanie optymalnego szczytu (Peak) do wypieku |
| **Z-041** | ZAKW | Przypomnienia o dokarmieniu (tryb blatowy co 24h vs lodówkowy co 7 dni) | MUST | MVP | Ochrona zakwasu przed zagłodzeniem; ZP-06 |
| **Z-042** | ZAKW | Płyn głodowy (Hooch) – wykrywanie i instrukcja postępowania | MUST | MVP | Uspokojenie użytkownika; SYT-14 |
| **Z-043** | ZAKW | Baza przepisów na odrzut zakwasu (Discard: naleśniki, krakersy, gofry) | SHOULD | 1.1 | Zmniejszanie marnowania żywności |
| **Z-044** | ZAKW | Obsługa sztywnego zakwasu włoskiego Lievito Madre (hydratacja 50%) | SHOULD | 1.1 | Pizza, panettone, chałki |
| **Z-045** | ZAKW | Wykrywanie pleśni i bezwzględne ostrzeżenie przed zatruciem | MUST | MVP | Bezpieczeństwo mikrobiologiczne; DEC-21 |
| **Z-046** | RECP | Baza predefiniowanych receptur mistrzowskich (6 receptur bazowych) | MUST | MVP | Natychmiastowy start bez szukania w sieci |
| **Z-047** | RECP | Tworzenie i edycja własnych receptur autorskich | MUST | MVP | Narzędzie pracy dla domowego piekarza |
| **Z-048** | RECP | Klonowanie i modyfikacja istniejących przepisów | MUST | MVP | Eksperymentowanie z hydratacją i mąkami |
| **Z-049** | RECP | Dodawanie własnych notatek i zdjęć z przekroju do wypieku | MUST | MVP | Budowanie bazy wiedzy domowej |
| **Z-050** | RECP | Ocena bochenka w skali 1–5 gwiazdek z tagami cech (ucho, miękisz, chrupkość) | SHOULD | MVP | Dziennik postępu rzemieślniczego |
| **Z-051** | SPIZ | Spiżarnia mąk z zapamiętywaniem zawartości białka (%) i popiołu (Typ) | SHOULD | 1.1 | Profesjonalne zarządzanie surowcem |
| **Z-052** | SPIZ | Słownik międzynarodowy odpowiedników mąk (PL, FR, IT, DE, US) | SHOULD | 1.1 | ZP-11; DEC-25 |
| **Z-053** | SPIZ | Kalkulator szacowanej chłonności wody w zależności od zawartości białka | COULD | 1.2 | Heurystyka chłonności mąki |


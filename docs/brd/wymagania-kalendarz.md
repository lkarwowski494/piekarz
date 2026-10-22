# BRD Piekarz — wymagania: kalendarz tygodnia na „Dziś” (KAL)

Stan: E3, przyrost jednej funkcji (rola 01 build, badanie 2026-10-22) · Gałąź: `badanie/piekarz-kalendarz-2026-10-22`. Zlecenie właściciela (2026-10-22, dosłownie): „Mozemy zlecic jakies paralle badanie jak ta funkcja powinna wygladac zeby przyniesc jak najwiecej wartosci dodanej dla uzytkownika tak jak robimy przy nowych aoplikacjach? Ale tylko badanie tej funkcji. To tez pozwoli zaktualizowac BRD.”

Praca, persony, rynek, ograniczenia i hipotezy tej funkcji są w `odkrywanie.md` (J-13, OG-08…OG-12, H-15…H-19, RYZ-22…RYZ-25), źródła w `zrodla.md` (S-65…S-82); raport badania poza repo: `audit/01-kalendarz-2026-10-22/`. Wersje przy wymaganiach były hipotezami H-15…H-20; zakres rozstrzygnęła decyzja D-092 (właściciel przez M1, 2026-10-22, zapis na `redesign/piekarz-2026-10-22`): BR-KAL-001…016 i BR-ETAP-006 w 1.0. Ekrany projektuje rola 04 (makiety M3 Redesigner).

## Przepływy

### PR-19: Spojrzeć na tydzień piekarza na „Dziś”
- Kto: P-7, P-6, P-8 · Praca: J-13, J-04, J-02, J-07, J-05 · Częstotliwość: każde wejście na „Dziś”, zwykle kilka razy dziennie w czasie wypieku i zakładania zakwasu · Kontekst: dowolny, sekundy; często ręce wolne, czasem w cieście.
- Kroki: otwiera „Dziś” → widzi bieżący tydzień od pierwszego dnia tygodnia regionu, z wyróżnionym dniem dzisiejszym i znacznikami dni (wypiek, karmienie, zakładanie zakwasu, wpis w dzienniku) → pod paskiem czyta linię „Następne: …” z najbliższymi zdarzeniami → dotyka dnia i w arkuszu dnia widzi zdarzenia z godzinami → z arkusza przechodzi do źródła (trwający wypiek, karta zakwasu, wpis dziennika) albo, przy dniu w zasięgu planu, do Harmonogramu z tym dniem jako dniem „gotowe” (PR-02) → wraca do trzech ścieżek „co dziś robisz”.

### PR-20: Przejrzeć poprzedni i następny tydzień
- Kto: P-7 · Praca: J-13, J-05 · Częstotliwość: kilka razy w tygodniu [OCENA] · Kontekst: jw.
- Kroki: na pasku przechodzi do poprzedniego albo następnego tygodnia → widzi znaczniki tamtych dni → wraca do bieżącego tygodnia jednym ruchem.

### PR-21: Zaplanować wypiek na wybrany dzień z kalendarza
- Kto: P-7, P-8 · Praca: J-13, J-02, J-04, J-11 · Częstotliwość: około raz w tygodniu (S-24, rec. 8870010975; J-11) · Kontekst: kilka dni przed wypiekiem, kilka minut.
- Kroki: dotyka przyszłego dnia → wybiera „zaplanuj wypiek” → wybiera recepturę i godzinę „gotowe” tego dnia (PR-02) → widzi plan z dniami wcześniej, w tym budzenie zakwasu z lodówki (BR-ZAKW-006) → zapisuje plan bez rozpoczynania → plan pojawia się na pasku i w „Następne” → w dniu startu zaczyna wypiek z planu (PR-04). Może mieć kilka planów naraz.

### PR-22: Ustalić stały rytm karmienia
- Kto: P-7 · Praca: J-04, J-13 · Częstotliwość: raz, potem przy zmianie rytmu · Kontekst: dowolny.
- Kroki: na karcie zakwasu w lodówce wybiera dzień tygodnia i godzinę karmienia → przypomnienie i znacznik na pasku przychodzą w ten dzień → zapis dokarmienia innego dnia nie przesuwa stałego rytmu bez pytania.

### PR-23: Wziąć plan wypieku do kalendarza telefonu albo na ekran początkowy
- Kto: P-7, P-8 · Praca: J-13, J-02 · Częstotliwość: przy planie wypieku · Kontekst: planowanie tygodnia w kalendarzu telefonu razem z innymi sprawami.
- Kroki: z planu wypieku wybiera „dodaj do kalendarza” → system pokazuje własny edytor wydarzenia albo arkusz udostępniania pliku → użytkownik zatwierdza w systemie; albo dodaje widżet z najbliższym zdarzeniem na ekran początkowy.

## Wymagania

### BR-KAL-001: Pasek bieżącego tygodnia na „Dziś”
- Przepływ: PR-19 · Reguła: RD-29, RD-30
- Dowód potrzeby: J-13; prośba o plan „co i kiedy” w telefonie (S-16, rec. 14207280110); szablon tygodnia wstecz od dnia wypieku (S-65); kalendarz karmień w jednej aplikacji konkurencji (S-81); wzorzec Trening (zrzut właściciela 2026-10-22); bezpośrednich próśb o widok kalendarza w próbce recenzji brak (H-15)
- zależy od: ZAL-051
- Kryteria akceptacji:
  - Scenariusz: Tydzień w Polsce
    - Zakładając, że region telefonu to Polska, a dziś jest czwartek 2026-10-22
    - Gdy użytkownik otwiera „Dziś”
    - Wtedy widzi dni od poniedziałku 19 do niedzieli 25 października, a 22 jest wyróżniony nie tylko kolorem (RD-30-W1)
  - Scenariusz: Tydzień w USA
    - Zakładając, że region telefonu to Stany Zjednoczone, a dziś jest czwartek 2026-10-22
    - Gdy użytkownik otwiera „Dziś”
    - Wtedy widzi dni od niedzieli 18 do soboty 24 października (RD-30-W2)
  - Scenariusz: Północ
    - Zakładając, że aplikacja jest otwarta na „Dziś” w środę o 23:59
    - Gdy mija północ
    - Wtedy po powrocie na ekran albo najpóźniej po minucie wyróżniony jest czwartek (RD-29-W2)
  - Scenariusz: Etykieta dla czytnika ekranu
    - Zakładając, że włączony jest VoiceOver
    - Gdy użytkownik przechodzi po dniach paska
    - Wtedy każdy dzień czyta pełną datę, słowo „dziś” przy dzisiejszym i zdarzenia dnia słowami, nie samą ikoną

### BR-KAL-002: Znaczniki dnia z istniejących danych
- Przepływ: PR-19 · Reguła: RD-29, RD-25
- Dowód potrzeby: J-13, J-04 (zapominanie o dokarmieniu: S-15, rec. 6706510871), J-07 (dzień po dniu), J-05 (historia wypieków)
- Kryteria akceptacji:
  - Scenariusz: Trwający wypiek przez noc
    - Zakładając, że trwający wypiek ma kroki od środy 21:00 do czwartku 10:00
    - Gdy użytkownik patrzy na pasek
    - Wtedy środa i czwartek mają znacznik wypieku, a arkusz każdego z tych dni pokazuje tylko kroki, które w nim się zaczynają
  - Scenariusz: Karmienie zrobione i następne
    - Zakładając, że zakwas na blacie dokarmiono w sobotę 2026-10-24 o 20:00 (strefa Europe/Warsaw)
    - Gdy użytkownik patrzy na pasek
    - Wtedy sobota ma znacznik karmienia zrobionego, a niedziela znacznik karmienia następnego o 07:00 (RD-25, RD-29-W4)
  - Scenariusz: Ten sam termin co powiadomienie
    - Zakładając, że zakwas ma zaplanowane powiadomienie o karmieniu
    - Gdy użytkownik porównuje termin na pasku, na karcie zakwasu i w powiadomieniu
    - Wtedy wszystkie trzy pokazują ten sam dzień i godzinę
  - Scenariusz: Zakładanie zakwasu
    - Zakładając, że zakładanie zakwasu trwa, a karta zakwasu pokazuje „Dzień 3”
    - Gdy użytkownik patrzy na pasek
    - Wtedy dziś ma znacznik zakładania z tym samym numerem dnia co karta (RD-31)
  - Scenariusz: Wypiek w dzienniku
    - Zakładając, że w poniedziałek zakończono wypiek z oceną 4★
    - Gdy użytkownik dotyka poniedziałku
    - Wtedy arkusz dnia pokazuje ten wypiek z oceną i przejściem do wpisu w dzienniku
  - Scenariusz: Uszkodzony wpis
    - Zakładając, że jeden wpis zakwasu ma nieczytelną datę
    - Gdy aplikacja buduje pasek
    - Wtedy pomija ten wpis, pokazuje pozostałe znaczniki i nie zmienia danych

### BR-KAL-003: Linia „Następne”
- Przepływ: PR-19 · Reguła: RD-29, RD-32
- Dowód potrzeby: J-13; „Make me a schedule I can put in my phone to tell me what to do AND WHEN.” (S-16, rec. 14207280110); zapominanie o dokarmieniu (S-15, rec. 6706510871), także nocne (S-83); wzorzec Trening („Następne: jutro — …”, zrzut właściciela 2026-10-22); wymóg właściciela 2026-10-22 (przez M1), dosłownie: „„Następne”, jedno zdanie. - tutaj musimy miec kontrole zeby jezeli ktos ma dwa zadania i jedno powiedzmy to upieczenie chleba a drugie to dokarmienie zakwasu ktore bedzie ukryte za nim to zeby nie pominacdrugiego bo cicho przejdzie pod spodem jezeli ktos nie znajdzie czasu na to co moze zrobic ale nie musi” (ER-66)
- Kryteria akceptacji:
  - Scenariusz: Wypiek i karmienie w tym samym czasie
    - Zakładając, że jest 08:00, pieczenie chleba wypada o 10:00, a karmienie zakwasu „Żytni” o 10:30
    - Gdy użytkownik otwiera „Dziś”
    - Wtedy linia „Następne” jest jednym zdaniem z obydwoma zdarzeniami w kolejności czasu, a żadne nie jest schowane za drugim (RD-32-W1)
  - Scenariusz: Po jednym zdarzeniu z każdego źródła
    - Zakładając, że trwający wypiek ma kroki o 10:00, 11:00 i 12:00, a zakwas ma karmienie o 13:00
    - Gdy użytkownik otwiera „Dziś”
    - Wtedy linia pokazuje krok o 10:00 i karmienie o 13:00, a dalsze kroki wypieku są w arkuszu dnia (RD-32-W6)
  - Scenariusz: Więcej źródeł niż miejsc
    - Zakładając, że przyszłe zdarzenia ma trwający wypiek i trzy zakwasy, a limit linii to 3 pozycje przyszłe (D-094)
    - Gdy użytkownik otwiera „Dziś”
    - Wtedy linia pokazuje trzy najbliższe i dopisek „+1”, który otwiera arkusz najbliższych zdarzeń ze wszystkimi (RD-32-W4)
  - Scenariusz: Termin minął bez potwierdzenia
    - Zakładając, że karmienie zakwasu „Żytni” wypadało o 08:00, a użytkownik go nie zapisał
    - Gdy o 08:00 albo później otwiera „Dziś”
    - Wtedy na początku linii widzi „Zaległe: karmienie zakwasu Żytni, 08:00” z przyciskami „Zrobione” i „Pomiń” (RD-32-W2)
  - Scenariusz: Zaległe zostaje do decyzji
    - Zakładając, że zaległe karmienie nie zostało ani zrobione, ani pominięte
    - Gdy użytkownik zamyka aplikację i otwiera „Dziś” następnego dnia
    - Wtedy pozycja „Zaległe” jest nadal na początku linii, a limit linii jej nie ukrywa (RD-32-W5)
  - Scenariusz: Zrobione
    - Zakładając, że widać zaległe karmienie
    - Gdy użytkownik wybiera „Zrobione”
    - Wtedy otwiera się zapis dokarmienia z godziną teraz (PR-05, BR-ZAKW-002), a po zapisie pozycja „Zaległe” znika, a następny termin liczy się od tego dokarmienia (RD-25)
  - Scenariusz: Pomiń karmienie
    - Zakładając, że widać zaległe karmienie z 07:00 zakwasu na blacie
    - Gdy użytkownik o 07:30 wybiera „Pomiń”
    - Wtedy pozycja „Zaległe” znika, a linia pokazuje następne karmienie o 19:30 (RD-32-W7; liczenie od chwili pominięcia, D-094)
  - Scenariusz: Pomiń krok wypieku
    - Zakładając, że widać zaległy krok wypieku
    - Gdy użytkownik wybiera „Pomiń”
    - Wtedy wypiek przechodzi do następnego kroku tak jak wybór kroku z arkusza „Plan wypieku” (dalsze kroki przesuwają się, audyt niezależny D-8), a pozycja „Zaległe” znika
  - Scenariusz: Zadanie opcjonalne wygląda jak obowiązkowe
    - Zakładając, że linia ma krok wypieku i karmienie zakwasu
    - Gdy użytkownik patrzy na linię
    - Wtedy obie pozycje mają ten sam rozmiar, kolor i krój, a kolejność wynika tylko z czasu
  - Scenariusz: Czytnik ekranu
    - Zakładając, że włączony jest VoiceOver, a linia ma pozycję „Zaległe”, dwie przyszłe i „+2”
    - Gdy użytkownik przechodzi po linii
    - Wtedy VoiceOver czyta każdą pozycję z godziną i nazwą źródła, przyciski „Zrobione” i „Pomiń” jako osobne akcje oraz „jeszcze 2 zdarzenia” z akcją otwarcia arkusza
  - Scenariusz: Wąski ekran i duży tekst
    - Zakładając, że ekran ma 320 pt albo tekst ma rozmiar AX5
    - Gdy linia nie mieści się w jednym wierszu
    - Wtedy zawija się na kolejne wiersze i nie obcina żadnej pozycji ani „+N”
  - Scenariusz: Brak przyszłych zdarzeń
    - Zakładając, że nie ma trwającego wypieku ani zakwasu z terminem karmienia
    - Gdy użytkownik otwiera „Dziś”
    - Wtedy linii „Następne” nie ma

### BR-KAL-004: Arkusz dnia
- Przepływ: PR-19
- Dowód potrzeby: J-13; wzorzec Trening (dotknięcie dnia otwiera dzień, `trening/components/TodayPlan.tsx`)
- Kryteria akceptacji:
  - Scenariusz: Dzień ze zdarzeniami
    - Zakładając, że czwartek ma karmienie o 07:00 i dwa kroki wypieku
    - Gdy użytkownik dotyka czwartku
    - Wtedy widzi arkusz z datą i trzema zdarzeniami w kolejności godzin, każde z przejściem do swojego ekranu
  - Scenariusz: Dzień bez zdarzeń
    - Zakładając, że piątek nie ma zdarzeń
    - Gdy użytkownik dotyka piątku
    - Wtedy widzi datę i zdanie, że tego dnia nic nie zaplanowano, bez pustej listy
  - Scenariusz: Zaległe w arkuszu dzisiejszego dnia
    - Zakładając, że jest zaległe karmienie i zaległy krok wypieku
    - Gdy użytkownik dotyka dzisiejszego dnia
    - Wtedy obie pozycje „Zaległe” są na górze arkusza, każda z „Zrobione” i „Pomiń” działającymi jak w linii „Następne” (BR-KAL-003)
  - Scenariusz: Wszystkie zdarzenia źródła
    - Zakładając, że trwający wypiek ma trzy kroki dzisiaj
    - Gdy użytkownik dotyka dzisiejszego dnia
    - Wtedy arkusz pokazuje wszystkie trzy kroki, nie tylko najbliższy (RD-32 dotyczy tylko linii)
  - Scenariusz: Arkusz najbliższych z „+N”
    - Zakładając, że linia „Następne” ma dopisek „+1”
    - Gdy użytkownik go dotyka
    - Wtedy widzi arkusz najbliższych zdarzeń wszystkich źródeł z 7 kolejnych dni, pogrupowany po dniach, z pozycją, której nie było w linii (RD-32-W4)

### BR-KAL-005: Kalendarz bez danych
- Przepływ: PR-19
- Dowód potrzeby: soczewka początkującego (pierwsze uruchomienie: pusty tydzień nic nie mówi); H-16
- zależy od: ZAL-053
- Kryteria akceptacji:
  - Scenariusz: Pierwsze uruchomienie
    - Zakładając, że użytkownik nie ma wypieków, zakwasów ani wpisów
    - Gdy otwiera „Dziś”
    - Wtedy pierwszym elementem ekranu są trzy ścieżki „co dziś robisz”, a kalendarz nie pokazuje pustego tygodnia [DO WYJAŚNIENIA] (OP-51)

### BR-KAL-006: Kalendarz bez Piekarz Pro
- Przepływ: PR-19, PR-16
- Dowód potrzeby: D-038, D-039 pkt 3 (wypiek rozpoczęty w czasie dostępu prowadzi się do końca); tekst trybu „tylko historia”: „Przypomnienia o dokarmianiu są wyłączone.”
- Kryteria akceptacji:
  - Scenariusz: Przeszłość zawsze
    - Zakładając, że okres próbny minął bez zakupu
    - Gdy użytkownik otwiera „Dziś”
    - Wtedy widzi na pasku wypieki z dziennika i zapisane karmienia z przeszłości, bez kłódek na dniach
  - Scenariusz: Bez terminów karmienia
    - Zakładając, że okres próbny minął bez zakupu, a zakwas na blacie dokarmiono wczoraj
    - Gdy użytkownik patrzy na pasek i linię „Następne”
    - Wtedy nie widzi następnego karmienia, bo przypomnienia o dokarmianiu są wyłączone (wykładnia D-038 do potwierdzenia przez rolę 02 [DO WYJAŚNIENIA] (OP-55))
  - Scenariusz: Wypiek rozpoczęty z dostępem
    - Zakładając, że wypiek rozpoczęto w czasie próby, a próba minęła w jego trakcie
    - Gdy użytkownik patrzy na pasek
    - Wtedy widzi przyszłe kroki tego wypieku jak przed końcem próby (D-039 pkt 3)

### BR-KAL-007: Kalendarz nie zmienia schematu bazy w pierwszej wersji
- Przepływ: PR-19
- Dowód potrzeby: zasada wspólna 10 (zero utraty danych); jeden bieżący plan w bazie (pomiar M3 i `src/hooks/useStanStartu.ts:31–32`); H-15
- Kryteria akceptacji:
  - Scenariusz: Tylko odczyt
    - Zakładając, że kalendarz w wersji tylko do odczytu jest włączony
    - Gdy użytkownik przegląda pasek, linię „Następne” i arkusze dni
    - Wtedy baza ma ten sam `PRAGMA user_version` i te same wiersze co przed wejściem na „Dziś”
  - Scenariusz: Decyzja o zaległym bez zmiany schematu
    - Zakładając, że użytkownik wybiera „Zrobione” albo „Pomiń” przy pozycji „Zaległe” (BR-KAL-003)
    - Gdy decyzja się zapisuje
    - Wtedy „Zrobione” zapisuje dokarmienie albo krok istniejącą ścieżką, „Pomiń” zapisuje tylko decyzję w istniejącej tabeli ustawień, a `PRAGMA user_version` się nie zmienia
  - Scenariusz: Decyzja w kopii zapasowej
    - Zakładając, że użytkownik pominął zaległe karmienie
    - Gdy eksportuje dane i importuje je na nowym telefonie
    - Wtedy pominięcie nie przechodzi do kopii (D-094), więc karmienie, którego termin nadal minął, wraca na nowym telefonie jako „Zaległe” z „Zrobione” i „Pomiń”

### BR-KAL-015: Zaplanuj wypiek na ten dzień
- Przepływ: PR-19, PR-02
- Dowód potrzeby: J-13; przegląd osób (raport badania): „kiedy zacząć na konkretny dzień” to główny problem P-7 i P-10 (S-68, S-69, S-80, S-89); dziś Harmonogram ma wybór dnia „gotowe”: dziś, jutro, pojutrze (`src/components/harmonogram/TargetReadyCard.tsx:97-99`); H-15 (b+)
- Kryteria akceptacji:
  - Scenariusz: Pojutrze bez trwającego wypieku
    - Zakładając, że nie ma trwającego wypieku, a dziś jest czwartek
    - Gdy użytkownik dotyka soboty i wybiera „Zaplanuj wypiek na ten dzień”
    - Wtedy otwiera się wybór receptury, a potem Harmonogram z dniem „gotowe” ustawionym na sobotę
  - Scenariusz: Dzień poza zasięgiem planu
    - Zakładając, że dziś jest czwartek
    - Gdy użytkownik dotyka niedzieli
    - Wtedy arkusz dnia nie ma skrótu do planu (dzień poza zasięgiem Harmonogramu; plan na dowolny dzień: BR-KAL-009)
  - Scenariusz: Trwa wypiek
    - Zakładając, że trwa wypiek
    - Gdy użytkownik dotyka jutra
    - Wtedy arkusz dnia nie ma skrótu do planu, bo aplikacja prowadzi jeden wypiek naraz
  - Scenariusz: Dzień miniony
    - Zakładając, że dziś jest czwartek
    - Gdy użytkownik dotyka wtorku
    - Wtedy arkusz dnia pokazuje tylko to, co się wydarzyło, bez skrótu do planu

### BR-KAL-008: Poprzedni i następny tydzień
- Przepływ: PR-20 · Reguła: RD-30
- Dowód potrzeby: J-05 (porównanie z wcześniejszym wypiekiem), J-13; H-15
- Kryteria akceptacji:
  - Scenariusz: Następny tydzień przy zmianie czasu
    - Zakładając, że region to Polska, a widoczny jest tydzień od 2026-10-19
    - Gdy użytkownik przechodzi do następnego tygodnia
    - Wtedy widzi dni od poniedziałku 26 października do niedzieli 1 listopada (RD-30-W4)
  - Scenariusz: Powrót do dziś
    - Zakładając, że użytkownik oglądał tydzień sprzed miesiąca
    - Gdy wybiera powrót do bieżącego tygodnia
    - Wtedy widzi tydzień z wyróżnionym dniem dzisiejszym

### BR-KAL-009: Zaplanowane wypieki na przyszłe dni
- Przepływ: PR-21 · Reguła: RD-17, RD-25
- Dowód potrzeby: J-13, J-02; szablon tygodnia z karmieniami w dniach przed mieszaniem (S-65, S-68); dopasowanie wypieku do pracy (S-69); brak wyboru godziny końca u konkurencji jako skarga (S-80); prośba o kilka wypieków naraz (S-14, rec. 6384160131); H-17; limit oczekujących powiadomień OG-10 [DO USTALENIA] (OP-56)
- zależy od: ZAL-052
- Kryteria akceptacji:
  - Scenariusz: Wypiek na sobotę z zakwasem z lodówki
    - Zakładając, że zakwas jest w lodówce, a dziś jest środa
    - Gdy użytkownik planuje chleb gotowy w sobotę o 10:00
    - Wtedy pasek pokazuje karmienia budzące zakwas i kroki ciasta w dniach przed sobotą, a sobota ma znacznik wypieku
  - Scenariusz: Dwa plany
    - Zakładając, że użytkownik ma plan na sobotę
    - Gdy dodaje plan pizzy na piątek
    - Wtedy oba plany są zapisane i widoczne, a rozpoczęcie jednego nie usuwa drugiego
  - Scenariusz: Aktualizacja z wersji z jednym planem
    - Zakładając, że użytkownik ma trwający wypiek zapisany przez wersję 1.0
    - Gdy instaluje wersję z wieloma planami
    - Wtedy trwający wypiek jest nadal na tym samym kroku, a migracja przeszła test na kopii bazy poprzedniej wersji (NFR-DANE-003)
  - Scenariusz: Kolizja planów
    - Zakładając, że dwa plany mają kroki czynne w tej samej godzinie
    - Gdy użytkownik zapisuje drugi plan
    - Wtedy widzi kolizję z nazwą kroku i godziną, a plan zapisuje się dopiero po jego decyzji

### BR-KAL-016: Dwa wypieki prowadzone naraz
- Przepływ: PR-21, PR-04
- Dowód potrzeby: J-14; jeden minutnik na kilka bochenków (S-91), bochenek przefermentowany w kolejce do piekarnika (S-92), kilka rodzajów na dzień pieczenia (S-93), pomylenie receptur (S-94); „you can only run one recipe at a time” (S-14, rec. 6384160131); H-20
- zależy od: ZAL-059
- Kryteria akceptacji:
  - Scenariusz: Chleb i pizza tego samego dnia
    - Zakładając, że trwa wypiek chleba z pieczeniem o 10:00
    - Gdy użytkownik zaczyna ciasto na pizzę z pieczeniem o 19:00
    - Wtedy oba wypieki są zapisane, każdy ma swoje kroki i powiadomienia z nazwą wypieku, a pasek pokazuje oba
  - Scenariusz: Jeden piekarnik
    - Zakładając, że dwa wypieki mają pieczenie w tym samym czasie
    - Gdy użytkownik zapisuje drugi
    - Wtedy widzi, że piekarnik jest zajęty, i propozycję przesunięcia startu drugiego wypieku
  - Scenariusz: Który krok czyj
    - Zakładając, że trwają dwa wypieki
    - Gdy przychodzi powiadomienie o kroku
    - Wtedy treść powiadomienia i ekran prowadzenia nazywają wypiek, którego krok dotyczy
  - Scenariusz: Koniec jednego
    - Zakładając, że trwają dwa wypieki
    - Gdy użytkownik kończy pierwszy i zapisuje ocenę
    - Wtedy drugi trwa dalej na tym samym kroku z tym samym zegarem
  - Scenariusz: Jedna spirala z dwoma torami
    - Zakładając, że trwają dwa wypieki
    - Gdy użytkownik otwiera prowadzenie albo „Dziś”
    - Wtedy widzi jedną spiralę z dwoma torami, każdy tor z nazwą swojego wypieku i bieżącym krokiem, a czytnik ekranu czyta oba tory osobno (D-094)

### BR-KAL-010: Stały dzień karmienia zakwasu w lodówce
- Przepływ: PR-22 · Reguła: RD-25
- Dowód potrzeby: J-04; dziennik i przypomnienia według własnego rytmu (S-21, rec. 13407309939); H-17
- Kryteria akceptacji:
  - Scenariusz: Karmienie w niedziele
    - Zakładając, że zakwas jest w lodówce, a użytkownik ustawił karmienie w niedziele o 10:00
    - Gdy jest niedziela 10:00
    - Wtedy dostaje przypomnienie, a niedziele na pasku mają znacznik karmienia
  - Scenariusz: Karmienie w inny dzień
    - Zakładając, że użytkownik dokarmił zakwas w piątek
    - Gdy zapisuje dokarmienie
    - Wtedy aplikacja pyta, czy zostawić niedzielę, czy liczyć od piątku

### BR-KAL-011: Plan wypieku w kalendarzu telefonu
- Przepływ: PR-23
- Dowód potrzeby: J-13; „schedule I can put in my phone” (S-16, rec. 14207280110); KL-09 (`docs/scope-contract.md`: powrót eksportu tylko z BR roli 01 i wejściem z Harmonogramu); u konkurencji brak eksportu do kalendarza telefonu (raport badania); H-18; czy iOS otwiera plik .ics z arkusza udostępniania [DO USTALENIA] (OP-50)
- Kryteria akceptacji:
  - Scenariusz: Dodanie bez dostępu do kalendarza
    - Zakładając, że użytkownik nie dał aplikacji dostępu do kalendarza
    - Gdy wybiera „dodaj do kalendarza” przy planie wypieku
    - Wtedy widzi systemowy edytor albo arkusz pliku z wydarzeniem i godzinami planu, a aplikacja nie prosi o pełny dostęp do kalendarza (OG-08)
  - Scenariusz: Zmiana planu po dodaniu
    - Zakładając, że plan dodano do kalendarza telefonu
    - Gdy użytkownik przesuwa krok w aplikacji
    - Wtedy aplikacja mówi, że wydarzenie w kalendarzu telefonu się nie zmieniło

### BR-KAL-012: Widżet z najbliższym zdarzeniem
- Przepływ: PR-23
- Dowód potrzeby: widżety i zegarek 2 z 338 recenzji (S-25, S-26; słaby dowód); widżety ekranu początkowego i blokady w opisie Levain (raport badania, 4 oceny); H-19; ograniczenia OG-09
- Kryteria akceptacji:
  - Scenariusz: Najbliższe karmienie na ekranie początkowym
    - Zakładając, że widżet jest dodany, a najbliższe zdarzenie to karmienie jutro o 07:00
    - Gdy użytkownik patrzy na ekran początkowy
    - Wtedy widzi to samo zdarzenie co w linii „Następne”, bez otwierania aplikacji

### BR-KAL-013: Widok miesiąca
- Przepływ: PR-20
- Dowód potrzeby: J-05; brak bezpośredniego dowodu z recenzji [OCENA]; H-19
- Kryteria akceptacji:
  - Scenariusz: Miesiąc wypieków
    - Zakładając, że w październiku było pięć wypieków
    - Gdy użytkownik otwiera widok miesiąca
    - Wtedy widzi pięć dni ze znacznikiem wypieku i przejście do każdego wpisu

### BR-KAL-014: Podpowiedź rytmu z historii
- Przepływ: PR-21
- Dowód potrzeby: J-13, J-05; brak bezpośredniego dowodu [OCENA]; H-19
- Kryteria akceptacji:
  - Scenariusz: Zwykle w sobotę
    - Zakładając, że ostatnie cztery wypieki zakończyły się w sobotę
    - Gdy użytkownik planuje nowy wypiek
    - Wtedy widzi sobotę jako propozycję dnia, którą może zmienić

## Wymagania niefunkcjonalne

### NFR-KAL-001: Pasek na ekranie 320 pt
- Miara: szerokość pola dotyku dnia i obcięcie tekstu paska przy szerokości 320 pt. Próg: pole dotyku ≥ 44 × 44 pt (NFR-INT-001, OG-12) albo dzień bez osobnego celu dotyku (cały pasek jednym celem), bez obciętych skrótów dni. Metoda: zrzut i pomiar roli 04 przy 320 pt. [RACHUNEK]: z marginesami ekranu „Dziś” (2 × 20 pt) 280/7 = 40 pt na kolumnę; pasek od krawędzi do krawędzi (makieta a2 M3, 2026-10-22) 320/7 = 45,7 pt, co spełnia próg.

### NFR-KAL-002: Pasek przy Dynamic Type AX5
- Miara: obcięcie i nakładanie się tekstu paska i linii „Następne” przy AX5. Próg: brak (NFR-DOST-002; przy AX5 tekst Body ma 53 pt, S-77); przy rozmiarach dostępności osobny układ (lista dni albo dziś i jutro) zamiast siedmiu kolumn. Metoda: zrzuty roli 04 przy AX5; test układu w Jest dla `fontScale` ≥ próg [DO WYJAŚNIENIA] (OP-52).

### NFR-KAL-003: Dni liczone lokalnie
- Miara: zgodność dnia zdarzenia na pasku z datą w strefie urządzenia, także przy zmianie czasu. Próg: 100% wektorów RD-29 i RD-30. Metoda: testy jednostkowe z `TZ=Europe/Warsaw` i `TZ=America/New_York` (rola 07).

### NFR-KAL-004: Koszt odświeżenia „Dziś”
- Miara: czas od wejścia na „Dziś” do pokazania paska na najstarszym wspieranym iPhonie z 2 latami danych (ok. 100 wypieków, 1000 wpisów zakwasu [OCENA]). Próg: [DO WYJAŚNIENIA] (OP-43). Metoda: pomiar roli 05.

## Reguły

### RD-29: Dzień kalendarza zdarzenia
- Wzór: `dzień(z) = data lokalna chwili z w bieżącej strefie czasowej urządzenia`; zdarzenie trwające przez północ ma znacznik w każdym dniu, w którym zaczyna się któryś jego krok
- Jednostki: czas [RRRR-MM-DD gg:mm], strefa [IANA]
- Granica: 00:00 należy do nowego dnia (włączna od początku dnia)
- Podstawa: rachunek (konwersja chwili UTC na datę lokalną; daty zmiany czasu: S-67)
- Krytyczna: nie
- Uproszczenie: przy zmianie strefy (podróż) dni przelicza się według nowej strefy; zdarzenie może przejść na inny dzień.

| ID | Chwila [UTC] | Strefa [IANA] | Oczekiwane: dzień paska [data] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|
| RD-29-W1 | 2026-10-21 21:59 | Europe/Warsaw | 2026-10-21 (23:59 CEST) | — | poniżej | rachunek: UTC+2 |
| RD-29-W2 | 2026-10-21 22:00 | Europe/Warsaw | 2026-10-22 (00:00 CEST) | — | granica | rachunek: UTC+2 |
| RD-29-W3 | 2026-10-21 22:01 | Europe/Warsaw | 2026-10-22 (00:01 CEST) | — | powyżej | rachunek: UTC+2 |
| RD-29-W4 | 2026-10-25 06:00 | Europe/Warsaw | 2026-10-25 (07:00 CET) | — | typowy | rachunek: karmienie 2026-10-24 20:00 CEST + 12 h (RD-25); zmiana czasu 2026-10-25 (S-67) |
| RD-29-W5 | 2026-10-22 22:30 | America/New_York | 2026-10-22 (18:30 EDT) | — | typowy | rachunek: UTC−4; ta sama chwila w Europe/Warsaw to 2026-10-23 00:30 |
| RD-29-W6 | brak | Europe/Warsaw | zdarzenie pominięte, pozostałe bez zmian | — | błąd | rachunek: nieczytelna data wpisu (BR-KAL-002) |

### RD-30: Tydzień paska
- Wzór: `start = ostatni dzień ≤ dziś, którego dzień tygodnia = pierwszy dzień tygodnia regionu`; tydzień = 7 kolejnych dat kalendarza od `start`; tydzień następny = `start + 7 dni kalendarza` (nie 7 × 24 h)
- Jednostki: data [RRRR-MM-DD], pierwszy dzień tygodnia [-]
- Granica: dziś = pierwszy dzień tygodnia (włączna: tydzień zaczyna się dziś)
- Podstawa: S-66 (pierwszy dzień tygodnia według regionu, CLDR 48), S-79 (`getCalendars().firstWeekday`: 1 = niedziela, wartość może być pusta); rachunek (7 × 24 h przy zmianie czasu daje niedzielę 23:00: `robocze/kod.md` raportu)
- Krytyczna: nie
- Uproszczenie: pierwszy dzień tygodnia z ustawień telefonu, gdy system go podaje; inaczej z regionu [DO USTALENIA] (OP-53).

| ID | Dziś [data] | Region [-] | Oczekiwane: dni paska [data] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|
| RD-30-W1 | 2026-10-22 | PL | 2026-10-19…2026-10-25 | — | typowy | S-66 (PL: poniedziałek) |
| RD-30-W2 | 2026-10-22 | US | 2026-10-18…2026-10-24 | — | typowy | S-66 (US: niedziela) |
| RD-30-W3 | 2026-10-19 | PL | 2026-10-19…2026-10-25 | — | granica | rachunek: dziś = pierwszy dzień |
| RD-30-W4 | 2026-10-26 | PL | 2026-10-26…2026-11-01 | — | powyżej | rachunek: dzień po niedzieli ze zmianą czasu (S-67); 7 × 24 h dałoby 2026-10-25 23:00 |
| RD-30-W5 | 2026-10-25 | PL | 2026-10-19…2026-10-25 | — | poniżej | rachunek: ostatni dzień tygodnia, dzień 25-godzinny |
| RD-30-W6 | 2026-11-01 | US | 2026-11-01…2026-11-07 | — | typowy | rachunek: niedziela ze zmianą czasu w USA (S-78) |
| RD-30-W7 | 2026-10-22 | brak | jak region językowy aplikacji, a bez niego poniedziałek | — | błąd | rachunek: brak regionu [DO USTALENIA] (OP-53) |

### RD-31: Numer dnia zakładania zakwasu na pasku
- Wzór: `N = (dzień(teraz) − dzień(start zakładania)) w dniach kalendarza + 1`, dzień według RD-29; dzień 1 to dzień założenia (D-093); ta sama funkcja liczy numer na karcie zakwasu i na pasku; znacznik zakładania stoi na dniu kalendarza `dzień(teraz)`
- Jednostki: N [-], czas [RRRR-MM-DD gg:mm]
- Granica: północ po dniu założenia (włączna: od 00:00 N = 2)
- Podstawa: decyzja D-093 (właściciel przez M1, 2026-10-22; zapis na `redesign/piekarz-2026-10-22`); rachunek dni kalendarza jak RD-30 (nie wielokrotność 24 h); zgodność z kartą (BR-ZAKW-005)
- Krytyczna: nie
- Uproszczenie: zakładanie zaczęte późnym wieczorem ma „Dzień 2” już po północy, choć minęło kilka godzin; rozstrzygnięte decyzją (OP-54). Dotychczasowe `setupDay` (`src/core/starter-log.ts:41`) liczy okresy 24 h i zmienia się w partii D0 toru D (M3).

| ID | Start zakładania [czas] | Teraz [czas] | Oczekiwane: N [-] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|
| RD-31-W1 | 2026-10-20 21:00 | 2026-10-20 23:59 | 1 | 1 min | poniżej | rachunek: ten sam dzień kalendarza (D-093) |
| RD-31-W2 | 2026-10-20 21:00 | 2026-10-21 00:00 | 2 | 1 min | granica | rachunek: północ po dniu założenia |
| RD-31-W3 | 2026-10-20 21:00 | 2026-10-21 20:59 | 2 | 1 min | powyżej | rachunek: przy okresach 24 h byłoby 1 |
| RD-31-W4 | 2026-10-24 22:00 | 2026-10-25 23:30 | 2 | 1 min | typowy | rachunek: Europe/Warsaw, doba 25 h przy zmianie czasu (S-67), nadal 2 |
| RD-31-W5 | 2026-10-20 08:00 | 2026-10-26 07:00 | 7 | 1 min | typowy | rachunek: 6 dni kalendarza + 1 |
| RD-31-W6 | 2026-10-20 21:00 | 2026-10-20 20:00 | 1 | — | błąd | rachunek: teraz przed startem (zmiana zegara), N nie mniejsze niż 1 |

### RD-32: Pozycje linii „Następne”
- Wzór: źródło = trwający wypiek albo zakwas; Z = zdarzenia z terminem ≤ teraz, bez potwierdzenia i bez pominięcia (wszystkie, od najstarszego; źródło z zaległym nie dokłada przyszłego); P = po jednym najbliższym zdarzeniu z terminem > teraz z każdego pozostałego źródła, według czasu; linia = Z, potem pierwsze max(0, L − liczba(Z)) pozycji z P; „+N”, gdy N = liczba(P) − liczba pokazanych z P > 0
- Jednostki: czas [RRRR-MM-DD gg:mm], L [-], N [-]
- Granica: termin = teraz (włączna: zdarzenie jest już „Zaległe”)
- Podstawa: rachunek; wymóg właściciela 2026-10-22 (ER-66); L = 3 i liczenie od chwili pominięcia: D-094; termin karmienia z RD-25
- Krytyczna: nie
- Uproszczenie: pozycje „Zaległe” nie podlegają limitowi L, żeby nic nie znikało po cichu; przy wielu zaległych linia się wydłuża (BR-KAL-003, wąski ekran).

| ID | Teraz [czas] | Zdarzenia [źródło, termin, stan] | L [-] | Oczekiwane: linia [pozycje] | Oczekiwane: N [-] | Tolerancja | Rodzaj | Pochodzenie |
|---|---|---|---|---|---|---|---|---|
| RD-32-W1 | 2026-10-22 08:00 | wypiek: pieczenie 10:00; zakwas Żytni: karmienie 10:30 | 3 | pieczenie 10:00 · karmienie Żytni 10:30 | 0 | — | typowy | rachunek; przykład właściciela (ER-66) |
| RD-32-W2 | 2026-10-22 08:00 | zakwas Żytni: karmienie 08:00, bez zapisu | 3 | Zaległe: karmienie Żytni 08:00 | 0 | — | granica | rachunek: termin = teraz |
| RD-32-W3 | 2026-10-22 08:00 | zakwas Żytni: karmienie 08:01 | 3 | karmienie Żytni 08:01 | 0 | — | poniżej | rachunek: termin > teraz, jeszcze nie zaległe |
| RD-32-W4 | 2026-10-22 08:00 | wypiek: krok 09:00; zakwasy A 10:00, B 11:00, C 12:00 | 3 | krok 09:00 · karmienie A 10:00 · karmienie B 11:00 | 1 | — | powyżej | rachunek: 4 źródła > L |
| RD-32-W5 | 2026-10-23 09:00 | zakwas A: karmienie 2026-10-22 08:00, bez zapisu; zakwas B: 2026-10-23 07:00, bez zapisu; wypiek: krok 10:00; zakwas C: 11:00; zakwas D: 12:00 | 3 | Zaległe A 22.10 08:00 · Zaległe B 07:00 · krok 10:00 | 2 | — | powyżej | rachunek: 2 zaległe, miejsce na 1 przyszłe |
| RD-32-W6 | 2026-10-22 08:00 | wypiek: kroki 10:00, 11:00, 12:00; zakwas: karmienie 13:00 | 3 | krok 10:00 · karmienie 13:00 | 0 | — | typowy | rachunek: po jednym ze źródła |
| RD-32-W7 | 2026-10-22 07:30 | zakwas na blacie: karmienie 07:00 pominięte o 07:30 | 3 | karmienie 19:30 | 0 | — | typowy | rachunek: 07:30 + 12 h (RD-25), liczenie od pominięcia (D-094) |
| RD-32-W8 | 2026-10-22 08:00 | zakwas A: termin nieczytelny; zakwas B: karmienie 09:00 | 3 | karmienie B 09:00 | 0 | — | błąd | rachunek: zdarzenie bez terminu pominięte, reszta bez zmian (RD-29-W6) |

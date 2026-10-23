# BRD Piekarz — wymagania: zakwas (ZAKW)

Stan: E3 · Aktualizacja: 2026-10-19. Zasada właściciela: „W robieniu chleba najtrudniejsze jest prowadzenie zakwasu.” (ZP-19). Reguła krytyczna RD-21 obowiązuje w każdym miejscu, w którym użytkownik opisuje wygląd albo zapach zakwasu.

### BR-ZAKW-001: Karta zakwasu, także kilku zakwasów
- Przepływ: PR-05, PR-11
- Dowód potrzeby: J-04; kilka zakwasów naraz (S-20, rec. 14638146092; S-21, rec. 13407309939); 12 z 338 recenzji o prowadzeniu zakwasu
- Kryteria akceptacji:
  - Scenariusz: Dwa zakwasy
    - Zakładając, że użytkownik ma zakwas żytni i pszenny
    - Gdy otwiera listę zakwasów
    - Wtedy widzi oba z datą ostatniego dokarmienia i miejscem (blat albo lodówka)
  - Scenariusz: Usunięcie zakwasu
    - Zakładając, że użytkownik usuwa zakwas
    - Gdy potwierdza usunięcie
    - Wtedy zakwas i jego przypomnienia znikają, a wypieki, które go używały, zostają w historii

### BR-ZAKW-002: Dokarmianie z proporcją
- Przepływ: PR-05 · Reguła: RD-14 (hydratacja zakwasu)
- Dowód potrzeby: J-04; kalkulator ilości do dokarmienia chwalony (S-20, rec. 13947658962)
- Kryteria akceptacji:
  - Scenariusz: Proporcja 1:2:2
    - Zakładając, że użytkownik zostawia 50 g zakwasu i wybiera proporcję 1:2:2
    - Gdy zapisuje dokarmienie
    - Wtedy widzi 100 g mąki i 100 g wody do dodania oraz hydratację zakwasu 100%
  - Scenariusz: Brak masy zakwasu
    - Zakładając, że pole masy zakwasu jest puste
    - Gdy użytkownik zapisuje dokarmienie
    - Wtedy widzi prośbę o uzupełnienie pola

### BR-ZAKW-003: Gotowość zakwasu do ciasta
- Przepływ: PR-05, PR-02 · Reguła: RD-24
- Dowód potrzeby: J-04; zakwas powinien być gotowy w dniu wypieku; kod przewiduje szczyt z godzin (progi bez źródła, OP-39)
- Kryteria akceptacji:
  - Scenariusz: Podwojenie w 6 h
    - Zakładając, że użytkownik zapisał dokarmienie o 08:00
    - Gdy o 14:00 zaznacza, że zakwas podwoił objętość i ma bąbelki
    - Wtedy widzi „gotowy do ciasta” z atrybucją „według King Arthur Baking” (RD-24-W1)
  - Scenariusz: Brak podwojenia w 8 h
    - Zakładając, że po 8,5 h zakwas nie podwoił objętości
    - Gdy użytkownik zapisuje obserwację
    - Wtedy widzi radę, by karmić dalej co 12 h (RD-24-W3)
  - Scenariusz: Przewidywanie z godzin
    - Zakładając, że użytkownik nie zapisał obserwacji
    - Gdy otwiera kartę zakwasu
    - Wtedy widzi czas od dokarmienia bez godziny szczytu, dopóki progi nie mają źródła [DO USTALENIA] (OP-39)

### BR-ZAKW-004: Przypomnienie o dokarmieniu i zasada ostrożności
- Przepływ: PR-05 · Reguła: RD-25, RD-21
- Dowód potrzeby: J-04; zapominanie o dokarmieniu (S-15, rec. 6706510871); RYZ-14; DEC-10 (a) planu napraw M1; dostęp: przypomnienia o dokarmianiu w Pro, z wyjątkiem zakładania zakwasu (Basic) — D-113, D-116 (ER-74); ostrzeżenia RD-21 zawsze w Basic
- Kryteria akceptacji:
  - Scenariusz: Bez Pro po zakładaniu
    - Zakładając, że użytkownik nie ma Pro, a pierwszy zakwas jest już gotowy (po zakładaniu)
    - Gdy mija termin dokarmienia zakwasu na blacie albo w lodówce
    - Wtedy nie dostaje przypomnienia o dokarmianiu, a przypomnienia w czasie zakładania i powiadomienia o krokach wypieku działają (D-113)
  - Scenariusz: Zakwas na blacie
    - Zakładając, że zakwas na blacie dokarmiono o 08:00
    - Gdy jest 20:00
    - Wtedy użytkownik dostaje przypomnienie o dokarmieniu (RD-25-W1; odstęp domyślny: OP-38)
  - Scenariusz: Zakwas w lodówce
    - Zakładając, że zakwas w lodówce dokarmiono 2026-10-01 o 10:00
    - Gdy jest 2026-10-08 10:00
    - Wtedy użytkownik dostaje przypomnienie (RD-25-W4); to jedno powiadomienie na cykl karmienia, bez wcześniejszego przypomnienia (D-068, ER-60)
  - Scenariusz: Przypomnienia o karmieniu wyłączone
    - Zakładając, że użytkownik wyłączył w Ustawieniach przełącznik „Przypomnienia o karmieniu”
    - Gdy mija termin dokarmienia zakwasu na blacie albo w lodówce
    - Wtedy nie dostaje przypomnienia o karmieniu, a powiadomienia o krokach wypieku przychodzą dalej (D-068)
  - Scenariusz: Kolorowe plamy
    - Zakładając, że użytkownik zaznacza kolorowe plamy na zakwasie
    - Gdy zatwierdza objawy
    - Wtedy widzi „wyrzuć zakwas, nie wąchaj, umyj i wypłucz naczynie” (RD-21-W1)
  - Scenariusz: Biały nalot
    - Zakładając, że użytkownik zaznacza biały nalot
    - Gdy zatwierdza objawy
    - Wtedy widzi to samo polecenie wyrzucenia (RD-21-W2)
  - Scenariusz: Tylko płyn o zapachu alkoholu
    - Zakładając, że użytkownik zaznacza tylko płyn o zapachu alkoholu
    - Gdy zatwierdza objawy
    - Wtedy widzi, że według CSU Extension płyn o zapachu alkoholu jest w porządku (produkt uboczny fermentacji drożdży), i radę: można go zlać albo wmieszać (RD-21-W3; brzmienie ZAK-HOO-001: D-066, ER-55)
  - Scenariusz: Brak zaznaczeń
    - Zakładając, że użytkownik nic nie zaznacza
    - Gdy zatwierdza formularz
    - Wtedy nie widzi werdyktu „zdrowy” ani „bezpieczny” (RD-21-W5)

### BR-ZAKW-005: Założenie zakwasu dzień po dniu
- Przepływ: PR-11 · Reguła: RD-24, RD-21
- Dowód potrzeby: J-07, P-6; 6 z 338 recenzji; obietnica „starting with the starter” bez pokrycia u konkurencji (S-16, rec. 13931423989); soczewka początkującego (brak stanu „dzień N”)
- Kryteria akceptacji:
  - Scenariusz: Start
    - Zakładając, że użytkownik wybiera „zakładam zakwas”
    - Gdy zapisuje pierwsze dokarmienie
    - Wtedy widzi, co zrobić w dniu 1 i następnych, oraz że założenie trwa zwykle kilka dni, średnio 7–10 (RD-24, S-44)
  - Scenariusz: Brak aktywności pierwszego dnia
    - Zakładając, że jest dzień 1, a zakwas nie rośnie
    - Gdy użytkownik zapisuje obserwację
    - Wtedy widzi, że to normalne, i kiedy następne dokarmienie (RD-24-W5)
  - Scenariusz: Pleśń w trakcie zakładania
    - Zakładając, że jest dzień 4
    - Gdy użytkownik zaznacza kolorowe plamy
    - Wtedy widzi polecenie wyrzucenia i umycia naczynia oraz możliwość zaczęcia od nowa (RD-21-W1)
  - Scenariusz: Gotowy
    - Zakładając, że jest dzień 7, a zakwas podwoił objętość w 8 h
    - Gdy użytkownik zapisuje obserwację
    - Wtedy widzi „gotowy” i przejście do zaplanowania pierwszego wypieku (RD-24-W2)

### BR-ZAKW-006: Obudzenie zakwasu z lodówki przed wypiekiem
- Przepływ: PR-05, PR-02 · Reguła: RD-24
- Dowód potrzeby: J-04; soczewka początkującego (powrót po przerwie); S-54 (przewodnik: dokarmianie co 12 h, aż podwoi objętość w 6–8 h)
- Kryteria akceptacji:
  - Scenariusz: Plan z zakwasem z lodówki
    - Zakładając, że wybrany zakwas jest w lodówce
    - Gdy użytkownik planuje wypiek na pojutrze
    - Wtedy plan zaczyna się od dokarmień zakwasu w temperaturze pokojowej przed mieszaniem ciasta
  - Scenariusz: Zakwas niegotowy w dniu ciasta
    - Zakładając, że w dniu mieszania zakwas nie podwoił objętości w 8 h
    - Gdy użytkownik zapisuje obserwację
    - Wtedy widzi radę, by dokarmić jeszcze raz, i propozycję przesunięcia planu (RD-24-W3, BR-HARMO-004)

### BR-ZAKW-007: Poprawa pomyłki we wpisie bez kasowania historii
- Przepływ: PR-05, PR-11
- Dowód potrzeby: prośba o edycję wpisu bez resetu danych (S-21, rec. 12986088850) i o edycję lub usunięcie wpisów (S-21, rec. 13060223498)
- Kryteria akceptacji:
  - Scenariusz: Zła godzina dokarmienia
    - Zakładając, że użytkownik zapisał dokarmienie z godziną 18:00 zamiast 08:00
    - Gdy poprawia godzinę
    - Wtedy przypomnienie i stan zakwasu liczą się od 08:00, a pozostałe wpisy się nie zmieniają
  - Scenariusz: Usunięcie wpisu
    - Zakładając, że użytkownik usuwa jeden wpis
    - Gdy potwierdza
    - Wtedy znika tylko ten wpis

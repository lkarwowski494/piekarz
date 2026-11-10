# G2: 06-tresci, 09-lokalizacja
- M1-audytor-generalny-088 (P1, D, rola-właściciel 06-tresci, commit M2 d04c94ca, regresja od 008) — Receptura żytnia po zmianie mąk (żyto ≤ 50%) dostaje w planie i prowadzeniu tekst i temperatury brioszki, łotewska 250 °C zamiast 225 °C
  ID źródłowe: 06-tresci-601
  Poprzedni raport: K/reaudit-2026-11-09/06-tresci/06-tresci-reaudit-2026-11-09.md
  Test akceptacyjny: plan rye_100_pan, borodinsky_rye i latvian_scalded_rye przy 50% żyta: temperatury z danych receptury, bez słowa „brioszk”; tekst pieczenia po id receptury, nie po naczyniu
- M1-audytor-generalny-089 (P1, P, rola-właściciel 06-tresci, commity M2 3e05396e, f6291d8f, decyzja DEC-21 = a, regresja od 008) — Plan brioszki na Lievito Madre: rośnięcie w keksówce 20 min (czas drożdży instant) i lodówka bez rośnięcia w cieple, bez informacji, że czasy są szacunkowe
  ID źródłowe: 06-tresci-602
  Poprzedni raport: jak wyżej
  Test akceptacyjny (opcja a): brioszka bez „Ułóż plan” do zamknięcia PIE-BRI-900, test katalogu; plan bez planu nie eksportuje osi czasu (bez „Dodaj do kalendarza” i „Kopiuj jako tekst”, f6291d8f)
- Wykonanie D-317 (docs/decyzje.md): czy kod robi dokładnie to, co decyzja (brioszka LM bez planu wszędzie: ekran receptury, lista, Stolnica, wznowienie zapisanego planu/sesji brioszki sprzed poprawki, harmonogram wsteczny, kalendarz; krok pieczenia w keksówce i na stali bez liczb spoza danych receptury dla wszystkich receptur poza brioszką i durum). Czy istnieje inna droga do planu brioszki (głęboki link, zapisany plan, import)?
- 09-lokalizacja, próbka regresji: commity d04c94ca, 3e05396e, f6291d8f, 2f4a260e, d5a6dc4c zmieniły 99 plików src/lib/i18n-slowniki/ i src/lib/i18n-en. Sprawdź nowe i zmienione klucze w 33 językach + en: komplet, parametry, liczba mnoga, brak polskiego/angielskiego tekstu w obcych słownikach, sens tłumaczenia odesłania do „O recepturze” (próbka co najmniej 8 języków, w tym ru, ja, ar/he jeśli są, de, es), sieroty po usuniętych tekstach brioszki; `npm run check:i18n` w WT (kod wyjścia do pliku).

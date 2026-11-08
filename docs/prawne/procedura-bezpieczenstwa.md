# Procedura: podatności, naruszenia ochrony danych i żądania RODO (Piekarz)

Stan 2026-11-08 (M8 Formalności; D-290, analogia z Treningiem — decyzja właściciela z 21.10.2026: bez prawnika, bezpieczniejsze opcje we własnym zakresie). Dokument krótki
z założenia: aplikacja nie ma serwera ani konta, dane użytkownika są tylko na jego urządzeniu; twórca przetwarza wyłącznie e-maile wysłane na adres wsparcia.

## 1. Podatność w aplikacji (CRA, rozporządzenie 2024/2847, art. 14 — stosowany od 11.09.2026)

Status: przyjmujemy, że aplikacja jest udostępniana „w ramach działalności handlowej” (sprzedaż subskrypcji, status przedsiębiorcy DSA) — art. 3 pkt 22;
bezpieczniejsza opcja zamiast konsultacji (decyzja 21.10.2026).

1. **Przyjęcie zgłoszenia:** adres wsparcia z polityki prywatności i strony wsparcia; zgłoszenie podatności ma pierwszeństwo przed innymi wiadomościami.
2. **Ocena (koordynator, ten sam dzień):** czy podatność jest *aktywnie wykorzystywana* (dowód użycia, nie tylko możliwość). Zapis w `docs/decyzje.md`
   (rejestr ryzyk) bez danych zgłaszającego.
3. **Aktywnie wykorzystywana → zgłoszenie przez jednolitą platformę sprawozdawczą (art. 16):** wczesne ostrzeżenie „w ciągu 24 godzin”, zgłoszenie
   „w ciągu 72 godzin” od uzyskania wiedzy (art. 14 ust. 1–2). Robi właściciel (agent przygotowuje treść). Adres platformy: [DO USTALENIA przy pierwszym
   użyciu — sprawdzić stronę ENISA w dniu zgłoszenia].
4. **Naprawa:** test odtwarzający → poprawka → TestFlight → wydanie (proces z `docs/wydanie/sklep.md`); informacja dla użytkowników w „Co nowego”.
5. **Pozostałe wymagania CRA** (od 11.12.2027) — poza zakresem 1.0; przegląd przed tą datą.

## 2. Naruszenie ochrony danych osobowych (RODO art. 33–34)

Dotyczy tylko danych u twórcy: skrzynka wsparcia (Google Workspace) i ewentualne notatki z opinii. Dane w aplikacji są na urządzeniu użytkownika.

1. **Przykłady:** przejęcie konta pocztowego, wysłanie wiadomości z danymi do złego adresu, wyciek arkusza opinii.
2. **Pierwsza godzina:** zabezpieczenie (zmiana hasła, wylogowanie sesji, cofnięcie dostępu), zapis: co, kiedy, ile osób, jakie dane.
3. **Ocena ryzyka:** jeśli naruszenie może skutkować ryzykiem dla osób → zgłoszenie do Prezesa UODO „nie później niż w terminie 72 godzin”
   od stwierdzenia (art. 33 ust. 1), formularzem na stronie UODO. Wysokie ryzyko → także zawiadomienie osób (art. 34).
4. **Rejestr naruszeń** (art. 33 ust. 5) — każde naruszenie, także niezgłoszone, w prywatnym zapisie właściciela (nie w publicznym repo).

## 3. Żądania osób (RODO art. 15–21)

1. Kanał: adres wsparcia. Odpowiedź bez zbędnej zwłoki, najpóźniej w miesiąc (art. 12 ust. 3).
2. Dostęp / usunięcie / sprostowanie / ograniczenie / sprzeciw: dotyczy wiadomości w skrzynce i notatek z opinii; dane w aplikacji użytkownik usuwa sam
   (Ustawienia → „Usuń wszystkie dane”, kopie zapasowe w aplikacji Pliki; albo usunięcie aplikacji) — twórca nie ma do nich dostępu.
3. Przechowywanie wiadomości: 12 miesięcy od zamknięcia sprawy (polityka prywatności).

## 4. Rejestr czynności przetwarzania (art. 30)

Ocena 21.10.2026 (Trening; ta sama skrzynka i to samo przetwarzanie dla Piekarza): przetwarzanie e-maili wsparcia jest sporadyczne i bez danych szczególnych, ale ciągłe w czasie — bezpieczniejsza opcja: krótki
rejestr jednej czynności („obsługa wiadomości do wsparcia”: cel, podstawa, kategorie danych, odbiorcy, przekazanie, okres) prowadzony prywatnie przez
właściciela; wzór — polityka prywatności, sekcja „Gdy do nas piszesz”.

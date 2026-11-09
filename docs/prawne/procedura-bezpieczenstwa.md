# Procedura: podatności, naruszenia ochrony danych, żądania RODO i klucz App Store Connect (Piekarz)

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

## 5. Klucz App Store Connect: unieważnienie i wymiana (D-314, M1-audytor-generalny-082)

Stan 2026-11-09. Jeden klucz zespołu App Store Connect API, wspólny dla Piekarza i Napar (`docs/TESTFLIGHT_DEPLOYMENT.md:43`). Rola: tyle, ile wymaga
podpis w chmurze przy eksporcie w `testflight.yml` (`-allowProvisioningUpdates`); Apple: „Upload builds” dla App Manager i Developer
„Requires access to Certificates, Identifiers & Profiles”, a roli klucza zespołu nie da się zmienić: „Once you generate an API key, you can’t edit its
name or access level. If you need to make changes, revoke the key and generate a new one.” (developer.apple.com/help/account/access/roles/ i
developer.apple.com/help/app-store-connect/get-started/app-store-connect-api/, odczyt 2026-11-09). Klucz zespołu działa dla wszystkich aplikacji zespołu
(„Team API keys are applied across all apps”), więc wyciek dotyczy obu aplikacji naraz. W workflowach tego repo klucz czytają tylko
zadania w środowisku `release` (akceptuje właściciel) i przebiegi tylko do odczytu: na sucho w `asc-ustawienia.yml` i `asc-zgloszenie.yml` oraz
`asc-kontrola.yml`. Zasięg samego sekretu jest szerszy: sekrety są na poziomie repozytorium (przebiegi na sucho i kontrola biegną bez środowiska),
więc dostaje je każdy workflow uruchomiony przez osobę z prawem zapisu, także z innej gałęzi ze zmienionym kodem. Dziś prawo zapisu ma tylko
właściciel; nowy współpracownik z prawem zapisu = przegląd tego punktu (znalezisko 082-N3, opcje: ograniczyć gałęzie, osobny klucz tylko do odczytu).

0. **Warunek ochrony (przed pierwszym przebiegiem z `release`):** GitHub → Settings → Environments → `release`: Required reviewers = właściciel,
   Deployment branches = tylko `master`. Jeśli środowiska nie ma, GitHub utworzy je przy pierwszym użyciu **bez reguł** i build albo zapis ruszy bez
   akceptacji — żaden test w repo tego nie wykryje. Po każdej zmianie ustawień środowiska sprawdź je ponownie w tym samym miejscu.

1. **Kiedy unieważnić (od razu, bez czekania na pewność):** podejrzenie wycieku pliku `.p8` albo sekretu (plik poza menedżerem haseł, zgubiony
   komputer, alert skanowania sekretów GitHub); identyfikator albo treść klucza w logu przebiegu, artefakcie, zrzucie ekranu, commicie lub zgłoszeniu;
   odejście współpracownika, który miał dostęp do sekretów repozytoriów albo do pliku klucza; przebieg z kluczem, którego właściciel nie uruchamiał
   (np. prośba o akceptację w środowisku `release`, której się nie spodziewał); nieznana aktywność w App Store Connect (build, zmiana metadanych, cen, użytkowników).
2. **Unieważnienie (właściciel, App Store Connect, rola Account Holder albo Admin):** Users and Access → Integrations (otwiera się App Store Connect API)
   → Team Keys → Edit → zaznacz klucz → Revoke Key → Revoke. Apple: „An API key can't be reinstated once it's been revoked.” Zapisz datę i godzinę.
3. **Nowy klucz:** w tym samym miejscu „+” (Generate API Key), nazwa z datą, rola jak wyżej; plik `.p8` pobiera się jeden raz („can only be downloaded
   once”) — od razu do menedżera haseł, nigdy do repozytorium ani na czat.
4. **Wymiana sekretów w obu repozytoriach, które dzielą klucz — Piekarz i Napar** (GitHub → Settings → Secrets and variables → Actions):
   `ASC_KEY_ID`, `ASC_ISSUER_ID` (issuer zwykle bez zmian), `ASC_KEY_P8_BASE64` (base64 pliku `.p8`, czyta `testflight.yml`, `asc-ustawienia.yml`,
   `asc-zgloszenie.yml`) i `ASC_KEY_P8` (surowa treść pliku `.p8`, czyta `asc-kontrola.yml` przez workflow wspólny studia). Sekretu, który zostaje
   ze starym kluczem, nie zostawiaj: usuń go albo nadpisz. Jeśli sekrety są na poziomie konta lub organizacji, wymiana tam obejmuje oba repozytoria.
5. **Sprawdzenie po wymianie:** w Piekarzu Actions → „ASC kontrola ustawień” → Run workflow (`asc-kontrola.yml`, tylko odczyt): przebieg bez błędu
   „BŁĄD” odczytu potwierdza nowy klucz; to samo w Napar jego odpowiednikiem. Stary klucz w sekcji „Revoked” strony App Store Connect API.
6. **Okno ekspozycji (zasada roli 10):** od chwili możliwego ujawnienia (`git log -S` przy commicie, data logu albo odejścia) do unieważnienia;
   w tym oknie właściciel przegląda w App Store Connect buildy TestFlight, zmiany metadanych i cen oraz listę użytkowników obu aplikacji. Wynik do
   `docs/wydanie/dziennik.md`; aktywność, której nikt nie zlecił, to incydent (sekcja 1 i moduł incydentu roli 12).

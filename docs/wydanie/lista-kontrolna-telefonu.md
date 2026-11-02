# Lista kontrolna wydania na telefonie — Piekarz

Stan: 2026-11-02 (noc, do weta; D-125). Wzór: `trening`, `docs/39-lista-kontrolna-wydania.md`, ale **pisana ręcznie**: Piekarz nie ma katalogu przepływów, z którego dałoby się ją generować `[DO USTALENIA: rola 07 może wprowadzić generator]`. Dlatego ten plik trzeba poprawiać razem z `.maestro/` i testami.

Co to jest: rzeczy, których nie sprawdzi żaden automat (Jest, interpreter Maestro w pamięci, E2E na symulatorze iOS w `e2e-ios.yml`), bo wymagają prawdziwego telefonu: ekran blokady, powiadomienia, wibracje, zakupy StoreKit, Dynamic Type AX5, VoiceOver, okna systemowe. Wszystko inne sprawdzają `npm run verify` i E2E. Całość na jednym telefonie z TestFlight: ok. 30–40 min.

Zasada: odhacz każdy punkt dla buildu, który wypuszczasz (zapisz numer buildu i datę w `docs/wydanie/dziennik.md`). Wada: wiadomość do agenta z numerem punktu (np. „PH-05”). Testuje tylko właściciel, na danych testowych (CLAUDE.md, „Stan projektu”).

Pole „Dlaczego nie automat” wskazuje brak w CI. Pole „Zastępcze pokrycie” to testy, które chronią logikę, ale nie sprawdzają urządzenia. Nazwy plików testów sprawdź w repo przy odhaczaniu; lista nie jest generowana `[DO USTALENIA]`.

## 1. Instalacja i start (PH-01…PH-03)

- [ ] **PH-01** Instalacja z TestFlight: ikona, nazwa „Piekarz”, ekran startowy, brak komunikatu o błędzie danych. Dlaczego nie automat: podpis i ikona istnieją dopiero w buildzie TestFlight.
- [ ] **PH-02** Aktualizacja z poprzedniego buildu (dane na miejscu: wypieki, zakwas, receptury). Dlaczego nie automat: baza prawdziwej instalacji. Zastępcze: scenariusze `.maestro/aktualizacja-przygotuj.yaml`, `aktualizacja-sprawdz.yaml` (interpreter w pamięci, nie urządzenie).
- [ ] **PH-03** Start bez ekranu Pro i bez prośby o zakup (Basic): pierwsze uruchomienie prowadzi do „Dziś”, ekran Pro pojawia się tylko po stuknięciu funkcji z oznaczeniem „Pro” albo w Ustawieniach. Zastępcze: `.maestro/e2e-basic/01-start-bez-ekranu-pro.yaml` (symulator).

## 2. Główna praca: wypiek z sygnałem przy zablokowanym telefonie (PH-04…PH-08)

- [ ] **PH-04** Wypiek na Stolnicy: ustaw przykładową recepturę, zacznij wypiek, przejdź krok z czasem (np. krótki test), **zablokuj ekran**: w chwili końca kroku powiadomienie, dźwięk i wibracja; stuknięcie otwiera właściwy krok. Dlaczego nie automat: baner, ekran blokady i haptyka są poza aplikacją i symulatorem. Zastępcze: `.maestro/e2e/02-wypiek-na-stolnicy.yaml`, `03-prowadzenie-widok-skupiony.yaml` (widok, nie sygnał).
- [ ] **PH-05** Ten sam wypiek po zamknięciu aplikacji (przesunięcie z widoku wielozadaniowości) i po 30 min: sygnał kroku dochodzi, a powrót do aplikacji wraca do trwającego wypieku (NFR-CZAS-001, BR-ETAP-005; zaległy od roli 01, `docs/sztafeta.md`). Dlaczego nie automat: potrzebny prawdziwy czas i system.
- [ ] **PH-06** Dwa wypieki naraz (Pro): powiadomienia obu przychodzą osobno, z właściwą nazwą wypieku, i nie nadpisują się. Zastępcze: `.maestro/e2e/05-dwa-wypieki.yaml` (widok).
- [ ] **PH-07** Odmowa powiadomień w systemie: aplikacja mówi, że sygnał nie zadziała, i nie udaje, że tak. Dlaczego nie automat: zgoda systemowa jest oknem iOS.
- [ ] **PH-08** Tryb cichy i skupienie systemu: sygnał kroku zgodny z oczekiwaniem (zapisz, co się dzieje: dźwięk, wibracja, tylko baner). Wynik opisowy `[DO USTALENIA]`: kryterium decyduje właściciel.

## 3. Plan wstecz i kalendarz (PH-09…PH-11)

- [ ] **PH-09** Plan wstecz z ochroną snu (Pro): godzina „gotowe” rano, kroki nocne przesunięte poza ustawioną noc; czasy zgodne z temperaturą. Zastępcze: testy logiki harmonogramu (`npm test`).
- [ ] **PH-10** „Dodaj do kalendarza” → plik `.ics` przez arkusz udostępniania → import do Kalendarza iOS: zdarzenia mają właściwe godziny w strefie telefonu (poprawka TZ `5125bcd`). Zmiana planu po dodaniu: aplikacja mówi, że wydarzenie w kalendarzu się nie zmieniło. Dlaczego nie automat: arkusz udostępniania i Kalendarz to aplikacje systemowe. Dodatkowo `tests-tz.yml` sprawdza strefy.
- [ ] **PH-11** Zmiana strefy czasowej telefonu w trakcie trwającego wypieku: plan i sygnały dalej na właściwe godziny `[DO USTALENIA: oczekiwany wynik wg rozstrzygnięcia roli 08]`.

## 4. Dane: kopia i przywracanie (PH-12…PH-14)

- [ ] **PH-12** Eksport kopii zapasowej przez arkusz udostępniania (Zapisz w Plikach), „Wyczyść dane” (powstaje kopia `piekarz-przed-czyszczeniem-*`), import tej kopii: dane identyczne (wypieki, zakwas, receptury). **Najważniejszy punkt listy: utrata danych ma pierwszeństwo.** Dlaczego nie automat: Pliki i arkusz udostępniania to okna systemowe. Zastępcze: `src/lib/__tests__/backup.test.ts`, `src/data/__tests__/auto-backup.sqlite.test.ts`.
- [ ] **PH-13** Po ponownej instalacji aplikacji: kopia z Plików przywraca dane; Pro wraca dopiero po „Przywróć zakupy” (kopia danych nie niesie zakupów; pamięć dostępu jest poza kopią, `docs/monetyzacja.md`).
- [ ] **PH-14** Tryb samolotowy przez cały test PH-04…PH-12: aplikacja działa bez zmian (zasada offline-first); brak ekranów „brak sieci” poza zakupem i przywracaniem.

## 5. Zakupy StoreKit w piaskownicy (PH-20…PH-24)

Konto sandbox tylko w ustawieniach telefonu, hasła nie trafiają do repo. Sprawdź, że **arkusz Apple nie pokazuje oferty wprowadzającej** (Z-1 wykonane w ASC); jeśli pokazuje, zatrzymaj test i wpisz do dziennika.

- [ ] **PH-20** Kup każdy plan po kolei (miesięczny, roczny, dożywotni; produkty z `docs/monetyzacja.md`): po zakupie ekran Pro/Ustawienia pokazują aktywny dostęp, funkcje „Pro” się odblokowują. Dlaczego nie automat: okna zakupu Apple; build E2E ma sztuczny sklep.
- [ ] **PH-21** Usuń aplikację, zainstaluj ponownie: bez zakupów widać Basic; „Przywróć zakupy” przywraca Pro (tylko na żądanie).
- [ ] **PH-22** Tryb samolotowy po zakupie: dostęp zostaje (decyzja z pamięci, ważna najwyżej do końca opłaconego okresu); zakup i przywracanie mówią, że wymagają połączenia.
- [ ] **PH-23** Zwrot albo anulowanie w piaskownicy: dane zostają, funkcje Pro wracają do stanu „Pro”, uprzedzenie o końcu Pro bez odliczania i „ostatniej szansy” (D-113); przypomnienia o dokarmianiu ustają (uprzedzone w tekście).
- [ ] **PH-24** Family Sharing, Ask to Buy, karencja (jeśli sandbox pozwala; inaczej `[DO USTALENIA]`: sprawdzenie dopiero po wydaniu) oraz limity Basic: 6. własna receptura i 2. zakwas zablokowane tylko jako **dodanie**, zapisane działają w całości.

## 6. Dostępność i wygląd (PH-25…PH-29)

- [ ] **PH-25** Dynamic Type AX5 na najmniejszym dostępnym ekranie (iPhone SE lub symulacja 320 pt, jeśli właściciel nie ma SE): ekrany „Dziś”, Stolnica, krok wypieku, receptury, ekran Pro, Ustawienia: nic nie ucięte, wszystkie przyciski osiągalne. Dlaczego nie automat: CLAUDE.md §1.4: brak automatu na szerokość 320 pt i AX5.
- [ ] **PH-26** VoiceOver: przejście „Dziś” → Stolnica → start wypieku → krok → koniec; etykiety zrozumiałe, kolejność czytania logiczna, przycisk „Zamknij” ekranu Pro osiągalny (poprawka `0a4f12b`: pod paskiem stanu).
- [ ] **PH-27** Pole dotyku 44×44 pt: kontrolna próba kciukiem na przyciskach krok/pauza/dalej i na przełącznikach w Ustawieniach (CLAUDE.md §1.4: automat sprawdza tylko styl `minHeight`).
- [ ] **PH-28** Gesty: przesunięcie kroku, cofnięcie, przewijanie arkusza dnia; klawiatura numeryczna: wpisanie liczby z przecinkiem i z kropką w polach receptury (`NumInput`; CLAUDE.md zapisuje, że `app/` go dziś nie używa — jeśli pole odrzuca przecinek, wpisz wadę `PH-28`).
- [ ] **PH-29** Tryb ciemny i „Pogrubiony tekst”: kontrast i czytelność ekranów z PH-25.

## 7. Treści (PH-30…PH-32)

- [ ] **PH-30** Ustawienia → „Źródła wiedzy” (D-123): wstęp i 6 grup, 26 źródeł z nazwą, opisem i adresem jako zwykły tekst (bez odnośnika); ekran zamyka się w tym samym arkuszu, działa bez sieci. Poza tym ekranem teksty aplikacji nie wymieniają nazw źródeł (przypisów „według …” nie ma). Zastępcze: `tests/zrodla-poza-ekranem-t2.test.ts`.
- [ ] **PH-31** Trzy twierdzenia krytyczne po przeglądzie 2026-11-02 (zakwas: ZAK-HOO-001, Doktor: DOK-PIE-002, surowe produkty: BEZ-SUR-001): brzmią naturalnie i bezpiecznie na ekranie. Zastępcze: `docs/tresci/przeglad/t2-d123-2026-11-02.md`.
- [ ] **PH-32** Język telefonu inny niż PL/EN (np. de-DE, ja): kontrola 5 ekranów pod kątem ucięć i niedotłumaczeń. Teksty z przebiegu a5d są wpięte (175 × 33 języki); niedotłumaczone zostają EN (`docs/lokalizacja/`).

## Po teście

Wynik wpisz w `docs/wydanie/dziennik.md` (kolumna „Wynik”: build, data, lista wad z numerami PH). Wada z PH-04, PH-05, PH-12, PH-20…PH-23 blokuje wysłanie do recenzji; pozostałe oceń wg realności (realny / brzegowy / teoretyczny) z agentem.

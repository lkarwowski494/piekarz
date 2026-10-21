# Plan wydania iOS — Piekarz

Decyzja: **DEC-16 (a)**, właściciel 2026-10-19: „Wydanie ręczne po TestFlight, dziennik wydania, strona produktu zaczyna od głównej pracy i prywatności”. Odrzucona: (b) wydanie automatyczne po zatwierdzeniu. Zadanie M1-audytor-generalny-079 (10-wydanie-009). Dziennik: `docs/wydanie/dziennik.md`.

*Dlaczego ręcznie:* aplikacja nie ma sieci ani zdalnego wyłącznika, więc zły build wycofuje tylko nowa wersja; ręczne wydanie daje ostatnią kontrolę po zatwierdzeniu przez Apple.

Ten plik nie zawiera tekstów ani pól sklepu; prowadzi tylko drogę wersji. Pola App Store Connect krok po kroku (produkty, ceny, dostępność, App Privacy, wiek, szyfrowanie, notatki dla App Review): `docs/wydanie/instrukcja-ustawien.md`; pola każdej z 34 lokalizacji: karty `docs/wydanie/ustawienia/` z metadanych `docs/wydanie/metadane/`; teksty źródłowe PL i angielskie: `docs/app-store-metadata-v2.md`. Adresy i sekrety CI: `docs/15-app-store.md`. Mechanika TestFlight: `docs/TESTFLIGHT_DEPLOYMENT.md`.

## 1. Konfiguracja, na której stoi plan (stan 2026-10-20, nie zmieniać tym planem)

| Element | Wartość | Gdzie | Zadanie |
|---|---|---|---|
| Wersja | `expo.version` (dziś 1.0.0), zmieniana świadomie commitem | `app.json` | 077 |
| Numer buildu | tylko workflow: BUILD_BASE (1000) + GITHUB_RUN_NUMBER; `app.json` bez `buildNumber`, `eas.json` bez `autoIncrement` | `.github/workflows/testflight.yml`, krok „Compute & set monotonic build number” | 077 |
| Minimalny system | iOS 18.0 (`ios.deploymentTarget`); opis wymagań w sklepie bierze się z buildu | `app.json` | 077 |
| Kanał testowy | każdy tag `v*` albo ręczne „Run workflow” na commicie z master → przesłanie do TestFlight; po sukcesie tag `vX.Y.Z-bNNNN` | `.github/workflows/testflight.yml` | — |
| Mapy źródeł JS | artefakt `testflight-sourcemap-<wersja>-b<build>`, 90 dni | ten sam workflow | 068 |
| Uprawnienia | tylko powiadomienia lokalne; bez aparatu (expo-camera wykluczony z autolinkingu, QR PÓŹNIEJ) | `app.json`, `package.json` | 049 |
| Języki | 35 języków z `src/lib/i18n-locales.ts` (`released`, `supportedLocales`) | `app.json` | 073, 093 |
| Notatki dla App Review | po angielsku | `docs/app-store-metadata-v2.md` §4.3 | 078 |
| Wysyłka do recenzji i wydanie | **nie są zautomatyzowane**: workflow kończy się na TestFlight, `eas.json` bez `autoSubmit` (test `tests/plan-wydania.test.ts`) | — | 079 |

## 2. Droga wersji (każdy krok w sklepie to krok właściciela za zgodą na ten build)

1. **Kandydat:** commit na master; rola 07 daje werdykt na tym SHA. Bez werdyktu innego niż ZABLOKOWANE nie ma kroku 4.
2. **TestFlight:** właściciel uruchamia workflow (tag `v*` albo „Run workflow”). Wpis w dzienniku: data, wersja, build, SHA, kanał TestFlight.
3. **Testy na telefonie:** testerzy wewnętrzni, potem zewnętrzni (TestFlight). Warunki z raportu 07, np. aktualizacja z poprzedniego buildu z danymi na telefonie i przejście VoiceOver Stolnicy. Wynik w kolumnie „Wynik” dziennika.
4. **Lista przed wysyłką** (każdy punkt z dowodem, wynik w dzienniku):
   1. build = SHA z werdyktu 07, warunki wysyłki spełnione; wersja i numer z jednego źródła (tabela wyżej);
   2. `sprawdz-wydanie.mjs` (`metadane`, `prywatnosc`, `sekrety --historia`) z kodem 0; zrzuty w wymaganych klasach;
   3. teksty `docs/app-store-metadata-v2.md` zgodne z tą wersją i kontraktem zakresu (D-043), etykieta App Privacy = inwentarz prywatności;
   4. adres polityki prywatności i wsparcia odpowiadają kodem 200 (`curl -sSI`), notatki dla App Review, produkty zakupów dołączone do wersji (pierwszy zakup danego typu idzie z nową wersją);
   5. zgoda właściciela na wysyłkę tego buildu wpisana do dziennika jego słowami.
5. **Wysłanie do recenzji** z opcją **„Manually release this version”** (krok 6.2).
6. **Wydanie:** po statusie „Pending Developer Release” właściciel klika „Release This Version” (krok 6.3); zgoda na wydanie osobno w dzienniku.
7. **Aktualizacje (1.0.1 i dalej):** ta sama droga plus wydanie stopniowe 7 dni (krok 6.4). Pierwsza wersja 1.0 idzie do wszystkich naraz: Apple oferuje wydanie stopniowe tylko dla aktualizacji („When you release a version update…”), więc ryzyko 1.0 ogranicza krok 3.

## 3. Blokady przed pierwszą wysyłką do recenzji (stan 2026-10-21)

| Blokada | Dowód | Kto odblokowuje |
|---|---|---|
| Werdykt 07: ZABLOKOWANE na ebd8471, 1.0.0 (1013) | raport roli 07 z 2026-10-19 (audyt M1) | naprawy partii M2, nowy werdykt 07 na nowym SHA |
| Kontrakt zakresu B (D-043): QR (F-08), druk (F-50), spiżarnia (F-30) PÓŹNIEJ; strona produktu bez nich | M1-audytor-generalny-080, -081 (partia 6) | rola 10 w zadaniu 081, zrzuty 080 |
| Minimalny iOS 18.0 | `app.json` (077) | spełnione; nic nie zmieniać |

Polityka prywatności i strona wsparcia (adresy z `docs/15-app-store.md`) odpowiadały kodem 200 w dniu 2026-10-21; przed wysyłką sprawdza je punkt 4.4 drogi wersji.

## 4. Zły build: plan

Zły build to awaria, utrata lub uszkodzenie danych, zły wynik obliczeń albo zakup, który nie działa. Decyduje i działa właściciel (praca solo); utrata danych ma pierwszeństwo przed wszystkim.

| Kiedy | Co zrobić | Źródło |
|---|---|---|
| W TestFlight | nie wysyłać do recenzji; zatrzymać testy tego buildu w TestFlight (sposób w pomocy TestFlight `[DO USTALENIA]`); poprawka i nowy build | — |
| Zatwierdzony, „Pending Developer Release” | nie wydawać; po przypadkowym „Release This Version” użyć „Cancel This Release” na stronie wersji, dopóki się da | Apple, „Select an App Store version release option” |
| Aktualizacja w wydaniu stopniowym | „Pause Phased Release” (łącznie do 30 dni przerwy), poprawka jako nowa wersja | Apple, „Release a version update in phases” |
| Wydana do wszystkich | poprawka jako nowa wersja tą samą drogą (TestFlight → 07 → recenzja); przyspieszona recenzja tylko przy utracie danych albo awarii głównej pracy; zdjęcie ze sprzedaży tylko przy ryzyku utraty danych nowych instalacji `[DO USTALENIA]` | moduł „incydent i poprawka” roli 12 |

Po każdym incydencie: wpis w dzienniku (build, objaw, decyzja, słowa właściciela). Mapa źródeł JS tego buildu jest w artefakcie workflow (90 dni). Reset oceny przy aktualizacji: decyzja przy pierwszej aktualizacji, po przeczytaniu pomocy App Store Connect w dniu wydania `[DO USTALENIA]`.

## 5. „Co nowego” dla aktualizacji

Z listy scalonych zmian (`git log <poprzedni tag>..<kandydat>`); każde zdanie ma commit w dzienniku, nie w sklepie; bez zmyślonych próśb i liczb bez pomiaru; istotne zmiany wymienione (2.3.12) i opisane w notatkach dla App Review (2.3.1(a)). Wersja 1.0 nie ma pola „Co nowego”.

## 6. Kroki właściciela w App Store Connect

Rola wymagana przez Apple: Account Holder, Admin albo App Manager. Każdy krok za zgodą na ten build, zapis w dzienniku.

1. **Teksty i formularze:** według `docs/wydanie/instrukcja-ustawien.md`; pola każdej lokalizacji z kart `docs/wydanie/ustawienia/` (34 lokalizacje strony), adresy z `docs/15-app-store.md` po sprawdzeniu kodu 200.
2. **Opcja wydania:** Apps → Piekarz → wersja → sekcja „App Store Version Release” → zaznaczyć „Manually release this version” → Save. Potem wysłanie do recenzji (nazwę przycisku sprawdzić w dniu wysyłki).
3. **Wydanie:** po e-mailu o zatwierdzeniu: wersja ze statusem „Pending Developer Release” → „Release This Version” → „Confirm”. Pojawienie się w sklepie może potrwać do 24 h. Apple przypomina e-mailem po 30 dniach w tym statusie.
4. **Aktualizacje:** przed wysłaniem do recenzji: sekcja „Phased Release for Automatic Updates” → „Release update over a 7-day period using phased release” → Save. Przerwanie: wersja „Ready for Distribution” → „Pause Phased Release” → Save; dokończenie: „Release to All Users”.

Źródła (odczyt surowego tekstu 2026-10-20): developer.apple.com/help/app-store-connect/manage-your-apps-availability/select-an-app-store-version-release-option; developer.apple.com/help/app-store-connect/update-your-app/release-a-version-update-in-phases. Nazwy przycisków przeczytać ponownie w dniu wydania.

# Akapit „Dostęp i zakup”: kontrola nowych zdań o odnawianiu i przywracaniu metodą tłumaczenia zwrotnego (2026-11-10)

Kontroler: niezależny subagent, który tych tekstów nie tłumaczył. **To przegląd modelu, nie rodzimego użytkownika języka.** Tylko raport, teksty bez zmian.

## Wejście
- Akapit „Dostęp i zakup” 34 lokalizacji (jedna linia na lokalizację), zestawiony z `docs/wydanie/metadane/<kod>.json` (pole `opis`); w każdej lokalizacji sprawdzono, że ta linia występuje w `opis` dosłownie.
- Oryginał: lokalizacja `pl`. Nowe są dwa ostatnie zdania: (A) automatyczne odnawianie i anulowanie w Ustawieniach (imię → Subskrypcje), (B) przycisk „Przywróć zakupy” na nowym iPhonie. Zmienione: en-* zdanie 1 („Basic is free forever, with no trial period.”), ms zdanie 3 (dożywotni: „untuk akses seumur hidup”), ko zdanie 3 (szyk „App Store에서” przed obiema formami zakupu).
- Kontrakt: `docs/monetyzacja.md`, „Kontrakt płatności”, „Reguły dostępu” (Przywracanie; Zarządzanie i anulowanie), „Ujawnienia dla roli 04” pkt 2–4 i punkt „Metadane sklepu (rola 10)”.
- Etykieta przycisku: klucz `'Przywróć zakupy'` w `src/lib/i18n-slowniki/<język>/*.ts` (de-DE→de, es-ES→es, es-MX→es-419, fr-*→fr, nl-NL→nl, no→nb, pt-PT→pt) i `src/lib/i18n-en/czesc-3.ts`.

## Metoda
1. Tłumaczenie zwrotne na polski zdań A i B każdej lokalizacji oraz zmienionych zdań en-* (1), ms (3) i ko (3); dosłownie, bez wygładzania, z formą zwracania się w nawiasie kwadratowym (dodatek niżej).
2. Porównanie z oryginałem PL i kontraktem w punktach: (c) subskrypcja odnawia się automatycznie do anulowania; (f) anulowanie i zarządzanie w Ustawieniach (imię → Subskrypcje); (g) przywracanie przyciskiem w aplikacji, etykieta zgodna ze słownikiem aplikacji; (e) dożywotni bez odnowienia nie jest przekłamany; (i) brak obietnic sprzecznych z kontraktem (próba, rabat, cena).
3. Etykieta (g) sprawdzona skryptem: etykieta ze słownika występuje dosłownie w zdaniu B we wszystkich 33 lokalizacjach. Nazwy „Ustawienia” i „Subskrypcje” porównane z nazwami ekranów iOS w danym języku (wiedza modelu, bez dostępu do urządzenia).
4. Forma zwracania się: forma nowych zdań porównana z formą pierwszego akapitu i akapitów instruktażowych pełnego `opis` tej lokalizacji. Cudzysłowy i apostrofy porównane ze znakami użytymi w tym samym `opis` (np. przy „Piecz ponownie”).
5. Wagi: P1 = przekłamanie kontraktu albo obietnica sprzeczna; P2 = brak informacji z (c)/(f)/(g) albo zła etykieta; P3 = styl, forma, cudzysłów. Uwagi bez wagi (U-n) to drobiazgi, które nie wymagają zmiany.

## Wynik w skrócie
- **P1: 0.** Żadna lokalizacja nie mówi, że zakup dożywotni się odnawia (zdanie A wszędzie ma podmiot „subskrypcja”), nie obiecuje próby, rabatu ani ceny.
- **P2: 0.** We wszystkich 33 lokalizacjach jest (c) automatyczne odnawianie do anulowania, (f) droga Ustawienia → imię → Subskrypcje i (g) przycisk w aplikacji z etykietą identyczną jak w słowniku aplikacji.
- **P3: 10** (R-1 … R-10), w 12 lokalizacjach: sl (2), nl-NL (2), pt-PT, id, fr-FR i fr-CA (jedna wspólna), it, en-AU/en-CA/en-GB/en-US (jedna wspólna), sv.
- **Forma zwracania się:** zgodna z resztą opisu w 32 lokalizacjach; rozjazd tylko w **sl** (opis „vi”, nowe zdania „ti”, R-1). Przyczyna: zdanie A jest wzięte ze słownika aplikacji (`src/lib/i18n-slowniki/sl/czesc-6.ts`), który mówi na „ti”.
- Zmienione zdania: en-* zdanie 1 zgodne z PL i z `docs/monetyzacja.md` („no trial” jak w PL, zamyka R-1 z Z-8); ms zdanie 3 mówi teraz wprost o dostępie dożywotnim (zamyka R-2 z Z-8); ko zdanie 3 ma „App Store에서” przed obiema formami (zamyka R-3 z Z-8; drobna uwaga U-3 o czasowniku).
- Luki G-1 i G-2 z Z-8 (`docs/dowody-09-z8/tlumaczenie-zwrotne.md`) są zamknięte we wszystkich 34 lokalizacjach.

## Tabela: lokalizacja × punkty

Legenda: OK = sens zgodny z oryginałem PL i z kontraktem; R-n = rozbieżność z wagą (tabela niżej); U-n = uwaga bez wagi. Kolumna „forma”: forma opisu / forma nowych zdań.

| lokalizacja | (c) auto-odnawianie | (f) anulowanie: Ustawienia → imię → Subskrypcje | (g) przywracanie, etykieta = słownik | (e) dożywotni bez odnowienia | (i) brak obietnic sprzecznych | forma | inne |
|---|---|---|---|---|---|---|---|
| cs | OK | OK | OK | OK | OK | OK (vy) | — |
| da | OK | OK | OK | OK | OK | OK (du) | — |
| de-DE | OK | OK | OK | OK | OK | OK (du) | U-1 (uwaga) |
| el | OK | OK | OK | OK | OK | OK (εσείς) | — |
| en-AU | OK | OK | OK (etykieta bez cudzysłowu: R-9) | OK | OK | OK (you) | zdanie 1 OK, R-9 |
| en-CA | OK | OK | OK (etykieta bez cudzysłowu: R-9) | OK | OK | OK (you) | zdanie 1 OK, R-9 |
| en-GB | OK | OK | OK (etykieta bez cudzysłowu: R-9) | OK | OK | OK (you) | zdanie 1 OK, R-9 |
| en-US | OK | OK | OK (etykieta bez cudzysłowu: R-9) | OK | OK | OK (you) | zdanie 1 OK, R-9 |
| es-ES | OK | OK | OK | OK | OK | OK (tú) | — |
| es-MX | OK | OK | OK | OK | OK | OK (tú) | — |
| fi | OK | OK | OK | OK | OK | OK (sinä) | U-4 (uwaga) |
| fr-CA | OK | OK | OK | OK | OK | OK (vous) | R-7 |
| fr-FR | OK | OK | OK | OK | OK | OK (vous) | R-7 |
| hr | OK | OK | OK | OK | OK | OK (ti) | — |
| hu | OK | OK | OK | OK | OK | OK (te) | — |
| id | OK | OK | OK | OK | OK | OK (Anda) | R-6 |
| it | OK | OK | OK | OK | OK | OK (tu) | R-8 |
| ja | OK | OK | OK | OK | OK | OK (です・ます) | — |
| ko | OK | OK | OK | OK | OK | OK (해요체; „탭하세요” to zwykła grzeczna prośba w tym samym rejestrze) | zdanie 3 OK, U-3 (uwaga) |
| ms | OK | OK | OK | OK | OK | OK (anda) | zdanie 3 OK |
| nl-NL | OK | OK | OK | OK | OK | OK (je) | R-3, R-4 |
| no | OK | OK | OK | OK | OK | OK (du) | — |
| pt-BR | OK | OK | OK | OK | OK | OK (você) | — |
| pt-PT | OK | OK | OK | OK | OK | OK (3. os., „o senhor/você”) | R-5 |
| ro | OK | OK | OK | OK | OK | OK (tu) | — |
| ru | OK | OK | OK | OK | OK | OK (вы) | U-2 (uwaga) |
| sk | OK | OK | OK | OK | OK | OK (vy) | — |
| sl | OK | OK | OK | OK | OK | **R-1, P3** (vi / ti) | R-2 |
| sv | OK | OK | OK | OK | OK | OK (du) | R-10 |
| tr | OK | OK | OK | OK | OK | OK (siz) | — |
| uk | OK | OK | OK | OK | OK | OK (ви) | — |
| vi | OK | OK | OK | OK | OK | OK (bạn) | — |
| zh-Hant | OK | OK | OK | OK | OK | OK (你) | — |

## Rozbieżności

| ID | lokalizacja | cytat | tłumaczenie zwrotne | problem | propozycja | waga |
|---|---|---|---|---|---|---|
| R-1 | sl | „dokler je ne prekličeš: v Nastavitvah tapni … »Obnovi nakupe«” (zdania A i B) | „dopóki jej nie odwołasz [ti]: … stuknij [ti]” | Forma „ti”, a reszta opisu mówi na „vi” („Pek vas vodi”, „Izberete”, „podatke prenesete”). Zdanie A przejęte ze słownika aplikacji, który mówi na „ti”. | Naročnina se samodejno podaljšuje, dokler je ne prekličete: v Nastavitvah tapnite svoje ime in priimek, nato Naročnine. Na novem iPhonu v aplikaciji tapnite „Obnovi nakupe“. (Słownika aplikacji nie zmieniać: aplikacja ma własny rejestr.) | P3 |
| R-2 | sl | »Obnovi nakupe« | »Przywróć zakupy« | Cudzysłów »…« w opisie, który gdzie indziej używa „…“ („PRIPRAVLJENO“, „Speci znova“). | „Obnovi nakupe“ (już w propozycji R-1). | P3 |
| R-3 | nl-NL | ‘Herstel aankopen’ | ‘Przywróć zakupy’ | Pojedynczy cudzysłów, a reszta opisu ma „…” („KLAAR”, „Opnieuw bakken”). | „Herstel aankopen” | P3 |
| R-4 | nl-NL | Tik op een nieuwe iPhone in de app op ‘Herstel aankopen’. | Stuknij na nowym iPhonie [albo: w nowy iPhone] w aplikacji w ‘Herstel aankopen’. | Szyk: „Tik op een nieuwe iPhone” czyta się najpierw jako „stuknij w nowy iPhone”; dwa „op” w zdaniu. | Op een nieuwe iPhone tik je in de app op „Herstel aankopen”. | P3 |
| R-5 | pt-PT | “Restaurar compras” | “Przywróć zakupy” | Cudzysłów “…”, a reszta opisu pt-PT ma «…» («PRONTO», «Cozer novamente»), co jest typowe dla pt-PT. | «Restaurar compras» | P3 |
| R-6 | id | “Pulihkan Pembelian” | “Przywróć zakup” | Cudzysłów drukarski “…”, a reszta opisu id ma proste "…" ("SIAP", "Panggang lagi"). | Ujednolicić w całym opisie, najlepiej na “…” (zmiana "SIAP" i "Panggang lagi"), albo tu "Pulihkan Pembelian". | P3 |
| R-7 | fr-FR, fr-CA | L’abonnement … l’annuliez … l’app (obok d'essai, l'App Store w tym samym akapicie) | — | Apostrof drukarski ’ w nowych zdaniach, prosty ' we wcześniejszych zdaniach tego samego akapitu. | Ujednolicić w całym opisie na ’ (typowe dla francuskiej typografii): d’essai, l’entretien, l’App Store. | P3 |
| R-8 | it | nell’app (obok sull'App Store, L'abbonamento w tym samym akapicie) | — | Mieszany apostrof: ’ w „nell’app”, ' w „sull'App Store” i „L'abbonamento”. | Ujednolicić w całym opisie (np. wszędzie ’). | P3 |
| R-9 | en-AU, en-CA, en-GB, en-US | tap Restore Purchases in the app | stuknij Restore Purchases [Przywróć zakupy] w aplikacji | Etykieta przycisku bez cudzysłowu, a ten sam opis cytuje etykietę „Bake Again” w "…"; oryginał PL ma „Przywróć zakupy” w cudzysłowie. Etykieta poprawna. | On a new iPhone, tap "Restore Purchases" in the app. | P3 |
| R-10 | sv | Pro är ett månads- eller årsabonnemang … Prenumerationen förnyas automatiskt | Pro to abonament miesięczny lub roczny … Prenumerata odnawia się automatycznie | Dwa słowa na tę samą rzecz w sąsiednich zdaniach (abonnemang / prenumeration); czytelnik może pomyśleć, że to różne rzeczy. „Prenumerationer” to nazwa w iOS i zostaje. | Zdanie 3: „Pro är en månads- eller årsprenumeration eller ett engångsköp för livstid i App Store.” | P3 |

### Uwagi bez wagi

| ID | lokalizacja | cytat | uwaga |
|---|---|---|---|
| U-1 | de-DE | Auf einem neuen iPhone tippe in der App auf „Käufe wiederherstellen“. | Tryb rozkazujący po okoliczniku na początku jest poprawny, ale mniej typowy. Gładsze byłoby: „Auf einem neuen iPhone tippst du in der App auf „Käufe wiederherstellen“.” Zmiana nie jest konieczna. |
| U-2 | ru | коснитесь … нажмите | Dwa czasowniki na „stuknij” w sąsiednich zdaniach. Apple w ru używa „коснитесь”; można ujednolicić: „коснитесь «Восстановить покупки»”. |
| U-3 | ko | Pro는 App Store에서 … 이용할 수 있어요 | 이용하다 = „korzystać”; Pro kupuje się w App Store, a używa w aplikacji. Dosłowniej: „구매할 수 있어요” (można kupić). Sens dla czytelnika jasny. |
| U-4 | fi | apissa | Słowo potoczne/Apple („appi”), a reszta opisu mówi „sovellus”. Apple w fi używa „appi”, więc poprawne; można ujednolicić na „sovelluksessa”. |

## Dodatek: tłumaczenia zwrotne wszystkich 33 lokalizacji

Akapity wygenerowane z pliku wejściowego (bez przepisywania ręcznego). Tłumaczenia zwrotne dosłowne, bez wygładzania; w nawiasach kwadratowych forma zwracania się i znaczenie etykiet. Oznaczenia: 1, 3 = zmienione zdanie 1 lub 3; A, B = nowe zdania.

#### pl (oryginał)

```
Basic jest darmowy na zawsze, bez okresu próbnego. Pro dodaje planowanie, opiekę nad zakwasem, więcej zakwasów i receptur. Pro to subskrypcja miesięczna lub roczna albo jednorazowy zakup dożywotni w App Store. Subskrypcja odnawia się sama, dopóki jej nie anulujesz: w Ustawieniach stuknij swoje imię i nazwisko, potem Subskrypcje. Na nowym iPhonie stuknij w aplikacji „Przywróć zakupy”.
```

#### cs

```
Basic je navždy zdarma, bez zkušební doby. Pro přidává plánování, péči o kvásek, více kvásků a receptů. Pro je měsíční nebo roční předplatné nebo jednorázový doživotní nákup v App Storu. Předplatné se obnovuje automaticky, dokud ho nezrušíte: v Nastavení klepněte na své jméno a potom na Předplatné. Na novém iPhonu klepněte v aplikaci na „Obnovit nákupy“.
```

- **A:** Subskrypcja (předplatné) odnawia się automatycznie, dopóki jej nie anulujecie [vy]: w Ustawieniach stuknijcie w swoje imię, a potem w Subskrypcję.
- **B:** Na nowym iPhonie stuknijcie [vy] w aplikacji w „Obnovit nákupy” [Przywróć zakupy].

#### da

```
Basic er gratis for altid, uden prøveperiode. Pro tilføjer planlægning, pleje af surdej, flere surdeje og opskrifter. Pro er et månedligt eller årligt abonnement eller et engangskøb med livstidsadgang i App Store. Abonnementet fornyes automatisk, indtil du annullerer det: Tryk på dit navn i Indstillinger, og tryk derefter på Abonnementer. På en ny iPhone skal du trykke på »Gendan køb« i appen.
```

- **A:** Abonament odnawia się automatycznie, aż go anulujesz [du]: Stuknij swoje imię w Ustawieniach, a potem stuknij Abonamenty.
- **B:** Na nowym iPhonie musisz stuknąć »Gendan køb« [Przywróć zakup] w aplikacji.

#### de-DE

```
Basic ist für immer kostenlos, ohne Probezeitraum. Pro bietet zusätzlich Planung, Sauerteigpflege sowie mehr Sauerteige und Rezepturen. Pro gibt es als Monats- oder Jahresabo oder als einmaligen Kauf auf Lebenszeit im App Store. Das Abo verlängert sich automatisch, bis du es kündigst: Tippe in den Einstellungen auf deinen Namen, dann auf „Abonnements“. Auf einem neuen iPhone tippe in der App auf „Käufe wiederherstellen“.
```

- **A:** Abo przedłuża się automatycznie, aż je wypowiesz [du]: Stuknij w Ustawieniach w swoje imię, potem w „Abonamenty”.
- **B:** Na nowym iPhonie stuknij w aplikacji w „Käufe wiederherstellen” [Przywróć zakupy].

#### el

```
Το Basic είναι δωρεάν για πάντα, χωρίς δοκιμαστική περίοδο. Το Pro προσθέτει προγραμματισμό, φροντίδα προζυμιού, περισσότερα προζύμια και συνταγές. Το Pro είναι μηνιαία ή ετήσια συνδρομή ή εφάπαξ αγορά εφ' όρου ζωής στο App Store. Η συνδρομή ανανεώνεται αυτόματα μέχρι να την ακυρώσετε: στις Ρυθμίσεις, αγγίξτε το όνομά σας και μετά Συνδρομές. Σε νέο iPhone, αγγίξτε «Επαναφορά αγορών» στην εφαρμογή.
```

- **A:** Subskrypcja odnawia się automatycznie, dopóki jej nie anulujecie [forma grzecznościowa]: w Ustawieniach dotknijcie swojego imienia, a potem Subskrypcje.
- **B:** Na nowym iPhonie dotknijcie «Επαναφορά αγορών» [Przywrócenie zakupów] w aplikacji.

#### en-AU

```
Basic is free forever, with no trial period. Pro adds planning, starter care, more starters and recipes. Pro is a monthly or yearly subscription or a one-time lifetime purchase on the App Store. The subscription renews automatically until you cancel it: in Settings, tap your name, then Subscriptions. On a new iPhone, tap Restore Purchases in the app.
```

- **1:** Basic jest darmowy na zawsze, bez okresu próbnego.
- **A:** Subskrypcja odnawia się automatycznie, dopóki jej nie anulujesz: w Ustawieniach stuknij swoje imię, potem Subskrypcje.
- **B:** Na nowym iPhonie stuknij Restore Purchases [Przywróć zakupy] w aplikacji. (Etykieta bez cudzysłowu.)

#### en-CA

```
Basic is free forever, with no trial period. Pro adds planning, starter care, more starters and recipes. Pro is a monthly or yearly subscription or a one-time lifetime purchase on the App Store. The subscription renews automatically until you cancel it: in Settings, tap your name, then Subscriptions. On a new iPhone, tap Restore Purchases in the app.
```

- **1:** Basic jest darmowy na zawsze, bez okresu próbnego.
- **A:** Subskrypcja odnawia się automatycznie, dopóki jej nie anulujesz: w Ustawieniach stuknij swoje imię, potem Subskrypcje.
- **B:** Na nowym iPhonie stuknij Restore Purchases [Przywróć zakupy] w aplikacji. (Etykieta bez cudzysłowu.)

#### en-GB

```
Basic is free forever, with no trial period. Pro adds planning, starter care, more starters and recipes. Pro is a monthly or yearly subscription or a one-time lifetime purchase on the App Store. The subscription renews automatically until you cancel it: in Settings, tap your name, then Subscriptions. On a new iPhone, tap Restore Purchases in the app.
```

- **1:** Basic jest darmowy na zawsze, bez okresu próbnego.
- **A:** Subskrypcja odnawia się automatycznie, dopóki jej nie anulujesz: w Ustawieniach stuknij swoje imię, potem Subskrypcje.
- **B:** Na nowym iPhonie stuknij Restore Purchases [Przywróć zakupy] w aplikacji. (Etykieta bez cudzysłowu.)

#### en-US

```
Basic is free forever, with no trial period. Pro adds planning, starter care, more starters and recipes. Pro is a monthly or yearly subscription or a one-time lifetime purchase on the App Store. The subscription renews automatically until you cancel it: in Settings, tap your name, then Subscriptions. On a new iPhone, tap Restore Purchases in the app.
```

- **1:** Basic jest darmowy na zawsze, bez okresu próbnego.
- **A:** Subskrypcja odnawia się automatycznie, dopóki jej nie anulujesz: w Ustawieniach stuknij swoje imię, potem Subskrypcje.
- **B:** Na nowym iPhonie stuknij Restore Purchases [Przywróć zakupy] w aplikacji. (Etykieta bez cudzysłowu.)

#### es-ES

```
Basic es gratis para siempre, sin periodo de prueba. Pro añade planificación, cuidado de la masa madre, más masas madre y recetas. Pro es una suscripción mensual o anual, o una compra única de por vida en el App Store. La suscripción se renueva automáticamente hasta que la canceles: en Ajustes, toca tu nombre y luego Suscripciones. En un iPhone nuevo, toca «Restaurar compras» en la app.
```

- **A:** Subskrypcja odnawia się automatycznie, dopóki jej nie anulujesz [tú]: w Ustawieniach (Ajustes) stuknij swoje imię, a potem Subskrypcje.
- **B:** Na nowym iPhonie stuknij «Restaurar compras» [Przywróć zakupy] w aplikacji.

#### es-MX

```
Basic es gratis para siempre, sin periodo de prueba. Pro añade planificación, cuidado de la masa madre, más masas madre y fórmulas. Pro es una suscripción mensual o anual, o una compra única de por vida en el App Store. La suscripción se renueva automáticamente hasta que la canceles: en Configuración, toca tu nombre y luego Suscripciones. En un iPhone nuevo, toca “Restaurar compras” en la app.
```

- **A:** Subskrypcja odnawia się automatycznie, dopóki jej nie anulujesz [tú]: w Konfiguracji (Configuración) stuknij swoje imię, a potem Subskrypcje.
- **B:** Na nowym iPhonie stuknij “Restaurar compras” [Przywróć zakupy] w aplikacji.

#### fi

```
Basic on ilmainen ikuisesti, ilman kokeilujaksoa. Pro tuo lisäksi suunnittelun, hapanjuuren hoidon sekä lisää hapanjuuria ja reseptejä. Pro on kuukausi- tai vuositilaus tai kertaosto elinikäiseen käyttöön App Storessa. Tilaus uusiutuu automaattisesti, kunnes perut sen: napauta Asetuksissa nimeäsi ja sitten Tilaukset. Uudessa iPhonessa napauta apissa ”Palauta ostot”.
```

- **A:** Subskrypcja (tilaus) odnawia się automatycznie, aż ją anulujesz [sinä]: stuknij w Ustawieniach swoje imię, a potem Subskrypcje.
- **B:** Na nowym iPhonie stuknij w apce ”Palauta ostot” [Przywróć zakupy].

#### fr-CA

```
Basic est gratuit pour toujours, sans période d'essai. Pro ajoute la planification, l'entretien du levain naturel, davantage de levains et de recettes. Pro est un abonnement mensuel ou annuel, ou un achat unique à vie sur l'App Store. L’abonnement se renouvelle automatiquement jusqu’à ce que vous l’annuliez : dans Réglages, touchez votre nom, puis Abonnements. Sur un nouvel iPhone, touchez « Restaurer les achats » dans l’app.
```

- **A:** Abonament odnawia się automatycznie, aż go anulujecie [vous]: w Ustawieniach (Réglages) dotknijcie swojego imienia, potem Abonamenty.
- **B:** Na nowym iPhonie dotknijcie « Restaurer les achats » [Przywróć zakupy] w aplikacji.

#### fr-FR

```
Basic est gratuit pour toujours, sans période d'essai. Pro ajoute la planification, l'entretien du levain naturel, davantage de levains et de recettes. Pro est un abonnement mensuel ou annuel, ou un achat unique à vie sur l'App Store. L’abonnement se renouvelle automatiquement jusqu’à ce que vous l’annuliez : dans Réglages, touchez votre nom, puis Abonnements. Sur un nouvel iPhone, touchez « Restaurer les achats » dans l’app.
```

- **A:** Abonament odnawia się automatycznie, aż go anulujecie [vous]: w Ustawieniach (Réglages) dotknijcie swojego imienia, potem Abonamenty.
- **B:** Na nowym iPhonie dotknijcie « Restaurer les achats » [Przywróć zakupy] w aplikacji.

#### hr

```
Basic je besplatan zauvijek, bez probnog razdoblja. Pro dodaje planiranje, brigu o kvasu, više kvasa i receptura. Pro je mjesečna ili godišnja pretplata ili jednokratna doživotna kupnja u App Storeu. Pretplata se automatski obnavlja dok je ne otkažeš: u Postavkama dodirni svoje ime i prezime, zatim Pretplate. Na novom iPhoneu dodirni „Vrati kupnje” u aplikaciji.
```

- **A:** Subskrypcja automatycznie się odnawia, dopóki jej nie wypowiesz [ti]: w Ustawieniach dotknij swoje imię i nazwisko, potem Subskrypcje.
- **B:** Na nowym iPhonie dotknij „Vrati kupnje” [Przywróć zakupy] w aplikacji.

#### hu

```
A Basic örökre ingyenes, próbaidőszak nélkül. A Pro hozzáadja a tervezést és a kovászgondozást, valamint további kovászokat és recepteket. A Pro havi vagy éves előfizetés, illetve egyszeri vásárlás élethosszig tartó hozzáféréssel az App Store-ban. Az előfizetés automatikusan megújul, amíg le nem mondod: a Beállításokban koppints a nevedre, majd az Előfizetések lehetőségre. Új iPhone-on koppints az appban a „Vásárlások visszaállítása” gombra.
```

- **A:** Subskrypcja automatycznie się odnawia, dopóki z niej nie zrezygnujesz [te]: w Ustawieniach stuknij w swoje imię, potem w opcję Subskrypcje.
- **B:** Na nowym iPhonie stuknij w aplikacji w przycisk „Vásárlások visszaállítása” [Przywrócenie zakupów].

#### id

```
Basic gratis selamanya, tanpa masa uji coba. Pro menambahkan perencanaan, perawatan starter, serta lebih banyak starter dan resep. Pro tersedia sebagai langganan bulanan atau tahunan, atau pembelian satu kali untuk akses seumur hidup di App Store. Langganan diperpanjang secara otomatis hingga Anda membatalkannya: di Pengaturan, ketuk nama Anda, lalu Langganan. Di iPhone baru, ketuk “Pulihkan Pembelian” di app.
```

- **A:** Subskrypcja jest przedłużana automatycznie, aż Pan/Pani [Anda] ją anuluje: w Ustawieniach stuknij swoje imię [nama Anda], potem Subskrypcja.
- **B:** Na nowym iPhonie stuknij “Pulihkan Pembelian” [Przywróć zakup] w aplikacji (app).

#### it

```
Basic è gratuito per sempre, senza periodo di prova. Pro aggiunge la pianificazione, la cura del lievito madre, più lieviti madre e più ricette. Pro è un abbonamento mensile o annuale oppure un acquisto a vita una tantum sull'App Store. L'abbonamento si rinnova automaticamente finché non lo annulli: in Impostazioni tocca il tuo nome, poi Abbonamenti. Su un nuovo iPhone, tocca «Ripristina acquisti» nell’app.
```

- **A:** Abonament odnawia się automatycznie, dopóki go nie anulujesz [tu]: w Ustawieniach stuknij swoje imię, potem Abonamenty.
- **B:** Na nowym iPhonie stuknij «Ripristina acquisti» [Przywróć zakupy] w aplikacji.

#### ja

```
Basicはずっと無料で、お試し期間はありません。Proでは、スケジュール作成、サワー種のお手入れ機能が加わり、登録できるサワー種と配合の数も増えます。Proは、App Storeでの月額または年額のサブスクリプション、または1回限りの買い切り購入です。サブスクリプションは、キャンセルするまで自動的に更新されます。「設定」で自分の名前をタップし、「サブスクリプション」をタップしてください。新しいiPhoneでは、アプリで「購入を復元」をタップしてください。
```

- **A:** Subskrypcja, dopóki jej nie anulujesz, jest automatycznie odnawiana. W „Ustawieniach” stuknij swoje imię, a potem stuknij „Subskrypcje”, proszę.
- **B:** Na nowym iPhonie w aplikacji stuknij, proszę, „購入を復元” [Przywróć zakup].

#### ko

```
Basic은 체험 기간 없이 영구 무료예요. Pro는 일정 계획, 스타터 관리, 더 많은 스타터와 배합표를 더해 줘요. Pro는 App Store에서 월간 또는 연간 구독, 또는 1회성 평생 구매로 이용할 수 있어요. 구독은 취소할 때까지 자동으로 갱신돼요. 설정에서 사용자 이름을 탭한 다음 구독을 탭하세요. 새 iPhone에서는 앱에서 ‘구입 내역 복원’을 탭하세요.
```

- **3:** Pro można w App Store używać [이용할 수 있어요] jako miesięcznej lub rocznej subskrypcji albo jednorazowego zakupu na całe życie.
- **A:** Subskrypcja odnawia się automatycznie, aż [ją] anulujesz. W ustawieniach stuknij nazwę użytkownika, a potem stuknij Subskrypcje, proszę.
- **B:** Na nowym iPhonie w aplikacji stuknij, proszę, ‘구입 내역 복원’ [Przywróć historię zakupów].

#### ms

```
Basic percuma selama-lamanya, tanpa tempoh percubaan. Pro menambah perancangan, penjagaan pemula, lebih banyak pemula dan resipi. Pro ialah langganan bulanan atau tahunan, atau pembelian sekali untuk akses seumur hidup di App Store. Langganan diperbaharui secara automatik sehingga anda membatalkannya: dalam Seting, ketik nama anda, kemudian Langganan. Pada iPhone baharu, ketik “Pulihkan Pembelian” dalam app.
```

- **3:** Pro to subskrypcja miesięczna lub roczna, albo zakup jednorazowy dla dostępu na całe życie w App Store.
- **A:** Subskrypcja jest odnawiana automatycznie, aż ją anulujesz [anda]: w Ustawieniach (Seting) stuknij swoje imię, następnie Subskrypcja.
- **B:** Na nowym iPhonie stuknij “Pulihkan Pembelian” [Przywróć zakup] w aplikacji.

#### nl-NL

```
Basic is voor altijd gratis, zonder proefperiode. Pro voegt planning, zorg voor je zuurdesemstarter, meer zuurdesemstarters en recepten toe. Pro is een maand- of jaarabonnement of een eenmalige levenslange aankoop in de App Store. Het abonnement wordt automatisch verlengd totdat je het annuleert: tik in Instellingen op je naam en daarna op Abonnementen. Tik op een nieuwe iPhone in de app op ‘Herstel aankopen’.
```

- **A:** Abonament jest automatycznie przedłużany, aż go anulujesz [je]: stuknij w Ustawieniach w swoje imię, a potem w Abonamenty.
- **B:** Stuknij na nowym iPhonie w aplikacji w ‘Herstel aankopen’ [Przywróć zakupy]. (Początek da się też odczytać: „Stuknij w nowy iPhone…”.)

#### no

```
Basic er gratis for alltid, uten prøveperiode. Pro gir deg planlegging, stell av surdeigsstarteren og flere surdeigsstartere og oppskrifter. Pro er et månedlig eller årlig abonnement eller et engangskjøp for livstid i App Store. Abonnementet fornyes automatisk til du avslutter det: I Innstillinger trykker du på navnet ditt og deretter på Abonnementer. På en ny iPhone trykker du på «Gjenopprett kjøp» i appen.
```

- **A:** Abonament odnawia się automatycznie, aż go zakończysz [du]: W Ustawieniach stukasz w swoje imię, a potem w Abonamenty.
- **B:** Na nowym iPhonie stukasz w «Gjenopprett kjøp» [Przywróć zakup] w aplikacji.

#### pt-BR

```
O Basic é gratuito para sempre, sem período de teste. O Pro adiciona planejamento, cuidados com o fermento natural, mais fermentos naturais e receitas. O Pro é uma assinatura mensal ou anual ou uma compra vitalícia única na App Store. A assinatura é renovada automaticamente até você cancelá-la: em Ajustes, toque no seu nome e depois em Assinaturas. Em um novo iPhone, toque em “Restaurar compras” no app.
```

- **A:** Subskrypcja jest odnawiana automatycznie, aż ją anulujesz [você]: w Ustawieniach (Ajustes) stuknij w swoje imię, a potem w Subskrypcje.
- **B:** Na nowym iPhonie stuknij w “Restaurar compras” [Przywróć zakupy] w aplikacji.

#### pt-PT

```
O Basic é gratuito para sempre, sem período experimental. O Pro acrescenta planeamento, cuidados com o fermento natural, mais fermentos naturais e mais receitas. O Pro é uma subscrição mensal ou anual, ou uma compra vitalícia única na App Store. A subscrição é renovada automaticamente até a cancelar: em Definições, toque no seu nome e, depois, em Subscrições. Num novo iPhone, toque em “Restaurar compras” na app.
```

- **A:** Subskrypcja jest odnawiana automatycznie, aż [Pan/Pani] ją anuluje: w Ustawieniach (Definições) niech [Pan/Pani] stuknie w swoje imię, a potem w Subskrypcje.
- **B:** Na nowym iPhonie niech [Pan/Pani] stuknie w “Restaurar compras” [Przywróć zakupy] w aplikacji.

#### ro

```
Basic este gratuit pentru totdeauna, fără perioadă de probă. Pro adaugă planificare, îngrijirea maielei, mai multe maiele și rețete. Pro este un abonament lunar sau anual ori o achiziție unică pe viață în App Store. Abonamentul se reînnoiește automat până când îl anulezi: în Configurări, apasă pe numele tău, apoi pe Abonamente. Pe un iPhone nou, apasă „Restaurează achizițiile” în aplicație.
```

- **A:** Abonament odnawia się automatycznie, aż go anulujesz [tu]: w Ustawieniach (Configurări) naciśnij swoje imię, potem Abonamenty.
- **B:** Na nowym iPhonie naciśnij „Restaurează achizițiile” [Przywróć zakupy] w aplikacji.

#### ru

```
Basic бесплатен навсегда, без пробного периода. Pro добавляет планирование, уход за закваской, больше заквасок и рецептур. Pro — это месячная или годовая подписка либо разовая пожизненная покупка в App Store. Подписка продлевается автоматически, пока вы её не отмените: в Настройках коснитесь своего имени, затем «Подписки». На новом iPhone нажмите «Восстановить покупки» в приложении.
```

- **A:** Subskrypcja przedłuża się automatycznie, dopóki jej nie anulujecie [вы]: w Ustawieniach dotknijcie swojego imienia, potem „Subskrypcje”.
- **B:** Na nowym iPhonie naciśnijcie «Восстановить покупки» [Przywróć zakupy] w aplikacji.

#### sk

```
Basic je navždy zadarmo, bez skúšobného obdobia. Pro pridáva plánovanie, starostlivosť o kvások, viac kváskov a receptúr. Pro je mesačné alebo ročné predplatné alebo jednorazový doživotný nákup v App Store. Predplatné sa obnovuje automaticky, kým ho nezrušíte: v Nastaveniach klepnite na svoje meno, potom na Predplatné. Na novom iPhone klepnite v aplikácii na „Obnoviť nákupy“.
```

- **A:** Subskrypcja (predplatné) odnawia się automatycznie, dopóki jej nie anulujecie [vy]: w Ustawieniach stuknijcie w swoje imię, potem w Subskrypcję.
- **B:** Na nowym iPhonie stuknijcie [vy] w aplikacji w „Obnoviť nákupy” [Przywróć zakupy].

#### sl

```
Basic je za vedno brezplačen, brez preizkusnega obdobja. Pro doda načrtovanje, nego kvasa ter več kvasov in receptov. Pro je mesečna ali letna naročnina ali enkratni doživljenjski nakup v App Storu. Naročnina se samodejno podaljšuje, dokler je ne prekličeš: v Nastavitvah tapni svoje ime in priimek, nato Naročnine. Na novem iPhonu v aplikaciji tapni »Obnovi nakupe«.
```

- **A:** Subskrypcja (naročnina) samoczynnie się przedłuża, dopóki jej nie odwołasz [ti]: w Ustawieniach stuknij swoje imię i nazwisko, potem Subskrypcje.
- **B:** Na nowym iPhonie w aplikacji stuknij [ti] »Obnovi nakupe« [Przywróć zakupy].

#### sv

```
Basic är gratis för alltid, utan provperiod. Pro lägger till planering, skötsel av surdegsgrunden, fler surdegsgrunder och fler recept. Pro är ett månads- eller årsabonnemang eller ett engångsköp för livstid i App Store. Prenumerationen förnyas automatiskt tills du avslutar den: tryck på ditt namn i Inställningar och sedan på Prenumerationer. På en ny iPhone trycker du på ”Återställ köp” i appen.
```

- **A:** Prenumerata odnawia się automatycznie, aż ją zakończysz [du]: stuknij w swoje imię w Ustawieniach, a potem w Prenumeraty.
- **B:** Na nowym iPhonie stukasz w ”Återställ köp” [Przywróć zakup] w aplikacji.

#### tr

```
Basic, deneme süresi olmadan, süresiz olarak ücretsizdir. Pro; planlama, ekşi maya bakımı, daha fazla ekşi maya ve tarif ekler. Pro, App Store'da aylık veya yıllık abonelik ya da tek seferlik ömür boyu satın alma olarak sunulur. Abonelik siz iptal edene kadar otomatik olarak yenilenir: Ayarlar'da adınıza, ardından Abonelikler'e dokunun. Yeni bir iPhone'da uygulamada “Satın Alımları Geri Yükle” seçeneğine dokunun.
```

- **A:** Subskrypcja odnawia się automatycznie, aż ją anulujecie [siz]: w Ustawieniach dotknijcie swojego imienia, a następnie Subskrypcji.
- **B:** Na nowym iPhonie w aplikacji dotknijcie opcji “Satın Alımları Geri Yükle” [Przywróć zakupy].

#### uk

```
Basic безплатний назавжди, без пробного періоду. Pro додає планування, догляд за закваскою, більше заквасок і рецептур. Pro — це місячна чи річна підписка або одноразова довічна покупка в App Store. Підписка поновлюється автоматично, доки ви її не скасуєте: у Параметрах торкніть своє ім’я, потім «Підписки». На новому iPhone торкніть «Відновити покупки» в застосунку.
```

- **A:** Subskrypcja odnawia się automatycznie, dopóki jej nie anulujecie [ви]: w Parametrach dotknijcie swoje imię, potem „Subskrypcje”.
- **B:** Na nowym iPhonie dotknijcie «Відновити покупки» [Przywróć zakupy] w aplikacji.

#### vi

```
Gói Basic miễn phí vĩnh viễn, không có thời gian dùng thử. Gói Pro bổ sung tính năng lập kế hoạch, chăm sóc men tự nhiên, thêm nhiều men tự nhiên và công thức. Pro là gói đăng ký theo tháng hoặc theo năm, hoặc mua một lần trọn đời trên App Store. Gói đăng ký tự động gia hạn cho đến khi bạn hủy: trong Cài đặt, chạm vào tên của bạn, sau đó chạm vào Đăng ký. Trên iPhone mới, chạm vào “Khôi phục giao dịch mua” trong ứng dụng.
```

- **A:** Pakiet subskrypcji automatycznie się przedłuża aż do chwili, gdy [bạn] anulujesz: w Ustawieniach dotknij swojego imienia, potem dotknij Subskrypcja.
- **B:** Na nowym iPhonie dotknij “Khôi phục giao dịch mua” [Przywróć transakcje zakupu] w aplikacji.

#### zh-Hant

```
Basic 方案永久免費，沒有試用期。Pro 方案新增規劃功能、天然酵母起種照護，以及更多天然酵母起種與配方。Pro 方案可透過 App Store 以月訂閱、年訂閱或一次性終身購買取得。訂閱會自動續訂，直到你取消為止：在「設定」中點一下你的名字，然後點一下「訂閱項目」。在新的 iPhone 上，請在 App 中點一下「回復購買項目」。
```

- **A:** Subskrypcja automatycznie się odnowi, aż do chwili, gdy ty [你] ją anulujesz: w „Ustawieniach” stuknij swoje imię, potem stuknij „Pozycje subskrypcji”.
- **B:** Na nowym iPhonie, proszę, w aplikacji stuknij „回復購買項目” [Przywróć pozycje zakupów].

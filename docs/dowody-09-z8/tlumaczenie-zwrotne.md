# Z-8: kontrola treści o płatnościach w opisie sklepu metodą tłumaczenia zwrotnego (2026-11-10)

Decyzja właściciela KO-029 (2026-11-10): „Ryzyko + tłumaczenie zwrotne”. Kontroler: niezależny subagent, który tych tekstów nie tłumaczył. To przegląd modelu, nie rodzimego użytkownika języka. Tylko raport, teksty bez zmian.

## Wejście
- 34 lokalizacje `docs/wydanie/metadane/*.json` na `origin/redesign/piekarz-2026-10-22` @ `1d78752b`: pola `opis`, `tekstPromocyjny`, `podtytul`, `nazwa`, `slowaKluczowe`, `ramki`.
- Oryginał PL/EN: `docs/app-store-metadata-v2.md` (akapit „DOSTĘP I ZAKUP” / „ACCESS AND PURCHASE”).
- Kontrakt: `docs/monetyzacja.md` („Kontrakt płatności”, „Reguły dostępu”), ceny: `docs/wydanie/ceny.json`.

## Metoda
1. W każdej lokalizacji: akapit z odnośnikiem EULA (zawsze 11. z 12 akapitów opisu) oraz przeszukanie reszty opisu, tekstu promocyjnego, podtytułu, nazwy, słów kluczowych i podpisów ramek pod kątem słów o płatności, próbie, subskrypcji, odnowieniu, rabacie, anulowaniu, przywracaniu i walutach (wyrażenie regularne w ~30 językach, każde trafienie przejrzane ręcznie).
2. Tłumaczenie zwrotne akapitu na polski (dosłownie, bez wygładzania; dodatek niżej).
3. Porównanie z oryginałem PL i z kontraktem w punktach (a)–(i). pl i en-* porównane wprost z oryginałem.

## Wynik w skrócie
- **P1: brak.** Żadna lokalizacja nie obiecuje próby, rabatu ani „za darmo” dla Pro, nie przekłamuje planów ani dożywotniego zakupu.
- **Cen w opisach nie ma** (żadnej kwoty ani waluty w opisie, tekście promocyjnym, podtytule, słowach kluczowych ani ramkach). Nie da się więc rozminąć z `docs/wydanie/ceny.json`. Trafienia „EUR” w fr-FR, fr-CA i fi to fragmenty słów (DOCT**EUR**, minut**eur** i podobne): fałszywe alarmy.
- Poza akapitem o zakupie płatności dotyczy tylko etykieta „(Pro)” przy funkcjach. Jest w każdej lokalizacji w tych samych miejscach co w PL: akapity 2, 3, 4, 6 i 8 opisu oraz tekst promocyjny. en-* mają dodatkowo „(Pro)” w akapicie wstępu, tak jak oryginał EN.
- **28 z 34 lokalizacji (z pl): bez żadnej rozbieżności z oryginałem.** Pozostałe 6 ma rozbieżności własne, wszystkie P3: en-AU, en-CA, en-GB, en-US (R-1), ms (R-2), ko (R-3, uwaga o szyku). Bez P1 i P2 są wszystkie 34.
- **Luki wspólne, odziedziczone z oryginału PL/EN** (wszystkie 34 lokalizacje przekazują je wiernie, więc to sprawa źródła, a nie przekładu): G-1 (P2), G-2 (P3), G-3 (P3).

## Luki oryginału wobec kontraktu (wspólne dla 34 lokalizacji)

| ID | punkt | oryginał PL | kontrakt | waga | uzasadnienie |
|---|---|---|---|---|---|
| G-1 | (c) | „Pro to subskrypcja miesięczna lub roczna…”: nie mówi, że subskrypcja odnawia się automatycznie | subskrypcja odnawiana (grupa „Piekarz Pro”) | **P2** | Brak przekłamania, ale czytelnik opisu nie dowie się, że subskrypcja odnawia się sama do czasu anulowania. Wytyczna 3.1.2 wymaga tej informacji przede wszystkim w aplikacji przed zakupem (ekran Pro), a od metadanych wymaga linku do EULA, który jest. Dlatego P2, nie P1. Przy poprawce warto też sprawdzić, czy w polu ASC jest link do polityki prywatności (poza zakresem tej kontroli). |
| G-2 | (f), (g) | brak zdania o zarządzaniu i anulowaniu w ustawieniach Apple oraz o przywracaniu zakupów | `showManageSubscriptionsIOS`, „Przywróć zakupy” na ekranie Pro i w Ustawieniach | P3 | Opis sklepu nie musi tego zawierać, a informacja jest w aplikacji. Jedno zdanie zamknęłoby lukę razem z G-1. |
| G-3 | (b) | „Pro dodaje planowanie” | Basic ma „plan od teraz”, widok tygodnia i „Następne”; Pro ma plan wstecz od godziny „gotowe” i wypieki na przyszłe dni | P3 | Skrót, który może sugerować, że całe planowanie jest w Pro. Nagłówek „PLAN OD GODZINY „GOTOWE” (Pro)” w tym samym opisie to doprecyzowuje. |
| — | (d) | „Basic jest darmowy na zawsze, bez okresu próbnego.” | brak próby i brak oferty wprowadzającej na subskrypcjach (D-112, Z-1) | OK | Zgodne z kontraktem: brak próby wynika z sensu zdania (Basic nie wygasa, osobnej próby nie ma). Oryginał nie mówi wprost „Pro nie ma okresu próbnego”, ale nic nie obiecuje. |

## Tabela: lokalizacja × (a)–(i)

Legenda: OK = sens zgodny z oryginałem PL i z kontraktem; „= PL (G-n)” = luka oryginału przeniesiona wiernie, bez dodatkowego błędu przekładu; R-n = rozbieżność lokalizacji (opis niżej).

| lokalizacja | (a) darmowe | (b) plany Pro | (c) auto-odnawianie | (d) brak próby/oferty | (e) dożywotni bez odnowienia | (f) anulowanie | (g) przywracanie | (h) EULA | (i) brak obietnic sprzecznych |
|---|---|---|---|---|---|---|---|---|---|
| cs | OK | OK | = PL (G-1) | OK | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| da | OK | OK | = PL (G-1) | OK | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| de-DE | OK | OK | = PL (G-1) | OK | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| el | OK | OK | = PL (G-1) | OK | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| en-AU | OK | OK | = PL (G-1) | ROZBIEŻNOŚĆ R-1, P3 | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| en-CA | OK | OK | = PL (G-1) | ROZBIEŻNOŚĆ R-1, P3 | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| en-GB | OK | OK | = PL (G-1) | ROZBIEŻNOŚĆ R-1, P3 | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| en-US | OK | OK | = PL (G-1) | ROZBIEŻNOŚĆ R-1, P3 | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| es-ES | OK | OK | = PL (G-1) | OK | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| es-MX | OK | OK | = PL (G-1) | OK | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| fi | OK | OK | = PL (G-1) | OK | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| fr-CA | OK | OK | = PL (G-1) | OK | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| fr-FR | OK | OK | = PL (G-1) | OK | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| hr | OK | OK | = PL (G-1) | OK | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| hu | OK | OK | = PL (G-1) | OK | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| id | OK | OK | = PL (G-1) | OK | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| it | OK | OK | = PL (G-1) | OK | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| ja | OK | OK | = PL (G-1) | OK | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| ko | OK | OK (R-3, P3 szyk) | = PL (G-1) | OK | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| ms | OK | OK | = PL (G-1) | OK | ROZBIEŻNOŚĆ R-2, P3 | = PL (G-2) | = PL (G-2) | OK | OK |
| nl-NL | OK | OK | = PL (G-1) | OK | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| no | OK | OK | = PL (G-1) | OK | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| pl | OK | OK (G-3, P3) | BRAK (G-1, P2) | OK | OK | BRAK (G-2, P3) | BRAK (G-2, P3) | OK | OK |
| pt-BR | OK | OK | = PL (G-1) | OK | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| pt-PT | OK | OK | = PL (G-1) | OK | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| ro | OK | OK | = PL (G-1) | OK | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| ru | OK | OK | = PL (G-1) | OK | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| sk | OK | OK | = PL (G-1) | OK | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| sl | OK | OK | = PL (G-1) | OK | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| sv | OK | OK | = PL (G-1) | OK | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| tr | OK | OK | = PL (G-1) | OK | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| uk | OK | OK | = PL (G-1) | OK | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| vi | OK | OK | = PL (G-1) | OK | OK | = PL (G-2) | = PL (G-2) | OK | OK |
| zh-Hant | OK | OK | = PL (G-1) | OK | OK | = PL (G-2) | = PL (G-2) | OK | OK |

## Rozbieżności lokalizacji

| ID | lokalizacje | punkt | cytat | tłumaczenie zwrotne | co brakuje lub co przekłamane | waga |
|---|---|---|---|---|---|---|
| R-1 | en-AU, en-CA, en-GB, en-US | (d) | „Free Basic forever.” | „Darmowy Basic na zawsze.” | Brak odpowiednika „bez okresu próbnego” z PL. Pozostałe 29 przekładów (z PL) go mają, a źródło EN w `docs/app-store-metadata-v2.md` (§2.2 i §5.1.1) nie. Sens „Basic nie wygasa” zostaje, nic nie obiecano, więc kontrakt nie jest naruszony. Poza tym to zdanie bez orzeczenia (styl). | P3 |
| R-2 | ms | (e) | „pembelian sekali seumur hidup di App Store” | „zakup raz [na] całe życie w App Store” | Jedna płatność jest jasna. Fraza da się jednak czytać jako „zakup raz w życiu” i nie mówi wprost, że dostęp jest dożywotni. W id i hu ten sam problem poprawiono w f148781e („untuk akses seumur hidup”, „élethosszig tartó hozzáféréssel”). Brak przekłamania. | P3 |
| R-3 | ko | (b) | „…또는 App Store의 1회성 평생 구매로…” | „…albo jednorazowego zakupu na całe życie w App Store” | Gramatycznie „App Store의” odnosi się tylko do zakupu dożywotniego, a nie do subskrypcji. Sens dla czytelnika bez zmian. | P3 (uwaga) |
| — | ja | (e) | „1回限りの買い切り購入” | „jednorazowy zakup „na własność” (kupujesz raz i masz)” | Nie dosłowne „dożywotni”, ale 買い切り to w App Store standardowe japońskie określenie jednorazowego zakupu bez odnowienia. Zgodne z kontraktem (e). | OK |

## Dodatek: akapity i tłumaczenia zwrotne wszystkich 34 lokalizacji

Cytaty wygenerowano z plików JSON (bez przepisywania ręcznego). Tłumaczenia zwrotne są dosłowne, bez wygładzania.

#### cs (status: hipoteza)

Oryginał w języku lokalizacji:

```
PŘÍSTUP A NÁKUP
Basic je navždy zdarma, bez zkušební doby. Pro přidává plánování, péči o kvásek, více kvásků a receptů. Pro je měsíční nebo roční předplatné nebo jednorázový doživotní nákup v App Storu.
Podmínky použití (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> Pekař spočítá množství a dá vědět o konci každého kroku. Plán zpětně od času, kdy má být chléb hotový (Pro). Bez účtu, bez internetu, bez reklam.

Tłumaczenie zwrotne akapitu (dosłownie): Basic jest na zawsze za darmo, bez okresu próbnego. Pro dodaje planowanie, opiekę o zakwas, więcej zakwasów i receptur. Pro jest miesięczną albo roczną subskrypcją albo jednorazowym dożywotnim zakupem w App Store.

#### da (status: częściowo)

Oryginał w języku lokalizacji:

```
ADGANG OG KØB
Basic er gratis for altid, uden prøveperiode. Pro tilføjer planlægning, pleje af surdej, flere surdeje og opskrifter. Pro er et månedligt eller årligt abonnement eller et engangskøb med livstidsadgang i App Store.
Brugsbetingelser (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> Bageren beregner mængderne og giver besked, når hvert trin slutter. Plan baglæns fra klar-tidspunktet (Pro). Ingen konto, intet internet, ingen reklamer.

Tłumaczenie zwrotne akapitu (dosłownie): Basic jest darmowy na zawsze, bez okresu próbnego. Pro dodaje planowanie, pielęgnację zakwasu, więcej zakwasów i przepisów. Pro jest miesięczną albo roczną subskrypcją albo jednorazowym zakupem z dostępem dożywotnim w App Store.

#### de-DE (status: częściowo)

Oryginał w języku lokalizacji:

```
ZUGANG UND KAUF
Basic ist für immer kostenlos, ohne Probezeitraum. Pro bietet zusätzlich Planung, Sauerteigpflege sowie mehr Sauerteige und Rezepturen. Pro gibt es als Monats- oder Jahresabo oder als einmaligen Kauf auf Lebenszeit im App Store.
Nutzungsbedingungen (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> Bäcker berechnet die Mengen und meldet sich am Ende jedes Schritts. Plan rückwärts ab der Fertig-Uhrzeit deines Brots (Pro). Ohne Konto, ohne Internet, ohne Werbung.

Tłumaczenie zwrotne akapitu (dosłownie): Basic jest na zawsze bezpłatny, bez okresu próbnego. Pro oferuje dodatkowo planowanie, pielęgnację zakwasu oraz więcej zakwasów i receptur. Pro jest jako abonament (potocznie „abo”) miesięczny albo roczny albo jako jednorazowy zakup na całe życie w App Store.

#### el (status: hipoteza)

Oryginał w języku lokalizacji:

```
ΠΡΟΣΒΑΣΗ ΚΑΙ ΑΓΟΡΑ
Το Basic είναι δωρεάν για πάντα, χωρίς δοκιμαστική περίοδο. Το Pro προσθέτει προγραμματισμό, φροντίδα προζυμιού, περισσότερα προζύμια και συνταγές. Το Pro είναι μηνιαία ή ετήσια συνδρομή ή εφάπαξ αγορά εφ' όρου ζωής στο App Store.
Όροι χρήσης (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> Ο Αρτοποιός υπολογίζει ποσότητες και ειδοποιεί στο τέλος κάθε βήματος. Πρόγραμμα αντίστροφα από την ώρα «έτοιμο» (Pro). Χωρίς λογαριασμό, internet, διαφημίσεις.

Tłumaczenie zwrotne akapitu (dosłownie): Basic jest darmowy na zawsze, bez okresu próbnego. Pro dodaje planowanie, opiekę nad zakwasem, więcej zakwasów i przepisów. Pro jest miesięczną albo roczną subskrypcją albo jednorazowym zakupem dożywotnim w App Store.

#### en-AU (status: hipoteza)

Oryginał w języku lokalizacji:

```
ACCESS AND PURCHASE
Free Basic forever. Pro adds planning, starter care, more starters and recipes. Pro is a monthly or yearly subscription or a one-time lifetime purchase on the App Store.
Terms of Use (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> Baker works out the amounts and tells you when each step ends. A plan back from the time you want bread ready (Pro). No account, no internet, no ads.

Tłumaczenie zwrotne akapitu (dosłownie): Darmowy Basic na zawsze. Pro dodaje planowanie, opiekę nad zakwasem, więcej zakwasów i przepisów. Pro jest subskrypcją miesięczną lub roczną albo jednorazowym zakupem dożywotnim w App Store.

#### en-CA (status: hipoteza)

Oryginał w języku lokalizacji:

```
ACCESS AND PURCHASE
Free Basic forever. Pro adds planning, starter care, more starters and recipes. Pro is a monthly or yearly subscription or a one-time lifetime purchase on the App Store.
Terms of Use (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> Sourdough planner with baker's percentage: recipe amounts, timers that ring while the phone is locked, a plan back from your ready time (Pro). No account, no ads.

Tłumaczenie zwrotne akapitu (dosłownie): Darmowy Basic na zawsze. Pro dodaje planowanie, opiekę nad zakwasem, więcej zakwasów i przepisów. Pro jest subskrypcją miesięczną lub roczną albo jednorazowym zakupem dożywotnim w App Store.

#### en-GB (status: częściowo)

Oryginał w języku lokalizacji:

```
ACCESS AND PURCHASE
Free Basic forever. Pro adds planning, starter care, more starters and recipes. Pro is a monthly or yearly subscription or a one-time lifetime purchase on the App Store.
Terms of Use (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> Baker works out the amounts and tells you when each step ends. A plan back from the time you want bread ready (Pro). No account, no internet, no ads.

Tłumaczenie zwrotne akapitu (dosłownie): Darmowy Basic na zawsze. Pro dodaje planowanie, opiekę nad zakwasem, więcej zakwasów i przepisów. Pro jest subskrypcją miesięczną lub roczną albo jednorazowym zakupem dożywotnim w App Store.

#### en-US (status: częściowo)

Oryginał w języku lokalizacji:

```
ACCESS AND PURCHASE
Free Basic forever. Pro adds planning, starter care, more starters and recipes. Pro is a monthly or yearly subscription or a one-time lifetime purchase on the App Store.
Terms of Use (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> Baker works out the amounts and tells you when each step ends. A plan back from the time you want bread ready (Pro). No account, no internet, no ads.

Tłumaczenie zwrotne akapitu (dosłownie): Darmowy Basic na zawsze. Pro dodaje planowanie, opiekę nad zakwasem, więcej zakwasów i przepisów. Pro jest subskrypcją miesięczną lub roczną albo jednorazowym zakupem dożywotnim w App Store.

#### es-ES (status: częściowo)

Oryginał w języku lokalizacji:

```
ACCESO Y COMPRA
Basic es gratis para siempre, sin periodo de prueba. Pro añade planificación, cuidado de la masa madre, más masas madre y recetas. Pro es una suscripción mensual o anual, o una compra única de por vida en el App Store.
Condiciones de uso (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> Panadero calcula cantidades y te avisa al acabar cada paso. Plan hacia atrás desde la hora a la que quieres el pan listo (Pro). Sin cuenta, sin internet, sin anuncios.

Tłumaczenie zwrotne akapitu (dosłownie): Basic jest za darmo na zawsze, bez okresu próbnego. Pro dodaje planowanie, opiekę nad zakwasem, więcej zakwasów i przepisów. Pro jest subskrypcją miesięczną albo roczną, albo jednorazowym zakupem na całe życie w App Store.

#### es-MX (status: częściowo)

Oryginał w języku lokalizacji:

```
ACCESO Y COMPRA
Basic es gratis para siempre, sin periodo de prueba. Pro añade planificación, cuidado de la masa madre, más masas madre y fórmulas. Pro es una suscripción mensual o anual, o una compra única de por vida en el App Store.
Términos de uso (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> Panadero calcula cantidades y te avisa al terminar cada paso. Plan hacia atrás desde la hora en que quieres el pan listo (Pro). Sin cuenta, sin internet, sin anuncios.

Tłumaczenie zwrotne akapitu (dosłownie): Basic jest za darmo na zawsze, bez okresu próbnego. Pro dodaje planowanie, opiekę nad zakwasem, więcej zakwasów i receptur (formuł). Pro jest subskrypcją miesięczną albo roczną, albo jednorazowym zakupem na całe życie w App Store.

#### fi (status: hipoteza)

Oryginał w języku lokalizacji:

```
KÄYTTÖOIKEUS JA OSTO
Basic on ilmainen ikuisesti, ilman kokeilujaksoa. Pro tuo lisäksi suunnittelun, hapanjuuren hoidon sekä lisää hapanjuuria ja reseptejä. Pro on kuukausi- tai vuositilaus tai kertaosto elinikäiseen käyttöön App Storessa.
Käyttöehdot (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> Leipuri laskee määrät ja kertoo vaiheiden päättymisestä. Aikataulu taaksepäin siitä ajasta, jolloin leivän pitää olla valmis (Pro). Ei tiliä, nettiä eikä mainoksia.

Tłumaczenie zwrotne akapitu (dosłownie): Basic jest darmowy na zawsze, bez okresu wypróbowania. Pro przynosi dodatkowo planowanie, opiekę nad zakwasem oraz więcej zakwasów i przepisów. Pro jest subskrypcją miesięczną lub roczną albo jednorazowym zakupem do dożywotniego użytku w App Store.

#### fr-CA (status: hipoteza)

Oryginał w języku lokalizacji:

```
ACCÈS ET ACHAT
Basic est gratuit pour toujours, sans période d'essai. Pro ajoute la planification, l'entretien du levain naturel, davantage de levains et de recettes. Pro est un abonnement mensuel ou annuel, ou un achat unique à vie sur l'App Store.
Conditions d’utilisation (EULA) : https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> Mitron calcule les quantités et signale la fin de chaque étape. Planning à rebours depuis l'heure où le pain doit être prêt (Pro). Sans compte, sans internet, sans pub.

Tłumaczenie zwrotne akapitu (dosłownie): Basic jest darmowy na zawsze, bez okresu próbnego. Pro dodaje planowanie, utrzymanie zakwasu naturalnego, więcej zakwasów i przepisów. Pro jest abonamentem miesięcznym lub rocznym, albo jednorazowym zakupem na całe życie w App Store.

#### fr-FR (status: częściowo)

Oryginał w języku lokalizacji:

```
ACCÈS ET ACHAT
Basic est gratuit pour toujours, sans période d'essai. Pro ajoute la planification, l'entretien du levain naturel, davantage de levains et de recettes. Pro est un abonnement mensuel ou annuel, ou un achat unique à vie sur l'App Store.
Conditions d’utilisation (EULA) : https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> Mitron calcule les quantités et signale la fin de chaque étape. Planning à rebours depuis l'heure où le pain doit être prêt (Pro). Sans compte, sans internet, sans pub.

Tłumaczenie zwrotne akapitu (dosłownie): Basic jest darmowy na zawsze, bez okresu próbnego. Pro dodaje planowanie, utrzymanie zakwasu naturalnego, więcej zakwasów i przepisów. Pro jest abonamentem miesięcznym lub rocznym, albo jednorazowym zakupem na całe życie w App Store.

#### hr (status: hipoteza)

Oryginał w języku lokalizacji:

```
PRISTUP I KUPNJA
Basic je besplatan zauvijek, bez probnog razdoblja. Pro dodaje planiranje, brigu o kvasu, više kvasa i receptura. Pro je mjesečna ili godišnja pretplata ili jednokratna doživotna kupnja u App Storeu.
Uvjeti korištenja (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> Pekar će izračunati količine i javiti ti kraj svakog koraka. Plan unatrag od vremena kad kruh treba biti gotov (Pro). Bez računa, bez interneta, bez reklama.

Tłumaczenie zwrotne akapitu (dosłownie): Basic jest bezpłatny na zawsze, bez okresu próbnego. Pro dodaje planowanie, troskę o zakwas, więcej zakwasu i receptur. Pro jest miesięczną lub roczną przedpłatą (subskrypcją) albo jednorazowym dożywotnim zakupem w App Store.

#### hu (status: hipoteza)

Oryginał w języku lokalizacji:

```
HOZZÁFÉRÉS ÉS VÁSÁRLÁS
A Basic örökre ingyenes, próbaidőszak nélkül. A Pro hozzáadja a tervezést és a kovászgondozást, valamint további kovászokat és recepteket. A Pro havi vagy éves előfizetés, illetve egyszeri vásárlás élethosszig tartó hozzáféréssel az App Store-ban.
Felhasználási feltételek (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> A Pék kiszámolja a mennyiségeket, és szól minden lépés végén. Visszafelé tervezés a „kész” időponttól (Pro). Fiók, internet és reklám nélkül.

Tłumaczenie zwrotne akapitu (dosłownie): Basic jest na zawsze bezpłatny, bez okresu próbnego. Pro dodaje planowanie i pielęgnację zakwasu, a także dodatkowe zakwasy i przepisy. Pro jest miesięczną lub roczną przedpłatą (subskrypcją), względnie jednorazowym zakupem z dostępem trwającym całe życie w App Store.

#### id (status: hipoteza)

Oryginał w języku lokalizacji:

```
AKSES DAN PEMBELIAN
Basic gratis selamanya, tanpa masa uji coba. Pro menambahkan perencanaan, perawatan starter, serta lebih banyak starter dan resep. Pro tersedia sebagai langganan bulanan atau tahunan, atau pembelian satu kali untuk akses seumur hidup di App Store.
Ketentuan Penggunaan (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> Tukang Roti menghitung takaran dan memberi tahu saat tiap langkah selesai. Jadwal mundur dari jam roti harus siap (Pro). Tanpa akun, tanpa internet, tanpa iklan.

Tłumaczenie zwrotne akapitu (dosłownie): Basic za darmo na zawsze, bez okresu próbnego. Pro dodaje planowanie, opiekę nad starterem oraz więcej starterów i przepisów. Pro jest dostępny jako subskrypcja miesięczna lub roczna albo zakup jednorazowy dla dostępu na całe życie w App Store.

#### it (status: częściowo)

Oryginał w języku lokalizacji:

```
ACCESSO E ACQUISTO
Basic è gratuito per sempre, senza periodo di prova. Pro aggiunge la pianificazione, la cura del lievito madre, più lieviti madre e più ricette. Pro è un abbonamento mensile o annuale oppure un acquisto a vita una tantum sull'App Store.
Termini di utilizzo (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> Fornaio calcola le dosi e ti avvisa alla fine di ogni passaggio. Programma a ritroso dall'ora in cui vuoi il pane pronto (Pro). Senza account, internet e pubblicità.

Tłumaczenie zwrotne akapitu (dosłownie): Basic jest darmowy na zawsze, bez okresu próbnego. Pro dodaje planowanie, opiekę nad zakwasem, więcej zakwasów i więcej przepisów. Pro jest abonamentem miesięcznym lub rocznym albo zakupem na całe życie jednorazowym w App Store.

#### ja (status: częściowo)

Oryginał w języku lokalizacji:

```
利用と購入
Basicはずっと無料で、お試し期間はありません。Proでは、スケジュール作成、サワー種のお手入れ機能が加わり、登録できるサワー種と配合の数も増えます。Proは、App Storeでの月額または年額のサブスクリプション、または1回限りの買い切り購入です。
利用規約（EULA）： https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> パン職人が分量を計算し、各工程の終わりをお知らせします。パンを仕上げたい時刻から逆算するプラン（Pro）。アカウント不要、インターネット不要、広告なし。

Tłumaczenie zwrotne akapitu (dosłownie): Basic jest cały czas darmowy; okresu na wypróbowanie nie ma. W Pro dochodzą tworzenie harmonogramu i funkcje pielęgnacji zakwasu, rośnie też liczba zakwasów i receptur, które można zapisać. Pro jest miesięczną lub roczną subskrypcją w App Store albo zakupem jednorazowym „na własność” (買い切り: kupujesz raz i masz).

#### ko (status: częściowo)

Oryginał w języku lokalizacji:

```
이용 및 구매
Basic은 체험 기간 없이 영구 무료예요. Pro는 일정 계획, 스타터 관리, 더 많은 스타터와 배합표를 더해 줘요. Pro는 월간 또는 연간 구독, 또는 App Store의 1회성 평생 구매로 이용할 수 있어요.
이용 약관 (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> 제빵사가 분량을 계산하고 각 단계가 끝나면 알려 드려요. 빵이 완성될 시간부터 역산한 일정(Pro). 계정, 인터넷, 광고 없이 사용해요.

Tłumaczenie zwrotne akapitu (dosłownie): Basic jest bez okresu próbnego (doświadczania) na stałe darmowy. Pro dokłada planowanie harmonogramu, zarządzanie starterem, więcej starterów i receptur. Pro można używać jako miesięcznej lub rocznej subskrypcji albo jako jednorazowego zakupu na całe życie w App Store.

#### ms (status: hipoteza)

Oryginał w języku lokalizacji:

```
AKSES DAN PEMBELIAN
Basic percuma selama-lamanya, tanpa tempoh percubaan. Pro menambah perancangan, penjagaan pemula, lebih banyak pemula dan resipi. Pro ialah langganan bulanan atau tahunan, atau pembelian sekali seumur hidup di App Store.
Terma Penggunaan (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> Tukang Roti mengira kuantiti dan memberitahu bila setiap langkah tamat. Pelan songsang dari masa roti perlu siap (Pro). Tanpa akaun, tanpa internet, tanpa iklan.

Tłumaczenie zwrotne akapitu (dosłownie): Basic darmowy na zawsze, bez okresu próbnego. Pro dodaje planowanie, pielęgnację startera, więcej starterów i przepisów. Pro jest subskrypcją miesięczną lub roczną albo zakupem raz na całe życie (dosł. „zakup raz [w] życiu”) w App Store.

#### nl-NL (status: częściowo)

Oryginał w języku lokalizacji:

```
TOEGANG EN AANKOOP
Basic is voor altijd gratis, zonder proefperiode. Pro voegt planning, zorg voor je zuurdesemstarter, meer zuurdesemstarters en recepten toe. Pro is een maand- of jaarabonnement of een eenmalige levenslange aankoop in de App Store.
Gebruiksvoorwaarden (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> Bakker berekent de hoeveelheden en meldt het einde van elke stap. Schema terug vanaf het moment dat je brood klaar is (Pro). Geen account, geen internet, geen reclame.

Tłumaczenie zwrotne akapitu (dosłownie): Basic jest na zawsze darmowy, bez okresu próbnego. Pro dodaje planowanie, opiekę nad twoim zakwasem, więcej zakwasów i przepisów. Pro jest abonamentem miesięcznym albo rocznym albo jednorazowym dożywotnim zakupem w App Store.

#### no (status: częściowo)

Oryginał w języku lokalizacji:

```
TILGANG OG KJØP
Basic er gratis for alltid, uten prøveperiode. Pro gir deg planlegging, stell av surdeigsstarteren og flere surdeigsstartere og oppskrifter. Pro er et månedlig eller årlig abonnement eller et engangskjøp for livstid i App Store.
Bruksvilkår (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> Bakeren regner ut mengdene og varsler deg når hvert steg er ferdig. Plan bakover fra når brødet skal være ferdig (Pro). Uten konto, uten internett, uten reklame.

Tłumaczenie zwrotne akapitu (dosłownie): Basic jest darmowy na zawsze, bez okresu próbnego. Pro daje ci planowanie, pielęgnację zakwasu oraz więcej zakwasów i przepisów. Pro jest miesięcznym albo rocznym abonamentem albo jednorazowym zakupem na całe życie w App Store.

#### pl (status: zmierzone)

Oryginał w języku lokalizacji:

```
DOSTĘP I ZAKUP
Basic jest darmowy na zawsze, bez okresu próbnego. Pro dodaje planowanie, opiekę nad zakwasem, więcej zakwasów i receptur. Pro to subskrypcja miesięczna lub roczna albo jednorazowy zakup dożywotni w App Store.
Warunki użytkowania (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> Piekarz policzy ilości i da znać o końcu każdego kroku. Plan wstecz od godziny, o której chleb ma być gotowy (Pro). Bez konta, bez internetu, bez reklam.

Tłumaczenie zwrotne akapitu (dosłownie): (oryginał)

#### pt-BR (status: częściowo)

Oryginał w języku lokalizacji:

```
ACESSO E COMPRA
O Basic é gratuito para sempre, sem período de teste. O Pro adiciona planejamento, cuidados com o fermento natural, mais fermentos naturais e receitas. O Pro é uma assinatura mensal ou anual ou uma compra vitalícia única na App Store.
Termos de Uso (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> O Padeiro calcula as quantidades e avisa o fim de cada etapa. Plano reverso a partir da hora em que o pão deve ficar pronto (Pro). Sem conta, sem internet, sem anúncios.

Tłumaczenie zwrotne akapitu (dosłownie): Basic jest darmowy na zawsze, bez okresu testowego. Pro dodaje planowanie, opiekę nad zakwasem naturalnym, więcej zakwasów i przepisów. Pro jest subskrypcją miesięczną lub roczną albo jednorazowym zakupem dożywotnim w App Store.

#### pt-PT (status: częściowo)

Oryginał w języku lokalizacji:

```
ACESSO E COMPRA
O Basic é gratuito para sempre, sem período experimental. O Pro acrescenta planeamento, cuidados com o fermento natural, mais fermentos naturais e mais receitas. O Pro é uma subscrição mensal ou anual, ou uma compra vitalícia única na App Store.
Termos de Utilização (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> O Padeiro calcula as quantidades e avisa no fim de cada passo. Plano inverso a partir da hora a que quer o pão pronto (Pro). Sem conta, sem internet, sem anúncios.

Tłumaczenie zwrotne akapitu (dosłownie): Basic jest darmowy na zawsze, bez okresu eksperymentalnego (próbnego). Pro dodaje planowanie, opiekę nad zakwasem naturalnym, więcej zakwasów i więcej przepisów. Pro jest subskrypcją miesięczną lub roczną, albo jednorazowym zakupem dożywotnim w App Store.

#### ro (status: hipoteza)

Oryginał w języku lokalizacji:

```
ACCES ȘI ACHIZIȚIE
Basic este gratuit pentru totdeauna, fără perioadă de probă. Pro adaugă planificare, îngrijirea maielei, mai multe maiele și rețete. Pro este un abonament lunar sau anual ori o achiziție unică pe viață în App Store.
Termeni de utilizare (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> Brutar calculează cantitățile și te anunță la finalul fiecărui pas. Plan invers de la ora la care vrei pâinea gata (Pro). Fără cont, fără internet, fără reclame.

Tłumaczenie zwrotne akapitu (dosłownie): Basic jest darmowy na zawsze, bez okresu próbnego. Pro dodaje planowanie, pielęgnację zakwasu, więcej zakwasów i przepisów. Pro jest abonamentem miesięcznym lub rocznym albo jednorazowym zakupem na całe życie w App Store.

#### ru (status: częściowo)

Oryginał w języku lokalizacji:

```
ДОСТУП И ПОКУПКА
Basic бесплатен навсегда, без пробного периода. Pro добавляет планирование, уход за закваской, больше заквасок и рецептур. Pro — это месячная или годовая подписка либо разовая пожизненная покупка в App Store.
Условия использования (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> Хлебопёк рассчитает количества и сообщит о конце каждого шага. План в обратном порядке от времени, когда хлеб должен быть готов (Pro). Без аккаунта, интернета и рекламы.

Tłumaczenie zwrotne akapitu (dosłownie): Basic jest bezpłatny na zawsze, bez okresu próbnego. Pro dodaje planowanie, opiekę nad zakwasem, więcej zakwasów i receptur. Pro — to miesięczna lub roczna subskrypcja albo jednorazowy dożywotni zakup w App Store.

#### sk (status: hipoteza)

Oryginał w języku lokalizacji:

```
PRÍSTUP A NÁKUP
Basic je navždy zadarmo, bez skúšobného obdobia. Pro pridáva plánovanie, starostlivosť o kvások, viac kváskov a receptúr. Pro je mesačné alebo ročné predplatné alebo jednorazový doživotný nákup v App Store.
Podmienky používania (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> Pekár vypočíta množstvá a upozorní vás na koniec každého kroku. Spätný plán od času, kedy má byť chlieb hotový (Pro). Bez účtu, bez internetu, bez reklám.

Tłumaczenie zwrotne akapitu (dosłownie): Basic jest na zawsze za darmo, bez okresu próbnego. Pro dodaje planowanie, starania o zakwas, więcej zakwasów i receptur. Pro jest miesięczną lub roczną przedpłatą (subskrypcją) albo jednorazowym dożywotnim zakupem w App Store.

#### sl (status: hipoteza)

Oryginał w języku lokalizacji:

```
DOSTOP IN NAKUP
Basic je za vedno brezplačen, brez preizkusnega obdobja. Pro doda načrtovanje, nego kvasa ter več kvasov in receptov. Pro je mesečna ali letna naročnina ali enkratni doživljenjski nakup v App Storu.
Pogoji uporabe (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> Pek izračuna količine in vas obvesti o koncu vsakega koraka. Obratni urnik od ure, ko naj bo kruh pripravljen (Pro). Brez računa, interneta in oglasov.

Tłumaczenie zwrotne akapitu (dosłownie): Basic jest na zawsze bezpłatny, bez okresu próbnego. Pro dodaje planowanie, pielęgnację zakwasu oraz więcej zakwasów i przepisów. Pro jest miesięczną lub roczną prenumeratą albo jednorazowym dożywotnim zakupem w App Store.

#### sv (status: częściowo)

Oryginał w języku lokalizacji:

```
ÅTKOMST OCH KÖP
Basic är gratis för alltid, utan provperiod. Pro lägger till planering, skötsel av surdegsgrunden, fler surdegsgrunder och fler recept. Pro är ett månads- eller årsabonnemang eller ett engångsköp för livstid i App Store.
Användarvillkor (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> Bagaren räknar ut mängderna och säger till när varje steg är slut. Plan bakåt från tiden då brödet ska vara klart (Pro). Inget konto, inget internet, ingen reklam.

Tłumaczenie zwrotne akapitu (dosłownie): Basic jest darmowy na zawsze, bez okresu próbnego. Pro dodaje planowanie, pielęgnację zakwasu, więcej zakwasów i więcej przepisów. Pro jest abonamentem miesięcznym albo rocznym albo jednorazowym zakupem na całe życie w App Store.

#### tr (status: hipoteza)

Oryginał w języku lokalizacji:

```
ERİŞİM VE SATIN ALMA
Basic, deneme süresi olmadan, süresiz olarak ücretsizdir. Pro; planlama, ekşi maya bakımı, daha fazla ekşi maya ve tarif ekler. Pro, App Store'da aylık veya yıllık abonelik ya da tek seferlik ömür boyu satın alma olarak sunulur.
Kullanım Koşulları (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> Fırıncı miktarları hesaplar ve her adımın sonunu haber verir. Ekmeğin hazır olacağı saatten geriye doğru plan (Pro). Hesap yok, internet yok, reklam yok.

Tłumaczenie zwrotne akapitu (dosłownie): Basic, bez okresu próbnego, jest bezpłatny bez ograniczenia czasu. Pro dodaje planowanie, pielęgnację zakwasu, więcej zakwasów i przepisów. Pro jest oferowany w App Store jako miesięczny lub roczny abonament albo jednorazowy zakup na całe życie.

#### uk (status: częściowo)

Oryginał w języku lokalizacji:

```
ДОСТУП І ПОКУПКА
Basic безплатний назавжди, без пробного періоду. Pro додає планування, догляд за закваскою, більше заквасок і рецептур. Pro — це місячна чи річна підписка або одноразова довічна покупка в App Store.
Умови використання (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> Пекар порахує кількості й повідомить про завершення кожного кроку. Зворотний план від часу, коли хліб має бути готовий (Pro). Без акаунта, інтернету й реклами.

Tłumaczenie zwrotne akapitu (dosłownie): Basic jest bezpłatny na zawsze, bez okresu próbnego. Pro dodaje planowanie, opiekę nad zakwasem, więcej zakwasów i receptur. Pro — to miesięczna lub roczna subskrypcja albo jednorazowy dożywotni zakup w App Store.

#### vi (status: hipoteza)

Oryginał w języku lokalizacji:

```
QUYỀN TRUY CẬP VÀ MUA
Gói Basic miễn phí vĩnh viễn, không có thời gian dùng thử. Gói Pro bổ sung tính năng lập kế hoạch, chăm sóc men tự nhiên, thêm nhiều men tự nhiên và công thức. Pro là gói đăng ký theo tháng hoặc theo năm, hoặc mua một lần trọn đời trên App Store.
Điều khoản sử dụng (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> Thợ Bánh Mì tính lượng nguyên liệu và báo khi mỗi bước kết thúc. Lịch trình ngược từ giờ bạn muốn bánh xong (Pro). Không tài khoản, không internet, không quảng cáo.

Tłumaczenie zwrotne akapitu (dosłownie): Pakiet Basic darmowy na zawsze, nie ma czasu na wypróbowanie. Pakiet Pro dodaje funkcję planowania, opiekę nad naturalnym zakwasem, więcej naturalnych zakwasów i przepisów. Pro to pakiet subskrypcji miesięcznej lub rocznej, albo zakup jeden raz na całe życie w App Store.

#### zh-Hant (status: częściowo)

Oryginał w języku lokalizacji:

```
使用權限與購買
Basic 方案永久免費，沒有試用期。Pro 方案新增規劃功能、天然酵母起種照護，以及更多天然酵母起種與配方。Pro 方案可透過 App Store 以月訂閱、年訂閱或一次性終身購買取得。
使用條款（EULA）： https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Tekst promocyjny (jedyna wzmianka o płatności: etykieta „(Pro)”):

> 麵包師傅 會算出用量，並在每個步驟結束時通知你。從麵包完成時間倒推的時程（Pro）。不需帳號、不需網路、沒有廣告。

Tłumaczenie zwrotne akapitu (dosłownie): Plan Basic jest na zawsze darmowy, nie ma okresu próbnego. Plan Pro dodaje funkcje planowania, opiekę nad zaczynem z naturalnych drożdży oraz więcej zaczynów i receptur. Plan Pro można uzyskać przez App Store jako subskrypcję miesięczną, subskrypcję roczną albo jednorazowy zakup dożywotni.


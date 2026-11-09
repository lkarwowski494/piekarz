# Wejście weryfikacji G4-sklep-pieniadze (M1 2026-11-08, commit 2ef8870a)
Pozycje do obalenia; uwaga: kilka ID z różnych ról może opisywać ten sam mechanizm (oceniasz każde ID osobno).

### 01-odkrywanie-001 · Ekran Pro obiecuje płatne „porównanie” wypieków, którego nie ma w aplikacji
- Pozycja listy kontrolnej: ODK-02
- Poziom: P0
- Realność: realny · Pewność: wysoka
- Rodzaj: P
- Dowód:
  - ekran Pro: `src/components/PaywallModal.tsx:73` „Receptury i Dziennik: więcej własnych receptur, porównanie i statystyki wypieków.”
  - etykieta blokady: `src/lib/platnosci/nazwy-pro.ts:27` „Porównanie i statystyki”
  - za tą blokadą jest tylko karta statystyk `BakeStatsCard` (liczba wypieków, średnie oceny): `app/(tabs)/dziennik/index.tsx:61-62`
  - porównanie dwóch wypieków to F-63 PÓŹNIEJ bez kodu: `docs/scope-contract.md:61` „Porównanie dwóch wypieków”
  - D-117 każe w „Co daje Pro” pokazywać tylko funkcje Pro z wejściem w 1.0: `docs/decyzje.md:570`
- Mechanizm: obietnica funkcji PÓŹNIEJ w tekście zakupu; `grep -rn "orówn" src app` → `src/components/PaywallModal.tsx:73`, `src/lib/platnosci/nazwy-pro.ts:27`, komentarz `src/lib/platnosci/konfiguracja.ts:59` i przekłady w 34 słownikach; kontrakt `docs/monetyzacja.md:70` (wiersz PR-06: porównanie i statystyki jako ekran Pro). Kodu porównania brak (jedyne inne trafienie to porównanie standardów mąk w `FlourEquivalentsModal`, funkcja PÓŹNIEJ).
- Powraca: nie
- Kroki w aplikacji: Basic → Dziennik z co najmniej jednym wpisem → karta „Porównanie i statystyki, Pro” → ekran Pro → „Receptury i Dziennik: … porównanie …”; po zakupie użytkownik dostaje tylko statystyki.
- Test akceptacyjny: test, który dla każdego zdania „Co daje Pro” i każdej etykiety blokady sprawdza, że funkcja ma wejście w 1.0 (`wejscieWidoczne` albo ekran); dziś czerwony na słowie „porównanie”.

### 03-zakres-002 · Ekran zakupu Pro obiecuje porównanie wypieków, którego aplikacja nie ma
- Pozycja listy kontrolnej: ZAK-03
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: D
- Dowód: `src/components/PaywallModal.tsx:73` „Receptury i Dziennik: więcej własnych receptur, porównanie i statystyki wypieków.”; `src/lib/platnosci/nazwy-pro.ts:27` „Porównanie i statystyki” jako nazwa blokady karty statystyk (`app/(tabs)/dziennik/index.tsx:61`); kontrakt: `docs/scope-contract.md:61` F-63 PÓŹNIEJ, "nowa funkcja bez kodu"; BR-RECP-004 wymaga dwóch wpisów obok siebie (`docs/brd/wymagania-dziennik.md:60`); w kodzie poza i18n słowo "porówn" tylko w nazwach i komentarzach (`dowody/e1-porownanie-pro.txt`); test z ID BR-RECP-004: brak (`dowody/macierz-sladu-testy.txt`). Karta statystyk liczy tylko sumę i średnie (`src/components/stolnica/BakeStatsCard.tsx:24`).
- Mechanizm: lista Pro przepisana z kontraktu płatności (`docs/monetyzacja.md:48` stawia BR-RECP-004 w Pro), a nie z zakresu 1.0; `grep -rn "porown" app src` → 5 trafień (powyżej), wszystkie bez funkcji porównania.
- Powraca: nie
- Kroki w aplikacji: Dziennik → karta „Porównanie i statystyki, Pro” → ekran Pro „Co daje Pro” → zakup → jest karta statystyk, porównania nie ma.
- Test akceptacyjny: test ekranowy, że teksty „Co daje Pro” i nazwy blokad nie zawierają funkcji spoza wierszy MVP/Pro z wejściem w 1.0 (lista z `src/lib/platnosci/konfiguracja.ts` przecięta z `src/lib/wejscia-pozniej.ts` i F-63); stała kontrola przeciw powrotowi.

### 02-monetyzacja-001 · Strona sklepu reklamuje funkcje Pro (plan wstecz, opieka nad zakwasem) bez oznaczenia, że wymagają zakupu
- Pozycja listy kontrolnej: ODK-02 (rola 01/10; zgłoszone tu, bo raportu tej roli nie czytałem) razem z MON-11
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: P
- Dowód: dowody/e1-metadane-pro.txt — tekst promocyjny PL „ułoży plan wstecz”, ramka 1 „Plan wstecz bez kroków w środku nocy”, ramka 5 „Ilości do dokarmienia i przypomnienie po 12 godzinach”; „Pro” w tekście promocyjnym i ramkach: 0 z 34 lokalizacji. Opis PL ma akapit DOSTĘP I ZAKUP, ale sekcje PLAN OD GODZINY i ZAKWASY opisują te funkcje bez słowa Pro (`docs/app-store-metadata-v2.md:35`, `docs/app-store-metadata-v2.md:42`). W kodzie to funkcje Pro: `src/lib/platnosci/konfiguracja.ts:44` (plan-wstecz), `src/lib/platnosci/konfiguracja.ts:53` (przypomnienia-zakwasu), `src/lib/platnosci/konfiguracja.ts:54` (proporcje-zakwasu).
- Mechanizm: metadane opisują funkcje sprzed podziału Basic/Pro; `node` po `docs/wydanie/metadane/*.json` → 34 trafienia (każda lokalizacja).
- Powraca: tak, otwarte zadanie Z-8 z 2026-10-22 (`docs/monetyzacja.md:142`) → trwała kontrola: test, który dla każdej funkcji Pro z `konfiguracja.ts` wymaga oznaczenia w tekście promocyjnym, ramkach i opisie, jeśli są tam wymienione.
- Kroki w aplikacji: użytkownik pobiera aplikację dla planu „gotowe o…” z promocji i zrzutu 1, stuka godzinę gotowości i dostaje ekran Pro.
- Test akceptacyjny: test metadanych przechodzi dla 34 lokalizacji; zrzuty ramek w `docs/wydanie/zrzuty/` zgodne z tekstem.

### 10-wydanie-005 · Tekst promocyjny i sekcje opisu przedstawiają funkcje Pro bez oznaczenia
- Pozycja listy kontrolnej: WYD-06
- Poziom: P2
- Realność: realny   · Pewność: wysoka
- Rodzaj: P
- Dowód: tekst promocyjny `docs/wydanie/metadane/pl.json:8` zaczyna od planu wstecz (Pro według `docs/monetyzacja.md:67`); sekcje opisu "PLAN OD GODZINY GOTOWE", proporcje dokarmiania i przypomnienie po 12 h, "kilka zakwasów", statystyki dziennika (Pro albo limit Basic, `docs/monetyzacja.md:45-54`) bez oznaczenia przy funkcji; ogólny akapit "DOSTĘP I ZAKUP" na końcu opisu. Nazwa EN "Baker: Sourdough Bread Planner" (D-053) nazywa funkcję Pro.
- Mechanizm: oznaczenie Pro jest w zrzutach i w aplikacji, ale nie w tekstach; ten sam układ w 34 lokalizacjach (akapit zakupu przetłumaczony, sekcje bez oznaczeń).
- Powraca: nie
- Kroki w aplikacji: użytkownik instaluje dla planu od godziny „gotowe” i po stuknięciu widzi ekran Pro.
- Test akceptacyjny: w każdej lokalizacji tekst promocyjny i sekcje funkcji Pro mają oznaczenie Pro w języku lokalizacji (test na metadanych, lista funkcji z `docs/monetyzacja.md`).

### 10-wydanie-001 · Zrzuty do wysyłki oznaczają darmowe funkcje jako płatne i pokazują interfejs sprzed M3
- Pozycja listy kontrolnej: WYD-05
- Poziom: P1
- Realność: realny   · Pewność: wysoka
- Rodzaj: D
- Dowód: oględziny PNG `docs/wydanie/zrzuty/pl/iphone-6.3/*` i en-US, nl-NL `iphone-6.9` (ramki 02, 04, 06): plakietka "wymaga Piekarz Pro" / "requires Baker Pro" / "vereist Bakker Pro" na ramkach 01–06, a `podpisy.json` tych samych lokalizacji ma oznaczenie tylko na 01 i 05 (`dowody/zrzuty-oznaczenie-pro.txt`). Kalkulator, prowadzenie, Doktor i dziennik są w Basic (`docs/monetyzacja.md:44-48`). Sumy MD5 14/14 PNG `pl` równe `docs/wydanie/zrzuty/sumy.json`, więc `scripts/asc-zgloszenie.mjs` wyśle te pliki; zestaw `pl` jest już w App Store Connect (`docs/wydanie/dziennik.md:32`, zapis 2026-10-21). PNG z 2026-10-21 (commit 6aa85862), podpisy i model Basic/Pro z 2026-10-22 (a859dc1f). Test wie o rozjeździe, ale sprawdza tylko JSON: `tests/zrzuty-sklepu.test.ts:28-29` "Pliki PNG z dawnym oznaczeniem na ramkach".
- Mechanizm: podpisy zmienione bez ponownej generacji obrazów i sum; test porównuje `podpisy.json` z metadanymi, nie obraz ani skrót obrazu; `grep -rn "oznaczenie" docs/wydanie/zrzuty/*/podpisy.json` → 3 pliki zgodne z modelem, 42 PNG niezgodne; 31 lokalizacji poza repo z tej samej generacji (sumy.json), nieobejrzane.
- Powraca: tak, Z-8 (`docs/monetyzacja.md:142`, otwarte od 2026-10-22) → trwała kontrola w teście akceptacyjnym.
- Kroki w aplikacji: użytkownik w App Store (Polska, po wysyłce także pozostałe kraje) widzi, że liczenie, prowadzenie, Doktor i dziennik wymagają Pro; w aplikacji są darmowe i wyglądają inaczej (system kart M3).
- Test akceptacyjny: `sumy.json` zapisuje skrót `podpisy.json` (albo metadanych), z którego powstały obrazy, a test pada, gdy skrót różni się od bieżącego; oględziny 7 ramek pl i en-US: plakietka tylko na 01 i 05; ramki z ekranów buildu kandydata.

### 02-monetyzacja-004 · Przywracanie: błąd odczytu po synchronizacji kończy się komunikatem „Nie znaleziono aktywnych zakupów”
- Pozycja listy kontrolnej: MON-03 (z MON-08)
- Poziom: P2
- Realność: brzegowy · Pewność: wysoka
- Rodzaj: D
- Dowód: `src/lib/app-access.ts:47` (`ustalDostep(await przywroc())`), `src/lib/platnosci/sklep.ts:167` i `src/lib/platnosci/sklep.ts:168` (po udanym `restorePurchases()` drugi odczyt, który przy błędzie albo limicie 15 s zwraca `blad`), `src/lib/platnosci/dostep.ts:40` (przy `blad` dostęp tylko z pamięci; na nowym telefonie pamięć pusta), `src/components/przywroc-zakupy.ts:16` (fałsz → komunikat o braku aktywnych zakupów). Test przywracania obejmuje tylko wyjątek z samej synchronizacji (dowody/e1-przywracanie-blad.txt).
- Mechanizm: wynik przywracania to `boolean`, który nie odróżnia „sklep: brak zakupów” od „odczyt nieudany”; `grep -n "przywrocZakupy\|przywrocZKomunikatem"` → 3 miejsca: `src/lib/app-access.ts:141`, `src/components/settings/ZakupySection.tsx:26`, `src/components/PaywallModal.tsx:139`.
- Powraca: nie
- Kroki w aplikacji: nowy telefon, słaba sieć, Ustawienia → „Przywróć zakupy”; synchronizacja przechodzi, odczyt uprawnień przekracza 15 s → komunikat, że zakupów nie ma. Dostęp wraca sam przy następnym odczycie (start, powrót na pierwszy plan), więc zakup nie ginie.
- Test akceptacyjny: test z `restorePurchases` udanym i `getAvailablePurchases` rzucającym (albo limitem) pokazuje „Nie udało się połączyć z App Store. Spróbuj ponownie.” i nie nadaje dostępu.

### 02-monetyzacja-006 · Subskrybent nie może w aplikacji przejść na zakup dożywotni
- Pozycja listy kontrolnej: MON-16
- Poziom: P2
- Realność: brzegowy · Pewność: wysoka
- Rodzaj: P
- Dowód: `src/components/AppAccessProvider.tsx:27` (z Pro ekran dostaje `aktywny`), `src/components/PaywallModal.tsx:88` i `src/components/PaywallModal.tsx:197` (z Pro tylko przycisk zarządzania subskrypcją, bez opcji zakupu) (dowody/e1-pro-bez-zmiany-planu.txt).
- Mechanizm: ekran Pro ma dwa tryby (zakup albo stan aktywny); przejście subskrypcja → dożywotni nie ma trybu. Zmiana planu w grupie (miesięczny ↔ roczny) działa przez systemowe „Zarządzaj subskrypcją”.
- Powraca: nie
- Kroki w aplikacji: subskrybent miesięczny → Ustawienia → Piekarz Pro → „Piekarz Pro jest aktywny.”, brak opcji dożywotniej; musi anulować, poczekać do końca okresu i wtedy kupić.
- Test akceptacyjny: zależny od decyzji; przy (a) test ekranu Pro z aktywną subskrypcją pokazuje opcję dożywotnią i zdanie o anulowaniu.

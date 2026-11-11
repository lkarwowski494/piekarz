# Recenzja KO-039/KO-040: nagłówki ramek 1, 3, 7 (72a3bef..929cd85)

Sprawdzone: diff, kod (notifications.ts, ZgodaPowiadomien.tsx, SleepGuardBanner.tsx, core/reverse-scheduler.ts, StudioEcosystemSection.tsx, package.json), słowniki i18n 28 języków, `npx jest tests/store-caption-layout.test.ts tests/ramki-sklepu-podpisy.test.ts tests/ramki-sklepu-atuty-ko039.test.ts` (81/81 zielone).
Limit/format: wszystkie 3x34 nagłówki ≤ 40 punktów kodowych (maks. 40: ms ramka 1; 39: el, id, vi), brak „@” na początku, „%”, „\”; układ ja/zh-Hant przechodzi. Brak uwag do limitu.

## P1

**P1-1. Ramka 1, „bez kroków w nocy” jest obietnicą bezwarunkową, której aplikacja nie daje** (PL/EN §3 docs/app-store-metadata-v2.md i `ramki[0].naglowek` we wszystkich 34 lokalizacjach; Guidelines 2.3 / 2.3.7).
Kod: `autoResolveSleepCollision` (src/core/reverse-scheduler.ts:338-369) zwraca `null`, gdy żadne garowanie w lodówce 8-24 h nie omija nocy; wtedy `SleepGuardBanner` pokazuje tylko ostrzeżenie „{krok} wypada o {godzina} w nocy” i tekst „Sugerowana korekta…”. Opis (pl.json) mówi uczciwie: „Piekarz zaproponuje dłuższy czas w lodówce”, „gdy czasu jest za mało, poda najwcześniejszą możliwą godzinę”, dotyczy kroku „wymagającego twoich rąk”, okno snu jest domyślne (23:00-07:00, do zmiany w Ustawieniach), a plan wstecz to Pro. Do tego widok ramki (§3) to właśnie baner kolizji „wypada w nocy” z „Przesuń do lodówki”: obraz pokazuje krok w nocy pod hasłem „bez kroków w nocy”. Podtytuł „Plan wstecz bez kroków w środku nocy” (niezmieniony) ma ten sam problem, ale na obrazie go nie ma.
Propozycja (twierdzi tylko to, co robi aplikacja): PL „Gotowe na twoją godzinę, noc pod kontrolą” albo „Ostrzega, gdy krok wypada w nocy” (32); EN „Ready When You Say, Night Steps Flagged” lub „Warns If a Step Falls at Night”. Alternatywa: zostawić hasło, ale zmienić widok ramki na plan bez kolizji (po „Przesuń do lodówki”) i złagodzić do „…bez nocnych kroków (gdy się da)”. Potem przeliczyć 34 lokalizacje i zaktualizować glosariusz/test (rdzeń „noc” zostaje).

## P2

**P2-1. Ramka 3: nagłówek bez warunku zgody** (PL/EN i 34 lokalizacje). „Powiadomienie, gdy telefon śpi” / „Notified Even When Your Phone Sleeps” jest prawdziwe tylko po zgodzie systemowej (ZgodaPowiadomien.tsx; `resyncNotifications` planuje tylko dla `status === 'granted'`; lokalne DATE trigger, notifications.ts:156-170 — twierdzenie o działaniu przy śpiącym telefonie jest poza tym zgodne z kodem). Warunek stoi tylko w opisie (KO-034), a na obrazie widać sam nagłówek. Ryzyko niskie (to powszechna konwencja, zgoda jest standardem iOS), ale to nowa, jawnie unconditional formuła. Propozycja: zostawić nagłówek (konwencja iOS, warunek jest w opisie i podtytule), ale odnotować to jako świadome ryzyko w dzienniku; wariant bezpieczniejszy, PL „Powiadomienie o końcu kroku” / EN „Alerts When Each Step Ends” (traci „gdy telefon śpi”).

**P2-2. Ramka 1: utrata pojęcia „gotowe”/przedmiotu w 31 lokalizacjach alfabetycznych.** Stary nagłówek mówił „Chleb gotowy na twoją godzinę”; nowy PL „Na twoją godzinę, bez kroków w nocy”, de „Zu deiner Zeit, ohne Schritte nachts”, es/es-MX/fr/id/ms zachowały „Listo/Prêt/Siap”, cs „Na vaši hodinu…”, sk, sl, hr, ru, uk, nb, da, sv, nl, tr, fi, hu, id (z „Siap”), ms (Siap), vi, el: pozostaje „na twoją godzinę, bez nocy” bez czasownika, co jest nieczytelne jako obietnica (na godzinę co?). ja/ko/zh-Hant zachowały „完成/완성/出爐”. Wynika z błędu źródła (PL/EN bez „gotowe”/„ready”, EN ma „Ready”, PL nie: PL jest słabszy od EN). Propozycja: PL ze słowem „gotowe”: „Gotowe na twoją godzinę” (23) + część o nocy po P1-1. Dla pozostałych języków spójnie z PL.

**P2-3. ja, ko, zh-Hant ramka 7: „広告も不要 / 광고도 … 필요 없어요 / 廣告 … 不需” znaczy „reklamy nie są potrzebne”, nie „bez reklam”.** ja `アカウントも広告もネットも不要`, ko `계정도 광고도 인터넷도 필요 없어요`, zh-Hant `不需帳號、廣告和網路`. Reklamy nie są czymś, czego się „potrzebuje”; rozszerzenie wzorca „X nie jest potrzebne” z konta/internetu na reklamy daje zdanie dziwne/nieidiomatyczne. Słowniki aplikacji mówią „広告がない / 광고 … 없어요 / 沒有…廣告”. Propozycja: ja `アカウント・広告・通信なし` albo `アカウントも広告もなし、通信も不要`; ko `계정·광고·인터넷 없이 사용해요`; zh-Hant `無帳號、無廣告、免連網` (+ w ja/zh „ネット/網路” → „インターネット/網際網路” jak w słowniku, patrz P3).

**P2-4. hu ramka 1 „Az órádra”** dosłownie „na twój zegarek/zegar”; nie znaczy „na twoją godzinę”. Propozycja: „A kívánt órára, éjszakai lépések nélkül” (36) albo „Kész, amikorra kéred, …” — po zmianie P1-1.

**P2-5. Ramka 1: funkcja Pro bez oznaczenia na obrazie.** Plan wstecz „od godziny gotowe” to Pro (harmonogram.tsx:86, 242; Basic = plan od teraz). Oznaczenie „wymaga Piekarz Pro” jest w `zrzuty/*/podpisy.json`, ale zgodnie z opisem zadania na obrazie jest tylko nagłówek; 2.3.2 wymaga jasnego oznaczenia w opisie (jest, „(Pro)”), na zrzutach co najmniej bezpieczniej. Niezmienione względem poprzedniej wersji; odnotować.

**P2-6. Test KO-039 sprawdza obecność terminu, nie sens twierdzenia (da się go oszukać realnie).** Patrz sekcja „Test” niżej.

## P3

- P3-1. en (4 lokalizacje) „Ready at Your Time” nieidiomatyczne („at Your Time”); „Ready When You Say” / „Ready on Your Schedule”.
- P3-2. ru „Без аккаунта, рекламы и интернета” i uk „Без акаунта, реклами й інтернету”: słownik aplikacji używa „учётная запись”/„обліковий запис” (аккаунт/акаунт tylko w nagłówku). Poprzedni nagłówek miał to samo; spójnie: „Без учётной записи, рекламы и интернета” (40, na granicy) lub zostawić jako krótszy potoczny.
- P3-3. el ramka 7 „…διαφημίσεις, internet”: słownik ma „διαδίκτυο”; nagłówek ma łaciński „internet”. Ramka 3: „Ειδοποίηση, όταν κοιμάται το τηλέφωνο” ok.
- P3-4. ja „ネット” (potocznie) vs „インターネット” w słowniku; zh-Hant „網路” vs „網際網路” w słowniku (dopuszczalne skrótowo).
- P3-5. ko ramki 3 i 7 w stylu zdaniowym (`…와요`, `…없어요`), reszta nagłówków ko to równoważniki nazwy (`…고칠 점`, `…를 기록`). Spójnie: `휴대폰이 잠겨도 알림 도착`, `계정·광고·인터넷 없이`.
- P3-6. fi ramka 1 „Omaan aikaan” (dosł. „w swoim czasie”) dwuznaczne; „Haluamaasi aikaan” (zgodne ze starym „silloin kun haluat”). tr ramka 1 „gece adım yok” telegraficzne; „Gece adımı olmadan” naturalniej.
- P3-7. Ramka 3 w hr/sv/de/fi/id/vi/uk/el/ko mówi „zablokowany/gesperrt/lukittuna…”, w en/pl/cs/hu/nl/tr „śpi/sleeps” (zgodnie z wersją słownika każdego języka — OK, ale rdzeń „śpiący telefon” w źródle nie wymaga blokady ekranu; różnica niewielka).
- P3-8. Ramka 7 „bez internetu”: w aplikacji zakup/przywracanie Pro i otwarcie polityki prywatności/EULA wymagają sieci (PaywallModal, StudioEcosystemSection — przy braku sieci jest komunikat). Opis sklepu ma to samo twierdzenie od dawna, rdzeń działa offline; ryzyko niskie. „Bez reklam”: package.json bez SDK reklamowych ani analityki; karta ekosystemu Apps4Brew w Ustawieniach to własna oferta, nie reklama sieciowa — twierdzenie zgodne z kodem i tekstem Ustawień.
- P3-9. Format układu: ms ramka 1 ma dokładnie 40 znaków (bez zapasu); id/el/vi 39. Limit spełniony, ale zmiana w korekcie P1-1 powinna zejść poniżej 38 gdzie się da.

Zgodność terminologii ze słownikiem aplikacji (powiadomienie, reklamy, noc): zweryfikowana dla wszystkich 28 języków słowników (ZgodaPowiadomien, ekran Kontakt, SleepGuardBanner): cs oznámení, da notifikation, de Mitteilung, el ειδοποίηση, es notificación, fi ilmoitus, fr notification, hr obavijest, hu értesítés, id notifikasi, it notifica, ja 通知, ko 알림, ms pemberitahuan, nb varsel, nl melding, pt notificação, ro notificare, ru уведомление, sk upozornenie, sl obvestilo, sv notis, tr bildirim, uk сповіщення, vi thông báo, zh 通知; reklamy: wszystkie zgodne (nl advertenties, sv annonser, nb reklame, de Werbung, fr publicité itd.). Forma zwracania się: spójna z pozostałymi nagłówkami lokalizacji (de/es/it/hr/ro/nl „du/tú/tu/ti”; cs/sk/sl/ru-neutralnie/uk/el/pt/fr/tr/id/vi formalnie lub bezosobowo). Gramatyka: bez błędów rażących. Przekład natywnie nieprzejrzany (DEC-06).

## Test tests/ramki-sklepu-atuty-ko039.test.ts

Pilnuje: (a) że klucze źródłowe istnieją w kodzie ekranów, (b) że glosariusz ma wszystkie języki, (c) że rdzeń terminu występuje w tekście aplikacji ORAZ w nagłówku właściwej ramki (3 pojęcia x 34 lokalizacje). Wzorzec ze słownika aplikacji jest dobry (rdzeń musi być w słowniku, nie tylko w glosariuszu).
Słabości (realne sposoby obejścia/ślepe punkty):
1. **Brak kontroli polaryzacji i kontekstu.** Nagłówek „Reklamy, konto i internet” albo „Kroki w nocy” przechodzi tak samo jak „Bez reklam…”/„bez kroków w nocy”; nie ma wymogu negacji (bez/no/ohne/sin/無…). Test nie ochroni przed twierdzeniem odwrotnym ani przed P1-1 (przechodzi dokładnie obietnica bezwarunkowa), ani przed P2-3.
2. **Rdzenie jako podciągi bywają zbyt krótkie/ogólne:** en `ads` (wystarczy „loads”, „heads”, „downloads”), ko `밤` (1 znak; „밤” w „밤나무”, „한밤”), cs/sk `noc`, `rekl`/`reklam`, pl `w nocy`; fi `yöhön` to konkretna forma, więc „yöhön” w ramce o czymkolwiek też przejdzie. Poprawka: granice słów (regex z \b / segmentacja) lub dłuższe rdzenie.
3. **Termin ze słownika jest sprawdzany w całym zdaniu aplikacji**, nie w konkretnej frazie: rdzeń „noc” jest sprawdzany w szablonie z „w nocy”, ale np. `reklam` w zdaniu o prywatności będzie zawsze, więc sam test (a) nie dowodzi, że aplikacja ma reklamy lub ich nie ma (z natury: kontrola tekstu, nie zachowania).
4. **Ręcznie wpisany glosariusz rdzeni** jest też zbiorem danych do edycji: dopisanie rdzenia pasującego do nagłówka (a do tekstu aplikacji pasującego przypadkiem) obejdzie kontrolę; test nie weryfikuje, że rdzeń jest pełnym słowem. Pokrycie (b) wymusza tylko listę języków.
5. **Nie kontroluje** spójności z §3 docs/app-store-metadata-v2.md (PL/EN w md vs pl.json/en-US.json; pilnują tego inne testy, np. metadane-sklepu), podtytułów (podtytuł ramki 1 „bez kroków w środku nocy” ma ten sam problem P1-1), ani warunku zgody (ramka 3), ani oznaczenia Pro (ramka 1).
6. Zachowanie: `setLang` w try/finally poprawnie przywraca język; `.sort()` i `.toEqual` dają czytelne komunikaty; `naglowki[ekran-1]` mapuje po indeksie na stałe (ekrany 1/3/7), więc zmiana kolejności ramek wymaga ręcznej zmiany glosariusza.
Wniosek: test poprawnie wymusza użycie słownikowego terminu w nagłówku danej ramki, ale nie wykrywa fałszywego ani odwróconego twierdzenia. Propozycja: dodać obowiązkowy rdzeń negacji dla ramek 1 i 7 (np. `negacje` w glosariuszu, sprawdzane w słowniku aplikacji i w nagłówku), granice słów, i dla ramki 3 wymóg elementu „gdy telefon śpi/zablokowany” ze słownika.

## Liczba uwag
P1: 1, P2: 6 (jedna to test), P3: 9. Razem 16.

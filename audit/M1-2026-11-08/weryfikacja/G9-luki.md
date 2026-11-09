# Weryfikacja G9-luki — hipotezy bez rozstrzygnięcia (M1 2026-11-08)

Repo: /home/user/piekarz, commit 2ef8870a525485cc1ac57e5abe9d97d9937dfe42 (sprawdzony `git rev-parse HEAD`). Wejście: `weryfikacja/G9-luki-wejscie.md`. Sondy uruchomione w osobnym worktree w scratchpadzie (`git worktree add --detach`), pliki śledzone repo bez zmian. Pełne cytaty kodu stoją w uzasadnieniach niżej; w tabeli są same odwołania.

| ID | Wynik | Dowód | Poziom/realność |
|---|---|---|---|
| H1 | obalone | jedna ścieżka uzgadniania z bazą `src/lib/notifications.ts:121`; po każdym zapisie stanu wypieku `src/hooks/useBakeSession.ts:72`; koniec, przerwanie, start i powrót z tła `src/hooks/useFinishBake.ts:85`, `src/lib/przerwij-wypiek.ts:60`, `app/_layout.tsx:41`, `app/_layout.tsx:89`; sonda `dowody/G9-luki-H1-sonda.txt` (exit=0), testy `dowody/G9-luki-testy-powiadomien.txt` (exit=0) | brak defektu; luki z hipotezy nie ma |
| H2 | obalone | limit 40 `src/core/notification-config.ts:33`; priorytet i przycięcie `src/core/notification-plan.ts:247`; sonda najgorszego przypadku `dowody/G9-luki-H2-sonda.txt` (exit=0): 40 z popytu 46 | limitu iOS nie przekracza; resztka P2, brzegowy (niżej) |
| H3 | obalone | baner przy odmowie `src/components/NotificationsOffBanner.tsx:28`, użyty w `src/components/stolnica/ProwadzenieWypieku.tsx:342`, `app/(tabs)/(dzis)/index.tsx:157`, `app/(tabs)/zakwasy/index.tsx:189`; sonda cofnięcia zgody `dowody/G9-luki-H3-sonda.txt` (exit=0) | brak defektu |
| H4 | potwierdzone | diagnoza tylko w stanie ekranu `app/doktor.tsx:46`; Doktor bez id wypieku `src/components/stolnica/ProwadzenieWypieku.tsx:100`; przy «Piecz ponownie» tylko notatka `src/components/harmonogram/NotatkiPlanu.tsx:20`; grep `dowody/G9-luki-H4-grep.txt` (exit=1 dla warstwy danych i receptur) | P2, realny |

## H1 · Powiadomienia za zmianą planu — obalone

**Architektura (ADR-006).** Jedna ścieżka uzgadnia oczekujące powiadomienia z bazą: `src/lib/notifications.ts:3` „Jedna ścieżka: resyncNotifications() uzgadnia listę oczekujących z planem z bazy.”

- Plan liczy funkcja `planNotifications`. Bierze wszystkie trwające i zaplanowane wypieki: `src/lib/notifications.ts:149` „sessions: (await loadActiveBakeSessions())”. Definicja funkcji: `src/core/notification-plan.ts:234`.
- Różnicę liczy `diffNotifications`: kasuje identyfikatory spoza planu i planuje na nowo te, którym zmienił się odcisk (termin, treść, język, id wypieku). `src/core/notification-plan.ts:277` „const cancel = ours.filter((p) => !wanted.has(p.id))”.

**Wywołania po każdej zmianie.**

- Stolnica zapisuje każdą zmianę kroku, planu i zegara, a po udanym zapisie uzgadnia powiadomienia: `src/hooks/useBakeSession.ts:72` „void resyncNotifications();”.
- Tędy przechodzi «Zrobione», które przesuwa dalsze kroki: `src/components/stolnica/ProwadzenieWypieku.tsx:270` „const wynik = confirmStep(postep(), Date.now());”.
- Tędy przechodzi też «Cofnij poprzedni»: `src/components/stolnica/ProwadzenieWypieku.tsx:282` „const { progress } = undoConfirm(undo, Date.now());”.
- Skok do kroku z arkusza planu, czyli pominięcie: `src/components/stolnica/ProwadzenieWypieku.tsx:234` „const skok = skokDoKroku(postep(), idx, Date.now());”.
- Koniec wypieku: `src/hooks/useFinishBake.ts:85` „void resyncNotifications();”.
- Przerwanie wypieku: najpierw kasuje wiersz, potem czeka na uzgodnienie. `src/lib/przerwij-wypiek.ts:60` „await resyncNotifications();”.
- Plany na przyszłe dni: `src/lib/plany-akcje.ts:25` „if (r.ok) void resyncNotifications();”. Zapis planu: `src/hooks/useStartPlanu.ts:125` „void resyncNotifications();”.

**Ponowne uruchomienie.** Aplikacja uzgadnia przy starcie i przy powrocie z tła.

- Start: `app/_layout.tsx:41` „void resyncNotifications();”.
- Powrót z tła: `app/_layout.tsx:89` „if (s === 'active') void resyncNotifications();”.
- Test `src/__tests__/start-aplikacji-p11.test.tsx` przechodzi (`dowody/G9-luki-testy-powiadomien.txt`).

**Wydłużenia kroku nie ma od 056.** Nie ma więc czego uzgadniać:

- `src/components/stolnica/ProwadzenieWypieku.tsx:111` „Czas kroku biegnie od planu, bez „Start”/„Wstrzymaj””
- `src/__tests__/notifications-pending.test.tsx:96` „czas kroku biegnie od planu (bez Start/Wstrzymaj/+5 min)”

**Sonda `dowody/G9-luki-H1-sonda.txt` (exit=0, 2/2).**

- «Zrobione» po 10 min: bieżący krok na teraz + 45 min, krok 2 o 350 min wcześniej, `krok.1` znika.
- «Cofnij poprzedni»: te same 12 identyfikatorów i terminy co przed potwierdzeniem.
- Restart z obcym oczekującym `piekarz.wypiek.duch.krok`: obcy znika, a powiadomienia wypieku wracają.
- Dwa trwające wypieki (12 + 11 powiadomień): przerwanie A zostawia wszystkie 11 powiadomień B.

**Zastrzeżenie bez skutku na teście.** Wyjątek w uzgadnianiu zwraca `ok:false` bez komunikatu: `src/lib/notifications.ts:176` „return { status, ok: false };”. Następne uzgodnienie (powrót z tła) naprawia stan.

## H2 · Limit oczekujących powiadomień iOS — obalone

**Źródło limitu.** Dokumentacja Apple dla wycofanego `UILocalNotification` (https://developer.apple.com/documentation/uikit/uilocalnotification) mówi: "the system keeps the soonest-firing 64 notifications … and discards the rest". Dla `UNUserNotificationCenter` Apple liczby nie podaje. Kod cytuje to samo źródło: `src/core/notification-config.ts:30` „najbliższe 64 (OP-56: dokumentacja wycofanego API, S-74)”.

**Kod ogranicza i ustala priorytety.**

- Limit: `src/core/notification-config.ts:33` „export const MAX_PENDING_NOTIFICATIONS = 40;”.
- Kolejność grup: kroki trwających wypieków, potem starty zaplanowanych, potem karmienia i budzenia; w grupie wcześniejsze przed późniejszymi. `src/core/notification-plan.ts:246` „.sort((a, b) => a.grupa - b.grupa || a.p.triggerAt - b.p.triggerAt)”.
- Przycięcie: `src/core/notification-plan.ts:247` „.slice(0, MAX_PENDING_NOTIFICATIONS)”.
- Testy `src/core/__tests__/powiadomienia-wypiekow-d2.test.ts` («limit to 40 (iOS trzyma 64)», «nadmiar: …») przechodzą.

**Najgorszy przypadek z limitów kodu.**

- 2 trwające wypieki: `src/core/limity-wypiekow.ts:7` „export const MAX_TRWAJACYCH_WYPIEKOW = 2;”.
- 5 zaplanowanych: `src/core/limity-wypiekow.ts:10` „export const MAX_ZAPLANOWANYCH_WYPIEKOW = 5;”.
- 7 budzeń, po jednym na wypiek.
- N zakwasów, po jednym przypomnieniu na zakwas: `src/core/notification-feeding.ts:121` „id: `${NOTIF_PREFIX}karmienie.${s.id}.1`,”.
- Sonda z N = 10: 40 z popytu 46 (24 kroki, 5 startów, 11 z 17 karmień i budzeń). Wynik nigdy nie przekracza 40, więc zostaje poniżej 64.

**Resztka (nie to, co twierdzi hipoteza).** Priorytet idzie po grupie, nie po czasie. W sondzie odpada 6 budzeń zakwasu za 2 h, a zostaje krok za 29,25 h. Wracają przy najbliższym uzgodnieniu (otwarcie aplikacji, każda zmiana). Skutek pojawia się dopiero przy 2 trwających, 5 zaplanowanych i wielu zakwasach naraz: **P2, brzegowy**.

## H3 · Brak zgody na powiadomienia — obalone

**Baner przy odmowie.** «Powiadomienia wyłączone» z «Otwórz Ustawienia» pokazuje się, gdy zgoda jest „denied”: `src/components/NotificationsOffBanner.tsx:28` „if (status !== 'denied') return null;”. Stan banera przychodzi z każdego uzgodnienia: `src/components/NotificationsOffBanner.tsx:21` „const off = subscribeNotificationPermission((s) => alive && setStatus(s));”.

**Gdzie baner stoi na stałe.**

- Prowadzenie: `src/components/stolnica/ProwadzenieWypieku.tsx:342` „<NotificationsOffBanner />”.
- «Dziś», gdy jest wypiek, plan albo kalendarz: `app/(tabs)/(dzis)/index.tsx:157` „dane.plany.length > 0”.
- Zakwasy: `app/(tabs)/zakwasy/index.tsx:189` „<NotificationsOffBanner />”.
- Bez zgody znika też zdanie «Powiadomienie o {godzina}»: `src/lib/prowadzenie-teksty.ts:134` „biegnie && !krok.isPassive && w.zgodaPowiadomien”.

**Cofnięcie zgody w Ustawieniach.** Powrót do aplikacji, potem „active” (`app/_layout.tsx:89`), uzgodnienie i baner.

- Sonda `dowody/G9-luki-H3-sonda.txt` (exit=0): przy zgodzie baneru brak i czeka 12 powiadomień; po DENIED i uzgodnieniu baner jest, a oczekujących 0.
- Testy `src/__tests__/notifications-pending.test.tsx` i `src/__tests__/dzis-powiadomienia-wylaczone-w2.test.tsx` przechodzą (`dowody/G9-luki-testy-powiadomien.txt`).

**Uwaga bez wagi defektu.** Ekran tworzenia planu (harmonogram) nie ma baneru, ale zapisany plan pokazuje go na «Dziś».

## H4 · Doktor nie przenosi zmiany na następny wypiek — potwierdzone

**Diagnoza żyje tylko w stanie ekranu.**

- `app/doktor.tsx:46` „const [symptoms, setSymptoms] = useState<BreadInspectionCriteria>({});”
- `app/doktor.tsx:70` „return diagnoseBreadDefect(symptoms);”
- Nic jej nie zapisuje: grep po `src/data`, `src/recipes`, `src/components/receptury`, `src/components/harmonogram` i `app/(tabs)/receptury` daje exit=1 (`dowody/G9-luki-H4-grep.txt`).

**Doktor nie wie, którego wypieku dotyczy.**

- Wywołanie bez parametru: `src/components/stolnica/ProwadzenieWypieku.tsx:100` „openDoctor: chron('doktor', () => router.push('/doktor')),”.
- Decyzja D-216 to potwierdza: `docs/decyzje.md:1224` „Ekran nie wie, skąd wszedł użytkownik”.

**«Piecz ponownie» pokazuje tylko notatkę użytkownika.**

- `src/components/harmonogram/NotatkiPlanu.tsx:20` „Notatka z poprzedniego wypieku: {notatka}”.
- Notatkę wpisuje się w ocenie, zanim aplikacja zaproponuje Doktora: `src/lib/doctor-suggestion.ts:27` „Wpis jest w historii. Doktor Chleba podpowie, co zmienić przy następnym wypieku.”.
- Wpisu nie da się potem edytować (grep exit=1 w tym samym pliku dowodu).

**Co jest spełnione.**

- Karta wyniku pokazuje, co zmienić: `src/components/doktor/DiagnosisResultCard.tsx:105` „Co zrobić przy następnym wypieku:”. Obok jest przycisk «Kopiuj jako tekst».
- To spełnia BR-DIAG-001: `docs/brd/wymagania-dziennik.md:142` „Wtedy widzi możliwe przyczyny z treści roli 06 i jedną zmianę na następny wypiek”.
- Spełnia też BR-RECP-003: `docs/brd/wymagania-dziennik.md:54` „Wtedy zaczyna PR-02 z tą samą recepturą i widzi notatkę z poprzedniego razu”.
- Spełnia dosłowny tekst sklepu: `docs/app-store-metadata-v2.md:94` „says what to change next time”.

**Poziom: P2, realny.** Żadne wymaganie ani obietnica tego nie łamie. Zalecana zmiana ginie jednak przy każdym wypieku z oceną ≤ 2★, a cel «pomaga poprawiać następny wypiek» spełnia się tylko przez ręczną notatkę. Nie P1, bo przepływ działa zgodnie z BR, a brakuje tylko przeniesienia.

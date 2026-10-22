---
status: przyjęta
data: 2026-10-19
decyduje: właściciel (DEC-02 z planu napraw M2, wybór (a), 2026-10-19) / dokumentacja Apple i Expo (fakty o platformie)
zastępuje: ADR-005 w części „alarmy w tle” (pkt 2 opcji A); reszta ADR-005 bez zmian
---
# ADR-006. Koniec kroku i termin karmienia jako powiadomienia lokalne na bezwzględną datę, uzgadniane z zapisanym stanem

> Aktualizacja M3 D2 (2026-10-22, D-103): treść poniżej opisuje stan z jednym wypiekiem. Od D2 plan obejmuje wiele wypieków: identyfikatory `piekarz.wypiek.<id wypieku>.krok…` zamiast `piekarz.krok…`, limit `MAX_PENDING_NOTIFICATIONS = 40` z priorytetem (kroki trwających, starty zaplanowanych, karmienia) i stały dzień karmienia w lodówce. Do uzgodnienia przez rolę 05.

## Kontekst i problem

Cel aplikacji: „pilnuje czasu, gdy telefon śpi”. Alarm Stolnicy jest dziś dźwiękiem w JS odpalanym z `setInterval` na ekranie (`app/(tabs)/stolnica.tsx`, efekt odliczania; `src/lib/timer-audio.ts`), więc przy zablokowanym telefonie albo innej aplikacji nie przychodzi nic. Karmienie zakwasu zapisuje tylko `lastFedAt` bez przypomnienia. Wymagania: BRD `B3.md` BR-CZAS-001 kryt. 2 i BR-CZAS-002 kryt. 1, `B2.md` BR-ZAKW-004, `A3a.md` Z-041, `A3b.md` Z-056. Znalezisko M1-audytor-generalny-006 (źródła: 03-zakres-001, 01-odkrywanie-004, 05-architekt-005, 11-wzrost-002, 04-studio-projektowe-005, 08-programista-004).

Koniec zegara jest już w bazie (`timerEndsAt` w `active_bake_session`, `src/core/bake-session.ts`, `src/data/bake-session-store.ts`, commit bb627e1, M1-audytor-generalny-019), więc data powiadomienia ma trwałe źródło.

## Czynniki decyzji

- Expo SDK 57 planuje powiadomienie lokalne na datę: „Schedule a one-off notification for a specific date” oraz `DateTriggerInput` „delivered once on the specified value of the date property” (docs.expo.dev/versions/v57.0.0/sdk/notifications, odczyt 2026-10-19).
- Zgodna wersja: „Recommended version: ~57.0.23” (tamże); npm `dist-tags.sdk-57 = 57.0.23`, licencja MIT (registry.npmjs.org/expo-notifications, odczyt 2026-10-19). Projekt: `expo ~57.0.26`.
- Ten sam identyfikator podmienia oczekujące: „If the identifier matches a pending request, the new request replaces the pending request.” (developer.apple.com, `UNNotificationRequest init(identifier:content:trigger:)`, odczyt 2026-10-19).
- Time Sensitive: „can break through system controls such as Notification Summary and Focus. The user can turn off the ability for time sensitive notification interruptions.” (developer.apple.com, `UNNotificationInterruptionLevel.timeSensitive`, odczyt 2026-10-19). Uprawnienie: „Time Sensitive Notifications com.apple.developer.usernotifications.time-sensitive” (docs.expo.dev/build-reference/ios-capabilities, odczyt 2026-10-19). Strona Apple dla tego klucza: `[DO USTALENIA]` (404 w dniu odczytu).
- Zgoda w kontekście: „Sending the request in context provides a better experience than automatically requesting authorization on first launch” (developer.apple.com, „Asking permission to use notifications”, odczyt 2026-10-19).
- Zero sieci (CLAUDE.md, zasada 1): powiadomienia lokalne nie wysyłają nic poza urządzenie; tokenów push nie pobieramy.
- Bez `UIBackgroundModes` (`scripts/verify-native.mjs` zabrania `audio`; `remote-notification` nie jest potrzebny, bo `enableBackgroundRemoteNotifications` domyślnie `false`).

## Rozważane opcje (DEC-02)

- (a) Powiadomienia lokalne dla każdego kroku i karmienia, Time Sensitive dla kroków krytycznych, prośba o zgodę przy pierwszym timerze; bez Live Activity w 1.0.
- (b) Jak (a) plus Live Activity dla faz krótszych niż 8 h.
- (c) Usunięcie obietnicy „pilnuje czasu, gdy telefon śpi” z celu i tekstów.

## Decyzja

Wybrano (a) (właściciel, 2026-10-19). Dowodu przeciwko (a) w dokumentacji przeczytanej 2026-10-19 nie znaleziono: data bezwzględna, podmiana po identyfikatorze, kasowanie i poziom Time Sensitive są w API Expo 57.

Mechanizm: **uzgadnianie (reconcile), nie zdarzenia.** Czysta funkcja wylicza z zapisanego stanu (sesja wypieku, zakwasy) pełną listę powiadomień, które powinny czekać; adapter porównuje ją z listą oczekujących w systemie i kasuje albo planuje różnicę. Każde zdarzenie (start, pauza, +5 min, zmiana kroku, koniec, odrzucenie, karmienie, import, czyszczenie, start aplikacji, powrót z tła) wywołuje to samo `resyncNotifications()`. *Dlaczego:* jedna ścieżka zamiast kilkunastu par „zaplanuj/odwołaj”, więc pominięte zdarzenie nie zostawia osieroconego alarmu, a test listy oczekujących sprawdza wynik, nie kolejność wywołań.

### Kontrakt

**Moduły** (granice: interfejs → `src/lib` → `src/core`; domena bez importów Expo/React):

| Plik | Rola | Zawartość |
|---|---|---|
| `src/core/notification-config.ts` | konfiguracja | `NOTIF_PREFIX = 'piekarz.'`, `NOTIF_ID_BAKE = 'piekarz.krok'`, `FEED_ROOM_TEMP_AFTER_MS = 24 h` (Z-041), `FEED_FRIDGE_DUE_AFTER_MS = 7 d` (BR-ZAKW-004 kryt. 1), `MAX_PENDING_NOTIFICATIONS = 20`, `TIME_SENSITIVE_STEPS` (niżej) |
| `src/core/notification-plan.ts` | domena, czyste funkcje | `planBakeNotification`, `planFeedingNotifications`, `planNotifications`, `notificationFingerprint`, `diffNotifications` |
| `src/lib/notifications.ts` | adapter `expo-notifications` | `getNotificationPermission`, `ensureNotificationPermission`, `resyncNotifications`, `configureNotificationHandler`; jedna kolejka wywołań |
| `src/hooks/useNotificationPermission.ts` | interfejs | stan zgody dla banera „Powiadomienia wyłączone” |

**Typy i sygnatury** (`src/core/notification-plan.ts`):

```ts
export type NotificationKind = 'krok' | 'karmienie';
export type NotificationLevel = 'active' | 'timeSensitive';
export type NotificationTextKey =
  | 'krok.koniec' | 'krok.zdejmijPokrywke' | 'krok.wypiekGotowy'
  | 'karmienie.blat' | 'karmienie.lodowkaTermin';
export interface PlannedNotification {
  id: string;                 // NOTIF_ID_BAKE albo `piekarz.karmienie.${starterId}.${1|2}`
  kind: NotificationKind;
  triggerAt: number;          // ms UTC, zawsze > now
  level: NotificationLevel;
  textKey: NotificationTextKey;
  params: Record<string, string>; // stepId / starterName; tekst składa adapter przez t()
  route: '/(tabs)/stolnica' | '/(tabs)/zakwas';
}
export interface PendingNotification { id: string; fingerprint: string | null }
export interface PlanStarter { id: string; name: string; storageState: 'ROOM_TEMP' | 'FRIDGE'; lastFedAt?: number }
export interface PlanBakeSession { stepIdx: number; dutchOvenPhase: 'lid_on' | 'lid_off'; timerEndsAt: number | null }

export function planBakeNotification(session: PlanBakeSession | null, now: number): PlannedNotification | null;
export function planFeedingNotifications(starters: readonly PlanStarter[], now: number): PlannedNotification[];
export function planNotifications(input: { session: PlanBakeSession | null; starters: readonly PlanStarter[] }, now: number): PlannedNotification[];
export function notificationFingerprint(p: PlannedNotification): string; // `${triggerAt}|${level}|${textKey}|${JSON.stringify(params)}`
export function diffNotifications(pending: readonly PendingNotification[], desired: readonly PlannedNotification[]):
  { cancel: string[]; schedule: PlannedNotification[] };
```

**Reguły planu:**

1. Krok: brak sesji, `timerEndsAt === null` (pauza, zegar nieuruchomiony, koniec) albo `timerEndsAt <= now` → brak powiadomienia. Inaczej jedno `piekarz.krok` na `timerEndsAt`. Jednocześnie trwa najwyżej jeden wypiek, więc stały identyfikator wystarcza.
2. Tekst kroku: `step_8` + `lid_on` → `krok.zdejmijPokrywke`; `step_8` + `lid_off` → `krok.wypiekGotowy`; pozostałe → `krok.koniec` z `stepId`.
3. Poziom: `TIME_SENSITIVE_STEPS = ['step_8']` (obie fazy garnka: przegapienie oznacza spalony albo niedopieczony chleb w ciągu minut) → `timeSensitive`; pozostałe kroki i karmienie → `active`. Lista jest parametrem produktu w konfiguracji; rola 03 albo właściciel może ją zmienić bez zmiany kodu.
4. Karmienie (`ROOM_TEMP`): jedno `piekarz.karmienie.<id>.1` na `lastFedAt + FEED_ROOM_TEMP_AFTER_MS`. (`FRIDGE`): jedno `.1` na `+7 d` (`karmienie.lodowkaTermin`); przypomnienie `+6 d` usunięte decyzją DEC-22 a (jedno powiadomienie na cykl, 2026-10-21) [M1-audytor-generalny-179]. Bez `lastFedAt` albo termin minął → nic (BRD: „Nienachalne”; bez zaległych alarmów po otwarciu). Karmienie planuje się tylko z uprawnieniem App Store [M1-audytor-generalny-143] i przy włączonym przełączniku „Przypomnienia o karmieniu” w Ustawieniach (`przypomnienia_karmienia` w `app_settings`) [M1-audytor-generalny-179]; kroki wypieku nie zależą od żadnego z nich.
5. `planNotifications`: krok + karmienia, sortowanie po `triggerAt`, krok zawsze zostaje, obcięcie do `MAX_PENDING_NOTIFICATIONS`. Limit systemowy iOS na liczbę oczekujących: `[DO USTALENIA]`; 20 trzyma się daleko od każdej spotykanej wartości.
6. `diffNotifications`: rozważa tylko identyfikatory z `NOTIF_PREFIX`; kasuje te spoza `desired`; planuje te, których brak albo których `fingerprint` się różni (ten sam identyfikator podmienia oczekujące, Apple, wyżej); identyczne pomija.

**Adapter `resyncNotifications(): Promise<{ status: 'granted' | 'denied' | 'undetermined'; ok: boolean }>`:**

1. `getPermissionsAsync()`; o zgodzie decyduje `ios.status` (Expo: „rely on the NotificationPermissionsStatus 's ios.status field”): `AUTHORIZED | PROVISIONAL | EPHEMERAL` = zgoda.
2. Bez zgody: skasuj wszystkie oczekujące z prefiksem i zwróć status. Zegar i alarm w aplikacji działają jak dziś.
3. Ze zgodą: `desired = planNotifications({ session: await loadBakeSession(), starters: await getStarters() }, Date.now())`; `pending` z `getAllScheduledNotificationsAsync()` (`identifier`, `content.data.fp`); `diffNotifications`; `cancelScheduledNotificationAsync(id)` dla `cancel`; dla `schedule`: `scheduleNotificationAsync({ identifier: p.id, content: { title, body, sound: 'default', interruptionLevel: p.level, data: { fp, kind, route } }, trigger: { type: SchedulableTriggerInputTypes.DATE, date: p.triggerAt } })`.
4. Wywołania szeregowane jedną obietnicą (kilka szybkich „+5 min” nie przeplata się). Błąd biblioteki: `catch`, wynik `{ ok: false }`, wpis do dziennika bez nazw zakwasów i receptur; wyjątek nie wychodzi do ekranu.

**Kiedy wywołać `resyncNotifications()`** (po zapisie danych, nie przed):

| Zdarzenie | Miejsce | Skutek na liście oczekujących |
|---|---|---|
| start / wznowienie zegara, start fazy 2 po alarmie pary | `useBakeSession` po `saveBakeSession(snapshot)` | `piekarz.krok` na `timerEndsAt` |
| pauza, reset zegara | jw. (`timerEndsAt = null`) | `piekarz.krok` skasowane |
| „+5 min”, korekta sekund | jw. (nowy `timerEndsAt`, zmiana klucza migawki) | `piekarz.krok` podmienione na nowy czas |
| zmiana kroku, przełączenie fazy garnka | jw. | skasowane (zegar zatrzymany) |
| odrzucenie wypieku, zakończenie wypieku | `stolnica.tsx` po `saveBakeSession(null)` | skasowane |
| karmienie, dodanie, edycja (zmiana przechowywania), usunięcie zakwasu | `zakwas.tsx` po `saveStarter` / `deleteStarter` | karmienia przeliczone; usunięty zakwas bez powiadomień |
| import kopii | `BackupAndDataSection` po `restoreFromBackupData` | karmienia dla zaimportowanych zakwasów; stare skasowane |
| czyszczenie danych | każda przyszła ścieżka po kopii `safetyBackup('reset', …)` i usunięciu | wszystkie z prefiksem skasowane (dziś brak takiej ścieżki w UI, `src/lib/backup.ts:166`) |
| start aplikacji, powrót z tła (`AppState` → `active`), zmiana zgody w Ustawieniach | `app/_layout.tsx` | lista zgodna z bazą (np. po zabiciu procesu albo zmianie strefy czasu) |

**Zgoda:**

- `ensureNotificationPermission()`: gdy `ios.status === NOT_DETERMINED`, wywołuje `requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true, allowBadge: false } })`, potem `resyncNotifications()`. Wywoływana przy pierwszym przejściu zegara w stan „biegnie” (`toggleTimer`, `handleStartPhase2AfterSteamAlert`) oraz przy pierwszym zapisie karmienia (interpretacja „pierwszego timera” dla użytkownika, który używa tylko Zakwasu; do weta). Nigdy przy starcie aplikacji.
- Odmowa: wypiek i alarm w aplikacji działają; Stolnica (przy aktywnym wypieku) i Zakwas pokazują stan „Powiadomienia wyłączone” z przyciskiem do Ustawień systemu (`Linking.openSettings()`), zgodnie z `docs/design-spec.md:121–125`. Teksty i wygląd: rola 04.
- Na pierwszym planie: `setNotificationHandler` w `app/_layout.tsx`: dla `kind === 'krok'` `shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false` (dźwięk gra `timer-audio`), dla `karmienie` baner i dźwięk włączone; `shouldSetBadge: false`. Expo: bez handlera powiadomienie na pierwszym planie nie jest pokazane („For the notification to be presented you have to set a notification handler with setNotificationHandler”).
- Dotknięcie powiadomienia otwiera `data.route` (`useLastNotificationResponse` albo `addNotificationResponseReceivedListener` w `app/_layout.tsx`).

**Konfiguracja natywna:**

- `package.json`: `expo-notifications ~57.0.23` przez `npx expo install expo-notifications` (MIT; `npm run check:licenses`).
- `app.json` → `expo.plugins`: `"expo-notifications"` bez opcji (`enableBackgroundRemoteNotifications` zostaje `false`, więc bez `UIBackgroundModes`).
- `app.json` → `expo.ios.entitlements`: `{ "com.apple.developer.usernotifications.time-sensitive": true }`. EAS synchronizuje capability „Time Sensitive Notifications” przy `eas build` (docs.expo.dev/build-reference/ios-capabilities).
- Skutek uboczny: wtyczka ustawia `aps-environment` („The iOS APNs entitlement is always set to 'development'”), więc EAS włączy też capability Push Notifications. Push nie jest używany; czy da się tego uniknąć: `[DO USTALENIA]`.
- Manifest prywatności: po instalacji sprawdzić `PrivacyInfo.xcprivacy` w `node_modules/expo-notifications` i porównać kategorie z `ios.privacyManifests` (`[DO USTALENIA]`, rola 10).
- Android (poza iOS-first): dokładny czas od Android 12 wymaga `SCHEDULE_EXACT_ALARM` (Expo, jw.); nie dodajemy bez decyzji, bo `android.permissions` zawiera dziś tylko `CAMERA`.
- `jest.setup.js`: atrapa `expo-notifications` z mapą oczekujących (`scheduleNotificationAsync` zapisuje po `identifier`, `cancelScheduledNotificationAsync` usuwa, `getAllScheduledNotificationsAsync` zwraca listę, `getPermissionsAsync` sterowany z testu).

### Konsekwencje

- Dobre: alarm kroku i przypomnienie o karmieniu przychodzą przy zablokowanym telefonie i po zabiciu procesu; kroki w piekarniku przebijają Focus; logika w Node bez telefonu; jedna ścieżka uzgadniania.
- Złe: nowa zależność natywna i nowy build; prośba o zgodę; capability Push Notifications włączona jako efekt uboczny; brak licznika na ekranie blokady (Live Activity poza 1.0).
- Od czego zależy: trwały `timerEndsAt` (ADR-004, M1-audytor-generalny-019); teksty od roli 04; liczby karmienia z BRD (Z-041, BR-ZAKW-004), a ich zgodność z `calculateStarterPhase` (próg 5 dni w lodówce, `src/core/sourdough-physics.ts:95`) i z `docs/design-spec.md:123` („>18h”) sprawdza rola 06.
- Poza zakresem: powtarzanie alarmu co 60 s (BR-CZAS-002 kryt. 2), własne dźwięki piekarskie (Z-055), powiadomienia dla planu z Harmonogramu (plan nie jest zapisywany, `app/(tabs)/harmonogram.tsx:117–127`), Live Activity (DEC-02 (b) odrzucone na 1.0).

### Potwierdzenie

- ARCH-14: w `app/` i `src/` każda ścieżka zmieniająca zegar albo zakwas kończy się `resyncNotifications()`; `grep scheduleNotificationAsync` trafia tylko w `src/lib/notifications.ts`.
- ARCH-03: `src/core/notification-plan.ts` i `notification-config.ts` bez importów spoza `src/core` (poza `import type`).
- Testy jednostkowe planu (Node): bieg → jedno `piekarz.krok` na `timerEndsAt`; pauza i `timerEndsAt <= now` → brak; `step_8` → `timeSensitive`, `step_3` → `active`; „+5 min” → ten sam `id`, `triggerAt + 300000`, diff planuje bez kasowania; `ROOM_TEMP` +24 h; `FRIDGE` +6 d i +7 d; minione terminy pominięte; diff nie dotyka obcych identyfikatorów; obcięcie do limitu; czas bezwzględny niezależny od strefy (poniedziałek, niedziela, 23:55 UTC jak w `tests/maestro-runner.ts`).
- Test listy oczekujących (atrapa): start → [`piekarz.krok`]; pauza → []; wznowienie → [`piekarz.krok`]; +5 min → przesunięty czas; następny krok → []; odrzucenie → []; zakończenie → []; import z innymi zakwasami → identyfikatory karmienia nowych zakwasów, starych brak; brak zgody → [] i widoczny stan „Powiadomienia wyłączone”; pierwszy start zegara prosi o zgodę raz.
- `npm run verify:native`: nowe niezmienniki — wtyczka `expo-notifications` w `plugins`, `ios.entitlements["com.apple.developer.usernotifications.time-sensitive"] === true`, brak `remote-notification` w `UIBackgroundModes`.
- Urządzenie (właściciel): zablokowany iPhone, krok 2 min → powiadomienie w ciągu 1 min od końca; Focus włączony → krok w garnku przebija Focus; karmienie z `lastFedAt` przestawionym w teście → przypomnienie.

## Opcje: zalety i wady

### (a) — zalety / wady
Zalety: mały kod natywny (biblioteka Expo), działa offline, spełnia BR-CZAS-001/002 kryt. 1 i BR-ZAKW-004. Wady: brak odliczania na ekranie blokady; zgoda użytkownika wymagana.

### (b) — zalety / wady
Zalety: licznik na ekranie blokady i w Dynamic Island. Wady: target ActivityKit, kod natywny poza Expo, więcej testów na urządzeniu; odłożone poza 1.0 decyzją DEC-02.

### (c) — zalety / wady
Zalety: zero pracy. Wady: aplikacja nie robi głównej pracy ze zdania celu; sprzeczne z MUST MVP w BRD.

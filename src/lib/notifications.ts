// ============================================================================
// Piekarz — adapter powiadomień lokalnych expo-notifications (ADR-006) [M1-audytor-generalny-006]
// Jedna ścieżka: resyncNotifications() uzgadnia listę oczekujących z planem z bazy.
// ============================================================================

import * as Notifications from 'expo-notifications';
import {
  planNotifications,
  diffNotifications,
  notificationFingerprint,
  PlannedNotification,
  PendingNotification,
} from '../core/notification-plan';
import { loadBakeSession } from '../data/bake-session-store';
import { collectBackupData } from '../data/sqlite-store';
import { t, lang } from './i18n';
import { formatTime } from './format';
import { pobierzStan, subskrybujStan, type StanDostepu } from './platnosci/stan';
import { evaluateAppAccess } from './app-access';
import { czyPrzypomnieniaKarmienia } from './przypomnienia-karmienia';

export type NotificationPermission = 'granted' | 'denied' | 'undetermined';

const permissionListeners = new Set<(s: NotificationPermission) => void>();
/** Baner „Powiadomienia wyłączone” słucha zmian zgody po każdym uzgodnieniu. */
export function subscribeNotificationPermission(fn: (s: NotificationPermission) => void): () => void {
  permissionListeners.add(fn);
  return () => {
    permissionListeners.delete(fn);
  };
}

let queue: Promise<unknown> = Promise.resolve();
/** Wywołania szeregowane: kilka szybkich „+5 min” nie przeplata się. */
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

export async function getNotificationPermission(): Promise<NotificationPermission> {
  const s = await Notifications.getPermissionsAsync();
  const ios = s.ios?.status;
  if (ios !== undefined) {
    if (ios === Notifications.IosAuthorizationStatus.NOT_DETERMINED) return 'undetermined';
    return ios === Notifications.IosAuthorizationStatus.DENIED ? 'denied' : 'granted';
  }
  if (s.granted) return 'granted';
  return s.canAskAgain ? 'undetermined' : 'denied';
}

/** Tytuł i treść powiadomienia w bieżącym języku (teksty do akceptacji, zasada 15). */
export function notificationText(p: PlannedNotification): { title: string; body: string } {
  const name = p.params.starterName ?? '';
  switch (p.textKey) {
    case 'krok.zdejmijPokrywke':
      return { title: t('Zdejmij pokrywkę'), body: t('Czas zdjąć pokrywkę z garnka i piec dalej bez pary.') };
    case 'krok.wypiekGotowy':
      return { title: t('Chleb upieczony'), body: t('Wyjmij chleb z garnka na kratkę.') };
    case 'karmienie.blat':
      return { title: t('Pora dokarmić zakwas'), body: t('Zakwas „{name}” stoi na blacie od 12 godzin bez dokarmienia.', { name }) };
    case 'karmienie.lodowkaTermin':
      return { title: t('Nakarm zakwas dziś'), body: t('Zakwas „{name}” czeka na karmienie od 7 dni.', { name }) };
    default: {
      // Następny krok i jego godzina: „{krok}: czas zacząć” (design-spec §10, BR-CZAS-002) [M1-audytor-generalny-130];
      // ostatni krok — nazwa kroku z sesji (plan), nie ze stałej listy [M1-audytor-generalny-030]
      const nast = p.params.nextName;
      const doMs = Number(p.params.nextEnd);
      if (nast) {
        return {
          title: t('{krok}: czas zacząć', { krok: t(nast) }),
          body: Number.isFinite(doMs) && p.params.nextEnd ? t('Do {godzina}.', { godzina: formatTime(new Date(doMs)) }) : t('Krok „{step}” dobiegł końca.', { step: t(p.params.stepName ?? '') }),
        };
      }
      const step = p.params.stepName;
      return { title: t('Koniec kroku'), body: t('Krok „{step}” dobiegł końca.', { step: step ? t(step) : '' }) };
    }
  }
}

function fingerprintOf(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) return null;
  const fp: unknown = Reflect.get(data, 'fp');
  return typeof fp === 'string' ? fp : null;
}

/** Uzgadnia oczekujące powiadomienia z bazą (sesja wypieku, zakwasy). Błąd biblioteki nie wychodzi do ekranu. */
export function resyncNotifications(): Promise<{ status: NotificationPermission; ok: boolean }> {
  return serial(async () => {
    let status: NotificationPermission = 'undetermined';
    try {
      status = await getNotificationPermission();
      const pendingAll = await Notifications.getAllScheduledNotificationsAsync();
      const pending: PendingNotification[] = pendingAll.map((r) => ({ id: r.identifier, fingerprint: fingerprintOf(r.content.data) }));
      // Przypomnienia o zakwasie tylko z uprawnieniem: po końcu próby dokarmianie otwiera ekran zakupu, a kontrakt
      // mówi, że przypomnienia ustają [M1-audytor-generalny-143]; kroki wypieku zostają (trwający wypiek się kończy)
      // Przełącznik „Przypomnienia o karmieniu” w Ustawieniach (DEC-22 a) [M1-audytor-generalny-179]
      const starters = async () =>
        przypomnieniaZDostepem(pobierzStan()) && (await czyPrzypomnieniaKarmienia()) ? (await collectBackupData()).starters : [];
      const desired = status === 'granted' ? planNotifications({ session: await loadBakeSession(), starters: await starters() }, Date.now()) : [];
      const jezyk = lang();
      const { cancel, schedule } = diffNotifications(pending, desired, jezyk);
      for (const id of cancel) await Notifications.cancelScheduledNotificationAsync(id);
      for (const p of schedule) {
        await Notifications.scheduleNotificationAsync({
          identifier: p.id,
          content: {
            ...notificationText(p),
            sound: 'default',
            interruptionLevel: p.level,
            data: { fp: notificationFingerprint(p, jezyk), kind: p.kind, route: p.route },
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: p.triggerAt },
        });
      }
      permissionListeners.forEach((fn) => fn(status));
      return { status, ok: true };
    } catch {
      permissionListeners.forEach((fn) => fn(status));
      return { status, ok: false };
    }
  });
}

/**
 * Czy planować przypomnienia o zakwasie: z uprawnieniem App Store; do pierwszego odczytu sklepu bez zmian
 * (brak odpowiedzi App Store to nie koniec próby, więc oczekujące przypomnienia nie znikają przy starcie).
 */
function przypomnieniaZDostepem(s: StanDostepu): boolean {
  return !s.gotowe || evaluateAppAccess(s.decyzja).canCreateNewBake;
}

/**
 * Uzgadnianie przy zmianie dostępu (koniec próby, zwrot, zakup): app/_layout.tsx od startu
 * [M1-audytor-generalny-143; 02-monetyzacja-504]. Zwraca wypisanie.
 */
export function uzgadniajZDostepem(): () => void {
  let ostatni: boolean | null = null;
  return subskrybujStan((s) => {
    const teraz = przypomnieniaZDostepem(s);
    if (teraz === ostatni) return;
    ostatni = teraz;
    void resyncNotifications();
  });
}

/** Prośba o zgodę tylko przy NOT_DETERMINED, w kontekście pierwszego zegara albo karmienia. */
export async function ensureNotificationPermission(): Promise<NotificationPermission> {
  try {
    if ((await getNotificationPermission()) === 'undetermined') {
      await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true, allowBadge: false } });
    }
  } catch {
    // Brak zgody nie blokuje zegara w aplikacji
  }
  return (await resyncNotifications()).status;
}

/** Pokazywanie na pierwszym planie: krok bez dźwięku (gra timer-audio), karmienie z dźwiękiem. */
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async (n) => {
      const kind: unknown = Reflect.get(n.request.content.data ?? {}, 'kind');
      return { shouldShowBanner: true, shouldShowList: true, shouldPlaySound: kind !== 'krok', shouldSetBadge: false };
    },
  });
}

// ============================================================================
// Piekarz — adapter powiadomień lokalnych expo-notifications (ADR-006) [M1-audytor-generalny-006]
// Jedna ścieżka: resyncNotifications() uzgadnia listę oczekujących z planem z bazy.
// ============================================================================

import * as Notifications from 'expo-notifications';
import { BAKE_STEPS } from '../core/baking-phases';
import {
  planNotifications,
  diffNotifications,
  notificationFingerprint,
  PlannedNotification,
  PendingNotification,
} from '../core/notification-plan';
import { loadBakeSession } from '../data/bake-session-store';
import { collectBackupData } from '../data/sqlite-store';
import { t } from './i18n';

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
      return { title: t('Pora nakarmić zakwas'), body: t('Zakwas „{name}” stoi na blacie od doby bez karmienia.', { name }) };
    case 'karmienie.lodowkaPrzypomnienie':
      return { title: t('Zakwas w lodówce'), body: t('Zakwas „{name}” czeka na karmienie od 6 dni.', { name }) };
    case 'karmienie.lodowkaTermin':
      return { title: t('Nakarm zakwas dziś'), body: t('Zakwas „{name}” czeka na karmienie od 7 dni.', { name }) };
    default: {
      const step = BAKE_STEPS.find((s) => s.id === p.params.stepId);
      return { title: t('Koniec kroku'), body: t('Krok „{step}” dobiegł końca.', { step: step ? t(step.name) : '' }) };
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
      const desired =
        status === 'granted'
          ? planNotifications({ session: await loadBakeSession(), starters: (await collectBackupData()).starters }, Date.now())
          : [];
      const { cancel, schedule } = diffNotifications(pending, desired);
      for (const id of cancel) await Notifications.cancelScheduledNotificationAsync(id);
      for (const p of schedule) {
        await Notifications.scheduleNotificationAsync({
          identifier: p.id,
          content: {
            ...notificationText(p),
            sound: 'default',
            interruptionLevel: p.level,
            data: { fp: notificationFingerprint(p), kind: p.kind, route: p.route },
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

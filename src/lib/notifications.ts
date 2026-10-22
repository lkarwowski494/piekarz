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
import { idSesji } from '../data/bake-session-store';
import { loadActiveBakeSessions, loadPlannedBakes } from '../data/bake-sessions-store';
import { collectBackupData } from '../data/sqlite-store';
import { wczytajPominiecia } from '../data/pominiecia-store';
import { pominietoKarmienieAt } from '../core/pominiecia';
import { kolejneKarmieniaBudzace, type WypiekZBudzeniem } from '../core/karmienia-budzace';
import { zakwasyDoPrzypomnien } from '../core/notification-feeding';
import { NOTIF_PREFIX } from '../core/notification-config';
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

/**
 * Tytuł i treść powiadomienia w bieżącym języku (teksty do akceptacji, zasada 15). Gdy powiadomienie niesie nazwę
 * wypieku (trwają dwa albo to start zaplanowanego), treść kończy się zdaniem „Wypiek: …” (BR-KAL-016 Który krok czyj).
 */
export function notificationText(p: PlannedNotification): { title: string; body: string } {
  const tekst = tekstPowiadomienia(p);
  const wypiek = p.params.recipeName;
  if (!wypiek) return tekst;
  const zdanie = t('Wypiek: {wypiek}.', { wypiek });
  return { title: tekst.title, body: tekst.body ? `${tekst.body} ${zdanie}` : zdanie };
}

function tekstPowiadomienia(p: PlannedNotification): { title: string; body: string } {
  const name = p.params.starterName ?? '';
  switch (p.textKey) {
    case 'krok.start': {
      // Start kroku 1 planu, gdy wypiek zaczęto wcześniej (D-5): te same zdania co powiadomienie o następnym kroku
      const doMs = Number(p.params.stepEnd);
      return {
        title: t('{krok}: czas zacząć', { krok: t(p.params.stepName ?? '') }),
        body: p.params.stepEnd && Number.isFinite(doMs) ? t('Do {godzina}.', { godzina: formatTime(new Date(doMs)) }) : '',
      };
    }
    case 'krok.zdejmijPokrywke':
      return { title: t('Zdejmij pokrywkę'), body: t('Czas zdjąć pokrywkę z garnka i piec dalej bez pary.') };
    case 'krok.wypiekGotowy':
      return { title: t('Chleb upieczony'), body: t('Wyjmij chleb z garnka na kratkę.') };
    case 'karmienie.blat':
      return { title: t('Pora dokarmić zakwas'), body: t('Zakwas „{name}” stoi na blacie od 12 godzin bez dokarmienia.', { name }) };
    case 'karmienie.lodowkaTermin':
      return { title: t('Nakarm zakwas dziś'), body: t('Zakwas „{name}” czeka na karmienie od 7 dni.', { name }) };
    case 'karmienie.lodowkaDzien':
      return { title: t('Nakarm zakwas dziś'), body: t('Dziś ustalony dzień karmienia zakwasu „{name}”.', { name }) };
    case 'karmienie.budzace':
      // Kolejne karmienie budzące z lodówki: warunek w treści, bez liczby karmień (RD-33, D-052) [M3 D5]
      return { title: t('Pora dokarmić zakwas'), body: t('Jeśli zakwas „{name}” nie podwoił objętości, dokarm go ponownie.', { name }) };
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

/**
 * Uzgadnia oczekujące powiadomienia z bazą (trwające i zaplanowane wypieki, zakwasy). Błąd biblioteki nie wychodzi
 * do ekranu. Powiadomienia kroków sprzed D2 (`piekarz.krok*`, bez id wypieku) nie są w planie, więc diff je kasuje.
 */
export function resyncNotifications(): Promise<{ status: NotificationPermission; ok: boolean }> {
  return serial(async () => {
    let status: NotificationPermission = 'undetermined';
    try {
      status = await getNotificationPermission();
      const pendingAll = await Notifications.getAllScheduledNotificationsAsync();
      const pending: PendingNotification[] = pendingAll.map((r) => ({ id: r.identifier, fingerprint: fingerprintOf(r.content.data) }));
      // Przypomnienia o dokarmianiu w Pro, w Basic tylko w czasie zakładania zakwasu (D-113, zakwasyDoPrzypomnien);
      // po wygaśnięciu Pro ustają [M1-audytor-generalny-143]; kroki wypieku zostają (trwający wypiek się kończy)
      // Przełącznik „Przypomnienia o karmieniu” w Ustawieniach (DEC-22 a) [M1-audytor-generalny-179]
      // Po „Pomiń” zaległego karmienia termin liczy się od chwili pominięcia, jak w kalendarzu (D-094) [M3 D4a]
      // Kolejne karmienia budzące (RD-33) z wpisów zakwasów [M3 D5]: trwającego wypieku zawsze (wypiek zaczęty z Pro
      // prowadzi się do końca), planu niezaczętego tylko z Pro [M3 P-a-fix P2-3]
      // Przed pierwszym odczytem sklepu (stan nieustalony) nowych przypomnień Pro nie planujemy, a czekających nie
      // kasujemy: brak odpowiedzi App Store to nie koniec Pro [M3 P-a-fix P2-2]
      const stanDostepu = pobierzStan();
      const nieustalony = !stanDostepu.gotowe;
      const pro = !nieustalony && evaluateAppAccess(stanDostepu.decyzja).canCreateNewBake;
      const zakwasy = async (w: { sessions: readonly WypiekZBudzeniem[]; planned: readonly WypiekZBudzeniem[] }) => {
        if (!(await czyPrzypomnieniaKarmienia())) return { starters: [], budzace: [] };
        const pominiecia = await wczytajPominiecia(Date.now()).catch(() => []);
        const kopia = await collectBackupData();
        return {
          starters: zakwasyDoPrzypomnien(kopia.starters, pro).map((s) => ({ ...s, pominietoAt: pominietoKarmienieAt(pominiecia, s.id) })),
          budzace: kolejneKarmieniaBudzace([...w.sessions, ...(pro ? w.planned : [])], kopia.starters, kopia.starterEntries ?? [], Date.now()),
        };
      };
      const wypieki = async () => ({
        sessions: (await loadActiveBakeSessions()).map((s) => ({ ...s, id: idSesji(s), ...(s.bake?.starterId ? { starterId: s.bake.starterId } : {}) })),
        planned: (await loadPlannedBakes()).map((p) => ({ ...p, ...(p.bake?.starterId ? { starterId: p.bake.starterId } : {}) })),
      });
      const w = status === 'granted' ? await wypieki() : null;
      const desired = w ? planNotifications({ ...w, ...(await zakwasy(w)) }, Date.now()) : [];
      const jezyk = lang();
      const roznice = diffNotifications(pending, desired, jezyk);
      const schedule = roznice.schedule;
      const cancel = nieustalony ? roznice.cancel.filter((id) => !czyPrzypomnieniePro(id)) : roznice.cancel;
      for (const id of cancel) await Notifications.cancelScheduledNotificationAsync(id);
      for (const p of schedule) {
        await Notifications.scheduleNotificationAsync({
          identifier: p.id,
          content: {
            ...notificationText(p),
            sound: 'default',
            interruptionLevel: p.level,
            // `wypiek`: dotknięcie otwiera Stolnicę tego wypieku (BR-KAL-016) [M3 D3a]
            data: { fp: notificationFingerprint(p, jezyk), kind: p.kind, route: p.route, ...(p.wypiekId ? { wypiek: p.wypiekId } : {}) },
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

/** Przypomnienie, które w Basic znika (dokarmianie, karmienie budzące): przed pierwszym odczytem sklepu nie kasowane. */
function czyPrzypomnieniePro(id: string): boolean {
  return id.startsWith(`${NOTIF_PREFIX}karmienie.`) || (id.startsWith(`${NOTIF_PREFIX}wypiek.`) && id.endsWith('.budzenie'));
}

/**
 * Czy planować przypomnienia o dokarmianiu poza zakładaniem (Pro, D-113): z uprawnieniem App Store; do pierwszego
 * odczytu sklepu bez zmian (brak odpowiedzi App Store to nie koniec Pro, więc oczekujące przypomnienia nie znikają przy starcie).
 */
export function przypomnieniaZDostepem(s: StanDostepu): boolean {
  return !s.gotowe || evaluateAppAccess(s.decyzja).canCreateNewBake;
}

/**
 * Uzgadnianie przy zmianie dostępu (koniec Pro, zwrot, zakup): kasowanie albo planowanie przypomnień; app/_layout.tsx od startu
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

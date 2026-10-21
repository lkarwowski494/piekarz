// ============================================================================
// Piekarz — teksty prowadzenia wypieku z makiety (design-spec §11b „056”, docs/design/ekrany/prowadzenie.html,
// 04-studio-projektowe-029) [M1-audytor-generalny-114]. Czyste funkcje: czas „teraz” i zgoda na powiadomienia
// przychodzą z argumentów. Parametry i liczba mnoga przez t()/tPlural; dzień słownie przez dzienSlownie, godziny
// przez formatTime (format regionu). Brak godziny w planie zostaje brakiem: linia z tą wartością znika.
//   • strefa planu: „Gotowe {dzień} o {godzina}” (koniec ostatniego kroku planu);
//   • strefa kroku: czas do końca w minutach („18 min”, w górę), sekundy tylko w ostatniej minucie, godziny bez
//     ułamków („1 h 5 min”, wspólny format czasTrwania z §11c „116”); po czasie „{czas} po czasie”;
//     „do {godzina}, potem {następny krok}” (ostatni krok: „do {godzina}”); po czasie „Potem: {krok}, {czas},
//     do {godzina}” liczone od teraz (BR-HARMO-005: następny krok rusza od „Zrobione”);
//   • „Ekran nie zgaśnie do końca kroku. Powiadomienie o {godzina}.” tylko w kroku czynnym (SessionStep.isPassive
//     = false: krok z pracą przy cieście), gdy zegar biegnie i jest zgoda na powiadomienia (makieta „brak-zgody”
//     nie ma tego zdania). Ekran nie gaśnie tylko w kroku czynnym (StolnicaKeepAwake, BR-REKA-001,
//     M1-audytor-generalny-130), więc zdanie stoi tam, gdzie użytkownik pracuje rękami (F-18).
// ============================================================================

import type { SessionStep } from '../core/bake-steps';
import { isDutchOvenStep } from '../core/bake-steps';
import { DUTCH_OVEN_PHASES, type DutchOvenBakePhase } from '../core/baking-phases';
import { stepDurationSec, stepHasTimer } from '../core/bake-session';
import { lang, t, tPlural } from './i18n';
import { appLocale, formatTime } from './format';
import { dzienSlownie } from './spirala-etykieta';
import { czasTrwania } from './czas-trwania';

export interface CzasTekst {
  /** Tekst na ekranie: „18 min”, „1 h 5 min”, „45 s”. */
  tekst: string;
  /** Etykieta VoiceOver słownie z formą liczby: „18 minut”, „45 sekund”. */
  etykieta: string;
}

const SEKUNDY = { one: '{n} sekunda', few: '{n} sekundy', many: '{n} sekund', other: '{n} sekundy' };

/** Czas do końca kroku: minuty w górę, w ostatniej minucie sekundy. */
export function czasKroku(pozostaloSec: number): CzasTekst {
  const sec = Math.max(0, Math.ceil(pozostaloSec));
  if (sec < 60) return { tekst: t('{n} s', { n: sec }), etykieta: tPlural(sec, SEKUNDY) };
  return czasTrwania(Math.ceil(sec / 60));
}

/** Czas po terminie kroku: pełne minuty, w pierwszej minucie sekundy; „{czas} po czasie”. */
function czasPoTerminie(poSec: number): CzasTekst {
  const sec = Math.max(0, Math.floor(poSec));
  const czas = sec < 60 ? { tekst: t('{n} s', { n: sec }), etykieta: tPlural(sec, SEKUNDY) } : czasTrwania(Math.floor(sec / 60));
  return { tekst: t('{czas} po czasie', { czas: czas.tekst }), etykieta: t('{czas} po czasie', { czas: czas.etykieta }) };
}

/** Nazwa kroku w środku zdania małą literą (PL i EN, jak w makiecie); skrót z wielkich liter zostaje. */
function wSrodkuZdania(nazwa: string): string {
  if ((lang() !== 'pl' && lang() !== 'en') || nazwa.length < 2) return nazwa;
  const druga = nazwa.charAt(1);
  if (druga !== druga.toLocaleLowerCase(appLocale())) return nazwa;
  return nazwa.charAt(0).toLocaleLowerCase(appLocale()) + nazwa.slice(1);
}

/** Co jest po bieżącym zegarze: faza bez pokrywy w garnku albo następny krok planu (nazwa i czas w s; 0 = bez czasu). */
function nastepny(steps: readonly SessionStep[], stepIdx: number, faza: DutchOvenBakePhase): { nazwa: string; sec: number } | null {
  const krok = steps[stepIdx];
  if (krok && isDutchOvenStep(krok) && faza === 'lid_on') {
    return { nazwa: t('pieczenie bez pokrywy'), sec: DUTCH_OVEN_PHASES.lid_off.durationMin * 60 };
  }
  const dalej = steps[stepIdx + 1];
  if (!dalej) return null;
  return { nazwa: wSrodkuZdania(t(dalej.name)), sec: stepDurationSec(dalej, 'lid_on') };
}

export interface WejscieProwadzenia {
  steps: readonly SessionStep[];
  stepIdx: number;
  dutchOvenPhase: DutchOvenBakePhase;
  /** Koniec zegara bieżącego kroku (ms), także po jego upływie; null = krok bez zegara. */
  koniecKrokuMs: number | null;
  teraz: number;
  zgodaPowiadomien: boolean;
}

export interface TekstyProwadzenia {
  gotowe: string | null;
  czas: CzasTekst | null;
  potem: string | null;
  ekran: string | null;
}

export function tekstyProwadzenia(w: WejscieProwadzenia): TekstyProwadzenia {
  const krok = w.steps[w.stepIdx];
  const koniecPlanu = w.steps[w.steps.length - 1]?.plannedEnd ?? null;
  const zegar = krok && stepHasTimer(krok) ? w.koniecKrokuMs : null;
  const biegnie = zegar !== null && zegar > w.teraz;
  const poCzasie = zegar !== null && !biegnie;
  // Krok po czasie: następny rusza od „Zrobione” (BR-HARMO-005), więc gotowe = teraz + pozostała długość planu
  // (od planowanego końca kroku do końca planu) [M1-audytor-generalny-151; 08-programista-504]
  const gotoweMs =
    koniecPlanu !== null && poCzasie && krok?.plannedEnd != null
      ? Math.max(koniecPlanu, w.teraz + (koniecPlanu - krok.plannedEnd))
      : koniecPlanu;
  const gotowe =
    gotoweMs === null
      ? null
      : t('Gotowe {dzien} o {godzina}', { dzien: dzienSlownie(new Date(gotoweMs), new Date(w.teraz)), godzina: formatTime(gotoweMs) });
  if (!krok) return { gotowe, czas: null, potem: null, ekran: null };
  const dalej = nastepny(w.steps, w.stepIdx, w.dutchOvenPhase);

  const czas = zegar === null ? null : biegnie ? czasKroku((zegar - w.teraz) / 1000) : czasPoTerminie((w.teraz - zegar) / 1000);

  let potem: string | null = null;
  if (biegnie) {
    potem = dalej
      ? t('do {godzina}, potem {krok}', { godzina: formatTime(zegar), krok: dalej.nazwa })
      : t('do {godzina}', { godzina: formatTime(zegar) });
  } else if (dalej) {
    potem =
      poCzasie && dalej.sec > 0
        ? t('Potem: {krok}, {czas}, do {godzina}', {
            krok: dalej.nazwa,
            czas: czasKroku(dalej.sec).tekst,
            godzina: formatTime(w.teraz + dalej.sec * 1000),
          })
        : t('Potem: {krok}', { krok: dalej.nazwa });
  }

  const ekran =
    biegnie && !krok.isPassive && w.zgodaPowiadomien
      ? t('Ekran nie zgaśnie do końca kroku. Powiadomienie o {godzina}.', { godzina: formatTime(zegar) })
      : null;

  return { gotowe, czas, potem, ekran };
}

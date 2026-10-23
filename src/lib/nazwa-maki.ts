// ============================================================================
// Piekarz — nazwa mąki do wyświetlenia według trybu atlasu języka [M1-audytor-generalny-094]
// Język z mapą typów (pl): nazwa z typem jak dotąd. Pozostałe: nazwa i opis ogólny bez numeru typu
// (OPIS_OGOLNY_MAK, rola 06). Zapisane dane receptury (name, type) się nie zmieniają.
// ============================================================================

import { FLOUR_PROFILES, FlourProfile } from '../core/flour-atlas';
import { OPIS_OGOLNY_MAK, trybAtlasuMak } from '../core/flour-atlas-ogolne';
import { lang, t } from './i18n';

const ogolny = (p: FlourProfile, kod: string) =>
  trybAtlasuMak(kod) === 'opis-ogolny' ? OPIS_OGOLNY_MAK[p.id] : undefined;

/** Nazwa profilu w języku `kod`: z typem przy mapie typów, ogólna poza nią. */
export function nazwaMaki(p: FlourProfile, kod: string = lang()): string {
  const o = ogolny(p, kod);
  return t(o ? o.nazwaPl : p.namePl);
}

/** Opis ogólny pod nazwą; pusty przy mapie typów i gdy profil nie ma danych ze źródłem. */
export function opisMaki(p: FlourProfile, kod: string = lang()): string {
  const o = ogolny(p, kod);
  return o && o.opisPl ? t(o.opisPl) : '';
}

/** Notka o parametrach szacowanych (D-A, M1-091): poza mapą typów nazwa ogólna profilu źródłowego zamiast numeru. */
export function notaSzacunku(p: FlourProfile, kod: string = lang()): string | null {
  if (p.estimatedFromTyp === undefined) return null;
  if (trybAtlasuMak(kod) === 'mapa-typow') {
    return t('Szacunek na podstawie typu {typ}.', { typ: String(p.estimatedFromTyp) });
  }
  const zrodlo = FLOUR_PROFILES.find((f) => f.grain === p.grain && f.ashTyp === p.estimatedFromTyp);
  return t('Szacunek na podstawie profilu {nazwa}.', {
    nazwa: zrodlo ? nazwaMaki(zrodlo, kod) : t(OPIS_OGOLNY_MAK[p.id]?.nazwaPl ?? p.namePl),
  });
}

/** Zdanie o Polskich Normach tylko tam, gdzie atlas pokazuje polskie typy. */
export function pokazZdanieONormach(kod: string = lang()): boolean {
  return trybAtlasuMak(kod) === 'mapa-typow';
}

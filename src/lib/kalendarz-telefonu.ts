// ============================================================================
// Piekarz — plan wypieku w kalendarzu telefonu przez plik .ics (BR-KAL-011; D-092, STOP 3 pkt 3) [M3 D8]
// Plik trafia do katalogu cache i do arkusza udostępniania (expo-sharing, text/calendar). Bez modułu kalendarza,
// więc bez prośby o dostęp do kalendarza (OG-08). Czy iOS otwiera ten plik w Kalendarzu: OP-50, test na urządzeniu.
// ============================================================================

import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { SessionStep } from '../core/bake-steps';
import { zbudujIcs, type WydarzenieIcs } from '../core/plan-ics';
import { formatDzienData, formatTime } from './format';
import { t } from './i18n';
import { nazwaReceptury } from './nazwa-receptury';

export type PowodBleduKalendarza = 'plan' | 'zapis' | 'brak-udostepniania' | 'arkusz';
export type WynikDodania = { ok: true } | { ok: false; powod: PowodBleduKalendarza };

const NAZWA_PLIKU = 'piekarz-plan.ics';
// Identyfikator typu .ics w systemie Apple; czy arkusz proponuje Kalendarz, rozstrzyga test na urządzeniu (OP-50)
const UTI_KALENDARZ = 'public.calendar-event';

/**
 * Wydarzenie planu: jedno na cały plan (makieta roli 04: „gotowe wydarzenie”), od początku pierwszego do końca
 * ostatniego kroku; opis ma wiersz na krok z dniem i godziną. Plan bez kroków z godzinami: null.
 */
export function wydarzenieZPlanu(p: { id: string; nazwa: string; kroki: readonly SessionStep[]; teraz: number }): WydarzenieIcs | null {
  const kroki = p.kroki.flatMap((k) => (typeof k.plannedStart === 'number' && typeof k.plannedEnd === 'number' ? [{ ...k, plannedStart: k.plannedStart, plannedEnd: k.plannedEnd }] : []));
  if (kroki.length === 0) return null;
  return {
    id: p.id,
    tytul: `${nazwaReceptury(p.nazwa)}: ${t('Plan wypieku')}`,
    opis: [...kroki.map((k) => `${formatDzienData(k.plannedStart)}, ${formatTime(k.plannedStart)} ${t(k.name)}`), `— ${t('Piekarz')}`],
    startMs: Math.min(...kroki.map((k) => k.plannedStart)),
    koniecMs: Math.max(...kroki.map((k) => k.plannedEnd)),
    stempelMs: p.teraz,
  };
}

/** Zapis pliku i arkusz udostępniania; każdy błąd daje wynik z powodem (bez wyjątku i bez cichej porażki). */
export async function dodajDoKalendarza(w: WydarzenieIcs): Promise<WynikDodania> {
  const ics = zbudujIcs(w);
  if (!ics.ok) return { ok: false, powod: 'plan' };
  const sciezka = `${FileSystem.cacheDirectory}${NAZWA_PLIKU}`;
  try {
    await FileSystem.writeAsStringAsync(sciezka, ics.ics);
  } catch {
    return { ok: false, powod: 'zapis' };
  }
  try {
    if (!(await Sharing.isAvailableAsync())) return { ok: false, powod: 'brak-udostepniania' };
    await Sharing.shareAsync(sciezka, { mimeType: 'text/calendar', UTI: UTI_KALENDARZ, dialogTitle: t('Dodaj do kalendarza') });
    return { ok: true };
  } catch {
    return { ok: false, powod: 'arkusz' };
  }
}

/** Komunikat po nieudanym dodaniu: powód po ludzku i co zostaje (plan jest w Piekarzu). */
export function pokazBladKalendarza(powod: PowodBleduKalendarza): void {
  const tresc =
    powod === 'brak-udostepniania'
      ? t('Ten telefon nie pozwala wysłać pliku do kalendarza. Plan zostaje w Piekarzu, możesz go skopiować jako tekst.')
      : powod === 'plan'
        ? t('Ten plan nie ma godzin, które da się zapisać w kalendarzu. Ułóż plan jeszcze raz.')
        : t('Nie udało się przygotować pliku z planem. Plan zostaje w Piekarzu. Spróbuj ponownie.');
  Alert.alert(t('Nie dodano do kalendarza'), tresc);
}

// ============================================================================
// Piekarz — zapis trwającego wypieku na Stolnicy [M1-audytor-generalny-019; M3 D3a: per id wypieku]
// Przywracanie robi ekran z listy wypieków (app/stolnica.tsx); tu tylko zapis zmian kroku, fazy i zegara.
// ============================================================================

import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { StorageWriteError } from '../data/storage-status';
import { saveErrorText } from '../lib/save-guard';
import { t } from '../lib/i18n';
import { type BakeSession } from '../data/bake-session-store';
import { utworzWypiek, zapiszPostepWypieku, type ZapisWersji } from '../data/bake-sessions-store';
import { resyncNotifications } from '../lib/notifications';

/** Zapis odrzucony, bo stan w bazie jest inny niż na ekranie: ekran przestaje zapisywać i czyta wypieki od nowa. */
export type OdrzuconyZapis = 'limit' | 'istnieje' | 'nieaktualny' | 'brak';

/**
 * Zapisuje każdą zmianę kroku, fazy i zegara wypieku `snapshot` (null = nic nie trwa) [M3 D3a, D3a-fix].
 * - Nowy wypiek z planu (`wersja` null): pierwszy zapis tylko tworzy wiersz (z limitem trwających), niczego nie nadpisuje.
 * - Potem zapis zmienia wiersz tylko z wersji, którą ten ekran odczytał albo zapisał: druga instancja Stolnicy ze
 *   starym stanem nie cofa postępu, a spóźniony zapis po końcu albo przerwaniu wypieku go nie przywraca (P1-1).
 * Odrzucony zapis (limit, wiersz już jest, nowszy stan, wypiek już nie trwa): ekran dalej nie zapisuje i woła
 * `onOdrzucony`; przy limicie komunikat „Prowadzisz już 2 wypieki” (P2-2). Zwraca, czy wypiek ma wiersz w bazie.
 */
export function useZapisWypieku(
  snapshot: BakeSession | null,
  wersjaOdczytu: number | null,
  onOdrzucony: (powod: OdrzuconyZapis) => void,
  /** Udany zapis (ekran zeruje licznik odrzuceń z rzędu). */
  onZapisano?: () => void
): () => boolean {
  const zapisanoRef = useRef(onZapisano);
  zapisanoRef.current = onZapisano;
  const snapRef = useRef(snapshot);
  snapRef.current = snapshot;
  const wersja = useRef<number | null>(wersjaOdczytu);
  const zatrzymany = useRef(false);
  const odrzuconyRef = useRef(onOdrzucony);
  odrzuconyRef.current = onOdrzucony;
  // Wypiek, przy którym już pokazano „Nie zapisano”; po udanym zapisie komunikat może wrócić [M1-audytor-generalny-120]
  const alerted = useRef<string | null>(null);
  // Zapisy po kolei: następny zapis startuje od wersji poprzedniego
  const kolejka = useRef<Promise<unknown>>(Promise.resolve());
  const key = snapshot ? JSON.stringify(snapshot) : null;
  useEffect(() => {
    const s = snapRef.current;
    if (key === null || !s) return;
    const bakeId = s.bake?.id ?? String(s.startedAt);
    const pokaz = (tekst: string) => {
      if (alerted.current === bakeId) return;
      alerted.current = bakeId;
      Alert.alert(t('Nie zapisano'), tekst);
    };
    const zapisz = async (): Promise<void> => {
      if (zatrzymany.current) return;
      const w = wersja.current;
      // Nieudany zapis postępu nie przerywa wypieku (zegar w pamięci działa dalej), ale nie jest cichy:
      // jeden komunikat „Nie zapisano” na wypiek (05-architekt-501, wybór P-120 a).
      let r: ZapisWersji;
      try {
        r = w === null ? await utworzWypiek(s) : await zapiszPostepWypieku(s, w);
      } catch (e: unknown) {
        if (e instanceof StorageWriteError) pokaz(saveErrorText(e));
        return;
      }
      if (r.ok) {
        wersja.current = r.wersja;
        alerted.current = null;
        zapisanoRef.current?.();
        // Po zapisie uzgodnienie powiadomień z bazą (ADR-006) [M1-audytor-generalny-006]
        void resyncNotifications();
        return;
      }
      zatrzymany.current = true;
      if (r.error.kind === 'limit') pokaz(t('Prowadzisz już 2 wypieki'));
      odrzuconyRef.current(r.error.kind);
    };
    kolejka.current = kolejka.current.then(zapisz, zapisz);
  }, [key]);
  return () => wersja.current !== null;
}

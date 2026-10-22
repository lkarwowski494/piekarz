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
import { saveActiveBakeSession, zapiszPostepWypieku } from '../data/bake-sessions-store';
import { resyncNotifications } from '../lib/notifications';

/**
 * Zapisuje każdą zmianę kroku, fazy i zegara wypieku `snapshot` (null = nic nie trwa). Nowy wypiek z planu (`nowy`)
 * pierwszy zapis tworzy (z limitem trwających); potem zapis zmienia tylko istniejący wiersz, więc spóźniony zapis po
 * końcu albo przerwaniu wypieku go nie przywraca (wyścig z przeglądu danych D1) [M3 D3a].
 */
export function useZapisWypieku(snapshot: BakeSession | null, nowy: boolean): void {
  const snapRef = useRef(snapshot);
  snapRef.current = snapshot;
  const zapisany = useRef(!nowy);
  // Wypiek, przy którym już pokazano „Nie zapisano”; po udanym zapisie komunikat może wrócić [M1-audytor-generalny-120]
  const alerted = useRef<string | null>(null);
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
    // Nieudany zapis postępu nie przerywa wypieku (zegar w pamięci działa dalej), ale nie jest cichy:
    // jeden komunikat „Nie zapisano” na wypiek (05-architekt-501, wybór P-120 a).
    // Po zapisie uzgodnienie powiadomień z bazą (ADR-006) [M1-audytor-generalny-006]
    void (zapisany.current ? zapiszPostepWypieku(s) : saveActiveBakeSession(s))
      .then((r) => {
        if (r.ok) {
          zapisany.current = true;
          alerted.current = null;
          return resyncNotifications();
        }
        // Trzeci trwający: nic nie zapisane (limit, BR-ETAP-006); wypiek, który już nie trwa: zapis bez skutku
        if (r.error.kind === 'limit') pokaz(t('Prowadzisz już 2 wypieki'));
        return undefined;
      })
      .catch((e: unknown) => {
        if (e instanceof StorageWriteError) pokaz(saveErrorText(e));
      });
  }, [key]);
}

// ============================================================================
// Piekarz — dziennik zakwasu na zakładce Zakwasy (design-spec §5, §6 stany `karta`, `zakladanie-dzien-3`,
// `plesn`; BR-ZAKW-005…007, BR-DIAG-002 wejście „Coś mnie niepokoi”, BR-ZAKW-006 stan z lodówki)
// [M1-audytor-generalny-104]. Zakładanie dzień po dniu, karta cyklu ze Spiralą, lista wpisów z „Edytuj”
// i „Usuń wpis” z „Przywróć”. Logika: czyste funkcje starter-log, fridge-wake, zakwas-widok.
// ============================================================================

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import type { StoredStarter } from '../../data/db';
import { loadActiveBakeSessions } from '../../data/bake-sessions-store';
import { STARTER_DOUBLING_MAX_H, isReadyAfterFeeding, setupDay, setupGuideStage, setupObservationOutcome, type SetupOutcome, type StarterSign } from '../../core/starter-log';
import { NO_DOUBLING_ACTIONS } from '../../core/starter-doctor';
import { fridgeWakeOutcome } from '../../core/fridge-wake';
import { t } from '../../lib/i18n';
import { guardSave } from '../../lib/save-guard';
import { stanKartyZakwasu, wZakladaniu } from '../../lib/zakwas-widok';
import { theme } from '../../ui/theme';
import { typografia } from '../../ui/tokeny';
import { useStarterLog, nowyWpis } from './useStarterLog';
import { StarterCycleCard } from './StarterCycleCard';
import { StarterEntriesList } from './StarterEntriesList';
import { StarterSetupCard } from './StarterSetupCard';
import { FridgeWakeStatus } from './FridgeWakeStatus';

/** „na blacie, 1:2:2” / „w lodówce” z danych zakwasu; brak proporcji zostaje brakiem. */
function opisMiejsca(s: StoredStarter): string {
  if (s.storageState === 'FRIDGE') return s.feedingRatio ? t('w lodówce, {proporcja}', { proporcja: s.feedingRatio }) : t('w lodówce');
  return s.feedingRatio ? t('na blacie, {proporcja}', { proporcja: s.feedingRatio }) : t('na blacie');
}

export function ZakwasDziennik({ starter, wersja, onDokarm, zDostepem, onZmianaZakwasu }: {
  starter: StoredStarter;
  /** Zmienia się po zapisie dokarmienia na ekranie: dziennik czyta wpisy ponownie. */
  wersja: number;
  onDokarm: () => void;
  /** Akcja zapisu przez sprawdzenie dostępu (requireActionAccess ekranu). */
  zDostepem: (akcja: () => Promise<void>) => void;
  /** Zakwas zmieniony w bazie (koniec zakładania, „Zacznij od nowa”): ekran czyta zakwasy ponownie. */
  onZmianaZakwasu: () => Promise<void>;
}) {
  const router = useRouter();
  const log = useStarterLog(starter.id);
  const { reload } = log;
  const [wynik, setWynik] = useState<SetupOutcome | null>(null);
  const [wypiekZakwasu, setWypiekZakwasu] = useState<string | null>(null);
  const now = Date.now();

  useEffect(() => {
    void reload();
  }, [reload, wersja]);
  useEffect(() => {
    setWynik(null);
    // Któryś z trwających wypieków (najwyżej 2) prowadzi ten zakwas [M3 D3a]
    void loadActiveBakeSessions()
      .then((l) => setWypiekZakwasu(l.some((s) => s.bake?.starterId === starter.id) ? starter.id : null))
      .catch(() => setWypiekZakwasu(null));
  }, [starter.id]);

  const stan = stanKartyZakwasu(starter, log.entries, now);
  const zakladanie = starter.setupStartedAt !== undefined && (wZakladaniu(starter) || wynik?.kind === 'ready');
  const dzien = starter.setupStartedAt !== undefined ? setupDay(starter.setupStartedAt, now) : 1;
  // Treść planu wg czasu i dokarmień, nie wg numeru kalendarzowego (D-093, D0b)
  const etap = starter.setupStartedAt !== undefined ? setupGuideStage({ setupStartedAt: starter.setupStartedAt, now, entries: log.entries }) : 'day1';

  const zapiszDzien = (signs: StarterSign[]) =>
    zDostepem(guardSave(async () => {
      const at = Date.now();
      const out = setupObservationOutcome({ day: dzien, stage: etap, signs, entries: log.entries, observedAt: at });
      if (signs.length > 0) await log.zapiszObserwacje(signs, at, out.kind === 'ready' ? { setupCompletedAt: at } : undefined);
      setWynik(out);
      if (out.kind === 'ready') await onZmianaZakwasu();
    }));

  const podwoil = () =>
    zDostepem(guardSave(async () => {
      const at = Date.now();
      const gotowy = isReadyAfterFeeding([...log.entries, nowyWpis(starter.id, 'observation', at, ['doubled'])]);
      const koniec = wZakladaniu(starter) && gotowy;
      await log.zapiszObserwacje(['doubled'], at, koniec ? { setupCompletedAt: at } : undefined);
      if (koniec) {
        setWynik(setupObservationOutcome({ day: dzien, stage: etap, signs: ['doubled'], entries: log.entries, observedAt: at }));
        await onZmianaZakwasu();
      }
    }));

  const odNowa = () =>
    zDostepem(guardSave(async () => {
      await log.zacznijOdNowa(Date.now());
      setWynik(null);
      await onZmianaZakwasu();
    }));

  return (
    <>
      {zakladanie && starter.setupStartedAt !== undefined && (
        <StarterSetupCard
          dzien={dzien}
          etap={etap}
          wynik={wynik}
          now={now}
          onZapiszDzien={zapiszDzien}
          onZacznijOdNowa={odNowa}
          onZostaw={() => setWynik(null)}
          onUlozPlan={() => router.push('/receptury')}
        />
      )}
      <StarterCycleCard
        stan={stan}
        opisMiejsca={opisMiejsca(starter)}
        onPodwoil={podwoil}
        onDokarm={onDokarm}
        onNiepokoi={() => router.push({ pathname: '/zakwasy/doktor-zakwasu', params: { starterId: starter.id } })}
      >
        {stan.gotowy && !zakladanie && <Text testID="zakwas-gotowy" style={styles.gotowy}>{t('Gotowy do ciasta (według King Arthur Baking).')}</Text>}
        {/* Po 8 h od dokarmienia bez podwojenia: rada karmienia co 12 h (RD-24-W3, ZAK-ZAL-007; BR-ZAKW-003) [130] */}
        {/* W lodówce ta rada nie obowiązuje (ZAK-ZAL-012: raz w tygodniu; radę daje karta szczytu) [M1-audytor-generalny-188] */}
        {!stan.gotowy && !zakladanie && starter.storageState !== 'FRIDGE' && stan.mineloMin !== null && stan.mineloMin > STARTER_DOUBLING_MAX_H * 60 && (
          <Text testID="zakwas-karm-dalej" style={styles.gotowy}>{t(NO_DOUBLING_ACTIONS[0])}</Text>
        )}
        {wypiekZakwasu === starter.id && <FridgeWakeStatus wynik={fridgeWakeOutcome(log.entries, now)} now={now} />}
      </StarterCycleCard>
      <StarterEntriesList
        entries={log.entries}
        now={now}
        usuniety={log.usuniety}
        onPopraw={(wpis, at) => zDostepem(guardSave(() => log.popraw(wpis, at, Date.now())))}
        onUsun={(id) => void guardSave(() => log.usun(id))()}
        onPrzywroc={() => void guardSave(log.przywroc)()}
        onSchowajPasek={log.schowajPasek}
      />
    </>
  );
}

const styles = StyleSheet.create({
  gotowy: { fontSize: typografia.style.tresc.pt, fontWeight: '700', color: theme.colors.tusz },
});

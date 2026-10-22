// ============================================================================
// Piekarz — ocena i zapis zakończonego wypieku (arkusz po „Zrobione” na ostatnim kroku), wydzielone z prowadzenia
// bez zmiany zachowania: wpis, licznik wypieków i odliczenie mąki w jednej transakcji [M1-audytor-generalny-021],
// propozycja Doktora przy ocenie <= 2 (BR-DIAG-001) [M1-audytor-generalny-032], prośba o ocenę aplikacji od 3. wypieku (D-067, przy ≤ 2★ odłożona: D-089).
// ============================================================================

import { useRef, useState } from 'react';
import { guardSave } from '../lib/save-guard';
import { finishBake, setActiveBake, ActiveBakeState } from '../data/sqlite-store';
import { resyncNotifications } from '../lib/notifications';
import { BreadSensoryProfile, DEFAULT_BREAD_SENSORY_PROFILE } from '../components/SensoryRadarChart';
import type { FinishBakeModalProps } from '../components/stolnica/FinishBakeModal';
import { shouldSuggestDoctor, suggestDoctorAfterRating } from '../lib/doctor-suggestion';
import { poprosOOceneJesliWarto } from '../lib/prosba-o-ocene-wywolanie';
import { odlozProsbeOOcene, wykonajOdlozonaProsbeOOcene } from '../lib/prosba-o-ocene-odlozona';

type Smak = FinishBakeModalProps['tasteProfile'];

export function useFinishBake(opts: {
  recipeName: string;
  startedAt: number;
  activeBakeData: ActiveBakeState | null;
  /** Po zapisie: ekran wraca do stanu bez wypieku. */
  onFinished: () => void;
  loadHistory: () => Promise<void>;
  /** Otwarcie Doktora (z kontrolą dostępu ekranu). */
  openDoctor: () => void;
}): { open: () => void; modalProps: FinishBakeModalProps } {
  const [visible, setVisible] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');
  const [crumbScore, setCrumbScore] = useState<number>(3);
  const [crustScore, setCrustScore] = useState<number>(3);
  const [tasteProfile, setTasteProfile] = useState<Smak>('balanced');
  const [sensoryProfile, setSensoryProfile] = useState<BreadSensoryProfile>(DEFAULT_BREAD_SENSORY_PROFILE);

  const { recipeName, startedAt, activeBakeData } = opts;
  // Drugie stuknięcie „Zapisz” w trakcie zapisu nic nie robi: jeden wpis, bez fałszywego „Nie zapisano” [audyt-niezalezny D-11]
  const zapisuje = useRef(false);
  const onSave = async () => {
    if (zapisuje.current) return;
    zapisuje.current = true;
    try {
      await zapisz();
    } finally {
      zapisuje.current = false;
    }
  };
  const zapisz = guardSave(async () => {
    await finishBake({
      id: `bake_${Date.now()}`,
      recipeName,
      startedAt,
      finishedAt: Date.now(),
      ambientTemp: activeBakeData?.ambientTempC,
      actualDDT: activeBakeData?.actualDdtC,
      ratingStars: rating,
      notes: notes.trim() || undefined,
      crumbScore,
      crustScore,
      tasteProfile,
      sensoryProfile: { ...sensoryProfile, openCrumb: crumbScore, crustCrispness: crustScore },
    }, activeBakeData?.calculatedRecipe?.flours ?? [], { clearSession: true });

    // Sesja skasowana w transakcji zakończenia (finishBake) [M1-audytor-generalny-120]
    setActiveBake(null);
    void resyncNotifications();
    opts.onFinished();
    setVisible(false);
    setCrumbScore(3);
    setCrustScore(3);
    setTasteProfile('balanced');
    setSensoryProfile(DEFAULT_BREAD_SENSORY_PROFILE);
    setNotes('');
    await opts.loadHistory();
    // Prośba o ocenę aplikacji po ukończonym wypieku, bez względu na ocenę bochenka (DEC-20 a) [M1-audytor-generalny-138];
    // przy propozycji Doktora (≤ 2★) nie w tej samej chwili: po „Nie teraz”, po Doktorze albo na „Dziś” (D-089) [reaudit-noc N-12]
    if (shouldSuggestDoctor(rating)) {
      odlozProsbeOOcene();
      suggestDoctorAfterRating(rating, opts.openDoctor, wykonajOdlozonaProsbeOOcene);
    } else {
      void poprosOOceneJesliWarto();
    }
  });

  return {
    open: () => setVisible(true),
    modalProps: {
      visible,
      onClose: () => setVisible(false),
      onSave,
      rating,
      onRatingChange: setRating,
      notes,
      onNotesChange: setNotes,
      crumbScore,
      onCrumbScoreChange: setCrumbScore,
      crustScore,
      onCrustScoreChange: setCrustScore,
      tasteProfile,
      onTasteProfileChange: setTasteProfile,
      sensoryProfile,
      onSensoryProfileChange: setSensoryProfile,
    },
  };
}

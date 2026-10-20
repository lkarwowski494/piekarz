// ============================================================================
// Piekarz — ocena i zapis zakończonego wypieku (arkusz po „Zrobione” na ostatnim kroku), wydzielone z prowadzenia
// bez zmiany zachowania: wpis, licznik wypieków i odliczenie mąki w jednej transakcji [M1-audytor-generalny-021],
// propozycja Doktora przy ocenie <= 2 (BR-DIAG-001) [M1-audytor-generalny-032], prośba o ocenę przy >= 4★ (D-042).
// ============================================================================

import { useRef, useState } from 'react';
import { guardSave } from '../lib/save-guard';
import { finishBake, setActiveBake, ActiveBakeState } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { resyncNotifications } from '../lib/notifications';
import { BreadSensoryProfile, DEFAULT_BREAD_SENSORY_PROFILE } from '../components/SensoryRadarChart';
import type { FinishBakeModalProps } from '../components/stolnica/FinishBakeModal';
import { suggestDoctorAfterRating } from '../lib/doctor-suggestion';
import { poprosOOceneJesliWarto } from '../lib/prosba-o-ocene-wywolanie';

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
  const ratingTouched = useRef(false); // domyślne 5★ to nie ocena (D-042, 082)
  const [notes, setNotes] = useState<string>('');
  const [crumbScore, setCrumbScore] = useState<number>(3);
  const [crustScore, setCrustScore] = useState<number>(3);
  const [tasteProfile, setTasteProfile] = useState<Smak>('balanced');
  const [sensoryProfile, setSensoryProfile] = useState<BreadSensoryProfile>(DEFAULT_BREAD_SENSORY_PROFILE);

  const { recipeName, startedAt, activeBakeData } = opts;
  const onSave = guardSave(async () => {
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
    }, activeBakeData?.calculatedRecipe?.flours ?? []);

    setActiveBake(null);
    await saveBakeSession(null);
    void resyncNotifications();
    opts.onFinished();
    setVisible(false);
    setCrumbScore(3);
    setCrustScore(3);
    setTasteProfile('balanced');
    setSensoryProfile(DEFAULT_BREAD_SENSORY_PROFILE);
    setNotes('');
    await opts.loadHistory();
    suggestDoctorAfterRating(rating, opts.openDoctor);
    void poprosOOceneJesliWarto(ratingTouched.current ? rating : null);
    ratingTouched.current = false;
  });

  return {
    open: () => setVisible(true),
    modalProps: {
      visible,
      onClose: () => setVisible(false),
      onSave,
      rating,
      onRatingChange: (r) => {
        ratingTouched.current = true;
        setRating(r);
      },
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

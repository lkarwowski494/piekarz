// ============================================================================
// Piekarz — prowadzenie jednego wypieku (Stolnica), wydzielone z app/stolnica.tsx (limit 20 KB) [M3 D3a]: ekran
// wybiera trwający wypiek (id z trasy, przełącznik); zapis kroku, koniec i przerwanie tylko jego (BR-KAL-016).
// ============================================================================
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, AppState } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePasekStanuJasny } from '../nawigacja/PasZakladki';
import { EkranZPasem } from '../nawigacja/EkranZPasem';
import * as Haptics from 'expo-haptics';
import { t } from '../../lib/i18n';
import { przerwijWypiek } from '../../lib/przerwij-wypiek';
import { tapHaptic } from '../../lib/haptics';
import { useZapisWypieku } from '../../hooks/useBakeSession';
import { useFinishBake } from '../../hooks/useFinishBake';
import { idSesji } from '../../data/bake-session-store';
import type { ProwadzenieWypiekuProps } from './prowadzenie-wypieku-typy';
import { ensureNotificationPermission, getNotificationPermission } from '../../lib/notifications';
import { ZgodaPowiadomien } from './ZgodaPowiadomien';
import { SkladnikiKroku } from './SkladnikiKroku';
import { SleepGuardBanner } from '../harmonogram/SleepGuardBanner';
import { oknoSnu, useProfilSnu } from '../../lib/godziny-snu';
import { kolizjeKrokow } from '../../lib/plan-bez-nocy';
import { formatTime } from '../../lib/format';
import { NotificationsOffBanner } from '../NotificationsOffBanner';
import { confirmDiscardBake } from '../../lib/confirm';
import type { ActiveBakeState } from '../../data/sqlite-store';
import { useUnitSystem } from '../../lib/unit-converter';
import { notifyTimerFinished, notifySteamReleaseAlert } from '../../lib/timer-audio';
import type { DutchOvenBakePhase } from '../../core/baking-phases';
import { SessionStep, isDutchOvenStep } from '../../core/bake-steps';
import { BakeProgress, restoreTimerState, stepDurationSec, stepHasTimer } from '../../core/bake-session';
import { StepUndo, canUndoConfirm, confirmStep, skokDoKroku, undoConfirm } from '../../core/step-confirm';
import { poCoTenKrok } from '../../core/po-co-ten-krok';
import { ostrzezeniaKroku } from '../../core/ostrzezenia-kroku';
import { useAppAccess } from '../../lib/app-access';
import { BlokadaFunkcji } from '../BlokadaFunkcji';
import { FinishBakeModal } from './FinishBakeModal';
import { StrefaKroku } from './StrefaKroku';
import { PasProwadzenia } from './PasProwadzenia';
import { useNiskiEkran } from '../../ui/niski-ekran';
import { StolnicaKeepAwake } from './StolnicaKeepAwake';
import { PasekKciuka } from './PasekKciuka';
import { PlanWypiekuArkusz } from './PlanWypiekuArkusz';
import { PasekCofnijKroku } from './PasekCofnijKroku';
import { PoCoTenKrokArkusz } from './PoCoTenKrokArkusz';
import { StrefaPlanu } from './StrefaPlanu';
import { useTekstyProwadzenia } from '../../hooks/useTekstyProwadzenia';
import { czekaNaStart } from '../../lib/prowadzenie-teksty';
import { styles } from './stolnica-screen.styles';

export function ProwadzenieWypieku({ start, wersja, naglowek, naglowekStaly, onKoniec, onKrok, onOdrzucony, onZapisano }: ProwadzenieWypiekuProps) {
  const router = useRouter();
  const sessionId = idSesji(start);
  // Pas marki zamiast nagłówka systemowego (O3a, D-194; makieta wypiek.html#prowadzenie)
  const gora = useSafeAreaInsets().top;
  usePasekStanuJasny();

  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [recipeName, setRecipeName] = useState<string>(t('Wypiek bez receptury'));
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [activeBakeData, setActiveBakeData] = useState<ActiveBakeState | null>(null);
  const [planOpen, setPlanOpen] = useState<boolean>(false);
  const [poCoOpen, setPoCoOpen] = useState<boolean>(false);

  // Kroki z planu sesji; żyto: etapy roli 06 z czasami planu [M1-audytor-generalny-030]
  const [steps, setSteps] = useState<readonly SessionStep[]>([]);

  // Timer states
  const [timeLeftSec, setTimeLeftSec] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [dutchOvenPhase, setDutchOvenPhase] = useState<DutchOvenBakePhase>('lid_on');

  // Apps4Craft Monetization & Access (Cheaper than espresso)
  const { blokada, chron } = useAppAccess();
  const unitSystem = useUnitSystem();

  // Czy wypiek ma wiersz w bazie (z hooka zapisu niżej): koniec wymaga wtedy tego wiersza (P1-1)
  const czyZapisany = useRef<() => boolean>(() => wersja !== null);
  const finish = useFinishBake({
    sessionId,
    czyZapisany: () => czyZapisany.current(),
    recipeName,
    startedAt,
    activeBakeData,
    onFinished: () => {
      setActiveBakeData(null);
      setIsActive(false);
      setCurrentStepIdx(0);
      onKoniec();
    },
    // Historię pokazuje Dziennik (czyta wpisy przy wejściu na zakładkę); Stolnica po zapisie wraca na Dziś
    loadHistory: async () => undefined,
    openDoctor: chron('doktor', () => router.push('/doktor')),
  });

  const endAtMsRef = useRef<number | null>(null);
  // Koniec zegara bieżącego kroku także po jego upływie: termin kroku dla „Zrobione” (BR-HARMO-005) [M1-audytor-generalny-102]
  const ostatniKoniecRef = useRef<number | null>(null);
  // „Cofnij poprzedni”, pasek „Przywróć” (też po skoku, 006) tylko w pamięci
  const [undo, setUndo] = useState<StepUndo | null>(null);
  const [cofniete, setCofniete] = useState<{ nazwa: string; ponow: BakeProgress; undo: StepUndo | null; skok?: true } | null>(null);
  const ukryjCofniete = useCallback(() => setCofniete(null), []);

  // Czas kroku od planu, bez „Start”/„Wstrzymaj” (§11b „056”) [M1-audytor-generalny-056]; nowy zegar chowa pasek (006)
  const runFor = (sec: number) => {
    endAtMsRef.current = sec > 0 ? Date.now() + sec * 1000 : null;
    ostatniKoniecRef.current = endAtMsRef.current;
    setTimeLeftSec(sec);
    setIsRunning(sec > 0);
    setIsCompleted(false);
    setCofniete(null);
  };

  /** Postęp z ekranu na wejście logiki kroków (src/core/step-confirm.ts). */
  const postep = (): BakeProgress => ({
    steps, stepIdx: currentStepIdx, dutchOvenPhase, pausedLeftSec: null,
    timerEndsAt: isRunning || isCompleted ? ostatniKoniecRef.current : null,
  });

  /** Krok, plan i zegar z postępu; zegar stojący rusza sam. Zwraca, czy zegar ruszył od nowa. */
  const zastosuj = (p: BakeProgress): boolean => {
    setSteps(p.steps);
    setCurrentStepIdx(p.stepIdx);
    setDutchOvenPhase(p.dutchOvenPhase);
    const timer = restoreTimerState(p, Date.now());
    endAtMsRef.current = timer.isRunning ? p.timerEndsAt : null;
    ostatniKoniecRef.current = p.timerEndsAt;
    setTimeLeftSec(timer.timeLeftSec);
    setIsRunning(timer.isRunning);
    setIsCompleted(timer.isCompleted);
    const rusza = !timer.isRunning && !timer.isCompleted && timer.timeLeftSec > 0 && stepHasTimer(p.steps[p.stepIdx]);
    if (rusza) runFor(timer.timeLeftSec);
    return rusza;
  };

  // Prośba systemowa o zgodę dopiero po zdaniu „po co” (ZgodaPowiadomien); przy decyzji już podjętej tylko uzgodnienie
  const [zgodaOpen, setZgodaOpen] = useState(false);
  const zapytajOZgode = async () => {
    if ((await getNotificationPermission().catch(() => 'denied' as const)) === 'undetermined') setZgodaOpen(true);
    else void ensureNotificationPermission();
  };

  // Trwający wypiek w bazie: powrót do kroku i zegara po zabiciu procesu [M1-audytor-generalny-019]; zegar skończony
  // na pierwszym planie zostawia w zapisie termin kroku, żeby po powrocie było widać, o ile minął
  // (BR-ETAP-005 „Termin minął”) [M1-audytor-generalny-130]. Zapis tylko tego wypieku, od wersji odczytu (M3 D3a, P1-1).
  czyZapisany.current = useZapisWypieku(
    isActive
      ? { version: 2, steps, stepIdx: currentStepIdx, dutchOvenPhase,
          timerEndsAt: isRunning ? endAtMsRef.current ?? Date.now() + timeLeftSec * 1000 : isCompleted ? ostatniKoniecRef.current : null,
          pausedLeftSec: isRunning || isCompleted ? null : timeLeftSec, recipeName, startedAt, bake: activeBakeData }
      : null,
    wersja,
    onOdrzucony,
    onZapisano
  );

  // Bieżący krok dla przełącznika wypieków (BR-KAL-016 „Który krok czyj”)
  const nazwaKroku = steps[currentStepIdx]?.name;
  useEffect(() => {
    if (nazwaKroku !== undefined) onKrok?.(nazwaKroku);
  }, [nazwaKroku]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isRunning && endAtMsRef.current === null) {
      endAtMsRef.current = Date.now() + timeLeftSec * 1000;
    } else if (!isRunning) {
      endAtMsRef.current = null;
    }
  }, [isRunning, timeLeftSec]);

  // Przywrócenie wypieku przy montowaniu, PO efekcie wyżej (ten na montowaniu zeruje koniec zegara przy stojącym)
  useEffect(() => {
    const s = start;
    setIsActive(true);
    setRecipeName(s.recipeName);
    setStartedAt(s.startedAt);
    setActiveBakeData(s.bake);
    // Zegar stojący (nowy wypiek albo zapis sprzed 056) rusza sam; zgoda na powiadomienia przy pierwszym zegarze (ADR-006),
    // najpierw zdanie „po co” (BR-CZAS-003) [M1-audytor-generalny-130]
    // Wypiek przed godziną startu planu (D-5): zgoda także wtedy, bo powiadomienie przyjdzie o starcie
    if (zastosuj(s) || czekaNaStart(s.steps, s.stepIdx, Date.now()) !== null) void zapytajOZgode();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Timer countdown tick & background resilience (RD-ENG-06, NFR-PERF-004)
  useEffect(() => {
    if (!isRunning) return;
    const tick = () => {
      if (!endAtMsRef.current) return;
      const left = Math.max(0, Math.ceil((endAtMsRef.current - Date.now()) / 1000));
      setTimeLeftSec(left);
      if (left <= 0) {
        endAtMsRef.current = null;
        setIsRunning(false);
        setIsCompleted(true);
        const step = steps[currentStepIdx];
        if (step && isDutchOvenStep(step) && dutchOvenPhase === 'lid_on') {
          void notifySteamReleaseAlert();
        } else if (step && isDutchOvenStep(step)) {
          void notifyTimerFinished(t('Wypiek w garnku zakończony. Wyjmij chleb na kratkę.'));
        } else {
          void notifyTimerFinished(t(step?.name ?? ''));
        }
      }
    };
    const interval = setInterval(tick, 1000);
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') tick();
    });
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [isRunning, currentStepIdx, dutchOvenPhase, steps]);

  const currentStep: SessionStep | undefined = steps[currentStepIdx];
  const aktywny = isActive && !!currentStep;
  // Prowadzenie wypieku jest w Basic (BR-ETAP-001…006, D-112): kroki, „Zrobione”, „Cofnij” i zapis wyniku nigdy
  // nie otwierają ekranu Pro (zakazane wzorce: ekran Pro w trakcie kroku); wypiek zaczęty z Pro prowadzi się do końca
  // (D-039 pkt 3) [M1-audytor-generalny-125; M3 P-a]
  const blokadaWypieku = blokada('stolnica');
  // „Po co ten krok” z treści roli 06; krok bez źródła (KRO-POC-900) ma przycisk nieaktywny (100)
  const poCo = currentStep ? poCoTenKrok(currentStep, isDutchOvenStep(currentStep) ? dutchOvenPhase : undefined) : null;

  // Jump to or advance step
  const goToStep = (idx: number) => {
    if (idx < 0 || idx >= steps.length || idx === currentStepIdx) return; // bieżący: zegar bez zmian (006)
    // Wybrany krok od teraz, dalsze kroki i powiadomienia razem z nim [audyt-niezalezny D-8]
    const przed = postep();
    const skok = skokDoKroku(przed, idx, Date.now());
    setSteps(skok.steps);
    setCurrentStepIdx(idx);
    setDutchOvenPhase('lid_on');
    runFor(stepDurationSec(skok.steps[idx], 'lid_on'));
    setUndo(null);
    setCofniete({ nazwa: t(skok.steps[idx].name), ponow: przed, undo, skok: true });
    tapHaptic(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSwitchDutchOvenPhase = (phase: DutchOvenBakePhase) => {
    if (phase === dutchOvenPhase) return; // aktywna faza: bez zerowania zegara [04-studio-projektowe-019]
    setDutchOvenPhase(phase);
    runFor(stepDurationSec(currentStep, phase)); // czas fazy z receptury (D-304)
    tapHaptic(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleStartPhase2AfterSteamAlert = () => {
    setDutchOvenPhase('lid_off');
    runFor(stepDurationSec(currentStep, 'lid_off'));
    void zapytajOZgode();
    tapHaptic(Haptics.ImpactFeedbackStyle.Heavy);
  };

  // „Zrobione” przed terminem przesuwa dalsze kroki i powiadomienia wcześniej, po terminie — później (BR-HARMO-005)
  const handleNextStep = () => {
    // Krok w garnku: kciuk prowadzi przez fazy (fazyGarnka); z pokrywką „Zrobione” zdejmuje pokrywkę, a krok
    // kończy dopiero w fazie bez pokrywki, z jej zegarem i powiadomieniem [04-studio-projektowe-002]
    if (currentStep && isDutchOvenStep(currentStep) && dutchOvenPhase === 'lid_on') {
      handleStartPhase2AfterSteamAlert();
      return;
    }
    if (currentStepIdx >= steps.length - 1) {
      finish.open();
      return;
    }
    const wynik = confirmStep(postep(), Date.now());
    zastosuj(wynik.progress);
    setUndo(wynik.undo);
    setCofniete(null);
    tapHaptic(Haptics.ImpactFeedbackStyle.Medium);
  };

  // „Cofnij poprzedni”: poprzedni krok, plan i zegar sprzed potwierdzenia; powiadomienia idą za planem (design-spec §5)
  const cofnijDostepne = undo !== null && canUndoConfirm(postep(), undo);
  const handleUndo = () => {
    if (!undo || !cofnijDostepne) return;
    const ponow = postep();
    const { progress } = undoConfirm(undo, Date.now());
    zastosuj(progress);
    setCofniete({ nazwa: t(progress.steps[progress.stepIdx]?.name ?? ''), ponow, undo });
    setUndo(null);
    tapHaptic(Haptics.ImpactFeedbackStyle.Light);
  };
  const handleRestore = () => {
    if (!cofniete) return;
    zastosuj(cofniete.ponow);
    setUndo(cofniete.undo);
    setCofniete(null);
  };

  // „Przerwij wypiek” na „Plan wypieku”: skutek dla danych jak dawne „Odrzuć wypiek” (056)
  const handleDiscard = () => {
    confirmDiscardBake(() => {
      setPlanOpen(false);
      // Pamięć, wiersz tego wypieku i powiadomienia; drugi trwający wypiek zostaje (BR-KAL-016) [M3 D3a]
      setActiveBakeData(null);
      setIsActive(false);
      setCurrentStepIdx(0);
      setIsRunning(false);
      // Powrót na „Dziś” dopiero po skasowaniu wiersza: karta przerwanego wypieku nie wraca (P2-5) [M3 D3a-fix]
      void przerwijWypiek(sessionId).finally(onKoniec);
    });
  };

  // Kroki czynne od bieżącego w oknie snu z Ustawień (po przesunięciu planu „Zrobione”); „Bez godzin snu” = brak
  const oknoProwadzenia = oknoSnu(useProfilSnu());
  const kolizjeNocy = oknoProwadzenia ? kolizjeKrokow(steps.slice(currentStepIdx), oknoProwadzenia, formatTime) : [];

  // „Gotowe {dzień} o {godzina}”, czas kroku, „do {godzina}, potem …”, „Ekran nie zgaśnie…” (makieta prowadzenia, 114)
  const teksty = useTekstyProwadzenia({ steps, stepIdx: currentStepIdx, dutchOvenPhase, koniecKrokuMs: ostatniKoniecRef.current, poCzasie: isCompleted });
  // Niski ekran: pas zwarty, karta kroku 8 pt pod pasem (005, rola 04 p4b)
  const niski = useNiskiEkran();

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      {/* Ekran nie gaśnie tylko w kroku czynnym; w biernym (chłodnia) gaśnie jak zwykle (BR-REKA-001) [M1-audytor-generalny-130] */}
      <StolnicaKeepAwake active={aktywny && !currentStep.isPassive && czekaNaStart(steps, currentStepIdx, Date.now()) === null} />
      {/* Pas: tytuł kroku, czas i „potem …”; niski ekran: pas zwarty (005, rola 04 p4b); Spirala z „Gotowe …” pod kartą (D-318) */}
      <EkranZPasem gora={gora} tytul={aktywny ? t(currentStep.name) : t('Stolnica')} contentContainerStyle={styles.container} pas={(onLayout) => (
        <PasProwadzenia gora={gora} krok={aktywny ? currentStep : undefined} numer={{ n: currentStepIdx + 1, m: steps.length }}
          czas={teksty.czas?.tekst ?? ''} czasEtykieta={teksty.czas?.etykieta} potem={teksty.potem} onLayout={onLayout}
          onWstecz={() => router.back()} onPlan={() => setPlanOpen(true)} onDoktor={() => router.push('/doktor')} />
      )}>
        <View style={[styles.tresc, niski && styles.trescZwarta]}>
        {aktywny ? naglowek : null}
        {/* Bez trwającego wypieku nic: ekran przekierowuje na Dziś [M1-audytor-generalny-117] */}
        {!aktywny ? null : (
          <BlokadaFunkcji {...blokadaWypieku}>
          <View>
            <NotificationsOffBanner />
            {/* Strefa kroku: karta instrukcji, ostrzeżenie, test palca, fazy garnka (tytuł i czas na pasie) */}
            <StrefaKroku
              naglowekNaPasie
              step={currentStep}
              formattedTime={teksty.czas?.tekst ?? ''}
              czasEtykieta={teksty.czas?.etykieta}
              potem={teksty.potem}
              ekran={teksty.ekran}
              unitSystem={unitSystem}
              dutchOvenPhase={dutchOvenPhase}
              isCompleted={isCompleted}
              onSwitchPhase={handleSwitchDutchOvenPhase}
              onStartPhase2AfterSteamAlert={handleStartPhase2AfterSteamAlert}
              ostrzezenia={ostrzezeniaKroku(steps, currentStepIdx, isDutchOvenStep(currentStep) ? dutchOvenPhase : undefined)}
            />
            <StrefaPlanu recipeName={recipeName} steps={steps} stepIdx={currentStepIdx} gotowe={teksty.gotowe} koniecKrokuMs={ostatniKoniecRef.current}
              pozostaloSec={stepHasTimer(currentStep) ? timeLeftSec : null} pelnySec={stepDurationSec(currentStep, dutchOvenPhase)} />
            {/* Krok czynny przesunięty w godziny snu z Ustawień: kolizja jak w planie (BR-HARMO-004, D-066 1a) [130] */}
            {kolizjeNocy.length > 0 && (
              <SleepGuardBanner hasSleepCollision sleepCollisions={kolizjeNocy} autoResolved={null} onApplyAutoResolution={() => {}} />
            )}
            {/* Składniki przy bieżącym kroku (BR-ETAP-001) [M1-audytor-generalny-130] */}
            <SkladnikiKroku steps={steps} stepIdx={currentStepIdx} calculatedRecipe={activeBakeData?.calculatedRecipe} unitSystem={unitSystem} />
          </View>
          </BlokadaFunkcji>
        )}

        {/* Arkusz oceny po ostatnim kroku */}
        <FinishBakeModal {...finish.modalProps} />
        </View>
      </EkranZPasem>

      {aktywny && cofniete && <PasekCofnijKroku nazwa={cofniete.nazwa} skok={cofniete.skok} onPrzywroc={handleRestore} onUkryj={ukryjCofniete} />}
      {aktywny ? naglowekStaly : null}
      {aktywny && (
        <BlokadaFunkcji {...blokadaWypieku}>
          <PasekKciuka
            nazwaKroku={t(currentStep.name)}
            onZrobione={handleNextStep}
            onCofnij={handleUndo}
            cofnijDostepne={cofnijDostepne}
            onPoCo={() => setPoCoOpen(true)}
            poCoDostepne={poCo !== null}
            przyPrzelaczniku={!!naglowekStaly}
          />
        </BlokadaFunkcji>
      )}
      {aktywny && (
        <ZgodaPowiadomien
          visible={zgodaOpen}
          onDalej={() => {
            setZgodaOpen(false);
            void ensureNotificationPermission();
          }}
        />
      )}
      {aktywny && (
        <PoCoTenKrokArkusz zdania={poCoOpen ? poCo : null} nazwaKroku={t(currentStep.name)} onClose={() => setPoCoOpen(false)} />
      )}
      {aktywny && (
        <PlanWypiekuArkusz
          visible={planOpen}
          onClose={() => setPlanOpen(false)}
          steps={steps}
          currentStepIdx={currentStepIdx}
          onGoToStep={goToStep}
          calculatedRecipe={activeBakeData?.calculatedRecipe}
          unitSystem={unitSystem}
          onPrzerwij={handleDiscard}
        />
      )}
    </SafeAreaView>
  );
}

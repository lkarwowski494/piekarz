import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, Alert, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NadPasem, usePasekStanuJasny } from '../../../src/components/nawigacja/PasZakladki';
import { PasZakwasu } from '../../../src/components/zakwas/PasZakwasu';
import { CzapkaPaska } from '../../../src/ui/karty/CzapkaPaska';
import { IkonaKarty } from '../../../src/ui/karty/IkonaKarty';
import { odstepy } from '../../../src/ui/tokeny';
import { theme } from '../../../src/ui/theme';
import { t } from '../../../src/lib/i18n';
import { dniTemu, godzinTemu } from '../../../src/lib/czas-temu';
import { guardSave } from '../../../src/lib/save-guard';
import { resyncNotifications } from '../../../src/lib/notifications';
import { NotificationsOffBanner } from '../../../src/components/NotificationsOffBanner';
import { calculateStarterFeeding, calculateStarterPhase } from '../../../src/core/domain-rules';
import { predictStarterPeak } from '../../../src/core/starter-peak-predictor';
import { parseFeedingRatio, DEFAULT_FEEDING_RATIO } from '../../../src/core/feeding-ratio';
import { getStarters } from '../../../src/data/sqlite-store';
import { useStarterLog } from '../../../src/components/zakwas/useStarterLog';
import { ustawZakwasPlanu } from '../../../src/lib/zakwas-planu';
import { StoredStarter } from '../../../src/data/db';
import { copyFeedingToClipboard } from '../../../src/lib/feeding-formatter';
import { StarterConverterModal } from '../../../src/components/StarterConverterModal';
import { DiscardRecipesModal } from '../../../src/components/DiscardRecipesModal';
import { useAppAccess } from '../../../src/lib/app-access';
import { LIMITY_BASIC } from '../../../src/lib/platnosci/konfiguracja';
import { BlokadaFunkcji } from '../../../src/components/BlokadaFunkcji';
import { useUnitSystem } from '../../../src/lib/unit-converter';
import { StartersSelectorRow } from '../../../src/components/zakwas/StartersSelectorRow';
import { StarterProfileCard } from '../../../src/components/zakwas/StarterProfileCard';
import { StarterPeakActivityCard } from '../../../src/components/zakwas/StarterPeakActivityCard';
import { StarterFeedingCard } from '../../../src/components/zakwas/StarterFeedingCard';
import { NarzedziaZakwasu } from '../../../src/components/zakwas/NarzedziaZakwasu';
import { StarterSafetyCard } from '../../../src/components/zakwas/StarterSafetyCard';
import { useObjawyZakwasu } from '../../../src/components/zakwas/useObjawyZakwasu';
import { useAkcjeZakwasu } from '../../../src/components/zakwas/useAkcjeZakwasu';
import { EditStarterModal } from '../../../src/components/zakwas/EditStarterModal';
import { AddStarterModal } from '../../../src/components/zakwas/AddStarterModal';
import { ZakwasDziennik } from '../../../src/components/zakwas/ZakwasDziennik';
import { ZakladanieStart } from '../../../src/components/zakwas/ZakladanieStart';
import { StalyDzienKarmienia } from '../../../src/components/zakwas/StalyDzienKarmienia';
import { useCofnijDokarmienie } from '../../../src/hooks/useCofnijDokarmienie';
import { PasekCofnij } from '../../../src/components/PasekCofnij';

export default function ZakwasScreen() {
  const unitSystem = useUnitSystem();
  // Basic: pierwszy zakwas (założenie, karta, zapis karmień, RD-21, Doktor); Pro: gotowość i szczyt, stały dzień,
  // proporcje dokarmiania, kolejne zakwasy (D-113, D-116)
  const { blokada, dodaj, moze } = useAppAccess();

  const [startersList, setStartersList] = useState<StoredStarter[]>([]);
  // Bez zakwasu w bazie nie ma profilu ani liczb: wartość startowa nie jest pokazywana (087, bez danych zmyślonych)
  const [selectedStarterId, setSelectedStarterId] = useState<string>('');
  const [starter, setStarter] = useState<StoredStarter>({
    id: '',
    name: '',
    flourType: '',
    hydration: 100.0,
    birthDate: 0,
    storageState: 'ROOM_TEMP',
  });
  const maZakwas = startersList.length > 0;
  // Pas nocy (D10 opcja A): nazwa, spirala cyklu i czas od dokarmienia z tych samych wpisów co karta [M3 D10]
  const gora = useSafeAreaInsets().top;
  usePasekStanuJasny();
  const log = useStarterLog(starter.id);
  const [wysokoscPasa, setWysokoscPasa] = useState<number>(0);
  const [przewiniety, setPrzewiniety] = useState<boolean>(false);

  const [targetYield, setTargetYield] = useState<number>(150);
  const [selectedRatio, setSelectedRatio] = useState<[number, number, number]>([1, 2, 2]);
  const [ambientTempC, setAmbientTempC] = useState<number>(22.0);

  // Objawy na karcie bezpieczeństwa (RD-21-W1) i ich ocena
  const objawy = useObjawyZakwasu();

  const [isConverterOpen, setIsConverterOpen] = useState<boolean>(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState<boolean>(false);
  // Dziennik czyta wpisy ponownie po dokarmieniu zapisanym na ekranie [M1-audytor-generalny-104]
  const [wersjaDziennika, setWersjaDziennika] = useState<number>(0);

  const loadStarterData = useCallback(async (preferredId?: string) => {
    const list = await getStarters();
    setStartersList(list);
    if (list.length > 0) {
      const targetId = preferredId !== undefined ? preferredId : selectedStarterId;
      const current = list.find((s) => s.id === targetId) || list[0];
      setStarter(current);
      setSelectedStarterId(current.id);
      setSelectedRatio(parseFeedingRatio(current.feedingRatio) ?? DEFAULT_FEEDING_RATIO);
    }
  }, [selectedStarterId]);

  useEffect(() => {
    loadStarterData();
  }, [loadStarterData]);
  const cofnijDokarmienie = useCofnijDokarmienie(async (id) => {
    await loadStarterData(id);
    setWersjaDziennika((v) => v + 1);
  });

  // Plan wypieku bierze zakwas wybrany tutaj (BR-ZAKW-006, D-052) [M1-audytor-generalny-104]
  useEffect(() => {
    ustawZakwasPlanu(selectedStarterId || null);
  }, [selectedStarterId]);

  // Age in days
  const ageDays = useMemo(() => {
    const diffMs = Math.max(0, Date.now() - starter.birthDate);
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }, [starter.birthDate]);

  const flourGrain = useMemo(() => {
    const lower = (starter.flourType || '').toLowerCase();
    if (lower.includes('żytn') || lower.includes('rye')) return 'rye' as const;
    if (lower.includes('orkisz') || lower.includes('spelt')) return 'spelt' as const;
    return 'wheat' as const;
  }, [starter.flourType]);

  // Szczyt bieżącego cyklu liczony z proporcji zapisanej przy ostatnim dokarmieniu, nie z wyboru na następne [023]
  const peakPrediction = useMemo(() => {
    return predictStarterPeak({
      lastFedAt: starter.lastFedAt ?? Date.now(),
      currentTempC: ambientTempC,
      ratio: parseFeedingRatio(starter.feedingRatio) ?? DEFAULT_FEEDING_RATIO,
      flourGrain,
      hydration: starter.hydration,
      now: Date.now(),
    });
  }, [starter.lastFedAt, ambientTempC, starter.feedingRatio, flourGrain, starter.hydration]);

  // Odznaka fazy z tego samego okna co predyktor: jeden model szczytu [M1-audytor-generalny-044]
  const phaseResult = useMemo(() => {
    return calculateStarterPhase(starter.lastFedAt, starter.storageState, Date.now(), {
      start: peakPrediction.peakWindowStartTimestamp,
      end: peakPrediction.peakWindowEndTimestamp,
    });
  }, [starter.lastFedAt, starter.storageState, peakPrediction]);

  // Feeding calculation
  const feeding = useMemo(() => {
    return calculateStarterFeeding(targetYield, selectedRatio);
  }, [targetYield, selectedRatio]);

  // Time since last feeding label
  const lastFedLabel = useMemo(() => {
    const diffHours = Math.floor((Date.now() - (starter.lastFedAt ?? Date.now())) / (1000 * 60 * 60));
    if (diffHours < 1) return t('przed chwilą');
    if (diffHours < 24) return godzinTemu(diffHours);
    const diffDays = Math.floor(diffHours / 24);
    return dniTemu(diffDays);
  }, [starter.lastFedAt]);

  const akcje = useAkcjeZakwasu({
    starter, setStarter, startersList, setStartersList, selectedRatio, loadStarterData,
    odswiezDziennik: () => setWersjaDziennika((v) => v + 1),
    zapamietajCofniecie: cofnijDokarmienie.zapamietaj,
    dodaj,
  });

  const handleCopyFeeding = async () => {
    const copied = await copyFeedingToClipboard(starter, feeding, selectedRatio);
    if (copied) {
      Alert.alert(t('Kopiuj jako tekst'), t('Skopiowano proporcje dokarmiania do schowka'));
    }
  };

  const wybor = (
    <StartersSelectorRow
      startersList={startersList}
      activeStarterId={starter.id}
      onSelectStarter={(s) => {
        setStarter(s);
        setSelectedStarterId(s.id);
      }}
      onOpenAddModal={akcje.otworzDodawanie}
      dodajPro={startersList.length >= LIMITY_BASIC.zakwasy && !moze('kolejny-zakwas')}
      naPasie={maZakwas}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <ScrollView contentInsetAdjustmentBehavior="never" keyboardShouldPersistTaps="handled" scrollEventThrottle={16}
        onScroll={(e) => setPrzewiniety(e.nativeEvent.contentOffset.y > Math.max(0, wysokoscPasa - gora))}>
        <NadPasem />
        {/* Wybór zakwasu jako chipy na pasie; bez zakwasu zdanie pustego stanu na pasie (karty/README.md §4) [M3 p2] */}
        <PasZakwasu gora={gora} starter={starter} wpisy={log.entries} maZakwas={maZakwas} chipy={maZakwas ? wybor : null}
          onEdytuj={akcje.handleOpenEditModal} onLayout={setWysokoscPasa} />
        <View style={styles.container}>
        <NotificationsOffBanner />
        {/* Bez bloku statystyk (§12a): wiek i hydratacja w karcie profilu, proporcja w karcie cyklu i ilościach
            do dokarmienia, temperatura w aktywności zakwasu [M1-audytor-generalny-111] */}
        {/* Zakładanie od zera: pierwsze dokarmienie tworzy zakwas w dniu 1 (BR-ZAKW-005) [M1-audytor-generalny-104] */}
        {!maZakwas && (
          <ZakladanieStart onZapisz={(nowy) => dodaj('zakwasy', guardSave(async () => {
            await nowy();
            void resyncNotifications();
            await loadStarterData();
          }))} />
        )}
        {/* Pierwsze uruchomienie: „Dodaj nowy zakwas” pod kartą zakładania [M1-audytor-generalny-087; makieta „pusty”] */}
        {!maZakwas && wybor}

        {/* Profile Card */}
        {maZakwas && (
          <StarterProfileCard
            starter={starter}
            ageDays={ageDays}
            lastFedLabel={lastFedLabel}
            unitSystem={unitSystem}
          />
        )}

        {maZakwas && (
          <ZakwasDziennik
            starter={starter}
            log={log}
            wersja={wersjaDziennika}
            onDokarm={akcje.handleLogFeeding}
            zDostepem={(akcja) => void akcja()}
            blokadaGotowosci={blokada('gotowosc-zakwasu')}
            zPro={moze('przypomnienia-zakwasu')}
            onZmianaZakwasu={() => loadStarterData(starter.id)}
          />
        )}

        {/* Gotowość i szczyt (BR-ZAKW-003): Pro; w Basic karta widoczna, dotknięcie otwiera ekran Pro (027, D-113) */}
        {maZakwas && (
          <BlokadaFunkcji {...blokada('gotowosc-zakwasu')} ikonaKarty={<IkonaKarty nazwa="zegar" />}>
          <StarterPeakActivityCard
            phaseResult={phaseResult}
            peakPrediction={peakPrediction}
            // Bez godziny szczytu, dopóki progi nie mają źródła (OP-39, F-24; BR-ZAKW-003) [M1-audytor-generalny-130]
            showPeakWindow={false}
            pokazTemperature={starter.storageState !== 'FRIDGE'}
            ambientTempC={ambientTempC}
            onAmbientTempChange={setAmbientTempC}
            unitSystem={unitSystem}
          />
          </BlokadaFunkcji>
        )}

        {/* Stały dzień karmienia zakwasu w lodówce (BR-KAL-010, PR-22) [M3 D7]; Pro (D-113) */}
        {maZakwas && starter.storageState === 'FRIDGE' && (
          <BlokadaFunkcji {...blokada('staly-dzien')} ikonaKarty={<IkonaKarty nazwa="kalendarz" />}>
          <StalyDzienKarmienia starter={starter} teraz={Date.now()} onZapisz={akcje.zapiszStalyDzien} />
          </BlokadaFunkcji>
        )}

        {/* Dokarmianie z proporcją (BR-ZAKW-002): Pro (D-113) */}
        <BlokadaFunkcji {...blokada('proporcje-zakwasu')} ikonaKarty={<IkonaKarty nazwa="proporcje" />}>
        <StarterFeedingCard
          selectedRatio={selectedRatio}
          onSelectRatio={setSelectedRatio}
          targetYield={targetYield}
          onTargetYieldChange={setTargetYield}
          feeding={feeding}
          hydratacjaZakwasu={starter.hydration}
          unitSystem={unitSystem}
          onCopyFeeding={handleCopyFeeding}
        />
        </BlokadaFunkcji>
        {/* Przelicznik hydratacji i wylewki w Basic (właściciel 2026-10-22, D-117) [M3 P-b2] */}
        <NarzedziaZakwasu onOpenConverter={() => setIsConverterOpen(true)} onOpenDiscardRecipes={() => setIsDiscardModalOpen(true)} />

        {/* Kontrola bezpieczeństwa (RD-21-W1) poza blokadą: ostrzeżenie „wyrzuć” działa bez zakupu
            (docs/monetyzacja.md BR-DIAG-002 „ostrzeżenie RD-21 zawsze”) [audyt-niezalezny E-1] */}
        <StarterSafetyCard
          {...objawy}
          onZalozOdNowa={maZakwas ? akcje.handleZalozOdNowa : undefined}
        />

        {/* Modal: Edit Starter Profile */}
        <EditStarterModal {...akcje.edycja} />

        {/* Modal: Add New Starter */}
        <AddStarterModal {...akcje.dodawanie} />

        <StarterConverterModal
          visible={isConverterOpen}
          onClose={() => setIsConverterOpen(false)}
          currentStarterHydration={starter.hydration}
          currentStarterName={maZakwas ? starter.name : undefined}
        />

        <DiscardRecipesModal
          visible={isDiscardModalOpen}
          onClose={() => setIsDiscardModalOpen(false)}
        />
        </View>
      </ScrollView>
      {/* Czapka paska stanu: pod paskiem stanu nie przewija się treść; mały tytuł, gdy pas odjedzie (README §2) [M3 p2] */}
      <CzapkaPaska gora={gora} tytul={maZakwas ? starter.name : t('Zakwasy')} pokazTytul={przewiniety} />
      {cofnijDokarmienie.pasek && (
        <PasekCofnij {...cofnijDokarmienie.pasek} testID="zakwas-dokarm-cofnij" przywrocTestID="zakwas-dokarm-cofnij-przywroc" />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.tlo,
  },
  // Odstęp między kartami 12 (karty/README.md §2) [M3 p2]
  container: {
    padding: theme.spacing.md,
    paddingBottom: 40,
    gap: odstepy.m,
  },
});

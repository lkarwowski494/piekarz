import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, Alert, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NadPasem, usePasekStanuJasny } from '../../../src/components/nawigacja/PasZakladki';
import { PasZakwasu } from '../../../src/components/zakwas/PasZakwasu';
import { theme } from '../../../src/ui/theme';
import { typografia } from '../../../src/ui/tokeny';
import { t } from '../../../src/lib/i18n';
import { dniTemu, godzinTemu } from '../../../src/lib/czas-temu';
import { guardSave } from '../../../src/lib/save-guard';
import { resyncNotifications, ensureNotificationPermission } from '../../../src/lib/notifications';
import { NotificationsOffBanner } from '../../../src/components/NotificationsOffBanner';
import { calculateStarterFeeding, calculateStarterPhase } from '../../../src/core/domain-rules';
import { predictStarterPeak } from '../../../src/core/starter-peak-predictor';
import { parseFeedingRatio, formatFeedingRatio, DEFAULT_FEEDING_RATIO } from '../../../src/core/feeding-ratio';
import { confirmDeleteStarter, confirmZalozOdNowa } from '../../../src/lib/confirm';
import { getStarters, saveStarter, deleteStarter } from '../../../src/data/sqlite-store';
import { restartStarterSetup } from '../../../src/data/starter-entries-store';
import { nowyWpis, useStarterLog } from '../../../src/components/zakwas/useStarterLog';
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
import { EditStarterModal } from '../../../src/components/zakwas/EditStarterModal';
import { AddStarterModal } from '../../../src/components/zakwas/AddStarterModal';
import { ZakwasDziennik } from '../../../src/components/zakwas/ZakwasDziennik';
import { ZakladanieStart } from '../../../src/components/zakwas/ZakladanieStart';
import { StalyDzienKarmienia } from '../../../src/components/zakwas/StalyDzienKarmienia';
import { pytanieOStalyDzien } from '../../../src/core/notification-feeding';
import { zapytajOStalyDzien } from '../../../src/lib/staly-dzien-pytanie';
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

  const [targetYield, setTargetYield] = useState<number>(150);
  const [selectedRatio, setSelectedRatio] = useState<[number, number, number]>([1, 2, 2]);
  const [ambientTempC, setAmbientTempC] = useState<number>(22.0);

  // Objawy na karcie bezpieczeństwa (RD-21-W1) i ich ocena
  const objawy = useObjawyZakwasu();

  // Edit Profile Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editFlourType, setEditFlourType] = useState<string>('');
  const [editStorageState, setEditStorageState] = useState<'ROOM_TEMP' | 'FRIDGE'>('FRIDGE');

  // Add New Starter Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newStarterName, setNewStarterName] = useState<string>('');
  const [newStarterFlour, setNewStarterFlour] = useState<string>(() => t('Mąka pszenna chlebowa t750'));
  const [newStarterStorage, setNewStarterStorage] = useState<'ROOM_TEMP' | 'FRIDGE'>('ROOM_TEMP');
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

  // Zapis karmienia w Basic (karta i zapis karmień, D-113)
  const handleLogFeeding = async () => {
    void guardSave(async () => {
      const now = Date.now();
      const updated: StoredStarter = {
        ...starter,
        lastFedAt: now,
        feedingRatio: formatFeedingRatio(selectedRatio),
      };
      await saveStarter(updated);
      void ensureNotificationPermission(); // zgoda przy pierwszym karmieniu, przypomnienia (ADR-006)
      setStarter(updated);
      setStartersList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setWersjaDziennika((v) => v + 1);
      // Stały dzień w inny dzień tygodnia: pytanie „zostawić czy liczyć od” zamiast potwierdzenia (BR-KAL-010) [M3 D7]
      if (pytanieOStalyDzien(updated, now)) {
        if ((await zapytajOStalyDzien(updated.id, now)) === 'licz-od') await loadStarterData(updated.id);
        return;
      }
      // Pasek z „Przywróć” zamiast okna (009, D-051 1a) [M3 W-fix2]
      cofnijDokarmienie.zapamietaj(starter, now);
    })();
  };

  const handleOpenEditModal = () => {
    setEditName(starter.name);
    setEditFlourType(starter.flourType);
    setEditStorageState(starter.storageState);
    setIsEditModalOpen(true);
  };

  // Edycja zapisanego zakwasu w Basic (zapisane działają w całości, kontrakt)
  const handleSaveProfile = async () => {
    void guardSave(async () => {
      const trimmed = editName.trim();
      if (!trimmed) return;
      const updated: StoredStarter = {
        ...starter,
        name: trimmed,
        flourType: editFlourType.trim() || starter.flourType,
        storageState: editStorageState,
      };
      await saveStarter(updated);
      void resyncNotifications();
      setStarter(updated);
      setStartersList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setIsEditModalOpen(false);
      Alert.alert(t('Profil zakwasu'), t('Zapisano zaktualizowany profil'));
    })();
  };

  // Nowy zakwas: limit Basic (1) liczony z bazy przy dodaniu; kolejne zakwasy w Pro (BR-ZAKW-001)
  const handleAddStarter = async () => {
    dodaj('zakwasy', guardSave(async () => {
      const trimmedName = newStarterName.trim();
      if (!trimmedName) return;
      const newStarter: StoredStarter = {
        id: `starter_${Date.now()}`,
        name: trimmedName,
        flourType: newStarterFlour.trim() || t('Mąka pszenna chlebowa'),
        hydration: 100.0,
        birthDate: Date.now(),
        storageState: newStarterStorage,
        lastFedAt: Date.now(),
      };
      await saveStarter(newStarter);
      void resyncNotifications();
      await loadStarterData(newStarter.id);
      setIsAddModalOpen(false);
      setNewStarterName('');
      Alert.alert(t('Dodano zakwas'), t('Kultura „{name}” została utworzona.', { name: trimmedName }));
    }));
  };

  // Usuwanie własnych danych nie wymaga zakupu (DEC-48) [M1-audytor-generalny-007]; także jedynego zakwasu, żeby w Basic
  // dało się założyć nowy (D-113 „ponowne zakładanie po nieudanej próbie dozwolone”) [M3 P-a-fix P0-1]
  const handleDeleteCurrentStarter = () => {
    confirmDeleteStarter(starter.name, guardSave(async () => {
      await deleteStarter(starter.id);
      void resyncNotifications();
      setIsEditModalOpen(false);
      const remaining = startersList.filter((s) => s.id !== starter.id);
      await loadStarterData(remaining[0]?.id);
    }));
  };

  // „Załóż od nowa” (BR-ZAKW-005): ten sam zakwas, wpisy usunięte, dzień 1 od dokarmienia teraz; bez limitu i bez Pro, bo
  // to nie dodanie (jedno aktywne zakładanie naraz: ten zakwas) [M3 P-a-fix P0-1]
  const handleZalozOdNowa = () => {
    confirmZalozOdNowa(guardSave(async () => {
      await restartStarterSetup(starter.id, nowyWpis(starter.id, 'feeding', Date.now()));
      void resyncNotifications();
      setIsEditModalOpen(false);
      setWersjaDziennika((v) => v + 1);
      await loadStarterData(starter.id);
    }));
  };

  const handleCopyFeeding = async () => {
    const copied = await copyFeedingToClipboard(starter, feeding, selectedRatio);
    if (copied) {
      Alert.alert(t('Kopiuj jako tekst'), t('Skopiowano proporcje dokarmiania do schowka'));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <ScrollView contentInsetAdjustmentBehavior="never" keyboardShouldPersistTaps="handled">
        <NadPasem />
        <PasZakwasu gora={gora} starter={starter} wpisy={log.entries} maZakwas={maZakwas} />
        <View style={styles.container}>
        <NotificationsOffBanner />
        {/* Bez bloku statystyk (§12a): wiek i hydratacja w karcie profilu, proporcja w karcie cyklu i ilościach
            do dokarmienia, temperatura w aktywności zakwasu [M1-audytor-generalny-111] */}
        {!maZakwas && (
          // Pierwsze uruchomienie: co zrobić zamiast przykładowego zakwasu jako „twojego” [M1-audytor-generalny-087]
          <Text style={styles.pusty} testID="zakwas-pusty">
            {t('Nie masz jeszcze zakwasu. Dodaj zakwas, który masz, albo załóż nowy.')}
          </Text>
        )}
        {/* Zakładanie od zera: pierwsze dokarmienie tworzy zakwas w dniu 1 (BR-ZAKW-005) [M1-audytor-generalny-104] */}
        {!maZakwas && (
          <ZakladanieStart onZapisz={(nowy) => dodaj('zakwasy', guardSave(async () => {
            await nowy();
            void resyncNotifications();
            await loadStarterData();
          }))} />
        )}

        {/* Starters Carousel / Selector */}
        <StartersSelectorRow
          startersList={startersList}
          activeStarterId={starter.id}
          onSelectStarter={(s) => {
            setStarter(s);
            setSelectedStarterId(s.id);
          }}
          onOpenAddModal={() => dodaj('zakwasy', () => setIsAddModalOpen(true))}
          dodajPro={startersList.length >= LIMITY_BASIC.zakwasy && !moze('kolejny-zakwas')}
        />

        {/* Profile Card */}
        {maZakwas && (
          <StarterProfileCard
            starter={starter}
            ageDays={ageDays}
            lastFedLabel={lastFedLabel}
            unitSystem={unitSystem}
            onOpenEditModal={handleOpenEditModal}
          />
        )}

        {maZakwas && (
          <ZakwasDziennik
            starter={starter}
            log={log}
            wersja={wersjaDziennika}
            onDokarm={handleLogFeeding}
            zDostepem={(akcja) => void akcja()}
            blokadaGotowosci={blokada('gotowosc-zakwasu')}
            zPro={moze('przypomnienia-zakwasu')}
            onZmianaZakwasu={() => loadStarterData(starter.id)}
          />
        )}

        {/* Gotowość i szczyt (BR-ZAKW-003): Pro; w Basic karta widoczna, dotknięcie otwiera ekran Pro (027, D-113) */}
        {maZakwas && (
          <BlokadaFunkcji {...blokada('gotowosc-zakwasu')}>
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
          <BlokadaFunkcji {...blokada('staly-dzien')}>
          <StalyDzienKarmienia starter={starter} teraz={Date.now()} onZapisz={(d) => guardSave(async () => {
            const updated: StoredStarter = { ...starter, fridgeFeedDay: d };
            await saveStarter(updated);
            void resyncNotifications();
            setStarter(updated);
            setStartersList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
          })()} />
          </BlokadaFunkcji>
        )}

        {/* Dokarmianie z proporcją (BR-ZAKW-002): Pro (D-113) */}
        <BlokadaFunkcji {...blokada('proporcje-zakwasu')}>
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
          onZalozOdNowa={maZakwas ? handleZalozOdNowa : undefined}
        />

        {/* Modal: Edit Starter Profile */}
        <EditStarterModal
          visible={isEditModalOpen}
          name={editName}
          onNameChange={setEditName}
          flourType={editFlourType}
          onFlourTypeChange={setEditFlourType}
          storageState={editStorageState}
          onStorageStateChange={setEditStorageState}
          canDelete={startersList.length > 0}
          onDelete={handleDeleteCurrentStarter}
          onZalozOdNowa={handleZalozOdNowa}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveProfile}
        />

        {/* Modal: Add New Starter */}
        <AddStarterModal
          visible={isAddModalOpen}
          name={newStarterName}
          onNameChange={setNewStarterName}
          flour={newStarterFlour}
          onFlourChange={setNewStarterFlour}
          storage={newStarterStorage}
          onStorageChange={setNewStarterStorage}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddStarter}
        />

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
  container: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  pusty: {
    fontSize: typografia.style.tresc.pt,
    color: theme.colors.tusz2,
    marginBottom: theme.spacing.md,
  },
});

// ============================================================================
// Piekarz — akcje zapisu ekranu Zakwasy: dokarmienie, edycja profilu, nowy zakwas, usunięcie, „Załóż od nowa”.
// Wydzielone z app/(tabs)/zakwasy/index.tsx bez zmiany zachowania (limit 20 480 B, M3 p2); ścieżka zapisu ta sama:
// saveStarter / deleteStarter / restartStarterSetup przez guardSave; dokarmienie przez dziennik [M1-audytor-generalny-002].
// ============================================================================

import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import { t } from '../../lib/i18n';
import { guardSave } from '../../lib/save-guard';
import { resyncNotifications, ensureNotificationPermission } from '../../lib/notifications';
import { formatFeedingRatio } from '../../core/feeding-ratio';
import { confirmDeleteStarter, confirmZalozOdNowa } from '../../lib/confirm';
import { saveStarter, deleteStarter } from '../../data/sqlite-store';
import { addStarterEntry, createStarterWithEntry, restartStarterSetup } from '../../data/starter-entries-store';
import { wpisDokarmienia } from '../../lib/kalendarz-akcje';
import { nowyWpis } from './useStarterLog';
import type { StoredStarter } from '../../data/db';
import { pytanieOStalyDzien } from '../../core/notification-feeding';
import { zapytajOStalyDzien } from '../../lib/staly-dzien-pytanie';

type Miejsce = 'ROOM_TEMP' | 'FRIDGE';

export function useAkcjeZakwasu({ starter, setStarter, startersList, setStartersList, selectedRatio, loadStarterData, odswiezDziennik, zapamietajCofniecie, dodaj }: {
  starter: StoredStarter;
  setStarter: (s: StoredStarter) => void;
  startersList: StoredStarter[];
  setStartersList: (f: (prev: StoredStarter[]) => StoredStarter[]) => void;
  selectedRatio: [number, number, number];
  loadStarterData: (preferredId?: string) => Promise<void>;
  odswiezDziennik: () => void;
  zapamietajCofniecie: (przed: StoredStarter, kiedy: number) => void;
  dodaj: (co: 'zakwasy', akcja: () => void | Promise<void>) => unknown;
}) {
  // Edit Profile Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editFlourType, setEditFlourType] = useState<string>('');
  const [editStorageState, setEditStorageState] = useState<Miejsce>('FRIDGE');

  // Add New Starter Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newStarterName, setNewStarterName] = useState<string>('');
  const [newStarterFlour, setNewStarterFlour] = useState<string>(() => t('Mąka pszenna chlebowa t750'));
  const [newStarterStorage, setNewStarterStorage] = useState<Miejsce>('ROOM_TEMP');

  // Blokada w trakcie zapisu: drugie stuknięcie przed końcem zapisu nic nie zapisuje (wzór useFinishBake)
  // [M1-audytor-generalny-028; 08-programista-006]
  const zapisuje = useRef(false);
  const jedenNaraz = (fn: () => Promise<void>) => async () => {
    if (zapisuje.current) return;
    zapisuje.current = true;
    try {
      await fn();
    } finally {
      zapisuje.current = false;
    }
  };

  const podmien = (updated: StoredStarter) => {
    setStarter(updated);
    setStartersList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  // Zapis karmienia w Basic (karta i zapis karmień, D-113)
  const handleLogFeeding = async () => {
    void guardSave(jedenNaraz(async () => {
      const now = Date.now();
      const updated: StoredStarter = {
        ...starter,
        lastFedAt: now,
        feedingRatio: formatFeedingRatio(selectedRatio),
      };
      // Dokarmienie tylko przez dziennik (jedna droga zapisu) [M1-audytor-generalny-002; 05-architekt-501]
      await addStarterEntry(wpisDokarmienia(starter.id, now, updated.feedingRatio));
      void ensureNotificationPermission(); // zgoda przy pierwszym karmieniu, przypomnienia (ADR-006)
      podmien(updated);
      odswiezDziennik();
      // Stały dzień w inny dzień tygodnia: pytanie „zostawić czy liczyć od” zamiast potwierdzenia (BR-KAL-010) [M3 D7]
      if (pytanieOStalyDzien(updated, now)) {
        if ((await zapytajOStalyDzien(updated.id, now)) === 'licz-od') await loadStarterData(updated.id);
        return;
      }
      // Pasek z „Przywróć” zamiast okna (009, D-051 1a) [M3 W-fix2]
      zapamietajCofniecie(starter, now);
    }))();
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
      podmien(updated);
      setIsEditModalOpen(false);
      Alert.alert(t('Profil zakwasu'), t('Zapisano zaktualizowany profil'));
    })();
  };

  // Nowy zakwas: limit Basic (1) liczony z bazy przy dodaniu; kolejne zakwasy w Pro (BR-ZAKW-001)
  const handleAddStarter = async () => {
    dodaj('zakwasy', guardSave(jedenNaraz(async () => {
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
      // Zakwas z pierwszym dokarmieniem w jednej transakcji (dokarmienie przez dziennik) [M1-audytor-generalny-002]
      await createStarterWithEntry(newStarter, wpisDokarmienia(newStarter.id, newStarter.birthDate));
      void resyncNotifications();
      await loadStarterData(newStarter.id);
      setIsAddModalOpen(false);
      setNewStarterName('');
      Alert.alert(t('Dodano zakwas'), t('Kultura „{name}” została utworzona.', { name: trimmedName }));
    })));
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
      odswiezDziennik();
      await loadStarterData(starter.id);
    }));
  };

  /** Stały dzień karmienia (BR-KAL-010, PR-22) [M3 D7]. */
  const zapiszStalyDzien = (d: StoredStarter['fridgeFeedDay']) => guardSave(async () => {
    const updated: StoredStarter = { ...starter, fridgeFeedDay: d };
    await saveStarter(updated);
    void resyncNotifications();
    podmien(updated);
  })();

  return {
    handleLogFeeding,
    handleOpenEditModal,
    handleZalozOdNowa,
    zapiszStalyDzien,
    otworzDodawanie: () => dodaj('zakwasy', () => setIsAddModalOpen(true)),
    edycja: {
      visible: isEditModalOpen,
      name: editName,
      onNameChange: setEditName,
      flourType: editFlourType,
      onFlourTypeChange: setEditFlourType,
      storageState: editStorageState,
      onStorageStateChange: setEditStorageState,
      canDelete: startersList.length > 0,
      onDelete: handleDeleteCurrentStarter,
      onZalozOdNowa: handleZalozOdNowa,
      onClose: () => setIsEditModalOpen(false),
      onSave: handleSaveProfile,
    },
    dodawanie: {
      visible: isAddModalOpen,
      name: newStarterName,
      onNameChange: setNewStarterName,
      flour: newStarterFlour,
      onFlourChange: setNewStarterFlour,
      storage: newStarterStorage,
      onStorageChange: setNewStarterStorage,
      onClose: () => setIsAddModalOpen(false),
      onSave: handleAddStarter,
    },
  };
}

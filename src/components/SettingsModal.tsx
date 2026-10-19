import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../ui/theme';
import { t, chooseLanguage, Lang, useLang } from '../lib/i18n';
import { CloseButton } from './CloseButton';
import {
  getBakerRitualProfile,
  setBakerRitualProfile,
  BakerRitualProfile,
  getBakingVessel,
  setBakingVessel,
  BakingVessel,
} from '../data/sqlite-store';
import { useUnitSystem, setUnitSystem, UnitSystem } from '../lib/unit-converter';
import { BakerRitualSection } from './settings/BakerRitualSection';
import { PreferencesSection } from './settings/PreferencesSection';
import { BackupAndDataSection } from './settings/BackupAndDataSection';
import { StudioEcosystemSection } from './settings/StudioEcosystemSection';
import { ZakupySection } from './settings/ZakupySection';

export interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const currentLang = useLang();
  const unitSystem = useUnitSystem();

  // Craft Ritual Profile & Equipment
  const [ritualProfile, setRitualProfileState] = useState<BakerRitualProfile>('artisan_hybrid');
  const [bakingVessel, setBakingVesselState] = useState<BakingVessel>('dutch_oven');

  useEffect(() => {
    if (visible) {
      void getBakerRitualProfile().then(setRitualProfileState);
      void getBakingVessel().then(setBakingVesselState);
    }
  }, [visible]);

  const handleProfileChange = async (p: BakerRitualProfile) => {
    setRitualProfileState(p);
    await setBakerRitualProfile(p);
  };

  const handleVesselChange = async (v: BakingVessel) => {
    setBakingVesselState(v);
    await setBakingVessel(v);
  };

  // Zmiana od razu i zapis na kolejne uruchomienia [M1-audytor-generalny-048]
  const handleLanguageChange = (newLang: Lang) => {
    void chooseLanguage(newLang).catch(() => {});
  };

  const handleUnitSystemChange = (system: UnitSystem) => {
    setUnitSystem(system);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <CloseButton onPress={onClose} />
          <Text style={styles.headerTitle}>{t('Ustawienia')}</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Baking Ritual Profile & Equipment */}
          <BakerRitualSection
            ritualProfile={ritualProfile}
            onProfileChange={handleProfileChange}
            bakingVessel={bakingVessel}
            onVesselChange={handleVesselChange}
          />

          {/* Language & Unit System */}
          <PreferencesSection
            currentLang={currentLang}
            onLanguageChange={handleLanguageChange}
            unitSystem={unitSystem}
            onUnitSystemChange={handleUnitSystemChange}
          />

          {/* Zakupy: przywracanie bez ekranu zakupu [M1-audytor-generalny-010] */}
          <ZakupySection />

          {/* Backup & CSV Exports */}
          <BackupAndDataSection />

          {/* Apps4Craft Studio Family & Security */}
          <StudioEcosystemSection />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  headerPlaceholder: {
    width: 44,
  },
  content: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
});

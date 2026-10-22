import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  Platform,
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { ustawEkranZakupu } from '../lib/platnosci/ekran';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../ui/theme';
import { t, chooseLanguage, Lang, useLang } from '../lib/i18n';
import { CloseButton } from './CloseButton';
import { guardSave } from '../lib/save-guard';
import { resyncNotifications } from '../lib/notifications';
import {
  getBakingVessel,
  setBakingVessel,
  BakingVessel,
} from '../data/sqlite-store';
import { useUnitSystem, setUnitSystem, UnitSystem } from '../lib/unit-converter';
import { BakerRitualSection } from './settings/BakerRitualSection';
import { PreferencesSection } from './settings/PreferencesSection';
import { GodzinySnuSection } from './settings/GodzinySnuSection';
import { PrzypomnieniaKarmieniaSection } from './settings/PrzypomnieniaKarmieniaSection';
import { BackupAndDataSection } from './settings/BackupAndDataSection';
import { ImportRecepturySection } from './settings/ImportRecepturySection';
import { StudioEcosystemSection } from './settings/StudioEcosystemSection';
import { ZakupySection } from './settings/ZakupySection';

import { typografia } from '../ui/tokeny';
export interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const currentLang = useLang();
  const unitSystem = useUnitSystem();

  // Naczynie do wypieku; bez wyboru stylu wypieku [M1-audytor-generalny-101; BR-START-001]
  const [bakingVessel, setBakingVesselState] = useState<BakingVessel>('dutch_oven');

  useEffect(() => {
    if (visible) {
      void getBakingVessel().then(setBakingVesselState);
    }
  }, [visible]);

  const handleVesselChange = async (v: BakingVessel) => {
    setBakingVesselState(v);
    await guardSave(() => setBakingVessel(v))();
  };

  // Zmiana od razu i zapis na kolejne uruchomienia [M1-audytor-generalny-048]; nieudany zapis: „Nie zapisano” [M1-audytor-generalny-120]
  const handleLanguageChange = (newLang: Lang) => {
    void guardSave(() => chooseLanguage(newLang))();
    // Zaplanowane powiadomienia od razu w nowym języku, nie dopiero po powrocie na pierwszy plan [reaudit-noc N-10; M1-audytor-generalny-136]
    void resyncNotifications();
  };

  const handleUnitSystemChange = (system: UnitSystem) => {
    setUnitSystem(system);
  };

  // Ekran Pro z Ustawień (kontrakt „Reguły dostępu”) [M3 P-b]: najpierw zamknięcie arkusza Ustawień, ekran Pro dopiero po
  // jego zniknięciu (onDismiss, iOS), bo dwa arkusze modalne naraz iOS pokazuje zawodnie; poza iOS od razu
  const proPoZamknieciu = useRef(false);
  const otworzPro = () => {
    onClose();
    if (Platform.OS === 'ios') proPoZamknieciu.current = true;
    else ustawEkranZakupu(true);
  };
  const poZamknieciu = () => {
    if (!proPoZamknieciu.current) return;
    proPoZamknieciu.current = false;
    ustawEkranZakupu(true);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose} onDismiss={poZamknieciu}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <CloseButton onPress={onClose} akcja="zamknij" />
          <Text style={styles.headerTitle}>{t('Ustawienia')}</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Baking Equipment */}
          <BakerRitualSection
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

          {/* Godziny snu dla planu wypieku i prowadzenia (D-066 1a, BR-HARMO-002) [M1-audytor-generalny-130] */}
          <GodzinySnuSection />

          {/* Przypomnienia o karmieniu zakwasu: wyłączenie bez wyłączania kroków wypieku (DEC-22 a) [M1-audytor-generalny-179] */}
          <PrzypomnieniaKarmieniaSection />

          {/* Zakupy: wejście do ekranu Pro, przywracanie bez ekranu zakupu, zarządzanie, kod [M1-audytor-generalny-010; M3 P-b] */}
          <ZakupySection onOtworzPro={otworzPro} />

          {/* Backup & CSV Exports */}
          <BackupAndDataSection />

          {/* „Importuj z pliku”: jedno wejście dla receptury i kopii, tylko tutaj (F-33, 057, 113) [M1-audytor-generalny-057, -113] */}
          <ImportRecepturySection />

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
    backgroundColor: theme.colors.tlo,
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.linia,
    backgroundColor: theme.colors.powierzchnia,
  },
  headerTitle: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: typografia.style.tresc.pt,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  headerPlaceholder: {
    width: 44,
  },
  content: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
});

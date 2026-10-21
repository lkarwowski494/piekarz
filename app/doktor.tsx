import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../src/ui/theme';
import { t } from '../src/lib/i18n';
import {
  diagnoseBreadDefect,
  BreadInspectionCriteria,
} from '../src/doctor/diagnostics';
import { EmergencyCode } from '../src/doctor/dough-recovery';
import { copyDiagnosisToClipboard } from '../src/lib/diagnosis-formatter';
import { BreadAcademyModal } from '../src/components/BreadAcademyModal';
import { useUnitSystem } from '../src/lib/unit-converter';
import { setPendingRecipeToLoad } from '../src/lib/recipe-navigation';
import { MASTER_RECIPES } from '../src/recipes/presets';
import { DiagnosisResultCard } from '../src/components/doktor/DiagnosisResultCard';
import { EmergencyRecoverySection } from '../src/components/doktor/EmergencyRecoverySection';
import {
  SymptomSelectorSection,
  DiagnosticPreset,
} from '../src/components/doktor/SymptomSelectorSection';
import { KitchenTestsGuideSection } from '../src/components/doktor/KitchenTestsGuideSection';
import { useAppAccess } from '../src/lib/app-access';
import { BlokadaFunkcji } from '../src/components/BlokadaFunkcji';
import { wejscieWidoczne } from '../src/lib/wejscia-pozniej';

import { typografia } from '../src/ui/tokeny';
export default function DoctorScreen() {
  const router = useRouter();
  const unitSystem = useUnitSystem();
  // Bez uprawnienia Doktor i Akademia otwierają ekran zakupu [M1-audytor-generalny-027]
  const { blokada, chron } = useAppAccess();
  // Bez zaznaczonych objawów na starcie: diagnoza dopiero po wyborze użytkownika [audyt-niezalezny E-6]
  const [symptoms, setSymptoms] = useState<BreadInspectionCriteria>({});

  const [selectedRecoveryId, setSelectedRecoveryId] = useState<EmergencyCode | null>(null);
  const [isAcademyOpen, setIsAcademyOpen] = useState<boolean>(false);

  const toggleSymptom = (key: keyof BreadInspectionCriteria) => {
    setSymptoms((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const applyPreset = (preset: DiagnosticPreset) => {
    setSymptoms({ ...preset.symptoms });
  };

  const hasAnySymptom = useMemo(() => {
    return Object.values(symptoms).some(Boolean);
  }, [symptoms]);

  const diagnosis = useMemo(() => {
    if (!hasAnySymptom) return null;
    return diagnoseBreadDefect(symptoms);
  }, [symptoms, hasAnySymptom]);

  const handleClear = () => {
    setSymptoms({});
  };

  const handleCopyDiagnosis = async () => {
    if (diagnosis) {
      await copyDiagnosisToClipboard(diagnosis);
    }
  };

  const handlePivotToRecipe = (protocolId: EmergencyCode) => {
    let presetId = 'focaccia_genovese';
    if (protocolId === 'SLACK_HIGH_HYDRATION') {
      presetId = 'rye_100_pan';
    } else if (protocolId === 'OVERPROOFED_COLLAPSE') {
      presetId = 'focaccia_genovese';
    } else {
      presetId = 'country_loaf_72';
    }

    const preset = MASTER_RECIPES.find((p) => p.id === presetId);
    if (preset) {
      setPendingRecipeToLoad({
        id: preset.id,
        name: preset.namePl,
        targetDDT: preset.targetDDT,
        formula: preset.formula,
      });
      router.push('/receptury');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      {/* Nagłówek systemowy „Doktor Chleba”: app/_layout.tsx; Akademia jako pierwszy wiersz treści (dawniej w nagłówku ekranu) */}
      <ScrollView contentContainerStyle={styles.container} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
        {/* Akademia bez wejścia w 1.0 (wejścia-później 'akademia', F-44) [M1-audytor-generalny-100]; kod i testy modułu zostają */}
        {wejscieWidoczne('akademia') && (
        <Pressable
          accessibilityRole="button"
          testID="open-academy-btn"
          style={styles.academyHeaderPill}
          onPress={chron('doktor', () => setIsAcademyOpen(true))}
          accessibilityLabel={t('Akademia Piekarza')}
        >
          <Text style={styles.academyHeaderPillText}>{t('Akademia')}</Text>
        </Pressable>
        )}
        <BlokadaFunkcji {...blokada('doktor')}>
        {/* Bread Academy Promotion Banner */}
        {wejscieWidoczne('akademia') && (
        <Pressable
          accessibilityRole="button"
          testID="open-academy-banner"
          style={styles.academyBanner}
          onPress={() => setIsAcademyOpen(true)}
        >
          <View style={styles.academyBannerContent}>
            <Text style={styles.academyBannerTitle}>{t('Akademia Piekarza')}</Text>
            <Text style={styles.academyBannerSubtitle}>
              {t('Szkoła Chleba, 12 technik rzemieślniczych i Trener procentu')}
            </Text>
          </View>
        </Pressable>
        )}

        {/* Diagnosis Result Card (Primary Focus) */}
        <DiagnosisResultCard
          diagnosis={diagnosis}
          unitSystem={unitSystem}
          onNavigateHarmonogram={() => router.push('/receptury/harmonogram')}
          onNavigateCalculator={() => router.push('/receptury')}
          onNavigateStolnica={() => router.push('/stolnica')}
          onCopyDiagnosis={handleCopyDiagnosis}
        />

        {/* Protokoły ratunkowe PÓŹNIEJ do czasu źródeł (032 b) [M1-audytor-generalny-032]; kod i testy modułu zostają */}
        {wejscieWidoczne('protokoly-ratunkowe') && (
        <EmergencyRecoverySection
          selectedRecoveryId={selectedRecoveryId}
          onSelectRecoveryId={setSelectedRecoveryId}
          unitSystem={unitSystem}
          onPivotToRecipe={handlePivotToRecipe}
        />
        )}

        {/* Symptoms Selector (Miękisz, Skórka, Smak) */}
        <SymptomSelectorSection
          symptoms={symptoms}
          onToggleSymptom={toggleSymptom}
          onApplyPreset={applyPreset}
          hasAnySymptom={hasAnySymptom}
          onClear={handleClear}
        />

        {/* Interactive Kitchen Tests Guide (Poke Test, Windowpane) */}
        <KitchenTestsGuideSection />
        </BlokadaFunkcji>


        {/* Modal: Bread Academy (SCI, BIB, TRE) */}
        <BreadAcademyModal
          visible={isAcademyOpen}
          onClose={() => setIsAcademyOpen(false)}
        />
      </ScrollView>
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
  academyHeaderPill: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.sm,
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.akcent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  academyHeaderPillText: {
    fontSize: typografia.style.podpis.pt,
    fontWeight: '700',
    color: theme.colors.akcentTekst,
  },
  academyBanner: {
    minHeight: theme.cele.pozostale,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.akcent,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  academyBannerContent: {
    flex: 1,
  },
  academyBannerTitle: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  academyBannerSubtitle: {
    fontSize: 11,
    color: theme.colors.tusz2,
    lineHeight: 14,
    marginTop: 1,
  },
});

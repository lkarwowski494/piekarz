import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../src/ui/theme';
import { t } from '../../src/lib/i18n';
import {
  diagnoseBreadDefect,
  BreadInspectionCriteria,
} from '../../src/doctor/diagnostics';

export default function DoctorScreen() {
  const [symptoms, setSymptoms] = useState<BreadInspectionCriteria>({
    crumbHasHugeTopHolesWithDenseBottom: true, // Default example
  });

  const toggleSymptom = (key: keyof BreadInspectionCriteria) => {
    setSymptoms((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('Doktor Chleba')}</Text>
          <Text style={styles.subtitle}>
            Diagnostyka błędów wypieku i ratowanie bochenka
          </Text>
        </View>

        {/* Diagnosis Result Card (Top Focus) */}
        {diagnosis ? (
          <View
            style={[
              styles.diagnosisCard,
              diagnosis.severity === 'critical'
                ? styles.severityCritical
                : diagnosis.severity === 'moderate'
                ? styles.severityModerate
                : styles.severityMild,
            ]}
          >
            <View style={styles.diagnosisHeader}>
              <Text style={styles.diagnosisTitle}>{diagnosis.titlePl}</Text>
              <Text style={styles.diagnosisSubtitle}>{diagnosis.subtitlePl}</Text>
            </View>

            <View style={styles.causeBox}>
              <Text style={styles.causeLabel}>Przyczyna biologiczno-chemiczna:</Text>
              <Text style={styles.causeText}>{diagnosis.biologicalCausePl}</Text>
            </View>

            <Text style={styles.checklistTitle}>Co zrobić przy następnym wypieku:</Text>
            {diagnosis.actionChecklistPl.map((action, idx) => (
              <View key={idx} style={styles.checklistItem}>
                <Text style={styles.bulletCheck}>✓</Text>
                <Text style={styles.checklistText}>{action}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Wybierz objawy bochenka</Text>
            <Text style={styles.emptyText}>
              Zaznacz poniżej cechy miękiszu lub skórki, które Cię niepokoją, aby
              Doktor Chleba zidentyfikował błąd technologiczny i podał rozwiązanie.
            </Text>
          </View>
        )}

        {/* Symptoms Section: Miękisz */}
        <Text style={styles.sectionHeading}>Miękisz (Wnętrze bochenka)</Text>
        <View style={styles.chipsContainer}>
          <Pressable
            style={[
              styles.symptomChip,
              symptoms.crumbHasHugeTopHolesWithDenseBottom && styles.symptomChipActive,
            ]}
            onPress={() => toggleSymptom('crumbHasHugeTopHolesWithDenseBottom')}
          >
            <Text
              style={[
                styles.symptomChipText,
                symptoms.crumbHasHugeTopHolesWithDenseBottom && styles.symptomChipTextActive,
              ]}
            >
              Wielkie dziury pod skórką i zbity dół (Jaskinie)
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.symptomChip,
              symptoms.crumbHasSmallUniformFoamLikeHoles && styles.symptomChipActive,
            ]}
            onPress={() => toggleSymptom('crumbHasSmallUniformFoamLikeHoles')}
          >
            <Text
              style={[
                styles.symptomChipText,
                symptoms.crumbHasSmallUniformFoamLikeHoles && styles.symptomChipTextActive,
              ]}
            >
              Drobne, jednolite pęcherzyki jak gąbka/pianka
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.symptomChip,
              symptoms.crumbIsWetGummyToKnife && styles.symptomChipActive,
            ]}
            onPress={() => toggleSymptom('crumbIsWetGummyToKnife')}
          >
            <Text
              style={[
                styles.symptomChipText,
                symptoms.crumbIsWetGummyToKnife && styles.symptomChipTextActive,
              ]}
            >
              Mokry, lepki miękisz, brudzi nóż
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.symptomChip,
              symptoms.crumbIsUniformlyDenseAllOver && styles.symptomChipActive,
            ]}
            onPress={() => toggleSymptom('crumbIsUniformlyDenseAllOver')}
          >
            <Text
              style={[
                styles.symptomChipText,
                symptoms.crumbIsUniformlyDenseAllOver && styles.symptomChipTextActive,
              ]}
            >
              Jednolicie gęsty i ciężki miękisz (brak napowietrzenia)
            </Text>
          </Pressable>
        </View>

        {/* Symptoms Section: Skórka i Kształt */}
        <Text style={styles.sectionHeading}>Skórka i Kształt bochenka</Text>
        <View style={styles.chipsContainer}>
          <Pressable
            style={[
              styles.symptomChip,
              symptoms.loafIsFlatLikeDisk && styles.symptomChipActive,
            ]}
            onPress={() => toggleSymptom('loafIsFlatLikeDisk')}
          >
            <Text
              style={[
                styles.symptomChipText,
                symptoms.loafIsFlatLikeDisk && styles.symptomChipTextActive,
              ]}
            >
              Chleb płaski jak dysk (rozlał się na boki)
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.symptomChip,
              symptoms.loafCollapsedAfterScoring && styles.symptomChipActive,
            ]}
            onPress={() => toggleSymptom('loafCollapsedAfterScoring')}
          >
            <Text
              style={[
                styles.symptomChipText,
                symptoms.loafCollapsedAfterScoring && styles.symptomChipTextActive,
              ]}
            >
              Opadł / zapadł się natychmiast po nacięciu żyletką
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.symptomChip,
              symptoms.loafBurstAtBottomSide && styles.symptomChipActive,
            ]}
            onPress={() => toggleSymptom('loafBurstAtBottomSide')}
          >
            <Text
              style={[
                styles.symptomChipText,
                symptoms.loafBurstAtBottomSide && styles.symptomChipTextActive,
              ]}
            >
              Rozerwanie boku przy spodzie (Blowout)
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.symptomChip,
              symptoms.crustIsPaleLackColor && styles.symptomChipActive,
            ]}
            onPress={() => toggleSymptom('crustIsPaleLackColor')}
          >
            <Text
              style={[
                styles.symptomChipText,
                symptoms.crustIsPaleLackColor && styles.symptomChipTextActive,
              ]}
            >
              Blada skórka, brak złocisto-karmelowego rumienia
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.symptomChip,
              symptoms.crustLacksEarCutDidNotOpen && styles.symptomChipActive,
            ]}
            onPress={() => toggleSymptom('crustLacksEarCutDidNotOpen')}
          >
            <Text
              style={[
                styles.symptomChipText,
                symptoms.crustLacksEarCutDidNotOpen && styles.symptomChipTextActive,
              ]}
            >
              Brak otwartego ucha (nacięcie się zasklepiło)
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.symptomChip,
              symptoms.cutImmediatelyWhileSteamingHot && styles.symptomChipActive,
            ]}
            onPress={() => toggleSymptom('cutImmediatelyWhileSteamingHot')}
          >
            <Text
              style={[
                styles.symptomChipText,
                symptoms.cutImmediatelyWhileSteamingHot && styles.symptomChipTextActive,
              ]}
            >
              Krojony gorący, prosto po wyjęciu z piekarnika
            </Text>
          </Pressable>
        </View>

        {hasAnySymptom && (
          <Pressable style={styles.clearBtn} onPress={handleClear}>
            <Text style={styles.clearBtnText}>Wyczyść zaznaczone objawy</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  diagnosisCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 2,
    marginBottom: theme.spacing.md,
  },
  severityMild: {
    borderColor: theme.colors.accent,
  },
  severityModerate: {
    borderColor: theme.colors.statusWarning,
  },
  severityCritical: {
    borderColor: theme.colors.statusDanger,
  },
  diagnosisHeader: {
    marginBottom: 10,
  },
  diagnosisTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  diagnosisSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  causeBox: {
    backgroundColor: theme.colors.backgroundSecondary,
    padding: 10,
    borderRadius: theme.radius.md,
    marginBottom: 12,
  },
  causeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.accentDark,
    marginBottom: 2,
  },
  causeText: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    lineHeight: 17,
  },
  checklistTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bulletCheck: {
    fontSize: 13,
    color: theme.colors.statusSuccess,
    fontWeight: '800',
    marginRight: 6,
    marginTop: 1,
  },
  checklistText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 17,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 8,
    marginBottom: 8,
  },
  chipsContainer: {
    gap: 6,
    marginBottom: 14,
  },
  symptomChip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  symptomChipActive: {
    backgroundColor: theme.colors.accentLight,
    borderColor: theme.colors.accent,
  },
  symptomChipText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  symptomChipTextActive: {
    color: theme.colors.accentDark,
    fontWeight: '700',
  },
  clearBtn: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  clearBtnText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
});

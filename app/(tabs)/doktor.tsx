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
import { CraftHeader, sharedCraftTokens } from '@apps4craft/ui';
import { theme } from '../../src/ui/theme';
import { t } from '../../src/lib/i18n';
import {
  diagnoseBreadDefect,
  BreadInspectionCriteria,
} from '../../src/doctor/diagnostics';
import {
  DOUGH_RECOVERY_PROTOCOLS,
  EmergencyCode,
  getDoughRecoveryProtocol,
} from '../../src/doctor/dough-recovery';
import { copyDiagnosisToClipboard } from '../../src/lib/diagnosis-formatter';
import { BreadAcademyModal } from '../../src/components/BreadAcademyModal';
import { useUnitSystem, formatTextUnits } from '../../src/lib/unit-converter';

interface DiagnosticPreset {
  id: string;
  name: string;
  icon: string;
  symptoms: BreadInspectionCriteria;
}

const PRESETS: DiagnosticPreset[] = [
  {
    id: 'preset_under',
    name: 'Jaskinie (Niedofermentowany)',
    icon: '🏔️',
    symptoms: { crumbHasHugeTopHolesWithDenseBottom: true },
  },
  {
    id: 'preset_over',
    name: 'Płaski dysk (Przerośnięty)',
    icon: '🥞',
    symptoms: { loafIsFlatLikeDisk: true, loafCollapsedAfterScoring: true },
  },
  {
    id: 'preset_gummy',
    name: 'Gumowaty (Gorący nóż)',
    icon: '🔪',
    symptoms: { cutImmediatelyWhileSteamingHot: true },
  },
  {
    id: 'preset_blowout',
    name: 'Pęknięty bok (Blowout)',
    icon: '🌋',
    symptoms: { loafBurstAtBottomSide: true },
  },
  {
    id: 'preset_sour',
    name: 'Zbyt kwaśny (Octowy)',
    icon: '🍋',
    symptoms: { breadIsExcessivelySour: true },
  },
  {
    id: 'preset_bland',
    name: 'Płaski smak (Jałowy)',
    icon: '🥖',
    symptoms: { breadIsBlandNoFlavor: true },
  },
];

export default function DoctorScreen() {
  const router = useRouter();
  const unitSystem = useUnitSystem();
  const [symptoms, setSymptoms] = useState<BreadInspectionCriteria>({
    crumbHasHugeTopHolesWithDenseBottom: true, // Default initial example
  });

  // Expandable kitchen test guides
  const [showPokeTest, setShowPokeTest] = useState<boolean>(false);
  const [showWindowpaneTest, setShowWindowpaneTest] = useState<boolean>(false);
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

  const getSeverityBadge = (severity: 'mild' | 'moderate' | 'critical') => {
    switch (severity) {
      case 'critical':
        return {
          label: t('Krytyczny błąd struktury'),
          badgeStyle: styles.badgeCritical,
          textStyle: styles.badgeTextCritical,
        };
      case 'moderate':
        return {
          label: t('Umiarkowana wada'),
          badgeStyle: styles.badgeModerate,
          textStyle: styles.badgeTextModerate,
        };
      case 'mild':
      default:
        return {
          label: t('Drobna niedoskonałość'),
          badgeStyle: styles.badgeMild,
          textStyle: styles.badgeTextMild,
        };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <CraftHeader
        title={t('Doktor Chleba')}
        subtitle={t('Diagnostyka błędów wypieku i ratowanie bochenka')}
        testID="doktor-header"
        rightAction={
          <Pressable
            testID="open-academy-btn"
            hitSlop={sharedCraftTokens.hitSlopStandard}
            style={styles.academyHeaderPill}
            onPress={() => setIsAcademyOpen(true)}
            accessibilityLabel={t('Akademia Piekarza')}
          >
            <Text style={styles.academyHeaderPillText}>🎓 {t('Akademia')}</Text>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.container}>

        {/* Bread Academy Promotion Banner */}
        <Pressable
          testID="open-academy-banner"
          style={styles.academyBanner}
          onPress={() => setIsAcademyOpen(true)}
        >
          <View style={styles.academyBannerIcon}>
            <Text style={styles.academyBannerIconText}>🎓</Text>
          </View>
          <View style={styles.academyBannerContent}>
            <Text style={styles.academyBannerTitle}>{t('Akademia Piekarza')}</Text>
            <Text style={styles.academyBannerSubtitle}>
              {t('Szkoła Chleba, 12 technik rzemieślniczych i Trener procentu')}
            </Text>
          </View>
          <Text style={styles.academyBannerArrow}>→</Text>
        </Pressable>

        {/* Diagnosis Result Card (Primary Focus) */}
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
            <View style={styles.severityRow}>
              {(() => {
                const s = getSeverityBadge(diagnosis.severity);
                return (
                  <View style={[styles.severityBadge, s.badgeStyle]}>
                    <Text style={[styles.severityBadgeText, s.textStyle]}>{s.label}</Text>
                  </View>
                );
              })()}
              <Text style={styles.defectCodeTag}>{diagnosis.defectCode}</Text>
            </View>

            <View style={styles.diagnosisHeader}>
              <Text style={styles.diagnosisTitle}>{diagnosis.titlePl}</Text>
              <Text style={styles.diagnosisSubtitle}>{diagnosis.subtitlePl}</Text>
            </View>

            <View style={styles.causeBox}>
              <Text style={styles.causeLabel}>{t('Przyczyna biologiczno-chemiczna:')}</Text>
              <Text style={styles.causeText}>{formatTextUnits(diagnosis.biologicalCausePl, unitSystem)}</Text>
            </View>

            <Text style={styles.checklistTitle}>{t('Co zrobić przy następnym wypieku:')}</Text>
            {diagnosis.actionChecklistPl.map((action, idx) => (
              <View key={idx} style={styles.checklistItem}>
                <Text style={styles.bulletCheck}>✓</Text>
                <Text style={styles.checklistText}>{formatTextUnits(action, unitSystem)}</Text>
              </View>
            ))}

            {/* Smart Navigation Link */}
            {(diagnosis.defectCode === 'UNDER_PROOFED' || diagnosis.defectCode === 'OVER_PROOFED') && (
              <Pressable
                style={styles.navActionBtn}
                onPress={() => router.push('/(tabs)/harmonogram')}
              >
                <Text style={styles.navActionBtnText}>
                  ⏱️ {t('Przejdź do Harmonogramu (Sleep Guard)')}
                </Text>
              </Pressable>
            )}

            {diagnosis.defectCode === 'DENSE_CRUMB' && (
              <Pressable
                style={styles.navActionBtn}
                onPress={() => router.push('/(tabs)')}
              >
                <Text style={styles.navActionBtnText}>
                  ⚖️ {t('Dostosuj hydratację w Kalkulatorze')}
                </Text>
              </Pressable>
            )}

            {diagnosis.defectCode === 'GUMMY_CRUMB' && (
              <Pressable
                style={styles.navActionBtn}
                onPress={() => router.push('/(tabs)/stolnica')}
              >
                <Text style={styles.navActionBtnText}>
                  🥖 {t('Przejdź do Stolnicy')}
                </Text>
              </Pressable>
            )}

            {/* Copy Diagnosis to Clipboard Button */}
            <Pressable
              testID="copy-diagnosis-btn"
              style={styles.copyDiagnosisBtn}
              onPress={handleCopyDiagnosis}
            >
              <Text style={styles.copyDiagnosisBtnText}>
                📋 {t('Kopiuj diagnozę')}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>{t('Wybierz objawy bochenka')}</Text>
            <Text style={styles.emptyText}>
              {t(
                'Zaznacz poniżej cechy miękiszu, skórki lub smaku, które Cię niepokoją, aby Doktor Chleba zidentyfikował błąd technologiczny i podał rozwiązanie.'
              )}
            </Text>
          </View>
        )}

        {/* Emergency Dough Recovery Protocols */}
        <Text style={styles.sectionHeading}>🚨 {t('Protokoły ratunkowe (Pogotowie ciasta)')}</Text>
        <Text style={styles.sectionSubheading}>
          {t('Szybkie interwencje w trakcie fermentacji')}
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presetsRow}
        >
          {DOUGH_RECOVERY_PROTOCOLS.map((proto) => {
            const isSelected = selectedRecoveryId === proto.id;
            return (
              <Pressable
                key={proto.id}
                testID={`recovery-chip-${proto.id}`}
                style={[styles.presetChip, isSelected && styles.recoveryChipActive]}
                onPress={() => setSelectedRecoveryId((prev) => (prev === proto.id ? null : proto.id))}
              >
                <Text style={styles.presetIcon}>{proto.icon}</Text>
                <Text style={[styles.presetName, isSelected && styles.recoveryChipTextActive]}>
                  {proto.titlePl}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Selected Protocol Expanded Card */}
        {selectedRecoveryId && (
          <View style={styles.recoveryCard} testID="recovery-protocol-card">
            {(() => {
              const proto = getDoughRecoveryProtocol(selectedRecoveryId);
              return (
                <View>
                  <View style={styles.recoveryHeaderRow}>
                    <Text style={styles.recoveryCardTitle}>
                      {proto.icon} {proto.titlePl}
                    </Text>
                    <Pressable
                      testID="close-recovery-card-btn"
                      onPress={() => setSelectedRecoveryId(null)}
                      style={styles.closeRecoveryBtn}
                    >
                      <Text style={styles.closeRecoveryBtnText}>✕</Text>
                    </Pressable>
                  </View>

                  <Text style={styles.recoveryTriggerText}>
                    🔍 {formatTextUnits(proto.triggerSummaryPl, unitSystem)}
                  </Text>

                  {/* Immediate Action Alert */}
                  <View style={styles.immediateAlertBox}>
                    <Text style={styles.immediateAlertLabel}>{t('Akcja natychmiastowa:')}</Text>
                    <Text style={styles.immediateAlertText}>{formatTextUnits(proto.immediateActionPl, unitSystem)}</Text>
                  </View>

                  {/* Target Pivot Recipe */}
                  <View style={styles.pivotRecipeBox}>
                    <Text style={styles.pivotRecipeLabel}>{t('Receptura awaryjna:')}</Text>
                    <Text style={styles.pivotRecipeName}>{proto.pivotRecipeNamePl}</Text>
                  </View>

                  {/* Steps */}
                  <Text style={styles.recoveryStepsHeading}>{t('Kroki ratunkowe:')}</Text>
                  {proto.stepByStepPl.map((step, idx) => (
                    <View key={idx} style={styles.recoveryStepRow}>
                      <View style={styles.recoveryStepIndexPill}>
                        <Text style={styles.recoveryStepIndexText}>{idx + 1}</Text>
                      </View>
                      <Text style={styles.recoveryStepText}>{formatTextUnits(step, unitSystem)}</Text>
                    </View>
                  ))}

                  {/* Scientific Reasoning */}
                  <View style={styles.scienceBox}>
                    <Text style={styles.scienceLabel}>🔬 {t('Fizjologia ciasta:')}</Text>
                    <Text style={styles.scienceText}>{formatTextUnits(proto.scientificReasoningPl, unitSystem)}</Text>
                  </View>
                </View>
              );
            })()}
          </View>
        )}

        {/* Quick Presets */}
        <Text style={styles.sectionHeading}>{t('Szybkie szablony typowych problemów')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presetsRow}
        >
          {PRESETS.map((preset) => (
            <Pressable
              key={preset.id}
              style={styles.presetChip}
              onPress={() => applyPreset(preset)}
            >
              <Text style={styles.presetIcon}>{preset.icon}</Text>
              <Text style={styles.presetName}>{preset.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Symptoms Section: Miękisz */}
        <Text style={styles.sectionHeading}>{t('Miękisz (Wnętrze bochenka)')}</Text>
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
              {t('Wielkie dziury pod skórką i zbity dół (Jaskinie)')}
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
              {t('Drobne, jednolite pęcherzyki jak gąbka/pianka')}
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
              {t('Mokry, lepki miękisz, brudzi nóż')}
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
              {t('Jednolicie gęsty i ciężki miękisz (brak napowietrzenia)')}
            </Text>
          </Pressable>
        </View>

        {/* Symptoms Section: Skórka i Kształt */}
        <Text style={styles.sectionHeading}>{t('Skórka i Kształt bochenka')}</Text>
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
              {t('Chleb płaski jak dysk (rozlał się na boki)')}
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
              {t('Opadł / zapadł się natychmiast po nacięciu żyletką')}
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
              {t('Rozerwanie boku przy spodzie (Blowout)')}
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
              {t('Blada skórka, brak złocisto-karmelowego rumienia')}
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
              {t('Brak otwartego ucha (nacięcie się zasklepiło)')}
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
              {t('Krojony gorący, prosto po wyjęciu z piekarnika')}
            </Text>
          </Pressable>
        </View>

        {/* Symptoms Section: Smak i Aromat */}
        <Text style={styles.sectionHeading}>{t('Smak i Aromat')}</Text>
        <View style={styles.chipsContainer}>
          <Pressable
            style={[
              styles.symptomChip,
              symptoms.breadIsExcessivelySour && styles.symptomChipActive,
            ]}
            onPress={() => toggleSymptom('breadIsExcessivelySour')}
          >
            <Text
              style={[
                styles.symptomChipText,
                symptoms.breadIsExcessivelySour && styles.symptomChipTextActive,
              ]}
            >
              {t('Zbyt kwaśny, octowy smak')}
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.symptomChip,
              symptoms.breadIsBlandNoFlavor && styles.symptomChipActive,
            ]}
            onPress={() => toggleSymptom('breadIsBlandNoFlavor')}
          >
            <Text
              style={[
                styles.symptomChipText,
                symptoms.breadIsBlandNoFlavor && styles.symptomChipTextActive,
              ]}
            >
              {t('Płaski smak bez głębi (jałowy)')}
            </Text>
          </Pressable>
        </View>

        {/* Clear Button */}
        {hasAnySymptom && (
          <Pressable style={styles.clearBtn} onPress={handleClear}>
            <Text style={styles.clearBtnText}>{t('Wyczyść zaznaczone objawy')}</Text>
          </Pressable>
        )}

        {/* Interactive Kitchen Tests Guide */}
        <Text style={styles.sectionHeading}>{t('Kuchenne testy piekarskie')}</Text>

        {/* Poke Test Card */}
        <Pressable
          style={styles.guideCard}
          onPress={() => setShowPokeTest((prev) => !prev)}
        >
          <View style={styles.guideHeader}>
            <Text style={styles.guideTitle}>👆 {t('Test palca (Poke Test)')}</Text>
            <Text style={styles.guideToggle}>{showPokeTest ? '▲' : '▼'}</Text>
          </View>
          <Text style={styles.guideSummary}>
            {t('Jak sprawdzić, czy bochenek w koszyku jest gotowy do pieczenia')}
          </Text>
          {showPokeTest && (
            <View style={styles.guideDetails}>
              <Text style={styles.guideStep}>
                • <Text style={styles.guideBold}>{t('Szybko odskakuje:')}</Text>{' '}
                {t('Niedofermentowany. Pozostaw w cieple na kolejne 30–60 minut.')}
              </Text>
              <Text style={styles.guideStep}>
                • <Text style={styles.guideBold}>{t('Wraca powoli do połowy:')}</Text>{' '}
                {t('Optymalny moment! Rozgrzewaj piec i szykuj żyletkę.')}
              </Text>
              <Text style={styles.guideStep}>
                • <Text style={styles.guideBold}>{t('Zostaje wgłębienie i ciasto siada:')}</Text>{' '}
                {t('Przerośnięty. Piecz bezzwłocznie, nacinaj bardzo płytko.')}
              </Text>
            </View>
          )}
        </Pressable>

        {/* Windowpane Test Card */}
        <Pressable
          style={styles.guideCard}
          onPress={() => setShowWindowpaneTest((prev) => !prev)}
        >
          <View style={styles.guideHeader}>
            <Text style={styles.guideTitle}>🪟 {t('Test okna glutenowego (Windowpane)')}</Text>
            <Text style={styles.guideToggle}>{showWindowpaneTest ? '▲' : '▼'}</Text>
          </View>
          <Text style={styles.guideSummary}>
            {t('Ocena rozwoju siatki glutenowej po autolizie i składaniach')}
          </Text>
          {showWindowpaneTest && (
            <View style={styles.guideDetails}>
              <Text style={styles.guideStep}>
                • <Text style={styles.guideBold}>{t('Ciasto rwie się przy rozciąganiu:')}</Text>{' '}
                {t('Słaby gluten. Wykonaj dodatkową serię składań coil fold.')}
              </Text>
              <Text style={styles.guideStep}>
                • <Text style={styles.guideBold}>{t('Cienka, przezroczysta membrana:')}</Text>{' '}
                {t('Gluten perfekcyjnie rozwinięty. Gotowe do formowania wstępnego.')}
              </Text>
            </View>
          )}
        </Pressable>

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
    backgroundColor: theme.colors.background,
  },
  container: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  header: {
    marginBottom: theme.spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  academyHeaderPill: {
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  academyHeaderPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.accentDark,
  },
  academyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.accentLight,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  academyBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  academyBannerIconText: {
    fontSize: 18,
  },
  academyBannerContent: {
    flex: 1,
  },
  academyBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  academyBannerSubtitle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 14,
    marginTop: 1,
  },
  academyBannerArrow: {
    fontSize: 16,
    color: theme.colors.accent,
    fontWeight: '700',
    marginLeft: 6,
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
  severityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
  },
  badgeCritical: {
    backgroundColor: '#FEE2E2',
  },
  badgeModerate: {
    backgroundColor: '#FEF3C7',
  },
  badgeMild: {
    backgroundColor: '#ECFDF5',
  },
  severityBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextCritical: {
    color: theme.colors.statusDanger,
  },
  badgeTextModerate: {
    color: theme.colors.accentDark,
  },
  badgeTextMild: {
    color: theme.colors.statusSuccess,
  },
  defectCodeTag: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
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
  navActionBtn: {
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  navActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.accentDark,
  },
  presetsRow: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: 12,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceCard,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
    minHeight: 48,
  },
  presetIcon: {
    fontSize: 16,
  },
  presetName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 10,
    marginBottom: 8,
  },
  chipsContainer: {
    gap: 8,
    marginBottom: 12,
  },
  symptomChip: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 48,
    justifyContent: 'center',
  },
  symptomChipActive: {
    backgroundColor: theme.colors.accentLight,
    borderColor: theme.colors.accent,
  },
  symptomChipText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  symptomChipTextActive: {
    color: theme.colors.accentDark,
    fontWeight: '700',
  },
  clearBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  clearBtnText: {
    fontSize: 13,
    color: theme.colors.statusDanger,
    fontWeight: '600',
  },
  guideCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 10,
  },
  guideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guideTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  guideToggle: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  guideSummary: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  guideDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 6,
  },
  guideStep: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 17,
  },
  guideBold: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  copyDiagnosisBtn: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  copyDiagnosisBtnText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  sectionSubheading: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 8,
  },
  recoveryChipActive: {
    backgroundColor: theme.colors.accentLight,
    borderColor: theme.colors.accent,
  },
  recoveryChipTextActive: {
    color: theme.colors.accentDark,
    fontWeight: '700',
  },
  recoveryCard: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.borderActive,
    padding: theme.spacing.md,
    marginBottom: 16,
  },
  recoveryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  recoveryCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  closeRecoveryBtn: {
    padding: 6,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  closeRecoveryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  recoveryTriggerText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
    marginBottom: 10,
  },
  immediateAlertBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: theme.colors.statusDanger,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    marginBottom: 8,
  },
  immediateAlertLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.statusDanger,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  immediateAlertText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    lineHeight: 16,
  },
  pivotRecipeBox: {
    backgroundColor: theme.colors.accentLight,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    marginBottom: 10,
  },
  pivotRecipeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.accentDark,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  pivotRecipeName: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  recoveryStepsHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  recoveryStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 8,
  },
  recoveryStepIndexPill: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  recoveryStepIndexText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  recoveryStepText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.textPrimary,
    lineHeight: 17,
  },
  scienceBox: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    marginTop: 6,
  },
  scienceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  scienceText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    lineHeight: 15,
    fontStyle: 'italic',
  },
});

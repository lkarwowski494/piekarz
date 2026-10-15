import React, { useState } from 'react';
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
import { calculateStarterFeeding, evaluateSourdoughSafety } from '../../src/core/domain-rules';
import { confirmResetStarter } from '../../src/lib/confirm';

export default function ZakwasScreen() {
  const [targetYield, setTargetYield] = useState(150);
  const [hasHooch, setHasHooch] = useState(false);
  const [hasKahm, setHasKahm] = useState(false);
  const [hasMold, setHasMold] = useState(false);

  const feeding = calculateStarterFeeding(targetYield, [1, 2, 2]);

  const safetyResult = evaluateSourdoughSafety({
    hasHoochLiquid: hasHooch,
    hasWhiteWrinkledFilm: hasKahm,
    hasFuzzySpots: hasMold,
    hasColoredSpots: hasMold,
  });

  const handleReset = () => {
    confirmResetStarter(() => {
      setHasHooch(false);
      setHasKahm(false);
      setHasMold(false);
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('Zakwas')}</Text>
          <Text style={styles.subtitle}>Profil, kalkulator dokarmiania i bezpieczeństwo biologiczne</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.starterName}>Bolesław</Text>
              <Text style={styles.starterType}>Żytni typ 2000 · Hydratacja 100%</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>W lodówce (4°C)</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <View>
              <Text style={styles.metaLabel}>Wiek zakwasu</Text>
              <Text style={styles.metaValue}>120 dni</Text>
            </View>
            <View>
              <Text style={styles.metaLabel}>Ostatnie dokarmianie</Text>
              <Text style={styles.metaValue}>2 dni temu</Text>
            </View>
            <View>
              <Text style={styles.metaLabel}>Cykl</Text>
              <Text style={styles.metaValue}>1:2:2</Text>
            </View>
          </View>
        </View>

        {/* Feeding Calculator 1:2:2 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Kalkulator dokarmiania (1:2:2)</Text>
          <Text style={styles.cardSubtitle}>
            Potrzebny zaczyn (Levain) do wypieku: {targetYield} g
          </Text>

          <View style={styles.yieldButtons}>
            {[100, 150, 200, 250].map((y) => (
              <Pressable
                key={y}
                onPress={() => setTargetYield(y)}
                style={[styles.yieldChip, targetYield === y && styles.yieldChipActive]}
              >
                <Text style={[styles.yieldChipText, targetYield === y && styles.yieldChipTextActive]}>
                  {y} g
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.feedingResultGrid}>
            <View style={styles.feedingItem}>
              <Text style={styles.feedingItemLabel}>Stary zakwas</Text>
              <Text style={styles.feedingItemValue}>{feeding.starterGrams} g</Text>
              <Text style={styles.feedingItemRatio}>1 część</Text>
            </View>
            <Text style={styles.plusSign}>+</Text>
            <View style={styles.feedingItem}>
              <Text style={styles.feedingItemLabel}>Mąka żytnia</Text>
              <Text style={styles.feedingItemValue}>{feeding.flourGrams} g</Text>
              <Text style={styles.feedingItemRatio}>2 części</Text>
            </View>
            <Text style={styles.plusSign}>+</Text>
            <View style={styles.feedingItem}>
              <Text style={styles.feedingItemLabel}>Woda (28°C)</Text>
              <Text style={styles.feedingItemValue}>{feeding.waterGrams} g</Text>
              <Text style={styles.feedingItemRatio}>2 części</Text>
            </View>
          </View>
        </View>

        {/* Biological Safety Checker */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Kontrola biologiczna (Bezpieczeństwo)</Text>
          <Text style={styles.cardSubtitle}>
            Sprawdź nietypowe zjawiska na powierzchni zakwasu
          </Text>

          <View style={styles.checkRow}>
            <Pressable
              style={[styles.checkBtn, hasHooch && styles.checkBtnActive]}
              onPress={() => setHasHooch((prev) => !prev)}
            >
              <Text style={[styles.checkBtnText, hasHooch && styles.checkBtnTextActive]}>
                Ciemny płyn / zapach alkoholu (Hooch)
              </Text>
            </Pressable>

            <Pressable
              style={[styles.checkBtn, hasKahm && styles.checkBtnActive]}
              onPress={() => setHasKahm((prev) => !prev)}
            >
              <Text style={[styles.checkBtnText, hasKahm && styles.checkBtnTextActive]}>
                Biały matowy kożuch (Kahm Yeast)
              </Text>
            </Pressable>

            <Pressable
              style={[styles.checkBtn, hasMold && styles.checkBtnDangerActive]}
              onPress={() => setHasMold((prev) => !prev)}
            >
              <Text style={[styles.checkBtnText, hasMold && styles.checkBtnDangerTextActive]}>
                Puszyste kolorowe plamy (Pleśń / Zgnilizna)
              </Text>
            </Pressable>
          </View>

          {/* Diagnostic Result */}
          <View
            style={[
              styles.safetyBox,
              safetyResult.status === 'toxic_mold_danger'
                ? styles.safetyDanger
                : safetyResult.status === 'kahm_yeast_safe'
                ? styles.safetyWarning
                : styles.safetyHealthy,
            ]}
          >
            <Text style={styles.safetyTitle}>{safetyResult.titlePl}</Text>
            <Text style={styles.safetyAction}>{safetyResult.actionPl}</Text>
          </View>

          <Pressable style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetBtnText}>Resetuj profil zakwasu</Text>
          </Pressable>
        </View>
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
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  starterName: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  starterType: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: theme.colors.backgroundSecondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.accentDark,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  yieldButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  yieldChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  yieldChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accentDark,
  },
  yieldChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  yieldChipTextActive: {
    color: '#FFFFFF',
  },
  feedingResultGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  feedingItem: {
    alignItems: 'center',
    flex: 1,
  },
  feedingItemLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  feedingItemValue: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  feedingItemRatio: {
    fontSize: 10,
    color: theme.colors.accentDark,
    marginTop: 2,
    fontWeight: '600',
  },
  plusSign: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textMuted,
    paddingHorizontal: 4,
  },
  checkRow: {
    gap: 8,
    marginBottom: 14,
  },
  checkBtn: {
    padding: 10,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  checkBtnActive: {
    backgroundColor: theme.colors.accentLight,
    borderColor: theme.colors.accent,
  },
  checkBtnDangerActive: {
    backgroundColor: '#FEE2E2',
    borderColor: theme.colors.statusDanger,
  },
  checkBtnText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  checkBtnTextActive: {
    color: theme.colors.accentDark,
    fontWeight: '700',
  },
  checkBtnDangerTextActive: {
    color: theme.colors.statusDanger,
    fontWeight: '700',
  },
  safetyBox: {
    padding: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    marginBottom: 14,
  },
  safetyHealthy: {
    backgroundColor: '#ECFDF5',
    borderColor: theme.colors.statusSuccess,
  },
  safetyWarning: {
    backgroundColor: '#FEF3C7',
    borderColor: theme.colors.statusWarning,
  },
  safetyDanger: {
    backgroundColor: '#FEE2E2',
    borderColor: theme.colors.statusDanger,
  },
  safetyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  safetyAction: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 17,
  },
  resetBtn: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  resetBtnText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
});

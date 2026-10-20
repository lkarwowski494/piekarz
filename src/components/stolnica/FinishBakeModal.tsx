// ============================================================================
// Apps4Craft Studio — FinishBakeModal Component
// Modal for evaluation, sensory radar scoring, and finishing a bake.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { sharedCraftTokens } from '@apps4craft/ui';
import {
  SensoryRadarChart,
  BreadSensoryProfile,
} from '../SensoryRadarChart';

export interface FinishBakeModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  rating: number;
  onRatingChange: (rating: number) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  crumbScore: number;
  onCrumbScoreChange: (score: number) => void;
  crustScore: number;
  onCrustScoreChange: (score: number) => void;
  tasteProfile: 'mild' | 'balanced' | 'sour' | 'tangy';
  onTasteProfileChange: (profile: 'mild' | 'balanced' | 'sour' | 'tangy') => void;
  sensoryProfile: BreadSensoryProfile;
  onSensoryProfileChange: (profile: BreadSensoryProfile) => void;
}

export function FinishBakeModal({
  visible,
  onClose,
  onSave,
  rating,
  onRatingChange,
  notes,
  onNotesChange,
  crumbScore,
  onCrumbScoreChange,
  crustScore,
  onCrustScoreChange,
  tasteProfile,
  onTasteProfileChange,
  sensoryProfile,
  onSensoryProfileChange,
}: FinishBakeModalProps) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalOverlay} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{t('Jak wyszedł bochenek?')}</Text>
          <Text style={styles.modalSubtitle}>
            {t('Oceń bochenek i zapisz notatki do historii piekarskiej')}
          </Text>

          {/* Star Rating */}
          <Text style={styles.modalSectionLabel}>{t('Ocena wypieku')}</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('Oceń na {n} z 5', { n: star })}
                accessibilityState={{ selected: rating === star }}
                key={star}
                testID={`finish-rating-star-${star}`}
                onPress={() => onRatingChange(star)}
              >
                <Text style={[styles.starIcon, rating >= star && styles.starIconActive]}>
                  ★
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Notes */}
          <Text style={styles.modalSectionLabel}>{t('Notatki z wypieku')}</Text>
          <TextInput
            style={styles.modalInput}
            placeholder={t('Wpisz swoje uwagi (miękisz, skórka, czas pieca)...')}
            placeholderTextColor={theme.colors.tusz3}
            value={notes}
            onChangeText={onNotesChange}
            multiline
            numberOfLines={3}
          />

          {/* Crumb Score */}
          <Text style={styles.modalSectionLabel}>{t('Struktura miękiszu')} (1–5)</Text>
          <View style={styles.scoreRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: crumbScore === s }}
                key={s}
                testID={`crumb-score-${s}`}
                style={[styles.scoreBtn, crumbScore === s && styles.scoreBtnActive]}
                onPress={() => onCrumbScoreChange(s)}
              >
                <Text style={[styles.scoreBtnText, crumbScore === s && styles.scoreBtnTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.scoreHint}>
            {crumbScore <= 2 ? t('Zbity, gęsty miękisz — rozważaj dłuższy bulk') : crumbScore >= 5 ? t('Dzika, otwarta struktura rzemieślnicza!') : t('Ładna równomierna alweolatura')}
          </Text>

          {/* Crust Score */}
          <Text style={styles.modalSectionLabel}>{t('Jakość skórki')} (1–5)</Text>
          <View style={styles.scoreRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: crustScore === s }}
                key={s}
                testID={`crust-score-${s}`}
                style={[styles.scoreBtn, crustScore === s && styles.scoreBtnActive]}
                onPress={() => onCrustScoreChange(s)}
              >
                <Text style={[styles.scoreBtnText, crustScore === s && styles.scoreBtnTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.scoreHint}>
            {crustScore <= 2 ? t('Blada, miękka skórka — zwiększ parę lub temperaturę') : crustScore >= 5 ? t('Perfekcyjna chrupiąca skórka z pęcherzykami') : t('Dobra skórka z lekkim połyskiem')}
          </Text>

          {/* Taste Profile */}
          <Text style={styles.modalSectionLabel}>{t('Profil smakowy')}</Text>
          <View style={styles.tasteRow}>
            {(['mild', 'balanced', 'sour', 'tangy'] as const).map((profile) => {
              const labels: Record<string, string> = {
                mild: t('Łagodny'),
                balanced: t('Zbalansowany'),
                sour: t('Kwaśny'),
                tangy: t('Bardzo kwaśny'),
              };
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: tasteProfile === profile }}
                  key={profile}
                  testID={`taste-${profile}`}
                  style={[styles.tasteChip, tasteProfile === profile && styles.tasteChipActive]}
                  onPress={() => onTasteProfileChange(profile)}
                >
                  <Text style={[styles.tasteChipText, tasteProfile === profile && styles.tasteChipTextActive]}>
                    {labels[profile]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Sensory Radar Profile (5 Osi Rzemieślniczych) */}
          <Text style={styles.modalSectionLabel}>{t('Wektorowy radar sensoryczny')}</Text>
          <View style={styles.modalRadarBox}>
            <SensoryRadarChart
              profile={sensoryProfile}
              size={190}
              showLabels={true}
              interactive={true}
              onChangeProfile={onSensoryProfileChange}
              testID="finish-sensory-radar"
            />
          </View>

          <View style={styles.modalButtonsRow}>
            <Pressable
              accessibilityRole="button"
              style={styles.modalCancelBtn}
              onPress={onClose}
              hitSlop={sharedCraftTokens.hitSlopStandard}
            >
              <Text style={styles.modalCancelBtnText}>{t('Anuluj')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={styles.modalConfirmBtn}
              onPress={onSave}
              hitSlop={sharedCraftTokens.hitSlopStandard}
            >
              <Text style={styles.modalConfirmBtnText}>{t('Zapisz')}</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.tlo,
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  modalCard: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.tusz,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: theme.colors.tusz2,
    marginBottom: 16,
  },
  modalSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.tusz3,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  starRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  starIcon: {
    fontSize: 28,
    color: theme.colors.tusz3,
  },
  starIconActive: {
    color: theme.colors.akcentTekst,
  },
  modalInput: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.sm,
    padding: 12,
    fontSize: 14,
    color: theme.colors.tusz,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    minHeight: 65,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  scoreBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    alignItems: 'center',
  },
  scoreBtnActive: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  scoreBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.tusz2,
  },
  scoreBtnTextActive: {
    color: theme.colors.naAkcencie,
  },
  scoreHint: {
    fontSize: 11,
    color: theme.colors.tusz3,
    marginBottom: 12,
  },
  tasteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  tasteChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  tasteChipActive: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  tasteChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  tasteChipTextActive: {
    color: theme.colors.naAkcencie,
    fontWeight: '700',
  },
  modalRadarBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.powierzchnia,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  modalConfirmBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.akcent,
    alignItems: 'center',
  },
  modalConfirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.naAkcencie,
  },
});

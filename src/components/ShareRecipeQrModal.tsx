// ============================================================================
// Piekarz (Crust) — Modal Udostępniania Receptury przez Kod QR (DEC-20 / HIG)
// 100% offline, peer-to-peer transfer receptur piekarskich przez kod QR i tekst (bez linku)
// Apps4Brew Studio — 100% Offline-First.
// ============================================================================

import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  StyleSheet,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sharedCraftTokens } from '@apps4craft/ui';
import { theme } from '../ui/theme';
import { t } from '../lib/i18n';
import { useUnitSystem, formatTemperature } from '../lib/unit-converter';
import { StoredRecipe } from '../data/db';
import { MasterRecipe } from '../recipes/presets';
import { encodeRecipeToShareUrl } from '../lib/recipe-sharing';
import { QrCodeSvg } from './QrCodeSvg';

export interface ShareRecipeQrModalProps {
  visible: boolean;
  onClose: () => void;
  recipe: StoredRecipe | MasterRecipe | null;
}

export function ShareRecipeQrModal({
  visible,
  onClose,
  recipe,
}: ShareRecipeQrModalProps) {
  // DDT w jednostce z ustawienia (D-044) [M1-audytor-generalny-096]
  const unitSystem = useUnitSystem();
  if (!visible || !recipe) return null;

  const isMaster = 'namePl' in recipe;
  const name = isMaster ? recipe.namePl : recipe.name;
  // Ładunek tekstowy bez schematu URL (M1-audytor-generalny-029)
  const sharePayload = encodeRecipeToShareUrl(recipe);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${name} — ${t('Receptura piekarska z aplikacji Piekarz')}:\n${sharePayload}`,
        title: name,
      });
    } catch {
      // User cancelled or error
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <SafeAreaView style={styles.overlay} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.modalCard} testID="share-recipe-qr-modal">
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              testID="close-share-qr-btn"
              accessibilityRole="button"
              accessibilityLabel={t('Anuluj')}
              onPress={onClose}
              hitSlop={sharedCraftTokens.hitSlopStandard}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelBtnText}>{t('Anuluj')}</Text>
            </Pressable>
            <View style={styles.headerCenter}>
              <Text style={styles.title}>{t('Kod QR Receptury')}</Text>
            </View>
            <View style={styles.headerRightSpacer} />
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Subtitle & Recipe Name */}
            <View style={styles.recipeInfoBox}>
              <Text style={styles.recipeName}>
                {name}
              </Text>
              <Text style={styles.recipeDetails}>
                {t('Hydratacja')}: {recipe.formula.waterPercentage}% • {t('Zakwas|składnik')}: {recipe.formula.starterPercentage}% • DDT: {formatTemperature(recipe.targetDDT ?? 25, unitSystem)}
              </Text>
            </View>

            {/* QR Code Canvas */}
            <View style={styles.qrWrapper} testID="qr-code-wrapper">
              <QrCodeSvg value={sharePayload} size={220} testID="recipe-qr-svg" />
            </View>

            <Text style={styles.hintText}>
              {t('Zeskanuj kod drugim telefonem w aplikacji Piekarz (przycisk Skanuj QR) albo udostępnij recepturę jako tekst i wklej go po dotknięciu Importuj JSON.')}
            </Text>

            {/* Action Buttons */}
            <View style={styles.actionsBox}>
              <Pressable
                testID="share-system-btn"
                style={styles.secondaryBtn}
                onPress={handleShare}
                accessibilityRole="button"
                accessibilityLabel={t('Udostępnij recepturę')}
              >
                <Text style={styles.secondaryBtnText}>
                  {t('Udostępnij recepturę')}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 17, 10, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: theme.colors.powierzchnia,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    maxHeight: '90%',
    paddingBottom: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.linia,
  },
  cancelBtn: {
    minHeight: 48,
    minWidth: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  cancelBtnText: {
    fontSize: 16,
    color: theme.colors.akcentTekst,
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontFamily: theme.typography.krojTytulow,
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  headerRightSpacer: {
    width: 48,
  },
  scrollArea: {
    paddingHorizontal: theme.spacing.lg,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  recipeInfoBox: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  recipeName: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.tusz,
    textAlign: 'center',
    marginBottom: 4,
  },
  recipeDetails: {
    fontSize: 13,
    color: theme.colors.tusz2,
    fontWeight: '500',
  },
  qrWrapper: {
    backgroundColor: '#FFFFFF',
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    marginVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  hintText: {
    fontSize: 13,
    color: theme.colors.tusz2,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  actionsBox: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  secondaryBtn: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.md,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  secondaryBtnText: {
    color: theme.colors.tusz,
    fontSize: 15,
    fontWeight: '600',
  },
});

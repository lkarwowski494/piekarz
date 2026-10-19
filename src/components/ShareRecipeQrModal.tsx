// ============================================================================
// Piekarz (Crust) — Modal Udostępniania Receptury przez Kod QR (DEC-20 / HIG)
// 100% offline, peer-to-peer transfer receptur piekarskich przez kody QR i Deep Links
// Apps4Brew Studio — 100% Offline-First.
// ============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sharedCraftTokens } from '@apps4craft/ui';
import * as Clipboard from 'expo-clipboard';
import { theme } from '../ui/theme';
import { t } from '../lib/i18n';
import { StoredRecipe } from '../data/db';
import { MasterRecipe } from '../recipes/presets';
import {
  encodeRecipeToShareUrl,
  RECIPE_SHARE_PROTOCOL,
} from '../lib/recipe-sharing';
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
  const [copiedType, setCopiedType] = useState<'app' | null>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!visible || !recipe) return null;

  const isMaster = 'namePl' in recipe;
  const name = isMaster ? recipe.namePl : recipe.name;
  const appUrl = encodeRecipeToShareUrl(recipe);

  const handleCopyAppUrl = async () => {
    try {
      await Clipboard.setStringAsync(appUrl);
      setCopiedType('app');
      Alert.alert(t('Skopiowano link'), t('Link piekarz:// został skopiowany do schowka.'));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopiedType(null), 2500);
    } catch {
      Alert.alert(t('Błąd'), t('Nie udało się skopiować linku.'));
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${name} — ${t('Receptura piekarska z aplikacji Piekarz')}:\n${appUrl}`,
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
              <Text style={styles.recipeName} numberOfLines={2}>
                🍞 {name}
              </Text>
              <Text style={styles.recipeDetails}>
                {t('Hydratacja')}: {recipe.formula.waterPercentage}% • {t('Zakwas')}: {recipe.formula.starterPercentage}% • DDT: {recipe.targetDDT ?? 25}°C
              </Text>
            </View>

            {/* QR Code Canvas */}
            <View style={styles.qrWrapper} testID="qr-code-wrapper">
              <QrCodeSvg value={appUrl} size={220} testID="recipe-qr-svg" />
            </View>

            <Text style={styles.hintText}>
              {t('Zeskanuj kod drugim telefonem za pomocą aparatu w aplikacji Piekarz lub przekaż link.')}
            </Text>

            {/* Action Buttons */}
            <View style={styles.actionsBox}>
              <Pressable
                testID="copy-app-link-btn"
                style={[styles.primaryBtn, copiedType === 'app' && styles.successBtn]}
                onPress={handleCopyAppUrl}
                accessibilityRole="button"
                accessibilityLabel={t('Kopiuj link piekarz://')}
              >
                <Text style={styles.primaryBtnText}>
                  {copiedType === 'app' ? `✓ ${t('Skopiowano link!')}` : `🔗 ${t('Kopiuj link piekarz://')}`}
                </Text>
              </Pressable>

              <Pressable
                testID="share-system-btn"
                style={styles.secondaryBtn}
                onPress={handleShare}
                accessibilityRole="button"
                accessibilityLabel={t('Udostępnij recepturę')}
              >
                <Text style={styles.secondaryBtnText}>
                  📤 {t('Udostępnij recepturę')}
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
    backgroundColor: theme.colors.surface,
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
    borderBottomColor: theme.colors.border,
  },
  cancelBtn: {
    minHeight: 48,
    minWidth: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  cancelBtnText: {
    fontSize: 16,
    color: theme.colors.accent,
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
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
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  recipeDetails: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  qrWrapper: {
    backgroundColor: '#FFFFFF',
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    marginVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  hintText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  actionsBox: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  primaryBtn: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  successBtn: {
    backgroundColor: '#2E7D32',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.md,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryBtnText: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
});

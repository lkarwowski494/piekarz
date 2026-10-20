// ============================================================================
// Apps4Craft Studio — CalculatorActionButtons Component
// Action buttons for sharing, exporting, inventory, saving, and baking.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { wejscieWidoczne } from '../../lib/wejscia-pozniej';

export interface CalculatorActionButtonsProps {
  onCopyRecipe: () => void;
  onCloneRecipe: () => void;
  onExportJson: () => void;
  onShareQr: () => void;
  /** Otwiera wybór druku (przez strażnika dostępu). */
  onPrintMenu: () => void;
  onImportJson: () => void;
  onOpenInventory: () => void;
  onSaveCustomRecipe: () => void;
  onStartBake: () => void;
}

export function CalculatorActionButtons({
  onCopyRecipe,
  onCloneRecipe,
  onExportJson,
  onShareQr,
  onPrintMenu,
  onImportJson,
  onOpenInventory,
  onSaveCustomRecipe,
  onStartBake,
}: CalculatorActionButtonsProps) {
  return (
    <View style={styles.actionButtonsContainer}>
      <Pressable
        testID="copy-recipe-btn"
        style={styles.copyRecipeBtn}
        onPress={onCopyRecipe}
      >
        <Text style={styles.copyRecipeBtnText}>📋 {t('Kopiuj recepturę')}</Text>
      </Pressable>

      <Pressable
        testID="clone-recipe-btn"
        style={styles.cloneRecipeBtn}
        onPress={onCloneRecipe}
      >
        <Text style={styles.cloneRecipeBtnText}>✨ {t('Klonuj recepturę')}</Text>
      </Pressable>

      <Pressable
        testID="export-recipe-json-btn"
        style={styles.cloneRecipeBtn}
        onPress={onExportJson}
      >
        <Text style={styles.cloneRecipeBtnText}>📦 {t('Eksportuj JSON')}</Text>
      </Pressable>

      {/* F-08 PÓŹNIEJ (D-043): udostępnianie kodu QR ukryte, kod zostaje [M1-audytor-generalny-049] */}
      {wejscieWidoczne('qr') && (
        <Pressable
          testID="share-recipe-qr-btn"
          style={styles.cloneRecipeBtn}
          onPress={onShareQr}
        >
          <Text style={styles.cloneRecipeBtnText}>🏁 {t('Udostępnij kod QR')}</Text>
        </Pressable>
      )}

      {/* Jedyne wejście druku: karta A4 albo etykieta słoika (BR-DRUK-001) [M1-audytor-generalny-032];
          F-50 PÓŹNIEJ (D-043): wejście ukryte, kod druku zostaje [M1-audytor-generalny-072] */}
      {wejscieWidoczne('druk') && (
        <Pressable
          testID="print-menu-btn"
          accessibilityRole="button"
          style={styles.cloneRecipeBtn}
          onPress={onPrintMenu}
        >
          <Text style={styles.cloneRecipeBtnText}>🖨️ {t('Drukuj')}</Text>
        </Pressable>
      )}

      <Pressable
        testID="import-recipe-json-btn"
        style={styles.cloneRecipeBtn}
        onPress={onImportJson}
      >
        <Text style={styles.cloneRecipeBtnText}>📥 {t('Importuj JSON')}</Text>
      </Pressable>

      <Pressable
        testID="open-flour-inventory-btn"
        style={styles.cloneRecipeBtn}
        onPress={onOpenInventory}
      >
        <Text style={styles.cloneRecipeBtnText}>🌾 {t('Spiżarnia mąk & Stan zapasów')}</Text>
      </Pressable>

      <Pressable
        testID="save-custom-recipe-btn"
        style={styles.secondaryBtn}
        onPress={onSaveCustomRecipe}
      >
        <Text style={styles.secondaryBtnText}>💾 {t('Zapisz jako mój przepis')}</Text>
      </Pressable>

      <Pressable
        testID="start-bake-btn"
        style={styles.primaryBtn}
        onPress={onStartBake}
      >
        <Text style={styles.primaryBtnText}>🥖 {t('Rozpocznij wypiek na Stolnicy')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButtonsContainer: {
    marginTop: theme.spacing.lg,
    gap: 10,
  },
  copyRecipeBtn: {
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.akcent,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  copyRecipeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.akcentTekst,
  },
  cloneRecipeBtn: {
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  cloneRecipeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.tusz,
  },
  secondaryBtn: {
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1.5,
    borderColor: theme.colors.akcent,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.akcentTekst,
  },
  primaryBtn: {
    backgroundColor: theme.colors.akcent,
    paddingVertical: 16,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.naAkcencie,
  },
});

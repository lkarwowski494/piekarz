// ============================================================================
// Piekarz (Crust) — Flour Inventory & Stock Management Modal
// Apps4Brew Studio — 100% Offline-First.
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sharedCraftTokens } from '@apps4craft/ui';
import { theme } from '../ui/theme';
import { t } from '../lib/i18n';
import { formatFixed } from '../lib/format';
import { guardSave } from '../lib/save-guard';
import { StoredFlourInventoryItem } from '../data/db';
import {
  getFlourInventory,
  saveFlourInventoryItem,
  deleteFlourInventoryItem,
} from '../data/sqlite-store';
import {
  checkFlourInventory,
  deductFlourStocks,
  InventoryCheckResult,
} from '../core/inventory';
import { FLOUR_PROFILES } from '../core/flour-atlas';
import { useAppAccess } from '../lib/app-access';

export interface FlourInventoryModalProps {
  visible: boolean;
  onClose: () => void;
  recipeFlours?: Array<{ name: string; weightGrams: number }>;
  onInventoryUpdated?: () => void;
}

export function FlourInventoryModal({
  visible,
  onClose,
  recipeFlours,
  onInventoryUpdated,
}: FlourInventoryModalProps) {
  const {
    access,
    requireActionAccess,
  } = useAppAccess();
  const [inventory, setInventory] = useState<StoredFlourInventoryItem[]>([]);
  const [newFlourName, setNewFlourName] = useState<string>('');
  const [newFlourStock, setNewFlourStock] = useState<string>('1000');
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    const items = await getFlourInventory();
    setInventory(items);
  }, []);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible, loadData]);

  // Stock check against current recipe if provided
  const stockCheck: InventoryCheckResult | null = useMemo(() => {
    if (!recipeFlours || recipeFlours.length === 0) return null;
    return checkFlourInventory(recipeFlours, inventory);
  }, [recipeFlours, inventory]);

  const handleAdjustStock = async (item: StoredFlourInventoryItem, deltaGrams: number) => {
    requireActionAccess(guardSave(async () => {
      const newStock = Math.max(0, Math.round(item.stockGrams + deltaGrams));
      const updated: StoredFlourInventoryItem = {
        ...item,
        stockGrams: newStock,
        updatedAt: Date.now(),
      };
      await saveFlourInventoryItem(updated);
      await loadData();
      onInventoryUpdated?.();
    }));
  };

  // Usuwanie własnych danych nie wymaga zakupu (DEC-48) [M1-audytor-generalny-007]
  const handleDeleteItem = guardSave(async (id: string) => {
    await deleteFlourInventoryItem(id);
    await loadData();
    onInventoryUpdated?.();
  });

  const handleAddNewFlour = async () => {
    requireActionAccess(guardSave(async () => {
      const trimmed = newFlourName.trim();
      if (!trimmed) {
        Alert.alert(t('Błąd'), t('Podaj nazwę mąki'));
        return;
      }
      const stock = parseFloat(newFlourStock) || 1000;
      const item: StoredFlourInventoryItem = {
        id: `flour_inv_${Date.now()}`,
        name: trimmed,
        stockGrams: Math.max(0, stock),
        updatedAt: Date.now(),
      };
      await saveFlourInventoryItem(item);
      setNewFlourName('');
      setNewFlourStock('1000');
      setIsAddingNew(false);
      await loadData();
      onInventoryUpdated?.();
    }));
  };

  const handleDeductRecipeStocks = async () => {
    requireActionAccess(guardSave(async () => {
      if (!recipeFlours || recipeFlours.length === 0) return;
      const updatedList = deductFlourStocks(recipeFlours, inventory);
      for (const item of updatedList) {
        await saveFlourInventoryItem(item);
      }
      await loadData();
      onInventoryUpdated?.();
      Alert.alert(t('Pomyślnie odliczono'), t('Zasoby mąki w spiżarni zostały zaktualizowane.'));
    }));
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <SafeAreaView style={styles.modalOverlay} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.modalCard} testID="flour-inventory-modal">
          {/* Header */}
          <Text style={styles.modalTitle}>🌾 {t('Spiżarnia mąk (Magazyn)')} [{t('Wersja 1.1, podgląd')}]</Text>
          <Text style={styles.modalSubtitle}>
            {t('Kontrola zapasów mąk i powiadomienia o brakach')} • {t('Etap 1.1')}
          </Text>

          {/* Recipe Stock Check Status Banner */}
          {stockCheck && (
            <View
              style={[
                styles.stockBanner,
                stockCheck.allSufficient ? styles.stockBannerSuccess : styles.stockBannerWarning,
              ]}
              testID="stock-check-banner"
            >
              <Text
                style={[
                  styles.stockBannerTitle,
                  stockCheck.allSufficient
                    ? styles.stockBannerTitleSuccess
                    : styles.stockBannerTitleWarning,
                ]}
              >
                {stockCheck.allSufficient
                  ? `✓ ${t('Wszystkie mąki są dostępne w spiżarni!')}`
                  : `⚠️ ${t(stockCheck.warningTemplatePl ?? '', stockCheck.warningParams)}`}
              </Text>

              {!stockCheck.allSufficient &&
                stockCheck.items
                  .filter((i) => i.deficitGrams > 0 && i.substituteSuggestionPl)
                  .map((i, idx) => (
                    <Text key={idx} style={styles.substituteText}>
                      💡 {t(i.substituteTemplatePl ?? '', { ...i.substituteParams, nazwa: t(i.substituteParams?.nazwa ?? '') })}
                    </Text>
                  ))}

              {recipeFlours && recipeFlours.length > 0 && (
                <Pressable
                  testID="deduct-stocks-btn"
                  style={styles.deductBtn}
                  onPress={handleDeductRecipeStocks}
                >
                  <Text style={styles.deductBtnText}>
                    📦 {t('Odlicz zużycie z magazynu')}
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
            <Text style={styles.sectionHeading}>{t('Twoje zapasy mąk')}:</Text>

            {inventory.map((item) => (
              <View key={item.id} style={styles.inventoryRow} testID={`inv-item-${item.id}`}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemStock}>
                    {item.stockGrams >= 1000
                      ? `${formatFixed((item.stockGrams / 1000), 2)} kg (${Math.round(item.stockGrams)} g)`
                      : `${Math.round(item.stockGrams)} g`}
                  </Text>
                </View>

                {/* Adjust buttons */}
                <View style={styles.adjustRow}>
                  <Pressable
                    testID={`adjust-minus-250-${item.id}`}
                    style={styles.adjustBtn}
                    onPress={() => handleAdjustStock(item, -250)}
                  >
                    <Text style={styles.adjustBtnText}>-250g</Text>
                  </Pressable>
                  <Pressable
                    testID={`adjust-plus-500-${item.id}`}
                    style={styles.adjustBtn}
                    onPress={() => handleAdjustStock(item, 500)}
                  >
                    <Text style={styles.adjustBtnText}>+500g</Text>
                  </Pressable>
                  <Pressable
                    testID={`adjust-plus-1000-${item.id}`}
                    style={styles.adjustBtn}
                    onPress={() => handleAdjustStock(item, 1000)}
                  >
                    <Text style={styles.adjustBtnText}>+1kg</Text>
                  </Pressable>
                  <Pressable
                    testID={`delete-inv-${item.id}`}
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteItem(item.id)}
                  >
                    <Text style={styles.deleteBtnText}>🗑️</Text>
                  </Pressable>
                </View>
              </View>
            ))}

            {/* Add New Flour Form */}
            {isAddingNew ? (
              <View style={styles.addFormCard} testID="add-flour-form">
                <Text style={styles.formTitle}>{t('Dodaj mąkę do spiżarni')}</Text>

                <Text style={styles.inputLabel}>{t('Wybierz z Atlasu lub wpisz własną')}:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
                  {FLOUR_PROFILES.slice(0, 6).map((p) => (
                    <Pressable
                      key={p.id}
                      style={styles.presetChip}
                      onPress={() => setNewFlourName(p.namePl)}
                    >
                      <Text style={styles.presetChipText}>{p.namePl.split(' (')[0]}</Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <TextInput
                  testID="new-flour-name-input"
                  style={styles.textInput}
                  placeholder={t('Nazwa mąki (np. Pszenna typ 750)')}
                  placeholderTextColor={theme.colors.textMuted}
                  value={newFlourName}
                  onChangeText={setNewFlourName}
                />

                <Text style={styles.inputLabel}>{t('Początkowy stan zapasów (g)')}:</Text>
                <TextInput
                  testID="new-flour-stock-input"
                  style={styles.textInput}
                  placeholder="1000"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="numeric"
                  value={newFlourStock}
                  onChangeText={setNewFlourStock}
                />

                <View style={styles.formButtonsRow}>
                  <Pressable
                    style={styles.formCancelBtn}
                    onPress={() => setIsAddingNew(false)}
                  >
                    <Text style={styles.formCancelBtnText}>{t('Anuluj')}</Text>
                  </Pressable>
                  <Pressable
                    testID="confirm-add-flour-btn"
                    style={styles.formConfirmBtn}
                    onPress={handleAddNewFlour}
                  >
                    <Text style={styles.formConfirmBtnText}>{t('Zapisz w spiżarni')}</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                testID="open-add-flour-btn"
                style={styles.openAddBtn}
                onPress={() => setIsAddingNew(true)}
              >
                <Text style={styles.openAddBtnText}>+ {t('Dodaj nową mąkę')}</Text>
              </Pressable>
            )}
          </ScrollView>

          {/* Close button */}
          <Pressable
            testID="close-inventory-btn"
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={sharedCraftTokens.hitSlopStandard}
          >
            <Text style={styles.closeButtonText}>{t('Zamknij')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 14,
  },
  stockBanner: {
    borderRadius: theme.radius.md,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
  },
  stockBannerSuccess: {
    backgroundColor: '#E8F5E9',
    borderColor: theme.colors.statusSuccess,
  },
  stockBannerWarning: {
    backgroundColor: '#FFF3E0',
    borderColor: theme.colors.statusWarning,
  },
  stockBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  stockBannerTitleSuccess: {
    color: '#2E7D32',
  },
  stockBannerTitleWarning: {
    color: '#E65100',
  },
  substituteText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  deductBtn: {
    marginTop: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  deductBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  scrollArea: {
    maxHeight: 380,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  inventoryRow: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  itemInfo: {
    marginBottom: 6,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  itemStock: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.accentDark,
    marginTop: 2,
  },
  adjustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  adjustBtn: {
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  adjustBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  deleteBtn: {
    marginLeft: 'auto',
    padding: 4,
  },
  deleteBtnText: {
    fontSize: 14,
  },
  openAddBtn: {
    marginTop: 8,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  openAddBtnText: {
    color: theme.colors.accentDark,
    fontWeight: '700',
    fontSize: 13,
  },
  addFormCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  formTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  presetScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  presetChip: {
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 6,
  },
  presetChipText: {
    fontSize: 11,
    color: theme.colors.textPrimary,
  },
  textInput: {
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: 8,
    fontSize: 13,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  formButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  formCancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  formCancelBtnText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  formConfirmBtn: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  formConfirmBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  closeButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  closeButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});

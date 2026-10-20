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
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalOverlay} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.modalCard} testID="flour-inventory-modal">
          {/* Header */}
          <Text style={styles.modalTitle}>{t('Spiżarnia mąk (Magazyn)')}</Text>
          <Text style={styles.modalSubtitle}>
            {t('Kontrola zapasów mąk i powiadomienia o brakach')}
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
                  : t(stockCheck.warningTemplatePl ?? '', stockCheck.warningParams)}
              </Text>

              {!stockCheck.allSufficient &&
                stockCheck.items
                  .filter((i) => i.deficitGrams > 0 && i.substituteSuggestionPl)
                  .map((i, idx) => (
                    <Text key={idx} style={styles.substituteText}>
                      {t(i.substituteTemplatePl ?? '', { ...i.substituteParams, nazwa: t(i.substituteParams?.nazwa ?? '') })}
                    </Text>
                  ))}

              {recipeFlours && recipeFlours.length > 0 && (
                <Pressable
                  accessibilityRole="button"
                  testID="deduct-stocks-btn"
                  style={styles.deductBtn}
                  onPress={handleDeductRecipeStocks}
                >
                  <Text style={styles.deductBtnText}>
                    {t('Odlicz zużycie z magazynu')}
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
                    accessibilityRole="button"
                    accessibilityLabel={t('Odejmij {g} g mąki {nazwa}', { g: 250, nazwa: item.name })}
                    testID={`adjust-minus-250-${item.id}`}
                    style={styles.adjustBtn}
                    onPress={() => handleAdjustStock(item, -250)}
                  >
                    <Text style={styles.adjustBtnText}>-250g</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('Dodaj {g} g mąki {nazwa}', { g: 500, nazwa: item.name })}
                    testID={`adjust-plus-500-${item.id}`}
                    style={styles.adjustBtn}
                    onPress={() => handleAdjustStock(item, 500)}
                  >
                    <Text style={styles.adjustBtnText}>+500g</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('Dodaj {g} g mąki {nazwa}', { g: 1000, nazwa: item.name })}
                    testID={`adjust-plus-1000-${item.id}`}
                    style={styles.adjustBtn}
                    onPress={() => handleAdjustStock(item, 1000)}
                  >
                    <Text style={styles.adjustBtnText}>+1kg</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('Usuń mąkę: {nazwa}', { nazwa: item.name })}
                    testID={`delete-inv-${item.id}`}
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteItem(item.id)}
                  >
                    <Text style={styles.deleteBtnText}>{t('Usuń')}</Text>
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
                      accessibilityRole="button"
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
                  placeholderTextColor={theme.colors.tusz3}
                  value={newFlourName}
                  onChangeText={setNewFlourName}
                />

                <Text style={styles.inputLabel}>{t('Początkowy stan zapasów (g)')}:</Text>
                <TextInput
                  testID="new-flour-stock-input"
                  style={styles.textInput}
                  placeholder="1000"
                  placeholderTextColor={theme.colors.tusz3}
                  keyboardType="numeric"
                  value={newFlourStock}
                  onChangeText={setNewFlourStock}
                />

                <View style={styles.formButtonsRow}>
                  <Pressable
                    accessibilityRole="button"
                    style={styles.formCancelBtn}
                    onPress={() => setIsAddingNew(false)}
                  >
                    <Text style={styles.formCancelBtnText}>{t('Anuluj')}</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
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
                accessibilityRole="button"
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
            accessibilityRole="button"
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
    backgroundColor: theme.colors.tlo,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  modalTitle: {
    fontFamily: theme.typography.krojTytulow,
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.tusz,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: theme.colors.tusz2,
    marginBottom: 14,
  },
  stockBanner: {
    borderRadius: theme.radius.md,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
  },
  stockBannerSuccess: {
    backgroundColor: theme.colors.powierzchnia,
    borderColor: theme.colors.linia,
  },
  stockBannerWarning: {
    backgroundColor: theme.colors.powierzchnia,
    borderColor: theme.colors.obwodka,
  },
  stockBannerTitle: {
    fontFamily: theme.typography.krojTytulow,
    fontSize: 13,
    fontWeight: '700',
  },
  stockBannerTitleSuccess: {
    fontFamily: theme.typography.krojTytulow,
    color: theme.colors.tusz,
  },
  stockBannerTitleWarning: {
    fontFamily: theme.typography.krojTytulow,
    color: theme.colors.tusz,
  },
  substituteText: {
    fontSize: 11,
    color: theme.colors.tusz2,
    marginTop: 4,
    fontStyle: 'italic',
  },
  deductBtn: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    marginTop: 8,
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    borderRadius: theme.radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  deductBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  scrollArea: {
    maxHeight: 380,
  },
  sectionHeading: {
    fontFamily: theme.typography.krojTytulow,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: 8,
  },
  inventoryRow: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.md,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  itemInfo: {
    marginBottom: 6,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  itemStock: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.akcentTekst,
    marginTop: 2,
  },
  adjustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  adjustBtn: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    borderRadius: theme.radius.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  adjustBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  deleteBtn: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    marginLeft: 'auto',
    padding: 4,
  },
  deleteBtnText: {
    fontSize: 14,
    color: theme.colors.blad,
  },
  openAddBtn: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 8,
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.akcent,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  openAddBtnText: {
    color: theme.colors.akcentTekst,
    fontWeight: '700',
    fontSize: 13,
  },
  addFormCard: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.md,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  formTitle: {
    fontFamily: theme.typography.krojTytulow,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 11,
    color: theme.colors.tusz2,
    marginBottom: 4,
  },
  presetScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  presetChip: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    borderRadius: theme.radius.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 6,
  },
  presetChipText: {
    fontSize: 11,
    color: theme.colors.tusz,
  },
  textInput: {
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    borderRadius: theme.radius.sm,
    padding: 8,
    fontSize: 13,
    color: theme.colors.tusz,
    marginBottom: 8,
  },
  formButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  formCancelBtn: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  formCancelBtnText: {
    fontSize: 12,
    color: theme.colors.tusz3,
  },
  formConfirmBtn: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    backgroundColor: theme.colors.akcent,
    borderRadius: theme.radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  formConfirmBtnText: {
    color: theme.colors.naAkcencie,
    fontSize: 12,
    fontWeight: '700',
  },
  closeButton: {
    backgroundColor: theme.colors.akcent,
    borderRadius: theme.radius.md,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  closeButtonText: {
    color: theme.colors.naAkcencie,
    fontWeight: '700',
    fontSize: 14,
  },
});

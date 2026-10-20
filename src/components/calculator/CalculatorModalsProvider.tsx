// ============================================================================
// Apps4Craft Studio — CalculatorModalsProvider Component
// Container for calculator modals (Inventory, Flour Blend, QR). Ustawienia są na „Dziś” (D-051 2a),
// powitanie z wyborem stylu zastąpił Start „Co dziś robisz?” [M1-audytor-generalny-101].
// Ekran zakupu jest jeden dla aplikacji: AppAccessProvider w app/_layout.tsx [M1-audytor-generalny-025].
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { Alert } from 'react-native';
import { t } from '../../lib/i18n';
import { wejscieWidoczne } from '../../lib/wejscia-pozniej';
import { ladujSkanerQr } from '../../lib/qr-skaner';
import { FlourBlendModal } from '../FlourBlendModal';
import { FlourInventoryModal } from '../FlourInventoryModal';
import { ImportRecipeModal } from '../ImportRecipeModal';
import { FlourEquivalentsModal } from '../FlourEquivalentsModal';
import { VolumeConverterModal } from '../VolumeConverterModal';
import { ShareRecipeQrModal } from '../ShareRecipeQrModal';
import { FlourItemInput, FlourItemCalculated } from '../../core/domain-rules';
import { StoredRecipe } from '../../data/db';

export interface CalculatorModalsProviderProps {
  isBlendModalOpen: boolean;
  flourBlend: FlourItemInput[];
  onApplyBlend: (newBlend: FlourItemInput[]) => void;
  onCloseBlend: () => void;
  isInventoryOpen: boolean;
  onCloseInventory: () => void;
  recipeFlours: FlourItemCalculated[];
  isImportModalOpen: boolean;
  importInitialInput: string;
  onCloseImport: () => void;
  onImportSuccess: (imported: StoredRecipe) => void;
  isShareQrOpen: boolean;
  currentRecipeForShare: StoredRecipe | null;
  onCloseShareQr: () => void;
  isScannerOpen: boolean;
  onCloseScanner: () => void;
  onScanRecipe: (data: string) => void;
  isEquivModalOpen: boolean;
  onCloseEquiv: () => void;
  isVolumeModalOpen: boolean;
  onCloseVolume: () => void;
}

export function CalculatorModalsProvider({
  isBlendModalOpen,
  flourBlend,
  onApplyBlend,
  onCloseBlend,
  isInventoryOpen,
  onCloseInventory,
  recipeFlours,
  isImportModalOpen,
  importInitialInput,
  onCloseImport,
  onImportSuccess,
  isShareQrOpen,
  currentRecipeForShare,
  onCloseShareQr,
  isScannerOpen,
  onCloseScanner,
  onScanRecipe,
  isEquivModalOpen,
  onCloseEquiv,
  isVolumeModalOpen,
  onCloseVolume,
}: CalculatorModalsProviderProps) {
  // Skaner QR (F-08 PÓŹNIEJ) ładowany leniwie: build 1.0 nie linkuje expo-camera [M1-audytor-generalny-049]
  const skanerOtwarty = wejscieWidoczne('qr') && isScannerOpen;
  const Skaner = skanerOtwarty ? ladujSkanerQr() : null;
  React.useEffect(() => {
    if (skanerOtwarty && !Skaner) {
      Alert.alert(t('Skaner QR'), t('Skaner QR jest niedostępny w tej wersji aplikacji.'));
      onCloseScanner();
    }
  }, [skanerOtwarty, Skaner, onCloseScanner]);

  return (
    <>
      <FlourBlendModal
        visible={isBlendModalOpen}
        initialBlend={flourBlend}
        onApply={onApplyBlend}
        onClose={onCloseBlend}
      />

      <FlourInventoryModal
        visible={isInventoryOpen}
        onClose={onCloseInventory}
        recipeFlours={recipeFlours}
      />

      <ImportRecipeModal
        visible={isImportModalOpen}
        initialInput={importInitialInput}
        onClose={onCloseImport}
        onImportSuccess={onImportSuccess}
      />

      <ShareRecipeQrModal
        visible={isShareQrOpen}
        recipe={currentRecipeForShare}
        onClose={onCloseShareQr}
      />

      {Skaner && <Skaner visible={isScannerOpen} onClose={onCloseScanner} onScanRecipe={onScanRecipe} />}

      <FlourEquivalentsModal
        visible={isEquivModalOpen}
        onClose={onCloseEquiv}
      />

      <VolumeConverterModal
        visible={isVolumeModalOpen}
        onClose={onCloseVolume}
      />
    </>
  );
}

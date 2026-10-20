// ============================================================================
// Apps4Craft Studio — CalculatorModalsProvider Component
// Container for calculator modals (Settings, Inventory, Flour Blend, QR).
// Ekran zakupu jest jeden dla aplikacji: AppAccessProvider w app/_layout.tsx [M1-audytor-generalny-025].
// 100% Offline-First.
// ============================================================================

import React from 'react';
import { SettingsModal } from '../SettingsModal';
import { FlourBlendModal } from '../FlourBlendModal';
import { OnboardingModal } from '../OnboardingModal';
import { FlourInventoryModal } from '../FlourInventoryModal';
import { ImportRecipeModal } from '../ImportRecipeModal';
import { FlourEquivalentsModal } from '../FlourEquivalentsModal';
import { VolumeConverterModal } from '../VolumeConverterModal';
import { ShareRecipeQrModal } from '../ShareRecipeQrModal';
import { QrScannerModal } from '../QrScannerModal';
import { FlourItemInput, FlourItemCalculated } from '../../core/domain-rules';
import { BakerRitualProfile } from '../../data/sqlite-store';
import { StoredRecipe } from '../../data/db';

export interface CalculatorModalsProviderProps {
  isSettingsOpen: boolean;
  onCloseSettings: () => void;
  isOnboardingOpen: boolean;
  onCompleteOnboarding: (profile: BakerRitualProfile) => void;
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
  isSettingsOpen,
  onCloseSettings,
  isOnboardingOpen,
  onCompleteOnboarding,
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
  return (
    <>
      <SettingsModal
        visible={isSettingsOpen}
        onClose={onCloseSettings}
      />

      <OnboardingModal
        visible={isOnboardingOpen}
        onComplete={onCompleteOnboarding}
      />

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

      <QrScannerModal
        visible={isScannerOpen}
        onClose={onCloseScanner}
        onScanRecipe={onScanRecipe}
      />

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

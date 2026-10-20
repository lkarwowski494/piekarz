// ============================================================================
// Piekarz — import receptury w Ustawieniach (F-33; design-spec §5 i §11b „057”: import tylko w Ustawieniach,
// nie na ekranie receptury). Działa zawsze, bez ekranu zakupu (D-039); receptura trafia do bazy dopiero po
// „Zaimportuj” w oknie importu, potem do zakładki Receptury (recipe-navigation). [M1-audytor-generalny-057]
// ============================================================================

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../../ui/theme';
import { promienie } from '../../ui/tokeny';
import { t } from '../../lib/i18n';
import { ImportRecipeModal } from '../ImportRecipeModal';
import { setPendingRecipeToLoad } from '../../lib/recipe-navigation';
import { StoredRecipe } from '../../data/db';

export function ImportRecepturySection() {
  const [otwarte, setOtwarte] = useState<boolean>(false);

  const poImporcie = (r: StoredRecipe) => {
    setPendingRecipeToLoad({ id: r.id, name: r.name, targetDDT: r.targetDDT, formula: r.formula });
  };

  return (
    <View style={styles.grupa}>
      <Pressable accessibilityRole="button" testID="import-recipe-json-btn" style={styles.wiersz} onPress={() => setOtwarte(true)}>
        <Text style={styles.akcja}>{t('Importuj recepturę')}</Text>
      </Pressable>
      <ImportRecipeModal visible={otwarte} onClose={() => setOtwarte(false)} onImportSuccess={poImporcie} />
    </View>
  );
}

const styles = StyleSheet.create({
  grupa: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: promienie.grupa,
    paddingHorizontal: theme.spacing.md,
  },
  wiersz: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
  },
  akcja: {
    fontSize: 17,
    color: theme.colors.akcentTekst,
  },
});

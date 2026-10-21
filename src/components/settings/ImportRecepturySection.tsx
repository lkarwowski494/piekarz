// ============================================================================
// Piekarz — jedno wejście „Importuj z pliku” w Ustawieniach dla pliku receptury i pliku kopii zapasowej
// (design-spec §5, §11c „113”; dawniej osobno „Importuj recepturę” i przycisk w karcie kopii)
// [M1-audytor-generalny-113; 04-studio-projektowe-028]. Import tylko w Ustawieniach, nie na ekranie receptury
// (F-33, §11b „057”); działa zawsze, bez ekranu zakupu (D-039); zapis dopiero po potwierdzeniu w arkuszu;
// zaimportowana receptura otwiera się w zakładce Receptury (recipe-navigation). [M1-audytor-generalny-057]
// ============================================================================

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../../ui/theme';
import { promienie, typografia } from '../../ui/tokeny';
import { t } from '../../lib/i18n';
import { ImportZPlikuArkusz } from './ImportZPlikuArkusz';
import { setPendingRecipeToLoad } from '../../lib/recipe-navigation';
import { StoredRecipe } from '../../data/db';

export function ImportRecepturySection() {
  const [otwarte, setOtwarte] = useState<boolean>(false);

  const poImporcie = (r: StoredRecipe) => {
    setPendingRecipeToLoad({ id: r.id, name: r.name, targetDDT: r.targetDDT, formula: r.formula });
  };

  return (
    <View style={styles.grupa}>
      <Pressable accessibilityRole="button" testID="import-file-btn" style={styles.wiersz} onPress={() => setOtwarte(true)}>
        <Text style={styles.akcja}>{t('Importuj z pliku')}</Text>
      </Pressable>
      {otwarte && <ImportZPlikuArkusz onClose={() => setOtwarte(false)} onRecipeImported={poImporcie} />}
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
    fontSize: typografia.style.tresc.pt,
    color: theme.colors.akcentTekst,
  },
});

// Ekran główny zakładki „Receptury”: lista receptur (design-spec §11c „106”, stan `lista-receptur`). Dotknięcie
// wiersza otwiera ekran receptury (app/(tabs)/receptury/receptura.tsx) w stosie zakładki; ten sam kanał wczytania
// obsługuje „Piecz ponownie” z Dziennika i import z Ustawień (F-33). Wybór receptury to nawigacja bez oferty
// (D-047); filtr rodzaju z „Co dziś robisz?” (BR-START-001). [M1-audytor-generalny-106; 04-studio-projektowe-022]
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { guardSave } from '../../../src/lib/save-guard';
import { filterMasterRecipes, RecipePreset } from '../../../src/recipes/presets';
import { odbierzRodzajReceptur, subskrybujRodzajReceptur } from '../../../src/lib/start-stan';
import { getRecipes, deleteRecipe, saveRecipe } from '../../../src/data/sqlite-store';
import { StoredRecipe } from '../../../src/data/db';
import { PasekCofnij } from '../../../src/components/PasekCofnij';
import {
  getPendingRecipeToLoad,
  setPendingRecipeToLoad,
  subscribePendingRecipe,
  PendingRecipeToLoad,
} from '../../../src/lib/recipe-navigation';
import { CorruptStateRecoveryBanner } from '../../../src/components/CorruptStateRecoveryBanner';
import { ListaReceptur, type CategoryFilterType } from '../../../src/components/receptury/ListaReceptur';
import { ekranRecepturyOtwarty, subskrybujZmianyReceptur } from '../../../src/components/receptury/stos-receptur';
import { s } from '../../../src/components/receptury/style-receptur';
import { CalculatorModalsProvider } from '../../../src/components/calculator/CalculatorModalsProvider';
import { useAppAccess } from '../../../src/lib/app-access';
import { wejscieWidoczne } from '../../../src/lib/wejscia-pozniej';
import { t } from '../../../src/lib/i18n';
import { theme } from '../../../src/ui/theme';

const bezAkcji = () => undefined;

export default function RecepturyLista() {
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;
  const [filtr, setFiltr] = useState<CategoryFilterType>('all');
  const [moje, setMoje] = useState<StoredRecipe[]>([]);
  const { chron, moze } = useAppAccess();
  // Wejścia PÓŹNIEJ z dawnego nagłówka receptur: skan QR (F-08) i przelicznik objętości (F-45), dziś ukryte
  const [skanerOtwarty, setSkanerOtwarty] = useState(false);
  const [importOtwarty, setImportOtwarty] = useState(false);
  const [importTekst, setImportTekst] = useState('');
  const [przelicznikOtwarty, setPrzelicznikOtwarty] = useState(false);

  const wczytajMoje = useCallback(async () => {
    const all = await getRecipes();
    setMoje(all.filter((r) => !r.isBuiltIn));
  }, []);

  useEffect(() => {
    void wczytajMoje();
    return subskrybujZmianyReceptur(() => void wczytajMoje());
  }, [wczytajMoje]);

  // Start „Co dziś robisz?”: filtr z wybranej czynności, bez wyboru „Wszystkie” [M1-audytor-generalny-101]
  useEffect(() => {
    const zeStartu = odbierzRodzajReceptur();
    if (zeStartu) setFiltr(zeStartu);
    return subskrybujRodzajReceptur(setFiltr);
  }, []);

  // Receptura do wczytania otwiera ekran receptury; otwarty ekran receptury wczytuje ją sam
  useEffect(() => {
    const otworz = (r: PendingRecipeToLoad) => {
      if (ekranRecepturyOtwarty()) return;
      void wczytajMoje();
      routerRef.current.push({ pathname: '/receptury/receptura', params: { nazwa: r.name } });
    };
    const czeka = getPendingRecipeToLoad();
    if (czeka) otworz(czeka);
    return subscribePendingRecipe(otworz);
  }, [wczytajMoje]);

  const bazowe = useMemo(() => filterMasterRecipes(filtr), [filtr]);

  const otworzBazowa = (r: RecipePreset) =>
    setPendingRecipeToLoad({ id: r.id, name: r.namePl, formula: r.formula, targetDDT: r.targetDDT });
  const otworzMoja = (r: StoredRecipe) =>
    setPendingRecipeToLoad({ id: r.id, name: r.name, formula: r.formula, targetDDT: r.targetDDT });

  // Usuwanie własnych danych nie wymaga zakupu (DEC-48) [M1-audytor-generalny-007]. Rutynowe usunięcie bez pytania,
  // z paskiem „Cofnij”: „Przywróć” zapisuje tę samą recepturę (id, dane, data utworzenia; bez tabel zależnych)
  // (D-051 1a, design-spec §5) [M1-audytor-generalny-161; 04-studio-projektowe-506]
  const [usunieta, setUsunieta] = useState<StoredRecipe | null>(null);
  const usunMoja = guardSave(async (r: StoredRecipe) => {
    await deleteRecipe(r.id);
    setUsunieta(r);
    await wczytajMoje();
  });
  const przywrocMoja = guardSave(async () => {
    if (!usunieta) return;
    const r = usunieta;
    setUsunieta(null);
    await saveRecipe(r);
    await wczytajMoje();
  });
  const schowajPasek = useCallback(() => setUsunieta(null), []);

  // Import działa zawsze (D-039): bez uprawnienia receptura trafia na listę, bez ekranu zakupu [M1-audytor-generalny-026]
  const poImporcie = (r: StoredRecipe) => {
    void wczytajMoje();
    if (moze('kalkulator')) otworzMoja(r);
  };

  const pigulka = (id: string, etykieta: string, onPress: () => void) => (
    <Pressable testID={id} accessibilityRole="button" accessibilityLabel={etykieta} style={[s.chip, styles.pigulka]} onPress={onPress}>
      <Text style={s.chipTekst}>{etykieta}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={s.ekran} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={s.tresc} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
        <CorruptStateRecoveryBanner />
        {(wejscieWidoczne('qr') || wejscieWidoczne('przelicznik-objetosci')) && (
          <View style={s.chipy}>
            {wejscieWidoczne('przelicznik-objetosci') && pigulka('open-volume-converter-btn', t('Przelicznik objętości'), chron('kalkulator', () => setPrzelicznikOtwarty(true)))}
            {wejscieWidoczne('qr') && pigulka('open-scan-qr-btn', t('Skanuj QR'), () => setSkanerOtwarty(true))}
          </View>
        )}
        <ListaReceptur
          filtr={filtr}
          onFiltr={setFiltr}
          bazowe={bazowe}
          moje={moje}
          onOtworzBazowa={otworzBazowa}
          onOtworzMoja={otworzMoja}
          onUsunMoja={usunMoja}
        />
      </ScrollView>
      {usunieta && <PasekCofnij tekst={t('Usunięto recepturę')} onPrzywroc={() => void przywrocMoja()} onUkryj={schowajPasek} />}
      <CalculatorModalsProvider
        isBlendModalOpen={false}
        flourBlend={[]}
        onApplyBlend={bezAkcji}
        onCloseBlend={bezAkcji}
        isInventoryOpen={false}
        onCloseInventory={bezAkcji}
        recipeFlours={[]}
        isImportModalOpen={importOtwarty}
        importInitialInput={importTekst}
        onCloseImport={() => {
          setImportOtwarty(false);
          setImportTekst('');
        }}
        onImportSuccess={poImporcie}
        isShareQrOpen={false}
        currentRecipeForShare={null}
        onCloseShareQr={bezAkcji}
        isScannerOpen={skanerOtwarty}
        onCloseScanner={() => setSkanerOtwarty(false)}
        onScanRecipe={(dane) => {
          setSkanerOtwarty(false);
          setImportTekst(dane);
          setImportOtwarty(true);
        }}
        isEquivModalOpen={false}
        onCloseEquiv={bezAkcji}
        isVolumeModalOpen={przelicznikOtwarty}
        onCloseVolume={() => setPrzelicznikOtwarty(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pigulka: {
    minHeight: theme.cele.pozostale,
  },
});

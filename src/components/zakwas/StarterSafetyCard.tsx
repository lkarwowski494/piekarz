// ============================================================================
// Apps4Craft Studio — StarterSafetyCard Component
// Kontrola objawów zakwasu według zasady ostrożności DEC-10 (a) [M1-audytor-generalny-013, -014].
// Teksty: docs/tresci/pl|en/zakwas-bezpieczenstwo.md (rola 06). 100% Offline-First.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { SourdoughSafetyCheck } from '../../core/sourdough-physics';
import { odstepy, promienie, typografia } from '../../ui/tokeny';
import { Karta } from '../../ui/karty/Karta';
import { PoleObjawu } from '../../ui/karty/PoleObjawu';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';

export interface StarterSafetyCardProps {
  hasHooch: boolean;
  onToggleHooch: () => void;
  hasKahm: boolean;
  onToggleKahm: () => void;
  hasMold: boolean;
  onToggleMold: () => void;
  hasColoredSpots: boolean;
  onToggleColoredSpots: () => void;
  hasRottenSmell: boolean;
  onToggleRottenSmell: () => void;
  safetyResult: SourdoughSafetyCheck;
  onReset: () => void;
  /** Przy wyniku „wyrzuć”: założenie zakwasu od nowa (BR-ZAKW-005, D-113; Basic) [M3 P-a-fix P0-1]. */
  onZalozOdNowa?: () => void;
}

export function StarterSafetyCard({
  hasHooch,
  onToggleHooch,
  hasKahm,
  onToggleKahm,
  hasMold,
  onToggleMold,
  hasColoredSpots,
  onToggleColoredSpots,
  hasRottenSmell,
  onToggleRottenSmell,
  safetyResult,
  onReset,
  onZalozOdNowa,
}: StarterSafetyCardProps) {
  // Karta systemu kart, jeden krój nagłówka; objawy jedną kontrolką PoleObjawu jak w Doktorze (karty/README.md §2,
  // §4; makieta zakwasy.html) [M3 p2]
  const objaw = (id: string, zaznaczone: boolean, onZmien: () => void, etykieta: string) => (
    <PoleObjawu key={id} testID={id} etykieta={etykieta} zaznaczone={zaznaczone} onZmien={onZmien} />
  );
  return (
    <Karta testID="karta-bezpieczenstwo" tytul={t('Kontrola biologiczna (Bezpieczeństwo)')} ikona={<IkonaKarty nazwa="tarcza" />}>
      <Text style={styles.podpis}>{t('Zaznacz, co widzisz albo czujesz w słoiku.')}</Text>
      <View style={styles.objawy}>
        {objaw('check-hooch', hasHooch, onToggleHooch, t('Płyn na powierzchni o zapachu alkoholu (hooch)'))}
        {objaw('check-film', hasKahm, onToggleKahm, t('Biały nalot lub kożuch na powierzchni'))}
        {objaw('check-mold', hasMold, onToggleMold, t('Puszysty nalot w dowolnym kolorze, także biały'))}
        {objaw('check-colored', hasColoredSpots, onToggleColoredSpots, t('Różowe, pomarańczowe lub inne przebarwienia, smugi albo plamy'))}
        {objaw('check-smell', hasRottenSmell, onToggleRottenSmell, t('Nieprzyjemny, zgniły zapach'))}
      </View>

      <View
        style={[
          styles.safetyBox,
          safetyResult.status === 'discard'
            ? styles.safetyDanger
            : safetyResult.status === 'hooch'
            ? styles.safetyWarning
            : styles.safetyNeutral,
        ]}
        testID={`starter-safety-${safetyResult.status}`}
      >
        <Text style={[styles.safetyTitle, safetyResult.status === 'discard' && styles.safetyTekstOstrz]}>{t(safetyResult.titlePl)}</Text>
        <Text style={[styles.safetyAction, safetyResult.status === 'discard' && styles.safetyTekstOstrz]}>{t(safetyResult.actionPl)}</Text>
      </View>

      {safetyResult.status === 'discard' && onZalozOdNowa && (
        <Pressable accessibilityRole="button" testID="starter-safety-restart-btn" style={styles.resetBtn} onPress={onZalozOdNowa}>
          <Text style={styles.resetBtnText}>{t('Załóż zakwas od nowa')}</Text>
        </Pressable>
      )}

      <Pressable accessibilityRole="button" style={styles.resetBtn} onPress={onReset}>
        <Text style={styles.resetBtnText}>{t('Odznacz objawy')}</Text>
      </Pressable>

      {/* Granica zastosowania, widoczna przy każdym wyniku [M1-audytor-generalny-014; ZAK-NAL-001, ZAK-SUR-001] */}
      <View style={styles.granica}>
        <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden><IkonaKarty nazwa="info" rozmiar={20} /></View>
        <Text style={styles.boundary} testID="starter-safety-boundary">
          {`${t('Aplikacja nie ocenia bezpieczeństwa zakwasu z pewnością.')} ${t('W razie wątpliwości wyrzuć zakwas.')} ${t('Nie próbuj surowego zakwasu przed upieczeniem.')}`}
        </Text>
      </View>
    </Karta>
  );
}

const styles = StyleSheet.create({
  podpis: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz2 },
  objawy: { gap: odstepy.s },
  granica: { flexDirection: 'row', gap: odstepy.s, alignItems: 'flex-start' },
  boundary: { flex: 1, minWidth: 0, fontSize: typografia.style.przypis.pt, color: theme.colors.tusz },
  safetyBox: {
    padding: odstepy.l,
    borderRadius: promienie.grupa,
    borderWidth: 1,
    gap: odstepy.xs,
  },
  // Pleśń (RD-21) to ostrzeżenie bezpieczeństwa: żółte pole Ostrzeżenia z ciemnym tekstem; płyn i brak objawu: informacja (mapa-rol.md §3)
  // (wcześniej pastelowe tła pod jasnym tekstem: 1,04:1) [M1-audytor-generalny-016]
  safetyNeutral: {
    backgroundColor: theme.colors.powierzchnia,
    borderColor: theme.colors.linia,
  },
  safetyWarning: {
    backgroundColor: theme.colors.powierzchnia,
    borderColor: theme.colors.obwodka,
  },
  safetyDanger: {
    backgroundColor: theme.colors.ostrzTlo,
    borderColor: theme.colors.ostrzTlo,
    borderWidth: 2,
  },
  safetyTekstOstrz: {
    color: theme.colors.ostrzTusz,
  },
  safetyTitle: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: typografia.style.naglowek.pt,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  safetyAction: {
    fontSize: typografia.style.objasnienie.pt,
    color: theme.colors.tusz2,
  },
  resetBtn: {
    backgroundColor: theme.colors.powierzchnia,
    paddingVertical: odstepy.s,
    paddingHorizontal: odstepy.l,
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: promienie.przycisk,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    alignItems: 'center',
  },
  resetBtnText: {
    fontSize: typografia.style.objasnienie.pt,
    fontWeight: '600',
    color: theme.colors.tusz2,
    textAlign: 'center',
  },
});

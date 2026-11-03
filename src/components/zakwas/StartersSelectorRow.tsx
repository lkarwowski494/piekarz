// ============================================================================
// Piekarz — wybór zakwasu jako chipy (karty/README.md §4 „wybór zakwasu jako chipy na pasie”; makieta
// docs/design/karty/zakwasy.html stan „z zakwasem”) [M3 p2]. Z zakwasem chipy leżą na pasie (kolory pasa jak
// FiltryNaPasie); bez zakwasu zostaje sam „Dodaj nowy zakwas” pod kartą zakładania (makieta, stan „pusty”).
// Chipy zawijane (bez przewijania w poziomie); przy dużym tekście każdy chip na całą szerokość (flexBasis od
// fontScale, README §7a, D-142), bez maxFontSizeMultiplier. Miejsce i czas od dokarmienia przy każdym zakwasie
// zostają (BR-ZAKW-001) [M1-audytor-generalny-130].
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { StoredStarter } from '../../data/db';
import { czasSlownie } from '../../lib/spirala-etykieta';
import { etykietaPro } from '../../lib/platnosci/nazwy-pro';
import { OznaczeniePro } from '../OznaczeniePro';
import { useDuzyTekst } from '../../ui/karty/duzy-tekst';
import { odstepy, promienie, typografia } from '../../ui/tokeny';

export interface StartersSelectorRowProps {
  startersList: StoredStarter[];
  activeStarterId: string;
  onSelectStarter: (starter: StoredStarter) => void;
  onOpenAddModal: () => void;
  /** Kolejny zakwas wymaga Pro (limit Basic osiągnięty, bez dostępu): przycisk z oznaczeniem „Pro” (P2-4) [M3 P-b]. */
  dodajPro?: boolean;
  /** Chipy na pasie (z zakwasem); bez tego jak chipy na tle ekranu. */
  naPasie?: boolean;
}

export function StartersSelectorRow({
  startersList,
  activeStarterId,
  onSelectStarter,
  onOpenAddModal,
  dodajPro = false,
  naPasie = false,
}: StartersSelectorRowProps) {
  const szerokosc = { flexBasis: useDuzyTekst() ? '100%' : 'auto' } as const;
  const tekst = (wyb: boolean) => [styles.tekst, naPasie ? styles.tekstNaPasie : styles.tekstPod, wyb && (naPasie ? styles.tekstWybranyNaPasie : styles.tekstWybranyPod)];
  // Bez zakwasu wiersz zostaje z samym „Dodaj nowy zakwas”: jedyne wejście do dodania pierwszego zakwasu [M1-audytor-generalny-087]
  return (
    <View style={[styles.rzad, !naPasie && styles.rzadPod]} testID="zakwas-chipy">
      {startersList.map((s) => {
        const wyb = s.id === activeStarterId;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: wyb }}
            key={s.id}
            testID={`select-starter-${s.id}`}
            style={[styles.chip, szerokosc, naPasie ? styles.chipNaPasie : styles.chipPod, wyb && (naPasie ? styles.wybranyNaPasie : styles.wybranyPod)]}
            onPress={() => onSelectStarter(s)}
          >
            <Text style={[tekst(wyb), styles.nazwa]}>{s.name}</Text>
            {/* Miejsce i czas od ostatniego dokarmienia przy każdym zakwasie (BR-ZAKW-001) [M1-audytor-generalny-130];
                bez wpisu dokarmienia samo miejsce */}
            <Text style={tekst(wyb)}>{s.storageState === 'FRIDGE' ? t('w lodówce') : t('na blacie')}</Text>
            {s.lastFedAt !== undefined ? (
              <Text style={tekst(wyb)}>
                {t('{czas} od dokarmienia', { czas: czasSlownie(Math.max(0, Math.round((Date.now() - s.lastFedAt) / 60_000))) })}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
      <Pressable
        accessibilityRole="button"
        testID="add-starter-btn"
        accessibilityLabel={etykietaPro(t('Dodaj nowy zakwas'), !dodajPro)}
        style={[styles.chip, styles.dodaj, szerokosc, naPasie ? styles.chipNaPasie : styles.chipPod]}
        onPress={onOpenAddModal}
      >
        <Text style={[tekst(false), styles.nazwa]}>+ {t('Dodaj nowy zakwas')}</Text>
        {dodajPro && <OznaczeniePro />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  rzad: { flexDirection: 'row', flexWrap: 'wrap', gap: odstepy.s, marginTop: odstepy.xs },
  rzadPod: { marginBottom: odstepy.m },
  // Chip jak FiltryNaPasie (PasZakladki): cel 44 pt, promień chip; z drugą linią (miejsce, czas) wyższy
  chip: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    paddingHorizontal: odstepy.l,
    paddingVertical: odstepy.xs,
    borderRadius: promienie.chip,
    borderWidth: 1.5,
    maxWidth: '100%',
  },
  dodaj: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: odstepy.s, borderStyle: 'dashed' },
  chipNaPasie: { borderColor: theme.colors.naPasie2 },
  wybranyNaPasie: { backgroundColor: theme.colors.naPasie, borderColor: theme.colors.naPasie },
  chipPod: { borderColor: theme.colors.obwodka, backgroundColor: theme.colors.powierzchnia },
  wybranyPod: { backgroundColor: theme.colors.akcent, borderColor: theme.colors.akcent },
  tekst: { fontSize: typografia.style.przypis.pt },
  nazwa: { fontSize: typografia.style.objasnienie.pt, fontWeight: '600' },
  tekstNaPasie: { color: theme.colors.naPasie },
  tekstWybranyNaPasie: { color: theme.colors.pas },
  tekstPod: { color: theme.colors.tusz },
  tekstWybranyPod: { color: theme.colors.naAkcencie },
});

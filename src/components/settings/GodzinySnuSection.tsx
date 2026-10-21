// ============================================================================
// Piekarz — Ustawienia: godziny snu (D-066 1a, BR-HARMO-002) [M1-audytor-generalny-130]. Profile z
// src/lib/godziny-snu.ts i „Bez godzin snu”; wybór zapisany w app_settings, plan wypieku i prowadzenie go czytają.
// Wygląd jak sekcje obok (karta, przyciski wyboru 44 pt).
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { PROFILE_SNU, useProfilSnu, zapiszProfilSnu, type ProfilSnuId } from '../../lib/godziny-snu';
import { etykietaProfiluSnu } from '../harmonogram/TargetReadyCard';

export function GodzinySnuSection() {
  const wybrany = useProfilSnu();
  const opcje: { id: ProfilSnuId; tekst: string }[] = [
    ...PROFILE_SNU.map((p) => ({ id: p.id, tekst: `${t(p.namePl)} (${etykietaProfiluSnu(p)})` })),
    { id: 'brak', tekst: t('Bez godzin snu') },
  ];
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{t('Godziny snu')}</Text>
      <Text style={styles.opis}>{t('Kroki z pracą przy cieście planuję poza tymi godzinami.')}</Text>
      <View style={styles.lista}>
        {opcje.map((o) => (
          <Pressable
            key={o.id}
            testID={`sleep-profile-${o.id}`}
            accessibilityRole="button"
            accessibilityState={{ selected: wybrany === o.id }}
            style={[styles.opcja, wybrany === o.id && styles.opcjaWybrana]}
            onPress={() => void zapiszProfilSnu(o.id)}
          >
            <Text style={[styles.opcjaTekst, wybrany === o.id && styles.opcjaTekstWybrana]}>{o.tekst}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.linia,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: { get fontFamily() { return theme.typography.krojTytulow; }, fontSize: 16, fontWeight: '700', color: theme.colors.tusz, marginBottom: 4 },
  opis: { fontSize: 13, color: theme.colors.tusz2, marginBottom: 10 },
  lista: { gap: 8 },
  opcja: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    backgroundColor: theme.colors.powierzchnia,
  },
  opcjaWybrana: { borderColor: theme.colors.akcent },
  opcjaTekst: { fontSize: 14, color: theme.colors.tusz2 },
  opcjaTekstWybrana: { color: theme.colors.akcentTekst, fontWeight: '700' },
});

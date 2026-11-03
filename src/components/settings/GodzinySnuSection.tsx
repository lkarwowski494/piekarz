// ============================================================================
// Piekarz — Ustawienia: godziny snu (D-066 1a, BR-HARMO-002) [M1-audytor-generalny-130]. Profile z
// src/lib/godziny-snu.ts i „Bez godzin snu”; wybór zapisany w app_settings, plan wypieku i prowadzenie go czytają.
// Wygląd jak sekcje obok: karta z ikoną, profile jako wiersze, wybrany z ✓ (ikona) i kolorem akcentu [M3 p5].
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { PROFILE_SNU, useProfilSnu, zapiszProfilSnu, type ProfilSnuId } from '../../lib/godziny-snu';
import { etykietaProfiluSnu } from '../harmonogram/TargetReadyCard';
import { Karta } from '../../ui/karty/Karta';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';
import { WIERSZ, wierszUstawien } from './wiersz-ustawien';

import { typografia } from '../../ui/tokeny';
export function GodzinySnuSection() {
  const wybrany = useProfilSnu();
  const opcje: { id: ProfilSnuId; tekst: string }[] = [
    ...PROFILE_SNU.map((p) => ({ id: p.id, tekst: `${t(p.namePl)} (${etykietaProfiluSnu(p)})` })),
    { id: 'brak', tekst: t('Bez godzin snu') },
  ];
  return (
    <Karta testID="karta-godziny-snu" tytul={t('Godziny snu')} ikona={<IkonaKarty nazwa="zegar" />}>
      <Text style={styles.opis}>{t('Kroki z pracą przy cieście planuję poza tymi godzinami.')}</Text>
      <View style={styles.lista}>
        {opcje.map((o, i) => (
          <Pressable
            key={o.id}
            testID={`sleep-profile-${o.id}`}
            accessibilityRole="button"
            accessibilityState={{ selected: wybrany === o.id }}
            style={[styles.wiersz, wierszUstawien.rzad, i === 0 && wierszUstawien.pierwszy]}
            onPress={() => void zapiszProfilSnu(o.id)}
          >
            <Text style={[styles.opcjaTekst, wybrany === o.id && styles.opcjaTekstWybrana]}>{o.tekst}</Text>
            {wybrany === o.id && <IkonaKarty nazwa="ptaszek" />}
          </Pressable>
        ))}
      </View>
    </Karta>
  );
}

const styles = StyleSheet.create({
  // Wiersz w karcie (README §2): min 52, linia nad wierszem
  wiersz: { minHeight: 52, ...WIERSZ },
  opis: { fontSize: typografia.style.przypis.pt, color: theme.colors.tusz2 },
  lista: {},
  opcjaTekst: { flex: 1, flexShrink: 1, fontSize: typografia.style.tresc.pt, color: theme.colors.tusz },
  opcjaTekstWybrana: { color: theme.colors.akcentTekst, fontWeight: '700' },
});

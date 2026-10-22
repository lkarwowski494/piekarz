// ============================================================================
// Piekarz — stały dzień karmienia na karcie zakwasu w lodówce (BR-KAL-010, PR-22; D-110) [M3 D7]
// Dzień tygodnia (kolejność tygodnia regionu, RD-30) i godzina ±30 min jak pole „gotowe” planu; „Bez stałego dnia”
// wraca do rytmu 7 dni od ostatniego karmienia. W trakcie zakładania i przed 7 dniami od założenia — wyjaśnienie
// zamiast ustawienia (ZAK-ZAL-012). Pod spodem: po dokarmieniu 1–2 h w temperaturze pokojowej (ZAK-LOD-005).
// Element spoza makiety a2 (notka `10-lodowka` mówi tylko o regule) — do przeglądu roli 04. Kolory tylko z tokenów.
// ============================================================================

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StalyDzienKarmienia as StalyDzien, StoredStarter } from '../../data/db';
import { dostepnoscStalegoDnia } from '../../core/staly-dzien';
import { STALY_DZIEN_DOMYSLNA_MINUTA } from '../../core/kalendarz-config';
import { t } from '../../lib/i18n';
import { formatTime, systemFirstWeekday } from '../../lib/format';
import { dniTygodniaIso, nazwaDniaTygodnia } from '../../lib/kalendarz-widok';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';

const DOBA_MIN = 24 * 60;
const godzina = (minuta: number) => formatTime(new Date(2000, 0, 1, Math.floor(minuta / 60), minuta % 60));

function Chip({ tekst, etykieta, wybrany, onPress, testID }: { tekst: string; etykieta?: string; wybrany?: boolean; onPress: () => void; testID: string }) {
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={etykieta ?? tekst}
      accessibilityState={wybrany === undefined ? undefined : { selected: wybrany }} onPress={onPress}
      style={[styles.chip, wybrany && styles.chipWybrany]}>
      <Text style={[styles.chipTekst, wybrany && styles.chipTekstWybrany]}>{tekst}</Text>
    </Pressable>
  );
}

export function StalyDzienKarmienia({ starter, teraz, onZapisz }: { starter: StoredStarter; teraz: number; onZapisz: (d: StalyDzien | null) => void }) {
  const dostepnosc = dostepnoscStalegoDnia(starter, teraz);
  if (dostepnosc === 'nie-lodowka') return null;
  const d = starter.fridgeFeedDay ?? null;
  const przesun = (delta: number) => d && onZapisz({ weekday: d.weekday, minuteOfDay: (d.minuteOfDay + delta + DOBA_MIN) % DOBA_MIN });
  return (
    <View style={styles.karta} testID="staly-dzien-karta">
      <Text style={styles.naglowek} accessibilityRole="header">{t('Stały dzień karmienia')}</Text>
      {dostepnosc !== 'dostepny' ? (
        <Text style={styles.tekst}>{t('Stały dzień karmienia ustawisz, gdy zakwas będzie gotowy. Zakwas trafia do lodówki dopiero po 7–10 dniach od założenia.')}</Text>
      ) : (
        <>
          <Text style={styles.tekst}>
            {d ? t('Karmienie co 7 dni: {dzien}, {h}.', { dzien: nazwaDniaTygodnia(d.weekday), h: godzina(d.minuteOfDay) }) : t('Bez stałego dnia: następne karmienie 7 dni po ostatnim.')}
          </Text>
          <View style={styles.rzad}>
            {dniTygodniaIso(systemFirstWeekday()).map((iso) => (
              <Chip key={iso} testID={`staly-dzien-${iso}`} tekst={nazwaDniaTygodnia(iso, 'short')} etykieta={nazwaDniaTygodnia(iso)}
                wybrany={d?.weekday === iso} onPress={() => onZapisz({ weekday: iso, minuteOfDay: d?.minuteOfDay ?? STALY_DZIEN_DOMYSLNA_MINUTA })} />
            ))}
          </View>
          {d && (
            <View style={styles.rzad}>
              <Chip testID="staly-dzien-minus" tekst={t('{n} min', { n: -30 })} onPress={() => przesun(-30)} />
              <Text style={styles.godzina}>{godzina(d.minuteOfDay)}</Text>
              <Chip testID="staly-dzien-plus" tekst={t('{n} min', { n: '+30' })} onPress={() => przesun(30)} />
              <Chip testID="staly-dzien-brak" tekst={t('Bez stałego dnia')} onPress={() => onZapisz(null)} />
            </View>
          )}
          <Text style={styles.przypis}>{t('Po dokarmieniu zakwas może wrócić do lodówki po 1–2 h w temperaturze pokojowej.')}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  karta: { gap: odstepy.s, padding: odstepy.l, marginBottom: odstepy.l, borderRadius: promienie.grupa, backgroundColor: theme.colors.powierzchnia },
  naglowek: { fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.tusz },
  tekst: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz },
  przypis: { fontSize: typografia.style.przypis.pt, color: theme.colors.tusz2 },
  rzad: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: odstepy.s },
  godzina: { fontSize: typografia.style.naglowek.pt, fontWeight: '700', color: theme.colors.tusz, fontVariant: ['tabular-nums'] },
  chip: {
    minHeight: theme.cele.pozostale,
    minWidth: theme.cele.pozostale,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: odstepy.s,
    borderRadius: promienie.przycisk,
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
    backgroundColor: theme.colors.powierzchnia,
  },
  chipWybrany: { backgroundColor: theme.colors.akcent, borderColor: theme.colors.akcent },
  chipTekst: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz },
  chipTekstWybrany: { color: theme.colors.naAkcencie, fontWeight: '600' },
});

// ============================================================================
// Piekarz — górna część planu wypieku według wzorca `plan-sen` (design-spec §6, `docs/design/ekrany/inne.html`)
// [M1-audytor-generalny-128; 04-studio-projektowe-501]: pytanie „Kiedy chleb ma być gotowy?”, jedno pole dnia
// i godziny (dzień i ±30 min obok), temperatura w kuchni z zakresem modelu. Godziny snu i czas w lodówce są pod
// listą kroków (UstawieniaPlanu.tsx); scenariusze i chipy godziny usunięte.
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';
import { t } from '../../lib/i18n';
import { formatTemperature, UnitSystem } from '../../lib/unit-converter';
import { formatTime } from '../../lib/format';

/** Godzina w formacie regionu (PL 24 h, en-US 12 h; design-spec §7) [M1-audytor-generalny-096]. */
const godzina = (h: number, m: number): string => formatTime(new Date(2000, 0, 1, Math.floor(h) % 24, m));

/** Profile godzin snu: wybór w Ustawieniach (src/lib/godziny-snu.ts, D-066 1a) [M1-audytor-generalny-130]. */
export { PROFILE_SNU as SLEEP_PROFILES } from '../../lib/godziny-snu';

/** Godziny profilu snu w formacie regionu (en-US 12 h), nie stały napis 24 h (Z-3 z 080) [M1-audytor-generalny-093]. */
export function etykietaProfiluSnu(p: { start: number; end: number }): string {
  const hm = (x: number) => godzina(x, Math.round((x % 1) * 60));
  return `${hm(p.start)} – ${hm(p.end)}`;
}

export interface TargetReadyCardProps {
  targetDayOffset: number;
  onTargetDayOffsetChange: (offset: number) => void;
  targetHour: number;
  targetMinute: number;
  onAdjustTargetTime: (deltaMinutes: number) => void;
  formattedDayBadge: string;
  ambientTemp: number;
  onAmbientTempChange: (temp: number) => void;
  unitSystem: UnitSystem;
  /** Informacja pod polem godziny (stan „za późno”), jak w `plan-za-pozno`. */
  children?: React.ReactNode;
  /** Godziny snu po temperaturze (karta nocy albo zdanie „Plan nie sprawdza godzin snu”), jak w `plan-sen`. */
  poTemperaturze?: React.ReactNode;
}

/** Poniżej tej szerokości ekranu ±30 min idą do rzędu dni (iPhone SE 320 pt) [M1-audytor-generalny-128]. */
const WASKI_EKRAN_PT = 360;

function Chip({ tekst, wybrany, onPress }: { tekst: string; wybrany?: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={wybrany === undefined ? undefined : { selected: wybrany }}
      onPress={onPress}
      style={[styles.chip, wybrany && styles.chipWybrany]}
    >
      <Text style={[styles.chipTekst, wybrany && styles.chipTekstWybrany]}>{tekst}</Text>
    </Pressable>
  );
}

export function TargetReadyCard({
  targetDayOffset,
  onTargetDayOffsetChange,
  targetHour,
  targetMinute,
  onAdjustTargetTime,
  formattedDayBadge,
  ambientTemp,
  onAmbientTempChange,
  unitSystem,
  children,
  poTemperaturze,
}: TargetReadyCardProps) {
  const waski = useWindowDimensions().width < WASKI_EKRAN_PT;
  const minus = <Chip tekst={t('{n} min', { n: -30 })} onPress={() => onAdjustTargetTime(-30)} />;
  const plus = <Chip tekst={t('{n} min', { n: '+30' })} onPress={() => onAdjustTargetTime(30)} />;
  return (
    <View style={styles.sekcja}>
      <Text style={styles.pytanie} accessibilityRole="header">{t('Kiedy chleb ma być gotowy?')}</Text>
      {/* Pole dnia i godziny z ±30 min po bokach (jeden rząd zamiast dwóch: Spirala w pierwszym widoku); przy szerokości
          < 360 pt oba ±30 min w rzędzie dni pod polem, bo 77 + 140 + 77 pt z odstępami nie mieści się w 288 pt
          [M1-audytor-generalny-128; 04-studio-projektowe-607] */}
      <View style={styles.rzadPola}>
        {!waski && minus}
        <View testID="plan-pole-gotowosci" style={styles.pole}>
          <Text style={styles.dzien}>{formattedDayBadge}</Text>
          {/* Cyfry rosną z Dynamic Type najwyżej do tokenu AX5 (czas 56 → 99 pt), więc mieszczą się w wierszu [M1-audytor-generalny-201] */}
          <Text style={styles.godzina} maxFontSizeMultiplier={typografia.style.czas.ax5 / typografia.style.czas.pt}>
            {godzina(targetHour, targetMinute)}
          </Text>
        </View>
        {!waski && plus}
      </View>
      <View style={styles.rzad}>
        {[
          { label: t('Dziś'), offset: 0 },
          { label: t('Jutro'), offset: 1 },
          { label: t('Pojutrze'), offset: 2 },
        ].map((d) => (
          <Chip key={d.offset} tekst={d.label} wybrany={d.offset === targetDayOffset} onPress={() => onTargetDayOffsetChange(d.offset)} />
        ))}
        {waski && minus}
        {waski && plus}
      </View>

      {children}

      {/* Wartość przy nagłówku: domyślne 23 °C to założenie modelu bez chipa (017), więc widać, z czym liczy plan */}
      <Text style={styles.naglowek}>
        {t('Temperatura w kuchni:')} {formatTemperature(ambientTemp, unitSystem)}
      </Text>
      <View style={styles.rzad}>
        {[20, 22, 24, 26].map((temp) => (
          <Chip key={temp} tekst={formatTemperature(temp, unitSystem)} wybrany={ambientTemp === temp} onPress={() => onAmbientTempChange(temp)} />
        ))}
      </View>
      <Text style={styles.przypis}>
        {t('Wpływa na tempo fermentacji burzliwej: 10 °C niżej to około 3 razy dłuższa fermentacja (przybliżenie z modelu badawczego, ważne w 20–26 °C).')}
      </Text>

      {/* Noc po temperaturze, jak we wzorcu `plan-sen` (pole → temperatura → noc → Spirala) [M1-audytor-generalny-128] */}
      {poTemperaturze}
    </View>
  );
}

const styles = StyleSheet.create({
  sekcja: { marginBottom: odstepy.l },
  pytanie: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: typografia.style.tytulKroku.pt,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginBottom: odstepy.m,
  },
  rzadPola: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: odstepy.s, marginBottom: odstepy.s },
  pole: {
    flexGrow: 1,
    flexBasis: 140,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: theme.cele.glownyPrzeplyw,
    paddingHorizontal: odstepy.m,
    paddingVertical: odstepy.xs,
    borderRadius: promienie.pole,
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
    backgroundColor: theme.colors.powierzchnia,
  },
  dzien: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz },
  godzina: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: typografia.style.czas.pt,
    fontWeight: '700',
    color: theme.colors.tusz,
    fontVariant: ['tabular-nums'],
  },
  rzad: { flexDirection: 'row', flexWrap: 'wrap', gap: odstepy.s, marginBottom: odstepy.m },
  chip: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: odstepy.m,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
    backgroundColor: theme.colors.powierzchnia,
  },
  chipWybrany: { backgroundColor: theme.colors.akcent, borderColor: theme.colors.akcent },
  chipTekst: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz },
  chipTekstWybrany: { color: theme.colors.naAkcencie, fontWeight: '600' },
  naglowek: { fontSize: typografia.style.objasnienie.pt, fontWeight: '600', color: theme.colors.tusz, marginTop: odstepy.s, marginBottom: odstepy.s },
  przypis: { fontSize: typografia.style.przypis.pt, color: theme.colors.tusz2 },
});

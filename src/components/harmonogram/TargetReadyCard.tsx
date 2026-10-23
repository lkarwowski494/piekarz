// ============================================================================
// Piekarz — górna część planu wypieku według wzorca `plan-sen` (design-spec §6, `docs/design/ekrany/inne.html`)
// [M1-audytor-generalny-128; 04-studio-projektowe-501]: pytanie „Kiedy chleb ma być gotowy?”, jedno pole dnia
// i godziny (dzień i ±30 min obok), temperatura w kuchni z zakresem modelu. Godziny snu i czas w lodówce są pod
// listą kroków (UstawieniaPlanu.tsx); scenariusze i chipy godziny usunięte.
// ============================================================================

import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';
import { t } from '../../lib/i18n';
import { formatTemperature, UnitSystem } from '../../lib/unit-converter';
import { formatDzienData, formatTime } from '../../lib/format';
import { dniPlanu } from '../../core/plany-wypiekow';
import { addCalendarDays, startOfLocalDay } from '../../core/dzien-lokalny';
import { przesunGotowe } from '../../lib/godzina-gotowe';

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
  /** Chwila gotowości z planu: pokazywana zamiast godziny z pól, gdy w tym dniu wybranej godziny nie ma (D-13). */
  faktycznaGodzina?: Date;
  /** Dzień zmiany czasu, a wybrana godzina wypadła w luce: pod polem krótki komunikat z faktyczną godziną (D-13, D-093). */
  zmianaCzasu?: boolean;
  ambientTemp: number;
  onAmbientTempChange: (temp: number) => void;
  unitSystem: UnitSystem;
  /** Informacja pod polem godziny (stan „za późno”), jak w `plan-za-pozno`. */
  children?: React.ReactNode;
  /** Godziny snu po temperaturze (karta nocy albo zdanie „Plan nie sprawdza godzin snu”), jak w `plan-sen`. */
  poTemperaturze?: React.ReactNode;
  /** Propozycja dnia z rytmu Dziennika pod wyborem dnia (BR-KAL-014) [M3 D7]. */
  podpowiedz?: string;
}

/** Poniżej tej szerokości ekranu ±30 min idą do rzędu dni (iPhone SE 320 pt) [M1-audytor-generalny-128]. */
const WASKI_EKRAN_PT = 360;

/** Etykieta dnia „gotowe”: dziś, jutro, pojutrze, dalej dzień tygodnia z datą (Intl, F-5) [M3 D5]. */
function etykietaDnia(offset: number): string {
  if (offset === 0) return t('Dziś');
  if (offset === 1) return t('Jutro');
  if (offset === 2) return t('Pojutrze');
  return formatDzienData(new Date(addCalendarDays(startOfLocalDay(Date.now()), offset)));
}

function Chip({ tekst, wybrany, onPress, testID, onLayout, nieaktywny }: { tekst: string; wybrany?: boolean; onPress: () => void; testID?: string; onLayout?: (x: number) => void; nieaktywny?: boolean }) {
  return (
    <Pressable
      testID={testID}
      onLayout={onLayout ? (e) => onLayout(e.nativeEvent.layout.x) : undefined}
      accessibilityRole="button"
      accessibilityState={nieaktywny ? { disabled: true } : wybrany === undefined ? undefined : { selected: wybrany }}
      disabled={nieaktywny}
      onPress={onPress}
      style={[styles.chip, wybrany && styles.chipWybrany, nieaktywny && styles.chipNieaktywny]}
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
  faktycznaGodzina,
  zmianaCzasu,
  ambientTemp,
  onAmbientTempChange,
  unitSystem,
  children,
  poTemperaturze,
  podpowiedz,
}: TargetReadyCardProps) {
  const { width, fontScale } = useWindowDimensions();
  const waski = width < WASKI_EKRAN_PT;
  // Duży tekst (okolice AX1–AX5): dni zawijane zamiast przewijania w poziomie, żeby żaden nie wychodził poza ekran (PRZ-10)
  const zawijaj = fontScale >= 2;
  const rzadDni = useRef<ScrollView>(null);
  // Zmiana, która wyszłaby poza dni planu (przed dziś albo za ostatni chip dnia, D-108), jest nieaktywna (N1)
  const poza = (delta: number) => przesunGotowe({ dayOffset: targetDayOffset, hour: targetHour, minute: targetMinute }, delta) === null;
  const minus = <Chip tekst={t('{n} min', { n: -30 })} nieaktywny={poza(-30)} onPress={() => onAdjustTargetTime(-30)} />;
  const plus = <Chip tekst={t('{n} min', { n: '+30' })} nieaktywny={poza(30)} onPress={() => onAdjustTargetTime(30)} />;
  // ±2 h obok ±30 min: 10:00 → 18:00 w 4 stuknięciach zamiast 16 (04-studio-projektowe-008 b, W-fix2); klucz istniejący
  const dwieGodziny = (
    <View style={styles.rzad}>
      <Chip tekst={t('{n} godziny', { n: '-2' })} nieaktywny={poza(-120)} onPress={() => onAdjustTargetTime(-120)} />
      {waski && minus}
      {waski && plus}
      <Chip tekst={t('{n} godziny', { n: '+2' })} nieaktywny={poza(120)} onPress={() => onAdjustTargetTime(120)} />
    </View>
  );
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
          {/* Cyfry rosną z Dynamic Type najwyżej do tokenu AX5 (czas 56 → 99 pt); en-US „9:45 AM” przy 320 pt zmniejsza
              się w jednym wierszu zamiast łamać [M1-audytor-generalny-201; reaudit-noc N-2] */}
          <Text style={styles.godzina} maxFontSizeMultiplier={typografia.style.czas.ax5 / typografia.style.czas.pt}
            numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
            {faktycznaGodzina ? formatTime(faktycznaGodzina) : godzina(targetHour, targetMinute)}
          </Text>
        </View>
        {!waski && plus}
      </View>
      {/* Dzień „gotowe” od dziś do ZASIEG_DNI_PLANU (D-108): rząd chipów przewijany w poziomie (element nowy, do przeglądu
          roli 04); dalej niż pojutrze dzień tygodnia z datą przez Intl jak w polu [M3 D5] */}
      {/* Wybrany dzień spoza ekranu (skrót, rytm Dziennika, np. +9) przewija się do widoku po układzie chipa (PRZ-10) */}
      {(() => {
        const chipy = dniPlanu().map((offset) => (
          <Chip key={offset} testID={`plan-dzien-${offset}`} tekst={etykietaDnia(offset)} wybrany={offset === targetDayOffset} onPress={() => onTargetDayOffsetChange(offset)}
            onLayout={offset === targetDayOffset && !zawijaj ? (x) => rzadDni.current?.scrollTo({ x: Math.max(0, x - odstepy.l), animated: false }) : undefined} />
        ));
        return zawijaj ? (
          <View testID="plan-dni" style={[styles.dni, styles.dniZawijane]}>{chipy}</View>
        ) : (
          <ScrollView ref={rzadDni} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dni} keyboardShouldPersistTaps="handled">{chipy}</ScrollView>
        );
      })()}
      {/* Propozycja z rytmu Dziennika (BR-KAL-014): zdanie spoza makiety, do przeglądu roli 04 [M3 D7] */}
      {podpowiedz ? <Text style={styles.zmianaCzasu} testID="plan-podpowiedz-rytmu">{podpowiedz}</Text> : null}
      {dwieGodziny}

      {zmianaCzasu && faktycznaGodzina ? (
        <Text style={styles.zmianaCzasu} testID="plan-zmiana-czasu">
          {t('W tym dniu zmienia się czas, a wybranej godziny nie ma. Chleb będzie gotowy o {godzina}.', { godzina: formatTime(faktycznaGodzina) })}
        </Text>
      ) : null}

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
  dni: { flexDirection: 'row', gap: odstepy.s, marginBottom: odstepy.m },
  dniZawijane: { flexWrap: 'wrap' },
  chip: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: odstepy.m,
    borderRadius: promienie.chip,
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
    backgroundColor: theme.colors.powierzchnia,
  },
  chipWybrany: { backgroundColor: theme.colors.akcent, borderColor: theme.colors.akcent },
  chipTekst: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz },
  chipTekstWybrany: { color: theme.colors.naAkcencie, fontWeight: '600' },
  chipNieaktywny: { opacity: 0.6 }, // stan nieaktywny jak w PaywallModal: brak tokenu (zgłoszenie do roli 04)
  naglowek: { fontSize: typografia.style.objasnienie.pt, fontWeight: '600', color: theme.colors.tusz, marginTop: odstepy.s, marginBottom: odstepy.s },
  zmianaCzasu: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz2, marginBottom: odstepy.m },
  przypis: { fontSize: typografia.style.przypis.pt, color: theme.colors.tusz2 },
});

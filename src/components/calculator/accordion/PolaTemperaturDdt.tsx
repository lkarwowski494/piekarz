// ============================================================================
// Piekarz — pola temperatur do wzoru temperatury wody (RD-16, BR-KALK-004): mąka, kuchnia, zakwas albo zaczyn
// (tylko gdy receptura go ma) i przyrost od tarcia. Pusty wpis = brak danej (null), arkusz prosi wtedy
// o uzupełnienie zamiast wyniku. Wartości w °C; imperialnie pole pokazuje °F (przyrost od tarcia × 1,8).
// [M1-audytor-generalny-146]
// ============================================================================

import React, { useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../../ui/theme';
import { t } from '../../../lib/i18n';
import { NumInput } from '../../NumInput';
import { useUnitSystem, celsiusToFahrenheit, temperaturaZPola, roundTo, UnitSystem } from '../../../lib/unit-converter';
import { typografia } from '../../../ui/tokeny';

export interface TemperaturyDdt {
  maka: number | null;
  kuchnia: number | null;
  zaczyn: number | null;
  tarcie: number | null;
}

export interface PolaTemperaturDdtProps {
  wartosci: TemperaturyDdt;
  /** Receptura ma zakwas albo zaczyn: pole jego temperatury i wzór z n = 4 (RD-16). */
  zZaczynem: boolean;
  onChange: (zmiana: Partial<TemperaturyDdt>) => void;
}

/** Etykiety pól; pierwsza pusta wartość daje prośbę o uzupełnienie (RD-16-W4). */
export const ETYKIETY_TEMPERATUR: Record<keyof TemperaturyDdt, string> = {
  maka: 'Temperatura mąki',
  kuchnia: 'Temperatura w kuchni',
  zaczyn: 'Temperatura zakwasu albo zaczynu',
  tarcie: 'Ciepło tarcia',
};

/** Klucz pierwszego pustego pola potrzebnego do wzoru albo null, gdy wszystkie są wpisane. */
export function brakujacaTemperatura(w: TemperaturyDdt, zZaczynem: boolean): keyof TemperaturyDdt | null {
  const pola: (keyof TemperaturyDdt)[] = zZaczynem ? ['maka', 'kuchnia', 'zaczyn', 'tarcie'] : ['maka', 'kuchnia', 'tarcie'];
  return pola.find((k) => w[k] === null) ?? null;
}

function doPola(c: number, roznica: boolean, u: UnitSystem): number {
  if (u !== 'imperial') return c;
  return roundTo(roznica ? c * 1.8 : celsiusToFahrenheit(c), 1);
}

function zPola(v: number, roznica: boolean, u: UnitSystem): number {
  if (u !== 'imperial') return v;
  return roznica ? roundTo(v / 1.8, 2) : temperaturaZPola(v, u);
}

function Pole({ id, klucz, wartosc, roznica, onChange }: { id: string; klucz: keyof TemperaturyDdt; wartosc: number | null; roznica?: boolean; onChange: (c: number | null) => void }) {
  const u = useUnitSystem();
  const pusty = useRef(false);
  const etykieta = t(ETYKIETY_TEMPERATUR[klucz]);
  return (
    <View style={styles.wiersz}>
      <Text style={styles.etykieta}>{etykieta}</Text>
      <NumInput
        testID={id}
        accessibilityLabel={etykieta}
        value={wartosc === null ? '' : doPola(wartosc, !!roznica, u)}
        onChangeText={(tekst) => {
          pusty.current = tekst.trim() === '';
          if (pusty.current) onChange(null);
        }}
        onChangeNumber={(v) => onChange(pusty.current ? null : zPola(v, !!roznica, u))}
        style={styles.pole}
      />
      <Text style={styles.jednostka}>{u === 'imperial' ? '°F' : '°C'}</Text>
    </View>
  );
}

export function PolaTemperaturDdt({ wartosci, zZaczynem, onChange }: PolaTemperaturDdtProps) {
  return (
    <View style={styles.grupa}>
      <Pole id="ddt-flour-temp-input" klucz="maka" wartosc={wartosci.maka} onChange={(maka) => onChange({ maka })} />
      <Pole id="ddt-room-temp-input" klucz="kuchnia" wartosc={wartosci.kuchnia} onChange={(kuchnia) => onChange({ kuchnia })} />
      {zZaczynem && <Pole id="ddt-starter-temp-input" klucz="zaczyn" wartosc={wartosci.zaczyn} onChange={(zaczyn) => onChange({ zaczyn })} />}
      <Pole id="ddt-friction-input" klucz="tarcie" wartosc={wartosci.tarcie} roznica onChange={(tarcie) => onChange({ tarcie })} />
    </View>
  );
}

const styles = StyleSheet.create({
  grupa: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  wiersz: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    minHeight: theme.cele.pozostale,
  },
  etykieta: {
    flex: 1,
    minWidth: 140,
    fontSize: typografia.style.przypis.pt,
    color: theme.colors.tusz,
  },
  pole: {
    minWidth: 72,
    minHeight: theme.cele.pozostale,
  },
  jednostka: {
    fontSize: typografia.style.przypis.pt,
    color: theme.colors.tusz2,
  },
});

// ============================================================================
// Piekarz — karta „Pojemność maszyny”: granice z instrukcji maszyny użytkownika (BR-MASZ-002, RD-37), układ wkładania
// (BR-MASZ-003) i jeden czas programu (D-189, D-260). Największa ilość mąki wymagana; masa ciasta, drożdży suchych
// i czas programu nieobowiązkowe (puste = nie podano, null, bez liczby domyślnej). Zdania: machine.capacity (rola 06),
// machine.order (układy). Pola liczbowe: NumInput (przecinek i kropka, wInKeep) [M3 p9b2].
// ============================================================================

import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { t } from '../../lib/i18n';
import type { DaneMaszyny, UkladMaszyny } from '../../data/wybory-parsery';
import { NumInput } from '../NumInput';
import { Karta } from '../../ui/karty/Karta';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';
import { SegmentOpcji } from './SegmentOpcji';
import { s } from './style-receptur';
import { styles } from './style-maszyny';

/** Wartość pola: liczba > 0 albo brak (puste pole i 0 = nie podano). */
const dodatnia = (v: number | null): number | null => (v !== null && Number.isFinite(v) && v > 0 ? v : null);

export function Pole({ id, etykieta, jednostka, wartosc, onChange }: { id: string; etykieta: string; jednostka: string; wartosc: number | null; onChange: (v: number | null) => void }) {
  return (
    <View style={s.kom}>
      <Text style={[s.etykieta, s.roz]}>{etykieta}</Text>
      <View style={styles.rzad}>
        <NumInput testID={id} accessibilityLabel={etykieta} value={wartosc ?? ''} unit={jednostka} onChangeNumber={(v) => onChange(dodatnia(v))} style={s.pole} />
        <Text style={s.wartosc}>{jednostka}</Text>
      </View>
    </View>
  );
}

/** Wybór układu wkładania (BR-MASZ-003); osobno, bo ekran prosi o niego także przy zapisanych granicach bez układu. */
export function WyborUkladu({ uklad, onWybierz }: { uklad: UkladMaszyny | null; onWybierz: (u: UkladMaszyny) => void }) {
  return (
    <View>
      <Text style={[s.etykieta, styles.naglowekGrupy]}>{t('Kolejność wkładania')}</Text>
      <SegmentOpcji
        testID="maszyna-uklad"
        etykieta={t('Kolejność wkładania')}
        // Brak wyboru: żadna opcja nie jest zaznaczona (null nie pasuje do żadnej wartości)
        wybrana={uklad ?? ('' as UkladMaszyny)}
        onWybierz={onWybierz}
        opcje={[
          { wartosc: 'plyny_najpierw', testID: 'maszyna-uklad-plyny', etykieta: t('płyny najpierw') },
          { wartosc: 'drozdze_najpierw', testID: 'maszyna-uklad-drozdze', etykieta: t('drożdże najpierw') },
        ]}
      />
      <Text style={styles.zdanie}>{t('W większości przeczytanych instrukcji najpierw wlewa się płyny, potem wsypuje mąkę i inne suche składniki, a drożdże na wierzch, tak by nie dotykały płynów.')}</Text>
      <Text style={styles.zdanie}>{t('W niektórych maszynach jest odwrotnie: najpierw suche drożdże, na nie mąka i suche składniki, a płyn na końcu.')}</Text>
    </View>
  );
}

export function DaneMaszynyKarta({ poczatkowe, onZapisz }: { poczatkowe: DaneMaszyny | null; onZapisz: (d: DaneMaszyny) => void }) {
  const [maka, setMaka] = useState<number | null>(poczatkowe?.makaMaxG ?? null);
  const [ciasto, setCiasto] = useState<number | null>(poczatkowe?.ciastoMaxG ?? null);
  const [drozdze, setDrozdze] = useState<number | null>(poczatkowe?.drozdzeSucheMaxG ?? null);
  const [czas, setCzas] = useState<number | null>(poczatkowe?.czasProgramuMin ?? null);
  const [uklad, setUklad] = useState<UkladMaszyny | null>(poczatkowe?.uklad ?? null);
  const gotowe = maka !== null;
  const zapisz = () => {
    if (maka === null) return;
    onZapisz({ v: 1, makaMaxG: maka, ciastoMaxG: ciasto, drozdzeSucheMaxG: drozdze, uklad, czasProgramuMin: czas });
  };
  return (
    <Karta testID="maszyna-dane" tytul={t('Pojemność maszyny')} ikona={<IkonaKarty nazwa="waga" />} bezWypelnienia>
      <View style={styles.wnetrze}>
        <Text style={styles.zdanie}>{t('Wpisz z instrukcji swojej maszyny największą ilość mąki, a jeśli instrukcja ją podaje, także największą masę ciasta i drożdży; Piekarz nie przeliczy receptury ponad żadną z tych granic.')}</Text>
        <Text style={styles.zdanie}>{t('Na przykład w Tefal PF220838 nie wolno przekroczyć łącznie 1000 g ciasta, 620 g mąki chlebowej i 10 g suchych drożdży instant.')}</Text>
      </View>
      <Pole id="maszyna-maka-max" etykieta={t('Największa ilość mąki')} jednostka="g" wartosc={maka} onChange={setMaka} />
      <Pole id="maszyna-ciasto-max" etykieta={t('Największa masa ciasta')} jednostka="g" wartosc={ciasto} onChange={setCiasto} />
      <Pole id="maszyna-drozdze-max" etykieta={t('Największa masa drożdży suchych')} jednostka="g" wartosc={drozdze} onChange={setDrozdze} />
      <Pole id="maszyna-czas-programu" etykieta={t('Czas programu')} jednostka="min" wartosc={czas} onChange={setCzas} />
      <View style={styles.wnetrze}>
        <WyborUkladu uklad={uklad} onWybierz={setUklad} />
        <Pressable
          testID="maszyna-dane-zapisz"
          accessibilityRole="button"
          accessibilityState={{ disabled: !gotowe }}
          disabled={!gotowe}
          onPress={zapisz}
          style={[styles.glowny, !gotowe && styles.glownyZablokowany]}
        >
          <Text style={[styles.glownyTekst, !gotowe && styles.tekstZablokowany]}>{t('Zapisz')}</Text>
        </Pressable>
      </View>
    </Karta>
  );
}

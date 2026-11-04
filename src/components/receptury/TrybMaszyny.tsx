// ============================================================================
// Piekarz — tryb „Maszyna do chleba” na ekranie receptury (F-72, D-138, D-153; karty/README.md wiersz D-138, makieta
// karty/receptury.html#receptura-maszyna). Zamiast „Do miski”: karta „Pojemność maszyny” (granice, BR-MASZ-002),
// „Kolejność wkładania” (ilości pod granice RD-37, układ z danych maszyny, BR-MASZ-003), „Program i godzina”
// (BR-MASZ-004, -005) i ostrzeżenie bezpieczeństwa (BR-MASZ-006). Przy zakwasie: wersja drożdżowa i zdanie
// machine.sourdough (D-156). Bez danych maszyny: prośba o granicę mąki, bez ilości (RD-37-W6) [M3 p9b2].
// ============================================================================

import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { t } from '../../lib/i18n';
import { nazwaMakiMieszanki } from '../../lib/nazwa-maki-mieszanki';
import { useUnitSystem, formatWeight, formatDoseWeight } from '../../lib/unit-converter';
import { useRodzajDrozdzy, gramyDrozdzy, nazwaDrozdzy } from '../../lib/rodzaj-drozdzy';
import { makaMaszyny, kolejnoscWkladania } from '../../core/maszyna';
import { formulaMaszyny } from '../../recipes/maszyna-receptur';
import type { RecipePreset } from '../../recipes/presets-types';
import type { DaneMaszyny } from '../../data/wybory-parsery';
import { useDaneMaszyny } from '../../hooks/useDaneMaszyny';
import { Karta } from '../../ui/karty/Karta';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';
import { WierszKarty } from '../../ui/karty/WierszKarty';
import { Ostrzezenie } from '../Ostrzezenie';
import { DaneMaszynyKarta, WyborUkladu } from './DaneMaszynyKarta';
import { ProgramMaszynyKarta } from './ProgramMaszynyKarta';
import { s } from './style-receptur';
import { sm } from './style-maszyny';

type Pozycja = { id: string; nazwa: string; masa: string; rodzaj: 'plyn' | 'sucha' | 'drozdze' };

/** Zdania machine.safety (rola 06; czekają na przegląd zdań właściciela, D-177). */
const BEZPIECZENSTWO = [
  'Po pieczeniu formę wyjmuj w rękawicach kuchennych, bo forma, jej uchwyt i wnętrze pokrywy są gorące.',
  'Mieszadło, które zostało w bochenku, może być bardzo gorące: wyjmij je dopiero po ostygnięciu chleba, narzędziem z zestawu albo plastikową łopatką, bez noża i widelca, i dalej uważaj na oparzenie.',
  'Przy otwieraniu pokrywy w trakcie albo pod koniec programu może wydostać się gorąca para.',
  'W czasie pracy nie dotykaj otworu pary i go nie zasłaniaj.',
  'Dzieci poniżej 8 lat trzymaj z dala od maszyny i przewodu, a starsze mogą jej używać tylko pod nadzorem.',
] as const;

export function TrybMaszyny({ receptura, masaBochenkaG }: { receptura: RecipePreset; masaBochenkaG: number }) {
  const { stan, zapisz } = useDaneMaszyny(true);
  const [edycja, setEdycja] = useState(false);
  if (stan.ladowanie) return null;
  const dane = stan.dane;
  if (dane === null || edycja) {
    return (
      <DaneMaszynyKarta
        poczatkowe={dane}
        onZapisz={(d) => {
          zapisz(d);
          setEdycja(false);
        }}
      />
    );
  }
  return <KartyMaszyny receptura={receptura} masaBochenkaG={masaBochenkaG} dane={dane} onZmien={() => setEdycja(true)} onUklad={(uklad) => zapisz({ ...dane, uklad })} />;
}

function KartyMaszyny({ receptura, masaBochenkaG, dane, onZmien, onUklad }: {
  receptura: RecipePreset;
  masaBochenkaG: number;
  dane: DaneMaszyny;
  onZmien: () => void;
  onUklad: (u: NonNullable<DaneMaszyny['uklad']>) => void;
}) {
  const unitSystem = useUnitSystem();
  const rodzaj = useRodzajDrozdzy();
  const { formula, przezWersjeDrozdzowa } = formulaMaszyny(receptura);
  const drozdzeProc = formula.extraYeastPercentage ?? 0;
  const sumaProc = (formula.waterPercentage + formula.saltPercentage + drozdzeProc) / 100;
  // Mąka wybranego bochenka (Mwyb) z masy bochenka na ekranie i procentów formuły maszyny (RD-37)
  const maka = makaMaszyny(masaBochenkaG / (1 + sumaProc), sumaProc, drozdzeProc > 0 ? drozdzeProc / 100 : null, dane);
  const makaG = maka.ok ? maka.makaG : null;
  const sumaMak = formula.flours.reduce((a, f) => a + f.percentage, 0) || 100;
  const lista: Pozycja[] = makaG === null ? [] : [
    { id: 'woda', nazwa: t('Woda'), masa: formatWeight((makaG * formula.waterPercentage) / 100, unitSystem), rodzaj: 'plyn' },
    ...formula.flours.map((f, i): Pozycja => ({ id: `maka-${i}`, nazwa: nazwaMakiMieszanki(f), masa: formatWeight((makaG * f.percentage) / sumaMak, unitSystem), rodzaj: 'sucha' })),
    { id: 'sol', nazwa: t('Sól'), masa: formatDoseWeight((makaG * formula.saltPercentage) / 100, unitSystem), rodzaj: 'sucha' },
    ...(drozdzeProc > 0 ? [{ id: 'drozdze', nazwa: nazwaDrozdzy(rodzaj), masa: formatDoseWeight(gramyDrozdzy((makaG * drozdzeProc) / 100, rodzaj), unitSystem), rodzaj: 'drozdze' as const }] : []),
  ];
  const kolejnosc = kolejnoscWkladania(lista, dane.uklad);
  return (
    <>
      <Karta testID="karta-pojemnosc" tytul={t('Pojemność maszyny')} ikona={<IkonaKarty nazwa="waga" />} bezWypelnienia>
        <WierszKarty testID="maszyna-pojemnosc" etykieta={t('Największa ilość mąki')} wartosc={formatWeight(dane.makaMaxG, unitSystem)} onPress={onZmien} />
      </Karta>
      <Karta testID={kolejnosc ? 'karta-kolejnosc' : 'karta-uklad'} tytul={t('Kolejność wkładania')} ikona={<IkonaKarty nazwa="lista" />} bezWypelnienia>
        {kolejnosc ? (
          kolejnosc.map((p, i) => (
            <View key={p.id} style={s.kom} testID={`maszyna-krok-${i + 1}`}>
              <Text style={sm.numer}>{i + 1}</Text>
              <Text style={[s.etykieta, s.roz]}>{p.nazwa}</Text>
              <Text style={s.liczba}>{p.masa}</Text>
            </View>
          ))
        ) : (
          <View style={sm.wnetrze}>
            <WyborUkladu uklad={null} onWybierz={onUklad} />
          </View>
        )}
        <View style={sm.wnetrze}>
          {maka.ok && maka.ograniczenie !== null && (
            <Text testID="maszyna-ograniczenie" style={sm.zdanie}>{t('Ilość ograniczyła granica Twojej maszyny; procenty receptury są te same.')}</Text>
          )}
          {kolejnosc && <Text style={sm.zdanie}>{t('Kolejność wkładania składników podaje instrukcja Twojej maszyny.')}</Text>}
          {kolejnosc && dane.uklad === 'plyny_najpierw' && <Text style={sm.zdanie}>{t('W większości przeczytanych instrukcji najpierw wlewa się płyny, potem wsypuje mąkę i inne suche składniki, a drożdże na wierzch, tak by nie dotykały płynów.')}</Text>}
          {kolejnosc && dane.uklad === 'drozdze_najpierw' && <Text style={sm.zdanie}>{t('W niektórych maszynach jest odwrotnie: najpierw suche drożdże, na nie mąka i suche składniki, a płyn na końcu.')}</Text>}
          <Text style={sm.zdanie}>{t('Kolejność i ilości według instrukcji maszyny.')}</Text>
          {przezWersjeDrozdzowa && (
            <View testID="maszyna-zakwas">
              <Text style={sm.zdanie}>{t('W przeczytanych instrukcjach maszyn programy na zakwasie używają także drożdży piekarskich.')}</Text>
              <Text style={sm.zdanie}>{t('Dlatego w trybie maszyny ta receptura używa wersji na drożdżach.')}</Text>
            </View>
          )}
        </View>
      </Karta>
      <ProgramMaszynyKarta receptura={receptura} formula={formula} makaG={makaG} przezWersjeDrozdzowa={przezWersjeDrozdzowa} czasPoczatkowy={dane.czasProgramuMin} />
      <Ostrzezenie testID="maszyna-bezpieczenstwo" tytul={t('Po programie')} teksty={BEZPIECZENSTWO.map((z) => t(z))} />
    </>
  );
}

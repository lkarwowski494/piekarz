// ============================================================================
// Piekarz — trwający wypiek na „Dziś” pod kaflami (D-105, wariant 3+1; makiety roli 04 `a2-03` i `dwa-tory-v2`) [M3 D4b]
// Jeden wypiek: duża Spirala z planu, krok, „zostało … do …”, „gotowe” i „Wróć do wypieku” (F-58). Dwa wypieki: jedna
// Spirala z dwoma torami (tor 2 kropkami), legenda POD spiralą jako karty: numer, kształt toru, „{receptura}: {krok}”,
// czas i „Wróć do: {receptura}” (44 pt, cała szerokość karty). AX5: spirala dwóch torów znika, zostają karty.
// Bez trwającego wypieku: pusta spirala z adnotacją (pierwsze uruchomienie). Zastępuje kartę „Trwa wypiek” x2 z D3a.
// ============================================================================

import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import type { TrwajacyNaStarcie } from '../../hooks/useStanStartu';
import { stepHasTimer } from '../../core/bake-session';
import { t } from '../../lib/i18n';
import { nazwaReceptury } from '../../lib/nazwa-receptury';
import { formatTime } from '../../lib/format';
import { gotoweMs } from '../../lib/gotowe';
import { czasSlownie, dzienSlownie, etykietaPlanuWypieku } from '../../lib/spirala-etykieta';
import { krokiSpiraliZSesji } from '../../lib/spirala-geometria';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';
import { Spirala } from '../Spirala';

/** Stan jednego wypieku na „Dziś”: krok, czas do końca kroku, postęp i godzina „gotowe” (jak w prowadzeniu, N-4). */
function opisWypieku({ sesja, zegar }: TrwajacyNaStarcie, teraz: number) {
  const krok = sesja.steps[sesja.stepIdx];
  const nazwaKroku = t(krok?.name ?? '');
  const pozostaloMin = stepHasTimer(krok) ? Math.ceil(zegar.timeLeftSec / 60) : null;
  const pelnyMin = krok?.durationMin ?? null;
  const postep = pozostaloMin !== null && pelnyMin ? Math.min(1, Math.max(0, 1 - pozostaloMin / pelnyMin)) : 0;
  const koniecKroku = pozostaloMin !== null && zegar.isRunning ? teraz + zegar.timeLeftSec * 1000 : krok?.plannedEnd ?? null;
  const koniec = gotoweMs({ steps: sesja.steps, stepIdx: sesja.stepIdx, koniecKrokuMs: sesja.timerEndsAt, teraz });
  const gotowe = koniec === null ? null : new Date(koniec);
  const czas =
    pozostaloMin === null ? null : koniecKroku === null ? t('zostało {czas}', { czas: czasSlownie(pozostaloMin) })
      : t('zostało {czas}, do {godzina}', { czas: czasSlownie(pozostaloMin), godzina: formatTime(koniecKroku) });
  const gotoweTekst = gotowe === null ? null : t('Gotowe {dzien} o {godzina}.', { dzien: dzienSlownie(gotowe, new Date(teraz)), godzina: formatTime(gotowe) });
  const etykieta = etykietaPlanuWypieku({ krok: sesja.stepIdx + 1, liczbaKrokow: sesja.steps.length, nazwa: nazwaKroku, pozostaloMin, gotowe, teraz: new Date(teraz) });
  return { nazwa: nazwaReceptury(sesja.recipeName), nazwaKroku, pozostaloMin, postep, czas, gotowe, gotoweTekst, etykieta };
}

function PustaSpirala() {
  return (
    <View style={styles.pusta} testID="start-pusta-spirala">
      <Spirala kroki={[]} wariant="pusta" />
      <Text style={styles.objasnienie}>{t('Tu pojawi się plan wypieku i tydzień z karmieniami, gdy coś zaczniesz.')}</Text>
    </View>
  );
}

function Jeden({ w, teraz, duzyTekst, onWroc }: { w: TrwajacyNaStarcie; teraz: number; duzyTekst: boolean; onWroc: (id: string) => void }) {
  const o = opisWypieku(w, teraz);
  const kroki = useMemo(() => krokiSpiraliZSesji(w.sesja.steps), [w.sesja.steps]);
  return (
    <View style={styles.jeden} testID="start-trwa-wypiek">
      {/* Stuknięcie w spiralę otwiera Stolnicę tego wypieku (decyzja M1 2026-10-23, wariant a) */}
      <Pressable testID="spirala-otworz" accessibilityRole="button" accessibilityLabel={t('{wypiek}: {krok}. Otwórz prowadzenie wypieku', { wypiek: o.nazwa, krok: o.nazwaKroku })} style={styles.dotyk} onPress={() => onWroc(w.id)}>
        <Spirala kroki={kroki} wariant="pelna" biezacy={w.sesja.stepIdx} postepKroku={o.postep} etykieta={o.etykieta} rozmiar={duzyTekst ? 150 : 220} />
      </Pressable>
      <Text style={styles.krok}>{o.nazwaKroku}</Text>
      {o.czas !== null && <Text style={styles.tresc}>{o.czas}</Text>}
      <Text style={styles.objasnienie}>
        {o.gotowe === null ? o.nazwa : t('{nazwa}: gotowe {dzien} o {godzina}', { nazwa: o.nazwa, dzien: dzienSlownie(o.gotowe, new Date(teraz)), godzina: formatTime(o.gotowe) })}
      </Text>
      <Pressable testID="resume-bake-btn" accessibilityRole="button" accessibilityLabel={t('Wróć do wypieku')} style={styles.glowny} onPress={() => onWroc(w.id)}>
        <Text style={styles.glownyTekst}>{t('Wróć do wypieku')}</Text>
      </Pressable>
    </View>
  );
}

/** Wzór toru w legendzie: tor 1 linią, tor 2 kropkami (ten sam kształt co na spirali). */
function WzorToru({ tor }: { tor: 1 | 2 }) {
  return (
    <Svg width={34} height={10} accessible={false}>
      <Line x1={4} y1={5} x2={30} y2={5} stroke={theme.colors.ratan} strokeWidth={tor === 1 ? 5 : 6} strokeLinecap="round" strokeDasharray={tor === 2 ? '0.1 9' : undefined} />
    </Svg>
  );
}

function Dwa({ wypieki, teraz, duzyTekst, onWroc }: { wypieki: readonly TrwajacyNaStarcie[]; teraz: number; duzyTekst: boolean; onWroc: (id: string) => void }) {
  const [a, b] = wypieki;
  const opisy = wypieki.map((w) => opisWypieku(w, teraz));
  const krokiA = useMemo(() => krokiSpiraliZSesji(a.sesja.steps), [a.sesja.steps]);
  const krokiB = useMemo(() => krokiSpiraliZSesji(b.sesja.steps), [b.sesja.steps]);
  const etykieta = opisy
    .map((o, i) =>
      o.pozostaloMin === null
        ? t('Tor {n}, {receptura}: {krok}', { n: i + 1, receptura: o.nazwa, krok: o.nazwaKroku })
        : t('Tor {n}, {receptura}: {krok}, {czas}', { n: i + 1, receptura: o.nazwa, krok: o.nazwaKroku, czas: czasSlownie(o.pozostaloMin) })
    )
    .join('. ');
  return (
    <View style={styles.dwa}>
      {!duzyTekst && (
        <View style={styles.srodek}>
          <Spirala kroki={krokiA} wariant="pelna" biezacy={a.sesja.stepIdx} postepKroku={opisy[0].postep} etykieta={etykieta} rozmiar={220}
            drugi={{ kroki: krokiB, biezacy: b.sesja.stepIdx, postepKroku: opisy[1].postep }} />
        </View>
      )}
      {wypieki.map((w, i) => {
        const o = opisy[i];
        const wroc = t('Wróć do: {nazwa}', { nazwa: o.nazwa });
        return (
          <View key={w.id} style={styles.karta} testID="start-trwa-wypiek">
            <Pressable testID="karta-otworz" accessibilityRole="button" accessibilityLabel={t('{wypiek}: {krok}. Otwórz prowadzenie wypieku', { wypiek: o.nazwa, krok: o.nazwaKroku })} style={styles.kartaGora} onPress={() => onWroc(w.id)}>
              <View style={styles.numer}><Text style={styles.numerTekst}>{String(i + 1)}</Text></View>
              <WzorToru tor={i === 0 ? 1 : 2} />
              <Text style={styles.kartaTytul}>{t('{wypiek}: {krok}', { wypiek: o.nazwa, krok: o.nazwaKroku })}</Text>
            </Pressable>
            {o.czas !== null && <Text style={[styles.tresc, styles.lewo]}>{o.czas}</Text>}
            {o.gotoweTekst !== null && <Text style={[styles.objasnienie, styles.lewo]}>{o.gotoweTekst}</Text>}
            <Pressable testID="resume-bake-btn" accessibilityRole="button" accessibilityLabel={wroc} style={styles.drugi} onPress={() => onWroc(w.id)}>
              <Text style={styles.drugiTekst}>{wroc}</Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

export function WypiekiNaSpirali({ wypieki, teraz, duzyTekst, onWroc }: {
  wypieki: readonly TrwajacyNaStarcie[];
  teraz: number;
  duzyTekst: boolean;
  onWroc: (id: string) => void;
}) {
  if (wypieki.length === 0) return <PustaSpirala />;
  if (wypieki.length === 1) return <Jeden w={wypieki[0]} teraz={teraz} duzyTekst={duzyTekst} onWroc={onWroc} />;
  return <Dwa wypieki={wypieki.slice(0, 2)} teraz={teraz} duzyTekst={duzyTekst} onWroc={onWroc} />;
}

const styles = StyleSheet.create({
  pusta: { alignItems: 'center', gap: odstepy.m, paddingVertical: odstepy.l },
  jeden: { alignItems: 'center', gap: odstepy.xs },
  srodek: { alignItems: 'center' },
  dwa: { gap: odstepy.m },
  krok: { get fontFamily() { return theme.typography.krojTytulow; }, fontSize: typografia.style.tytul2.pt, fontWeight: '700', color: theme.colors.tusz, textAlign: 'center', marginTop: odstepy.s },
  tresc: { fontSize: typografia.style.tresc.pt, color: theme.colors.tusz, textAlign: 'center' },
  objasnienie: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz2, textAlign: 'center' },
  glowny: { alignSelf: 'stretch', minHeight: theme.cele.przyciskKciuka, borderRadius: promienie.przyciskGlowny, backgroundColor: theme.colors.akcent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: odstepy.m, paddingVertical: odstepy.s, marginTop: odstepy.m },
  glownyTekst: { fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.naAkcencie, textAlign: 'center' },
  karta: { gap: odstepy.xs, padding: odstepy.l, borderRadius: promienie.grupa, backgroundColor: theme.colors.powierzchnia },
  dotyk: { alignItems: 'center', minHeight: theme.cele.pozostale },
  kartaGora: { minHeight: theme.cele.pozostale, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: odstepy.s },
  numer: { minWidth: 24, minHeight: 24, paddingHorizontal: odstepy.xs, borderRadius: promienie.przycisk, borderWidth: 2, borderColor: theme.colors.tusz, alignItems: 'center', justifyContent: 'center' },
  numerTekst: { fontSize: typografia.style.przypis.pt, fontWeight: '700', color: theme.colors.tusz },
  kartaTytul: { flexShrink: 1, flexGrow: 1, flexBasis: 140, fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.tusz },
  lewo: { textAlign: 'left' },
  drugi: { minHeight: theme.cele.pozostale, borderRadius: promienie.przycisk, borderWidth: 1.5, borderColor: theme.colors.obwodka, alignItems: 'center', justifyContent: 'center', paddingHorizontal: odstepy.m, paddingVertical: odstepy.xs, marginTop: odstepy.s },
  drugiTekst: { fontSize: typografia.style.tresc.pt, color: theme.colors.tusz, textAlign: 'center' },
});

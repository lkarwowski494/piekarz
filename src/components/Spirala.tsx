// ============================================================================
// Piekarz — Spirala koszyka, element firmowy (D-049; design-spec §2, §11b 058) [M1-audytor-generalny-058]
// react-native-svg; punkty liczone raz na plan (useMemo), kolory tylko ratan, ratanSzary, nocDane, tusz, tlo
// z useMotyw(). Spirala nie jest przyciskiem: rola obrazu i jedna etykieta z danych planu; wariant pusty
// (ekran startowy, ikona) jest ozdobą poza drzewem dostępności. Ruch po „Zrobione”: ruch.zwoj (300 ms,
// easeOut), przy „Ogranicz ruch” zmiana bez przejścia. RTL (odbicie w poziomie): otwarte (rola 05/04).
// ============================================================================

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';
import type { SessionStep } from '../core/bake-steps';
import { t } from '../lib/i18n';
import {
  czasPrzejsciaSpirali,
  krokiSpiraliZSesji,
  rysunekSpirali,
  SPIRALA_GRUBOSC,
  SPIRALA_PUSTA,
  SPIRALA_ZWOJE,
  ukladSpirali,
  ukladyTorow,
  type KolorSpirali,
  type KrokSpirali,
  type WariantSpirali,
} from '../lib/spirala-geometria';
import { etykietaPlanuWypieku } from '../lib/spirala-etykieta';
import { gotoweMs } from '../lib/gotowe';
import { useMotyw, type PaletaHex } from '../ui/motyw';
import { odstepy, typografia } from '../ui/tokeny';

const AnimowaneKolo = Animated.createAnimatedComponent(Circle);
const AnimowanaSciezka = Animated.createAnimatedComponent(Path);

/** „Ogranicz ruch” z systemu, z nasłuchem zmiany. */
function useOgraniczRuch(): boolean {
  const [ogranicz, ustaw] = useState(false);
  useEffect(() => {
    let aktywny = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => {
        if (aktywny) ustaw(v);
      })
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v: boolean) => ustaw(v));
    return () => {
      aktywny = false;
      sub.remove();
    };
  }, []);
  return ogranicz;
}

/** Rozmiar w pt: pełna 150–220 (rośnie z dużym tekstem, §2), mała 92, pusta 120. */
function useRozmiar(wariant: WariantSpirali, rozmiar?: number): number {
  const { fontScale } = useWindowDimensions();
  if (rozmiar !== undefined) return rozmiar;
  if (wariant === 'mala') return 92;
  if (wariant === 'pusta') return 120;
  return Math.min(220, Math.max(150, Math.round(150 * fontScale)));
}

export interface SpiralaProps {
  kroki: readonly KrokSpirali[];
  wariant: WariantSpirali;
  /** Indeks bieżącego kroku; null albo brak = żaden (plan przed startem). */
  biezacy?: number | null;
  /** Postęp bieżącego kroku 0–1. */
  postepKroku?: number;
  /** Etykieta VoiceOver z danych planu (src/lib/spirala-etykieta.ts); wariant pusty jej nie ma. */
  etykieta?: string;
  rozmiar?: number;
  /** Drugi trwający wypiek jako drugi tor tej samej spirali (D-105, BR-KAL-016); bez niego jeden plan. */
  drugi?: TorSpirali;
  /** Na pasie nocy (karta zakwasu, D10): kolory pasa zamiast tła ekranu. */
  naPasie?: boolean;
}

/**
 * Kolory Spirali: zwykłe z palety albo na pasie nocy (D10 opcja A; tokeny z D-105: zrobione ratanNaPasie 4,80:1,
 * przed nami i noc naPasie2, postęp i znacznik naPasie, środek znacznika pas) [M3 D10].
 */
export function kolorySpirali(paleta: PaletaHex, naPasie: boolean): Record<KolorSpirali, string> {
  if (!naPasie) return { ratan: paleta.ratan, ratanSzary: paleta.ratanSzary, nocDane: paleta.nocDane, tusz: paleta.tusz, tlo: paleta.tlo };
  return { ratan: paleta.ratanNaPasie, ratanSzary: paleta.naPasie2, nocDane: paleta.naPasie2, tusz: paleta.naPasie, tlo: paleta.pas };
}

/** Plan jednego toru: kroki, bieżący krok i postęp kroku. */
export interface TorSpirali {
  kroki: readonly KrokSpirali[];
  biezacy: number | null;
  postepKroku: number;
}

export function Spirala(props: SpiralaProps) {
  return props.drugi ? <SpiralaDwochTorow {...props} drugi={props.drugi} /> : <SpiralaJednegoPlanu {...props} />;
}

/**
 * Dwa wypieki na jednym obrazku (makieta roli 04 `dwa-tory-v2`): tor 1 linią, tor 2 kropkami (kształt, nie tylko
 * kolor), noc w lodówce w kolorze nocy, znaczniki „teraz” z numerem toru; bez ruchu przejścia (zmiana natychmiastowa).
 */
function SpiralaDwochTorow({ kroki, drugi, biezacy = null, postepKroku = 0, etykieta, rozmiar }: SpiralaProps & { drugi: TorSpirali }) {
  const { kolory } = useMotyw();
  const bok = useRozmiar('pelna', rozmiar);
  const [u1, u2] = useMemo(() => ukladyTorow(kroki, drugi.kroki), [kroki, drugi.kroki]);
  const tory = [
    rysunekSpirali(u1, kroki, { wariant: 'pelna', biezacy, postepKroku, tor: 1 }),
    rysunekSpirali(u2, drugi.kroki, { wariant: 'pelna', biezacy: drugi.biezacy, postepKroku: drugi.postepKroku, tor: 2 }),
  ];
  const dostepnosc = etykieta
    ? { accessible: true, accessibilityRole: 'image' as const, accessibilityLabel: etykieta }
    : { accessible: false, importantForAccessibility: 'no-hide-descendants' as const, accessibilityElementsHidden: true };
  return (
    <View testID="brand-spiral" style={{ width: bok, height: bok }} {...dostepnosc}>
      <Svg width={bok} height={bok} viewBox={tory[0].viewBox}>
        {tory.map((r, ti) => (
          <G key={ti}>
            {r.odcinki.map((o) => (
              <Path key={o.indeks} testID={`brand-spiral-tor-${ti + 1}-odcinek-${o.indeks}`} d={o.d} fill="none" stroke={kolory[o.kolor]}
                strokeWidth={o.grubosc} strokeLinecap="round" strokeDasharray={o.kreski ?? undefined} />
            ))}
            {r.postep && <Path d={r.postep.d} fill="none" stroke={kolory.tusz} strokeWidth={r.postep.grubosc} strokeLinecap="round" strokeDasharray={ti === 1 ? r.odcinki[0]?.kreski ?? undefined : undefined} />}
            <Circle cx={r.koniec.x} cy={r.koniec.y} r={r.koniec.r} fill={kolory.tusz} />
          </G>
        ))}
        {tory.map((r, ti) =>
          r.teraz ? (
            <G key={`teraz-${ti}`}>
              <Circle testID={`brand-spiral-teraz-${ti + 1}`} cx={r.teraz.x} cy={r.teraz.y} r={r.teraz.r} fill={kolory.tlo} stroke={kolory.tusz} strokeWidth={r.teraz.obwodka} />
              <SvgText testID={`brand-spiral-numer-${ti + 1}`} x={r.teraz.x} y={r.teraz.y + 4} fontSize={11} fontWeight="700" fill={kolory.tusz} textAnchor="middle">{String(ti + 1)}</SvgText>
            </G>
          ) : null
        )}
      </Svg>
    </View>
  );
}

function SpiralaJednegoPlanu({ kroki, wariant, biezacy = null, postepKroku = 0, etykieta, rozmiar, naPasie = false }: SpiralaProps) {
  const kolory = kolorySpirali(useMotyw().kolory, naPasie);
  const ograniczRuch = useOgraniczRuch();
  const bok = useRozmiar(wariant, rozmiar);
  const dane = wariant === 'pusta' ? SPIRALA_PUSTA : kroki;
  const uklad = useMemo(() => ukladSpirali(dane, wariant === 'zakwas' ? SPIRALA_ZWOJE.zakwas : SPIRALA_ZWOJE.plan), [dane, wariant]);
  const r = rysunekSpirali(uklad, dane, { wariant, biezacy, postepKroku });

  // Po „Zrobione”: znacznik przesuwa się z poprzedniego miejsca, zwój bieżący grubieje (ruch.zwoj)
  const przejscie = useRef(new Animated.Value(1)).current;
  const poprzedni = useRef<{ biezacy: number | null; x: number; y: number } | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const indeksBiez = wariant === 'plan' || wariant === 'pusta' ? null : biezacy;
  if (poprzedni.current && indeksBiez !== null && poprzedni.current.biezacy !== null && indeksBiez > poprzedni.current.biezacy) {
    start.current = { x: poprzedni.current.x, y: poprzedni.current.y };
  }
  useEffect(() => {
    const czas = czasPrzejsciaSpirali(ograniczRuch);
    if (start.current && czas > 0) {
      przejscie.setValue(0);
      Animated.timing(przejscie, { toValue: 1, duration: czas, easing: Easing.out(Easing.ease), useNativeDriver: false }).start();
    } else {
      przejscie.setValue(1);
    }
    start.current = null;
  }, [indeksBiez, ograniczRuch, przejscie]);
  useEffect(() => {
    poprzedni.current = r.teraz ? { biezacy: indeksBiez, x: r.teraz.x, y: r.teraz.y } : null;
  });

  const z = start.current ?? r.teraz;
  // Bez etykiety z danych (wariant pusty, zakwas bez wpisu) Spirala jest ozdobą, nie obrazem bez nazwy [M1-audytor-generalny-115]
  const dostepnosc =
    wariant === 'pusta' || !etykieta
      ? { accessible: false, importantForAccessibility: 'no-hide-descendants' as const, accessibilityElementsHidden: true }
      : { accessible: true, accessibilityRole: 'image' as const, accessibilityLabel: etykieta };

  return (
    <View testID="brand-spiral" style={{ width: bok, height: bok }} {...dostepnosc}>
      <Svg width={bok} height={bok} viewBox={r.viewBox}>
        {r.odcinki.map((o) => {
          const wspolne = { testID: `brand-spiral-odcinek-${o.indeks}`, d: o.d, fill: 'none', stroke: kolory[o.kolor], strokeLinecap: 'round' as const };
          const kreski = o.kreski ?? undefined;
          if (o.stan === 'biezacy' && start.current) {
            const w = przejscie.interpolate({ inputRange: [0, 1], outputRange: [SPIRALA_GRUBOSC.przyszly * (o.grubosc / SPIRALA_GRUBOSC.biezacy), o.grubosc] });
            return <AnimowanaSciezka key={o.indeks} {...wspolne} strokeWidth={w} strokeDasharray={kreski} />;
          }
          return <Path key={o.indeks} {...wspolne} strokeWidth={o.grubosc} strokeDasharray={kreski} />;
        })}
        {r.postep && (
          <Path testID="brand-spiral-postep" d={r.postep.d} fill="none" stroke={kolory.tusz} strokeWidth={r.postep.grubosc} strokeLinecap="round" />
        )}
        {r.teraz && z && (
          <AnimowaneKolo
            testID="brand-spiral-teraz"
            cx={przejscie.interpolate({ inputRange: [0, 1], outputRange: [z.x, r.teraz.x] })}
            cy={przejscie.interpolate({ inputRange: [0, 1], outputRange: [z.y, r.teraz.y] })}
            r={r.teraz.r}
            fill={kolory.tlo}
            stroke={kolory.tusz}
            strokeWidth={r.teraz.obwodka}
          />
        )}
        <Circle cx={r.koniec.x} cy={r.koniec.y} r={r.koniec.r} fill={kolory.tusz} />
      </Svg>
    </View>
  );
}

/** Legenda tekstem (nic tylko kolorem, §2): zrobione, przed nami, noc w lodówce, skrócone kroki. */
export function LegendaSpirali({ kroki }: { kroki: readonly KrokSpirali[] }) {
  const { kolory } = useMotyw();
  const noc = kroki.filter((k) => k.noc);
  const skroconaNoc = noc.some((k) => k.bierny && k.minuty !== null && k.minuty > 180);
  const innySkrocony = kroki.some((k) => !k.noc && k.bierny && k.minuty !== null && k.minuty > 180);
  const pozycja = (tekst: string, kolor: string, w: number, kreski?: string) => (
    <View style={styles.pozycja} key={tekst}>
      <Svg width={22} height={10}>
        <Line x1={3} y1={5} x2={19} y2={5} stroke={kolor} strokeWidth={w} strokeDasharray={kreski} strokeLinecap="round" />
      </Svg>
      <Text style={[styles.tekst, { color: kolory.tusz2 }]}>{tekst}</Text>
    </View>
  );
  return (
    <View style={styles.legenda}>
      {pozycja(t('zrobione'), kolory.ratan, 7)}
      {pozycja(t('przed nami'), kolory.ratanSzary, 3)}
      {noc.length > 0 && pozycja(skroconaNoc ? t('noc w lodówce (skrócona)') : t('noc w lodówce'), kolory.nocDane, 3, '2 5')}
      {innySkrocony && pozycja(t('długi krok (skrócony)'), kolory.ratanSzary, 3)}
    </View>
  );
}

/** Spirala trwającego wypieku z kroków sesji (prowadzenie): etykieta z danych planu tego wypieku. */
export function SpiralaWypieku({ steps, stepIdx, pozostaloSec, pelnySec, koniecKrokuMs = null }: {
  steps: readonly SessionStep[];
  stepIdx: number;
  /** Pozostały czas kroku (s); null = krok bez minutnika. */
  pozostaloSec: number | null;
  /** Pełny czas kroku (s). */
  pelnySec: number;
  /** Koniec zegara kroku (ms), także po czasie; „gotowe” jak w prowadzeniu (reaudit-noc N-4). */
  koniecKrokuMs?: number | null;
}) {
  const kroki = useMemo(() => krokiSpiraliZSesji(steps), [steps]);
  const postep = pozostaloSec !== null && pelnySec > 0 ? 1 - pozostaloSec / pelnySec : 0;
  const koniec = gotoweMs({ steps, stepIdx, koniecKrokuMs, teraz: Date.now() });
  const etykieta = etykietaPlanuWypieku({
    krok: stepIdx + 1,
    liczbaKrokow: steps.length,
    nazwa: t(steps[stepIdx]?.name ?? ''),
    pozostaloMin: pozostaloSec === null ? null : Math.ceil(pozostaloSec / 60),
    gotowe: koniec === null ? null : new Date(koniec),
    teraz: new Date(Date.now()),
  });
  return (
    <View style={styles.wypiek}>
      <Spirala kroki={kroki} wariant="pelna" biezacy={stepIdx} postepKroku={postep} etykieta={etykieta} />
      <LegendaSpirali kroki={kroki} />
    </View>
  );
}

const styles = StyleSheet.create({
  wypiek: { alignItems: 'center', gap: odstepy.s, marginBottom: odstepy.m },
  legenda: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: odstepy.m, rowGap: odstepy.xs },
  pozycja: { flexDirection: 'row', alignItems: 'center', gap: odstepy.xs },
  tekst: { fontSize: typografia.style.przypis.pt },
});

// ============================================================================
// Piekarz — karta „Program i godzina” w trybie maszyny (karty/README.md wiersz D-138): podpowiedź programu z dopiskiem
// „reguła Piekarza” (RD-39, D-179, BR-MASZ-004), jeden czas programu wstępnie z danych maszyny i do zmiany na tym
// wypieku (D-189, D-260), „Gotowe o” w Pro (D-152) albo zdanie blokady opóźnionego startu (RD-38, BR-MASZ-005),
// start programu i czas do gotowości (sposób wpisania opóźnienia w maszynie: OP-65 otwarte, więc bez polecenia
// „ustaw opóźnienie na…”), przycisk „Zapisz plan” (D-242 Z6 a; plan na później jak „Zaplanuj”: Pro) [M3 p9b2].
// ============================================================================

import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { t } from '../../lib/i18n';
import { formatTime } from '../../lib/format';
import { czasTrwania } from '../../lib/czas-trwania';
import { przesunGotowe, type CelGotowe } from '../../lib/godzina-gotowe';
import { addCalendarDays, startOfLocalDay } from '../../core/dzien-lokalny';
import { opoznionyStart, podpowiedzProgramu, startProgramu, type ProgramMaszyny, type SkladnikPsujacy } from '../../core/maszyna';
import { cechyProgramuReceptury, skladnikiMaszyny } from '../../recipes/maszyna-receptur';
import type { RecipePreset } from '../../recipes/presets-types';
import type { DoughRecipeInput } from '../../core/domain-rules';
import { useAppAccess } from '../../lib/app-access';
import { BlokadaFunkcji } from '../BlokadaFunkcji';
import { guardSave } from '../../lib/save-guard';
import { confirmLimitPlanow } from '../../lib/confirm';
import { resyncNotifications } from '../../lib/notifications';
import { zapiszPlanMaszyny } from '../../lib/plan-maszyny';
import { Karta } from '../../ui/karty/Karta';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';
import { WierszKarty } from '../../ui/karty/WierszKarty';
import { Pole } from './DaneMaszynyKarta';
import { s } from './style-receptur';
import { styles } from './style-maszyny';

/** Nazwa programu (słowa z treści roli 06) i zdanie uzasadnienia z machine.programHint. */
const PROGRAM: Record<ProgramMaszyny, { nazwa: string; zdanie: string }> = {
  ciasto: { nazwa: 'ciasto|program maszyny', zdanie: 'Program „ciasto” podpowiadamy dla wypieków kształtowanych i pieczonych w piekarniku, bo w nim maszyna przygotowuje ciasto, ale go nie piecze.' },
  slodki: { nazwa: 'słodki|program maszyny', zdanie: 'Program „słodki” podpowiadamy dla receptur słodkich, bo według opisu w instrukcji jednej z maszyn jest przeznaczony dla chlebów z dużą ilością cukru, tłuszczu i białka.' },
  pelnoziarnisty: { nazwa: 'pełnoziarnisty|program maszyny', zdanie: 'Program „pełnoziarnisty” podpowiadamy, gdy mąka pełnoziarnista i żytnia to razem co najmniej 50% mąki, jak w progu z instrukcji jednej z maszyn.' },
  francuski: { nazwa: 'francuski|program maszyny', zdanie: 'Program „francuski” podpowiadamy dla receptur bez cukru i tłuszczu, jak w opisie z instrukcji jednej z maszyn.' },
  podstawowy: { nazwa: 'podstawowy|program maszyny', zdanie: 'W pozostałych recepturach podpowiadamy program podstawowy, według opisu w instrukcji jednej z maszyn przeznaczony głównie dla jasnej mąki pszennej.' },
};
const SKLADNIK: Record<SkladnikPsujacy, string> = {
  jajka: 'jajka|składnik', mleko: 'świeże mleko|składnik', ser: 'ser|składnik', jogurt: 'jogurt|składnik', sok: 'sok|składnik', owoce: 'świeże owoce|składnik', warzywa: 'warzywa|składnik',
};

const DOBA_MIN = 24 * 60;
/** Domyślna gotowość: teraz + czas programu, w górę do pełnej albo połówkowej godziny (jak krok ±30 min planu). */
function celDomyslny(nowMs: number, czasMin: number): CelGotowe {
  const d = new Date(nowMs);
  const min = Math.ceil((d.getHours() * 60 + d.getMinutes() + czasMin) / 30) * 30;
  const w = min % DOBA_MIN;
  return { dayOffset: Math.floor(min / DOBA_MIN), hour: Math.floor(w / 60), minute: w % 60 };
}
function msCelu(c: CelGotowe, nowMs: number): number {
  const d = new Date(addCalendarDays(startOfLocalDay(nowMs), c.dayOffset));
  d.setHours(c.hour, c.minute, 0, 0);
  return d.getTime();
}
const dzien = (o: number) => (o === 0 ? t('Dziś') : o === 1 ? t('Jutro') : t('Pojutrze'));

export function ProgramMaszynyKarta({ receptura, formula, makaG, przezWersjeDrozdzowa, czasPoczatkowy }: {
  receptura: RecipePreset;
  formula: DoughRecipeInput;
  /** Mąka po granicach (RD-37); null = brak ilości (plan niemożliwy). */
  makaG: number | null;
  przezWersjeDrozdzowa: boolean;
  czasPoczatkowy: number | null;
}) {
  const router = useRouter();
  const { blokada, moze, requireActionAccess } = useAppAccess();
  const [czas, setCzas] = useState<number | null>(czasPoczatkowy);
  const [cel, setCel] = useState<CelGotowe>(() => celDomyslny(Date.now(), czasPoczatkowy ?? 0));
  const nowMs = Date.now();
  const program = podpowiedzProgramu(cechyProgramuReceptury(receptura, formula));
  const opoz = opoznionyStart(skladnikiMaszyny(receptura));
  // Program „ciasto”: 4 z 5 przeczytanych instrukcji wyłączają albo odradzają opóźniony start (MAS-085, P9B2F-1)
  const ciasto = program.ok && program.program === 'ciasto';
  const zOpoznieniem = opoz.ok && opoz.dostepny && !ciasto;
  // Bez opóźnienia (blokada, Basic) program rusza teraz; z wybraną gotowością w Pro — gotowość minus czas programu
  const start = czas === null ? null : startProgramu(zOpoznieniem && moze('plan-wstecz') ? msCelu(cel, nowMs) : nowMs + czas * 60_000, czas, nowMs);
  const mozna = makaG !== null && start !== null && start.ok;
  const zapiszPlan = () => {
    if (!mozna || makaG === null || czas === null || start === null || !start.ok) return;
    const startMs = start.startMs;
    requireActionAccess('plany-przyszle', () =>
      void guardSave(async () => {
        const r = await zapiszPlanMaszyny({ recipeId: receptura.id, recipeName: receptura.namePl, formula, makaG, przezWersjeDrozdzowa, startMs, czasProgramuMin: czas, nowMs: Date.now() });
        if (!r.ok) return confirmLimitPlanow(() => router.navigate('/'));
        void resyncNotifications();
        router.navigate('/');
      })()
    );
  };
  return (
    <Karta testID="karta-program" tytul={t('Program i godzina')} ikona={<IkonaKarty nazwa="zegar" />} bezWypelnienia>
      {program.ok ? (
        <>
          <WierszKarty testID="maszyna-program" etykieta={t('Program')} wartosc={t(PROGRAM[program.program].nazwa)} />
          <View style={styles.wnetrze}>
            <Text style={styles.zdanie}>{t(PROGRAM[program.program].zdanie)}</Text>
            <Text style={styles.zdanie}>{t('Podpowiedź programu to reguła Piekarza, nie zalecenie producenta, więc sprawdź ją w instrukcji swojej maszyny.')}</Text>
          </View>
        </>
      ) : (
        <Text style={[styles.zdanie, styles.wnetrze]}>{t('Uzupełnij mąki w recepturze, żeby zobaczyć podpowiedź programu.')}</Text>
      )}
      <Pole id="maszyna-czas" etykieta={t('Czas programu')} jednostka="min" wartosc={czas} onChange={setCzas} />
      <View style={styles.wnetrze}>
        {czas === null && <Text style={styles.zdanie}>{t('Wpisz czas programu z instrukcji maszyny.')}</Text>}
        {!zOpoznieniem && opoz.ok && !opoz.dostepny && (
          <View testID="maszyna-opoznienie-blokada">
            <Text style={styles.zdanie}>{t('Opóźniony start jest wyłączony, bo receptura ma jajka, świeże mleko, ser, jogurt, sok, świeże owoce albo warzywa.')}</Text>
            <Text style={styles.zdanie}>{t('W tej recepturze: {skladniki}.', { skladniki: opoz.psujace.map((p) => t(SKLADNIK[p])).join(', ') })}</Text>
            <Text style={styles.zdanie}>{t('Każda z przeczytanych instrukcji maszyn zabrania opóźnionego startu z częścią tych składników, bo łatwo się psują.')}</Text>
            <Text style={styles.zdanie}>{t('Według jednej z instrukcji mleko w proszku zamiast świeżego mleka pozwala użyć opóźnionego startu, więc Piekarz go nie blokuje.')}</Text>
          </View>
        )}
        {opoz.ok && opoz.dostepny && ciasto && (
          <Text testID="maszyna-opoznienie-ciasto" style={styles.zdanie}>
            {t('Według czterech z pięciu przeczytanych instrukcji opóźniony start nie działa albo nie jest zalecany w programie samego ciasta, więc Piekarz go nie proponuje.')}
          </Text>
        )}
        {zOpoznieniem && (
          <BlokadaFunkcji {...blokada('plan-wstecz')}>
            <View testID="maszyna-gotowe">
              <Text style={s.etykieta}>{t('Gotowe o')}</Text>
              <Text style={s.liczba}>{`${dzien(cel.dayOffset)} ${formatTime(msCelu(cel, nowMs))}`}</Text>
              <View style={styles.rzad}>
                {([[-30, t('{n} min', { n: -30 })], [30, t('{n} min', { n: '+30' })], [120, t('{n} godziny', { n: '+2' })]] as const).map(([dm, et]) => {
                  const nowy = przesunGotowe(cel, dm, 2);
                  return (
                    <Pressable key={dm} accessibilityRole="button" accessibilityState={{ disabled: !nowy }} disabled={!nowy} onPress={() => nowy && setCel(nowy)} style={styles.drugi}>
                      <Text style={styles.drugiTekst}>{et}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </BlokadaFunkcji>
        )}
        {start !== null && start.ok && (
          <View testID="maszyna-start">
            <Text style={styles.zdanie}>{t('Program rusza o {godzina}.', { godzina: formatTime(start.startMs) })}</Text>
            <Text style={styles.zdanie}>{t('Od teraz do gotowości: {czas}.', { czas: czasTrwania(start.doGotowosciMin).tekst })}</Text>
          </View>
        )}
        {start !== null && !start.ok && start.blad === 'za-wczesnie' && (
          <Text testID="maszyna-za-wczesnie" style={styles.zdanie}>{t('Program nie zdąży. Najwcześniej gotowe o {godzina}.', { godzina: formatTime(start.najwczesniejGotoweMs) })}</Text>
        )}
        <Pressable testID="maszyna-zapisz-plan" accessibilityRole="button" accessibilityState={{ disabled: !mozna }} disabled={!mozna} onPress={zapiszPlan} style={[styles.glowny, !mozna && styles.glownyZablokowany]}>
          <Text style={[styles.glownyTekst, !mozna && styles.tekstZablokowany]}>{t('Zapisz plan')}</Text>
        </Pressable>
      </View>
    </Karta>
  );
}

// ============================================================================
// Piekarz — karta zakwasu: Spirala jednego cyklu dokarmienia, „Podwoił objętość”, „Zapisz dokarmienie”,
// „Coś mnie niepokoi” (design-spec §2 wariant zakwasu, §5, §6 stan `karta`; makieta ekrany/zakwas.html)
// [M1-audytor-generalny-104]. Stan z czystej funkcji stanKartyZakwasu; plan z lodówki: FridgeWakeStatus.
// ============================================================================

import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Spirala } from '../Spirala';
import { t } from '../../lib/i18n';
import { appLocale, formatDate, formatTime } from '../../lib/format';
import { czasSlownie, etykietaZakwasu } from '../../lib/spirala-etykieta';
import { krokiSpiraliZakwasu } from '../../lib/spirala-geometria';
import type { StanKartyZakwasu } from '../../lib/zakwas-widok';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';

export function StarterCycleCard({ stan, opisMiejsca, onPodwoil, onDokarm, onNiepokoi, children }: {
  stan: StanKartyZakwasu;
  /** „na blacie, 1:2:2” (dane zakwasu). */
  opisMiejsca: string;
  onPodwoil: () => void;
  onDokarm: () => void;
  onNiepokoi: () => void;
  /** Wynik pod przyciskiem (gotowy, plan z lodówki). */
  children?: React.ReactNode;
}) {
  const kroki = useMemo(() => krokiSpiraliZakwasu(stan.odstepMin), [stan.odstepMin]);
  // Bez wpisu „Podwoił objętość” nieaktywny: stan i wygląd z §6 (obwódka, tekst `zablokowane`) [M1-audytor-generalny-115]
  const nieaktywny = stan.dokarmionoAt === null;
  return (
    <View testID="zakwas-karta" style={styles.karta}>
      <View style={styles.cykl}>
        <Spirala
          kroki={kroki}
          wariant="zakwas"
          biezacy={0}
          postepKroku={stan.postep}
          rozmiar={140}
          etykieta={stan.mineloMin === null ? undefined : etykietaZakwasu({ mineloMin: stan.mineloMin, odstepMin: stan.odstepMin })}
        />
        <View style={styles.opis}>
          {stan.mineloMin === null || stan.dokarmionoAt === null || stan.nastepneAt === null ? (
            <Text style={styles.pusty}>{t('Nie ma jeszcze wpisu dokarmienia. Zapisz dokarmienie, gdy dokarmisz zakwas.')}</Text>
          ) : (
            <>
              <Text style={styles.minelo}>{t('{czas} od dokarmienia', { czas: czasSlownie(stan.mineloMin) })}</Text>
              {/* Odstęp dłuższy niż doba (lodówka, 7 dni): sama godzina następnego karmienia byłaby myląca [M1-audytor-generalny-188] */}
              {stan.odstepMin <= 24 * 60 ? (
                <Text style={styles.drugi}>
                  {t('dokarmiony o {godzina}, następne o {nastepne}', { godzina: formatTime(stan.dokarmionoAt), nastepne: formatTime(stan.nastepneAt) })}
                </Text>
              ) : (
                // Lodówka: dzień i godzina następnego dokarmienia (ten sam termin co powiadomienie) [M2-koordynator-napraw-503 (p11)]
                <Text testID="zakwas-nastepne-data" style={styles.drugi}>
                  {t('następne dokarmienie {data} o {godzina}', {
                    data: formatDate(stan.nastepneAt, appLocale(), { day: 'numeric', month: 'long' }),
                    godzina: formatTime(stan.nastepneAt),
                  })}
                </Text>
              )}
            </>
          )}
          <Text style={styles.drugi}>{opisMiejsca}</Text>
        </View>
      </View>
      <Pressable
        testID="zakwas-podwoil-btn"
        accessibilityRole="button"
        accessibilityState={{ disabled: nieaktywny }}
        style={[styles.glowny, nieaktywny && styles.glownyNieaktywny]}
        onPress={onPodwoil}
        disabled={nieaktywny}
      >
        <Text style={[styles.glownyTekst, nieaktywny && styles.glownyTekstNieaktywny]}>{t('Podwoił objętość')}</Text>
      </Pressable>
      <Text style={styles.przypis}>
        {t('Zaznacz, gdy zakwas urośnie dwa razy od kreski na słoiku. Wtedy jest gotowy do ciasta (według King Arthur Baking).')}
      </Text>
      {children}
      <View style={styles.rzad}>
        <Pressable testID="zakwas-dokarm-btn" accessibilityRole="button" style={styles.drugiPrzycisk} onPress={onDokarm}>
          <Text style={styles.drugiTekst}>{t('Zapisz dokarmienie')}</Text>
        </Pressable>
        <Pressable testID="zakwas-niepokoi-btn" accessibilityRole="button" style={styles.drugiPrzycisk} onPress={onNiepokoi}>
          <Text style={styles.drugiTekst}>{t('Coś mnie niepokoi')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  karta: {
    gap: odstepy.m,
    padding: odstepy.l,
    marginBottom: odstepy.l,
    borderRadius: promienie.grupa,
    backgroundColor: theme.colors.powierzchnia,
  },
  cykl: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: odstepy.l },
  opis: { flex: 1, flexBasis: 150, minWidth: 0, gap: odstepy.xs },
  minelo: { fontSize: typografia.style.tytul2.pt, fontWeight: '700', color: theme.colors.tusz },
  pusty: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz2 },
  drugi: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz2 },
  glowny: {
    minHeight: theme.cele.glownyPrzeplyw,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: odstepy.l,
    borderRadius: promienie.przyciskGlowny,
    backgroundColor: theme.colors.akcent,
  },
  glownyNieaktywny: { backgroundColor: theme.colors.powierzchnia, borderWidth: 1.5, borderColor: theme.colors.obwodka },
  glownyTekst: { fontSize: typografia.style.naglowek.pt, fontWeight: '700', color: theme.colors.naAkcencie, textAlign: 'center' },
  glownyTekstNieaktywny: { color: theme.colors.zablokowane },
  przypis: { fontSize: typografia.style.przypis.pt, color: theme.colors.tusz2 },
  rzad: { flexDirection: 'row', flexWrap: 'wrap', gap: odstepy.s },
  drugiPrzycisk: {
    flexGrow: 1,
    flexBasis: 140,
    minHeight: theme.cele.glownyPrzeplyw,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: odstepy.m,
    borderRadius: promienie.przycisk,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  drugiTekst: { fontSize: typografia.style.objasnienie.pt, fontWeight: '600', color: theme.colors.akcentTekst, textAlign: 'center' },
});

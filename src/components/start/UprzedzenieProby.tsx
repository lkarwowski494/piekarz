// ============================================================================
// Piekarz — baner „Okres próbny kończy się {data}” na „Dziś” (design-spec §11d 126, wybór P-126 a)
// [M1-audytor-generalny-126; 02-monetyzacja-502]. Ten sam baner co „tylko historia”: bez okna, bez przyciemnienia,
// bez powiadomienia; raz dla daty końca (data pokazania w app_settings), znika po „Zamknij” albo w tle.
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../lib/i18n';
import { appLocale, formatDate } from '../../lib/format';
import { getAppSetting, setAppSetting } from '../../data/settings-store';
import { pobierzStan, subskrybujStan } from '../../lib/platnosci/stan';
import { pobierzOferte, zarzadzajSubskrypcja } from '../../lib/platnosci/sklep';
import { KLUCZ_UPRZEDZENIA, wariantUprzedzenia, type Wariant } from '../../lib/platnosci/uprzedzenie';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';

async function ceny(): Promise<{ yearly: string; monthly: string } | null> {
  try {
    const oferta = await pobierzOferte();
    const rok = oferta.find((o) => o.plan === 'yearly')?.cena;
    const mies = oferta.find((o) => o.plan === 'monthly')?.cena;
    return rok && mies ? { yearly: rok, monthly: mies } : null;
  } catch {
    return null; // bez sieci: wariant bez kwoty
  }
}

/** Wariant do pokazania w tym uruchomieniu; zapis daty pokazania przy pierwszym wyświetleniu. */
export function useUprzedzenieProby(): { wariant: Wariant | null; zamknij: () => void } {
  const [wariant, setWariant] = useState<Wariant | null>(null);
  const sprawdzone = useRef<number | null>(null);

  useEffect(() => {
    let alive = true;
    const sprawdz = async () => {
      const uprawnienia = pobierzStan().uprawnienia ?? null;
      const zapis = Number(await getAppSetting(KLUCZ_UPRZEDZENIA));
      const pokazanoDla = Number.isFinite(zapis) && zapis > 0 ? zapis : null;
      const wstepny = wariantUprzedzenia({ uprawnienia, pokazanoDla, teraz: Date.now(), ceny: null });
      if (!wstepny || sprawdzone.current === wstepny.koniec) return;
      sprawdzone.current = wstepny.koniec;
      const w = wariantUprzedzenia({ uprawnienia, pokazanoDla, teraz: Date.now(), ceny: await ceny() }) ?? wstepny;
      if (!alive) return;
      setWariant(w);
      // Raz dla tej daty końca; nieudany zapis pokaże baner jeszcze raz przy następnym starcie (mniejsza szkoda niż brak)
      await setAppSetting(KLUCZ_UPRZEDZENIA, String(w.koniec)).catch(() => undefined);
    };
    void sprawdz();
    const odpis = subskrybujStan(() => void sprawdz());
    const tlo = AppState.addEventListener('change', (s) => {
      if (s === 'background') setWariant(null);
    });
    return () => {
      alive = false;
      odpis();
      tlo.remove();
    };
  }, []);

  return { wariant, zamknij: () => setWariant(null) };
}

/** Zdanie o opłacie (tabela wariantów §11d 126); dosłowne t() dla skanu słownika (check:i18n). */
function zdanieOplaty(w: Wariant): string {
  const cena = w.cena ?? '';
  switch (w.zdanie) {
    case 'rok':
      return t('Wtedy App Store pobierze {cena} za rok subskrypcji. Jeśli nie chcesz płacić, anuluj subskrypcję przed końcem próby.', { cena });
    case 'miesiac':
      return t('Wtedy App Store pobierze {cena} za miesiąc subskrypcji. Jeśli nie chcesz płacić, anuluj subskrypcję przed końcem próby.', { cena });
    case 'nie-odnowi':
      return t('Subskrypcja się nie odnowi, więc nic nie zapłacisz.');
    default:
      return t('Jeśli subskrypcja nie jest anulowana, App Store pobierze wtedy opłatę za wybrany plan.');
  }
}

export function UprzedzenieProby({ wariant, onZamknij }: { wariant: Wariant; onZamknij: () => void }) {
  const data = formatDate(wariant.koniec, appLocale(), { day: 'numeric', month: 'long' });
  return (
    <View style={styles.baner} testID="start-uprzedzenie-proby">
      <Text style={styles.tytul} accessibilityRole="header">
        {t('Okres próbny kończy się {data}', { data })}
      </Text>
      <Text style={styles.tekst}>{zdanieOplaty(wariant)}</Text>
      {wariant.bezZakupu && (
        <Text style={styles.tekst}>{t('Bez zakupu zostaną historia i twoje dane. Liczenie, plan i prowadzenie będą wymagać Piekarz Pro.')}</Text>
      )}
      <Pressable testID="trial-notice-manage-btn" accessibilityRole="button" style={styles.drugi} onPress={() => void zarzadzajSubskrypcja()}>
        <Text style={styles.drugiTekst}>{t('Zarządzaj subskrypcją')}</Text>
      </Pressable>
      <Pressable
        testID="trial-notice-close-btn"
        accessibilityRole="button"
        accessibilityLabel={t('Zamknij informację o końcu próby')}
        style={styles.drugi}
        onPress={onZamknij}
      >
        <Text style={styles.drugiTekst}>{t('Zamknij')}</Text>
      </Pressable>
    </View>
  );
}

// Jak baner „tylko historia” na „Dziś” (design-spec §11d 126: ten sam element, bez cienia)
const styles = StyleSheet.create({
  baner: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: promienie.grupa,
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
    padding: odstepy.l,
    gap: odstepy.s,
  },
  tytul: { fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.tusz, get fontFamily() { return theme.typography.krojTytulow; } },
  tekst: { fontSize: typografia.style.tresc.pt, color: theme.colors.tusz },
  drugi: {
    minHeight: theme.cele.glownyPrzeplyw,
    borderRadius: promienie.przycisk,
    borderWidth: 1.5,
    borderColor: theme.colors.obwodka,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: odstepy.m,
  },
  drugiTekst: { fontSize: typografia.style.objasnienie.pt, color: theme.colors.tusz },
});

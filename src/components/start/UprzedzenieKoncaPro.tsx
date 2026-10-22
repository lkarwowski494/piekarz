// ============================================================================
// Piekarz — baner o końcu Piekarz Pro na „Dziś” (D-113 pkt 3, kontrakt docs/monetyzacja.md „Wygaśnięcie Pro”, D-116;
// wcześniej uprzedzenie o końcu próby, design-spec §11d 126). Dwa warianty, każdy raz: 3 dni przed końcem subskrypcji,
// która się nie odnowi (data pokazania w app_settings), i po wygaśnięciu (znacznik ze stan.ts). Bez okna, bez
// przyciemnienia, bez powiadomienia, bez odliczania i bez ekranu Pro; znika po „Zamknij” albo w tle.
// Wygląd jak dawny baner (§11d 126); teksty do akceptacji roli 04 (P-b, D-117).
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../lib/i18n';
import { appLocale, formatDate } from '../../lib/format';
import { getAppSetting, setAppSetting } from '../../data/settings-store';
import { pobierzStan, subskrybujStan } from '../../lib/platnosci/stan';
import { zarzadzajSubskrypcja } from '../../lib/platnosci/sklep';
import { KLUCZ_KONCA_PRO, KLUCZ_UPRZEDZENIA, uprzedzenieKoncaPro } from '../../lib/platnosci/uprzedzenie';
import { theme } from '../../ui/theme';
import { odstepy, promienie, typografia } from '../../ui/tokeny';

export type WariantKoncaPro = { rodzaj: 'przed'; koniec: number } | { rodzaj: 'wygaslo' };

/** Wariant do pokazania w tym uruchomieniu; zapis „pokazano” przy pierwszym wyświetleniu (raz). */
export function useUprzedzenieKoncaPro(): { wariant: WariantKoncaPro | null; zamknij: () => void } {
  const [wariant, setWariant] = useState<WariantKoncaPro | null>(null);
  const sprawdzone = useRef<string | null>(null);

  useEffect(() => {
    let alive = true;
    const sprawdz = async () => {
      // Po wygaśnięciu: komunikat raz; nieudany zapis pokaże go jeszcze raz (mniejsza szkoda niż brak)
      if ((await getAppSetting(KLUCZ_KONCA_PRO).catch(() => null)) === '1') {
        if (!alive || sprawdzone.current === 'wygaslo') return;
        sprawdzone.current = 'wygaslo';
        setWariant({ rodzaj: 'wygaslo' });
        await setAppSetting(KLUCZ_KONCA_PRO, '').catch(() => undefined);
        return;
      }
      const zapis = Number(await getAppSetting(KLUCZ_UPRZEDZENIA).catch(() => null));
      const pokazanoDla = Number.isFinite(zapis) && zapis > 0 ? zapis : null;
      const u = uprzedzenieKoncaPro({ uprawnienia: pobierzStan().uprawnienia ?? null, pokazanoDla, teraz: Date.now() });
      if (!u || !alive || sprawdzone.current === String(u.koniec)) return;
      sprawdzone.current = String(u.koniec);
      setWariant({ rodzaj: 'przed', koniec: u.koniec });
      await setAppSetting(KLUCZ_UPRZEDZENIA, String(u.koniec)).catch(() => undefined);
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

export function UprzedzenieKoncaPro({ wariant, onZamknij }: { wariant: WariantKoncaPro; onZamknij: () => void }) {
  const przed = wariant.rodzaj === 'przed';
  return (
    <View style={styles.baner} testID={przed ? 'start-uprzedzenie-konca-pro' : 'start-koniec-pro'}>
      <Text style={styles.tytul} accessibilityRole="header">
        {wariant.rodzaj === 'przed'
          ? t('Piekarz Pro kończy się {data}', { data: formatDate(wariant.koniec, appLocale(), { day: 'numeric', month: 'long' }) })
          : t('Piekarz Pro nie jest aktywny')}
      </Text>
      <Text style={styles.tekst}>
        {przed
          ? t('Subskrypcja się nie odnowi. Potem przypomnienia o dokarmianiu wyłączą się, a Twoje receptury, zakwasy i dziennik zostaną.')
          : t('Przypomnienia o dokarmianiu wyłączyły się. Twoje receptury, zakwasy i dziennik zostają.')}
      </Text>
      {przed && (
        <Pressable testID="koniec-pro-manage-btn" accessibilityRole="button" style={styles.drugi} onPress={() => void zarzadzajSubskrypcja()}>
          <Text style={styles.drugiTekst}>{t('Zarządzaj subskrypcją')}</Text>
        </Pressable>
      )}
      <Pressable
        testID="koniec-pro-close-btn"
        accessibilityRole="button"
        accessibilityLabel={t('Zamknij informację o Piekarz Pro')}
        style={styles.drugi}
        onPress={onZamknij}
      >
        <Text style={styles.drugiTekst}>{t('Zamknij')}</Text>
      </Pressable>
    </View>
  );
}

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

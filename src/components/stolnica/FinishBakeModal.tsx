// ============================================================================
// Apps4Craft Studio — FinishBakeModal Component
// Modal for evaluation, sensory radar scoring, and finishing a bake.
// 100% Offline-First.
// ============================================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native';
import { theme } from '../../ui/theme';
import { t } from '../../lib/i18n';
import { ArkuszKart } from '../arkusz/ArkuszKart';
import { useZmienionyFormularz } from '../arkusz/useZmienionyFormularz';
import { Karta } from '../../ui/karty/Karta';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';
import {
  SensoryRadarChart,
  BreadSensoryProfile,
} from '../SensoryRadarChart';

import { odstepy, promienie, typografia } from '../../ui/tokeny';
export interface FinishBakeModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  rating: number;
  onRatingChange: (rating: number) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  crumbScore: number;
  onCrumbScoreChange: (score: number) => void;
  crustScore: number;
  onCrustScoreChange: (score: number) => void;
  tasteProfile: 'mild' | 'balanced' | 'sour' | 'tangy';
  onTasteProfileChange: (profile: 'mild' | 'balanced' | 'sour' | 'tangy') => void;
  sensoryProfile: BreadSensoryProfile;
  onSensoryProfileChange: (profile: BreadSensoryProfile) => void;
}

export function FinishBakeModal({
  visible,
  onClose,
  onSave,
  rating,
  onRatingChange,
  notes,
  onNotesChange,
  crumbScore,
  onCrumbScoreChange,
  crustScore,
  onCrustScoreChange,
  tasteProfile,
  onTasteProfileChange,
  sensoryProfile,
  onSensoryProfileChange,
}: FinishBakeModalProps) {
  // „Anuluj” i przesunięcie w dół po zmianie oceny pytają „Odrzucić zmiany?” (04-007) [M3 p7]
  const zmieniony = useZmienionyFormularz(visible, [rating, notes, crumbScore, crustScore, tasteProfile, sensoryProfile]);
  const ocena = (id: 'crumb' | 'crust', wartosc: number, onZmiana: (n: number) => void) => (
    <View style={styles.scoreRow}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: wartosc === s }}
          key={s}
          testID={`${id}-score-${s}`}
          style={[styles.scoreBtn, wartosc === s && styles.scoreBtnActive]}
          onPress={() => onZmiana(s)}
        >
          <Text style={[styles.scoreBtnText, wartosc === s && styles.scoreBtnTextActive]}>{s}</Text>
        </Pressable>
      ))}
    </View>
  );
  // Arkusz na kartach: „Anuluj” i „Zapisz” w pasku arkusza (poza przewijaniem, osiągalne przy 320 pt i AX5),
  // sekcje oceny w kartach (README §1, §3) [M3 p7, 04-002]
  return (
    <ArkuszKart visible={visible} onRequestClose={onClose} zmieniony={zmieniony} lewy={{ tekst: t('Anuluj'), onPress: onClose }} prawy={{ tekst: t('Zapisz'), onPress: onSave }}>
        <Karta testID="karta-oceny" tytul={t('Ocena wypieku')} ikona={<IkonaKarty nazwa="gwiazda" />}>
          {/* Pytanie arkusza w przewijanej treści, w karcie oceny (nagłówek karty: „Ocena wypieku”) */}
          <View style={styles.grupa}>
            <Text style={styles.pytanie}>{t('Jak wyszedł bochenek?')}</Text>
            <Text style={styles.podpis}>{t('Oceń bochenek i zapisz notatki do historii piekarskiej')}</Text>
          </View>
          {/* Star Rating */}
          <View style={styles.grupa}>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Oceń na {n} z 5', { n: star })}
                  accessibilityState={{ selected: rating === star }}
                  key={star}
                  style={styles.starBtn}
                  testID={`finish-rating-star-${star}`}
                  onPress={() => onRatingChange(star)}
                >
                  <Text style={[styles.starIcon, rating >= star && styles.starIconActive]}>
                    ★
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.grupa}>
            <Text style={styles.modalSectionLabel}>{t('Notatki z wypieku')}</Text>
            <TextInput
              accessibilityLabel={t('Notatki z wypieku')}
              style={styles.modalInput}
              placeholder={t('Wpisz swoje uwagi (miękisz, skórka, czas pieca)...')}
              placeholderTextColor={theme.colors.tusz3}
              value={notes}
              onChangeText={onNotesChange}
              multiline
              numberOfLines={3}
            />
          </View>
        </Karta>

        {/* Crumb Score */}
        <Karta testID="karta-miekisz" tytul={`${t('Struktura miękiszu')} (1–5)`} ikona={<IkonaKarty nazwa="bochenek" />}>
          {ocena('crumb', crumbScore, onCrumbScoreChange)}
          <Text style={styles.scoreHint}>
            {/* podpis oceny bez porady i wykrzyknika; porada należy do Doktora Chleba (§11c 116) [M1-audytor-generalny-116] */}
            {crumbScore <= 2 ? t('Zbity, gęsty miękisz.') : crumbScore >= 5 ? t('Bardzo otwarty miękisz.') : t('Równomierny miękisz.')}
          </Text>
        </Karta>

        {/* Crust Score */}
        <Karta testID="karta-skorka" tytul={`${t('Jakość skórki')} (1–5)`} ikona={<IkonaKarty nazwa="termometr" />}>
          {ocena('crust', crustScore, onCrustScoreChange)}
          <Text style={styles.scoreHint}>
            {crustScore <= 2 ? t('Blada, miękka skórka — zwiększ parę lub temperaturę') : crustScore >= 5 ? t('Perfekcyjna chrupiąca skórka z pęcherzykami') : t('Dobra skórka z lekkim połyskiem')}
          </Text>
        </Karta>

        {/* Taste Profile */}
        <Karta testID="karta-smak" tytul={t('Profil smakowy')} ikona={<IkonaKarty nazwa="miska" />}>
          <View style={styles.tasteRow}>
            {(['mild', 'balanced', 'sour', 'tangy'] as const).map((profile) => {
              const labels: Record<string, string> = {
                mild: t('Łagodny'),
                balanced: t('Zbalansowany'),
                sour: t('Kwaśny'),
                tangy: t('Bardzo kwaśny'),
              };
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: tasteProfile === profile }}
                  key={profile}
                  testID={`taste-${profile}`}
                  style={[styles.tasteChip, tasteProfile === profile && styles.tasteChipActive]}
                  onPress={() => onTasteProfileChange(profile)}
                >
                  <Text style={[styles.tasteChipText, tasteProfile === profile && styles.tasteChipTextActive]}>
                    {labels[profile]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Karta>

        {/* Sensory Radar Profile (5 Osi Rzemieślniczych) */}
        <Karta testID="karta-radar" tytul={t('Wektorowy radar sensoryczny')} ikona={<IkonaKarty nazwa="proporcje" />}>
          <View style={styles.modalRadarBox}>
            <SensoryRadarChart
              profile={sensoryProfile}
              size={190}
              showLabels={true}
              interactive={true}
              onChangeProfile={onSensoryProfileChange}
              testID="finish-sensory-radar"
            />
          </View>
        </Karta>
    </ArkuszKart>
  );
}

// Wartości z tokenów (README §2): odstępy, promienie przycisku i pola, typografia (koniec literałów 20/14/11 pt)
const styles = StyleSheet.create({
  grupa: { gap: odstepy.xs },
  pytanie: { fontSize: typografia.style.naglowek.pt, fontWeight: '600', color: theme.colors.tusz },
  podpis: { fontSize: typografia.style.przypis.pt, color: theme.colors.tusz2 },
  modalSectionLabel: {
    fontSize: typografia.style.podpis.pt,
    fontWeight: '700',
    color: theme.colors.tusz3,
  },
  starRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: odstepy.s,
  },
  starBtn: {
    minHeight: theme.cele.glownyPrzeplyw,
    minWidth: theme.cele.glownyPrzeplyw,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: typografia.style.tytulKroku.pt,
    color: theme.colors.tusz3,
  },
  starIconActive: {
    color: theme.colors.akcentTekst,
  },
  modalInput: {
    backgroundColor: theme.colors.tlo,
    borderRadius: promienie.pole,
    padding: odstepy.m,
    fontSize: typografia.style.tresc.pt,
    color: theme.colors.tusz,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    minHeight: 65,
    textAlignVertical: 'top',
  },
  scoreRow: {
    flexDirection: 'row',
    gap: odstepy.s,
  },
  scoreBtn: {
    minHeight: theme.cele.glownyPrzeplyw,
    justifyContent: 'center',
    flex: 1,
    paddingVertical: odstepy.s,
    borderRadius: promienie.przycisk,
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    alignItems: 'center',
  },
  scoreBtnActive: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  scoreBtnText: {
    fontSize: typografia.style.objasnienie.pt,
    fontWeight: '700',
    color: theme.colors.tusz2,
  },
  scoreBtnTextActive: {
    color: theme.colors.naAkcencie,
  },
  scoreHint: {
    fontSize: typografia.style.przypis.pt,
    color: theme.colors.tusz2,
  },
  tasteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: odstepy.s,
  },
  tasteChip: {
    minHeight: theme.cele.glownyPrzeplyw,
    justifyContent: 'center',
    paddingHorizontal: odstepy.m,
    paddingVertical: odstepy.xs,
    borderRadius: promienie.przycisk,
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  tasteChipActive: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  tasteChipText: {
    fontSize: typografia.style.objasnienie.pt,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  tasteChipTextActive: {
    color: theme.colors.naAkcencie,
    fontWeight: '700',
  },
  modalRadarBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

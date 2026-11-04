// Style arkusza konwertera zakwasu (wydzielone z StarterConverterModal.tsx: limit 20 480 B, M3 p7)
import { StyleSheet } from 'react-native';
import { theme } from '../ui/theme';
import { odstepy, typografia } from '../ui/tokeny';

export const styles = StyleSheet.create({
  // Sekcja trybu: karta danych i karta wyniku z odstępem 12 (README §2) [M3 p7]
  sekcja: { gap: odstepy.m },
  tabRow: {
    flexDirection: 'row',
    gap: odstepy.s,
  },
  tabButton: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  tabButtonText: {
    fontSize: typografia.style.podpis.pt,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  tabButtonTextActive: {
    color: theme.colors.naAkcencie,
    fontWeight: '800',
  },
  sectionLabel: {
    fontSize: typografia.style.przypis.pt,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginTop: odstepy.xs,
    marginBottom: odstepy.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  chip: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  chipActive: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  chipText: {
    fontSize: typografia.style.podpis.pt,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  chipTextActive: {
    color: theme.colors.naAkcencie,
    fontWeight: '700',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  presetChip: {
    minHeight: theme.cele.pozostale,
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.powierzchnia,
    borderWidth: 1,
    borderColor: theme.colors.obwodka,
  },
  presetChipActive: {
    backgroundColor: theme.colors.akcent,
    borderColor: theme.colors.akcent,
  },
  presetChipText: {
    fontSize: typografia.style.podpis.pt,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  presetChipTextActive: {
    color: theme.colors.naAkcencie,
    fontWeight: '700',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.linia,
  },
  metricLabel: {
    fontSize: typografia.style.podpis.pt,
    color: theme.colors.tusz2,
  },
  metricValue: {
    fontSize: typografia.style.przypis.pt,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  metricValueHighlight: {
    fontSize: typografia.style.objasnienie.pt,
    fontWeight: '800',
    color: theme.colors.akcentTekst,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: theme.radius.sm,
  },
  badgeAdd: {
    backgroundColor: theme.colors.tloGrupa,
  },
  badgeReduce: {
    backgroundColor: theme.colors.tloGrupa,
  },
  badgeNeutral: {
    backgroundColor: theme.colors.tloGrupa,
  },
  badgeText: {
    fontSize: typografia.style.podpis.pt,
    fontWeight: '700',
    color: theme.colors.tusz,
  },
  adviceText: {
    fontSize: typografia.style.podpis.pt,
    color: theme.colors.tusz2,
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 16,
  },
});

// Style arkusza konwertera zakwasu (wydzielone z StarterConverterModal.tsx: limit 20 480 B, M3 p7)
import { StyleSheet } from 'react-native';
import { theme } from '../ui/theme';
import { typografia } from '../ui/tokeny';

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.tlo,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  modalTitle: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.tusz,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: typografia.style.podpis.pt,
    color: theme.colors.tusz2,
    marginBottom: 14,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
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
  scrollArea: {
    maxHeight: 400,
  },
  sectionLabel: {
    fontSize: typografia.style.przypis.pt,
    fontWeight: '700',
    color: theme.colors.tusz,
    marginTop: 10,
    marginBottom: 6,
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
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.tusz2,
  },
  presetChipTextActive: {
    color: theme.colors.naAkcencie,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: theme.colors.powierzchnia,
    borderRadius: theme.radius.md,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: theme.colors.linia,
  },
  resultCardTitle: {
    get fontFamily() { return theme.typography.krojTytulow; },
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.tusz,
    marginBottom: 8,
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
  closeButton: {
    backgroundColor: theme.colors.akcent,
    borderRadius: theme.radius.md,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  closeButtonText: {
    color: theme.colors.naAkcencie,
    fontWeight: '700',
    fontSize: 14,
  },
});

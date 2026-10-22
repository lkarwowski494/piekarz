// ============================================================================
// Piekarz — „Zrobione” i „Pomiń” przy zaległym z „Dziś” (BR-KAL-003, BR-KAL-007; D-094, D-106) [M3 D4b]
// Cienka warstwa nad istniejącymi ścieżkami zapisu, bez nowego modelu danych:
// - karmienie „Zrobione”: wpis dokarmienia teraz przez addStarterEntry (ten sam zapis co dziennik zakwasu), cofnięcie
//   przez deleteStarterEntry (pasek „Przywróć”, jak usunięcie wpisu na karcie zakwasu);
// - karmienie „Pomiń”: decyzja w app_settings (pominiecia-store), termin od chwili pominięcia;
// - krok wypieku „Pomiń”: przejście do następnego kroku jak wybór z arkusza „Plan wypieku” (skokDoKroku), zapis
//   z wersją wiersza (inna Stolnica ze starszym stanem czyta od nowa, D3a-fix); „Zrobione” otwiera Stolnicę (ekran).
// Po każdym zapisie uzgodnienie powiadomień (resyncNotifications, ADR-006).
// ============================================================================

import type { StoredStarterEntry } from '../data/db';
import { addStarterEntry, deleteStarterEntry } from '../data/starter-entries-store';
import { zapiszPominiecie } from '../data/pominiecia-store';
import { idPominieciaKarmienia } from '../core/pominiecia';
import { idSesji } from '../data/bake-session-store';
import { loadActiveBakeSessionsZWersja, zapiszPostepWypieku } from '../data/bake-sessions-store';
import { skokDoKroku } from '../core/step-confirm';
import { resyncNotifications } from './notifications';

/** Wpis dokarmienia z chwilą „teraz” (id jak w dzienniku zakwasu: `feed-<zakwas>-<chwila>`). */
export function wpisDokarmienia(starterId: string, at: number, feedRatio?: string): StoredStarterEntry {
  return { id: `feed-${starterId}-${at}`, starterId, kind: 'feeding', occurredAt: at, ...(feedRatio ? { feedRatio } : {}), signs: [], createdAt: at, updatedAt: at };
}

/** „Zrobione” przy zaległym karmieniu: zapis dokarmienia (następny termin od niego, RD-25). Zwraca wpis do cofnięcia. */
export async function zrobioneKarmienie(starterId: string, at: number, feedRatio?: string): Promise<StoredStarterEntry> {
  const wpis = wpisDokarmienia(starterId, at, feedRatio);
  await addStarterEntry(wpis);
  void resyncNotifications();
  return wpis;
}

/** „Przywróć” po „Zrobione”: usunięcie tego jednego wpisu (zaległe wraca, jeśli termin nadal minął). */
export async function cofnijKarmienie(wpisId: string): Promise<void> {
  await deleteStarterEntry(wpisId);
  void resyncNotifications();
}

/** „Pomiń” przy zaległym karmieniu: decyzja z chwilą pominięcia (D-094). */
export async function pominKarmienie(starterId: string, at: number): Promise<void> {
  await zapiszPominiecie(idPominieciaKarmienia(starterId), at);
  void resyncNotifications();
}

export type WynikPominieciaKroku = 'ok' | 'brak' | 'ostatni' | 'nieaktualny';

/**
 * „Pomiń” przy zaległym kroku wypieku (BR-KAL-003 „Pomiń krok wypieku”): wypiek przechodzi do następnego kroku tak
 * jak wybór kroku z arkusza „Plan wypieku” (dalsze kroki przesuwają się). Ostatni krok („gotowe”) nie ma następnego —
 * koniec wypieku tylko na Stolnicy (ocena i zapis do Dziennika). Wypiek, którego już nie ma: `brak`.
 */
export async function pominKrokWypieku(wypiekId: string, at: number): Promise<WynikPominieciaKroku> {
  const w = (await loadActiveBakeSessionsZWersja()).find((x) => idSesji(x.sesja) === wypiekId);
  if (!w) return 'brak';
  const nastepny = w.sesja.stepIdx + 1;
  if (nastepny >= w.sesja.steps.length) return 'ostatni';
  const r = await zapiszPostepWypieku({ ...w.sesja, ...skokDoKroku(w.sesja, nastepny, at) }, w.wersja);
  if (!r.ok) return r.error.kind === 'brak' ? 'brak' : 'nieaktualny';
  void resyncNotifications();
  return 'ok';
}

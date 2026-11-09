/**
 * Przygotowanie danych w testach: zakwas z dokarmieniem z `lastFedAt` [M1-audytor-generalny-002; 05-architekt-501].
 * Od 002 saveStarter nie tworzy wpisu dokarmienia (jedna droga zapisu: dziennik). Pomocnik odtwarza dawne
 * przygotowanie danych tą jedyną drogą: wpis `feed-<zakwas>-<chwila>` tylko, gdy chwila jest późniejsza niż ostatnie
 * dokarmienie w dzienniku. Tylko do przygotowania stanu; zachowania zapisu sprawdzają testy w src/data/__tests__.
 */
import type { StoredStarter } from '../../src/data/db';
import { saveStarter } from '../../src/data/sqlite-store';
import { addStarterEntry, getStarterEntries } from '../../src/data/starter-entries-store';

export async function zapiszZakwasZDokarmieniem(s: StoredStarter): Promise<void> {
  await saveStarter(s);
  const at = s.lastFedAt;
  if (at === undefined || at <= 0) return;
  const ostatnie = Math.max(0, ...(await getStarterEntries(s.id)).filter((e) => e.kind === 'feeding').map((e) => e.occurredAt));
  if (at <= ostatnie) return;
  await addStarterEntry({ id: `feed-${s.id}-${at}`, starterId: s.id, kind: 'feeding', occurredAt: at, ...(s.feedingRatio ? { feedRatio: s.feedingRatio } : {}), signs: [], createdAt: at, updatedAt: at });
}

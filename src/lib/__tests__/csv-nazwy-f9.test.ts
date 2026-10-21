/**
 * Eksport historii wypieków do CSV: nazwa receptury bazowej w języku aplikacji (jak w Dzienniku, nazwaReceptury),
 * nie zapisana nazwa PL; nazwa własna użytkownika bez zmian [audyt-niezalezny F-9].
 */
import { setLang, t } from '../i18n';
import { exportBakeLogsCsv } from '../csv-exporter';
import { MASTER_RECIPES } from '../../recipes/presets';
import type { StoredBakeLog } from '../../data/db';

const bazowa = MASTER_RECIPES[0].namePl;
const log = (recipeName: string) => ({ id: 'b1', startedAt: Date.UTC(2026, 9, 20), recipeName } as unknown as StoredBakeLog);

describe('CSV: nazwy receptur w języku aplikacji (F-9)', () => {
  afterEach(() => setLang('pl'));

  it('EN: receptura bazowa po angielsku, nazwa własna dosłownie', () => {
    setLang('en');
    const csv = exportBakeLogsCsv([log(bazowa), log('Mój chleb')]);
    expect(t(bazowa)).not.toBe(bazowa);
    expect(csv).toContain(t(bazowa));
    expect(csv).not.toContain(bazowa);
    expect(csv).toContain('Mój chleb');
  });

  it('PL: bez zmian', () => {
    setLang('pl');
    expect(exportBakeLogsCsv([log(bazowa)])).toContain(bazowa);
  });
});

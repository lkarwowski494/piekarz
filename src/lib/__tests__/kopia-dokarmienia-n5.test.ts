/**
 * Tekst kopiowany z karty „Ilości do dokarmienia” ma te same nazwy co karta („Potrzebny zakwas”, „Stary zakwas”,
 * bez „zaczyn”/„levain”) i poradę w języku interfejsu [reaudit-noc N-5; M1-audytor-generalny-160].
 */
import { formatFeedingToText } from '../feeding-formatter';
import { calculateStarterFeeding } from '../../core/sourdough-physics';
import { setLang, t } from '../i18n';
import type { StoredStarter } from '../../data/db';

const zakwas: StoredStarter = {
  id: 's1',
  name: 'Bolek',
  flourType: 'Żytnia',
  hydration: 100,
  birthDate: 1,
  storageState: 'ROOM_TEMP',
  lastFedAt: 1,
};

describe('N-5: kopia dokarmienia jak karta', () => {
  afterEach(() => setLang('pl'));

  it.each(['pl', 'en', 'de'] as const)('%s: nazwy z karty i porada przetłumaczona', (lang) => {
    setLang(lang);
    const karmienie = calculateStarterFeeding(150, [1, 2, 2]);
    const tekst = formatFeedingToText(zakwas, karmienie, [1, 2, 2]);
    expect(tekst).toContain(`${t(`Potrzebny zakwas`)}: `);
    expect(tekst).toContain(`1. ${t(`Stary zakwas`)}: `);
    const porada = karmienie.tipPl ?? '';
    expect(porada.length).toBeGreaterThan(0);
    expect(tekst).toContain(t(porada));
    if (lang !== 'pl') expect(tekst).not.toContain(porada);
    expect(tekst.toLowerCase()).not.toMatch(/zaczyn|levain/);
  });
});

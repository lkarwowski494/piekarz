/**
 * Treść kroku „Studzenie na kratce” bez wycofanego twierdzenia o 2 h „żelowania” miękiszu — zdanie z KRO-POC-015
 * (King Arthur Baking: chleb w czasie studzenia oddaje wilgoć, miękisz się ustala) [audyt-niezalezny E-3].
 */
import { DEFAULT_STAGE_TEMPLATES } from '../reverse-scheduler';
import { setLang, t } from '../../lib/i18n';

// M3 T2 (D-123): brzmienie roli 06 bez przypisu do źródła; ta sama treść (wilgoć, ustalanie miękiszu, gumowaty)
const PL =
  'Wyjmij chleb na metalową kratkę. Chleb oddaje wilgoć, gdy stygnie, a miękisz potrzebuje tego czasu, żeby się ustalić; pokrojony za wcześnie może być gumowaty.';
const EN =
  'Move the loaf to a wire rack. Bread gives off moisture as it cools and the crumb needs that time to set; slice it too early and it can be gummy.';

const studzenie = () => DEFAULT_STAGE_TEMPLATES.find((s) => s.id === 'cool');

describe('krok studzenia ze źródłem KRO-POC-015 (E-3)', () => {
  afterEach(() => setLang('pl'));

  it('PL: zdanie z KRO-POC-015, bez „żelowania” i bez „minimum 2 godziny”', () => {
    const tresc = studzenie()?.instructionsPl ?? '';
    expect(tresc).toBe(PL);
    expect(tresc).not.toMatch(/żelowa/);
    expect(tresc).not.toMatch(/2 godziny/);
  });

  it('EN: przekład tego zdania', () => {
    setLang('en');
    expect(t(PL)).toBe(EN);
  });
});

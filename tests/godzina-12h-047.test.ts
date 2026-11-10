/**
 * Godzina w zegarze 12 h bez zera wiodącego („1:30 PM”, nie „01:30 PM”), w 24 h jak dotąd („01:30”, „13:30”),
 * i bez podwójnej kropki, gdy godzina kończy się skrótem („p.m.”, „μ.μ.”) przed kropką zdania
 * [M1-audytor-generalny-047; 09-lokalizacja-006; opcja b].
 */
import { formatTime, opcjeGodziny } from '../src/lib/format';
import { ACTIVE_LANGS, setLang, t } from '../src/lib/i18n';

const EN = require('../src/lib/i18n.en').EN as Record<string, string>;
const popoludnie = new Date(2026, 10, 12, 13, 30);
const noc = new Date(2026, 10, 12, 1, 30);

describe('047: godzina w zegarze 12 h i 24 h', () => {
  afterAll(() => setLang('pl'));
  it('en-US: „1:30 PM” bez zera wiodącego; pl i de: 24 h z zerem jak dotąd', () => {
    expect(formatTime(popoludnie, 'en-US')).toMatch(/^1:30\sPM$/u);
    expect(formatTime(noc, 'en-US')).toMatch(/^1:30\sAM$/u);
    expect(formatTime(popoludnie, 'pl-PL')).toBe('13:30');
    expect(formatTime(noc, 'pl-PL')).toBe('01:30');
    expect(formatTime(noc, 'de-DE')).toBe('01:30');
  });
  it('opcjeGodziny: numeric w 12 h, 2-digit w 24 h', () => {
    expect(opcjeGodziny('en-US').hour).toBe('numeric');
    expect(opcjeGodziny('pl-PL').hour).toBe('2-digit');
  });
  it.each(ACTIVE_LANGS)('%s: zdania kończące się godziną bez „..”', (l) => {
    setLang(l);
    const godz = { 'es-419': 'es-419', el: 'el-GR', en: 'en-US' } as Record<string, string>;
    const g = formatTime(popoludnie, godz[l] ?? l);
    const zle: string[] = [];
    for (const k of Object.keys(EN).filter((x) => x.includes('{godzina}'))) {
      const params: Record<string, string> = {};
      for (const m of k.matchAll(/\{(\w+)\}/g)) params[m[1]] = m[1] === 'godzina' ? g : 'X';
      const s = t(k, params);
      if (/\.\./.test(s.replace(/…/g, ''))) zle.push(s);
    }
    expect(zle).toEqual([]);
  });
});

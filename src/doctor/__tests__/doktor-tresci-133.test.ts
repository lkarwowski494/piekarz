/**
 * Każde zdanie z liczbą w diagnozach Doktora (diagnoseBreadDefect), w poradzie mieszanki mąk
 * (analyzeFlourBlendAbsorption) i we wskazówce zaczynu (PREFERMENT_DEFINITIONS) ma wpis w docs/tresci/pl ze znacznikiem
 * potwierdzonego twierdzenia; zmienione pola równe docs/tresci/pl|en; bez wycofanych liczb i ocen
 * [M1-audytor-generalny-133; 06-tresci-504].
 */
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { diagnoseBreadDefect, type DiagnosticResult } from '../diagnostics';
import { analyzeFlourBlendAbsorption } from '../../core/flour-atlas';
import { PREFERMENT_DEFINITIONS } from '../../core/preferments';
import { ZACZYNY_W_MENU } from '../../components/receptury/nazwy-receptur';
import { setLang, t } from '../../lib/i18n';
import { linie } from '../../core/__tests__/helpers/tresci';

const ROOT = join(__dirname, '..', '..', '..');
const rejestr: { id: string; status: string }[] = JSON.parse(readFileSync(join(ROOT, 'docs/tresci/rejestr.json'), 'utf8'));

/** Zdania z docs/tresci/pl/*.md: tekst bez znacznika → ID twierdzeń. */
const ZDANIA_PL = new Map<string, string[]>();
for (const f of readdirSync(join(ROOT, 'docs/tresci/pl')).filter((x) => x.endsWith('.md'))) {
  for (const l of readFileSync(join(ROOT, 'docs/tresci/pl', f), 'utf8').replace(/\r\n/g, '\n').split('\n')) {
    const m = l.match(/^(?:- )?(.*?)\s*\[T:([^\]]+)\]\s*$/);
    if (m) ZDANIA_PL.set(m[1].trim(), m[2].split(',').map((s) => s.trim()));
  }
}
const zdania = (s: string) => s.split(/(?<=[.!?])\s+(?=[A-ZĄĆĘŁŃÓŚŹŻ])/).map((x) => x.trim()).filter(Boolean);

const OBJAWY = [
  { cutImmediatelyWhileSteamingHot: true }, { crumbHasHugeTopHolesWithDenseBottom: true }, { loafIsFlatLikeDisk: true },
  { loafBurstAtBottomSide: true }, { crustLacksEarCutDidNotOpen: true }, { crustIsPaleLackColor: true },
  { breadIsExcessivelySour: true }, { breadIsBlandNoFlavor: true }, {},
];
const DIAGNOZY: DiagnosticResult[] = OBJAWY.map((o) => diagnoseBreadDefect(o));
const pola = (d: DiagnosticResult): [string, string][] => [
  ['titlePl', d.titlePl], ['subtitlePl', d.subtitlePl], ['biologicalCausePl', d.biologicalCausePl],
  ...d.actionChecklistPl.map((a, i) => [`actionChecklistPl[${i}]`, a] as [string, string]),
];

/** Porady mieszanki: każda gałąź (poniżej, blisko, w zakresie, powyżej) dla mąki pszennej i mieszanki z żytem. */
function poradyMak(): string[] {
  const out: string[] = [];
  for (const blend of [[{ name: 'Mąka pszenna typ 650', percentage: 100 }], [{ name: 'Mąka żytnia typ 720', percentage: 60 }, { name: 'Mąka pszenna typ 650', percentage: 40 }]]) {
    const [lo, hi] = analyzeFlourBlendAbsorption(blend, 70).recommendedHydrationRange;
    for (const h of [lo - 5, lo - 1, (lo + hi) / 2, hi + 1, hi + 5]) out.push(analyzeFlourBlendAbsorption(blend, h).doughFeelAdvicePl);
  }
  out.push(analyzeFlourBlendAbsorption([], 70).doughFeelAdvicePl);
  return out;
}

const tekstyZaczynow = ZACZYNY_W_MENU.filter((x) => x !== 'direct').flatMap((typ) => {
  const d = PREFERMENT_DEFINITIONS[typ];
  return [d.namePl, d.fermentationTimeHours, d.flavorProfilePl];
});

describe('133: liczby Doktora, mieszanki mąk i zaczynów mają twierdzenie w docs/tresci', () => {
  afterEach(() => setLang('pl'));

  it.each([
    ['Doktor (diagnoseBreadDefect)', () => DIAGNOZY.flatMap((d) => pola(d).map(([, v]) => v))],
    ['analyzeFlourBlendAbsorption', poradyMak],
    ['PREFERMENT_DEFINITIONS (zaczyny z menu)', () => tekstyZaczynow],
  ] as const)('%s: każde zdanie z liczbą = zdanie z docs/tresci/pl z potwierdzonym twierdzeniem', (_, teksty) => {
    const zle: string[] = [];
    for (const s of teksty().flatMap(zdania)) {
      if (!/\d/.test(s)) continue;
      const ids = ZDANIA_PL.get(s);
      if (!ids || ids.includes('-') || !ids.every((id) => rejestr.find((r) => r.id === id)?.status === 'potwierdzone')) zle.push(s);
    }
    expect(zle).toEqual([]);
  });

  const PLIK = readFileSync(join(ROOT, 'docs/tresci/pl/doktor-chleba.md'), 'utf8').replace(/\r\n/g, '\n');
  const SEKCJE = [...PLIK.matchAll(/^## diagnostics\.(\w+)\.(.+)$/gm)].map((m) => [m[1], m[2]] as [string, string]);

  it.each(SEKCJE)('%s.%s = docs/tresci/pl|en/doktor-chleba.md', (kod, pole) => {
    const d = DIAGNOZY.find((x) => x.defectCode === kod);
    const v = d && pola(d).find(([p]) => p === pole)?.[1];
    expect(v).toBe(linie('pl/doktor-chleba.md', `diagnostics.${kod}.${pole}`).join(' '));
    setLang('en');
    expect(t(v!)).toBe(linie('en/doktor-chleba.md', `diagnostics.${kod}.${pole}`).join(' '));
  });

  it.each(['poniżej zakresu', 'w zakresie', 'blisko zakresu'])('porada mieszanki „hydratacja %s” = docs/tresci/pl|en/maki-chlonnosc.md', (galaz) => {
    const pl = linie('pl/maki-chlonnosc.md', `analyzeFlourBlendAbsorption.doughFeelAdvicePl, hydratacja ${galaz}`).join(' ');
    expect(poradyMak()).toContain(pl);
    setLang('en');
    expect(t(pl)).toBe(linie('en/maki-chlonnosc.md', `analyzeFlourBlendAbsorption.doughFeelAdvicePl, hydratacja ${galaz}`).join(' '));
  });

  it('bez wycofanych liczb Doktora (DIA-LIC-900) i ocen mieszanki (MAK-HYD-901)', () => {
    const doktor = DIAGNOZY.flatMap((d) => pola(d).map(([, v]) => v)).join('\n');
    for (const r of [/50\s?°C/, /94\s?°C/, /95–98/, /minimum 2 godziny/, /5–8 minut/, /45–60/, /25–26/, /z 20% do 15%/, /3–5\s?°C/, /100% pary/, /8–10 mm/, /240\s?°C/, /210–220/, /1:2:2|1:3:3/, /12–16 godzin/, /do 20%/, /10–20%/, /<65%/, /3–5%/, /12,5 g/, /\b1 dodatkow/]) {
      expect(doktor).not.toMatch(r);
    }
    expect(poradyMak().join('\n')).not.toMatch(/Idealn|śmiało|Dobra sprężystość/);
  });
});

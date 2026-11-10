/**
 * M1-audytor-generalny-010 (06-tresci-003, D-305): teksty głównego przepływu (kroki planu, podpowiedź kolizji ze snem,
 * komunikaty temperatury wody, opisy i wskazówki receptur bazowych) dosłownie z wersji zweryfikowanej
 * docs/tresci/pl/teksty-glownego-przeplywu.md; superlatywy i przyczyny bez źródła usunięte z kodu.
 * Trwała kontrola („Powraca”): tests/liczby-w-tekstach-010.test.ts (literał z liczbą → twierdzenie w rejestrze).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { MASTER_RECIPES, type RecipePreset } from '../src/recipes/presets';
import { DEFAULT_STAGE_TEMPLATES, calculateReverseSchedule } from '../src/core/reverse-scheduler';
import { calculateDDTWaterTemp } from '../src/core/domain-rules';

const root = path.join(__dirname, '..');
function sekcje(plik: string): Record<string, string> {
  const wynik: Record<string, string> = {};
  let klucz: string | null = null;
  const tekst = fs.readFileSync(path.join(root, 'docs', 'tresci', plik), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  for (const linia of tekst.replace(/\r\n/g, '\n').split('\n')) {
    if (linia.startsWith('## ')) { klucz = linia.slice(3).trim(); continue; }
    if (!klucz || !linia.trim()) continue;
    const zdanie = linia.replace(/\s*\[T:[^\]]*\]\s*$/, '').trim();
    wynik[klucz] = wynik[klucz] ? `${wynik[klucz]} ${zdanie}` : zdanie;
  }
  return wynik;
}
const PL = sekcje('pl/teksty-glownego-przeplywu.md');
const etap = (id: string) => DEFAULT_STAGE_TEMPLATES.find((t) => t.id === id)!;
const preset = (id: string) => MASTER_RECIPES.find((r) => r.id === id)!;

describe('010 (D-305): teksty głównego przepływu z wersji zweryfikowanej', () => {
  it.each(['autolyse', 'bulk_ferment', 'final_proof'])('plan, krok %s: instrukcja = plik treści', (id) => {
    expect(etap(id).instructionsPl).toBe(PL[`plan, krok ${id} (instructionsPl)`]);
  });

  it('podpowiedź kolizji ze snem = plik treści', () => {
    const plan = calculateReverseSchedule(new Date(2026, 10, 10, 3, 0), { sleepStartHour: 23, sleepEndHour: 7 });
    expect(plan.hasSleepCollision).toBe(true);
    expect(plan.suggestedActionPl).toBe(PL['plan, podpowiedź kolizji ze snem (autoResolve, suggestion)']);
  });

  it('komunikaty temperatury wody = plik treści (bez „ugotowania drożdży” i bez rady odwracającej RD-05)', () => {
    const goraca = calculateDDTWaterTemp({ targetDDT: 30, flourTemp: 10, roomTemp: 10, frictionFactor: 0 });
    const zimna = calculateDDTWaterTemp({ targetDDT: 20, flourTemp: 30, roomTemp: 30, frictionFactor: 0 });
    expect(goraca.status).toBe('too_hot_danger');
    expect(goraca.warningMessagePl).toBe(PL['calculateDDTWaterTemp, status too_hot_danger (warningMessagePl)']);
    expect(zimna.status).toBe('requires_ice');
    expect(zimna.warningMessagePl).toBe(PL['calculateDDTWaterTemp, status requires_ice (warningMessagePl)']);
  });

  const pola = Object.keys(PL).filter((k) => /^\w+\.(descriptionPl|notesPl)$/.test(k));
  it('plik ma pola 10 receptur bazowych', () => {
    expect(new Set(pola.map((k) => k.split('.')[0])).size).toBe(10);
  });

  it.each(pola)('%s = plik treści', (klucz) => {
    const [id, pole] = klucz.split('.') as [string, 'descriptionPl' | 'notesPl'];
    expect(preset(id)[pole]).toBe(PL[klucz]);
  });

  it('ciabatta i chleb bez wyrabiania: usunięte tylko zdania-superlatywy (DRO-PRE-900)', () => {
    expect(preset('ciabatta_con_biga').descriptionPl).toBe('Tradycyjna włoska ciabatta na sztywnym zaczynie Biga (50%).');
    expect(preset('no_knead_night').descriptionPl).toBe('Mieszanie łyżką w 2 minuty, nocny rozrost na blacie i pieczenie w garnku.');
  });

  it('zdania usunięte w D-305 nie występują w kodzie receptur, planu i kalkulatora wody', () => {
    const kod = [
      ...MASTER_RECIPES.flatMap((r: RecipePreset) => [r.descriptionPl, r.notesPl]),
      ...DEFAULT_STAGE_TEMPLATES.map((t) => t.instructionsPl),
      fs.readFileSync(path.join(root, 'src', 'core', 'domain-rules.ts'), 'utf8'),
    ].join('\n');
    for (const z of [
      'Najprostszy chleb świata.', 'Spektakularny piecowy skok', 'Idealny na początek przygody z zakwasem.',
      'Idealna na niedzielne śniadanie.', 'Zachowuje świeżość przez tydzień.', 'Dodatek łyżki miodu wspomaga fermentację',
      'Grozi to ugotowaniem drożdży', 'Długa fermentacja nada chlebowi głęboki aromat.', 'Wymaga mąki o zawartości białka minimum 13%.',
      'Schłodź mąkę lub obniż temperaturę otoczenia.',
    ]) expect(kod).not.toContain(z);
  });
});

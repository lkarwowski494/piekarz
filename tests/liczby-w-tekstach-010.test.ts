/**
 * M1-audytor-generalny-010 (06-tresci-003, D-305), trwała kontrola z „Powraca”: w modułach głównego przepływu
 * widocznych w 1.0 (plan, prowadzenie i fazy garnka, receptury bazowe, kalkulator temperatury wody) każdy literał PL
 * z liczbą jest zdaniem z docs/tresci/pl ze znacznikiem potwierdzonego twierdzenia rejestru (kierunek tekst →
 * twierdzenie) albo stoi na nazwanej liście wyjątków niżej z powodem (nazwy mąk i receptur, procenty mieszanek,
 * numer fazy, skład i proces receptury otwarty w rejestrze). Nowy tekst z liczbą bez twierdzenia = czerwony test.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as ts from 'typescript';

const root = path.join(__dirname, '..');
const MODULY = [
  'src/core/reverse-scheduler.ts', 'src/core/baking-phases.ts', 'src/core/pieczenie-receptury.ts', 'src/core/domain-rules.ts',
  'src/recipes/presets-zakwas.ts', 'src/recipes/presets-drozdzowe.ts', 'src/recipes/presets-zytnie.ts', 'src/recipes/presets-pizza-slodkie.ts',
  'src/components/stolnica/DutchOvenController.tsx',
];

const REJESTR: { id: string; status: string }[] = JSON.parse(fs.readFileSync(path.join(root, 'docs/tresci/rejestr.json'), 'utf8'));
const POTWIERDZONE = new Set(REJESTR.filter((t) => t.status === 'potwierdzone').map((t) => t.id));

/** Zdania docs/tresci/pl z co najmniej jednym potwierdzonym twierdzeniem w znaczniku [T:…]. */
const ZDANIA_Z_TWIERDZENIEM = new Set<string>();
for (const f of fs.readdirSync(path.join(root, 'docs/tresci/pl')).filter((x) => x.endsWith('.md'))) {
  const t = fs.readFileSync(path.join(root, 'docs/tresci/pl', f), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  for (const m of t.matchAll(/([^\]\n]*?)\s*\[T:([^\]]*)\]/g)) {
    const ids = (m[2] ?? '').split(',').map((s) => s.trim());
    if (ids.some((id) => POTWIERDZONE.has(id))) ZDANIA_Z_TWIERDZENIEM.add((m[1] ?? '').replace(/^[-*|\s]+/, '').trim());
  }
}

const zdaniaLiteralu = (s: string): string[] => s.split(/(?<=[.!?;])\s+(?=[A-ZĄĆĘŁŃÓŚŹŻ])/).map((z) => z.trim()).filter(Boolean);

/** Literały tekstowe (z odstępem i literą) z cyfrą w pliku: [linia, tekst]. */
function literaly(plik: string): [number, string][] {
  const zrodlo = ts.createSourceFile(plik, fs.readFileSync(path.join(root, plik), 'utf8'), ts.ScriptTarget.Latest, true);
  const out: [number, string][] = [];
  const odwiedz = (n: ts.Node) => {
    if ((ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) && !ts.isImportDeclaration(n.parent)
      && /\d/.test(n.text) && /\s/.test(n.text) && /\p{L}{3}/u.test(n.text)) {
      out.push([zrodlo.getLineAndCharacterOfPosition(n.getStart()).line + 1, n.text]);
    }
    ts.forEachChild(n, odwiedz);
  };
  odwiedz(zrodlo);
  return out;
}

/**
 * Wyjątki nazwane: zdanie (albo literał) → powód. Nazwy własne i etykiety nie są twierdzeniem (D-305, „Poza zakresem”);
 * skład i proces receptur bez źródła zostają do czasu źródła (REC-BAZ-900, DRO-PRE-900 — otwarte w rejestrze).
 */
const WYJATKI: Record<string, string> = {
  'Faza 1: Pod pokrywką (Para)': 'numer fazy (D-305, poza zakresem)',
  'Faza 2: Bez pokrywki (Karmelizacja)': 'numer fazy (D-305, poza zakresem)',
  'Rozpocznij Fazę 2': 'numer fazy (D-305, poza zakresem)',
  'Wiejski chleb na zakwasie, 80%': 'nazwa receptury (namePl, D-305, poza zakresem)',
  'Włoska Ciabatta z Bigą (Wysoka Hydratacja 82%)': 'nazwa receptury (namePl, D-305, poza zakresem)',
  'Tradycyjny chleb 100% żytni razowy': 'nazwa receptury (namePl, D-305, poza zakresem)',
  'Zaczyn poolish (20% mąki, 100% hydratacji).': 'skład receptury bez źródła [REC-BAZ-900]',
  'Lievito Madre odśwież 3 razy co 4 h przed zarobieniem ciasta.': 'proces receptury bez źródła [REC-BAZ-900]',
  'Masło (25%) dodawaj stopniowo porcjami pod koniec wyrabiania, gdy siatka glutenowa jest już w pełni rozwinięta.': 'skład receptury bez źródła [REC-BAZ-900]',
  'Tradycyjna włoska ciabatta na sztywnym zaczynie Biga (50%).': 'ciabatta bez źródła [DRO-PRE-900]',
  'Biga (sztywny zaczyn 50% hydratacji) dojrzewający 16 h w 18°C.': 'ciabatta bez źródła [DRO-PRE-900]',
  'Do ciasta właściwego dodaj 3% oliwy z oliwek.': 'ciabatta bez źródła [DRO-PRE-900]',
  'Mieszanie łyżką w 2 minuty, nocny rozrost na blacie i pieczenie w garnku.': 'chleb bez wyrabiania bez źródła [DRO-PRE-900]',
  'Przykryj folią i zostaw na 12–16 godzin w temperaturze pokojowej.': 'chleb bez wyrabiania bez źródła [DRO-PRE-900]',
  // Poza tekstami roli 06 (D-305 nie objęło): wskazówka hydratacji RD-18 bez twierdzenia — nowe znalezisko roli 08
  // (fix M2 p2, 2026-11-09) dla roli 06; do czasu jej wersji wyjątek nazwany, nie cicha luka.
  'Wymaga 3–4 standardowych składań.': 'wskazówka getHydrationDifficulty bez twierdzenia — znalezisko dla roli 06 [DO USTALENIA]',
};

/** Nazwy mąk (D-305 „poza zakresem”, D-307) i nazwy mieszanek z procentami (etykiety, nie twierdzenia). */
const NAZWA_MAKI = /^Mąka (pszenna|żytnia|orkiszowa)( \S+)*? (typ \d+|Tipo 00)( \([^)]+\))?$/;
const NAZWA_MIESZANKI = /^\d+% \p{L}+( \+ \d+% \p{L}+)*( \([^)]+\))?$|^100% Pszenna chlebowa$/u;
const wyjatek = (z: string) => Boolean(WYJATKI[z]) || NAZWA_MAKI.test(z) || NAZWA_MIESZANKI.test(z);

describe('010 (06-tresci-003, „Powraca”): literał z liczbą w głównym przepływie ma twierdzenie w rejestrze', () => {
  it('zdania z twierdzeniami są (test ma na czym działać)', () => {
    expect(ZDANIA_Z_TWIERDZENIEM.size).toBeGreaterThan(300);
  });

  it('wyjątek z ID rejestru wskazuje twierdzenie otwarte (zamknięcie źródłem = zdanie do docs/tresci i koniec wyjątku)', () => {
    const ids = Object.values(WYJATKI).flatMap((p) => [...p.matchAll(/\[([A-Z]{3}-[A-Z]{3}-\d{3})\]/g)].map((m) => m[1]));
    expect(ids.length).toBeGreaterThan(5);
    for (const id of ids) expect(REJESTR.find((t) => t.id === id)?.status).toBe('otwarte');
  });

  it('kontrola łapie literał z liczbą bez twierdzenia i przepuszcza zdanie z rejestru', () => {
    expect(zdaniaLiteralu('Piecz 20 minut pod pokrywką. Grozi to ugotowaniem drożdży.')).toHaveLength(2);
    expect(ZDANIA_Z_TWIERDZENIEM.has('Pokrywka zamknięta: 20 minut w 232 °C.')).toBe(true);
    expect(ZDANIA_Z_TWIERDZENIEM.has('Wstaw garnek żeliwny do piekarnika i rozgrzej do 240°C.')).toBe(false);
    expect(wyjatek('Mąka pszenna chlebowa typ 750')).toBe(true);
    expect(wyjatek('Piecz 20 min pod pokrywką (240°C) + 25 min bez (210°C).')).toBe(false);
  });

  it.each(MODULY)('%s: każdy literał z liczbą = zdania z potwierdzonym twierdzeniem albo wyjątek nazwany', (plik) => {
    const bez: string[] = [];
    for (const [linia, tekst] of literaly(plik)) {
      if (wyjatek(tekst)) continue;
      for (const z of zdaniaLiteralu(tekst)) {
        if (/\d/.test(z) && !ZDANIA_Z_TWIERDZENIEM.has(z) && !wyjatek(z)) bez.push(`${plik}:${linia} ${z}`);
      }
    }
    expect(bez).toEqual([]);
  });
});

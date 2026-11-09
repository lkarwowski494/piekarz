/**
 * M1-audytor-generalny-058 (03-zakres-001; DEC-02 a, D-286): pakiet D-092 (kalendarz, plany na kolejne dni, dwa
 * wypieki naraz) przechodzi bramkę zmian wstecz — wpis ZM z D-092 i jego wykonaniami, wiersze F-nn dla BR-KAL-001…016
 * i BR-ETAP-006, adnotacje powrotu KL-09 i F-17, F-nn dla funkcji z inwentarza audytu oznaczonych „brak F-nn”.
 * Trwała kontrola (Powraca: ZM-19): każde BR z BRD ma decyzję zakresu w kolumnie „Wymagania”; wyjątki tylko z listy
 * niżej, z ID zadania, które je zamknie (lista może tylko maleć).
 */
import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');
const kontrakt = fs.readFileSync(path.join(root, 'docs/scope-contract.md'), 'utf8').replace(/\r\n/g, '\n');
const linie = kontrakt.split('\n');
const wiersz = (f: string) => linie.find((l) => l.startsWith(`| ${f} |`)) ?? '';
const zm = kontrakt.split('## Zmiany zakresu')[1]?.split('\n## ')[0] ?? '';
const wierszeZm = zm.split('\n').filter((l) => /^\| ZM-\d+/.test(l));

/** BR z BRD (nagłówki „### BR-…”, bez wycofanych), jak `wymaganiaBrd` w zakres.mjs roli 03. */
function brZBrd(): Set<string> {
  const dir = path.join(root, 'docs/brd');
  const out = new Set<string>();
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md'))) {
    let br: string | null = null;
    for (const l of fs.readFileSync(path.join(dir, f), 'utf8').split('\n')) {
      const n = l.match(/^#{1,6}\s+(BR-[A-Z]{2,6}-\d{3})\b/);
      if (n) out.add((br = n[1]));
      else if (/^#{1,6}\s/.test(l)) br = null;
      else if (br && /Status:\s*wycofane/i.test(l)) out.delete(br);
    }
  }
  return out;
}

/** BR w kolumnie „Wymagania” wierszy F-nn kontraktu. */
function brWKontrakcie(): Map<string, string> {
  const out = new Map<string, string>();
  for (const l of linie) {
    const k = l.split('|').map((s) => s.trim());
    if (!/^F-\d{2}$/.test(k[1] ?? '')) continue;
    for (const id of k[3].match(/\bBR-[A-Z]{2,6}-\d{3}\b/g) ?? []) out.set(id, k[1]);
  }
  return out;
}

/** BR bez decyzji zakresu poza tym zadaniem: zamyka je wskazane zadanie (lista tylko maleje). */
// 059 (03-zakres-003): BR-MASZ-001…006, BR-KALK-012, BR-RECP-005, BR-DANE-005, BR-UST-004 i BR-UST-005 dostały
// decyzję zakresu (wiersze F-72, F-55, F-26, F-33, F-82, F-83); lista pusta i może tylko taka zostać.
const BEZ_DECYZJI_POZA_058: Record<string, string> = {};

describe('kontrakt zakresu: pakiet D-092 przez bramkę ZM (058)', () => {
  it('każde BR z BRD ma decyzję zakresu; wyjątki tylko z listy i nadal bez decyzji', () => {
    const brd = brZBrd();
    const zakres = brWKontrakcie();
    expect(brd.size).toBeGreaterThan(50);
    expect([...brd].filter((id) => !zakres.has(id) && !BEZ_DECYZJI_POZA_058[id]).sort()).toEqual([]);
    expect(Object.keys(BEZ_DECYZJI_POZA_058).filter((id) => zakres.has(id) || !brd.has(id))).toEqual([]);
  });

  it('BR-KAL-001…016 i BR-ETAP-006 mają wiersze F-nn; widżet BR-KAL-012 PÓŹNIEJ z „Powrót:”', () => {
    const zakres = brWKontrakcie();
    const kal = Array.from({ length: 16 }, (_, i) => `BR-KAL-${String(i + 1).padStart(3, '0')}`);
    expect([...kal, 'BR-ETAP-006'].filter((id) => !zakres.has(id))).toEqual([]);
    const widzet = wiersz(zakres.get('BR-KAL-012') ?? '');
    expect(widzet.split('|')[4]?.trim()).toBe('PÓŹNIEJ');
    expect(widzet).toMatch(/Powrót:\s*\S/);
    expect(widzet).toMatch(/H-19/);
  });

  it('tabela „Zmiany zakresu” ma wpis z D-092 i jego wykonaniami', () => {
    const wpis = wierszeZm.find((l) => /D-092/.test(l) && /BR-KAL/.test(l));
    expect(wpis).toBeDefined();
    for (const d of ['D-104', 'D-108', 'D-109', 'D-114', 'D-115', 'DEC-02']) expect(wpis).toMatch(new RegExp(d));
  });

  it('KL-09 i F-17 mają adnotację powrotu przez ZM-28', () => {
    const kl09 = linie.find((l) => l.startsWith('| KL-09 |')) ?? '';
    expect(kl09).toMatch(/ZM-28/);
    expect(kl09).toMatch(/BR-KAL-011/);
    const f17 = linie.find((l) => /F-17 kilka wypieków naraz/.test(l)) ?? '';
    expect(f17).toMatch(/ZM-28/);
  });

  it('funkcje z inwentarza audytu oznaczone „brak F-nn” mają F-nn w kontrakcie', () => {
    const inwentarz = [
      'src/components/kalendarz/NawigacjaKalendarza.tsx',
      'src/components/harmonogram/DodajDoKalendarza.tsx',
      'src/components/stolnica/PrzelacznikWypiekow.tsx',
      'src/components/zakwas/StalyDzienKarmienia.tsx',
      'src/lib/confirm.ts',
      'Źródła wiedzy',
      'Licencje open source',
      'Zaplanuj wypiek na ten dzień',
    ];
    const bezF = inwentarz.filter((x) => !linie.some((l) => l.includes(x) && /\bF-\d{2}\b/.test(l)));
    expect(bezF).toEqual([]);
  });
});

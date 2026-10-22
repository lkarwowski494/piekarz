/**
 * F-71 (ZM-19, 06-tresci-p10a-003): teksty protokołów ratunkowych Doktora równe tekstom z docs/tresci
 * (doktor-ratunek.md, a kroki 0–1 zimnej kuchni z doktor-zimna-kuchnia.md) w PL i EN; wycofane twierdzenia
 * (RAT-*-9xx w docs/tresci/rejestr.json) nie wracają do kodu [rola 06, 2026-10-22].
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { DOUGH_RECOVERY_PROTOCOLS, DoughRecoveryProtocol, searchDoughRecoveryProtocols } from '../src/doctor/dough-recovery';
import { setLang, t } from '../src/lib/i18n';

const ROOT = join(__dirname, '..');

/** Sekcje `## <nagłówek>` pliku docs/tresci, tekst bez znacznika [T:ID] i komentarzy. */
function sekcje(plik: string): Record<string, string> {
  const wynik: Record<string, string> = {};
  let klucz: string | null = null;
  for (const linia of readFileSync(join(ROOT, 'docs', 'tresci', plik), 'utf8').replace(/\r\n/g, '\n').split('\n')) {
    if (linia.startsWith('## ')) { klucz = linia.slice(3).trim(); continue; }
    if (!klucz || !linia.trim() || linia.startsWith('<!--')) continue;
    const tekst = linia.replace(/\s*\[T:[^\]]*\]\s*$/, '').trim();
    wynik[klucz] = wynik[klucz] ? `${wynik[klucz]} ${tekst}` : tekst;
  }
  return wynik;
}

function enDla(pl: string): string {
  setLang('en');
  try {
    return t(pl);
  } finally {
    setLang('pl');
  }
}

const PL = sekcje('pl/doktor-ratunek.md');
const EN = sekcje('en/doktor-ratunek.md');
const ZIMNA_PL = sekcje('pl/doktor-zimna-kuchnia.md');
const ZIMNA_EN = sekcje('en/doktor-zimna-kuchnia.md');
const POLA: (keyof DoughRecoveryProtocol)[] = ['titlePl', 'triggerSummaryPl', 'immediateActionPl', 'scientificReasoningPl'];

describe('F-71: protokoły ratunkowe z docs/tresci (rola 06)', () => {
  it('ma cztery protokoły w tej samej kolejności kodów', () => {
    expect(DOUGH_RECOVERY_PROTOCOLS.map((p) => p.id)).toEqual(['OVERPROOFED_COLLAPSE', 'SLACK_HIGH_HYDRATION', 'COLD_SLUGGISH', 'FORGOTTEN_SALT']);
  });

  for (const p of DOUGH_RECOVERY_PROTOCOLS) {
    it(`${p.id}: pola i kroki PL dosłownie z docs/tresci, EN z docs/tresci/en`, () => {
      for (const pole of POLA) {
        const klucz = `${p.id}.${pole}`;
        expect(p[pole]).toBe(PL[klucz]);
        expect(enDla(PL[klucz])).toBe(EN[klucz]);
      }
      p.stepByStepPl.forEach((krok, i) => {
        const zimna = p.id === 'COLD_SLUGGISH' && i < 2;
        const pl = zimna ? ZIMNA_PL[i === 0 ? 'stepByStepPl[0]' : 'stepByStepPl[1] (nowy krok)'] : PL[`${p.id}.stepByStepPl[${i}]`];
        const en = zimna ? ZIMNA_EN[i === 0 ? 'stepByStepPl[0]' : 'stepByStepPl[1] (new step)'] : EN[`${p.id}.stepByStepPl[${i}]`];
        expect(krok).toBe(pl);
        expect(enDla(pl)).toBe(en);
      });
      const kroki = Object.keys(PL).filter((k) => k.startsWith(`${p.id}.stepByStepPl[`)).length;
      expect(p.stepByStepPl.length).toBe(kroki + (p.id === 'COLD_SLUGGISH' ? 2 : 0));
    });
  }

  it('żaden protokół nie ma receptury awaryjnej bez źródła (RAT-PRZ-900, RAT-LUZ-900)', () => {
    expect(DOUGH_RECOVERY_PROTOCOLS.filter((p) => p.pivotRecipeNamePl)).toEqual([]);
    expect(searchDoughRecoveryProtocols('focaccia')).toEqual([]);
    expect(searchDoughRecoveryProtocols('sól').map((p) => p.id)).toContain('FORGOTTEN_SALT');
  });

  it('wycofane twierdzenia (RAT-*-9xx) nie występują w src/doctor/dough-recovery.ts', () => {
    const kod = readFileSync(join(ROOT, 'src', 'doctor', 'dough-recovery.ts'), 'utf8')
      .split('\n').filter((l) => !l.trim().startsWith('//') && !l.trim().startsWith('/**') && !l.trim().startsWith('*')).join('\n');
    const zakazane = [/focaccia/i, /proteaz/, /keksow/, /26–28/, /łaźnia wodna/, /60–90 minut/, /Arrhenius/, /15–20 ml/, /[Ll]aminacj/, /osmoz/, /4–5 godzinach/];
    expect(zakazane.filter((re) => re.test(kod)).map(String)).toEqual([]);
  });
});

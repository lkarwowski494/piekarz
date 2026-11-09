// plan-per-id.mjs — tabela „Plan per ID” dla STOP start M2 (z planu i sekcji raportów ról)
import { readFileSync, existsSync } from 'node:fs';
const p = JSON.parse(readFileSync('plan-napraw.json', 'utf8'));
const dec = new Map(p.decyzje.map((d) => [d.id, d]));
const sekcja = (rap, id) => { if (!existsSync(rap)) return ''; const t = readFileSync(rap, 'utf8'); const i = t.indexOf(`### ${id} `); if (i < 0) return ''; const j = t.indexOf('\n### ', i + 5); return t.slice(i, j < 0 ? undefined : j); };
const pole = (s, n) => (s.match(new RegExp(`^- ${n}: (.*)$`, 'm')) || [, ''])[1];
const DANE = /src\/data|backup|kopi|import|migrac|sqlite|usu[nń]|czyszcz|corrupt|ratun/i;
const out = ['| ID | Partia | Rodzaj | Rola | Test / polecenie | Pliki (z Mechanizm/Dowód) | Dane? |', '|---|---|---|---|---|---|---|'];
for (const z of p.zadania.filter((z) => z.status === 'zatwierdzone')) {
  const s = z.zrodla.map((id) => sekcja(z.raport, id)).join('\n') || sekcja(z.raport, z.id);
  let test = z.test_akceptacyjny.startsWith('test akceptacyjny z raportu') ? pole(s, 'Test akceptacyjny') : z.test_akceptacyjny;
  const pliki = [...new Set([...(pole(s, 'Mechanizm') + ' ' + pole(s, 'Dowód')).matchAll(/`((?:src|app|docs|tests|scripts|\.github|\.maestro|ios|assets)\/[^`:\s]+)/g)].map((m) => m[1]))].slice(0, 5).join(', ');
  const d = dec.get(z.decyzja);
  const wyk = z.wykonawca === 'rola' ? `rola ${z.rola} fix${d ? `, ${d.id}=${d.wybor}` : ', M: źródła'}: ` : '';
  const dane = DANE.test(z.tytul + ' ' + pliki) ? 'tak' : '—';
  out.push(`| ${z.id.slice(-3)} | ${z.partia} | ${z.rodzaj} | ${z.rola} | ${(wyk + (test || '[brak pola w raporcie]')).replace(/\|/g, '/').slice(0, 260)} | ${pliki || '—'} | ${dane} |`);
}
console.log(out.join('\n'));

// sprawdz-plan.mjs — użycie: node sprawdz-plan.mjs <plan-napraw.json>
import { readFileSync } from 'node:fs';
const plik = process.argv[2];
if (!plik) { console.error('Użycie: node sprawdz-plan.mjs <plan-napraw.json>'); process.exit(2); }
let p;
try { p = JSON.parse(readFileSync(plik, 'utf8')); } catch (e) { console.log(`BŁĄD plik: ${e.message}`); process.exit(1); }
const b = [];
const jeden = (w, xs) => xs.includes(w);
const ROLE = ['01-odkrywanie', '02-monetyzacja', '03-zakres', '04-studio-projektowe', '05-architekt', '06-tresci', '07-jakosc', '08-programista', '09-lokalizacja', '10-wydanie', '11-wzrost', '12-niezawodnosc'];
const ROLA = `(${ROLE.join('|')})`;
if (p.wersja !== 1) b.push('wersja: oczekiwano 1');
for (const k of ['data', 'commit', 'raport', 'katalog']) if (!p.audyt?.[k]) b.push(`audyt.${k}: brak`);
if (!jeden(p.werdykt?.kurs, ['trafny', 'do korekty', 'do przebudowy'])) b.push('werdykt.kurs');
if (!jeden(p.werdykt?.stan, ['ZABLOKOWANE', 'GOTOWE Z ZASTRZEŻENIAMI', 'GOTOWE'])) b.push('werdykt.stan');
(p.reaudyty || []).forEach((x, i) => { if (x.petla !== i + 1 || !x.data || !x.commit) b.push(`reaudyty[${i}]: petla ${i + 1}, data i commit`); });
const dec = new Map((p.decyzje || []).map((d) => [d.id, d]));
const sys = new Set((p.przyczyny || []).map((s) => s.id));
for (const d of p.decyzje || []) {
  const opcje = (d.opcje || []).map((o) => o.id);
  if (!/^DEC-\d{2}$/.test(d.id)) b.push(`${d.id}: id DEC-nn`);
  if (opcje.length < 2) b.push(`${d.id}: mniej niż dwie opcje`);
  if (new Set(opcje).size !== opcje.length) b.push(`${d.id}: powtórzone id opcji`);
  if (!opcje.includes(d.rekomendacja)) b.push(`${d.id}: rekomendacja spoza opcji`);
  if (d.wybor != null && !opcje.includes(d.wybor)) b.push(`${d.id}: wybór spoza opcji`);
  if (!jeden(d.rozstrzyga, ['wlasciciel', 'zrodla'])) b.push(`${d.id}: rozstrzyga wlasciciel albo zrodla`);
}
const zad = p.zadania || [];
const po = new Map();
for (const z of zad) { if (po.has(z.id)) b.push(`${z.id}: powtórzone id`); po.set(z.id, z); }
for (const z of zad) {
  const e = (s) => b.push(`${z.id}: ${s}`);
  if (!/^M1-audytor-generalny-\d{3}$/.test(z.id ?? '')) e('id M1-audytor-generalny-NNN');
  if (!z.tytul) e('brak tytułu');
  if (!z.zrodla?.length || z.zrodla.some((s) => !new RegExp(`^(${ROLA}|M1-audytor-generalny)-\\d{3}$`).test(s))) e('zrodla: ID <rola>-NNN');
  if (!jeden(z.poziom, ['P0', 'P1', 'P2', 'P3'])) e('poziom P0|P1|P2|P3');
  if (!jeden(z.rodzaj, ['D', 'P', 'M'])) e('rodzaj D|P|M');
  if (!ROLE.includes(z.rola)) e('rola: właściciel 01–12 z chain.json');
  if (z.wykonawca !== (z.rodzaj === 'D' ? 'M2' : 'rola')) e('wykonawca: D → M2, P i M → rola (D-012)');
  if (z.rodzaj === 'P' && !z.decyzja) e('zadanie P bez decyzji');
  if (z.decyzja && !dec.has(z.decyzja)) e(`nieznana decyzja ${z.decyzja}`);
  const r = dec.get(z.decyzja)?.rozstrzyga;
  if (z.rodzaj === 'P' && r && r !== 'wlasciciel') e('P rozstrzyga właściciel');
  if (z.rodzaj === 'M' && r && r !== 'zrodla') e('M rozstrzygają źródła, nie właściciel');
  if (z.status === 'odrzucone' && !z.powod) e('odrzucone bez powodu');
  if (z.regresja_od && !po.has(z.regresja_od)) e(`regresja od nieznanego ${z.regresja_od}`);
  if (z.istnialo_wczesniej != null && (z.istnialo_wczesniej !== true || z.regresja_od)) e('istnialo_wczesniej: true, bez regresja_od');
  if (z.przyczyna && !sys.has(z.przyczyna)) e(`nieznana przyczyna ${z.przyczyna}`);
  if (!Number.isInteger(z.partia) || z.partia < 1) e('partia: liczba całkowita ≥ 1');
  if (!z.test_akceptacyjny) e('brak testu akceptacyjnego');
  if (!jeden(z.status, ['otwarte', 'zatwierdzone', 'odrzucone', 'naprawione-do-weryfikacji', 'zweryfikowane'])) e('status');
  if (jeden(z.status, ['naprawione-do-weryfikacji', 'zweryfikowane']) && !z.commit) e('naprawione bez commitu');
  if (z.status === 'zatwierdzone' && z.decyzja && dec.get(z.decyzja)?.wybor == null) e('zatwierdzone przed wyborem w decyzji');
  for (const n of z.zalezy_od || []) {
    if (!po.has(n)) e(`zależy od nieznanego ${n}`);
    else if (po.get(n).partia > z.partia) e(`zależy od ${n} z późniejszej partii`);
  }
}
const stan = new Map();
const cykl = (id) => {
  if (stan.get(id) === 1) return true;
  if (stan.get(id) === 2 || !po.has(id)) return false;
  stan.set(id, 1); const c = (po.get(id).zalezy_od || []).some(cykl); stan.set(id, 2);
  return c;
};
for (const z of zad) if (cykl(z.id)) { b.push(`${z.id}: cykl zależności`); break; }
if (b.length) { for (const x of b) console.log('BŁĄD', x); console.log(`${b.length} błędów`); process.exit(1); }
const lin = [...zad].sort((x, y) => x.partia - y.partia || x.rola.localeCompare(y.rola) || x.poziom.localeCompare(y.poziom) || x.id.localeCompare(y.id)).map((z) =>
  `| ${z.partia} | ${z.id} | ${z.poziom} | ${z.rodzaj} | ${z.rola} | ${z.wykonawca} | ${z.zrodla.join(', ')} | ${(z.zalezy_od || []).join(', ') || '—'} | ${z.decyzja ?? '—'} | ${z.status} |`);
console.log(['| Partia | ID | Poziom | Rodzaj | Rola | Wykonawca | Źródła | Zależy od | Decyzja | Status |', '|---|---|---|---|---|---|---|---|---|---|', ...lin].join('\n'));
console.log(`OK: ${zad.length} zadań, ${dec.size} decyzji (${[...dec.values()].filter((d) => d.wybor == null).length} bez wyboru)`);

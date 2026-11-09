// zakres-napraw.mjs — użycie: node zakres-napraw.mjs <plan-napraw.json> <ID,ID|partia:N|zatwierdzone> [--prompts P] [--galaz G]
//   [--data RRRR-MM-DD]; zapis: <plan> --ustaw ID=sha[,ID=sha] | --blokada ID "powód" | --zatwierdz ID[,ID] "RRRR-MM-DD: słowa właściciela"
//   Kod 0: wynik; 1: błędy; 2: złe wywołanie.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
const [plik, spec, ...r] = process.argv.slice(2);
const opt = {};
for (let i = 0; i < r.length; i += 2) opt[r[i].slice(2)] = r[i + 1];
if (!plik || !spec || (spec === '--ustaw' && !r[0]) || (['--blokada', '--zatwierdz'].includes(spec) && !r[1])) { console.error('Złe wywołanie: patrz komentarz w pliku'); process.exit(2); }
const p = JSON.parse(readFileSync(plik, 'utf8'));
const K = dirname(resolve(plik));
const po = new Map((p.zadania || []).map((z) => [z.id, z]));
const dec = new Map((p.decyzje || []).map((d) => [d.id, d]));
const b = [];
const koniec = () => { for (const x of b) console.log('BŁĄD', x); console.log(`błędy: ${b.length}`); process.exit(1); };
if (['--ustaw', '--blokada', '--zatwierdz'].includes(spec)) {
  const pary = spec === '--ustaw' ? r[0].split(',').map((s) => s.split('=')) : r[0].split(',').map((id) => [id, null]);
  for (const [id, sha] of pary) {
    const z = po.get(id);
    if (!z) b.push(`${id}: brak w planie`);
    else if (spec === '--ustaw' && !/^[0-9a-f]{7,40}$/.test(sha ?? '')) b.push(`${id}: commit to SHA`);
    else if (spec === '--zatwierdz') {
      // Ponowne zatwierdzenie po reaudicie (pętla ≥ 2): jedyna zmiana statusu poza własną, ze słowami właściciela.
      if (!(p.reaudyty || []).length) b.push(`${id}: pierwsza pętla, zatwierdza M1 na STOP 2`);
      if (z.status !== 'otwarte') b.push(`${id}: status ${z.status}, ponownie zatwierdzasz tylko otwarte`);
      if (z.rodzaj === 'P' && dec.get(z.decyzja)?.wybor == null) b.push(`${id}: decyzja ${z.decyzja} bez wyboru właściciela`);
      if (!/^\d{4}-\d{2}-\d{2}: \S/.test(r[1])) b.push('zatwierdzenie: „RRRR-MM-DD: słowa właściciela”');
    } else if (z.status !== 'zatwierdzone') b.push(`${id}: status ${z.status}, a M2 zmienia tylko zatwierdzone`);
  }
  if (b.length) koniec();
  const pola = spec === '--zatwierdz' ? { status: 'zatwierdzone', zatwierdzenie: r[1], blokada: undefined } : spec === '--blokada' ? { blokada: r[1] } : null;
  for (const [id, sha] of pary) Object.assign(po.get(id), pola ?? { status: 'naprawione-do-weryfikacji', commit: sha, blokada: undefined });
  writeFileSync(plik, JSON.stringify(p, null, 2) + '\n');
  console.log(`OK: zapisano ${pary.length}; uruchom sprawdz-plan.mjs`);
  process.exit(0);
}
const GOTOWE = ['naprawione-do-weryfikacji', 'zweryfikowane'];
const data = opt.data ?? new Date().toISOString().slice(0, 10);
const info = [];
const wyb = new Map();
for (const s of spec.split(',').map((x) => x.trim()).filter(Boolean)) {
  const m = s.match(/^partia:(\d+)$/);
  const z = po.get(s);
  if (s === 'zatwierdzone' || m) {
    const grupa = [...po.values()].filter((x) => !m || x.partia === Number(m[1]));
    for (const x of grupa) (x.status === 'zatwierdzone' ? wyb.set(x.id, x) : info.push(`${x.id}: ${x.status}, poza zakresem`));
    if (m && !grupa.length) b.push(`${s}: pusta partia`);
  } else if (!z) b.push(`${s}: brak w planie`);
  else if (GOTOWE.includes(z.status)) info.push(`${s}: ${z.status}, pominięte`);
  else if (z.status !== 'zatwierdzone') b.push(`${s}: status ${z.status}, a naprawiasz tylko zatwierdzone`);
  else wyb.set(s, z);
}
for (const z of wyb.values()) {
  if (z.rodzaj === 'P' && dec.get(z.decyzja)?.wybor == null) b.push(`${z.id}: decyzja ${z.decyzja} bez wyboru właściciela`);
  for (const n of z.zalezy_od || []) if (!wyb.has(n) && !GOTOWE.includes(po.get(n)?.status)) b.push(`${z.id}: zależy od ${n} (${po.get(n)?.status ?? 'brak'}) spoza zakresu`);
}
if (!wyb.size) b.push('pusty zakres');
if (b.length) koniec();
// Kolejność: partia, zależności, poziom, ID.
const klucz = (z) => `${String(z.partia).padStart(3, '0')} ${z.poziom} ${z.id}`;
const kolejka = [];
while (wyb.size) {
  const gotowe = [...wyb.values()].filter((z) => (z.zalezy_od || []).every((n) => !wyb.has(n))).sort((x, y) => klucz(x).localeCompare(klucz(y)));
  if (!gotowe.length) { b.push('cykl zależności w zakresie'); koniec(); }
  kolejka.push(gotowe[0]); wyb.delete(gotowe[0].id);
}
console.log('| Nr | Partia | ID | Poziom | Rodzaj | Wykonawca | Rola | Zależy od | Decyzja |\n|---|---|---|---|---|---|---|---|---|');
kolejka.forEach((z, i) => {
  const d = dec.get(z.decyzja);
  console.log(`| ${i + 1} | ${z.partia} | ${z.id} | ${z.poziom} | ${z.rodzaj} | ${z.wykonawca} | ${z.rola} | ${(z.zalezy_od || []).join(', ') || '—'} | ${d ? `${d.id} → ${d.wybor ?? `rozstrzyga ${d.rozstrzyga}`}` : '—'} |`);
});
for (const n of new Set(kolejka.map((z) => z.partia))) {
  const zp = kolejka.filter((z) => z.partia === n);
  const role = zp.filter((z) => z.wykonawca === 'rola');
  console.log(`\nPartia ${n}: zadania ${zp.length}, D ${zp.length - role.length}; STOP przed partią: ${role.length ? `tak (P/M: ${role.map((z) => z.id).join(', ')})` : 'tylko przy zmianie danych użytkownika'}`);
  for (const rola of new Set(role.map((z) => z.rola))) {
    // ID źródłowe tej roli; gdy pozycja scalona nie ma żadnego, ID planu.
    const ids = new Set(role.filter((z) => z.rola === rola).flatMap((z) => { const w = z.zrodla.filter((s) => s.startsWith(`${rola}-`)); return w.length ? w : [z.id]; }));
    const wsk = join(K, 'role', rola, 'wskaznik.md');
    const wyj = existsSync(wsk) ? `<katalog raportu z ${wsk}>/fix-${data} (C-006: sesja w repo treści)` : join(K, 'role', rola, `fix-${data}`);
    console.log(`  ${rola}: node ${opt.prompts ?? '<prompts>'}/tools/assemble.mjs ${rola} --tryb fix --wyjscie ${wyj} --galaz ${opt.galaz ?? 'naprawy/M2'}-p${n} --data ${data} --zadania ${[...ids].join(',')}`);
  }
}
// Zablokowane i zależne od nich stoją; reszta kolejki idzie.
const stoi = new Set();
for (const z of kolejka) if (z.blokada || (z.zalezy_od || []).some((n) => stoi.has(n))) { stoi.add(z.id); info.push(z.blokada ? `${z.id}: blokada „${z.blokada}”` : `${z.id}: czeka na zablokowane ${(z.zalezy_od || []).filter((n) => stoi.has(n)).join(', ')}`); }
for (const x of info) console.log('INFO', x);
console.log(`OK: zadania ${kolejka.length}, do wykonania ${kolejka.length - stoi.size}, partie ${new Set(kolejka.map((z) => z.partia)).size}`);

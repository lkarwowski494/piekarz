// Zrzuty ekranu prowadzenia (Expo web, eksport ze scratchpadu) — użycie: node zrzuty-005.mjs <url-bazowy> <katalog> <przedrostek>
// Ten sam wypiek co test 005 (app/zrzut-005 tylko w kopii web), zegar stały 1 800 000 000 000 ms (UTC) jak w teście,
// powiadomienia dozwolone (bez paska „Powiadomienia wyłączone”, jak w teście), deviceScaleFactor 1.
import { chromium } from 'playwright';
const [baza, out, przed] = process.argv.slice(2);
const b = await chromium.launch();
const wyniki = [];
for (const [w, h, gora, dol] of [[320, 568, 20, 0], [375, 667, 20, 0], [393, 852, 59, 34]]) for (const jezyk of ['pl', 'en']) for (const dwa of [false, true]) {
  if (dwa && jezyk === 'en') continue;
  const ctx = await b.newContext({ viewport: { width: w, height: h - gora - dol }, deviceScaleFactor: 1, locale: jezyk === 'en' ? 'en-US' : 'pl-PL', timezoneId: 'UTC' });
  await ctx.grantPermissions(['notifications'], { origin: baza });
  await ctx.addInitScript(() => { Object.defineProperty(Notification, 'permission', { get: () => 'granted' }); });
  const p = await ctx.newPage();
  await p.clock.setFixedTime(1_800_000_000_000);
  p.on('pageerror', (e) => console.log('BŁĄD', e.message.slice(0, 200)));
  await p.goto(`${baza}/zrzut-005?jezyk=${jezyk}${dwa ? '&dwa=1' : ''}`);
  await p.waitForSelector('[data-testid="step-warning"]', { timeout: 20000 });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  const plik = `${out}/${przed}-${w}x${h}-${jezyk}${dwa ? '-dwa' : ''}.png`;
  // Web nie ma wcięć iOS: okno = ekran minus pasek stanu i wskaźnik Home; obraz złożony z pasem stanu (kolor pasa)
  // i strefą wskaźnika Home (tło), żeby zrzut miał wymiar ekranu, a y był liczony od góry ekranu jak w teście.
  const png = (await p.screenshot()).toString('base64');
  const zl = await ctx.newPage();
  await zl.setViewportSize({ width: w, height: h });
  await zl.setContent(`<body style="margin:0"><div style="height:${gora}px;background:#1E4954"></div><img style="display:block" src="data:image/png;base64,${png}"><div style="height:${dol}px;background:#F5F5F2"></div></body>`);
  await zl.screenshot({ path: plik });
  const r = await p.evaluate((G) => {
    const q = (id) => { const e = document.querySelector(`[data-testid="${id}"]`); if (!e) return null; const x = e.getBoundingClientRect(); return [Math.round(x.top) + G, Math.round(x.bottom) + G, Math.round(x.height), Math.round(x.width)]; };
    return Object.fromEntries(['pas-zakladki', 'step-title', 'step-time', 'step-next', 'karta-kroku', 'step-warning', 'przelacznik-wypiekow', 'thumb-bar', 'next-or-finish-step-btn', 'step-undo-btn', 'step-why-btn', 'pas-wstecz-btn', 'stolnica-doctor-shortcut-btn', 'bake-plan-btn'].map((i) => [i, q(i)]));
  }, gora);
  const ost = r['step-warning'], zr = r['next-or-finish-step-btn'], prz = r['przelacznik-wypiekow'];
  const linia = `${w}x${h} ${jezyk}${dwa ? ' dwa' : ''}: ostrzeżenie dół ${ost[1]}, „Zrobione” góra ${zr[0]} → ${ost[1] <= zr[0] ? 'NAD' : 'POD'}` + (prz ? `; przełącznik góra ${prz[0]} → ostrzeżenie ${ost[1] <= prz[0] ? 'nad' : 'pod'} przełącznikiem` : '');
  console.log(linia); console.log('  ' + JSON.stringify(r));
  wyniki.push(linia);
  await ctx.close();
}
await b.close();

// zrzuty.mjs — użycie: node zrzuty.mjs <plik.html> <katalog-wyjścia> [kroje,oddzielone,przecinkami] [zapytanie, np. j=en-US&u=imp] [przyrostek] [stany,oddzielone,przecinkami] [szerokości] [motywy] [ax5: oba|nie|tak]
// Skrypt z modułu render-i-krytyka roli 04 (repo prompts). Playwright instaluj w scratchpadzie, nie w projekcie.
// Nazwane zmiany względem modułu: pathToFileURL (Windows); opcjonalne zapytanie (język, jednostki, k=tak dla „Zwiększ kontrast”) i przyrostek nazwy pliku.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
const [file, out, fonts = '', zapytanie = '', przyrostek = '', stany = '', szer = '320,390,430', motywy = 'light,dark', ax = 'oba'] = process.argv.slice(2);
const tylko = stany === '*' ? [] : stany.split(',').filter(Boolean); // '*' = wszystkie stany (PowerShell gubi pusty argument)
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: Number(process.env.DSF || 2) }); // DSF=1 dla zrzutów wzorcowych w repo (rozmiar), nazwany wyjątek
await page.goto(pathToFileURL(resolve(file)).href + (zapytanie ? '?' + zapytanie : ''));
await page.evaluate(() => document.fonts.ready);
// document.fonts.check() zwraca true także dla kroju, którego nie zadeklarowano, więc sprawdzamy listę załadowanych.
const loaded = await page.evaluate(() => [...document.fonts].filter((x) => x.status === 'loaded').map((x) => x.family.replace(/["']/g, '')));
for (const f of fonts.split(',').filter(Boolean)) {
  if (!loaded.includes(f)) {
    console.error(`BRAK KROJU: ${f} (sprawdź @font-face i pliki w docs/design/fonty/)`);
    process.exit(1);
  }
}
for (const width of szer.split(',').map(Number)) {
  for (const theme of motywy.split(',')) {
    for (const ax5 of ax === 'oba' ? [false, true] : [ax === 'tak']) {
      await page.evaluate(([t, w, big]) => {
        const r = document.documentElement;
        r.dataset.theme = t;
        r.style.setProperty('--w', w + 'px');
        r.style.setProperty('--dt-tytul', big ? '1.8' : '1');
        r.style.setProperty('--dt-tresc', big ? '3.1' : '1');
      }, [theme, width, ax5]);
      for (const el of await page.locator('[data-ekran]').all()) {
        const name = await el.getAttribute('data-ekran');
        if (tylko.length && !tylko.includes(name)) continue;
        const path = `${out}/${basename(file, '.html')}-${name}${przyrostek ? '-' + przyrostek : ''}-${width}-${theme}${ax5 ? '-ax5' : ''}.png`;
        await el.screenshot({ path });
        console.log(path);
      }
    }
  }
}
await browser.close();

// slowa.mjs <pliki.html…> — 320 pt AX5: (1) elementy wychodzące poza ekran, (2) słowa szersze niż dostępny wiersz (muszą się złamać)
// Uruchamiaj z katalogu z Playwrightem (scratchpad), ścieżki bezwzględne — jak zrzuty.mjs (moduł render-i-krytyka). D-142.
import { chromium } from 'playwright'; import { resolve } from 'node:path'; import { pathToFileURL } from 'node:url';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
let poza = 0; const dlugie = new Set();
for (const f of process.argv.slice(2)) {
  await p.goto(pathToFileURL(resolve(f)).href); await p.evaluate(() => document.fonts.ready);
  const w = await p.evaluate(() => { const r = document.documentElement; r.style.setProperty('--w', '320px'); r.style.setProperty('--dt-tytul', '1.8'); r.style.setProperty('--dt-tresc', '3.1');
    const c = document.createElement('canvas').getContext('2d'); const out = { poza: [], dlugie: [] };
    for (const m of document.querySelectorAll('main')) { const mr = m.getBoundingClientRect();
      for (const el of m.querySelectorAll('*')) { const tekst = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' ').trim(); if (!tekst) continue;
        const r = el.getBoundingClientRect(); if (r.right > mr.right + 1 || r.left < mr.left - 1) out.poza.push(m.dataset.ekran + ': ' + tekst.slice(0, 30));
        const cs = getComputedStyle(el); c.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const szer = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        for (const s of tekst.split(/\s+/)) if (szer > 0 && c.measureText(s).width > szer + 0.5) out.dlugie.push(s); } }
    return out; });
  w.poza.forEach((x) => console.log('POZA', f.split('/').pop(), x)); poza += w.poza.length; w.dlugie.forEach((x) => dlugie.add(x));
}
await b.close(); console.log('poza ekranem:', poza); console.log('słowa dłuższe niż wiersz:', [...dlugie].join(', ') || 'brak');

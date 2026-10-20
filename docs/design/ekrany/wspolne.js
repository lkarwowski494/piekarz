// Wspólny skrypt makiet E3 (kierunek A). Język i jednostki z adresu: ?j=pl|en-US|<kod>&u=met|imp&k=tak (zwiększony kontrast).
// Teksty PL są w HTML (data-t = klucz); przekłady w teksty.js (window.TEKSTY[kod][klucz]). Masy w gramach (data-g), temperatury w °C (data-c), godziny 24 h (data-h).
function START() {
  const q = new URLSearchParams(location.search);
  const J = q.get('j') || 'pl', U = q.get('u') || (J === 'en-US' ? 'imp' : 'met');
  if (q.get('k') === 'tak') document.documentElement.dataset.kontrast = 'tak';
  document.documentElement.lang = J;
  const slownik = (window.TEKSTY && window.TEKSTY[J]) || {};
  const dzies = J === 'pl' || !/^en/.test(J) ? ',' : '.';
  const liczba = (x, d) => x.toFixed(d).replace('.', dzies);
  // 1 g = 0,03527396195 oz (stała z src/lib/unit-converter.ts); °F = °C × 9/5 + 32
  const masa = (g) => {
    if (U === 'met') return g >= 1000 && g % 1 === 0 && g >= 10000 ? liczba(g / 1000, 1) + ' kg' : (g < 10 && g % 1 ? liczba(g, 1) : Math.round(g)) + ' g';
    const oz = g * 0.03527396195;
    if (oz >= 16) { const lb = Math.floor(oz / 16); return `${lb} lb ${liczba(oz - lb * 16, 1)} oz`; }
    return liczba(oz, oz < 1 ? 2 : 1) + ' oz';
  };
  const temp = (c) => U === 'met' ? `${Math.round(c)} °C` : `${Math.round(c * 9 / 5 + 32)} °F`;
  const godz = (h) => {
    if (J !== 'en-US') return h;
    let [a, b] = h.split(':').map(Number); const pm = a >= 12; a = a % 12 || 12; return `${a}:${String(b).padStart(2, '0')} ${pm ? 'PM' : 'AM'}`;
  };
  window.FMT = { masa, temp, godz, J, U };
  const wstaw = (s) => s.replace(/\{g:([\d.]+)\}/g, (_, v) => masa(+v)).replace(/\{c:([\d.]+)\}/g, (_, v) => temp(+v)).replace(/\{h:(\d+:\d+)\}/g, (_, v) => godz(v));
  for (const el of document.querySelectorAll('[data-t]')) {
    const k = el.dataset.t; const s = slownik[k];
    el.innerHTML = wstaw(s !== undefined ? s : el.innerHTML);
  }
  for (const el of document.querySelectorAll('[data-g]')) el.textContent = masa(+el.dataset.g);
  for (const el of document.querySelectorAll('[data-c]')) el.textContent = temp(+el.dataset.c);
  for (const el of document.querySelectorAll('[data-h]')) el.textContent = godz(el.dataset.h);
  for (const el of document.querySelectorAll('[data-u]')) el.classList.toggle('wyb', el.dataset.u === U);
  for (const el of document.querySelectorAll('[data-ikona]')) el.innerHTML = IKONY[el.dataset.ikona] || '';
  for (const svg of document.querySelectorAll('svg.spirala')) spirala(svg);
}

function IKONA(p, w = 24) { return `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`; }
var IKONY = {
  wstecz: IKONA('<path d="M15 5l-7 7 7 7"/>', 20),
  ustawienia: IKONA('<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M5.5 18.5l1.8-1.8M16.7 7.3l1.8-1.8"/>'),
  ekran: IKONA('<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><circle cx="12" cy="9" r="2.2" fill="currentColor"/>', 20),
  dzwonekWyl: IKONA('<path d="M6 16V11a6 6 0 0 1 10-4.5M18 11v5l1.5 2H6"/><path d="M10 21h4"/><path d="M3 3l18 18"/>', 20),
  zamek: IKONA('<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>', 20),
  blad: IKONA('<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5"/>', 20),
  info: IKONA('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>', 20),
  chmura: IKONA('<path d="M7 18h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.4 1.5A3.3 3.3 0 0 0 7 18z"/><path d="M4 4l16 16"/>', 20),
  sloik: IKONA('<rect x="6" y="6" width="12" height="15" rx="2.5"/><path d="M8 3h8v3H8z"/><path d="M6 14h12"/>', 28),
  bochenek: IKONA('<path d="M3 15c0-5 4-8 9-8s9 3 9 8v2H3z"/><path d="M8 10l2 3M12 9l2 3M16 10l2 3"/>', 28),
  pizza: IKONA('<path d="M12 21L3.5 6a14 14 0 0 1 17 0z"/><circle cx="11" cy="10" r="1.3"/><circle cx="14" cy="14" r="1.3"/>', 28),
  dzis: IKONA('<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>'),
  receptury: IKONA('<path d="M5 3.5h11a3 3 0 0 1 3 3v14H8a3 3 0 0 1-3-3z"/><path d="M9 8h6M9 12h6"/>'),
  zakwasy: IKONA('<rect x="6" y="7" width="12" height="14" rx="2.5"/><path d="M8 3.5h8V7H8z"/><path d="M6 13h12"/>'),
  dziennik: IKONA('<path d="M4 5h16v15H4z"/><path d="M8 3v4M16 3v4M4 10h16"/>'),
  plus: IKONA('<path d="M12 5v14M5 12h14"/>', 20),
  gwiazda: IKONA('<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"/>', 32),
  gwiazdaPelna: '<svg width="32" height="32" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" fill="currentColor"/></svg>',
  sprawdz: IKONA('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 22),
  kwadrat: IKONA('<rect x="4" y="4" width="16" height="16" rx="4"/>', 22),
  para: '<svg viewBox="0 0 30 30" aria-hidden="true"><path d="M15 2 L29 27 H1 Z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M10.5 22c1.5-2-1.5-3.5 0-5.5M15 22c1.5-2-1.5-3.5 0-5.5M19.5 22c1.5-2-1.5-3.5 0-5.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  plesn: '<svg viewBox="0 0 30 30" aria-hidden="true"><path d="M15 2 L29 27 H1 Z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M15 10v8M15 21.5v.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
  ksiezyc: IKONA('<path d="M19 14.5A8 8 0 1 1 9.5 5a6.5 6.5 0 0 0 9.5 9.5z"/>', 20),
  // menu „Więcej” receptury (057, DEC-09 a); na iOS symbole SF: ellipsis.circle, doc.on.doc, square.and.arrow.up, trash
  wiecej: IKONA('<circle cx="12" cy="12" r="9"/><circle cx="7.8" cy="12" r=".9" fill="currentColor"/><circle cx="12" cy="12" r=".9" fill="currentColor"/><circle cx="16.2" cy="12" r=".9" fill="currentColor"/>', 26),
  kopiuj: IKONA('<rect x="8" y="8" width="11" height="13" rx="2"/><path d="M5 16V5a2 2 0 0 1 2-2h8"/>', 22),
  udostepnij: IKONA('<path d="M12 3v12M7.5 7.5L12 3l4.5 4.5"/><path d="M6 11H5v10h14V11h-1"/>', 22),
  kosz: IKONA('<path d="M4 7h16M9 7V4h6v3M6.5 7l1 14h9l1-14"/>', 22),
};

// Spirala koszyka (element firmowy). data-kroki: JSON [[nazwa, min, czynny, noc]], data-teraz: minuty od startu, data-gotowe: tekst godziny.
function spirala(svg) {
  const kroki = JSON.parse(svg.dataset.kroki || 'null') || SPIRALA_DOMYSLNA;
  const teraz = +svg.dataset.teraz; const mala = svg.dataset.mala === 'tak';
  const dl = (k) => Math.min(k[1], 180); const sumaR = kroki.reduce((s, k) => s + dl(k), 0);
  const pozycja = (min) => { let t = 0, r = 0; for (const k of kroki) { if (min < t + k[1]) return (r + dl(k) * (min - t) / k[1]) / sumaR; t += k[1]; r += dl(k); } return 1; };
  const P = []; let L = 0, prev = null;
  const zwoje = kroki.length <= 2 ? 1.6 : 8.3; // jeden cykl zakwasu: niecałe dwa zwoje
  for (let t = 0.9 * Math.PI; t <= (0.9 + zwoje) * Math.PI; t += 0.01) {
    const r = 10 + (88 / ((0.9 + zwoje) * Math.PI)) * t; const x = r * Math.cos(t - Math.PI / 2), y = r * Math.sin(t - Math.PI / 2);
    if (prev) L += Math.hypot(x - prev[0], y - prev[1]); P.push([x, y, L]); prev = [x, y];
  }
  const LMAX = P[P.length - 1][2];
  const odc = (a, b) => P.filter((q) => q[2] >= a * LMAX && q[2] <= b * LMAX).map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' ');
  let h = '', t0 = 0, nr = 0; const g = 0.006, sk = mala ? 1.4 : 1;
  kroki.forEach((k, i) => {
    const a = pozycja(t0), b = pozycja(t0 + k[1] - 0.001);
    const zrob = t0 + k[1] <= teraz, biez = t0 <= teraz && teraz < t0 + k[1];
    if (biez) nr = i;
    const kol = zrob ? 'var(--ratan)' : k[3] ? 'var(--nocDane)' : 'var(--ratanSzary)';
    const w = (biez ? 9 : zrob ? 7 : 3) * sk;
    h += `<path d="${odc(a + g, b - g)}" fill="none" stroke="${kol}" stroke-width="${w}" stroke-linecap="round"${k[3] && !zrob ? ` stroke-dasharray="${2 * sk} ${5 * sk}"` : ''}/>`;
    if (biez) h += `<path d="${odc(a + g, a + (b - a) * (teraz - t0) / k[1])}" fill="none" stroke="var(--tusz)" stroke-width="${9 * sk}" stroke-linecap="round"/>`;
    t0 += k[1];
  });
  const q = P.find((x) => x[2] >= pozycja(Math.min(teraz, t0 - 0.01)) * LMAX) || P[P.length - 1];
  h += `<circle cx="${q[0]}" cy="${q[1]}" r="${7 * sk}" fill="var(--tlo)" stroke="var(--tusz)" stroke-width="${3 * sk}"/>`;
  const e = P[P.length - 1]; h += `<circle cx="${e[0]}" cy="${e[1]}" r="${4 * sk}" fill="var(--tusz)"/>`;
  svg.setAttribute('viewBox', '-110 -110 220 220'); svg.setAttribute('role', 'img');
  svg.innerHTML = h;
  if (!svg.getAttribute('aria-label')) svg.setAttribute('aria-label', `Plan: krok ${nr + 1} z ${kroki.length}, ${kroki[nr][0]}. ${svg.dataset.gotowe || ''}`);
}
var SPIRALA_DOMYSLNA = [['Rozczyn', 240], ['Mieszanie', 15, 1], ['Składanie 1 z 4', 30, 1], ['Składanie 2 z 4', 30, 1], ['Składanie 3 z 4', 30, 1], ['Składanie 4 z 4', 30, 1], ['Fermentacja', 150], ['Formowanie', 20, 1], ['Garowanie w lodówce', 960, 0, 1], ['Nagrzewanie pieca', 45], ['Pieczenie pod pokrywą', 20], ['Pieczenie bez pokrywy', 25], ['Studzenie', 60]];

START();

// Ikony makiet M3 E3 (D-139): ścieżki z aplikacji (src/components/start/IkonaStartu.tsx, TabIcon.tsx),
// nowe w tym samym stylu: siatka 24, kreska 1.8, zaokrąglone końce (warsztat: jedna grubość kreski).
// Użycie w HTML: <i data-i="sloik"></i> → SVG; klasa elementu przechodzi na SVG.
const IK = {
  sloik: '<rect x="6" y="6" width="12" height="15" rx="2.5"/><path d="M8 3h8v3H8z"/><path d="M6 14h12"/>',
  bochenek: '<path d="M3 15c0-5 4-8 9-8s9 3 9 8v2H3z"/><path d="M8 10l2 3M12 9l2 3M16 10l2 3"/>',
  pizza: '<path d="M12 21L3.5 6a14 14 0 0 1 17 0z"/><circle cx="11" cy="10" r="1.3"/><circle cx="14" cy="14" r="1.3"/>',
  zamek: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  zegar: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
  wstecz: '<path d="M15 5l-7 7 7 7"/>', dalej: '<path d="M9 5l7 7-7 7"/>',
  slonce: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M5.5 18.5l1.8-1.8M16.7 7.3l1.8-1.8"/>',
  receptury: '<path d="M5 3.5h11a3 3 0 0 1 3 3v14H8a3 3 0 0 1-3-3z"/><path d="M9 8h6M9 12h6"/>',
  kalendarz: '<path d="M4 5h16v15H4z"/><path d="M8 3v4M16 3v4M4 10h16"/>',
  tarcza: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
  waga: '<path d="M4 20h16l-2-9H6z"/><circle cx="12" cy="7" r="3"/><path d="M12 6v1.5"/>',
  termometr: '<path d="M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0z"/><path d="M12 9v7"/>',
  proporcje: '<path d="M4 20L20 4"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
  lista: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
  miska: '<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M8 7c0-1.5 1-2.5 2-3M13 7c0-1.5 1-2.5 2-3"/>',
  ksiazka: '<path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1z"/><path d="M12 6v14"/>',
  gwiazda: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"/>',
  dzwonek: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  dysk: '<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
  jezyk: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c-3 3-3 14 0 17M12 3.5c3 3 3 14 0 17"/>',
  koszyk: '<path d="M4 9h16l-1.5 11h-13z"/><path d="M8 9l4-5 4 5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', zebatka: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
  uwaga: '<path d="M12 3.5l9 16H3z"/><path d="M12 10v4.5M12 17h.01"/>',
  ptaszek: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', menu: '<circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/>',
};
document.querySelectorAll('i[data-i]').forEach((el) => {
  const n = el.dataset.i;
  el.outerHTML = `<svg viewBox="0 0 24 24" class="${el.className}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IK[n] || ''}</svg>`;
});
// Pasek zakładek wspólny: <nav data-zakladki="dzis|receptury|zakwasy|dziennik"></nav>
document.querySelectorAll('nav[data-zakladki]').forEach((el) => {
  const w = el.dataset.zakladki;
  const z = [['dzis', 'zegar', 'Dziś'], ['receptury', 'receptury', 'Receptury'], ['zakwasy', 'sloik', 'Zakwasy'], ['dziennik', 'kalendarz', 'Dziennik']];
  el.className = 'zakladki';
  el.innerHTML = z.map(([k, i, t]) => `<a class="${k === w ? 'wyb' : ''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${IK[i]}</svg>${t}</a>`).join('');
});

#!/usr/bin/env node
// Kryteria BRD identyfikowalne w testach (M1-audytor-generalny-067; 07-jakosc-014). Bez zależności.
// Zbiera ID BR, które mają kryteria akceptacji w docs/brd/*.md (bez docs/brd/archiwum/), oraz ID BR
// z nazw testów (describe / it / test) w tests/** i src/**/__tests__/**. Wypisuje BR bez testu.
// Kod 1: jest BR bez testu spoza listy pełnych wyjątków (scripts/br-wyjatki.json) albo lista wyjątków jest
// błędna (ID spoza BRD, brak powodu lub źródła). Kod 0: każde BR z kryterium ma test albo pełny wyjątek.
// Użycie: node scripts/br-bez-testu.mjs [--root <katalog>] [--json]
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const args = process.argv.slice(2);
const iRoot = args.indexOf('--root');
const root = iRoot >= 0 ? args[iRoot + 1] : process.cwd();
const jakoJson = args.includes('--json');

const ID = /BR-[A-Z]+-\d{3}/g;

// 1. BR z kryteriami: nagłówek „### BR-…” i w jego sekcji wiersz „Kryteria akceptacji”.
function brZBrd() {
  const dir = join(root, 'docs', 'brd');
  const wynik = new Map();
  for (const plik of readdirSync(dir).filter((f) => f.endsWith('.md')).sort()) {
    const linie = readFileSync(join(dir, plik), 'utf8').split(/\r?\n/);
    let biezace = null;
    for (const linia of linie) {
      const n = /^#{2,4}\s+\**(BR-[A-Z]+-\d{3})\b/.exec(linia);
      if (n) {
        biezace = n[1];
        continue;
      }
      if (/^#{1,4}\s/.test(linia)) biezace = null;
      if (biezace && /Kryteria akceptacji/.test(linia)) wynik.set(biezace, `docs/brd/${plik}`);
    }
  }
  return wynik;
}

// 2. Pliki testów: tests/** oraz src/**/__tests__/** (jak testMatch w jest.config.js).
function plikiTestow() {
  const wynik = [];
  const chodz = (dir, wTestach) => {
    if (!existsSync(dir)) return;
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
      const p = join(dir, e.name);
      if (e.isDirectory()) chodz(p, wTestach || e.name === '__tests__');
      else if (wTestach && /\.test\.[jt]sx?$/.test(e.name)) wynik.push(p);
    }
  };
  chodz(join(root, 'tests'), true);
  chodz(join(root, 'src'), false);
  return wynik.sort();
}

// 3. Nazwy testów: pierwszy argument napisowy describe / it / test (także .each, .only, .concurrent).
const NAZWA =
  /\b(?:describe|it|test)(?:\s*\.\s*(?:each|only|concurrent|failing))*(?:\s*(?:\([^()]*\)|`[^`]*`))?\s*\(\s*(['"`])((?:\\[\s\S]|(?!\1)[\s\S])*?)\1/g;

function brZTestow(pliki) {
  const wynik = new Map();
  for (const p of pliki) {
    const kod = readFileSync(p, 'utf8');
    for (const m of kod.matchAll(NAZWA)) {
      for (const id of m[2].match(ID) ?? []) {
        const rel = relative(root, p).split(sep).join('/');
        if (!wynik.has(id)) wynik.set(id, new Set());
        wynik.get(id).add(rel);
      }
    }
  }
  return wynik;
}

function wyjatki() {
  const p = join(root, 'scripts', 'br-wyjatki.json');
  if (!existsSync(p)) return { lista: [], bledy: [] };
  const dane = JSON.parse(readFileSync(p, 'utf8'));
  const lista = Array.isArray(dane?.wyjatki) ? dane.wyjatki : [];
  const bledy = [];
  for (const w of lista) {
    if (typeof w?.id !== 'string' || !/^BR-[A-Z]+-\d{3}$/.test(w.id)) bledy.push(`wyjątek bez poprawnego id: ${JSON.stringify(w)}`);
    if (typeof w?.powod !== 'string' || !w.powod.trim()) bledy.push(`wyjątek ${w?.id} bez powodu`);
    if (typeof w?.zrodlo !== 'string' || !/(F-\d+|D-\d+|DEC-\d+|NFR-[A-Z]+-\d+|M1-audytor-generalny-\d+)/.test(w.zrodlo))
      bledy.push(`wyjątek ${w?.id} bez źródła (F-nn, D-nn, DEC-nn, NFR-… albo ID zadania)`);
  }
  return { lista, bledy };
}

const brd = brZBrd();
const testy = brZTestow(plikiTestow());
const { lista: listaWyjatkow, bledy } = wyjatki();
for (const w of listaWyjatkow) if (!brd.has(w.id)) bledy.push(`wyjątek ${w.id} nie jest BR z kryterium w docs/brd/`);
// Wyjątek pełny zwalnia BR z testu. Wpis „czesciowe”: true opisuje tylko scenariusze bez testu
// (znaleziska) i NIE zwalnia BR z testu z ID w nazwie.
const idWyjatkow = new Set(listaWyjatkow.filter((w) => w.czesciowe !== true).map((w) => w.id));
const idCzesciowych = new Set(listaWyjatkow.filter((w) => w.czesciowe === true).map((w) => w.id));

const zTestem = [...brd.keys()].filter((id) => testy.has(id)).sort();
const bezTestu = [...brd.keys()].filter((id) => !testy.has(id)).sort();
const bezTestuBezWyjatku = bezTestu.filter((id) => !idWyjatkow.has(id));
const wyjatkiZTestem = [...idWyjatkow].filter((id) => testy.has(id)).sort();

if (jakoJson) {
  const mapa = Object.fromEntries(zTestem.map((id) => [id, [...testy.get(id)].sort()]));
  console.log(JSON.stringify({ brd: brd.size, wyjatki: [...idWyjatkow].sort(), czesciowe: [...idCzesciowych].sort(),zTestem, bezTestu, bezTestuBezWyjatku, wyjatkiZTestem, bledy, mapa }, null, 2));
} else {
  console.log(`br-bez-testu: ${brd.size} BR z kryteriami, ${zTestem.length} z testem, ${bezTestu.length} bez testu, wyjątków ${idWyjatkow.size}`);
  for (const id of bezTestu) {
    const w = idWyjatkow.has(id) ? listaWyjatkow.find((x) => x.id === id) : undefined;
    console.log(`  ${w ? 'wyjątek' : 'BRAK   '} ${id} (${brd.get(id)})${w ? `: ${w.powod} [${w.zrodlo}]` : ''}`);
  }
  for (const id of wyjatkiZTestem) console.log(`  uwaga: ${id} ma pełny wyjątek i test — wyjątek do usunięcia albo oznaczenia „czesciowe”`);
  console.log(`  scenariusze bez testu (znaleziska, „czesciowe”): ${[...idCzesciowych].sort().join(', ') || 'brak'}`);
  for (const b of bledy) console.error(`  błąd: ${b}`);
}

if (bezTestuBezWyjatku.length || bledy.length) {
  if (!jakoJson) console.error(`br-bez-testu: ${bezTestuBezWyjatku.length} BR bez testu i bez wyjątku`);
  process.exit(1);
}

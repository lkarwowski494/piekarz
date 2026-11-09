import json, re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from tl import T, KOD, PL, EN
R = '/home/user/piekarz'
KAT = f'{R}/docs/wydanie/metadane'
ADN = 'przekład rola 10 (claude-opus-5-5, w sesji 2026-11-09; drugi przegląd AI i przegląd natywny: nieodbyte, DEC-06)'
NOTE = f'sekcja receptur: 26 receptur bazowych, 11 z planem i prowadzeniem (DEC-01 a, D-286; liczby z kodu) i nowa sekcja „wersja na drożdżach i maszyna do chleba” (F-72, D-154; godzina startu oznaczona Pro, D-152) — {ADN} [M1-audytor-generalny-080; 10-wydanie-004]'
NOTE_SRC = 'sekcja receptur: 26 receptur bazowych, 11 z planem i prowadzeniem (DEC-01 a, D-286) i nowa sekcja o wersji na drożdżach i maszynie do chleba (F-72, D-154) — źródło PL/EN docs/app-store-metadata-v2.md [M1-audytor-generalny-080; 10-wydanie-004]'
GB = lambda s: s.replace('flavor', 'flavour').replace('discoloration', 'discolouration')

def zmien(opis, t):
    p = opis.split('\n\n')
    assert len(p) == 11, len(p)
    h, body = p[1].split('\n', 1)
    m = re.match(r'^[^.。]*?[.。]', body)
    assert m and re.search(r'(?<!\d)15(?!\d)', m.group(0)), (m and m.group(0))
    p[1] = h + '\n' + t['first'] + body[m.end():]
    p.insert(2, t['machine'])
    return '\n\n'.join(p)

# Skróty istniejących zdań, żeby opis z nową sekcją zmieścił się w 4000 znaków (fr, it) — bez zmiany treści.
SKROTY = {
 'fr': [
  ("Vous pouvez annuler une étape validée par erreur, et l'application revient à l'étape en cours quand vous la rouvrez.", "Une étape validée par erreur s'annule, et l'application revient à l'étape en cours à la réouverture."),
  ("ou votre propre recette\u00a0;", "ou la vôtre\u00a0;"),
  ("Le pain de seigle (plus de la moitié de la farine est de la farine de seigle) a ses propres étapes", "Le pain de seigle (plus de moitié de farine de seigle) a ses propres étapes"),
  ("Vous pouvez exporter toutes vos données dans un fichier et les importer depuis un fichier, et exporter l'historique de vos fournées au format CSV.", "Vous exportez et importez toutes vos données par fichier, et l'historique de vos fournées en CSV."),
 ],
 'it': [
  ("Puoi annullare un passaggio confermato per errore e, quando riapri l'app, torni al passaggio in corso.", "Un passaggio confermato per errore si annulla e, riaprendo l'app, torni al passaggio in corso."),
  ("il programma della macchina, e l'ora di avvio", "il programma, e l'ora di avvio"),
  ("Il pane di segale (più di metà della farina è farina di segale) ha passaggi propri, senza pieghe di rinforzo.", "Il pane di segale (oltre metà della farina è di segale) ha passaggi propri, senza pieghe."),
  ("Puoi esportare tutti i dati in un file e importarli da un file, ed esportare la cronologia delle sfornate in CSV.", "Esporti e importi tutti i dati con un file, e la cronologia delle sfornate in CSV."),
  ("per ottenere la temperatura desiderata dell'impasto.", "per la temperatura dell'impasto che desideri."),
 ],
}
NOTE_SKROT = 'skróty bez zmiany treści, żeby opis z nową sekcją zmieścił się w 4000 znaków: {} [M1-audytor-generalny-080]'

def zapisz(kod, d):
    with open(f'{KAT}/{kod}.json', 'w', encoding='utf8') as f:
        json.dump(d, f, ensure_ascii=False, indent=2); f.write('\n')

en_opis = None
for f in sorted(os.listdir(KAT)):
    kod = f[:-5]; d = json.load(open(f'{KAT}/{f}', encoding='utf8'))
    if kod == 'pl':
        d['opis'] = zmien(d['opis'], PL); d['poprawki'].append(NOTE_SRC)
    elif kod.startswith('en-'):
        continue
    else:
        j = KOD.get(kod, kod)
        d['opis'] = zmien(d['opis'], T[j]); d['poprawki'].append(NOTE)
        for a, b in SKROTY.get(j, []):
            assert d['opis'].count(a) == 1, (kod, a)
            d['opis'] = d['opis'].replace(a, b)
        if j in SKROTY: d['poprawki'].append(NOTE_SKROT.format('; '.join(f'„{a}” → „{b}”' for a, b in SKROTY[j])))
    zapisz(kod, d)
us = json.load(open(f'{KAT}/en-US.json', encoding='utf8'))
us['opis'] = zmien(us['opis'], EN); us['poprawki'].append(NOTE_SRC); zapisz('en-US', us)
for kod in ['en-GB', 'en-AU', 'en-CA']:
    d = json.load(open(f'{KAT}/{kod}.json', encoding='utf8'))
    nowy = GB(us['opis'])
    d['opis'] = nowy; d['poprawki'].append(NOTE_SRC + ' (pisownia lokalna jak §5.1.1)'); zapisz(kod, d)

# Źródło przekładu
doc_p = f'{R}/docs/app-store-metadata-v2.md'
doc = open(doc_p, encoding='utf8').read()
zn = lambda s: len(s)
def blok(doc, naglowek_re, tekst):
    m = re.search(naglowek_re + r'[^\n]*\n\n```text\n([\s\S]*?)\n```', doc)
    assert m, naglowek_re
    return doc[:m.start(1)] + tekst + doc[m.end(1):]
pl = json.load(open(f'{KAT}/pl.json', encoding='utf8'))['opis']
gb = json.load(open(f'{KAT}/en-GB.json', encoding='utf8'))['opis']
doc = blok(doc, r'### 1\.2\. Pełny Opis Aplikacji', pl)
doc = blok(doc, r'### 2\.2\. Pełny Opis Aplikacji', us['opis'])
doc = blok(doc, r'#### 5\.1\.1\. Pełny opis en-GB, en-AU, en-CA', gb)
fmt = lambda n: f'{n:,}'.replace(',', ' ')
doc = re.sub(r'(### 1\.2\. Pełny Opis Aplikacji \(Description PL — )[\d ]+( / 4 000 znaków\))', lambda m: m.group(1) + fmt(len(pl)) + m.group(2), doc)
doc = re.sub(r'(### 2\.2\. Pełny Opis Aplikacji \(Description EN — )[\d ]+( / 4 000 znaków\))', lambda m: m.group(1) + fmt(len(us['opis'])) + m.group(2), doc)
doc = re.sub(r'(#### 5\.1\.1\. Pełny opis en-GB, en-AU, en-CA \(Description — )[\d ]+( / 4 000 znaków\))', lambda m: m.group(1) + fmt(len(gb)) + m.group(2), doc)
open(doc_p, 'w', encoding='utf8').write(doc)
for f in sorted(os.listdir(KAT)):
    d = json.load(open(f'{KAT}/{f}', encoding='utf8')); print(f, len(d['opis']))

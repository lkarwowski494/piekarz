import json, re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from tl import T, KOD, PL, EN
R = '/home/user/piekarz'
KAT = f'{R}/docs/wydanie/metadane'
ADN = 'przekład rola 10 (claude-opus-5-5, w sesji 2026-11-09; drugi przegląd AI i przegląd natywny: nieodbyte, DEC-06)'
NOTE = f'oznaczenie „(Pro)” przy funkcjach płatnych (DEC-05 a, D-286; 2.3.2): tekst promocyjny, nagłówek sekcji planu, zaczyn, sekcja zakwasów (opieka nad zakwasem w jednym zdaniu z oznaczeniem), statystyki dziennika — {ADN} [M1-audytor-generalny-078; 02-monetyzacja-001, 10-wydanie-005]'
NOTE_SRC = 'oznaczenie „(Pro)” przy funkcjach płatnych (DEC-05 a, D-286; 2.3.2) w tekście promocyjnym i sekcjach opisu — źródło PL/EN docs/app-store-metadata-v2.md [M1-audytor-generalny-078; 02-monetyzacja-001, 10-wydanie-005]'
GB = lambda s: s.replace('flavor', 'flavour').replace('discoloration', 'discolouration')

def jeden(s, a, b, kod):
    assert s.count(a) == 1, (kod, a, s.count(a))
    return s.replace(a, b)

def zmien(d, t, kod, en=False):
    p = d['opis'].split('\n\n')
    assert len(p) == 11, (kod, len(p))
    p[1] = jeden(p[1], *t['zaczyn'], kod)
    h, body = p[2].split('\n', 1)
    p[2] = h + ' (Pro)\n' + body
    p[4] = t['zakwasy']
    p[6] = jeden(p[6], *t['stats'], kod)
    if en: p[0] = jeden(p[0], *t['intro'], kod)
    d['opis'] = '\n\n'.join(p)

def zapisz(kod, d):
    with open(f'{KAT}/{kod}.json', 'w', encoding='utf8') as f:
        json.dump(d, f, ensure_ascii=False, indent=2); f.write('\n')

for f in sorted(os.listdir(KAT)):
    kod = f[:-5]; d = json.load(open(f'{KAT}/{f}', encoding='utf8'))
    if kod.startswith('en-'): continue
    t = PL if kod == 'pl' else T[KOD.get(kod, kod)]
    zmien(d, t, kod); d['tekstPromocyjny'] = t['promo']
    d['poprawki'].append(NOTE_SRC if kod == 'pl' else NOTE)
    zapisz(kod, d)
us = json.load(open(f'{KAT}/en-US.json', encoding='utf8'))
zmien(us, EN, 'en-US', en=True); us['tekstPromocyjny'] = EN['promo']; us['poprawki'].append(NOTE_SRC); zapisz('en-US', us)
for kod in ['en-GB', 'en-AU', 'en-CA']:
    d = json.load(open(f'{KAT}/{kod}.json', encoding='utf8'))
    d['opis'] = GB(us['opis'])
    d['tekstPromocyjny'] = EN['promo_ca'] if kod == 'en-CA' else EN['promo']
    d['poprawki'].append(NOTE_SRC + ' (pisownia lokalna jak §5.1.1)'); zapisz(kod, d)

doc_p = f'{R}/docs/app-store-metadata-v2.md'
doc = open(doc_p, encoding='utf8').read()
def blok(doc, naglowek_re, tekst):
    m = re.search(naglowek_re + r'[^\n]*\n\n```text\n([\s\S]*?)\n```', doc); assert m, naglowek_re
    return doc[:m.start(1)] + tekst + doc[m.end(1):]
pl = json.load(open(f'{KAT}/pl.json', encoding='utf8'))
gb = json.load(open(f'{KAT}/en-GB.json', encoding='utf8'))
ca = json.load(open(f'{KAT}/en-CA.json', encoding='utf8'))
doc = blok(doc, r'### 1\.2\. Pełny Opis Aplikacji', pl['opis'])
doc = blok(doc, r'### 2\.2\. Pełny Opis Aplikacji', us['opis'])
doc = blok(doc, r'#### 5\.1\.1\. Pełny opis en-GB, en-AU, en-CA', gb['opis'])
fmt = lambda n: f'{n:,}'.replace(',', ' ')
for re_h, n in [(r'(### 1\.2\. Pełny Opis Aplikacji \(Description PL — )[\d ]+( / 4 000 znaków\))', len(pl['opis'])),
                (r'(### 2\.2\. Pełny Opis Aplikacji \(Description EN — )[\d ]+( / 4 000 znaków\))', len(us['opis'])),
                (r'(#### 5\.1\.1\. Pełny opis en-GB, en-AU, en-CA \(Description — )[\d ]+( / 4 000 znaków\))', len(gb['opis']))]:
    doc, k = re.subn(re_h, lambda m: m.group(1) + fmt(n) + m.group(2), doc); assert k == 1
# Tekst promocyjny §1.1, §2.1, §5.1
doc, k = re.subn(r'(\| \*\*Tekst promocyjny \(Promotional Text\)\*\* \| `)[^`]*(` \| \*\*)\d+(\*\*)', lambda m: m.group(1) + pl['tekstPromocyjny'] + m.group(2) + str(len(pl['tekstPromocyjny'])) + m.group(3), doc); assert k == 1
doc, k = re.subn(r'(\| \*\*Promotional Text\*\* \| `)[^`]*(` \| \*\*)\d+(\*\*)', lambda m: m.group(1) + us['tekstPromocyjny'] + m.group(2) + str(len(us['tekstPromocyjny'])) + m.group(3), doc); assert k == 1
doc, k = re.subn(r'(\| en-GB, en-AU \| )[^|]*( \| )\d+( \|)', lambda m: m.group(1) + gb['tekstPromocyjny'] + m.group(2) + str(len(gb['tekstPromocyjny'])) + m.group(3), doc); assert k == 1
doc, k = re.subn(r'(\| en-CA \| )[^|]*( \| )\d+( \|)', lambda m: m.group(1) + ca['tekstPromocyjny'] + m.group(2) + str(len(ca['tekstPromocyjny'])) + m.group(3), doc); assert k == 1
# §5: pierwsze zdanie opisu en-*
stare = 'Baker is a sourdough bread planner: it works out your recipe amounts, plans every step back from the time you want bread ready and times each stage.'
nowe = us['opis'].split('\n')[0]
assert nowe.startswith('Baker is a sourdough bread planner') and nowe.split('. ')[0] + '.' != stare
nowe1 = re.match(r'[^.]*\.', nowe).group(0)
doc, k = re.subn(re.escape(stare) + r' \| 148 \|', nowe1 + f' | {len(nowe1)} |', doc); assert k == 4, k
open(doc_p, 'w', encoding='utf8').write(doc)
for f in sorted(os.listdir(KAT)):
    d = json.load(open(f'{KAT}/{f}', encoding='utf8')); print(f, len(d['tekstPromocyjny']), len(d['opis']))

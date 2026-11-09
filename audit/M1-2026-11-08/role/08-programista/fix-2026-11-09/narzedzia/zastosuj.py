# zastosuj.py — D-307: nazwy mąk w 33 słownikach (pliki generowane) według kanonu + wpisy w poprawki-przekladu.json
import json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from terminy import T, nazwa, kombinacja
ROOT = '/home/user/piekarz'
MAKA = re.compile(r"^Mąka (pszenna|żytnia|orkiszowa)\b.*?\btyp (\d{3,4})(?!\s*/)")
KOMB = ['Mąka pszenna typ 650 lub graham', 'Mąka żytnia (typ 720 / 2000)']
LINIA = re.compile(r"^(\s*)'((?:[^'\\]|\\.)*)'(\s*:\s*)'((?:[^'\\]|\\.)*)'(,?)$")
un = lambda s: s.replace("\\'", "'").replace('\\\\', '\\')
q = lambda s: s.replace('\\', '\\\\').replace("'", "\\'")
pp = os.path.join(ROOT, 'docs/lokalizacja/poprawki-przekladu.json')
P = json.load(open(pp))
nowe = 0
for jez in T:
    kat = os.path.join(ROOT, 'src/lib/i18n-slowniki', jez)
    for f in sorted(os.listdir(kat)):
        if not re.match(r'czesc-\d+\.ts$', f): continue
        p = os.path.join(kat, f); linie = open(p).read().split('\n'); zm = False
        for i, l in enumerate(linie):
            m = LINIA.match(l)
            if not m: continue
            k, v = un(m.group(2)), un(m.group(4))
            if k in KOMB: n = kombinacja(jez, k)
            else:
                mm = MAKA.match(k)
                if not mm: continue
                n = nazwa(jez, mm.group(1), int(mm.group(2)))
            if n == v: continue
            linie[i] = f"{m.group(1)}'{m.group(2)}'{m.group(3)}'{q(n)}'{m.group(5)}"
            P['poprawki'].append({'jezyk': jez, 'rodzaj': 'D-307', 'klucz': k, 'z': v, 'na': n,
              'powod': 'D-307 (M1-audytor-generalny-041): nazwa mąki = przekład zboża + „polski typ” + numer typu z klucza PL, nazwa handlowa po polsku; jedna mąka = jedna nazwa (docs/tresci/wektory/maki-nazwy-2026-11-09.json)'})
            zm = True; nowe += 1
        if zm: open(p, 'w').write('\n'.join(linie))
open(pp, 'w').write(json.dumps(P, ensure_ascii=False, indent=2) + '\n')
print('poprawki:', nowe)

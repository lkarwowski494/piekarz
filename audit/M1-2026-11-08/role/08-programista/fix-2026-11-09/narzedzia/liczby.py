# liczby.py <przeklad.json>... — te same liczby w przekładzie co w PL (przecinek/kropka dziesiętna i odstępy tysięcy znormalizowane)
import json, re, sys
def liczby(s):
    s = re.sub(r'(?<=\d)[\s  ](?=\d{3}\b)', '', s)
    return sorted(x.replace(',', '.') for x in re.findall(r'\d+(?:[.,]\d+)?', s))
zle = 0
for p in sys.argv[1:]:
    d = json.load(open(p))
    for j, teksty in d['jezyki'].items():
        assert len(teksty) == len(d['pl']), (p, j)
        for pl, t in zip(d['pl'], teksty):
            if liczby(pl) != liczby(t):
                zle += 1; print(f'{p.split("/")[-1]} {j}: {liczby(pl)} ≠ {liczby(t)} | {t[:90]}')
print('rozbieżności liczb:', zle)

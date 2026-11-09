# wepnij-maly-przeklad.py <przeklad.json> <opis> — nowa część słownika w każdym z 33 języków z małego przekładu M2
import json, os, re, sys
p, opis = sys.argv[1], sys.argv[2]
d = json.load(open(p))
root = '/home/user/piekarz/src/lib/i18n-slowniki'
q = lambda s: "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"
for kod, teksty in d['jezyki'].items():
    kat = os.path.join(root, kod)
    nry = sorted(int(m.group(1)) for f in os.listdir(kat) if (m := re.match(r'czesc-(\d+)\.ts$', f)))
    istn = [n for n in nry if f"źródło: {os.path.basename(p)}" in open(os.path.join(kat, f'czesc-{n}.ts')).read()]
    n = istn[0] if istn else nry[-1] + 1
    body = f"// Słownik {kod}, część {n}: {opis}\n// źródło: {os.path.basename(p)} (plik generowany przez M2; poprawka w pliku przekładu i ponowne wpięcie)\nexport const CZESC: Record<string, string> = {{\n"
    body += ''.join(f"  {q(k)}: {q(v)},\n" for k, v in zip(d['pl'], teksty)) + "};\n"
    open(os.path.join(kat, f'czesc-{n}.ts'), 'w').write(body)
    idx = os.path.join(kat, 'index.ts'); t = open(idx).read()
    if f"from './czesc-{n}'" not in t:
        t = t.replace(f"import {{ CZESC as C{n-1} }} from './czesc-{n-1}';", f"import {{ CZESC as C{n-1} }} from './czesc-{n-1}';\nimport {{ CZESC as C{n} }} from './czesc-{n}';")
        t = re.sub(rf"\.\.\.C{n-1},", f"...C{n-1}, ...C{n},", t)
        t = re.sub(r"// Słownik (\S+): \d+ części", lambda m: f"// Słownik {m.group(1)}: {n} części", t)
        open(idx, 'w').write(t)
    print(kod, n)

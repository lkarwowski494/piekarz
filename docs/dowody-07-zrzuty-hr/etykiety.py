# Wyciąga z dzienników Maestro: (1) element stuknięty przez okno-systemu (selector textRegex zaczynający się od ^(Pozwalaj),
# (2) z hierarchii ekranu przyciski okna zgody (węzeł z tekstem zawierającym nazwę aplikacji w cudzysłowie).
import json,os,re,sys
root=sys.argv[1]
wyn=set()
for dp,dn,fn in os.walk(root):
  m=re.search(r'iphone-(\d\.\d-\d+)-([A-Za-z-]+?)-0\d',dp)
  if not m: continue
  czesc,lok=m.group(1),m.group(2)
  for f in fn:
    p=os.path.join(dp,f)
    if f=='maestro.log' and dp.endswith('logs'):
      ok=False
      for line in open(p,errors='replace'):
        if 'evaluatedCommand' in line and 'tapOnElementCommand' in line:
          ok = 'textRegex=^(Pozwalaj' in line
        if ok and 'Tapping on element' in line:
          a=re.search(r'accessibilityText=([^,]*), title=([^,]*), value=([^,]*), text=([^,]*),',line)
          if re.search(r'resource-id=[^,]+,',line): continue
          wyn.add((lok,czesc,'stuknięty',a.group(1) or a.group(4),os.path.relpath(p,root)))
    if f.endswith('.json') and 'screen-hierarchy' in dp:
      h=json.load(open(p))
      txt=[]
      def w(n):
        a=n.get('attributes',{}); t=a.get('text') or a.get('accessibilityText')
        if t: txt.append(t)
        for c in n.get('children',[]): w(c)
      w(h)
      tyt=[t for t in txt if re.search(r'[“"«„].{0,8}(Pekar|Piekarz|Baker|Crust|Bäcker|Пекар|Boulanger)',t,re.I) or ('Pekar' in t and len(t)>15)]
      if tyt:
        # przyciski: krótkie teksty po treści okna, bez procentów i paska stanu
        i=txt.index(tyt[0]); kand=[t for t in txt[i:i+14] if len(t)<30 and '%' not in t and not re.match(r'^\d\d:\d\d$',t) and t!=tyt[0]]
        wyn.add((lok,czesc,'hierarchia: '+tyt[0][:60],' | '.join(dict.fromkeys(kand)),os.path.relpath(p,root)))
for r in sorted(wyn): print('\t'.join(r))

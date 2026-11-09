#!/bin/bash
# log.sh "<wpis dziennika>" — dopisuje wiersz do sekcji Dziennik w postep-napraw.md
f=/home/user/piekarz/audit/M1-2026-11-08/postep-napraw.md
python3 - "$f" "- $(date -u +%H:%M) $1" <<'PY'
import sys; p,w=sys.argv[1],sys.argv[2]; t=open(p).read()
i=t.index('## Czekające zgody'); t=t[:i].rstrip('\n')+'\n'+w+'\n\n'+t[i:]; open(p,'w').write(t)
PY

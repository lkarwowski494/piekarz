#!/bin/bash
# kopia-k.sh "<opis>" — kopiuje stan M2 z K do drzewa audit-m1 i wypycha (zgoda właściciela 2026-11-09, D-300)
set -e
K=/home/user/piekarz/audit/M1-2026-11-08
W=/tmp/claude-0/-home-user-piekarz/bfab95c5-1113-5070-aff6-8b2979de8a21/scratchpad/wt-audit
[ -d "$W" ] || W=/tmp/claude-0/-home-user/bfab95c5-1113-5070-aff6-8b2979de8a21/scratchpad/wt-audit
cd "$W"
git pull -q --ff-only origin audit-m1/piekarz-2026-11-08 || true
mkdir -p audit/M1-2026-11-08
for f in postep-napraw.md plan-wykonania-M2-2026-11-09.md stop-p1-M2-2026-11-09.md nowe-znaleziska-M2.md plan-napraw.json narzedzia dowody/M2 naprawy role zrzuty/M2 M2-koordynator-napraw-2026-11-09.md; do
  [ -e "$K/$f" ] && { mkdir -p "audit/M1-2026-11-08/$(dirname $f)"; cp -r "$K/$f" "audit/M1-2026-11-08/$(dirname $f)/"; }
done
git add -f audit
if git diff --cached --quiet; then echo "bez zmian"; exit 0; fi
git commit -q -m "[M2 fix] stan: $1

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01T66VBy48fpemgf7wQvUkU4"
git push -q origin audit-m1/piekarz-2026-11-08
git log --oneline -1

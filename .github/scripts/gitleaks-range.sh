#!/bin/bash
set -euo pipefail

# NFR-SEC-005: Wykrywanie sekretów przez gitleaks z uwzględnieniem merge commitów (-m)
exec gitleaks detect --verbose --log-opts="-m --all"

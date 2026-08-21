#!/bin/bash
# Runs both projects' verification suites. Backend first, because it is the one that needs
# Docker and is therefore the more likely to fail on a fresh machine.
#
# Each subproject script summarises its own results; this only reports which halves passed.
set -uo pipefail
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

WS_RC=0
FE_RC=0

echo "########################## BACKEND (WS) ##########################"
./WS/scripts/verify.sh || WS_RC=$?

echo
echo "########################## FRONTEND (FE) #########################"
./FE/scripts/verify.sh || FE_RC=$?

echo
echo "########################## RESULT ################################"
[ "$WS_RC" = 0 ] && echo "  backend  (WS): PASS" || echo "  backend  (WS): FAIL"
[ "$FE_RC" = 0 ] && echo "  frontend (FE): PASS" || echo "  frontend (FE): FAIL"

if [ "$WS_RC" = 0 ] && [ "$FE_RC" = 0 ]; then
  echo "ALL CHECKS PASS"
  exit 0
fi
exit 1

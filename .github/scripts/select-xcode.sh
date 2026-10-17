#!/bin/bash
set -euo pipefail

WANT_MAJOR="${1:-16}"
echo "==> Szukam Xcode $WANT_MAJOR w /Applications..."

CANDIDATE=$(ls -d "/Applications/Xcode_${WANT_MAJOR}"*.app 2>/dev/null | sort -V | tail -n 1 || true)
if [ -z "$CANDIDATE" ] && [ -d "/Applications/Xcode.app" ]; then
  CANDIDATE="/Applications/Xcode.app"
fi

if [ -z "$CANDIDATE" ] || [ ! -d "$CANDIDATE" ]; then
  echo "::error::Nie znaleziono instalacji Xcode ${WANT_MAJOR}.x w /Applications:" >&2
  ls -d /Applications/Xcode*.app 2>/dev/null >&2 || true
  exit 1
fi

sudo xcode-select -s "$CANDIDATE/Contents/Developer"
xcodebuild -version

SDK_VER=$(xcodebuild -version -sdk iphoneos ProductVersion 2>/dev/null || echo "")
echo "Aktywny SDK iOS: $SDK_VER ($CANDIDATE)"

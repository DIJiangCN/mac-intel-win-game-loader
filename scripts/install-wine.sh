#!/usr/bin/env bash
set -euo pipefail

if command -v brew >/dev/null 2>&1; then
  echo "Installing Wine via Homebrew..."
  brew install --cask wine-stable || brew install wine
  echo "Wine installation finished."
else
  echo "Homebrew not found. Install Homebrew first from https://brew.sh/"
  exit 1
fi

if command -v brew >/dev/null 2>&1; then
  echo "Installing optional compatibility utilities..."
  brew install winetricks || true
fi

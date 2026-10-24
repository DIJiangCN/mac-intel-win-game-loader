# mac-intel-win-game-loader

Free drag-and-drop Windows game loader for macOS Intel. This project provides a lightweight launcher that lets you drag a Windows `.exe` file into the application and run it with Wine.

## Overview

This project is designed for Intel-based Macs that cannot run most Windows-only Steam games natively. It uses a free compatibility layer (Wine) and allows a simple drag-and-drop workflow.

## Features

- Drag-and-drop `.exe` game launching
- Runtime detection for Wine
- Separate Wine prefix per game
- Basic graphics presets
- Low-latency tuning options
- Runtime logs and status display
- Install helper for Wine on macOS

## Requirements

- macOS Intel (x86_64)
- Node.js 18+
- npm 9+
- Wine or Wine Stable installed

## Install

```bash
npm install
```

## Check environment

```bash
npm run check-env
```

## Run the app

```bash
npm start
```

Then drag a Windows game `.exe` into the window to launch it.

## Install Wine on macOS

```bash
brew install --cask wine-stable
```

or:

```bash
npm run install-wine
```

## Notes

- This is a free compatibility launcher prototype.
- It does not guarantee all Windows games will work perfectly.
- Compatibility depends on the game, its anti-cheat system, Windows API usage, and Wine support.
- This is best suited for experiment, testing, and simple game launching on Intel Macs.

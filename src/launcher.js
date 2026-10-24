const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

function commandExists(command) {
  return new Promise((resolve) => {
    const child = spawn('which', [command], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.on('close', (code) => {
      resolve(code === 0 && stdout.trim().length > 0 ? stdout.trim() : null);
    });

    child.on('error', () => {
      resolve(null);
    });
  });
}

async function detectRuntime() {
  const wineCandidates = [
    '/opt/homebrew/bin/wine',
    '/usr/local/bin/wine',
    '/opt/homebrew/bin/wine64',
    '/usr/local/bin/wine64',
    'wine',
    'wine64'
  ];

  let winePath = null;
  let wine64Path = null;
  let winetricksPath = null;

  for (const candidate of wineCandidates) {
    if (candidate === 'wine' || candidate === 'wine64') {
      const found = await commandExists(candidate);
      if (found) {
        if (candidate === 'wine') winePath = found;
        if (candidate === 'wine64') wine64Path = found;
      }
      continue;
    }

    if (fs.existsSync(candidate)) {
      winePath = candidate;
      break;
    }
  }

  if (!winePath) winePath = await commandExists('wine');
  if (!wine64Path) wine64Path = await commandExists('wine64');
  if (!winetricksPath) winetricksPath = await commandExists('winetricks');

  return {
    available: Boolean(winePath || wine64Path),
    winePath: winePath || wine64Path || null,
    wine64Path,
    winetricksPath,
    prefixRoot: path.join(os.homedir(), 'Library', 'Application Support', 'MacIntelGameLoader', 'wine-prefixes')
  };
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function buildEnvironment(options = {}, prefixPath) {
  const env = { ...process.env };
  env.WINEPREFIX = prefixPath;
  env.WINEDLLOVERRIDES = 'winemenubuilder.exe=d';

  if (options.graphicsPreset === 'quality') {
    env.__GL_SHADER_DISK_CACHE = '1';
  }

  if (options.graphicsPreset === 'low-latency') {
    env.MESA_VK_WSI_PRESENT_MODE = 'mailbox';
    env.__GL_MaxFramesAllowed = '1';
  }

  if (options.dxvkMode) {
    env.DXVK_STATE_CACHE = '0';
    env.VKD3D_CONFIG = 'dxr,dxvk';
  }

  if (options.virtualDesktop) {
    env.WINE_VIRTUAL_DESKTOP = '1';
  }

  return env;
}

function getGamePrefix(exePath, dedicatedPrefix = true) {
  const fileName = path.basename(exePath, '.exe');
  const safeName = fileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const root = path.join(os.homedir(), 'Library', 'Application Support', 'MacIntelGameLoader', 'wine-prefixes');

  ensureDir(root);

  return dedicatedPrefix
    ? path.join(root, safeName)
    : path.join(root, 'shared');
}

async function launchGame(exePath, options = {}) {
  if (!exePath || typeof exePath !== 'string') {
    return { success: false, error: 'No EXE path provided.' };
  }

  if (!fs.existsSync(exePath)) {
    return { success: false, error: `EXE not found: ${exePath}` };
  }

  const runtime = await detectRuntime();
  if (!runtime.available) {
    return {
      success: false,
      error: 'Wine is not installed. Install it via: brew install --cask wine-stable'
    };
  }

  const prefixPath = getGamePrefix(exePath, options.dedicatedPrefix !== false);
  ensureDir(prefixPath);

  const env = buildEnvironment(options, prefixPath);
  const wineBinary = runtime.wine64Path || runtime.winePath;

  const child = spawn(wineBinary, [exePath], {
    env,
    stdio: 'inherit'
  });

  child.on('error', (error) => {
    console.error(error);
  });

  return {
    success: true,
    command: `${wineBinary} "${exePath}"`,
    prefix: prefixPath,
    pid: child.pid
  };
}

module.exports = {
  detectRuntime,
  launchGame
};

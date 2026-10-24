const dropZone = document.getElementById('dropZone');
const runtimeStatus = document.getElementById('runtimeStatus');
const logOutput = document.getElementById('logOutput');
const selectExeBtn = document.getElementById('selectExeBtn');
const refreshBtn = document.getElementById('refreshBtn');
const clearLogBtn = document.getElementById('clearLogBtn');
const graphicsPreset = document.getElementById('graphicsPreset');
const dedicatedPrefix = document.getElementById('dedicatedPrefix');
const dxvkMode = document.getElementById('dxvkMode');
const virtualDesktop = document.getElementById('virtualDesktop');

function appendLog(message, tone = 'info') {
  const p = document.createElement('p');
  p.className = tone;
  p.textContent = message;
  logOutput.appendChild(p);
  logOutput.scrollTop = logOutput.scrollHeight;
}

async function refreshRuntime() {
  runtimeStatus.textContent = 'Checking runtime...';

  try {
    const runtime = await window.electronAPI.detectRuntime();
    if (runtime.available) {
      runtimeStatus.textContent = `${runtime.winePath || 'Wine'} detected`;
      appendLog(`Runtime ready: ${runtime.winePath || 'wine'}`, 'success');
      if (runtime.winetricksPath) {
        appendLog(`Winetricks available: ${runtime.winetricksPath}`, 'success');
      }
    } else {
      runtimeStatus.textContent = 'Wine not found';
      appendLog('Wine not installed. Run: brew install --cask wine-stable', 'warn');
    }
  } catch (error) {
    runtimeStatus.textContent = 'Runtime check failed';
    appendLog(`Runtime check failed: ${error.message}`, 'error');
  }
}

async function launchGame(exePath) {
  if (!exePath) return;

  const options = {
    graphicsPreset: graphicsPreset.value,
    dedicatedPrefix: dedicatedPrefix.checked,
    dxvkMode: dxvkMode.checked,
    virtualDesktop: virtualDesktop.checked
  };

  appendLog(`Launching: ${exePath}`, 'info');

  try {
    const result = await window.electronAPI.launchExe(exePath, options);
    if (result.success) {
      appendLog(`Game launched successfully: ${result.command}`, 'success');
      appendLog(`Wine prefix: ${result.prefix}`, 'info');
    } else {
      appendLog(`Launch failed: ${result.error}`, 'error');
    }
  } catch (error) {
    appendLog(`Launch error: ${error.message}`, 'error');
  }
}

function bindFilePicker() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.exe';
  input.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (file) {
      launchGame(file.path);
    }
  });

  selectExeBtn.addEventListener('click', () => input.click());
}

function bindDropZone() {
  ['dragenter', 'dragover'].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      event.stopPropagation();
      dropZone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      event.stopPropagation();
      dropZone.classList.remove('dragover');
    });
  });

  dropZone.addEventListener('drop', (event) => {
    const file = event.dataTransfer?.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.exe')) {
      launchGame(file.path);
    } else {
      appendLog('Only .exe files are supported.', 'warn');
    }
  });
}

refreshBtn.addEventListener('click', refreshRuntime);
clearLogBtn.addEventListener('click', () => {
  logOutput.innerHTML = '<p>Loader ready.</p>';
});

bindFilePicker();
bindDropZone();
refreshRuntime();

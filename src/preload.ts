import chokidar from 'chokidar';
import { ipcRenderer } from "electron";
import { fileHandler } from '../app/server/lib/fileHandler';
import type { SaveData } from '../app/src/lib/types';

declare global {
  interface Window {
    ipcRenderer?: typeof ipcRenderer;
  }
}

// TODO: rewrite with an ipcRenderer
const sendDataWithEvent = (saveData: SaveData | undefined) => {
  if (!saveData) {
    return;
  }
  ipcRenderer.send('sendSaveData', saveData);
}

let currentUrl: string | undefined;
let currentWatcher: chokidar.FSWatcher | undefined;

const startWatcher = (url: string) => {
  if (currentUrl === url) {
    return;
  }
  if (currentWatcher && currentUrl) {
    currentWatcher.unwatch(currentUrl);
  }
  currentUrl = url;
  currentWatcher = chokidar
    .watch(currentUrl, { ignoreInitial: true })
    .on('add', fileHandler(sendDataWithEvent))
    .on('change', fileHandler(sendDataWithEvent));
  console.log('watcher started on', currentUrl)
}

window.addEventListener("DOMContentLoaded", () => {
  // Passing the ipcRenderer to the front, so it could be used easier without a require.
  window.ipcRenderer = ipcRenderer;
  ipcRenderer.send('preloadReadyForMain');
  ipcRenderer.on('getSavesUrl', (e, savesUrl: string) => {
    startWatcher(savesUrl);
  });
});

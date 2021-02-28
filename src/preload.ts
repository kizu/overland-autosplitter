import chokidar from 'chokidar';
import { IpcRenderer, ipcRenderer } from "electron";
import { setInitialRunData } from '../app/server/lib/getRunData';
import { fileHandler } from '../app/server/lib/fileHandler';
import type { RunData } from '../app/src/lib/types';

declare global {
  interface Window {
    ipcRenderer?: IpcRenderer;
  }
}

// TODO: rewrite with an ipcRenderer
const sendDataWithEvent = (data: RunData | undefined) => {
  const event = new CustomEvent('sendRunData', { detail: data });
  window.dispatchEvent(event);
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
  ipcRenderer.on('getInitialRunData', (e, runData: RunData) => {
    setInitialRunData(runData);
  });
  ipcRenderer.on('getSavesUrl', (e, savesUrl: string) => {
    startWatcher(savesUrl);
  });
  ipcRenderer.send('preloadReadyForMain');
});

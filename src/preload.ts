import chokidar from 'chokidar';
import { ipcRenderer } from "electron";
import { getInitialRunData } from '../app/server/lib/getRunData';
import { fileHandler } from '../app/server/lib/fileHandler';
import type { RunData } from '../app/src/lib/types';

const runData = getInitialRunData();

const sendDataWithEvent = (data: RunData | undefined) => {
  const event = new CustomEvent('sendRunData', { detail: data });
  window.dispatchEvent(event);
}

let currentUrl: string | undefined;
let currentWatcher: chokidar.FSWatcher | undefined;

const startWatcher = (url: string) => {
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

  window.addEventListener('pingServer', function () {
    sendDataWithEvent(runData);
  }, false);

  ipcRenderer.on('getSavesUrl', (e, savesUrl: string) => {
    startWatcher(savesUrl);
  });
  ipcRenderer.send('getSavesUrlRequest');
});

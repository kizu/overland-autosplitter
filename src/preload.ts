// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

import chokidar from 'chokidar';
import { getInitialRunData } from '../app/server/lib/getRunData';
import { fileHandler } from '../app/server/lib/fileHandler';
import { SAVES_URL } from '../app/tracker-config';
import type { RunData } from '../app/src/lib/types';

const runData = getInitialRunData();

const sendDataWithEvent = (data: RunData | undefined) => {
  const event = new CustomEvent('sendRunData', { detail: data });
  window.dispatchEvent(event);
}

window.addEventListener("DOMContentLoaded", () => {
  window.addEventListener('pingServer', function () {
    sendDataWithEvent(runData);
  }, false);

  chokidar.watch(SAVES_URL, { ignoreInitial: true }).on('add', fileHandler(sendDataWithEvent));
  chokidar.watch(SAVES_URL).on('change', fileHandler(sendDataWithEvent));
});

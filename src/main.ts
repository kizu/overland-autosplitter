import { app, ipcMain } from "electron";
import { createWindow } from './lib/createWindow';
import { attachGlobalShortcuts } from './lib/attachGlobalShortcuts';
import { createMenu } from './lib/createMenu';
import Store from 'electron-store';
import { RunData, SaveData, ElectronData } from "../app/src/lib/types";
import { getRunMeta } from "../app/src/lib/getRunMeta";
import { updateRunData, getUpdatedRunInfo } from '../app/server/lib/updateRunData';

const settings = new Store<ElectronData>({ name: 'settings' });

const getAllData = () => {
  const savesUrl = settings.get('savesUrl');
  const runData = settings.get('runData');
  const knownRuns = settings.get('knownRuns');
  return { savesUrl, runData, knownRuns };
}

const cachedRunStores: Record<string, Store<RunData>> = {};

const storeRun = (runData?: RunData) => {
  if (!runData) {
    return;
  }
  const id = Object.keys(runData.events)[0];
  if (!id) {
    return;
  }
  const knownRuns = settings.get('knownRuns') || {};
  // If we don't know yet about the run, store it.
  // TODO: check if we would need to re-check for the new name?
  //       or just store the meta itself
  if (!knownRuns[id]) {
    const { category, isAllDogs } = getRunMeta(runData, false);
    const runName = category ? `${category}${isAllDogs ? ` (all dogs)` : ''}` : 'Untitled';
    settings.set('knownRuns', { ...knownRuns, [id]: runName });
  }
  // Getting the current store, then update the run data
  const currentRun = cachedRunStores[id] || new Store<ElectronData>({ name: `run-${id}` });
  currentRun.set(runData);
};

// store the knownRuns in settings, as an object 'timestamp': { name }
// read run

app.on("ready", () => {
  const mainWindow = createWindow()

  // Debugging
  // mainWindow.webContents.openDevTools()

  attachGlobalShortcuts(mainWindow);
  createMenu(mainWindow);

  // When we accept the data from the preload, we save it and send to front
  ipcMain.on('sendSaveData', (event, saveData: SaveData) => {
    const oldData = getAllData();
    const runData = updateRunData(saveData, oldData.runData);
    const { hasUpdates } = getUpdatedRunInfo(oldData.runData, runData);
    if (!runData || !hasUpdates) {
      return
    }
    settings.set('runData', runData);
    storeRun(runData);
    mainWindow.webContents.send('getElectronData', { ...oldData, runData });
  });

  let currentSavesUrl: string | undefined;
  let currentSender: Electron.WebContents | undefined;
  // Passing the initial data to preload and keeping the ref to it for later updates.
  // The preload is ready when the DOMContentLoaded is called, so we pass the initial
  // data here as well.
  ipcMain.on('preloadReadyForMain', (event) => {
    currentSender = event.sender;
    // Sending the savesUrl to the preload to watch
    const savesUrl = settings.get('savesUrl');
    if (savesUrl !== currentSavesUrl) {
      currentSender.send('getSavesUrl', savesUrl)
    }
  })
  // Here we send all the data initially to the front,
  ipcMain.on('getElectronDataRequest', () => {
    mainWindow.webContents.send('getElectronData', getAllData());
  })

  // Accepting the data, and if this data is needed for the preload, pass it over
  ipcMain.on('setElectronData', (e, newData: ElectronData) => {
    // Only incremental update in order not to override a setting when it exists.
    (Object.keys(newData) as Array<keyof ElectronData>).forEach(key => {
      if (newData[key]) {
        settings.set(key, newData[key]);
      }
    })
    const { savesUrl, runData } = newData;
    storeRun(runData);
    if (currentSender && savesUrl !== currentSavesUrl) {
      currentSender.send('getSavesUrl', savesUrl);
    }
  })
});

app.on("window-all-closed", () => {
  app.quit();
});

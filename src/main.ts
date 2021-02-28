import { app, ipcMain } from "electron";
import { createWindow } from './lib/createWindow';
import { attachGlobalShortcuts } from './lib/attachGlobalShortcuts';
import { createMenu } from './lib/createMenu';
import settings from 'electron-settings';

app.on("ready", () => {
  const mainWindow = createWindow()
  attachGlobalShortcuts(mainWindow);
  createMenu(mainWindow);

  let currentSavesUrl: string | undefined;
  let currentSender: Electron.WebContents | undefined;
  // Passing the initial data to preload and keeping the ref to it for later updates.
  ipcMain.on('preloadReadyForMain', (event) => {
    settings.get().then(({ savesUrl, runData }) => {
      currentSender = event.sender;
      currentSender.send('getInitialRunData', runData)
      if (savesUrl !== currentSavesUrl) {
        currentSender.send('getSavesUrl', savesUrl)
      }
    })
  })
  // Here we send all the data initially to the front,
  // later we don't need to send anything as we only accept it from it.
  ipcMain.on('getElectronDataRequest', () => {
    settings.get().then(data => {
      mainWindow.webContents.send('getElectronData', data);
    })
  })
  // Accepting the data, and if this data is needed for the preload, pass it over
  ipcMain.on('setElectronData', (e, newData) => {
    // Only incremental update in order not to override a setting when it exists.
    Object.keys(newData).forEach(key => {
      settings.set(key, newData[key]);
    })

    const { savesUrl } = newData;
    if (currentSender && savesUrl !== currentSavesUrl) {
      currentSender.send('getSavesUrl', savesUrl);
    }
  })
});

app.on("window-all-closed", () => {
  app.quit();
});

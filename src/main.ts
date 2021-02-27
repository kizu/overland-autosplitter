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
  ipcMain.on('getSavesUrlRequest', (event) => {
    settings.get().then(({ savesUrl }) => {
      if (savesUrl !== currentSavesUrl) {
        currentSender = event.sender;
        currentSender.send('getSavesUrl', savesUrl)
      }
    })
    mainWindow.webContents.send('getSettings', settings.getSync());
  })
  ipcMain.on('getSettingsRequest', () => {
    mainWindow.webContents.send('getSettings', settings.getSync());
  })
  ipcMain.on('setSettings', (e, newSettings) => {
    settings.set(newSettings);
    const { savesUrl } = newSettings;
    if (currentSender && savesUrl !== currentSavesUrl) {
      currentSender.send('getSavesUrl', savesUrl);
    }
  })
});

app.on("window-all-closed", () => {
  app.quit();
});

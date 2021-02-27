import { app, ipcMain } from "electron";
import { createWindow } from './lib/createWindow';
import { attachGlobalShortcuts } from './lib/attachGlobalShortcuts';
import { createMenu } from './lib/createMenu';
import settings from 'electron-settings';

app.on("ready", () => {
  const mainWindow = createWindow()
  attachGlobalShortcuts(mainWindow);
  createMenu(mainWindow);

  ipcMain.on('getSettingsRequest', () => {
    mainWindow.webContents.send('getSettings', settings.getSync());
  })
  ipcMain.on('setSettings', (e, newSettings) => {
    console.log('got from client:', newSettings)
    settings.set(newSettings);
  })
});

app.on("window-all-closed", () => {
  app.quit();
});

import { globalShortcut, BrowserWindow } from "electron";

export const attachGlobalShortcuts = (win: BrowserWindow) => {
  globalShortcut.register('Control+Shift+1', () => {
    win.webContents.send('startRun', Date.now());
  })
  globalShortcut.register('Control+Shift+z', () => {
    win.webContents.send('startRun', Date.now());
  })
  globalShortcut.register('Control+Shift+2', () => {
    win.webContents.send('endRun', Date.now());
  })
  globalShortcut.register('Control+Shift+x', () => {
    win.webContents.send('endRun', Date.now());
  })
};

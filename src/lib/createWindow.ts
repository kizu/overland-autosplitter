import { app, BrowserWindow } from "electron";
import * as path from "path";

export const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 260,
    minWidth: 260,
    height: 525,
    minHeight: 325,
    webPreferences: {
      preload: path.join(__dirname, "../preload.js"),
      nodeIntegration: true
    },
    titleBarStyle: 'customButtonsOnHover',
    frame: false,
    alwaysOnTop: true
  });

  // and load the index.html of the app.
  const url = path.join(__dirname, "../../../app/dist/index.html");
  // FIXME: find out how to fix the eval() in the fileHandler
  // const url = path.join(__dirname, "../../app/dist/index-secure.html");
  mainWindow.loadFile(url);

  // Quit when the window is closed
  mainWindow.on('closed', () => app.quit());

  return mainWindow;
}

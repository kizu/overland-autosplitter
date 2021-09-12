import { app, BrowserWindow } from "electron";
import windowStateKeeper from 'electron-window-state';
import * as path from "path";

export const createWindow = () => {
  const mainWindowState = windowStateKeeper({
    defaultWidth: 260,
    defaultHeight: 525
  });

  const mainWindow = new BrowserWindow({
    minWidth: 260,
    minHeight: 325,
    width: mainWindowState.width,
    height: mainWindowState.height,
    x: mainWindowState.x,
    y: mainWindowState.y,
    webPreferences: {
      preload: path.join(__dirname, "../preload.js"),
      nodeIntegration: true,
      nativeWindowOpen: true,
      // Not good, but I wrote the code using it when it was default, so…
      contextIsolation: false
    },
    titleBarStyle: 'customButtonsOnHover',
    frame: false,
    alwaysOnTop: true,
    // TODO: implement transparent mode
    backgroundColor: '#0C1B1E'
  });

  mainWindowState.manage(mainWindow);

  // and load the index.html of the app.
  const url = path.join(__dirname, "../../../app/dist/index.html");
  // FIXME: find out how to fix the eval() in the fileHandler
  // const url = path.join(__dirname, "../../app/dist/index-secure.html");
  mainWindow.loadFile(url);

  // Quit when the window is closed
  mainWindow.on('closed', () => app.quit());

  return mainWindow;
}

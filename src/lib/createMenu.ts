import { app, shell, Menu, BrowserWindow } from "electron";
import type { MenuItemConstructorOptions } from "electron";

const { name } = app;

export const createMenu = (win: BrowserWindow) => {
  const macMenu: MenuItemConstructorOptions[] = [
    {
      label: name,
      submenu: [
        {
          role: 'about'
        },
        {
          label: 'Preferences',
          accelerator: 'Command+,',
          click: () => {
            win.webContents.send('toggleOptions');
          }
        },
        {
          type: 'separator'
        },
        {
          role: 'services',
          submenu: []
        },
        {
          type: 'separator'
        },
        {
          role: 'quit',
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate([
    ...(process.platform === 'darwin' ? macMenu : []),
    {
      label: 'View',
      submenu: [
        {
          role: 'reload',
          click: (item, focusedWindow) => {
            if (focusedWindow)
              focusedWindow.reload();
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: (() => {
            if (process.platform === 'darwin')
              return 'Alt+Command+I';
            else
              return 'Ctrl+Shift+I';
          })(),
          click: (item, focusedWindow) => {
            if (focusedWindow) {
              focusedWindow.webContents.openDevTools({ mode: 'undocked' });
            }
          }
        },
        {
          label: 'Open settings folder',
          click: () => shell.showItemInFolder(app.getPath('userData'))
        },
      ]
    },
    {
      label: 'Window',
      role: 'window',
      submenu: [
        {
          role: 'minimize'
        },
        {
          role: 'close'
        },
      ]
    },
    {
      role: 'help'
    },
  ]);
  Menu.setApplicationMenu(menu);
}

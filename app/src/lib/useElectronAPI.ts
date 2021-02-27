import React from 'react'
import type { IpcRenderer } from "electron";
import { isElectron as isElectronCallback } from './constants';
const isElectron = isElectronCallback();

declare global {
  interface File {
    path: string;
  }

  interface Window {
    ipcRenderer?: IpcRenderer;
  }
}

declare module 'react' {
  interface InputHTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    webkitdirectory?: "true";
  }
}

const useIpcRenderer = () => {
  return isElectron ? window.ipcRenderer : undefined;
}

export const useElectronEvents = (events: Record<string, () => void>) => {
  const ipcRenderer = window.ipcRenderer;
  React.useEffect(() => {
    if (!ipcRenderer) {
      return
    }
    Object.keys(events).forEach(name => {
      ipcRenderer.on(name, events[name]);
    });
  }, [ipcRenderer]);
}

interface Settings {
  savesUrl?: string;
}

export const useElectronSettings = () => {
  const settingsState = React.useState<Settings>({})
  const ipcRenderer = useIpcRenderer();

  React.useEffect(() => {
    if (!ipcRenderer) {
      return
    }
    ipcRenderer.on('getSettings', (e: any, settings: Settings) => {
      settingsState[1](settings);
    });
    ipcRenderer.send('getSettingsRequest');
  }, [ipcRenderer]);

  const setSettings = React.useCallback((newSettings: Settings) => {
    settingsState[1](prev => {
      const value = { ...prev, ...newSettings };
      if (ipcRenderer) {
        ipcRenderer.send('setSettings', value);
      }
      return value;
    });
  }, [ipcRenderer]);

  return [settingsState[0], setSettings] as const;
}

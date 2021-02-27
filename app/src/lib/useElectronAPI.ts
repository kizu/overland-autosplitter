import React from 'react'
import { isElectron as isElectronCallback } from './constants';
const isElectron = isElectronCallback();

declare global {
  interface Window {
    require: (name: string) => any;
  }

  interface File {
    path: string;
  }
}

declare module 'react' {
  interface InputHTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    webkitdirectory?: "true";
  }
}

let ipcRendererRef: Record<string, any> | undefined;

const useIpcRenderer = () => {
  React.useEffect(() => {
    if (!isElectron || ipcRendererRef) {
      return
    }
    // There is probably a better way to do this, but this works for now
    ipcRendererRef = window.require('electron').ipcRenderer;
  }, []);
  return ipcRendererRef;
}

export const useElectronEvents = (events: Record<string, () => void>) => {
  const ipcRenderer = useIpcRenderer();
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

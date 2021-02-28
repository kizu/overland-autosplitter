import React from 'react'
import type { IpcRenderer } from "electron";
import { isElectron as isElectronCallback } from './constants';
import { ElectronData } from './types';
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

/** We're passing the renderer through the window, so when it appears there,
 * we would need to rerender stuff.
 */
const useIpcRenderer = () => {
  const [ipcRenderer, setIpcRenderer] = React.useState<IpcRenderer>();
  const hasNoRenderer = !ipcRenderer;
  React.useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (hasNoRenderer && isElectron) {
      const checkForIpc = () => {
        if (window.ipcRenderer) {
          setIpcRenderer(() => window.ipcRenderer);
        }
      }
      interval = setInterval(checkForIpc, 100);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    }
  }, [hasNoRenderer]);
  return ipcRenderer;
}

export const useElectronEvents = (events: Record<string, (...args: any[]) => void>) => {
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

export const useElectronData = () => {
  const dataState = React.useState<ElectronData>({})
  const ipcRenderer = useIpcRenderer();

  React.useEffect(() => {
    if (!ipcRenderer) {
      return
    }
    ipcRenderer.on('getElectronData', (e: any, data: ElectronData) => {
      dataState[1](data);
    });
    ipcRenderer.send('getElectronDataRequest');
  }, [ipcRenderer]);

  const setData = React.useCallback((newElectronData: ElectronData) => {
    dataState[1](prev => {
      const value = { ...prev, ...newElectronData };
      if (ipcRenderer) {
        ipcRenderer.send('setElectronData', value);
      }
      return value;
    });
  }, [ipcRenderer]);

  return [dataState[0], setData] as const;
}

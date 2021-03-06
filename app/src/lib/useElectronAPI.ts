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

interface PartialElectronData extends Omit<ElectronData, 'runData'> {
  runData?: Partial<ElectronData['runData']>;
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
    ipcRenderer.on('getElectronData', (e: any, newData: ElectronData) => {
      // Merging the new data from Electron with what we have here
      if (newData.runData?.events) {
        dataState[1](prevData => ({
          ...prevData,
          ...newData,
          runData: {
            ...prevData.runData,
            ...newData.runData
          }
        } as ElectronData));
      }
    });
    ipcRenderer.send('getElectronDataRequest');
  }, [ipcRenderer]);

  const setData = React.useCallback((newData: PartialElectronData) => {
    dataState[1](prevData => {
      if (!newData) {
        return prevData;
      }
      const value = {
        ...prevData,
        ...newData,
        runData: {
          ...prevData.runData,
          ...newData.runData,
        }
      } as ElectronData;
      if (ipcRenderer) {
        ipcRenderer.send('setElectronData', value);
      }
      return value;
    });
  }, [ipcRenderer]);

  return [dataState[0], setData] as const;
}

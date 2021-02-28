/* @jsx styled.jsx */
import React from 'react'
import styled, { use } from '@reshadow/react'
import type { ElectronData } from '../lib/types';

export const checkPath = (path?: string) => {
  if (!path) {
    return 'empty';
  }
  if (path.match(/(\/|\\)gameSaves/)) {
    return 'success';
  }
  console.log({ path })
  return 'error';
}

interface FolderSelectProps {
  /** Do we have a savesUrl already? */
  savesUrl?: string;
  setData: (newElectronData: ElectronData) => void;
  setHasSettings: React.Dispatch<React.SetStateAction<boolean>>
}

const statusLabels = {
  empty: 'Select a gameSaves folder',
  success: 'Folder selected (Click to select a different one)',
  error: 'Select a correct gameSaves folder'
}

type StatusKeys = keyof typeof statusLabels;

export const FolderSelect = ({ savesUrl, setData, setHasSettings }: React.PropsWithChildren<FolderSelectProps>) => {
  const [status, setStatus] = React.useState<StatusKeys>(checkPath(savesUrl));

  React.useEffect(() => {
    setStatus(checkPath(savesUrl))
  }, [savesUrl]);

  return styled`
    label {
      position: relative;
      overflow: hidden;
      display: inline-block;
      cursor: pointer;

      padding: 5px;

      text-align: center;
      font-size: var(--font-small);
      line-height: 1.2;

      background: var(--color-light);
      color: var(--color-dark);

      box-shadow: 2px 2px 0 rgba(0,0,0,0.27);
      border-radius: 3px;

      [|status=success] > &,
      [|status=error] > &:hover {
        background: var(--color-green)
      }

      &:hover,
      [|status=error] > & {
        background: var(--color-red);
      }
    }

    input {
      position: absolute;
      bottom: 0;
      right: 0;
      font-size: 999em;
      opacity: 0;
      cursor: pointer;
    }
  `(
    <p {...use({ status })}>
      <label>
        {statusLabels[status]}
        <input
          type="file"
          webkitdirectory="true"
          onChange={({ target: { files } }) => {
            const filePath = (files ? files[0].path : '');
            const newPathStatus = checkPath(filePath);
            if (newPathStatus === 'success') {
              const path = filePath.replace(/((?:\/|\\)gameSaves)(?:\/|\\).+$/, '$1')
              setData({ savesUrl: path });
              setHasSettings(false);
            }
            setStatus(newPathStatus);
          }}
        />
      </label>
    </p>
  )
}

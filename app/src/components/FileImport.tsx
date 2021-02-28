/* @jsx styled.jsx */
import React from 'react'
import styled from '@reshadow/react'
import { RunData } from '../lib/types'


interface FileImportProps {
  onImport: (data: RunData) => void;
}
export const FileImport = ({ onImport }: React.PropsWithChildren<FileImportProps>) => {
  return styled`
    label {
      position: relative;
      overflow: hidden;
      display: inline-block;
      cursor: pointer;
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
    <p>
      <label>
        Import run data
        <input type="file" onChange={({ target: { files } }) => {
          if (!files || !files[0])
            return;
          const file = files[0];
          const fr = new FileReader();
          fr.onload = ({ target }) => {
            if (!target?.result) {
              return
            }
            // TODO: check for the type
            const data = JSON.parse(target.result as string);
            if (data.startDate) {
              onImport(data);
            } else {
              console.log('something went wrong')
            }
          };
          fr.readAsText(file);
        }} />
      </label>
    </p>
  )
}

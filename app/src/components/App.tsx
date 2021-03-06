/* @jsx styled.jsx */

import React from 'react'
import styled, { use } from '@reshadow/react'
import { styles } from './App.styles';
import { getRunMeta } from '../lib/getRunMeta';
import { Timer } from './Timer';
import { Logo } from './Logo';
import { StopsIcon } from './StopsIcon';
import { FolderSelect, checkPath } from './FolderSelect';

import { exportFile } from '../lib/exportFile';
import { useAPI } from '../lib/useAPI';
import { useElectronEvents } from '../lib/useElectronAPI';
import { isElectron as isElectronCallback } from '../lib/constants';
import { FileImport } from './FileImport';
import { RunData } from '../lib/types';
import { useSegments } from '../lib/useSegments';

const isElectron = isElectronCallback();

const App: React.FunctionComponent = () => {
  const { runData, setData, settings: { savesUrl } } = useAPI();

  const eventKeys = runData ? Object.keys(runData.events) : [];
  const runStart = Number(eventKeys[0]);

  const segments = useSegments({ runData });

  const [finalTimeStamp, setFinalTimeStamp] = React.useState<number>();

  const [isForcedIL, setIsForcedIL] = React.useState(false);

  // FIXME
  const { build: buildNumber, isAllDogs } = runData || {} as RunData;
  const { canBeIL, isIL, category } = getRunMeta(runData, isForcedIL);

  const runEndTimeStamp = segments.length && (isIL ? segments[0].end : segments[segments.length - 1].end);
  const runIsEnded = Boolean(runEndTimeStamp || finalTimeStamp);
  React.useEffect(() => {
    if (runEndTimeStamp && runStart) {
      setFinalTimeStamp(runEndTimeStamp);
    }
    //  else if (finalTimeStamp) {
    //   setFinalTimeStamp(undefined);
    // }
  }, [runEndTimeStamp]);

  const [expandedSegment, setExpandedSegment] = React.useState<number>();

  const [hasSettings, setHasSettings] = React.useState(false);

  const [hasAbsoluteTime, setHasAbsoluteTime] = React.useState(false);
  const [manualStart, setManualStart] = React.useState<number>();
  const [manualEnd, setManualEnd] = React.useState<number>();
  const [startOffset, setStartOffset] = React.useState(0);
  const [endOffset, setEndOffset] = React.useState(0);

  const startRun = () => {
    setManualEnd(undefined);
    setFinalTimeStamp(undefined);
    setStartOffset(0);
    setEndOffset(0);
  }

  useElectronEvents({
    'toggleOptions': () => {
      setHasSettings(prev => !prev);
    },
    'startRun': (e, timestamp: number) => {
      setManualStart(timestamp);
      setData({
        runData: {
          manualStart: timestamp
        }
      })
      startRun();
      // setRunData({
      //   events: {}
      // })
    },
    'endRun': (e, timestamp: number) => {
      setManualEnd(timestamp)
      setFinalTimeStamp(timestamp)
      setData({
        runData: {
          manualEnd: timestamp
        }
      })
      // if (runData) {
      //   setRunData({
      //     ...runData
      //   })
      // }
    }
  })

  const prevStartDateRef = React.useRef<number>();
  const shouldStartNewRun =
    !manualStart
    && runStart
    && prevStartDateRef.current !== runStart
    && (startOffset || endOffset || manualEnd);
  prevStartDateRef.current = runStart;
  React.useEffect(() => {
    if (shouldStartNewRun) {
      startRun();
    }
  }, [shouldStartNewRun])

  const shouldInitManualRun =
    manualStart
    && !manualEnd
    && runStart
    && manualStart !== runStart
    && manualStart < runStart;
  React.useEffect(() => {
    if (shouldInitManualRun && runStart && manualStart) {
      setStartOffset(runStart - manualStart);
      setManualStart(undefined);
    }
  }, [shouldInitManualRun]);

  const shouldEndManualRun = manualEnd && runEndTimeStamp;
  React.useEffect(() => {
    if (shouldEndManualRun && runEndTimeStamp && manualEnd) {
      setEndOffset(manualEnd - runEndTimeStamp);
      setManualEnd(undefined);
    }
  }, [shouldEndManualRun]);

  // Makes it so the app would show the settings so you could select a folder on start
  // FIXME: need to check only after we get the data from the electron to prevent flicker.
  React.useEffect(() => {
    if (isElectron) {
      setHasSettings(checkPath(savesUrl) !== 'success');
    }
  }, [savesUrl]);

  let absTime = startOffset;

  const CategoryTag = canBeIL ? 'button' : 'span';
  // TODO: add a “long hover”, so it would be possible to switch without a focus on tracker
  const categoryProps = canBeIL ? { onClick: () => setIsForcedIL(!isForcedIL) } : {};

  return styled(styles)(
    <div {...use({ Root: true })}>
      <main {...use({ isElectron })}>
      {runData && runStart
        ? <React.Fragment>
          <Logo buildNumber={buildNumber} />
          <h2>
            <CategoryTag {...categoryProps}>
              {category}
            </CategoryTag>
            {' '}
            {isAllDogs ? <span>All Dogs</span> : null}
          </h2>
          <ol>
            {
              segments.map(({ name, start, end, subSegments }, index) => {
                const shouldCollapse = end && !(!segments[index + 1]?.end && segments[index + 1]?.subSegments?.length <= 1 || index === segments.length - 1);
                const isExpanded = expandedSegment === undefined ? !shouldCollapse : expandedSegment === index;
                const subSegmentsCount = subSegments?.length || 0;
                const hasOnlyRoadblock = subSegmentsCount === 1 && subSegments[0].name === 'Roadblock';
                const subItems = !(!isExpanded && !isIL) && subSegmentsCount > 0 && !hasOnlyRoadblock ? subSegments.map(({ name: subName, start: subStart, end: subEnd, isNight }, subIndex) => {
                  let from = subStart;
                  let to = subEnd || finalTimeStamp;
                  if (from && index === 0 && subIndex === 0) {
                    from = from - startOffset;
                  }
                  if (to && index === (isIL ? 0 : segments.length - 1 ) && (subIndex === subSegmentsCount - 1) ) {
                    to = to + endOffset;
                  }
                  return (
                    <li key={subIndex} {...use({ isDisabled: !subStart, isFinished: !!subEnd, isNight })}>
                      <span>{subName}</span>
                      {from ? <Timer from={from} finalTimeStamp={to} /> : <span>-</span>}
                    </li>
                  );
                }) : null;

                const prevAbsTime = absTime;
                absTime = absTime + (end || finalTimeStamp || 0) - (start || 0);
                const isButton = end && !(expandedSegment === undefined && !shouldCollapse);
                const NameAs = isButton ? 'button' : 'span';
                const nameProps = isButton ? {
                  type: 'button' as const,
                  onClick: () => setExpandedSegment(prev => prev === index ? undefined : index)
                } : {};

                let from = start;
                let to = end || finalTimeStamp;
                if (from && hasAbsoluteTime) {
                  from = from - prevAbsTime;
                }
                if (from && !hasAbsoluteTime && index === 0) {
                  from = from - startOffset;
                }
                if (to && index === (isIL ? 0 : segments.length - 1)) {
                  to = to + endOffset;
                }

                return isIL ? index === 0 ? subItems : null : (
                  <li key={index} {...use({ isDisabled: !start, isFinished: !!end })}>
                    <NameAs
                      {...nameProps}
                    >{name} {end && !isExpanded ? <StopsIcon>{subSegments.length}</StopsIcon> : null}</NameAs>
                    {from ? <Timer from={from} finalTimeStamp={to} /> : <span>-</span>}
                    {subItems ? <ol>{subItems}</ol> : null}
                  </li>
                );
              }
              )
            }
          </ol>
          <output>
            {isIL
              ? <Timer isLarge from={runStart - startOffset} finalTimeStamp={(segments[0]?.end || finalTimeStamp || 0) + endOffset} />
              : <Timer isLarge from={runStart - startOffset} finalTimeStamp={(finalTimeStamp || 0) + endOffset} />
            }
          </output>
          {runIsEnded ? <Timer from={runStart - startOffset} /> : null}
          </React.Fragment>
        : <p>Waiting for the run to start…</p>
      }
        <button type="button" onClick={() => setHasSettings(!hasSettings)}>⚙️</button>

        <aside {...use({ hasSettings })}>
          <Logo buildNumber={buildNumber} />
          {
            isElectron ? <FolderSelect savesUrl={savesUrl} setData={setData} setHasSettings={setHasSettings} /> : null
          }
          {/* TODO: proper pause; disabling for now */}
          {/* {
            runData ? <p>
              <button onClick={() => setFinalTimeStamp(prev => prev || !runData ? undefined : Date.now())}>{finalTimeStamp ? 'Resume timer' : 'Pause timer'}</button>
            </p> : null
          } */}

          {/* Needed only for debugging for now */}
          {/* <p>
            {eventsCount} events
          <input
              value={limit ?? ''}
              type="number"
              onChange={
                ({ target: { value } }) => {
                  const result = parseInt(value, 10);
                  const isValid = !isNaN(result) && result >= 0
                  setLimit(isValid ? result : undefined);
                }
              }
            />
          </p> */}
          <p><label><input type="checkbox" checked={hasAbsoluteTime} onChange={() => setHasAbsoluteTime(!hasAbsoluteTime)} /> has absolute time</label></p>
          <p>
            <label {...use({ isOffset: true })}>
              start offset (in ms)
              <input
                value={startOffset}
                type="number"
                onChange={
                  ({ target: { value } }) => setStartOffset(parseInt(value, 10))
                }
              />
            </label>
          </p>
          <p>
            <label {...use({ isOffset: true })}>
              end offset (in ms)
              <input
                value={endOffset}
                type="number"
                onChange={
                  ({ target: { value } }) => setEndOffset(parseInt(value, 10))
                }
              />
            </label>
          </p>
          {runStart ? <p><button type="button" onClick={() => {
            exportFile(runData, `${runStart}.json`)
          }}>Export run data</button></p> : null}
          <FileImport onImport={data => {
            setData({ runData: data });
            setHasSettings(false);
          }} />
          <button type="button" onClick={() => setHasSettings(!hasSettings)}>Back</button>
        </aside>
      </main>
    </div>
  )}

export default App

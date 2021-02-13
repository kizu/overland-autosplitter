/* @jsx styled.jsx */

import React from 'react'
import { styles } from './App.styles';
import { getRunMeta } from '../lib/getRunMeta';
import { Timer } from './Timer';

import { useAPI } from '../lib/useAPI';
import styled, { use } from '@reshadow/react'

function App() {
  const [finalTimeStamp, setfinalTimeStamp] = React.useState<number>();
  const { runStats, eventsCount, segments } = useAPI();

  const runIsEnded = segments.length && segments[segments.length - 1].end;
  React.useEffect(() => {
    if (runIsEnded && runStats?.startDate) {
      setfinalTimeStamp(runIsEnded);
    } else if (finalTimeStamp) {
      setfinalTimeStamp(undefined);
    }
  }, [runIsEnded]);

  const [isForcedIL, setIsForcedIL] = React.useState(false);

  const { canBeIL, buildNumber, isIL, category, isAllDogs } = getRunMeta(runStats, isForcedIL);

  return styled(styles)(
    <div {...use({ Root: true })}>
      <main>
      {runStats && runStats.startDate
        ? <React.Fragment>
          <h1>Overland</h1>
          <h2>
            <span>
              {category}
            </span>
            {' '}
            {isAllDogs ? <span>All Dogs</span> : null}
          </h2>
          <ol>
            {
              segments.map(({ name, start, end, subSegments }, index) => {
                const subItems = !(end && !isIL) && subSegments.length > 0 ? subSegments.map(({ name: subName, start: subStart, end: subEnd }, subIndex) => (
                  <li key={subIndex}>
                    <span>{subName}</span>
                    <Timer from={subStart} finalTimeStamp={subEnd || finalTimeStamp} />
                  </li>
                )) : null;

                return isIL ? index === 0 ? subItems : null : (
                  <li key={index}>
                    <span>{name} {end ? <small>{subSegments.length} stops</small> : null}</span>
                    <Timer from={start} finalTimeStamp={end || finalTimeStamp} />
                    {subItems ? <ol>{subItems}</ol> : null}
                  </li>
                );
              }
              )
            }
          </ol>
          <output>
            {isIL
              ? <Timer isLarge from={runStats.startDate} finalTimeStamp={segments[0]?.end || finalTimeStamp} />
              : <Timer isLarge from={runStats.startDate} finalTimeStamp={finalTimeStamp} />
            }
          </output>
          </React.Fragment>
        : <p>Waiting for the run to start…</p>
      }
      </main>
      <aside>
        {
          runStats ? <p>
            <button onClick={() => setfinalTimeStamp(prev => prev || !runStats ? undefined : Date.now())}>{finalTimeStamp ? 'Resume timer' : 'Pause timer'}</button>
            {/* <button onClick={() => {
              setRunStats(undefined);
              setfinalTimeStamp(undefined);
            }}>Reset the run</button> */}
            <strong> {eventsCount} events</strong>
            {canBeIL ? <label><input type="checkbox" checked={isForcedIL} onChange={() => setIsForcedIL(!isForcedIL)} /> IL?</label> : null}
          </p> : null
        }
        <footer>
          <p>Game build {buildNumber}</p>
        </footer>
      </aside>
    </div>
  )}

export default App

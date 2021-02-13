/* @jsx styled.jsx */

import React from 'react'
import { styles } from './App.styles';
import { getRunMeta } from '../lib/getRunMeta';
import { Timer } from './Timer';
import { Logo } from './Logo';
import { StopsIcon } from './StopsIcon';

import { useAPI } from '../lib/useAPI';
import styled, { use } from '@reshadow/react'

function App() {
  const [finalTimeStamp, setfinalTimeStamp] = React.useState<number>();
  const [limit, setLimit] = React.useState<number>()
  const { runStats, eventsCount, segments } = useAPI(limit);

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

  const [expandedSegment, setExpandedSegment] = React.useState<number>();

  return styled(styles)(
    <div {...use({ Root: true })}>
      <main>
      {runStats && runStats.startDate
        ? <React.Fragment>
          <Logo />
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
                const isExpanded = expandedSegment === undefined ? !end : expandedSegment === index;
                const hasOnlyRoadblock = subSegments.length === 1 && subSegments[0].name === 'Roadblock';
                const subItems = !(!isExpanded && !isIL) && subSegments.length > 0 && !hasOnlyRoadblock ? subSegments.map(({ name: subName, start: subStart, end: subEnd }, subIndex) => (
                  <li key={subIndex} {...use({isDisabled: !subStart }) }>
                    <span>{subName}</span>
                    {subStart ? <Timer from={subStart} finalTimeStamp={subEnd || finalTimeStamp} /> : <span>-</span> }
                  </li>
                )) : null;

                const NameAs = end ? 'button' : 'span';
                const nameProps = end ? {
                  type: 'button' as const,
                  onClick: () => setExpandedSegment(prev => prev === index ? undefined : index)
                } : {};

                return isIL ? index === 0 ? subItems : null : (
                  <li key={index} {...use({ isDisabled: !start })}>
                    <NameAs
                      {...nameProps}
                    >{name} {end && !isExpanded ? <StopsIcon>{subSegments.length}</StopsIcon> : null}</NameAs>
                    {start ? <Timer from={start} finalTimeStamp={end || finalTimeStamp} /> : <span>-</span>}
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

            {canBeIL ? <label><input type="checkbox" checked={isForcedIL} onChange={() => setIsForcedIL(!isForcedIL)} /> IL?</label> : null}
          </p> : null
        }
        <footer>
          <p>
            {eventsCount} events
            <input
              value={limit}
              type="number"
              onChange={
                ({ target: { value } }) => {
                  const result = parseInt(value, 10);
                  const isValid = !isNaN(result) && result >= 0
                  setLimit(isValid ? result : undefined);
                }
              }
            />
          </p>
          <p>Game build {buildNumber}</p>
        </footer>
      </aside>
    </div>
  )}

export default App

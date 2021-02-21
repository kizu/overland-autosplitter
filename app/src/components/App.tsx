/* @jsx styled.jsx */

import React from 'react'
import { styles } from './App.styles';
import { getRunMeta } from '../lib/getRunMeta';
import { Timer } from './Timer';
import { Logo } from './Logo';
import { StopsIcon } from './StopsIcon';

import { useAPI } from '../lib/useAPI';
import styled, { use } from '@reshadow/react'
import { isElectron } from '../lib/constants';


const App: React.FunctionComponent = () => {
  const [finalTimeStamp, setfinalTimeStamp] = React.useState<number>();
  const [limit, setLimit] = React.useState<number>()
  const { runData, eventsCount, segments } = useAPI(limit);

  const runIsEnded = segments.length && segments[segments.length - 1].end;
  React.useEffect(() => {
    if (runIsEnded && runData?.startDate) {
      setfinalTimeStamp(runIsEnded);
    } else if (finalTimeStamp) {
      setfinalTimeStamp(undefined);
    }
  }, [runIsEnded]);

  const [isForcedIL, setIsForcedIL] = React.useState(false);

  const { canBeIL, buildNumber, isIL, category, isAllDogs } = getRunMeta(runData, isForcedIL);

  const [expandedSegment, setExpandedSegment] = React.useState<number>();

  const [hasSettings, setHasSettings] = React.useState(false);

  const [hasAbsoluteTime, setHasAbsoluteTime] = React.useState(false);
  const [startOffset, setStartOffset] = React.useState(0);
  const [endOffset, setEndOffset] = React.useState(0);

  let absTime = startOffset;

  return styled(styles)(
    <div {...use({ Root: true })}>
      <main {...use({ isElectron })}>
      {runData && runData.startDate
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
                const shouldCollapse = end && !(!segments[index + 1]?.end && segments[index + 1]?.subSegments?.length <= 1 || index === segments.length - 1);
                const isExpanded = expandedSegment === undefined ? !shouldCollapse : expandedSegment === index;
                const hasOnlyRoadblock = subSegments.length === 1 && subSegments[0].name === 'Roadblock';
                const subItems = !(!isExpanded && !isIL) && subSegments.length > 0 && !hasOnlyRoadblock ? subSegments.map(({ name: subName, start: subStart, end: subEnd, isNight }, subIndex) => (
                  <li key={subIndex} {...use({ isDisabled: !subStart, isFinished: !!subEnd, isNight }) }>
                    <span>{subName}</span>
                    {subStart ? <Timer from={subStart} finalTimeStamp={subEnd || finalTimeStamp} /> : <span>-</span> }
                  </li>
                )) : null;

                const prevAbsTime = absTime;
                absTime = absTime + (end || finalTimeStamp || 0) - (start || 0);
                const isButton = end && !(expandedSegment === undefined && !shouldCollapse);
                const NameAs = isButton ? 'button' : 'span';
                const nameProps = isButton ? {
                  type: 'button' as const,
                  onClick: () => setExpandedSegment(prev => prev === index ? undefined : index)
                } : {};

                return isIL ? index === 0 ? subItems : null : (
                  <li key={index} {...use({ isDisabled: !start, isFinished: !!end })}>
                    <NameAs
                      {...nameProps}
                    >{name} {end && !isExpanded ? <StopsIcon>{subSegments.length}</StopsIcon> : null}</NameAs>
                    {start ? <Timer from={start - (hasAbsoluteTime ? prevAbsTime : startOffset)} finalTimeStamp={end || finalTimeStamp} /> : <span>-</span>}
                    {subItems ? <ol>{subItems}</ol> : null}
                  </li>
                );
              }
              )
            }
          </ol>
          <output>
            {isIL
              ? <Timer isLarge from={runData.startDate - startOffset} finalTimeStamp={(segments[0]?.end || finalTimeStamp || 0) + endOffset} />
              : <Timer isLarge from={runData.startDate - startOffset} finalTimeStamp={(finalTimeStamp || 0) + endOffset} />
            }
          </output>
          </React.Fragment>
        : <p>Waiting for the run to start…</p>
      }
        <button type="button" onClick={() => setHasSettings(!hasSettings)}>⚙️</button>
      </main>
      {hasSettings ? <aside>
        {
          runData ? <p>
            <button onClick={() => setfinalTimeStamp(prev => prev || !runData ? undefined : Date.now())}>{finalTimeStamp ? 'Resume timer' : 'Pause timer'}</button>
            {/* <button onClick={() => {
              setRunData(undefined);
              setfinalTimeStamp(undefined);
            }}>Reset the run</button> */}

            {canBeIL ? <label><input type="checkbox" checked={isForcedIL} onChange={() => setIsForcedIL(!isForcedIL)} /> IL?</label> : null}
          </p> : null
        }
        <footer>
          <p>
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
          </p>
          <p><label><input type="checkbox" checked={hasAbsoluteTime} onChange={() => setHasAbsoluteTime(!hasAbsoluteTime)} /> has absolute time</label></p>
          <p>
            start offset (in ms)
            <input
              value={startOffset}
              type="number"
              onChange={
                ({ target: { value } }) => setStartOffset(parseInt(value, 10))
              }
            />
          </p>
          <p>
            end offset (in ms)
            <input
              value={endOffset}
              type="number"
              onChange={
                ({ target: { value } }) => setEndOffset(parseInt(value, 10))
              }
            />
          </p>
          <p>Game build {buildNumber}</p>
        </footer>
      </aside> : null}
    </div>
  )}

export default App

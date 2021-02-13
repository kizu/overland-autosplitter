// Mostly from https://gist.github.com/jakearchibald/cb03f15670817001b1157e62a076fe95
import { useEffect, useRef } from 'react';

const animationInterval = (ms: number, signal: AbortSignal, callback: (time: number) => void) => {
  const start = document.timeline.currentTime || Date.now();

  const frame = (time: number) => {
    if (signal.aborted) return;
    callback(time);
    scheduleFrame(time);
  }

  const scheduleFrame = (time: number) => {
    const elapsed = time - start;
    const roundedElapsed = Math.round(elapsed / ms) * ms;
    const targetNext = start + roundedElapsed + ms;
    const delay = targetNext - performance.now();
    setTimeout(() => requestAnimationFrame(frame), delay);
  }

  scheduleFrame(start);
}

export const useAnimationFrame = (ms: number | null, callback: (time: number) => void) => {
  const callbackRef = useRef(callback)
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const controller = new AbortController()
    if (ms) {
      animationInterval(ms, controller.signal, callbackRef.current)
    }
    return () => controller.abort()
  }, [ms])
}

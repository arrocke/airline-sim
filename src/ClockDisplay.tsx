import React from 'react'
import { format, roundToNearestMinutes } from 'date-fns'
import useClockState from './clock-state'

function ClockDisplay () {
  const time = useClockState(state => state.time)
  const start = useClockState(state => state.start)
  const stop = useClockState(state => state.stop)
  const isRunning = useClockState(state => state.isRunning)

  return <div style={{ pointerEvents: 'auto' }}>
    <div>{format(roundToNearestMinutes(time, { nearestTo: 15 }), 'MMM dd, yyyy hh:mm aaa')}</div>
    <button onClick={() => isRunning ? stop() : start()}>
      {isRunning ? 'Pause': 'Resume'}
    </button>
  </div>
}

export default ClockDisplay
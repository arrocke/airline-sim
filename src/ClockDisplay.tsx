import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { format } from 'date-fns'
import { setDateFromClock, useClockStore } from './clock-utils'

export interface ClockDisplayProps {
  clock: THREE.Clock
}

function ClockDisplay ({ clock }: ClockDisplayProps) {
  const date = useClockStore(state => state.date)
  const display = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      if (display.current) {
        display.current.innerText = format(date, 'MMM dd, yyyy hh:00 aaa')
      }
    }, 200)
    return () => clearInterval(interval)
  }, [clock])

  return <div style={{ pointerEvents: 'auto' }}>
    <div ref={display} />
    <button onClick={() => clock.start()}>Start</button>
  </div>
}

export default ClockDisplay
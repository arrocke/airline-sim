import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { format } from 'date-fns'
import { setDateFromClock } from './clock-utils'

export interface ClockDisplayProps {
  clock: THREE.Clock
}

function ClockDisplay ({ clock }: ClockDisplayProps) {
  const date = useRef(new Date())
  const display = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setDateFromClock(clock, date.current)
      if (display.current) {
        display.current.innerText = format(date.current, 'MMM dd, yyyy hh:00 aaa')
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [clock])

  return <div ref={display} />
}

export default ClockDisplay
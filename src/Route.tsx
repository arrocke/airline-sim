import React, { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { City } from './types'
import { setVector3FromCoords } from './utils'

const ANGLE_STEP = 5 / 180 * Math.PI

export interface RouteProps {
  source: City
  dest: City
}

function Route({ source, dest }: RouteProps) {
  const geometry = useRef<THREE.BufferGeometry>(null)

  const points = useMemo(() => {
    const sourceVector = setVector3FromCoords(source).multiplyScalar(1.001)
    const destVector = setVector3FromCoords(dest).multiplyScalar(1.001)
    const rotationVector = sourceVector.clone().cross(destVector).normalize()
    const totalAngle = sourceVector.angleTo(destVector)
    const steps = Math.ceil(totalAngle / ANGLE_STEP)
    const stepSize = totalAngle / steps
    const points = []
    for (let i = 0; i <= steps; i++) {
      const point = sourceVector.clone().applyAxisAngle(rotationVector, i * stepSize)
      points.push(point)
    }
    return points
  }, [source, dest])


  useEffect(() => {
    geometry.current?.setFromPoints(points)
  }, [points])

  return <line>
    <bufferGeometry ref={geometry} />
    <lineBasicMaterial color="red" />
  </line>
}

export default Route
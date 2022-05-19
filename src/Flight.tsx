import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import useClockState from './clock-state'
import { City } from './types'
import useCoordVisiblity from './useCoordVisibility'
import { setVector3FromCoords } from './utils'

export interface FlightProps {
  source: City
  dest: City
  departureDate: Date
}

const ORIGIN = new THREE.Vector3(0, 0, 0)
const ANGULAR_SPEED_HOURLY = 6 / 180 * Math.PI
const MS_IN_HR = 1000 * 60 * 60

function Flight({ source, dest, departureDate }: FlightProps) {
  const gameTime = useClockState(state => state.time)

  const { planeTexture } = useTexture({
    planeTexture: 'src/resources/plane.png'
  })

  const plane = useRef<THREE.Mesh>(null)

  const position = useRef(new THREE.Vector3())
  const rotation = useRef(new THREE.Matrix4())
  const angle = useRef(0)

  const start = useMemo(() => setVector3FromCoords(source), [source])
  const end = useMemo(() => setVector3FromCoords(dest), [dest])
  const totalAngle = useMemo(() => start.angleTo(end), [start, end])
  const up = useMemo(() => start.clone().cross(end).normalize(), [start, end])


  useFrame(() => {
    if (plane.current) {
      angle.current = Math.max(0, Math.min(totalAngle, (gameTime.getTime() - departureDate.getTime()) / MS_IN_HR * ANGULAR_SPEED_HOURLY))

      position.current
        .copy(start)
        .applyAxisAngle(up, angle.current)
      plane.current.position.copy(position.current)

      rotation.current.lookAt(
        plane.current.position,
        ORIGIN,
        up
      )
      plane.current.setRotationFromMatrix(rotation.current)
    }
  })

  useCoordVisiblity({ position, mesh: plane, threshold: 0.45 })

  return <mesh ref={plane} position={[0, 0, 1]}>
    <planeGeometry args={[0.02, 0.02]} />
    <meshBasicMaterial args={[{ map: planeTexture, depthTest: false, transparent: true, color: 'blue' }]} />
  </mesh>
}

export default Flight
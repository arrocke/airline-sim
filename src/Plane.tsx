import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { City } from './types'
import useCoordVisiblity from './useCoordVisibility'
import { setVector3FromCoords } from './utils'

export interface PlaneProps {
  source: City
  dest: City
}

const ORIGIN = new THREE.Vector3(0, 0, 0)
const ANGULAR_SPEED = 5 / 180 * Math.PI

function Plane({ source, dest }: PlaneProps) {
  const { planeTexture } = useTexture({
    planeTexture: 'src/resources/plane.png'
  })

  const plane = useRef<THREE.Mesh>(null)

  const position = useRef(new THREE.Vector3())
  const rotation = useRef(new THREE.Matrix4())
  const direction = useRef(1)
  const angle = useRef(0)

  const start = useMemo(() => setVector3FromCoords(source), [source])
  const end = useMemo(() => setVector3FromCoords(dest), [dest])
  const totalAngle = useMemo(() => start.angleTo(end), [start, end])
  const up = useMemo(() => {
    const forward = start.clone().cross(end).normalize()
    return {
      forward,
      backward: forward.clone().negate()
    }
  }, [start, end])


  useFrame(({}, dTime) => {
    if (plane.current) {
      angle.current += direction.current * dTime * ANGULAR_SPEED
      if (angle.current >= totalAngle) {
        angle.current = totalAngle - (angle.current - totalAngle)
        direction.current = -1
      } else if (angle.current <= 0) {
        angle.current = -angle.current 
        direction.current = 1
      }

      position.current
        .copy(start)
        .applyAxisAngle(up.forward, angle.current)
      plane.current.position.copy(position.current)

      rotation.current.lookAt(
        plane.current.position,
        ORIGIN,
        direction.current === 1 ? up.forward : up.backward
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

export default Plane
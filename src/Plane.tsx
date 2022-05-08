import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { City } from './types'
import { setVector3FromCoords } from './utils'

export interface PlaneProps {
  source: City
  dest: City
}

const ZERO_VECTOR = new THREE.Vector3(1, 0, 0)
const UP = new THREE.Vector3(0, 1, 0)
const ORIGIN = new THREE.Vector3(0, 0, 0)
const BEARING_NORMAL = new THREE.Vector3(0, 0, 1)
const ANGULAR_SPEED = 1 / 180 * Math.PI

function Plane({ source, dest }: PlaneProps) {
  const plane = useRef<THREE.Mesh>(null)
  const rotation = useRef(new THREE.Matrix4())
  const direction = useRef(1)

  const { planeTexture } = useTexture({
    planeTexture: 'src/resources/plane.png'
  })

  const start = useMemo(() => setVector3FromCoords(source), [source])
  const end = useMemo(() => setVector3FromCoords(dest), [dest])

  const totalAngle = useMemo(() => start.angleTo(end), [start, end])
  const angle = useRef(0)

  const bearing = useMemo(() => {
    const direction = end.clone()
      .sub(start)
      .projectOnPlane(start)
      .applyEuler(
        new THREE.Euler().setFromRotationMatrix(
          new THREE.Matrix4().lookAt(
            start,
            ORIGIN,
            UP
          )
        ),
      )
    const angle = -ZERO_VECTOR.angleTo(direction)
    return {
      forward: UP.clone().applyAxisAngle(BEARING_NORMAL, angle),
      backward: UP.clone().applyAxisAngle(BEARING_NORMAL, angle + Math.PI)
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

      plane.current.position.lerpVectors(start, end, angle.current / totalAngle).normalize()

      rotation.current.lookAt(
        plane.current.position,
        ORIGIN,
        direction.current === 1 ? bearing.forward : bearing.backward
      )
      plane.current.setRotationFromMatrix(rotation.current)
    }
  })

  return <mesh ref={plane} position={[0, 0, 1]}>
    <planeGeometry args={[0.02, 0.02]} />
    <meshBasicMaterial args={[{ map: planeTexture, transparent: true, color: 'blue' }]} />
  </mesh>
}

export default Plane
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'

export interface LabelProps {
  lat: number
  long: number
  level?: number
  children: string
}

function Label({ lat, long, level = 1, children }: LabelProps) {
  const cameraDirection = useRef(new THREE.Vector3())
  const label = useRef<HTMLDivElement>(null)
  const previouslyVisible = useRef<boolean>()

  const position = useMemo(() => {
    const position = new THREE.Vector3()
    position.setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - lat), THREE.MathUtils.degToRad(long))
    return position
  }, [lat, long])

  useFrame(({ camera }) => {
    camera.getWorldDirection(cameraDirection.current)
    const dot = cameraDirection.current.negate().dot(position)
    const isVisible = dot > 0.60
    if (isVisible !== previouslyVisible.current && label.current) {
      label.current.style.display = isVisible ? 'block' : 'none'
      previouslyVisible.current = isVisible
    }
  })

  return <Html
    ref={label}
    position={position}
    center
    style={{
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      display: 'none',
      fontSize: [16, 12][level - 1]
    }}
  >
    {children}
  </Html>
}

export default Label
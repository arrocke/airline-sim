import { Html } from '@react-three/drei'
import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import useCoordVisiblity from './useCoordVisibility'

export interface LabelProps {
  lat: number
  long: number
  level?: number
  children: string
}

function Label({ lat, long, level = 1, children }: LabelProps) {
  const label = useRef<HTMLDivElement>(null)

  const position = useMemo(() => {
    const position = new THREE.Vector3()
    position.setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - lat), THREE.MathUtils.degToRad(long))
    return position
  }, [lat, long])

  useCoordVisiblity({ position, el: label })

  return <Html
    ref={label}
    position={position}
    center
    zIndexRange={[100, 0]}
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
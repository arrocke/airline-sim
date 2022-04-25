import { Html } from '@react-three/drei'
import React, { useMemo } from 'react'
import * as THREE from 'three'

export interface EarthLabelProps {
  lat: number
  long: number
  children: string
}

function EarthLabel({ lat, long, children }: EarthLabelProps) {
  const position = useMemo(() => {
    const position = new THREE.Vector3()
    position.setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - lat), THREE.MathUtils.degToRad(long))
    return position
  }, [lat, long])

  return <Html position={position} center style={{ whiteSpace: 'nowrap' }}>
    {children}
  </Html>
}

export default EarthLabel
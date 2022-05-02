import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { LabelScene } from './LabelScene'

export interface EarthLabelProps {
  lat: number
  long: number
  children: string
}

function EarthLabel({ lat, long, children }: EarthLabelProps) {
  const cameraDirection = useRef(new THREE.Vector3())
  const lookAtTarget = useRef(new THREE.Vector3())
  const label = useRef<THREE.Mesh>(null)
  const previouslyVisible = useRef<boolean>()

  const position = useMemo(() => {
    const position = new THREE.Vector3()
    position.setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - lat), THREE.MathUtils.degToRad(long))
    return position
  }, [lat, long])

  useFrame(({ camera }) => {
    camera.getWorldDirection(cameraDirection.current)
    const dot = cameraDirection.current.negate().dot(position)
    const isVisible = dot > 0.65
    if (isVisible !== previouslyVisible.current && label.current) {
      label.current.visible = isVisible
      previouslyVisible.current = isVisible
    }
    if (isVisible && label.current) {
      lookAtTarget.current.copy(position)
      lookAtTarget.current.add(cameraDirection.current)
      label.current.lookAt(lookAtTarget.current)
    }
  })

  return <LabelScene>
    <Text ref={label} position={position} color="black" fontSize={0.025}>
      {children}
    </Text>
  </LabelScene>
}

export default EarthLabel
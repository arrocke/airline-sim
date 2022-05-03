import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { LabelScene } from './LabelScene'

export interface LabelProps {
  lat: number
  long: number
  level?: number
  children: string
}

const center = new THREE.Vector3(0, 0, 0)

function Label({ lat, long, level = 1, children }: LabelProps) {
  const cameraDirection = useRef(new THREE.Vector3())
  const zoom = useRef<number>()
  const lookAtTarget = useRef(new THREE.Vector3())
  const label = useRef<any>(null)
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
      label.current.visible = isVisible
      previouslyVisible.current = isVisible
    }
    if (isVisible && label.current) {
      lookAtTarget.current.copy(position)
      lookAtTarget.current.add(cameraDirection.current)
      label.current.lookAt(lookAtTarget.current)
    }
    const newZoom = (camera.position.distanceTo(center) - 1.5) / 1.5
    if (zoom.current !== newZoom) {
      zoom.current = newZoom
      label.current!.fontSize = THREE.MathUtils.lerp(1, 0.7, level - 1) * THREE.MathUtils.lerp(0.01, 0.025, newZoom)
      label.current!.sync()
    }
  })

  return <LabelScene>
    <Text ref={label} position={position} color="black" fontSize={0.025}>
      {children}
    </Text>
  </LabelScene>
}

export default Label
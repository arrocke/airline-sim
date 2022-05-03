import { useFrame } from '@react-three/fiber'
import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import Label from './Label'

export interface CityProps {
  lat: number
  long: number
  name: string
}

function City({ lat, long, name }: CityProps) {
  const cameraDirection = useRef(new THREE.Vector3())
  const previouslyVisible = useRef<boolean>()
  const city = useRef<THREE.Mesh>(null)

  const position = useMemo(() => {
    const position = new THREE.Vector3()
    position.setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - lat), THREE.MathUtils.degToRad(long))
    return position
  }, [lat, long])

  const rotation = useMemo(
    () => 
      new THREE.Euler().setFromRotationMatrix(
        new THREE.Matrix4().lookAt(
          position,
          new THREE.Vector3(0,0,0),
          new THREE.Vector3(0,1,0)
        )
      ),
    [position]
  )

  useFrame(({ camera }) => {
    camera.getWorldDirection(cameraDirection.current)
    const dot = cameraDirection.current.negate().dot(position)
    const isVisible = dot > 0.60
    if (isVisible !== previouslyVisible.current && city.current) {
      city.current.visible = isVisible
      previouslyVisible.current = isVisible
    }
  })

  return <>
    <mesh ref={city} position={position} rotation={rotation}>
      <circleGeometry args={[0.004, 24, 16]} />
      <meshBasicMaterial color="red" />
    </mesh>
    <Label lat={lat + 0.5} long={long} level={2}>
      {name}
    </Label>
  </>
}

export default City
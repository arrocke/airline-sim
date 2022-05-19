import { useFrame } from '@react-three/fiber'
import { RefObject, useRef, useState } from 'react'
import * as THREE from 'three'

const DOT_THRESHOLD = 0.6

export interface CoordVisibilityOptions {
  position: THREE.Vector3 | RefObject<THREE.Vector3>
  mesh?: RefObject<THREE.Mesh>
  el?: RefObject<HTMLElement>
  threshold?: number
}

function unRef<T>(refOrObject: T | RefObject<T>) {
  return 'current' in refOrObject ? refOrObject.current : refOrObject
}

export default function useCoordVisiblity(options: CoordVisibilityOptions) {
  const [cameraDirection] = useState(new THREE.Vector3())
  const previouslyVisible = useRef<boolean>()

  useFrame(({ camera }) => {
    camera.getWorldDirection(cameraDirection).negate()
    const position = unRef(options.position)
    if (!position) return
    const dot = cameraDirection.dot(position)
    const isVisible = dot > (options.threshold ?? DOT_THRESHOLD)
    if (isVisible !== previouslyVisible.current && (options.mesh?.current || options.el?.current)) {
      if (options.mesh?.current) {
        options.mesh.current.visible = isVisible
      }
      if (options.el?.current) {
        options.el.current.style.display = isVisible ? 'block' : 'none'
      }
      previouslyVisible.current = isVisible
    }
  })
}
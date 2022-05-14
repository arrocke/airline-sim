import { useFrame } from '@react-three/fiber'
import { RefObject, useRef } from 'react'
import * as THREE from 'three'
import create from 'zustand'
import { useClockStore } from './clock-utils'

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
  const cameraDirection = useClockStore(state => state.cameraDirection)
  const previouslyVisible = useRef<boolean>()

  useFrame(() => {
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
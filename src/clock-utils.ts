import create from "zustand"
import * as THREE from 'three'
import { useFrame } from "@react-three/fiber"

const START_DATE = new Date(2022, 0, 1)
const TIME_CONVERSION = (60 * 60) / 3 * 1000

export function getGameTimeFromClock(clock: THREE.Clock) {
  return START_DATE.getTime() + clock.getElapsedTime() * TIME_CONVERSION
}

export function setDateFromClock(clock: THREE.Clock, date: Date) {
  date.setTime(getGameTimeFromClock(clock))
}

export const useClockStore = create<{ cameraDirection: THREE.Vector3, date: Date }>((set) => ({
  cameraDirection: new THREE.Vector3(),
  date: new Date()
}))

export function useClockUpdate() {
  const { cameraDirection, date } = useClockStore()

  useFrame(({ camera, clock }) => {
    camera.getWorldDirection(cameraDirection).negate()
    setDateFromClock(clock, date)
  })
}
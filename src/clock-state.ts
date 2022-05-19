import * as THREE from 'three'
import create from "zustand";

const TIME_CONVERSION = (60 * 60) / 3 * 1000
const START_TIME = new Date(2022, 0, 1)

export interface GameState {
  time: Date
  clockStart: Date
  isInitialized: boolean
  isRunning: boolean
  clock?: THREE.Clock
  init(options: { clock: THREE.Clock }): void
  tick(): void
  start(): void
  stop(): void
}

const useGameState = create<GameState>((set, get) => ({
  isRunning: false,
  isInitialized: false,
  time: START_TIME,
  clockStart: START_TIME,
  init(options: { clock: THREE.Clock }) {
    if (get().isInitialized) {
      throw new Error('Game state already initialized.')
    }
    set({ clock: options.clock, isInitialized: true })
  },
  tick() {
    const { clockStart, isRunning, clock } = get()
    if (isRunning) {
      const time = new Date(clockStart.getTime() + clock!.getElapsedTime() * TIME_CONVERSION)
      set({ time })
    }
  },
  start() {
    set({ isRunning: true })
    get().clock!.start()
  },
  stop() {
    set(state => ({ isRunning: false, clockStart: state.time }))
    get().clock!.stop()
  }
}))

export default useGameState

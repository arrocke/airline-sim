import create from 'zustand'
import useClockState from './clock-state'

export interface RouteState {
  id: string
  city1: number
  city2: number
}

export interface FlightState {
  id: string
  route: string
  direction: 'forward' | 'backward'
  departureDate: Date
}

export interface FlightView extends Omit<FlightState, 'route'> {
  route: RouteState
}

export interface AirlinesState {
  routes: RouteState[]
  flights: FlightState[]
  addRoute(city1: number, city2: number): void
  findFlightById(id: string): FlightView | undefined
}

useClockState.getState().time

function randomId() {
  return Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
}

const useAirlineState = create<AirlinesState>((set, get) => ({
  routes: [],
  flights: [],
  addRoute(city1, city2) {
    const state = get()
    if (state.routes.some(route => (route.city1 === city1 && route.city2 === city2) || (route.city1 === city2 && route.city2 === city1))) {
      // Do nothing if route already exists.
    } else {
      const routeId = randomId()
      set({
        routes: [...state.routes, { id: routeId, city1, city2 }],
        flights: [...state.flights, { id: randomId(), route: routeId, direction: 'forward', departureDate: new Date(useClockState.getState().time.getTime() + 1000 * 60 * 60) }],
      })
    }
  },
  findFlightById(id) {
    const { flights, routes } = get()
    const flight = flights.find(flight => flight.id === id)
    if (flight) {
      const route = routes.find(route => route.id === flight.route)
      if (route) {
        return {
          ...flight,
          route
        }
      }
    }
  }
}))

export default useAirlineState
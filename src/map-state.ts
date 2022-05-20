import create from 'zustand'
import cities from './resources/cities.json'
import { latLongDistance } from './utils'

const MAX_DAILY_PASSENGERS = 4500000000 / 356
const TOTAL_POPULATION = 7753000000
const MAX_DIST_FOR_CLICK = 45

export interface CityDemand {
  demand: number;
  id: number;
}

export interface CityState {
  maxPassengers: number;
  destinations: CityDemand[];
  name: string;
  lat: number;
  long: number;
  country: string;
  population: number;
  id: number;
}

export interface MapState {
  cities: CityState[]
  selectedCity?: CityState
  findCityById(id: number): CityState | undefined
  selectCityNearCoords(lat: number, long: number): void
}

const useMapState = create<MapState>((set, get) => ({
  cities: cities.map(source => {
    const maxPassengers = MAX_DAILY_PASSENGERS * source.population / TOTAL_POPULATION
    const destinations = cities
      .filter(dest => dest.id !== source.id)
      .map(dest => ({ demand: maxPassengers * dest.population / TOTAL_POPULATION, id: dest.id }))

    return {
      id: source.id,
      name: source.name,
      maxPassengers,
      destinations,
      lat: source.lat,
      long: source.long,
      country: source.country,
      population: source.population
    }
  }),
  findCityById(id) {
    const { cities } = get()
    return cities.find(city => city.id === id)
  },
  selectCityNearCoords(lat, long) {
    const { cities } = get()
    const city = cities.find(city => {
      const dist = latLongDistance(city, { lat, long })
      return dist < MAX_DIST_FOR_CLICK
    })
    set({ selectedCity: city })
  }
}))

export default useMapState
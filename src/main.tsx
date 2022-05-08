import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three';
import Earth from './Earth'
import City from './City';
import cities from './resources/cities.json'
import countries from './resources/countries.json'
import { latLongDistance } from './utils';
import Hud from './Hud';
import { City as CityFields, Route as RouteFields } from './types';
import Route from './Route';

const MAX_DIST_FOR_CLICK = 45
const MAX_DAILY_PASSENGERS = 4500000000 / 356
const TOTAL_POPULATION = 7753000000

const cityData = cities.map(source => {
  const maxPassengers = MAX_DAILY_PASSENGERS * source.population / TOTAL_POPULATION
  const destinations = cities
    .filter(dest => dest.id !== source.id)
    .map(dest => ({ demand: maxPassengers * dest.population / TOTAL_POPULATION, id: dest.id }))

  return {
    id: source.id,
    name: source.city,
    maxPassengers,
    destinations,
    lat: source.lat,
    long: source.lng,
    country: source.iso3,
    capital: source.capital,
    population: source.population
  }
})

function App() {
  const camera = useRef<THREE.PerspectiveCamera>()
  const [unlockedCountries, setUnlockedCountries] = useState<string[]>(countries.map(c => c.code))
  const [selectedCity, selectCity] = useState<CityFields>()
  const [routes, setRoutes] = useState<RouteFields[]>([])

  const availableCities = cityData.filter(city => unlockedCountries.includes(city.country))

  const unlockCountry = useCallback((code: string) => {
    if (code) {
      setUnlockedCountries(countries => Array.from(new Set([...countries, code])))
    }
  }, [])

  const onEarthClick = useCallback((lat: number, long: number) => {
    const city = availableCities.find(city => {
      const dist = latLongDistance(city, { lat, long })
      return dist < MAX_DIST_FOR_CLICK
    })
    selectCity(city)
  }, [availableCities])

  return (
    <div className="canvas-container">
      <Canvas linear flat>
        <PerspectiveCamera ref={camera} makeDefault position={[0, 0, 3]}/>
        <OrbitControls
          camera={camera.current}
          enablePan={false}
          enableDamping={false}
          minDistance={1.5}
          maxDistance={3}
        />
        <Earth unlockedCountries={unlockedCountries} onSelectedCountryChange={unlockCountry} onClick={onEarthClick} />
        {
          availableCities.map(city => 
            <City key={city.id} lat={city.lat} long={city.long} name={city.name} />
          )
        }
        {
          routes.map(route => {
            const source = cityData.find(city => city.id === route.source)
            const dest = cityData.find(city => city.id === route.dest)

            return (source && dest)
              ?  <Route key={`${route.source}-${route.dest}`} source={source} dest={dest}/>
              : null
          })
        }
      </Canvas>
      <Hud
        cities={cityData}
        selectedCity={selectedCity}
        onAddRoute={(dest) => selectedCity && setRoutes(routes => [...routes, { dest, source: selectedCity.id }])}
      />
    </div>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(<App />)

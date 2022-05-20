import React, { Fragment, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three';
import Earth from './Earth'
import City from './City';
import Hud from './Hud';
import Route from './Route';
import Flight from './Flight';
import useClockState from './clock-state';
import useMapState from './map-state';
import useAirlineState from './airline-state';

function Game() {
  const camera = useRef<THREE.PerspectiveCamera>()
  const set = useThree(state => state.set)
  const [clock] = useState(new THREE.Clock(false))
  const tick = useClockState(state => state.tick)
  const initGameState = useClockState(state => state.init)

  const cities = useMapState(state => state.cities)
  const selectCityNearCoords = useMapState(state => state.selectCityNearCoords)
  const findCityById = useMapState(state => state.findCityById)

  const { flights, routes } = useAirlineState(state => state)

  useLayoutEffect(() => {
    initGameState({ clock })
    set({ clock })
  }, [])

  useFrame(() => {
    tick()
  })

  return <>
    <PerspectiveCamera ref={camera} makeDefault position={[0, 0, 3]}/>
    <OrbitControls
      camera={camera.current}
      enablePan={false}
      enableDamping={false}
      minDistance={1.5}
      maxDistance={3}
    />
    <Earth onClick={selectCityNearCoords} />
    {
      cities.map(city => 
        <City key={city.id} lat={city.lat} long={city.long} name={city.name} />
      )
    }
    {
      routes.map(route => {
        const city1 = findCityById(route.city1)
        const city2 = findCityById(route.city2)
        return (city1 && city2)
          ? <Route key={route.id} source={city1} dest={city2}/>
          : null
      })
    }
    <Suspense>
      {
        flights.map(flight => 
          <Flight key={flight.id} id={flight.id} />
        )
      }
    </Suspense>
  </>
}

function App() {

  return (
    <div className="canvas-container">
      <Canvas linear flat>
        <Game />
      </Canvas>
      <Hud />
    </div>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(<App />)

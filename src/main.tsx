import React, { useCallback, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three';
import Earth from './Earth'
import City from './City';
import cities from './resources/cities.json'
import { latLongDistance } from './utils';

const MAX_DIST_FOR_CLICK = 30

function Game() {
  const camera = useRef<THREE.PerspectiveCamera>()
  const [unlockedCountries, setUnlockedCountries] = useState<string[]>([])
  const [selectedCity, selectCity] = useState<{ name: string } | undefined>()

  const availableCities = cities.filter(city => unlockedCountries.includes(city.country))

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

  useFrame(({ gl, camera, scene }) => {
    gl.render(scene, camera)
  }, 1)

  return <>
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
        <City key={city.name} lat={city.lat} long={city.long} name={city.name} />
      )
    }
  </>
}

function App() {
  return (
    <div className="canvas-container">
      <Canvas linear flat>
        <Game />
      </Canvas>
    </div>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(<App />)

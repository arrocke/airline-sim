import React, { createContext, useCallback, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three';
import Earth from './Earth'
// import { LabelSceneProvider } from './LabelScene';
import City from './City';
import cities from './resources/cities.json'

function Game() {
  const camera = useRef<THREE.PerspectiveCamera>()
  const [unlockedCountries, setUnlockedCountries] = useState<string[]>([])
  // const labelScene = useRef(new THREE.Scene())

  const unlockCountry = useCallback((code: string) => {
    if (code) {
      setUnlockedCountries(countries => Array.from(new Set([...countries, code])))
    }
  }, [])

  useFrame(({ gl, camera, scene }) => {
    gl.render(scene, camera)
    // gl.autoClear = false
    // gl.clearDepth()
    // gl.render(labelScene.current, camera)
    // gl.autoClear = true
  }, 1)

  // return <LabelSceneProvider scene={labelScene.current}>
  return <>
    <PerspectiveCamera ref={camera} makeDefault position={[0, 0, 3]}/>
    <OrbitControls
      camera={camera.current}
      enablePan={false}
      enableDamping={false}
      minDistance={1.5}
      maxDistance={3}
    />
    <Earth unlockedCountries={unlockedCountries} onSelectedCountryChange={unlockCountry} onClick={console.log} />
    {
      cities.filter(city => unlockedCountries.includes(city.country)).map(city => 
        <City key={city.name} lat={city.lat} long={city.long} name={city.name} />
      )
    }
  </>
  // </LabelSceneProvider>
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
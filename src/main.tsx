import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three';
import Earth from './Earth'

function Game() {
  const camera = useRef<THREE.PerspectiveCamera>()
  const [unlockedCountries, setUnlockedCountries] = useState<string[]>([])

  const unlockCountry = useCallback((code: string) => {
    if (code) {
      setUnlockedCountries(countries => Array.from(new Set([...countries, code])))
    }
  }, [])

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
    <Earth unlockedCountries={unlockedCountries} onSelectedCountryChange={unlockCountry} onClick={console.log} />
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
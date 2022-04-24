import React, { useCallback, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three';
import Earth from './Earth'

function App() {
  const camera = useRef<THREE.PerspectiveCamera>()
  const [unlockedCountries, setUnlockedCountries] = useState<string[]>([])

  const unlockCountry = useCallback((code: string) => {
    if (code) {
      setUnlockedCountries(countries => Array.from(new Set([...countries, code])))
    }
  }, [])

  return (
    <div className="canvas-container">
      <Canvas linear flat>
        <color attach="background" args={["black"]} />
        <PerspectiveCamera ref={camera} makeDefault position={[0, 0, 3]}/>
        <OrbitControls
          camera={camera.current}
          enablePan={false}
          enableDamping={false}
          minDistance={1.5}
          maxDistance={3}
        />
        <Earth unlockedCountries={unlockedCountries} onSelectedCountryChange={unlockCountry} />
      </Canvas>
    </div>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(<App />)
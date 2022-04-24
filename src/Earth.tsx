
import React, { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three';
import countries from './resources/countries.json'
import { ThreeEvent } from '@react-three/fiber';
import Picker, { PickerRef } from './Picker';
import EarthMaterial from './EarthMaterial';


export interface EarthProps {
  unlockedCountries?: string[]
  onSelectedCountryChange?(country?: string): void
}

function Earth ({ unlockedCountries = [], onSelectedCountryChange }: EarthProps) {
  const geometry = useRef(new THREE.SphereGeometry(1, 80, 60))

  const { indexTexture } = useTexture({
    indexTexture: 'src/resources/countries-index.png'
  })
  useLayoutEffect(() => {
    indexTexture.minFilter = THREE.NearestFilter
    indexTexture.magFilter = THREE.NearestFilter
  }, [])

  const picker = useRef<PickerRef>(null)
  const pick = useCallback(({ nativeEvent }: ThreeEvent<MouseEvent>) => {
    if (onSelectedCountryChange) {
      const color = picker.current!.pick(nativeEvent.clientX, nativeEvent.clientY)
      const id = 255 - color.r
      if (id > 0) {
        onSelectedCountryChange(countries[id]?.code)
      } else {
        onSelectedCountryChange()
      }
    }
  }, [onSelectedCountryChange])


  return <>
    <mesh onClick={onSelectedCountryChange && pick} geometry={geometry.current}>
      <EarthMaterial unlockedCountries={unlockedCountries} />
    </mesh>
    { onSelectedCountryChange
      ?  <Picker ref={picker}>
          <mesh geometry={geometry.current}>
            <meshBasicMaterial map={indexTexture} />
          </mesh>
        </Picker>
      : null
    }
  </>
}

export default Earth
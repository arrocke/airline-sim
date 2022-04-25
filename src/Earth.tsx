
import React, { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three';
import countries from './resources/countries.json'
import { ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import Picker, { PickerRef } from './Picker';
import EarthMaterial from './EarthMaterial';
import EarthLabel from './EarthLabel';

export interface EarthProps {
  unlockedCountries?: string[]
  onSelectedCountryChange?(country?: string): void
  onClick?(lat: number, long: number): void
}

function Earth ({ unlockedCountries = [], onSelectedCountryChange, onClick }: EarthProps) {
  const geometry = useRef(new THREE.SphereGeometry(1, 80, 60, -Math.PI / 2))

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

  const shouldHandleClick = !!onSelectedCountryChange || !!onClick

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    pick(e)
    if (onClick) {
      const intersection = e.intersections[0]
      if (intersection) {
        const spherical = new THREE.Spherical()
        spherical.setFromVector3(intersection.point)
        onClick(90 - THREE.MathUtils.radToDeg(spherical.phi), THREE.MathUtils.radToDeg(spherical.theta)) 
      }
    }
  }, [pick, onClick])

  return <>
    <mesh onClick={shouldHandleClick ? handleClick : undefined} geometry={geometry.current}>
      <EarthMaterial unlockedCountries={unlockedCountries} />
      <EarthLabel lat={39.029} long={-97.273}>
        United States
      </EarthLabel>
      <EarthLabel lat={23.347} long={-102.128}>
        Mexico
      </EarthLabel>
      <EarthLabel lat={57.562} long={-112.399}>
        Canada
      </EarthLabel>
    </mesh>
    { onSelectedCountryChange
        ? <Picker ref={picker}>
            <mesh geometry={geometry.current}>
              <meshBasicMaterial map={indexTexture} />
            </mesh>
          </Picker>
        : null
    }
  </>
}

export default Earth
import React, { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three';
import countries from './resources/countries.json'

const MAX_COUNTRIES = 512;
const countryColorReplacements = [
  {
    from: '#include <common>',
    to: `
      #include <common>
      uniform sampler2D indexTexture;
      uniform sampler2D paletteTexture;
      uniform float paletteTextureWidth;
    `
  },
  {
    from: '#include <color_fragment>',
    to: `
      #include <color_fragment>
      {
        vec4 indexColor = texture2D(indexTexture, vUv);
        float index = indexColor.r == 0.0 ? 0.0 : 256.0 - indexColor.r * 255.0;
        vec2 paletteUV = vec2((index + 0.5) / paletteTextureWidth, 0.5);
        vec4 paletteColor = texture2D(paletteTexture, paletteUV);
        diffuseColor.rgb = paletteColor.rgb - diffuseColor.rgb;
      }
    `
  }
]

export interface CountryColorMaterialProps {
  unlockedCountries?: string[]
}

function EarthMaterial({ unlockedCountries = [] }: CountryColorMaterialProps) {
  const { borderTexture, indexTexture } = useTexture({
    borderTexture: 'src/resources/borders.png',
    indexTexture: 'src/resources/countries-index.png'
  })
  useLayoutEffect(() => {
    indexTexture.minFilter = THREE.NearestFilter
    indexTexture.magFilter = THREE.NearestFilter
  }, [])

  const { paletteTexture, palette } = useMemo(() => {
    const palette = new Uint8Array(MAX_COUNTRIES * 4)
    const paletteTexture = new THREE.DataTexture(palette, MAX_COUNTRIES, 1, THREE.RGBAFormat);
    paletteTexture.minFilter = THREE.NearestFilter;
    paletteTexture.magFilter = THREE.NearestFilter;
    return { paletteTexture, palette }
  }, [])

  useLayoutEffect(() => {
    const selectedIndexes = countries
      .map<[number,string]>(({ code }, i) => [i + 1, code])
      .filter(([, code]) => unlockedCountries.includes(code))
      .map(([index]) => index)
    for (let i = 0; i < MAX_COUNTRIES; ++i) {
      if (selectedIndexes.includes(i)) {
        palette.set([255, 255, 255], i * 4)
      } else {
        palette.set([150, 150, 150], i * 4)
      }
    }
    palette.set([100, 200, 255], 0);
    paletteTexture.needsUpdate = true
  }, [unlockedCountries])

  const beforeCompile = useCallback((shader: THREE.Shader) => {
    countryColorReplacements.forEach((rep) => {
      shader.fragmentShader = shader.fragmentShader.replace(rep.from, rep.to);
    });
    shader.uniforms.paletteTexture = { value: paletteTexture };
    shader.uniforms.indexTexture = { value: indexTexture };
    shader.uniforms.paletteTextureWidth = { value: MAX_COUNTRIES };
  }, [paletteTexture, indexTexture])

  return <meshBasicMaterial map={borderTexture} onBeforeCompile={beforeCompile} />
}

export default EarthMaterial
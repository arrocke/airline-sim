import * as THREE from "three";

const loader = new THREE.TextureLoader();

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

export function createEarth() {
  const borderTexture = loader.load('src/resources/borders.png')

  const indexTexture = loader.load('src/resources/countries-index.png');
  indexTexture.minFilter = THREE.NearestFilter;
  indexTexture.magFilter = THREE.NearestFilter;

  const palette = new Uint8Array(MAX_COUNTRIES * 4);
  const paletteTexture = new THREE.DataTexture(palette, MAX_COUNTRIES, 1, THREE.RGBAFormat);
  paletteTexture.minFilter = THREE.NearestFilter;
  paletteTexture.magFilter = THREE.NearestFilter;
  for (let i = 0; i < MAX_COUNTRIES; ++i) {
    palette.set([255, 255, 255], i * 4)
  }
  palette.set([100, 200, 255], 0);
  paletteTexture.needsUpdate = true

  const geometry = new THREE.SphereGeometry(1, 80, 60)
  geometry.rotateY(-Math.PI / 2) // rotate so that the sphere lines up with lat long coords.

  const material = new THREE.MeshBasicMaterial({
    map: borderTexture
  });
  material.onBeforeCompile = (shader) => {
    countryColorReplacements.forEach((rep) => {
      shader.fragmentShader = shader.fragmentShader.replace(rep.from, rep.to);
    });
    shader.uniforms.paletteTexture = { value: paletteTexture };
    shader.uniforms.indexTexture = { value: indexTexture };
    shader.uniforms.paletteTextureWidth = { value: MAX_COUNTRIES };
  };

  const mesh = new THREE.Mesh(geometry, material)

  function getPointerIntersection(pointer: { x: number, y: number }, camera: THREE.Camera) {
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(pointer, camera)
    const point = raycaster.intersectObject(mesh)[0]?.point
    if (point) {
      const spherical = new THREE.Spherical()
      spherical.setFromVector3(point)
      const latlong = {
        lat: 90 - spherical.phi / Math.PI * 180,
        long: spherical.theta / Math.PI * 180
      }
      return latlong
    }
  }

  return { mesh, getPointerIntersection }
}
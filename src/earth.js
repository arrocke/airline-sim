import * as THREE from '../node_modules/three/build/three.module.js'
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
const populationReplacements = [
  {
    from: '#include <common>',
    to: `
      #include <common>
      uniform sampler2D indexTexture;
      uniform sampler2D populationTexture;
    `
  },
  {
    from: '#include <color_fragment>',
    to: `
      #include <color_fragment>
      {
        vec4 indexColor = texture2D(indexTexture, vUv);
        vec4 populationColor = texture2D(populationTexture, vUv);
        vec3 finalPopColor = indexColor.r == 0.0 && populationColor.r == 0.0 ? vec3(1.0, 1.0, 1.0) : vec3(populationColor.r, 0.0, 0.0);
        diffuseColor.rgb = finalPopColor.rgb + diffuseColor.rgb;
      }
    `
  }
]

export default class Earth {
  constructor() {
    this.borderTexture = loader.load('src/resources/borders.png')
    // this.borderTexture.minFilter = THREE.NearestFilter;
    // this.borderTexture.magFilter = THREE.NearestFilter;
    this.populationTexture = loader.load('src/resources/population.png')
    this.indexTexture = loader.load('src/resources/countries-index.png');
    this.indexTexture.minFilter = THREE.NearestFilter;
    this.indexTexture.magFilter = THREE.NearestFilter;

    this.palette = new Uint8Array(MAX_COUNTRIES * 4);
    this.paletteTexture = new THREE.DataTexture(this.palette, MAX_COUNTRIES, 1, THREE.RGBAFormat);
    this.paletteTexture.minFilter = THREE.NearestFilter;
    this.paletteTexture.magFilter = THREE.NearestFilter;
    for (let i = 0; i < MAX_COUNTRIES; ++i) {
      this.palette.set([255, 255, 255], i * 4)
    }
    this.palette.set([100, 200, 255], 0);
    this.paletteTexture.needsUpdate = true

    this.geometry = new THREE.SphereGeometry(1, 80, 60);
    this.geometry.rotateY(-Math.PI / 2) // rotate so that the sphere lines up with lat long coords.

    this.material = new THREE.MeshBasicMaterial({
      map: this.borderTexture
    });
    this.material.onBeforeCompile = (shader) => {
      countryColorReplacements.forEach((rep) => {
        shader.fragmentShader = shader.fragmentShader.replace(rep.from, rep.to);
      });
      shader.uniforms.paletteTexture = { value: this.paletteTexture };
      shader.uniforms.indexTexture = { value: this.indexTexture };
      shader.uniforms.paletteTextureWidth = { value: MAX_COUNTRIES };
    };

    this.populationMaterial = new THREE.MeshBasicMaterial({
      map: this.borderTexture
    });
    this.populationMaterial.onBeforeCompile = (shader) => {
      populationReplacements.forEach((rep) => {
        shader.fragmentShader = shader.fragmentShader.replace(rep.from, rep.to);
      });
      shader.uniforms.indexTexture = { value: this.indexTexture };
      shader.uniforms.populationTexture = { value: this.populationTexture };
    };

    this.mesh = new THREE.Mesh(this.geometry, this.material)

    this.pickingMaterial = new THREE.MeshBasicMaterial({ map: this.indexTexture });
    this.pickingMesh = new THREE.Mesh(this.geometry, this.pickingMaterial)
  }

  showPopulation() {
    this.mesh.material = this.populationMaterial
  }

  showDefault() {
    this.mesh.material = this.material
  }
}
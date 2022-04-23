import * as THREE from '../node_modules/three/build/three.module.js'
const loader = new THREE.TextureLoader();

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
    this.populationTexture = loader.load('src/resources/population.png')

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

    this.pickingMaterial = new THREE.MeshBasicMaterial({ map: this.indexTexture });
    this.pickingMesh = new THREE.Mesh(this.geometry, this.pickingMaterial)

    this.raycaster = new THREE.Raycaster();
  }

  getMouseIntersection(camera, pointer) {
    this.raycaster.setFromCamera(pointer, camera)
    const point = this.raycaster.intersectObject(this.mesh)[0]?.point
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
}
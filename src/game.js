import * as THREE from '../node_modules/three/build/three.module.js'
import { OrbitControls } from './orbit-controls.js';
import loadAirports from './airports.js'

const loader = new THREE.TextureLoader();

const canvas = document.querySelector('canvas')
const renderer = new THREE.WebGLRenderer({ canvas })
// renderer.setClearColor(0xffffff, 1);

const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 5)
camera.rotateY(-Math.PI / 2)
camera.rotateX(-Math.PI / 4)
camera.translateZ(2)

const controls = new OrbitControls( camera, renderer.domElement );

const scene = new THREE.Scene()

// const light = new THREE.DirectionalLight(0xffffff, 1);
// light.position.set(-1, 2, 4);
// scene.add(light);

const earthGeometry = new THREE.SphereGeometry(1, 80, 60);
const bordersMaterial = new THREE.MeshBasicMaterial({
  map: loader.load('src/resources/countries-index.png'),
});
const sphere = new THREE.Mesh(earthGeometry, bordersMaterial)
sphere.rotateY(-Math.PI / 2)
scene.add(sphere);

const pointGeometry = new THREE.CircleGeometry(0.002, 24, 16);
const pointMaterial = new THREE.MeshBasicMaterial({
  color: '#ff0000'
})
const lineMaterial = new THREE.LineBasicMaterial({
  color: '#ff0000',
  linewidth: 1
})

{
  const pickingScene = new THREE.Scene();
  pickingScene.background = new THREE.Color(0);

  const indexTexture = loader.load('src/resources/countries-index.png', render);
  indexTexture.minFilter = THREE.NearestFilter;
  indexTexture.magFilter = THREE.NearestFilter;

  const pickingMaterial = new THREE.MeshBasicMaterial({map: indexTexture});
  const pickingMesh = new THREE.Mesh(earthGeometry, pickingMaterial)
  pickingMesh.rotateY(-Math.PI / 2)
  pickingScene.add(pickingMesh);

  class GPUPickHelper {
    constructor() {
      // create a 1x1 pixel render target
      this.pickingTexture = new THREE.WebGLRenderTarget(1, 1);
      this.pixelBuffer = new Uint8Array(4);
    }
    pick(cssPosition, scene, camera) {
      pause()
      const {pickingTexture, pixelBuffer} = this;
   
      // set the view offset to represent just a single pixel under the mouse
      const pixelRatio = window.devicePixelRatio
      const context = renderer.getContext()
      camera.setViewOffset(
          context.drawingBufferWidth,   // full width
          context.drawingBufferHeight,  // full top
          cssPosition.x * pixelRatio | 0,        // rect x
          cssPosition.y * pixelRatio | 0,        // rect y
          1,                                     // rect width
          1,                                     // rect height
      );
      // render the scene
      renderer.setRenderTarget(pickingTexture);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      // clear the view offset so rendering returns to normal
      camera.clearViewOffset();
      //read the pixel
      renderer.readRenderTargetPixels(
          pickingTexture,
          0,   // x
          0,   // y
          1,   // width
          1,   // height
          pixelBuffer);
   
      const id =
          (pixelBuffer[0] << 16) |
          (pixelBuffer[1] <<  8) |
          (pixelBuffer[2] <<  0);

      resume()
      return id;
    }
  }

  const pickHelper = new GPUPickHelper();

  function getCanvasRelativePosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  canvas.addEventListener('mouseup', (event) => {
    const position = getCanvasRelativePosition(event);
    console.log(pickHelper.pick(position, pickingScene, camera))
  });
}

function toRadians(point) {
  return [THREE.MathUtils.degToRad(point[0]), THREE.MathUtils.degToRad(point[1])]
}

function createPoint(pos) {
  const radPos = toRadians(pos)
  const point = new THREE.Mesh(pointGeometry, pointMaterial)
  point.rotateY(radPos[1])
  point.rotateX(-radPos[0])
  point.translateZ(1)
  scene.add(point)
  return point
}

THREE.Vector3.fromSpherical = (r, phi, theta) => {
  const vector = new THREE.Vector3()
  vector.setFromSphericalCoords(r, -phi + Math.PI / 2, theta)
  return vector
}

const MAX_LINE_SEG_ANGLE = 0.05

function createLine(a, b) {
  const start = toRadians(a)
  const end = toRadians(b)
  const p = THREE.Vector3.fromSpherical(1, start[0], start[1])
  const q = THREE.Vector3.fromSpherical(1, end[0], end[1])
  const diff = q.clone().sub(p)
  const angle = Math.acos(p.dot(q))
  const segments = Math.round(angle / MAX_LINE_SEG_ANGLE)
  const points = []
  for (let i = 0; i <= segments; i++) {
    const v = diff.clone().multiplyScalar(i / segments).add(p)
    const length = v.length()
    points.push(v.divideScalar(length))
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setFromPoints(points)
  const line = new THREE.Line( geometry, lineMaterial );
  scene.add(line)
  return line
}

// loadAirports().then(airports => {
//   const msp = airports.find(port => port.code === 'MSP')
//   for (const airport of airports) {
//     createPoint([airport.lat, airport.long])
//   }
// })

let isPaused = false

function render(time) {
  if (isPaused) return
  const canvas = renderer.domElement;
  const pixelRatio = window.devicePixelRatio;
  const width  = canvas.clientWidth  * pixelRatio | 0;
  const height = canvas.clientHeight * pixelRatio | 0;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
 
  renderer.render(scene, camera);
 
  requestAnimationFrame(render);
}

function pause() {
  isPaused = true
}

function resume() {
  isPaused = false
  requestAnimationFrame(render)
}
resume()
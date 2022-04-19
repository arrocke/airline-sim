import * as THREE from '../node_modules/three/build/three.module.js'
import { OrbitControls } from './orbit-controls.js';
import { CSS3DRenderer } from './css-renderer.js';
import Earth from './earth.js';
import Picker from './picker.js';
import HeadsUpDisplay from './hud.js';
import { CityFactory } from './city.js';

const canvas = document.querySelector('#canvas')
const labelsDiv = document.querySelector('#labels')
const hudDiv = document.querySelector('#hud')

const renderer = new THREE.WebGLRenderer({ canvas })
const scene = new THREE.Scene()
const labelsScene = new THREE.Scene()

const cssRenderer = new CSS3DRenderer({ element: labelsDiv })

const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 5)
camera.rotateY(-Math.PI / 2)
camera.rotateX(-Math.PI / 4)
camera.translateZ(2)

const cityFactory = new CityFactory()

const earth = new Earth()
const picker = new Picker(renderer, camera)
picker.add(earth.pickingMesh)
scene.add(earth.mesh)

// const lineMaterial = new THREE.LineBasicMaterial({
//   color: '#ff0000',
//   linewidth: 1
// })

function getCanvasRelativePosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

const maxClickTimeMs = 200;
const maxMoveDeltaSq = 5 * 5;
const startPosition = {};
let startTimeMs;

canvas.addEventListener('mousedown', (event) => {
  startTimeMs = performance.now();
  const pos = getCanvasRelativePosition(event);
  startPosition.x = pos.x;
  startPosition.y = pos.y;
});

canvas.addEventListener('mouseup', (event) => {
  const clickTimeMs = performance.now() - startTimeMs;
  if (clickTimeMs > maxClickTimeMs) {
    return;
  }

  const position = getCanvasRelativePosition(event);
  const moveDeltaSq = (startPosition.x - position.x) ** 2 +
                      (startPosition.y - position.y) ** 2;
  if (moveDeltaSq > maxMoveDeltaSq) {
    return;
  }

  const id = picker.pick(position)[0]
  if (id !== 0) {
    earth.palette.set([255,0,0], (256-id) * 4)
    earth.paletteTexture.needsUpdate = true
  }
});

// function toRadians(point) {
//   return [THREE.MathUtils.degToRad(point[0]), THREE.MathUtils.degToRad(point[1])]
// }

// const MAX_LINE_SEG_ANGLE = 0.05

// function createLine(a, b) {
//   const start = toRadians(a)
//   const end = toRadians(b)
//   const p = THREE.Vector3()
//   const q = THREE.Vector3()
//   p.setFromSpherical(1, start[0], start[1])
//   q.setFromSpherical(1, end[0], end[1])
//   const diff = q.clone().sub(p)
//   const angle = Math.acos(p.dot(q))
//   const segments = Math.round(angle / MAX_LINE_SEG_ANGLE)
//   const points = []
//   for (let i = 0; i <= segments; i++) {
//     const v = diff.clone().multiplyScalar(i / segments).add(p)
//     const length = v.length()
//     points.push(v.divideScalar(length))
//   }
//   const geometry = new THREE.BufferGeometry()
//   geometry.setFromPoints(points)
//   const line = new THREE.Line( geometry, lineMaterial );
//   scene.add(line)
//   return line
// }


// loadAirports().then(airports => {
//   const msp = airports.find(port => port.code === 'MSP')
//   for (const airport of airports) {
//     cityFactory.createCity(airport)
//   }
// })

const hud = new HeadsUpDisplay({
  el: hudDiv,
  onModeChange: (mode) => {
    if (mode === 'selected') {
      earth.showDefault()
    } else {
      earth.showPopulation()
    }
  }
})

const controls = new OrbitControls(camera, labelsDiv);
controls.zoomSpeed = 0.3
controls.minDistance = 1.1
controls.maxDistance = 2
controls.enablePan = false

function render(time) {
  const canvas = renderer.domElement;
  const pixelRatio = window.devicePixelRatio;
  const width  = canvas.clientWidth  * pixelRatio | 0;
  const height = canvas.clientHeight * pixelRatio | 0;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
    cssRenderer.setSize(canvas.clientWidth, canvas.clientHeight)
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  const cameraDirection = new THREE.Vector3()
  camera.getWorldDirection(cameraDirection)
  cameraDirection.negate().normalize()

  cityFactory.update({ glScene: scene, cssScene: labelsScene, cameraDirection })
 
  renderer.render(scene, camera);
  cssRenderer.render(labelsScene, camera);
 
  requestAnimationFrame(render);
}

THREE.DefaultLoadingManager.onLoad = () => {
  requestAnimationFrame(render)
}

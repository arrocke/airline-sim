import * as THREE from '../node_modules/three/build/three.module.js'
import { OrbitControls } from './orbit-controls.js';
import { CSS3DRenderer, CSS3DObject } from './css-renderer.js';
// import  PopulationData from './population.js'
import Earth from './earth.js';
import Picker from './picker.js';
import HeadsUpDisplay from './hud.js';

THREE.Vector3.fromSpherical = (r, phi, theta) => {
  const vector = new THREE.Vector3()
  vector.setFromSphericalCoords(r, -phi + Math.PI / 2, theta)
  return vector
}

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


const earth = new Earth()
const picker = new Picker(renderer, camera)
picker.add(earth.pickingMesh)
scene.add(earth.mesh)

const pointGeometry = new THREE.CircleGeometry(0.004, 24, 16);
const pointMaterial = new THREE.MeshBasicMaterial({
  color: '#0000ff'
})
pointMaterial.transparent = true
pointMaterial.opacity = 0.5
const lineMaterial = new THREE.LineBasicMaterial({
  color: '#ff0000',
  linewidth: 1
})

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

const labels = []
function createCityLabel(city) {
  const label = new CSS3DObject()
  label.element.innerText = city.name
  label.element.className = 'city-label'
  label.scale.x = 0.001
  label.scale.y = 0.001
  label.position.setFromSphericalCoords(1, (-city.lat + 90) * Math.PI / 180, city.long * Math.PI / 180)
  labels.push(label)
}

function updateLabels() {
  const cameraDirection = new THREE.Vector3()
  camera.getWorldDirection(cameraDirection)
  cameraDirection.negate().normalize()
  labels.forEach(label => {
    const labelWorldPosition = new THREE.Vector3()
    label.getWorldPosition(labelWorldPosition)
    console.log(labelWorldPosition.normalize().dot(cameraDirection))
    if (labelWorldPosition.normalize().dot(cameraDirection) > 0.75) {
      const point = label.position.clone().add(cameraDirection)
      label.lookAt(point.x, point.y, point.z)
      labelsScene.add(label)
    } else {
      labelsScene.remove(label)
    }
  })
}

// const selectionGeometry = new THREE.SphereGeometry(1.001, 40, 7, 0, Math.PI * 2, 0, 0.056506043)
// const selectionMaterial = new THREE.MeshBasicMaterial({
//   color: '#00ff00',
// })
// selectionMaterial.opacity = 0.5
// selectionMaterial.transparent = true
// const selectionMesh = new THREE.Mesh(selectionGeometry, selectionMaterial)
// selectionMesh.rotateY(chicago[1] * Math.PI / 180)
// selectionMesh.rotateX(Math.PI / 2 - chicago[0] * Math.PI / 180)
// scene.add(selectionMesh)

// createPoint(chicago)

// const populationData = new PopulationData()

// loadAirports().then(airports => {
//   const msp = airports.find(port => port.code === 'MSP')
//   for (const airport of airports) {
//     createPoint([airport.lat, airport.long])
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

const jsonLoader = new THREE.FileLoader()
jsonLoader.responseType = 'json'
jsonLoader.load('src/resources/cities.json', (cities) => {
  for (const city of cities) {
    createPoint([city.lat, city.long])
    createCityLabel(city)
  }
})

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

  updateLabels()
 
  renderer.render(scene, camera);
  cssRenderer.render(labelsScene, camera);
 
  requestAnimationFrame(render);
}

THREE.DefaultLoadingManager.onLoad = () => {
  requestAnimationFrame(render)
}

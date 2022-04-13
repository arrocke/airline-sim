import * as THREE from '../node_modules/three/build/three.module.js'
import { OrbitControls } from './orbit-controls.js';
import loadAirports from './airports.js'
import Earth from './earth.js';
import Picker from './picker.js';

const canvas = document.querySelector('canvas')
const renderer = new THREE.WebGLRenderer({ canvas })
const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 5)
camera.rotateY(-Math.PI / 2)
camera.rotateX(-Math.PI / 4)
camera.translateZ(2)

const controls = new OrbitControls( camera, renderer.domElement );

const earth = new Earth()
const picker = new Picker(renderer, camera)
picker.add(earth.pickingMesh)
scene.add(earth.mesh)

const pointGeometry = new THREE.CircleGeometry(0.002, 24, 16);
const pointMaterial = new THREE.MeshBasicMaterial({
  color: '#ff0000'
})
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

loadAirports().then(airports => {
  const msp = airports.find(port => port.code === 'MSP')
  for (const airport of airports) {
    createPoint([airport.lat, airport.long])
  }
})

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
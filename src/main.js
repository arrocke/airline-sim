import * as THREE from '../node_modules/three/build/three.module.js'
import { OrbitControls } from './orbit-controls.js';

const loader = new THREE.TextureLoader();

const canvas = document.querySelector('canvas')
const renderer = new THREE.WebGLRenderer({ canvas })

const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 5)
camera.rotateY(-Math.PI / 2)
camera.rotateX(-Math.PI / 4)
camera.translateZ(2)

const controls = new OrbitControls( camera, renderer.domElement );

const scene = new THREE.Scene()

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(-1, 2, 4);
scene.add(light);

const earthGeometry = new THREE.SphereGeometry(1, 48, 32);
const earthMaterial = new THREE.MeshBasicMaterial({
  map: loader.load('src/resources/earth.jpg'),
});
const sphere = new THREE.Mesh(earthGeometry, earthMaterial)
sphere.rotateY(-Math.PI / 2)
scene.add(sphere);

const pointGeometry = new THREE.CircleGeometry(0.005, 24, 16);
const pointMaterial = new THREE.MeshBasicMaterial({
  color: '#ff0000'
})
const lineMaterial = new THREE.LineBasicMaterial({
  color: '#ff0000',
  linewidth: 1
})

function toRadians(point) {
  return [THREE.MathUtils.degToRad(point[0]), THREE.MathUtils.degToRad(point[1])]
}

function createPoint(pos) {
  const radPos = toRadians(pos)
  const point = new THREE.Mesh(pointGeometry, pointMaterial)
  point.rotateY(radPos[1])
  point.rotateX(radPos[0])
  point.translateZ(1)
  scene.add(point)
  return point
}

THREE.Vector3.fromSpherical = (r, phi, theta) => {
  const vector = new THREE.Vector3()
  vector.setFromSphericalCoords(r, phi + Math.PI / 2, theta)
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

// createLine([-33.9416, -118.4085],[-44.8848, -93.2223])

const msp = [-44.8848, -93.2223]
const lax = [-33.9416, -118.4085]
const ord = [-41.9803, -87.9090]

createPoint(msp)
createPoint(lax)
createPoint(ord)

createLine(msp, ord)
createLine(msp, lax)

function render(time) {
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
requestAnimationFrame(render);
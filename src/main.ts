import * as THREE from 'three' 
import { animationFrames, fromEvent, map, startWith } from 'rxjs'
import { createControls } from './controls'
import { createEarth } from './earth';

const canvasElement = document.querySelector<HTMLCanvasElement>('#canvas')!

const loader = new THREE.TextureLoader();
const renderer = new THREE.WebGLRenderer({ canvas: canvasElement })
const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 5)
const scene = new THREE.Scene()

const earth = createEarth()
scene.add(earth.mesh)

const cameraPosition  = createControls({
  element: canvasElement,
  position: new THREE.Spherical(2, Math.PI / 2, 0),
  dolly: {
    min: 1.1,
    max: 2
  }
})

cameraPosition
  .subscribe((spherical) => {
    camera.position.setFromSpherical(spherical)
    camera.lookAt(0, 0, 0)
  })

fromEvent(window, 'resize')
  .pipe(startWith(undefined))
  .subscribe(() => {
    const canvas = renderer.domElement
    const pixelRatio = window.devicePixelRatio ?? 0;
    const width  = canvas.clientWidth * pixelRatio;
    const height = canvas.clientHeight * pixelRatio;
    canvas.width = width
    canvas.height = width
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  })

const renderLoop = animationFrames().pipe(map(() => {
  renderer.render(scene, camera)
}))

THREE.DefaultLoadingManager.onLoad = () => {
  renderLoop.subscribe()
}

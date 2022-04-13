import * as THREE from '../node_modules/three/build/three.module.js'

export default class Picker {
  constructor(renderer, camera) {
    this.renderer = renderer
    this.camera = camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0);
    this.targetTexture = new THREE.WebGLRenderTarget(1, 1);
    this.readBuffer = new Uint8Array(4);
  }

  add(mesh) {
    this.scene.add(mesh)
  }

  pick(position) {
    // render just the clicked pixel to the texture
    const pixelRatio = window.devicePixelRatio
    const context = this.renderer.getContext()
    this.camera.setViewOffset(
      context.drawingBufferWidth,
      context.drawingBufferHeight,
      position.x * pixelRatio | 0,
      position.y * pixelRatio | 0,
      1,
      1
    );

    this.renderer.setRenderTarget(this.targetTexture);
    this.renderer.render(this.scene, this.camera);

    // reset the camera and render target
    this.renderer.setRenderTarget(null);
    this.camera.clearViewOffset();

    // read the pixel from the texture
    this.renderer.readRenderTargetPixels(this.targetTexture, 0, 0, 1, 1, this.readBuffer);
 
    return [
      this.readBuffer[0],
      this.readBuffer[1],
      this.readBuffer[2],
      this.readBuffer[3]
    ]
  }
}
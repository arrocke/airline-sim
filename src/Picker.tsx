import { createPortal, useThree } from '@react-three/fiber'
import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'

export interface PickerProps {
  children: React.ReactNode | undefined
}

export interface PickerRef {
  pick(x: number, y: number): THREE.Color
}

function Picker({ children }: PickerProps, ref: React.Ref<PickerRef>) {
  const { gl, camera } = useThree()
  const scene = useRef(new THREE.Scene)

  useImperativeHandle(ref, () => ({
    pick(x: number, y: number) {
      const pixelRatio = window.devicePixelRatio | 0
      const context = gl.getContext()
      camera.setViewOffset(
        context.drawingBufferWidth,
        context.drawingBufferHeight,
        x * pixelRatio,
        y * pixelRatio,
        1,
        1
      );

      const targetTexture = new THREE.WebGLRenderTarget(1, 1);

      gl.setRenderTarget(targetTexture);
      gl.render(scene.current, camera);

      gl.setRenderTarget(null);
      camera.clearViewOffset();

      const readBuffer = new Uint8Array(4)
      gl.readRenderTargetPixels(targetTexture, 0, 0, 1, 1, readBuffer);

      return new THREE.Color(readBuffer[0], readBuffer[1], readBuffer[2])
    }
  }))

  return <>{createPortal(children, scene.current)}</>
}

export default forwardRef<PickerRef, PickerProps>(Picker)

import { createPortal } from "@react-three/fiber";
import React, { createContext, ReactNode, useContext } from "react";

const LabelContext = createContext<null | THREE.Scene>(null)

export interface LabelSceneProviderProps {
  scene: THREE.Scene
  children: ReactNode
}

export function LabelSceneProvider({ scene, children }: LabelSceneProviderProps) {
  return <LabelContext.Provider value={scene}>
    {children}
  </LabelContext.Provider>
}

export interface LabelSceneProps {
  children: ReactNode
}

export function LabelScene({ children }: LabelSceneProps) {
  const scene = useContext(LabelContext)

  return <>{createPortal(children, scene!)}</>
}
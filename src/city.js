import * as THREE from '../node_modules/three/build/three.module.js'
import { CSS3DObject } from './css-renderer.js';

export class CityFactory {
  constructor () {
    this.cities = []

    this.geometry = new THREE.CircleGeometry(0.004, 24, 16);
    this.material = new THREE.MeshBasicMaterial({
      color: '#0000ff'
    })
    this.material.transparent = true
    this.material.opacity = 0.5

    this.loader = new THREE.FileLoader()
    this.loader.responseType = 'json'
    this.loader.load('src/resources/cities.json', (cities) => {
      for (const city of cities) {
        this.createCity(city)
      }
    })
  }

  createCity(city) {
    const mesh = new THREE.Mesh(this.geometry, this.material)
    mesh.rotateY(city.long * Math.PI / 180)
    mesh.rotateX(-city.lat * Math.PI / 180)
    mesh.translateZ(1)

    const label = new CSS3DObject()
    label.element.innerText = city.name
    label.element.className = 'city-label'
    label.scale.x = 0.001
    label.scale.y = 0.001
    label.position.setFromSphericalCoords(
      1,
      (-city.lat + 90) * Math.PI / 180,
      city.long * Math.PI / 180
    )

    const cityData = { mesh, label }
    this.cities.push(cityData)
    return cityData
  }

  update({ glScene, cssScene, cameraDirection }) {
    for (const { mesh, label } of this.cities) {
      const labelWorldPosition = new THREE.Vector3()
      label.getWorldPosition(labelWorldPosition)
      const dotProduct = labelWorldPosition.normalize().dot(cameraDirection)

      if (dotProduct > 0.6) {
        glScene.add(mesh)
      } else {
        glScene.remove(mesh)
      }

      if (dotProduct > 0.75) {
        const point = label.position.clone().add(cameraDirection)
        label.lookAt(point.x, point.y, point.z)
        cssScene.add(label)
      } else {
        cssScene.remove(label)
      }
    }
  }
}
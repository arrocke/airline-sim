import * as THREE from '../node_modules/three/build/three.module.js'

const loader = new THREE.FileLoader()

export class PopulationData {
	constructor() {
		this.data
		this.loaded = false
		loader.load('src/resources/population.txt', (data) => {
			this.data = data.trim().split('\r\n').map(line => {
				return line.trim().split(' ').map(cell => {
					const value = parseFloat(cell)
					return value === -9999 ? 0 : value
				})
			})
			this.loaded = true
		})
	}

	getDataAtPoint(lat, long) {
		if (this.loaded) {
			const j = Math.round((long + 180) / 360 * 1440)
			const i = Math.round((lat + 90) / 180 * 720)
			return this.data[i][j]
		} else {
			return 0
		}
	}
}
import * as THREE from '../node_modules/three/build/three.module.js'
import { latLongDistance  } from './utils.js'

const loader = new THREE.FileLoader()

export default class PopulationData {
	constructor() {
		this.data
		this.loaded = false
		loader.load('src/resources/population.txt', (data) => {
			let sum = 0
			this.data = data.trim().split('\r\n').slice(6).map(line => {
				return line.trim().split(' ').map(cell => {
					const value = parseFloat(cell)
					sum += value === -9999 ? 0 : value
					return value === -9999 ? 0 : value
				})
			})
			this.loaded = true
		})
	}

	getIndexForCoord(lat, long) {
		const i = Math.round((-lat + 90) / 180 * 720)
		const j = Math.round((long + 180) / 360 * 1440)
		return [i, j]
	}

	getDataAtPoint(lat, long) {
		if (this.loaded) {
			const [i, j] = this.getIndexForCoord(lat, long)
			return this.data[i][j]
		} else {
			return 0
		}
	}

	getDataNearPoint(lat, long, rad) {
		console.log(lat, long)
		if (this.loaded) {
			const kmPerLong = latLongDistance([lat, 0], [lat, 1])
			const kmPerLat = latLongDistance([0, long], [1, long])
			const radLong = rad / kmPerLong
			const radLat = rad / kmPerLat
			const [minI, minJ] = this.getIndexForCoord(lat + radLat, long - radLong)
			const [maxI, maxJ] = this.getIndexForCoord(lat - radLat, long + radLong)
			const results = []
			for (let i = minI; i <= maxI; i++) {
				for (let j = minJ; j <= maxJ; j++) {
					let _lat = 90 - i / 720 * 180
					let _long = j / 1440 * 360 - 180
					const dist = latLongDistance([lat, long], [_lat, _long])
					const value = this.data[i][j]
					if (dist <= rad) {
						results.push({ dist, value, lat: _lat, long: _long })
					}
				}
			}
			return results
		} else {
			return []
		}
	}
}
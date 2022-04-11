const WIDTH = 10000
const HEIGHT = 10000

const canvas = document.querySelector('canvas')
canvas.style=`height: 1000px; width: 1000px`
canvas.width = WIDTH
canvas.height = HEIGHT

const ctx = canvas.getContext('2d')

function toCtxCoord(pt) {
  return [
    -pt[1] / 90 * (HEIGHT / 2) + (HEIGHT / 2),
    pt[0] / 180 * (WIDTH / 2) + (WIDTH / 2)
  ]
}

async function render() {
  const response = await fetch('https://www.geoboundaries.org/api/current/gbOpen/ALL/ADM0/')
  const data = await response.json()
  let color = 255
  for (const country of data) {
    const colorHex = (color--).toString(16).padStart(2, '0')
    ctx.fillStyle = `#${colorHex}${colorHex}${colorHex}`
    await new Promise(resolve => setTimeout(async () => {
      try {
        let response
        if (country.boundaryISO === 'NZL') {
          response = await fetch('/src/resources/NZL.geojson')
        } else {
          response = await fetch(country.gjDownloadURL
            .replace('github.com', 'raw.githubusercontent.com')
            .replace('/raw/', '/')
          )
        }
        const data = await response.json()
        const feature = data.features[0]
        const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates
        for (const polygon of polygons) {
          if (polygon.length > 1) console.log(country.boundaryName, 'has hole')
          {
            ctx.beginPath()
            const start = toCtxCoord(polygon[0][0])
            ctx.moveTo(start[1],start[0])
            for (const point of polygon[0]) {
              const coord = toCtxCoord(point)
              ctx.lineTo(coord[1],coord[0])
            }
            ctx.fill()
          }
          // for (const hole of polygon.slice(1)) {
          //   ctx.beginPath()
          //   const start = toCtxCoord(hole[0])
          //   ctx.moveTo(start[1],start[0])
          //   for (const point of hole) {
          //     const coord = toCtxCoord(point)
          //     ctx.lineTo(coord[1],coord[0])
          //   }
          //   ctx.fillStyle = 'transparent'
          //   ctx.fill()
          // }
        }
      } catch (error) {
        console.log(country.boundaryName, error)
      }
      resolve()
    }, 200))
  }
  console.log('done')
}
 
render()
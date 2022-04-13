// Get borders from https://www.naturalearthdata.com/http//www.naturalearthdata.com/download/110m/cultural/ne_110m_admin_0_countries_lakes.zip

const WIDTH = 10000
const HEIGHT = 10000

const canvas = document.querySelector('canvas')
canvas.style = `height: 1000px; width: 1000px`
canvas.width = WIDTH
canvas.height = HEIGHT

const ctx = canvas.getContext('2d')

ctx.fillStyle = "#000000";
ctx.fillRect(0,0,WIDTH,HEIGHT);

function toCtxCoord(pt) {
  return [
    -pt[1] / 90 * (HEIGHT / 2) + (HEIGHT / 2),
    pt[0] / 180 * (WIDTH / 2) + (WIDTH / 2)
  ]
}

async function render(renderType) {
  const response = await fetch('/src/resources/borders.json')
  const data = await response.json()
  let color = 255
  for (const country of data.features) {
    const colorHex = (color--).toString(16).padStart(2, '0')
    ctx.fillStyle = `#${colorHex}${colorHex}${colorHex}`
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    await new Promise(resolve => setTimeout(async () => {
      try {
        const polygons = country.geometry.type === 'Polygon' ? [country.geometry.coordinates] : country.geometry.coordinates
        for (const polygon of polygons) {
          if (polygon.length > 1) console.log(country.properties.NAME_EN, 'has hole')
          {
            ctx.beginPath()
            const start = toCtxCoord(polygon[0][0])
            ctx.moveTo(start[1],start[0])
            for (const point of polygon[0]) {
              const coord = toCtxCoord(point)
              ctx.lineTo(coord[1],coord[0])
            }

            if (renderType === 'borders') {
              ctx.stroke() 
            } else {
              ctx.fill()
            }
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
        console.log(country.properties.NAME_EN, error)
      }
      resolve()
    }, 200))
  }
  console.log('done')
}
 
const query = new URLSearchParams(window.location.search)
const renderType = query.get('render')

if (renderType) {
  render(renderType)
}
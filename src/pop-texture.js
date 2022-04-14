// Get population data from https://sedac.ciesin.columbia.edu/data/set/gpw-v4-population-count-rev11/data-download

const WIDTH = 8640 
const HEIGHT = 4320

// data max = 1710353.1

async function render() {
  const canvas = document.querySelector('canvas')
  canvas.style = `height: 1000px; width: 1000px`
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')

  const pixels = new ImageData(WIDTH, HEIGHT)
  const response = await fetch('/src/resources/population.txt')
  const data = await response.text()
  let max = 0
  const rows = data.trim().split('\r\n').slice(6).map((line, i) => {
    const cells = line.trim().split(' ').map((str, j) => {
      let value = parseFloat(str)
      value = value < 0 ? 0 : value
      value = Math.floor(Math.log(value)/Math.log(1.0576))
      pixels.data.set([value, value, value, 255], 4 * (i * WIDTH + j))
    })
    return cells
  })

  ctx.putImageData(pixels, 0, 0)

  console.log('done')
}
 
render()
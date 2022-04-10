
async function loadAirports() {
  const response = await fetch('/src/resources/GlobalAirportDatabase.txt')
  const data = await response.text()
  const lines = data.split('\n')
  const airports = []
  for (const line of lines) {
    const fields = line.split(':')
    if (fields[1] !== 'N/A' && fields[4] === 'USA') {
      airports.push({
        code: fields[1],
        lat: fields[14],
        long: fields[15],
        name: fields[2],
        city: fields[3],
        country: fields[4]
      })
    }
  }
  return airports
}

export default loadAirports
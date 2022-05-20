import React, { useRef } from 'react'
import useAirlineState from './airline-state'
import ClockDisplay from './ClockDisplay'
import useMapState from './map-state'


function Hud() {
  const cities = useMapState(state => state.cities)
  const selectedCity = useMapState(state => state.selectedCity)
  const addRoute = useAirlineState(state => state.addRoute)

  function onAddRoute(city2: number) {
    if (selectedCity) {
      addRoute(selectedCity.id, city2)
    }
  }

  return <div
    style={{
      left: 0,
      bottom: 0,
      width: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      zIndex: 101,
      display: 'flex'
    }}
  >
    <div style={{ pointerEvents: 'auto', display: 'inline-block', background: 'white', border: '1px solid black' }}>
      { selectedCity
          ? <>
              <div>{selectedCity.name}</div>
              <div><span>Population:</span> <span>{selectedCity.population}</span></div>
              <div>Destinations:</div>
              <table
                style={{
                  height: 100,
                  overflow: 'auto',
                  display: 'block'
                }}
              >
                <thead style={{ position:'sticky', insetBlockStart: 0, background: 'white' }}>
                  <tr>
                    <th>Destination</th>
                    <th>Daily Demand</th>
                    <th>Current Capacity</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCity.destinations.map(dest => <tr key={dest.id}>
                    <th>{cities.find(c => c.id === dest.id)?.name ?? 'Unknown'}</th>
                    <td>{Math.floor(dest.demand)}</td>
                    <td>0</td>
                    <td><button onClick={() => onAddRoute(dest.id)}>Add Route</button></td>
                  </tr>)}
                </tbody>
              </table>
            </>
          : null
      }
    </div>
    <div style={{ flexGrow: 1 }}></div>
    <ClockDisplay />
  </div>
}

export default Hud
import React, { useRef } from 'react'
import ClockDisplay from './ClockDisplay'
import { City } from './types'

export interface HudProps {
  clock: THREE.Clock
  cities: City[]
  selectedCity?: City
  onAddRoute(dest: number): void
}

function Hud({ cities, selectedCity, onAddRoute, clock }: HudProps) {
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
    <ClockDisplay clock={clock} />
  </div>
}

export default Hud
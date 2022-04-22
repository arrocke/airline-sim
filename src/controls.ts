import { concatMap, filter, fromEvent, map, merge, pairwise, scan, startWith, takeUntil, tap } from "rxjs"
import * as THREE from "three"

export interface ControlsOptions {
  element: HTMLElement
  position: THREE.Spherical
  rotateSpeed?: number
  dolly?: {
    speed?: number
    min?: number
    max?: number
  }
}

export function createControls({ element, position, rotateSpeed = 1, dolly = {} }: ControlsOptions) {
	element.style.touchAction = 'none'

  const dollyScale = Math.pow(0.95, dolly.speed ?? 1)

  const wheelObserver = fromEvent<WheelEvent>(element, 'wheel', { passive: false }).pipe(
    map(event => {
      event.preventDefault()
      if (event.deltaY > 0) {
        return { dr: 1 / dollyScale }
      } else if (event.deltaY < 0) {
        return { dr: dollyScale }
      }
    })
  )

  const pointerObserver = fromEvent<PointerEvent>(element, 'pointerdown')
    .pipe(
      filter((event) => event.pointerType === 'mouse'),
      map((event) => {
        element.setPointerCapture(event.pointerId)
        return {
          type: ['rotate'][event.button],
          start: new THREE.Vector2(event.clientX, event.clientY)
        }
      }),
      filter(({ type }) => !!type),
      concatMap(({ type, start }) => {
        return fromEvent<PointerEvent>(element, 'pointermove')
          .pipe(
            takeUntil(
              merge(
                fromEvent<PointerEvent>(element, 'pointerup'),
                fromEvent<PointerEvent>(element, 'pointercancel')
              ).pipe(
                tap((event) => element.releasePointerCapture(event.pointerId))
              )
            ),
            filter((event) => event.pointerType === 'mouse'),
            map(event => ({
              pointer: new THREE.Vector2(event.clientX, event.clientY)
            })),
            startWith({ pointer: start }),
            pairwise(),
            map(([start, end]) => {
              const diff = end.pointer.clone().sub(start.pointer)

              switch (type) {
                case 'rotate': {
                  diff.multiplyScalar(rotateSpeed)
                  return {
                    dt: -Math.PI * 2 * diff.x / element.clientHeight,
                    dp: -Math.PI * 2 * diff.y / element.clientHeight
                  }
                }
                case 'dolly': {
                  if (diff.y > 0) {
                    return { dr: dollyScale / diff.y }
                  } else if (diff.y < 0) {
                    return { dr: dollyScale * diff.y }
                  }
                }
                default:
                  return
              }
            })
          )
      })
    )

  return merge(wheelObserver, pointerObserver).pipe(
    scan(
      (oldPosition, changes) => {
        if (changes) {
          const newPosition = oldPosition.clone()
          if ('dr' in changes && changes.dr) {
            newPosition.radius *= changes.dr
            if (typeof dolly.min === 'number') {
              newPosition.radius = Math.max(newPosition.radius, dolly.min)
            }
            if (typeof dolly.max === 'number') {
              newPosition.radius = Math.min(newPosition.radius, dolly.max)
            }
          }
          if ('dp' in changes && changes.dp) {
            newPosition.phi += changes.dp
          }
          if ('dt' in changes && changes.dt) {
            newPosition.theta += changes.dt
          }
          newPosition.makeSafe()
          return newPosition
        } else {
          return oldPosition
        }
      },
      position
    ),
    startWith(position)
  )
}
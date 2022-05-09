const START_DATE = new Date(2022, 0, 1)
const TIME_CONVERSION = (60 * 60) / 3 * 1000

export function getGameTimeFromClock(clock: THREE.Clock) {
  return START_DATE.getTime() + clock.getElapsedTime() * TIME_CONVERSION
}

export function setDateFromClock(clock: THREE.Clock, date: Date) {
  date.setTime(getGameTimeFromClock(clock))
}

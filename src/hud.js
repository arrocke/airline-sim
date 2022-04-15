export default class HeadsUpDisplay {
  constructor({ el, onModeChange }) {
    this.el = el
    this.onModeChange = onModeChange

    this.mode = 'selected'
    this.modeButton = document.createElement('button')
    this.modeButton.innerText = 'Change Mode'
    this.modeButton.style.position = 'absolute'
    this.modeButton.style.left = 0
    this.modeButton.style.bottom = 0
    this.modeButton.addEventListener('click', e => {
      e.stopPropagation()
      if (this.mode === 'selected') {
        this.mode = 'population'
        this.onModeChange(this.mode)
      } else {
        this.mode = 'selected'
        this.onModeChange(this.mode)
      }
    })
    this.el.appendChild(this.modeButton)
  }
}
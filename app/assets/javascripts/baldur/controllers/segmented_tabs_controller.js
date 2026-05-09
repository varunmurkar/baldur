import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['tab', 'panel']
  static values = { active: String }

  connect() {
    const initial = this.activeValue || this.tabTargets[0]?.dataset.tabValue
    if (initial) {
      this.show(initial)
    }
  }

  select(event) {
    event.preventDefault()
    const value = event.currentTarget.dataset.tabValue
    if (value) {
      this.show(value)
    }
  }

  show(value) {
    this.tabTargets.forEach((tab) => {
      const selected = tab.dataset.tabValue === value
      tab.classList.toggle('is-selected', selected)
      tab.setAttribute('aria-selected', selected)
      tab.tabIndex = selected ? 0 : -1
    })

    this.panelTargets.forEach((panel) => {
      const selected = panel.dataset.tabValue === value
      panel.classList.toggle('hidden', !selected)
      panel.setAttribute('aria-hidden', (!selected).toString())
    })

    this.activeValue = value
  }
}

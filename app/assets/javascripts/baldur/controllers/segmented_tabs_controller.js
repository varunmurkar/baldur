import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['hiddenInput', 'tab', 'panel']
  static values = { active: String }

  static TAB_KEYS = ['ArrowLeft', 'ArrowRight', 'Home', 'End']

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

  handleKeydown(event) {
    if (!this.constructor.TAB_KEYS.includes(event.key) || this.tabTargets.length === 0) return

    event.preventDefault()

    const currentIndex = this.tabTargets.indexOf(event.currentTarget)
    if (currentIndex === -1) return

    let nextIndex = currentIndex

    if (event.key === 'Home') {
      nextIndex = this.nextEnabledIndex(0, 1)
    } else if (event.key === 'End') {
      nextIndex = this.nextEnabledIndex(this.tabTargets.length - 1, -1)
    } else if (event.key === 'ArrowRight') {
      nextIndex = this.nextEnabledIndex((currentIndex + 1) % this.tabTargets.length, 1)
    } else if (event.key === 'ArrowLeft') {
      nextIndex = this.nextEnabledIndex((currentIndex - 1 + this.tabTargets.length) % this.tabTargets.length, -1)
    }

    const nextTab = this.tabTargets[nextIndex]
    if (!nextTab) return

    this.show(nextTab.dataset.tabValue)
    nextTab.focus()
  }

  show(value) {
    this.tabTargets.forEach((tab) => {
      const selected = tab.dataset.tabValue === value
      tab.classList.toggle('is-selected', selected)
      tab.setAttribute('aria-selected', selected ? 'true' : 'false')
      tab.tabIndex = selected ? 0 : -1
    })

    this.panelTargets.forEach((panel) => {
      const selected = panel.dataset.tabValue === value
      panel.classList.toggle('hidden', !selected)
      panel.hidden = !selected
      panel.setAttribute('aria-hidden', (!selected).toString())
    })

    if (this.hasHiddenInputTarget) {
      this.hiddenInputTarget.value = value
    }

    this.activeValue = value
  }

  nextEnabledIndex(startIndex, direction) {
    let index = startIndex

    for (let count = 0; count < this.tabTargets.length; count += 1) {
      const tab = this.tabTargets[index]
      if (tab && !this.isDisabled(tab)) return index

      index = (index + direction + this.tabTargets.length) % this.tabTargets.length
    }

    return startIndex
  }

  isDisabled(tab) {
    return tab.getAttribute('aria-disabled') === 'true' || tab.disabled
  }
}

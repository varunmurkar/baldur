import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['option', 'panel', 'panels']
  static values = { tab: String }

  connect() {
    this.updateView()
    this.syncHeight()
    this.handleResize = () => this.syncHeight()
    window.addEventListener('resize', this.handleResize)
  }

  disconnect() {
    window.removeEventListener('resize', this.handleResize)
  }

  select(event) {
    const tab = event.currentTarget?.dataset?.value
    if (!tab) return

    event.preventDefault()
    this.tabValue = tab
  }

  tabValueChanged() {
    this.updateView()
  }

  updateView() {
    const tab = this.tabValue || this.defaultTab()
    if (!tab) return

    this.optionTargets.forEach((button) => {
      const selected = button.dataset.value === tab
      button.classList.toggle('is-selected', selected)
      button.setAttribute('aria-selected', selected ? 'true' : 'false')
      button.setAttribute('tabindex', selected ? '0' : '-1')
    })

    this.panelTargets.forEach((panel) => {
      const active = panel.dataset.tab === tab
      panel.classList.toggle('hidden', !active)
      panel.setAttribute('aria-hidden', active ? 'false' : 'true')

      if (active) {
        panel.removeAttribute('hidden')
        panel.classList.remove('motion-slide-up')
        void panel.offsetHeight
        panel.classList.add('motion-slide-up')
      } else {
        panel.setAttribute('hidden', 'true')
        panel.classList.remove('motion-slide-up')
      }
    })

    this.syncHeight()
  }

  defaultTab() {
    return this.optionTargets[0]?.dataset?.value
  }

  syncHeight() {
    if (!this.hasPanelsTarget) return

    const activePanel = this.activePanel()
    if (!activePanel) return

    const height = this.measurePanel(activePanel)
    if (height > 0) {
      this.panelsTarget.style.height = `${height}px`
    }
  }

  activePanel() {
    const tab = this.tabValue || this.defaultTab()
    return this.panelTargets.find((panel) => panel.dataset.tab === tab)
  }

  measurePanel(panel) {
    const wasHidden = panel.hasAttribute('hidden') || panel.classList.contains('hidden')
    const original = {
      position: panel.style.position,
      visibility: panel.style.visibility,
      pointerEvents: panel.style.pointerEvents,
      left: panel.style.left,
      right: panel.style.right,
      width: panel.style.width
    }

    if (wasHidden) {
      panel.classList.remove('hidden')
      panel.removeAttribute('hidden')
      panel.style.position = 'absolute'
      panel.style.visibility = 'hidden'
      panel.style.pointerEvents = 'none'
      panel.style.left = '0'
      panel.style.right = '0'
      panel.style.width = '100%'
    }

    const height = panel.offsetHeight

    if (wasHidden) {
      panel.classList.add('hidden')
      panel.setAttribute('hidden', 'true')
      panel.style.position = original.position
      panel.style.visibility = original.visibility
      panel.style.pointerEvents = original.pointerEvents
      panel.style.left = original.left
      panel.style.right = original.right
      panel.style.width = original.width
    }

    return height
  }
}

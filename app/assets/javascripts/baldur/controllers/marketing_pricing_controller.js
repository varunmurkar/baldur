import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['billingOption', 'planCard']
  static values = { billing: String }

  connect() {
    if (!this.billingValue) {
      this.billingValue = this.defaultBilling()
    }

    this.render()
  }

  select(event) {
    const nextBilling = event.currentTarget?.dataset?.value
    if (!nextBilling) return

    this.billingValue = nextBilling
    this.render()
  }

  keydown(event) {
    const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"]
    if (!keys.includes(event.key)) return

    event.preventDefault()
    const options = this.billingOptionTargets
    if (options.length === 0) return

    const currentIndex = options.indexOf(event.currentTarget)
    if (currentIndex < 0) return

    let nextIndex = currentIndex
    if (event.key === "Home") nextIndex = 0
    if (event.key === "End") nextIndex = options.length - 1
    if (["ArrowRight", "ArrowDown"].includes(event.key)) nextIndex = (currentIndex + 1) % options.length
    if (["ArrowLeft", "ArrowUp"].includes(event.key)) nextIndex = (currentIndex - 1 + options.length) % options.length

    const nextButton = options[nextIndex]
    if (!nextButton) return

    this.billingValue = nextButton.dataset.value
    this.render()
    nextButton.focus()
  }

  render() {
    this.billingOptionTargets.forEach((option) => {
      const active = option.dataset.value === this.billingValue
      option.classList.toggle('is-selected', active)
      option.setAttribute('aria-pressed', active ? 'true' : 'false')
    })

    this.planCardTargets.forEach((card) => {
      const primary = card.dataset[`${this.billingValue}Primary`]
      const secondary = card.dataset[`${this.billingValue}Secondary`]
      const primaryNode = card.querySelector('[data-role="price-primary"]')
      const secondaryNode = card.querySelector('[data-role="price-secondary"]')

      if (primaryNode && primary) primaryNode.textContent = primary
      if (secondaryNode && secondary) secondaryNode.textContent = secondary
    })
  }

  defaultBilling() {
    return this.billingOptionTargets.find((option) => option.getAttribute('aria-selected') === 'true')?.dataset?.value ||
      this.billingOptionTargets[0]?.dataset?.value ||
      'monthly'
  }
}

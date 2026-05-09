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

  render() {
    this.billingOptionTargets.forEach((option) => {
      const active = option.dataset.value === this.billingValue
      option.classList.toggle('is-selected', active)
      option.setAttribute('aria-selected', active ? 'true' : 'false')
      option.setAttribute('tabindex', active ? '0' : '-1')
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

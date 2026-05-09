import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  connect() {
    this.onClick = this.handleClick.bind(this);
    this.element.addEventListener("click", this.onClick);
  }

  disconnect() {
    this.element.removeEventListener("click", this.onClick);
  }

  handleClick(event) {
    const link = event.target.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#") || href.length <= 1) return;
    if (link.getAttribute("download") !== null) return;

    const target = document.getElementById(href.slice(1));
    if (!target) return;

    event.preventDefault();
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", href);
  }
}

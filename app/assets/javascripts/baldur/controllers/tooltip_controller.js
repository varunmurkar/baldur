import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["trigger", "bubble"];

  connect() {
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleDocumentKeydown = this.handleDocumentKeydown.bind(this);
    this.handleViewportResize = this.handleViewportResize.bind(this);

    document.addEventListener("click", this.handleDocumentClick);
    document.addEventListener("keydown", this.handleDocumentKeydown);
    window.addEventListener("resize", this.handleViewportResize);

    this.close();
  }

  disconnect() {
    document.removeEventListener("click", this.handleDocumentClick);
    document.removeEventListener("keydown", this.handleDocumentKeydown);
    window.removeEventListener("resize", this.handleViewportResize);
  }

  toggle(event) {
    event.preventDefault();
    event.stopPropagation();

    if (this.isOpen()) {
      this.close();
      return;
    }

    this.open();
  }

  open(event) {
    if (event?.type === "focusout" && this.element.contains(event.relatedTarget)) return;
    if (!this.hasBubbleTarget) return;

    this.bubbleTarget.dataset.state = "open";
    this.bubbleTarget.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => {
      if (this.isOpen()) this.applyBestPlacement();
    });
  }

  close(event) {
    if (event?.type === "focusout" && this.element.contains(event.relatedTarget)) return;
    if (!this.hasBubbleTarget) return;

    this.bubbleTarget.dataset.state = "closed";
    this.bubbleTarget.setAttribute("aria-hidden", "true");
    this.resetPlacement();
  }

  isOpen() {
    if (!this.hasBubbleTarget) return false;
    return this.bubbleTarget.dataset.state === "open";
  }

  handleDocumentClick(event) {
    if (!this.element.contains(event.target)) {
      this.close();
    }
  }

  handleDocumentKeydown(event) {
    if (event.key === "Escape") {
      this.close();
    }
  }

  handleViewportResize() {
    if (this.isOpen()) {
      this.applyBestPlacement();
    }
  }

  applyBestPlacement() {
    if (!this.hasBubbleTarget) return;

    const bubble = this.bubbleTarget;
    const viewportPadding = 8;
    const maxWidth = Math.min(320, Math.max(180, window.innerWidth - viewportPadding * 2));

    this.resetPlacement();
    bubble.style.maxWidth = `${maxWidth}px`;

    let rect = bubble.getBoundingClientRect();

    if (rect.right > window.innerWidth - viewportPadding) {
      bubble.classList.remove("left-0");
      bubble.classList.add("right-0");
      rect = bubble.getBoundingClientRect();
    }

    if (rect.left < viewportPadding) {
      const shiftRight = viewportPadding - rect.left;
      bubble.style.transform = `translateX(${shiftRight}px)`;
      rect = bubble.getBoundingClientRect();
    } else if (rect.right > window.innerWidth - viewportPadding) {
      const shiftLeft = (window.innerWidth - viewportPadding) - rect.right;
      bubble.style.transform = `translateX(${shiftLeft}px)`;
      rect = bubble.getBoundingClientRect();
    }

    if (rect.bottom > window.innerHeight - viewportPadding) {
      bubble.classList.remove("top-full", "mt-2");
      bubble.classList.add("bottom-full", "mb-2");
      rect = bubble.getBoundingClientRect();

      if (rect.top < viewportPadding) {
        bubble.classList.remove("bottom-full", "mb-2");
        bubble.classList.add("top-full", "mt-2");
      }
    }
  }

  resetPlacement() {
    if (!this.hasBubbleTarget) return;

    const bubble = this.bubbleTarget;
    bubble.classList.remove("right-0", "bottom-full", "mb-2");
    bubble.classList.add("left-0", "top-full", "mt-2");
    bubble.style.transform = "";
    bubble.style.maxWidth = "";
  }
}

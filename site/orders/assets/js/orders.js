'use strict';

/**
 * The product strips on an order card.
 *
 * Each strip is an ordinary scroll container, so the phone swipe comes from the
 * browser and the mouse drag from the shared `data-drag-scroll` gesture in
 * global.js. Only the arrows are wired up here.
 */
function initProductStrips() {
  /** Sub-pixel slack when asking whether an end has been reached. */
  const EDGE_SLACK = 5;
  /** One product at a time. */
  const STEP = 80;

  document.querySelectorAll('.product-slider-wrapper').forEach(wrapper => {
    const strip = wrapper.querySelector('.product-slider');
    const previousButton = wrapper.querySelector('.product-arrow-prev');
    const nextButton = wrapper.querySelector('.product-arrow-next');
    if (!strip || !previousButton || !nextButton) return;

    const offset = () => Math.abs(strip.scrollLeft);
    const limit = () => strip.scrollWidth - strip.clientWidth;

    function syncButtons() {
      // A strip whose products already fit has nowhere to go.
      const scrollable = limit() > EDGE_SLACK;
      previousButton.classList.toggle('d-none', !scrollable);
      nextButton.classList.toggle('d-none', !scrollable);
      if (!scrollable) return;

      previousButton.toggleAttribute('disabled', offset() <= EDGE_SLACK);
      nextButton.toggleAttribute('disabled', offset() >= limit() - EDGE_SLACK);
    }

    /** The strip reads right to left, so "next" travels towards negative offsets. */
    strip.addEventListener('scroll', syncButtons, { passive: true });
    previousButton.addEventListener('click', () => {
      strip.scrollBy({ left: STEP, behavior: 'smooth' });
    });
    nextButton.addEventListener('click', () => {
      strip.scrollBy({ left: -STEP, behavior: 'smooth' });
    });

    // The card can be resized by the window or by its own content loading.
    new ResizeObserver(syncButtons).observe(strip);
    syncButtons();
  });
}

document.addEventListener('DOMContentLoaded', initProductStrips);

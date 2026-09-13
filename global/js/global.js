'use strict';

/**
 * Behaviour shared by every page: the cart badge, the desktop header, the
 * mobile search and menu overlays, the back-to-top button and the grab-and-drag
 * gesture used by the horizontal strips.
 *
 * Each feature lives in its own function and bails out when the markup it
 * needs is absent, so a page that only carries part of the chrome still works.
 */

/** Reveal the cart badges whenever the cart is not empty. */
function initCartBadge() {
  const badges = document.querySelectorAll('.basket-element-notif');
  const labels = document.querySelectorAll('.basket-element-notif-text');
  if (!badges.length || !labels.length) return;

  const hasItems = Array.from(labels).some(label => label.textContent !== '0');
  if (!hasItems) return;

  badges.forEach(badge => badge.classList.remove('d-none'));
}

/**
 * Collapse the category bar while the reader scrolls down and bring it back on
 * the way up. The bar stays open near the top of the page.
 */
function initHeaderNavCollapse() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  // The header is out of the flow and the page reserves its full height, so the
  // document never resizes when the bar collapses — that is what keeps the
  // scrollbar honest. The trade is that the bar may only close once the content
  // has scrolled past its own height; closing earlier would briefly expose the
  // reserved strip between the shorter header and the content.
  const OPEN_ZONE = 50;
  const DOWN_THRESHOLD = 2;
  const UP_THRESHOLD = 6;

  let lastY = window.scrollY;
  let collapsed = false;
  let scheduled = false;

  function setCollapsed(next) {
    if (next === collapsed) return;
    collapsed = next;
    header.classList.toggle('is-nav-collapsed', next);
  }

  function update() {
    scheduled = false;
    const y = Math.max(0, window.scrollY);

    if (y <= OPEN_ZONE) {
      setCollapsed(false);
      lastY = y;
      return;
    }

    if (y > lastY + DOWN_THRESHOLD) {
      setCollapsed(true);
      lastY = y;
    } else if (y < lastY - UP_THRESHOLD) {
      setCollapsed(false);
      lastY = y;
    }
    // Movement smaller than either threshold is noise: keep lastY as the anchor
    // so slow scrolling still accumulates towards a real direction change.
  }

  window.addEventListener(
    'scroll',
    () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(update);
    },
    { passive: true },
  );

  update();
}

/** Full-screen search panel used on small screens. */
function initSearchOverlay() {
  const searchBtn = document.getElementById('searchBtn');
  const searchText = document.getElementById('searchText');
  const overlay = document.getElementById('searchOverlay');
  const closeBtn = document.getElementById('closeSearch');
  const input = document.getElementById('overlaySearchInput');
  if (!searchBtn || !overlay || !closeBtn || !input) return;

  searchBtn.addEventListener('click', () => {
    overlay.classList.add('active');
    document.body.classList.add('overflow-hidden');
    input.focus();
  });

  closeBtn.addEventListener('click', () => {
    overlay.classList.remove('active');
    document.body.classList.remove('overflow-hidden');
  });

  input.addEventListener('input', () => {
    if (searchText) searchText.textContent = input.value;
    searchBtn.style.backgroundColor = input.value.trim() ? '#f8f9fa' : '';
  });
}

/** Full-screen category menu used on small screens. */
function initMobileMenu() {
  const openBtn = document.querySelector('.menu-btn-mobile');
  const openBtnItem = document.querySelector('.menu-btn-mobile-item');
  const closeBtn = document.getElementById('closeMenu');
  const overlay = document.getElementById('menuOverlayMobile');
  if (!openBtn || !closeBtn || !overlay) return;

  const activeNavItem = document.querySelector('.bottom-nav-item.active');

  openBtn.addEventListener('click', () => {
    if (activeNavItem) activeNavItem.classList.toggle('active');
    if (openBtnItem) openBtnItem.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.classList.toggle('overflow-hidden');
  });

  closeBtn.addEventListener('click', () => {
    if (openBtnItem) openBtnItem.classList.remove('active');
    if (activeNavItem) activeNavItem.classList.add('active');
    overlay.classList.remove('active');
    document.body.classList.remove('overflow-hidden');
  });
}

/** Category switcher inside the mobile menu overlay. */
function initMobileMenuCategories() {
  const tabs = document.querySelector('.menu-overlay__btns-wrapper');
  if (!tabs) return;

  const buttons = document.querySelectorAll('.menu-overlay__btn');
  const panels = document.querySelectorAll('.menu-overlay__category');
  const panelScroller = document.querySelector('.menu-overlay__content-mobile .col-9');

  tabs.addEventListener('click', event => {
    const clicked = event.target.closest('.menu-overlay__btn');
    if (!clicked) return;

    buttons.forEach(button => button.classList.remove('active'));
    clicked.classList.add('active');

    panels.forEach(panel => {
      const isTarget = panel.id === clicked.dataset.target;
      panel.classList.toggle('d-none', !isTarget);
      panel.classList.toggle('d-flex', isTarget);
    });

    if (panelScroller) panelScroller.scrollTop = 0;
  });
}

/** Back-to-top button in the footer. */
function initScrollToTop() {
  const button = document.querySelector('.btn-scroll-to-top');
  if (!button) return;

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/** Stretch of recent movement, in milliseconds, a release speed is measured over. */
const POINTER_VELOCITY_WINDOW = 100;
/** A pointer resting this long, in milliseconds, before letting go is not flicking. */
const POINTER_REST_TIME = 100;

/**
 * Remember where a dragging pointer has been, keeping only the recent stretch.
 *
 * A speed worked out from the last two events alone swings with every uneven
 * gap between them — enough to turn a plain flick into no flick at all. Taking
 * it across the last hundred milliseconds of movement evens those gaps out.
 * Shared by the strips below and the home page banner.
 */
function recordPointerSample(samples, event) {
  samples.push({ x: event.clientX, t: event.timeStamp });
  // One sample from just before the window stays, so the window is fully covered.
  while (
    samples.length > 2 &&
    event.timeStamp - samples[1].t > POINTER_VELOCITY_WINDOW
  ) {
    samples.shift();
  }
}

/**
 * Horizontal speed at the moment of release, in pixels per millisecond — or 0
 * when the pointer had already come to rest.
 */
function releaseVelocity(samples, releaseTime) {
  if (samples.length < 2) return 0;
  const first = samples[0];
  const last = samples[samples.length - 1];
  if (releaseTime - last.t > POINTER_REST_TIME) return 0;
  const span = last.t - first.t;
  return span > 0 ? (last.x - first.x) / span : 0;
}

/**
 * Grab and drag for horizontal strips.
 *
 * Any element carrying `data-drag-scroll` can be pulled sideways with the
 * mouse, the way a touch screen already lets you flick it. Touch and pen keep
 * the browser's own scrolling, which is smoother than anything script can do,
 * so only mouse pointers are taken over here.
 */
function initDragScroll() {
  /** Travel, in pixels, before a press counts as a drag rather than a click. */
  const DRAG_THRESHOLD = 4;
  /** Share of the speed kept each frame once the pointer lets go. */
  const FRICTION = 0.93;
  /** Speed, in pixels per millisecond, at which the throw is considered over. */
  const MIN_VELOCITY = 0.02;
  /** A frame, in milliseconds — the step the throw advances by. */
  const FRAME = 16;

  document.querySelectorAll('[data-drag-scroll]').forEach(setUp);

  function setUp(strip) {
    // A strip that fits its content has nothing to drag, so it gets neither the
    // grab cursor nor the gesture. Content and viewport can both change size,
    // so the check repeats whenever either does.
    const watchSize = new ResizeObserver(refresh);
    watchSize.observe(strip);
    Array.from(strip.children).forEach(child => watchSize.observe(child));
    refresh();

    function refresh() {
      strip.classList.toggle(
        'is-draggable',
        strip.scrollWidth - strip.clientWidth > 1,
      );
    }

    let pointerId = null;
    let dragging = false;
    let blockClick = false;
    let startX = 0;
    let startScroll = 0;
    let samples = [];
    let velocity = 0;
    let throwFrame = 0;

    strip.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      if (!strip.classList.contains('is-draggable')) return;

      cancelAnimationFrame(throwFrame);
      release();

      pointerId = event.pointerId;
      startX = event.clientX;
      startScroll = strip.scrollLeft;
      samples = [{ x: event.clientX, t: event.timeStamp }];
      velocity = 0;
      dragging = false;
    });

    strip.addEventListener('pointermove', event => {
      if (event.pointerId !== pointerId) return;

      const travelled = event.clientX - startX;
      if (!dragging) {
        if (Math.abs(travelled) < DRAG_THRESHOLD) return;
        dragging = true;
        strip.classList.add('is-drag-scrolling');
        strip.setPointerCapture(pointerId);
      }

      // scrollLeft grows towards the right whichever way the page reads, so
      // subtracting the travel keeps the content under the pointer.
      strip.scrollLeft = startScroll - travelled;

      recordPointerSample(samples, event);
    });

    strip.addEventListener('pointerup', finish);
    strip.addEventListener('pointercancel', finish);

    function finish(event) {
      if (event.pointerId !== pointerId) return;
      pointerId = null;
      if (!dragging) return;

      dragging = false;
      blockClick = true;
      // The press ending on empty space fires no click, so the guard is cleared
      // on its own rather than waiting for one that never comes.
      setTimeout(() => {
        blockClick = false;
      }, 0);

      // A pointer that came to rest before letting go does not throw.
      velocity = releaseVelocity(samples, event.timeStamp);

      if (Math.abs(velocity) < MIN_VELOCITY) {
        release();
        return;
      }
      throwFrame = requestAnimationFrame(glide);
    }

    /** The gesture is over: hand scrolling back to the browser. */
    function release() {
      strip.classList.remove('is-drag-scrolling');
    }

    function glide() {
      velocity *= FRICTION;
      if (Math.abs(velocity) < MIN_VELOCITY) {
        release();
        return;
      }

      const before = strip.scrollLeft;
      strip.scrollLeft = before - velocity * FRAME;
      if (strip.scrollLeft === before) {
        release();
        return;
      }
      throwFrame = requestAnimationFrame(glide);
    }

    // A press that turned into a drag must not also open the link underneath.
    strip.addEventListener(
      'click',
      event => {
        if (!blockClick) return;
        blockClick = false;
        event.preventDefault();
        event.stopPropagation();
      },
      true,
    );

    // Images and links are draggable in their own right, and that gesture would
    // fight this one.
    strip.addEventListener('dragstart', event => event.preventDefault());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initCartBadge();
  initHeaderNavCollapse();
  initSearchOverlay();
  initMobileMenu();
  initMobileMenuCategories();
  initScrollToTop();
  initDragScroll();
});

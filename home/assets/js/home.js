'use strict';

/**
 * Home page behaviour: the festival strip on phones, the banner carousel and
 * the category rail. Each feature bails out when the markup it needs is absent.
 *
 * The category rail is an ordinary scroll container: the phone swipe comes from
 * the browser and the mouse drag from the shared `data-drag-scroll` gesture in
 * global.js. The banner loops without end, which scrolling cannot do, so it
 * places its own slides and runs its own gesture, measuring release speed with
 * the shared pointer helpers in global.js.
 */

/** The festival strip retreats as soon as the reader leaves the top. */
function initFestivalStrip() {
  const strip = document.getElementById('festival-banner-wrapper');
  if (!strip) return;

  window.addEventListener(
    'scroll',
    () => {
      strip.style.height = window.scrollY === 0 ? '50px' : '0';
    },
    { passive: true },
  );
}

/**
 * The banner carousel.
 *
 * All slides are stacked in one box, and each is placed with a transform worked
 * out from a single number, `position`, counted in slides. A slide's place is
 * taken modulo the number of slides, so whatever the position there is always a
 * slide waiting on either side of the one in view: the carousel loops in both
 * directions for as long as the reader keeps going, with no copies to maintain
 * and nothing to reset afterwards.
 *
 * Mouse, touch and pen all arrive as pointer events, so one gesture serves all
 * three. Arrows, dots, keys and autoplay only ever animate `position` towards a
 * whole slide, and a new gesture simply catches it wherever it happens to be.
 */
function initBannerCarousel() {
  const container = document.querySelector('.banner-slider-container');
  const track = container && container.querySelector('.banner-slider');
  if (!track) return;

  const slides = Array.from(track.querySelectorAll('.banner-slide'));
  const dots = Array.from(container.querySelectorAll('.dot'));
  const previousButton = container.querySelector('.banner-arrow-prev');
  const nextButton = container.querySelector('.banner-arrow-next');
  const count = slides.length;
  if (count < 2) return;

  const AUTOPLAY_DELAY = 5000;
  /** Travel, in pixels, before a press counts as a drag rather than a tap. */
  const DRAG_THRESHOLD = 6;
  /** Release speed, in pixels per millisecond, that counts as a flick. */
  const FLICK_SPEED = 0.35;
  /** Duration, in milliseconds, of a move of one slide. */
  const STEP_DURATION = 450;
  const MIN_DURATION = 200;
  const MAX_DURATION = 700;
  /** How long after a drag, in milliseconds, a stray click is still swallowed. */
  const CLICK_GUARD = 500;

  const wantsCalm = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Dragging this way on screen (+1 right, -1 left) brings the next slide in.
  // In a right-to-left page the next slide waits on the left.
  const forward = getComputedStyle(container).direction === 'rtl' ? 1 : -1;

  const wrap = (value, size) => ((value % size) + size) % size;

  let position = 0;
  /** The whole slide the carousel is heading for, or resting on. */
  let target = 0;
  let frame = 0;
  let activeSlide = -1;
  let gesture = null;
  let clickGuardUntil = 0;
  let timer = 0;
  const holds = new Set();

  /* ------------------------------------------------------------ drawing -- */

  function render() {
    slides.forEach((slide, index) => {
      // Distance from the view, folded into the range [-count/2, count/2).
      const offset = wrap(index - position + count / 2, count) - count / 2;
      slide.style.transform = `translate3d(${-forward * offset * 100}%, 0, 0)`;
      slide.style.visibility = Math.abs(offset) < 1 ? 'visible' : 'hidden';
    });

    const active = wrap(Math.round(position), count);
    if (active === activeSlide) return;
    activeSlide = active;

    // Only the slide in view can be reached by keyboard or assistive technology.
    slides.forEach((slide, index) => {
      slide.inert = index !== active;
    });
    dots.forEach((dot, index) => {
      const current = index === active;
      dot.classList.toggle('active', current);
      dot.toggleAttribute('aria-current', current);
    });
  }

  /* ---------------------------------------------------------- animation -- */

  /**
   * Move `position` to a whole slide. With a release speed the duration is
   * chosen so the ease-out curve starts at that speed, which makes a flick
   * carry straight on instead of stalling and restarting.
   */
  function animateTo(destination, speed = 0) {
    cancelAnimationFrame(frame);
    frame = 0;
    target = destination;

    const from = position;
    const distance = destination - from;
    if (distance === 0 || wantsCalm.matches) {
      rest(destination);
      return;
    }

    const travel = Math.abs(distance);
    const duration = Math.min(
      MAX_DURATION,
      Math.max(
        MIN_DURATION,
        speed
          ? (3 * travel * track.clientWidth) / speed
          : STEP_DURATION * Math.sqrt(travel),
      ),
    );

    const started = performance.now();
    const tick = now => {
      const progress = Math.min(1, (now - started) / duration);
      position = from + distance * (1 - Math.pow(1 - progress, 3));
      render();
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        rest(destination);
      }
    };
    frame = requestAnimationFrame(tick);
  }

  /** Come to rest on a slide, keeping the numbers small as the loop goes round. */
  function rest(slide) {
    frame = 0;
    position = target = wrap(slide, count);
    render();
  }

  function goBy(steps) {
    animateTo(target + steps);
  }

  /** Go to a slide by the shorter way round. */
  function goToSlide(index) {
    const steps = wrap(index - target + count / 2, count) - count / 2;
    animateTo(target + steps);
  }

  /* ------------------------------------------------------------ gesture -- */

  track.addEventListener('pointerdown', event => {
    if (gesture) return; // a second finger does not start a second drag
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const caught = frame !== 0;
    cancelAnimationFrame(frame);
    frame = 0;

    clickGuardUntil = 0;
    gesture = {
      id: event.pointerId,
      startX: event.clientX,
      startPosition: position,
      samples: [{ x: event.clientX, t: event.timeStamp }],
      moving: false,
      caught,
      // where the carousel was heading when the gesture caught it
      aim: caught ? target : null,
    };
    hold('gesture', true);
  });

  track.addEventListener('pointermove', event => {
    if (!gesture || event.pointerId !== gesture.id) return;

    const travelled = event.clientX - gesture.startX;
    if (!gesture.moving) {
      if (Math.abs(travelled) < DRAG_THRESHOLD) return;
      gesture.moving = true;
      track.setPointerCapture(event.pointerId);
      track.classList.add('is-dragging');
    }

    position = gesture.startPosition + (forward * travelled) / track.clientWidth;
    render();

    recordPointerSample(gesture.samples, event);
  });

  track.addEventListener('pointerup', event => finishGesture(event, false));
  // The browser takes over a touch that turns into a vertical page scroll.
  track.addEventListener('pointercancel', event => finishGesture(event, true));

  function finishGesture(event, cancelled) {
    if (!gesture || event.pointerId !== gesture.id) return;
    const { moving, caught, aim, samples } = gesture;
    gesture = null;
    track.classList.remove('is-dragging');
    hold('gesture', false);

    // A drag — or a tap that stopped a moving carousel — must not open a link.
    if (moving || caught) clickGuardUntil = performance.now() + CLICK_GUARD;

    if (!moving) {
      if (caught) animateTo(target);
      return;
    }

    const velocity = cancelled ? 0 : releaseVelocity(samples, event.timeStamp);
    const speed = Math.abs(velocity);
    let destination = Math.round(position);
    if (speed > FLICK_SPEED) {
      // A flick goes on to the next slide in the direction it was thrown. When it
      // caught the carousel already heading that way, it goes one past where the
      // carousel was heading, so that every flick counts.
      if (forward * velocity > 0) {
        destination = Math.ceil(position);
        if (aim !== null && destination <= aim) destination = aim + 1;
      } else {
        destination = Math.floor(position);
        if (aim !== null && destination >= aim) destination = aim - 1;
      }
    }
    animateTo(destination, speed > FLICK_SPEED ? speed : 0);
  }

  track.addEventListener(
    'click',
    event => {
      if (performance.now() > clickGuardUntil) return;
      clickGuardUntil = 0;
      event.preventDefault();
      event.stopPropagation();
    },
    true,
  );

  // Images and links are draggable in their own right, and that would fight the
  // carousel's own gesture.
  track.addEventListener('dragstart', event => event.preventDefault());

  /* ------------------------------------------------------------ controls -- */

  if (previousButton) previousButton.addEventListener('click', () => goBy(-1));
  if (nextButton) nextButton.addEventListener('click', () => goBy(1));

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goToSlide(index));
  });

  container.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    // A key points where the reader wants to go, which is the opposite of the
    // way the slides have to be pulled to get there.
    const pointsForward = (event.key === 'ArrowRight' ? 1 : -1) === -forward;
    goBy(pointsForward ? 1 : -1);
  });

  /* ------------------------------------------------------------ autoplay -- */

  /**
   * Autoplay runs only while nothing holds it: a mouse over the carousel,
   * keyboard focus inside it, a gesture in progress, a hidden tab, or a reader
   * who has asked for reduced motion. Every change restarts the full delay.
   */
  function hold(reason, on) {
    if (on) holds.add(reason);
    else holds.delete(reason);
    syncAutoplay();
  }

  function syncAutoplay() {
    clearInterval(timer);
    timer = 0;
    if (holds.size || document.hidden || wantsCalm.matches) return;
    timer = setInterval(() => goBy(1), AUTOPLAY_DELAY);
  }

  container.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') hold('hover', true);
  });
  container.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse') hold('hover', false);
  });
  container.addEventListener('focusin', event => {
    if (event.target.matches(':focus-visible')) hold('focus', true);
  });
  container.addEventListener('focusout', event => {
    if (!container.contains(event.relatedTarget)) hold('focus', false);
  });
  document.addEventListener('visibilitychange', syncAutoplay);
  wantsCalm.addEventListener('change', syncAutoplay);

  /* ---------------------------------------------------------------- start -- */

  slides.forEach((slide, index) => {
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'اسلاید');
    slide.setAttribute(
      'aria-label',
      `${(index + 1).toLocaleString('fa-IR')} از ${count.toLocaleString('fa-IR')}`,
    );
  });

  render();
  syncAutoplay();
}

/** The category rail: arrows, and an unattended crawl while nobody is on it. */
function initCategoryRail() {
  const wrapper = document.querySelector('.category-slider-wrapper');
  const rail = wrapper && wrapper.querySelector('.category-slider');
  if (!rail) return;

  const previousButton = wrapper.querySelector('.category-arrow-prev');
  const nextButton = wrapper.querySelector('.category-arrow-next');

  const CRAWL_DELAY = 3000;
  const EDGE_SLACK = 5;
  const wantsCalm = window.matchMedia('(prefers-reduced-motion: reduce)');

  let timer = null;

  // One card at a time, and the cards are smaller on a phone.
  const step = () => (window.innerWidth <= 991.98 ? 114 : 192);
  const offset = () => Math.abs(rail.scrollLeft);
  const limit = () => rail.scrollWidth - rail.clientWidth;

  /** The rail reads right to left, so "next" travels towards negative offsets. */
  function scrollByOneCard(direction) {
    rail.scrollBy({ left: direction * step(), behavior: 'smooth' });
  }

  function syncButtons() {
    if (!previousButton || !nextButton) return;

    previousButton.toggleAttribute('disabled', offset() <= EDGE_SLACK);
    nextButton.toggleAttribute('disabled', offset() >= limit() - EDGE_SLACK);
  }

  function crawl() {
    if (offset() >= limit() - EDGE_SLACK) {
      rail.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      scrollByOneCard(-1);
    }
  }

  function play() {
    stop();
    if (wantsCalm.matches) return;
    timer = setInterval(crawl, CRAWL_DELAY);
  }

  function stop() {
    clearInterval(timer);
    timer = null;
  }

  rail.addEventListener('scroll', syncButtons, { passive: true });
  window.addEventListener('resize', syncButtons);

  if (previousButton) {
    previousButton.addEventListener('click', () => scrollByOneCard(1));
  }
  if (nextButton) {
    nextButton.addEventListener('click', () => scrollByOneCard(-1));
  }

  wrapper.addEventListener('pointerenter', stop);
  wrapper.addEventListener('pointerdown', stop);
  wrapper.addEventListener('pointerleave', play);
  wrapper.addEventListener('pointerup', play);

  syncButtons();
  play();
}

document.addEventListener('DOMContentLoaded', () => {
  initFestivalStrip();
  initBannerCarousel();
  initCategoryRail();
});

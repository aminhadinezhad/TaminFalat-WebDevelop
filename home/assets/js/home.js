'use strict';

document.addEventListener('DOMContentLoaded', function () {
  const slides = document.querySelectorAll('.banner-slide');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.querySelector('.banner-arrow-prev');
  const nextBtn = document.querySelector('.banner-arrow-next');

  let currentSlide = 0;
  let autoPlayInterval;
  const autoPlayDelay = 5000;

  function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    if (index >= slides.length) {
      currentSlide = 0;
    } else if (index < 0) {
      currentSlide = slides.length - 1;
    } else {
      currentSlide = index;
    }

    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }
  function prevSlide() {
    showSlide(currentSlide - 1);
  }
  function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, autoPlayDelay);
  }
  function stopAutoPlay() {
    clearInterval(autoPlayInterval);
  }

  nextBtn.addEventListener('click', function () {
    nextSlide();
  });
  prevBtn.addEventListener('click', function () {
    prevSlide();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  const sliderContainer = document.querySelector('.banner-slider-container');
  sliderContainer.addEventListener('mouseenter', stopAutoPlay);
  sliderContainer.addEventListener('mouseleave', startAutoPlay);

  startAutoPlay();

  let touchStartX = 0;
  let touchEndX = 0;

  sliderContainer.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoPlay();
  });

  sliderContainer.addEventListener('touchend', function (e) {
    touchEndX = e.changedTouches[0].screenX;
    if (touchEndX < touchStartX - 50) prevSlide();
    if (touchEndX > touchStartX + 50) nextSlide();
    startAutoPlay();
  });

  const categorySlider = document.querySelector('.category-slider');
  const catPrevBtn = document.querySelector('.category-arrow-prev');
  const catNextBtn = document.querySelector('.category-arrow-next');
  function getScrollAmount() {
    return window.innerWidth <= 991.98 ? 114 : 192;
  }

  function updateCategoryButtons() {
    const maxScroll = categorySlider.scrollWidth - categorySlider.clientWidth;
    const currentScroll = Math.abs(categorySlider.scrollLeft);

    if (currentScroll < 5) {
      catPrevBtn.setAttribute('disabled', 'true');
      catNextBtn.removeAttribute('disabled');
    } else if (currentScroll >= maxScroll - 5) {
      catNextBtn.setAttribute('disabled', 'true');
      catPrevBtn.removeAttribute('disabled');
    } else {
      catPrevBtn.removeAttribute('disabled');
      catNextBtn.removeAttribute('disabled');
    }
  }

  categorySlider.addEventListener('scroll', updateCategoryButtons);

  updateCategoryButtons();

  catPrevBtn.addEventListener('click', () => {
    categorySlider.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
  });

  catNextBtn.addEventListener('click', () => {
    categorySlider.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
  });

  let catAutoScrollInterval;

  function startCatAutoScroll() {
    catAutoScrollInterval = setInterval(() => {
      const maxScroll = categorySlider.scrollWidth - categorySlider.clientWidth;
      const currentScroll = Math.abs(categorySlider.scrollLeft);

      if (currentScroll >= maxScroll - 5) {
        categorySlider.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        categorySlider.scrollBy({
          left: -getScrollAmount(),
          behavior: 'smooth',
        });
      }
    }, 3000);
  }

  function stopCatAutoScroll() {
    clearInterval(catAutoScrollInterval);
  }

  const categorySliderWrapper = document.querySelector(
    '.category-slider-wrapper',
  );
  categorySliderWrapper.addEventListener('mouseenter', stopCatAutoScroll);
  categorySliderWrapper.addEventListener('mouseleave', startCatAutoScroll);
  categorySliderWrapper.addEventListener('touchstart', stopCatAutoScroll);
  categorySliderWrapper.addEventListener('touchend', startCatAutoScroll);

  startCatAutoScroll();
});

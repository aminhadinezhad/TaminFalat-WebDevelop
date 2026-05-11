'use strict';
const productSliders = document.querySelectorAll('.product-slider-wrapper');

productSliders.forEach(wrapper => {
  const productSlider = wrapper.querySelector('.product-slider');
  const proPrevBtn = wrapper.querySelector('.product-arrow-prev');
  const proNextBtn = wrapper.querySelector('.product-arrow-next');
  const scrollAmount = 80;

  function updateButtons() {
    const maxScroll = productSlider.scrollWidth - productSlider.clientWidth;
    const currentScroll = Math.abs(productSlider.scrollLeft);

    if (maxScroll <= 0) {
      proPrevBtn.classList.add('d-none');
      proNextBtn.classList.add('d-none');
      return;
    } else {
      proPrevBtn.classList.remove('d-none');
      proNextBtn.classList.remove('d-none');
    }

    if (currentScroll < 5) {
      proPrevBtn.setAttribute('disabled', 'true');
      proNextBtn.removeAttribute('disabled');
    } else if (currentScroll >= maxScroll - 5) {
      proNextBtn.setAttribute('disabled', 'true');
      proPrevBtn.removeAttribute('disabled');
    } else {
      proPrevBtn.removeAttribute('disabled');
      proNextBtn.removeAttribute('disabled');
    }
  }

  productSlider.addEventListener('scroll', updateButtons);
  window.addEventListener('resize', updateButtons);
  updateButtons();

  proPrevBtn.addEventListener('click', () => {
    productSlider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });

  proNextBtn.addEventListener('click', () => {
    productSlider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });
});

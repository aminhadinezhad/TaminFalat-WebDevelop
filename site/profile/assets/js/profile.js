'use strict';

const buttonsWrapper = document.querySelector('.buttons-wrapper');
const informationsWrapper = document.querySelector('.informations-wrapper');
const modals = document.querySelectorAll('.modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');
const btnsCloseModal = document.querySelectorAll('.btn--close-modal');

const switchInfo = function (e) {
  const clicked = e.target.closest('button');
  if (!clicked) return;

  buttonsWrapper
    .querySelectorAll('button')
    .forEach(btn => btn.classList.remove('selected'));
  clicked.classList.add('selected');

  informationsWrapper.querySelectorAll('.info').forEach(info => {
    info.classList.add('d-none');
    if (clicked.id === info.id) info.classList.remove('d-none');
  });
};

if (buttonsWrapper) {
  buttonsWrapper.addEventListener('click', switchInfo);
}

const openModal = function (e) {
  const clicked = e.target.closest('button');
  if (!clicked) return;

  modals.forEach(modal => {
    if (clicked.id === modal.id) {
      modal.querySelectorAll('input').forEach(input => (input.value = ''));
      modal.classList.remove('hidden');
    }
  });
};

const closeModal = function () {
  modals.forEach(modal => modal.classList.add('hidden'));
};

btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));
btnsCloseModal.forEach(btn => btn.addEventListener('click', closeModal));

document.addEventListener('click', function (e) {
  if (e.target.classList.contains('modal')) closeModal();
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeModal();
});

let selectedData = { year: null, month: null, day: null };

const yearDropdown = document.querySelector(
  '[data-type="year"] .dropdown-menu-custom',
);
if (yearDropdown) {
  for (let year = 1400; year >= 1310; year--) {
    const li = document.createElement('li');
    li.dataset.value = year;
    li.textContent = year;
    yearDropdown.appendChild(li);
  }
}

const dayDropdown = document.querySelector(
  '[data-type="day"] .dropdown-menu-custom',
);
if (dayDropdown) {
  for (let day = 1; day <= 31; day++) {
    const li = document.createElement('li');
    li.dataset.value = day;
    li.textContent = day;
    dayDropdown.appendChild(li);
  }
}

document.querySelectorAll('.dropdown-trigger').forEach(trigger => {
  trigger.addEventListener('click', function (e) {
    e.stopPropagation();

    const parentDropdown = this.parentElement;
    const isActive = parentDropdown.classList.contains('active');

    document.querySelectorAll('.custom-dropdown').forEach(dd => {
      dd.classList.remove('active');
      dd.querySelector('.dropdown-trigger').classList.remove('active');
    });

    if (!isActive) {
      parentDropdown.classList.add('active');
      this.classList.add('active');
    }
  });
});

document.querySelectorAll('.dropdown-menu-custom').forEach(menu => {
  menu.addEventListener('click', function (e) {
    const item = e.target.closest('li');
    if (!item) return;

    const dropdown = this.closest('.custom-dropdown');
    const type = dropdown.dataset.type;

    dropdown
      .querySelectorAll('li')
      .forEach(li => li.classList.remove('selected'));
    item.classList.add('selected');
    dropdown.querySelector('.selected-value').textContent = item.textContent;
    selectedData[type] = item.dataset.value;

    dropdown.classList.remove('active');
    dropdown.querySelector('.dropdown-trigger').classList.remove('active');
  });
});

document.addEventListener('click', function () {
  document.querySelectorAll('.custom-dropdown').forEach(dd => {
    dd.classList.remove('active');
    dd.querySelector('.dropdown-trigger').classList.remove('active');
  });
});

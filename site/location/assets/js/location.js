'use strict';

const modals = document.querySelectorAll('.modal');
const modalMap = document.querySelector('.modal-map');
const modalForm = document.querySelector('.modal-form');
const modalFormTitle = document.querySelector('.modal-form-title');
const modalDelete = document.querySelector('.modal-delete');
const emptyState = document.querySelector('.empty-state');
const addressCard = document.querySelector('.address-card');
const btnAddAddress = document.querySelector('.btn-add-address');
const btnAddNewAddress = document.querySelector('.btn-add-new-address');
const btnsEditAddress = document.querySelectorAll('.btn-edit-address');
const btnEditLocation = document.querySelector('.btn-edit-location');
const btnCloseModalMap = document.querySelector('.modal-map .btn-close-modal');
const btnCloseModalForm = document.querySelector(
  '.modal-form .btn-close-modal',
);
const btnCloseModalDelete = document.querySelector(
  '.modal-delete .btn-close-modal',
);
const btnBackModalMap = document.querySelector('.modal-map .btn-back-modal');
const btnBackModalForm = document.querySelector('.modal-form .btn-back-modal');
const btnDeleteModalForm = document.querySelector(
  '.modal-form .btn-delete-address',
);
const btnLocateMe = document.querySelector('.btn-locate-me');
const btnContinue = document.querySelector('.btn-continue');
const btnSubmit = document.querySelector('.btn-submit-address');
const btnDelete = document.querySelector('.btn-delete-address');
const btnConfirmDelete = document.querySelector('.btn-confirm-delete');
const btnCancelDelete = document.querySelector('.btn-cancel-delete');

let map = null;
let marker = null;

// Map

function initMap() {
  if (map) {
    map.invalidateSize();
    return;
  }

  const tehran = [35.6892, 51.389];

  map = L.map('map').setView(tehran, 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap',
  }).addTo(map);

  marker = L.marker(tehran).addTo(map);

  navigator.geolocation.getCurrentPosition(function (position) {
    const { latitude: lat, longitude: lng } = position.coords;
    map.flyTo([lat, lng], 15, { duration: 1 });
    marker.setLatLng([lat, lng]);
    marker.bindPopup('شما اینجا هستید').openPopup();
  });

  map.on('click', function (e) {
    map.flyTo(e.latlng, 15, { duration: 1 });
    marker.setLatLng(e.latlng);
    marker.bindPopup('مکان انتخابی شما').openPopup();
  });
}

function locateMe() {
  if (!map) return;
  navigator.geolocation.getCurrentPosition(function (position) {
    const { latitude: lat, longitude: lng } = position.coords;
    map.flyTo([lat, lng], 15, { duration: 1 });
    marker.setLatLng([lat, lng]);
    marker.bindPopup('شما اینجا هستید').openPopup();
  });
}

// Modal Map

function openModalMap() {
  modalMap.classList.remove('hidden');
  initMap();
}

function closeModalMap() {
  modalMap.classList.add('hidden');
}

// Modal Form

function openModalForm() {
  modalForm.classList.remove('hidden');
}

function closeModalForm() {
  modalForm.classList.add('hidden');
}

function resetFormModal() {
  modalFormTitle.textContent = 'افزودن آدرس';
  btnDeleteModalForm.classList.add('d-none');
  btnBackModalForm.classList.remove('modal-closer');
}

// Event Listeners

btnAddAddress.addEventListener('click', function () {
  openModalMap();
});

btnAddNewAddress.addEventListener('click', function () {
  openModalMap();
});

btnsEditAddress.forEach(btn => {
  btn.addEventListener('click', function () {
    modalFormTitle.textContent = 'ویرایش آدرس';
    btnDeleteModalForm.classList.remove('d-none');
    btnBackModalForm.classList.add('modal-closer');
    openModalForm();
  });
});

btnBackModalForm.addEventListener('click', function () {
  if (btnBackModalForm.classList.contains('modal-closer')) {
    resetFormModal();
    closeModalForm();
  } else {
    closeModalForm();
    openModalMap();
  }
});

btnCloseModalForm.addEventListener('click', function () {
  resetFormModal();
  closeModalForm();
});

btnEditLocation.addEventListener('click', function () {
  btnBackModalMap.classList.add('modal-returner');
  closeModalForm();
  openModalMap();
});

btnBackModalMap.addEventListener('click', function () {
  if (btnBackModalMap.classList.contains('modal-returner')) {
    btnBackModalMap.classList.remove('modal-returner');
    closeModalMap();
    openModalForm();
  } else {
    closeModalMap();
  }
});

btnCloseModalMap.addEventListener('click', function () {
  if (btnBackModalMap.classList.contains('modal-returner')) {
    btnBackModalMap.classList.remove('modal-returner');
    resetFormModal();
  }
  closeModalMap();
});

btnContinue.addEventListener('click', function () {
  if (btnBackModalMap.classList.contains('modal-returner')) {
    btnBackModalMap.classList.remove('modal-returner');
  }
  closeModalMap();
  openModalForm();
});

btnSubmit.addEventListener('click', function () {
  resetFormModal();
  closeModalForm();
  emptyState.classList.add('d-none');
  btnAddNewAddress.classList.remove('d-none');
  addressCard.classList.remove('d-none');
});

btnLocateMe.addEventListener('click', locateMe);

// Modal Delete

[btnDelete, btnDeleteModalForm].forEach(btn => {
  btn.addEventListener('click', function () {
    modalDelete.classList.remove('hidden');
  });
});

[btnCloseModalDelete, btnCancelDelete].forEach(btn => {
  btn.addEventListener('click', function () {
    modalDelete.classList.add('hidden');
  });
});

btnConfirmDelete.addEventListener('click', function () {
  modalDelete.classList.add('hidden');
  addressCard.classList.add('d-none');
  emptyState.classList.remove('d-none');
  btnAddNewAddress.classList.add('d-none');
  if (!modalForm.classList.contains('hidden')) {
    resetFormModal();
    closeModalForm();
  }
});

// Dropdowns

const iranData = {
  تهران: [
    'تهران',
    'شهریار',
    'ری',
    'اسلامشهر',
    'پاکدشت',
    'ورامین',
    'دماوند',
    'فیروزکوه',
    'رباط‌کریم',
  ],
  اصفهان: [
    'اصفهان',
    'کاشان',
    'خمینی‌شهر',
    'نجف‌آباد',
    'شاهین‌شهر',
    'فلاورجان',
    'مبارکه',
    'اردستان',
    'نطنز',
  ],
  فارس: [
    'شیراز',
    'مرودشت',
    'جهرم',
    'کازرون',
    'فسا',
    'داراب',
    'آباده',
    'لارستان',
    'ممسنی',
  ],
  'خراسان رضوی': [
    'مشهد',
    'نیشابور',
    'سبزوار',
    'تربت حیدریه',
    'قوچان',
    'کاشمر',
    'تربت جام',
    'گناباد',
    'درگز',
  ],
  'آذربایجان شرقی': [
    'تبریز',
    'مراغه',
    'مرند',
    'اهر',
    'میانه',
    'سراب',
    'بناب',
    'هشترود',
    'عجب‌شیر',
  ],
  'آذربایجان غربی': [
    'ارومیه',
    'خوی',
    'مهاباد',
    'بوکان',
    'میاندوآب',
    'سلماس',
    'نقده',
    'اشنویه',
    'پیرانشهر',
  ],
  مازندران: [
    'ساری',
    'آمل',
    'بابل',
    'قائم‌شهر',
    'نوشهر',
    'چالوس',
    'تنکابن',
    'بابلسر',
    'محمودآباد',
  ],
  گیلان: [
    'رشت',
    'انزلی',
    'لاهیجان',
    'لنگرود',
    'آستارا',
    'فومن',
    'رودبار',
    'تالش',
    'ماسال',
  ],
  کرمانشاه: [
    'کرمانشاه',
    'اسلام‌آباد غرب',
    'کنگاور',
    'صحنه',
    'هرسین',
    'سرپل ذهاب',
    'پاوه',
    'جوانرود',
    'گیلانغرب',
  ],
  خوزستان: [
    'اهواز',
    'دزفول',
    'آبادان',
    'خرمشهر',
    'بهبهان',
    'مسجدسلیمان',
    'شوشتر',
    'اندیمشک',
    'ایذه',
  ],
  کرمان: [
    'کرمان',
    'سیرجان',
    'رفسنجان',
    'جیرفت',
    'زرند',
    'بم',
    'کهنوج',
    'شهربابک',
    'عنبرآباد',
  ],
  البرز: ['کرج', 'فردیس', 'نظرآباد', 'هشتگرد', 'طالقان', 'چهارباغ'],
  گلستان: [
    'گرگان',
    'گنبدکاووس',
    'علی‌آباد کتول',
    'بندر ترکمن',
    'کردکوی',
    'آزادشهر',
    'مینودشت',
    'رامیان',
  ],
  همدان: [
    'همدان',
    'ملایر',
    'نهاوند',
    'تویسرکان',
    'اسدآباد',
    'کبودرآهنگ',
    'بهار',
    'رزن',
  ],
  'سیستان و بلوچستان': [
    'زاهدان',
    'زابل',
    'چابهار',
    'ایرانشهر',
    'خاش',
    'سرباز',
    'نیکشهر',
    'دلگان',
  ],
  قم: ['قم', 'جعفریه', 'قنوات', 'سلفچگان', 'دستجرد'],
  مرکزی: ['اراک', 'ساوه', 'خمین', 'محلات', 'دلیجان', 'شازند', 'تفرش', 'آشتیان'],
  بوشهر: ['بوشهر', 'برازجان', 'بندر گناوه', 'خورموج', 'کنگان', 'عسلویه', 'جم'],
  لرستان: [
    'خرم‌آباد',
    'بروجرد',
    'دورود',
    'کوهدشت',
    'ازنا',
    'پلدختر',
    'الیگودرز',
    'نورآباد',
  ],
  کردستان: [
    'سنندج',
    'سقز',
    'مریوان',
    'بانه',
    'قروه',
    'بیجار',
    'دیواندره',
    'کامیاران',
  ],
  زنجان: ['زنجان', 'ابهر', 'خرمدره', 'قیدار', 'طارم', 'ماهنشان'],
  اردبیل: [
    'اردبیل',
    'مشگین‌شهر',
    'پارس‌آباد',
    'خلخال',
    'بیله‌سوار',
    'نمین',
    'نیر',
  ],
  'چهارمحال و بختیاری': [
    'شهرکرد',
    'بروجن',
    'فارسان',
    'لردگان',
    'اردل',
    'سامان',
  ],
  یزد: ['یزد', 'میبد', 'اردکان', 'مهریز', 'بافق', 'طبس', 'ابرکوه'],
  قزوین: ['قزوین', 'تاکستان', 'آبیک', 'بوئین‌زهرا', 'آوج'],
  سمنان: ['سمنان', 'شاهرود', 'گرمسار', 'دامغان', 'مهدیشهر', 'آرادان'],
  'خراسان شمالی': [
    'بجنورد',
    'شیروان',
    'اسفراین',
    'جاجرم',
    'آشخانه',
    'مانه و سملقان',
  ],
  'خراسان جنوبی': ['بیرجند', 'قاین', 'فردوس', 'طبس', 'بشرویه', 'نهبندان'],
  ایلام: ['ایلام', 'مهران', 'دهلران', 'ایوان', 'آبدانان', 'دره‌شهر'],
  هرمزگان: [
    'بندرعباس',
    'میناب',
    'قشم',
    'بندرلنگه',
    'حاجی‌آباد',
    'رودان',
    'جاسک',
  ],
};

const selectedData = { province: null, city: null };

const provinceDropdown = document.querySelector(
  '[data-type="province"] .dropdown-menu-custom',
);
if (provinceDropdown) {
  Object.keys(iranData).forEach(provinceName => {
    const li = document.createElement('li');
    li.dataset.value = provinceName;
    li.textContent = provinceName;
    provinceDropdown.appendChild(li);
  });
}

function updateCities(provinceName) {
  const cityDropdown = document.querySelector(
    '[data-type="city"] .dropdown-menu-custom',
  );
  const cityTrigger = document.querySelector(
    '[data-type="city"] .selected-value',
  );
  if (!cityDropdown) return;

  cityDropdown.innerHTML = '';
  if (cityTrigger) cityTrigger.textContent = '';
  selectedData.city = null;

  (iranData[provinceName] || []).forEach(cityName => {
    const li = document.createElement('li');
    li.dataset.value = cityName;
    li.textContent = cityName;
    cityDropdown.appendChild(li);
  });
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

    if (parentDropdown.dataset.type === 'city' && !selectedData.province)
      return;

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

    if (type === 'province') updateCities(item.dataset.value);

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

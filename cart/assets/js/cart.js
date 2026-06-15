'use strict';

let cart = [
  {
    id: 1,
    code: '5206',
    name: 'ساک دستی تامین فلات',
    unitPrice: 20900,
    tax: 2090,
    qty: 1,
    src: 'assets/images/sNveEorBmyfFFXMcANJO.jpg',
    href: 'https://www.taminfalat.com/product/detail/%D8%B3%D8%A7%DA%A9-%D8%AF%D8%B3%D8%AA%DB%8C-%D8%AA%D8%A7%D9%85%DB%8C%D9%86-%D9%81%D9%84%D8%A7%D8%AA',
  },

  {
    id: 2,
    code: '561',
    name: 'زونکن A4 قرمز متالکو 7/5 سانت',
    unitPrice: 258400,
    tax: 25840,
    qty: 1,
    src: 'assets/images/01KADYGEGAHJ928HWQBZK9DBYA.png',
    href: 'https://www.taminfalat.com/product/detail/%D8%B2%D9%88%D9%86%DA%A9%D9%86-%D8%B9%D8%B7%D9%81-7-5-%D8%B3%D8%A7%D9%86%D8%AA%DB%8C%D9%85%D8%AA%D8%B1%DB%8C-A4-%D9%85%D8%A7%D8%AA-PVC-%D9%85%D8%AA%D8%A7%D9%84%DA%A9%D9%88',
  },
];

function formatPrice(n) {
  return n.toLocaleString('fa-IR');
}

function renderCart() {
  const tbody = document.getElementById('cartBody');
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  tbody.innerHTML = '';

  if (cart.length === 0) {
    document.getElementById('mainContent').classList.add('hidden');
    document.getElementById('emptyCartFull').classList.remove('hidden');
    document.querySelectorAll('.basket-element-notif').forEach(elementNotif => {
      elementNotif.classList.add('d-none');
    });
    return;
  }

  document.getElementById('mainContent').classList.remove('hidden');
  document.getElementById('emptyCartFull').classList.add('hidden');

  let total = 0;
  cart.forEach((item, idx) => {
    const lineTotal = (item.unitPrice + item.tax) * item.qty;
    total += lineTotal;

    const leftBtn =
      item.qty === 1
        ? `<div class="qty-btn trash" onclick="removeItem(${idx})" title="حذف از سبد">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" color="currentColor" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
        >
                                      <path d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5"></path>
                                      <path d="M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71729 2.41317C9.32164 2.7167 9.10063 3.20155 8.65861 4.17126L8.05292 5.5"></path>
                                      <path d="M9.5 16.5L9.5 10.5"></path>
                                      <path d="M14.5 16.5L14.5 10.5"></path>
                                    </svg> 
                 </div>`
        : `<div class="qty-btn" onclick="changeQty(${idx}, -1)">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" color="currentColor" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 12L4 12" />
</svg>
                 </div>`;

    const tr = document.createElement('tr');
    tr.innerHTML = `
            <td data-label="ردیف">${idx + 1}</td>
            <td data-label="کالا">
              <div class="product">
                <a href="${item.href}">
                  <img class="product-img" src="${item.src}" alt="" />
                </a>
                <div>
                  <a href="${item.href}" class="product-name">${item.name}</a>
                  <div class="product-code">کد: ${item.code}</div>
                </div>
              </div>
            </td>
            <td data-label="قیمت واحد" class="price-col">${formatPrice(item.unitPrice)}</td>
            <td data-label="ارزش افزوده" class="added-val">${formatPrice(item.tax)}</td>
            <td data-label="تعداد">
              <div class="qty-control">
                 <div class="qty-btn" onclick="changeQty(${idx}, 1)">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" color="currentColor" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M12 4V20M20 12H4"></path>
                            </svg>
                </div>
                <span class="qty-val">${item.qty}</span>
                ${leftBtn}
              </div>
            </td>
            <td data-label="جمع" class="price-col">${formatPrice(lineTotal)}</td>
          `;
    tbody.appendChild(tr);
  });

  document.getElementById('totalAmount').innerHTML =
    `${formatPrice(total)} <small style="font-size:.75rem;font-weight:500">تومان</small>`;
  document.querySelectorAll('.basket-element-notif-text').forEach(count => {
    count.textContent = totalQty;
  });
}

function changeQty(idx, delta) {
  cart[idx].qty = Math.max(1, cart[idx].qty + delta);
  renderCart();
}

function removeItem(idx) {
  cart.splice(idx, 1);
  renderCart();
}

renderCart();

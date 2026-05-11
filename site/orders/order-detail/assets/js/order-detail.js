'use strict';

const transactionBtn = document.querySelector('.transaction-btn');
const transaction = document.querySelector('.transaction');

transactionBtn.addEventListener('click', function () {
  transaction.classList.toggle('d-none');
  transactionBtn.classList.toggle('active');
});

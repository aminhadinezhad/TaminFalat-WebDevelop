"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const searchBtn = document.getElementById("searchBtn");
  const searchText = document.getElementById("searchText");
  const searchOverlay = document.getElementById("searchOverlay");
  const closeSearch = document.getElementById("closeSearch");
  const overlaySearchInput = document.getElementById("overlaySearchInput");

  searchBtn.addEventListener("click", function () {
    searchOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
    overlaySearchInput.focus();
  });

  closeSearch.addEventListener("click", function () {
    searchOverlay.classList.remove("active");
    document.body.style.overflow = "";
  });

  overlaySearchInput.addEventListener("input", function () {
    searchText.textContent = this.value;
    if (this.value.trim().length > 0) {
      searchBtn.style.backgroundColor = "#f8f9fa";
    } else {
      searchBtn.style.backgroundColor = "";
    }
  });

  const menuBtn = document.querySelector(".menu-btn");
  const menuOverlay = document.getElementById("menuOverlay");

  if (menuBtn && menuOverlay) {
    menuBtn.addEventListener("click", () => {
      menuOverlay.classList.toggle("active");
    });
  }

  const menuBtnMobileItem = document.querySelector(".menu-btn-mobile-item");
  const menuBtnMobile = document.querySelector(".menu-btn-mobile");
  const closeMenu = document.getElementById("closeMenu");
  const menuOverlayMobile = document.getElementById("menuOverlayMobile");
  const menuBtnsWrapper = document.querySelector(".menu-overlay__btns-wrapper");
  const menuBtns = document.querySelectorAll(".menu-overlay__btn");
  const menuCategories = document.querySelectorAll(".menu-overlay__category");

  let currentActiveItem = document.querySelector(".bottom-nav-item.active");

  menuBtnMobile.addEventListener("click", () => {
    currentActiveItem.classList.toggle("active");
    menuBtnMobileItem.classList.toggle("active");
    menuOverlayMobile.classList.toggle("active");
    document.body.classList.toggle("overflow-hidden");
  });

  closeMenu.addEventListener("click", function () {
    menuBtnMobileItem.classList.remove("active");
    currentActiveItem.classList.add("active");
    menuOverlayMobile.classList.remove("active");
    document.body.classList.remove("overflow-hidden");
  });

  if (menuBtnsWrapper) {
    menuBtnsWrapper.addEventListener("click", (e) => {
      const clickedBtn = e.target.closest(".menu-overlay__btn");
      if (!clickedBtn) return;

      menuBtns.forEach((btn) => btn.classList.remove("active"));
      clickedBtn.classList.add("active");

      const targetId = clickedBtn.dataset.target;

      menuCategories.forEach((cat) => {
        if (cat.id === targetId) {
          cat.classList.remove("d-none");
          cat.classList.add("d-flex");

          const leftSideContent = document.querySelector(
            ".menu-overlay__content-mobile .col-9",
          );
          if (leftSideContent) {
            leftSideContent.scrollTop = 0;
          }
        } else {
          cat.classList.add("d-none");
          cat.classList.remove("d-flex");
        }
      });
    });
  }
});

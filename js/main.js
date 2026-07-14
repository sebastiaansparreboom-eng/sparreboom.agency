(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Nav scroll state ---------- */
  var nav = document.getElementById("nav");
  var lastScrollState = false;
  function updateNavState() {
    var scrolled = window.scrollY > 40;
    if (scrolled !== lastScrollState) {
      nav.classList.toggle("is-scrolled", scrolled);
      lastScrollState = scrolled;
    }
  }
  updateNavState();

  /* ---------- Mobile menu ---------- */
  var navToggle = document.getElementById("navToggle");
  var navMobile = document.getElementById("navMobile");
  if (navToggle && navMobile) {
    navToggle.addEventListener("click", function () {
      var isOpen = navMobile.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });
    navMobile.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navMobile.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Hero parallax (transform-only, disabled on touch/reduced-motion) ---------- */
  var heroImg = document.querySelector(".hero__media img");
  var isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  var ticking = false;

  function applyParallax() {
    ticking = false;
    if (!heroImg) return;
    var rect = heroImg.parentElement.parentElement.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    var offset = Math.max(0, -rect.top) * 0.28;
    heroImg.style.transform = "translate3d(0," + offset + "px,0) scale(1.08)";
  }

  function onScrollParallax() {
    if (!ticking) {
      window.requestAnimationFrame(applyParallax);
      ticking = true;
    }
  }

  if (heroImg && !reduceMotion && !isCoarsePointer) {
    window.addEventListener("scroll", onScrollParallax, { passive: true });
    applyParallax();
  }

  window.addEventListener(
    "scroll",
    function () {
      updateNavState();
    },
    { passive: true }
  );

  /* ---------- Accordion (Work cards, FAQ) ---------- */
  document.querySelectorAll(".js-accordion-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest("[data-accordion-item]");
      var isOpen = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  });

  /* ---------- BOOM entrance pulse ---------- */
  var boom = document.querySelector("[data-boom]");
  if (boom && !reduceMotion) {
    var boomIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            boom.style.transition = "transform 0.9s cubic-bezier(.16,1,.3,1)";
            boom.style.transform = "scale(1)";
            boomIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    boom.style.transform = "scale(0.9)";
    boomIo.observe(boom);
  }
})();

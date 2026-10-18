(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Nav scroll state ---------- */
  var nav = document.getElementById("nav");
  var lastScrollState = false;
  function updateNavState() {
    if (!nav) return;
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

  /* ---------- Before/after drag slider ---------- */
  document.querySelectorAll("[data-ba-slider]").forEach(function (slider) {
    var before = slider.querySelector(".ba-slider__img--before");
    var handle = slider.querySelector(".ba-slider__handle");
    if (!before || !handle) return;
    var dragging = false;

    function setPosition(percent) {
      percent = Math.max(0, Math.min(100, percent));
      before.style.clipPath = "inset(0 " + (100 - percent) + "% 0 0)";
      handle.style.left = percent + "%";
      handle.setAttribute("aria-valuenow", String(Math.round(percent)));
    }

    function percentFromEvent(e) {
      var rect = slider.getBoundingClientRect();
      var x = e.clientX - rect.left;
      return (x / rect.width) * 100;
    }

    function onMove(e) {
      if (!dragging) return;
      setPosition(percentFromEvent(e));
    }
    function onUp() {
      dragging = false;
    }
    function onDown(e) {
      dragging = true;
      handle.focus();
      setPosition(percentFromEvent(e));
    }

    slider.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    handle.addEventListener("keydown", function (e) {
      var current = parseFloat(handle.style.left) || 50;
      if (e.key === "ArrowLeft") {
        setPosition(current - 5);
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        setPosition(current + 5);
        e.preventDefault();
      }
    });

    setPosition(50);
  });

  /* ---------- Carousels (proof, pricing) ---------- */
  document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
    var wrap = carousel.closest("[data-carousel-wrap]") || carousel.parentElement;
    var prevBtn = wrap.querySelector("[data-carousel-prev]");
    var nextBtn = wrap.querySelector("[data-carousel-next]");
    var dotsWrap = wrap.querySelector("[data-carousel-dots]");
    var cards = Array.prototype.slice.call(carousel.children);

    function scrollByCard(dir) {
      var card = cards[0];
      var amount = card ? card.getBoundingClientRect().width + 24 : carousel.clientWidth * 0.8;
      carousel.scrollBy({ left: dir * amount, behavior: reduceMotion ? "auto" : "smooth" });
    }
    if (prevBtn) prevBtn.addEventListener("click", function () { scrollByCard(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { scrollByCard(1); });

    if (dotsWrap && cards.length > 1) {
      cards.forEach(function (card, i) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel-dot";
        dot.setAttribute("aria-label", "Go to item " + (i + 1));
        dot.addEventListener("click", function () {
          carousel.scrollTo({
            left: card.offsetLeft - carousel.offsetLeft,
            behavior: reduceMotion ? "auto" : "smooth"
          });
        });
        dotsWrap.appendChild(dot);
      });
      var dots = Array.prototype.slice.call(dotsWrap.children);
      var ticking = false;
      function updateActiveDot() {
        ticking = false;
        var center = carousel.scrollLeft + carousel.clientWidth / 2;
        var closest = 0;
        var closestDist = Infinity;
        cards.forEach(function (card, i) {
          var cardCenter = card.offsetLeft - carousel.offsetLeft + card.clientWidth / 2;
          var dist = Math.abs(cardCenter - center);
          if (dist < closestDist) {
            closestDist = dist;
            closest = i;
          }
        });
        dots.forEach(function (d, i) { d.classList.toggle("is-active", i === closest); });
      }
      carousel.addEventListener("scroll", function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(updateActiveDot);
        }
      }, { passive: true });
      updateActiveDot();
    }
  });
})();

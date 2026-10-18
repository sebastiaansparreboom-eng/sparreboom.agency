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

  /* ---------- Package quiz ---------- */
  document.querySelectorAll("[data-quiz]").forEach(function (quiz) {
    var steps = Array.prototype.slice.call(quiz.querySelectorAll("[data-quiz-step]"));
    var dots = Array.prototype.slice.call(quiz.querySelectorAll(".quiz__progress-dot"));
    var resultEl = quiz.querySelector("[data-quiz-result]");
    var resultName = quiz.querySelector("[data-quiz-result-name]");
    var resultReason = quiz.querySelector("[data-quiz-result-reason]");
    var seeBtn = quiz.querySelector("[data-quiz-see]");
    var waBtn = quiz.querySelector("[data-quiz-whatsapp]");
    if (!steps.length || !resultEl) return;

    var answers = [];
    var tallies = { starter: 0, first: 0, every: 0 };

    var tierInfo = {
      starter: {
        name: "The Starter Call",
        reason: "You're after the basics done properly: findable, callable, nothing you don't need yet.",
        cardIndex: 1
      },
      first: {
        name: "The First Call Package",
        reason: "The one most tradies land on: a full site, a reviews system, and a year of free upkeep.",
        cardIndex: 0
      },
      every: {
        name: "The Every Call Package",
        reason: "With a crew that size, more pages and ongoing content will do more work for you.",
        cardIndex: 2
      }
    };

    function showStep(index) {
      steps.forEach(function (step, i) { step.classList.toggle("is-active", i === index); });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
        dot.classList.toggle("is-done", i < index);
      });
    }

    function finish() {
      var winner = "first";
      var best = -1;
      ["starter", "first", "every"].forEach(function (tier) {
        if (tallies[tier] > best) {
          best = tallies[tier];
          winner = tier;
        }
      });
      var info = tierInfo[winner];

      steps.forEach(function (step) { step.classList.remove("is-active"); });
      dots.forEach(function (dot) {
        dot.classList.add("is-done");
        dot.classList.remove("is-active");
      });
      if (resultName) resultName.textContent = info.name;
      if (resultReason) resultReason.textContent = info.reason;
      resultEl.classList.add("is-active");

      if (seeBtn) {
        seeBtn.addEventListener("click", function (e) {
          e.preventDefault();
          var carousel = document.querySelector(".pricing-carousel");
          var card = carousel ? carousel.children[info.cardIndex] : null;
          if (card) {
            card.scrollIntoView({
              behavior: reduceMotion ? "auto" : "smooth",
              block: "center",
              inline: "center"
            });
            card.classList.add("is-highlighted");
            window.setTimeout(function () { card.classList.remove("is-highlighted"); }, 2300);
          } else {
            var pkgSection = document.getElementById("package");
            if (pkgSection) pkgSection.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
          }
        });
      }

      if (waBtn) {
        var msg = "Hi! I just did the quick quiz on your tradies page.\n\n" +
          "My answers: " + answers.join(", ") + ".\n\n" +
          "You recommended: " + info.name + ". Can we chat?";
        waBtn.setAttribute("href", "https://wa.me/31649661038?text=" + encodeURIComponent(msg));
      }
    }

    steps.forEach(function (step, i) {
      step.querySelectorAll(".quiz__option").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var tier = btn.getAttribute("data-tier");
          tallies[tier] = (tallies[tier] || 0) + 1;
          answers.push(btn.textContent.trim());
          if (i < steps.length - 1) {
            showStep(i + 1);
          } else {
            finish();
          }
        });
      });
    });
  });
})();

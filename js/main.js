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

  /* ---------- Tradies page: founding spots ---------- */
  // Edit by hand when a founding spot is taken. At 0 the founding copy on the page needs updating too.
  var SPOTS_LEFT = 3;
  var foundingOpen = SPOTS_LEFT > 0;
  document.querySelectorAll("[data-spots-left]").forEach(function (el) {
    el.textContent = SPOTS_LEFT + (SPOTS_LEFT === 1 ? " spot" : " spots");
  });

  /* ---------- Tradies page: personal link (?n=Dave&p=first) ---------- */
  var WA_NUMBER = "31649661038";
  var waPrefix = "Hi Sebastiaan. ";
  var params = new URLSearchParams(window.location.search);
  var packageIndex = { starter: 0, first: 1, every: 2 };

  var visitorName = (params.get("n") || "").replace(/[^\p{L}\p{M}' .-]/gu, "").trim().slice(0, 30);
  if (visitorName) {
    visitorName = visitorName.charAt(0).toUpperCase() + visitorName.slice(1);
    waPrefix = "Hi Sebastiaan, it's " + visitorName + ". We spoke on the phone. ";
    var hello = document.querySelector(".hero__hello");
    if (hello) {
      hello.textContent = visitorName + ", this is the page I mentioned on the phone. Prices, the guarantees and a demo are all below.";
      hello.hidden = false;
    }
  }

  var discussed = params.get("p");
  if (packageIndex.hasOwnProperty(discussed)) {
    var pricingCarousel = document.querySelector(".pricing-carousel");
    if (pricingCarousel) pricingCarousel.setAttribute("data-carousel-start", String(packageIndex[discussed]));
    var heroSecondary = document.querySelector("[data-hero-secondary]");
    if (heroSecondary) heroSecondary.textContent = "Jump to the package we discussed";
  }

  /* ---------- Tradies page: WhatsApp messages, filled in ahead ---------- */
  var waMessages = {
    test: "I'd like the free 10-Second Test.\nBusiness name: \nSuburb: \nWebsite (if I have one): ",
    start: "I'd like to get started. I'll send a few job photos next.\nBusiness name: ",
    first: foundingOpen
      ? "I'm interested in The First Call Package at the founding client price (AUD $990). Is a spot still open?\nBusiness name: \nSuburb: "
      : "I'm interested in The First Call Package (AUD $1,490).\nBusiness name: \nSuburb: ",
    starter: "I'm interested in The Starter Call (AUD $590).\nBusiness name: \nSuburb: ",
    every: "I'm interested in The Every Call Package (AUD $2,490).\nBusiness name: \nSuburbs I work in: ",
    domain: "Can you sort out a domain for me? The name I'd like: ",
    addon: "A question about one of the add-ons: ",
    question: "Quick question before I decide: ",
    later: "Not ready yet. Check in with me around: \nBusiness name: ",
    footer: "I found your tradies page. "
  };

  function waHref(text) {
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text);
  }

  document.querySelectorAll("[data-wa]").forEach(function (link) {
    var message = waMessages[link.getAttribute("data-wa")];
    if (message) link.setAttribute("href", waHref(waPrefix + message));
  });

  var shareText = "Have a look at this. Website for the business, fixed price, no contract, and we only pay once we like the design:";
  var shareUrl = "https://sparreboom.agency/tradies.html";
  document.querySelectorAll("[data-share]").forEach(function (link) {
    link.setAttribute("href", "https://wa.me/?text=" + encodeURIComponent(shareText + " " + shareUrl));
    if (navigator.share && isCoarsePointer) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        navigator.share({ text: shareText, url: shareUrl }).catch(function () {});
      });
    }
  });

  /* ---------- Tradies page: header that steps aside ---------- */
  var autoNav = document.querySelector("[data-autohide]");
  if (autoNav) {
    var lastY = window.scrollY;
    var contactVisible = false;
    var autoNavTicking = false;
    var contactSection = document.getElementById("contact");

    function setNavHidden(hidden) {
      if (hidden && autoNav.contains(document.activeElement)) hidden = false;
      autoNav.classList.toggle("is-hidden", hidden);
    }

    function updateAutoNav() {
      autoNavTicking = false;
      var y = window.scrollY;
      var delta = y - lastY;
      if (Math.abs(delta) < 8) return;
      lastY = y;
      if (contactVisible) setNavHidden(true);
      else if (y < 600) setNavHidden(false);
      else setNavHidden(delta > 0);
    }

    window.addEventListener("scroll", function () {
      if (!autoNavTicking) {
        autoNavTicking = true;
        window.requestAnimationFrame(updateAutoNav);
      }
    }, { passive: true });

    autoNav.addEventListener("focusin", function () { autoNav.classList.remove("is-hidden"); });

    if (contactSection && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        contactVisible = entries[0].isIntersecting;
        if (contactVisible) setNavHidden(true);
      }, { threshold: 0.15 }).observe(contactSection);
    }
  }

  /* ---------- Before/after drag slider ---------- */
  document.querySelectorAll("[data-ba-slider]").forEach(function (slider) {
    var before = slider.querySelector(".ba-slider__img--before");
    var handle = slider.querySelector(".ba-slider__handle");
    if (!before || !handle) return;
    var position = 50;
    var activePointer = null;
    var mode = null; // "pending" until a touch shows it's a sideways drag, then "drag"
    var startX = 0;
    var startY = 0;

    function setPosition(percent) {
      position = Math.max(0, Math.min(100, percent));
      before.style.clipPath = "inset(0 " + (100 - position) + "% 0 0)";
      handle.style.left = position + "%";
      handle.setAttribute("aria-valuenow", String(Math.round(position)));
    }

    function percentFromEvent(e) {
      var rect = slider.getBoundingClientRect();
      return ((e.clientX - rect.left) / rect.width) * 100;
    }

    function capture(e) {
      try { slider.setPointerCapture(e.pointerId); } catch (err) { /* pointer already gone */ }
    }

    slider.addEventListener("pointerdown", function (e) {
      activePointer = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      if (e.pointerType === "mouse") {
        if (e.button !== 0) return;
        e.preventDefault();
        mode = "drag";
        capture(e);
        handle.focus({ preventScroll: true });
        setPosition(percentFromEvent(e));
      } else {
        mode = "pending";
      }
    });

    slider.addEventListener("pointermove", function (e) {
      if (e.pointerId !== activePointer || !mode) return;
      if (mode === "pending") {
        var dx = Math.abs(e.clientX - startX);
        var dy = Math.abs(e.clientY - startY);
        if (dx > 6 && dx > dy) {
          mode = "drag";
          capture(e);
        } else if (dy > 6) {
          mode = null; // vertical swipe: leave it to the page
          return;
        } else {
          return;
        }
      }
      setPosition(percentFromEvent(e));
    });

    function endPointer(e) {
      if (e.pointerId !== activePointer) return;
      if (e.type === "pointerup" && mode === "pending") setPosition(percentFromEvent(e));
      mode = null;
      activePointer = null;
    }
    slider.addEventListener("pointerup", endPointer);
    slider.addEventListener("pointercancel", endPointer);

    handle.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowLeft") next = position - 5;
      else if (e.key === "ArrowRight") next = position + 5;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = 100;
      if (next !== null) {
        setPosition(next);
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
    var tabs = Array.prototype.slice.call(wrap.querySelectorAll("[data-carousel-goto]"));
    var cards = Array.prototype.slice.call(carousel.children);
    var dots = [];

    function offsetFor(card) {
      var cardRect = card.getBoundingClientRect();
      var railRect = carousel.getBoundingClientRect();
      var left = cardRect.left - railRect.left + carousel.scrollLeft;
      return left - (carousel.clientWidth - cardRect.width) / 2;
    }

    function goTo(index, smooth) {
      var card = cards[index];
      if (!card) return;
      carousel.scrollTo({
        left: offsetFor(card),
        behavior: smooth && !reduceMotion ? "smooth" : "auto"
      });
    }
    carousel.carouselGoTo = goTo;

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
        dot.addEventListener("click", function () { goTo(i, true); });
        dotsWrap.appendChild(dot);
        dots.push(dot);
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        goTo(parseInt(tab.getAttribute("data-carousel-goto"), 10), true);
      });
    });

    if (!dots.length && !tabs.length) return;

    var railTicking = false;
    function updateActive() {
      railTicking = false;
      var center = carousel.scrollLeft + carousel.clientWidth / 2;
      var railLeft = carousel.getBoundingClientRect().left;
      var closest = 0;
      var closestDist = Infinity;
      cards.forEach(function (card, i) {
        var rect = card.getBoundingClientRect();
        var cardCenter = rect.left - railLeft + carousel.scrollLeft + rect.width / 2;
        var dist = Math.abs(cardCenter - center);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });
      dots.forEach(function (d, i) { d.classList.toggle("is-active", i === closest); });
      tabs.forEach(function (t) {
        var active = parseInt(t.getAttribute("data-carousel-goto"), 10) === closest;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }
    carousel.addEventListener("scroll", function () {
      if (!railTicking) {
        railTicking = true;
        window.requestAnimationFrame(updateActive);
      }
    }, { passive: true });

    var start = parseInt(carousel.getAttribute("data-carousel-start"), 10);
    function centerStart() {
      if (!isNaN(start)) goTo(start, false);
      updateActive();
    }
    centerStart();
    window.addEventListener("load", centerStart);
  });

  /* ---------- Payback sum ---------- */
  var numberWords = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  document.querySelectorAll("[data-payback]").forEach(function (box) {
    var out = box.querySelector(".payback__out");
    var chips = Array.prototype.slice.call(box.querySelectorAll("[data-job]"));
    var price = foundingOpen ? 990 : 1490;
    if (!out || !chips.length) return;

    function money(n) {
      return "$" + n.toLocaleString("en-AU");
    }

    function render(jobValue) {
      var text;
      if (jobValue >= price * 2) {
        var times = Math.floor(jobValue / price);
        var timesText = times === 2 ? "twice" : (times <= 10 ? numberWords[times] : String(times)) + " times";
        text = "At " + money(jobValue) + " a job, one extra job pays for The First Call Package " + timesText + " over.";
      } else if (jobValue >= price) {
        text = "At " + money(jobValue) + " a job, one extra job covers The First Call Package.";
      } else {
        var jobs = Math.ceil(price / jobValue);
        text = "At " + money(jobValue) + " a job, " + (jobs <= 10 ? numberWords[jobs] : jobs) +
          " extra jobs pay for The First Call Package. After that, it's working for you.";
      }
      out.textContent = text;
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.setAttribute("aria-pressed", c === chip ? "true" : "false"); });
        render(parseInt(chip.getAttribute("data-job"), 10));
      });
    });

    var pressed = box.querySelector("[data-job][aria-pressed='true']") || chips[0];
    render(parseInt(pressed.getAttribute("data-job"), 10));
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
    var restartBtn = quiz.querySelector("[data-quiz-restart]");
    if (!steps.length || !resultEl) return;

    var answers = [];
    var tallies = {};
    var currentInfo = null;

    var tierInfo = {
      starter: {
        name: "The Starter Call",
        reason: "The basics done properly: findable, callable, nothing you don't need yet. AUD $590, one-off." +
          (foundingOpen
            ? " Worth knowing: while the founding price lasts, The First Call is only AUD $400 more, and includes a year of upkeep."
            : " Worth knowing: The First Call adds three pages, the reviews system and a year of upkeep."),
        cardIndex: 0
      },
      first: {
        name: "The First Call Package",
        reason: "A full site, a reviews system and a year of free upkeep. " +
          (foundingOpen ? "AUD $990 at the founding client price, AUD $1,490 once three sites are live." : "AUD $1,490, one-off.") +
          " It's the one I'd pick for most crews.",
        cardIndex: 1
      },
      every: {
        name: "The Every Call Package",
        reason: "Suburb pages and a month of social content do more of the work for you, across the suburbs you cover. AUD $2,490, one-off.",
        cardIndex: 2
      }
    };

    function focusQuietly(el) {
      if (!el) return;
      el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    }

    function showStep(index) {
      steps.forEach(function (step, i) { step.classList.toggle("is-active", i === index); });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
        dot.classList.toggle("is-done", i < index);
      });
    }

    function reset() {
      answers = [];
      tallies = { starter: 0, first: 0, every: 0 };
      currentInfo = null;
      resultEl.classList.remove("is-active");
      showStep(0);
    }

    function finish() {
      // Ties go to The First Call.
      var winner = "first";
      ["starter", "every"].forEach(function (tier) {
        if (tallies[tier] > tallies[winner]) winner = tier;
      });
      currentInfo = tierInfo[winner];

      steps.forEach(function (step) { step.classList.remove("is-active"); });
      dots.forEach(function (dot) {
        dot.classList.add("is-done");
        dot.classList.remove("is-active");
      });
      if (resultName) resultName.textContent = currentInfo.name;
      if (resultReason) resultReason.textContent = currentInfo.reason;
      resultEl.classList.add("is-active");

      if (waBtn) {
        var msg = waPrefix + "I did the quiz on your tradies page.\n" +
          "Crew: " + answers[0] + "\n" +
          "Website: " + answers[1] + "\n" +
          "Need: " + answers[2] + "\n" +
          "It suggested " + currentInfo.name + ".\n" +
          "Business name: ";
        waBtn.setAttribute("href", waHref(msg));
      }
      focusQuietly(resultName);
    }

    if (seeBtn) {
      seeBtn.addEventListener("click", function (e) {
        var carousel = document.querySelector(".pricing-carousel");
        var card = carousel && currentInfo ? carousel.children[currentInfo.cardIndex] : null;
        if (!card) return;
        e.preventDefault();
        card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        if (carousel.carouselGoTo) carousel.carouselGoTo(currentInfo.cardIndex, true);
        card.classList.add("is-highlighted");
        window.setTimeout(function () { card.classList.remove("is-highlighted"); }, 2300);
      });
    }

    if (restartBtn) {
      restartBtn.addEventListener("click", function () {
        reset();
        focusQuietly(steps[0].querySelector(".quiz__question"));
      });
    }

    steps.forEach(function (step, i) {
      step.querySelectorAll(".quiz__option").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var tier = btn.getAttribute("data-tier");
          tallies[tier] = (tallies[tier] || 0) + 1;
          answers[i] = btn.textContent.trim();
          if (i < steps.length - 1) {
            showStep(i + 1);
            focusQuietly(steps[i + 1].querySelector(".quiz__question"));
          } else {
            finish();
          }
        });
      });
    });

    reset();
  });
})();

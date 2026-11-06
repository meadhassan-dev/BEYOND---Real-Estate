/* ==========================================================================
   BEYOND Real Estate — Corporate Profile 2026
   Navigation, scroll behaviour and reveal animations.
   ========================================================================== */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var body = doc.body;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var smallScreen =
    window.matchMedia("(max-width: 1024px)").matches || !finePointer;

  root.classList.add("js");

  /* ----------------------------------------------------------------------
     Header state + scroll progress
     ---------------------------------------------------------------------- */
  var header = doc.getElementById("site-header");
  var progress = doc.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  body.appendChild(progress);

  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset || root.scrollTop;
    var max = doc.documentElement.scrollHeight - window.innerHeight;

    if (header) {
      header.classList.toggle("is-scrolled", y > 12);
    }

    if (progress && !smallScreen) {
      progress.style.width = (max > 0 ? Math.min(y / max, 1) * 100 : 0) + "%";
    }

    ticking = false;
  }

  function requestScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }

  window.addEventListener("scroll", requestScroll, { passive: true });
  onScroll();

  /* ----------------------------------------------------------------------
     Mobile navigation
     ---------------------------------------------------------------------- */
  var navToggle = doc.querySelector(".nav-toggle");
  var siteNav = doc.getElementById("site-nav");

  function closeDropdowns() {
    doc.querySelectorAll(".has-dropdown.is-open").forEach(function (item) {
      item.classList.remove("is-open");
      var trigger = item.querySelector(".nav-trigger");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    });
  }

  function setNav(open) {
    if (!siteNav || !navToggle) return;
    siteNav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    body.classList.toggle("no-scroll", open);
    if (!open) closeDropdowns();
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      setNav(!siteNav.classList.contains("is-open"));
    });
  }

  /* ----------------------------------------------------------------------
     Dropdown triggers (click / keyboard). Hover is handled in CSS.
     ---------------------------------------------------------------------- */
  doc.querySelectorAll(".nav-trigger").forEach(function (trigger) {
    trigger.addEventListener("click", function (event) {
      event.preventDefault();
      var item = trigger.closest(".has-dropdown");
      if (!item) return;

      var willOpen = !item.classList.contains("is-open");

      doc.querySelectorAll(".has-dropdown.is-open").forEach(function (other) {
        if (other !== item) {
          other.classList.remove("is-open");
          var otherTrigger = other.querySelector(".nav-trigger");
          if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
        }
      });

      item.classList.toggle("is-open", willOpen);
      trigger.setAttribute("aria-expanded", willOpen ? "true" : "false");
    });
  });

  doc.addEventListener("click", function (event) {
    if (!event.target.closest(".has-dropdown")) {
      closeDropdowns();
    }
  });

  doc.addEventListener("keydown", function (event) {
    if (event.key !== "Escape" && event.key !== "Esc") return;
    closeDropdowns();
    if (siteNav && siteNav.classList.contains("is-open")) {
      setNav(false);
      if (navToggle) navToggle.focus();
    }
  });

  /* Close the mobile panel when a destination is chosen. */
  doc.querySelectorAll('.site-nav a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function () {
      if (siteNav && siteNav.classList.contains("is-open")) {
        setNav(false);
      }
      closeDropdowns();
    });
  });

  var desktopQuery = window.matchMedia("(min-width: 1025px)");
  function handleWidthChange(event) {
    if (event.matches && siteNav && siteNav.classList.contains("is-open")) {
      setNav(false);
    }
  }
  if (desktopQuery.addEventListener) {
    desktopQuery.addEventListener("change", handleWidthChange);
  } else if (desktopQuery.addListener) {
    desktopQuery.addListener(handleWidthChange);
  }

  /* ----------------------------------------------------------------------
     Active section highlighting
     ---------------------------------------------------------------------- */
  var navLinks = Array.prototype.slice.call(
    doc.querySelectorAll('.site-nav a[href^="#"]')
  );

  function setActiveSection(id) {
    navLinks.forEach(function (link) {
      link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
    });

    doc.querySelectorAll(".nav-trigger").forEach(function (trigger) {
      trigger.classList.remove("is-active");
    });

    var activeLink = navLinks.filter(function (link) {
      return link.getAttribute("href") === "#" + id;
    })[0];

    if (activeLink) {
      var parentItem = activeLink.closest(".has-dropdown");
      if (parentItem) {
        var parentTrigger = parentItem.querySelector(".nav-trigger");
        if (parentTrigger) parentTrigger.classList.add("is-active");
      }
    }
  }

  var sections = Array.prototype.slice.call(
    doc.querySelectorAll("main section[id]")
  );

  if ("IntersectionObserver" in window && sections.length) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-42% 0px -52% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  /* ----------------------------------------------------------------------
     Reveal-on-scroll
     ---------------------------------------------------------------------- */
  function revealTargets() {
    var targets = [];

    doc.querySelectorAll(".hero").forEach(function (hero) {
      var copy = hero.querySelector(".hero-copy");
      if (copy) {
        Array.prototype.forEach.call(copy.children, function (child) {
          targets.push(child);
        });
      }
      var media = hero.querySelector(".hero-media");
      if (media) targets.push(media);
    });

    doc.querySelectorAll(".section").forEach(function (section) {
      var copy = section.querySelector(".contact-copy");

      if (copy) {
        var contactMedia = section.querySelector(".contact-media");
        if (contactMedia) targets.push(contactMedia);
        Array.prototype.forEach.call(copy.children, function (child) {
          targets.push(child);
        });
        return;
      }

      var wrap = section.querySelector(".wrap");
      if (!wrap) return;

      Array.prototype.forEach.call(wrap.children, function (child) {
        if (child.classList.contains("section-footer")) return;
        targets.push(child);
      });
    });

    return targets;
  }

  if (!reduceMotion) {
    var targets = revealTargets();
    var stagger = smallScreen ? 28 : 45;
    var staggerMax = smallScreen ? 140 : 260;

    targets.forEach(function (element, index) {
      element.classList.add("reveal");

      if (
        element.classList.contains("hero-media") ||
        element.classList.contains("media-frame") ||
        element.classList.contains("contact-media") ||
        element.classList.contains("project-media")
      ) {
        element.classList.add("reveal--media");
      }

      var delay = Math.min(index * stagger, staggerMax);
      element.style.setProperty("--reveal-delay", delay + "ms");
    });

    if ("IntersectionObserver" in window) {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -7% 0px", threshold: 0.08 }
      );

      targets.forEach(function (element) {
        revealObserver.observe(element);
      });
    } else {
      targets.forEach(function (element) {
        element.classList.add("is-visible");
      });
    }
  }
  /* ----------------------------------------------------------------------
     Photo parallax
     A slow counter-scroll drift inside each clipped photo frame.
     ---------------------------------------------------------------------- */
  if (!reduceMotion && !smallScreen) {
    var parallaxFrames = doc.querySelectorAll(
      ".split--media-left .media-frame, .project-media, .media-frame--wide, .contact-media"
    );
    var parallaxItems = [];
    var parallaxTicking = false;

    Array.prototype.forEach.call(parallaxFrames, function (frame) {
      var img = frame.querySelector("img");
      if (img) {
        parallaxItems.push({ frame: frame, img: img });
      }
    });

    if (parallaxItems.length) {
      root.classList.add("has-media-motion");

      var updateParallax = function () {
        var viewport = window.innerHeight || root.clientHeight;

        parallaxItems.forEach(function (item) {
          var rect = item.frame.getBoundingClientRect();

          if (rect.bottom < -80 || rect.top > viewport + 80) return;

          var distance = rect.top + rect.height / 2 - viewport / 2;
          var limit = Math.min(rect.height * 0.022, 18);
          var shift = Math.max(-limit, Math.min(limit, distance * -0.035));

          item.img.style.transform =
            "translate3d(0, " + shift.toFixed(2) + "px, 0)";
        });

        parallaxTicking = false;
      };

      var requestParallax = function () {
        if (!parallaxTicking) {
          parallaxTicking = true;
          window.requestAnimationFrame(updateParallax);
        }
      };

      window.addEventListener("scroll", requestParallax, { passive: true });
      window.addEventListener("resize", requestParallax);
      requestParallax();
    }

    /* The hero portrait leans gently towards the pointer. */
    var heroMedia = doc.querySelector(".hero-media");
    var heroImage = heroMedia ? heroMedia.querySelector("img") : null;

    if (heroMedia && heroImage) {
      heroMedia.addEventListener(
        "pointermove",
        function (event) {
          if (event.pointerType && event.pointerType !== "mouse") return;

          var rect = heroMedia.getBoundingClientRect();
          var x = (event.clientX - rect.left) / rect.width - 0.5;
          var y = (event.clientY - rect.top) / rect.height - 0.5;
          var rotY = (x * 5.6).toFixed(2);
          var rotX = (-y * 5.6).toFixed(2);

          heroImage.style.transform =
            "perspective(900px) rotateX(" +
            rotX +
            "deg) rotateY(" +
            rotY +
            "deg)";
        },
        { passive: true }
      );

      heroMedia.addEventListener("pointerleave", function () {
        heroImage.style.transform = "";
      });
    }
  }

  /* ----------------------------------------------------------------------
     Animated display text
     Headings and pull-quotes are split into masked words (or characters
     for the wordmarks) and rise into place when they enter the viewport.
     ---------------------------------------------------------------------- */
  if (!reduceMotion) {
    var textSelector = [
      ".hero-wordmark",
      ".hero-tagline",
      ".section-title",
      ".pull-line",
      ".closing-line",
      ".highlight-line",
      ".big-quote p",
      ".formula",
      ".ambition p",
      ".project-body h3",
      ".contact-brand .wordmark",
      ".contact-cta"
    ].join(",");

    var textTargets = Array.prototype.slice.call(
      doc.querySelectorAll(textSelector)
    );

    function splitText(element, mode) {
      var wordIndex = 0;

      function makeWord(token) {
        var outer = doc.createElement("span");
        var inner = doc.createElement("span");
        outer.className = "anim-word";
        inner.className = "anim-word-inner";
        inner.textContent = token;
        outer.style.setProperty("--word-index", Math.min(wordIndex, 16));
        outer.appendChild(inner);
        wordIndex += 1;
        return outer;
      }

      function splitNode(node) {
        var text = node.nodeValue;
        var fragment = doc.createDocumentFragment();
        var tokens;

        if (mode === "chars") {
          tokens = Array.prototype.slice.call(text);
        } else {
          tokens = text.split(/(\s+)/);
        }

        tokens.forEach(function (token) {
          if (!token) return;

          if (mode === "chars") {
            if (/\s/.test(token)) {
              fragment.appendChild(doc.createTextNode(token));
            } else {
              fragment.appendChild(makeWord(token));
            }
            return;
          }

          if (/^\s+$/.test(token)) {
            fragment.appendChild(doc.createTextNode(" "));
          } else {
            fragment.appendChild(makeWord(token));
          }
        });

        node.parentNode.replaceChild(fragment, node);
      }

      function walk(node) {
        if (node.nodeType === 3) {
          splitNode(node);
          return;
        }
        if (node.nodeType !== 1 || node.tagName === "BR") return;
        Array.prototype.slice.call(node.childNodes).forEach(walk);
      }

      Array.prototype.slice.call(element.childNodes).forEach(walk);
      element.classList.add("anim-text");
      if (mode === "chars") element.classList.add("anim-text--chars");
    }

    try {
      textTargets.forEach(function (element) {
        var isWordmark =
          element.classList.contains("hero-wordmark") ||
          element.classList.contains("wordmark");
        splitText(element, isWordmark ? "chars" : "words");
      });

      if ("IntersectionObserver" in window) {
        var textObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-inview");
                textObserver.unobserve(entry.target);
              }
            });
          },
          { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
        );

        textTargets.forEach(function (element) {
          textObserver.observe(element);
        });
      } else {
        textTargets.forEach(function (element) {
          element.classList.add("is-inview");
        });
      }
    } catch (error) {
      textTargets.forEach(function (element) {
        element.classList.add("is-inview");
      });
    }
  }
})();

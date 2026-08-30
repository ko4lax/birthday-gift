/* birthday gift — interactions */
(function () {
  "use strict";

  /* ============ gallery: build polaroids ============ */
  var CAPTIONS = [
    "you, being cute",
    "that one afternoon ☀️",
    "snack squad 🍜",
    "my favorite view",
    "adventures 🛵",
    "matching energy ⚡",
    "the laugh I love",
    "cozy era 🧸",
    "us. always us. 💗"
  ];
  var MAX_PHOTOS = 9;

  var grid = document.getElementById("polaroidGrid");
  var found = 0;
  for (var i = 1; i <= MAX_PHOTOS; i++) {
    var probe = new Image();
    /* eslint-disable no-loop-func */
    (function (idx) {
      probe.onload = function () {
        buildCard(idx);
      };
      probe.onerror = function () {
        /* photo not present — skip silently */
      };
      probe.src = "photos/photo-" + idx + ".jpg";
    })(i);
  }

  function buildCard(idx) {
    found++;
    var card = document.createElement("figure");
    card.className = "polaroid";
    card.style.setProperty("--i", found - 1);

    var img = document.createElement("img");
    img.src = "photos/photo-" + idx + ".jpg";
    img.alt = "memory " + idx;
    img.loading = "lazy";

    var cap = document.createElement("figcaption");
    cap.className = "polaroid-caption";
    cap.textContent = CAPTIONS[(idx - 1) % CAPTIONS.length];

    card.appendChild(img);
    card.appendChild(cap);
    card.addEventListener("click", function () {
      openLightbox(img.src, cap.textContent);
    });
    grid.appendChild(card);

    /* trigger entrance animation after append */
    requestAnimationFrame(function () {
      card.style.opacity = "";
    });
  }

  /* ============ lightbox ============ */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");

  function openLightbox(src, caption) {
    lightboxImg.src = src;
    lightboxImg.alt = caption || "memory, enlarged";
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
  }
  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
  }
  lightbox.addEventListener("click", closeLightbox);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
  });

  /* ============ envelope / letter ============ */
  var envelope = document.getElementById("envelope");
  var letterFull = document.getElementById("letterFull");
  var letterClose = document.getElementById("letterClose");
  var opened = false;

  envelope.addEventListener("click", function () {
    if (envelope.classList.contains("open")) return;
    envelope.classList.add("open");
    opened = true;
    /* wait for flap + letter animation, then reveal letter */
    setTimeout(function () {
      letterFull.classList.add("visible");
      letterFull.setAttribute("aria-hidden", "false");
      letterFull.scrollIntoView({ behavior: "smooth", block: "start" });
      burst(160);
    }, 900);
  });

  /* keyboard accessibility */
  envelope.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      envelope.click();
    }
  });

  letterClose.addEventListener("click", function () {
    letterFull.classList.remove("visible");
    letterFull.setAttribute("aria-hidden", "true");
    envelope.classList.remove("open");
    opened = false;
    envelope.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(function () {
      burst(120);
    }, 500);
  });

  /* ============ confetti ============ */
  var canvas = document.getElementById("confetti");
  var ctx = canvas.getContext("2d");
  var pieces = [];
  var colors = ["#ff8fb2", "#f56a97", "#c9b6ff", "#a8e6cf", "#ffe59d", "#ffc29e", "#b892ff"];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  function spawn(n) {
    for (var i = 0; i < n; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.5,
        w: 6 + Math.random() * 8,
        h: 8 + Math.random() * 10,
        vy: 1.8 + Math.random() * 2.6,
        vx: -1.2 + Math.random() * 2.4,
        rot: Math.random() * Math.PI,
        vr: -0.08 + Math.random() * 0.16,
        color: colors[(Math.random() * colors.length) | 0],
        shape: Math.random() < 0.25 ? "circle" : "rect"
      });
    }
    if (pieces.length > 400) pieces = pieces.slice(-400);
  }
  var burst = spawn;

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = pieces.length - 1; i >= 0; i--) {
      var p = pieces[i];
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      if (p.y > canvas.height + 30) {
        pieces.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    }
    requestAnimationFrame(tick);
  }
  tick();

  /* welcome shower */
  setTimeout(function () {
    spawn(140);
  }, 400);

  /* gentle top-up while open (stops after 40s so it doesn't run forever) */
  var topups = 0;
  var topupTimer = setInterval(function () {
    topups++;
    if (topups > 8 || document.hidden) {
      if (topups > 8) clearInterval(topupTimer);
      return;
    }
    spawn(6);
  }, 5000);
})();

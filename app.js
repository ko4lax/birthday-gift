/* birthday gift — interactions */
(function () {
  "use strict";

  /* ============ photos inside the letter ============ */
  var MAX_PHOTOS = 4;
  var EXTS = [".png", ".jpg", ".jpeg", ".webp"];

  for (var i = 1; i <= MAX_PHOTOS; i++) {
    tryExt(i, 0);
  }

  function tryExt(idx, extI) {
    if (extI >= EXTS.length) return; /* photo not present — slot stays empty */
    var src = "photos/photo-" + idx + EXTS[extI];
    var probe = new Image();
    probe.onload = function () { fillSlot(idx, src); };
    probe.onerror = function () { tryExt(idx, extI + 1); };
    probe.src = src;
  }

  function fillSlot(idx, src) {
    var slot = document.querySelector('.letter-photo[data-slot="' + idx + '"]');
    if (!slot) return;

    var wrap = document.createElement("figure");
    wrap.className = "letter-photo-inner";

    var img = document.createElement("img");
    img.src = src;
    img.alt = "photo " + idx;
    img.loading = "lazy";

    var tape = document.createElement("span");
    tape.className = "photo-tape";
    tape.setAttribute("aria-hidden", "true");

    wrap.appendChild(tape);
    wrap.appendChild(img);
    slot.appendChild(wrap);
  }

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
  var colors = ["#e49c84", "#cc9c84", "#d9a866", "#c97a5e", "#f2e8e2", "#b8863f", "#f0c9b4"];

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

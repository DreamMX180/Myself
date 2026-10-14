(function () {
  var canvas = document.querySelector("canvas.hero-wave");
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext("2d", { alpha: true });
  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduce = motionQuery.matches;
  var onScreen = true;
  var running = false;
  var raf = 0;
  var image = new Image();

  image.decoding = "async";
  image.src = "assets/wave.png";
  image.onload = function () {
    paint(0);
    sync();
  };

  function resize() {
    var rect = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var width = Math.max(1, Math.round(rect.width * dpr));
    var height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function drawStill() {
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  }

  function drawMoving(now) {
    var width = canvas.width;
    var height = canvas.height;
    var driftX = Math.sin(now * 0.00072) * 16;
    var driftY = Math.sin(now * 0.00105 + 1.2) * 5;
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, driftX, driftY, width, height);

    ctx.globalCompositeOperation = "source-atop";
    var sweep = ((now / 5400) % 1) * width;
    var gradient = ctx.createLinearGradient(sweep - 280, 0, sweep + 280, 0);
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(0.5, "rgba(255,255,255,0.28)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(sweep - 280, 0, 560, height);

    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(image, 0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";
  }

  function paint(now) {
    if (!image.complete || !image.naturalWidth) return;
    resize();
    if (reduce) drawStill();
    else drawMoving(now || 0);
  }

  function frame(now) {
    if (!running) return;
    paint(now);
    if (running) raf = window.requestAnimationFrame(frame);
  }

  function sync() {
    var should = !reduce && onScreen && !document.hidden && image.complete && image.naturalWidth;
    if (should && !running) {
      running = true;
      raf = window.requestAnimationFrame(frame);
    } else if (!should && running) {
      running = false;
      window.cancelAnimationFrame(raf);
    }
  }

  if ("IntersectionObserver" in window) {
    var hero = canvas.closest(".hero");
    if (hero) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        sync();
      }).observe(hero);
    }
  }

  document.addEventListener("visibilitychange", sync);
  window.addEventListener("resize", function () {
    if (!running) paint(performance.now());
  });
  if (motionQuery.addEventListener) {
    motionQuery.addEventListener("change", function () {
      reduce = motionQuery.matches;
      paint(0);
      sync();
    });
  }
  if ("ResizeObserver" in window) {
    new ResizeObserver(function () {
      if (!running) paint(performance.now());
    }).observe(canvas);
  }
})();

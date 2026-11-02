(function () {
  var NS = "http://www.w3.org/2000/svg";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Ticker tape ----------
  // Each mark on the tape links to the part of the page it describes.
  var MARKS = [
    ["JUN 2022", "QUANT MODEL", "#quant"],
    ["APR 2023", "HACKATHON 3RD", "#ledger"],
    ["APR 2024", "HACKATHON 2ND", "#ledger"],
    ["JUN 2024", "HPC INSTITUTE", "#ledger"],
    ["AUG 2024", "STOCK PREDICTION — 465 TESTS", "#stock"],
    ["DEC 2024", "OPTIONS HEATMAP", "#options"],
    ["MAY 2026", "B.S. CS", "#ledger"],
    ["2028", "M.S. CS — DREXEL", "#ledger"]
  ];
  var textPath = document.getElementById("tape-text");
  if (textPath) {
    var REPEAT = 3;
    function add(text, cls, target) {
      var t = document.createElementNS(NS, "tspan");
      t.textContent = text;
      if (cls) t.setAttribute("class", cls);
      if (target) {
        t.addEventListener("click", function () {
          var el = document.querySelector(target);
          if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
        });
      }
      textPath.appendChild(t);
    }
    for (var k = 0; k < REPEAT; k++) {
      add("YZ  —  ");
      MARKS.forEach(function (m) {
        add(m[0] + "  ");
        add(m[1], "mark", m[2]);
        add("  ▲   ");
      });
    }

    if (!reduce) {
      var cycle = 0, offset = 0, hovered = false, paused = false, last = 0;
      var toggle = document.getElementById("tape-toggle");
      toggle.hidden = false;
      toggle.addEventListener("click", function () {
        paused = !paused;
        toggle.textContent = paused ? "Resume tape" : "Pause tape";
      });
      var tape = document.getElementById("tape");
      tape.addEventListener("mouseenter", function () { hovered = true; });
      tape.addEventListener("mouseleave", function () { hovered = false; });
      (function roll(now) {
        if (!cycle) cycle = textPath.getComputedTextLength() / REPEAT;
        var dt = last ? Math.min(64, now - last) : 0;
        last = now;
        if (!paused && !hovered && cycle) {
          offset -= dt * 0.035;
          if (offset <= -cycle) offset += cycle;
          textPath.setAttribute("startOffset", offset.toFixed(1));
        }
        requestAnimationFrame(roll);
      })(0);
    }
  }

  // ---------- Guilloche seal in the footer ----------
  var seal = document.getElementById("seal");
  if (seal) {
    var out = '<defs><path id="seal-ring" d="M0 0 m-214 0 a214 214 0 1 1 428 0 a214 214 0 1 1 -428 0"/></defs>';
    function band(R, amp, n, copies, color, w) {
      var s = "";
      for (var k = 0; k < copies; k++) {
        var ph = (k / copies) * Math.PI * 2, d = "";
        for (var i = 0; i <= 720; i++) {
          var t = (i / 720) * Math.PI * 2;
          var r = R + amp * Math.sin(n * t + ph) * Math.cos((t * n) / 2 + k * 0.08);
          d += (i ? "L" : "M") + (r * Math.cos(t)).toFixed(1) + " " + (r * Math.sin(t)).toFixed(1);
        }
        s += '<path d="' + d + 'Z" fill="none" stroke="' + color + '" stroke-width="' + w + '" opacity=".7"/>';
      }
      return s;
    }
    out += band(182, 26, 18, 22, "#2c3e8c", 0.6);
    out += band(130, 20, 12, 18, "#3d7a6a", 0.6);
    out += band(92, 12, 24, 14, "#2c3e8c", 0.5);
    out += '<circle r="238" fill="none" stroke="#141414" stroke-width="2"/>';
    out += '<text font-family="JetBrains Mono" font-size="15" letter-spacing="5" fill="#141414"><textPath href="#seal-ring">SOFTWARE — DATA — QUANT RESEARCH — PHILADELPHIA — MMXXVI —</textPath></text>';
    out += '<circle r="74" fill="#f7f6f2" stroke="#141414" stroke-width="2"/>';
    out += '<text y="20" text-anchor="middle" font-family="Cormorant Garamond" font-style="italic" font-size="66" fill="#141414">YZ</text>';
    seal.innerHTML = out;
  }

  // ---------- Gentle reveal on scroll ----------
  if (!reduce && "IntersectionObserver" in window) {
    var items = document.querySelectorAll(".statement, .marginalia, .entry, .rows > li, .tools div, .contact > *");
    document.documentElement.classList.add("js-reveal");
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        seen.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el) { el.classList.add("reveal"); seen.observe(el); });
  }
})();

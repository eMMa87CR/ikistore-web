(function () {
  "use strict";

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  // Menú móvil
  function initNav() {
    var btn = $(".menu-toggle");
    var nav = $("#navegacion");
    if (!btn || !nav) return;
    function close() { nav.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); }
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      nav.classList.toggle("is-open", !open);
      btn.setAttribute("aria-expanded", String(!open));
    });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") { close(); btn.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".site-header")) close();
    });
    matchMedia("(min-width: 720px)").addEventListener("change", close);
  }

  // Scroll suave nativo para los anclajes
  function initAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var offset = 64;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.pageYOffset - offset,
        behavior: reduced ? "auto" : "smooth"
      });
      if (history.replaceState) history.replaceState(null, "", id);
    });
  }

  // Revelado al hacer scroll: umbral bajo y red de seguridad a los 6 s
  function initReveals() {
    var items = $$(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });
    items.forEach(function (el) { io.observe(el); });
    setTimeout(function () {
      items.forEach(function (el) {
        if (!el.classList.contains("is-visible") && el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("is-visible");
        }
      });
    }, 6000);
  }

  // Coordenadas junto al cursor (solo mouse; oculto hasta el primer movimiento)
  function initCursorCoord() {
    var box = $("[data-cursor-coord]");
    if (!box || !fineHover) return;
    var first = false;
    window.addEventListener("mousemove", function (e) {
      box.style.transform = "translate3d(" + (e.clientX + 18) + "px," + (e.clientY + 18) + "px,0)";
      box.textContent = "[" + e.clientX + ", " + e.clientY + "]";
      if (!first) { first = true; box.classList.add("is-ready"); }
    }, { passive: true });
    document.addEventListener("mouseleave", function () { box.classList.remove("is-ready"); first = false; });
  }

  function boot() {
    document.documentElement.classList.add("has-js");
    safe(initNav, "initNav");
    safe(initAnchors, "initAnchors");
    safe(initReveals, "initReveals");
    safe(initCursorCoord, "initCursorCoord");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

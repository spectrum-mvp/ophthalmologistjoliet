/* Header — hamburger menu below 1100px. */
(function () {
  "use strict";
  var header = document.querySelector(".site-header");
  var btn = document.querySelector(".nav-burger");
  if (!header || !btn) return;

  function setOpen(open) {
    header.classList.toggle("nav-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  btn.addEventListener("click", function () { setOpen(!header.classList.contains("nav-open")); });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && header.classList.contains("nav-open")) { setOpen(false); btn.focus(); }
  });

  document.addEventListener("click", function (e) {
    if (header.classList.contains("nav-open") && !header.contains(e.target)) setOpen(false);
  });

  var wide = window.matchMedia("(min-width: 1101px)");
  function onWide() { if (wide.matches) setOpen(false); }
  if (wide.addEventListener) wide.addEventListener("change", onWide); else if (wide.addListener) wide.addListener(onWide);
})();

/* Main nav — Services dropdown. Keyboard, touch and mouse. */
(function () {
  "use strict";

  function items(wrap) { return wrap.querySelectorAll(".nav-menu a"); }

  function setOpen(wrap, open) {
    var btn = wrap.querySelector(".nav-toggle");
    var menu = wrap.querySelector(".nav-menu");
    if (!btn || !menu) return;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) { menu.removeAttribute("hidden"); wrap.classList.add("is-open"); }
    else { menu.setAttribute("hidden", ""); wrap.classList.remove("is-open"); }
  }

  function closeAll(except) {
    [].forEach.call(document.querySelectorAll(".has-menu"), function (w) {
      if (w !== except) setOpen(w, false);
    });
  }

  [].forEach.call(document.querySelectorAll(".has-menu"), function (wrap) {
    var btn = wrap.querySelector(".nav-toggle");
    if (!btn) return;
    setOpen(wrap, false);

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var open = btn.getAttribute("aria-expanded") === "true";
      closeAll(wrap);
      setOpen(wrap, !open);
    });

    btn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        closeAll(wrap); setOpen(wrap, true);
        var first = items(wrap)[0];
        if (first) first.focus();
      }
    });

    wrap.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { setOpen(wrap, false); btn.focus(); }
    });

    // Click-only on purpose: hover-to-open plus click-to-toggle fight each other
    // (the pointer opens the menu, then the click closes it), and touch has no hover.

    // close once focus leaves the whole group
    wrap.addEventListener("focusout", function (e) {
      if (!wrap.contains(e.relatedTarget)) setOpen(wrap, false);
    });
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest || !e.target.closest(".has-menu")) closeAll(null);
  });
})();

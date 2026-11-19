/* Our Doctors — bio modals. Progressive: cards and bios are in the HTML already. */
(function () {
  "use strict";
  var open = null, lastFocus = null;

  function show(dlg, trigger) {
    lastFocus = trigger || document.activeElement;
    open = dlg;
    if (typeof dlg.showModal === "function") {
      dlg.showModal();
    } else {                       // very old browsers: reveal inline
      dlg.setAttribute("open", "");
      dlg.classList.add("is-inline");
    }
    document.body.classList.add("modal-open");
    var c = dlg.querySelector("[data-close]");
    if (c) c.focus();
    dlg.scrollTop = 0;
    var inner = dlg.querySelector(".doc-modal-inner");
    if (inner) inner.scrollTop = 0;
  }

  function hide(dlg) {
    if (!dlg) return;
    if (typeof dlg.close === "function" && dlg.open) dlg.close();
    else dlg.removeAttribute("open");
    dlg.classList.remove("is-inline");
    document.body.classList.remove("modal-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    open = null;
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".doc-open") : null;
    if (btn) {
      var dlg = document.getElementById(btn.getAttribute("data-bio"));
      if (dlg) { e.preventDefault(); show(dlg, btn); }
      return;
    }
    if (e.target.closest && e.target.closest("[data-close]")) {
      hide(e.target.closest("dialog"));
      return;
    }
    // click on the backdrop (the dialog element itself, outside its inner panel)
    if (open && e.target === open) hide(open);
  });

  // native dialogs fire 'close' on Esc; keep body state in sync
  document.addEventListener("close", function (e) {
    if (e.target && e.target.classList && e.target.classList.contains("doc-modal")) {
      document.body.classList.remove("modal-open");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
      open = null;
    }
  }, true);

  // Esc fallback where <dialog> isn't native
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && open && typeof open.showModal !== "function") hide(open);
  });
})();

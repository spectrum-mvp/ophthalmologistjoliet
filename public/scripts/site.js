(function () {
  "use strict";

  document.getElementById("year").textContent = String(new Date().getFullYear());

  var parameters = new URLSearchParams(window.location.search);
  document.querySelectorAll("a[data-appointment]").forEach(function (link) {
    var url = new URL(link.href);
    new Set(parameters.keys()).forEach(function (key) {
      // Keep the scheduler's existing parameters, especially platform=spectrum.
      if (!url.searchParams.has(key)) {
        parameters.getAll(key).forEach(function (entry) {
          url.searchParams.append(key, entry);
        });
      }
    });
    link.href = url.href;
  });
})();

(function () {
  var buttons = Array.prototype.slice.call(
    document.querySelectorAll(".snap__open")
  );
  var dialog = document.getElementById("snap-dialog");
  if (!buttons.length || !dialog) return;

  var image = document.getElementById("snap-dialog-img");
  var indexEl = document.getElementById("snap-dialog-index");
  var captionEl = document.getElementById("snap-dialog-caption");
  var current = 0;
  var lastFocus = null;

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function show(index) {
    current = (index + buttons.length) % buttons.length;
    var button = buttons[current];
    var source = button.querySelector("img");
    image.src = source.getAttribute("src");
    image.alt = source.getAttribute("alt") || "";
    indexEl.textContent = pad(current + 1);
    captionEl.textContent = button.getAttribute("data-caption") || "";
  }

  function open(index) {
    lastFocus = document.activeElement;
    show(index);
    if (typeof dialog.showModal === "function" && !dialog.open) {
      dialog.showModal();
    }
  }

  function close() {
    if (dialog.open) dialog.close();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  buttons.forEach(function (button, index) {
    button.addEventListener("click", function () {
      open(index);
    });
  });

  dialog.querySelector("[data-close]").addEventListener("click", close);
  dialog.querySelector("[data-prev]").addEventListener("click", function () {
    show(current - 1);
  });
  dialog.querySelector("[data-next]").addEventListener("click", function () {
    show(current + 1);
  });

  dialog.addEventListener("cancel", function (event) {
    event.preventDefault();
    close();
  });

  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) close();
  });

  dialog.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      show(current + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      show(current - 1);
    }
  });
})();

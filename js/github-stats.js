(function () {
  var root = document.getElementById("github-stats");
  if (!root) return;

  var user = "bagariaraj23";
  var projectsEl = root.querySelector("[data-stat='projects']");
  var linesEl = root.querySelector("[data-stat='lines']");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var shown = { projects: null, lines: null };
  var scrambling = false;
  var lastStart = 0;

  function format(value) {
    return Number(value).toLocaleString("en-IN");
  }

  function jumble(template, progress) {
    var digits = [];
    var index;
    for (index = 0; index < template.length; index++) {
      if (template.charAt(index) >= "0" && template.charAt(index) <= "9") digits.push(index);
    }
    var settle = Math.max(0, (progress - 0.45) / 0.55);
    var locked = Math.floor(settle * (digits.length + 1));
    var text = "";
    var digitNumber = 0;
    for (index = 0; index < template.length; index++) {
      var character = template.charAt(index);
      if (character < "0" || character > "9") {
        text += character;
        continue;
      }
      if (digitNumber < locked) text += character;
      else text += String(Math.floor(Math.random() * 10));
      digitNumber += 1;
    }
    return text;
  }

  function writeFinal() {
    if (shown.projects != null) projectsEl.textContent = format(shown.projects);
    if (shown.lines != null) linesEl.textContent = format(shown.lines);
  }

  function inView() {
    var rect = root.getBoundingClientRect();
    return rect.bottom > 80 && rect.top < window.innerHeight - 40;
  }

  function scramble() {
    if (shown.projects == null && shown.lines == null) return;
    if (reduceMotion) {
      writeFinal();
      return;
    }
    if (scrambling || performance.now() - lastStart < 500) return;
    scrambling = true;
    lastStart = performance.now();
    var projectText = shown.projects == null ? projectsEl.textContent : format(shown.projects);
    var lineText = shown.lines == null ? linesEl.textContent : format(shown.lines);
    var start = performance.now();
    var duration = 1100;

    function tick(now) {
      var progress = Math.min(1, (now - start) / duration);
      if (shown.projects != null) projectsEl.textContent = jumble(projectText, progress);
      if (shown.lines != null) linesEl.textContent = jumble(lineText, progress);
      if (progress < 1) {
        requestAnimationFrame(tick);
        return;
      }
      writeFinal();
      scrambling = false;
    }

    requestAnimationFrame(tick);
  }

  function remember(key, value) {
    if (value == null || isNaN(value)) return false;
    var next = Math.max(0, Math.round(value));
    if (shown[key] === next) return false;
    shown[key] = next;
    return true;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (inView()) scramble();
    },
    { passive: true }
  );

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) scramble();
      },
      { threshold: 0.5 }
    );
    observer.observe(root);
  }

  function liveProjectCount() {
    var page = 1;
    var repos = [];

    function next() {
      return fetch(
        "https://api.github.com/users/" +
          user +
          "/repos?per_page=100&type=owner&page=" +
          page,
        { headers: { Accept: "application/vnd.github+json" } }
      ).then(function (response) {
        if (!response.ok) throw new Error("github");
        return response.json();
      }).then(function (batch) {
        if (!batch.length) return repos;
        repos = repos.concat(batch);
        if (batch.length < 100) return repos;
        page += 1;
        return next();
      });
    }

    return next().then(function (list) {
      return list.filter(function (repo) {
        return !repo.fork && repo.size > 0 && repo.name !== user;
      }).length;
    });
  }

  fetch("./data/github-stats.json", { cache: "no-cache" })
    .then(function (response) {
      if (!response.ok) throw new Error("stats");
      return response.json();
    })
    .then(function (stats) {
      remember("projects", stats.projects);
      remember("lines", stats.lines);
      scramble();
    })
    .catch(function () {
      projectsEl.textContent = "—";
      linesEl.textContent = "—";
    })
    .then(function () {
      return liveProjectCount();
    })
    .then(function (count) {
      if (remember("projects", count)) scramble();
    })
    .catch(function () {});
})();

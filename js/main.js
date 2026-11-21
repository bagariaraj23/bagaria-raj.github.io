$(function () {
  const body = document.querySelector("body");
  const toggle = document.getElementById("toggle");
  const input = document.getElementById("switch");
  const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
  let userChose = false;

  function setNight(night) {
    body.classList.toggle("night", night);
    document.documentElement.classList.toggle("night", night);
    input.checked = night;
  }

  setNight(colorScheme.matches);

  colorScheme.addEventListener("change", function (event) {
    if (!userChose) setNight(event.matches);
  });

  toggle.addEventListener("click", function () {
    userChose = true;
    const night = !input.checked;
    body.classList.toggle("night", night);
    document.documentElement.classList.toggle("night", night);
  });

  const intro = document.querySelector(".intro");
  const introHeight = intro ? intro.offsetHeight : 420;
  const topButton = document.getElementById("top-button");
  const $topButton = $("#top-button");

  window.addEventListener(
    "scroll",
    function () {
      if (window.scrollY > introHeight) {
        $topButton.fadeIn();
      } else {
        $topButton.fadeOut();
      }
    },
    false
  );

  topButton.addEventListener("click", function () {
    $("html, body").animate({ scrollTop: 0 }, 500);
  });

  const hand = document.querySelector(".emoji.wave-hand");

  if (hand) {
    function waveOnLoad() {
      hand.classList.add("wave");
      setTimeout(function () {
        hand.classList.remove("wave");
      }, 2000);
    }

    setTimeout(function () {
      waveOnLoad();
    }, 1000);

    hand.addEventListener("mouseover", function () {
      hand.classList.add("wave");
    });

    hand.addEventListener("mouseout", function () {
      hand.classList.remove("wave");
    });
  }

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!reduceMotion && window.ScrollReveal) {
    window.sr = ScrollReveal({
      reset: false,
      distance: "32px",
      duration: 800,
      easing: "cubic-bezier(.694,0,.335,1)",
      opacity: 0,
      scale: 1,
      viewFactor: 0.15,
      mobile: true,
    });

    sr.reveal(".section__title", {
      origin: "left",
      distance: "24px",
      duration: 650,
    });

    sr.reveal(
      ".background .section__content > p, .background .section__content > a",
      { origin: "bottom", interval: 90 }
    );

    sr.reveal(".skillz__category", { origin: "bottom", interval: 90 });
    sr.reveal(".job", { origin: "bottom", interval: 80, viewFactor: 0.12 });
    sr.reveal(".project", { origin: "bottom", interval: 90, viewFactor: 0.12 });
    sr.reveal(".section__content ul.plain li", {
      origin: "bottom",
      interval: 80,
    });
    sr.reveal(".My_timeline .timeline", {
      origin: "bottom",
      distance: "24px",
      viewFactor: 0.2,
    });
    sr.reveal(".footer", { origin: "bottom", distance: "16px", viewFactor: 0.3 });
    sr.reveal(".snaps-lead__copy", { origin: "bottom", distance: "20px" });
    sr.reveal(".snap", { origin: "bottom", interval: 70, viewFactor: 0.08 });
  }

  const timeline = document.querySelector(".timeline");
  if (timeline) {
    const updateTimelineEnds = function () {
      const max = timeline.scrollWidth - timeline.clientWidth;
      timeline.classList.toggle("can-scroll-prev", timeline.scrollLeft > 2);
      timeline.classList.toggle("can-scroll-next", max > 2 && timeline.scrollLeft < max - 2);
    };

    updateTimelineEnds();
    timeline.addEventListener("scroll", updateTimelineEnds, { passive: true });
    window.addEventListener("resize", updateTimelineEnds);

    timeline.addEventListener(
      "wheel",
      function (event) {
        const max = timeline.scrollWidth - timeline.clientWidth;
        if (max <= 0) return;
        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
        const atStart = timeline.scrollLeft <= 0;
        const atEnd = timeline.scrollLeft >= max - 1;
        if ((event.deltaY < 0 && atStart) || (event.deltaY > 0 && atEnd)) return;
        event.preventDefault();
        timeline.scrollLeft = Math.max(
          0,
          Math.min(max, timeline.scrollLeft + event.deltaY)
        );
      },
      { passive: false }
    );
  }
});

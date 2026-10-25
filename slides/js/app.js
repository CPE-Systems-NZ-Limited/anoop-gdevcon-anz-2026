(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // When served from GitHub Pages, point the call-to-action at the hosting repo automatically.
  (function setRepoLink() {
    var link = document.getElementById('repo-link');
    var host = window.location.hostname;
    if (!link || !/\.github\.io$/.test(host)) return;
    var owner = host.replace(/\.github\.io$/, '');
    var repo = window.location.pathname.split('/').filter(Boolean)[0];
    if (!repo) return;
    var url = 'https://github.com/' + owner + '/' + repo;
    link.href = url;
    link.textContent = url.replace(/^https:\/\//, '');
  })();

  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'strict',
    htmlLabels: false,
    fontFamily: '"Source Sans Pro", "Segoe UI", Helvetica, Arial, sans-serif',
    themeVariables: {
      darkMode: true,
      background: '#0b1020',
      primaryColor: '#1d2a55',
      primaryTextColor: '#e8ecf6',
      primaryBorderColor: '#ffd23f',
      lineColor: '#9aa6c4',
      fontSize: '18px',
      git0: '#f05033',
      git1: '#3ddc97',
      git2: '#4ea8ff',
      git3: '#c77dff',
      git4: '#ffd23f',
      gitBranchLabel0: '#ffffff',
      gitBranchLabel1: '#0b1020',
      gitBranchLabel2: '#0b1020',
      gitBranchLabel3: '#0b1020',
      gitBranchLabel4: '#0b1020',
      tagLabelColor: '#0b1020',
      tagLabelBackground: '#ffd23f',
      tagLabelBorder: '#ffd23f'
    },
    flowchart: { useMaxWidth: true, htmlLabels: false, curve: 'basis' },
    gitGraph: { useMaxWidth: true }
  });

  // Mermaid measures text while rendering, so only render diagrams once their slide is displayed.
  function renderMermaid(scope) {
    if (!scope) return;
    var nodes = Array.prototype.slice.call(scope.querySelectorAll('pre.mermaid:not([data-processed])'));
    if (!nodes.length) return;
    mermaid.run({ nodes: nodes }).catch(function (err) {
      console.error('Mermaid render failed', err);
    });
  }

  Reveal.initialize({
    hash: true,
    width: 1280,
    height: 720,
    margin: 0.06,
    minScale: 0.1,
    maxScale: 2.0,
    center: true,
    controls: false,
    progress: true,
    slideNumber: false,
    keyboard: true,
    touch: true,
    mouseWheel: false,
    overview: true,
    // Keep the fixed, scaled stage at every size (small LabVIEW panels); never switch to scroll view.
    scrollActivationWidth: null,
    transition: reduceMotion ? 'none' : 'slide',
    backgroundTransition: 'fade',
    plugins: window.RevealNotes ? [RevealNotes] : []
  });

  var navEl = document.querySelector('.deck-nav');
  var numEl = document.getElementById('slide-num');
  var totalEl = document.getElementById('slide-total');
  var actEl = document.getElementById('act-label');
  var prevBtn = navEl.querySelector('[data-action="prev"]');
  var nextBtn = navEl.querySelector('[data-action="next"]');
  var fsBtn = navEl.querySelector('[data-action="fullscreen"]');

  var fullscreenSupported = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
  if (!fullscreenSupported) fsBtn.style.display = 'none';

  function toggleFullscreen() {
    var el = document.documentElement;
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    } else {
      (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
    }
  }

  navEl.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    switch (btn.getAttribute('data-action')) {
      case 'prev': Reveal.prev(); break;
      case 'next': Reveal.next(); break;
      case 'overview': Reveal.toggleOverview(); break;
      case 'fullscreen': toggleFullscreen(); break;
    }
    // Hand focus back to the deck so Space / arrow keys keep working after a click.
    btn.blur();
    Reveal.getRevealElement().focus && Reveal.getRevealElement().focus();
  });

  function update(event) {
    var slide = (event && event.currentSlide) || Reveal.getCurrentSlide();
    numEl.textContent = Reveal.getSlidePastCount() + 1;
    totalEl.textContent = Reveal.getTotalSlides();
    prevBtn.disabled = Reveal.isFirstSlide() && !Reveal.availableFragments().prev;
    nextBtn.disabled = Reveal.isLastSlide() && !Reveal.availableFragments().next;
    actEl.textContent = (slide && slide.getAttribute('data-act')) || '';
    renderMermaid(slide);
  }

  Reveal.on('ready', update);
  Reveal.on('slidechanged', update);
  Reveal.on('fragmentshown', update);
  Reveal.on('fragmenthidden', update);
  Reveal.on('overviewshown', function () { renderMermaid(Reveal.getSlidesElement()); });

  // Briefly reveal the nav bar on mouse/touch activity, then fade it back.
  var idleTimer;
  function wake() {
    document.body.classList.add('nav-active');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () { document.body.classList.remove('nav-active'); }, 2500);
  }
  document.addEventListener('mousemove', wake, { passive: true });
  document.addEventListener('touchstart', wake, { passive: true });
})();

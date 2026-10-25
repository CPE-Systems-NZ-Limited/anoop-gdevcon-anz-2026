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
    keyboard: { 76: function () { toggleLearnMore(); } },
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

  var lmWrap = document.getElementById('learn-more');
  var lmBtn = document.getElementById('learn-more-btn');
  var lmPanel = document.getElementById('learn-more-panel');

  function closeLearnMore() {
    lmPanel.hidden = true;
    lmBtn.setAttribute('aria-expanded', 'false');
  }

  function toggleLearnMore() {
    if (lmWrap.hidden) return;
    var open = lmPanel.hidden;
    lmPanel.hidden = !open;
    lmBtn.setAttribute('aria-expanded', String(open));
    if (open) { var first = lmPanel.querySelector('a'); if (first) first.focus(); }
  }

  // Each slide lists its links in a hidden .learn-more-links block; copy them into the overlay menu.
  function updateLearnMore(slide) {
    closeLearnMore();
    lmPanel.textContent = '';
    var links = slide ? slide.querySelectorAll('.learn-more-links a') : [];
    Array.prototype.forEach.call(links, function (a) {
      var item = document.createElement('a');
      item.href = a.href;
      item.textContent = a.textContent;
      item.target = '_blank';
      item.rel = 'noopener';
      item.setAttribute('role', 'menuitem');
      lmPanel.appendChild(item);
    });
    lmWrap.hidden = links.length === 0;
  }

  lmBtn.addEventListener('click', function (e) { e.stopPropagation(); toggleLearnMore(); });
  lmPanel.addEventListener('click', function (e) {
    if (e.target.closest('a')) setTimeout(closeLearnMore, 0);
  });
  document.addEventListener('click', function (e) {
    if (!lmPanel.hidden && !lmWrap.contains(e.target)) closeLearnMore();
  });
  // While the menu is open, Esc closes it (instead of reveal's overview) and
  // arrow / Home / End keys move between its links (instead of changing slides).
  document.addEventListener('keydown', function (e) {
    if (lmPanel.hidden) return;
    if (e.key === 'Escape') {
      e.stopPropagation(); e.preventDefault(); closeLearnMore(); lmBtn.focus();
      return;
    }
    var keys = ['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (keys.indexOf(e.key) === -1 || !lmPanel.contains(document.activeElement)) return;
    e.stopPropagation(); e.preventDefault();
    var items = Array.prototype.slice.call(lmPanel.querySelectorAll('a'));
    var i = items.indexOf(document.activeElement);
    var last = items.length - 1;
    if (e.key === 'Home') i = 0;
    else if (e.key === 'End') i = last;
    else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') i = i >= last ? 0 : i + 1;
    else i = i <= 0 ? last : i - 1;
    if (items[i]) items[i].focus();
  }, true);

  function update(event) {
    var slide = (event && event.currentSlide) || Reveal.getCurrentSlide();
    numEl.textContent = Reveal.getSlidePastCount() + 1;
    totalEl.textContent = Reveal.getTotalSlides();
    prevBtn.disabled = Reveal.isFirstSlide() && !Reveal.availableFragments().prev;
    nextBtn.disabled = Reveal.isLastSlide() && !Reveal.availableFragments().next;
    actEl.textContent = (slide && slide.getAttribute('data-act')) || '';
    if (!event || event.type !== 'fragmentshown' && event.type !== 'fragmenthidden') updateLearnMore(slide);
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

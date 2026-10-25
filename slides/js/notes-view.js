// Speaker-notes view: index.html?view=notes (or notes.html) shows every slide's notes and Learn more links as one
// scrollable page, built from the same <section> markup as the deck. It highlights the slide the presenter is on,
// fed by any of: the URL hash (#/5), the deck in another window/tab (BroadcastChannel + localStorage), or LabVIEW
// calling showSlide(n) through the WebBrowser control's Execute JavaScript method.
(function () {
  'use strict';

  if (!/[?&]view=notes(&|$)/.test(window.location.search)) return;
  document.documentElement.classList.add('notes-view');

  var SYNC_KEY = 'gdevcon-deck-slide';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cards = [];
  var current = -1;
  var followBox, statusEl;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function headingText(section) {
    var h = section.querySelector('h1, h2');
    if (!h) return 'Slide';
    var copy = h.cloneNode(true);
    Array.prototype.forEach.call(copy.querySelectorAll('br'), function (br) { br.replaceWith(' '); });
    return copy.textContent.replace(/\s+/g, ' ').trim();
  }

  function slideHref(index) { return 'index.html#/' + (index ? index : ''); }

  function build() {
    var sections = document.querySelectorAll('.reveal .slides > section');
    var total = sections.length;
    var page = el('main', 'notes-page');

    var bar = el('header', 'notes-bar');
    var titles = el('div', 'notes-titles');
    titles.appendChild(el('h1', null, 'Speaker notes'));
    titles.appendChild(el('p', null, 'DevOps & Git for LabVIEW Development · Anoop Nandakumar · GDevCon ANZ'));
    bar.appendChild(titles);
    var tools = el('div', 'notes-tools');
    statusEl = el('span', 'notes-status');
    statusEl.setAttribute('aria-live', 'polite');
    tools.appendChild(statusEl);
    var followLabel = el('label', 'notes-follow');
    followBox = el('input');
    followBox.type = 'checkbox';
    followBox.checked = true;
    followLabel.appendChild(followBox);
    followLabel.appendChild(document.createTextNode(' Follow the slides'));
    tools.appendChild(followLabel);
    var open = el('a', 'notes-open', 'Open slides ↗');
    open.href = 'index.html';
    open.target = '_blank';
    open.rel = 'noopener';
    tools.appendChild(open);
    bar.appendChild(tools);
    page.appendChild(bar);

    Array.prototype.forEach.call(sections, function (section, i) {
      var card = el('article', 'notes-card');
      card.id = 'slide-' + (i + 1);

      var head = el('header', 'notes-card-head');
      head.appendChild(el('span', 'notes-num', (i + 1) + ' / ' + total));
      var act = section.getAttribute('data-act');
      if (act) head.appendChild(el('span', 'notes-act', act));
      card.appendChild(head);

      var h2 = el('h2');
      var link = el('a', null, headingText(section));
      link.href = slideHref(i);
      link.target = '_blank';
      link.rel = 'noopener';
      h2.appendChild(link);
      card.appendChild(h2);

      var body = el('div', 'notes-body');
      var notes = section.querySelector('aside.notes');
      if (notes && notes.textContent.trim()) {
        Array.prototype.forEach.call(notes.childNodes, function (n) { body.appendChild(n.cloneNode(true)); });
      } else {
        body.appendChild(el('p', 'notes-empty', 'No notes yet.'));
      }
      card.appendChild(body);

      var links = section.querySelectorAll('.learn-more-links a');
      if (links.length) {
        var list = el('ul', 'notes-links');
        Array.prototype.forEach.call(links, function (a) {
          var item = el('li');
          var copy = el('a', null, a.textContent);
          copy.href = a.href;
          copy.target = '_blank';
          copy.rel = 'noopener';
          item.appendChild(copy);
          list.appendChild(item);
        });
        card.appendChild(el('h3', null, 'Learn more'));
        card.appendChild(list);
      }

      cards.push(card);
      page.appendChild(card);
    });

    document.body.appendChild(page);
  }

  // Highlights slide `index` (0-based, same as reveal's #/index hash) and scrolls to it when following.
  function showSlide(index) {
    var i = parseInt(index, 10);
    if (isNaN(i) || i < 0 || i >= cards.length) return false;
    if (current >= 0) cards[current].classList.remove('current');
    current = i;
    cards[i].classList.add('current');
    statusEl.textContent = 'Slide ' + (i + 1) + ' / ' + cards.length;
    if (window.history.replaceState) window.history.replaceState(null, '', '#/' + (i ? i : ''));
    if (!followBox || followBox.checked) {
      cards[i].scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    return true;
  }
  window.showSlide = showSlide;

  function hashIndex() {
    var m = /^#\/(\d*)/.exec(window.location.hash);
    return m ? (parseInt(m[1], 10) || 0) : null;
  }

  function fromMessage(data) {
    if (data && typeof data.h === 'number') showSlide(data.h);
  }

  document.addEventListener('DOMContentLoaded', function () {
    build();

    window.addEventListener('hashchange', function () {
      var i = hashIndex();
      if (i !== null) showSlide(i);
    });

    try {
      var channel = new BroadcastChannel(SYNC_KEY);
      channel.onmessage = function (e) { fromMessage(e.data); };
    } catch (e) { /* not available (e.g. some file:// contexts); localStorage below still works */ }

    window.addEventListener('storage', function (e) {
      if (e.key !== SYNC_KEY || !e.newValue) return;
      try { fromMessage(JSON.parse(e.newValue)); } catch (err) { /* ignore malformed value */ }
    });

    var start = hashIndex();
    if (start === null) {
      try { var saved = JSON.parse(window.localStorage.getItem(SYNC_KEY)); if (saved) start = saved.h; } catch (e) { /* none */ }
    }
    if (start !== null) showSlide(start);
  });
})();

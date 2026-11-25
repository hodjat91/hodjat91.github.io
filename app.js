/* ==========================================================================
   Hodjat Asghari Esfeden, Ph.D. — Interactive Site Logic
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- Theme Toggle ---------- */
  const root = document.documentElement;
  const themeBtn = document.getElementById('theme-toggle');
  const sunIcon = document.getElementById('icon-sun');
  const moonIcon = document.getElementById('icon-moon');

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      if (sunIcon) sunIcon.style.display = 'block';
      if (moonIcon) moonIcon.style.display = 'none';
      if (themeBtn) themeBtn.setAttribute('aria-label', 'Switch to light theme');
    } else {
      root.removeAttribute('data-theme');
      if (sunIcon) sunIcon.style.display = 'none';
      if (moonIcon) moonIcon.style.display = 'block';
      if (themeBtn) themeBtn.setAttribute('aria-label', 'Switch to dark theme');
    }
  }

  const savedTheme = (function () {
    try { return localStorage.getItem('hodjat-theme'); } catch (_) { return null; }
  })();
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('hodjat-theme', next); } catch (_) {}
    });
  }

  /* ---------- Toast Helper ---------- */
  const toastEl = document.getElementById('toast');
  let toastTimer = null;

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('show');
    }, 2400);
  }

  /* ---------- Clipboard Helper ---------- */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(ta);
      }
    });
  }

  /* ---------- Audio Name Pronunciation ---------- */
  const pronounceBtn = document.getElementById('pronounce-btn');
  const nameAudio = document.getElementById('name-audio');

  if (pronounceBtn && nameAudio) {
    pronounceBtn.addEventListener('click', function () {
      if (!nameAudio.paused) {
        nameAudio.pause();
        nameAudio.currentTime = 0;
        pronounceBtn.classList.remove('playing');
        return;
      }
      nameAudio.currentTime = 0;
      pronounceBtn.classList.add('playing');
      nameAudio.play().catch(function () {
        pronounceBtn.classList.remove('playing');
        showToast('Audio playback was blocked by the browser.');
      });
    });

    nameAudio.addEventListener('ended', function () {
      pronounceBtn.classList.remove('playing');
    });
  }

  /* ---------- Mobile Menu Drawer ---------- */
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');

  if (mobileBtn && mobileDrawer) {
    mobileBtn.addEventListener('click', function () {
      const open = mobileDrawer.classList.toggle('open');
      mobileBtn.setAttribute('aria-expanded', String(open));
    });

    mobileDrawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileDrawer.classList.remove('open');
        mobileBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Publications Filtering & Search ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('pub-search-input');
  const pubCards = document.querySelectorAll('.pub-card');
  const emptyState = document.getElementById('pub-empty');
  const pubCountLabel = document.getElementById('pub-count-label');
  let activeTopic = 'all';

  function updatePublications() {
    const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
    let visible = 0;

    pubCards.forEach(function (card) {
      const topics = (card.getAttribute('data-topics') || '').split(',');
      const text = card.textContent.toLowerCase();
      const matchesTopic = activeTopic === 'all' || topics.indexOf(activeTopic) !== -1;
      const matchesQuery = !query || text.indexOf(query) !== -1;
      const show = matchesTopic && matchesQuery;
      card.style.display = show ? '' : 'none';
      if (show) visible += 1;
    });

    if (emptyState) {
      emptyState.style.display = visible === 0 ? 'block' : 'none';
    }
    if (pubCountLabel) {
      pubCountLabel.textContent = visible + ' of ' + pubCards.length + ' publications';
    }
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      activeTopic = btn.getAttribute('data-filter') || 'all';
      updatePublications();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', updatePublications);
  }

  /* ---------- Abstract & BibTeX Drawers + Copy BibTeX ---------- */
  document.querySelectorAll('[data-toggle-drawer]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const targetId = btn.getAttribute('data-toggle-drawer');
      const drawer = document.getElementById(targetId);
      if (!drawer) return;
      const card = btn.closest('.pub-card');
      const isOpen = drawer.classList.contains('open');

      // Close sibling drawers in the same card
      if (card) {
        card.querySelectorAll('.pub-drawer').forEach(function (d) {
          d.classList.remove('open');
        });
        card.querySelectorAll('[data-toggle-drawer]').forEach(function (b) {
          b.setAttribute('aria-expanded', 'false');
        });
      }

      if (!isOpen) {
        drawer.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.querySelectorAll('[data-copy-bib]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const bibId = btn.getAttribute('data-copy-bib');
      const pre = document.getElementById(bibId);
      if (!pre) return;
      copyText(pre.textContent.trim()).then(function () {
        const orig = btn.innerHTML;
        btn.classList.add('copied');
        btn.textContent = 'Copied BibTeX';
        showToast('BibTeX copied to clipboard');
        setTimeout(function () {
          btn.classList.remove('copied');
          btn.innerHTML = orig;
        }, 1800);
      });
    });
  });

  /* ---------- Copy Email Button ---------- */
  const copyEmailBtn = document.getElementById('copy-email-btn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', function () {
      const email = copyEmailBtn.getAttribute('data-email') || 'hodjat91@gmail.com';
      copyText(email).then(function () {
        showToast('Copied ' + email);
      });
    });
  }

  /* ---------- Expandable Milestones Archive ---------- */
  const milestonesToggle = document.getElementById('milestones-toggle');
  const milestonesList = document.getElementById('milestones-list');
  if (milestonesToggle && milestonesList) {
    const archivedCount = milestonesList.querySelectorAll('.milestone-row.archived').length;
    const collapsedLabel = 'Show full 2017\u20132022 archive (' + archivedCount + ' more)';
    milestonesToggle.textContent = collapsedLabel;
    milestonesToggle.addEventListener('click', function () {
      const expanded = milestonesList.classList.toggle('expanded');
      milestonesToggle.textContent = expanded
        ? 'Show recent highlights only'
        : collapsedLabel;
      milestonesToggle.setAttribute('aria-expanded', String(expanded));
    });
  }

  /* ---------- Active Nav Scrollspy ---------- */
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const sections = Array.from(navLinks)
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const id = '#' + entry.target.id;
            navLinks.forEach(function (a) {
              a.classList.toggle('active', a.getAttribute('href') === id);
            });
          }
        });
      },
      { rootMargin: '-28% 0px -60% 0px', threshold: 0 }
    );
    sections.forEach(function (sec) { observer.observe(sec); });
  }
})();

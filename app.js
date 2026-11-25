/* ==========================================================================
   Hodjat Asghari Esfeden, Ph.D. — Minimal Site Interactions
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- Subtle Light / Dark Theme Toggle (Defaults to Warm Paper Light) ---------- */
  const root = document.documentElement;
  const themeBtn = document.getElementById('theme-toggle');
  const themeLabel = document.getElementById('theme-label');

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      if (themeLabel) themeLabel.textContent = 'Light mode';
      if (themeBtn) themeBtn.setAttribute('aria-label', 'Switch to light mode');
    } else {
      root.removeAttribute('data-theme');
      if (themeLabel) themeLabel.textContent = 'Dark mode';
      if (themeBtn) themeBtn.setAttribute('aria-label', 'Switch to dark mode');
    }
  }

  let savedTheme = null;
  try { savedTheme = localStorage.getItem('hodjat-theme-v2'); } catch (_) {}
  applyTheme(savedTheme === 'dark' ? 'dark' : 'light');

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('hodjat-theme-v2', next); } catch (_) {}
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
    }, 2200);
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

  /* ---------- Name Pronunciation Audio ---------- */
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

  /* ---------- Publication Topic Filter ---------- */
  const tabs = document.querySelectorAll('.pub-tab');
  const pubRows = document.querySelectorAll('.pub-row');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      const filter = tab.getAttribute('data-filter') || 'all';
      pubRows.forEach(function (row) {
        const cats = (row.getAttribute('data-cat') || '').split(',');
        row.style.display = (filter === 'all' || cats.indexOf(filter) !== -1) ? '' : 'none';
      });
    });
  });

  /* ---------- Expandable Abstract / BibTeX Drawers ---------- */
  document.querySelectorAll('[data-toggle-drawer]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const targetId = btn.getAttribute('data-toggle-drawer');
      const drawer = document.getElementById(targetId);
      if (!drawer) return;
      const row = btn.closest('.pub-row');
      const wasOpen = drawer.classList.contains('open');

      if (row) {
        row.querySelectorAll('.pub-drawer').forEach(function (d) { d.classList.remove('open'); });
        row.querySelectorAll('[data-toggle-drawer]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
      }
      if (!wasOpen) {
        drawer.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Copy BibTeX ---------- */
  document.querySelectorAll('[data-copy-bib]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const bibEl = document.getElementById(btn.getAttribute('data-copy-bib'));
      if (!bibEl) return;
      copyText(bibEl.textContent.trim()).then(function () {
        const orig = btn.textContent;
        btn.classList.add('copied');
        btn.textContent = 'Copied';
        showToast('BibTeX copied to clipboard');
        setTimeout(function () {
          btn.classList.remove('copied');
          btn.textContent = orig;
        }, 1600);
      });
    });
  });

  /* ---------- Copy Email ---------- */
  const copyEmailBtn = document.getElementById('copy-email-btn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', function () {
      const email = copyEmailBtn.getAttribute('data-email') || 'hodjat91@gmail.com';
      copyText(email).then(function () {
        showToast('Copied ' + email);
      });
    });
  }

  /* ---------- Rail Scrollspy ---------- */
  const railLinks = document.querySelectorAll('.rail-nav a[href^="#"]');
  const sections = Array.from(railLinks)
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const id = '#' + entry.target.id;
            railLinks.forEach(function (a) {
              a.classList.toggle('active', a.getAttribute('href') === id);
            });
          }
        });
      },
      { rootMargin: '-20% 0px -68% 0px', threshold: 0 }
    );
    sections.forEach(function (s) { observer.observe(s); });
  }
})();

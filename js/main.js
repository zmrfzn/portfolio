/* ========================================
   Zameer Fouzan - Portfolio JS
   Theme toggle + Scroll animations
   ======================================== */

(function () {
  // --- Theme Toggle ---
  const toggle = document.getElementById('theme-toggle');
  const html = document.documentElement;
  const sunIcon = '&#9788;';
  const moonIcon = '&#9790;';

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    toggle.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
  }

  // Init theme from localStorage or system preference
  const saved = localStorage.getItem('theme');
  if (saved) {
    setTheme(saved);
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    setTheme('light');
  } else {
    setTheme('dark');
  }

  toggle.addEventListener('click', function () {
    const current = html.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  // --- Mobile Nav Toggle ---
  const mobileToggle = document.getElementById('nav-mobile-toggle');
  const navLinks = document.getElementById('nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
      mobileToggle.textContent = navLinks.classList.contains('open') ? '\u2715' : '\u2630';
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        mobileToggle.textContent = '\u2630';
      });
    });
  }

  // --- Scroll Fade-In ---
  var faders = document.querySelectorAll('.fade-in');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  faders.forEach(function (el) {
    observer.observe(el);
  });

  // --- Smooth Scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
})();
